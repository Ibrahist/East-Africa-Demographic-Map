import json

files = {
    "KEN_L1": "data/raw/KEN/geoboundaries_KEN_ADM1.geojson",
    "KEN_L2": "data/raw/KEN/geoboundaries_KEN_ADM2.geojson",
    "KEN_L3": "data/raw/KEN/geoboundaries_KEN_ADM3.geojson",
    "TZA_L1": "data/raw/TZA/geoboundaries_TZA_ADM1.geojson",
    "TZA_L2": "data/raw/TZA/geoboundaries_TZA_ADM2.geojson",
    "UGA_L1": "data/raw/UGA/geoboundaries_UGA_ADM3.geojson", # Remember ADM3 has 137 Districts
    "UGA_L2": "data/raw/UGA/geoboundaries_UGA_ADM2.geojson", # 151 Counties
    "RWA_L1": "data/raw/RWA/geoboundaries_RWA_ADM1.geojson",
    "RWA_L2": "data/raw/RWA/geoboundaries_RWA_ADM2.geojson",
    "RWA_L3": "data/raw/RWA/geoboundaries_RWA_ADM3.geojson",
    "BDI_L1": "data/raw/BDI/geoboundaries_BDI_ADM1.geojson",
    "BDI_L2": "data/raw/BDI/geoboundaries_BDI_ADM2.geojson"
}

for k, path in files.items():
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            features = data.get("features", [])
            print(f"[{k}] {len(features)} features")
            if features:
                props = features[0].get("properties", {})
                print(f"   Sample props: {props}")
    except Exception as e:
        print(f"[{k}] Error: {e}")

