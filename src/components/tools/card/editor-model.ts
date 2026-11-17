import type { FittedTextOptions, PdfFontFamily } from "@/lib/pdf-utils";
import { hexToRgb, spacedLine, type CardEl, type FitFn, type RGB } from "./engine";

/* A free-form card: a background colour plus a stack of layers (first = bottom). All units mm. */

interface LayerBase {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  /** Ignored for text (its height follows the wrapped text). */
  h: number;
  hidden?: boolean;
  locked?: boolean;
}

export interface TextLayer extends LayerBase {
  kind: "text";
  text: string;
  /** pt */
  size: number;
  family: PdfFontFamily;
  bold: boolean;
  italic: boolean;
  align: "left" | "center" | "right";
  color: string;
  /** letter-spacing in em (single-line Latin text only) */
  track: number;
  /** line-height factor */
  leading: number;
}

export interface ShapeLayer extends LayerBase {
  kind: "rect" | "ellipse" | "frame";
  color: string;
  /** frame outline thickness */
  strokeW: number;
}

export interface ImageLayer extends LayerBase {
  kind: "image";
  src: string;
  /** natural width / height, used to keep the shape when resizing */
  ratio: number;
  /** For QR layers: what the code opens. `qrFor` is what `src` currently encodes. */
  qrText?: string;
  qrFor?: string;
}

export type Layer = TextLayer | ShapeLayer | ImageLayer;
export interface SideDesign {
  bg: string;
  layers: Layer[];
}
export interface CardDesign {
  front: SideDesign;
  back: SideDesign;
}
export type Box = { x: number; y: number; w: number; h: number };

let counter = 0;
export const newLayerId = () => `layer-${Date.now().toString(36)}-${counter++}`;

export const rgbToHex = (c: RGB) => `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;

export const FAMILY_LABEL: Record<PdfFontFamily, string> = { helvetica: "Sans-serif", times: "Serif", courier: "Monospace" };

export function makeText(over: Partial<TextLayer> = {}): TextLayer {
  return {
    id: newLayerId(),
    kind: "text",
    name: "Text",
    x: 6,
    y: 6,
    w: 50,
    h: 5,
    text: "Your text",
    size: 9,
    family: "helvetica",
    bold: false,
    italic: false,
    align: "left",
    color: "#18181b",
    track: 0,
    leading: 1.2,
    ...over,
  };
}

export function makeShape(kind: ShapeLayer["kind"], color: string, over: Partial<ShapeLayer> = {}): ShapeLayer {
  const names = { rect: "Rectangle", ellipse: "Circle", frame: "Outline box" } as const;
  return { id: newLayerId(), kind, name: names[kind], x: 10, y: 10, w: 24, h: kind === "ellipse" ? 24 : 14, color, strokeW: 0.4, ...over };
}

export function makeImage(src: string, ratio: number, name: string, over: Partial<ImageLayer> = {}): ImageLayer {
  const w = ratio >= 1 ? 24 : 24 * ratio;
  return { id: newLayerId(), kind: "image", name, src, ratio, x: 10, y: 10, w, h: w / ratio, ...over };
}

export const layerLabel = (l: Layer) =>
  l.kind === "text" ? l.text.trim().split("\n")[0].slice(0, 28) || "Empty text" : l.name;

/** Compile a side into drawable elements plus the on-card box of every layer (for selection handles). */
export function compileSide(side: SideDesign, W: number, H: number, fit: FitFn) {
  const els: CardEl[] = [];
  const bounds = new Map<string, Box>();
  if (side.bg.toLowerCase() !== "#ffffff") {
    els.push({ kind: "rect", x: 0, y: 0, w: W, h: H, fill: hexToRgb(side.bg) });
  }
  for (const l of side.layers) {
    bounds.set(l.id, { x: l.x, y: l.y, w: l.w, h: l.h });
    if (l.hidden) continue;
    if (l.kind === "rect") els.push({ kind: "rect", x: l.x, y: l.y, w: l.w, h: l.h, fill: hexToRgb(l.color) });
    else if (l.kind === "ellipse")
      els.push({ kind: "ellipse", cx: l.x + l.w / 2, cy: l.y + l.h / 2, rx: l.w / 2, ry: l.h / 2, fill: hexToRgb(l.color) });
    else if (l.kind === "frame")
      els.push({ kind: "frame", x: l.x, y: l.y, w: l.w, h: l.h, stroke: hexToRgb(l.color), lineWidth: l.strokeW });
    else if (l.kind === "image") els.push({ kind: "image", src: l.src, x: l.x, y: l.y, w: l.w, h: l.h });
    else if (l.kind === "text") {
      const anchor = l.align === "center" ? l.x + l.w / 2 : l.align === "right" ? l.x + l.w : l.x;
      const opts: FittedTextOptions = {
        x: anchor,
        y: l.y,
        maxWidth: Math.max(1, l.w),
        fontSize: l.size,
        minFontSize: l.size,
        fontStyle: l.bold ? (l.italic ? "bolditalic" : "bold") : l.italic ? "italic" : "normal",
        fontFamily: l.family,
        align: l.align,
        color: hexToRgb(l.color),
        lineHeightFactor: l.leading,
      };
      const text = l.text.replace(/\s+$/g, "");
      const el: CardEl =
        l.track > 0 && !text.includes("\n")
          ? spacedLine(fit, text, opts, l.track)
          : { kind: "text", text, opts, layout: fit(text, opts) };
      els.push(el);
      const lineH = l.size * (25.4 / 72) * l.leading;
      bounds.set(l.id, { x: l.x, y: l.y, w: l.w, h: Math.max(lineH, el.kind === "text" ? el.layout.heightMm : 0) });
    }
  }
  return { els, bounds };
}

/** Turn a preset's drawn elements into editable layers. */
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
      layers.push(makeShape("rect", rgbToHex(el.fill), { name: thin ? "Line" : "Shape", x: el.x, y: el.y, w: el.w, h: el.h }));
    } else if (el.kind === "circle") {
      layers.push(makeShape("ellipse", rgbToHex(el.fill), { x: el.cx - el.r, y: el.cy - el.r, w: 2 * el.r, h: 2 * el.r }));
    } else if (el.kind === "ellipse") {
      layers.push(makeShape("ellipse", rgbToHex(el.fill), { x: el.cx - el.rx, y: el.cy - el.ry, w: 2 * el.rx, h: 2 * el.ry }));
    } else if (el.kind === "frame") {
      layers.push(makeShape("frame", rgbToHex(el.stroke), { x: el.x, y: el.y, w: el.w, h: el.h, strokeW: el.lineWidth }));
    } else if (el.kind === "image") {
      if (el.which === "logo" && images.logo) {
        layers.push(makeImage(images.logo.src, images.logo.w / images.logo.h, "Logo", { x: el.x, y: el.y, w: el.w, h: el.h }));
      } else if (el.which === "qr" && images.qr) {
        layers.push(
          makeImage(images.qr.src, 1, "QR code", { x: el.x, y: el.y, w: el.w, h: el.h, qrText: images.qr.target, qrFor: images.qr.target })
        );
      }
    } else {
      const { opts, layout } = el;
      const style = opts.fontStyle ?? "normal";
      const tracked = !!el.trackEm;
      const w = tracked ? Math.min(W - opts.x, layout.widthMm + 2) : opts.maxWidth;
      const align = opts.align ?? "left";
      const x = tracked || align === "left" ? opts.x : align === "center" ? opts.x - w / 2 : opts.x - w;
      layers.push(
        makeText({
          name: "Text",
          text: el.text,
          x,
          y: opts.y,
          w,
          h: layout.heightMm,
          size: layout.fontSize,
          family: opts.fontFamily ?? "helvetica",
          bold: style === "bold" || style === "bolditalic",
          italic: style === "italic" || style === "bolditalic",
          align: tracked ? "left" : align,
          color: rgbToHex(opts.color ?? [24, 24, 27]),
          track: el.trackEm ?? 0,
          leading: opts.lineHeightFactor ?? 1.2,
        })
      );
    }
  });
  return { bg, layers };
}
