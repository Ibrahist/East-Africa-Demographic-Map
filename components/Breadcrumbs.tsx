"use client";

import React from "react";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  id: string;
  name: string;
  level: number; // 0: All East Africa, 1: Level 1, 2: Level 2, 3: Level 3
  countryIso?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onSelect: (item: BreadcrumbItem) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onSelect }) => {
  return (
    <nav className="flex items-center space-x-1.5 text-xs text-[#1f2328] dark:text-[#f0f6fc] overflow-x-auto py-1.5 px-3 bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-md rounded-md shadow-xs border border-[#d0d7de] dark:border-[#30363d]">
      <button
        onClick={() => onSelect({ id: "EAF", name: "All East Africa", level: 0 })}
        className="flex items-center gap-1 hover:text-[#0969da] dark:hover:text-[#2f81f7] font-medium transition-colors"
        title="Reset to All East Africa"
      >
        <Home className="w-3.5 h-3.5" />
        <span>East Africa</span>
      </button>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={item.id + idx}>
            <ChevronRight className="w-3 h-3 text-[#656d76] dark:text-[#8b949e] flex-shrink-0" />
            <button
              onClick={() => onSelect(item)}
              disabled={isLast}
              className={`truncate max-w-[150px] transition-colors ${
                isLast
                  ? "font-bold text-[#0969da] dark:text-[#2f81f7] cursor-default"
                  : "hover:text-[#0969da] dark:hover:text-[#2f81f7] text-[#656d76] dark:text-[#8b949e]"
              }`}
              title={item.name}
            >
              {item.name}
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
};
