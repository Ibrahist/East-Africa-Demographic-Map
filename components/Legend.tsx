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
      className={`bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-md p-3.5 rounded-md shadow-lg border border-[#d0d7de] dark:border-[#30363d] text-xs text-[#1f2328] dark:text-[#f0f6fc] max-w-xs ${className}`}
    >
      <div className="font-bold text-xs mb-0.5 text-[#1f2328] dark:text-[#f0f6fc] flex items-center justify-between">
        <span>{indicator.label}</span>
      </div>
      <div className="text-[10px] text-[#656d76] dark:text-[#8b949e] mb-2.5">
        {indicator.unit} • {selectedCountryName}
      </div>

      {/* Class breaks color bars */}
      <div className="flex flex-col gap-1.5 mb-2.5">
        {legendBreaks.map((b, idx) => (
          <div key={idx} className="flex items-center gap-2 text-[11px]">
            <span
              className="w-3.5 h-3.5 rounded-xs flex-shrink-0 border border-black/15 dark:border-white/15"
              style={{ backgroundColor: b.color }}
            />
            <span className="text-[#1f2328] dark:text-[#c9d1d9] font-mono text-[10px] truncate">
              {b.label}
            </span>
          </div>
        ))}

        {/* Missing Data indicator */}
        <div className="flex items-center gap-2 text-[11px] pt-1.5 border-t border-[#d0d7de]/50 dark:border-[#30363d]/50">
          <span className="w-3.5 h-3.5 rounded-xs bg-[#8c959f] flex-shrink-0 border border-dashed border-[#656d76]" />
          <span className="text-[#656d76] dark:text-[#8b949e] text-[10px]">No Data / Unavailable</span>
        </div>
      </div>

      {/* Footer Notes */}
      <div className="text-[9px] text-[#656d76] dark:text-[#8b949e] border-t border-[#d0d7de]/50 dark:border-[#30363d]/50 pt-2 leading-tight flex flex-col gap-1">
        {referenceYearNote && (
          <div>
            <span className="font-semibold text-[#1f2328] dark:text-[#c9d1d9]">Reference: </span>
            {referenceYearNote}
          </div>
        )}
        {sourceNote && (
          <div>
            <span className="font-semibold text-[#1f2328] dark:text-[#c9d1d9]">Source: </span>
            {sourceNote}
          </div>
        )}
        <div className="pt-1 text-[8px] text-[#656d76] dark:text-[#8b949e]">
          Icon:{" "}
          <a
            href="https://www.flaticon.com/free-icons/africa"
            title="africa icons"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-[#0969da] dark:text-[#58a6ff]"
          >
            Africa icons created by Kalashnyk - Flaticon
          </a>
        </div>
      </div>
    </div>
  );
};
