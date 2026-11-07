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
    <nav className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-300 overflow-x-auto py-1 px-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
      <button
        onClick={() => onSelect({ id: "EAF", name: "All East Africa", level: 0 })}
        className="flex items-center gap-1 hover:text-sky-600 dark:hover:text-sky-400 font-medium transition-colors"
        title="Reset to All East Africa"
      >
        <Home className="w-3.5 h-3.5" />
        <span>East Africa</span>
      </button>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={item.id + idx}>
            <ChevronRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <button
              onClick={() => onSelect(item)}
              disabled={isLast}
              className={`truncate max-w-[140px] transition-colors ${
                isLast
                  ? "font-bold text-sky-600 dark:text-sky-400 cursor-default"
                  : "hover:text-sky-600 dark:hover:text-sky-400 text-slate-600 dark:text-slate-400"
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

