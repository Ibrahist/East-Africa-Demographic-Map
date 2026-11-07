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
  const isPoint = properties.is_point;

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
      className="bg-slate-900/95 text-white p-4 rounded-xl shadow-2xl backdrop-blur-md border border-slate-700/80 text-xs w-72 animate-in fade-in duration-150"
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/60">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-sky-400">
            {properties.level_name} • {properties.country_name}
          </span>
          <h4 className="text-sm font-bold text-slate-100">{properties.name}</h4>
        </div>
        {properties.country_iso3 && (
          <span className="text-xs bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-300">
            {properties.country_iso3}
          </span>
        )}
      </div>

      {properties.parent_name && properties.parent_name !== "Unknown" && (
        <div className="text-[11px] text-slate-400 mb-2">
          <span className="text-slate-500">Parent: </span>
          <span className="text-slate-300 font-medium">{properties.parent_name}</span>
        </div>
      )}

      {/* Main Indicator Metric */}
      <div className="bg-slate-800/80 p-2.5 rounded-lg mb-2.5 border border-slate-700/50">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">{indicator.label}</div>
        <div className="text-lg font-extrabold text-amber-400">
          {formatValue(value, indicator.format, indicator.unit)}
        </div>
      </div>

      {/* Quick Demographic Summary Table */}
      <div className="grid grid-cols-2 gap-2 text-[11px] mb-2 text-slate-300">
        {properties.total_population !== undefined && (
          <div>
            <div className="text-[10px] text-slate-400">Population:</div>
            <div className="font-semibold text-slate-100">{properties.total_population?.toLocaleString()}</div>
          </div>
        )}
        {properties.population_density !== undefined && (
          <div>
            <div className="text-[10px] text-slate-400">Density:</div>
            <div className="font-semibold text-slate-100">{properties.population_density?.toFixed(1)} /km²</div>
          </div>
        )}
        {properties.area_km2 !== undefined && (
          <div>
            <div className="text-[10px] text-slate-400">Area:</div>
            <div className="font-semibold text-slate-100">{properties.area_km2?.toLocaleString()} km²</div>
          </div>
        )}
        {properties.sex_ratio !== undefined && (
          <div>
            <div className="text-[10px] text-slate-400">Sex Ratio:</div>
            <div className="font-semibold text-slate-100">{properties.sex_ratio?.toFixed(1)} M/100F</div>
          </div>
        )}
      </div>

      {/* Ranks & Source Attribution */}
      <div className="pt-2 border-t border-slate-700/60 flex flex-col gap-1 text-[10px] text-slate-400">
        {rankInCountry && totalInCountry && (
          <div className="flex justify-between">
            <span>Rank in {properties.country_name}:</span>
            <span className="font-bold text-sky-300">#{rankInCountry} of {totalInCountry}</span>
          </div>
        )}
        {rankInDisplayed && totalDisplayed && totalDisplayed > totalInCountry! && (
          <div className="flex justify-between">
            <span>Rank in Displayed Set:</span>
            <span className="font-bold text-sky-300">#{rankInDisplayed} of {totalDisplayed}</span>
          </div>
        )}
        <div className="flex justify-between items-center text-[9px] text-slate-500 pt-1">
          <span>Ref Year: {properties.reference_year || 2022}</span>
          <span>Click to drill down</span>
        </div>
      </div>
    </div>
  );
};

