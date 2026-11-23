import type { FittedTextOptions, PdfFontFamily } from "@/lib/pdf-utils";
import { getCardFont } from "./fonts";
import {
  hexToRgb,
  initialsOf,
  layoutCardBack,
  layoutCardFront,
  mix,
  spacedLine,
  textOn,
  type BackStyleId,
  type CardContent,
  type CardEl,
  type CardStyleId,
  type FitFn,
  type Fonts,
  type PatternKind,
  type RGB,
  type SemanticFieldKey,
} from "./engine";

/* A free-form card: a background (solid/gradient/pattern/image) plus a stack of layers (first = bottom). All units mm. */

export type SideBackground =
  | { type: "solid"; color: string }
  | { type: "gradient"; from: string; to: string; angle: number }
  | { type: "pattern"; bg: string; fg: string; pattern: PatternKind; opacity: number; scale: number }
  | { type: "image"; src: string; fit: "cover" | "contain"; opacity: number; tint?: string; tintOpacity?: number };

interface LayerBase {
  id: string;
  name: string;
  fieldKey?: SemanticFieldKey;
  x: number;
  y: number;
  w: number;
  /** Ignored for text unless autoFit uses maxHeight; text height follows wrapped text. */
  h: number;
  /** Rotation in degrees (-180..180). */
  rotation?: number;
  /** Opacity (0..1, default 1). */
  opacity?: number;
  hidden?: boolean;
  locked?: boolean;
}

export interface TextLayer extends LayerBase {
  kind: "text";
  text: string;
  /** pt */
  size: number;
  family: PdfFontFamily;
  /** Rich font id from fonts.ts (defaults to `family`). */
  fontId?: string;
  bold: boolean;
  italic: boolean;
  underline?: boolean;
  uppercase?: boolean;
  align: "left" | "center" | "right";
  color: string;
  /** letter-spacing in em (single-line Latin text only) */
  track: number;
  /** line-height factor */
  leading: number;
  /** Automatically shrink font so long text never overflows its box. */
  autoFit?: boolean;
  minSize?: number;
  maxLines?: number;
}

export interface ShapeLayer extends LayerBase {
  kind: "rect" | "rounded-rect" | "ellipse" | "frame" | "triangle" | "star";
  color: string;
  strokeColor?: string;
  /** outline thickness in mm */
  strokeW: number;
  /** corner radius in mm for rect/rounded-rect/frame */
  radius?: number;
}

export interface LineLayer extends LayerBase {
  kind: "line";
  color: string;
  strokeW: number;
  dash?: "solid" | "dashed" | "dotted";
}

export interface ImageLayer extends LayerBase {
  kind: "image";
  src: string;
  /** Original uncropped / unedited data URL so crop & background removal can be reset. */
  originalSrc?: string;
  /** natural width / height, used to keep the shape when resizing */
  ratio: number;
  fit?: "contain" | "cover";
  radius?: number;
  isLogo?: boolean;
  /** For QR layers: what the code opens. `qrFor` is what `src` currently encodes. */
  qrText?: string;
  qrFor?: string;
  qrFg?: string;
  qrBg?: string;
}

export interface IconLayer extends LayerBase {
  kind: "icon";
  iconId: string;
  color: string;
  strokeW?: number;
}

export type Layer = TextLayer | ShapeLayer | LineLayer | ImageLayer | IconLayer;

export interface SideDesign {
  bg: string;
  background?: SideBackground;
  layers: Layer[];
}

export interface CardDesign {
  front: SideDesign;
  back: SideDesign;
}

export type Box = { x: number; y: number; w: number; h: number };

let counter = 0;
export const newLayerId = () => `layer-${Date.now().toString(36)}-${counter++}`;

export const rgbToHex = (c: RGB) => `#${c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`;

export const FAMILY_LABEL: Record<PdfFontFamily, string> = { helvetica: "Sans-serif", times: "Serif", courier: "Monospace" };

export function getSideBackground(side: SideDesign): SideBackground {
  if (side.background) return side.background;
  return { type: "solid", color: side.bg || "#ffffff" };
}

export function setSideBackground(side: SideDesign, background: SideBackground): SideDesign {
  const bg =
    background.type === "solid"
      ? background.color
      : background.type === "gradient"
        ? background.from
        : background.type === "pattern"
          ? background.bg
          : side.bg || "#18181b";
  return { ...side, bg, background };
}

export function makeText(over: Partial<TextLayer> = {}): TextLayer {
  return {
    id: newLayerId(),
    kind: "text",
    name: "Text",
    x: 6,
    y: 6,
    w: 50,
    h: 5,
    rotation: 0,
    opacity: 1,
    text: "Your text",
    size: 9,
    family: "helvetica",
    fontId: over.fontId ?? over.family ?? "helvetica",
    bold: false,
    italic: false,
    underline: false,
    uppercase: false,
    align: "left",
    color: "#18181b",
    track: 0,
    leading: 1.2,
    autoFit: true,
    minSize: 5,
    ...over,
  };
}

export function makeShape(kind: ShapeLayer["kind"], color: string, over: Partial<ShapeLayer> = {}): ShapeLayer {
  const names: Record<ShapeLayer["kind"], string> = {
    rect: "Rectangle",
    "rounded-rect": "Rounded box",
    ellipse: "Circle",
    frame: "Outline box",
    triangle: "Triangle",
    star: "Star",
  };
  return {
    id: newLayerId(),
    kind,
    name: names[kind],
    x: 10,
    y: 10,
    w: kind === "ellipse" || kind === "star" || kind === "triangle" ? 18 : 24,
    h: kind === "ellipse" || kind === "star" || kind === "triangle" ? 18 : 14,
    rotation: 0,
    opacity: 1,
    color,
    strokeW: 0.4,
    radius: kind === "rounded-rect" ? 2.5 : 0,
    ...over,
  };
}

export function makeLine(color: string, over: Partial<LineLayer> = {}): LineLayer {
  return {
    id: newLayerId(),
    kind: "line",
    name: "Line",
    x: 10,
    y: 26,
    w: 36,
    h: 2,
    rotation: 0,
    opacity: 1,
    color,
    strokeW: 0.5,
    dash: "solid",
    ...over,
  };
}

export function makeImage(src: string, ratio: number, name: string, over: Partial<ImageLayer> = {}): ImageLayer {
  const safeRatio = Number.isFinite(ratio) && ratio > 0 ? ratio : 1;
  const w = safeRatio >= 1 ? 22 : 22 * safeRatio;
  return {
    id: newLayerId(),
    kind: "image",
    name,
    src,
    originalSrc: over.originalSrc ?? src,
    ratio: safeRatio,
    fit: "contain",
    radius: 0,
    x: 10,
    y: 10,
    w,
    h: w / safeRatio,
    rotation: 0,
    opacity: 1,
    ...over,
  };
}

export function makeIcon(iconId: string, color: string, name = "Icon", over: Partial<IconLayer> = {}): IconLayer {
  return {
    id: newLayerId(),
    kind: "icon",
    name,
    iconId,
    color,
    strokeW: 2,
    x: 12,
    y: 12,
    w: 5,
    h: 5,
    rotation: 0,
    opacity: 1,
    ...over,
  };
}

const FIELD_FRIENDLY: Record<SemanticFieldKey, string> = {
  fullName: "Name",
  role: "Job title",
  company: "Company",
  phone: "Phone",
  email: "Email",
  website: "Website",
  tagline: "Tagline",
  logo: "Logo",
  qr: "QR code",
  initials: "Monogram",
};

export const layerLabel = (l: Layer) => {
  if (l.kind === "text") {
    const clean = l.text.trim().split("\n")[0].slice(0, 28);
    if (clean) return clean;
    return l.fieldKey ? FIELD_FRIENDLY[l.fieldKey] : "Empty text";
  }
  return l.name || (l.fieldKey ? FIELD_FRIENDLY[l.fieldKey] : "Element");
};

/** Compile a side into drawable elements plus the on-card box of every layer and fitted font sizes. */
export function compileSide(side: SideDesign, W: number, H: number, fit: FitFn) {
  const els: CardEl[] = [];
  const bounds = new Map<string, Box>();
  const fittedSizes = new Map<string, number>();

  const bg = getSideBackground(side);
  if (bg.type === "solid") {
    if (bg.color.toLowerCase() !== "#ffffff") {
      els.push({ kind: "rect", x: 0, y: 0, w: W, h: H, fill: hexToRgb(bg.color) });
    }
  } else if (bg.type === "gradient") {
    els.push({ kind: "bg-gradient", x: 0, y: 0, w: W, h: H, from: hexToRgb(bg.from), to: hexToRgb(bg.to), angle: bg.angle });
  } else if (bg.type === "pattern") {
    els.push({
      kind: "bg-pattern",
      x: 0,
      y: 0,
      w: W,
      h: H,
      bg: hexToRgb(bg.bg),
      fg: hexToRgb(bg.fg),
      pattern: bg.pattern,
      patternOpacity: bg.opacity,
      scale: bg.scale,
    });
  } else if (bg.type === "image" && bg.src) {
    els.push({
      kind: "bg-image",
      x: 0,
      y: 0,
      w: W,
      h: H,
      src: bg.src,
      fit: bg.fit,
      opacity: bg.opacity,
      tint: bg.tint && bg.tint !== "none" ? hexToRgb(bg.tint) : undefined,
      tintOpacity: bg.tintOpacity ?? 0.35,
    });
  }

  for (const l of side.layers) {
    bounds.set(l.id, { x: l.x, y: l.y, w: l.w, h: l.h });
    if (l.hidden) continue;
    const common = {
      layerId: l.id,
      fieldKey: l.fieldKey,
      opacity: l.opacity ?? 1,
      rotation: l.rotation ?? 0,
    };

    if (l.kind === "rect" || l.kind === "rounded-rect") {
      els.push({
        ...common,
        kind: "rect",
        x: l.x,
        y: l.y,
        w: l.w,
        h: l.h,
        fill: hexToRgb(l.color),
        radius: l.kind === "rounded-rect" ? (l.radius ?? 2.5) : (l.radius ?? 0),
        stroke: l.strokeColor ? hexToRgb(l.strokeColor) : undefined,
        lineWidth: l.strokeColor ? l.strokeW : undefined,
      });
    } else if (l.kind === "ellipse") {
      els.push({
        ...common,
        kind: "ellipse",
        cx: l.x + l.w / 2,
        cy: l.y + l.h / 2,
        rx: l.w / 2,
        ry: l.h / 2,
        fill: hexToRgb(l.color),
        stroke: l.strokeColor ? hexToRgb(l.strokeColor) : undefined,
        lineWidth: l.strokeColor ? l.strokeW : undefined,
      });
    } else if (l.kind === "frame") {
      els.push({
        ...common,
        kind: "frame",
        x: l.x,
        y: l.y,
        w: l.w,
        h: l.h,
        stroke: hexToRgb(l.color),
        lineWidth: l.strokeW,
        radius: l.radius ?? 0,
      });
    } else if (l.kind === "triangle") {
      els.push({
        ...common,
        kind: "triangle",
        x: l.x,
        y: l.y,
        w: l.w,
        h: l.h,
        fill: hexToRgb(l.color),
        stroke: l.strokeColor ? hexToRgb(l.strokeColor) : undefined,
        lineWidth: l.strokeColor ? l.strokeW : undefined,
      });
    } else if (l.kind === "star") {
      els.push({
        ...common,
        kind: "star",
        x: l.x,
        y: l.y,
        w: l.w,
        h: l.h,
        fill: hexToRgb(l.color),
        stroke: l.strokeColor ? hexToRgb(l.strokeColor) : undefined,
        lineWidth: l.strokeColor ? l.strokeW : undefined,
      });
    } else if (l.kind === "line") {
      els.push({
        ...common,
        kind: "line",
        x: l.x,
        y: l.y,
        w: l.w,
        h: Math.max(l.h, l.strokeW),
        stroke: hexToRgb(l.color),
        lineWidth: l.strokeW,
        dash: l.dash ?? "solid",
      });
    } else if (l.kind === "icon") {
      els.push({
        ...common,
        kind: "icon",
        iconId: l.iconId,
        x: l.x,
        y: l.y,
        w: l.w,
        h: l.h,
        color: hexToRgb(l.color),
        strokeWidth: l.strokeW ?? 2,
      });
    } else if (l.kind === "image") {
      els.push({
        ...common,
        kind: "image",
        src: l.src,
        x: l.x,
        y: l.y,
        w: l.w,
        h: l.h,
        radius: l.radius ?? 0,
        fit: l.fit ?? "contain",
      });
    } else if (l.kind === "text") {
      const font = getCardFont(l.fontId, l.family);
      const anchor = l.align === "center" ? l.x + l.w / 2 : l.align === "right" ? l.x + l.w : l.x;
      const autoFit = l.autoFit ?? false;
      const minFontSize = autoFit ? Math.min(l.size, l.minSize ?? 5) : l.size;
      const maxLines = autoFit ? (l.maxLines ?? (l.text.includes("\n") ? undefined : 2)) : undefined;
      const opts: FittedTextOptions = {
        x: anchor,
        y: l.y,
        maxWidth: Math.max(1, l.w),
        maxLines,
        fontSize: l.size,
        minFontSize,
        fontStyle: l.bold ? (l.italic ? "bolditalic" : "bold") : l.italic ? "italic" : "normal",
        fontFamily: font.pdfFallback,
        align: l.align,
        color: hexToRgb(l.color),
        lineHeightFactor: l.leading,
      };
      const rawText = l.text.replace(/\s+$/g, "");
      const displayText = l.uppercase ? rawText.toUpperCase() : rawText;
      const el: Extract<CardEl, { kind: "text" }> =
        l.track > 0 && !displayText.includes("\n")
          ? { ...spacedLine(fit, displayText, opts, l.track, font.id), ...common, underline: l.underline, boxX: l.x, boxW: l.w }
          : {
              ...common,
              kind: "text",
              text: displayText,
              opts,
              layout: fit(displayText, opts, 0, font.id),
              fontId: font.id,
              underline: l.underline,
              boxX: l.x,
              boxW: l.w,
            };
      els.push(el);
      fittedSizes.set(l.id, el.layout.fontSize);
      const lineH = el.layout.fontSize * (25.4 / 72) * l.leading;
      bounds.set(l.id, { x: l.x, y: l.y, w: l.w, h: Math.max(lineH, el.layout.heightMm) });
    }
  }
  return { els, bounds, fittedSizes };
}

/** Turn a preset's drawn elements into editable layers, preserving semantic field keys for Simple Mode sync. */
export function elsToSide(
  els: CardEl[],
  W: number,
  H: number,
  images: { logo?: { src: string; w: number; h: number }; qr?: { src: string; target: string } }
): SideDesign {
  let bg = "#ffffff";
  const layers: Layer[] = [];
  els.forEach((el, i) => {
    if (el.kind === "rect") {
      if (i === 0 && el.x <= 0 && el.y <= 0 && el.w >= W - 0.01 && el.h >= H - 0.01) {
        bg = rgbToHex(el.fill);
        return;
      }
      const thin = Math.min(el.w, el.h) <= 1.2;
      if (thin && el.w >= el.h * 4) {
        layers.push(makeLine(rgbToHex(el.fill), { name: "Divider line", x: el.x, y: el.y, w: el.w, h: Math.max(1.5, el.h), strokeW: Math.max(0.3, el.h) }));
      } else {
        layers.push(makeShape("rect", rgbToHex(el.fill), { name: thin ? "Accent bar" : "Shape", x: el.x, y: el.y, w: el.w, h: el.h }));
      }
    } else if (el.kind === "circle") {
      layers.push(makeShape("ellipse", rgbToHex(el.fill), { name: "Circle", x: el.cx - el.r, y: el.cy - el.r, w: 2 * el.r, h: 2 * el.r }));
    } else if (el.kind === "ellipse") {
      layers.push(makeShape("ellipse", rgbToHex(el.fill), { name: "Circle", x: el.cx - el.rx, y: el.cy - el.ry, w: 2 * el.rx, h: 2 * el.ry }));
    } else if (el.kind === "frame") {
      layers.push(makeShape("frame", rgbToHex(el.stroke), { name: "Border frame", x: el.x, y: el.y, w: el.w, h: el.h, strokeW: el.lineWidth }));
    } else if (el.kind === "image") {
      if (el.which === "logo" && images.logo) {
        layers.push(
          makeImage(images.logo.src, images.logo.w / images.logo.h, "Logo", {
            fieldKey: "logo",
            isLogo: true,
            x: el.x,
            y: el.y,
            w: el.w,
            h: el.h,
          })
        );
      } else if (el.which === "qr" && images.qr) {
        layers.push(
          makeImage(images.qr.src, 1, "QR code", {
            fieldKey: "qr",
            x: el.x,
            y: el.y,
            w: el.w,
            h: el.h,
            qrText: images.qr.target,
            qrFor: images.qr.target,
            qrFg: "#09090b",
            qrBg: "#ffffff",
          })
        );
      }
    } else if (el.kind === "text") {
      const { opts, layout } = el;
      const style = opts.fontStyle ?? "normal";
      const tracked = !!el.trackEm;
      const w = tracked ? Math.min(W - opts.x, Math.max(opts.maxWidth, layout.widthMm + 2)) : opts.maxWidth;
      const align = opts.align ?? "left";
      const x = tracked || align === "left" ? opts.x : align === "center" ? opts.x - w / 2 : opts.x - w;
      const family = opts.fontFamily ?? "helvetica";
      layers.push(
        makeText({
          name: el.fieldKey ? FIELD_FRIENDLY[el.fieldKey] : "Text",
          fieldKey: el.fieldKey,
          text: el.text,
          x,
          y: opts.y,
          w,
          h: layout.heightMm,
          size: layout.fontSize,
          family,
          fontId: el.fontId ?? family,
          bold: style === "bold" || style === "bolditalic",
          italic: style === "italic" || style === "bolditalic",
          align: tracked ? "left" : align,
          color: rgbToHex(opts.color ?? [24, 24, 27]),
          track: el.trackEm ?? 0,
          leading: opts.lineHeightFactor ?? 1.2,
          autoFit: true,
          minSize: opts.minFontSize ?? 5,
          maxLines: opts.maxLines,
        })
      );
    }
  });
  return { bg, background: { type: "solid", color: bg }, layers };
}

/* ------------------------------------------------------------------------- */
/* Template Gallery (8 classic presets + 3 studio templates)                  */
/* ------------------------------------------------------------------------- */

export type GalleryTemplateId = CardStyleId | "gradient-studio" | "executive-band" | "qr-card";

export interface GalleryTemplateDef {
  id: GalleryTemplateId;
  label: string;
  hint: string;
  badge?: string;
}

export const GALLERY_TEMPLATES: GalleryTemplateDef[] = [
  { id: "minimal", label: "Modern", hint: "Colour bar on top" },
  { id: "clean", label: "Minimal", hint: "Airy with accent line" },
  { id: "classic", label: "Classic", hint: "Centred with frame" },
  { id: "bold-logo", label: "Bold", hint: "Colour stripe on left" },
  { id: "split", label: "Split", hint: "Two-tone colour panel" },
  { id: "monogram", label: "Monogram", hint: "Initials badge on top" },
  { id: "dark", label: "Dark", hint: "Crisp light text on dark" },
  { id: "gradient-studio", label: "Gradient", hint: "Rich diagonal gradient", badge: "Pro" },
  { id: "executive-band", label: "Executive", hint: "Bottom contact band", badge: "Pro" },
  { id: "qr-card", label: "QR Focus", hint: "Large scannable badge", badge: "Pro" },
  { id: "blank", label: "Blank", hint: "Start with a clean slate" },
];

export function buildTemplateDesign(params: {
  templateId: GalleryTemplateId;
  W: number;
  H: number;
  accentHex: string;
  content: CardContent;
  tagline: string;
  backStyle: BackStyleId;
  logo: { src: string; w: number; h: number } | null;
  qr: { src: string; target: string } | null;
  fit: FitFn;
  fonts: Fonts;
}): CardDesign {
  const { templateId, W, H, accentHex, content, tagline, backStyle, logo, qr, fit, fonts } = params;
  const accent = hexToRgb(accentHex);
  const backContent = {
    title: content.company.trim() || content.fullName.trim(),
    tagline: tagline.trim(),
    website: content.website.trim(),
    initials: initialsOf(content.fullName, content.company),
  };
  const backEls = layoutCardBack(W, H, backStyle, accent, backContent, logo, fit, fonts);
  const back = elsToSide(backEls, W, H, {
    logo: logo ? { src: logo.src, w: logo.w, h: logo.h } : undefined,
    qr: qr ?? undefined,
  });

  if (templateId === "blank") {
    return {
      front: { bg: "#ffffff", background: { type: "solid", color: "#ffffff" }, layers: [] },
      back,
    };
  }

  if (templateId === "gradient-studio") {
    const deep = rgbToHex(mix(accent, [15, 23, 42], 0.58));
    const bright = rgbToHex(mix(accent, [255, 255, 255], 0.14));
    const on = rgbToHex(textOn(mix(accent, [15, 23, 42], 0.4)));
    const soft = on === "#ffffff" ? "#e4e4e7" : "#3f3f46";
    const layers: Layer[] = [];
    if (logo) {
      const r = logo.w / Math.max(1, logo.h);
      const lh = 9;
      const lw = Math.min(24, lh * r);
      layers.push(makeImage(logo.src, r, "Logo", { fieldKey: "logo", isLogo: true, x: W - lw - 6, y: 6, w: lw, h: lw / r }));
    }
    if (content.company.trim()) {
      layers.push(
        makeText({
          name: "Company",
          fieldKey: "company",
          text: content.company.trim(),
          uppercase: true,
          x: 6.5,
          y: 6.5,
          w: W - 34,
          size: 6.5,
          bold: true,
          fontId: "montserrat",
          family: "helvetica",
          color: soft,
          track: 0.16,
          maxLines: 1,
        })
      );
    }
    if (content.fullName.trim()) {
      layers.push(
        makeText({
          name: "Name",
          fieldKey: "fullName",
          text: content.fullName.trim(),
          x: 6.5,
          y: 14,
          w: W - 26,
          size: 14,
          bold: true,
          fontId: "playfair",
          family: "times",
          color: on,
          maxLines: 2,
        })
      );
    }
    if (content.role.trim()) {
      layers.push(
        makeText({
          name: "Job title",
          fieldKey: "role",
          text: content.role.trim(),
          x: 6.5,
          y: 22.5,
          w: W - 26,
          size: 7.5,
          fontId: "inter",
          family: "helvetica",
          color: soft,
          maxLines: 1,
        })
      );
    }
    layers.push(makeLine(on, { name: "Accent divider", x: 6.5, y: 31, w: 14, h: 1.5, strokeW: 0.45, opacity: 0.7 }));
    const contactLines: Array<[SemanticFieldKey, string, string]> = [
      ["phone", content.phone.trim(), "phone"],
      ["email", content.email.trim(), "mail"],
      ["website", content.website.trim(), "globe"],
    ];
    let cy = H - 5.5 - contactLines.filter(([, v]) => v).length * 4.2;
    const contactW = qr ? W - 34 : W - 18;
    for (const [key, val, iconId] of contactLines) {
      if (!val) continue;
      layers.push(makeIcon(iconId, on, FIELD_FRIENDLY[key], { x: 6.5, y: cy + 0.3, w: 2.8, h: 2.8, opacity: 0.85 }));
      layers.push(
        makeText({
          name: FIELD_FRIENDLY[key],
          fieldKey: key,
          text: val,
          x: 11,
          y: cy,
          w: contactW,
          size: 6.8,
          fontId: "inter",
          family: "helvetica",
          color: on,
          maxLines: 1,
        })
      );
      cy += 4.2;
    }
    if (qr) {
      layers.push(makeShape("rounded-rect", "#ffffff", { name: "QR badge", x: W - 22.5, y: H - 22.5, w: 17, h: 17, radius: 1.8 }));
      layers.push(makeImage(qr.src, 1, "QR code", { fieldKey: "qr", x: W - 21.5, y: H - 21.5, w: 15, h: 15, qrText: qr.target, qrFor: qr.target }));
    }
    const bg: SideBackground = { type: "gradient", from: deep, to: bright, angle: 135 };
    return { front: { bg: deep, background: bg, layers }, back };
  }

  if (templateId === "executive-band") {
    const bandH = 17.5;
    const onBand = rgbToHex(textOn(accent));
    const layers: Layer[] = [
      makeShape("rect", accentHex, { name: "Bottom band", x: 0, y: H - bandH, w: W, h: bandH }),
    ];
    if (logo) {
      const r = logo.w / Math.max(1, logo.h);
      const lh = 10;
      const lw = Math.min(24, lh * r);
      layers.push(makeImage(logo.src, r, "Logo", { fieldKey: "logo", isLogo: true, x: W - lw - 6, y: 6, w: lw, h: lw / r }));
    }
    if (content.fullName.trim()) {
      layers.push(
        makeText({
          name: "Name",
          fieldKey: "fullName",
          text: content.fullName.trim(),
          x: 6.5,
          y: 7,
          w: W - 34,
          size: 13.5,
          bold: true,
          fontId: "plus-jakarta",
          family: "helvetica",
          color: "#111111",
          maxLines: 2,
        })
      );
    }
    if (content.role.trim()) {
      layers.push(
        makeText({
          name: "Job title",
          fieldKey: "role",
          text: content.role.trim(),
          x: 6.5,
          y: 15,
          w: W - 34,
          size: 7.5,
          bold: true,
          fontId: "plus-jakarta",
          family: "helvetica",
          color: accentHex,
          maxLines: 1,
        })
      );
    }
    if (content.company.trim()) {
      layers.push(
        makeText({
          name: "Company",
          fieldKey: "company",
          text: content.company.trim(),
          x: 6.5,
          y: 20,
          w: W - 34,
          size: 7,
          fontId: "plus-jakarta",
          family: "helvetica",
          color: "#52525b",
          maxLines: 1,
        })
      );
    }
    const items: Array<[SemanticFieldKey, string]> = [
      ["phone", content.phone.trim()],
      ["email", content.email.trim()],
      ["website", content.website.trim()],
    ].filter(([, v]) => Boolean(v)) as Array<[SemanticFieldKey, string]>;
    let iy = H - bandH + 2.8;
    const cw = qr ? W - 32 : W - 13;
    for (const [key, val] of items) {
      layers.push(
        makeText({
          name: FIELD_FRIENDLY[key],
          fieldKey: key,
          text: val,
          x: 6.5,
          y: iy,
          w: cw,
          size: 6.6,
          fontId: "inter",
          family: "helvetica",
          color: onBand,
          maxLines: 1,
        })
      );
      iy += 4.1;
    }
    if (qr) {
      layers.push(makeShape("rounded-rect", "#ffffff", { name: "QR card", x: W - 20.5, y: H - 15.8, w: 14, h: 14, radius: 1.4 }));
      layers.push(makeImage(qr.src, 1, "QR code", { fieldKey: "qr", x: W - 19.7, y: H - 15, w: 12.4, h: 12.4, qrText: qr.target, qrFor: qr.target }));
    }
    return { front: { bg: "#ffffff", background: { type: "solid", color: "#ffffff" }, layers }, back };
  }

  if (templateId === "qr-card") {
    const softTint = rgbToHex(mix(accent, [255, 255, 255], 0.9));
    const layers: Layer[] = [
      makeShape("rounded-rect", softTint, { name: "QR panel", x: W - 33, y: 5, w: 28, h: H - 10, radius: 3 }),
    ];
    if (qr) {
      layers.push(makeImage(qr.src, 1, "QR code", { fieldKey: "qr", x: W - 29, y: 10.5, w: 20, h: 20, qrText: qr.target, qrFor: qr.target }));
    } else {
      layers.push(makeImage("", 1, "QR code", { fieldKey: "qr", x: W - 29, y: 10.5, w: 20, h: 20, qrText: content.website || "https://example.com" }));
    }
    layers.push(
      makeText({
        name: "Scan prompt",
        text: "SCAN TO CONNECT",
        x: W - 32,
        y: 33.5,
        w: 26,
        size: 5.5,
        bold: true,
        align: "center",
        fontId: "montserrat",
        family: "helvetica",
        color: accentHex,
        track: 0.12,
        maxLines: 1,
      })
    );
    if (logo) {
      const r = logo.w / Math.max(1, logo.h);
      const lh = 7.5;
      const lw = Math.min(20, lh * r);
      layers.push(makeImage(logo.src, r, "Logo", { fieldKey: "logo", isLogo: true, x: 6, y: 5.5, w: lw, h: lw / r }));
    }
    const textTop = logo ? 16 : 8;
    if (content.fullName.trim()) {
      layers.push(
        makeText({
          name: "Name",
          fieldKey: "fullName",
          text: content.fullName.trim(),
          x: 6,
          y: textTop,
          w: W - 43,
          size: 12,
          bold: true,
          fontId: "dm-sans",
          family: "helvetica",
          color: "#111111",
          maxLines: 2,
        })
      );
    }
    if (content.role.trim()) {
      layers.push(
        makeText({
          name: "Job title",
          fieldKey: "role",
          text: content.role.trim(),
          x: 6,
          y: textTop + 7.2,
          w: W - 43,
          size: 7.2,
          bold: true,
          fontId: "dm-sans",
          family: "helvetica",
          color: accentHex,
          maxLines: 1,
        })
      );
    }
    if (content.company.trim()) {
      layers.push(
        makeText({
          name: "Company",
          fieldKey: "company",
          text: content.company.trim(),
          x: 6,
          y: textTop + 11.4,
          w: W - 43,
          size: 6.8,
          fontId: "dm-sans",
          family: "helvetica",
          color: "#71717a",
          maxLines: 1,
        })
      );
    }
    const items: Array<[SemanticFieldKey, string]> = [
      ["phone", content.phone.trim()],
      ["email", content.email.trim()],
      ["website", content.website.trim()],
    ].filter(([, v]) => Boolean(v)) as Array<[SemanticFieldKey, string]>;
    let cy = H - 5.5 - items.length * 3.8;
    for (const [key, val] of items) {
      layers.push(
        makeText({
          name: FIELD_FRIENDLY[key],
          fieldKey: key,
          text: val,
          x: 6,
          y: cy,
          w: W - 43,
          size: 6.6,
          fontId: "dm-sans",
          family: "helvetica",
          color: "#27272a",
          maxLines: 1,
        })
      );
      cy += 3.8;
    }
    return { front: { bg: "#ffffff", background: { type: "solid", color: "#ffffff" }, layers }, back };
  }

  // Standard 7 built-in simple styles
  const frontEls = layoutCardFront(W, H, templateId, accent, content, logo, !!qr, fit, fonts);
  const front = elsToSide(frontEls, W, H, {
    logo: logo ? { src: logo.src, w: logo.w, h: logo.h } : undefined,
    qr: qr ?? undefined,
  });
  return { front, back };
}

/* ------------------------------------------------------------------------- */
/* Two-way sync helpers between Simple Mode and Advanced Editor               */
/* ------------------------------------------------------------------------- */

export interface SyncedSimpleFields {
  fullName?: string;
  role?: string;
  company?: string;
  phone?: string;
  email?: string;
  website?: string;
  tagline?: string;
  logo?: { src: string; w: number; h: number; name: string } | null;
  hasLogoLayer?: boolean;
  qrText?: string;
  hasQrLayer?: boolean;
}

/** Pulls edits made to tagged layers inside the Advanced Editor back into Simple Mode fields. */
export function extractSyncedFields(design: CardDesign): SyncedSimpleFields {
  const out: SyncedSimpleFields = {};
  const allLayers = [...design.front.layers, ...design.back.layers];

  for (const l of allLayers) {
    if (l.kind === "text" && l.fieldKey) {
      const val = l.text.trim();
      if (l.fieldKey === "fullName" && out.fullName === undefined) out.fullName = val;
      else if (l.fieldKey === "role" && out.role === undefined) out.role = val;
      else if (l.fieldKey === "company" && out.company === undefined) out.company = val;
      else if (l.fieldKey === "phone" && out.phone === undefined) out.phone = val;
      else if (l.fieldKey === "email" && out.email === undefined) out.email = val;
      else if (l.fieldKey === "website" && out.website === undefined) out.website = val;
      else if (l.fieldKey === "tagline" && out.tagline === undefined) out.tagline = val;
    } else if (l.kind === "image") {
      if ((l.fieldKey === "logo" || l.isLogo) && !out.hasLogoLayer) {
        out.hasLogoLayer = true;
        out.logo = { src: l.src, w: Math.round(l.ratio * 300), h: 300, name: l.name || "Logo" };
      }
      if (l.fieldKey === "qr" || l.qrText !== undefined) {
        out.hasQrLayer = true;
        if (l.qrText) out.qrText = l.qrText;
      }
    }
  }
  return out;
}

/** Propagates a Simple Mode text field change into an active custom CardDesign without losing layout edits. */
export function applySimpleTextToDesign(design: CardDesign, key: SemanticFieldKey, value: string): CardDesign {
  const updateSide = (side: SideDesign): SideDesign => ({
    ...side,
    layers: side.layers.map((l) => (l.kind === "text" && l.fieldKey === key ? { ...l, text: value } : l)),
  });
  return { front: updateSide(design.front), back: updateSide(design.back) };
}
