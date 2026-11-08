"use client";

import React, { useState } from "react";
import {
  X,
  Download,
  FileText,
  FileSpreadsheet,
  Globe2,
  FolderArchive,
  MapPin,
  TrendingUp,
  HeartPulse,
  Lightbulb,
  ArrowRightCircle,
  CheckCircle2,
  Loader2,
  Layers
} from "lucide-react";
import { FeatureProperties, IndicatorConfig } from "../lib/types";
import { formatValue } from "../lib/colorScales";
import {
  exportPlacePDF,
  exportPlaceCSV,
  exportPlaceGeoJSON,
  exportPlaceShapefile
} from "../lib/placeExport";

interface PlaceExportMenuProps {
  feature: any; // GeoJSON feature
  indicator: IndicatorConfig;
  countryName: string;
  onClose: () => void;
  onDrillDown?: (properties: FeatureProperties) => void;
  canDrillDown?: boolean;
}

export const PlaceExportMenu: React.FC<PlaceExportMenuProps> = ({
  feature,
  indicator,
  countryName,
  onClose,
  onDrillDown,
  canDrillDown = false,
}) => {
  const [exportingShp, setExportingShp] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  if (!feature || !feature.properties) return null;
  const p = feature.properties as FeatureProperties;

  const handleExportPDF = () => {
    exportPlacePDF(feature, countryName, indicator);
    setExportSuccess("PDF Dossier exported!");
    setTimeout(() => setExportSuccess(null), 3000);
  };

  const handleExportCSV = () => {
    exportPlaceCSV(feature, countryName, indicator);
    setExportSuccess("CSV table exported!");
    setTimeout(() => setExportSuccess(null), 3000);
  };

  const handleExportGeoJSON = () => {
    exportPlaceGeoJSON(feature);
    setExportSuccess("GeoJSON boundary exported!");
    setTimeout(() => setExportSuccess(null), 3000);
  };

  const handleExportShapefile = async () => {
    setExportingShp(true);
    try {
      await exportPlaceShapefile(feature);
      setExportSuccess("Shapefile ZIP exported!");
      setTimeout(() => setExportSuccess(null), 3000);
    } finally {
      setExportingShp(false);
    }
  };

  return (
    <aside
      className="absolute top-3 right-3 bottom-5 z-30 w-80 sm:w-96 bg-[#161b22]/95 backdrop-blur-xl border border-[#30363d] rounded-xl shadow-2xl flex flex-col overflow-hidden text-[#e6edf3] animate-in slide-in-from-right duration-200"
      aria-label="Place Export Menu"
    >
      {/* Header */}
      <div className="p-3.5 border-b border-[#30363d] flex items-center justify-between bg-[#0d1117]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#2f81f7] flex items-center justify-center text-white shadow-xs">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold leading-tight truncate text-[#f0f6fc]">{p.name}</h3>
              <span className="text-[10px] bg-[#21262d] border border-[#30363d] px-1.5 py-0.2 rounded font-mono text-[#8b949e]">
                {p.level_name || `L${p.level}`}
              </span>
            </div>
            <p className="text-[10px] text-[#8b949e] truncate">
              {countryName || p.country_name} {p.parent_name && p.parent_name !== "Unknown" ? `• ${p.parent_name}` : ""}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-[#8b949e] hover:text-white rounded-md hover:bg-[#21262d] transition-colors"
          title="Close export menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Success alert banner */}
      {exportSuccess && (
        <div className="bg-[#2ea04326] border-b border-[#238636] px-3.5 py-1.5 text-xs text-[#3fb950] font-semibold flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{exportSuccess}</span>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
        {/* Export Action Card */}
        <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363d]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-[11px] uppercase tracking-wider text-[#8b949e] flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-[#2f81f7]" />
              Export Area Data
            </span>
            <span className="text-[10px] text-[#58a6ff] font-mono">4 Formats</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {/* 1. PDF */}
            <button
              onClick={handleExportPDF}
              className="gh-btn py-2 px-2 text-xs font-semibold flex items-center justify-center gap-1.5 hover:border-[#f85149] hover:text-[#f85149] transition-all"
              title="Export formatted demographic summary PDF report"
            >
              <FileText className="w-4 h-4 text-[#f85149]" />
              <span>Export PDF</span>
            </button>

            {/* 2. CSV */}
            <button
              onClick={handleExportCSV}
              className="gh-btn py-2 px-2 text-xs font-semibold flex items-center justify-center gap-1.5 hover:border-[#3fb950] hover:text-[#3fb950] transition-all"
              title="Export place attributes as CSV spreadsheet"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#3fb950]" />
              <span>Export CSV</span>
            </button>

            {/* 3. GeoJSON */}
            <button
              onClick={handleExportGeoJSON}
              className="gh-btn py-2 px-2 text-xs font-semibold flex items-center justify-center gap-1.5 hover:border-[#d29922] hover:text-[#d29922] transition-all"
              title="Export boundary feature as GeoJSON"
            >
              <Globe2 className="w-4 h-4 text-[#d29922]" />
              <span>GeoJSON</span>
            </button>

            {/* 4. Shapefile */}
            <button
              onClick={handleExportShapefile}
              disabled={exportingShp}
              className="gh-btn py-2 px-2 text-xs font-semibold flex items-center justify-center gap-1.5 hover:border-[#a371f7] hover:text-[#a371f7] transition-all disabled:opacity-50"
              title="Export ESRI Shapefile suite (.shp, .dbf, .shx, .prj, .cpg) in a ZIP"
            >
              {exportingShp ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#a371f7]" />
              ) : (
                <FolderArchive className="w-4 h-4 text-[#a371f7]" />
              )}
              <span>{exportingShp ? "Exporting..." : "Shapefile"}</span>
            </button>
          </div>
        </div>

        {/* Selected Indicator Highlight */}
        <div className="p-2.5 bg-[#388bfd1a] border border-[#2f81f7]/30 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-[9px] uppercase tracking-wider font-bold text-[#58a6ff]">
              {indicator.label}
            </div>
            <div className="text-[10px] text-[#8b949e]">{indicator.unit}</div>
          </div>
          <div className="text-base font-extrabold text-[#d29922]">
            {formatValue(p[indicator.id], indicator.format, indicator.unit)}
          </div>
        </div>

        {/* Demographic & Geographic Profile */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-[#2f81f7]" />
            <span>Demographics & Spatial Profile</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <div className="bg-[#0d1117] p-2 rounded-md border border-[#30363d]">
              <span className="text-[10px] text-[#8b949e]">Population:</span>
              <div className="font-bold text-[#f0f6fc]">
                {p.total_population ? p.total_population.toLocaleString() : "N/A"}
              </div>
            </div>

            <div className="bg-[#0d1117] p-2 rounded-md border border-[#30363d]">
              <span className="text-[10px] text-[#8b949e]">Density:</span>
              <div className="font-bold text-[#f0f6fc]">
                {p.population_density ? `${p.population_density.toFixed(1)} /km²` : "N/A"}
              </div>
            </div>

            <div className="bg-[#0d1117] p-2 rounded-md border border-[#30363d]">
              <span className="text-[10px] text-[#8b949e]">Land Area:</span>
              <div className="font-bold text-[#f0f6fc]">
                {p.area_km2 ? `${p.area_km2.toLocaleString()} km²` : "N/A"}
              </div>
            </div>

            <div className="bg-[#0d1117] p-2 rounded-md border border-[#30363d]">
              <span className="text-[10px] text-[#8b949e]">Sex Ratio:</span>
              <div className="font-bold text-[#f0f6fc]">
                {p.sex_ratio ? `${p.sex_ratio.toFixed(1)} M/100F` : "N/A"}
              </div>
            </div>
          </div>

          <div className="bg-[#0d1117] p-2 rounded-md border border-[#30363d] space-y-1 text-[11px]">
            <div className="flex justify-between py-0.5 border-b border-[#30363d]/50">
              <span className="text-[#8b949e]">% Under 15:</span>
              <span className="font-semibold">{p.pct_under_15 ? `${p.pct_under_15.toFixed(1)}%` : "N/A"}</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-[#30363d]/50">
              <span className="text-[#8b949e]">% Age 65+:</span>
              <span className="font-semibold">{p.pct_65_plus ? `${p.pct_65_plus.toFixed(1)}%` : "N/A"}</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-[#30363d]/50">
              <span className="text-[#8b949e]">Household Size:</span>
              <span className="font-semibold">{p.avg_household_size ? `${p.avg_household_size.toFixed(1)} persons` : "N/A"}</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-[#30363d]/50">
              <span className="text-[#8b949e]">Growth Rate:</span>
              <span className="font-semibold">{p.intercensal_growth_rate !== undefined && p.intercensal_growth_rate !== null ? `${p.intercensal_growth_rate.toFixed(2)}%/yr` : "N/A"}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-[#8b949e]">Urban Share:</span>
              <span className="font-semibold">{p.urban_share !== undefined && p.urban_share !== null ? `${p.urban_share.toFixed(1)}%` : "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Health & Infrastructure Summary (if present) */}
        {(p.total_fertility_rate || p.under_5_mortality || p.stunting_rate || p.contraceptive_prevalence || p.literacy_rate !== undefined || p.electricity_access !== undefined || p.improved_water !== undefined) && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider flex items-center gap-1">
              <HeartPulse className="w-3 h-3 text-[#3fb950]" />
              <span>Health & Wellbeing</span>
            </div>
            <div className="bg-[#0d1117] p-2 rounded-md border border-[#30363d] space-y-1 text-[11px]">
              {p.total_fertility_rate && (
                <div className="flex justify-between py-0.5 border-b border-[#30363d]/50">
                  <span className="text-[#8b949e]">Fertility Rate:</span>
                  <span className="font-semibold">{p.total_fertility_rate.toFixed(1)} births/woman</span>
                </div>
              )}
              {p.under_5_mortality && (
                <div className="flex justify-between py-0.5 border-b border-[#30363d]/50">
                  <span className="text-[#8b949e]">Under-5 Mortality:</span>
                  <span className="font-semibold">{p.under_5_mortality.toFixed(1)} /1,000</span>
                </div>
              )}
              {p.stunting_rate && (
                <div className="flex justify-between py-0.5 border-b border-[#30363d]/50">
                  <span className="text-[#8b949e]">Child Stunting:</span>
                  <span className="font-semibold">{p.stunting_rate.toFixed(1)}%</span>
                </div>
              )}
              {p.contraceptive_prevalence && (
                <div className="flex justify-between py-0.5 border-b border-[#30363d]/50">
                  <span className="text-[#8b949e]">Contraception:</span>
                  <span className="font-semibold">{p.contraceptive_prevalence.toFixed(1)}%</span>
                </div>
              )}
              {p.literacy_rate !== undefined && (
                <div className="flex justify-between py-0.5 border-b border-[#30363d]/50">
                  <span className="text-[#8b949e]">Literacy Rate:</span>
                  <span className="font-semibold">{p.literacy_rate.toFixed(1)}%</span>
                </div>
              )}
              {p.electricity_access !== undefined && (
                <div className="flex justify-between py-0.5 border-b border-[#30363d]/50">
                  <span className="text-[#8b949e]">Electricity:</span>
                  <span className="font-semibold">{p.electricity_access.toFixed(1)}%</span>
                </div>
              )}
              {p.improved_water !== undefined && (
                <div className="flex justify-between py-0.5">
                  <span className="text-[#8b949e]">Improved Water:</span>
                  <span className="font-semibold">{p.improved_water.toFixed(1)}%</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Source citation */}
        <div className="text-[9px] text-[#8b949e] border-t border-[#30363d] pt-2 space-y-1.5">
          <div>Census Year: {p.reference_year || "N/A"} • Source: {p.source || "Official Agency"}</div>
          <div className="p-2 rounded-md bg-[#bb800918] border border-[#d29922]/30 text-[#d29922] text-[9.5px] leading-relaxed">
            <strong>Warning / Notice:</strong> If you want to use this data by any means, you should contact the owners of the original data (national statistics bureaus & DHS).
          </div>
        </div>
      </div>

      {/* Drill Down Footer Button */}
      {canDrillDown && onDrillDown && !p.is_point && (
        <div className="p-3 border-t border-[#30363d] bg-[#0d1117]">
          <button
            onClick={() => {
              onDrillDown(p);
              onClose();
            }}
            className="w-full gh-btn gh-btn-primary py-2 text-xs flex items-center justify-center gap-1.5"
            title={`Explore lower level units inside ${p.name}`}
          >
            <span>Explore Sub-Units inside {p.name}</span>
            <ArrowRightCircle className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
};

