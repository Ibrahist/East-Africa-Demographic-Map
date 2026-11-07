/// <reference types="@types/google.maps" />
"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { FeatureProperties, TooltipState, IndicatorConfig } from "../lib/types";
import { getColorForValue } from "../lib/colorScales";
import { computeGeoBounds, geoToSvgPath, pointToSvg } from "../lib/projection";
import { ZoomIn, ZoomOut, RotateCcw, Map as MapIcon, Key, Info } from "lucide-react";

interface MapProps {
  apiKey: string;
  geojson: any;
  selectedIndicator: IndicatorConfig;
  breaks: number[];
  paletteKey: string;
  opacity: number;
  baseMapStyle: "light" | "dark" | "satellite";
  onFeatureClick: (properties: FeatureProperties) => void;
  onHoverFeature: (state: TooltipState) => void;
  hoveredFeatureId: string | null;
  mapCenter?: { lat: number; lng: number };
  mapZoom?: number;
}

const LIGHT_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#475569" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#cbd5e1" }] },
  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#0f172a" }, { weight: 1.8 }] },
  { featureType: "administrative.province", elementType: "geometry.stroke", stylers: [{ color: "#94a3b8" }, { weight: 0.8 }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f8fafc" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] }
];

const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "all", elementType: "labels.text.stroke", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#38bdf8" }, { weight: 1.5 }] },
  { featureType: "administrative.province", elementType: "geometry.stroke", stylers: [{ color: "#334155" }, { weight: 0.8 }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] }
];

interface SvgPathItem {
  id: string;
  name: string;
  properties: FeatureProperties;
  val: number | null | undefined;
  color: string;
  isPoint: boolean;
  pathData: string;
  pointPos: [number, number] | null;
}

export const MapView: React.FC<MapProps> = ({
  apiKey,
  geojson,
  selectedIndicator,
  breaks,
  paletteKey,
  opacity,
  baseMapStyle,
  onFeatureClick,
  onHoverFeature,
  hoveredFeatureId,
  mapCenter = { lat: -0.5, lng: 34.5 },
  mapZoom = 5,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [forceVectorMode, setForceVectorMode] = useState(false);

  // SVG Vector mode state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const useGoogleMaps = Boolean(apiKey && !scriptError && !forceVectorMode);

  // Load Google Maps Script when apiKey is present
  useEffect(() => {
    if (!apiKey) return;

    if (typeof window !== "undefined" && (window as any).google?.maps) {
      setMapLoaded(true);
      return;
    }

    const scriptId = "google-maps-js-script";
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.addEventListener("load", () => setMapLoaded(true));
      return;
    }

    (window as any).gm_authFailure = () => {
      console.warn("Google Maps auth failure: falling back to vector map.");
      setScriptError("Google Maps key invalid or unauthorized. Switched to interactive vector map.");
      setForceVectorMode(true);
    };

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    script.onerror = () => {
      setScriptError("Google Maps script load failed. Falling back to vector map.");
    };
    document.head.appendChild(script);
  }, [apiKey]);

  // Initialize Google Maps instance
  useEffect(() => {
    if (!useGoogleMaps || !mapLoaded || !mapContainerRef.current) return;

    try {
      if (!mapRef.current) {
        const map = new google.maps.Map(mapContainerRef.current, {
          center: mapCenter,
          zoom: mapZoom,
          mapTypeId: baseMapStyle === "satellite" ? "hybrid" : "roadmap",
          styles: baseMapStyle === "dark" ? DARK_MAP_STYLE : baseMapStyle === "light" ? LIGHT_MAP_STYLE : undefined,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          mapTypeControl: false,
        });
        mapRef.current = map;
      }
    } catch (e: any) {
      console.error("Map initialization error:", e);
      setScriptError("Google Maps initialization failed.");
    }
  }, [useGoogleMaps, mapLoaded, mapCenter, mapZoom, baseMapStyle]);

  // Update Base Map Style
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !useGoogleMaps) return;
    if (baseMapStyle === "satellite") {
      map.setMapTypeId("hybrid");
      map.setOptions({ styles: undefined });
    } else if (baseMapStyle === "dark") {
      map.setMapTypeId("roadmap");
      map.setOptions({ styles: DARK_MAP_STYLE });
    } else {
      map.setMapTypeId("roadmap");
      map.setOptions({ styles: LIGHT_MAP_STYLE });
    }
  }, [baseMapStyle, useGoogleMaps]);

  // Load GeoJSON into Data Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geojson || !useGoogleMaps) return;

    map.data.forEach((feature: google.maps.Data.Feature) => {
      map.data.remove(feature);
    });

    try {
      map.data.addGeoJson(geojson);

      const bounds = new google.maps.LatLngBounds();
      map.data.forEach((feature: google.maps.Data.Feature) => {
        feature.getGeometry()?.forEachLatLng((latLng: google.maps.LatLng) => {
          bounds.extend(latLng);
        });
      });
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
      }
    } catch (e) {
      console.error("Error adding GeoJSON to Google Maps:", e);
    }
  }, [geojson, useGoogleMaps]);

  // Style Google Maps Data Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !useGoogleMaps) return;

    map.data.setStyle((feature: google.maps.Data.Feature): google.maps.Data.StyleOptions => {
      const val = feature.getProperty(selectedIndicator.id) as number | null | undefined;
      const isPoint = feature.getProperty("is_point") === true;
      const isHovered = feature.getProperty("id") === hoveredFeatureId;
      const name = String(feature.getProperty("name") || "");

      const fillColor = getColorForValue(val, breaks, paletteKey);

      if (isPoint) {
        return {
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: isHovered ? "#f59e0b" : "#2563eb",
            fillOpacity: 0.85,
            scale: isHovered ? 7 : 4.5,
            strokeColor: "#ffffff",
            strokeWeight: 1.5,
          },
          title: name,
        };
      }

      return {
        fillColor,
        fillOpacity: opacity,
        strokeColor: isHovered ? "#0284c7" : baseMapStyle === "dark" ? "#475569" : "#64748b",
        strokeWeight: isHovered ? 2.5 : 0.8,
        zIndex: isHovered ? 100 : 1,
      };
    });
  }, [selectedIndicator, breaks, paletteKey, opacity, hoveredFeatureId, baseMapStyle, useGoogleMaps]);

  // Google Maps Listeners
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !useGoogleMaps) return;

    const mouseOverListener = map.data.addListener("mouseover", (event: google.maps.Data.MouseEvent) => {
      const getP = (k: string) => event.feature.getProperty(k);
      const props: FeatureProperties = {
        id: String(getP("id") || ""),
        name: String(getP("name") || ""),
        country_iso3: String(getP("country_iso3") || ""),
        country_name: String(getP("country_name") || ""),
        level: Number(getP("level") || 1),
        level_name: String(getP("level_name") || ""),
        parent_id: getP("parent_id") ? String(getP("parent_id")) : null,
        parent_name: getP("parent_name") ? String(getP("parent_name")) : undefined,
        reference_year: getP("reference_year") ? Number(getP("reference_year")) : undefined,
        source: getP("source") ? String(getP("source")) : undefined,
        area_km2: getP("area_km2") !== undefined ? Number(getP("area_km2")) : undefined,
        total_population: getP("total_population") !== undefined ? Number(getP("total_population")) : undefined,
        population_density: getP("population_density") !== undefined ? Number(getP("population_density")) : undefined,
        sex_ratio: getP("sex_ratio") !== undefined ? Number(getP("sex_ratio")) : undefined,
        pct_under_15: getP("pct_under_15") !== undefined ? Number(getP("pct_under_15")) : undefined,
        pct_65_plus: getP("pct_65_plus") !== undefined ? Number(getP("pct_65_plus")) : undefined,
        avg_household_size: getP("avg_household_size") !== undefined ? Number(getP("avg_household_size")) : undefined,
        intercensal_growth_rate: getP("intercensal_growth_rate") !== undefined ? Number(getP("intercensal_growth_rate")) : undefined,
        total_fertility_rate: getP("total_fertility_rate") !== undefined ? Number(getP("total_fertility_rate")) : undefined,
        under_5_mortality: getP("under_5_mortality") !== undefined ? Number(getP("under_5_mortality")) : undefined,
        stunting_rate: getP("stunting_rate") !== undefined ? Number(getP("stunting_rate")) : undefined,
        facility_births_pct: getP("facility_births_pct") !== undefined ? Number(getP("facility_births_pct")) : undefined,
        literacy_rate: getP("literacy_rate") !== undefined ? Number(getP("literacy_rate")) : undefined,
        electricity_access: getP("electricity_access") !== undefined ? Number(getP("electricity_access")) : undefined,
        improved_water: getP("improved_water") !== undefined ? Number(getP("improved_water")) : undefined,
        improved_sanitation: getP("improved_sanitation") !== undefined ? Number(getP("improved_sanitation")) : undefined,
        is_point: Boolean(getP("is_point")),
      };
      const val = getP(selectedIndicator.id) as number | null | undefined;
      const mouseEvt = event.domEvent as MouseEvent;

      onHoverFeature({
        visible: true,
        x: mouseEvt?.clientX || 0,
        y: mouseEvt?.clientY || 0,
        properties: props,
        value: val,
      });
    });

    const mouseOutListener = map.data.addListener("mouseout", () => {
      onHoverFeature({ visible: false, x: 0, y: 0, properties: null, value: null });
    });

    const clickListener = map.data.addListener("click", (event: google.maps.Data.MouseEvent) => {
      const getP = (k: string) => event.feature.getProperty(k);
      const props: FeatureProperties = {
        id: String(getP("id") || ""),
        name: String(getP("name") || ""),
        country_iso3: String(getP("country_iso3") || ""),
        country_name: String(getP("country_name") || ""),
        level: Number(getP("level") || 1),
        level_name: String(getP("level_name") || ""),
        parent_id: getP("parent_id") ? String(getP("parent_id")) : null,
        parent_name: getP("parent_name") ? String(getP("parent_name")) : undefined,
        is_point: Boolean(getP("is_point")),
      };
      onFeatureClick(props);
    });

    return () => {
      google.maps.event.removeListener(mouseOverListener);
      google.maps.event.removeListener(mouseOutListener);
      google.maps.event.removeListener(clickListener);
    };
  }, [useGoogleMaps, selectedIndicator, onFeatureClick, onHoverFeature]);

  // Compute SVG vector data bounds & paths for Vector Mode
  const geoBounds = useMemo(() => computeGeoBounds(geojson), [geojson]);

  const svgPaths = useMemo<SvgPathItem[]>(() => {
    if (!geojson || !geojson.features) return [];
    return geojson.features.map((f: any): SvgPathItem => {
      const isPoint = f.geometry?.type === "Point";
      let pathData = "";
      let pointPos: [number, number] | null = null;

      if (isPoint) {
        pointPos = pointToSvg(f.geometry.coordinates, geoBounds, 1000, 800);
      } else {
        pathData = geoToSvgPath(f.geometry, geoBounds, 1000, 800);
      }

      const val = f.properties[selectedIndicator.id];
      const color = getColorForValue(val, breaks, paletteKey);

      return {
        id: f.properties.id,
        name: f.properties.name,
        properties: f.properties,
        val,
        color,
        isPoint,
        pathData,
        pointPos,
      };
    });
  }, [geojson, geoBounds, selectedIndicator, breaks, paletteKey]);

  // Reset zoom on geojson change in vector mode
  useEffect(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, [geojson]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setZoomLevel((prev) => Math.min(8, Math.max(0.6, prev * zoomFactor)));
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      {/* Google Maps Canvas (Shown when apiKey is active) */}
      <div
        ref={mapContainerRef}
        className={`w-full h-full ${useGoogleMaps ? "block" : "hidden"}`}
        id="google-map-canvas"
      />

      {/* Interactive Vector Choropleth Map (Shown when no Google Maps key or vector mode toggled) */}
      {!useGoogleMaps && (
        <div
          className={`w-full h-full relative cursor-grab active:cursor-grabbing ${
            baseMapStyle === "dark" ? "bg-slate-950" : "bg-slate-100"
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Subtle Grid Pattern for cartographic aesthetic */}
          <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* SVG Map Container */}
          <svg
            viewBox="0 0 1000 800"
            className="w-full h-full transition-transform duration-75"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
              transformOrigin: "center center",
            }}
          >
            {/* Polygons */}
            {svgPaths.map((item: SvgPathItem) => {
              if (item.isPoint) return null;
              const isHovered = item.id === hoveredFeatureId;
              return (
                <path
                  key={item.id}
                  d={item.pathData}
                  fill={item.color}
                  fillOpacity={opacity}
                  stroke={isHovered ? "#0284c7" : baseMapStyle === "dark" ? "#334155" : "#64748b"}
                  strokeWidth={isHovered ? 2.5 / zoomLevel : 0.8 / zoomLevel}
                  className="transition-colors duration-150 cursor-pointer"
                  onMouseEnter={(e) => {
                    onHoverFeature({
                      visible: true,
                      x: e.clientX,
                      y: e.clientY,
                      properties: item.properties,
                      value: item.val,
                    });
                  }}
                  onMouseMove={(e) => {
                    onHoverFeature({
                      visible: true,
                      x: e.clientX,
                      y: e.clientY,
                      properties: item.properties,
                      value: item.val,
                    });
                  }}
                  onMouseLeave={() => {
                    onHoverFeature({ visible: false, x: 0, y: 0, properties: null, value: null });
                  }}
                  onClick={() => onFeatureClick(item.properties)}
                />
              );
            })}

            {/* Point Markers (Level 4 Settlements) */}
            {svgPaths.map((item: SvgPathItem) => {
              if (!item.isPoint || !item.pointPos) return null;
              const [cx, cy] = item.pointPos;
              const isHovered = item.id === hoveredFeatureId;
              return (
                <circle
                  key={item.id}
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 / zoomLevel : 3.5 / zoomLevel}
                  fill={isHovered ? "#f59e0b" : "#2563eb"}
                  fillOpacity={0.9}
                  stroke="#ffffff"
                  strokeWidth={1 / zoomLevel}
                  className="cursor-pointer"
                  onMouseEnter={(e) => {
                    onHoverFeature({
                      visible: true,
                      x: e.clientX,
                      y: e.clientY,
                      properties: item.properties,
                      value: item.val,
                    });
                  }}
                  onClick={() => onFeatureClick(item.properties)}
                />
              );
            })}
          </svg>

          {/* On-screen Zoom & Pan Controls for Vector Mode */}
          <div className="absolute top-16 right-4 flex flex-col gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 z-10">
            <button
              onClick={() => setZoomLevel((z) => Math.min(8, z * 1.25))}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z * 0.8))}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setZoomLevel(1);
                setPanOffset({ x: 0, y: 0 });
              }}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Status Notification Banner */}
      <div className="absolute top-3 right-16 z-10 hidden sm:flex items-center gap-2">
        {scriptError ? (
          <div className="flex items-center gap-1.5 bg-red-500/10 dark:bg-red-950/40 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-red-300 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
            <Info className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
            <span>{scriptError}</span>
          </div>
        ) : apiKey ? (
          <div className="flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {useGoogleMaps ? "Google Maps Engine" : "Vector Mode"}
            </span>
            <button
              onClick={() => setForceVectorMode((v) => !v)}
              className="ml-1 text-[10px] text-sky-600 dark:text-sky-400 font-bold hover:underline"
            >
              Switch to {useGoogleMaps ? "Vector" : "Google Maps"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-amber-500/10 dark:bg-amber-950/40 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
            <Info className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span>Interactive Vector Mode (No API key required)</span>
          </div>
        )}
      </div>
    </div>
  );
};
