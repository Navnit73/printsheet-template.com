import type { PageId } from "@/types/spec";
import {
  drawFittedText,
  fitContain,
  FONT_PAIRS,
  isPdfSafeText,
  layoutFittedText,
  PRINTER_SAFE_MARGIN_MM,
  type FittedTextLayout,
  type FittedTextOptions,
  type PdfFontFamily,
} from "@/lib/pdf-utils";
import { getCardFont } from "./fonts";

export type SheetPresetId = "a4-10up" | "letter-10up" | "letter-8up" | "a4-8up";
export type CutGuideStyle = "dashed-grid" | "card-outline" | "crop-marks" | "none";
export type CardStyleId = "minimal" | "classic" | "bold-logo" | "clean" | "split" | "monogram" | "dark" | "blank";
export type FontPairId = "modern" | "classic" | "editorial" | "typewriter";
export type BackStyleId = "logo" | "tagline" | "solid";
export type RGB = [number, number, number];
export type SemanticFieldKey =
  | "fullName"
  | "role"
  | "company"
  | "phone"
  | "email"
  | "website"
  | "tagline"
  | "logo"
  | "qr"
  | "initials";

export type PatternKind = "dots" | "grid" | "diagonal" | "crosshatch" | "waves" | "diamonds";

export interface SheetPreset {
  id: SheetPresetId;
  label: string;
  /** Extra plain-language note shown under the picker. */
  note: string;
  paper: "a4" | "letter" | "a3";
  cols: number;
  rows: number;
  cardW: number;
  cardH: number;
  gapX: number;
  gapY: number;
}

export const SHEET_PRESETS: Record<SheetPresetId, SheetPreset> = {
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

export function getInitialConfig(pageId: PageId): {
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

export function hexToRgb(hex: string): RGB {
  const clean = (hex || "").replace("#", "").trim();
  const norm = clean.length === 3 ? clean.replace(/(.)/g, "$1$1") : clean.slice(0, 6);
  const num = parseInt(norm, 16);
  if (Number.isNaN(num)) return [77, 124, 15];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export const rgbCss = (c: RGB) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;

/* ------------------------------------------------------------------------- */
/* Card layout shared by the live preview and the PDF export (all units mm)   */
/* ------------------------------------------------------------------------- */

export const PT_TO_MM = 25.4 / 72;
export const INK: RGB = [9, 9, 11];
export const BODY_INK: RGB = [39, 39, 42];
export const MUTED: RGB = [113, 113, 122];
export const WHITE: RGB = [255, 255, 255];
export const DARK_BG: RGB = [24, 24, 27];

/* Same stacks pdf-utils uses for rasterised (non-Latin) text, so the preview matches the PDF. */
export const CJK_FALLBACK = '"Noto Sans", "Noto Sans CJK SC", "PingFang SC", "Hiragino Sans", sans-serif';
export const UNICODE_STACKS: Record<PdfFontFamily, string> = {
  helvetica: `"Helvetica Neue", Helvetica, Arial, ${CJK_FALLBACK}`,
  times: `"Times New Roman", Times, Georgia, "Noto Serif", "Noto Serif CJK SC", serif`,
  courier: `"Courier New", Courier, monospace, ${CJK_FALLBACK}`,
};
export const LATIN_STACKS: Record<PdfFontFamily, string> = {
  helvetica: FONT_PAIRS.modern.cssBody,
  times: FONT_PAIRS.classic.cssBody,
  courier: FONT_PAIRS.typewriter.cssBody,
};
export const cssStack = (family: PdfFontFamily, text: string, fontId?: string) => {
  if (fontId && fontId !== "helvetica" && fontId !== "times" && fontId !== "courier") {
    return `${getCardFont(fontId, family).cssFamily}, ${CJK_FALLBACK}`;
  }
  return isPdfSafeText(text) ? LATIN_STACKS[family] : UNICODE_STACKS[family];
};

export interface Fonts {
  heading: PdfFontFamily;
  body: PdfFontFamily;
}

/** trackEm: letter-spacing in em (only applied to Latin text, which jsPDF can space with charSpace). */
export type FitFn = (text: string, opts: FittedTextOptions, trackEm?: number, fontId?: string) => FittedTextLayout;

interface ElCommon {
  layerId?: string;
  fieldKey?: SemanticFieldKey;
  opacity?: number;
  rotation?: number;
}

export type CardEl =
  | (ElCommon & { kind: "bg-gradient"; x: number; y: number; w: number; h: number; from: RGB; to: RGB; angle: number })
  | (ElCommon & {
      kind: "bg-pattern";
      x: number;
      y: number;
      w: number;
      h: number;
      bg: RGB;
      fg: RGB;
      pattern: PatternKind;
      patternOpacity: number;
      scale: number;
    })
  | (ElCommon & {
      kind: "bg-image";
      x: number;
      y: number;
      w: number;
      h: number;
      src: string;
      fit: "cover" | "contain";
      tint?: RGB;
      tintOpacity?: number;
    })
  | (ElCommon & { kind: "rect"; x: number; y: number; w: number; h: number; fill: RGB; radius?: number; stroke?: RGB; lineWidth?: number })
  | (ElCommon & { kind: "circle"; cx: number; cy: number; r: number; fill: RGB })
  | (ElCommon & { kind: "frame"; x: number; y: number; w: number; h: number; stroke: RGB; lineWidth: number; radius?: number })
  | (ElCommon & { kind: "ellipse"; cx: number; cy: number; rx: number; ry: number; fill: RGB; stroke?: RGB; lineWidth?: number })
  | (ElCommon & { kind: "triangle"; x: number; y: number; w: number; h: number; fill: RGB; stroke?: RGB; lineWidth?: number })
  | (ElCommon & { kind: "star"; x: number; y: number; w: number; h: number; fill: RGB; stroke?: RGB; lineWidth?: number })
  | (ElCommon & { kind: "line"; x: number; y: number; w: number; h: number; stroke: RGB; lineWidth: number; dash?: "solid" | "dashed" | "dotted" })
  | (ElCommon & { kind: "icon"; iconId: string; x: number; y: number; w: number; h: number; color: RGB; strokeWidth?: number })
  | (ElCommon & {
      kind: "image";
      which?: "logo" | "qr";
      src?: string;
      x: number;
      y: number;
      w: number;
      h: number;
      radius?: number;
      fit?: "contain" | "cover";
    })
  | (ElCommon & {
      kind: "text";
      text: string;
      opts: FittedTextOptions;
      layout: FittedTextLayout;
      trackEm?: number;
      fontId?: string;
      underline?: boolean;
      boxX?: number;
      boxW?: number;
    });

export interface CardContent {
  fullName: string;
  role: string;
  company: string;
  phone: string;
  email: string;
  website: string;
}

export const STRIPE_TOP_MM = 2.2;
export const STRIPE_LEFT_MM = 4;
export const CLASSIC_FRAME_INSET_MM = 3;
export const QR_SIZE_MM = 15;
export const CONTACT_SLOT_MM = 3.6;
export const SPACED_EM = 0.16;

export function lineHeightMm(sizePt: number, lhf = 1.2) {
  return sizePt * PT_TO_MM * lhf;
}

export function luminance([r, g, b]: RGB) {
  const ch = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

export const mix = (a: RGB, b: RGB, t: number): RGB => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];

/** Readable text colour on top of a fill. */
export const textOn = (fill: RGB): RGB => (luminance(fill) > 0.4 ? INK : WHITE);

/** Accent lightened enough to read on the dark card background. */
export const accentOnDark = (accent: RGB): RGB => {
  const l = luminance(accent);
  return l < 0.12 ? mix(accent, WHITE, 0.55) : l < 0.25 ? mix(accent, WHITE, 0.35) : accent;
};

export function initialsOf(name: string, company: string) {
  const words = (name.trim() || company.trim()).split(/\s+/).filter(Boolean);
  if (!words.length) return "";
  const first = Array.from(words[0])[0] ?? "";
  const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/** Single-line text with letter-spacing, positioned explicitly (left-aligned) so PDF and preview agree. */
export function spacedLine(
  fit: FitFn,
  text: string,
  opts: FittedTextOptions,
  trackEm: number,
  fontId?: string
): Extract<CardEl, { kind: "text" }> {
  const o: FittedTextOptions = { ...opts, maxLines: 1 };
  const layout = fit(text, o, trackEm, fontId);
  const effTrack = isPdfSafeText(text) ? trackEm : 0;
  // Visual width excludes the trailing letter-space.
  const vis = layout.widthMm - effTrack * layout.fontSize * PT_TO_MM;
  const x = opts.align === "center" ? opts.x - vis / 2 : opts.align === "right" ? opts.x - vis : opts.x;
  return { kind: "text", text, opts: { ...o, x, align: "left" }, layout, trackEm: effTrack || undefined, fontId };
}

export interface FrontConfig {
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
export function layoutFrontBody(
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
    els.push({ kind: "image", which: "logo", fieldKey: "logo", x: f.x, y: headerTop, w: f.w, h: f.h });
    headerTop += f.h + 2;
  } else if (logo && cfg.logoAt === "corner") {
    const f = fitContain(logo.w, logo.h, { x: x1 - 22, y: y0, w: 22, h: 11 });
    els.push({ kind: "image", which: "logo", fieldKey: "logo", x: x1 - f.w, y: y0, w: f.w, h: f.h });
    headerW = fullW - indent - f.w - 2.5;
  }

  const qr = showQr ? Math.min(QR_SIZE_MM, (y1 - y0) * 0.42) : 0;
  if (showQr) els.push({ kind: "image", which: "qr", fieldKey: "qr", x: x1 - qr, y: y1 - qr, w: qr, h: qr });
  const contactW = showQr ? (centered ? fullW - 2 * (qr + 2.5) : fullW - indent - qr - 2.5) : fullW - indent;

  const textX = centered ? cx : x0 + indent;
  const align: FittedTextOptions["align"] = centered ? "center" : "left";

  // Contacts: one line each, bottom of the safe area, one shared size.
  const contactPairs: Array<{ key: SemanticFieldKey; text: string }> = (
    [
      ["phone", c.phone],
      ["email", c.email],
      ["website", c.website],
    ] as const
  )
    .map(([key, v]) => ({ key, text: v.trim() }))
    .filter((item) => Boolean(item.text));

  const contactTop = y1 - contactPairs.length * CONTACT_SLOT_MM;
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
  const contactSize = Math.min(7, ...contactPairs.map((t, i) => fit(t.text, contactOpts(i, 7)).fontSize));
  contactPairs.forEach((item, i) => {
    const opts = contactOpts(i, contactSize);
    els.push({ kind: "text", fieldKey: item.key, text: item.text, opts, layout: fit(item.text, opts) });
  });

  let headerBottom = contactPairs.length ? contactTop - 1.5 : y1;
  if (cfg.rule && contactPairs.length) {
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
        {
          x: textX,
          y,
          maxWidth: headerW,
          maxHeight: h,
          fontSize: 6,
          minFontSize: 5,
          fontFamily: fonts.body,
          fontStyle: "bold",
          align,
          color: cfg.company,
        },
        SPACED_EM
      );
      els.push({ ...el, fieldKey: "company" });
      y += el.layout.heightMm + 2.6;
    }
  }

  const header: Array<{
    key: SemanticFieldKey;
    text: string;
    size: number;
    min: number;
    style: FittedTextOptions["fontStyle"];
    family: PdfFontFamily;
    color: RGB;
    lhf: number;
    gap: number;
  }> = [
    { key: "fullName", text: c.fullName, size: 12, min: 7, style: "bold", family: fonts.heading, color: cfg.name, lhf: 1.12, gap: 1.1 },
    { key: "role", text: c.role, size: 7.5, min: 6, style: "normal", family: fonts.body, color: cfg.role, lhf: 1.2, gap: 0.5 },
  ];
  if (!cfg.companySpaced) {
    header.push({ key: "company", text: c.company, size: 7, min: 6, style: "normal", family: fonts.body, color: cfg.company, lhf: 1.2, gap: 0 });
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
    els.push({ kind: "text", fieldKey: item.key, text, opts, layout });
    barBottom = y + layout.heightMm;
    y += layout.heightMm + item.gap;
  }
  if (cfg.bar && barBottom > barTop) {
    els.push({ kind: "rect", x: x0, y: barTop, w: 0.9, h: barBottom - barTop, fill: cfg.bar });
  }
}

/** Lays out a designed card front. Text never leaves the safe area, logo and QR boxes are reserved. */
export function layoutCardFront(
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
      layoutFrontBody(
        els,
        { x0: 5.5, y0: STRIPE_TOP_MM + 3.3, x1: W - 5, y1: H - 4.5, centered: false, logoAt: "corner", ...light },
        c,
        logo,
        showQr,
        fit,
        fonts
      );
      break;
    case "bold-logo":
      els.push({ kind: "rect", x: 0, y: 0, w: STRIPE_LEFT_MM, h: H, fill: accent });
      layoutFrontBody(
        els,
        { x0: STRIPE_LEFT_MM + 4, y0: 5, x1: W - 4.5, y1: H - 4.5, centered: false, logoAt: "corner", ...light },
        c,
        logo,
        showQr,
        fit,
        fonts
      );
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
        els.push({ kind: "image", which: "logo", fieldKey: "logo", x: f.x, y: f.y, w: f.w, h: f.h });
      } else {
        const ini = initialsOf(c.fullName, c.company);
        if (ini) {
          const size = 26;
          const opts: FittedTextOptions = {
            x: P / 2,
            y: 0,
            maxWidth: P - 8,
            maxLines: 1,
            fontSize: size,
            minFontSize: 14,
            fontStyle: "bold",
            fontFamily: fonts.heading,
            align: "center",
            color: on,
            lineHeightFactor: 1,
          };
          const layout = fit(ini, opts);
          const capH = layout.fontSize * PT_TO_MM * 0.72;
          const y = H / 2 - layout.fontSize * PT_TO_MM * 0.85 + capH / 2;
          els.push({ kind: "text", fieldKey: "initials", text: ini, opts: { ...opts, y }, layout });
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
          const opts: FittedTextOptions = {
            x: W / 2,
            y: 0,
            maxWidth: r * 1.5,
            maxLines: 1,
            fontSize: 12,
            minFontSize: 7,
            fontStyle: "bold",
            fontFamily: fonts.heading,
            align: "center",
            color: textOn(accent),
            lineHeightFactor: 1,
          };
          const layout = fit(ini, opts);
          const y = cy - layout.fontSize * PT_TO_MM * 0.85 + (layout.fontSize * PT_TO_MM * 0.72) / 2;
          els.push({ kind: "text", fieldKey: "initials", text: ini, opts: { ...opts, y }, layout });
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
        {
          x0: 6.5,
          y0: 6.5,
          x1: W - 6,
          y1: H - 5.5,
          centered: false,
          logoAt: "corner",
          bar: a,
          name: WHITE,
          role: a,
          company: [161, 161, 170],
          contact: [228, 228, 231],
        },
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

export function layoutCardBack(
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
  const textBlock = (
    text: string,
    o: Omit<FittedTextOptions, "x" | "y">,
    trackEm?: number,
    fieldKey?: SemanticFieldKey
  ): Block | null => {
    const t = text.trim();
    if (!t) return null;
    const opts: FittedTextOptions = { ...o, x: W / 2, y: 0, align: "center" };
    if (trackEm) {
      const el = spacedLine(fit, t, opts, trackEm);
      return { h: el.layout.heightMm, place: (y) => els.push({ ...el, fieldKey, opts: { ...el.opts, y } }) };
    }
    const layout = fit(t, opts);
    return { h: layout.heightMm, place: (y) => els.push({ kind: "text", fieldKey, text: t, opts: { ...opts, y }, layout }) };
  };
  const push = (blk: Block | null) => blk && blocks.push(blk);
  const top = 5;
  let bottom = H - 5;
  const gaps: number[] = [];

  if (backStyle === "tagline") {
    els.push({ kind: "rect", x: 0, y: 0, w: W, h: H, fill: DARK_BG }, { kind: "rect", x: 0, y: H - 2.5, w: W, h: 2.5, fill: accent });
    bottom = H - 2.5 - 4;
    push(
      textBlock(
        b.title,
        {
          maxWidth,
          maxHeight: (bottom - top) * 0.6,
          maxLines: 2,
          fontSize: 14,
          minFontSize: 8,
          fontStyle: "bold",
          fontFamily: fonts.heading,
          color: WHITE,
          lineHeightFactor: 1.12,
        },
        undefined,
        "company"
      )
    );
    push(
      textBlock(
        b.tagline || b.website,
        {
          maxWidth,
          maxHeight: (bottom - top) * 0.35,
          maxLines: 2,
          fontSize: 7.5,
          minFontSize: 6,
          fontFamily: fonts.body,
          color: [212, 212, 216],
        },
        undefined,
        b.tagline ? "tagline" : "website"
      )
    );
    gaps.push(2.2);
  } else if (backStyle === "solid") {
    els.push({ kind: "rect", x: 0, y: 0, w: W, h: H, fill: accent });
    const on = textOn(accent);
    const soft = mix(on, accent, 0.25);
    push(
      textBlock(
        b.tagline,
        { maxWidth, maxHeight: lineHeightMm(7) * 2, maxLines: 2, fontSize: 7, minFontSize: 6, fontFamily: fonts.body, color: soft },
        undefined,
        "tagline"
      )
    );
    push(
      textBlock(
        b.website || b.title,
        { maxWidth, maxLines: 1, fontSize: 12, minFontSize: 7, fontStyle: "bold", fontFamily: fonts.heading, color: on },
        undefined,
        b.website ? "website" : "company"
      )
    );
    gaps.push(2.4);
  } else {
    if (logo) {
      const f = fitContain(logo.w, logo.h, { x: 0, y: 0, w: Math.min(44, W - 20), h: 17 });
      blocks.push({ h: f.h, place: (y) => els.push({ kind: "image", which: "logo", fieldKey: "logo", x: W / 2 - f.w / 2, y, w: f.w, h: f.h }) });
    } else if (b.initials) {
      const r = 8;
      const opts: FittedTextOptions = {
        x: W / 2,
        y: 0,
        maxWidth: r * 1.5,
        maxLines: 1,
        fontSize: 17,
        minFontSize: 9,
        fontStyle: "bold",
        fontFamily: fonts.heading,
        align: "center",
        color: textOn(accent),
        lineHeightFactor: 1,
      };
      const layout = fit(b.initials, opts);
      blocks.push({
        h: 2 * r,
        place: (y) => {
          els.push({ kind: "circle", cx: W / 2, cy: y + r, r, fill: accent });
          const ty = y + r - layout.fontSize * PT_TO_MM * 0.85 + (layout.fontSize * PT_TO_MM * 0.72) / 2;
          els.push({ kind: "text", fieldKey: "initials", text: b.initials, opts: { ...opts, y: ty }, layout });
        },
      });
    }
    gaps.push(3.4);
    push(
      textBlock(
        b.title.toUpperCase(),
        { maxWidth, maxLines: 1, fontSize: 7, minFontSize: 5.5, fontStyle: "bold", fontFamily: fonts.body, color: INK },
        SPACED_EM,
        "company"
      )
    );
    gaps.push(1.4);
    push(
      textBlock(
        b.tagline,
        { maxWidth, maxLines: 1, fontSize: 6.5, minFontSize: 5.5, fontFamily: fonts.body, color: MUTED },
        undefined,
        "tagline"
      )
    );
  }

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
export function canvasMeasure(style: FittedTextOptions["fontStyle"], stack: string) {
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

export type MeasureMm = (t: string, sizePt: number) => number;
export const withTracking = (m: MeasureMm, trackEm: number): MeasureMm =>
  trackEm ? (t, s) => m(t, s) + t.length * trackEm * s * PT_TO_MM : m;

export const previewFit: FitFn = (text, opts, trackEm = 0, fontId) => {
  const family = opts.fontFamily ?? "helvetica";
  const safe = isPdfSafeText(text);
  return layoutFittedText(
    text,
    opts,
    withTracking(canvasMeasure(opts.fontStyle, cssStack(family, text, fontId)), safe ? trackEm : 0)
  );
};

/** Rough deterministic layout used before hydration so SSR and first client render match. */
export const approxFit: FitFn = (text, opts, trackEm = 0) =>
  layoutFittedText(text, opts, withTracking((t, s) => t.length * s * PT_TO_MM * 0.55, trackEm));

export function pdfFitFor(doc: import("jspdf").jsPDF): FitFn {
  return (text, opts, trackEm = 0, fontId) => {
    const style = opts.fontStyle ?? "normal";
    const family = opts.fontFamily ?? "helvetica";
    const builtin = !fontId || fontId === "helvetica" || fontId === "times" || fontId === "courier";
    if (builtin && isPdfSafeText(text)) {
      const m: MeasureMm = (t, s) => {
        doc.setFont(family, style);
        doc.setFontSize(s);
        return doc.getTextWidth(t);
      };
      return layoutFittedText(text, opts, withTracking(m, trackEm));
    }
    return layoutFittedText(text, opts, withTracking(canvasMeasure(style, cssStack(family, text, fontId)), trackEm));
  };
}

export const RASTER_PX_PER_MM = 16;

export function rasterTextPdf(doc: import("jspdf").jsPDF, el: Extract<CardEl, { kind: "text" }>, ox: number, oy: number) {
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
  const stack = cssStack(opts.fontFamily ?? "helvetica", el.text, el.fontId);
  const font = `${italic}${weight} ${layout.fontSize * PT_TO_MM * k}px ${stack}`;
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

export function drawCardElsPdf(
  doc: import("jspdf").jsPDF,
  els: CardEl[],
  ox: number,
  oy: number,
  images: { logo?: string; qr?: string }
) {
  for (const el of els) {
    if (el.kind === "rect") {
      doc.setFillColor(el.fill[0], el.fill[1], el.fill[2]);
      if (el.radius && el.radius > 0) {
        doc.roundedRect(ox + el.x, oy + el.y, el.w, el.h, el.radius, el.radius, "F");
      } else {
        doc.rect(ox + el.x, oy + el.y, el.w, el.h, "F");
      }
    } else if (el.kind === "circle") {
      doc.setFillColor(el.fill[0], el.fill[1], el.fill[2]);
      doc.circle(ox + el.cx, oy + el.cy, el.r, "F");
    } else if (el.kind === "ellipse") {
      doc.setFillColor(el.fill[0], el.fill[1], el.fill[2]);
      doc.ellipse(ox + el.cx, oy + el.cy, el.rx, el.ry, "F");
    } else if (el.kind === "frame") {
      doc.setDrawColor(el.stroke[0], el.stroke[1], el.stroke[2]);
      doc.setLineWidth(el.lineWidth);
      if (el.radius && el.radius > 0) {
        doc.roundedRect(ox + el.x, oy + el.y, el.w, el.h, el.radius, el.radius);
      } else {
        doc.rect(ox + el.x, oy + el.y, el.w, el.h);
      }
    } else if (el.kind === "line") {
      doc.setDrawColor(el.stroke[0], el.stroke[1], el.stroke[2]);
      doc.setLineWidth(el.lineWidth);
      const midY = oy + el.y + el.h / 2;
      doc.line(ox + el.x, midY, ox + el.x + el.w, midY);
    } else if (el.kind === "image") {
      const src = el.src ?? (el.which ? images[el.which] : undefined);
      if (src) doc.addImage(src, "PNG", ox + el.x, oy + el.y, el.w, el.h);
    } else if (el.kind === "text") {
      if (el.trackEm && isPdfSafeText(el.text) && (!el.fontId || el.fontId === "helvetica" || el.fontId === "times" || el.fontId === "courier")) {
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
      } else if ((!isPdfSafeText(el.text) || (el.fontId && el.fontId !== "helvetica" && el.fontId !== "times" && el.fontId !== "courier")) && rasterTextPdf(doc, el, ox, oy)) {
        // drawn via high-DPI raster
      } else {
        drawFittedText(doc, el.text, { ...el.opts, x: ox + el.opts.x, y: oy + el.opts.y });
      }
    }
  }
}

/**
 * Draws cutting guides onto a multi-card sheet PDF.
 * - "dashed-grid": Full-sheet dashed cut lines along every trim edge extending into margins (easiest for scissors & ruler)
 * - "card-outline": Dashed hairline border around each individual card + margin alignment ticks
 * - "crop-marks": Outer trim marks + interior corner marks in gaps (for paper trimmers / guillotines)
 * - "none": No cutting guides (for pre-cut / perforated card sheets)
 */
export function drawSheetCutGuides(
  doc: import("jspdf").jsPDF,
  g: {
    startX: number;
    startY: number;
    sheet: SheetPreset;
    paperW: number;
    paperH: number;
    bleedMm?: number;
    style?: CutGuideStyle;
  }
) {
  const style = g.style ?? "crop-marks";
  if (style === "none") return;

  const bleed = g.bleedMm ?? 0;
  const { startX, startY, sheet, paperW, paperH } = g;
  const { cols, rows, cardW, cardH, gapX, gapY } = sheet;
  const gridR = startX + cols * cardW + (cols - 1) * gapX;
  const gridB = startY + rows * cardH + (rows - 1) * gapY;
  const uniq = (v: number[]) => Array.from(new Set(v.map((n) => Math.round(n * 100) / 100)));
  const xs = uniq(Array.from({ length: cols }, (_, c) => startX + c * (cardW + gapX)).flatMap((x) => [x, x + cardW]));
  const ys = uniq(Array.from({ length: rows }, (_, r) => startY + r * (cardH + gapY)).flatMap((y) => [y, y + cardH]));

  if (style === "dashed-grid") {
    const ext = 5;
    const topY = Math.max(2, startY - ext);
    const botY = Math.min(paperH - 2, gridB + ext);
    const leftX = Math.max(2, startX - ext);
    const rightX = Math.min(paperW - 2, gridR + ext);

    doc.setDrawColor(135, 135, 145);
    doc.setLineWidth(0.2);
    doc.setLineDashPattern([2, 1.6], 0);

    for (const x of xs) {
      doc.line(x, topY, x, botY);
    }
    for (const y of ys) {
      doc.line(leftX, y, rightX, y);
    }

    // Solid short alignment ticks in the outer page margin so ruler/trimmer alignment is instant
    doc.setLineDashPattern([], 0);
    doc.setDrawColor(90, 90, 100);
    doc.setLineWidth(0.22);
    const tickOff = Math.max(1.2, bleed + 0.6);
    const tickLen = 3.2;
    for (const x of xs) {
      if (startY - tickOff > 1.5) doc.line(x, Math.max(1, startY - tickOff - tickLen), x, startY - tickOff);
      if (gridB + tickOff < paperH - 1.5) doc.line(x, gridB + tickOff, x, Math.min(paperH - 1, gridB + tickOff + tickLen));
    }
    for (const y of ys) {
      if (startX - tickOff > 1.5) doc.line(Math.max(1, startX - tickOff - tickLen), y, startX - tickOff, y);
      if (gridR + tickOff < paperW - 1.5) doc.line(gridR + tickOff, y, Math.min(paperW - 1, gridR + tickOff + tickLen), y);
    }
    return;
  }

  if (style === "card-outline") {
    doc.setDrawColor(140, 140, 150);
    doc.setLineWidth(0.2);
    doc.setLineDashPattern([1.8, 1.4], 0);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * (cardW + gapX);
        const y = startY + r * (cardH + gapY);
        doc.rect(x, y, cardW, cardH);
      }
    }
    doc.setLineDashPattern([], 0);
    // Subtle outer ticks in page margins
    drawGridCropMarks(doc, { startX, startY, sheet, paperW, paperH, bleedMm: bleed });
    return;
  }

  drawGridCropMarks(doc, { startX, startY, sheet, paperW, paperH, bleedMm: bleed });
}

/**
 * Crop marks drawn on the cut lines. Marks always sit outside the outer edge of the
 * grid; interior corner ticks are drawn in gaps so alignment is never lost mid-sheet.
 */
export function drawGridCropMarks(
  doc: import("jspdf").jsPDF,
  g: { startX: number; startY: number; sheet: SheetPreset; paperW: number; paperH: number; bleedMm?: number }
) {
  const bleed = g.bleedMm ?? 0;
  const OFF = Math.max(1, bleed + 0.6);
  const LEN = 3;
  const SAFE = PRINTER_SAFE_MARGIN_MM;
  const { startX, startY, sheet, paperW, paperH } = g;
  const { cols, rows, cardW, cardH, gapX, gapY } = sheet;
  const gridR = startX + cols * cardW + (cols - 1) * gapX;
  const gridB = startY + rows * cardH + (rows - 1) * gapY;
  const uniq = (v: number[]) => Array.from(new Set(v.map((n) => Math.round(n * 100) / 100)));
  const xs = uniq(Array.from({ length: cols }, (_, c) => startX + c * (cardW + gapX)).flatMap((x) => [x, x + cardW]));
  const ys = uniq(Array.from({ length: rows }, (_, r) => startY + r * (cardH + gapY)).flatMap((y) => [y, y + cardH]));

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

  doc.setLineDashPattern([], 0);
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

  // Draw interior corner marks inside gaps between cards (scaled to fit narrow gaps too)
  const gapTick = (gap: number) => {
    if (gap >= 2 * (OFF + LEN)) return { off: OFF, len: LEN };
    if (gap >= 1.6) {
      const half = gap / 2;
      const off = Math.min(0.4, half * 0.25);
      const len = Math.max(0.5, half - off);
      return { off, len };
    }
    return null;
  };
  const gxTick = gapTick(gapX);
  const gyTick = gapTick(gapY);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * (cardW + gapX);
      const y = startY + r * (cardH + gapY);
      if (gxTick) {
        for (const yy of [y, y + cardH]) {
          if (c > 0) doc.line(x - gxTick.off - gxTick.len, yy, x - gxTick.off, yy);
          if (c < cols - 1) doc.line(x + cardW + gxTick.off, yy, x + cardW + gxTick.off + gxTick.len, yy);
        }
      }
      if (gyTick) {
        for (const xx of [x, x + cardW]) {
          if (r > 0) doc.line(xx, y - gyTick.off - gyTick.len, xx, y - gyTick.off);
          if (r < rows - 1) doc.line(xx, y + cardH + gyTick.off, xx, y + cardH + gyTick.off + gyTick.len);
        }
      }
    }
  }
}

export function sheetGeometry(sheet: SheetPreset, paperW: number, paperH: number, offsetX = 0, offsetY = 0) {
  const gridW = sheet.cols * sheet.cardW + (sheet.cols - 1) * sheet.gapX;
  const gridH = sheet.rows * sheet.cardH + (sheet.rows - 1) * sheet.gapY;
  const startX = (paperW - gridW) / 2 + offsetX;
  const startY = (paperH - gridH) / 2 + offsetY;
  const cells: Array<[number, number]> = [];
  for (let r = 0; r < sheet.rows; r++) {
    for (let c = 0; c < sheet.cols; c++) {
      cells.push([startX + c * (sheet.cardW + sheet.gapX), startY + r * (sheet.cardH + sheet.gapY)]);
    }
  }
  return { gridW, gridH, startX, startY, cells };
}

export const PAPER_SHORT: Record<SheetPreset["paper"], string> = { a4: "A4", letter: "US Letter", a3: "A3" };
