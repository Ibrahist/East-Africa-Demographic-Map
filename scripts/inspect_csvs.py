import pandas as pd
import glob
import os

files = [
    "data/raw/KEN/ken_admpop_adm1_2019.csv",
    "data/raw/TZA/tza_admpop_adm1_2020_v2.csv",
    "data/raw/TZA/tza_admpop_adm2_2020_v2.csv",
    "data/raw/UGA/uga_admpop_adm1_2023.csv",
    "data/raw/UGA/uga_admpop_adm2_2023.csv",
    "data/raw/RWA/rwa_admpop_adm1_2023.csv",
    "data/raw/RWA/rwa_admpop_adm2_2023.csv",
    "data/raw/RWA/rwa_admpop_adm3_2023.csv",
    "data/raw/BDI/bdi_admpop_2022_adm1_v3.csv",
    "data/raw/BDI/bdi_admpop_2022_adm2_v3.csv"
]

for f in files:
    if os.path.exists(f):
        df = pd.read_csv(f)
        print(f"\n=== {f} ===")
        print(f"Shape: {df.shape}")
        print(f"Columns: {list(df.columns)}")
        print(df.head(2).to_dict(orient='records'))
    else:
        print(f"Not found: {f}")

