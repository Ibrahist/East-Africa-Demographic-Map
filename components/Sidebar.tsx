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
  Compass,
  FileSpreadsheet,
  Image as ImageIcon
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

  // Country-specific label for the level selector
  const getLevelLabel = (level: number) => {
    if (isAllEastAfrica) {
      if (level === 1) return "Level 1 = County (KEN), Region (TZA), District (UGA), Province (RWA/BDI)";
      return "Only Level 1 available in regional view";
    }
    const lvlConfig = currentCountryConfig?.levels[level];
    if (!lvlConfig || !lvlConfig.available) {
      return "Not available in this country";
    }
    return `Level ${level} = ${lvlConfig.name} (${lvlConfig.type === "point" ? "Settlement Points" : "Polygons"})`;
  };

  const isLevelAvailable = (level: number) => {
    if (isAllEastAfrica) return level === 1;
    return !!currentCountryConfig?.levels[level]?.available;
  };

  return (
    <aside
      className={`fixed lg:static top-0 left-0 h-full w-80 sm:w-96 bg-white dark:bg-[#161b22] border-r border-[#d0d7de] dark:border-[#30363d] shadow-xl z-30 transition-transform duration-200 ease-in-out flex flex-col ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-[#d0d7de] dark:border-[#30363d] flex items-center justify-between bg-[#f6f8fa] dark:bg-[#0d1117]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#0969da] dark:bg-[#1f6feb] flex items-center justify-center text-white shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-[#1f2328] dark:text-[#f0f6fc] leading-tight">
              Administrative Explorer
            </h1>
            <p className="text-[10px] text-[#656d76] dark:text-[#8b949e]">Demographics & Choropleth</p>
          </div>
        </div>
        <button
          onClick={onToggleOpen}
          className="lg:hidden text-[#656d76] dark:text-[#8b949e] hover:text-[#1f2328] dark:hover:text-white p-1 rounded-md"
        >
          ✕
        </button>
      </div>

      {/* Scrollable Controls */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs">
        {/* 1. Country Selection */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-semibold text-[#1f2328] dark:text-[#f0f6fc] text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#0969da] dark:text-[#2f81f7]" />
              Territory / Scope
            </label>
            <span className="text-[10px] text-[#656d76] dark:text-[#8b949e]">Phase 1</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onSelectCountry("EAF")}
              className={`col-span-2 py-1.5 px-2.5 rounded-md text-left font-medium flex items-center justify-between border transition-all text-xs ${
                isAllEastAfrica
                  ? "bg-[#ddf4ff] dark:bg-[#388bfd1a] border-[#0969da] dark:border-[#2f81f7] text-[#0969da] dark:text-[#2f81f7] font-bold"
                  : "bg-white dark:bg-[#21262d] border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#c9d1d9] hover:bg-[#f6f8fa] dark:hover:bg-[#30363d]"
              }`}
            >
              <span>🌍 All East Africa (Harmonized)</span>
              <span className="text-[9px] bg-[#0969da]/10 dark:bg-[#2f81f7]/20 text-[#0969da] dark:text-[#2f81f7] px-1.5 py-0.5 rounded font-mono">
                5 Countries
              </span>
            </button>

            {Object.values(COUNTRIES).map((c) => {
              const active = selectedCountry === c.iso3;
              return (
                <button
                  key={c.iso3}
                  onClick={() => onSelectCountry(c.iso3)}
                  className={`py-1.5 px-2 rounded-md text-left border transition-all text-xs ${
                    active
                      ? "bg-[#ddf4ff] dark:bg-[#388bfd1a] border-[#0969da] dark:border-[#2f81f7] text-[#0969da] dark:text-[#2f81f7] font-bold shadow-xs"
                      : "bg-white dark:bg-[#21262d] border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#c9d1d9] hover:bg-[#f6f8fa] dark:hover:bg-[#30363d]"
                  }`}
                >
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-[9px] text-[#656d76] dark:text-[#8b949e]">{c.census.reference_year} Census</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Administrative Hierarchy Level */}
        <div>
          <label className="font-semibold text-[#1f2328] dark:text-[#f0f6fc] text-[11px] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#8250df] dark:text-[#a371f7]" />
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
                  className={`py-1.5 px-1 rounded-md text-center font-bold border transition-all ${
                    active
                      ? "bg-[#0969da] dark:bg-[#1f6feb] text-white border-[#0969da] dark:border-[#1f6feb] shadow-xs"
                      : available
                      ? "bg-white dark:bg-[#21262d] border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#c9d1d9] hover:bg-[#f6f8fa] dark:hover:bg-[#30363d]"
                      : "bg-[#f6f8fa] dark:bg-[#161b22] border-[#d0d7de]/50 dark:border-[#30363d]/50 text-[#8c959f] dark:text-[#484f58] cursor-not-allowed opacity-60"
                  }`}
                >
                  <div className="text-xs">L{lvl}</div>
                  <div className="text-[9px] font-normal">Level {lvl}</div>
                </button>
              );
            })}
          </div>
          <div className="text-[11px] text-[#656d76] dark:text-[#8b949e] bg-[#f6f8fa] dark:bg-[#0d1117] p-2 rounded-md border border-[#d0d7de] dark:border-[#30363d] leading-relaxed">
            {getLevelLabel(selectedLevel)}
          </div>
        </div>

        {/* 3. Demographic Indicator Selector */}
        <div>
          <label className="font-semibold text-[#1f2328] dark:text-[#f0f6fc] text-[11px] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-[#1a7f37] dark:text-[#3fb950]" />
            Demographic Indicator
          </label>

          {isAllEastAfrica && (
            <div className="flex items-start gap-1.5 bg-[#fff8c5] dark:bg-[#bb800926] border border-[#d4a72c] dark:border-[#9e6a03] p-2 rounded-md text-[10px] text-[#9a6700] dark:text-[#d29922] mb-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Cross-Country Harmonization:</strong> Showing comparable metrics. Reference years: KEN (2019), TZA (2022), UGA (2024), RWA (2022), BDI (2022).
              </span>
            </div>
          )}

          <div className="space-y-2.5">
            {CATEGORIES.map((cat) => {
              const catIndicators = Object.values(INDICATORS).filter((ind) => ind.category === cat.id);
              return (
                <div key={cat.id}>
                  <div className="text-[10px] font-bold text-[#656d76] dark:text-[#8b949e] uppercase tracking-wider mb-1">
                    {cat.label}
                  </div>
                  <div className="space-y-1">
                    {catIndicators.map((ind) => {
                      const isSelected = selectedIndicatorId === ind.id;
                      const disabledInRegion = isAllEastAfrica && !ind.comparable_east_africa;
                      const isDisabled = disabledInRegion;

                      return (
                        <button
                          key={ind.id}
                          onClick={() => !isDisabled && onSelectIndicator(ind.id)}
                          disabled={isDisabled}
                          className={`w-full text-left py-1.5 px-2 rounded-md border flex items-center justify-between transition-all text-xs ${
                            isSelected
                              ? "bg-[#dafbe1] dark:bg-[#2ea04326] border-[#4ac26b] dark:border-[#238636] text-[#1a7f37] dark:text-[#3fb950] font-bold"
                              : isDisabled
                              ? "bg-transparent border-transparent text-[#8c959f] dark:text-[#484f58] cursor-not-allowed opacity-50"
                              : "bg-white dark:bg-[#21262d] border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#c9d1d9] hover:bg-[#f6f8fa] dark:hover:bg-[#30363d]"
                          }`}
                        >
                          <span className="truncate">{ind.label}</span>
                          {isDisabled && (
                            <span className="text-[9px] text-[#8c959f] dark:text-[#484f58] ml-1 flex-shrink-0">
                              Country only
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
        <div className="pt-2.5 border-t border-[#d0d7de] dark:border-[#30363d] space-y-2.5">
          <label className="font-semibold text-[#1f2328] dark:text-[#f0f6fc] text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-[#bf3989] dark:text-[#d2a8ff]" />
            Choropleth Styling
          </label>

          {/* Classification Method */}
          <div>
            <div className="text-[10px] text-[#656d76] dark:text-[#8b949e] mb-1">Classification Method</div>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: "quantile", label: "Quantile" },
                { id: "natural", label: "Natural Breaks" },
                { id: "equal", label: "Equal Interval" }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => onChangeClassification(m.id as ClassificationMethod)}
                  className={`py-1 px-1 rounded-md text-[10px] font-medium border text-center transition-all ${
                    classificationMethod === m.id
                      ? "bg-[#0969da] dark:bg-[#1f6feb] text-white border-[#0969da] dark:border-[#1f6feb] font-semibold"
                      : "bg-white dark:bg-[#21262d] border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#c9d1d9] hover:bg-[#f6f8fa]"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <div className="text-[10px] text-[#656d76] dark:text-[#8b949e] mb-1">Palette (Color-Blind Safe)</div>
            <select
              value={selectedPalette}
              onChange={(e) => onChangePalette(e.target.value)}
              className="gh-input w-full text-xs"
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
              <div className="text-[10px] text-[#656d76] dark:text-[#8b949e] mb-1">Scale Mode</div>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => onChangeScaleMode("shared")}
                  className={`py-1 px-1.5 rounded-md text-[10px] font-medium border text-center ${
                    scaleMode === "shared"
                      ? "bg-[#0969da] dark:bg-[#1f6feb] text-white border-[#0969da] dark:border-[#1f6feb] font-semibold"
                      : "bg-white dark:bg-[#21262d] border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#c9d1d9]"
                  }`}
                >
                  Shared Scale
                </button>
                <button
                  onClick={() => onChangeScaleMode("per-country")}
                  className={`py-1 px-1.5 rounded-md text-[10px] font-medium border text-center ${
                    scaleMode === "per-country"
                      ? "bg-[#0969da] dark:bg-[#1f6feb] text-white border-[#0969da] dark:border-[#1f6feb] font-semibold"
                      : "bg-white dark:bg-[#21262d] border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#c9d1d9]"
                  }`}
                >
                  Per-Country Scale
                </button>
              </div>
            </div>
          )}

          {/* Opacity Slider */}
          <div>
            <div className="flex justify-between text-[10px] text-[#656d76] dark:text-[#8b949e] mb-1">
              <span>Choropleth Opacity</span>
              <span className="font-mono">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={opacity}
              onChange={(e) => onChangeOpacity(parseFloat(e.target.value))}
              className="w-full accent-[#0969da] dark:accent-[#2f81f7]"
            />
          </div>

          {/* Base Map Style */}
          <div>
            <div className="text-[10px] text-[#656d76] dark:text-[#8b949e] mb-1">Base Map Canvas</div>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: "light", label: "Light Canvas", icon: Sun },
                { id: "dark", label: "Dark Canvas", icon: Moon },
                { id: "satellite", label: "Satellite", icon: Globe }
              ].map((b) => {
                const Icon = b.icon;
                return (
                  <button
                    key={b.id}
                    onClick={() => onChangeBaseMap(b.id as any)}
                    className={`py-1 px-1 rounded-md text-[10px] font-medium border flex items-center justify-center gap-1 transition-all ${
                      baseMapStyle === b.id
                        ? "bg-[#1f2328] text-white dark:bg-[#f0f6fc] dark:text-[#1f2328] border-transparent font-bold"
                        : "bg-white dark:bg-[#21262d] border-[#d0d7de] dark:border-[#30363d] text-[#656d76] dark:text-[#8b949e] hover:bg-[#f6f8fa]"
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
        <div className="pt-2.5 border-t border-[#d0d7de] dark:border-[#30363d] space-y-2">
          <label className="font-semibold text-[#1f2328] dark:text-[#f0f6fc] text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-[#0969da] dark:text-[#2f81f7]" />
            Export & Data Downloads
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onExportCSV}
              className="gh-btn py-1.5 px-2 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#1a7f37] dark:text-[#3fb950]" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onExportPNG}
              disabled={isExportingPNG}
              className="gh-btn gh-btn-primary py-1.5 px-2 text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{isExportingPNG ? "Rendering..." : "Export PNG"}</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
