"use client";

import React from "react";
import { TooltipState, IndicatorConfig } from "../lib/types";
import { formatValue } from "../lib/colorScales";
import { MapPin, Download, TrendingUp, HeartPulse, Sparkles } from "lucide-react";

interface TooltipProps {
  state: TooltipState;
  indicator: IndicatorConfig;
}

export const Tooltip: React.FC<TooltipProps> = ({ state, indicator }) => {
  if (!state.visible || !state.properties) return null;

  const { properties, value, rankInCountry, totalInCountry, rankInDisplayed, totalDisplayed } = state;
  const p = properties;

  // Position tooltip near cursor, adjusting for viewport edges with extra height accommodation
  const style: React.CSSProperties = {
    position: "fixed",
    left: `${Math.min(window.innerWidth - 340, state.x + 16)}px`,
    top: `${Math.min(window.innerHeight - 380, state.y + 16)}px`,
    pointerEvents: "none",
    zIndex: 50,
  };

  const hasHealthData =
    p.total_fertility_rate !== undefined ||
    p.under_5_mortality !== undefined ||
    p.stunting_rate !== undefined;

  const hasAmenities =
    p.literacy_rate !== undefined ||
    p.electricity_access !== undefined ||
    p.improved_water !== undefined;

  return (
    <div
      style={style}
      className="bg-[#161b22]/95 text-[#e6edf3] p-3.5 rounded-xl shadow-2xl backdrop-blur-md border border-[#30363d] text-xs w-80 animate-in fade-in duration-100 max-h-[90vh] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between pb-2 mb-2 border-b border-[#30363d]">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#58a6ff]">
              {p.level_name || `Level ${p.level}`}
            </span>
            <span className="text-[10px] text-[#8b949e]">•</span>
            <span className="text-[10px] text-[#8b949e] font-medium">
              {p.country_name}
            </span>
          </div>
          <h4 className="text-sm font-bold text-[#f0f6fc] leading-tight">{p.name}</h4>
          {p.parent_name && p.parent_name !== "Unknown" && (
            <div className="text-[10px] text-[#8b949e] mt-0.5">
              <span>Parent: </span>
              <span className="text-[#c9d1d9] font-medium">{p.parent_name}</span>
            </div>
          )}
        </div>
        <span className="text-[10px] bg-[#21262d] border border-[#30363d] px-1.5 py-0.5 rounded font-mono text-[#8b949e]">
          {p.id}
        </span>
      </div>

      {/* Main Selected Indicator Box */}
      <div className="bg-[#0d1117] p-2.5 rounded-lg mb-2 border border-[#30363d] flex items-center justify-between">
        <div>
          <div className="text-[9px] text-[#8b949e] uppercase tracking-wider font-semibold">
            {indicator.label}
          </div>
          <div className="text-[10px] text-[#58a6ff]">{indicator.unit}</div>
        </div>
        <div className="text-base font-extrabold text-[#d29922]">
          {formatValue(value, indicator.format, indicator.unit)}
        </div>
      </div>

      {/* Demographics & Spatial Metrics Grid */}
      <div className="grid grid-cols-2 gap-1.5 text-[11px] mb-2 bg-[#21262d]/60 p-2 rounded-lg border border-[#30363d]/60">
        <div>
          <span className="text-[10px] text-[#8b949e]">Population:</span>
          <div className="font-semibold text-[#f0f6fc]">
            {p.total_population ? p.total_population.toLocaleString() : "N/A"}
          </div>
        </div>
        <div>
          <span className="text-[10px] text-[#8b949e]">Density:</span>
          <div className="font-semibold text-[#f0f6fc]">
            {p.population_density ? `${p.population_density.toFixed(1)} /km²` : "N/A"}
          </div>
        </div>
        <div>
          <span className="text-[10px] text-[#8b949e]">Land Area:</span>
          <div className="font-semibold text-[#f0f6fc]">
            {p.area_km2 ? `${p.area_km2.toLocaleString()} km²` : "N/A"}
          </div>
        </div>
        <div>
          <span className="text-[10px] text-[#8b949e]">Sex Ratio:</span>
          <div className="font-semibold text-[#f0f6fc]">
            {p.sex_ratio ? `${p.sex_ratio.toFixed(1)} M/100F` : "N/A"}
          </div>
        </div>
      </div>

      {/* Age Structure & Growth */}
      <div className="grid grid-cols-3 gap-1 text-[10px] text-[#c9d1d9] mb-2 py-1 border-t border-b border-[#30363d]/60">
        <div>
          <span className="text-[#8b949e]">&lt;15 yrs: </span>
          <span className="font-medium text-[#f0f6fc]">
            {p.pct_under_15 ? `${p.pct_under_15.toFixed(1)}%` : "N/A"}
          </span>
        </div>
        <div>
          <span className="text-[#8b949e]">65+ yrs: </span>
          <span className="font-medium text-[#f0f6fc]">
            {p.pct_65_plus ? `${p.pct_65_plus.toFixed(1)}%` : "N/A"}
          </span>
        </div>
        <div>
          <span className="text-[#8b949e]">Hh size: </span>
          <span className="font-medium text-[#f0f6fc]">
            {p.avg_household_size ? p.avg_household_size.toFixed(1) : "N/A"}
          </span>
        </div>
      </div>

      {/* Health & Wellbeing indicators (if available) */}
      {hasHealthData && (
        <div className="text-[10px] space-y-0.5 mb-2 pb-1 border-b border-[#30363d]/60">
          <div className="text-[9px] font-bold text-[#3fb950] uppercase flex items-center gap-1">
            <HeartPulse className="w-3 h-3" />
            <span>Health & DHS Metrics</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[#c9d1d9]">
            {p.total_fertility_rate && (
              <div>Fertility: <span className="text-[#f0f6fc] font-semibold">{p.total_fertility_rate.toFixed(1)}</span></div>
            )}
            {p.under_5_mortality && (
              <div>U5MR: <span className="text-[#f0f6fc] font-semibold">{p.under_5_mortality.toFixed(1)}/1k</span></div>
            )}
            {p.stunting_rate && (
              <div>Stunting: <span className="text-[#f0f6fc] font-semibold">{p.stunting_rate.toFixed(1)}%</span></div>
            )}
            {p.facility_births_pct && (
              <div>Facility: <span className="text-[#f0f6fc] font-semibold">{p.facility_births_pct.toFixed(1)}%</span></div>
            )}
          </div>
        </div>
      )}

      {/* Amenities & Infrastructure (if available) */}
      {hasAmenities && (
        <div className="text-[10px] space-y-0.5 mb-2 pb-1 border-b border-[#30363d]/60">
          <div className="grid grid-cols-2 gap-1 text-[#c9d1d9]">
            {p.literacy_rate !== undefined && (
              <div>Literacy: <span className="text-[#f0f6fc] font-semibold">{p.literacy_rate.toFixed(1)}%</span></div>
            )}
            {p.electricity_access !== undefined && (
              <div>Electricity: <span className="text-[#f0f6fc] font-semibold">{p.electricity_access.toFixed(1)}%</span></div>
            )}
            {p.improved_water !== undefined && (
              <div>Water: <span className="text-[#f0f6fc] font-semibold">{p.improved_water.toFixed(1)}%</span></div>
            )}
            {p.improved_sanitation !== undefined && (
              <div>Sanitation: <span className="text-[#f0f6fc] font-semibold">{p.improved_sanitation.toFixed(1)}%</span></div>
            )}
          </div>
        </div>
      )}

      {/* Dual Rankings */}
      <div className="flex flex-col gap-0.5 text-[10px] text-[#8b949e] mb-2">
        {rankInCountry && totalInCountry && (
          <div className="flex justify-between">
            <span>Rank in {p.country_name}:</span>
            <span className="font-bold text-[#58a6ff]">#{rankInCountry} of {totalInCountry}</span>
          </div>
        )}
        {rankInDisplayed && totalDisplayed && totalDisplayed > totalInCountry! && (
          <div className="flex justify-between">
            <span>Rank in Viewport:</span>
            <span className="font-bold text-[#58a6ff]">#{rankInDisplayed} of {totalDisplayed}</span>
          </div>
        )}
      </div>

      {/* Action Prompt */}
      <div className="bg-[#0969da]/15 border border-[#0969da]/30 rounded-md px-2 py-1.5 flex items-center gap-1.5 text-[10px] text-[#58a6ff] font-medium">
        <Download className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Click place to export as PDF, CSV, GeoJSON, or Shapefile</span>
      </div>
    </div>
  );
};
