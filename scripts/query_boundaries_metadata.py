import requests
import json

COUNTRIES = ["KEN", "TZA", "UGA", "RWA", "BDI"]
LEVELS = ["ADM1", "ADM2", "ADM3", "ADM4"]

summary = {}
for iso in COUNTRIES:
    summary[iso] = {}
    for lvl in LEVELS:
        url = f"https://www.geoboundaries.org/api/current/gbOpen/{iso}/{lvl}/"
        try:
            r = requests.get(url, timeout=10)
            if r.status_code == 200:
                d = r.json()
                summary[iso][lvl] = {
                    "canonical": d.get("boundaryCanonical"),
                    "count": d.get("admUnitCount"),
                    "license": d.get("boundaryLicense"),
                    "licenseSource": d.get("licenseDetail"),
                    "source": d.get("boundarySource"),
                    "sourceURL": d.get("boundarySourceURL"),
                    "year": d.get("boundaryYearRepresented"),
                    "gjDownloadURL": d.get("gjDownloadURL"),
                    "simplifiedGeometryGeoJSON": d.get("simplifiedGeometryGeoJSON")
                }
                print(f"{iso} {lvl}: canonical={d.get('boundaryCanonical')}, count={d.get('admUnitCount')}, license={d.get('boundaryLicense')}")
        except Exception as e:
            print(f"Error {iso} {lvl}: {e}")

with open("boundaries_metadata_summary.json", "w") as f:
    json.dump(summary, f, indent=2)

