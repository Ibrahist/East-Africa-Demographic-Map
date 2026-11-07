"use client";

import React from "react";
import { TooltipState, IndicatorConfig } from "../lib/types";
import { formatValue } from "../lib/colorScales";

interface TooltipProps {
  state: TooltipState;
  indicator: IndicatorConfig;
}

export const Tooltip: React.FC<TooltipProps> = ({ state, indicator }) => {
  if (!state.visible || !state.properties) return null;

  const { properties, value, rankInCountry, totalInCountry, rankInDisplayed, totalDisplayed } = state;

  // Position tooltip near cursor, adjusting for viewport edges
  const style: React.CSSProperties = {
    position: "fixed",
    left: `${Math.min(window.innerWidth - 320, state.x + 16)}px`,
    top: `${Math.min(window.innerHeight - 260, state.y + 16)}px`,
    pointerEvents: "none",
    zIndex: 50,
  };

  return (
    <div
      style={style}
      className="bg-[#161b22]/95 text-[#e6edf3] p-3.5 rounded-md shadow-2xl backdrop-blur-md border border-[#30363d] text-xs w-72"
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#30363d]">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#58a6ff]">
            {properties.level_name} • {properties.country_name}
          </span>
          <h4 className="text-sm font-bold text-[#f0f6fc]">{properties.name}</h4>
        </div>
        {properties.country_iso3 && (
          <span className="text-xs bg-[#21262d] border border-[#30363d] px-1.5 py-0.5 rounded font-mono text-[#8b949e]">
            {properties.country_iso3}
          </span>
        )}
      </div>

      {properties.parent_name && properties.parent_name !== "Unknown" && (
        <div className="text-[11px] text-[#8b949e] mb-2">
          <span>Parent: </span>
          <span className="text-[#c9d1d9] font-medium">{properties.parent_name}</span>
        </div>
      )}

      {/* Main Indicator Metric */}
      <div className="bg-[#0d1117] p-2.5 rounded-md mb-2 border border-[#30363d]">
        <div className="text-[10px] text-[#8b949e] uppercase tracking-wider mb-0.5">{indicator.label}</div>
        <div className="text-lg font-extrabold text-[#d29922]">
          {formatValue(value, indicator.format, indicator.unit)}
        </div>
      </div>

      {/* Quick Demographic Summary Table */}
      <div className="grid grid-cols-2 gap-2 text-[11px] mb-2 text-[#c9d1d9]">
        {properties.total_population !== undefined && (
          <div>
            <div className="text-[10px] text-[#8b949e]">Population:</div>
            <div className="font-semibold text-[#f0f6fc]">{properties.total_population?.toLocaleString()}</div>
          </div>
        )}
        {properties.population_density !== undefined && (
          <div>
            <div className="text-[10px] text-[#8b949e]">Density:</div>
            <div className="font-semibold text-[#f0f6fc]">{properties.population_density?.toFixed(1)} /km²</div>
          </div>
        )}
        {properties.area_km2 !== undefined && (
          <div>
            <div className="text-[10px] text-[#8b949e]">Area:</div>
            <div className="font-semibold text-[#f0f6fc]">{properties.area_km2?.toLocaleString()} km²</div>
          </div>
        )}
        {properties.sex_ratio !== undefined && (
          <div>
            <div className="text-[10px] text-[#8b949e]">Sex Ratio:</div>
            <div className="font-semibold text-[#f0f6fc]">{properties.sex_ratio?.toFixed(1)} M/100F</div>
          </div>
        )}
      </div>

      {/* Ranks & Source Attribution */}
      <div className="pt-2 border-t border-[#30363d] flex flex-col gap-1 text-[10px] text-[#8b949e]">
        {rankInCountry && totalInCountry && (
          <div className="flex justify-between">
            <span>Rank in {properties.country_name}:</span>
            <span className="font-bold text-[#58a6ff]">#{rankInCountry} of {totalInCountry}</span>
          </div>
        )}
        {rankInDisplayed && totalDisplayed && totalDisplayed > totalInCountry! && (
          <div className="flex justify-between">
            <span>Rank in Displayed Set:</span>
            <span className="font-bold text-[#58a6ff]">#{rankInDisplayed} of {totalDisplayed}</span>
          </div>
        )}
        {properties.source && (
          <div className="truncate text-[9px] text-[#8b949e] mt-0.5">
            Source: {properties.source}
          </div>
        )}
      </div>
    </div>
  );
};
