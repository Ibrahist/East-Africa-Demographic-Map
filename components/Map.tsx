/// <reference types="@types/google.maps" />
"use client";

import React, { useEffect, useRef, useState } from "react";
import { FeatureProperties, TooltipState, IndicatorConfig } from "../lib/types";
import { getColorForValue } from "../lib/colorScales";

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

  // Load Google Maps Script
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

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    script.onerror = () => setScriptError("Failed to load Google Maps script. Check your API key and connection.");
    document.head.appendChild(script);
  }, [apiKey]);

  // Initialize Map instance
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || mapRef.current) return;

    try {
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
    } catch (e: any) {
      console.error("Map initialization error:", e);
    }
  }, [mapLoaded, mapCenter, mapZoom, baseMapStyle]);

  // Update Base Map Style
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
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
  }, [baseMapStyle]);

  // Load GeoJSON into Data Layer and apply Choropleth Styling
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geojson) return;

    // Clear existing features
    map.data.forEach((feature: google.maps.Data.Feature) => {
      map.data.remove(feature);
    });

    try {
      map.data.addGeoJson(geojson);

      // Fit bounds to features
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
      console.error("Error adding GeoJSON to map:", e);
    }
  }, [geojson]);

  // Update Data Layer Styling dynamically
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

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
  }, [selectedIndicator, breaks, paletteKey, opacity, hoveredFeatureId, baseMapStyle]);

  // Attach hover and click listeners
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

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
      onHoverFeature({
        visible: false,
        x: 0,
        y: 0,
        properties: null,
        value: null,
      });
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
  }, [selectedIndicator, onFeatureClick, onHoverFeature]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" id="google-map-canvas" />

      {(!apiKey || scriptError) && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-20">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg p-6 text-center border border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Google Maps API Key Required</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              To render interactive vector choropleths via Google Maps JavaScript API, set your API key in <code className="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-amber-700 dark:text-amber-300 font-mono text-xs">.env.local</code> as:
            </p>
            <pre className="bg-slate-900 text-slate-200 p-3 rounded-lg text-xs font-mono text-left mb-4 overflow-x-auto">
              NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE
            </pre>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You can also enter your key in the header above for immediate in-browser session exploration.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
