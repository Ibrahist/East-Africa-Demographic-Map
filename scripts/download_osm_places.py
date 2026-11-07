import os
import requests
import zipfile
import io

osm_urls = {
    "KEN": "https://production-raw-data-api.s3.amazonaws.com/ISO3/KEN/populated_places/hotosm_ken_populated_places_osm_geojson.zip",
    "TZA": "https://production-raw-data-api.s3.amazonaws.com/ISO3/TZA/populated_places/hotosm_tza_populated_places_osm_geojson.zip",
    "UGA": "https://production-raw-data-api.s3.amazonaws.com/ISO3/UGA/populated_places/hotosm_uga_populated_places_osm_geojson.zip",
    "RWA": "https://production-raw-data-api.s3.amazonaws.com/ISO3/RWA/populated_places/hotosm_rwa_populated_places_osm_geojson.zip",
    "BDI": "https://production-raw-data-api.s3.amazonaws.com/ISO3/BDI/populated_places/hotosm_bdi_populated_places_osm_geojson.zip"
}

headers = {'User-Agent': 'EastAfricaDemographicResearch/1.0'}

for iso, url in osm_urls.items():
    dest_dir = f"data/raw/{iso}/osm_places"
    if os.path.exists(dest_dir) and len(os.listdir(dest_dir)) > 0:
        print(f"[{iso}] Places already downloaded in {dest_dir}")
        continue
    print(f"[{iso}] Downloading populated places: {url} ...", flush=True)
    try:
        r = requests.get(url, headers=headers, timeout=60)
        if r.status_code == 200:
            os.makedirs(dest_dir, exist_ok=True)
            with zipfile.ZipFile(io.BytesIO(r.content)) as z:
                z.extractall(dest_dir)
            print(f"  Extracted to {dest_dir} ({len(os.listdir(dest_dir))} files)")
        else:
            print(f"  Failed: HTTP {r.status_code}")
    except Exception as e:
        print(f"  Error: {e}")

print("OSM Populated Places processing finished!")

