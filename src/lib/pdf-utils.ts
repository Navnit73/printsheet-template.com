export type PaperSizeId = "a4" | "a3" | "letter" | "4x6";

export interface PaperDimensions {
  id: PaperSizeId;
  label: string;
  widthMm: number;
  heightMm: number;
}

export const PAPER_SIZES: Record<PaperSizeId, PaperDimensions> = {
  a4: { id: "a4", label: "A4 (210 × 297 mm)", widthMm: 210, heightMm: 297 },
  a3: { id: "a3", label: "A3 (297 × 420 mm)", widthMm: 297, heightMm: 420 },
  letter: {
    id: "letter",
    label: "US Letter (8.5 × 11 in)",
    widthMm: 215.9,
    heightMm: 279.4,
  },
  "4x6": {
    id: "4x6",
    label: "4×6 in / 4R (101.6 × 152.4 mm)",
    widthMm: 101.6,
    heightMm: 152.4,
  },
};

export function getOrientedPaper(
  paperId: PaperSizeId,
  orientation: "portrait" | "landscape"
): { widthMm: number; heightMm: number } {
  const base = PAPER_SIZES[paperId];
  if (orientation === "landscape") {
    return {
      widthMm: Math.max(base.widthMm, base.heightMm),
      heightMm: Math.min(base.widthMm, base.heightMm),
    };
  }
  return {
    widthMm: Math.min(base.widthMm, base.heightMm),
    heightMm: Math.max(base.widthMm, base.heightMm),
  };
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export async function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

/**
 * Renders an image into a target pixel box on an offscreen canvas with either
 * "cover" (crop to fill) or "contain" (fit inside with optional background)
 * so jsPDF receives a clean JPEG/PNG matching the exact slot aspect ratio.
 */
export async function renderImageToBoxDataUrl(
  src: string,
  targetAspect: number,
  fit: "cover" | "contain",
  bgColor = "#ffffff",
  targetLongSidePx = 1200
): Promise<{ dataUrl: string; format: "JPEG" | "PNG" }> {
  const img = await loadImageElement(src);
  const w =
    targetAspect >= 1
      ? targetLongSidePx
      : Math.max(200, Math.round(targetLongSidePx * targetAspect));
  const h =
    targetAspect >= 1
      ? Math.max(200, Math.round(targetLongSidePx / targetAspect))
      : targetLongSidePx;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);

  const imgAspect = img.naturalWidth / Math.max(1, img.naturalHeight);
  let drawW = w;
  let drawH = h;
  let dx = 0;
  let dy = 0;

  if (fit === "cover") {
    if (imgAspect > targetAspect) {
      drawH = h;
      drawW = h * imgAspect;
      dx = (w - drawW) / 2;
    } else {
      drawW = w;
      drawH = w / imgAspect;
      dy = (h - drawH) / 2;
    }
  } else {
    if (imgAspect > targetAspect) {
      drawW = w;
      drawH = w / imgAspect;
      dy = (h - drawH) / 2;
    } else {
      drawH = h;
      drawW = h * imgAspect;
      dx = (w - drawW) / 2;
    }
  }

  ctx.drawImage(img, dx, dy, drawW, drawH);
  return {
    dataUrl: canvas.toDataURL("image/jpeg", 0.92),
    format: "JPEG",
  };
}

/**
 * Creates crisp synthetic sample images via canvas for instant zero-upload testing.
 */
export function createSamplePhotoDataUrl(
  index: number,
  label: string,
  accentHex = "#4d7c0f"
): string {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 675;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const palettes = [
    ["#f4f4f5", "#18181b", accentHex],
    ["#ecfccb", "#18181b", "#3f6212"],
    ["#e4e4e7", "#09090b", "#4d7c0f"],
    ["#fafafa", "#27272a", "#65a30d"],
  ];
  const [bg, ink, hi] = palettes[index % palettes.length];

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Architectural print-registration motif
  ctx.strokeStyle = hi;
  ctx.lineWidth = 6;
  ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

  ctx.fillStyle = hi;
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2 - 40, 110, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 72px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`0${index + 1}`, canvas.width / 2, canvas.height / 2 - 38);

  ctx.fillStyle = ink;
  ctx.font = "600 36px sans-serif";
  ctx.fillText(label, canvas.width / 2, canvas.height / 2 + 125);

  ctx.fillStyle = "#52525b";
  ctx.font = "24px monospace";
  ctx.fillText("PRINT SHEET MAKER SAMPLE", canvas.width / 2, canvas.height / 2 + 175);

  return canvas.toDataURL("image/png");
}

export function drawCropMarksPdf(
  doc: import("jspdf").jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  markLen = 3,
  offset = 1
) {
  doc.setDrawColor(113, 113, 122);
  doc.setLineWidth(0.2);

  // Top-left
  doc.line(x - offset - markLen, y, x - offset, y);
  doc.line(x, y - offset - markLen, x, y - offset);
  // Top-right
  doc.line(x + w + offset, y, x + w + offset + markLen, y);
  doc.line(x + w, y - offset - markLen, x + w, y - offset);
  // Bottom-left
  doc.line(x - offset - markLen, y + h, x - offset, y + h);
  doc.line(x, y + h + offset, x, y + h + offset + markLen);
  // Bottom-right
  doc.line(x + w + offset, y + h, x + w + offset + markLen, y + h);
  doc.line(x + w, y + h + offset, x + w, y + h + offset + markLen);
}


/* ------------------------------------------------------------------------- */
/* Shared helpers for preview ↔ PDF parity (text fitting, image fitting, fit) */
/* ------------------------------------------------------------------------- */

const PT_TO_MM = 25.4 / 72;

/**
 * jsPDF's built-in fonts (Helvetica/Times/Courier) only cover WinAnsi
 * (≈ Latin-1 + a few typographic glyphs). Anything else prints as garbage.
 */
const WIN_ANSI_EXTRA = new Set(
  "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ".split("")
);

export function isPdfSafeText(text: string): boolean {
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if (code === 10 || code === 13 || code === 9) continue;
    if (code >= 32 && code <= 126) continue;
    if (code >= 160 && code <= 255) continue;
    if (WIN_ANSI_EXTRA.has(ch)) continue;
    return false;
  }
  return true;
}

export interface FittedTextOptions {
  /** Left edge (align "left"), centre (align "center") or right edge (align "right"), in mm. */
  x: number;
  /** Top of the text block, in mm. */
  y: number;
  maxWidth: number;
  /** Optional height budget in mm; font shrinks until the wrapped block fits. */
  maxHeight?: number;
  maxLines?: number;
  fontSize: number; // pt
  minFontSize?: number; // pt
  fontStyle?: "normal" | "bold" | "italic" | "bolditalic";
  /** jsPDF built-in family. Rasterised fallback uses a matching system font stack. */
  fontFamily?: PdfFontFamily;
  align?: "left" | "center" | "right";
  color?: [number, number, number];
  lineHeightFactor?: number;
}

export interface FittedTextLayout {
  lines: string[];
  fontSize: number;
  lineHeightMm: number;
  heightMm: number;
  widthMm: number;
}

type MeasureFn = (text: string, sizePt: number) => number; // returns mm

function wrapWords(text: string, maxWidth: number, size: number, measure: MeasureFn): string[] {
  const out: string[] = [];
  for (const para of text.split(/\r?\n/)) {
    const words = para.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      out.push("");
      continue;
    }
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (measure(candidate, size) <= maxWidth || !line) {
        line = candidate;
      } else {
        out.push(line);
        line = word;
      }
    }
    if (line) out.push(line);
  }
  return out;
}

function truncateToWidth(text: string, maxWidth: number, size: number, measure: MeasureFn): string {
  if (measure(text, size) <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && measure(`${t}…`, size) > maxWidth) t = t.slice(0, -1);
  return `${t.trimEnd()}…`;
}

/** Pure layout: wrap + shrink-to-fit + ellipsis. Used by the PDF renderer and safe to reuse for previews. */
export function layoutFittedText(
  text: string,
  opts: Pick<FittedTextOptions, "maxWidth" | "maxHeight" | "maxLines" | "fontSize" | "minFontSize" | "lineHeightFactor">,
  measure: MeasureFn
): FittedTextLayout {
  const lhf = opts.lineHeightFactor ?? 1.2;
  const minSize = Math.min(opts.minFontSize ?? opts.fontSize * 0.6, opts.fontSize);
  const maxLines = opts.maxLines ?? Infinity;

  let size = opts.fontSize;
  let lines: string[] = [];
  for (; size >= minSize - 0.001; size -= 0.5) {
    lines = wrapWords(text, opts.maxWidth, size, measure);
    const lineH = size * PT_TO_MM * lhf;
    const tooWide = lines.some((l) => measure(l, size) > opts.maxWidth + 0.01);
    const tooTall = opts.maxHeight !== undefined && lines.length * lineH > opts.maxHeight + 0.01;
    if (!tooWide && !tooTall && lines.length <= maxLines) break;
  }
  size = Math.max(size, minSize);
  lines = wrapWords(text, opts.maxWidth, size, measure);
  const lineH = size * PT_TO_MM * lhf;

  let allowed = maxLines;
  if (opts.maxHeight !== undefined) {
    allowed = Math.min(allowed, Math.max(1, Math.floor((opts.maxHeight + 0.01) / lineH)));
  }
  if (lines.length > allowed) {
    lines = lines.slice(0, allowed);
    lines[allowed - 1] = truncateToWidth(`${lines[allowed - 1]}…`.replace(/…$/, ""), opts.maxWidth, size, measure);
    if (!lines[allowed - 1].endsWith("…")) lines[allowed - 1] = truncateToWidth(`${lines[allowed - 1]} …`, opts.maxWidth, size, measure);
  }
  lines = lines.map((l) => truncateToWidth(l, opts.maxWidth, size, measure));

  return {
    lines,
    fontSize: size,
    lineHeightMm: lineH,
    heightMm: lines.length * lineH,
    widthMm: Math.max(0, ...lines.map((l) => measure(l, size))),
  };
}

export type PdfFontFamily = "helvetica" | "times" | "courier";

/** Font pairings tools can offer. heading/body are jsPDF built-in families. */
export const FONT_PAIRS: Record<string, { label: string; heading: PdfFontFamily; body: PdfFontFamily; cssHeading: string; cssBody: string }> = {
  modern: { label: "Modern", heading: "helvetica", body: "helvetica", cssHeading: "Helvetica, Arial, sans-serif", cssBody: "Helvetica, Arial, sans-serif" },
  classic: { label: "Classic serif", heading: "times", body: "times", cssHeading: '"Times New Roman", Times, Georgia, serif', cssBody: '"Times New Roman", Times, Georgia, serif' },
  editorial: { label: "Serif + sans", heading: "times", body: "helvetica", cssHeading: '"Times New Roman", Times, Georgia, serif', cssBody: "Helvetica, Arial, sans-serif" },
  typewriter: { label: "Typewriter", heading: "courier", body: "courier", cssHeading: '"Courier New", Courier, monospace', cssBody: '"Courier New", Courier, monospace' },
};

const CJK_FALLBACK = '"Noto Sans", "Noto Sans CJK SC", "PingFang SC", "Hiragino Sans", sans-serif';
const CANVAS_FONT_STACKS: Record<PdfFontFamily, string> = {
  helvetica: `"Helvetica Neue", Helvetica, Arial, ${CJK_FALLBACK}`,
  times: `"Times New Roman", Times, Georgia, "Noto Serif", "Noto Serif CJK SC", serif`,
  courier: `"Courier New", Courier, monospace, ${CJK_FALLBACK}`,
};
const CANVAS_PX_PER_MM = 16; // ≈ 406 DPI raster for non-Latin text

function canvasFont(style: FittedTextOptions["fontStyle"], sizePt: number, family: PdfFontFamily = "helvetica"): string {
  const px = sizePt * PT_TO_MM * CANVAS_PX_PER_MM;
  const weight = style === "bold" || style === "bolditalic" ? "700" : "400";
  const italic = style === "italic" || style === "bolditalic" ? "italic " : "";
  return `${italic}${weight} ${px}px ${CANVAS_FONT_STACKS[family]}`;
}

/**
 * Draws text into a box: wraps, shrinks to fit, ellipsises overflow, and never
 * draws outside maxWidth / maxHeight. Text outside WinAnsi (e.g. "Ü", "株式会社",
 * "Иван", emoji) is rasterised through a canvas so it prints correctly instead of
 * turning into garbage with jsPDF's built-in fonts.
 */
export function drawFittedText(
  doc: import("jspdf").jsPDF,
  text: string,
  opts: FittedTextOptions
): FittedTextLayout {
  const align = opts.align ?? "left";
  const style = opts.fontStyle ?? "normal";
  const family = opts.fontFamily ?? "helvetica";
  const color = opts.color ?? [24, 24, 27];
  const clean = (text ?? "").trim();
  if (!clean) {
    return { lines: [], fontSize: opts.fontSize, lineHeightMm: 0, heightMm: 0, widthMm: 0 };
  }

  if (isPdfSafeText(clean)) {
    doc.setFont(family, style);
    const measure: MeasureFn = (t, size) => {
      doc.setFontSize(size);
      return doc.getTextWidth(t);
    };
    const layout = layoutFittedText(clean, opts, measure);
    doc.setFontSize(layout.fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    layout.lines.forEach((line, i) => {
      doc.text(line, opts.x, opts.y + i * layout.lineHeightMm, { baseline: "top", align });
    });
    return layout;
  }

  // Unicode fallback: rasterise with the system font stack.
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return { lines: [], fontSize: opts.fontSize, lineHeightMm: 0, heightMm: 0, widthMm: 0 };
  const measure: MeasureFn = (t, size) => {
    ctx.font = canvasFont(style, size, family);
    return ctx.measureText(t).width / CANVAS_PX_PER_MM;
  };
  const layout = layoutFittedText(clean, opts, measure);
  const wMm = Math.max(0.5, layout.widthMm);
  const hMm = Math.max(0.5, layout.heightMm);
  // Pad around the text so accents above capitals (Ü, É), descenders and
  // italic overhangs aren't clipped by the canvas edge.
  const padPx = Math.ceil(layout.fontSize * PT_TO_MM * CANVAS_PX_PER_MM * 0.35);
  canvas.width = Math.ceil(wMm * CANVAS_PX_PER_MM) + 2 + padPx * 2;
  canvas.height = Math.ceil(hMm * CANVAS_PX_PER_MM) + 2 + padPx * 2;
  ctx.font = canvasFont(style, layout.fontSize, family);
  ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  ctx.textBaseline = "top";
  ctx.textAlign = align;
  const anchorX = align === "left" ? padPx : align === "center" ? canvas.width / 2 : canvas.width - padPx;
  layout.lines.forEach((line, i) => {
    ctx.fillText(line, anchorX, padPx + i * layout.lineHeightMm * CANVAS_PX_PER_MM);
  });
  const padMm = padPx / CANVAS_PX_PER_MM;
  const left = (align === "left" ? opts.x : align === "center" ? opts.x - wMm / 2 : opts.x - wMm) - padMm;
  doc.addImage(canvas.toDataURL("image/png"), "PNG", left, opts.y - padMm, canvas.width / CANVAS_PX_PER_MM, canvas.height / CANVAS_PX_PER_MM);
  return layout;
}

/** "contain" placement of an image of natural size (imgW × imgH) inside a box, preserving aspect ratio. */
export function fitContain(
  imgW: number,
  imgH: number,
  box: { x: number; y: number; w: number; h: number },
  align: "center" | "left" = "center"
): { x: number; y: number; w: number; h: number } {
  const ia = imgW / Math.max(1, imgH);
  const ba = box.w / Math.max(0.0001, box.h);
  const w = ia > ba ? box.w : box.h * ia;
  const h = ia > ba ? box.w / ia : box.h;
  return {
    x: align === "left" ? box.x : box.x + (box.w - w) / 2,
    y: box.y + (box.h - h) / 2,
    w,
    h,
  };
}

export async function getImageNaturalSize(src: string): Promise<{ width: number; height: number }> {
  const img = await loadImageElement(src);
  return { width: img.naturalWidth || img.width, height: img.naturalHeight || img.height };
}

/** Minimum distance (mm) from paper edge most home printers can reliably print. */
export const PRINTER_SAFE_MARGIN_MM = 4;

/**
 * Checks whether a uniform grid fits on the paper. Returns how many columns/rows
 * would actually fit so tools can show "doesn't fit — try N columns" messages
 * and disable export instead of printing cut-off rows.
 */
export function checkGridFit(p: {
  paperW: number;
  paperH: number;
  cols: number;
  rows: number;
  itemW: number;
  itemH: number;
  gapX?: number;
  gapY?: number;
  marginX?: number; // left margin (or both sides when centred)
  marginY?: number; // top margin
  centered?: boolean;
}): { fits: boolean; usedW: number; usedH: number; maxCols: number; maxRows: number; overflowXMm: number; overflowYMm: number } {
  const gapX = p.gapX ?? 0;
  const gapY = p.gapY ?? 0;
  const mx = p.marginX ?? 0;
  const my = p.marginY ?? 0;
  const usedW = p.cols * p.itemW + Math.max(0, p.cols - 1) * gapX;
  const usedH = p.rows * p.itemH + Math.max(0, p.rows - 1) * gapY;
  const availW = p.centered ? p.paperW - 2 * mx : p.paperW - mx;
  const availH = p.centered ? p.paperH - 2 * my : p.paperH - my;
  const maxCols = Math.max(0, Math.floor((availW + gapX + 0.001) / (p.itemW + gapX)));
  const maxRows = Math.max(0, Math.floor((availH + gapY + 0.001) / (p.itemH + gapY)));
  const overflowXMm = Math.max(0, usedW - availW);
  const overflowYMm = Math.max(0, usedH - availH);
  return { fits: overflowXMm < 0.05 && overflowYMm < 0.05, usedW, usedH, maxCols, maxRows, overflowXMm, overflowYMm };
}
