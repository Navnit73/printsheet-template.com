"use client";

/**
 * Shared label design engine for LabelSheetTool and JarBottleLabelTool.
 * One layout pass produces primitives in label-local millimetres; the PDF
 * renderer and the SVG preview draw the same list, so they always match.
 */

import React, { useEffect, useId, useMemo, useState } from "react";
import type { jsPDF as JsPdfDoc } from "jspdf";
import {
  drawFittedText,
  fitContain,
  FONT_PAIRS,
  isPdfSafeText,
  layoutFittedText,
  loadImageElement,
  type PdfFontFamily,
} from "@/lib/pdf-utils";
/* ------------------------------------------------------------------------- */

export const PT_TO_MM = 25.4 / 72;
export const LINE_HEIGHT = 1.2;
/** jsPDF puts the baseline 0.85 em below y for baseline: "top" (lineHeightFactor 1.15). */
export const PDF_BASELINE_EM = 0.85;

export type Rgb = [number, number, number];
export type LabelStyleId = "bordered" | "banner" | "plain" | "classic" | "kraft" | "band" | "minimal";
export type FontPairId = "modern" | "classic" | "editorial" | "typewriter";

export const FONT_PAIR_IDS: FontPairId[] = ["modern", "classic", "editorial", "typewriter"];

export const LABEL_STYLES: {
  id: LabelStyleId;
  name: string;
  desc: string;
  roundName?: string;
  roundDesc?: string;
  rectOnly?: boolean;
}[] = [
  { id: "bordered", name: "Thin border", desc: "A coloured line just inside the edge" },
  { id: "classic", name: "Classic", desc: "Double rule and a diamond divider", roundDesc: "Double ring and a diamond divider" },
  { id: "band", name: "Bold band", desc: "Name reversed out of a colour band", roundName: "Solid seal", roundDesc: "Solid colour with reversed text" },
  { id: "kraft", name: "Kraft", desc: "Brown-paper fill with a stitched line" },
  { id: "minimal", name: "Minimal", desc: "Hairline rule, spaced capitals" },
  { id: "banner", name: "Top band", desc: "A solid coloured strip across the top", rectOnly: true },
  { id: "plain", name: "No border", desc: "Just your text — clean and simple" },
];

export const ACCENT_SWATCHES: { name: string; hex: string }[] = [
  { name: "Forest green", hex: "#3f6212" },
  { name: "Navy", hex: "#1e3a5f" },
  { name: "Burgundy", hex: "#7f1d1d" },
  { name: "Terracotta", hex: "#b4532a" },
  { name: "Teal", hex: "#0f766e" },
  { name: "Plum", hex: "#6b2c5f" },
  { name: "Ochre", hex: "#a16207" },
  { name: "Charcoal", hex: "#27272a" },
];

export const WHITE: Rgb = [255, 255, 255];
export const INK: Rgb = [24, 24, 27];
export const KRAFT: Rgb = [222, 199, 160];
export const KRAFT_INK: Rgb = [61, 43, 26];

export function hexToRgb(hex: string): Rgb {
  const num = parseInt(hex.replace("#", ""), 16);
  if (Number.isNaN(num)) return [77, 124, 15];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const rgbCss = (c: Rgb) => `rgb(${c[0]},${c[1]},${c[2]})`;
export const mix = (a: Rgb, b: Rgb, t: number): Rgb => [0, 1, 2].map((i) => Math.round(a[i] * (1 - t) + b[i] * t)) as Rgb;

export function luminance(c: Rgb): number {
  const ch = c.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
export function contrast(a: Rgb, b: Rgb): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
/** Near-black or white, whichever reads better on `fill`. */
export function readableOn(fill: Rgb): Rgb {
  return contrast(INK, fill) >= contrast(WHITE, fill) ? INK : WHITE;
}

/* ---- measuring ---- */

/** Same stacks drawFittedText uses for its canvas fallback, so unicode text measures identically. */
export const CJK_FALLBACK = '"Noto Sans", "Noto Sans CJK SC", "PingFang SC", "Hiragino Sans", sans-serif';
export const RASTER_STACKS: Record<PdfFontFamily, string> = {
  helvetica: `"Helvetica Neue", Helvetica, Arial, ${CJK_FALLBACK}`,
  times: `"Times New Roman", Times, Georgia, "Noto Serif", "Noto Serif CJK SC", serif`,
  courier: `"Courier New", Courier, monospace, ${CJK_FALLBACK}`,
};
export const PREVIEW_STACKS: Record<PdfFontFamily, string> = {
  helvetica: FONT_PAIRS.modern.cssHeading,
  times: FONT_PAIRS.classic.cssHeading,
  courier: FONT_PAIRS.typewriter.cssHeading,
};

export type MeasureText = (
  text: string,
  sizePt: number,
  family: PdfFontFamily,
  bold: boolean,
  italic: boolean,
  raster: boolean
) => number;

export const pdfFontStyle = (bold: boolean, italic: boolean) =>
  bold && italic ? "bolditalic" : bold ? "bold" : italic ? "italic" : "normal";

/**
 * jsPDF metrics for PDF-safe text, canvas metrics (same font stacks as
 * drawFittedText) for text that gets rasterised. Without a doc (server render /
 * before jsPDF loads) it returns a deterministic estimate so hydration matches.
 */
export function makeMeasure(doc: JsPdfDoc | null): MeasureText {
  let ctx: CanvasRenderingContext2D | null | undefined;
  return (t, size, family, bold, italic, raster) => {
    if (!doc) return t.length * size * PT_TO_MM * (family === "courier" ? 0.6 : 0.52) * (bold ? 1.06 : 1);
    if (!raster) {
      doc.setFont(family, pdfFontStyle(bold, italic));
      doc.setFontSize(size);
      return doc.getTextWidth(t);
    }
    if (ctx === undefined) ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return t.length * size * PT_TO_MM * 0.6;
    ctx.font = `${italic ? "italic " : ""}${bold ? "700" : "400"} ${size * PT_TO_MM * 16}px ${RASTER_STACKS[family]}`;
    return ctx.measureText(t).width / 16;
  };
}

/** Loads jsPDF after mount so the preview measures text with the exact PDF font metrics. */
export function useLabelMeasure(): MeasureText {
  const [doc, setDoc] = useState<JsPdfDoc | null>(null);
  useEffect(() => {
    let cancelled = false;
    import("jspdf").then((m) => {
      if (!cancelled) setDoc(new m.jsPDF({ unit: "mm", format: "a4" }));
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return useMemo(() => makeMeasure(doc), [doc]);
}

/* ---- scene primitives ---- */

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type LabelPrim =
  | { k: "rect"; x: number; y: number; w: number; h: number; r?: number; fill?: Rgb; stroke?: Rgb; lw?: number; dash?: number[] }
  | { k: "circle"; cx: number; cy: number; r: number; fill?: Rgb; stroke?: Rgb; lw?: number; dash?: number[] }
  | { k: "line"; x1: number; y1: number; x2: number; y2: number; stroke: Rgb; lw: number }
  | { k: "diamond"; cx: number; cy: number; s: number; fill: Rgb }
  | { k: "image"; x: number; y: number; w: number; h: number; src: string; clip?: { cx: number; cy: number; r: number } }
  | {
      k: "text";
      raw: string;
      lines: string[];
      xs: number[];
      y: number;
      box: Box;
      align: "left" | "center";
      lineH: number;
      size: number;
      family: PdfFontFamily;
      bold: boolean;
      italic: boolean;
      color: Rgb;
      /** letter spacing in mm (PDF-safe text only) */
      cs: number;
      raster: boolean;
      maxH: number;
    };

export interface TextItem {
  kind: "text";
  text: string;
  size: number;
  min: number;
  family: PdfFontFamily;
  bold?: boolean;
  italic?: boolean;
  color: Rgb;
  maxLines: number;
  gap?: number;
  /** letter spacing as a fraction of the font size */
  tracking?: number;
  upper?: boolean;
}
export interface RuleItem {
  kind: "rule";
  h: number;
  w: number;
  diamond?: boolean;
  color: Rgb;
  gap?: number;
}
export type StackItem = TextItem | RuleItem;

/** Wrap + shrink + ellipsis per block, stacked inside `box`; nothing is ever placed outside it. */
export function layoutStack(
  items: StackItem[],
  box: Box,
  measure: MeasureText,
  align: "left" | "center" = "center",
  valign: "center" | "bottom" = "center"
): LabelPrim[] {
  const list = items
    .map((it) => (it.kind === "text" ? { ...it, text: (it.upper ? it.text.toUpperCase() : it.text).trim() } : it))
    .filter((it) => it.kind === "rule" || it.text);
  if (list.length === 0 || box.w <= 1 || box.h <= 1) return [];
  const gapOf = (it: StackItem) => it.gap ?? 0.8;
  let remaining = box.h;
  type Laid = { it: StackItem; height: number; lines?: string[]; widths?: number[]; size?: number; raster?: boolean; cs?: number };
  const laid: Laid[] = [];
  list.forEach((it, i) => {
    const gap = laid.length > 0 ? gapOf(it) : 0;
    const reserve = list
      .slice(i + 1)
      .reduce((s, n) => s + gapOf(n) + (n.kind === "text" ? n.min * PT_TO_MM * LINE_HEIGHT : n.h), 0);
    const budget = remaining - gap - reserve;
    if (budget <= 0.5) return;
    if (it.kind === "rule") {
      if (it.h > budget) return;
      laid.push({ it, height: it.h });
      remaining -= gap + it.h;
      return;
    }
    const raster = !isPdfSafeText(it.text);
    const track = raster ? 0 : (it.tracking ?? 0);
    const m = (t: string, size: number) =>
      measure(t, size, it.family, !!it.bold, !!it.italic, raster) + track * size * PT_TO_MM * Math.max(0, t.length - 1);
    const layout = layoutFittedText(
      it.text,
      { maxWidth: box.w, maxHeight: budget, maxLines: it.maxLines, fontSize: it.size, minFontSize: it.min, lineHeightFactor: LINE_HEIGHT },
      m
    );
    if (layout.lines.length === 0 || layout.heightMm > budget + 0.01) return;
    laid.push({
      it,
      height: layout.heightMm,
      lines: layout.lines,
      widths: layout.lines.map((l) => m(l, layout.fontSize)),
      size: layout.fontSize,
      raster,
      cs: track * layout.fontSize * PT_TO_MM,
    });
    remaining -= gap + layout.heightMm;
  });
  // A divider only makes sense between two lines of text.
  const kept = laid.filter(
    (l, i) => l.it.kind === "text" || (i > 0 && i < laid.length - 1 && laid[i - 1].it.kind === "text" && laid[i + 1].it.kind === "text")
  );
  const total = kept.reduce((s, l, i) => s + (i > 0 ? gapOf(l.it) : 0) + l.height, 0);
  let y = valign === "bottom" ? box.y + box.h - total : box.y + Math.max(0, (box.h - total) / 2);
  const out: LabelPrim[] = [];
  const cx = box.x + box.w / 2;
  kept.forEach((l, i) => {
    if (i > 0) y += gapOf(l.it);
    const it = l.it;
    if (it.kind === "rule") {
      const ry = y + l.height / 2;
      const half = Math.min(it.w, box.w) / 2;
      if (it.diamond) {
        const ds = Math.min(l.height * 0.32, 1.1);
        out.push({ k: "line", x1: cx - half, y1: ry, x2: cx - ds * 2, y2: ry, stroke: it.color, lw: 0.25 });
        out.push({ k: "line", x1: cx + ds * 2, y1: ry, x2: cx + half, y2: ry, stroke: it.color, lw: 0.25 });
        out.push({ k: "diamond", cx, cy: ry, s: ds, fill: it.color });
      } else {
        out.push({ k: "line", x1: cx - half, y1: ry, x2: cx + half, y2: ry, stroke: it.color, lw: 0.3 });
      }
    } else if (l.lines && l.widths && l.size !== undefined) {
      out.push({
        k: "text",
        raw: it.text,
        lines: l.lines,
        xs: l.widths.map((w) => (align === "center" ? cx - w / 2 : box.x)),
        y,
        box,
        align,
        lineH: l.size * PT_TO_MM * LINE_HEIGHT,
        size: l.size,
        family: it.family,
        bold: !!it.bold,
        italic: !!it.italic,
        color: it.color,
        cs: l.cs ?? 0,
        raster: !!l.raster,
        maxH: l.height + 0.05,
      });
    }
    y += l.height;
  });
  return out;
}

export interface LabelDesign {
  w: number;
  h: number;
  round: boolean;
  style: LabelStyleId;
  accent: Rgb;
  /** Optional fill for the whole label (stays inside the cut line). */
  background?: Rgb | null;
  fonts: FontPairId;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  meta?: string;
  logo?: { src: string; w: number; h: number } | null;
}

/** True when colour runs right up to the cut line (worth a trimming tip). */
export function fillReachesEdge(style: LabelStyleId, round: boolean, background: Rgb | null | undefined): boolean {
  return !!background || style === "kraft" || style === "band" || (style === "banner" && !round);
}

export function effectiveStyle(style: LabelStyleId, round: boolean): LabelStyleId {
  return round && style === "banner" ? "bordered" : style;
}

/** Lays out one label. Everything stays inside the safe area (round: the inscribed box). */
export function buildLabelScene(d: LabelDesign, measure: MeasureText): LabelPrim[] {
  const pair = FONT_PAIRS[d.fonts] ?? FONT_PAIRS.modern;
  const HEAD = pair.heading;
  const BODY = pair.body;
  const style = effectiveStyle(d.style, d.round);
  const { w, h } = d;
  const s = Math.min(w, h);
  const out: LabelPrim[] = [];

  const titlePt = clamp(s * (d.round ? 0.3 : 0.36), 8.5, 26);
  const subPt = clamp(titlePt * 0.55, 6, 12);
  const metaPt = clamp(titlePt * 0.42, 5.5, 9);
  const eyePt = clamp(titlePt * 0.46, 5, 9);
  const fi = clamp(s * 0.045, 1.2, 2.5); // frame inset
  const gap = clamp(s * 0.04, 1, 2.5); // frame → text
  const pad = clamp(s * 0.08, 1.8, 4); // unframed margin
  const lineGap = clamp(s * 0.025, 0.6, 1.6);

  const kraftFill = style === "kraft" && !d.background;
  const surface: Rgb = d.background ?? (style === "kraft" ? KRAFT : WHITE);
  const onSeal = d.round && style === "band";
  const ground: Rgb = onSeal ? d.accent : surface;
  const ink: Rgb = kraftFill ? KRAFT_INK : readableOn(ground);
  const muted = mix(ink, ground, kraftFill ? 0.18 : 0.3);
  const accentText: Rgb = onSeal ? ink : contrast(d.accent, surface) >= 3 ? d.accent : ink;
  const rule: Rgb = onSeal ? ink : kraftFill ? mix(KRAFT_INK, d.accent, 0.35) : contrast(d.accent, surface) >= 2.2 ? d.accent : ink;
  const rev = readableOn(d.accent);

  const eyebrow = (d.eyebrow ?? "").trim();
  const sub = (d.subtitle ?? "").trim();
  const meta = (d.meta ?? "").trim();

  const titleColor: Rgb = style === "plain" || style === "minimal" ? accentText : ink;
  const eyebrowItem = (color: Rgb): TextItem => ({
    kind: "text",
    text: eyebrow,
    size: eyePt,
    min: 4.5,
    family: BODY,
    bold: true,
    color,
    maxLines: 1,
    tracking: 0.12,
    upper: true,
  });
  const titleItem = (color: Rgb): TextItem => ({
    kind: "text",
    text: d.title,
    size: titlePt,
    min: 5,
    family: HEAD,
    bold: true,
    color,
    maxLines: 2,
    gap: lineGap,
  });
  const subItem = (color: Rgb): TextItem =>
    style === "minimal"
      ? { kind: "text", text: sub, size: subPt * 0.86, min: 4.5, family: BODY, color, maxLines: 2, gap: lineGap, tracking: 0.14, upper: true }
      : { kind: "text", text: sub, size: subPt, min: 4.5, family: BODY, italic: style === "classic", color, maxLines: 2, gap: lineGap };
  const metaItem = (color: Rgb, maxLines: number): TextItem => ({
    kind: "text",
    text: meta,
    size: metaPt,
    min: 4.5,
    family: BODY,
    color,
    maxLines,
    gap: lineGap * 1.2,
    tracking: style === "minimal" ? 0.08 : 0,
  });
  const divider = (color: Rgb, width: number): RuleItem | null => {
    if (style === "classic") return { kind: "rule", h: clamp(s * 0.06, 1.6, 3), w: width, diamond: true, color, gap: lineGap };
    if (style === "minimal" || style === "kraft")
      return { kind: "rule", h: clamp(s * 0.05, 1.2, 2.6), w: Math.min(width, clamp(s * 0.3, 6, 16)), color, gap: lineGap };
    return null;
  };
  const withDivider = (items: (StackItem | null)[]) => items.filter((x): x is StackItem => !!x);

  const pushLogo = (box: Box, clip?: { cx: number; cy: number; r: number }) => {
    if (!d.logo || box.w < 2 || box.h < 2) return;
    const f = fitContain(d.logo.w, d.logo.h, box);
    out.push({ k: "image", ...f, src: d.logo.src, clip });
  };

  /* ---------------- round ---------------- */
  if (d.round) {
    const R = s / 2;
    const cx = w / 2;
    const cy = h / 2;
    if (d.background || style === "kraft") out.push({ k: "circle", cx, cy, r: R, fill: surface });
    let ri: number;
    if (style === "bordered") {
      out.push({ k: "circle", cx, cy, r: R - fi, stroke: d.accent, lw: 0.5 });
      ri = R - fi - 0.25 - gap;
    } else if (style === "classic") {
      const step = clamp(s * 0.025, 0.7, 1.1);
      out.push({ k: "circle", cx, cy, r: R - fi, stroke: d.accent, lw: 0.6 });
      out.push({ k: "circle", cx, cy, r: R - fi - step, stroke: d.accent, lw: 0.25 });
      ri = R - fi - step - 0.15 - gap;
    } else if (style === "kraft") {
      out.push({ k: "circle", cx, cy, r: R - fi, stroke: rule, lw: 0.35, dash: [1.2, 0.9] });
      ri = R - fi - 0.2 - gap;
    } else if (style === "band") {
      out.push({ k: "circle", cx, cy, r: R, fill: d.accent });
      out.push({ k: "circle", cx, cy, r: R - fi, stroke: ink, lw: 0.35 });
      ri = R - fi - 0.2 - gap;
    } else {
      ri = R - pad;
    }
    ri = Math.max(2, ri);
    // Rectangle inscribed in the circle of radius ri (0.8² + 0.6² = 1).
    let content: Box = { x: cx - 0.8 * ri, y: cy - 0.6 * ri, w: 1.6 * ri, h: 1.2 * ri };
    if (d.logo) {
      pushLogo({ x: cx - 0.5 * ri, y: cy - 0.93 * ri, w: ri, h: 0.43 * ri }, { cx, cy, r: ri });
      content = { x: cx - 0.8 * ri, y: cy - 0.45 * ri, w: 1.6 * ri, h: 1.05 * ri };
    }
    out.push(
      ...layoutStack(
        withDivider([
          eyebrowItem(accentText),
          titleItem(titleColor),
          sub ? divider(rule, content.w * 0.55) : null,
          subItem(muted),
          metaItem(style === "minimal" ? muted : accentText, 2),
        ]),
        content,
        measure
      )
    );
    return out;
  }

  /* ---------------- rectangle ---------------- */
  const inset = (m: number, top = m, bottom = m): Box => ({ x: m, y: top, w: Math.max(1, w - 2 * m), h: Math.max(1, h - top - bottom) });
  if (d.background || style === "kraft") out.push({ k: "rect", x: 0, y: 0, w, h, fill: surface });
  const metaH = meta ? metaPt * PT_TO_MM * LINE_HEIGHT + 0.1 : 0;
  const metaColor = style === "minimal" ? muted : accentText;

  if (style === "band") {
    const hasLower = !!(sub || meta);
    const bandH = hasLower ? h * 0.56 : h;
    out.push({ k: "rect", x: 0, y: 0, w, h: bandH, fill: d.accent });
    let bandBox: Box = { x: pad, y: gap, w: Math.max(1, w - 2 * pad), h: Math.max(1, bandH - 2 * gap) };
    bandBox = placeRectLogo(bandBox);
    out.push(...layoutStack([eyebrowItem(mix(rev, d.accent, 0.15)), titleItem(rev)], bandBox, measure));
    if (hasLower) {
      const lower: Box = { x: pad, y: bandH + gap * 0.8, w: Math.max(1, w - 2 * pad), h: Math.max(1, h - bandH - gap * 0.8 - pad * 0.8) };
      const subBox = { ...lower, h: Math.max(1, lower.h - (meta ? metaH + lineGap : 0)) };
      out.push(...layoutStack([subItem(muted)], subBox, measure));
      if (meta) out.push(...layoutStack([metaItem(metaColor, 1)], { ...lower, y: lower.y + lower.h - metaH, h: metaH }, measure));
    }
    return out;
  }

  let inner: Box;
  let eyebrowInBanner = false;
  if (style === "bordered") {
    out.push({ k: "rect", x: fi, y: fi, w: w - 2 * fi, h: h - 2 * fi, stroke: d.accent, lw: 0.5 });
    inner = inset(fi + 0.25 + gap);
  } else if (style === "classic") {
    const cr = clamp(s * 0.07, 1, 3);
    const step = clamp(s * 0.025, 0.7, 1.1);
    out.push({ k: "rect", x: fi, y: fi, w: w - 2 * fi, h: h - 2 * fi, r: cr, stroke: d.accent, lw: 0.6 });
    const f2 = fi + step;
    out.push({ k: "rect", x: f2, y: f2, w: w - 2 * f2, h: h - 2 * f2, r: Math.max(0.3, cr - step), stroke: d.accent, lw: 0.25 });
    inner = inset(f2 + 0.15 + gap);
  } else if (style === "kraft") {
    out.push({ k: "rect", x: fi, y: fi, w: w - 2 * fi, h: h - 2 * fi, r: clamp(s * 0.05, 0.8, 2.5), stroke: rule, lw: 0.35, dash: [1.2, 0.9] });
    inner = inset(fi + 0.2 + gap);
  } else if (style === "banner") {
    const bh = eyebrow ? clamp(h * 0.24, 4.5, 13) : Math.min(8, h * 0.25);
    out.push({ k: "rect", x: 0, y: 0, w, h: bh, fill: d.accent });
    if (eyebrow) {
      eyebrowInBanner = true;
      out.push(...layoutStack([{ ...eyebrowItem(rev), tracking: 0.06 }], { x: pad, y: 0.4, w: w - 2 * pad, h: bh - 0.8 }, measure));
    }
    inner = inset(pad, bh + gap);
  } else {
    inner = inset(pad);
  }

  let main: Box = { ...inner, h: Math.max(1, inner.h - (meta ? metaH + lineGap * 1.2 : 0)) };
  main = placeRectLogo(main);
  out.push(
    ...layoutStack(
      withDivider([
        eyebrowInBanner ? null : eyebrowItem(accentText),
        titleItem(titleColor),
        sub ? divider(rule, main.w * 0.4) : null,
        subItem(muted),
      ]),
      main,
      measure
    )
  );
  if (meta) out.push(...layoutStack([metaItem(metaColor, 1)], { ...inner, y: inner.y + inner.h - metaH, h: metaH }, measure));
  return out;

  /** Wide boxes: logo on the left. Otherwise: logo on top. Returns the space left for text. */
  function placeRectLogo(box: Box): Box {
    if (!d.logo) return box;
    if (box.w / box.h > 1.8) {
      const lw = Math.min(box.h * 1.1, box.w * 0.3);
      pushLogo({ x: box.x, y: box.y, w: lw, h: box.h });
      return { x: box.x + lw + gap, y: box.y, w: Math.max(1, box.w - lw - gap), h: box.h };
    }
    const lh = box.h * 0.34;
    pushLogo({ x: box.x, y: box.y, w: box.w, h: lh });
    return { x: box.x, y: box.y + lh + gap * 0.6, w: box.w, h: Math.max(1, box.h - lh - gap * 0.6) };
  }
}

/* ---- PDF renderer ---- */

export async function renderClippedImage(src: string, wMm: number, hMm: number, clip?: { cx: number; cy: number; r: number }, x0 = 0, y0 = 0) {
  const img = await loadImageElement(src);
  const pxPerMm = 12;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(wMm * pxPerMm));
  canvas.height = Math.max(1, Math.round(hMm * pxPerMm));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");
  if (clip) {
    ctx.beginPath();
    ctx.arc((clip.cx - x0) * pxPerMm, (clip.cy - y0) * pxPerMm, clip.r * pxPerMm, 0, Math.PI * 2);
    ctx.clip();
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

export async function drawLabelScene(
  doc: JsPdfDoc,
  prims: LabelPrim[],
  ox: number,
  oy: number,
  imageCache: Map<string, string>
) {
  const paint = (p: { fill?: Rgb; stroke?: Rgb; lw?: number; dash?: number[] }) => {
    if (p.fill) doc.setFillColor(p.fill[0], p.fill[1], p.fill[2]);
    if (p.stroke) {
      doc.setDrawColor(p.stroke[0], p.stroke[1], p.stroke[2]);
      doc.setLineWidth(p.lw ?? 0.3);
    }
    doc.setLineDashPattern(p.dash ?? [], 0);
    return p.fill && p.stroke ? "FD" : p.fill ? "F" : "S";
  };
  for (const p of prims) {
    if (p.k === "rect") {
      const st = paint(p);
      if (p.r) doc.roundedRect(ox + p.x, oy + p.y, p.w, p.h, p.r, p.r, st);
      else doc.rect(ox + p.x, oy + p.y, p.w, p.h, st);
    } else if (p.k === "circle") {
      doc.circle(ox + p.cx, oy + p.cy, p.r, paint(p));
    } else if (p.k === "line") {
      paint({ stroke: p.stroke, lw: p.lw });
      doc.line(ox + p.x1, oy + p.y1, ox + p.x2, oy + p.y2);
    } else if (p.k === "diamond") {
      paint({ fill: p.fill });
      const x = ox + p.cx;
      const y = oy + p.cy;
      doc.triangle(x - p.s, y, x, y - p.s, x + p.s, y, "F");
      doc.triangle(x - p.s, y, x, y + p.s, x + p.s, y, "F");
    } else if (p.k === "image") {
      const key = `${p.src.length}:${p.src.slice(-48)}:${p.w.toFixed(2)}:${p.h.toFixed(2)}:${p.clip ? `${(p.clip.cx - p.x).toFixed(2)},${(p.clip.cy - p.y).toFixed(2)},${p.clip.r.toFixed(2)}` : ""}`;
      let data = imageCache.get(key);
      if (!data) {
        data = await renderClippedImage(p.src, p.w, p.h, p.clip, p.x, p.y);
        imageCache.set(key, data);
      }
      doc.addImage(data, "PNG", ox + p.x, oy + p.y, p.w, p.h, key);
    } else if (p.raster) {
      drawFittedText(doc, p.raw, {
        x: ox + (p.align === "center" ? p.box.x + p.box.w / 2 : p.box.x),
        y: oy + p.y,
        maxWidth: p.box.w,
        maxHeight: p.maxH,
        maxLines: p.lines.length,
        fontSize: p.size,
        minFontSize: p.size,
        fontStyle: pdfFontStyle(p.bold, p.italic),
        fontFamily: p.family,
        align: p.align,
        color: p.color,
        lineHeightFactor: LINE_HEIGHT,
      });
    } else {
      doc.setFont(p.family, pdfFontStyle(p.bold, p.italic));
      doc.setFontSize(p.size);
      doc.setTextColor(p.color[0], p.color[1], p.color[2]);
      p.lines.forEach((line, i) => {
        doc.text(line, ox + p.xs[i], oy + p.y + i * p.lineH, { baseline: "top", charSpace: p.cs || 0 });
      });
    }
  }
  doc.setLineDashPattern([], 0);
}

/* ---- SVG preview renderer (same primitives) ---- */

export function LabelArt({ prims, w, h, className }: { prims: LabelPrim[]; w: number; h: number; className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className ?? "absolute inset-0 h-full w-full"}
      aria-hidden="true"
      focusable="false"
    >
      {prims.map((p, i) => {
        const strokeProps = (q: { fill?: Rgb; stroke?: Rgb; lw?: number; dash?: number[] }) => ({
          fill: q.fill ? rgbCss(q.fill) : "none",
          stroke: q.stroke ? rgbCss(q.stroke) : undefined,
          strokeWidth: q.stroke ? (q.lw ?? 0.3) : undefined,
          strokeDasharray: q.dash ? q.dash.join(" ") : undefined,
        });
        switch (p.k) {
          case "rect":
            return <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} rx={p.r} ry={p.r} {...strokeProps(p)} />;
          case "circle":
            return <circle key={i} cx={p.cx} cy={p.cy} r={p.r} {...strokeProps(p)} />;
          case "line":
            return <line key={i} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke={rgbCss(p.stroke)} strokeWidth={p.lw} />;
          case "diamond":
            return (
              <polygon
                key={i}
                points={`${p.cx - p.s},${p.cy} ${p.cx},${p.cy - p.s} ${p.cx + p.s},${p.cy} ${p.cx},${p.cy + p.s}`}
                fill={rgbCss(p.fill)}
              />
            );
          case "image":
            return (
              <g key={i}>
                {p.clip && (
                  <clipPath id={`${uid}-c${i}`}>
                    <circle cx={p.clip.cx} cy={p.clip.cy} r={p.clip.r} />
                  </clipPath>
                )}
                <image
                  href={p.src}
                  x={p.x}
                  y={p.y}
                  width={p.w}
                  height={p.h}
                  preserveAspectRatio="none"
                  clipPath={p.clip ? `url(#${uid}-c${i})` : undefined}
                />
              </g>
            );
          case "text": {
            const sizeMm = p.size * PT_TO_MM;
            return (
              <g
                key={i}
                fill={rgbCss(p.color)}
                fontSize={sizeMm}
                fontFamily={p.raster ? RASTER_STACKS[p.family] : PREVIEW_STACKS[p.family]}
                fontWeight={p.bold ? 700 : 400}
                fontStyle={p.italic ? "italic" : "normal"}
                style={{ whiteSpace: "pre", letterSpacing: p.cs ? `${p.cs}px` : undefined }}
              >
                {p.lines.map((line, li) => (
                  <text
                    key={li}
                    x={p.align === "center" && p.raster ? p.box.x + p.box.w / 2 : p.xs[li]}
                    y={p.y + li * p.lineH + PDF_BASELINE_EM * sizeMm}
                    textAnchor={p.align === "center" && p.raster ? "middle" : undefined}
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          }
        }
      })}
    </svg>
  );
}

/* ---- shared Style-step controls ---- */

export const pickerCardCls = (active: boolean) =>
  `rounded-xl ring-1 transition cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-amber-700 ${
    active ? "bg-[#eef6e4] ring-2 ring-[#4d7c0f]" : "bg-white ring-zinc-200 hover:ring-zinc-300"
  }`;

/** Style cards with a live mini-render of each style using the person's own text. */
export function LabelStylePicker({
  name,
  value,
  onChange,
  sample,
  measure,
  allowBanner = true,
}: {
  name: string;
  value: LabelStyleId;
  onChange: (s: LabelStyleId) => void;
  sample: Omit<LabelDesign, "style" | "w" | "h">;
  measure: MeasureText;
  allowBanner?: boolean;
}) {
  const round = sample.round;
  const sw = round ? 34 : 60;
  const sh = round ? 34 : 38;
  const active = effectiveStyle(value, round);
  return (
    <fieldset>
      <legend className="block text-xs font-semibold text-zinc-800 mb-1">Label style</legend>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {LABEL_STYLES.filter((o) => !(o.rectOnly && (round || !allowBanner))).map((o) => {
          const on = active === o.id;
          const prims = buildLabelScene({ ...sample, logo: null, w: sw, h: sh, style: o.id }, measure);
          return (
            <label key={o.id} className={`flex flex-col gap-1.5 p-2 ${pickerCardCls(on)}`}>
              <input type="radio" name={name} value={o.id} checked={on} onChange={() => onChange(o.id)} className="sr-only" />
              <span
                aria-hidden="true"
                className={`relative mx-auto block overflow-hidden bg-white ring-1 ring-zinc-300 ${round ? "rounded-full" : "rounded-[3px]"}`}
                style={{ width: round ? 56 : "100%", aspectRatio: `${sw} / ${sh}`, containerType: "inline-size" }}
              >
                <LabelArt prims={prims} w={sw} h={sh} />
              </span>
              <span className="min-w-0 text-center">
                <span className="block text-[11px] font-bold leading-tight text-zinc-950">{round && o.roundName ? o.roundName : o.name}</span>
                <span className="sr-only">{round && o.roundDesc ? o.roundDesc : o.desc}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function FontPairPicker({ name, value, onChange }: { name: string; value: FontPairId; onChange: (f: FontPairId) => void }) {
  return (
    <fieldset>
      <legend className="block text-xs font-semibold text-zinc-800 mb-1">Fonts</legend>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {FONT_PAIR_IDS.map((id) => {
          const f = FONT_PAIRS[id];
          const on = value === id;
          return (
            <label key={id} className={`flex min-h-[56px] flex-col justify-center px-2.5 py-2 ${pickerCardCls(on)}`}>
              <input type="radio" name={name} value={id} checked={on} onChange={() => onChange(id)} className="sr-only" />
              <span aria-hidden="true" className="block text-lg font-bold leading-none text-zinc-950" style={{ fontFamily: f.cssHeading }}>
                Aa
                <span className="ml-1 text-xs font-normal text-zinc-600" style={{ fontFamily: f.cssBody }}>
                  bc
                </span>
              </span>
              <span className="mt-1 block text-[11px] font-semibold text-zinc-800">{f.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Named colour buttons + a custom colour input. */
export function ColourSwatchPicker({
  label,
  value,
  onChange,
  swatches = ACCENT_SWATCHES,
  hintId,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  swatches?: { name: string; hex: string }[];
  hintId?: string;
}) {
  const groupId = useId();
  const current = value.toLowerCase();
  return (
    <div>
      <span id={groupId} className="block text-xs font-semibold text-zinc-800 mb-1.5">
        {label}
      </span>
      <div role="group" aria-labelledby={groupId} aria-describedby={hintId} className="flex flex-wrap items-center gap-2">
        {swatches.map((c) => {
          const on = current === c.hex.toLowerCase();
          return (
            <button
              key={c.hex}
              type="button"
              aria-pressed={on}
              aria-label={c.name}
              title={c.name}
              onClick={() => onChange(c.hex)}
              className={`h-8 w-8 rounded-full ring-1 ring-black/15 transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 ${
                on ? "ring-2 ring-offset-2 ring-zinc-950" : "hover:scale-110"
              }`}
              style={{ backgroundColor: c.hex }}
            />
          );
        })}
        <label className="inline-flex items-center gap-1.5 min-h-[36px] rounded-full bg-[#f5f5f7] pl-1 pr-3 text-xs font-semibold text-zinc-700 cursor-pointer">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`Custom ${label.toLowerCase()}`}
            className="h-7 w-7 cursor-pointer rounded-full bg-transparent"
          />
          Custom
        </label>
      </div>
    </div>
  );
}


