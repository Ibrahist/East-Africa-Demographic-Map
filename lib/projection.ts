export interface GeoBounds {
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
}

export function computeGeoBounds(geojson: any): GeoBounds {
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  if (!geojson || !geojson.features) {
    return { minLng: 28.5, maxLng: 42.0, minLat: -11.8, maxLat: 5.5 };
  }

  const checkCoord = (lng: number, lat: number) => {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  };

  const processGeom = (geom: any) => {
    if (!geom) return;
    const type = geom.type;
    const coords = geom.coordinates;
    if (type === "Point") {
      checkCoord(coords[0], coords[1]);
    } else if (type === "Polygon") {
      for (const ring of coords) {
        for (const pt of ring) {
          checkCoord(pt[0], pt[1]);
        }
      }
    } else if (type === "MultiPolygon") {
      for (const poly of coords) {
        for (const ring of poly) {
          for (const pt of ring) {
            checkCoord(pt[0], pt[1]);
          }
        }
      }
    }
  };

  for (const f of geojson.features) {
    processGeom(f.geometry);
  }

  if (minLng === Infinity) {
    return { minLng: 28.5, maxLng: 42.0, minLat: -11.8, maxLat: 5.5 };
  }

  // Add 4% padding
  const padLng = (maxLng - minLng) * 0.04;
  const padLat = (maxLat - minLat) * 0.04;

  return {
    minLng: minLng - padLng,
    maxLng: maxLng + padLng,
    minLat: minLat - padLat,
    maxLat: maxLat + padLat,
  };
}

export function getProjector(
  bounds: GeoBounds,
  width: number,
  height: number
): (lng: number, lat: number) => [number, number] {
  const lngSpan = bounds.maxLng - bounds.minLng || 1;
  const latSpan = bounds.maxLat - bounds.minLat || 1;

  const midLat = ((bounds.minLat + bounds.maxLat) / 2) * (Math.PI / 180);
  const cosLat = Math.cos(midLat);
  const geoW = lngSpan * cosLat;
  const geoH = latSpan;

  // Fit into width * 0.94, height * 0.94 preserving true aspect ratio
  const scale = Math.min((width * 0.94) / geoW, (height * 0.94) / geoH);
  const offsetX = (width - geoW * scale) / 2;
  const offsetY = (height - geoH * scale) / 2;

  return (lng: number, lat: number): [number, number] => {
    const x = offsetX + (lng - bounds.minLng) * cosLat * scale;
    const y = height - (offsetY + (lat - bounds.minLat) * scale);
    return [x, y];
  };
}

export function geoToSvgPath(
  geometry: any,
  bounds: GeoBounds,
  width: number,
  height: number
): string {
  if (!geometry) return "";

  const project = getProjector(bounds, width, height);

  const ringToPath = (ring: number[][]): string => {
    if (!ring || ring.length === 0) return "";
    let str = "";
    for (let i = 0; i < ring.length; i++) {
      const [x, y] = project(ring[i][0], ring[i][1]);
      if (i === 0) {
        str += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      } else {
        str += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
    }
    str += " Z";
    return str;
  };

  if (geometry.type === "Polygon") {
    return geometry.coordinates.map((ring: number[][]) => ringToPath(ring)).join(" ");
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates
      .map((poly: number[][][]) =>
        poly.map((ring: number[][]) => ringToPath(ring)).join(" ")
      )
      .join(" ");
  }

  return "";
}

export function pointToSvg(
  coords: [number, number],
  bounds: GeoBounds,
  width: number,
  height: number
): [number, number] {
  const project = getProjector(bounds, width, height);
  return project(coords[0], coords[1]);
}
