import os
import requests
import json
import time

HEADERS = {
    'User-Agent': 'EastAfricaDemographicResearch/1.0 (GIS research pipeline)'
}

def download_file(url, target_path, skip_if_exists=True):
    if skip_if_exists and os.path.exists(target_path) and os.path.getsize(target_path) > 0:
        print(f"Already exists: {target_path} ({os.path.getsize(target_path)} bytes)")
        return True
    print(f"Downloading: {url} -> {target_path} ...", flush=True)
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    try:
        r = requests.get(url, headers=HEADERS, timeout=60, stream=True)
        if r.status_code == 200:
            with open(target_path, 'wb') as f:
                for chunk in r.iter_content(chunk_size=65536):
                    f.write(chunk)
            print(f"  Saved {target_path} ({os.path.getsize(target_path)} bytes)")
            time.sleep(0.5)
            return True
        else:
            print(f"  Failed: HTTP {r.status_code}")
            return False
    except Exception as e:
        print(f"  Error downloading {url}: {e}")
        return False

# Load discovery metadata
with open("boundaries_metadata_summary.json", "r") as f:
    gb_meta = json.load(f)

for iso, levels in gb_meta.items():
    print(f"\n--- Downloading boundaries for {iso} ---")
    for lvl, meta in levels.items():
        # Download geojson
        gj_url = meta.get("gjDownloadURL")
        simp_url = meta.get("simplifiedGeometryGeoJSON")
        
        if gj_url:
            target = f"data/raw/{iso}/geoboundaries_{iso}_{lvl}.geojson"
            download_file(gj_url, target)
        if simp_url:
            target_simp = f"data/raw/{iso}/geoboundaries_{iso}_{lvl}_simplified.geojson"
            download_file(simp_url, target_simp)

print("\nBoundaries download completed!")

