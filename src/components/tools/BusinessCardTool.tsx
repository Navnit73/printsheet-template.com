"use client";

import React, { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Check, Download, ImagePlus, Pencil, QrCode, RefreshCw, Scissors, Trash2 } from "lucide-react";
import type { PageId } from "@/types/spec";
import {
  drawFittedText,
  fileToDataUrl,
  fitContain,
  FONT_PAIRS,
  isPdfSafeText,
  layoutFittedText,
  loadImageElement,
  PAPER_SIZES,
  PRINTER_SAFE_MARGIN_MM,
  renderImageToBoxDataUrl,
  type FittedTextLayout,
  type FittedTextOptions,
  type PdfFontFamily,
} from "@/lib/pdf-utils";
import {
  FieldHint,
  MobileActionBar,
  PrintTipsPanel,
  StepHeader,
  ToolStatus,
  UploadDropzone,
  primaryButtonClass,
  secondaryButtonClass,
  type ToolStatusValue,
} from "@/components/tools/ui/ToolUi";

type SheetPresetId = "a4-10up" | "letter-10up" | "letter-8up" | "a4-8up";
type CardStyleId = "minimal" | "classic" | "bold-logo" | "clean" | "split" | "monogram" | "dark" | "blank";
type FontPairId = "modern" | "classic" | "editorial" | "typewriter";
type BackStyleId = "logo" | "tagline" | "solid";
type RGB = [number, number, number];

interface SheetPreset {
  id: SheetPresetId;
  label: string;
  /** Extra plain-language note shown under the picker. */
  note: string;
  paper: "a4" | "letter";
  cols: number;
  rows: number;
  cardW: number;
  cardH: number;
  gapX: number;
  gapY: number;
}

const SHEET_PRESETS: Record<SheetPresetId, SheetPreset> = {
  "a4-10up": {
    id: "a4-10up",
    label: "10 cards per A4 page (90 × 55 mm)",
    note: "Most popular. Cards sit close together, so you make fewer cuts.",
    paper: "a4",
    cols: 2,
    rows: 5,
    cardW: 90,
    cardH: 55,
    gapX: 6,
    gapY: 2,
  },
  "letter-10up": {
    id: "letter-10up",
    label: "US Letter · 10 cards (3.5 × 2 in)",
    note: "Standard US card size. Also lines up with pre-cut 10-per-sheet US card paper.",
    paper: "letter",
    cols: 2,
    rows: 5,
    cardW: 88.9,
    cardH: 50.8,
    gapX: 12.7,
    gapY: 0,
  },
  "letter-8up": {
    id: "letter-8up",
    label: "US Letter · 8 cards (3.5 × 2 in, extra space to cut)",
    note: "Wider gaps between cards make cutting by hand easier.",
    paper: "letter",
    cols: 2,
    rows: 4,
    cardW: 88.9,
    cardH: 50.8,
    gapX: 12,
    gapY: 12,
  },
  "a4-8up": {
    id: "a4-8up",
    label: "8 cards per A4 page (85 × 55 mm, extra space to cut)",
    note: "Wider gaps between cards make cutting by hand easier.",
    paper: "a4",
    cols: 2,
    rows: 4,
    cardW: 85,
    cardH: 55,
    gapX: 10,
    gapY: 10,
  },
};

function getInitialConfig(pageId: PageId): {
  mode: "design" | "upload";
  sheet: SheetPresetId;
  style: CardStyleId;
  qr?: boolean;
} {
  switch (pageId) {
    case "T11":
      return { mode: "upload", sheet: "a4-10up", style: "minimal" };
    case "T12":
      return { mode: "design", sheet: "a4-10up", style: "blank" };
    case "T13":
      return { mode: "design", sheet: "a4-10up", style: "minimal" };
    case "T15":
      return { mode: "design", sheet: "letter-10up", style: "minimal" };
    case "T16":
      return { mode: "design", sheet: "a4-10up", style: "minimal", qr: true };
    case "T14":
    default:
      return { mode: "design", sheet: "a4-10up", style: "bold-logo" };
  }
}

function hexToRgb(hex: string): RGB {
  const clean = hex.replace("#", "");
  const num = parseInt(clean.length === 3 ? clean.replace(/(.)/g, "$1$1") : clean, 16);
  if (Number.isNaN(num)) return [77, 124, 15];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

const rgbCss = (c: RGB) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;

/* ------------------------------------------------------------------------- */
/* Card layout shared by the live preview and the PDF export (all units mm)   */
/* ------------------------------------------------------------------------- */

const PT_TO_MM = 25.4 / 72;
const INK: RGB = [9, 9, 11];
const BODY_INK: RGB = [39, 39, 42];
const MUTED: RGB = [113, 113, 122];
const WHITE: RGB = [255, 255, 255];
const DARK_BG: RGB = [24, 24, 27];

/* Same stacks pdf-utils uses for rasterised (non-Latin) text, so the preview matches the PDF. */
const CJK_FALLBACK = '"Noto Sans", "Noto Sans CJK SC", "PingFang SC", "Hiragino Sans", sans-serif';
const UNICODE_STACKS: Record<PdfFontFamily, string> = {
  helvetica: `"Helvetica Neue", Helvetica, Arial, ${CJK_FALLBACK}`,
  times: `"Times New Roman", Times, Georgia, "Noto Serif", "Noto Serif CJK SC", serif`,
  courier: `"Courier New", Courier, monospace, ${CJK_FALLBACK}`,
};
const LATIN_STACKS: Record<PdfFontFamily, string> = {
  helvetica: FONT_PAIRS.modern.cssBody,
  times: FONT_PAIRS.classic.cssBody,
  courier: FONT_PAIRS.typewriter.cssBody,
};
const cssStack = (family: PdfFontFamily, text: string) =>
  isPdfSafeText(text) ? LATIN_STACKS[family] : UNICODE_STACKS[family];

interface Fonts {
  heading: PdfFontFamily;
  body: PdfFontFamily;
}

/** trackEm: letter-spacing in em (only applied to Latin text, which jsPDF can space with charSpace). */
type FitFn = (text: string, opts: FittedTextOptions, trackEm?: number) => FittedTextLayout;

type CardEl =
  | { kind: "rect"; x: number; y: number; w: number; h: number; fill: RGB }
  | { kind: "circle"; cx: number; cy: number; r: number; fill: RGB }
  | { kind: "frame"; x: number; y: number; w: number; h: number; stroke: RGB; lineWidth: number }
  | { kind: "image"; which: "logo" | "qr"; x: number; y: number; w: number; h: number }
  | { kind: "text"; text: string; opts: FittedTextOptions; layout: FittedTextLayout; trackEm?: number };

interface CardContent {
  fullName: string;
  role: string;
  company: string;
  phone: string;
  email: string;
  website: string;
}

const STRIPE_TOP_MM = 2.2;
const STRIPE_LEFT_MM = 4;
const CLASSIC_FRAME_INSET_MM = 3;
const QR_SIZE_MM = 15;
const CONTACT_SLOT_MM = 3.6;
const SPACED_EM = 0.16;

function lineHeightMm(sizePt: number, lhf = 1.2) {
  return sizePt * PT_TO_MM * lhf;
}

function luminance([r, g, b]: RGB) {
  const ch = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}
const mix = (a: RGB, b: RGB, t: number): RGB => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];
/** Readable text colour on top of a fill. */
const textOn = (fill: RGB): RGB => (luminance(fill) > 0.4 ? INK : WHITE);
/** Accent lightened enough to read on the dark card background. */
const accentOnDark = (accent: RGB): RGB => {
  const l = luminance(accent);
  return l < 0.12 ? mix(accent, WHITE, 0.55) : l < 0.25 ? mix(accent, WHITE, 0.35) : accent;
};

function initialsOf(name: string, company: string) {
  const words = (name.trim() || company.trim()).split(/\s+/).filter(Boolean);
  if (!words.length) return "";
  const first = Array.from(words[0])[0] ?? "";
  const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/** Single-line text with letter-spacing, positioned explicitly (left-aligned) so PDF and preview agree. */
function spacedLine(
  fit: FitFn,
  text: string,
  opts: FittedTextOptions,
  trackEm: number
): Extract<CardEl, { kind: "text" }> {
  const o: FittedTextOptions = { ...opts, maxLines: 1 };
  const layout = fit(text, o, trackEm);
  const effTrack = isPdfSafeText(text) ? trackEm : 0;
  // Visual width excludes the trailing letter-space.
  const vis = layout.widthMm - effTrack * layout.fontSize * PT_TO_MM;
  const x = opts.align === "center" ? opts.x - vis / 2 : opts.align === "right" ? opts.x - vis : opts.x;
  return { kind: "text", text, opts: { ...o, x, align: "left" }, layout, trackEm: effTrack || undefined };
}

interface FrontConfig {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  centered: boolean;
  name: RGB;
  role: RGB;
  company: RGB;
  contact: RGB;
  /** Company as a small letter-spaced capitals line above the name. */
  companySpaced?: boolean;
  /** Short accent rule just above the contact lines. */
  rule?: RGB;
  /** Vertical accent bar to the left of the name block (text is indented). */
  bar?: RGB;
  /** Where the logo goes: top-right corner, centred on top, or not on this side. */
  logoAt: "corner" | "top" | "none";
  /** Header start (after decorations such as a monogram). */
  headerTop?: number;
}

/** Name / role / company + contacts + logo + QR inside a safe box. Text never leaves the box. */
function layoutFrontBody(
  els: CardEl[],
  cfg: FrontConfig,
  c: CardContent,
  logo: { w: number; h: number } | null,
  showQr: boolean,
  fit: FitFn,
  fonts: Fonts
) {
  const { x0, y0, x1, y1, centered } = cfg;
  const cx = (x0 + x1) / 2;
  const fullW = x1 - x0;
  const indent = cfg.bar ? 3 : 0;

  let headerTop = cfg.headerTop ?? y0;
  let headerW = fullW - indent;
  if (logo && cfg.logoAt === "top") {
    const f = fitContain(logo.w, logo.h, { x: cx - 12, y: headerTop, w: 24, h: 9 });
    els.push({ kind: "image", which: "logo", x: f.x, y: headerTop, w: f.w, h: f.h });
    headerTop += f.h + 2;
  } else if (logo && cfg.logoAt === "corner") {
    const f = fitContain(logo.w, logo.h, { x: x1 - 22, y: y0, w: 22, h: 11 });
    els.push({ kind: "image", which: "logo", x: x1 - f.w, y: y0, w: f.w, h: f.h });
    headerW = fullW - indent - f.w - 2.5;
  }

  const qr = showQr ? Math.min(QR_SIZE_MM, (y1 - y0) * 0.42) : 0;
  if (showQr) els.push({ kind: "image", which: "qr", x: x1 - qr, y: y1 - qr, w: qr, h: qr });
  const contactW = showQr ? (centered ? fullW - 2 * (qr + 2.5) : fullW - indent - qr - 2.5) : fullW - indent;

  const textX = centered ? cx : x0 + indent;
  const align: FittedTextOptions["align"] = centered ? "center" : "left";

  // Contacts: one line each, bottom of the safe area, one shared size.
  const contacts = [c.phone, c.email, c.website].map((s) => s.trim()).filter(Boolean);
  const contactTop = y1 - contacts.length * CONTACT_SLOT_MM;
  const contactOpts = (i: number, fontSize: number): FittedTextOptions => ({
    x: textX,
    y: contactTop + i * CONTACT_SLOT_MM + 0.15,
    maxWidth: contactW,
    maxHeight: CONTACT_SLOT_MM,
    maxLines: 1,
    fontSize,
    minFontSize: 5.5,
    fontFamily: fonts.body,
    align,
    color: cfg.contact,
  });
  const contactSize = Math.min(7, ...contacts.map((t, i) => fit(t, contactOpts(i, 7)).fontSize));
  contacts.forEach((text, i) => {
    const opts = contactOpts(i, contactSize);
    els.push({ kind: "text", text, opts, layout: fit(text, opts) });
  });

  let headerBottom = contacts.length ? contactTop - 1.5 : y1;
  if (cfg.rule && contacts.length) {
    const ruleY = contactTop - 2.4;
    const ruleW = 8;
    els.push({ kind: "rect", x: centered ? cx - ruleW / 2 : textX, y: ruleY, w: ruleW, h: 0.35, fill: cfg.rule });
    headerBottom = ruleY - 1.8;
  }
  if (showQr && (centered || headerW > fullW - indent - qr - 2.5)) {
    headerBottom = Math.min(headerBottom, y1 - qr - 1.5);
  }

  let y = headerTop;
  const company = c.company.trim();
  if (cfg.companySpaced && company) {
    const h = lineHeightMm(6, 1.2);
    if (headerBottom - y >= h) {
      const el = spacedLine(
        fit,
        company.toUpperCase(),
        { x: textX, y, maxWidth: headerW, maxHeight: h, fontSize: 6, minFontSize: 5, fontFamily: fonts.body, fontStyle: "bold", align, color: cfg.company },
        SPACED_EM
      );
      els.push(el);
      y += el.layout.heightMm + 2.6;
    }
  }

  const header: Array<{ text: string; size: number; min: number; style: FittedTextOptions["fontStyle"]; family: PdfFontFamily; color: RGB; lhf: number; gap: number }> = [
    { text: c.fullName, size: 12, min: 7, style: "bold", family: fonts.heading, color: cfg.name, lhf: 1.12, gap: 1.1 },
    { text: c.role, size: 7.5, min: 6, style: "normal", family: fonts.body, color: cfg.role, lhf: 1.2, gap: 0.5 },
  ];
  if (!cfg.companySpaced) {
    header.push({ text: c.company, size: 7, min: 6, style: "normal", family: fonts.body, color: cfg.company, lhf: 1.2, gap: 0 });
  }
  const barTop = y;
  let barBottom = y;
  for (const item of header) {
    const text = item.text.trim();
    if (!text) continue;
    const remaining = headerBottom - y;
    if (remaining < lineHeightMm(item.min, item.lhf)) break;
    const opts: FittedTextOptions = {
      x: textX,
      y,
      maxWidth: headerW,
      maxHeight: remaining,
      maxLines: 2,
      fontSize: item.size,
      minFontSize: item.min,
      fontStyle: item.style,
      fontFamily: item.family,
      align,
      color: item.color,
      lineHeightFactor: item.lhf,
    };
    const layout = fit(text, opts);
    els.push({ kind: "text", text, opts, layout });
    barBottom = y + layout.heightMm;
    y += layout.heightMm + item.gap;
  }
  if (cfg.bar && barBottom > barTop) {
    els.push({ kind: "rect", x: x0, y: barTop, w: 0.9, h: barBottom - barTop, fill: cfg.bar });
  }
}

/** Lays out a designed card front. Text never leaves the safe area, logo and QR boxes are reserved. */
function layoutCardFront(
  W: number,
  H: number,
  style: Exclude<CardStyleId, "blank">,
  accent: RGB,
  c: CardContent,
  logo: { w: number; h: number } | null,
  showQr: boolean,
  fit: FitFn,
  fonts: Fonts
): CardEl[] {
  const els: CardEl[] = [];
  const light = { name: INK, role: accent, company: MUTED, contact: BODY_INK };

  switch (style) {
    case "minimal":
      els.push({ kind: "rect", x: 0, y: 0, w: W, h: STRIPE_TOP_MM, fill: accent });
      layoutFrontBody(els, { x0: 5.5, y0: STRIPE_TOP_MM + 3.3, x1: W - 5, y1: H - 4.5, centered: false, logoAt: "corner", ...light }, c, logo, showQr, fit, fonts);
      break;
    case "bold-logo":
      els.push({ kind: "rect", x: 0, y: 0, w: STRIPE_LEFT_MM, h: H, fill: accent });
      layoutFrontBody(els, { x0: STRIPE_LEFT_MM + 4, y0: 5, x1: W - 4.5, y1: H - 4.5, centered: false, logoAt: "corner", ...light }, c, logo, showQr, fit, fonts);
      break;
    case "classic": {
      const i = CLASSIC_FRAME_INSET_MM;
      els.push({ kind: "frame", x: i, y: i, w: W - 2 * i, h: H - 2 * i, stroke: accent, lineWidth: 0.35 });
      layoutFrontBody(els, { x0: 6, y0: 6.5, x1: W - 6, y1: H - 6, centered: true, logoAt: "top", ...light }, c, logo, showQr, fit, fonts);
      break;
    }
    case "clean":
      layoutFrontBody(
        els,
        { x0: 7.5, y0: 7, x1: W - 7, y1: H - 6, centered: false, logoAt: "corner", companySpaced: true, rule: accent, ...light },
        c,
        logo,
        showQr,
        fit,
        fonts
      );
      break;
    case "split": {
      const P = Math.round(W * 0.34);
      els.push({ kind: "rect", x: 0, y: 0, w: P, h: H, fill: accent });
      const on = textOn(accent);
      if (logo) {
        const r = Math.min(P * 0.36, 11);
        els.push({ kind: "circle", cx: P / 2, cy: H / 2, r, fill: WHITE });
        const box = r * 1.25;
        const f = fitContain(logo.w, logo.h, { x: P / 2 - box / 2, y: H / 2 - box / 2, w: box, h: box });
        els.push({ kind: "image", which: "logo", x: f.x, y: f.y, w: f.w, h: f.h });
      } else {
        const ini = initialsOf(c.fullName, c.company);
        if (ini) {
          const size = 26;
          const opts: FittedTextOptions = { x: P / 2, y: 0, maxWidth: P - 8, maxLines: 1, fontSize: size, minFontSize: 14, fontStyle: "bold", fontFamily: fonts.heading, align: "center", color: on, lineHeightFactor: 1 };
          const layout = fit(ini, opts);
          const capH = layout.fontSize * PT_TO_MM * 0.72;
          // Centre the capitals (cap height ≈ 0.72 em, baseline ≈ 0.85 em below the top of the line box).
          const y = H / 2 - layout.fontSize * PT_TO_MM * 0.85 + capH / 2;
          els.push({ kind: "text", text: ini, opts: { ...opts, y }, layout });
        }
      }
      layoutFrontBody(els, { x0: P + 5, y0: 6, x1: W - 4.5, y1: H - 5, centered: false, logoAt: "none", ...light }, c, null, showQr, fit, fonts);
      break;
    }
    case "monogram": {
      const top = 4.5;
      let headerTop = top;
      if (!logo) {
        const ini = initialsOf(c.fullName, c.company);
        if (ini) {
          const r = 5.6;
          const cy = top + r;
          els.push({ kind: "circle", cx: W / 2, cy, r, fill: accent });
          const opts: FittedTextOptions = { x: W / 2, y: 0, maxWidth: r * 1.5, maxLines: 1, fontSize: 12, minFontSize: 7, fontStyle: "bold", fontFamily: fonts.heading, align: "center", color: textOn(accent), lineHeightFactor: 1 };
          const layout = fit(ini, opts);
          const y = cy - layout.fontSize * PT_TO_MM * 0.85 + (layout.fontSize * PT_TO_MM * 0.72) / 2;
          els.push({ kind: "text", text: ini, opts: { ...opts, y }, layout });
          headerTop = top + 2 * r + 2.6;
        }
      }
      layoutFrontBody(els, { x0: 6, y0: top, x1: W - 6, y1: H - 4.5, centered: true, logoAt: "top", headerTop, ...light }, c, logo, showQr, fit, fonts);
      break;
    }
    case "dark": {
      els.push({ kind: "rect", x: 0, y: 0, w: W, h: H, fill: DARK_BG });
      const a = accentOnDark(accent);
      layoutFrontBody(
        els,
        { x0: 6.5, y0: 6.5, x1: W - 6, y1: H - 5.5, centered: false, logoAt: "corner", bar: a, name: WHITE, role: a, company: [161, 161, 170], contact: [228, 228, 231] },
        c,
        logo,
        showQr,
        fit,
        fonts
      );
      break;
    }
  }
  return els;
}

function layoutCardBack(
  W: number,
  H: number,
  backStyle: BackStyleId,
  accent: RGB,
  b: { title: string; tagline: string; website: string; initials: string },
  logo: { w: number; h: number } | null,
  fit: FitFn,
  fonts: Fonts
): CardEl[] {
  const els: CardEl[] = [];
  const maxWidth = W - 12;
  type Block = { h: number; place: (y: number) => void };
  const blocks: Block[] = [];
  const textBlock = (text: string, o: Omit<FittedTextOptions, "x" | "y">, trackEm?: number): Block | null => {
    const t = text.trim();
    if (!t) return null;
    const opts: FittedTextOptions = { ...o, x: W / 2, y: 0, align: "center" };
    if (trackEm) {
      const el = spacedLine(fit, t, opts, trackEm);
      return { h: el.layout.heightMm, place: (y) => els.push({ ...el, opts: { ...el.opts, y } }) };
    }
    const layout = fit(t, opts);
    return { h: layout.heightMm, place: (y) => els.push({ kind: "text", text: t, opts: { ...opts, y }, layout }) };
  };
  const push = (blk: Block | null) => blk && blocks.push(blk);
  const top = 5;
  let bottom = H - 5;
  const gaps: number[] = [];

  if (backStyle === "tagline") {
    els.push({ kind: "rect", x: 0, y: 0, w: W, h: H, fill: DARK_BG }, { kind: "rect", x: 0, y: H - 2.5, w: W, h: 2.5, fill: accent });
    bottom = H - 2.5 - 4;
    push(textBlock(b.title, { maxWidth, maxHeight: (bottom - top) * 0.6, maxLines: 2, fontSize: 14, minFontSize: 8, fontStyle: "bold", fontFamily: fonts.heading, color: WHITE, lineHeightFactor: 1.12 }));
    push(textBlock(b.tagline || b.website, { maxWidth, maxHeight: (bottom - top) * 0.35, maxLines: 2, fontSize: 7.5, minFontSize: 6, fontFamily: fonts.body, color: [212, 212, 216] }));
    gaps.push(2.2);
  } else if (backStyle === "solid") {
    els.push({ kind: "rect", x: 0, y: 0, w: W, h: H, fill: accent });
    const on = textOn(accent);
    const soft = mix(on, accent, 0.25);
    push(textBlock(b.tagline, { maxWidth, maxHeight: lineHeightMm(7) * 2, maxLines: 2, fontSize: 7, minFontSize: 6, fontFamily: fonts.body, color: soft }));
    push(textBlock(b.website || b.title, { maxWidth, maxLines: 1, fontSize: 12, minFontSize: 7, fontStyle: "bold", fontFamily: fonts.heading, color: on }));
    gaps.push(2.4);
  } else {
    // Logo centred (or a monogram when there is no logo), company in spaced capitals.
    if (logo) {
      const f = fitContain(logo.w, logo.h, { x: 0, y: 0, w: Math.min(44, W - 20), h: 17 });
      blocks.push({ h: f.h, place: (y) => els.push({ kind: "image", which: "logo", x: W / 2 - f.w / 2, y, w: f.w, h: f.h }) });
    } else if (b.initials) {
      const r = 8;
      const opts: FittedTextOptions = { x: W / 2, y: 0, maxWidth: r * 1.5, maxLines: 1, fontSize: 17, minFontSize: 9, fontStyle: "bold", fontFamily: fonts.heading, align: "center", color: textOn(accent), lineHeightFactor: 1 };
      const layout = fit(b.initials, opts);
      blocks.push({
        h: 2 * r,
        place: (y) => {
          els.push({ kind: "circle", cx: W / 2, cy: y + r, r, fill: accent });
          const ty = y + r - layout.fontSize * PT_TO_MM * 0.85 + (layout.fontSize * PT_TO_MM * 0.72) / 2;
          els.push({ kind: "text", text: b.initials, opts: { ...opts, y: ty }, layout });
        },
      });
    }
    gaps.push(3.4);
    push(textBlock(b.title.toUpperCase(), { maxWidth, maxLines: 1, fontSize: 7, minFontSize: 5.5, fontStyle: "bold", fontFamily: fonts.body, color: INK }, SPACED_EM));
    gaps.push(1.4);
    push(textBlock(b.tagline, { maxWidth, maxLines: 1, fontSize: 6.5, minFontSize: 5.5, fontFamily: fonts.body, color: MUTED }));
  }

  // Centre the stacked blocks vertically.
  const gapAt = (i: number) => gaps[Math.min(i, gaps.length - 1)] ?? 2;
  const total = blocks.reduce((s, bl, i) => s + bl.h + (i ? gapAt(i - 1) : 0), 0);
  let y = Math.max(top, (top + bottom) / 2 - total / 2);
  blocks.forEach((bl, i) => {
    if (i) y += gapAt(i - 1);
    bl.place(y);
    y += bl.h;
  });
  return els;
}

/* Canvas text measurement (mm) used by the preview and for non-Latin text in the PDF. */
let measureCanvas: HTMLCanvasElement | null = null;
function canvasMeasure(style: FittedTextOptions["fontStyle"], stack: string) {
  const weight = style === "bold" || style === "bolditalic" ? "700" : "400";
  const italic = style === "italic" || style === "bolditalic" ? "italic " : "";
  return (t: string, sizePt: number) => {
    if (typeof document === "undefined") return t.length * sizePt * PT_TO_MM * 0.55;
    measureCanvas ??= document.createElement("canvas");
    const ctx = measureCanvas.getContext("2d");
    if (!ctx) return t.length * sizePt * PT_TO_MM * 0.55;
    ctx.font = `${italic}${weight} ${sizePt * PT_TO_MM * 10}px ${stack}`;
    return ctx.measureText(t).width / 10;
  };
}

type MeasureMm = (t: string, sizePt: number) => number;
const withTracking = (m: MeasureMm, trackEm: number): MeasureMm =>
  trackEm ? (t, s) => m(t, s) + t.length * trackEm * s * PT_TO_MM : m;

const previewFit: FitFn = (text, opts, trackEm = 0) => {
  const family = opts.fontFamily ?? "helvetica";
  const safe = isPdfSafeText(text);
  return layoutFittedText(text, opts, withTracking(canvasMeasure(opts.fontStyle, cssStack(family, text)), safe ? trackEm : 0));
};

/** Rough deterministic layout used before hydration so SSR and first client render match. */
const approxFit: FitFn = (text, opts, trackEm = 0) =>
  layoutFittedText(text, opts, withTracking((t, s) => t.length * s * PT_TO_MM * 0.55, trackEm));

function pdfFitFor(doc: import("jspdf").jsPDF): FitFn {
  return (text, opts, trackEm = 0) => {
    const style = opts.fontStyle ?? "normal";
    const family = opts.fontFamily ?? "helvetica";
    if (isPdfSafeText(text)) {
      const m: MeasureMm = (t, s) => {
        doc.setFont(family, style);
        doc.setFontSize(s);
        return doc.getTextWidth(t);
      };
      return layoutFittedText(text, opts, withTracking(m, trackEm));
    }
    return layoutFittedText(text, opts, canvasMeasure(style, UNICODE_STACKS[family]));
  };
}

const RASTER_PX_PER_MM = 16;
/**
 * Rasterises non-Latin text (e.g. "Ünïcödé 株式会社") with vertical padding so accents on capitals
 * and tall CJK glyphs are not clipped. Uses the same font stack the layout was measured with.
 */
function rasterTextPdf(doc: import("jspdf").jsPDF, el: Extract<CardEl, { kind: "text" }>, ox: number, oy: number) {
  if (typeof document === "undefined") return false;
  const { opts, layout } = el;
  if (!layout.lines.length) return true;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  const k = RASTER_PX_PER_MM;
  const style = opts.fontStyle ?? "normal";
  const weight = style === "bold" || style === "bolditalic" ? "700" : "400";
  const italic = style === "italic" || style === "bolditalic" ? "italic " : "";
  const font = `${italic}${weight} ${layout.fontSize * PT_TO_MM * k}px ${UNICODE_STACKS[opts.fontFamily ?? "helvetica"]}`;
  const pad = layout.fontSize * PT_TO_MM * 0.4;
  const wMm = Math.max(0.5, layout.widthMm) + 0.4;
  const hMm = layout.heightMm + 2 * pad;
  canvas.width = Math.ceil(wMm * k);
  canvas.height = Math.ceil(hMm * k);
  ctx.font = font;
  const color = opts.color ?? INK;
  ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  ctx.textBaseline = "top";
  const align = opts.align ?? "left";
  ctx.textAlign = align;
  const anchorX = align === "left" ? 0.2 * k : align === "center" ? canvas.width / 2 : canvas.width - 0.2 * k;
  layout.lines.forEach((line, i) => ctx.fillText(line, anchorX, (pad + i * layout.lineHeightMm) * k));
  const x = ox + opts.x;
  const left = align === "left" ? x - 0.2 : align === "center" ? x - canvas.width / k / 2 : x - canvas.width / k + 0.2;
  doc.addImage(canvas.toDataURL("image/png"), "PNG", left, oy + opts.y - pad, canvas.width / k, canvas.height / k);
  return true;
}

function drawCardElsPdf(
  doc: import("jspdf").jsPDF,
  els: CardEl[],
  ox: number,
  oy: number,
  images: { logo?: string; qr?: string }
) {
  for (const el of els) {
    if (el.kind === "rect") {
      doc.setFillColor(el.fill[0], el.fill[1], el.fill[2]);
      doc.rect(ox + el.x, oy + el.y, el.w, el.h, "F");
    } else if (el.kind === "circle") {
      doc.setFillColor(el.fill[0], el.fill[1], el.fill[2]);
      doc.circle(ox + el.cx, oy + el.cy, el.r, "F");
    } else if (el.kind === "frame") {
      doc.setDrawColor(el.stroke[0], el.stroke[1], el.stroke[2]);
      doc.setLineWidth(el.lineWidth);
      doc.rect(ox + el.x, oy + el.y, el.w, el.h);
    } else if (el.kind === "image") {
      const src = images[el.which];
      if (src) doc.addImage(src, "PNG", ox + el.x, oy + el.y, el.w, el.h);
    } else if (el.trackEm && isPdfSafeText(el.text)) {
      // Letter-spaced Latin line: drawn directly so jsPDF's charSpace matches CSS letter-spacing.
      const { opts, layout } = el;
      const color = opts.color ?? INK;
      doc.setFont(opts.fontFamily ?? "helvetica", opts.fontStyle ?? "normal");
      doc.setFontSize(layout.fontSize);
      doc.setTextColor(color[0], color[1], color[2]);
      const charSpace = el.trackEm * layout.fontSize * PT_TO_MM;
      layout.lines.forEach((line, i) => {
        doc.text(line, ox + opts.x, oy + opts.y + i * layout.lineHeightMm, { baseline: "top", charSpace });
      });
      doc.setCharSpace(0);
    } else if (!isPdfSafeText(el.text) && rasterTextPdf(doc, el, ox, oy)) {
      // drawn as an image (non-Latin text)
    } else {
      drawFittedText(doc, el.text, { ...el.opts, x: ox + el.opts.x, y: oy + el.opts.y });
    }
  }
}

/**
 * Crop marks drawn on the cut lines. Marks always sit outside the outer edge of the
 * grid; marks between cards are only added when the gap is wide enough that they
 * cannot collide with each other or with the neighbouring card.
 */
function drawGridCropMarks(
  doc: import("jspdf").jsPDF,
  g: { startX: number; startY: number; sheet: SheetPreset; paperW: number; paperH: number }
) {
  const OFF = 1;
  const LEN = 3;
  const SAFE = PRINTER_SAFE_MARGIN_MM;
  const { startX, startY, sheet, paperW, paperH } = g;
  const { cols, rows, cardW, cardH, gapX, gapY } = sheet;
  const gridR = startX + cols * cardW + (cols - 1) * gapX;
  const gridB = startY + rows * cardH + (rows - 1) * gapY;
  const uniq = (v: number[]) => Array.from(new Set(v.map((n) => Math.round(n * 100) / 100)));
  const xs = uniq(Array.from({ length: cols }, (_, c) => startX + c * (cardW + gapX)).flatMap((x) => [x, x + cardW]));
  const ys = uniq(Array.from({ length: rows }, (_, r) => startY + r * (cardH + gapY)).flatMap((y) => [y, y + cardH]));

  // Outward mark from `from` towards a paper edge; keeps PRINTER_SAFE_MARGIN_MM where possible.
  const outward = (from: number, dir: -1 | 1, paperLen: number): [number, number] | null => {
    const start = from + dir * OFF;
    const limit = dir < 0 ? SAFE : paperLen - SAFE;
    let end = start + dir * LEN;
    end = dir < 0 ? Math.max(end, limit) : Math.min(end, limit);
    if (Math.abs(end - start) < 1) {
      const hard = dir < 0 ? 0.5 : paperLen - 0.5;
      end = dir < 0 ? Math.max(start - LEN, hard) : Math.min(start + LEN, hard);
    }
    return Math.abs(end - start) >= 0.8 ? [start, end] : null;
  };

  doc.setDrawColor(113, 113, 122);
  doc.setLineWidth(0.2);
  for (const x of xs) {
    const t = outward(startY, -1, paperH);
    if (t) doc.line(x, t[0], x, t[1]);
    const b = outward(gridB, 1, paperH);
    if (b) doc.line(x, b[0], x, b[1]);
  }
  for (const y of ys) {
    const l = outward(startX, -1, paperW);
    if (l) doc.line(l[0], y, l[1], y);
    const r = outward(gridR, 1, paperW);
    if (r) doc.line(r[0], y, r[1], y);
  }

  const innerFits = (gap: number) => gap >= 2 * (OFF + LEN);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * (cardW + gapX);
      const y = startY + r * (cardH + gapY);
      if (innerFits(gapX)) {
        for (const yy of [y, y + cardH]) {
          if (c > 0) doc.line(x - OFF - LEN, yy, x - OFF, yy);
          if (c < cols - 1) doc.line(x + cardW + OFF, yy, x + cardW + OFF + LEN, yy);
        }
      }
      if (innerFits(gapY)) {
        for (const xx of [x, x + cardW]) {
          if (r > 0) doc.line(xx, y - OFF - LEN, xx, y - OFF);
          if (r < rows - 1) doc.line(xx, y + cardH + OFF, xx, y + cardH + OFF + LEN);
        }
      }
    }
  }
}

/* ------------------------------------------------------------------------- */
/* Preview rendering of the same layout                                       */
/* ------------------------------------------------------------------------- */

const noopSubscribe = () => () => {};

function CardFacePreview({
  W,
  H,
  els,
  images,
  label,
}: {
  W: number;
  H: number;
  els: CardEl[];
  images: { logo?: string; qr?: string };
  label: string;
}) {
  const px = (v: number) => `${(v / W) * 100}%`;
  const py = (v: number) => `${(v / H) * 100}%`;
  const cq = (mm: number) => `${(mm / W) * 100}cqw`;
  return (
    <>
      {els.map((el, idx) => {
        if (el.kind === "rect") {
          return (
            <div
              key={idx}
              aria-hidden="true"
              className="absolute"
              style={{ left: px(el.x), top: py(el.y), width: px(el.w), height: py(el.h), backgroundColor: rgbCss(el.fill) }}
            />
          );
        }
        if (el.kind === "circle") {
          return (
            <div
              key={idx}
              aria-hidden="true"
              className="absolute rounded-full"
              style={{
                left: px(el.cx - el.r),
                top: py(el.cy - el.r),
                width: px(2 * el.r),
                height: py(2 * el.r),
                backgroundColor: rgbCss(el.fill),
              }}
            />
          );
        }
        if (el.kind === "frame") {
          return (
            <div
              key={idx}
              aria-hidden="true"
              className="absolute"
              style={{
                left: px(el.x),
                top: py(el.y),
                width: px(el.w),
                height: py(el.h),
                border: `max(1px, ${cq(el.lineWidth)}) solid ${rgbCss(el.stroke)}`,
              }}
            />
          );
        }
        if (el.kind === "image") {
          const src = images[el.which];
          if (!src) return null;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={idx}
              src={src}
              alt={el.which === "logo" ? "Uploaded company logo" : "Generated QR Code"}
              className="absolute"
              style={{ left: px(el.x), top: py(el.y), width: px(el.w), height: py(el.h) }}
            />
          );
        }
        const { opts, layout } = el;
        const stack = cssStack(opts.fontFamily ?? "helvetica", el.text);
        const trackMm = el.trackEm ? el.trackEm * layout.fontSize * PT_TO_MM : 0;
        return layout.lines.map((line, i) => (
          <div
            key={`${idx}-${i}`}
            className="absolute whitespace-nowrap"
            style={{
              top: py(opts.y + i * layout.lineHeightMm),
              ...(opts.align === "center"
                ? { left: px(opts.x), transform: "translateX(-50%)" }
                : opts.align === "right"
                  ? { right: px(W - opts.x) }
                  : { left: px(opts.x) }),
              fontSize: cq(layout.fontSize * PT_TO_MM),
              lineHeight: 1,
              fontFamily: stack,
              fontWeight: opts.fontStyle === "bold" || opts.fontStyle === "bolditalic" ? 700 : 400,
              fontStyle: opts.fontStyle === "italic" || opts.fontStyle === "bolditalic" ? "italic" : undefined,
              letterSpacing: trackMm ? cq(trackMm) : undefined,
              color: rgbCss(opts.color ?? [24, 24, 27]),
            }}
          >
            {line}
          </div>
        ));
      })}
      <span className="sr-only">{label}</span>
    </>
  );
}

/* ------------------------------------------------------------------------- */
/* Sheet geometry shared by the PDF export and the whole-sheet thumbnail      */
/* ------------------------------------------------------------------------- */

function sheetGeometry(sheet: SheetPreset, paperW: number, paperH: number) {
  const gridW = sheet.cols * sheet.cardW + (sheet.cols - 1) * sheet.gapX;
  const gridH = sheet.rows * sheet.cardH + (sheet.rows - 1) * sheet.gapY;
  const startX = (paperW - gridW) / 2;
  const startY = (paperH - gridH) / 2;
  const cells: Array<[number, number]> = [];
  for (let r = 0; r < sheet.rows; r++) {
    for (let c = 0; c < sheet.cols; c++) {
      cells.push([startX + c * (sheet.cardW + sheet.gapX), startY + r * (sheet.cardH + sheet.gapY)]);
    }
  }
  return { gridW, gridH, startX, startY, cells };
}

const PAPER_SHORT: Record<SheetPreset["paper"], string> = { a4: "A4", letter: "US Letter" };

/* ------------------------------------------------------------------------- */
/* Small UI pieces                                                            */
/* ------------------------------------------------------------------------- */

const STYLE_OPTIONS: Array<{ id: CardStyleId; label: string; hint: string }> = [
  { id: "minimal", label: "Modern", hint: "Colour bar on top" },
  { id: "clean", label: "Minimal", hint: "Airy, with a thin accent line" },
  { id: "classic", label: "Classic", hint: "Centred with a frame" },
  { id: "bold-logo", label: "Bold", hint: "Colour stripe on the side" },
  { id: "split", label: "Split", hint: "Colour panel with initials or logo" },
  { id: "monogram", label: "Monogram", hint: "Centred, initials in a circle" },
  { id: "dark", label: "Dark", hint: "Light text on a dark card" },
  { id: "blank", label: "Blank", hint: "Empty outlines to fill in" },
];

const FONT_OPTIONS: Array<{ id: FontPairId; hint: string }> = [
  { id: "modern", hint: "Clean sans-serif" },
  { id: "classic", hint: "Traditional serif" },
  { id: "editorial", hint: "Serif name, sans details" },
  { id: "typewriter", hint: "Monospaced" },
];

const COLOR_PRESETS: Array<{ name: string; hex: string }> = [
  { name: "Forest green", hex: "#3f6212" },
  { name: "Navy", hex: "#1e3a8a" },
  { name: "Teal", hex: "#0f766e" },
  { name: "Burgundy", hex: "#9f1239" },
  { name: "Terracotta", hex: "#c2410c" },
  { name: "Plum", hex: "#6b21a8" },
  { name: "Mustard", hex: "#a16207" },
  { name: "Graphite", hex: "#3f3f46" },
];

const BACK_OPTIONS: Array<{ id: BackStyleId; label: string; hint: string }> = [
  { id: "logo", label: "Logo centred", hint: "Your logo (or initials) on white" },
  { id: "tagline", label: "Company + tagline", hint: "Name and tagline on dark" },
  { id: "solid", label: "Solid colour", hint: "Your colour with the website" },
];

/** Tiny CSS mock-up of a card style, drawn in the current accent colour. */
function StyleThumb({ id, accent }: { id: CardStyleId; accent: string }) {
  const line = (w: string, extra = "") => (
    <span className={`block h-[3px] rounded-full bg-zinc-300 ${extra}`} style={{ width: w }} />
  );
  return (
    <span
      aria-hidden="true"
      className={`relative block w-full overflow-hidden rounded-[5px] bg-white ${
        id === "blank" ? "border border-dashed border-zinc-300" : "ring-1 ring-zinc-200"
      }`}
      style={{ aspectRatio: "90 / 55" }}
    >
      {id === "minimal" && (
        <>
          <span className="absolute inset-x-0 top-0 h-[5%]" style={{ backgroundColor: accent }} />
          <span className="absolute left-[9%] top-[22%] flex w-full flex-col gap-[3px]">
            <span className="block h-[4px] w-[45%] rounded-full bg-zinc-800" />
            <span className="block h-[3px] w-[32%] rounded-full" style={{ backgroundColor: accent }} />
          </span>
          <span className="absolute bottom-[12%] left-[9%] flex w-full flex-col gap-[3px]">
            {line("38%")}
            {line("48%")}
          </span>
        </>
      )}
      {id === "classic" && (
        <>
          <span className="absolute inset-[6%] rounded-[2px] border" style={{ borderColor: accent }} />
          <span className="absolute inset-x-0 top-[24%] flex flex-col items-center gap-[3px]">
            <span className="block h-[4px] w-[42%] rounded-full bg-zinc-800" />
            <span className="block h-[3px] w-[30%] rounded-full" style={{ backgroundColor: accent }} />
          </span>
          <span className="absolute inset-x-0 bottom-[17%] flex flex-col items-center gap-[3px]">
            {line("36%")}
            {line("44%")}
          </span>
        </>
      )}
      {id === "clean" && (
        <>
          <span className="absolute left-[11%] top-[17%] block h-[2px] w-[26%] rounded-full bg-zinc-400" />
          <span className="absolute left-[11%] top-[29%] flex w-full flex-col gap-[3px]">
            <span className="block h-[4px] w-[40%] rounded-full bg-zinc-800" />
            <span className="block h-[3px] w-[28%] rounded-full" style={{ backgroundColor: accent }} />
          </span>
          <span className="absolute bottom-[34%] left-[11%] block h-[1.5px] w-[10%]" style={{ backgroundColor: accent }} />
          <span className="absolute bottom-[13%] left-[11%] flex w-full flex-col gap-[3px]">
            {line("34%")}
            {line("42%")}
          </span>
        </>
      )}
      {id === "split" && (
        <>
          <span className="absolute inset-y-0 left-0 flex w-[34%] items-center justify-center text-[11px] font-bold text-white" style={{ backgroundColor: accent }}>
            AM
          </span>
          <span className="absolute left-[42%] top-[18%] flex w-full flex-col gap-[3px]">
            <span className="block h-[4px] w-[30%] rounded-full bg-zinc-800" />
            <span className="block h-[3px] w-[22%] rounded-full" style={{ backgroundColor: accent }} />
          </span>
          <span className="absolute bottom-[13%] left-[42%] flex w-full flex-col gap-[3px]">
            {line("28%")}
            {line("36%")}
          </span>
        </>
      )}
      {id === "monogram" && (
        <>
          <span className="absolute left-1/2 top-[9%] block h-[22%] -translate-x-1/2 rounded-full" style={{ backgroundColor: accent, aspectRatio: "1" }} />
          <span className="absolute inset-x-0 top-[40%] flex flex-col items-center gap-[3px]">
            <span className="block h-[4px] w-[40%] rounded-full bg-zinc-800" />
            <span className="block h-[3px] w-[28%] rounded-full" style={{ backgroundColor: accent }} />
          </span>
          <span className="absolute inset-x-0 bottom-[11%] flex flex-col items-center gap-[3px]">
            {line("34%")}
            {line("42%")}
          </span>
        </>
      )}
      {id === "dark" && (
        <span className="absolute inset-0 bg-zinc-900">
          <span className="absolute left-[10%] top-[17%] block h-[17%] w-[2px]" style={{ backgroundColor: accent, filter: "brightness(1.6)" }} />
          <span className="absolute left-[15%] top-[18%] flex w-full flex-col gap-[3px]">
            <span className="block h-[4px] w-[40%] rounded-full bg-white" />
            <span className="block h-[3px] w-[28%] rounded-full" style={{ backgroundColor: accent, filter: "brightness(1.6)" }} />
          </span>
          <span className="absolute bottom-[13%] left-[10%] flex w-full flex-col gap-[3px]">
            <span className="block h-[3px] w-[34%] rounded-full bg-zinc-500" />
            <span className="block h-[3px] w-[42%] rounded-full bg-zinc-500" />
          </span>
        </span>
      )}
      {id === "bold-logo" && (
        <>
          <span className="absolute inset-y-0 left-0 w-[5%]" style={{ backgroundColor: accent }} />
          <span className="absolute left-[13%] top-[16%] flex w-full flex-col gap-[3px]">
            <span className="block h-[4px] w-[45%] rounded-full bg-zinc-800" />
            <span className="block h-[3px] w-[32%] rounded-full" style={{ backgroundColor: accent }} />
          </span>
          <span className="absolute right-[8%] top-[14%] h-[22%] w-[18%] rounded-[2px] bg-zinc-200" />
          <span className="absolute bottom-[12%] left-[13%] flex w-full flex-col gap-[3px]">
            {line("38%")}
            {line("48%")}
          </span>
        </>
      )}
    </span>
  );
}

/** Compact "file is loaded" row with a thumbnail, Replace and Remove. */
function LoadedFileRow({
  src,
  name,
  fallbackName,
  accept,
  replaceLabel,
  onReplace,
  onRemove,
  thumbAspect,
}: {
  src: string;
  name: string;
  fallbackName: string;
  accept: string;
  replaceLabel: string;
  onReplace: (file: File | undefined) => void;
  onRemove: () => void;
  thumbAspect?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-[#f5f5f7] p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="h-11 w-auto max-w-[80px] shrink-0 rounded-md bg-white object-contain ring-1 ring-zinc-200"
        style={thumbAspect ? { aspectRatio: thumbAspect, objectFit: "cover" } : undefined}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-zinc-950">{name || fallbackName}</p>
        <p className="text-xs text-[#3f6212]">Added</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          aria-label={replaceLabel}
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            onReplace(f);
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`${secondaryButtonClass} bg-white hover:bg-[#ebeced]`}
        >
          <RefreshCw aria-hidden="true" className="h-4 w-4" />
          Replace
        </button>
        <button
          type="button"
          onClick={onRemove}
          className={`${secondaryButtonClass} bg-white hover:bg-[#ebeced]`}
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
          Remove
        </button>
      </div>
    </div>
  );
}

const inputClass =
  "w-full min-h-[44px] rounded-xl bg-[#f5f5f7] px-3.5 py-2.5 text-base sm:text-sm text-zinc-950 placeholder:text-zinc-400 focus:bg-white focus:outline-2 focus:outline-[#4d7c0f]";
const labelClass = "block text-xs font-semibold text-zinc-800 mb-1.5";
const checkRowClass =
  "flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl bg-[#f5f5f7] px-3.5 py-2.5 text-sm font-medium text-zinc-900 hover:bg-[#ebeced]";

/* ------------------------------------------------------------------------- */
/* Tool                                                                       */
/* ------------------------------------------------------------------------- */

export function BusinessCardTool({ pageId }: { pageId: PageId }) {
  const init = getInitialConfig(pageId);
  const [mode, setMode] = useState<"design" | "upload">(init.mode);
  const [sheetId, setSheetId] = useState<SheetPresetId>(init.sheet);
  const [styleId, setStyleId] = useState<CardStyleId>(init.style);

  const [fullName, setFullName] = useState("Alex Morgan");
  const [role, setRole] = useState("Independent Print Designer");
  const [company, setCompany] = useState("Northlight Studio");
  const [phone, setPhone] = useState("+1 (555) 234-8910");
  const [email, setEmail] = useState("alex@northlight.example");
  const [website, setWebsite] = useState("northlight.example");
  const [accentHex, setAccentHex] = useState("#3f6212");
  const [includeBack, setIncludeBack] = useState(false);
  const [fontPairId, setFontPairId] = useState<FontPairId>("modern");
  const [backStyle, setBackStyle] = useState<BackStyleId>("tagline");
  const [tagline, setTagline] = useState("Brand identity, packaging and print layouts.");
  const [includeQr, setIncludeQr] = useState(!!init.qr);
  const [qrState, setQrState] = useState<{ target: string; url: string }>({ target: "", url: "" });
  const [uploadedFront, setUploadedFront] = useState<string | null>(null);
  const [uploadedName, setUploadedName] = useState<string>("");
  const [logo, setLogo] = useState<{ src: string; w: number; h: number; name: string } | null>(null);
  const [showCropMarks, setShowCropMarks] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState<ToolStatusValue | null>(null);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [previewSide, setPreviewSide] = useState<"front" | "back">("front");

  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const uid = useId();

  const sheet = SHEET_PRESETS[sheetId];
  const paper = PAPER_SIZES[sheet.paper];
  const paperShort = PAPER_SHORT[sheet.paper];
  const cardCount = sheet.cols * sheet.rows;
  const isBlank = styleId === "blank";
  const canBack = mode === "design" && !isBlank;
  const backOn = includeBack && canBack;
  const side = backOn ? previewSide : "front";
  const needsUpload = mode === "upload" && !uploadedFront;
  const accent = hexToRgb(accentHex);
  const geo = sheetGeometry(sheet, paper.widthMm, paper.heightMm);

  // QR target: website → URL, else email → mailto:, else phone → tel:. Never a placeholder.
  const qrTarget = useMemo(() => {
    const w = website.trim();
    if (w) return /^https?:\/\//i.test(w) ? w : `https://${w}`;
    const e = email.trim();
    if (e) return `mailto:${e}`;
    const p = phone.replace(/[^\d+]/g, "");
    if (p) return `tel:${p}`;
    return "";
  }, [website, email, phone]);

  useEffect(() => {
    if (!includeQr || !qrTarget) return;
    let cancelled = false;
    import("qrcode")
      .then((QRCode) =>
        QRCode.toDataURL(qrTarget, {
          width: 240,
          margin: 1,
          color: { dark: "#09090b", light: "#ffffff" },
        })
      )
      .then((url) => {
        if (!cancelled) setQrState({ target: qrTarget, url });
      })
      .catch(() => {
        if (!cancelled) setQrState({ target: qrTarget, url: "" });
      });
    return () => {
      cancelled = true;
    };
  }, [includeQr, qrTarget]);

  const qrDataUrl = includeQr && qrTarget && qrState.target === qrTarget ? qrState.url : "";
  const showQr = !isBlank && !!qrDataUrl;

  const content: CardContent = { fullName, role, company, phone, email, website };
  const pair = FONT_PAIRS[fontPairId];
  const fonts: Fonts = { heading: pair.heading, body: pair.body };
  const backContent = {
    title: company.trim() || fullName.trim(),
    tagline: tagline.trim(),
    website: website.trim(),
    initials: initialsOf(fullName, company),
  };
  const isDarkDesign = (!isBlank && mode === "design" && styleId === "dark") || (backOn && backStyle !== "logo");

  const fit = hydrated ? previewFit : approxFit;
  const frontEls = isBlank
    ? []
    : layoutCardFront(sheet.cardW, sheet.cardH, styleId, accent, content, logo, showQr, fit, fonts);
  const backEls = backOn
    ? layoutCardBack(sheet.cardW, sheet.cardH, backStyle, accent, backContent, logo, fit, fonts)
    : [];
  const previewImages = { logo: logo?.src, qr: qrDataUrl || undefined };
  const frontLabel = [fullName, role, company, phone, email, website].filter((s) => s.trim()).join(", ");
  const backLabel = [
    backStyle === "logo" ? (logo ? "Logo" : backContent.initials) : "",
    backStyle === "solid" ? backContent.website || backContent.title : backContent.title,
    backContent.tagline || (backStyle === "tagline" ? backContent.website : ""),
  ]
    .filter(Boolean)
    .join(", ");

  const clearStatus = () => setStatus(null);

  async function acceptCardFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus({ tone: "error", text: "That file isn't an image. Please choose a PNG or JPG." });
      return;
    }
    try {
      setUploadedFront(await fileToDataUrl(file));
      setUploadedName(file.name);
      setMode("upload");
      setStatus(null);
    } catch {
      setStatus({ tone: "error", text: "Could not read that image. Try a PNG or JPG." });
    }
  }

  async function acceptLogoFile(file: File | undefined) {
    if (!file) return;
    try {
      const raw = await fileToDataUrl(file);
      const img = await loadImageElement(raw);
      const w = img.naturalWidth || 300;
      const h = img.naturalHeight || 150;
      // Normalise to PNG so jsPDF accepts any format (JPG, WebP, SVG) and keeps transparency.
      const scale = Math.min(1, 1200 / Math.max(w, h));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(w * scale));
      canvas.height = Math.max(1, Math.round(h * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setLogo({ src: canvas.toDataURL("image/png"), w, h, name: file.name });
      setStatus(null);
    } catch {
      setStatus({ tone: "error", text: "Could not read that logo. Try a PNG or JPG." });
    }
  }

  async function handleDownloadPdf() {
    if (needsUpload) return;
    setIsExporting(true);
    setStatus(null);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [paper.widthMm, paper.heightMm],
      });
      const pdfFit = pdfFitFor(doc);
      const { startX, startY, cells } = geo;
      const marks = () =>
        showCropMarks &&
        drawGridCropMarks(doc, { startX, startY, sheet, paperW: paper.widthMm, paperH: paper.heightMm });

      if (mode === "upload" && uploadedFront) {
        const prepared = await renderImageToBoxDataUrl(uploadedFront, sheet.cardW / sheet.cardH, "cover");
        for (const [x, y] of cells) {
          doc.addImage(prepared.dataUrl, prepared.format, x, y, sheet.cardW, sheet.cardH);
        }
      } else {
        const els = isBlank
          ? []
          : layoutCardFront(sheet.cardW, sheet.cardH, styleId, accent, content, logo, showQr, pdfFit, fonts);
        const images = { logo: logo?.src, qr: qrDataUrl || undefined };
        for (const [x, y] of cells) {
          doc.setFillColor(255, 255, 255);
          doc.rect(x, y, sheet.cardW, sheet.cardH, "F");
          if (isBlank) {
            doc.setDrawColor(212, 212, 216);
            doc.setLineWidth(0.2);
            doc.rect(x, y, sheet.cardW, sheet.cardH);
          } else {
            drawCardElsPdf(doc, els, x, y, images);
          }
        }
      }
      marks();

      if (backOn) {
        doc.addPage([paper.widthMm, paper.heightMm], "portrait");
        const els = layoutCardBack(sheet.cardW, sheet.cardH, backStyle, accent, backContent, logo, pdfFit, fonts);
        for (const [x, y] of cells) drawCardElsPdf(doc, els, x, y, { logo: logo?.src });
        marks();
      }

      doc.save(`business-cards-${pageId.toLowerCase()}-${sheet.paper}.pdf`);
      setStatus({
        tone: "success",
        text: backOn
          ? `Your PDF is downloaded: ${cardCount} card fronts on page 1 and the backs on page 2. Follow the print steps below.`
          : `Your PDF is downloaded: ${cardCount} cards on one ${paperShort} page. Follow the print steps below.`,
      });
      setTipsOpen(true);
    } catch (err) {
      setStatus({
        tone: "error",
        text: err instanceof Error ? `Sorry, the PDF could not be made: ${err.message}` : "Sorry, the PDF could not be made.",
      });
    } finally {
      setIsExporting(false);
    }
  }

  const recW = Math.round((sheet.cardW / 25.4) * 300);
  const recH = Math.round((sheet.cardH / 25.4) * 300);
  const sizeHint = `PNG or JPG · best at ${recW} × ${recH} px or larger (same shape as a ${sheet.cardW} × ${sheet.cardH} mm card) · stays on your device`;

  const downloadLabel = isExporting ? "Making your PDF…" : `Download PDF · ${cardCount} cards`;
  const downloadHintId = `${uid}-download-hint`;
  const downloadButton = (extra = "") => (
    <button
      type="button"
      onClick={handleDownloadPdf}
      disabled={isExporting || needsUpload}
      aria-describedby={needsUpload ? downloadHintId : undefined}
      className={`${primaryButtonClass} ${extra}`}
    >
      <Download aria-hidden="true" className="h-4 w-4" />
      {downloadLabel}
    </button>
  );

  const extraSteps: React.ReactNode[] = [
    <>
      Use thick card paper (250–300 gsm) and set paper type to <strong>&lsquo;Cardstock&rsquo;</strong> /{" "}
      <strong>&lsquo;Heavy&rsquo;</strong>.
    </>,
  ];
  if (backOn) {
    extraSteps.push(
      <>
        For the back: flip the sheet along the <strong>long edge</strong> and print page 2.
      </>
    );
  }
  if (isDarkDesign) {
    extraSteps.push(
      <>
        Dark or coloured cards: cut exactly on the guides, or a hair inside them, so no white edge shows. If your
        printer offers <strong>borderless</strong> printing, it gives the cleanest edges.
      </>
    );
  }

  const sheetStep = mode === "design" ? 3 : 2;
  const downloadStep = mode === "design" ? 4 : 3;

  /* ---- Preview pieces ---- */
  const cardFace = (which: "front" | "back") => {
    if (which === "back") {
      return <CardFacePreview W={sheet.cardW} H={sheet.cardH} els={backEls} images={{ logo: logo?.src }} label={backLabel} />;
    }
    if (mode === "upload") {
      return uploadedFront ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={uploadedFront} alt="Your card design" className="absolute inset-0 h-full w-full object-cover" />
      ) : null;
    }
    if (isBlank) return null;
    return <CardFacePreview W={sheet.cardW} H={sheet.cardH} els={frontEls} images={previewImages} label={frontLabel} />;
  };

  const pct = (v: number, total: number) => `${(v / total) * 100}%`;
  const markLen = 3;
  const sheetThumb = (
    <div
      className="relative w-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.06)]"
      style={{ aspectRatio: `${paper.widthMm} / ${paper.heightMm}` }}
      role="img"
      aria-label={`Whole ${paperShort} page with ${cardCount} cards in ${sheet.rows} rows of ${sheet.cols}`}
    >
      {geo.cells.map(([x, y], i) => (
        <div
          key={i}
          className={`absolute overflow-hidden ${
            side === "front" && needsUpload
              ? "border border-dashed border-zinc-300"
              : side === "front" && isBlank
                ? "ring-[0.5px] ring-zinc-300"
              : side === "front" && mode === "design"
                ? "ring-[0.5px] ring-zinc-200"
                : ""
          }`}
          style={{
            left: pct(x, paper.widthMm),
            top: pct(y, paper.heightMm),
            width: pct(sheet.cardW, paper.widthMm),
            height: pct(sheet.cardH, paper.heightMm),
            containerType: "inline-size",
          }}
          aria-hidden="true"
        >
          {cardFace(side)}
        </div>
      ))}
      {showCropMarks && (
        <div aria-hidden="true">
          {Array.from(new Set(geo.cells.flatMap(([x]) => [x, x + sheet.cardW]))).flatMap((x) => [
            [x, geo.startY - 1 - markLen],
            [x, geo.startY + geo.gridH + 1],
          ]).map(([x, y], i) => (
            <span
              key={`v${i}`}
              className="absolute w-px bg-zinc-500"
              style={{ left: pct(x, paper.widthMm), top: pct(y, paper.heightMm), height: pct(markLen, paper.heightMm) }}
            />
          ))}
          {Array.from(new Set(geo.cells.flatMap(([, y]) => [y, y + sheet.cardH]))).flatMap((y) => [
            [geo.startX - 1 - markLen, y],
            [geo.startX + geo.gridW + 1, y],
          ]).map(([x, y], i) => (
            <span
              key={`h${i}`}
              className="absolute h-px bg-zinc-500"
              style={{ left: pct(x, paper.widthMm), top: pct(y, paper.heightMm), width: pct(markLen, paper.widthMm) }}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div
      onChangeCapture={clearStatus}
      className="rounded-3xl bg-[#f5f5f7] p-2 sm:p-5 lg:p-6 space-y-2 sm:space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3.5">
        <div role="group" aria-label="How do you want to make your card?" className="flex flex-wrap items-center gap-1.5">
          {(
            [
              ["design", "Design my card here", Pencil],
              ["upload", "I already have a design", ImagePlus],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              aria-pressed={mode === id}
              onClick={() => {
                setMode(id);
                clearStatus();
              }}
              className={`min-h-[42px] inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition cursor-pointer ${
                mode === id ? "bg-[#4d7c0f] text-white" : "bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced]"
              }`}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
        <div className="text-xs text-zinc-600">
          {cardCount} cards per {paperShort} page · each {sheet.cardW} × {sheet.cardH} mm
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-5 items-start">
        {/* ---------------- Controls ---------------- */}
        <div className="order-2 lg:order-1 lg:col-span-5 rounded-2xl bg-white p-4 sm:p-6 space-y-7">
          {mode === "upload" ? (
            <section aria-labelledby={`${uid}-s1`}>
              <StepHeader
                id={`${uid}-s1`}
                step={1}
                title="Upload your card design"
                hint="Use a finished card picture, e.g. exported from Canva or Photoshop. We repeat it across the page."
              />
              {uploadedFront ? (
                <LoadedFileRow
                  src={uploadedFront}
                  name={uploadedName}
                  fallbackName="Your card design"
                  accept="image/jpeg,image/png,image/webp"
                  replaceLabel="Replace card design image"
                  onReplace={(f) => void acceptCardFile(f)}
                  onRemove={() => {
                    setUploadedFront(null);
                    setUploadedName("");
                    clearStatus();
                  }}
                  thumbAspect={`${sheet.cardW} / ${sheet.cardH}`}
                />
              ) : (
                <UploadDropzone
                  title="Choose your card design"
                  buttonLabel="Choose image"
                  inputLabel="Upload business card design"
                  hint={sizeHint}
                  onFiles={(files) => void acceptCardFile(files[0])}
                />
              )}
            </section>
          ) : (
            <>
              <section aria-labelledby={`${uid}-s1`}>
                <StepHeader
                  id={`${uid}-s1`}
                  step={1}
                  title="Your details"
                  hint="Type what should appear on the card. Leave a box empty to hide that line."
                />
                {isBlank ? (
                  <div className="space-y-3 rounded-2xl bg-[#f5f5f7] p-4">
                    <FieldHint>
                      You picked <strong>Blank</strong> cards — they print as empty outlines, so no details are
                      needed.
                    </FieldHint>
                    <button
                      type="button"
                      onClick={() => setStyleId("minimal")}
                      className={`${secondaryButtonClass} bg-white hover:bg-[#ebeced]`}
                    >
                      <Pencil aria-hidden="true" className="h-4 w-4" />
                      Add my details instead
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(
                        [
                          ["card-full-name", "Your name", fullName, setFullName, "text", "name"],
                          ["card-role", "Job title", role, setRole, "text", "organization-title"],
                          ["card-company", "Company", company, setCompany, "text", "organization"],
                          ["card-phone", "Phone", phone, setPhone, "tel", "tel"],
                          ["card-email", "Email", email, setEmail, "email", "email"],
                          ["card-website", "Website", website, setWebsite, "text", "url"],
                        ] as const
                      ).map(([id, label, value, setter, type, auto]) => (
                        <div key={id}>
                          <label htmlFor={id} className={labelClass}>
                            {label}
                          </label>
                          <input
                            id={id}
                            type={type}
                            autoComplete={auto}
                            value={value}
                            onChange={(e) => setter(e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className={labelClass}>Logo (optional)</p>
                      {logo ? (
                        <LoadedFileRow
                          src={logo.src}
                          name={logo.name}
                          fallbackName="Your logo"
                          accept="image/jpeg,image/png,image/webp,image/svg+xml"
                          replaceLabel="Replace company logo image"
                          onReplace={(f) => void acceptLogoFile(f)}
                          onRemove={() => {
                            setLogo(null);
                            clearStatus();
                          }}
                        />
                      ) : (
                        <UploadDropzone
                          compact
                          title="Add a logo"
                          buttonLabel="Choose logo"
                          inputLabel="Upload company logo image"
                          accept="image/jpeg,image/png,image/webp,image/svg+xml"
                          hint="PNG with a see-through background looks best"
                          onFiles={(files) => void acceptLogoFile(files[0])}
                        />
                      )}
                    </div>
                  </div>
                )}
              </section>

              <section aria-labelledby={`${uid}-s2`}>
                <StepHeader
                  id={`${uid}-s2`}
                  step={2}
                  title="Pick a style"
                  hint="Tap a design. You can change it any time — your details stay."
                />
                <div role="group" aria-label="Card style" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {STYLE_OPTIONS.map((st) => {
                    const active = styleId === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          setStyleId(st.id);
                          clearStatus();
                        }}
                        className={`relative flex flex-col gap-2 rounded-xl p-2 text-left transition cursor-pointer ${
                          active
                            ? "bg-[#eef6e4] ring-2 ring-[#4d7c0f]"
                            : "bg-[#f5f5f7] ring-1 ring-transparent hover:bg-[#ebeced]"
                        }`}
                      >
                        <StyleThumb id={st.id} accent={accentHex} />
                        <span className="px-0.5">
                          <span className="flex items-center gap-1 text-sm font-bold text-zinc-950">
                            {st.label}
                            {active && <Check aria-hidden="true" className="h-3.5 w-3.5 text-[#4d7c0f]" />}
                          </span>
                          <span className="block text-[11px] leading-snug text-zinc-600">{st.hint}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {!isBlank && (
                  <div className="mt-4 space-y-4">
                    {styleId === "dark" && (
                      <FieldHint>
                        Dark cards print ink right to the edge — cut exactly on the guides (or a hair inside) so no
                        white edge shows.
                      </FieldHint>
                    )}
                    <div role="group" aria-labelledby={`${uid}-font-label`}>
                      <p id={`${uid}-font-label`} className={labelClass}>
                        Font
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {FONT_OPTIONS.map((f) => {
                          const p = FONT_PAIRS[f.id];
                          const active = fontPairId === f.id;
                          return (
                            <button
                              key={f.id}
                              type="button"
                              aria-pressed={active}
                              onClick={() => setFontPairId(f.id)}
                              className={`flex min-h-[44px] flex-col items-start gap-0.5 rounded-xl px-3 py-2 text-left transition cursor-pointer ${
                                active
                                  ? "bg-[#eef6e4] ring-2 ring-[#4d7c0f]"
                                  : "bg-[#f5f5f7] ring-1 ring-transparent hover:bg-[#ebeced]"
                              }`}
                            >
                              <span className="text-lg font-bold leading-tight text-zinc-950" style={{ fontFamily: p.cssHeading }}>
                                Aa <span className="text-sm font-normal text-zinc-600" style={{ fontFamily: p.cssBody }}>Aa</span>
                              </span>
                              <span className="text-xs font-semibold text-zinc-900">{p.label}</span>
                              <span className="text-[11px] leading-snug text-zinc-600">{f.hint}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p id={`${uid}-colour-label`} className={labelClass}>
                        Colour
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <div role="group" aria-labelledby={`${uid}-colour-label`} className="flex flex-wrap gap-1.5">
                          {COLOR_PRESETS.map((cp) => {
                            const active = accentHex.toLowerCase() === cp.hex;
                            return (
                              <button
                                key={cp.hex}
                                type="button"
                                aria-pressed={active}
                                aria-label={cp.name}
                                title={cp.name}
                                onClick={() => setAccentHex(cp.hex)}
                                className={`grid h-10 w-10 place-items-center rounded-full transition cursor-pointer ${
                                  active ? "ring-2 ring-[#4d7c0f] ring-offset-2" : "ring-1 ring-black/10 hover:scale-105"
                                }`}
                                style={{ backgroundColor: cp.hex }}
                              >
                                {active && <Check aria-hidden="true" className="h-4 w-4 text-white" />}
                              </button>
                            );
                          })}
                        </div>
                        <label
                          htmlFor="card-accent-color"
                          className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl bg-[#f5f5f7] px-3 text-xs font-medium text-zinc-700 hover:bg-[#ebeced]"
                        >
                          Custom
                          <span className="font-mono text-zinc-600">{accentHex.toUpperCase()}</span>
                          <input
                            id="card-accent-color"
                            type="color"
                            value={accentHex}
                            onChange={(e) => setAccentHex(e.target.value)}
                            className="h-8 w-10 cursor-pointer rounded-md bg-white"
                          />
                        </label>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className={checkRowClass}>
                        <input
                          type="checkbox"
                          checked={includeQr}
                          onChange={(e) => setIncludeQr(e.target.checked)}
                          className="h-5 w-5 shrink-0 accent-[#4d7c0f]"
                        />
                        <QrCode aria-hidden="true" className="h-4 w-4 text-zinc-600" />
                        Add a QR code
                      </label>
                      <FieldHint tone={includeQr && !qrTarget ? "warning" : "muted"}>
                        {!includeQr
                          ? "People can scan it with their phone camera to open your website."
                          : qrTarget
                            ? `Scanning it opens: ${qrTarget}`
                            : "Add a website, email or phone number in step 1 so the QR code has somewhere to go."}
                      </FieldHint>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}

          <section aria-labelledby={`${uid}-s3`}>
            <StepHeader
              id={`${uid}-s3`}
              step={sheetStep}
              title="Sheet & paper"
              hint="Choose the paper you'll print on and how many cards fit on it."
            />
            <fieldset className="space-y-2">
              <legend className={labelClass}>Sheet layout</legend>
              {Object.values(SHEET_PRESETS).map((s) => {
                const active = s.id === sheetId;
                return (
                  <label
                    key={s.id}
                    className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition ${
                      active
                        ? "bg-[#eef6e4] font-semibold text-[#365314] ring-2 ring-[#4d7c0f]"
                        : "bg-[#f5f5f7] text-zinc-800 hover:bg-[#ebeced]"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`${uid}-sheet`}
                      value={s.id}
                      checked={active}
                      onChange={() => setSheetId(s.id)}
                      className="h-4 w-4 shrink-0 accent-[#4d7c0f]"
                    />
                    {s.label}
                  </label>
                );
              })}
              <FieldHint>{sheet.note}</FieldHint>
            </fieldset>

            <div className="mt-4 space-y-1.5">
              <label className={checkRowClass}>
                <input
                  type="checkbox"
                  checked={showCropMarks}
                  onChange={(e) => setShowCropMarks(e.target.checked)}
                  className="h-5 w-5 shrink-0 accent-[#4d7c0f]"
                />
                <Scissors aria-hidden="true" className="h-4 w-4 text-zinc-600" />
                Show cut guides
              </label>
              <FieldHint>
                Small lines printed outside the cards that show exactly where to cut. They are not printed on the
                cards themselves.
              </FieldHint>
            </div>

            {canBack && (
              <div className="mt-4 space-y-1.5">
                <label className={checkRowClass}>
                  <input
                    type="checkbox"
                    checked={includeBack}
                    onChange={(e) => {
                      setIncludeBack(e.target.checked);
                      setPreviewSide(e.target.checked ? "back" : "front");
                    }}
                    className="h-5 w-5 shrink-0 accent-[#4d7c0f]"
                  />
                  Also print the back (for double-sided printing)
                </label>
                <FieldHint>Print page 1, flip the paper, then print page 2.</FieldHint>
              </div>
            )}

            {backOn && (
              <div className="mt-3 grid grid-cols-1 gap-3 rounded-2xl bg-[#f5f5f7] p-3.5">
                <fieldset>
                  <legend className={labelClass}>Back design</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {BACK_OPTIONS.map((bo) => {
                      const active = backStyle === bo.id;
                      return (
                        <label
                          key={bo.id}
                          className={`flex min-h-[44px] cursor-pointer items-start gap-2.5 rounded-xl px-3 py-2.5 text-sm transition ${
                            active ? "bg-[#eef6e4] ring-2 ring-[#4d7c0f]" : "bg-white hover:bg-[#ebeced]"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`${uid}-back`}
                            value={bo.id}
                            checked={active}
                            onChange={() => {
                              setBackStyle(bo.id);
                              setPreviewSide("back");
                            }}
                            className="mt-0.5 h-4 w-4 shrink-0 accent-[#4d7c0f]"
                          />
                          <span>
                            <span className={`block font-semibold ${active ? "text-[#365314]" : "text-zinc-900"}`}>{bo.label}</span>
                            <span className="block text-[11px] leading-snug text-zinc-600">{bo.hint}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                <div>
                  <label htmlFor="card-back-tagline" className={labelClass}>
                    Tagline (optional)
                  </label>
                  <input
                    id="card-back-tagline"
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. what you do, in a few words"
                    className={`${inputClass} bg-white`}
                  />
                </div>
                {backStyle === "logo" && !logo && (
                  <FieldHint>No logo added, so your initials are shown. Add a logo in step 1 to use it here.</FieldHint>
                )}
              </div>
            )}
          </section>

          <section aria-labelledby={`${uid}-s4`} className="space-y-3">
            <StepHeader
              id={`${uid}-s4`}
              step={downloadStep}
              title="Download & print"
              hint={
                backOn
                  ? `You'll get a 2-page PDF: fronts on page 1, backs on page 2 (${paperShort}).`
                  : `You'll get a PDF with ${cardCount} cards on one ${paperShort} page.`
              }
            />
            {downloadButton("w-full")}
            {needsUpload && (
              <FieldHint id={downloadHintId}>Upload your card design in step 1 to turn on the download.</FieldHint>
            )}
            <ToolStatus status={status} />
            <PrintTipsPanel
              paperLabel={paperShort}
              open={tipsOpen}
              extraSteps={extraSteps}
              cutStep="Cut along the crop marks with a paper trimmer for straight edges."
            />
          </section>
        </div>

        {/* ---------------- Preview ---------------- */}
        <div className="order-1 lg:order-2 lg:col-span-7 lg:sticky lg:top-24 rounded-2xl bg-white p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-sm font-bold tracking-tight text-zinc-950">Preview</h3>
            {backOn && (
              <div role="tablist" aria-label="Card side" className="inline-flex rounded-xl bg-[#f5f5f7] p-1">
                {(["front", "back"] as const).map((s) => (
                  <button
                    key={s}
                    id={`${uid}-tab-${s}`}
                    type="button"
                    role="tab"
                    aria-selected={side === s}
                    aria-controls={`${uid}-panel`}
                    onClick={() => setPreviewSide(s)}
                    className={`min-h-[36px] rounded-lg px-4 text-sm font-semibold transition cursor-pointer ${
                      side === s ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    {s === "front" ? "Front" : "Back"}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            id={`${uid}-panel`}
            {...(backOn ? { role: "tabpanel", "aria-labelledby": `${uid}-tab-${side}` } : {})}
            className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-6 sm:gap-8"
          >
            {/* Close-up of one card */}
            <figure className="w-full max-w-[360px] sm:flex-1">
              {needsUpload ? (
                <div
                  className="flex flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed border-zinc-300 bg-[#fafafa] px-4 text-center"
                  style={{ aspectRatio: `${sheet.cardW} / ${sheet.cardH}` }}
                >
                  <ImagePlus aria-hidden="true" className="h-6 w-6 text-[#3f6212]" />
                  <span className="text-sm font-semibold text-zinc-900">Your card will appear here</span>
                  <span className="text-xs text-zinc-600">Upload your design in step 1</span>
                </div>
              ) : (
                <div
                  role="region"
                  aria-label={`One business card, ${side}`}
                  className={`relative overflow-hidden rounded-md bg-white shadow-sm ${
                    "ring-1 ring-zinc-300"
                  }`}
                  style={{ aspectRatio: `${sheet.cardW} / ${sheet.cardH}`, containerType: "inline-size" }}
                >
                  {side === "front" && isBlank ? (
                    <div className="h-full w-full flex items-center justify-center text-xs text-zinc-600">
                      Blank card outline
                    </div>
                  ) : (
                    cardFace(side)
                  )}
                </div>
              )}
              <figcaption className="mt-2 text-center text-xs text-zinc-600">
                One card, actual shape · {sheet.cardW} × {sheet.cardH} mm
                {backOn && (side === "front" ? " · page 1" : " · page 2")}
              </figcaption>
            </figure>

            {/* Whole sheet at scale */}
            <figure className="w-[170px] sm:w-[190px] shrink-0">
              <div className="rounded-xl bg-[#f5f5f7] p-3">{sheetThumb}</div>
              <figcaption className="mt-2 text-center text-xs text-zinc-600">
                Whole page · {paperShort} · {cardCount} cards
              </figcaption>
            </figure>
          </div>
        </div>
      </div>

      <MobileActionBar summary={`${cardCount} cards · ${paperShort}${backOn ? " · 2 pages" : ""}`}>
        {downloadButton("px-4")}
      </MobileActionBar>
    </div>
  );
}
