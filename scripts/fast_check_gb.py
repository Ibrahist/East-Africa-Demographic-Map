import requests
import json
from concurrent.futures import ThreadPoolExecutor

COUNTRIES = ["KEN", "TZA", "UGA", "RWA", "BDI"]
LEVELS = ["ADM0", "ADM1", "ADM2", "ADM3", "ADM4"]

def check_gb(args):
    iso, lvl = args
    url = f"https://www.geoboundaries.org/api/current/gbOpen/{iso}/{lvl}/"
    try:
        r = requests.get(url, timeout=5)
        if r.status_code == 200:
            d = r.json()
            return (iso, lvl, {
                "count": d.get("boundaryCount"),
                "name": d.get("boundaryName"),
                "year": d.get("boundaryYear"),
                "geojson": d.get("gjDownloadURL"),
                "simplified": d.get("simplifiedGeometryGeoJSON")
            })
    except Exception as e:
        pass
    return (iso, lvl, None)

print("Checking geoBoundaries concurrently...", flush=True)
tasks = [(iso, lvl) for iso in COUNTRIES for lvl in LEVELS]
with ThreadPoolExecutor(max_workers=10) as executor:
    results = list(executor.map(check_gb, tasks))

gb_data = {}
for iso, lvl, res in results:
    if iso not in gb_data:
        gb_data[iso] = {}
    if res:
        gb_data[iso][lvl] = res
        print(f"[{iso}] {lvl}: {res['count']} features ({res['name']})", flush=True)

with open("data_discovery_gb.json", "w") as f:
    json.dump(gb_data, f, indent=2)

print("geoBoundaries check complete!", flush=True)

