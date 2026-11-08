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
  Building2,
  Compass,
  ArrowRightCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { FeatureProperties, IndicatorConfig } from "../lib/types";
import { formatValue } from "../lib/colorScales";
import {
  exportPlacePDF,
  exportPlaceCSV,
  exportPlaceGeoJSON,
  exportPlaceShapefile
} from "../lib/placeExport";

interface PlaceDetailsModalProps {
  feature: any; // Full GeoJSON feature including geometry and properties
  indicator: IndicatorConfig;
  countryName: string;
  onClose: () => void;
  onDrillDown?: (properties: FeatureProperties) => void;
  canDrillDown?: boolean;
}

export const PlaceDetailsModal: React.FC<PlaceDetailsModalProps> = ({
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
    setExportSuccess("PDF Dossier generated and downloaded!");
    setTimeout(() => setExportSuccess(null), 3500);
  };

  const handleExportCSV = () => {
    exportPlaceCSV(feature, countryName, indicator);
    setExportSuccess("CSV data table exported!");
    setTimeout(() => setExportSuccess(null), 3500);
  };

  const handleExportGeoJSON = () => {
    exportPlaceGeoJSON(feature);
    setExportSuccess("GeoJSON boundary feature downloaded!");
    setTimeout(() => setExportSuccess(null), 3500);
  };

  const handleExportShapefile = async () => {
    setExportingShp(true);
    try {
      await exportPlaceShapefile(feature);
      setExportSuccess("ESRI Shapefile ZIP package downloaded!");
      setTimeout(() => setExportSuccess(null), 3500);
    } finally {
      setExportingShp(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-[#1f2328] dark:text-[#f0f6fc]">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#d0d7de] dark:border-[#30363d] flex items-center justify-between bg-[#f6f8fa] dark:bg-[#0d1117]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0969da] dark:bg-[#1f6feb] flex items-center justify-center text-white shadow-xs">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold leading-tight">{p.name}</h2>
                <span className="gh-badge font-mono text-[10px]">
                  {p.level_name || `Level ${p.level}`}
                </span>
                <span className="text-[10px] bg-[#f6f8fa] dark:bg-[#21262d] border border-[#d0d7de] dark:border-[#30363d] px-1.5 py-0.5 rounded font-mono text-[#656d76] dark:text-[#8b949e]">
                  {p.id}
                </span>
              </div>
              <p className="text-[11px] text-[#656d76] dark:text-[#8b949e]">
                {countryName || p.country_name} ({p.country_iso3}) {p.parent_name && p.parent_name !== "Unknown" ? `• Parent: ${p.parent_name}` : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#656d76] dark:text-[#8b949e] hover:text-[#1f2328] dark:hover:text-white rounded-md hover:bg-[#eaeef2] dark:hover:bg-[#21262d] transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success toast banner */}
        {exportSuccess && (
          <div className="bg-[#dafbe1] dark:bg-[#2ea04326] border-b border-[#4ac26b] dark:border-[#238636] px-4 py-2 text-xs text-[#1a7f37] dark:text-[#3fb950] font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{exportSuccess}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Export Options Toolbar */}
          <div className="bg-[#f6f8fa] dark:bg-[#0d1117] p-3 rounded-lg border border-[#d0d7de] dark:border-[#30363d]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[11px] uppercase tracking-wider text-[#656d76] dark:text-[#8b949e] flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-[#0969da] dark:text-[#2f81f7]" />
                Export Individual Place Data
              </span>
              <span className="text-[10px] text-[#656d76] dark:text-[#8b949e]">
                PDF • CSV • GeoJSON • Shapefile
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={handleExportPDF}
                className="gh-btn py-2 px-2.5 font-semibold text-xs flex items-center justify-center gap-1.5 hover:border-[#cf222e] hover:text-[#cf222e] transition-all"
                title="Download formatted demographic profile dossier PDF"
              >
                <FileText className="w-4 h-4 text-[#cf222e]" />
                <span>Export PDF</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="gh-btn py-2 px-2.5 font-semibold text-xs flex items-center justify-center gap-1.5 hover:border-[#1a7f37] hover:text-[#1a7f37] transition-all"
                title="Download attribute table as CSV"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#1a7f37] dark:text-[#3fb950]" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleExportGeoJSON}
                className="gh-btn py-2 px-2.5 font-semibold text-xs flex items-center justify-center gap-1.5 hover:border-[#9a6700] hover:text-[#9a6700] transition-all"
                title="Download GeoJSON feature with geometry and properties"
              >
                <Globe2 className="w-4 h-4 text-[#9a6700] dark:text-[#d29922]" />
                <span>GeoJSON</span>
              </button>

              <button
                onClick={handleExportShapefile}
                disabled={exportingShp}
                className="gh-btn py-2 px-2.5 font-semibold text-xs flex items-center justify-center gap-1.5 hover:border-[#8250df] hover:text-[#8250df] transition-all disabled:opacity-50"
                title="Download ESRI Shapefile ZIP (.shp, .dbf, .shx, .prj, .cpg)"
              >
                {exportingShp ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#8250df]" />
                ) : (
                  <FolderArchive className="w-4 h-4 text-[#8250df] dark:text-[#a371f7]" />
                )}
                <span>{exportingShp ? "Generating..." : "Shapefile"}</span>
              </button>
            </div>
          </div>

          {/* Key Metric Highlight Card */}
          <div className="p-3 bg-[#ddf4ff] dark:bg-[#388bfd1a] border border-[#0969da]/30 dark:border-[#2f81f7]/30 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#0969da] dark:text-[#2f81f7]">
                Selected Indicator Metric
              </span>
              <div className="text-sm font-semibold">{indicator.label}</div>
            </div>
            <div className="text-xl font-extrabold text-[#0969da] dark:text-[#2f81f7]">
              {formatValue(p[indicator.id], indicator.format, indicator.unit)}
            </div>
          </div>

          {/* Demographics & Spatial Profile Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="gh-card p-2.5">
              <span className="text-[10px] text-[#656d76] dark:text-[#8b949e] font-semibold uppercase">
                Total Population
              </span>
              <div className="text-sm font-bold text-[#1f2328] dark:text-[#f0f6fc] mt-0.5">
                {p.total_population ? p.total_population.toLocaleString() : "N/A"}
              </div>
            </div>

            <div className="gh-card p-2.5">
              <span className="text-[10px] text-[#656d76] dark:text-[#8b949e] font-semibold uppercase">
                Population Density
              </span>
              <div className="text-sm font-bold text-[#1f2328] dark:text-[#f0f6fc] mt-0.5">
                {p.population_density ? `${p.population_density.toFixed(1)} /km²` : "N/A"}
              </div>
            </div>

            <div className="gh-card p-2.5">
              <span className="text-[10px] text-[#656d76] dark:text-[#8b949e] font-semibold uppercase">
                Land Area
              </span>
              <div className="text-sm font-bold text-[#1f2328] dark:text-[#f0f6fc] mt-0.5">
                {p.area_km2 ? `${p.area_km2.toLocaleString()} km²` : "N/A"}
              </div>
            </div>

            <div className="gh-card p-2.5">
              <span className="text-[10px] text-[#656d76] dark:text-[#8b949e] font-semibold uppercase">
                Sex Ratio
              </span>
              <div className="text-sm font-bold text-[#1f2328] dark:text-[#f0f6fc] mt-0.5">
                {p.sex_ratio ? `${p.sex_ratio.toFixed(1)} M/100F` : "N/A"}
              </div>
            </div>
          </div>

          {/* Detailed Indicator Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Demographic Structure */}
            <div className="gh-card p-3 space-y-2">
              <div className="font-bold text-xs flex items-center gap-1.5 pb-1.5 border-b border-[#d0d7de] dark:border-[#30363d]">
                <TrendingUp className="w-3.5 h-3.5 text-[#0969da] dark:text-[#2f81f7]" />
                <span>Demographic & Household Structure</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between py-0.5 border-b border-[#d0d7de]/40 dark:border-[#30363d]/40">
                  <span className="text-[#656d76] dark:text-[#8b949e]">% Children Under 15:</span>
                  <span className="font-semibold">{p.pct_under_15 ? `${p.pct_under_15.toFixed(1)}%` : "N/A"}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-[#d0d7de]/40 dark:border-[#30363d]/40">
                  <span className="text-[#656d76] dark:text-[#8b949e]">% Elderly (Age 65+):</span>
                  <span className="font-semibold">{p.pct_65_plus ? `${p.pct_65_plus.toFixed(1)}%` : "N/A"}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-[#d0d7de]/40 dark:border-[#30363d]/40">
                  <span className="text-[#656d76] dark:text-[#8b949e]">Avg Household Size:</span>
                  <span className="font-semibold">{p.avg_household_size ? `${p.avg_household_size.toFixed(1)} people` : "N/A"}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-[#d0d7de]/40 dark:border-[#30363d]/40">
                  <span className="text-[#656d76] dark:text-[#8b949e]">Annual Growth Rate:</span>
                  <span className="font-semibold">{p.intercensal_growth_rate !== undefined && p.intercensal_growth_rate !== null ? `${p.intercensal_growth_rate.toFixed(2)}%` : "N/A"}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-[#656d76] dark:text-[#8b949e]">Urban Population Share:</span>
                  <span className="font-semibold">{p.urban_share !== undefined && p.urban_share !== null ? `${p.urban_share.toFixed(1)}%` : "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Health & Wellbeing (DHS) */}
            <div className="gh-card p-3 space-y-2">
              <div className="font-bold text-xs flex items-center gap-1.5 pb-1.5 border-b border-[#d0d7de] dark:border-[#30363d]">
                <HeartPulse className="w-3.5 h-3.5 text-[#1a7f37] dark:text-[#3fb950]" />
                <span>Health & Wellbeing (DHS Survey)</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between py-0.5 border-b border-[#d0d7de]/40 dark:border-[#30363d]/40">
                  <span className="text-[#656d76] dark:text-[#8b949e]">Total Fertility Rate (TFR):</span>
                  <span className="font-semibold">{p.total_fertility_rate !== undefined && p.total_fertility_rate !== null ? `${p.total_fertility_rate.toFixed(1)}` : "N/A"}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-[#d0d7de]/40 dark:border-[#30363d]/40">
                  <span className="text-[#656d76] dark:text-[#8b949e]">Under-5 Mortality Rate:</span>
                  <span className="font-semibold">{p.under_5_mortality !== undefined && p.under_5_mortality !== null ? `${p.under_5_mortality.toFixed(1)} /1,000` : "N/A"}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-[#d0d7de]/40 dark:border-[#30363d]/40">
                  <span className="text-[#656d76] dark:text-[#8b949e]">Child Stunting Prevalence:</span>
                  <span className="font-semibold">{p.stunting_rate !== undefined && p.stunting_rate !== null ? `${p.stunting_rate.toFixed(1)}%` : "N/A"}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-[#d0d7de]/40 dark:border-[#30363d]/40">
                  <span className="text-[#656d76] dark:text-[#8b949e]">Facility-Based Deliveries:</span>
                  <span className="font-semibold">{p.facility_births_pct !== undefined && p.facility_births_pct !== null ? `${p.facility_births_pct.toFixed(1)}%` : "N/A"}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-[#656d76] dark:text-[#8b949e]">Contraceptive Prevalence:</span>
                  <span className="font-semibold">{p.contraceptive_prevalence !== undefined && p.contraceptive_prevalence !== null ? `${p.contraceptive_prevalence.toFixed(1)}%` : "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Education & Infrastructure */}
            <div className="gh-card p-3 space-y-2 md:col-span-2">
              <div className="font-bold text-xs flex items-center gap-1.5 pb-1.5 border-b border-[#d0d7de] dark:border-[#30363d]">
                <Lightbulb className="w-3.5 h-3.5 text-[#9a6700] dark:text-[#d29922]" />
                <span>Education, Amenities & Infrastructure</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-[10px] text-[#656d76] dark:text-[#8b949e]">Literacy Rate</span>
                  <div className="font-semibold">{p.literacy_rate ? `${p.literacy_rate.toFixed(1)}%` : "N/A"}</div>
                </div>
                <div>
                  <span className="text-[10px] text-[#656d76] dark:text-[#8b949e]">Electricity Access</span>
                  <div className="font-semibold">{p.electricity_access ? `${p.electricity_access.toFixed(1)}%` : "N/A"}</div>
                </div>
                <div>
                  <span className="text-[10px] text-[#656d76] dark:text-[#8b949e]">Improved Water</span>
                  <div className="font-semibold">{p.improved_water ? `${p.improved_water.toFixed(1)}%` : "N/A"}</div>
                </div>
                <div>
                  <span className="text-[10px] text-[#656d76] dark:text-[#8b949e]">Improved Sanitation</span>
                  <div className="font-semibold">{p.improved_sanitation ? `${p.improved_sanitation.toFixed(1)}%` : "N/A"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata Footer */}
          <div className="text-[10px] text-[#656d76] dark:text-[#8b949e] border-t border-[#d0d7de] dark:border-[#30363d] pt-2 flex flex-col sm:flex-row justify-between gap-1">
            <div>
              <span className="font-semibold">Census Reference:</span> {p.reference_year ? `Year ${p.reference_year}` : "N/A"} •{" "}
              <span className="font-semibold">Source:</span> {p.source || "Official Census"}
            </div>
            <div>
              <span className="font-semibold">Projection:</span> Africa Albers Equal Area Conic (ESRI:102022)
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-3 border-t border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center justify-between">
          <button
            onClick={onClose}
            className="gh-btn px-4 py-1.5 text-xs"
          >
            Close
          </button>

          {canDrillDown && onDrillDown && !p.is_point && (
            <button
              onClick={() => {
                onDrillDown(p);
                onClose();
              }}
              className="gh-btn gh-btn-primary px-3 py-1.5 text-xs flex items-center gap-1.5"
            >
              <span>Explore Sub-Units within {p.name}</span>
              <ArrowRightCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

