"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Key, Menu, MapPin } from "lucide-react";

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
    <header className="h-14 bg-[#161b22] border-b border-[#30363d] px-4 flex items-center justify-between z-20 relative text-[#e6edf3]">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 text-[#8b949e] hover:bg-[#21262d] rounded-md border border-[#30363d]"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* GitHub Logo & Project Title */}
        <div className="flex items-center gap-2.5">
          <svg
            height="24"
            viewBox="0 0 16 16"
            width="24"
            className="text-[#f0f6fc] flex-shrink-0"
            fill="currentColor"
            aria-label="GitHub Logo"
          >
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
          </svg>
          <span className="font-semibold text-sm text-[#f0f6fc] tracking-tight">
            east-africa / <span className="font-bold text-[#2f81f7]">demographic-map</span>
          </span>
          <span className="hidden md:inline-flex gh-badge">
            Harmonized Admin L1–L4
          </span>
        </div>
      </div>

      {/* Global Search Box (Dark GitHub Style) */}
      <div ref={searchRef} className="relative flex-1 max-w-xs sm:max-w-sm md:max-w-md mx-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery && setShowResults(true)}
            placeholder="Type / to search regions, counties, districts, wards..."
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md pl-8 pr-4 py-1 text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:bg-[#010409] focus:outline-none focus:border-[#2f81f7] focus:ring-1 focus:ring-[#2f81f7] transition-all"
          />
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#161b22] rounded-md shadow-2xl border border-[#30363d] py-1 z-50 max-h-72 overflow-y-auto">
            {searchResults.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectSearchResult(item.country_iso3, item.level, item.id, item.name);
                  setShowResults(false);
                  setSearchQuery("");
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#21262d] flex items-center justify-between text-xs transition-colors border-b border-[#30363d]/40 last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#2f81f7] flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-[#f0f6fc]">{item.name}</div>
                    <div className="text-[10px] text-[#8b949e]">
                      {item.level_name} • {item.country_name}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] bg-[#21262d] text-[#8b949e] border border-[#30363d] px-1.5 py-0.5 rounded font-mono">
                  L{item.level}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right controls: Maps API Key */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowKeyModal(true)}
          className={`gh-btn px-2.5 py-1 text-xs font-medium transition-colors ${
            apiKey
              ? "bg-[#2ea04326] text-[#3fb950] border-[#238636]"
              : "bg-[#bb800926] text-[#d29922] border-[#9e6a03]"
          }`}
          title="Configure Google Maps API Key"
        >
          <Key className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {apiKey ? "Google Maps Engine" : "Set Maps Key"}
          </span>
        </button>
      </div>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b22] rounded-md shadow-2xl max-w-md w-full p-6 border border-[#30363d] text-xs text-[#e6edf3]">
            <h3 className="text-sm font-bold text-[#f0f6fc] mb-2 flex items-center gap-2">
              <Key className="w-4 h-4 text-[#2f81f7]" />
              Google Maps JavaScript API Key
            </h3>
            <p className="text-[#8b949e] mb-4 leading-relaxed">
              Google Maps requires an API key with <strong>Maps JavaScript API</strong> enabled. The key can be set in <code className="bg-[#0d1117] px-1 py-0.5 rounded font-mono text-[#2f81f7]">.env.local</code> or entered here for this session.
            </p>
            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-[#8b949e] font-semibold mb-1">API Key:</label>
                <input
                  type="text"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="gh-input w-full font-mono text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="gh-btn px-3 py-1.5 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateApiKey(tempKey.trim());
                  setShowKeyModal(false);
                }}
                className="gh-btn gh-btn-primary px-3 py-1.5 text-xs"
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
