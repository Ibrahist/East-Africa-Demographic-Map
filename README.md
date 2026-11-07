# East Africa Demographic Choropleth Map

An interactive, high-performance choropleth web mapping application visualizing administrative hierarchies and public census demographics across East Africa (**Kenya**, **Tanzania**, **Uganda**, **Rwanda**, and **Burundi**), built with **Next.js**, **TypeScript**, and the **Google Maps JavaScript API** Data layer.

---

## 1. Features & Architecture

* **Dual Rendering Engine:**
  * **Engine 1 (Google Maps JS API):** Renders high-performance vector polygons on Google Maps Roadmap, Dark, or Satellite hybrid imagery via the Data layer (`map.data.addGeoJson` / `map.data.setStyle`).
  * **Engine 2 (Instant SVG Vector Choropleth):** True conformal equirectangular projection with cosine latitude compensation that works right out of the box with zero setup or API key requirement. Includes drag pan, scroll wheel zoom, and view reset.
* **GitHub Primer Design System:**
  * Authentic GitHub Light and Dark themes with one-click header switcher and automatic system preference detection.
  * Styled with GitHub Primer design tokens, borders, badges, cards, buttons, and custom scrollbars.
* **Google Sans Flex Typography:**
  * Beautiful variable optical-sizing typography applied globally across all UI components, controls, tables, and tooltips.
  * Maps Country → Level 1 → Level 2 → Level 3 → Level 4 (Settlements/Points), while displaying country-specific official names (e.g. *County* in Kenya, *Region* in Tanzania, *District* in Uganda, *Province* in Rwanda and Burundi).
* **Multi-Country & Regional Modes:**
  * Toggle between individual country views or **"All East Africa"** for unified cross-border comparison.
* **Interactive Choropleth Styling:**
  * Real-time vector classification using **Quantile**, **Natural Breaks**, or **Equal Interval** methods.
  * Color-blind safe palettes (Viridis, Cividis, YlOrRd, YlGnBu, Blues, Purples, Greens, Plasma).
  * Opacity slider and dark/light/satellite base map canvases.
* **Rich Spatial Interaction:**
  * **Hover Tooltip:** Shows administrative unit name, parent entity, indicator value with unit, population, area, sex ratio, census reference year, rank within country, and rank within displayed set.
  * **Click-to-Drill-Down:** Clicking any unit zooms in and lazy-loads the next administrative level filtered by that parent unit.
  * **Global Search:** Fast autocomplete search across any county, region, district, or ward in East Africa.
  * **Breadcrumbs:** Breadcrumb trail (`All East Africa > Country > Level 1 > Level 2`) for intuitive navigation back up the tree.
* **Data Export:**
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

## 8. Data Licences & Attribution

* **Boundaries:** geoBoundaries (ODbL 1.0 / CC BY 4.0 / Public Domain), UN OCHA COD-AB (CC BY-IGO).
* **Demographics:** KNBS Kenya, NBS Tanzania, UBOS Uganda, NISR Rwanda, ISTEEBU Burundi.
* **Health & Wellbeing:** The DHS Program (USAID / ICF) REST API (`https://api.dhsprogram.com`).
* **Settlements:** OpenStreetMap contributors via Humanitarian OpenStreetMap Team (ODbL 1.0).
* Full source registry and download URLs available in [`/data/SOURCES.md`](file:///d:/East%20Africa%20Demographic%20Map/data/SOURCES.md).

