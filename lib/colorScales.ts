import * as d3Array from "d3-array";
import {
  interpolateViridis,
  interpolateYlOrRd,
  interpolateYlGnBu,
  interpolateBlues,
  interpolatePurples,
  interpolateGreens,
  interpolateOrRd,
  interpolateSpectral,
  interpolateCividis,
  interpolatePlasma
} from "d3-scale-chromatic";
import { LegendBreak } from "./types";

export type ClassificationMethod = "quantile" | "natural" | "equal";

export const COLOR_PALETTES: Record<string, { name: string; interpolator: (t: number) => string; colorBlindSafe: boolean }> = {
  Viridis: { name: "Viridis (Uniform / Color-Blind Safe)", interpolator: interpolateViridis, colorBlindSafe: true },
  Cividis: { name: "Cividis (Color-Blind Optimized)", interpolator: interpolateCividis, colorBlindSafe: true },
  YlOrRd: { name: "YlOrRd (Yellow-Orange-Red)", interpolator: interpolateYlOrRd, colorBlindSafe: true },
  YlGnBu: { name: "YlGnBu (Yellow-Green-Blue)", interpolator: interpolateYlGnBu, colorBlindSafe: true },
  Blues: { name: "Blues", interpolator: interpolateBlues, colorBlindSafe: true },
  Purples: { name: "Purples", interpolator: interpolatePurples, colorBlindSafe: true },
  Greens: { name: "Greens", interpolator: interpolateGreens, colorBlindSafe: true },
  OrRd: { name: "Oranges-Reds", interpolator: interpolateOrRd, colorBlindSafe: true },
  Plasma: { name: "Plasma", interpolator: interpolatePlasma, colorBlindSafe: true }
};

export function formatValue(value: number | null | undefined, format?: string, unit?: string): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "No Data";
  }
  let str = "";
  if (format === "integer") {
    str = Math.round(value).toLocaleString();
  } else if (format === "percent_1") {
    str = `${value.toFixed(1)}%`;
    return str;
  } else if (format === "float_1") {
    str = value.toFixed(1).toLocaleString();
  } else {
    str = value.toLocaleString();
  }
  return unit ? `${str} ${unit}` : str;
}

export function computeBreaks(
  values: number[],
  numClasses: number = 5,
  method: ClassificationMethod = "quantile"
): number[] {
  const valid = values.filter((v) => v !== null && v !== undefined && !isNaN(v)).sort((a, b) => a - b);
  if (valid.length === 0) return [0, 1];

  const unique = Array.from(new Set(valid));
  if (unique.length === 1) {
    const single = unique[0];
    const delta = single === 0 ? 1 : Math.max(0.1, Math.abs(single) * 0.1);
    return [Math.max(0, single - delta), single + delta];
  }

  if (unique.length <= numClasses) {
    return unique;
  }

  const min = valid[0];
  const max = valid[valid.length - 1];

  if (min === max) {
    const delta = min === 0 ? 1 : Math.max(0.1, Math.abs(min) * 0.1);
    return [Math.max(0, min - delta), min + delta];
  }

  if (method === "quantile") {
    const breaks: number[] = [];
    for (let i = 0; i <= numClasses; i++) {
      const q = i / numClasses;
      const val = d3Array.quantile(valid, q);
      if (val !== undefined && (breaks.length === 0 || val > breaks[breaks.length - 1])) {
        breaks.push(val);
      }
    }
    return breaks.length >= 2 ? breaks : [min, max];
  }

  if (method === "equal") {
    const step = (max - min) / numClasses;
    const breaks = [min];
    for (let i = 1; i <= numClasses; i++) {
      breaks.push(min + i * step);
    }
    return breaks;
  }

  // Natural breaks (Jenks approximation using quantiles with cluster rounding)
  const qBreaks: number[] = [];
  const percentiles = [0, 0.15, 0.4, 0.7, 0.9, 1.0];
  for (const p of percentiles) {
    const val = d3Array.quantile(valid, p);
    if (val !== undefined && (qBreaks.length === 0 || val > qBreaks[qBreaks.length - 1])) {
      qBreaks.push(val);
    }
  }
  return qBreaks.length >= 2 ? qBreaks : [min, max];
}

export function generateLegendBreaks(
  breaks: number[],
  paletteKey: string = "Viridis",
  format?: string,
  unit?: string
): LegendBreak[] {
  const palette = COLOR_PALETTES[paletteKey] || COLOR_PALETTES.Viridis;
  if (!breaks || breaks.length === 0) return [];
  if (breaks.length === 1) {
    return [{
      color: palette.interpolator(0.5),
      min: breaks[0],
      max: breaks[0],
      label: formatValue(breaks[0], format, unit)
    }];
  }

  const numSteps = Math.max(1, breaks.length - 1);
  const legendBreaks: LegendBreak[] = [];

  for (let i = 0; i < numSteps; i++) {
    const min = breaks[i];
    const max = breaks[i + 1];
    const t = numSteps === 1 ? 0.5 : (i + 0.5) / numSteps;
    const color = palette.interpolator(t);
    const label = `${formatValue(min, format)} - ${formatValue(max, format, unit)}`;

    legendBreaks.push({
      color,
      min,
      max,
      label
    });
  }

  return legendBreaks;
}

export function getColorForValue(
  value: number | null | undefined,
  breaks: number[],
  paletteKey: string = "Viridis",
  missingColor: string = "#94a3b8"
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return missingColor;
  }
  const palette = COLOR_PALETTES[paletteKey] || COLOR_PALETTES.Viridis;
  if (!breaks || breaks.length === 0) {
    return palette.interpolator(0.5);
  }
  if (breaks.length === 1) {
    return palette.interpolator(0.5);
  }

  const numSteps = Math.max(1, breaks.length - 1);

  if (value <= breaks[0]) {
    return palette.interpolator(0.1);
  }
  if (value >= breaks[breaks.length - 1]) {
    return palette.interpolator(0.95);
  }

  for (let i = 0; i < numSteps; i++) {
    if (value >= breaks[i] && value <= breaks[i + 1]) {
      const t = (i + 0.5) / numSteps;
      return palette.interpolator(t);
    }
  }

  return palette.interpolator(0.5);
}

