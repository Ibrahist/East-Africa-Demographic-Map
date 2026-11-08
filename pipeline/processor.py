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
    # Remove leading dots from DHS / census tables
    n = re.sub(r"^\.+", "", n).strip()
    # Remove parenthetical notes e.g. "(since 2016)"
    n = re.sub(r"\(.*?\)", "", n).strip()
    # Replace special characters and extra spaces
    n = re.sub(r"['’`]", "", n)
    n = re.sub(r"[-_/]", " ", n)
    # Remove common administrative stopwords
    stopwords = ["county", "subcounty", "sub-county", "district", "region", "province", "commune", "ward", "sector", "cell", "city", "of", "town", "urban", "rural"]
    words = [w for w in n.split() if w not in stopwords]
    return " ".join(words)

def compute_equal_area_km2(gdf):
    try:
        gdf_proj = gdf.to_crs(AFRICA_ALBERS_PROJ)
        return gdf_proj.geometry.area / 1_000_000.0
    except Exception as e:
        # Fallback to geodesic approximation if crs projection fails
        return gdf.geometry.to_crs(epsg=6933).area / 1_000_000.0

# Sub-region mapping for Uganda's 136 districts to DHS survey clusters
UG_DISTRICT_TO_SUBREGION = {
    'kampala': 'kampala',
    'bukomansimbi': 'south buganda', 'butambala': 'south buganda', 'gomba': 'south buganda',
    'kalangala': 'south buganda', 'kalanga': 'south buganda', 'kalungu': 'south buganda',
    'kyotera': 'south buganda', 'lwengo': 'south buganda', 'lyantonde': 'south buganda',
    'masaka': 'south buganda', 'mpigi': 'south buganda', 'rakai': 'south buganda',
    'sembabule': 'south buganda', 'ssembabule': 'south buganda', 'wakiso': 'south buganda',
    'buikwe': 'north buganda', 'buvuma': 'north buganda', 'kayunga': 'north buganda',
    'kiboga': 'north buganda', 'kyankwanzi': 'north buganda', 'luwero': 'north buganda',
    'luweero': 'north buganda', 'mityana': 'north buganda', 'mubende': 'north buganda',
    'kassanda': 'north buganda', 'mukono': 'north buganda', 'nakaseke': 'north buganda',
    'nakasongola': 'north buganda',
    'bugiri': 'busoga', 'bugweri': 'busoga', 'buyende': 'busoga', 'iganga': 'busoga',
    'jinja': 'busoga', 'kaliro': 'busoga', 'kamuli': 'busoga', 'luuka': 'busoga',
    'mayuge': 'busoga', 'namayingo': 'busoga', 'namutumba': 'busoga',
    'budaka': 'bukedi', 'busia': 'bukedi', 'butaleja': 'bukedi', 'butebo': 'bukedi',
    'kibuku': 'bukedi', 'pallisa': 'bukedi', 'tororo': 'bukedi',
    'bududa': 'bugisu/elgon', 'bulambuli': 'bugisu/elgon', 'manafwa': 'bugisu/elgon',
    'mbale': 'bugisu/elgon', 'namisindwa': 'bugisu/elgon', 'sironko': 'bugisu/elgon',
    'kapchorwa': 'bugisu/elgon', 'kween': 'bugisu/elgon', 'bukwo': 'bugisu/elgon',
    'amuria': 'teso', 'bukedea': 'teso', 'kaberamaido': 'teso', 'kalaki': 'teso',
    'kapelebyong': 'teso', 'katakwi': 'teso', 'kumi': 'teso', 'ngora': 'teso',
    'serere': 'teso', 'soroti': 'teso',
    'abim': 'karamoja', 'amudat': 'karamoja', 'kaabong': 'karamoja', 'karenga': 'karamoja',
    'kotido': 'karamoja', 'moroto': 'karamoja', 'nabilatuk': 'karamoja',
    'nakapiripirit': 'karamoja', 'napak': 'karamoja',
    'alebtong': 'lango', 'amolatar': 'lango', 'apac': 'lango', 'dokolo': 'lango',
    'kole': 'lango', 'kwania': 'lango', 'lira': 'lango', 'otuke': 'lango', 'oyam': 'lango',
    'agago': 'acholi', 'amuru': 'acholi', 'gulu': 'acholi', 'kitgum': 'acholi',
    'lamwo': 'acholi', 'nwoya': 'acholi', 'omoro': 'acholi', 'pader': 'acholi',
    'adjumani': 'west nile', 'arua': 'west nile', 'koboko': 'west nile',
    'madi-okollo': 'west nile', 'madi okollo': 'west nile', 'maracha': 'west nile',
    'moyo': 'west nile', 'nebbi': 'west nile', 'obongi': 'west nile',
    'pakwach': 'west nile', 'terego': 'west nile', 'yumbe': 'west nile', 'zombo': 'west nile',
    'buliisa': 'bunyoro', 'hoima': 'bunyoro', 'kagadi': 'bunyoro', 'kakumiro': 'bunyoro',
    'kibaale': 'bunyoro', 'kikuube': 'bunyoro', 'kiryandongo': 'bunyoro', 'masindi': 'bunyoro',
    'bundibugyo': 'tooro', 'bunyangabu': 'tooro', 'kabarole': 'tooro', 'kamwenge': 'tooro',
    'kasese': 'tooro', 'kitagwenda': 'tooro', 'kitagwenga': 'tooro', 'kyenjojo': 'tooro',
    'kyegegwa': 'tooro', 'ntoroko': 'tooro',
    'buhweju': 'ankole', 'bushenyi': 'ankole', 'ibanda': 'ankole', 'isingiro': 'ankole',
    'kazo': 'ankole', 'kiruhura': 'ankole', 'mbarara': 'ankole', 'mitooma': 'ankole',
    'ntungamo': 'ankole', 'rubirizi': 'ankole', 'rubirzi': 'ankole', 'rwampara': 'ankole',
    'sheema': 'ankole',
    'kabale': 'kigezi', 'kanungu': 'kigezi', 'kisoro': 'kigezi', 'rubanda': 'kigezi',
    'rukiga': 'kigezi', 'rukungiri': 'kigezi'
}

DHS_ALIASES = {
    ('KE', 'tharaka'): 'tharaka nithi',
    ('KE', 'elgeyo marakwet'): 'elgeyo marakwet',
    ('KE', 'keiyo marakwet'): 'elgeyo marakwet',
    ('TZ', 'mbeya'): 'mbeya',
    ('TZ', 'pwani'): 'pwani',
    ('TZ', 'coast'): 'pwani',
    ('TZ', 'north pemba'): 'kaskazini pemba',
    ('TZ', 'south pemba'): 'kusini pemba',
    ('TZ', 'pemba north'): 'kaskazini pemba',
    ('TZ', 'pemba south'): 'kusini pemba',
    ('TZ', 'zanzibar north'): 'kaskazini unguja',
    ('TZ', 'zanzibar south central'): 'kusini unguja',
    ('TZ', 'zanzibar central south'): 'kusini unguja',
    ('TZ', 'zanzibar west'): 'mjini magharibi',
    ('TZ', 'zanzibar urban west'): 'mjini magharibi',
    ('RW', 'east'): 'eastern',
    ('RW', 'eastern'): 'eastern',
    ('RW', 'north'): 'northern',
    ('RW', 'northern'): 'northern',
    ('RW', 'south'): 'southern',
    ('RW', 'southern'): 'southern',
    ('RW', 'west'): 'western',
    ('RW', 'western'): 'western',
    ('RW', 'kigali'): 'kigali',
    ('BU', 'karuzi'): 'karusi',
    ('BU', 'karusi'): 'karusi'
}

def load_dhs_indicators():
    path = "data/raw/regional/dhs_subnational_indicators.json"
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as f:
        records = json.load(f)
    
    dhs_map = {}
    for r in records:
        cc = r.get("DHS_CountryCode") # KE, TZ, UG, RW, BU
        region = r.get("CharacteristicLabel", "").strip()
        ind_id = r.get("IndicatorId")
        val = r.get("Value")
        if not cc or not region or val is None:
            continue
        norm_reg = normalize_name(region)
        # Apply alias
        norm_reg = DHS_ALIASES.get((cc, norm_reg), norm_reg)
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

print("Helper functions, Uganda district subregion map, and DHS loader loaded.")
