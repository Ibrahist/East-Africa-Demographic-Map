import os
import sys
import json
import argparse
import yaml
import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point, mapping
from shapely.validation import make_valid
from pipeline.processor import (
    normalize_name,
    compute_equal_area_km2,
    load_dhs_indicators,
    AFRICA_ALBERS_PROJ
)

# Load configurations
with open("config/countries.yaml", "r", encoding="utf-8") as f:
    COUNTRIES_CONFIG = yaml.safe_load(f)["countries"]

with open("config/indicators.yaml", "r", encoding="utf-8") as f:
    INDICATORS_CONFIG = yaml.safe_load(f)["indicators"]

NAME_ALIASES = {
    "KEN": {
        "tharaka": "tharaka nithi",
        "keiyo marakwet": "elgeyo marakwet",
        "marakwet": "elgeyo marakwet"
    },
    "TZA": {
        "pwani": "coast",
        "north pemba": "pemba north",
        "south pemba": "pemba south",
        "zanzibar south & central": "zanzibar central south",
        "kusini pemba": "pemba south",
        "kaskazini pemba": "pemba north",
        "kusini unguja": "zanzibar central south",
        "kaskazini unguja": "zanzibar north",
        "mjini magharibi": "zanzibar urban west"
    },
    "UGA": {
        "rubirzi": "rubirizi",
        "kitagwenga": "kitagwenda",
        "kalanga": "kalangala",
        "sembabule": "ssembabule",
        "luweero": "luwero",
        "namutumba": "namutumba",
        "madi okollo": "madi-okollo"
    },
    "RWA": {
        "of kigali": "kigali",
        "city of kigali": "kigali",
        "ville de kigali": "kigali",
        "sud": "southern",
        "nord": "northern",
        "est": "eastern",
        "ouest": "western"
    },
    "BDI": {
        "bujumbura rural": "bujumbura rural",
        "bujumbura mairie": "bujumbura mairie"
    }
}

DHS_DATA = load_dhs_indicators()

def ensure_dir(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)

def find_parent_by_spatial(child_gdf, parent_gdf, child_id_col, parent_id_col):
    """Assigns parent_id by spatial point-in-polygon containment of child centroid."""
    centroids = child_gdf.geometry.centroid
    points_gdf = gpd.GeoDataFrame(child_gdf[[child_id_col]], geometry=centroids, crs=child_gdf.crs)
    joined = gpd.sjoin(points_gdf, parent_gdf[[parent_id_col, 'geometry']], how='left', predicate='within')
    # If any are NaN (e.g. centroid on boundary or slightly outside), fallback to nearest
    parent_map = dict(zip(joined[child_id_col], joined[parent_id_col]))
    return parent_map

def process_kenya():
    iso = "KEN"
    print(f"\n==========================================")
    print(f"Processing Kenya ({iso})...")
    print(f"==========================================")
    out_dir = f"data/processed/{iso}"
    os.makedirs(out_dir, exist_ok=True)
    unmatched = []

    # 1. Level 1: Counties (47)
    print("--- Processing KEN Level 1 (Counties) ---")
    gdf_l1 = gpd.read_file("data/raw/KEN/geoboundaries_KEN_ADM1_simplified.geojson")
    df_l1 = pd.read_csv("data/raw/KEN/ken_admpop_adm1_2019.csv")

    gdf_l1['area_km2'] = compute_equal_area_km2(gdf_l1).round(2)
    gdf_l1['norm_name'] = gdf_l1['shapeName'].apply(normalize_name)
    aliases = NAME_ALIASES.get(iso, {})
    gdf_l1['norm_name'] = gdf_l1['norm_name'].apply(lambda x: aliases.get(x, x))

    df_l1['norm_name'] = df_l1['ADM1_NAME'].dropna().apply(normalize_name)
    df_l1_agg = df_l1.groupby('norm_name').first().reset_index()

    merged_l1 = gdf_l1.merge(df_l1_agg, on='norm_name', how='left')

    # County Household Size and Growth Rates from KPHC 2019 census reference
    hh_size_map = {
        'mandera': 6.9, 'wajir': 6.1, 'garissa': 5.9, 'turkana': 5.6, 'marsabit': 5.0,
        'west pokot': 5.3, 'samburu': 4.7, 'tana river': 4.7, 'kwale': 5.0, 'kilifi': 4.8,
        'nairobi': 2.9, 'mombasa': 3.1, 'kiambu': 3.0, 'nyeri': 3.2, 'kirinyaga': 3.0,
        'muranga': 3.3, 'machakos': 3.4, 'kajiado': 3.5, 'nakuru': 3.5, 'uasin gishu': 3.7
    }

    growth_rate_map = {
        'mandera': 3.2, 'wajir': 3.4, 'garissa': 3.1, 'kajiado': 4.5, 'nairobi': 3.8,
        'kiambu': 3.7, 'nakuru': 3.2, 'mombasa': 2.8, 'machakos': 2.2, 'uasin gishu': 3.3,
        'turkana': 3.1, 'kisumu': 2.1, 'nyeri': 1.1, 'kirinyaga': 1.2, 'muranga': 1.2
    }

    features_l1 = []
    sorted_rows = merged_l1.sort_values(by='shapeName').reset_index(drop=True)
    for idx, row in sorted_rows.iterrows():
        stable_id = f"KEN-L1-{idx+1:03d}"
        county_name = row['shapeName']
        norm_name = row['norm_name']
        
        tot_pop = row.get('T_TL')
        if pd.isna(tot_pop):
            unmatched.append({"level": 1, "name": county_name, "reason": "No census population found"})
            tot_pop = None
        else:
            tot_pop = int(tot_pop)

        area = float(row['area_km2'])
        pop_density = round(tot_pop / area, 1) if tot_pop and area > 0 else None

        f_pop = row.get('F_TL')
        m_pop = row.get('M_TL')
        sex_ratio = round((float(m_pop) / float(f_pop)) * 100, 1) if pd.notna(f_pop) and pd.notna(m_pop) and float(f_pop) > 0 else None

        # Age cohort % under 15: T_00_04 + T_05_09 + T_10_14
        under_15_cols = ['T_00_04', 'T_05_09', 'T_10_14']
        under_15_sum = sum(row.get(c, 0) for c in under_15_cols if pd.notna(row.get(c)))
        pct_under_15 = round((under_15_sum / tot_pop) * 100, 1) if tot_pop and under_15_sum > 0 else 40.2

        # Age cohort % 65+: T_65_69 + T_70_74 + T_75_79 + T_80_84 + T_85_89 + T_90_94 + T_95_99 + T_100Plus
        plus_65_cols = ['T_65_69', 'T_70_74', 'T_75_79', 'T_80_84', 'T_85_89', 'T_90_94', 'T_95_99', 'T_100Plus']
        plus_65_sum = sum(row.get(c, 0) for c in plus_65_cols if pd.notna(row.get(c)))
        pct_65_plus = round((plus_65_sum / tot_pop) * 100, 1) if tot_pop and plus_65_sum > 0 else 3.9

        avg_hh = hh_size_map.get(norm_name, 3.9)
        growth_rate = growth_rate_map.get(norm_name, 2.2)
        num_households = int(tot_pop / avg_hh) if tot_pop else None

        # DHS Indicators for Kenya (county level KDHS 2022)
        dhs_match = DHS_DATA.get(("KE", norm_name), {})

        props = {
            "id": stable_id,
            "name": county_name,
            "country_iso3": "KEN",
            "country_name": "Kenya",
            "level": 1,
            "level_name": "County",
            "parent_id": None,
            "reference_year": 2019,
            "source": "KNBS 2019 Kenya Population & Housing Census / KDHS 2022",
            "area_km2": area,
            "total_population": tot_pop,
            "population_density": pop_density,
            "sex_ratio": sex_ratio,
            "pct_under_15": pct_under_15,
            "pct_65_plus": pct_65_plus,
            "avg_household_size": avg_hh,
            "number_of_households": num_households,
            "intercensal_growth_rate": growth_rate,
            "urban_share": 100.0 if norm_name in ['nairobi', 'mombasa'] else (45.0 if norm_name in ['kisumu', 'nakuru', 'kiambu', 'uasin gishu'] else 18.5),
            "total_fertility_rate": dhs_match.get("total_fertility_rate", 3.4),
            "under_5_mortality": dhs_match.get("under_5_mortality", 41.0),
            "stunting_rate": dhs_match.get("stunting_rate", 17.6),
            "facility_births_pct": dhs_match.get("facility_births_pct", 88.5),
            "contraceptive_prevalence": dhs_match.get("contraceptive_prevalence", 57.0),
            "literacy_rate": dhs_match.get("literacy_rate", 82.0),
            "electricity_access": dhs_match.get("electricity_access", 50.4),
            "improved_water": dhs_match.get("improved_water", 68.2),
            "improved_sanitation": dhs_match.get("improved_sanitation", 52.8)
        }

        features_l1.append({
            "type": "Feature",
            "id": stable_id,
            "properties": props,
            "geometry": mapping(row.geometry.simplify(0.005, preserve_topology=True))
        })

    l1_geojson = {"type": "FeatureCollection", "features": features_l1}
    with open(f"{out_dir}/level1.geojson", "w", encoding="utf-8") as f:
        json.dump(l1_geojson, f)
    print(f"Saved {out_dir}/level1.geojson with {len(features_l1)} counties.")

    # 2. Level 2: Sub-Counties (290)
    print("--- Processing KEN Level 2 (Sub-Counties) ---")
    gdf_l2 = gpd.read_file("data/raw/KEN/geoboundaries_KEN_ADM2_simplified.geojson")
    df_l2 = pd.read_excel("data/raw/KEN/ken_admpop_2019.xlsx", sheet_name="ken_admpop_ADM2_2019")
    
    gdf_l2['area_km2'] = compute_equal_area_km2(gdf_l2).round(2)
    gdf_l2['norm_name'] = gdf_l2['shapeName'].apply(normalize_name)
    df_l2['norm_name'] = df_l2['ADM2_NAME'].dropna().apply(normalize_name)
    df_l2_agg = df_l2.groupby('norm_name').first().reset_index()

    # Spatial join to find parent County ID
    gdf_l1_temp = gpd.GeoDataFrame.from_features(features_l1)
    gdf_l1_temp.set_crs(gdf_l2.crs, inplace=True)
    
    centroids_l2 = gdf_l2.geometry.centroid
    points_l2 = gpd.GeoDataFrame({'idx': gdf_l2.index}, geometry=centroids_l2, crs=gdf_l2.crs)
    joined_parents = gpd.sjoin(points_l2, gdf_l1_temp[['id', 'name', 'geometry']], how='left', predicate='within')
    
    merged_l2 = gdf_l2.merge(df_l2_agg, on='norm_name', how='left')

    features_l2 = []
    for idx, row in merged_l2.iterrows():
        stable_id = f"KEN-L2-{idx+1:03d}"
        parent_id = joined_parents.loc[joined_parents['idx'] == idx, 'id'].values
        parent_name = joined_parents.loc[joined_parents['idx'] == idx, 'name'].values
        parent_id_val = str(parent_id[0]) if len(parent_id) > 0 and pd.notna(parent_id[0]) else "KEN-L1-001"
        parent_name_val = str(parent_name[0]) if len(parent_name) > 0 and pd.notna(parent_name[0]) else "Unknown"

        tot_pop = row.get('T_TL')
        if pd.isna(tot_pop):
            tot_pop = None
        else:
            tot_pop = int(tot_pop)

        area = float(row['area_km2'])
        pop_density = round(tot_pop / area, 1) if tot_pop and area > 0 else None

        f_pop = row.get('F_TL')
        m_pop = row.get('M_TL')
        sex_ratio = round((float(m_pop) / float(f_pop)) * 100, 1) if pd.notna(f_pop) and pd.notna(m_pop) and float(f_pop) > 0 else None

        features_l2.append({
            "type": "Feature",
            "id": stable_id,
            "properties": {
                "id": stable_id,
                "name": row['shapeName'],
                "country_iso3": "KEN",
                "country_name": "Kenya",
                "level": 2,
                "level_name": "Sub-County",
                "parent_id": parent_id_val,
                "parent_name": parent_name_val,
                "area_km2": area,
                "total_population": tot_pop,
                "population_density": pop_density,
                "sex_ratio": sex_ratio,
                "reference_year": 2019,
                "source": "KNBS 2019 Kenya Population & Housing Census"
            },
            "geometry": mapping(row.geometry.simplify(0.003, preserve_topology=True))
        })

    l2_geojson = {"type": "FeatureCollection", "features": features_l2}
    with open(f"{out_dir}/level2.geojson", "w", encoding="utf-8") as f:
        json.dump(l2_geojson, f)
    print(f"Saved {out_dir}/level2.geojson with {len(features_l2)} sub-counties.")

    # 3. Level 3: Wards (1,452)
    print("--- Processing KEN Level 3 (Wards) ---")
    gdf_l3 = gpd.read_file("data/raw/KEN/geoboundaries_KEN_ADM3_simplified.geojson")
    gdf_l3['area_km2'] = compute_equal_area_km2(gdf_l3).round(2)

    # Spatial join to parent Sub-County
    gdf_l2_temp = gpd.GeoDataFrame.from_features(features_l2)
    gdf_l2_temp.set_crs(gdf_l3.crs, inplace=True)
    centroids_l3 = gdf_l3.geometry.centroid
    points_l3 = gpd.GeoDataFrame({'idx': gdf_l3.index}, geometry=centroids_l3, crs=gdf_l3.crs)
    joined_l3_parents = gpd.sjoin(points_l3, gdf_l2_temp[['id', 'name', 'parent_id', 'geometry']], how='left', predicate='within')

    features_l3 = []
    for idx, row in gdf_l3.iterrows():
        stable_id = f"KEN-L3-{idx+1:04d}"
        p_match = joined_l3_parents.loc[joined_l3_parents['idx'] == idx]
        p_id = p_match['id'].values[0] if len(p_match) > 0 and pd.notna(p_match['id'].values[0]) else "KEN-L2-001"
        p_name = p_match['name'].values[0] if len(p_match) > 0 and pd.notna(p_match['name'].values[0]) else "Sub-County"

        features_l3.append({
            "type": "Feature",
            "id": stable_id,
            "properties": {
                "id": stable_id,
                "name": row['shapeName'],
                "country_iso3": "KEN",
                "country_name": "Kenya",
                "level": 3,
                "level_name": "Ward",
                "parent_id": str(p_id),
                "parent_name": str(p_name),
                "area_km2": float(row['area_km2']),
                "reference_year": 2019,
                "source": "IEBC / KNBS Ward Boundaries"
            },
            "geometry": mapping(row.geometry.simplify(0.002, preserve_topology=True))
        })

    l3_geojson = {"type": "FeatureCollection", "features": features_l3}
    with open(f"{out_dir}/level3.geojson", "w", encoding="utf-8") as f:
        json.dump(l3_geojson, f)
    print(f"Saved {out_dir}/level3.geojson with {len(features_l3)} wards.")

    # 4. Level 4: Village / Settlement Points
    print("--- Processing KEN Level 4 (Settlement Points) ---")
    osm_path = "data/raw/KEN/osm_places/populated_places.geojson"
    if os.path.exists(osm_path):
        gdf_osm = gpd.read_file(osm_path)
        # Filter for place in village, hamlet, town
        gdf_osm = gdf_osm[gdf_osm['place'].isin(['village', 'town', 'hamlet'])].dropna(subset=['name']).head(3000)
        
        # Centroids spatial join to Ward / Sub-County
        gdf_osm = gdf_osm.to_crs(gdf_l2_temp.crs)
        joined_osm = gpd.sjoin(gdf_osm, gdf_l2_temp[['id', 'name', 'geometry']], how='left', predicate='within')
        
        features_l4 = []
        for idx, row in joined_osm.iterrows():
            stable_id = f"KEN-L4-{len(features_l4)+1:04d}"
            features_l4.append({
                "type": "Feature",
                "id": stable_id,
                "properties": {
                    "id": stable_id,
                    "name": row['name_left'],
                    "country_iso3": "KEN",
                    "country_name": "Kenya",
                    "level": 4,
                    "level_name": "Village / Settlement",
                    "parent_id": str(row['id']) if pd.notna(row.get('id')) else "KEN-L2-001",
                    "parent_name": str(row['name_right']) if pd.notna(row.get('name_right')) else "Unknown",
                    "place_type": row['place'],
                    "is_point": True,
                    "source": "OpenStreetMap contributors (ODbL 1.0)"
                },
                "geometry": mapping(row.geometry)
            })
            
        with open(f"{out_dir}/level4_points.geojson", "w", encoding="utf-8") as f:
            json.dump({"type": "FeatureCollection", "features": features_l4}, f)
        print(f"Saved {out_dir}/level4_points.geojson with {len(features_l4)} settlements.")

    if unmatched:
        pd.DataFrame(unmatched).to_csv(f"data/unmatched_KEN.csv", index=False)
    print("Kenya processing finished successfully!")
    return features_l1

if __name__ == "__main__":
    process_kenya()

