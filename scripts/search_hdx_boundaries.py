import requests

def search_hdx(q):
    url = f"https://data.humdata.org/api/3/action/package_search?q={q}&rows=5"
    r = requests.get(url, timeout=10)
    if r.status_code == 200:
        results = r.json()["result"]["results"]
        print(f"\n--- Search results for '{q}' ---")
        for pkg in results:
            print(f"- {pkg['name']}: {pkg['title']}")
            for res in pkg.get("resources", []):
                fmt = res.get("format", "")
                if any(x in fmt.lower() for x in ["shp", "geojson", "gdb", "csv", "xlsx"]):
                    print(f"    * [{fmt}] {res.get('name')}: {res.get('download_url') or res.get('url')}")

search_hdx("kenya administrative boundaries cod-ab")
search_hdx("uganda administrative boundaries cod-ab")

