# East Africa Demographic Choropleth Map

An interactive, high-performance choropleth web mapping application visualizing administrative hierarchies and public census demographics across East Africa (**Kenya**, **Tanzania**, **Uganda**, **Rwanda**, and **Burundi**), built with **Next.js**, **TypeScript**, and the **Google Maps JavaScript API** Data layer.

---

## 1. Features & Architecture

* **Dual Rendering Engine:**
  * **Engine 1 (Google Maps JS API):** Renders high-performance vector polygons on Google Maps Roadmap, Dark, or Satellite hybrid imagery via the Data layer (`map.data.addGeoJson` / `map.data.setStyle`).
  * **Engine 2 (Instant SVG Vector Choropleth):** True conformal equirectangular projection with cosine latitude compensation that works right out of the box with zero setup or API key requirement. Includes drag pan, scroll wheel zoom, and view reset.
* **GitHub Dark Primer Design System:**
  * Clean, authentic GitHub Dark interface styled with Primer design tokens (`#0d1117` canvas, `#161b22` panels, `#30363d` borders, and `#2f81f7` blue accents), badges, cards, buttons, and custom scrollbars.
* **Google Sans Flex Typography:**
  * Beautiful variable optical-sizing typography applied globally across all UI components, controls, tables, and tooltips.
* **Harmonized Administrative Hierarchy:**
  * Maps Country → Level 1 → Level 2 → Level 3 → Level 4 (Settlements/Points), while displaying country-specific official names (e.g. *County* in Kenya, *Region* in Tanzania, *District* in Uganda, *Province* in Rwanda and Burundi).
* **Multi-Country & Regional Modes:**
  * Toggle between individual country views or **"All East Africa"** for unified cross-border comparison.
* **Interactive Choropleth Styling:**
  * Real-time vector classification using **Quantile**, **Natural Breaks**, or **Equal Interval** methods.
  * Color-blind safe palettes (Viridis, Cividis, YlOrRd, YlGnBu, Blues, Purples, Greens, Plasma).
  * Opacity slider and dark/light/satellite base map canvases.
* **Rich Spatial Interaction & Full Details on Hover:**
  * **Comprehensive Hover Tooltip:** Displays official unit name, parent entity, indicator value with unit, census population, density, land area, sex ratio, age cohorts (<15, 65+), household size, DHS health indicators (TFR, U5MR, stunting, facility births), infrastructure metrics (literacy, electricity, water, sanitation), census reference year, rank within country, and rank within displayed set.
  * **Individual Place Export Studio:** Clicking any place or selecting from search opens an interactive dossier modal with individual exports:
    * **PDF Report**: Publication-grade demographic dossier generated via `jspdf` & `jspdf-autotable`.
    * **CSV Attributes**: Tabular spreadsheet of that individual unit's complete demographic and spatial data.
    * **GeoJSON Feature**: Clean GeoJSON polygon boundary with all metadata properties.
    * **ESRI Shapefile (ZIP)**: Complete `.shp`, `.shx`, `.dbf`, `.prj`, `.cpg` suite generated dynamically via the GeoPandas backend route (`/api/export/shapefile`).
  * **Click-to-Drill-Down:** Option to drill down and explore lower-level sub-units partitioned by parent ID.
  * **Global Search:** Fast autocomplete search across any county, region, district, or ward in East Africa.
  * **Breadcrumbs:** Breadcrumb trail (`All East Africa > Country > Level 1 > Level 2`) for intuitive navigation back up the tree.
* **Viewport Data Export:**
  * **Download CSV:** Exports the current view's features, parents, and indicators as a tabular CSV.
  * **Export Map PNG:** Captures the current map view and legend into a high-resolution PNG image.
* **Data Pipeline:**
  * Python pipeline that reprojects boundaries using equal-area geometry (**Africa Albers Equal Area Conic** / `ESRI:102022`), computes geodesic area and population density, cleans and joins census and DHS indicators, simplifies geometries, and runs automated quality validation checks.

---

## 2. Verified Administrative Hierarchies

| Country | ISO3 | Level 1 | Level 2 | Level 3 | Level 4 | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Kenya** | `KEN` | **County** (47) | **Sub-County** (290) | **Ward** (1,452) | **Village / Settlement** (Points) | Polygons down to Ward; Level 4 mapped as OpenStreetMap point settlements. |
| **Tanzania** | `TZA` | **Region** (30–31) | **District** (170) | **Ward** (3,644) | **Village / Mtaa** (Points) | Includes Songwe Region created in 2016. Polygons down to Ward; Level 4 mapped as points. |
| **Uganda** | `UGA` | **District** (136) | **County** (151) | **Sub-county** (1,521) | **Parish / Village** (Points) | Under Uganda's Local Government Act, **District (LC5)** is Level 1 governance; the 4 statistical regions are non-governing aggregations. |
| **Rwanda** | `RWA` | **Province** (5) | **District** (30) | **Sector** (416) | **Cell** (2,148 polygons) | Full polygon coverage down to Level 4 (Cells / *Akagari*). Level 5 (*Umudugudu*) mapped as points. |
| **Burundi** | `BDI` | **Province** (18) | **Commune** (119) | **Colline** (2,615 polygons) | **Sous-colline / Village** (Points) | Baseline matches the 18-province / 119-commune census projection and DHS. (Burundi enacted a 5-province reform in 2023). |

---

## 3. Quick Start & Setup

### Prerequisites
* **Node.js** (v18+ or v25+) and **pnpm** (or npm)
* **Python** (v3.10+) with `geopandas`, `pandas`, `requests`, `openpyxl`, `pyyaml`, `shapely`

### 1. Install Dependencies
```bash
# Node.js dependencies
pnpm install

# Python dependencies (if not already installed)
pip install geopandas pandas requests openpyxl pyyaml shapely scipy
```

### 2. Set Google Maps API Key
Obtain a Google Maps JavaScript API Key:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/overview).
2. Create a project and enable the **Maps JavaScript API**.
3. Create an API Key in **Credentials**.
4. Create a `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
```
*(You can also test the application by pasting your API key directly into the "Set Maps Key" input in the application header).*

### 3. Run the Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. How to Re-Run the Data Pipeline

The data pipeline can be executed for any individual country or across all countries:

```bash
# Process all countries and build regional layers
python -m pipeline.run --country all

# Or process a single country
python -m pipeline.run --country KEN
python -m pipeline.run --country TZA
python -m pipeline.run --country UGA
python -m pipeline.run --country RWA
python -m pipeline.run --country BDI
```

### Pipeline Steps:
1. Reads raw boundary GeoJSONs from `/data/raw/<country>/`.
2. Reprojects to **Africa Albers Equal Area Conic** (`+proj=aea +lat_1=20 +lat_2=-23 +lat_0=0 +lon_0=25 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs`) to calculate exact land area in km².
3. Normalizes unit names, applies alias maps, and joins census demographics and DHS survey indicators.
4. Generates hierarchical stable IDs: `<ISO3>-L<level>-<code>` (e.g. `KEN-L1-001`, `KEN-L2-001`) with parent references (`parent_id`).
5. Simplifies geometries preserving topology for fast web loading.
6. Validates Level 1 population sums against national census totals and WorldPop baselines in `/data/processed/validation_report.json`.

---

## 5. Adding New Countries via Configuration

The system is designed for multi-country expansion. To add new countries (e.g. **South Sudan** `SSD`, **DR Congo** `COD`, **Somalia** `SOM`, **Ethiopia** `ETH`), edit [`/config/countries.yaml`](file:///d:/East%20Africa%20Demographic%20Map/config/countries.yaml):

```yaml
countries:
  SSD:
    iso3: "SSD"
    name: "South Sudan"
    official_name: "Republic of South Sudan"
    center: { lat: 6.877, lng: 31.307 }
    zoom: 6
    bounds: { south: 3.48, west: 24.14, north: 12.23, east: 35.94 }
    census:
      agency: "National Bureau of Statistics (NBS) South Sudan"
      reference_year: 2020
      national_population: 11193725
      source_name: "NBS / UNFPA Population Projections"
    dhs:
      survey_id: "SS2010SHHS"
      survey_year: 2010
      name: "South Sudan Household Survey"
    levels:
      1:
        name: "State"
        name_plural: "States"
        type: "polygon"
        feature_count: 10
        available: true
        file: "data/processed/SSD/level1.geojson"
        id_field: "id"
        name_field: "name"
        parent_id_field: null
      2:
        name: "County"
        name_plural: "Counties"
        type: "polygon"
        feature_count: 79
        available: true
        file: "data/processed/SSD/level2.geojson"
        id_field: "id"
        name_field: "name"
        parent_id_field: "parent_id"
      3:
        name: "Payam"
        name_plural: "Payams"
        type: "polygon"
        feature_count: 512
        available: true
        file: "data/processed/SSD/level3.geojson"
        id_field: "id"
        name_field: "name"
        parent_id_field: "parent_id"
      4:
        name: "Boma / Village"
        name_plural: "Bomas / Villages"
        type: "point"
        feature_count: 2000
        available: true
        is_point: true
        file: "data/processed/SSD/level4_points.geojson"
        id_field: "id"
        name_field: "name"
        parent_id_field: "parent_id"
```

---

## 6. Validation Results & Benchmarks

The automated pipeline tests census totals against official statistical publications and independent WorldPop benchmarks:

| Country | Sum Level 1 Population | Official Census Total | Census Reference | Difference | WorldPop Benchmark | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Kenya** | 47,562,772 | 47,564,296 | KNBS 2019 KPHC | **0.00%** | 47,800,000 (0.50% diff) | **PASSED** |
| **Tanzania** | 60,216,349 | 61,741,120 | NBS 2022 PHC | **2.47%** | 61,500,000 (2.09% diff) | **PASSED** |
| **Uganda** | 45,926,514 | 45,905,417 | UBOS 2024 NPHC | **0.05%** | 45,800,000 (0.28% diff) | **PASSED** |
| **Rwanda** | 13,173,730 | 13,246,394 | NISR 2022 RPHC5 | **0.55%** | 13,300,000 (0.95% diff) | **PASSED** |
| **Burundi** | 13,462,695 | 13,462,695 | ISTEEBU 2022 Proj | **0.00%** | 12,800,000 (5.18% diff) | **PASSED** |

---

## 7. Data Limitations & Comparability Notes

1. **Varying Census Reference Years:**
   * Kenya (2019), Tanzania (2022), Uganda (2024), Rwanda (2022), Burundi (2022 projections). In regional view ("All East Africa"), indicators reflect the closest available census round and DHS survey.
2. **Recent Administrative Reforms:**
   * *Burundi:* Promulgated Organic Law No. 1/05 in March 2023 reorganizing 18 provinces into 5 (Bujumbura, Burunga, Butanyerera, Gitega, Buhumuza) and 119 communes into 42. Since census baseline projections and DHS align with the 18-province structure, both are documented and mapped.
   * *Tanzania:* Songwe Region split from Mbeya Region in 2016, reflected in the 2022 census (31 regions).
   * *Uganda:* District creations have expanded the count of districts to 136–146; boundaries match COD-AB / geoBoundaries coverage.
3. **Village-Level Polygons:**
   * In Kenya, Tanzania, Uganda, and Burundi, official polygon boundaries are only publicly published down to Level 3 (Wards / Communes / Sub-counties). Level 4 is represented using verified OpenStreetMap point settlement locations rather than synthetic or fabricated polygon boundaries. Rwanda has full polygon coverage down to Level 4 (Cells / *Akagari*).
4. **Disputed Boundaries:**
   * International borders follow UN OCHA and geoBoundaries conventions with neutral labelling.

---

## 8. Data Sources, Acquisition & Open Data Policy

> [!IMPORTANT]
> **Exclusive Use of Publicly Available Open Data**  
> All spatial boundaries, census counts, health indicators, and settlement datasets utilized in this application and data pipeline were acquired **strictly and exclusively from publicly available, legally reusable open datasets**.  
> * **No Login Gates or Paywalls:** No login-protected, paywalled, or terms-restricted websites were accessed or scraped.
> * **API & Scraping Ethics:** Where programmatic fetching was performed, requests respected `robots.txt`, were non-invasive, rate-limited, and consumed documented public APIs or official public repository downloads.
> * **Open Licensing:** All datasets carry open licenses (Creative Commons CC BY 4.0 / CC BY-IGO / CC0, Open Data Commons ODbL 1.0, or national Open Government Data licenses).

---

### A. Administrative Boundary Datasets (Spatial Vectors)

| Country / Region | Level & Entity | Data Source / Agency | Platform / Access URL | License |
| :--- | :--- | :--- | :--- | :--- |
| **Regional / Global** | Levels 0, 1, 2, 3 | **geoBoundaries** (William & Mary GeoLab) & **UN OCHA COD-AB** | [geoBoundaries.org](https://www.geoboundaries.org) / [HDX](https://data.humdata.org) | CC BY 4.0 / CC BY 3.0 IGO / ODbL |
| **Kenya (`KEN`)** | L1: County (47)<br>L2: Sub-County (290)<br>L3: Ward (1,452) | Kenya National Bureau of Statistics (KNBS) / Independent Electoral and Boundaries Commission (IEBC) via UN OCHA | [HDX Kenya COD-AB](https://data.humdata.org/dataset/ken-administrative-boundaries) | CC BY-IGO / Public Domain |
| **Tanzania (`TZA`)** | L1: Region (31)<br>L2: District (170)<br>L3: Ward (3,644) | National Bureau of Statistics (NBS) Tanzania & OCGS Zanzibar via OCHA ROSA / geoBoundaries | [HDX Tanzania COD-AB](https://data.humdata.org/dataset/cod-ab-tza) | CC BY-IGO / ODbL 1.0 |
| **Uganda (`UGA`)** | L1: District (136)<br>L2: County (151)<br>L3: Sub-County (1,521) | Uganda Bureau of Statistics (UBOS) / WHO / UN OCHA | [HDX Uganda COD-AB](https://data.humdata.org/dataset/cod-ab-uga) | CC BY 3.0 IGO / Public Domain |
| **Rwanda (`RWA`)** | L1: Province (5)<br>L2: District (30)<br>L3: Sector (416)<br>L4: Cell (2,148) | National Institute of Statistics of Rwanda (NISR) / National Land Authority (NLA) | [NISR Open Data](https://www.statistics.gov.rw) / [geoBoundaries RWA](https://www.geoboundaries.org) | CC BY 4.0 / Open Data |
| **Burundi (`BDI`)** | L1: Province (18)<br>L2: Commune (119)<br>L3: Colline (2,615) | Institut de Statistiques et d'Études Économiques du Burundi (ISTEEBU) / UN OCHA | [HDX Burundi COD-AB](https://data.humdata.org/dataset/cod-ab-bdi) | CC0 / Public Domain |
| **All Countries** | Level 4 Settlements & Populated Places (Points) | **OpenStreetMap contributors** via Humanitarian OpenStreetMap Team (HOT) Export Tool | [HOT Export Tool](https://export.hotosm.org) / [OpenStreetMap](https://www.openstreetmap.org) | Open Data Commons ODbL 1.0 |

---

### B. Demographic & Population Census Sources

1. **Kenya:**
   * **Agency:** Kenya National Bureau of Statistics (KNBS)
   * **Source Publication:** *2019 Kenya Population and Housing Census (KPHC 2019)*, Volume I: *Population by County and Sub-County*; Volume II: *Distribution of Population by Age and Sex*; Volume III: *Distribution of Population by Land Area and Population Density*.
   * **Census Date:** 24th/25th August 2019 (Official National Population: 47,564,296).
   * **Access:** [KNBS Census Portal](https://www.knbs.or.ke) and [HDX Kenya Population Statistics (COD-PS)](https://data.humdata.org/dataset/kenya-population-statistics).
   * **License:** Kenya Open Data / CC BY-IGO.

2. **Tanzania:**
   * **Agency:** National Bureau of Statistics (NBS) Tanzania & Office of the Chief Government Statistician (OCGS) Zanzibar.
   * **Source Publication:** *2022 Population and Housing Census (PHC 2022) - Administrative Units Population Distribution Report*.
   * **Census Date:** 23rd August 2022 (Official National Population: 61,741,120).
   * **Access:** [NBS Tanzania Census Portal](https://www.nbs.go.tz) and [HDX Tanzania Subnational Population Statistics](https://data.humdata.org/dataset/cod-ps-tza).
   * **License:** Tanzania Open Government Data / CC BY-IGO.

3. **Uganda:**
   * **Agency:** Uganda Bureau of Statistics (UBOS).
   * **Source Publication:** *National Population and Housing Census 2024 (NPHC 2024) Preliminary Census Results* & UBOS Subnational Statistical Abstracts (2023 COD-PS baseline).
   * **Census Date:** 9th/10th May 2024 (Official Preliminary National Population: 45,905,417).
   * **Access:** [UBOS Portal](https://www.ubos.org) and [HDX Uganda Population Statistics](https://data.humdata.org/dataset/cod-ps-uga).
   * **License:** Uganda Government Open Data / CC BY-IGO.

4. **Rwanda:**
   * **Agency:** National Institute of Statistics of Rwanda (NISR).
   * **Source Publication:** *5th Rwanda Population and Housing Census (RPHC5 2022) - Final Results: Main Indicators*.
   * **Census Date:** 15th/16th August 2022 (Official National Population: 13,246,394).
   * **Access:** [NISR Census Portal](https://www.statistics.gov.rw/datasource/population-and-housing-census) and [HDX Rwanda COD-PS](https://data.humdata.org/dataset/cod-ps-rwa).
   * **License:** NISR Open Data / CC BY-IGO.

5. **Burundi:**
   * **Agency:** Institut de Statistiques et d'Études Économiques du Burundi (ISTEEBU) in collaboration with UNFPA.
   * **Source Publication:** *Projections Démographiques Annuelles au Burundi (2022 Baseline referencing RGPH-2)*.
   * **Reference Year:** 2022 (National Population: ~12,837,740 - 13,462,695).
   * **Access:** [ISTEEBU Portal](https://www.isteebu.bi) and [HDX Burundi COD-PS](https://data.humdata.org/dataset/cod-ps-bdi).
   * **License:** CC BY-IGO / Public Domain.

---

### C. Health, Wellbeing & Socio-Economic Indicators (DHS Program)

* **Agency / Provider:** The Demographic and Health Surveys (DHS) Program (USAID / ICF).
* **Service:** Official REST API (`https://api.dhsprogram.com/rest/dhs/data`).
* **License:** Public Open Access (DHS Open Data Policy, USAID).
* **Surveys Utilized:**
  * **Kenya:** *Kenya Demographic and Health Survey 2022 (KDHS 2022)*
  * **Tanzania:** *Tanzania Demographic and Health Survey and Malaria Indicator Survey 2022 (TDHS-MIS 2022)*
  * **Uganda:** *Uganda Demographic and Health Survey 2016 & 2022 (UDHS)*
  * **Rwanda:** *Rwanda Demographic and Health Survey 2019-20 (RDHS 2019-20)*
  * **Burundi:** *Troisième Enquête Démographique et de Santé du Burundi 2016-17 (EDSB-III)*
* **Harmonized Subnational Metrics Ingested:**
  * Total Fertility Rate (`FE_FRTR_W_TFR`)
  * Under-5 Child Mortality Rate per 1,000 live births (`CM_ECMR_C_U5M`)
  * Child Stunting Prevalence (`CN_NUTS_C_HA2`)
  * Facility-Based Birth Delivery Rate (`RH_DELP_C_DHF`)
  * Female Literacy Rate (`ED_LITR_W_LIT`) & Male Literacy Rate (`ED_LITR_M_LIT`)
  * Access to Improved Drinking Water (`WS_SRCE_P_IMP`)
  * Access to Improved Sanitation Facilities (`WS_TLET_P_IMP`)
  * Household Electricity Access Rate (`HC_ELEC_H_ELC`)
  * Modern Contraceptive Prevalence Rate (`FP_CUSA_W_MOD`)

---

### D. Gridded Population Rasters & Spatial Validation

* **Agency / Provider:** WorldPop Research Group (University of Southampton) & World Bank Open Data.
* **Datasets:** 1km and 100m unconstrained gridded population distribution rasters (UN-adjusted).
* **Access:** [WorldPop.org](https://www.worldpop.org) and [World Bank Open Data](https://data.worldbank.org).
* **License:** Creative Commons Attribution 4.0 International (CC BY 4.0).
* **Application:** Used for zonal cross-validation of census polygon sums and independent density benchmarking.

---

### E. Source Registry & Reproducibility Documentation

For full raw file paths, SHA checksums, data formats, and individual field dictionaries, refer to the project attribution register:
* [`data/SOURCES.md`](file:///d:/East%20Africa%20Demographic%20Map/data/SOURCES.md)
* [`STEP_1_DATA_DISCOVERY_REPORT.md`](file:///C:/Users/ibrahxbt/.gemini/antigravity/brain/ce62b777-b709-48cb-be42-8359b89e28dc/STEP_1_DATA_DISCOVERY_REPORT.md)

---

### F. Icon & Graphic Attribution

* **App Logo & Browser Favicon:**
  * <a href="https://www.flaticon.com/free-icons/africa" title="africa icons">Africa icons created by Kalashnyk - Flaticon</a>
  * Used for the application header branding, browser favicon, and apple touch icon. Licensed under Flaticon Basic License with Attribution.

