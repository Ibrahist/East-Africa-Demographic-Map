"use client";

import React from "react";
import {
  Globe,
  Layers,
  BarChart3,
  Palette,
  Sliders,
  MapPin,
  Download,
  AlertTriangle,
  Sun,
  Moon,
  Compass
} from "lucide-react";
import {
  CountryConfig,
  IndicatorConfig,
  IndicatorCategory
} from "../lib/types";
import { COUNTRIES, REGION_CONFIG, CATEGORIES, INDICATORS } from "../lib/config";
import { COLOR_PALETTES, ClassificationMethod } from "../lib/colorScales";

interface SidebarProps {
  selectedCountry: string; // "EAF" or "KEN", "TZA", etc.
  onSelectCountry: (countryIso: string) => void;
  selectedLevel: number; // 1, 2, 3, 4
  onSelectLevel: (level: number) => void;
  selectedIndicatorId: string;
  onSelectIndicator: (indicatorId: string) => void;
  classificationMethod: ClassificationMethod;
  onChangeClassification: (method: ClassificationMethod) => void;
  selectedPalette: string;
  onChangePalette: (paletteKey: string) => void;
  scaleMode: "shared" | "per-country";
  onChangeScaleMode: (mode: "shared" | "per-country") => void;
  opacity: number;
  onChangeOpacity: (opacity: number) => void;
  baseMapStyle: "light" | "dark" | "satellite";
  onChangeBaseMap: (style: "light" | "dark" | "satellite") => void;
  onExportCSV: () => void;
  onExportPNG: () => void;
  isExportingPNG: boolean;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedCountry,
  onSelectCountry,
  selectedLevel,
  onSelectLevel,
  selectedIndicatorId,
  onSelectIndicator,
  classificationMethod,
  onChangeClassification,
  selectedPalette,
  onChangePalette,
  scaleMode,
  onChangeScaleMode,
  opacity,
  onChangeOpacity,
  baseMapStyle,
  onChangeBaseMap,
  onExportCSV,
  onExportPNG,
  isExportingPNG,
  isOpen,
  onToggleOpen,
}) => {
  const currentCountryConfig = COUNTRIES[selectedCountry];
  const isAllEastAfrica = selectedCountry === "EAF";

  // Compute country-specific label for the level selector
  const getLevelLabel = (level: number) => {
    if (isAllEastAfrica) {
      if (level === 1) return "Level 1 = County (KEN), Region (TZA), District (UGA), Province (RWA/BDI)";
      return "Only Level 1 available in regional view";
    }
    const lvlConfig = currentCountryConfig?.levels[level];
    if (!lvlConfig || !lvlConfig.available) {
      return "Not available in this country";
    }
    return `Level ${level} = ${lvlConfig.name} (${lvlConfig.type === "point" ? "Points" : "Polygons"})`;
  };

  const isLevelAvailable = (level: number) => {
    if (isAllEastAfrica) return level === 1;
    return !!currentCountryConfig?.levels[level]?.available;
  };

  return (
    <aside
      className={`fixed lg:static top-0 left-0 h-full w-80 sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 shadow-2xl z-30 transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              East Africa GIS
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Demographic Choropleth Map</p>
          </div>
        </div>
        <button
          onClick={onToggleOpen}
          className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
        >
          ✕
        </button>
      </div>

      {/* Scrollable Control Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {/* 1. Country Selection */}
        <div>
          <label className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider text-[11px]">
            <Compass className="w-3.5 h-3.5 text-sky-500" />
            Country
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onSelectCountry("EAF")}
              className={`col-span-2 py-2 px-3 rounded-lg text-left font-medium flex items-center justify-between border transition-all ${
                isAllEastAfrica
                  ? "bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400 font-bold"
                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <span>🌍 All East Africa (Harmonized)</span>
              <span className="text-[10px] bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-300 px-1.5 py-0.5 rounded">
                5 Countries
              </span>
            </button>

            {Object.values(COUNTRIES).map((c) => {
              const active = selectedCountry === c.iso3;
              return (
                <button
                  key={c.iso3}
                  onClick={() => onSelectCountry(c.iso3)}
                  className={`py-1.5 px-2.5 rounded-lg text-left border transition-all ${
                    active
                      ? "bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400 font-bold shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-[9px] text-slate-400">{c.census.reference_year} Census</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Administrative Hierarchy Level */}
        <div>
          <label className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[11px]">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            Administrative Level
          </label>
          <div className="grid grid-cols-4 gap-1.5 mb-1.5">
            {[1, 2, 3, 4].map((lvl) => {
              const available = isLevelAvailable(lvl);
              const active = selectedLevel === lvl && available;
              return (
                <button
                  key={lvl}
                  onClick={() => available && onSelectLevel(lvl)}
                  disabled={!available}
                  className={`py-2 px-1 rounded-lg text-center font-bold border transition-all ${
                    active
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                      : available
                      ? "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      : "bg-slate-100 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50"
                  }`}
                >
                  <div>L{lvl}</div>
                  <div className="text-[9px] font-normal">Level {lvl}</div>
                </button>
              );
            })}
          </div>
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
            {getLevelLabel(selectedLevel)}
          </div>
        </div>

        {/* 3. Demographic Indicator Selector */}
        <div>
          <label className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[11px]">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
            Demographic Indicator
          </label>

          {isAllEastAfrica && (
            <div className="flex items-start gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-2 rounded-lg text-[10px] text-amber-800 dark:text-amber-300 mb-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-500 mt-0.5" />
              <span>
                <strong>Cross-Country Mode:</strong> Showing harmonized indicators. Reference years vary (KEN 2019, TZA 2022, UGA 2024, RWA 2022, BDI 2022).
              </span>
            </div>
          )}

          <div className="space-y-3">
            {CATEGORIES.map((cat) => {
              const catIndicators = Object.values(INDICATORS).filter((ind) => ind.category === cat.id);
              return (
                <div key={cat.id}>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    {cat.label}
                  </div>
                  <div className="space-y-1">
                    {catIndicators.map((ind) => {
                      const isSelected = selectedIndicatorId === ind.id;
                      const disabledInRegion = isAllEastAfrica && !ind.comparable_east_africa;
                      const disabledAtLevel = selectedLevel > 1 && ind.category === "health_wellbeing";
                      const isDisabled = disabledInRegion || disabledAtLevel;

                      return (
                        <button
                          key={ind.id}
                          onClick={() => !isDisabled && onSelectIndicator(ind.id)}
                          disabled={isDisabled}
                          className={`w-full text-left py-1.5 px-2.5 rounded-lg border flex items-center justify-between transition-all ${
                            isSelected
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold"
                              : isDisabled
                              ? "bg-slate-50/50 dark:bg-slate-900/30 border-transparent text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50"
                              : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          <span className="truncate">{ind.label}</span>
                          {isDisabled && (
                            <span className="text-[9px] text-slate-400 ml-1 flex-shrink-0">
                              {disabledAtLevel ? "L1 only" : "Country only"}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Color Scale & Map Controls */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <label className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
            <Palette className="w-3.5 h-3.5 text-purple-500" />
            Color & Classification
          </label>

          {/* Classification Method */}
          <div>
            <div className="text-[10px] text-slate-500 mb-1">Classification Method</div>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: "quantile", label: "Quantile" },
                { id: "natural", label: "Natural Breaks" },
                { id: "equal", label: "Equal Interval" }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => onChangeClassification(m.id as ClassificationMethod)}
                  className={`py-1 px-1.5 rounded text-[10px] font-medium border text-center transition-all ${
                    classificationMethod === m.id
                      ? "bg-purple-600 text-white border-purple-600 font-bold"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <div className="text-[10px] text-slate-500 mb-1">Color Palette (Color-Blind Safe)</div>
            <select
              value={selectedPalette}
              onChange={(e) => onChangePalette(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 font-medium"
            >
              {Object.entries(COLOR_PALETTES).map(([key, p]) => (
                <option key={key} value={key}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Scale Mode (When All East Africa) */}
          {isAllEastAfrica && (
            <div>
              <div className="text-[10px] text-slate-500 mb-1">Scale Mode</div>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => onChangeScaleMode("shared")}
                  className={`py-1 px-2 rounded text-[10px] font-medium border text-center ${
                    scaleMode === "shared"
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  Shared Regional Scale
                </button>
                <button
                  onClick={() => onChangeScaleMode("per-country")}
                  className={`py-1 px-2 rounded text-[10px] font-medium border text-center ${
                    scaleMode === "per-country"
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  Per-Country Scale
                </button>
              </div>
            </div>
          )}

          {/* Opacity Slider */}
          <div>
            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
              <span>Choropleth Opacity</span>
              <span>{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={opacity}
              onChange={(e) => onChangeOpacity(parseFloat(e.target.value))}
              className="w-full accent-purple-600"
            />
          </div>

          {/* Base Map Style */}
          <div>
            <div className="text-[10px] text-slate-500 mb-1">Base Map Canvas</div>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: "light", label: "Light", icon: Sun },
                { id: "dark", label: "Dark", icon: Moon },
                { id: "satellite", label: "Satellite", icon: Globe }
              ].map((b) => {
                const Icon = b.icon;
                return (
                  <button
                    key={b.id}
                    onClick={() => onChangeBaseMap(b.id as any)}
                    className={`py-1 px-1.5 rounded text-[10px] font-medium border flex items-center justify-center gap-1 ${
                      baseMapStyle === b.id
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent font-bold"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{b.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 5. Export Actions */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <label className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
            <Download className="w-3.5 h-3.5 text-blue-500" />
            Export & Download
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onExportCSV}
              className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-slate-800 dark:text-slate-200 text-center transition-colors border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5"
            >
              <span>Download CSV</span>
            </button>
            <button
              onClick={onExportPNG}
              disabled={isExportingPNG}
              className="py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-center transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span>{isExportingPNG ? "Generating..." : "Export Map PNG"}</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

