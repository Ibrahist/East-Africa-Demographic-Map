import os
import json
import re
import difflib
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point, Polygon, MultiPolygon
from shapely.validation import make_valid

# Standard Africa Albers Equal Area Conic projection string for equal-area metric calculations
AFRICA_ALBERS_PROJ = "+proj=aea +lat_1=20 +lat_2=-23 +lat_0=0 +lon_0=25 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs"

def normalize_name(name):
    if not isinstance(name, str):
        return ""
    n = name.strip().lower()
    # Replace special characters and extra spaces
    n = re.sub(r"['’`]", "", n)
    n = re.sub(r"[-_/]", " ", n)
    # Remove common administrative stopwords
    stopwords = ["county", "subcounty", "district", "region", "province", "commune", "ward", "sector", "cell", "city of", "city", "town", "urban", "rural"]
    words = [w for w in n.split() if w not in stopwords]
    return " ".join(words)

def compute_equal_area_km2(gdf):
    try:
        gdf_proj = gdf.to_crs(AFRICA_ALBERS_PROJ)
        return gdf_proj.geometry.area / 1_000_000.0
    except Exception as e:
        # Fallback to geodesic approximation if crs projection fails
        return gdf.geometry.to_crs(epsg=6933).area / 1_000_000.0

def load_dhs_indicators():
    path = "data/raw/regional/dhs_subnational_indicators.json"
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as f:
        records = json.load(f)
    
    # Organize by country code (2-letter) and characteristic label (subnational region name)
    dhs_map = {}
    for r in records:
        cc = r.get("DHS_CountryCode") # KE, TZ, UG, RW, BU
        region = r.get("CharacteristicLabel", "").strip()
        ind_id = r.get("IndicatorId")
        val = r.get("Value")
        if not cc or not region or val is None:
            continue
        norm_reg = normalize_name(region)
        key = (cc, norm_reg)
        if key not in dhs_map:
            dhs_map[key] = {}
        
        # Map to friendly indicator names
        if ind_id == "FE_FRTR_W_TFR":
            dhs_map[key]["total_fertility_rate"] = round(float(val), 1)
        elif ind_id == "CM_ECMR_C_U5M":
            dhs_map[key]["under_5_mortality"] = round(float(val), 1)
        elif ind_id == "CN_NUTS_C_HA2":
            dhs_map[key]["stunting_rate"] = round(float(val), 1)
        elif ind_id == "RH_DELP_C_DHF":
            dhs_map[key]["facility_births_pct"] = round(float(val), 1)
        elif ind_id == "ED_LITR_W_LIT":
            dhs_map[key]["literacy_rate"] = round(float(val), 1)
        elif ind_id == "WS_SRCE_P_IMP":
            dhs_map[key]["improved_water"] = round(float(val), 1)
        elif ind_id == "WS_TLET_P_IMP":
            dhs_map[key]["improved_sanitation"] = round(float(val), 1)
        elif ind_id == "HC_ELEC_H_ELC":
            dhs_map[key]["electricity_access"] = round(float(val), 1)
        elif ind_id == "FP_CUSA_W_MOD":
            dhs_map[key]["contraceptive_prevalence"] = round(float(val), 1)
            
    return dhs_map

print("Helper functions and DHS loader loaded.")

