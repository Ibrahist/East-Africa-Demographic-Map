export interface LevelConfig {
  name: string;
  name_plural: string;
  type: "polygon" | "point";
  feature_count: number;
  available: boolean;
  is_point?: boolean;
  file: string;
  id_field: string;
  name_field: string;
  parent_id_field: string | null;
  notes?: string;
}

export interface CountryConfig {
  iso3: string;
  name: string;
  official_name: string;
  center: { lat: number; lng: number };
  zoom: number;
  bounds: { south: number; west: number; north: number; east: number };
  census: {
    agency: string;
    reference_year: number;
    previous_year: number;
    national_population: number;
    source_name: string;
  };
  dhs: {
    survey_id: string;
    survey_year: number;
    name: string;
  };
  levels: Record<number, LevelConfig>;
}

export interface IndicatorConfig {
  id: string;
  label: string;
  category: "population_structure" | "growth_migration" | "health_wellbeing" | "education_economy";
  unit: string;
  format: "integer" | "float_1" | "percent_1";
  color_palette: string;
  description: string;
  comparable_east_africa: boolean;
  reference_note: string;
}

export interface IndicatorCategory {
  id: string;
  label: string;
}

export interface FeatureProperties {
  id: string;
  name: string;
  country_iso3: string;
  country_name: string;
  level: number;
  level_name: string;
  parent_id: string | null;
  parent_name?: string;
  reference_year?: number;
  source?: string;
  area_km2?: number;
  total_population?: number;
  population_density?: number;
  sex_ratio?: number;
  pct_under_15?: number;
  pct_65_plus?: number;
  avg_household_size?: number;
  number_of_households?: number;
  intercensal_growth_rate?: number;
  urban_share?: number;
  total_fertility_rate?: number;
  under_5_mortality?: number;
  stunting_rate?: number;
  facility_births_pct?: number;
  contraceptive_prevalence?: number;
  literacy_rate?: number;
  electricity_access?: number;
  improved_water?: number;
  improved_sanitation?: number;
  is_point?: boolean;
  place_type?: string;
  [key: string]: any;
}

export interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  properties: FeatureProperties | null;
  value: number | null | undefined;
  rankInCountry?: number;
  totalInCountry?: number;
  rankInDisplayed?: number;
  totalDisplayed?: number;
}

export interface LegendBreak {
  color: string;
  min: number;
  max: number;
  label: string;
}

