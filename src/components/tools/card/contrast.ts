import { hexToRgb, luminance, mix, type RGB } from "./engine";
import { getSideBackground, rgbToHex, type Box, type Layer, type SideDesign, type TextLayer } from "./editor-model";

export function contrastRatioHex(fgHex: string, bgHex: string): number {
  const l1 = luminance(hexToRgb(fgHex));
  const l2 = luminance(hexToRgb(bgHex));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Representative single colour for a side's background (used as baseline for contrast & edge warnings). */
export function getRepresentativeBgHex(side: SideDesign): string {
  const bg = getSideBackground(side);
  if (bg.type === "solid") return bg.color;
  if (bg.type === "gradient") {
    return rgbToHex(mix(hexToRgb(bg.from), hexToRgb(bg.to), 0.5));
  }
  if (bg.type === "pattern") {
    return rgbToHex(mix(hexToRgb(bg.bg), hexToRgb(bg.fg), Math.min(0.4, bg.opacity * 0.4)));
  }
  if (bg.type === "image") {
    if (bg.tint && bg.tint !== "none") return bg.tint;
    return side.bg || "#27272a";
  }
  return side.bg || "#ffffff";
}

/**
 * Estimates the effective background colour directly behind a text layer,
 * taking into account any visible filled shapes below it in the layer stack
 * (e.g., white text sitting on a dark split panel or monogram circle).
 */
export function effectiveBgBehindLayer(side: SideDesign, target: Layer, bounds?: Map<string, Box>): string {
  let effective: RGB = hexToRgb(getRepresentativeBgHex(side));
  const box = bounds?.get(target.id) ?? { x: target.x, y: target.y, w: target.w, h: target.h };
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;

  for (const l of side.layers) {
    if (l.id === target.id) break;
    if (l.hidden) continue;
    if (l.kind === "rect" || l.kind === "rounded-rect" || l.kind === "ellipse" || l.kind === "triangle" || l.kind === "star") {
      if (cx >= l.x && cx <= l.x + l.w && cy >= l.y && cy <= l.y + l.h) {
        const op = l.opacity ?? 1;
        effective = mix(effective, hexToRgb(l.color), op);
      }
    }
  }
  return rgbToHex(effective);
}

export interface ContrastCheckResult {
  ratio: number;
  level: "AAA" | "AA" | "warn";
  bgHex: string;
  suggestedHex: string;
  threshold: number;
}

export function checkTextLayerContrast(layer: TextLayer, side: SideDesign, bounds?: Map<string, Box>): ContrastCheckResult {
  const bgHex = effectiveBgBehindLayer(side, layer, bounds);
  const bgRgb = hexToRgb(bgHex);
  const fgRgb = hexToRgb(layer.color);
  const op = layer.opacity ?? 1;
  const blendedFg = op < 1 ? mix(bgRgb, fgRgb, op) : fgRgb;
  const ratio = contrastRatioHex(rgbToHex(blendedFg), bgHex);
  // Large text (14pt bold or 18pt normal) passes WCAG AA at 3.0:1; normal business card text needs 4.5:1.
  const isLarge = layer.size >= 18 || (layer.bold && layer.size >= 14);
  const threshold = isLarge ? 3.0 : 4.5;
  const level: ContrastCheckResult["level"] = ratio >= 7 ? "AAA" : ratio >= threshold ? "AA" : "warn";
  const darkRatio = contrastRatioHex("#111111", bgHex);
  const lightRatio = contrastRatioHex("#ffffff", bgHex);
  const suggestedHex = darkRatio >= lightRatio ? "#111111" : "#ffffff";
  return { ratio, level, bgHex, suggestedHex, threshold };
}

export function findLowContrastLayers(side: SideDesign, bounds?: Map<string, Box>): Array<{ layer: TextLayer; check: ContrastCheckResult }> {
  const issues: Array<{ layer: TextLayer; check: ContrastCheckResult }> = [];
  for (const l of side.layers) {
    if (l.hidden || l.kind !== "text" || !l.text.trim()) continue;
    const check = checkTextLayerContrast(l, side, bounds);
    if (check.level === "warn") issues.push({ layer: l, check });
  }
  return issues;
}

/** True if the card side prints colour/ink right to the trim edges (dark card, full-bleed background, or edge-touching colour block). */
export function isEdgeToEdgeOrDarkSide(side: SideDesign, W: number, H: number): { isDark: boolean; touchesEdge: boolean } {
  const bg = getSideBackground(side);
  const bgHex = getRepresentativeBgHex(side);
  const bgLum = luminance(hexToRgb(bgHex));
  const nonWhiteBg = bg.type !== "solid" || bg.color.toLowerCase() !== "#ffffff";
  const isDark = bgLum < 0.35;

  let touchesEdge = nonWhiteBg;
  if (!touchesEdge) {
    for (const l of side.layers) {
      if (l.hidden) continue;
      if (l.kind === "rect" || l.kind === "rounded-rect" || l.kind === "image" || l.kind === "ellipse") {
        if (l.x <= 0.5 || l.y <= 0.5 || l.x + l.w >= W - 0.5 || l.y + l.h >= H - 0.5) {
          touchesEdge = true;
          break;
        }
      }
    }
  }
  return { isDark, touchesEdge };
}
