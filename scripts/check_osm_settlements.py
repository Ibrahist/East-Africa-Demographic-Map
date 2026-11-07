import requests

countries = {
    "KEN": "hotosm_ken_populated_places",
    "TZA": "hotosm_tza_populated_places",
    "UGA": "hotosm_uga_populated_places",
    "RWA": "hotosm_rwa_populated_places",
    "BDI": "hotosm_bdi_populated_places"
}

for iso, pkg_name in countries.items():
    url = f"https://data.humdata.org/api/3/action/package_show?id={pkg_name}"
    try:
        r = requests.get(url, timeout=10)
        if r.status_code == 200:
            res = r.json().get("result", {})
            print(f"[{iso}] Found: {res.get('title')}")
            for rsc in res.get("resources", []):
                name = rsc.get("name", "")
                fmt = rsc.get("format", "")
                if "points" in name.lower() or "geojson" in fmt.lower() or "csv" in fmt.lower():
                    print(f"   - {name} ({fmt}, {rsc.get('size')} bytes): {rsc.get('download_url') or rsc.get('url')}")
        else:
            print(f"[{iso}] {pkg_name} HTTP {r.status_code}")
    except Exception as e:
        print(f"[{iso}] Error: {e}")

