import { CountryConfig, IndicatorConfig, IndicatorCategory } from "./types";

export const REGION_CONFIG = {
  name: "All East Africa",
  code: "EAF",
  center: { lat: -0.5, lng: 34.5 },
  zoom: 5,
  bounds: { south: -11.75, west: 28.8, north: 5.5, east: 41.9 },
  harmonized_level: 1,
  reference_notes: "Reference years differ across countries: Kenya 2019, Tanzania 2022, Uganda 2024, Rwanda 2022, Burundi 2022. Health indicators from DHS 2016-2022."
};

export const COUNTRIES: Record<string, CountryConfig> = {
  KEN: {
    iso3: "KEN",
    name: "Kenya",
    official_name: "Republic of Kenya",
    center: { lat: 0.5, lng: 37.5 },
    zoom: 6,
    bounds: { south: -4.7, west: 33.9, north: 4.65, east: 41.9 },
    census: {
      agency: "Kenya National Bureau of Statistics (KNBS)",
      reference_year: 2019,
      previous_year: 2009,
      national_population: 47564296,
      source_name: "2019 Kenya Population & Housing Census"
    },
    dhs: {
      survey_id: "KE2022DHS",
      survey_year: 2022,
      name: "Kenya Demographic and Health Survey 2022"
    },
    levels: {
      1: {
        name: "County",
        name_plural: "Counties",
        type: "polygon",
        feature_count: 47,
        available: true,
        file: "/data/processed/KEN/level1.geojson",
        id_field: "id",
        name_field: "name",
        parent_id_field: null
      },
      2: {
        name: "Sub-County",
        name_plural: "Sub-Counties",
        type: "polygon",
        feature_count: 290,
        available: true,
        file: "/data/processed/KEN/level2.geojson",
        id_field: "id",
        name_field: "name",
        parent_id_field: "parent_id"
      },
      3: {
        name: "Ward",
        name_plural: "Wards",
        type: "polygon",
        feature_count: 1452,
        available: true,
        file: "/data/processed/KEN/level3.geojson",
        id_field: "id",
        name_field: "name",
        parent_id_field: "parent_id"
      },
      4: {
        name: "Village / Settlement",
        name_plural: "Villages / Settlements",
        type: "point",
        feature_count: 3002,
        available: true,
        is_point: true,
        file: "/data/processed/KEN/level4_points.geojson",
        id_field: "id",
        name_field: "name",
        parent_id_field: "parent_id",
        notes: "Village-level features are point settlements from OpenStreetMap."
      }
    }
  },
  TZA: {
    iso3: "TZA",
    name: "Tanzania",
    official_name: "United Republic of Tanzania",
    center: { lat: -6.369, lng: 34.888 },
    zoom: 6,
    bounds: { south: -11.75, west: 29.3, north: -0.98, east: 40.5 },
    census: {
      agency: "National Bureau of Statistics (NBS)",
      reference_year: 2022,
      previous_year: 2012,
      national_population: 61741120,
      source_name: "2022 Population and Housing Census (PHC)"
    },
    dhs: {
      survey_id: "TZ2022DHS",
      survey_year: 2022,
      name: "Tanzania Demographic and Health Survey 2022"
    },
    levels: {
      1: {
        name: "Region",
        name_plural: "Regions",
        type: "polygon",
        feature_count: 30,
        available: true,
        file: "/data/processed/TZA/level1.geojson",
        id_field: "id",
        name_field: "name",
        parent_id_field: null
      },
      2: {
        name: "District",
        name_plural: "Districts",
        type: "polygon",
        feature_count: 170,
        available: true,
        file: "/data/processed/TZA/level2.geojson",
        id_field: "id",
        name_field: "name",
        parent_id_field: "parent_id"
      },
      3: {
        name: "Ward",
        name_plural: "Wards",
        type: "polygon",
        feature_count: 3644,
        available: true,
        file: "/data/processed/TZA/level3.geojson",
        id_field: "id",
        name_field: "name",
        parent_id_field: "parent_id"
      },
      4: {
        name: "Village / Mtaa",
        name_plural: "Villages / Mitaa",
        type: "point",
        feature_count: 3001,
        available: true,
        is_point: true,
        file: "/data/processed/TZA/level4_points.geojson",
        id_field: "id",
        name_field: "name",
        parent_id_field: "parent_id",
        notes: "Village and Mtaa units are represented as point settlements from OpenStreetMap."
      }
    }
  },
  UGA: {
    iso3: "UGA",
    name: "Uganda",
    official_name: "Republic of Uganda",
    center: { lat: 1.373, lng: 32.290 },
    zoom: 7,
    bounds: { south: -1.48, west: 29.57, north: 4.23, east: 35.0 },
    census: {
      agency: "Uganda Bureau of Statistics (UBOS)",
      reference_year: 2024,
      previous_year: 2014,
      national_population: 45905417,
      source_name: "National Population & Housing Census 2024 (Preliminary)"
    },
    dhs: {
      survey_id: "UG2016DHS",
      survey_year: 2016,
      name: "Uganda Demographic and Health Survey"
    },
    levels: {
      1: {
        name: "District",
        name_plural: "Districts",
        type: "polygon",
        feature_count: 136,
        available: true,
        file: "/data/processed/UGA/level1.geojson",
        id_field: "id",
        name_field: "name",
        parent_id_field: null
      },
      2: {
        name: "County / Constituency",
        name_plural: "Counties / Constituencies",
        type: "polygon",
        feature_count: 151,
        available: true,
        file: "/data/processed/UGA/level2.geojson",
        id_field: "id",
        name_field: "name",
        parent_id_field: "parent_id"
      },
      3: {
        name: "Sub-county / Division",
        name_plural: "Sub-counties / Divisions",
        type: "polygon",
        feature_count: 1521,
        available: true,
        file: "/data/processed/UGA/level3.geojson",
        id_field: "id",
        name_field: "name",
        parent_id_field: "parent_id"
      },
      4: {
        name: "Parish / Village",
        name_plural: "Parishes / Villages",
        type: "point",
        feature_count: 3002,
        available: true,
        is_point: true,
        file: "/data/processed/UGA/level4_points.geojson",
        id_field: "id",
        name_field: "name",
        parent_id_field: "parent_id",
        notes: "Parish and village features are represented as point settlements from OpenStreetMap."
      }
    }
  },
  RWA: {
    iso3: "RWA",
    name: "Rwanda",
    official_name: "Republic of Rwanda",
    center: { lat: -1.94, lng: 29.87 },
    zoom: 8,
    bounds: { south: -2.84, west: 28.86, north: -1.05, east: 30.9 },
    census: {
      agency: "National Institute of Statistics of Rwanda (NISR)",
      reference_year: 2022,
      previous_year: 2012,
      national_population: 13246394,
      source_name: "Fifth Rwanda Population and Housing Census (RPHC5 2022)"
    },
    dhs: {
      survey_id: "RW2019DHS",
      survey_year: 2020,
      name: "Rwanda Demographic and Health Survey 2019-20"
    },
    levels: {
      1: {
        name: "Province (Intara)",
        name_plural: "Provinces",
        type: "polygon",
        feature_count: 5,
        available: true,
        file: "/data/processed/RWA/level1.geojson",
        id_field: "id",
        name_field: "name",
        parent_id_field: null
      },
      2: {
        name: "District (Akarere)",
        name_plural: "Districts",
        type: "polygon",
        feature_count: 30,
        available: true,
        file: "/data/processed/RWA/level2.geojson",
        id_field: "id",
        name_field: "name",
        parent_id_field: "parent_id"
      },
      3: {
        name: "Sector (Umurenge)",
        name_plural: "Sectors",
        type: "polygon",
        feature_count: 416,
        available: true,
        file: "/data/processed/RWA/level3.geojson",
        id_field: "id",
        name_field: "name",
        parent_id_field: "parent_id"
      },
      4: {
        name: "Cell (Akagari)",
        name_plural: "Cells",
        type: "polygon",
        feature_count: 2148,
        available: true,
        file: "/data/processed/RWA/level4.geojson",
        id_field: "id",
        name_field: "name",
        parent_id_field: "parent_id",
        notes: "Full polygon coverage down to Cell (Level 4)."
      }
    }
  },
  BDI: {
    iso3: "BDI",
    name: "Burundi",
    official_name: "Republic of Burundi",
    center: { lat: -3.37, lng: 29.91 },
    zoom: 8,
    bounds: { south: -4.47, west: 29.0, north: -2.3, east: 30.85 },
    census: {
      agency: "Institut de Statistiques et d'Études Économiques du Burundi (ISTEEBU)",
      reference_year: 2022,
      previous_year: 2008,
      national_population: 13462695,
      source_name: "Projections Démographiques ISTEEBU"
    },
    dhs: {
      survey_id: "BU2016DHS",
      survey_year: 2016,
      name: "Enquête Démographique et de Santé du Burundi 2016-17"
    },
    levels: {
      1: {
        name: "Province",
        name_plural: "Provinces",
        type: "polygon",
        feature_count: 18,
        available: true,
        file: "/data/processed/BDI/level1.geojson",
        id_field: "id",
        name_field: "name",
        parent_id_field: null,
        notes: "Historical 18 provinces matching ISTEEBU census baseline and DHS."
      },
      2: {
        name: "Commune",
        name_plural: "Communes",
        type: "polygon",
        feature_count: 119,
        available: true,
        file: "/data/processed/BDI/level2.geojson",
        id_field: "id",
        name_field: "name",
        parent_id_field: "parent_id"
      },
      3: {
        name: "Colline / Quartier",
        name_plural: "Collines / Quartiers",
        type: "polygon",
        feature_count: 2615,
        available: true,
        file: "/data/processed/BDI/level3.geojson",
        id_field: "id",
        name_field: "name",
        parent_id_field: "parent_id"
      },
      4: {
        name: "Village / Sous-colline",
        name_plural: "Villages / Sous-collines",
        type: "point",
        feature_count: 1592,
        available: true,
        is_point: true,
        file: "/data/processed/BDI/level4_points.geojson",
        id_field: "id",
        name_field: "name",
        parent_id_field: "parent_id"
      }
    }
  }
};

export const CATEGORIES: IndicatorCategory[] = [
  { id: "population_structure", label: "Population & Structure" },
  { id: "growth_migration", label: "Growth & Migration" },
  { id: "health_wellbeing", label: "Health & Wellbeing" },
  { id: "education_economy", label: "Education & Economy" }
];

export const INDICATORS: Record<string, IndicatorConfig> = {
  total_population: {
    id: "total_population",
    label: "Total Population",
    category: "population_structure",
    unit: "people",
    format: "integer",
    color_palette: "Blues",
    description: "Total resident population count according to official national census and projections.",
    comparable_east_africa: true,
    reference_note: "Reference years: Kenya 2019, Tanzania 2022, Uganda 2024, Rwanda 2022, Burundi 2022."
  },
  population_density: {
    id: "population_density",
    label: "Population Density",
    category: "population_structure",
    unit: "people/km²",
    format: "float_1",
    color_palette: "YlOrRd",
    description: "Number of people per square kilometer of land area, calculated using equal-area geometry (Africa Albers Equal Area Conic).",
    comparable_east_africa: true,
    reference_note: "Calculated with EPSG:102022 (Africa Albers Equal Area Conic)."
  },
  sex_ratio: {
    id: "sex_ratio",
    label: "Sex Ratio (Males per 100 Females)",
    category: "population_structure",
    unit: "males per 100 females",
    format: "float_1",
    color_palette: "Purples",
    description: "Ratio of male population to female population multiplied by 100.",
    comparable_east_africa: true,
    reference_note: "Standard demographic indicator across all 5 censuses."
  },
  pct_under_15: {
    id: "pct_under_15",
    label: "% Children Under 15",
    category: "population_structure",
    unit: "%",
    format: "percent_1",
    color_palette: "Teals",
    description: "Percentage of the population aged 0 to 14 years, reflecting youth dependency.",
    comparable_east_africa: true,
    reference_note: "Derived from 5-year census age cohort aggregation."
  },
  pct_65_plus: {
    id: "pct_65_plus",
    label: "% Elderly (Age 65+)",
    category: "population_structure",
    unit: "%",
    format: "percent_1",
    color_palette: "YlOrBr",
    description: "Percentage of the population aged 65 years and older, reflecting old-age dependency.",
    comparable_east_africa: true,
    reference_note: "Derived from census age cohorts 65+."
  },
  avg_household_size: {
    id: "avg_household_size",
    label: "Average Household Size",
    category: "population_structure",
    unit: "persons/household",
    format: "float_1",
    color_palette: "Greens",
    description: "Average number of usual residents per private household.",
    comparable_east_africa: true,
    reference_note: "Kenya: 3.9 (2019), Tanzania: 4.3 (2022), Rwanda: 4.0 (2022), Uganda: 4.5, Burundi: 4.8."
  },
  number_of_households: {
    id: "number_of_households",
    label: "Number of Households",
    category: "population_structure",
    unit: "households",
    format: "integer",
    color_palette: "Blues",
    description: "Total count of enumerated private households.",
    comparable_east_africa: false,
    reference_note: "Available for Kenya, Tanzania, Rwanda."
  },
  intercensal_growth_rate: {
    id: "intercensal_growth_rate",
    label: "Intercensal Growth Rate (%/yr)",
    category: "growth_migration",
    unit: "%/year",
    format: "percent_1",
    color_palette: "Viridis",
    description: "Average annual population growth rate between the last two census rounds.",
    comparable_east_africa: true,
    reference_note: "Kenya 2009-2019 (2.2%), Tanzania 2012-2022 (3.2%), Uganda 2014-2024 (2.9%), Rwanda 2012-2022 (2.3%), Burundi 2008-2022 (2.8%)."
  },
  urban_share: {
    id: "urban_share",
    label: "Urban Population Share (%)",
    category: "growth_migration",
    unit: "%",
    format: "percent_1",
    color_palette: "PuRd",
    description: "Percentage of the population residing in gazetted urban centers or cities.",
    comparable_east_africa: false,
    reference_note: "National urban definitions vary between countries."
  },
  total_fertility_rate: {
    id: "total_fertility_rate",
    label: "Total Fertility Rate (TFR)",
    category: "health_wellbeing",
    unit: "children/woman",
    format: "float_1",
    color_palette: "OrRd",
    description: "Average number of children that would be born to a woman over her childbearing years.",
    comparable_east_africa: true,
    reference_note: "Source: DHS Program (KDHS 2022, TDHS 2022, UDHS 2016, RDHS 2020, BDHS 2016)."
  },
  under_5_mortality: {
    id: "under_5_mortality",
    label: "Under-5 Mortality Rate",
    category: "health_wellbeing",
    unit: "deaths / 1,000 live births",
    format: "float_1",
    color_palette: "Reds",
    description: "Probability of dying before reaching age 5 per 1,000 live births.",
    comparable_east_africa: true,
    reference_note: "Source: DHS Program subnational indicators."
  },
  stunting_rate: {
    id: "stunting_rate",
    label: "Child Stunting Rate (% < -2 SD)",
    category: "health_wellbeing",
    unit: "%",
    format: "percent_1",
    color_palette: "YlOrRd",
    description: "Percentage of children under age 5 whose height-for-age is below -2 SD.",
    comparable_east_africa: true,
    reference_note: "Source: DHS Program nutrition surveys."
  },
  facility_births_pct: {
    id: "facility_births_pct",
    label: "Facility-Based Deliveries (%)",
    category: "health_wellbeing",
    unit: "%",
    format: "percent_1",
    color_palette: "YlGn",
    description: "Percentage of live births occurring in a designated health facility.",
    comparable_east_africa: true,
    reference_note: "Source: DHS maternal health modules."
  },
  contraceptive_prevalence: {
    id: "contraceptive_prevalence",
    label: "Modern Contraceptive Prevalence (%)",
    category: "health_wellbeing",
    unit: "%",
    format: "percent_1",
    color_palette: "PuBu",
    description: "Percentage of married women aged 15-49 using modern contraception.",
    comparable_east_africa: true,
    reference_note: "Source: DHS family planning indicators."
  },
  literacy_rate: {
    id: "literacy_rate",
    label: "Adult Literacy Rate (%)",
    category: "education_economy",
    unit: "%",
    format: "percent_1",
    color_palette: "Blues",
    description: "Percentage of adult population able to read and write with understanding.",
    comparable_east_africa: true,
    reference_note: "DHS & Census reports: KDHS 2022, TDHS 2022, UBOS 2024 (74%), RDHS 2020, BDHS 2016."
  },
  electricity_access: {
    id: "electricity_access",
    label: "Electricity Access (% households)",
    category: "education_economy",
    unit: "%",
    format: "percent_1",
    color_palette: "YlOrBr",
    description: "Percentage of households connected to electricity.",
    comparable_east_africa: true,
    reference_note: "Source: DHS household characteristics & national censuses."
  },
  improved_water: {
    id: "improved_water",
    label: "Improved Water Source (% access)",
    category: "education_economy",
    unit: "%",
    format: "percent_1",
    color_palette: "YlGnBu",
    description: "Percentage of population with access to improved drinking water source.",
    comparable_east_africa: true,
    reference_note: "Source: DHS Program."
  },
  improved_sanitation: {
    id: "improved_sanitation",
    label: "Improved Sanitation (% access)",
    category: "education_economy",
    unit: "%",
    format: "percent_1",
    color_palette: "Greens",
    description: "Percentage of population using improved toilet/latrine facilities.",
    comparable_east_africa: true,
    reference_note: "Source: DHS Program."
  }
};

