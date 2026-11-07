import json
import urllib.request
import urllib.parse

COUNTRIES = ["KEN", "TZA", "UGA", "RWA", "BDI"]
LEVELS = ["ADM0", "ADM1", "ADM2", "ADM3", "ADM4", "ADM5"]

print("=== Checking geoBoundaries ===")
gb_results = {}
for iso in COUNTRIES:
    gb_results[iso] = {}
    for lvl in LEVELS:
        url = f"https://www.geoboundaries.org/api/current/gbOpen/{iso}/{lvl}/"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode('utf-8'))
                    gb_results[iso][lvl] = {
                        "name": data.get("boundaryName"),
                        "year": data.get("boundaryYear"),
                        "type": data.get("boundaryType"),
                        "source": data.get("boundarySource"),
                        "license": data.get("boundaryLicense"),
                        "geojson_url": data.get("gjDownloadURL"),
                        "topojson_url": data.get("tjDownloadURL"),
                        "simplified_geojson": data.get("simplifiedGeometryGeoJSON"),
                        "feature_count": data.get("boundaryCount")
                    }
                    print(f"[{iso}] {lvl}: Found! {data.get('boundaryCount')} features, {data.get('boundaryName')}")
        except Exception as e:
            # print(f"[{iso}] {lvl}: Not found or error: {e}")
            pass

print("\n=== Checking HDX COD-AB Datasets ===")
hdx_datasets = {
    "KEN": "kenya-subnational-administrative-boundaries",
    "TZA": "cod-ab-tza",
    "UGA": "uganda-subnational-administrative-boundaries",
    "RWA": "cod-ab-rwa",
    "BDI": "cod-ab-bdi"
}

hdx_results = {}
for iso, pkg_id in hdx_datasets.items():
    url = f"https://data.humdata.org/api/3/action/package_show?id={pkg_id}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if data.get("success"):
                result = data["result"]
                hdx_results[iso] = {
                    "title": result.get("title"),
                    "license": result.get("license_title"),
                    "dataset_date": result.get("dataset_date"),
                    "resources": []
                }
                for res in result.get("resources", []):
                    fmt = res.get("format", "").upper()
                    name = res.get("name")
                    download_url = res.get("download_url") or res.get("url")
                    hdx_results[iso]["resources"].append({
                        "name": name,
                        "format": fmt,
                        "url": download_url,
                        "size": res.get("size")
                    })
                print(f"[{iso}] HDX COD-AB found: {result.get('title')}, {len(hdx_results[iso]['resources'])} resources")
    except Exception as e:
        print(f"[{iso}] HDX error: {e}")

with open("data_discovery_boundaries.json", "w", encoding="utf-8") as f:
    json.dump({"geoboundaries": gb_results, "hdx": hdx_results}, f, indent=2)

print("\nSaved discovery data to data_discovery_boundaries.json")

