import os
import requests
import json
import time

HEADERS = {
    'User-Agent': 'EastAfricaDemographicResearch/1.0 (Demographic research pipeline)'
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
            print(f"  Saved {target_path} ({os.path.getsize(target_path)} bytes)", flush=True)
            time.sleep(0.5)
            return True
        else:
            print(f"  Failed: HTTP {r.status_code}", flush=True)
            return False
    except Exception as e:
        print(f"  Error downloading {url}: {e}", flush=True)
        return False

# 1. Download HDX COD-PS files
cod_ps_files = {
    "KEN": [
        ("https://data.humdata.org/dataset/26801642-7088-4149-9605-6ae282897937/resource/d4fed43d-8abe-48d2-987a-35c101292af3/download/ken_admpop_adm1_2019.csv", "data/raw/KEN/ken_admpop_adm1_2019.csv"),
        ("https://data.humdata.org/dataset/26801642-7088-4149-9605-6ae282897937/resource/bfe30344-5fb4-45dd-b1d1-565690aba5fc/download/ken_adminboundaries_tabulardata.xlsx", "data/raw/KEN/ken_adminboundaries_tabulardata.xlsx"),
        ("https://data.humdata.org/dataset/26801642-7088-4149-9605-6ae282897937/resource/e57fb9a8-96dc-4a21-849b-1ddbc4ed7803/download/ken_admpop_2019.xlsx", "data/raw/KEN/ken_admpop_2019.xlsx")
    ],
    "TZA": [
        ("https://data.humdata.org/dataset/fcd33248-774d-4be2-aa16-86b10519330e/resource/89dd7ca4-4b73-4725-8ac8-0e0ef78d4fbd/download/tza_admpop_adm1_2020_v2.csv", "data/raw/TZA/tza_admpop_adm1_2020_v2.csv"),
        ("https://data.humdata.org/dataset/fcd33248-774d-4be2-aa16-86b10519330e/resource/8af542c3-9f80-4f5c-9362-d5954d7824ec/download/tza_admpop_adm2_2020_v2.csv", "data/raw/TZA/tza_admpop_adm2_2020_v2.csv"),
        ("https://data.humdata.org/dataset/fcd33248-774d-4be2-aa16-86b10519330e/resource/0f4a07fb-137a-45d0-bb10-902ff7873ab8/download/tza_gazetteer.xlsx", "data/raw/TZA/tza_gazetteer.xlsx")
    ],
    "UGA": [
        ("https://data.humdata.org/dataset/9a997a19-0531-46cc-aa2e-a314d253c40f/resource/869522f7-419c-4bf6-90fb-e9a371e267ae/download/uga_admpop_adm1_2023.csv", "data/raw/UGA/uga_admpop_adm1_2023.csv"),
        ("https://data.humdata.org/dataset/9a997a19-0531-46cc-aa2e-a314d253c40f/resource/bbad210a-3867-48a8-bb64-ae4585efd025/download/uga_admpop_adm2_2023.csv", "data/raw/UGA/uga_admpop_adm2_2023.csv"),
        ("https://data.humdata.org/dataset/9a997a19-0531-46cc-aa2e-a314d253c40f/resource/c87fb138-eb60-4584-8455-cd3eecc68132/download/uga_admpop_2023.xlsx", "data/raw/UGA/uga_admpop_2023.xlsx")
    ],
    "RWA": [
        ("https://data.humdata.org/dataset/94b26815-cd91-4553-b64d-7a6f153400bc/resource/63dfb3b5-7aac-4cdd-9fa5-baac711b2a50/download/rwa_admpop_adm1_2023.csv", "data/raw/RWA/rwa_admpop_adm1_2023.csv"),
        ("https://data.humdata.org/dataset/94b26815-cd91-4553-b64d-7a6f153400bc/resource/4c88332a-ed41-4220-ac72-d3bddd2a3a05/download/rwa_admpop_adm2_2023.csv", "data/raw/RWA/rwa_admpop_adm2_2023.csv"),
        ("https://data.humdata.org/dataset/94b26815-cd91-4553-b64d-7a6f153400bc/resource/b07265ad-055e-4ea8-bb95-de3adb1ae0a1/download/rwa_admpop_adm3_2023.csv", "data/raw/RWA/rwa_admpop_adm3_2023.csv"),
        ("https://data.humdata.org/dataset/94b26815-cd91-4553-b64d-7a6f153400bc/resource/73836c44-8611-473f-a42f-5f90a6a460eb/download/rwa_admpop_2022.xlsx", "data/raw/RWA/rwa_admpop_2022.xlsx")
    ],
    "BDI": [
        ("https://data.humdata.org/dataset/61e643bc-e36d-4106-8815-4b952fc40e9c/resource/094c1e77-8ff0-42d5-94fa-4940a3da08e2/download/bdi_admpop_2022_adm1_v3.csv", "data/raw/BDI/bdi_admpop_2022_adm1_v3.csv"),
        ("https://data.humdata.org/dataset/61e643bc-e36d-4106-8815-4b952fc40e9c/resource/caf569e5-177b-4a6f-abc9-b01e8bf85c43/download/bdi_admpop_2022_adm2_v3.csv", "data/raw/BDI/bdi_admpop_2022_adm2_v3.csv"),
        ("https://data.humdata.org/dataset/61e643bc-e36d-4106-8815-4b952fc40e9c/resource/7b5305c3-d3ca-48c6-984e-e7a7aed1828d/download/bdi_admpop_2022_v2.xlsx", "data/raw/BDI/bdi_admpop_2022_v2.xlsx")
    ]
}

print("=== Downloading HDX COD-PS Files ===")
for iso, files in cod_ps_files.items():
    print(f"\n--- {iso} Population Data ---")
    for url, path in files:
        download_file(url, path)

# 2. Download full subnational DHS indicators for all 5 countries
print("\n=== Fetching DHS Subnational Indicators ===")
dhs_countries = ["KE", "TZ", "UG", "RW", "BU"]
indicators = [
    "FE_FRTR_W_TFR", # Total fertility rate 15-49
    "CM_ECMR_C_U5M", # Under-five mortality rate
    "CN_NUTS_C_HA2", # Stunting (height-for-age < -2 SD)
    "RH_DELP_C_DHF", # Delivery in a health facility (%)
    "ED_LITR_W_LIT", # Literacy: Women (%)
    "ED_LITR_M_LIT", # Literacy: Men (%)
    "WS_SRCE_P_IMP", # Improved drinking water source (%)
    "WS_TLET_P_IMP", # Improved sanitation facility (%)
    "HC_ELEC_H_ELC", # Electricity access (% households)
    "FP_CUSA_W_MOD", # Modern contraceptive prevalence rate
    "AH_TOBC_W_ANY"  # Any tobacco use
]

dhs_all = []
page = 1
while True:
    api_url = f"https://api.dhsprogram.com/rest/dhs/data?countryIds={','.join(dhs_countries)}&indicatorIds={','.join(indicators)}&breakdown=subnational&selectSurveys=latest&f=json&page={page}&perPage=500"
    print(f"Requesting DHS API page {page}...", flush=True)
    r = requests.get(api_url, headers=HEADERS, timeout=20)
    if r.status_code == 200:
        res = r.json()
        data = res.get("Data", [])
        if not data:
            break
        dhs_all.extend(data)
        total_pages = res.get("TotalPages", 1)
        print(f"  Got {len(data)} rows (Page {page}/{total_pages}, total so far: {len(dhs_all)})")
        if page >= total_pages:
            break
        page += 1
        time.sleep(0.5)
    else:
        print(f"DHS API Error: {r.status_code}")
        break

dhs_target = "data/raw/regional/dhs_subnational_indicators.json"
with open(dhs_target, "w", encoding="utf-8") as f:
    json.dump(dhs_all, f, indent=2)
print(f"Saved {len(dhs_all)} DHS indicator records to {dhs_target}")


