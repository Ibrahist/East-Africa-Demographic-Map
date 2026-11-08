"""
pipeline/export_shapefile.py
Utility script to convert a GeoJSON feature or FeatureCollection to an ESRI Shapefile ZIP archive.
"""

import sys
import os
import json
import tempfile
import zipfile
import re
import geopandas as gpd
from shapely.geometry import shape

def sanitize_properties(props: dict) -> dict:
    """Sanitize property values for DBF format compatibility."""
    clean = {}
    for k, v in props.items():
        # DBF field names must be <= 10 chars
        # truncate safely or keep
        if v is None:
            clean[k] = ""
        elif isinstance(v, (int, float, str, bool)):
            clean[k] = v
        else:
            clean[k] = str(v)
    return clean

def geojson_to_shapefile_zip(geojson_input_path: str, output_zip_path: str):
    with open(geojson_input_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    features = []
    if data.get("type") == "FeatureCollection":
        features = data.get("features", [])
    elif data.get("type") == "Feature":
        features = [data]
    else:
        raise ValueError("Invalid GeoJSON: must be Feature or FeatureCollection")

    if not features:
        raise ValueError("No features found in GeoJSON")

    rows = []
    geoms = []
    for feat in features:
        props = sanitize_properties(feat.get("properties", {}))
        geom_obj = feat.get("geometry")
        if geom_obj:
            geoms.append(shape(geom_obj))
            rows.append(props)

    if not geoms:
        raise ValueError("No valid geometries found to export")

    gdf = gpd.GeoDataFrame(rows, geometry=geoms, crs="EPSG:4326")

    # DBF field names cannot exceed 10 chars; truncate gracefully
    col_map = {}
    seen = set()
    for col in gdf.columns:
        if col == "geometry":
            continue
        short = col[:10]
        c = 1
        while short in seen:
            short = f"{col[:8]}_{c}"
            c += 1
        seen.add(short)
        col_map[col] = short

    gdf = gdf.rename(columns=col_map)

    with tempfile.TemporaryDirectory() as temp_dir:
        base_name = "export_layer"
        shp_path = os.path.join(temp_dir, f"{base_name}.shp")
        gdf.to_file(shp_path, driver="ESRI Shapefile", encoding="utf-8")

        # Zip all created shapefile components
        with zipfile.ZipFile(output_zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for fname in os.listdir(temp_dir):
                fpath = os.path.join(temp_dir, fname)
                zf.write(fpath, arcname=fname)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python -m pipeline.export_shapefile <input.geojson> <output.zip>")
        sys.exit(1)
    
    in_file = sys.argv[1]
    out_file = sys.argv[2]
    geojson_to_shapefile_zip(in_file, out_file)
    print(f"Successfully generated shapefile zip at: {out_file}")

