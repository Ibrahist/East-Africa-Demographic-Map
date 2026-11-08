import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { IndicatorConfig } from "./types";
import { formatValue } from "./colorScales";

export function exportPlaceCSV(feature: any, countryName: string, indicator: IndicatorConfig) {
  if (!feature || !feature.properties) return;
  const p = feature.properties;
  const name = p.name || "place";
  const cleanName = name.replace(/[^a-zA-Z0-9_-]/g, "_");

  const headers = [
    "Attribute",
    "Value",
    "Description",
  ];

  const rows = [
    ["Administrative Unit", p.name || "", "Official name"],
    ["Administrative Level", `Level ${p.level || ""}`, p.level_name || ""],
    ["Feature ID", p.id || "", "Stable harmonized identifier"],
    ["Country", countryName || p.country_name || "", p.country_iso3 || ""],
    ["Parent Entity", p.parent_name || "", p.parent_id || ""],
    ["Total Population", p.total_population?.toLocaleString() || "N/A", "Census population"],
    ["Land Area (km2)", p.area_km2?.toLocaleString() || "N/A", "Equal-area conic projection"],
    ["Population Density", p.population_density ? `${p.population_density.toFixed(1)} /km2` : "N/A", "Persons per square kilometer"],
    ["Sex Ratio", p.sex_ratio ? `${p.sex_ratio.toFixed(1)} M/100F` : "N/A", "Males per 100 females"],
    ["Percent Under 15", p.pct_under_15 ? `${p.pct_under_15.toFixed(1)}%` : "N/A", "Youth cohort share"],
    ["Percent 65+", p.pct_65_plus ? `${p.pct_65_plus.toFixed(1)}%` : "N/A", "Elderly cohort share"],
    ["Avg Household Size", p.avg_household_size ? p.avg_household_size.toFixed(1) : "N/A", "Persons per household"],
    ["Annual Growth Rate", p.intercensal_growth_rate ? `${p.intercensal_growth_rate.toFixed(2)}%` : "N/A", "Intercensal population growth"],
    ["Total Fertility Rate", p.total_fertility_rate ? `${p.total_fertility_rate.toFixed(1)}` : "N/A", "Children per woman (DHS)"],
    ["Under-5 Mortality", p.under_5_mortality ? `${p.under_5_mortality.toFixed(1)} /1,000` : "N/A", "Deaths per 1,000 live births (DHS)"],
    ["Child Stunting Rate", p.stunting_rate ? `${p.stunting_rate.toFixed(1)}%` : "N/A", "Height-for-age z-score < -2 (DHS)"],
    ["Facility Births", p.facility_births_pct ? `${p.facility_births_pct.toFixed(1)}%` : "N/A", "Deliveries in health facilities (DHS)"],
    ["Literacy Rate", p.literacy_rate ? `${p.literacy_rate.toFixed(1)}%` : "N/A", "Adult literacy share"],
    ["Electricity Access", p.electricity_access ? `${p.electricity_access.toFixed(1)}%` : "N/A", "Households with grid or solar electricity"],
    ["Improved Water", p.improved_water ? `${p.improved_water.toFixed(1)}%` : "N/A", "Piped, borehole or protected water source"],
    ["Improved Sanitation", p.improved_sanitation ? `${p.improved_sanitation.toFixed(1)}%` : "N/A", "Flush toilet or improved pit latrine"],
    ["Selected Metric", indicator.label, formatValue(p[indicator.id], indicator.format, indicator.unit)],
    ["Census Reference Year", p.reference_year ? String(p.reference_year) : "N/A", "Year of baseline census"],
    ["Data Source", p.source || "National Statistical Agency", "Source attribution"],
  ];

  const csvContent = [
    headers.map((h) => `"${h}"`).join(","),
    ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${cleanName}_demographic_profile.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportPlaceGeoJSON(feature: any) {
  if (!feature) return;
  const name = feature.properties?.name || "place";
  const cleanName = name.replace(/[^a-zA-Z0-9_-]/g, "_");

  const geojsonContent = JSON.stringify(feature, null, 2);
  const blob = new Blob([geojsonContent], { type: "application/geo+json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${cleanName}_boundary.geojson`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportPlaceShapefile(feature: any) {
  if (!feature) return;
  const name = feature.properties?.name || "place";
  const cleanName = name.replace(/[^a-zA-Z0-9_-]/g, "_");

  try {
    const res = await fetch("/api/export/shapefile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feature, name: cleanName }),
    });

    if (!res.ok) {
      throw new Error(`Failed to generate shapefile: HTTP ${res.status}`);
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${cleanName}_shapefile.zip`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Shapefile export error:", err);
    alert("Could not export shapefile: " + (err as Error).message);
  }
}

export function exportPlacePDF(feature: any, countryName: string, indicator: IndicatorConfig) {
  if (!feature || !feature.properties) return;
  const p = feature.properties;
  const name = p.name || "place";
  const cleanName = name.replace(/[^a-zA-Z0-9_-]/g, "_");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Top header brand bar
  doc.setFillColor(9, 105, 218); // GitHub Blue
  doc.rect(0, 0, 210, 18, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("EAST AFRICA DEMOGRAPHIC & SPATIAL DOSSIER", 14, 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("OFFICIAL STATISTICAL PROFILE", 196, 11, { align: "right" });

  // Place Title & Subheader
  doc.setTextColor(31, 35, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(name, 14, 30);

  doc.setFontSize(10);
  doc.setTextColor(101, 109, 118);
  doc.setFont("helvetica", "normal");
  const subtext = `${p.level_name || `Level ${p.level}`} | ${countryName || p.country_name} (${p.country_iso3}) | Parent: ${p.parent_name || "National"}`;
  doc.text(subtext, 14, 37);

  // Key Statistics Highlights (4 Cards)
  const stats = [
    { label: "TOTAL POPULATION", value: p.total_population ? p.total_population.toLocaleString() : "N/A" },
    { label: "POPULATION DENSITY", value: p.population_density ? `${p.population_density.toFixed(1)} /km²` : "N/A" },
    { label: "LAND AREA", value: p.area_km2 ? `${p.area_km2.toLocaleString()} km²` : "N/A" },
    { label: indicator.label.toUpperCase(), value: formatValue(p[indicator.id], indicator.format, indicator.unit) },
  ];

  stats.forEach((s, idx) => {
    const x = 14 + idx * 46;
    const y = 43;
    doc.setFillColor(246, 248, 250);
    doc.setDrawColor(208, 215, 222);
    doc.roundedRect(x, y, 43, 20, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(101, 109, 118);
    doc.text(s.label.length > 20 ? s.label.substring(0, 18) + "..." : s.label, x + 3, y + 6);

    doc.setFontSize(11);
    doc.setTextColor(9, 105, 218);
    doc.text(String(s.value), x + 3, y + 15);
  });

  // Table 1: Administrative & Governance Metadata
  const adminData = [
    ["Feature ID", p.id || "N/A", "Classification", p.level_name || `Level ${p.level}`],
    ["Country", `${countryName || p.country_name} (${p.country_iso3})`, "Parent Entity", p.parent_name || "N/A"],
    ["Census Baseline", p.reference_year ? `Year ${p.reference_year}` : "N/A", "Data Source", p.source || "National Statistics Agency"],
    ["Geometry Type", feature.geometry?.type || "Polygon", "Boundary Source", "geoBoundaries / HDX COD-AB"],
  ];

  autoTable(doc, {
    startY: 68,
    head: [["Administrative Attribute", "Value", "Hierarchy Attribute", "Value"]],
    body: adminData,
    theme: "grid",
    headStyles: {
      fillColor: [36, 41, 47],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [31, 35, 40],
    },
    alternateRowStyles: {
      fillColor: [246, 248, 250],
    },
    margin: { left: 14, right: 14 },
  });

  // Table 2: Full Demographics & Socio-Economic Indicators
  const demoData = [
    ["Sex Ratio", p.sex_ratio ? `${p.sex_ratio.toFixed(1)} males per 100 females` : "N/A"],
    ["Youth Share (% Under 15)", p.pct_under_15 ? `${p.pct_under_15.toFixed(1)}%` : "N/A"],
    ["Elderly Share (% Age 65+)", p.pct_65_plus ? `${p.pct_65_plus.toFixed(1)}%` : "N/A"],
    ["Average Household Size", p.avg_household_size ? `${p.avg_household_size.toFixed(1)} persons` : "N/A"],
    ["Intercensal Population Growth", p.intercensal_growth_rate ? `${p.intercensal_growth_rate.toFixed(2)}% per year` : "N/A"],
    ["Total Fertility Rate (TFR)", p.total_fertility_rate ? `${p.total_fertility_rate.toFixed(1)} births per woman (DHS)` : "N/A"],
    ["Under-5 Mortality Rate", p.under_5_mortality ? `${p.under_5_mortality.toFixed(1)} per 1,000 live births (DHS)` : "N/A"],
    ["Child Stunting Prevalence", p.stunting_rate ? `${p.stunting_rate.toFixed(1)}% (DHS)` : "N/A"],
    ["Facility-Based Births", p.facility_births_pct ? `${p.facility_births_pct.toFixed(1)}% (DHS)` : "N/A"],
    ["Literacy Rate", p.literacy_rate ? `${p.literacy_rate.toFixed(1)}%` : "N/A"],
    ["Electricity Access", p.electricity_access ? `${p.electricity_access.toFixed(1)}% of households` : "N/A"],
    ["Improved Drinking Water", p.improved_water ? `${p.improved_water.toFixed(1)}% of households` : "N/A"],
    ["Improved Sanitation Facility", p.improved_sanitation ? `${p.improved_sanitation.toFixed(1)}% of households` : "N/A"],
  ];

  const finalY = (doc as any).lastAutoTable?.finalY || 105;

  autoTable(doc, {
    startY: finalY + 7,
    head: [["Demographic & Health Indicator", "Official Census / Survey Value"]],
    body: demoData,
    theme: "striped",
    headStyles: {
      fillColor: [9, 105, 218],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [31, 35, 40],
    },
    alternateRowStyles: {
      fillColor: [246, 248, 250],
    },
    margin: { left: 14, right: 14 },
  });

  // Footer notes & timestamp
  const footerY = (doc as any).lastAutoTable?.finalY || 240;
  doc.setFontSize(7.5);
  doc.setTextColor(140, 149, 159);
  doc.text(
    `Exported from East Africa Demographic GIS Platform on ${new Date().toLocaleDateString()} | Projections: Africa Albers Equal Area Conic (ESRI:102022) | WGS84`,
    14,
    Math.min(285, footerY + 12)
  );

  doc.save(`${cleanName}_demographic_profile.pdf`);
}

