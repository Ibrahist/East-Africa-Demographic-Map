import os
import json
import glob

COUNTRIES = ["KEN", "TZA", "UGA", "RWA", "BDI"]

def partition_country_levels(iso):
    base_dir = f"data/processed/{iso}"
    for lvl in [2, 3, 4]:
        file_path = f"{base_dir}/level{lvl}.geojson"
        if not os.path.exists(file_path):
            continue
        
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            features = data.get("features", [])
            
        by_parent = {}
        for feat in features:
            pid = feat.get("properties", {}).get("parent_id")
            if not pid or pid == "None":
                pid = "root"
            if pid not in by_parent:
                by_parent[pid] = []
            by_parent[pid].append(feat)
            
        part_dir = f"{base_dir}/level{lvl}_by_parent"
        os.makedirs(part_dir, exist_ok=True)
        
        for pid, feats in by_parent.items():
            fc = {
                "type": "FeatureCollection",
                "parent_id": pid,
                "feature_count": len(feats),
                "features": feats
            }
            with open(f"{part_dir}/{pid}.geojson", "w", encoding="utf-8") as out_f:
                json.dump(fc, out_f)
                
        print(f"[{iso}] Partitioned Level {lvl} into {len(by_parent)} parent files in {part_dir}")

if __name__ == "__main__":
    for iso in COUNTRIES:
        partition_country_levels(iso)
    print("\nPartitioning completed successfully!")

