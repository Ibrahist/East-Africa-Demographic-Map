# Data Sources & Attribution Register: East Africa Administrative & Demographic Data

This register documents all public data sources collected for Kenya, Tanzania, Uganda, Rwanda, and Burundi in accordance with Open Data principles, humanitarian standards (UN OCHA / IASC), and national statistics offices.

---

## 1. Administrative Boundaries (Spatial Vector Data)

### Regional & Multi-Country
* **Provider:** geoBoundaries (William & Mary GeoLab) / UN OCHA / OpenStreetMap
* **License:** Open Data Commons Open Database License (ODbL) / Creative Commons Attribution (CC BY 4.0 / CC BY 3.0 IGO) / Public Domain
* **Citation:** Runfola, D. et al. (2020) *geoBoundaries: A global database of political administrative boundaries*. PLoS ONE 15(4): e0231866.
* **Access URL:** https://www.geoboundaries.org/api.html
* **Coverage:** Level 0 (National), Level 1, Level 2, Level 3, and Level 4 where available.

### Kenya (KEN)
* **Official Hierarchy:** Level 1: County (47) → Level 2: Sub-County / Constituency (290) → Level 3: Ward (1,452) → Level 4: Village / Settlement Points (OSM).
* **Boundary Sources:**
  - `geoBoundaries-KEN-ADM1`: 47 Counties. Source: KNBS / Survey of Kenya. License: Public Domain / CC BY 4.0.
  - `geoBoundaries-KEN-ADM2`: 290 Sub-counties. Source: IEBC / KNBS via UN OCHA. License: CC BY 3.0 IGO.
  - `geoBoundaries-KEN-ADM3`: 1,452 Wards. Source: Independent Electoral and Boundaries Commission (IEBC) / Red Cross. License: CC BY 4.0.
  - `hotosm_ken_populated_places`: Populated places & villages (points). Source: OpenStreetMap contributors via Humanitarian OpenStreetMap Team (HOT). License: ODbL 1.0.

### Tanzania (TZA)
* **Official Hierarchy:** Level 1: Region / Mkoa (31) → Level 2: District / Wilaya (170-195) → Level 3: Ward / Kata (3,644) → Level 4: Village / Mtaa / Kitongoji (Points).
* **Boundary Sources:**
  - `geoBoundaries-TZA-ADM1`: 30-31 Regions (incorporating Songwe Region created in 2016). Source: National Bureau of Statistics (NBS). License: ODbL / CC BY 3.0 IGO.
  - `geoBoundaries-TZA-ADM2`: 170 Districts / Local Government Councils. Source: NBS / OCHA ROSA. License: CC BY 3.0 IGO.
  - `geoBoundaries-TZA-ADM3`: 3,644 Wards (Kata). Source: NBS Tanzania / OpenStreetMap contributors. License: ODbL 1.0.
  - `hotosm_tza_populated_places`: Populated places & villages (points). Source: OpenStreetMap contributors via HOT. License: ODbL 1.0.

### Uganda (UGA)
* **Official Hierarchy:** Level 1: District (135–146) → Level 2: County / Constituency (151) → Level 3: Sub-county / Division (1,521) → Level 4: Parish / Village Points.
* **Hierarchy Verification Note:** In Uganda's Constitution and Local Government Act (Cap 243), the primary subnational governance tier is the **District (LC5)**. Uganda also has 4 Statistical Regions (Central, Eastern, Northern, Western) used by UBOS and DHS for statistical aggregation.
* **Boundary Sources:**
  - `geoBoundaries-UGA-ADM1`: 4 Statistical Regions. Source: UBOS. License: ODbL.
  - `geoBoundaries-UGA-ADM2 / ADM3`: 137–151 Districts and Counties. Source: UBOS / WHO / OCHA. License: Public Domain / CC BY 3.0 IGO.
  - `geoBoundaries-UGA-ADM4`: 1,521 Sub-counties / Town Councils / Municipal Divisions. Source: UBOS / OCHA. License: CC BY 3.0 IGO.
  - `hotosm_uga_populated_places`: Populated places & villages (points). Source: OpenStreetMap contributors via HOT. License: ODbL 1.0.

### Rwanda (RWA)
* **Official Hierarchy:** Level 1: Province / Intara (5) → Level 2: District / Akarere (30) → Level 3: Sector / Umurenge (416) → Level 4: Cell / Akagari (2,148) → Level 5: Village / Umudugudu (~14,837 points).
* **Boundary Sources:**
  - `geoBoundaries-RWA-ADM1`: 5 Provinces (Kigali City, Eastern, Northern, Southern, Western). Source: National Institute of Statistics of Rwanda (NISR). License: CC BY 4.0.
  - `geoBoundaries-RWA-ADM2`: 30 Districts. Source: NISR. License: CC BY 4.0.
  - `geoBoundaries-RWA-ADM3`: 416 Sectors. Source: NISR. License: CC BY 4.0.
  - `geoBoundaries-RWA-ADM4`: 2,148 Cells. Source: NISR. License: CC BY 4.0.
  - `hotosm_rwa_populated_places`: Populated places & villages (points). Source: OpenStreetMap contributors via HOT. License: ODbL 1.0.

### Burundi (BDI)
* **Official Hierarchy:** Level 1: Province (18 historic / 5 post-2023) → Level 2: Commune (119 historic / 42 post-2023) → Level 3: Zone (462) → Level 4: Colline / Quartier (2,615–3,067).
* **Administrative Reform Note:** Burundi promulgated Organic Law No. 1/05 in March 2023 reorganizing 18 provinces into 5 (Bujumbura, Burunga, Butanyerera, Gitega, Buhumuza) and 119 communes into 42. Because demographic census projections (ISTEEBU) and DHS surveys align with the 18-province / 119-commune baseline, both representations are referenced and harmonized.
* **Boundary Sources:**
  - `geoBoundaries-BDI-ADM1`: 18 Provinces. Source: ISTEEBU / OCHA. License: CC0 / Public Domain.
  - `geoBoundaries-BDI-ADM2`: 119 Communes. Source: ISTEEBU / OCHA. License: Public Domain.
  - `geoBoundaries-BDI-ADM3`: 2,615 Collines. Source: ISTEEBU / OCHA. License: Public Domain.
  - `hotosm_bdi_populated_places`: Populated places & villages (points). Source: OpenStreetMap contributors via HOT. License: ODbL 1.0.

---

## 2. Demographic & Census Data (Tabular & Indicator Sources)

### Kenya: KNBS 2019 Kenya Population and Housing Census (KPHC 2019)
* **Institution:** Kenya National Bureau of Statistics (KNBS)
* **Publication Date:** November 2019 (Volumes I, II, III, IV)
* **Reference Year:** 2019 (Census Night: 24th/25th August 2019)
* **License:** Creative Commons Attribution for Intergovernmental Organisations (CC BY-IGO) / Government Open Data
* **National Population:** 47,564,296
* **Metrics Provided:** Total population, female population, male population, intersex, household count, average household size, land area (sq km), population density (pop/km²), urban/rural breakdown, 5-year age-cohorts (0-4 to 100+), intercensal growth rate (2009–2019).
* **Files:** `data/raw/KEN/ken_admpop_adm1_2019.csv`, `data/raw/KEN/ken_admpop_2019.xlsx`

### Tanzania: NBS 2022 Population and Housing Census (PHC 2022) & Projections
* **Institution:** National Bureau of Statistics (NBS) Tanzania & Office of the Chief Government Statistician (OCGS) Zanzibar
* **Publication Date:** 2022–2023
* **Reference Year:** 2022 (Census Night: 23rd August 2022) / 2020 COD-PS baseline
* **License:** CC BY-IGO / Open Data Commons
* **National Population:** 61,741,120 (2022 PHC)
* **Metrics Provided:** Total population, sex breakdown (male, female), age structure cohorts, average household size, population density, intercensal growth rate (2012–2022: 3.2% annual growth).
* **Files:** `data/raw/TZA/tza_admpop_adm1_2020_v2.csv`, `data/raw/TZA/tza_admpop_adm2_2020_v2.csv`, `data/raw/TZA/tza_gazetteer.xlsx`

### Uganda: UBOS National Population and Housing Census 2024 & Baseline
* **Institution:** Uganda Bureau of Statistics (UBOS)
* **Publication Date:** June / September 2024 (Preliminary Census Results) & 2023 COD-PS baseline
* **Reference Year:** 2024 (Census Night: 9th/10th May 2024) / 2023 COD-PS
* **License:** CC BY-IGO / Government Open Data
* **National Population:** 45,905,417 (2024 NPHC official preliminary count)
* **Metrics Provided:** Total population, female and male counts, age cohort breakdown, population density, intercensal growth rate (2014–2024: 2.9% annual growth), proportion under 18 (~50%), literacy rate (74%).
* **Files:** `data/raw/UGA/uga_admpop_adm1_2023.csv`, `data/raw/UGA/uga_admpop_adm2_2023.csv`, `data/raw/UGA/uga_admpop_2023.xlsx`

### Rwanda: NISR 5th Population and Housing Census (RPHC5 2022)
* **Institution:** National Institute of Statistics of Rwanda (NISR)
* **Publication Date:** February 2023
* **Reference Year:** 2022 (Census Night: 15th/16th August 2022)
* **License:** CC BY-IGO / NISR Open Data
* **National Population:** 13,246,394
* **Metrics Provided:** Total population, male and female counts, age cohort breakdown, population density (503 people/km²), average annual intercensal growth rate (2012–2022: 2.3%), disaggregated down to Sector level (Level 3).
* **Files:** `data/raw/RWA/rwa_admpop_adm1_2023.csv`, `data/raw/RWA/rwa_admpop_adm2_2023.csv`, `data/raw/RWA/rwa_admpop_adm3_2023.csv`, `data/raw/RWA/rwa_admpop_2022.xlsx`

### Burundi: ISTEEBU Projections Démographiques & Recensement Général
* **Institution:** Institut de Statistiques et d'Études Économiques du Burundi (ISTEEBU) / UNFPA
* **Publication Date:** 2022 / 2023
* **Reference Year:** 2022 (Projections baseline referencing RGPH-2)
* **License:** CC BY-IGO / Public Domain
* **National Population:** ~12,837,740 (2022 baseline)
* **Metrics Provided:** Total population, male and female totals, age cohorts, population density, disaggregated across all 18 provinces and 119 communes.
* **Files:** `data/raw/BDI/bdi_admpop_2022_adm1_v3.csv`, `data/raw/BDI/bdi_admpop_2022_adm2_v3.csv`, `data/raw/BDI/bdi_admpop_2022_v2.xlsx`

---

## 3. Cross-Country Health, Wellbeing & Socio-Economic Indicators: The DHS Program

* **Provider:** The Demographic and Health Surveys (DHS) Program (USAID / ICF)
* **API Service:** `https://api.dhsprogram.com/rest/dhs/data`
* **License:** Open Access Public Data (DHS Open Data Policy)
* **Surveys Included:**
  - Kenya: Kenya Demographic and Health Survey (KDHS 2022)
  - Tanzania: Tanzania Demographic and Health Survey and Malaria Indicator Survey (TDHS-MIS 2022)
  - Uganda: Uganda Demographic and Health Survey (UDHS 2016 / 2022)
  - Rwanda: Rwanda Demographic and Health Survey (RDHS 2019–20)
  - Burundi: Enquête Démographique et de Santé du Burundi (EDSB-III 2016–17)
* **Harmonized Indicators Available at Level 1:**
  - `FE_FRTR_W_TFR`: Total Fertility Rate (children per woman aged 15-49)
  - `CM_ECMR_C_U5M`: Under-5 Mortality Rate (deaths per 1,000 live births)
  - `CN_NUTS_C_HA2`: Stunting (% children under 5 who are stunted, height-for-age < -2 SD)
  - `RH_DELP_C_DHF`: Facility-Based Births (% of live births delivered in a health facility)
  - `ED_LITR_W_LIT`: Female Literacy Rate (% women aged 15-49 who are literate)
  - `ED_LITR_M_LIT`: Male Literacy Rate (% men aged 15-49 who are literate)
  - `WS_SRCE_P_IMP`: Improved Drinking Water Source (% population with access to improved water)
  - `WS_TLET_P_IMP`: Improved Sanitation Facility (% population with access to improved toilet/latrine)
  - `HC_ELEC_H_ELC`: Electricity Access (% of households with electricity)
  - `FP_CUSA_W_MOD`: Modern Contraceptive Prevalence Rate (% married women using modern contraception)
* **File:** `data/raw/regional/dhs_subnational_indicators.json` (1,251 subnational records)

---

## 4. Gridded Population Data: WorldPop & World Bank

* **Provider:** WorldPop Research Group (University of Southampton) & World Bank Data
* **License:** Creative Commons Attribution 4.0 International (CC BY 4.0)
* **Access URL:** https://www.worldpop.org / https://data.humdata.org
* **Methodology:** High-resolution (1km and 100m) unconstrained dasymetric redistribution using random forest machine learning, calibrated to UN population division estimates.
* **Use in Pipeline:** Provides independent cross-validation for census polygon totals and consistent cross-country density baselines.

