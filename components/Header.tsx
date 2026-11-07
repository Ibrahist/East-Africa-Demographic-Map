"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Key, Menu, CheckCircle2, AlertCircle, MapPin } from "lucide-react";
import { FeatureProperties } from "../lib/types";

interface HeaderProps {
  onToggleSidebar: () => void;
  apiKey: string;
  onUpdateApiKey: (key: string) => void;
  onSelectSearchResult: (countryIso: string, level: number, featureId: string, name: string) => void;
  allFeaturesIndex: Array<{
    id: string;
    name: string;
    country_iso3: string;
    country_name: string;
    level: number;
    level_name: string;
  }>;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  apiKey,
  onUpdateApiKey,
  onSelectSearchResult,
  allFeaturesIndex,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof allFeaturesIndex>([]);
  const [showResults, setShowResults] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const matches = allFeaturesIndex
      .filter((f) => f.name.toLowerCase().includes(q))
      .slice(0, 8);
    setSearchResults(matches);
    setShowResults(true);
  }, [searchQuery, allFeaturesIndex]);

  // Click outside search
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between z-20 shadow-sm relative">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm sm:text-base bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
            East Africa Choropleth
          </span>
          <span className="hidden sm:inline-block text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-medium">
            5 Countries • Harmonized Admin
          </span>
        </div>
      </div>

      {/* Global Search Box */}
      <div ref={searchRef} className="relative flex-1 max-w-xs sm:max-w-sm md:max-w-md mx-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery && setShowResults(true)}
            placeholder="Search any region, county, district, ward..."
            className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 max-h-72 overflow-y-auto">
            {searchResults.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectSearchResult(item.country_iso3, item.level, item.id, item.name);
                  setShowResults(false);
                  setSearchQuery("");
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {item.level_name} • {item.country_name}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                  L{item.level}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right controls: API Key status */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowKeyModal(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            apiKey
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
              : "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 animate-pulse"
          }`}
          title="Configure Google Maps API Key"
        >
          <Key className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {apiKey ? "API Key Active" : "Set Maps Key"}
          </span>
        </button>
      </div>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Key className="w-4 h-4 text-sky-500" />
              Google Maps JavaScript API Key
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              Google Maps requires an API key with <strong>Maps JavaScript API</strong> enabled. The key can be set in your <code className="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono text-amber-600">.env.local</code> or entered here for this session.
            </p>
            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">API Key:</label>
                <input
                  type="text"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateApiKey(tempKey.trim());
                  setShowKeyModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

