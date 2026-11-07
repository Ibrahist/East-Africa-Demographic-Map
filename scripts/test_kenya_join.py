import pandas as pd
import geopandas as gpd
from pipeline.processor import normalize_name, compute_equal_area_km2, load_dhs_indicators

# Load boundaries
gdf_l1 = gpd.read_file("data/raw/KEN/geoboundaries_KEN_ADM1.geojson")
print(f"Kenya L1 boundaries: {len(gdf_l1)} rows")

# Load KNBS Census L1
df_ken_l1 = pd.read_csv("data/raw/KEN/ken_admpop_adm1_2019.csv")
print(f"Kenya Census L1 table: {len(df_ken_l1)} rows")

# Deduplicate if multiple age breakdowns or filter
print("df_ken_l1 unique ADM1_NAME:", df_ken_l1['ADM1_NAME'].dropna().unique())

# Check match between boundary shapeName and Census ADM1_NAME
b_names = set(gdf_l1['shapeName'].apply(normalize_name))
c_names = set(df_ken_l1['ADM1_NAME'].dropna().apply(normalize_name))

matched = b_names.intersection(c_names)
unmatched_b = b_names - c_names
unmatched_c = c_names - b_names

print(f"Matched count: {len(matched)} / {len(b_names)}")
print(f"Unmatched boundaries: {unmatched_b}")
print(f"Unmatched census: {unmatched_c}")

