"use client";

import React from "react";
import { LegendBreak, IndicatorConfig } from "../lib/types";

interface LegendProps {
  legendBreaks: LegendBreak[];
  indicator: IndicatorConfig;
  selectedCountryName: string;
  sourceNote?: string;
  referenceYearNote?: string;
  className?: string;
}

export const Legend: React.FC<LegendProps> = ({
  legendBreaks,
  indicator,
  selectedCountryName,
  sourceNote,
  referenceYearNote,
  className = "",
}) => {
  return (
    <div
      className={`bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 max-w-xs ${className}`}
    >
      <div className="font-bold text-xs mb-1 text-slate-900 dark:text-white flex items-center justify-between">
        <span>{indicator.label}</span>
      </div>
      <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-2.5">
        {indicator.unit} • {selectedCountryName}
      </div>

      {/* Class breaks color bars */}
      <div className="flex flex-col gap-1.5 mb-3">
        {legendBreaks.map((b, idx) => (
          <div key={idx} className="flex items-center gap-2 text-[11px]">
            <span
              className="w-4 h-4 rounded-sm shadow-sm flex-shrink-0 border border-black/10 dark:border-white/10"
              style={{ backgroundColor: b.color }}
            />
            <span className="text-slate-700 dark:text-slate-300 font-mono text-[10px] truncate">
              {b.label}
            </span>
          </div>
        ))}

        {/* Missing Data indicator */}
        <div className="flex items-center gap-2 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <span className="w-4 h-4 rounded-sm bg-slate-400 flex-shrink-0 border border-dashed border-slate-600" />
          <span className="text-slate-500 dark:text-slate-400 text-[10px]">No Data / Unavailable</span>
        </div>
      </div>

      {/* Footer Notes */}
      <div className="text-[9px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2 leading-tight flex flex-col gap-1">
        {referenceYearNote && (
          <div>
            <span className="font-semibold text-slate-600 dark:text-slate-300">Reference: </span>
            {referenceYearNote}
          </div>
        )}
        {sourceNote && (
          <div>
            <span className="font-semibold text-slate-600 dark:text-slate-300">Source: </span>
            {sourceNote}
          </div>
        )}
      </div>
    </div>
  );
};

