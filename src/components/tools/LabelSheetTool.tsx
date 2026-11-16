"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, Download, Loader2, Scissors, X } from "lucide-react";
import type { jsPDF as JsPdfDoc } from "jspdf";
import type { PageId } from "@/types/spec";
import {
  checkGridFit,
  createSamplePhotoDataUrl,
  drawFittedText,
  fileToDataUrl,
  fitContain,
  isPdfSafeText,
  layoutFittedText,
  loadImageElement,
  PAPER_SIZES,
  renderImageToBoxDataUrl,
  type PaperSizeId,
} from "@/lib/pdf-utils";
import { useNumberField } from "@/lib/use-number-field";
import {
  FieldHint,
  MobileActionBar,
  UploadDropzone,
  PrintTipsPanel,
  primaryButtonClass,
  secondaryButtonClass,
  StepHeader,
  ToolStatus,
  type ToolStatusValue,
} from "@/components/tools/ui/ToolUi";
import {
  buildLabelScene,
  ColourSwatchPicker,
  drawLabelScene,
  FontPairPicker,
  LabelArt,
  LabelStylePicker,
  makeMeasure,
  useLabelMeasure,
  type FontPairId,
  type LabelDesign,
  type LabelPrim,
  type LabelStyleId,
} from "@/components/tools/ui/LabelDesign";

/* ------------------------------------------------------------------------- */
/* Grid presets                                                               */
/* ------------------------------------------------------------------------- */

interface GridSpec {
  cols: number;
  rows: number;
  labelW: number;
  labelH: number;
  marginTop: number;
  marginLeft: number;
  gapX: number;
  gapY: number;
  round?: boolean;
}

interface GridConfig extends GridSpec {
  paper: PaperSizeId;
}

interface PresetDef {
  key: string;
  /** Short name shown after the grid size, e.g. "Address". */
  name: string;
  a4: GridSpec;
  letter: GridSpec;
  /**
   * Retail sheet this preset's geometry was matched to (label size, count and
   * margins). Only set where the spec was actually checked — otherwise the
   * picker shows just count + size.
   */
  fitsA4?: string;
  fitsLetter?: string;
}

type SheetPaper = "a4" | "letter";

const RECT_PRESETS: PresetDef[] = [
  {
    key: "2x5",
    name: "",
    a4: { cols: 2, rows: 5, labelW: 99, labelH: 55, marginTop: 11, marginLeft: 4.5, gapX: 3, gapY: 0, round: false },
    // Avery 5163-style 4" × 2"
    letter: { cols: 2, rows: 5, labelW: 101.6, labelH: 50.8, marginTop: 12.7, marginLeft: 4, gapX: 4.7, gapY: 0, round: false },
    fitsLetter: "Avery 5163",
  },
  {
    key: "address",
    name: "Address",
    // Avery L7163: 4.65 + 2 × 99.1 + 2.5 + 4.65 = 210 · 15.15 + 7 × 38.1 + 15.15 = 297
    a4: { cols: 2, rows: 7, labelW: 99.1, labelH: 38.1, marginTop: 15.15, marginLeft: 4.65, gapX: 2.5, gapY: 0, round: false },
    // Avery 5162-style 4" × 1⅓"
    letter: { cols: 2, rows: 7, labelW: 101.6, labelH: 33.9, marginTop: 21, marginLeft: 4, gapX: 4.7, gapY: 0, round: false },
    fitsA4: "Avery L7163",
    fitsLetter: "Avery 5162",
  },
  {
    key: "3x8",
    name: "",
    // L7159-size labels (top 12.9 checks out). The quoted 6.45 mm side margin does not sum to 210 mm with
    // 2.5 mm gaps (208.4), so the grid is centred instead and no brand code is claimed.
    a4: { cols: 3, rows: 8, labelW: 63.5, labelH: 33.9, marginTop: 12.9, marginLeft: 7.25, gapX: 2.5, gapY: 0, round: false },
    // Avery 5160-style 2⅝" × 1"
    letter: { cols: 3, rows: 10, labelW: 66.7, labelH: 25.4, marginTop: 12.7, marginLeft: 4.8, gapX: 3.2, gapY: 0, round: false },
    fitsLetter: "Avery 5160",
  },
  {
    key: "shipping",
    name: "Shipping",
    // Avery L7165: 4.65 + 2 × 99.1 + 2.5 + 4.65 = 210 · 13.1 + 4 × 67.7 + 13.1 = 297
    a4: { cols: 2, rows: 4, labelW: 99.1, labelH: 67.7, marginTop: 13.1, marginLeft: 4.65, gapX: 2.5, gapY: 0, round: false },
    // Avery 5164-style 4" × 3⅓"
    letter: { cols: 2, rows: 3, labelW: 101.6, labelH: 84.7, marginTop: 12.7, marginLeft: 4, gapX: 4.7, gapY: 0, round: false },
    fitsA4: "Avery L7165",
    fitsLetter: "Avery 5164",
  },
  {
    key: "3x7",
    name: "",
    // Avery L7160: 7.25 + 3 × 63.5 + 2 × 2.5 + 7.25 = 210 · 15.15 + 7 × 38.1 + 15.15 = 297
    a4: { cols: 3, rows: 7, labelW: 63.5, labelH: 38.1, marginTop: 15.15, marginLeft: 7.25, gapX: 2.5, gapY: 0, round: false },
    // Same labels centred on Letter (no matching retail sheet claimed).
    letter: { cols: 3, rows: 7, labelW: 63.5, labelH: 38.1, marginTop: 6.35, marginLeft: 10.2, gapX: 2.5, gapY: 0, round: false },
    fitsA4: "Avery L7160",
  },
];

const ROUND_PRESETS: PresetDef[] = [
  {
    key: "r25",
    name: "",
    a4: { cols: 6, rows: 8, labelW: 25, labelH: 25, marginTop: 16, marginLeft: 14, gapX: 6, gapY: 6, round: true },
    letter: { cols: 6, rows: 8, labelW: 25, labelH: 25, marginTop: 16, marginLeft: 15, gapX: 6, gapY: 6, round: true },
  },
  {
    key: "r40",
    name: "",
    a4: { cols: 4, rows: 6, labelW: 40, labelH: 40, marginTop: 13, marginLeft: 12, gapX: 8, gapY: 5, round: true },
    letter: { cols: 4, rows: 6, labelW: 40, labelH: 40, marginTop: 10, marginLeft: 15, gapX: 8, gapY: 4, round: true },
  },
  {
    key: "r50",
    name: "",
    a4: { cols: 3, rows: 5, labelW: 50, labelH: 50, marginTop: 15, marginLeft: 20, gapX: 10, gapY: 4, round: true },
    letter: { cols: 3, rows: 5, labelW: 50, labelH: 50, marginTop: 12, marginLeft: 23, gapX: 10, gapY: 3, round: true },
  },
  {
    key: "r60",
    name: "",
    a4: { cols: 3, rows: 4, labelW: 60, labelH: 60, marginTop: 18, marginLeft: 10, gapX: 5, gapY: 6, round: true },
    letter: { cols: 3, rows: 4, labelW: 60, labelH: 60, marginTop: 18, marginLeft: 13, gapX: 5, gapY: 6, round: true },
  },
];

const STICKER_PRESET: PresetDef = {
  key: "stickers",
  name: "Stickers",
  a4: { cols: 3, rows: 4, labelW: 58, labelH: 62, marginTop: 14, marginLeft: 12, gapX: 6, gapY: 6, round: false },
  letter: { cols: 3, rows: 4, labelW: 58, labelH: 62, marginTop: 9, marginLeft: 15, gapX: 6, gapY: 4, round: false },
};

const NAMETAG_PRESET: PresetDef = {
  key: "nametags",
  name: "Name tags",
  a4: { cols: 2, rows: 5, labelW: 90, labelH: 54, marginTop: 13, marginLeft: 12, gapX: 6, gapY: 0, round: false },
  letter: { cols: 2, rows: 5, labelW: 90, labelH: 50.8, marginTop: 12.7, marginLeft: 14, gapX: 8, gapY: 0, round: false },
};

function getPresets(pageId: PageId): PresetDef[] {
  if (pageId === "T19") return ROUND_PRESETS;
  if (pageId === "T22") return [STICKER_PRESET, ...RECT_PRESETS];
  if (pageId === "T23") return [NAMETAG_PRESET, ...RECT_PRESETS];
  return RECT_PRESETS;
}

function getInitialPresetKey(pageId: PageId): string {
  switch (pageId) {
    case "T18":
    case "T21":
      return "3x8";
    case "T19":
      return "r50";
    case "T20":
      return "address";
    case "T22":
      return "stickers";
    case "T23":
      return "nametags";
    case "T17":
    default:
      return "2x5";
  }
}

function specMatches(spec: GridSpec, g: GridConfig): boolean {
  return (
    spec.cols === g.cols &&
    spec.rows === g.rows &&
    spec.labelW === g.labelW &&
    spec.labelH === g.labelH &&
    !!spec.round === !!g.round
  );
}

function presetCount(spec: GridSpec): string {
  return `${spec.cols * spec.rows} per sheet`;
}

function presetSize(spec: GridSpec): string {
  if (spec.round) return `${spec.labelW} mm circles`;
  return `${spec.labelW} × ${spec.labelH} mm`;
}

const PAPER_SHORT: Record<SheetPaper, string> = { a4: "A4", letter: "US Letter" };

/* ------------------------------------------------------------------------- */
/* Barcode validation                                                         */
/* ------------------------------------------------------------------------- */

type BarcodeFormat = "CODE128" | "EAN13" | "UPC";

interface BarcodeLine {
  line: number;
  code: string;
  name: string;
  price: string;
  error: string | null;
}

function gtinCheckDigit(body: string): number {
  // Weights 3,1,3,1… from the rightmost body digit (works for EAN-13 and UPC-A).
  let sum = 0;
  for (let i = 0; i < body.length; i++) {
    const digit = Number(body[body.length - 1 - i]);
    sum += digit * (i % 2 === 0 ? 3 : 1);
  }
  return (10 - (sum % 10)) % 10;
}

function validateBarcode(code: string, format: BarcodeFormat): string | null {
  if (!code) return "Missing barcode value before the first “|”.";
  if (format === "CODE128") {
    if (!/^[\x00-\x7F]+$/.test(code)) return "Code 128 only supports plain ASCII characters (A–Z, 0–9, basic symbols).";
    if (code.length > 48) return "Code 128 value is too long to scan reliably on a label (max 48 characters).";
    return null;
  }
  const name = format === "EAN13" ? "EAN-13" : "UPC-A";
  const bodyLen = format === "EAN13" ? 12 : 11;
  if (!/^\d+$/.test(code)) return `${name} must contain digits only.`;
  if (code.length !== bodyLen && code.length !== bodyLen + 1) {
    return `${name} needs ${bodyLen} or ${bodyLen + 1} digits (got ${code.length}).`;
  }
  if (code.length === bodyLen + 1) {
    const expected = gtinCheckDigit(code.slice(0, bodyLen));
    if (Number(code[bodyLen]) !== expected) {
      return `${name} check digit should be ${expected} (last digit is ${code[bodyLen]}).`;
    }
  }
  return null;
}

type JsBarcodeFn = typeof import("jsbarcode");

function renderBarcodeCanvas(
  JsBarcode: JsBarcodeFn,
  code: string,
  format: BarcodeFormat
): { dataUrl: string; w: number; h: number } {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, code, {
    format,
    width: 2,
    height: 55,
    displayValue: true,
    fontSize: 13,
    margin: 6,
    background: "#ffffff",
    lineColor: "#000000",
  });
  return { dataUrl: canvas.toDataURL("image/png"), w: canvas.width, h: canvas.height };
}

/* ------------------------------------------------------------------------- */
/* PDF text + image helpers                                                   */
/* ------------------------------------------------------------------------- */

const PT_TO_MM = 25.4 / 72;
const CANVAS_FONT_STACK =
  '"Helvetica Neue", Helvetica, Arial, "Noto Sans", "Noto Sans CJK SC", "PingFang SC", "Hiragino Sans", sans-serif';

type Rgb = [number, number, number];

interface TextBlock {
  text: string;
  fontSize: number;
  minFontSize: number;
  bold?: boolean;
  color: Rgb;
  maxLines: number;
  gapBefore?: number;
}

/** Mirrors drawFittedText's measuring so we can size a block before drawing it. */
function measureFor(doc: JsPdfDoc, text: string, bold: boolean) {
  if (isPdfSafeText(text)) {
    return (t: string, size: number) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(size);
      return doc.getTextWidth(t);
    };
  }
  const ctx = document.createElement("canvas").getContext("2d");
  return (t: string, size: number) => {
    if (!ctx) return t.length * size * PT_TO_MM * 0.6;
    ctx.font = `${bold ? "700" : "400"} ${size * PT_TO_MM * 16}px ${CANVAS_FONT_STACK}`;
    return ctx.measureText(t).width / 16;
  };
}

/**
 * Stacks text blocks inside a box (wrap + shrink + ellipsis per block) and
 * never draws outside it. Blocks that cannot fit even one line are skipped.
 */
function drawTextStack(
  doc: JsPdfDoc,
  blocks: TextBlock[],
  box: { x: number; y: number; w: number; h: number },
  align: "left" | "center",
  valign: "top" | "center" = "center"
) {
  const items = blocks.filter((b) => b.text.trim());
  if (items.length === 0 || box.w <= 1 || box.h <= 1) return;
  let remaining = box.h;
  const laid: { b: TextBlock; gap: number; size: number; height: number }[] = [];
  items.forEach((b, i) => {
    const gap = laid.length > 0 ? (b.gapBefore ?? 0.8) : 0;
    const reserve = items
      .slice(i + 1)
      .reduce((s, n) => s + n.minFontSize * PT_TO_MM * 1.2 + (n.gapBefore ?? 0.8), 0);
    const budget = remaining - gap - reserve;
    if (budget <= 0.5) return;
    const layout = layoutFittedText(
      b.text.trim(),
      { maxWidth: box.w, maxHeight: budget, maxLines: b.maxLines, fontSize: b.fontSize, minFontSize: b.minFontSize },
      measureFor(doc, b.text, !!b.bold)
    );
    if (layout.heightMm > budget + 0.01) return;
    laid.push({ b, gap, size: layout.fontSize, height: layout.heightMm });
    remaining -= gap + layout.heightMm;
  });
  const total = laid.reduce((s, l) => s + l.gap + l.height, 0);
  let y = valign === "center" ? box.y + Math.max(0, (box.h - total) / 2) : box.y;
  for (const l of laid) {
    y += l.gap;
    drawFittedText(doc, l.b.text, {
      x: align === "center" ? box.x + box.w / 2 : box.x,
      y,
      maxWidth: box.w,
      maxHeight: l.height + 0.05,
      maxLines: l.b.maxLines,
      fontSize: l.size,
      minFontSize: l.b.minFontSize,
      fontStyle: l.b.bold ? "bold" : "normal",
      align,
      color: l.b.color,
    });
    y += l.height;
  }
}

/** Cover-crops artwork into a circle (transparent outside) so nothing prints past a round cut line. */
async function renderCircleCoverDataUrl(src: string, px = 900): Promise<string> {
  const img = await loadImageElement(src);
  const canvas = document.createElement("canvas");
  canvas.width = px;
  canvas.height = px;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");
  ctx.beginPath();
  ctx.arc(px / 2, px / 2, px / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, px, px);
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(px / Math.max(1, iw), px / Math.max(1, ih));
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.drawImage(img, (px - dw) / 2, (px - dh) / 2, dw, dh);
  return canvas.toDataURL("image/png");
}

function hexToRgb(hex: string): Rgb {
  const num = parseInt(hex.replace("#", ""), 16);
  if (Number.isNaN(num)) return [77, 124, 15];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

const INK: Rgb = [9, 9, 11];
const MUTED: Rgb = [82, 82, 91];

const round2 = (v: number) => Math.round(v * 100) / 100;


/* ------------------------------------------------------------------------- */
/* Component                                                                  */
/* ------------------------------------------------------------------------- */

type LabelMode = "address" | "barcode" | "nametag" | "title";

function getMode(pageId: PageId): LabelMode {
  if (pageId === "T20") return "address";
  if (pageId === "T21") return "barcode";
  if (pageId === "T23") return "nametag";
  return "title";
}

const fieldCls = "w-full min-h-[38px] rounded-xl bg-[#f5f5f7] px-2.5 py-1.5 text-sm text-zinc-950";
const smallLabelCls = "block text-[11px] font-semibold text-zinc-600 mb-1";
const labelCls = "block text-xs font-semibold text-zinc-800 mb-1";
const textFieldCls = "w-full min-h-[40px] rounded-xl bg-[#f5f5f7] px-3 py-2 text-sm text-zinc-950";
const sectionCls = "pt-6 first:pt-0 border-t border-[#ebeced] first:border-t-0";

const MODE_COPY: Record<
  LabelMode,
  { what: string; one: string; stepTitle: string; stepHint: string; blocker: string }
> = {
  address: {
    what: "addresses",
    one: "address",
    stepTitle: "Add your addresses",
    stepHint: "Type or paste your list. Each address becomes one label.",
    blocker: "Add at least one address in step 2.",
  },
  barcode: {
    what: "codes",
    one: "code",
    stepTitle: "Add your codes",
    stepHint: "Paste your product codes. Each line becomes one barcode label.",
    blocker: "Add at least one code in step 2.",
  },
  nametag: {
    what: "names",
    one: "name",
    stepTitle: "Add your names",
    stepHint: "Type or paste your guest list. Each line becomes one name tag.",
    blocker: "Add at least one name in step 2.",
  },
  title: {
    what: "text",
    one: "text",
    stepTitle: "Add your text",
    stepHint: "Every label on the sheet gets the same text. Leave both boxes empty to print a blank grid.",
    blocker: "",
  },
};

function NumberInput({
  id,
  label,
  field,
}: {
  id: string;
  label: string;
  field: ReturnType<typeof useNumberField>;
}) {
  return (
    <div>
      <label htmlFor={id} className={smallLabelCls}>
        {label}
      </label>
      <input
        id={id}
        type="number"
        {...field.inputProps}
        aria-describedby={field.error ? `${id}-err` : undefined}
        className={fieldCls}
      />
      {field.error && (
        <p id={`${id}-err`} className="mt-1 text-[11px] text-red-700">
          {field.error}
        </p>
      )}
    </div>
  );
}

export function LabelSheetTool({ pageId }: { pageId: PageId }) {
  const mode = getMode(pageId);
  const presets = useMemo(() => getPresets(pageId), [pageId]);
  const [grid, setGrid] = useState<GridConfig>(() => {
    const key = getInitialPresetKey(pageId);
    const p = getPresets(pageId).find((x) => x.key === key) ?? getPresets(pageId)[0];
    return { paper: "a4", ...p.a4 };
  });
  const [labelTitle, setLabelTitle] = useState(
    pageId === "T18" ? "" : pageId === "T19" ? "Handmade Seal" : "Pantry Label"
  );
  const [labelSub, setLabelSub] = useState(pageId === "T18" ? "" : "Batch 01 · Fresh");
  const [accentHex, setAccentHex] = useState("#3f6212");
  const [labelStyle, setLabelStyle] = useState<LabelStyleId>(pageId === "T23" ? "banner" : "plain");
  const [fontPair, setFontPair] = useState<FontPairId>("modern");
  const measure = useLabelMeasure();
  const [showBorders, setShowBorders] = useState(true);

  // Address bulk list (T20)
  const [addressBulk, setAddressBulk] = useState(
    "Jamie Chen\n42 Oakridge Ave\nPortland, OR 97209\n\nPriya Nair\n18 Harbour St\nSydney NSW 2000\n\nSamira Patel\n74 Maple Road\nToronto ON M5V 2T6"
  );
  const [returnAddress, setReturnAddress] = useState("From: Print Studio, Box 104");

  // Barcode controls (T21)
  const [barcodeFormat, setBarcodeFormat] = useState<BarcodeFormat>("CODE128");
  const [barcodeItems, setBarcodeItems] = useState(
    "SKU-1042 | Ceramic Mug | $14.00\nSKU-1043 | Linen Tote | $18.00\nSKU-1044 | Soy Candle | $22.00"
  );
  const [barcodeLib, setBarcodeLib] = useState<{ fn: JsBarcodeFn } | null>(null);

  // Name tags (T23)
  const [nameList, setNameList] = useState(
    "Alex Morgan | Keynote Speaker\nJordan Lee | Design Lead\nTaylor Brooks | Workshop Host\nCasey Kim | Product Manager"
  );
  const [eventName, setEventName] = useState("HELLO, MY NAME IS");

  // Stickers (T22 / T19)
  const [stickerImages, setStickerImages] = useState<string[]>([]);
  const [fillOverride, setFillOverride] = useState<boolean | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState<(ToolStatusValue & { key: string }) | null>(null);
  const hasArtworkUpload = pageId === "T22" || pageId === "T19";

  const paper = PAPER_SIZES[grid.paper];
  const paperShort = PAPER_SHORT[grid.paper as SheetPaper] ?? paper.label;
  const slotsPerPage = grid.cols * grid.rows;
  const diameter = Math.min(grid.labelW, grid.labelH);
  const designBase: Omit<LabelDesign, "title"> = {
    w: grid.round ? diameter : grid.labelW,
    h: grid.round ? diameter : grid.labelH,
    round: !!grid.round,
    style: labelStyle,
    accent: hexToRgb(accentHex),
    fonts: fontPair,
    eyebrow: mode === "nametag" ? eventName : "",
    subtitle: "",
  };

  /* ---- number fields ---- */
  const setNum = (k: keyof GridSpec) => (v: number) => setGrid((g) => ({ ...g, [k]: round2(v) }));
  const colsF = useNumberField(grid.cols, setNum("cols"), { min: 1, max: 8, step: 1 });
  const rowsF = useNumberField(grid.rows, setNum("rows"), { min: 1, max: 20, step: 1 });
  const widthF = useNumberField(grid.labelW, setNum("labelW"), { min: 10, max: 200, step: 0.1, unit: "mm" });
  const heightF = useNumberField(grid.labelH, setNum("labelH"), { min: 10, max: 270, step: 0.1, unit: "mm" });
  const diameterF = useNumberField(
    diameter,
    (v) => setGrid((g) => ({ ...g, labelW: round2(v), labelH: round2(v) })),
    { min: 10, max: 200, step: 0.1, unit: "mm" }
  );
  const topF = useNumberField(grid.marginTop, setNum("marginTop"), { min: 0, max: 100, step: 0.1, unit: "mm" });
  const leftF = useNumberField(grid.marginLeft, setNum("marginLeft"), { min: 0, max: 100, step: 0.1, unit: "mm" });
  const gapXF = useNumberField(grid.gapX, setNum("gapX"), { min: 0, max: 50, step: 0.1, unit: "mm" });
  const gapYF = useNumberField(grid.gapY, setNum("gapY"), { min: 0, max: 50, step: 0.1, unit: "mm" });

  /* ---- fit check ---- */
  const fit = checkGridFit({
    paperW: paper.widthMm,
    paperH: paper.heightMm,
    cols: grid.cols,
    rows: grid.rows,
    itemW: grid.labelW,
    itemH: grid.labelH,
    gapX: grid.gapX,
    gapY: grid.gapY,
    marginX: grid.marginLeft,
    marginY: grid.marginTop,
  });
  const cannotFitAny = fit.maxCols < 1 || fit.maxRows < 1;
  let fitError: string | null = null;
  if (!fit.fits) {
    if (cannotFitAny) {
      fitError = `These labels are larger than ${paperShort} with the current margins. Reduce the label size or margins.`;
    } else {
      const parts: string[] = [];
      if (fit.overflowYMm >= 0.05) parts.push(`max ${fit.maxRows} rows. Reduce rows or label height.`);
      if (fit.overflowXMm >= 0.05) parts.push(`max ${fit.maxCols} columns. Reduce columns or label width.`);
      fitError = `These labels don't fit on ${paperShort} — ${parts.join(" Also ")}`;
    }
  }

  function autoFit() {
    setGrid((g) => ({
      ...g,
      cols: Math.max(1, Math.min(g.cols, fit.maxCols)),
      rows: Math.max(1, Math.min(g.rows, fit.maxRows)),
    }));
  }

  /* ---- entries ---- */
  const parsedAddresses = useMemo(
    () =>
      addressBulk
        .split(/\n\s*\n/)
        .map((block) => block.trim())
        .filter(Boolean),
    [addressBulk]
  );

  const parsedBarcodes = useMemo<BarcodeLine[]>(
    () =>
      barcodeItems
        .split("\n")
        .map((raw, i) => ({ raw: raw.trim(), line: i + 1 }))
        .filter((l) => l.raw)
        .map(({ raw, line }) => {
          const [code = "", name = "", price = ""] = raw.split("|").map((s) => s.trim());
          return { line, code, name, price, error: validateBarcode(code, barcodeFormat) };
        }),
    [barcodeItems, barcodeFormat]
  );
  const barcodeErrors = parsedBarcodes.filter((b) => b.error);

  const parsedNames = useMemo(
    () =>
      nameList
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [person = "", role = ""] = line.split("|").map((s) => s.trim());
          return { person, role };
        }),
    [nameList]
  );

  const listMode = mode !== "title";
  const entryCount =
    mode === "address"
      ? parsedAddresses.length
      : mode === "barcode"
        ? parsedBarcodes.length
        : mode === "nametag"
          ? parsedNames.length
          : 0;
  const fillCopies = fillOverride ?? entryCount === 1;

  let labelCount: number;
  let pageCount: number;
  if (!listMode) {
    labelCount = slotsPerPage;
    pageCount = 1;
  } else if (entryCount === 0) {
    labelCount = 0;
    pageCount = 0;
  } else {
    pageCount = Math.ceil(entryCount / Math.max(1, slotsPerPage));
    labelCount = fillCopies ? pageCount * slotsPerPage : entryCount;
  }
  const summary = `${labelCount} label${labelCount === 1 ? "" : "s"} · ${pageCount} page${pageCount === 1 ? "" : "s"}`;

  /* ---- barcode previews ---- */
  useEffect(() => {
    if (mode !== "barcode" || barcodeLib) return;
    let cancelled = false;
    import("jsbarcode").then((m) => {
      if (!cancelled) setBarcodeLib({ fn: m.default });
    });
    return () => {
      cancelled = true;
    };
  }, [mode, barcodeLib]);

  const barcodePreviews = useMemo(() => {
    const out = new Map<string, string>();
    if (!barcodeLib) return out;
    for (const b of parsedBarcodes.slice(0, 60)) {
      if (b.error || out.has(b.code)) continue;
      try {
        out.set(b.code, renderBarcodeCanvas(barcodeLib.fn, b.code, barcodeFormat).dataUrl);
      } catch {
        // validation should have caught this; leave the slot blank in the preview
      }
    }
    return out;
  }, [barcodeLib, parsedBarcodes, barcodeFormat]);

  /* ---- status (cleared whenever inputs change) ---- */
  const inputsKey = JSON.stringify([
    grid,
    labelTitle,
    labelSub,
    accentHex,
    labelStyle,
    fontPair,
    showBorders,
    addressBulk,
    returnAddress,
    barcodeFormat,
    barcodeItems,
    nameList,
    eventName,
    stickerImages.length,
    fillCopies,
  ]);
  const visibleStatus = status && status.key === inputsKey ? status : null;

  let exportBlocker: string | null = null;
  if (fitError) exportBlocker = "The labels don't fit on the page — fix the sheet size in step 1 first.";
  else if (mode === "barcode" && barcodeErrors.length > 0)
    exportBlocker = `Fix ${barcodeErrors.length} barcode error${barcodeErrors.length === 1 ? "" : "s"} in step 2 first.`;
  else if (listMode && entryCount === 0) exportBlocker = MODE_COPY[mode].blocker;

  async function handleUploadStickers(files: File[]) {
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) {
      setStatus({ tone: "error", text: "That file isn't an image. Try a PNG or JPG.", key: inputsKey });
      return;
    }
    try {
      const loaded: string[] = [];
      for (const f of images) loaded.push(await fileToDataUrl(f));
      setStickerImages((prev) => [...prev, ...loaded]);
      setStatus(null);
    } catch {
      setStatus({ tone: "error", text: "Could not read that image file. Try a JPG or PNG.", key: inputsKey });
    }
  }

  function applyPreset(p: PresetDef) {
    setGrid((g) => ({ ...g, ...(g.paper === "letter" ? p.letter : p.a4) }));
  }

  function changePaper(next: SheetPaper) {
    setGrid((g) => {
      const active = presets.find((p) => specMatches(g.paper === "letter" ? p.letter : p.a4, g));
      if (active) return { ...g, ...(next === "letter" ? active.letter : active.a4), paper: next };
      return { ...g, paper: next };
    });
  }

  /** Name-tag / text labels share the jar tool's style engine (same look in preview and PDF). */
  function sceneFor(
    text: { title: string; subtitle: string },
    m: Parameters<typeof buildLabelScene>[1],
    cache: Map<string, LabelPrim[]>
  ): LabelPrim[] {
    const key = `${text.title}\u0000${text.subtitle}`;
    const hit = cache.get(key);
    if (hit) return hit;
    const prims = buildLabelScene({ ...designBase, ...text }, m);
    cache.set(key, prims);
    return prims;
  }

  async function handleDownloadPdf() {
    if (exportBlocker) return;
    const key = inputsKey;
    setIsExporting(true);
    setStatus(null);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [paper.widthMm, paper.heightMm],
      });
      const pdfMeasure = makeMeasure(doc);
      const imageCache = new Map<string, string>();
      const pdfScenes = new Map<string, LabelPrim[]>();
      const W = grid.labelW;
      const H = grid.labelH;
      const d = Math.min(W, H);

      const JsBarcode = mode === "barcode" ? (await import("jsbarcode")).default : null;
      const barcodeCache = new Map<string, { dataUrl: string; w: number; h: number }>();
      const stickerCache = new Map<number, { dataUrl: string; format: "PNG" | "JPEG" }>();

      for (let page = 0; page < pageCount; page++) {
        if (page > 0) doc.addPage([paper.widthMm, paper.heightMm], "portrait");
        for (let s = 0; s < slotsPerPage; s++) {
          const i = page * slotsPerPage + s;
          if (i >= labelCount) break;
          const r = Math.floor(s / grid.cols);
          const c = s % grid.cols;
          const x = grid.marginLeft + c * (W + grid.gapX);
          const y = grid.marginTop + r * (H + grid.gapY);
          const cx = x + W / 2;
          const cy = y + H / 2;

          if (mode === "address") {
            const addr = parsedAddresses[i % entryCount];
            const pad = Math.min(4, Math.max(1.5, Math.min(W, H) * 0.08));
            let top = y + pad;
            const boxW = W - 2 * pad;
            if (returnAddress.trim()) {
              const ret = drawFittedText(doc, returnAddress, {
                x: x + pad,
                y: top,
                maxWidth: boxW,
                maxLines: 1,
                fontSize: 7,
                minFontSize: 5,
                color: MUTED,
              });
              top += ret.heightMm + 1;
            }
            const [first, ...rest] = addr.split("\n");
            drawTextStack(
              doc,
              [
                { text: first, fontSize: 10, minFontSize: 6, bold: true, color: INK, maxLines: 1 },
                { text: rest.join("\n"), fontSize: 9, minFontSize: 5.5, color: INK, maxLines: 6, gapBefore: 0.4 },
              ],
              { x: x + pad, y: top, w: boxW, h: y + H - pad - top },
              "left"
            );
          } else if (mode === "barcode" && JsBarcode) {
            const item = parsedBarcodes[i % entryCount];
            const pad = Math.min(3, Math.max(1.5, Math.min(W, H) * 0.07));
            let headerH = 0;
            const header = [item.name, item.price].filter(Boolean).join(" · ");
            if (header) {
              const l = drawFittedText(doc, header, {
                x: cx,
                y: y + pad,
                maxWidth: W - 2 * pad,
                maxLines: 1,
                fontSize: 8,
                minFontSize: 5,
                fontStyle: "bold",
                align: "center",
                color: INK,
              });
              headerH = l.heightMm + 0.8;
            }
            let bc = barcodeCache.get(item.code);
            if (!bc) {
              bc = renderBarcodeCanvas(JsBarcode, item.code, barcodeFormat);
              barcodeCache.set(item.code, bc);
            }
            const place = fitContain(bc.w, bc.h, {
              x: x + pad,
              y: y + pad + headerH,
              w: W - 2 * pad,
              h: H - 2 * pad - headerH,
            });
            doc.addImage(bc.dataUrl, "PNG", place.x, place.y, place.w, place.h, `bc-${item.code}`);
          } else if (mode === "nametag") {
            const person = parsedNames[i % entryCount];
            await drawLabelScene(doc, sceneFor({ title: person.person, subtitle: person.role }, pdfMeasure, pdfScenes), x, y, imageCache);
          } else if (stickerImages.length > 0) {
            const imgIdx = i % stickerImages.length;
            if (grid.round) {
              let art = stickerCache.get(imgIdx);
              if (!art) {
                art = { dataUrl: await renderCircleCoverDataUrl(stickerImages[imgIdx]), format: "PNG" };
                stickerCache.set(imgIdx, art);
              }
              doc.addImage(art.dataUrl, art.format, cx - d / 2, cy - d / 2, d, d, `st-${imgIdx}`);
            } else {
              const bw = Math.max(5, W - 4);
              const bh = Math.max(5, H - 4);
              let art = stickerCache.get(imgIdx);
              if (!art) {
                art = await renderImageToBoxDataUrl(stickerImages[imgIdx], bw / bh, "contain");
                stickerCache.set(imgIdx, art);
              }
              doc.addImage(art.dataUrl, art.format, cx - bw / 2, cy - bh / 2, bw, bh, `st-${imgIdx}`);
            }
          } else {
            const ox = grid.round ? cx - d / 2 : x;
            const oy = grid.round ? cy - d / 2 : y;
            await drawLabelScene(doc, sceneFor({ title: labelTitle, subtitle: labelSub }, pdfMeasure, pdfScenes), ox, oy, imageCache);
          }

          if (showBorders) {
            doc.setDrawColor(161, 161, 170);
            doc.setLineWidth(0.25);
            if (grid.round) doc.circle(cx, cy, d / 2);
            else doc.rect(x, y, W, H);
          }
        }
      }

      doc.save(`label-sheet-${pageId.toLowerCase()}-${grid.paper}.pdf`);
      setStatus({
        tone: "success",
        text: (
          <>
            <strong>PDF downloaded</strong> — {labelCount} label{labelCount === 1 ? "" : "s"} on {pageCount} {paperShort} page
            {pageCount === 1 ? "" : "s"}. Follow the print steps below so the labels line up.
          </>
        ),
        key,
      });
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        document.getElementById("label-download-step")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (err) {
      setStatus({
        tone: "error",
        text: err instanceof Error ? `Could not create the PDF: ${err.message}` : "Could not create the PDF. Please try again.",
        key,
      });
    } finally {
      setIsExporting(false);
    }
  }

  /* ---- preview helpers (cqw units keep text proportional to the paper) ---- */
  const cq = (mm: number) => `${((mm / paper.widthMm) * 100).toFixed(3)}cqw`;
  const fs = (pt: number) => cq(pt * PT_TO_MM);
  const showAccent = mode === "nametag" || (mode === "title" && stickerImages.length === 0);
  const isActive = (p: PresetDef) => specMatches(grid.paper === "letter" ? p.letter : p.a4, grid);

  const previewScenes = new Map<string, LabelPrim[]>();
  function renderSlot(s: number) {
    const i = s; // preview shows page 1
    const used = i < labelCount;
    const W = grid.labelW;
    const H = grid.labelH;
    if (!used) return null;

    if (mode === "address") {
      const addr = parsedAddresses[i % entryCount] ?? "";
      const [first, ...rest] = addr.split("\n");
      const pad = Math.min(4, Math.max(1.5, Math.min(W, H) * 0.08));
      return (
        <div className="absolute inset-0 flex flex-col text-left overflow-hidden" style={{ padding: cq(pad) }}>
          {returnAddress.trim() && (
            <span className="block truncate text-zinc-600 leading-tight" style={{ fontSize: fs(7) }}>
              {returnAddress.trim()}
            </span>
          )}
          <div className="flex-1 min-h-0 flex flex-col justify-center-safe overflow-hidden">
            <span className="block truncate font-bold text-zinc-950 leading-tight" style={{ fontSize: fs(10) }}>
              {first}
            </span>
            <span className="block whitespace-pre-line text-zinc-950 leading-tight" style={{ fontSize: fs(9) }}>
              {rest.join("\n")}
            </span>
          </div>
        </div>
      );
    }
    if (mode === "barcode") {
      const item = parsedBarcodes[i % entryCount];
      if (!item) return null;
      const header = [item.name, item.price].filter(Boolean).join(" · ");
      const src = barcodePreviews.get(item.code);
      const pad = Math.min(3, Math.max(1.5, Math.min(W, H) * 0.07));
      return (
        <div className="absolute inset-0 flex flex-col items-center overflow-hidden" style={{ padding: cq(pad) }}>
          {header && (
            <span className="block max-w-full truncate font-bold text-zinc-950 leading-tight" style={{ fontSize: fs(8) }}>
              {header}
            </span>
          )}
          <div className="flex-1 min-h-0 w-full flex items-center justify-center">
            {item.error ? (
              <span className="text-red-700 font-semibold" style={{ fontSize: fs(7) }}>
                Invalid
              </span>
            ) : src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt="" className="max-h-full max-w-full object-contain" />
            ) : null}
          </div>
        </div>
      );
    }
    if (mode === "nametag") {
      const person = parsedNames[i % entryCount];
      if (!person) return null;
      return (
        <LabelArt prims={sceneFor({ title: person.person, subtitle: person.role }, measure, previewScenes)} w={designBase.w} h={designBase.h} />
      );
    }
    if (stickerImages.length > 0) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={stickerImages[i % stickerImages.length]}
          alt=""
          className={`absolute ${grid.round ? "inset-0 h-full w-full object-cover" : "object-contain"}`}
          style={
            grid.round
              ? undefined
              : { left: cq(2), top: cq(2), width: `calc(100% - ${cq(4)})`, height: `calc(100% - ${cq(4)})` }
          }
        />
      );
    }
    return <LabelArt prims={sceneFor({ title: labelTitle, subtitle: labelSub }, measure, previewScenes)} w={designBase.w} h={designBase.h} />;
  }

  const activePreset = presets.find(isActive) ?? null;
  const hasStyleStep = mode === "title" || mode === "nametag";
  const downloadStep = hasStyleStep ? 4 : 3;
  const downloadLabel = `Download PDF · ${labelCount} label${labelCount === 1 ? "" : "s"}`;
  const mobileSummary = exportBlocker
    ? "Can't download yet — see above"
    : `${labelCount} label${labelCount === 1 ? "" : "s"} · ${paperShort}${pageCount > 1 ? ` · ${pageCount} pages` : ""}`;
  const peelStep = "Peel and stick — no cutting needed.";
  const cutStep = showBorders && hasArtworkUpload
    ? "On a pre-cut sticker sheet: just peel and stick. On plain sticker paper: cut along the grey outlines."
    : peelStep;

  function addSampleStickers() {
    setStickerImages([createSamplePhotoDataUrl(0, "Sticker 1"), createSamplePhotoDataUrl(1, "Sticker 2")]);
  }

  const outlinesToggle = (
    <div>
      <label className="inline-flex items-center gap-2 min-h-[36px] text-sm font-medium text-zinc-800 cursor-pointer">
        <input
          type="checkbox"
          checked={showBorders}
          onChange={(e) => setShowBorders(e.target.checked)}
          aria-describedby="label-outline-hint"
          className="accent-[#4d7c0f] h-4 w-4"
        />
        <Scissors className="h-3.5 w-3.5 text-zinc-600" aria-hidden="true" />
        Print label outlines
      </label>
      <div className="pl-6"><FieldHint id="label-outline-hint">
        A thin grey line around each label — handy for test prints or cutting by hand. Turn it off for pre-cut label sheets.
      </FieldHint></div>
    </div>
  );

  const listSummary = (id: string) => (
    <p id={id} className="mt-1.5 text-xs font-semibold text-[#3f6212]" aria-live="polite">
      {entryCount === 0
        ? `No ${MODE_COPY[mode].what} yet`
        : `${entryCount} ${entryCount === 1 ? MODE_COPY[mode].one : MODE_COPY[mode].what} → ${summary}`}
    </p>
  );

  const fillToggle = listMode && (
    <div>
      <label className="inline-flex items-center gap-2 min-h-[36px] text-sm font-medium text-zinc-800 cursor-pointer">
        <input
          type="checkbox"
          checked={fillCopies}
          onChange={(e) => setFillOverride(e.target.checked)}
          aria-describedby="label-fill-hint"
          className="accent-[#4d7c0f] h-4 w-4"
        />
        Fill the whole sheet
      </label>
      <div className="pl-6"><FieldHint id="label-fill-hint">
        {fillCopies
          ? `Your list repeats until every label on the page is used (${labelCount} labels).`
          : "Off: one label per line in your list; the rest of the sheet stays blank for next time."}
      </FieldHint></div>
    </div>
  );

  const presetBtnCls = (active: boolean) =>
    `w-full text-left rounded-xl px-3 py-2.5 transition cursor-pointer ring-1 ${
      active
        ? "bg-[#eef6e4] ring-2 ring-[#4d7c0f]"
        : "bg-white ring-zinc-200 hover:ring-zinc-300 hover:bg-[#fafafa]"
    }`;

  return (
    <div className="rounded-3xl bg-[#f5f5f7] p-2 sm:p-5 lg:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-5 items-start">
        {/* Controls */}
        <div className="order-2 lg:order-1 lg:col-span-5 rounded-2xl bg-white p-4 sm:p-6 space-y-6">
          {/* Step 1 — sheet */}
          <section className={sectionCls} aria-labelledby="label-step-1">
            <StepHeader
              id="label-step-1"
              step={1}
              title="Choose your label sheet"
              hint="Pick the sheet you bought. The count and label size are printed on the pack."
            />
            <div className="space-y-3">
              <div>
                <span id="label-paper-label" className={labelCls}>
                  Sheet size
                </span>
                <div role="radiogroup" aria-labelledby="label-paper-label" className="inline-flex rounded-xl bg-[#f5f5f7] p-1">
                  {(["a4", "letter"] as SheetPaper[]).map((pp) => (
                    <button
                      key={pp}
                      type="button"
                      role="radio"
                      aria-checked={grid.paper === pp}
                      onClick={() => changePaper(pp)}
                      className={`min-h-[36px] rounded-lg px-4 text-sm font-semibold transition cursor-pointer ${
                        grid.paper === pp ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-600 hover:text-zinc-900"
                      }`}
                    >
                      {pp === "a4" ? "A4" : "US Letter"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Label sheet presets">
                {presets.map((p) => {
                  const spec = grid.paper === "letter" ? p.letter : p.a4;
                  const fits = grid.paper === "letter" ? p.fitsLetter : p.fitsA4;
                  const active = isActive(p);
                  return (
                    <button
                      key={p.key}
                      type="button"
                      aria-pressed={active}
                      onClick={() => applyPreset(p)}
                      className={presetBtnCls(active)}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-zinc-950">{presetCount(spec)}</span>
                        {p.name && (
                          <span className="rounded-md bg-[#f5f5f7] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
                            {p.name}
                          </span>
                        )}
                      </span>
                      <span className="block text-xs text-zinc-700">{presetSize(spec)}</span>
                      {fits && <span className="block text-[11px] font-semibold text-[#3f6212]">fits {fits}</span>}
                    </button>
                  );
                })}
              </div>
              <FieldHint>
                Check the code printed on your label pack.
                {activePreset ? "" : " Your sheet isn't one of these? Enter its measurements under “Custom size”."}
              </FieldHint>

              <details className="group rounded-xl bg-[#f5f5f7] px-3.5 py-2.5" open={!activePreset || undefined}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 min-h-[32px] text-xs font-semibold text-zinc-800 [&::-webkit-details-marker]:hidden">
                  <span>
                    Custom size{" "}
                    <span className="font-normal text-zinc-600">
                      ({grid.cols} across × {grid.rows} down
                      {grid.round ? `, ${diameter} mm circles` : `, ${grid.labelW} × ${grid.labelH} mm`})
                    </span>
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500 transition group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="mt-3 space-y-3 [&_input]:bg-white">
                  <FieldHint>Measure with a ruler from the top-left corner of the sheet. All sizes are in millimetres.</FieldHint>
                  <div className="grid grid-cols-2 gap-2.5">
                    <NumberInput id="label-grid-cols" label="Labels across" field={colsF} />
                    <NumberInput id="label-grid-rows" label="Labels down" field={rowsF} />
                    {grid.round ? (
                      <NumberInput id="label-grid-diameter" label="Circle diameter (mm)" field={diameterF} />
                    ) : (
                      <>
                        <NumberInput id="label-grid-width" label="Label width (mm)" field={widthF} />
                        <NumberInput id="label-grid-height" label="Label height (mm)" field={heightF} />
                      </>
                    )}
                    <NumberInput id="label-grid-top" label="Top margin (mm)" field={topF} />
                  </div>
                  <details className="group/adv rounded-lg bg-white px-3 py-2 [&_input]:bg-[#f5f5f7]">
                    <summary className="flex cursor-pointer list-none items-center justify-between min-h-[28px] text-[11px] font-semibold text-zinc-700 [&::-webkit-details-marker]:hidden">
                      Advanced spacing
                      <ChevronDown className="h-3.5 w-3.5 transition group-open/adv:rotate-180" aria-hidden="true" />
                    </summary>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <NumberInput id="label-grid-left" label="Left margin (mm)" field={leftF} />
                      <NumberInput id="label-grid-gapx" label="Space between columns (mm)" field={gapXF} />
                      <NumberInput id="label-grid-gapy" label="Space between rows (mm)" field={gapYF} />
                    </div>
                  </details>
                </div>
              </details>

              {fitError && (
                <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-xs text-red-800 space-y-2" role="alert">
                  <p>{fitError}</p>
                  {!cannotFitAny && (
                    <button
                      type="button"
                      onClick={autoFit}
                      className="min-h-[36px] rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-100 cursor-pointer"
                    >
                      Auto-fit: {Math.min(grid.cols, fit.maxCols)} across × {Math.min(grid.rows, fit.maxRows)} down
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Step 2 — content */}
          <section className={sectionCls} aria-labelledby="label-step-2">
            <StepHeader
              id="label-step-2"
              step={2}
              title={
                mode === "title" && hasArtworkUpload
                  ? pageId === "T22"
                    ? "Add your artwork"
                    : "Add your text or artwork"
                  : MODE_COPY[mode].stepTitle
              }
              hint={
                mode === "title" && hasArtworkUpload
                  ? "Upload one or more images — they repeat across the sheet in order. No image? Type text instead."
                  : MODE_COPY[mode].stepHint
              }
            />

            {mode === "address" ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="label-recipient-addresses" className={labelCls}>
                    Addresses
                  </label>
                  <textarea
                    id="label-recipient-addresses"
                    rows={8}
                    value={addressBulk}
                    onChange={(e) => setAddressBulk(e.target.value)}
                    aria-describedby="label-address-hint label-address-count"
                    className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-sm font-mono text-zinc-950"
                  />
                  <div className="mt-1.5"><FieldHint id="label-address-hint">
                    Leave a <strong>blank line between addresses</strong> — each address becomes one label. The first line
                    (the name) prints in bold.
                  </FieldHint></div>
                  {listSummary("label-address-count")}
                </div>
                <div>
                  <label htmlFor="label-return-address" className={labelCls}>
                    Return address <span className="font-normal text-zinc-500">(optional)</span>
                  </label>
                  <input
                    id="label-return-address"
                    type="text"
                    value={returnAddress}
                    onChange={(e) => setReturnAddress(e.target.value)}
                    aria-describedby="label-return-hint"
                    className={textFieldCls}
                  />
                  <div className="mt-1.5"><FieldHint id="label-return-hint">Printed in small type at the top of every label. Clear it to leave it off.</FieldHint></div>
                </div>
                {fillToggle}
                {outlinesToggle}
              </div>
            ) : mode === "barcode" ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="label-barcode-format" className={labelCls}>
                    Barcode type
                  </label>
                  <select
                    id="label-barcode-format"
                    value={barcodeFormat}
                    onChange={(e) => setBarcodeFormat(e.target.value as BarcodeFormat)}
                    aria-describedby="label-barcode-format-hint"
                    className={textFieldCls}
                  >
                    <option value="CODE128">Code 128 (any text / numbers)</option>
                    <option value="EAN13">EAN-13 (shop products)</option>
                    <option value="UPC">UPC-A (US shop products)</option>
                  </select>
                  <div className="mt-1.5"><FieldHint id="label-barcode-format-hint">
                    {barcodeFormat === "CODE128"
                      ? "Best for your own stock codes, SKUs and asset tags — letters and numbers both work."
                      : barcodeFormat === "EAN13"
                        ? "The 13-digit code on retail products. Enter 12 digits and we add the check digit, or all 13."
                        : "The 12-digit code on US retail products. Enter 11 digits and we add the check digit, or all 12."}
                  </FieldHint></div>
                </div>
                <div>
                  <label htmlFor="label-barcode-skus" className={labelCls}>
                    Codes
                  </label>
                  <textarea
                    id="label-barcode-skus"
                    rows={6}
                    value={barcodeItems}
                    onChange={(e) => setBarcodeItems(e.target.value)}
                    aria-invalid={barcodeErrors.length > 0 || undefined}
                    aria-describedby={`label-barcode-hint label-barcode-count${barcodeErrors.length > 0 ? " label-barcode-errors" : ""}`}
                    className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-sm font-mono text-zinc-950"
                  />
                  <div className="mt-1.5"><FieldHint id="label-barcode-hint">
                    <strong>One per line — each line becomes one label.</strong> Format: <code>code | product name | price</code>.
                    Name and price are optional.
                  </FieldHint></div>
                  {listSummary("label-barcode-count")}
                  {barcodeErrors.length > 0 && (
                    <ul id="label-barcode-errors" className="mt-1.5 space-y-0.5 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-800">
                      {barcodeErrors.slice(0, 8).map((b) => (
                        <li key={b.line}>
                          Line {b.line} ({b.code || "empty"}): {b.error}
                        </li>
                      ))}
                      {barcodeErrors.length > 8 && <li>…and {barcodeErrors.length - 8} more lines.</li>}
                    </ul>
                  )}
                </div>
                {fillToggle}
                {outlinesToggle}
              </div>
            ) : mode === "nametag" ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="label-attendee-names" className={labelCls}>
                    Names
                  </label>
                  <textarea
                    id="label-attendee-names"
                    rows={6}
                    value={nameList}
                    onChange={(e) => setNameList(e.target.value)}
                    aria-describedby="label-names-hint label-names-count"
                    className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-sm text-zinc-950"
                  />
                  <div className="mt-1.5"><FieldHint id="label-names-hint">
                    <strong>One per line — each line becomes one name tag.</strong> Add a role or company after a{" "}
                    <code>|</code>, e.g. <code>Alex Morgan | Design Lead</code>.
                  </FieldHint></div>
                  {listSummary("label-names-count")}
                </div>
                <div>
                  <label htmlFor="label-header-banner" className={labelCls}>
                    Banner text
                  </label>
                  <input
                    id="label-header-banner"
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    aria-describedby="label-banner-hint"
                    className={textFieldCls}
                  />
                  <div className="mt-1.5"><FieldHint id="label-banner-hint">Shown in the coloured strip at the top of every tag — e.g. your event name.</FieldHint></div>
                </div>
                {fillToggle}
              </div>
            ) : (
              <div className="space-y-4">
                {hasArtworkUpload &&
                  (stickerImages.length === 0 ? (
                    <UploadDropzone
                      multiple
                      onFiles={handleUploadStickers}
                      title={pageId === "T22" ? "Add sticker artwork" : "Add artwork (optional)"}
                      buttonLabel="Choose images"
                      inputLabel="Upload sticker artwork"
                      hint="PNG, JPG or WebP · add several to mix designs · stays on your device"
                      secondaryAction={
                        <button type="button" onClick={addSampleStickers} className={secondaryButtonClass}>
                          Try samples
                        </button>
                      }
                    />
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-zinc-800">
                          {stickerImages.length} design{stickerImages.length === 1 ? "" : "s"} · repeated across {slotsPerPage} labels
                        </p>
                        <button
                          type="button"
                          onClick={() => setStickerImages([])}
                          className="min-h-[32px] px-2 text-xs font-semibold text-zinc-600 hover:text-zinc-950 hover:underline cursor-pointer"
                        >
                          Remove all
                        </button>
                      </div>
                      <ul className="grid grid-cols-4 sm:grid-cols-5 gap-2" aria-label="Uploaded artwork">
                        {stickerImages.map((src, idx) => (
                          <li key={idx} className="relative aspect-square rounded-xl bg-[#f5f5f7] p-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={src}
                              alt={`Design ${idx + 1}`}
                              className={`h-full w-full object-contain ${grid.round ? "rounded-full object-cover" : "rounded-lg"}`}
                            />
                            <button
                              type="button"
                              onClick={() => setStickerImages((prev) => prev.filter((_, j) => j !== idx))}
                              aria-label={`Remove design ${idx + 1}`}
                              className="absolute -right-1.5 -top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-950 text-white shadow hover:bg-zinc-700 cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </li>
                        ))}
                      </ul>
                      <UploadDropzone
                        compact
                        multiple
                        onFiles={handleUploadStickers}
                        title="Add more designs"
                        buttonLabel="Add images"
                        inputLabel="Upload more sticker artwork"
                        hint="They fill the sheet in order, then repeat."
                      />
                    </div>
                  ))}

                {stickerImages.length === 0 && (
                  <div className="space-y-2">
                    {hasArtworkUpload && <p className="text-xs font-semibold text-zinc-600">Or type text instead</p>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label htmlFor="label-title" className={labelCls}>
                          Main text
                        </label>
                        <input
                          id="label-title"
                          type="text"
                          value={labelTitle}
                          onChange={(e) => setLabelTitle(e.target.value)}
                          placeholder="e.g. Pantry Label"
                          className={textFieldCls}
                        />
                      </div>
                      <div>
                        <label htmlFor="label-subtitle" className={labelCls}>
                          Second line <span className="font-normal text-zinc-500">(optional)</span>
                        </label>
                        <input
                          id="label-subtitle"
                          type="text"
                          value={labelSub}
                          onChange={(e) => setLabelSub(e.target.value)}
                          placeholder="e.g. Batch 01 · Fresh"
                          className={textFieldCls}
                        />
                      </div>
                    </div>
                    <FieldHint>Long text shrinks to fit. Leave both empty to print a blank grid you can write on.</FieldHint>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Step 3 — style */}
          {hasStyleStep && (
            <section className={sectionCls} aria-labelledby="label-step-3">
              <StepHeader
                id="label-step-3"
                step={3}
                title="Style"
                hint={showAccent ? "Pick a design, fonts and a colour. The preview updates as you go." : "Choose whether to print outlines."}
              />
              <div className="space-y-5">
                {showAccent && (
                  <>
                    <LabelStylePicker
                      name="label-style"
                      value={labelStyle}
                      onChange={setLabelStyle}
                      measure={measure}
                      sample={
                        mode === "nametag"
                          ? { ...designBase, title: parsedNames[0]?.person || "Alex Morgan", subtitle: parsedNames[0]?.role ?? "" }
                          : { ...designBase, title: labelTitle || "Label", subtitle: labelSub }
                      }
                    />
                    <FontPairPicker name="label-fonts" value={fontPair} onChange={setFontPair} />
                    <ColourSwatchPicker label="Colour" value={accentHex} onChange={setAccentHex} />
                  </>
                )}
                {outlinesToggle}
              </div>
            </section>
          )}

          {/* Step 4 — download */}
          <section id="label-download-step" className={sectionCls} aria-labelledby="label-step-dl">
            <StepHeader
              id="label-step-dl"
              step={downloadStep}
              title="Download & print"
              hint={`You'll get a PDF sized exactly to ${paperShort} — ${summary}.`}
            />
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExporting || !!exportBlocker}
                aria-describedby={exportBlocker ? "label-export-blocker" : undefined}
                className={`${primaryButtonClass} w-full`}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="h-4 w-4" aria-hidden="true" />
                )}
                {isExporting ? "Making your PDF…" : downloadLabel}
              </button>
              {exportBlocker && (
                <FieldHint id="label-export-blocker" tone="error">
                  {exportBlocker}
                </FieldHint>
              )}
              <ToolStatus status={visibleStatus} />
              <PrintTipsPanel
                paperLabel={paperShort}
                open={visibleStatus?.tone === "success"}
                extraSteps={[
                  "Print a test on plain paper and hold it against the label sheet to check alignment.",
                  "Load the label sheet the right way up (check your printer's paper icon).",
                ]}
                cutStep={cutStep}
              />
            </div>
          </section>
        </div>

        {/* Live sheet preview */}
        <div className="order-1 lg:order-2 lg:col-span-7 lg:sticky lg:top-24 rounded-2xl bg-white p-4 sm:p-8 flex flex-col items-center justify-center gap-3 lg:min-h-[420px]">
          <div className="w-full flex items-center justify-between gap-2 text-xs">
            <span className="font-bold text-zinc-950">Preview</span>
            <span className="text-zinc-600">
              {pageCount > 1 ? `Page 1 of ${pageCount} · ` : ""}
              {slotsPerPage} per sheet · {paperShort}
            </span>
          </div>
          <div
            role="img"
            aria-label={`Label sheet preview showing page 1 of ${Math.max(1, pageCount)}: ${grid.cols} labels across by ${grid.rows} down on ${paper.label} paper`}
            className="relative bg-[#f5f5f7] rounded-xl overflow-hidden w-[min(100%,380px,calc(var(--ar)*46vh))] lg:w-[min(100%,380px)]"
            style={
              {
                aspectRatio: `${paper.widthMm} / ${paper.heightMm}`,
                containerType: "inline-size",
                "--ar": paper.widthMm / paper.heightMm,
              } as React.CSSProperties
            }
          >
            {Array.from({ length: slotsPerPage }).map((_, s) => {
              const r = Math.floor(s / grid.cols);
              const c = s % grid.cols;
              let left = grid.marginLeft + c * (grid.labelW + grid.gapX);
              let top = grid.marginTop + r * (grid.labelH + grid.gapY);
              let w = grid.labelW;
              let h = grid.labelH;
              if (grid.round) {
                left += (w - diameter) / 2;
                top += (h - diameter) / 2;
                w = diameter;
                h = diameter;
              }
              return (
                <div
                  key={s}
                  className={`absolute overflow-hidden bg-white ${grid.round ? "rounded-full" : "rounded-[2px]"} ${
                    showBorders ? "ring-1 ring-zinc-300" : ""
                  }`}
                  style={{
                    left: `${(left / paper.widthMm) * 100}%`,
                    top: `${(top / paper.heightMm) * 100}%`,
                    width: `${(w / paper.widthMm) * 100}%`,
                    height: `${(h / paper.heightMm) * 100}%`,
                  }}
                >
                  {renderSlot(s)}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-zinc-600 text-center">
            {activePreset
              ? `${presetCount(grid.paper === "letter" ? activePreset.letter : activePreset.a4)} · ${presetSize(grid)}`
              : `Custom: ${grid.cols} × ${grid.rows} · ${presetSize(grid)}`}
            {" · "}
            {summary}
          </p>
        </div>
      </div>

      <MobileActionBar summary={mobileSummary}>
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isExporting || !!exportBlocker}
          className={`${primaryButtonClass} min-h-[44px] px-4 py-2`}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          {isExporting ? "Making PDF…" : "Download PDF"}
        </button>
      </MobileActionBar>
    </div>
  );
}
