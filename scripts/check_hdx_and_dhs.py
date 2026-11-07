import requests
import json

print("=== 1. Checking HDX COD-AB & COD-PS details ===")
hdx_pkgs = [
    "kenya-subnational-administrative-boundaries",
    "kenya-population-per-county-and-sub-county-from-census-report",
    "cod-ps-ken",
    "cod-ab-tza",
    "cod-ps-tza",
    "tanzania-subnational-administrative-boundaries",
    "uganda-subnational-administrative-boundaries",
    "cod-ps-uga",
    "cod-ab-rwa",
    "cod-ps-rwa",
    "cod-ab-bdi",
    "cod-ps-bdi"
]

hdx_summary = {}
for pkg in hdx_pkgs:
    url = f"https://data.humdata.org/api/3/action/package_show?id={pkg}"
    try:
        r = requests.get(url, timeout=10)
        if r.status_code == 200:
            res = r.json()
            if res.get("success"):
                data = res["result"]
                hdx_summary[pkg] = {
                    "title": data.get("title"),
                    "license": data.get("license_title"),
                    "date": data.get("dataset_date"),
                    "resources": []
                }
                for resource in data.get("resources", []):
                    hdx_summary[pkg]["resources"].append({
                        "name": resource.get("name"),
                        "format": resource.get("format"),
                        "url": resource.get("url") or resource.get("download_url"),
                        "size": resource.get("size")
                    })
                print(f"[HDX] {pkg}: found ({len(hdx_summary[pkg]['resources'])} resources)")
            else:
                print(f"[HDX] {pkg}: not successful")
        else:
            print(f"[HDX] {pkg}: HTTP {r.status_code}")
    except Exception as e:
        print(f"[HDX] {pkg}: error {e}")

with open("hdx_summary.json", "w", encoding="utf-8") as f:
    json.dump(hdx_summary, f, indent=2)

print("\n=== 2. Testing DHS Program API ===")
# Test DHS indicators for KE, TZ, UG, RW, BU
dhs_countries = ["KE", "TZ", "UG", "RW", "BU"]
dhs_indicators = [
    "FE_FRTR_W_TFR", # Total Fertility Rate
    "CN_NUTS_C_HA2", # Stunting (% children under 5 stunted)
    "RH_DELP_C_DHF", # Delivery in health facility (%)
    "ED_LITR_W_LIT", # Female literacy rate (%)
    "WS_SRCE_P_IMP", # Improved drinking water source (%)
    "HC_ELEC_H_ELC", # Electricity access (%)
    "CM_ECMR_C_U5M"  # Under-5 mortality
]

dhs_url = f"https://api.dhsprogram.com/rest/dhs/data?countryIds={','.join(dhs_countries)}&indicatorIds={','.join(dhs_indicators)}&breakdown=subnational&selectSurveys=latest&f=json"
try:
    r = requests.get(dhs_url, timeout=15)
    if r.status_code == 200:
        dhs_data = r.json()
        data_rows = dhs_data.get("Data", [])
        print(f"DHS returned {len(data_rows)} subnational indicator rows!")
        # Sample row
        if data_rows:
            print("Sample DHS row:", json.dumps(data_rows[0], indent=2))
        with open("dhs_sample.json", "w", encoding="utf-8") as f:
            json.dump(data_rows[:50], f, indent=2)
    else:
        print(f"DHS HTTP error: {r.status_code}")
except Exception as e:
    print(f"DHS request error: {e}")


