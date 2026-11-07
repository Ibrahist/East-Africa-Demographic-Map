"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { MapView } from "../components/Map";
import { Tooltip } from "../components/Tooltip";
import { Legend } from "../components/Legend";
import { Breadcrumbs, BreadcrumbItem } from "../components/Breadcrumbs";
import { COUNTRIES, REGION_CONFIG, INDICATORS } from "../lib/config";
import { FeatureProperties, TooltipState } from "../lib/types";
import {
  computeBreaks,
  generateLegendBreaks,
  ClassificationMethod,
  formatValue
} from "../lib/colorScales";

export default function HomePage() {
  const [apiKey, setApiKey] = useState<string>(() => {
    return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  });

  const [selectedCountry, setSelectedCountry] = useState<string>("EAF");
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string>("total_population");
  const [classificationMethod, setClassificationMethod] = useState<ClassificationMethod>("quantile");
  const [selectedPalette, setSelectedPalette] = useState<string>("Viridis");
  const [scaleMode, setScaleMode] = useState<"shared" | "per-country">("shared");
  const [opacity, setOpacity] = useState<number>(0.75);
  const [baseMapStyle, setBaseMapStyle] = useState<"light" | "dark" | "satellite">("light");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Sync GitHub theme with DOM & localStorage on mount (independent from baseMapStyle)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("gh-theme") as "light" | "dark" | null;
    const preferred = saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(preferred);
    if (preferred === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Toggle app theme for navbar, sidebars, controls without changing Base Map Canvas color
  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("gh-theme", next);
      if (next === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  };

  // Change Base Map Canvas independently without affecting app UI theme
  const handleChangeBaseMap = (style: "light" | "dark" | "satellite") => {
    setBaseMapStyle(style);
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExportingPNG, setIsExportingPNG] = useState(false);

  // Breadcrumbs & Parent filtering for drill-down
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: "EAF", name: "All East Africa", level: 0 }
  ]);
  const [parentFilterId, setParentFilterId] = useState<string | null>(null);

  // Loaded GeoJSON data
  const [rawGeojson, setRawGeojson] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Global search index
  const [allFeaturesIndex, setAllFeaturesIndex] = useState<any[]>([]);

  // Tooltip & Hover state
  const [tooltipState, setTooltipState] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    properties: null,
    value: null,
  });
  const [hoveredFeatureId, setHoveredFeatureId] = useState<string | null>(null);

  const selectedIndicator = INDICATORS[selectedIndicatorId] || INDICATORS.total_population;

  // Build global search index on mount by loading level 1 and level 2 files
  useEffect(() => {
    const buildIndex = async () => {
      try {
        const res = await fetch("/data/processed/regional/all_east_africa_level1.geojson");
        if (res.ok) {
          const data = await res.json();
          const items = data.features.map((f: any) => ({
            id: f.properties.id,
            name: f.properties.name,
            country_iso3: f.properties.country_iso3,
            country_name: f.properties.country_name,
            level: f.properties.level,
            level_name: f.properties.level_name,
          }));
          setAllFeaturesIndex(items);
        }
      } catch (e) {
        console.error("Error loading search index:", e);
      }
    };
    buildIndex();
  }, []);

  // Fetch GeoJSON whenever country, level, or parent filter changes
  useEffect(() => {
    const fetchLayer = async () => {
      setLoading(true);
      let filePath = "";

      if (selectedCountry === "EAF") {
        filePath = "/data/processed/regional/all_east_africa_level1.geojson";
      } else {
        const country = COUNTRIES[selectedCountry];
        const lvl = country?.levels[selectedLevel];
        if (lvl) {
          // If drilling down into a specific parent unit at lower levels, lazy load that parent's partitioned file
          if (parentFilterId && selectedLevel > 1 && !lvl.is_point) {
            filePath = `/data/processed/${selectedCountry}/level${selectedLevel}_by_parent/${parentFilterId}.geojson`;
          } else {
            filePath = lvl.file;
          }
        }
      }

      if (!filePath) {
        setLoading(false);
        return;
      }

      try {
        let res = await fetch(filePath);
        // Fallback to consolidated file if partition doesn't exist
        if (!res.ok && parentFilterId && selectedLevel > 1) {
          const fallbackPath = COUNTRIES[selectedCountry]?.levels[selectedLevel]?.file;
          if (fallbackPath) {
            res = await fetch(fallbackPath);
          }
        }

        if (res.ok) {
          const data = await res.json();
          setRawGeojson(data);
        } else {
          console.error(`Failed to load ${filePath}: HTTP ${res.status}`);
        }
      } catch (err) {
        console.error("Error fetching geojson:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLayer();
  }, [selectedCountry, selectedLevel, parentFilterId]);

  // Filter GeoJSON features if drill-down parent filter is active
  const filteredGeojson = useMemo(() => {
    if (!rawGeojson || !rawGeojson.features) return null;
    if (!parentFilterId) return rawGeojson;

    const filtered = rawGeojson.features.filter((f: any) => {
      const pid = f.properties.parent_id;
      return pid === parentFilterId || f.properties.id === parentFilterId;
    });

    return {
      type: "FeatureCollection",
      features: filtered.length > 0 ? filtered : rawGeojson.features,
    };
  }, [rawGeojson, parentFilterId]);

  // Extract indicator values for legend classification & ranks
  const displayedValues = useMemo(() => {
    if (!filteredGeojson || !filteredGeojson.features) return [];
    return filteredGeojson.features
      .map((f: any) => f.properties[selectedIndicator.id])
      .filter((v: any) => v !== null && v !== undefined && !isNaN(v));
  }, [filteredGeojson, selectedIndicator]);

  // Compute breaks for legend
  const breaks = useMemo(() => {
    return computeBreaks(displayedValues, 5, classificationMethod);
  }, [displayedValues, classificationMethod]);

  const legendBreaks = useMemo(() => {
    return generateLegendBreaks(
      breaks,
      selectedPalette,
      selectedIndicator.format,
      selectedIndicator.unit
    );
  }, [breaks, selectedPalette, selectedIndicator]);

  // Drill down when a feature is clicked
  const handleFeatureClick = useCallback((properties: FeatureProperties) => {
    if (properties.is_point) return;

    if (selectedCountry === "EAF") {
      // Clicking a country polygon in regional view switches to that country Level 1
      const iso = properties.country_iso3;
      setSelectedCountry(iso);
      setSelectedLevel(1);
      setParentFilterId(null);
      setBreadcrumbs([
        { id: "EAF", name: "All East Africa", level: 0 },
        { id: iso, name: properties.country_name, level: 1, countryIso: iso },
      ]);
      return;
    }

    const currentCountry = COUNTRIES[selectedCountry];
    const nextLevel = selectedLevel + 1;

    if (currentCountry && currentCountry.levels[nextLevel]?.available) {
      setSelectedLevel(nextLevel);
      setParentFilterId(properties.id);
      if (nextLevel > 1 && selectedIndicator.category === "health_wellbeing") {
        setSelectedIndicatorId("total_population");
      }
      setBreadcrumbs((prev) => [
        ...prev,
        {
          id: properties.id,
          name: properties.name,
          level: nextLevel,
          countryIso: selectedCountry,
        },
      ]);
    }
  }, [selectedCountry, selectedLevel]);

  // Handle Breadcrumb navigation
  const handleBreadcrumbSelect = (item: BreadcrumbItem) => {
    if (item.level === 0) {
      setSelectedCountry("EAF");
      setSelectedLevel(1);
      setParentFilterId(null);
      setBreadcrumbs([{ id: "EAF", name: "All East Africa", level: 0 }]);
    } else if (item.level === 1) {
      setSelectedLevel(1);
      setParentFilterId(null);
      setBreadcrumbs((prev) => prev.slice(0, 2));
    } else {
      setSelectedLevel(item.level);
      setParentFilterId(item.id);
      setBreadcrumbs((prev) => {
        const idx = prev.findIndex((b) => b.id === item.id);
        return idx !== -1 ? prev.slice(0, idx + 1) : prev;
      });
    }
  };

  // Country selector change
  const handleSelectCountry = (iso: string) => {
    setSelectedCountry(iso);
    setSelectedLevel(1);
    setParentFilterId(null);
    if (iso === "EAF") {
      setBreadcrumbs([{ id: "EAF", name: "All East Africa", level: 0 }]);
      if (!INDICATORS[selectedIndicatorId]?.comparable_east_africa) {
        setSelectedIndicatorId("total_population");
      }
    } else {
      setBreadcrumbs([
        { id: "EAF", name: "All East Africa", level: 0 },
        { id: iso, name: COUNTRIES[iso]?.name || iso, level: 1, countryIso: iso },
      ]);
    }
  };

  // Search result selection
  const handleSelectSearchResult = (
    countryIso: string,
    level: number,
    featureId: string,
    name: string
  ) => {
    setSelectedCountry(countryIso);
    setSelectedLevel(level);
    setParentFilterId(level > 1 ? featureId : null);
    setHoveredFeatureId(featureId);
    setBreadcrumbs([
      { id: "EAF", name: "All East Africa", level: 0 },
      { id: countryIso, name: COUNTRIES[countryIso]?.name || countryIso, level: 1, countryIso },
      ...(level > 1 ? [{ id: featureId, name, level, countryIso }] : []),
    ]);
  };

  // CSV Export
  const handleExportCSV = () => {
    if (!filteredGeojson || !filteredGeojson.features) return;

    const headers = [
      "ID",
      "Name",
      "Country",
      "CountryISO3",
      "Level",
      "LevelName",
      "ParentID",
      "ParentName",
      "Area_Km2",
      "TotalPopulation",
      "PopulationDensity",
      "SexRatio",
      "SelectedIndicator",
      "IndicatorValue",
      "IndicatorUnit",
      "ReferenceYear",
      "Source",
    ];

    const rows = filteredGeojson.features.map((f: any) => {
      const p = f.properties;
      return [
        `"${p.id || ""}"`,
        `"${p.name || ""}"`,
        `"${p.country_name || ""}"`,
        `"${p.country_iso3 || ""}"`,
        p.level || "",
        `"${p.level_name || ""}"`,
        `"${p.parent_id || ""}"`,
        `"${p.parent_name || ""}"`,
        p.area_km2 || "",
        p.total_population || "",
        p.population_density || "",
        p.sex_ratio || "",
        `"${selectedIndicator.label}"`,
        p[selectedIndicator.id] !== undefined ? p[selectedIndicator.id] : "",
        `"${selectedIndicator.unit}"`,
        p.reference_year || "",
        `"${p.source || ""}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `east_africa_${selectedCountry}_L${selectedLevel}_${selectedIndicator.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // PNG Map Export
  const handleExportPNG = async () => {
    setIsExportingPNG(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const element = document.getElementById("map-viewport-container");
      if (!element) return;

      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `east_africa_${selectedCountry}_L${selectedLevel}_${selectedIndicator.id}.png`;
      link.click();
    } catch (e) {
      console.error("Error exporting map as PNG:", e);
    } finally {
      setIsExportingPNG(false);
    }
  };

  // Tooltip rank enrichment
  const handleHoverFeature = useCallback(
    (st: TooltipState) => {
      if (!st.visible || !st.properties || st.value === null || st.value === undefined) {
        setTooltipState(st);
        setHoveredFeatureId(null);
        return;
      }

      setHoveredFeatureId(st.properties.id);

      const val = st.value;
      const allVals = displayedValues.slice().sort((a: number, b: number) => b - a);
      const rankDisplayed = allVals.indexOf(val) + 1;

      setTooltipState({
        ...st,
        rankInCountry: rankDisplayed,
        totalInCountry: allVals.length,
        rankInDisplayed: rankDisplayed,
        totalDisplayed: allVals.length,
      });
    },
    [displayedValues]
  );

  const activeCountryName =
    selectedCountry === "EAF" ? "All East Africa" : COUNTRIES[selectedCountry]?.name || selectedCountry;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-[#f0f6fc]">
      {/* Top Application Bar (GitHub Header) */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        apiKey={apiKey}
        onUpdateApiKey={setApiKey}
        onSelectSearchResult={handleSelectSearchResult}
        allFeaturesIndex={allFeaturesIndex}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Workspace Layout */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Left Interactive Control Sidebar */}
        <Sidebar
          selectedCountry={selectedCountry}
          onSelectCountry={handleSelectCountry}
          selectedLevel={selectedLevel}
          onSelectLevel={(lvl) => {
            setSelectedLevel(lvl);
            setParentFilterId(null);
            if (lvl > 1 && INDICATORS[selectedIndicatorId]?.category === "health_wellbeing") {
              setSelectedIndicatorId("total_population");
            }
          }}
          selectedIndicatorId={selectedIndicatorId}
          onSelectIndicator={setSelectedIndicatorId}
          classificationMethod={classificationMethod}
          onChangeClassification={setClassificationMethod}
          selectedPalette={selectedPalette}
          onChangePalette={setSelectedPalette}
          scaleMode={scaleMode}
          onChangeScaleMode={setScaleMode}
          opacity={opacity}
          onChangeOpacity={setOpacity}
          baseMapStyle={baseMapStyle}
          onChangeBaseMap={handleChangeBaseMap}
          onExportCSV={handleExportCSV}
          onExportPNG={handleExportPNG}
          isExportingPNG={isExportingPNG}
          isOpen={isSidebarOpen}
          onToggleOpen={() => setIsSidebarOpen(false)}
        />

        {/* Map Viewport Area */}
        <main id="map-viewport-container" className="flex-1 relative h-full w-full">
          {/* Top Breadcrumb Overlay */}
          <div className="absolute top-3 left-3 z-10 max-w-[calc(100%-24px)]">
            <Breadcrumbs items={breadcrumbs} onSelect={handleBreadcrumbSelect} />
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 bg-slate-900/80 text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-2 shadow-lg backdrop-blur-md">
              <span className="w-2.5 h-2.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              <span>Loading spatial boundaries...</span>
            </div>
          )}

          {/* Google Maps Canvas */}
          <MapView
            apiKey={apiKey}
            geojson={filteredGeojson}
            selectedIndicator={selectedIndicator}
            breaks={breaks}
            paletteKey={selectedPalette}
            opacity={opacity}
            baseMapStyle={baseMapStyle}
            onFeatureClick={handleFeatureClick}
            onHoverFeature={handleHoverFeature}
            hoveredFeatureId={hoveredFeatureId}
            mapCenter={
              selectedCountry === "EAF"
                ? REGION_CONFIG.center
                : COUNTRIES[selectedCountry]?.center
            }
            mapZoom={
              selectedCountry === "EAF"
                ? REGION_CONFIG.zoom
                : COUNTRIES[selectedCountry]?.zoom
            }
          />

          {/* Floating Hover Tooltip */}
          <Tooltip state={tooltipState} indicator={selectedIndicator} />

          {/* Choropleth Legend Overlay (Bottom Right) */}
          <div className="absolute bottom-5 right-4 z-10">
            <Legend
              legendBreaks={legendBreaks}
              indicator={selectedIndicator}
              selectedCountryName={activeCountryName}
              sourceNote={
                selectedCountry === "EAF"
                  ? "KNBS, NBS, UBOS, NISR, ISTEEBU & DHS Program"
                  : COUNTRIES[selectedCountry]?.census.source_name
              }
              referenceYearNote={
                selectedCountry === "EAF"
                  ? REGION_CONFIG.reference_notes
                  : `Census: ${COUNTRIES[selectedCountry]?.census.reference_year}`
              }
            />
          </div>
        </main>
      </div>
    </div>
  );
}

