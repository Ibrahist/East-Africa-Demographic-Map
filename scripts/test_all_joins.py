import pandas as pd
import geopandas as gpd
from pipeline.processor import normalize_name

NAME_ALIASES = {
    "KEN": {
        "tharaka": "tharaka nithi",
        "keiyo marakwet": "elgeyo marakwet",
        "marakwet": "elgeyo marakwet"
    },
    "TZA": {
        "dar es salaam": "dar es salaam",
        "mjini magharibi": "urban west",
        "kaskazini unguja": "north unguja",
        "kusini unguja": "south unguja",
        "kaskazini pemba": "north pemba",
        "kusini pemba": "south pemba"
    },
    "UGA": {
        "luwero": "luweero",
        "ssembabule": "sembabule"
    },
    "RWA": {
        "kigali city": "ville de kigali",
        "kigali": "ville de kigali",
        "city of kigali": "ville de kigali",
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

def test_country(iso, boundary_file, census_file, census_col):
    gdf = gpd.read_file(boundary_file)
    df = pd.read_csv(census_file)
    
    b_names = set(gdf['shapeName'].apply(normalize_name))
    c_names = set(df[census_col].dropna().apply(normalize_name))
    
    aliases = NAME_ALIASES.get(iso, {})
    b_mapped = {aliases.get(n, n) for n in b_names}
    
    matched = b_mapped.intersection(c_names)
    unmatched_b = b_mapped - c_names
    unmatched_c = c_names - b_mapped
    
    print(f"\n[{iso}] Match Rate: {len(matched)} / {len(b_names)} ({(len(matched)/len(b_names))*100:.1f}%)")
    if unmatched_b:
        print(f"  Unmatched boundary names: {unmatched_b}")
    if unmatched_c:
        print(f"  Unmatched census names: {unmatched_c}")

test_country("KEN", "data/raw/KEN/geoboundaries_KEN_ADM1.geojson", "data/raw/KEN/ken_admpop_adm1_2019.csv", "ADM1_NAME")
test_country("TZA", "data/raw/TZA/geoboundaries_TZA_ADM1.geojson", "data/raw/TZA/tza_admpop_adm1_2020_v2.csv", "ADM1_EN")
test_country("UGA", "data/raw/UGA/geoboundaries_UGA_ADM3.geojson", "data/raw/UGA/uga_admpop_adm2_2023.csv", "ADM2_EN")
test_country("RWA", "data/raw/RWA/geoboundaries_RWA_ADM1.geojson", "data/raw/RWA/rwa_admpop_adm1_2023.csv", "ADM1_FR")
test_country("BDI", "data/raw/BDI/geoboundaries_BDI_ADM1.geojson", "data/raw/BDI/bdi_admpop_2022_adm1_v3.csv", "ADM1_NAME")
