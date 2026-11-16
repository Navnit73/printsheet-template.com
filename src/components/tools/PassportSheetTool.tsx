"use client";

import React, {
  useCallback,
  useEffect,
  useDeferredValue,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  CheckCheck,
  ChevronDown,
  Copy,
  Download,
  Maximize2,
  Printer,
  RefreshCw,
  SlidersHorizontal,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import type { PageId } from "@/types/spec";
import { useNumberField } from "@/lib/use-number-field";
import { PRINTER_SAFE_MARGIN_MM, isPdfSafeText } from "@/lib/pdf-utils";
import {
  FieldHint,
  MobileActionBar,
  PrintTipsPanel,
  StepHeader,
  ToolStatus,
  UploadDropzone,
  primaryButtonClass,
  secondaryButtonClass,
  type ToolStatusTone,
  type ToolStatusValue,
} from "./ui/ToolUi";
import { CropEditor, HeadGuideOverlay } from "./ui/CropEditor";
import {
  DEFAULT_CROP,
  getSourceRect,
  renderCropToDataUrl,
  type CropState,
} from "@/lib/crop";

const EXPORT_DPI = 300;

/**
 * Draws the user's crop of `img` into the box (x, y, w, h). The source rect
 * comes from src/lib/crop.ts (same maths as the on-screen CropEditor and the
 * PDF tiles), so every export path shows exactly what was positioned.
 */
function drawImageCrop(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  aspect: number,
  crop: CropState
) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const r = getSourceRect(iw, ih, aspect, crop);
  ctx.save();
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, r.sx, r.sy, r.sw, r.sh, x, y, w, h);
  ctx.restore();
}

// ---- DPI metadata helpers (canvas exports are tagged 72 dpi by default) ----

const CRC_TABLE: Uint32Array = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

/** Sets JFIF density to `dpi` (patches APP0, or inserts one if missing). */
function setJpegDpi(bytes: Uint8Array, dpi: number): Uint8Array {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return bytes;
  const isJfif =
    bytes[2] === 0xff &&
    bytes[3] === 0xe0 &&
    bytes[6] === 0x4a && // J
    bytes[7] === 0x46 && // F
    bytes[8] === 0x49 && // I
    bytes[9] === 0x46 && // F
    bytes[10] === 0x00;
  if (isJfif) {
    const out = bytes.slice();
    out[13] = 1; // units: dots per inch
    out[14] = (dpi >> 8) & 0xff;
    out[15] = dpi & 0xff;
    out[16] = (dpi >> 8) & 0xff;
    out[17] = dpi & 0xff;
    return out;
  }
  const app0 = new Uint8Array([
    0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01,
    (dpi >> 8) & 0xff, dpi & 0xff, (dpi >> 8) & 0xff, dpi & 0xff, 0x00, 0x00,
  ]);
  const out = new Uint8Array(bytes.length + app0.length);
  out.set(bytes.subarray(0, 2), 0);
  out.set(app0, 2);
  out.set(bytes.subarray(2), 2 + app0.length);
  return out;
}

/** Inserts (or replaces) a pHYs chunk so the PNG declares `dpi`. */
function setPngDpi(bytes: Uint8Array, dpi: number): Uint8Array {
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (!sig.every((b, i) => bytes[i] === b)) return bytes;
  const ppm = Math.round(dpi / 0.0254); // 300 dpi → 11811 px/m
  const chunk = new Uint8Array(21);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, 9);
  chunk.set([0x70, 0x48, 0x59, 0x73], 4); // "pHYs"
  view.setUint32(8, ppm);
  view.setUint32(12, ppm);
  chunk[16] = 1; // unit: metre
  view.setUint32(17, crc32(chunk.subarray(4, 17)));

  // Walk chunks: drop any existing pHYs, insert ours right after IHDR.
  const parts: Uint8Array[] = [bytes.subarray(0, 8)];
  const src = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 8;
  while (offset + 8 <= bytes.length) {
    const len = src.getUint32(offset);
    const type = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8));
    const end = offset + 12 + len;
    if (type !== "pHYs") parts.push(bytes.subarray(offset, end));
    if (type === "IHDR") parts.push(chunk);
    offset = end;
  }
  const total = parts.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(total);
  let pos = 0;
  for (const p of parts) {
    out.set(p, pos);
    pos += p.length;
  }
  return out;
}

const UNREADABLE_IMAGE_MESSAGE =
  "Couldn't read this file. Please use JPG, PNG or WebP — iPhone HEIC photos: share as JPG first.";

export interface PassportPaperOption {
  id: "4x6" | "a4" | "letter" | "5x7" | "3.5x5";
  shortName: string;
  name: string;
  widthMm: number;
  heightMm: number;
  /** Plain-language hint shown under the paper name. */
  use: string;
  /** Sensible starting number of photos (capped by what fits). */
  defaultCount: number;
}

export interface PassportStandardOption {
  id: "35x45" | "51x51" | "35x35" | "50x70" | "33x48";
  /** Short plain-language name shown on the button (ASCII only: used in the PDF footer). */
  regionCode: string;
  flag: string;
  name: string;
  country: string;
  widthMm: number;
  heightMm: number;
  spec: string;
  /** Size as people say it, e.g. "2 × 2 in". */
  sizeLabel: string;
  /** Short photo guide (head size / background). */
  guide: string;
  /** Allowed head height (chin to crown) used for the on-screen guide, mm. */
  headMinMm: number;
  headMaxMm: number;
  /** True when there is no single official head size (guide is approximate). */
  headApprox?: boolean;
}

export const PASSPORT_PAPER_SIZES: PassportPaperOption[] = [
  {
    id: "4x6",
    shortName: "4 × 6 in",
    name: "4 × 6 inches (10 × 15 cm)",
    widthMm: 152.4,
    heightMm: 101.6,
    use: "Photo paper / print shop",
    defaultCount: 6,
  },
  {
    id: "a4",
    shortName: "A4",
    name: "A4 (210 × 297 mm)",
    widthMm: 297.0,
    heightMm: 210.0,
    use: "Home printer",
    defaultCount: 8,
  },
  {
    id: "letter",
    shortName: "US Letter",
    name: "US Letter (8.5 × 11 in)",
    widthMm: 279.4,
    heightMm: 215.9,
    use: "Home printer (US)",
    defaultCount: 8,
  },
  {
    id: "5x7",
    shortName: "5 × 7 in",
    name: "5 × 7 inches (13 × 18 cm)",
    widthMm: 177.8,
    heightMm: 127.0,
    use: "Photo paper",
    defaultCount: 6,
  },
  {
    id: "3.5x5",
    shortName: "3.5 × 5 in",
    name: "3.5 × 5 inches (9 × 13 cm)",
    widthMm: 127.0,
    heightMm: 88.9,
    use: "Small photo paper",
    defaultCount: 6,
  },
];

export const PASSPORT_STANDARDS: PassportStandardOption[] = [
  {
    id: "35x45",
    regionCode: "UK, EU & India",
    flag: "🇪🇺",
    name: "EU, UK, India & Schengen",
    country: "UK, EU, India, Australia & 50+ countries",
    widthMm: 35,
    heightMm: 45,
    spec: "35 × 45 mm",
    sizeLabel: "35 × 45 mm",
    guide:
      "Head (chin to crown): UK 29–34 mm, Schengen/EU 32–36 mm · plain light background · no glasses",
    headMinMm: 29,
    headMaxMm: 36,
  },
  {
    id: "51x51",
    regionCode: "USA & OCI",
    flag: "🇺🇸",
    name: "US passport & India OCI",
    country: "United States, India OCI & 2×2 in visas",
    widthMm: 50.8,
    heightMm: 50.8,
    spec: "2 × 2 in (51 × 51 mm)",
    sizeLabel: "2 × 2 in",
    guide:
      "Head: 25–35 mm (1–1⅜ in) chin to crown · plain white background · no glasses",
    headMinMm: 25,
    headMaxMm: 35,
  },
  {
    id: "35x35",
    regionCode: "India PAN",
    flag: "🇮🇳",
    name: "India PAN card & square forms",
    country: "India PAN card & square ID forms",
    widthMm: 35,
    heightMm: 35,
    spec: "35 × 35 mm",
    sizeLabel: "35 × 35 mm",
    guide: "Face centred and filling most of the photo · plain white background",
    headMinMm: 25,
    headMaxMm: 30,
    headApprox: true,
  },
  {
    id: "50x70",
    regionCode: "Canada",
    flag: "🇨🇦",
    name: "Canada passport & visa",
    country: "Canada passport & citizenship",
    widthMm: 50,
    heightMm: 70,
    spec: "50 × 70 mm",
    sizeLabel: "50 × 70 mm",
    guide: "Head: 31–36 mm chin to crown · plain white or light background",
    headMinMm: 31,
    headMaxMm: 36,
  },
  {
    id: "33x48",
    regionCode: "China",
    flag: "🇨🇳",
    name: "China passport & visa",
    country: "China passport & consular visa",
    widthMm: 33,
    heightMm: 48,
    spec: "33 × 48 mm",
    sizeLabel: "33 × 48 mm",
    guide: "Head: 28–33 mm chin to crown · plain white background · no glasses",
    headMinMm: 28,
    headMaxMm: 33,
  },
];

function createSamplePortraitDataUrl(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 700;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = "#f4f4f5";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#d4d4d8";
  ctx.setLineDash([10, 8]);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(350, 360, 170, 215, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#18181b";
  ctx.beginPath();
  ctx.ellipse(350, 890, 260, 240, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#4d7c0f";
  ctx.beginPath();
  ctx.moveTo(275, 650);
  ctx.lineTo(350, 720);
  ctx.lineTo(425, 650);
  ctx.lineTo(395, 625);
  ctx.lineTo(305, 625);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#d4a373";
  ctx.fillRect(305, 535, 90, 115);
  ctx.beginPath();
  ctx.ellipse(350, 365, 128, 165, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#27272a";
  ctx.beginPath();
  ctx.ellipse(350, 275, 132, 110, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 24px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SAMPLE PORTRAIT", 350, 815);
  ctx.fillStyle = "#a1a1aa";
  ctx.font = "18px monospace";
  ctx.fillText("Upload your own photo above", 350, 848);

  return canvas.toDataURL("image/png");
}

function getDefaultsForPage(pageId?: PageId): {
  paperId: PassportPaperOption["id"];
  standardId: PassportStandardOption["id"];
  orientation: "landscape" | "portrait";
} {
  if (pageId === "T07") {
    return {
      paperId: "4x6",
      standardId: "35x45",
      orientation: "landscape",
    };
  }
  return {
    paperId: "a4",
    standardId: "35x45",
    orientation: "portrait",
  };
}

export interface PassportSheetToolProps {
  pageId?: PageId;
  initialPaperSize?: PassportPaperOption["id"];
  initialPhotoStandard?: PassportStandardOption["id"];
  initialPhotoCount?: number;
}


export function PassportSheetTool({
  pageId,
  initialPaperSize,
  initialPhotoStandard,
  initialPhotoCount,
}: PassportSheetToolProps) {
  const defaults = getDefaultsForPage(pageId);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [paperSizeId, setPaperSizeId] = useState<PassportPaperOption["id"]>(
    initialPaperSize ?? defaults.paperId
  );
  const [photoStandardId, setPhotoStandardId] = useState<
    PassportStandardOption["id"] | "custom"
  >(initialPhotoStandard ?? defaults.standardId);
  const [customPhotoWidth, setCustomPhotoWidth] = useState<number>(35);
  const [customPhotoHeight, setCustomPhotoHeight] = useState<number>(45);

  const [guideStyle, setGuideStyle] = useState<
    "corner" | "dashed" | "solid" | "none"
  >("corner");
  const [gapMm, setGapMm] = useState<number>(2.5);
  const [marginMm, setMarginMm] = useState<number>(4);
  const [showAdvancedSpacing, setShowAdvancedSpacing] = useState<boolean>(false);
  const [orientation, setOrientation] = useState<"landscape" | "portrait">(
    (initialPaperSize ?? defaults.paperId) === "a4" ||
      (initialPaperSize ?? defaults.paperId) === "letter"
      ? "portrait"
      : "landscape"
  );
  /** null = sensible default for the paper, "max" = fill the sheet. */
  const [photoCountChoice, setPhotoCountChoice] = useState<
    number | "max" | null
  >(initialPhotoCount ?? null);

  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<ToolStatusValue | null>(null);
  // Upload problems are shown next to the upload box, not the download area.
  const [uploadError, setUploadError] = useState<string | null>(null);
  // The imageSrc whose <img> has finished decoding (exports need a decoded image).
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  // Full-screen preview snapshot (object URL) while the zoom dialog is open.
  const [zoomUrl, setZoomUrl] = useState<string | null>(null);
  // Face position/zoom inside the photo slot (shared with every export path).
  const [crop, setCrop] = useState<CropState>(DEFAULT_CROP);
  // The live sheet canvas is large (300 DPI); let it lag a frame behind drags.
  const previewCrop = useDeferredValue(crop);
  // Natural pixel size of the loaded photo (for the low-resolution warning).
  const [imageSize, setImageSize] = useState<{ w: number; h: number } | null>(
    null
  );

  const showStatus = (text: string, tone: ToolStatusTone = "info") =>
    setStatus({ text, tone });
  const clearStatus = () => setStatus(null);

  const customWidthField = useNumberField(
    customPhotoWidth,
    (v) => {
      setCustomPhotoWidth(v);
      clearStatus();
    },
    { min: 15, max: 120, unit: "mm" }
  );
  const customHeightField = useNumberField(
    customPhotoHeight,
    (v) => {
      setCustomPhotoHeight(v);
      clearStatus();
    },
    { min: 15, max: 120, unit: "mm" }
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);
  const zoomDialogRef = useRef<HTMLDialogElement | null>(null);

  const currentPaper =
    PASSPORT_PAPER_SIZES.find((p) => p.id === paperSizeId) ||
    PASSPORT_PAPER_SIZES[0];
  const currentStandard =
    PASSPORT_STANDARDS.find((s) => s.id === photoStandardId) ||
    PASSPORT_STANDARDS[0];

  const safeCustomW = Math.min(120, Math.max(15, customPhotoWidth || 35));
  const safeCustomH = Math.min(120, Math.max(15, customPhotoHeight || 45));

  const photoWidthMm =
    photoStandardId === "custom" ? safeCustomW : currentStandard.widthMm;
  const photoHeightMm =
    photoStandardId === "custom" ? safeCustomH : currentStandard.heightMm;
  const photoSizeLabel =
    photoStandardId === "custom"
      ? `${photoWidthMm} × ${photoHeightMm} mm`
      : currentStandard.sizeLabel;

  const paperWidthMm =
    orientation === "landscape"
      ? Math.max(currentPaper.widthMm, currentPaper.heightMm)
      : Math.min(currentPaper.widthMm, currentPaper.heightMm);
  const paperHeightMm =
    orientation === "landscape"
      ? Math.min(currentPaper.widthMm, currentPaper.heightMm)
      : Math.max(currentPaper.widthMm, currentPaper.heightMm);

  const mmToPx = (mm: number) => (mm * EXPORT_DPI) / 25.4;

  const paperWidthPx = Math.round(mmToPx(paperWidthMm));
  const paperHeightPx = Math.round(mmToPx(paperHeightMm));
  const photoWidthPx = Math.round(mmToPx(photoWidthMm));
  const photoHeightPx = Math.round(mmToPx(photoHeightMm));
  const gapPx = Math.round(mmToPx(gapMm));
  const marginPx = Math.round(mmToPx(marginMm));

  const availableWidth = Math.max(1, paperWidthPx - 2 * marginPx);
  const availableHeight = Math.max(1, paperHeightPx - 2 * marginPx);

  const maxCols = Math.max(
    0,
    Math.floor((availableWidth + gapPx) / (photoWidthPx + gapPx))
  );
  const maxRows = Math.max(
    0,
    Math.floor((availableHeight + gapPx) / (photoHeightPx + gapPx))
  );
  const maxCapacity = maxCols * maxRows;
  const photoFits = maxCapacity >= 1;

  const activePhotoCount =
    photoCountChoice === "max"
      ? maxCapacity
      : Math.min(photoCountChoice ?? currentPaper.defaultCount, maxCapacity);
  const photosLabel = (n: number, word = "photo") =>
    `${n} ${word}${n === 1 ? "" : "s"}`;

  const hasPhoto = imageSrc !== null && loadedSrc === imageSrc;
  const canExport = hasPhoto && photoFits;
  const summaryText = photoFits
    ? `${photosLabel(activePhotoCount)} · ${currentPaper.shortName}`
    : `Doesn't fit on ${currentPaper.shortName}`;
  const photoGuide =
    photoStandardId === "custom"
      ? "Follow the head-size and background rules for your document"
      : currentStandard.guide;

  // ---- Face position (crop) ----
  const isCustomSize = photoStandardId === "custom";
  const cropAspect = photoWidthMm / photoHeightMm;
  const headRangeLabel = isCustomSize
    ? null
    : `${currentStandard.headApprox ? "about " : ""}${currentStandard.headMinMm}–${currentStandard.headMaxMm} mm`;
  const cropOverlay = isCustomSize ? (
    <svg
      viewBox={`0 0 ${photoWidthMm} ${photoHeightMm}`}
      className="h-full w-full"
      aria-hidden="true"
    >
      <ellipse
        cx={photoWidthMm / 2}
        cy={photoHeightMm * 0.45}
        rx={Math.min(photoWidthMm * 0.4, photoHeightMm * 0.35 * 0.72)}
        ry={photoHeightMm * 0.35}
        fill="none"
        stroke="white"
        strokeWidth={Math.max(0.3, photoHeightMm / 90)}
        strokeDasharray="1.2 0.8"
      />
    </svg>
  ) : (
    <HeadGuideOverlay
      slotWidthMm={photoWidthMm}
      slotHeightMm={photoHeightMm}
      headMinMm={currentStandard.headMinMm}
      headMaxMm={currentStandard.headMaxMm}
    />
  );
  // Warn when the cropped area has fewer than ~80% of the pixels needed for
  // a sharp 300 DPI print at this slot size.
  const cropSourceRect =
    hasPhoto && imageSize
      ? getSourceRect(imageSize.w, imageSize.h, cropAspect, crop)
      : null;
  const isLowResolution =
    cropSourceRect !== null &&
    cropSourceRect.sw < (photoWidthMm / 25.4) * EXPORT_DPI * 0.8;

  const computeSlotLayout = useCallback(() => {
    if (maxCols < 1 || maxRows < 1 || activePhotoCount < 1) {
      return {
        cols: 0,
        rows: 0,
        slots: [] as Array<{ xMm: number; yMm: number }>,
        gridBottomMm: 0,
      };
    }
    let cols = maxCols;
    let rows = Math.ceil(activePhotoCount / cols);
    if (rows > maxRows) {
      rows = maxRows;
      cols = Math.ceil(activePhotoCount / rows);
    }

    const gridWidthMm = cols * photoWidthMm + (cols - 1) * gapMm;
    const gridHeightMm = rows * photoHeightMm + (rows - 1) * gapMm;
    const startXMm = (paperWidthMm - gridWidthMm) / 2;
    const startYMm = (paperHeightMm - gridHeightMm) / 2;

    const slots: Array<{ xMm: number; yMm: number }> = [];
    let placed = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (placed >= activePhotoCount) break;
        slots.push({
          xMm: startXMm + c * (photoWidthMm + gapMm),
          yMm: startYMm + r * (photoHeightMm + gapMm),
        });
        placed++;
      }
    }
    return { cols, rows, slots, gridBottomMm: startYMm + gridHeightMm };
  }, [
    maxCols,
    maxRows,
    activePhotoCount,
    photoWidthMm,
    photoHeightMm,
    gapMm,
    paperWidthMm,
    paperHeightMm,
  ]);

  const standardLabel =
    photoStandardId === "custom"
      ? `Custom ${photoWidthMm}x${photoHeightMm} mm`
      : `${currentStandard.regionCode} (${photoWidthMm}x${photoHeightMm} mm)`;
  const footerText = `Print Sheet Maker · ${currentPaper.name} · ${standardLabel} · ${photosLabel(activePhotoCount, "Photo")} · Print at 100% Scale`;

  /** Footer baseline sits PRINTER_SAFE_MARGIN_MM above the bottom edge; it must clear the grid by 1 mm. */
  const footerFits = useCallback(
    (gridBottomMm: number, fontHeightMm: number, textWidthMm: number) => {
      const baselineMm = paperHeightMm - PRINTER_SAFE_MARGIN_MM;
      const topMm = baselineMm - fontHeightMm;
      return (
        topMm >= gridBottomMm + 1 &&
        textWidthMm <= paperWidthMm - 2 * PRINTER_SAFE_MARGIN_MM
      );
    },
    [paperHeightMm, paperWidthMm]
  );

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = paperWidthPx;
    canvas.height = paperHeightPx;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, paperWidthPx, paperHeightPx);

    if (!photoFits) {
      ctx.fillStyle = "#71717A";
      ctx.font = `600 ${Math.round(mmToPx(4))}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(
        "Photo size doesn't fit on this paper",
        paperWidthPx / 2,
        paperHeightPx / 2,
        paperWidthPx - 2 * marginPx
      );
      return;
    }

    const { slots, gridBottomMm } = computeSlotLayout();
    const img = imageElementRef.current;

    slots.forEach((slot, idx) => {
      const x = Math.round(mmToPx(slot.xMm));
      const y = Math.round(mmToPx(slot.yMm));

      if (img) {
        drawImageCrop(
          ctx,
          img,
          x,
          y,
          photoWidthPx,
          photoHeightPx,
          photoWidthMm / photoHeightMm,
          previewCrop
        );
      } else {
        // Architectural blueprint slot preview before photo upload
        ctx.fillStyle = "#F4F4F5";
        ctx.fillRect(x, y, photoWidthPx, photoHeightPx);

        // Head & shoulders guide silhouette inside empty slot
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, photoWidthPx, photoHeightPx);
        ctx.clip();

        ctx.strokeStyle = "#D4D4D8";
        ctx.lineWidth = Math.max(2, Math.round(photoWidthPx * 0.008));
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.ellipse(
          x + photoWidthPx / 2,
          y + photoHeightPx * 0.42,
          photoWidthPx * 0.25,
          photoHeightPx * 0.26,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = "#71717A";
        ctx.font = `bold ${Math.max(16, Math.round(photoWidthPx * 0.085))}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(
          `#${idx + 1}`,
          x + photoWidthPx / 2,
          y + photoHeightPx * 0.44
        );

        ctx.fillStyle = "#4D7C0F";
        ctx.font = `600 ${Math.max(14, Math.round(photoWidthPx * 0.068))}px monospace`;
        ctx.fillText(
          `${photoWidthMm}×${photoHeightMm}mm`,
          x + photoWidthPx / 2,
          y + photoHeightPx * 0.82
        );
        ctx.restore();
      }

      if (guideStyle === "solid") {
        ctx.strokeStyle = "#A1A1AA";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, photoWidthPx, photoHeightPx);
      } else if (guideStyle === "dashed") {
        ctx.save();
        ctx.strokeStyle = "#71717A";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 8]);
        ctx.strokeRect(x, y, photoWidthPx, photoHeightPx);
        ctx.restore();
      } else if (guideStyle === "corner") {
        const markLen = Math.round(mmToPx(3.5));
        ctx.save();
        ctx.strokeStyle = "#52525B";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(x, y + markLen);
        ctx.lineTo(x, y);
        ctx.lineTo(x + markLen, y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + photoWidthPx - markLen, y);
        ctx.lineTo(x + photoWidthPx, y);
        ctx.lineTo(x + photoWidthPx, y + markLen);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, y + photoHeightPx - markLen);
        ctx.lineTo(x, y + photoHeightPx);
        ctx.lineTo(x + markLen, y + photoHeightPx);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + photoWidthPx - markLen, y + photoHeightPx);
        ctx.lineTo(x + photoWidthPx, y + photoHeightPx);
        ctx.lineTo(x + photoWidthPx, y + photoHeightPx - markLen);
        ctx.stroke();

        ctx.restore();
      }
    });

    // Calibration footer: only when it fits below the grid and inside the
    // printer-safe area; otherwise skip it rather than overlap/clip.
    const footerFontPx = Math.round(mmToPx(2.2));
    ctx.save();
    ctx.fillStyle = "#71717A";
    ctx.font = `${footerFontPx}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = "center";
    const footerWidthMm = (ctx.measureText(footerText).width * 25.4) / EXPORT_DPI;
    if (footerFits(gridBottomMm, 2.2, footerWidthMm)) {
      ctx.fillText(
        footerText,
        paperWidthPx / 2,
        Math.round(mmToPx(paperHeightMm - PRINTER_SAFE_MARGIN_MM))
      );
    }
    ctx.restore();
  }, [
    paperWidthPx,
    paperHeightPx,
    photoWidthPx,
    photoHeightPx,
    computeSlotLayout,
    guideStyle,
    photoWidthMm,
    photoHeightMm,
    photoFits,
    marginPx,
    paperHeightMm,
    footerText,
    footerFits,
    previewCrop,
  ]);

  useEffect(() => {
    if (!imageSrc) {
      imageElementRef.current = null;
      renderCanvas();
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      imageElementRef.current = img;
      setImageSize({ w: img.naturalWidth, h: img.naturalHeight });
      setLoadedSrc(imageSrc);
      renderCanvas();
    };
    img.onerror = () => {
      if (cancelled) return;
      imageElementRef.current = null;
      setImageSrc(null);
      setLoadedSrc(null);
      setUploadError(UNREADABLE_IMAGE_MESSAGE);
    };
    img.src = imageSrc;
    return () => {
      cancelled = true;
    };
  }, [imageSrc, renderCanvas]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handlePaperChange = (id: PassportPaperOption["id"]) => {
    setPaperSizeId(id);
    setOrientation(id === "a4" || id === "letter" ? "portrait" : "landscape");
    clearStatus();
  };

  const processFile = (file: File) => {
    const name = file.name.toLowerCase();
    const isHeic =
      /image\/hei[cf]/.test(file.type) || /\.(heic|heif)$/.test(name);
    if (isHeic || !file.type.startsWith("image/")) {
      setUploadError(UNREADABLE_IMAGE_MESSAGE);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    // Decode first; only replace the current photo once the new one is readable,
    // so a broken file never leaves the UI claiming a photo is "Loaded".
    const objectUrl = URL.createObjectURL(file);
    const probe = new Image();
    probe.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === "string") {
          clearStatus();
          setUploadError(null);
          setCrop(DEFAULT_CROP);
          setImageSrc(result);
        }
      };
      reader.onerror = () => setUploadError(UNREADABLE_IMAGE_MESSAGE);
      reader.readAsDataURL(file);
    };
    probe.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setUploadError(UNREADABLE_IMAGE_MESSAGE);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    probe.src = objectUrl;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleLoadSample = () => {
    const sample = createSamplePortraitDataUrl();
    if (sample) {
      clearStatus();
      setUploadError(null);
      setCrop(DEFAULT_CROP);
      setImageSrc(sample);
    }
  };

  const fileBaseName = `passport-photo-sheet-${photoWidthMm}x${photoHeightMm}mm-${currentPaper.id}-${activePhotoCount}pcs`;

  const handleDownloadPdf = async () => {
    const img = imageElementRef.current;
    if (!img || !canExport) return;
    setIsExporting(true);
    clearStatus();

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: orientation === "landscape" ? "landscape" : "portrait",
        unit: "mm",
        format: [paperWidthMm, paperHeightMm],
      });

      // Tile at the slot's exact aspect ratio (600 DPI), cropped with the
      // user's face position (same maths as the editor and the preview).
      const croppedDataUrl = renderCropToDataUrl(
        img,
        (photoWidthMm * EXPORT_DPI * 2) / 25.4,
        (photoHeightMm * EXPORT_DPI * 2) / 25.4,
        crop,
        "image/jpeg",
        0.95
      );

      const { slots, gridBottomMm } = computeSlotLayout();

      for (const slot of slots) {
        const x = slot.xMm;
        const y = slot.yMm;
        doc.addImage(
          croppedDataUrl,
          "JPEG",
          x,
          y,
          photoWidthMm,
          photoHeightMm,
          "passport-tile",
          "FAST"
        );

        if (guideStyle === "solid") {
          doc.setDrawColor(161, 161, 170);
          doc.setLineWidth(0.2);
          doc.rect(x, y, photoWidthMm, photoHeightMm);
        } else if (guideStyle === "dashed") {
          doc.setDrawColor(113, 113, 122);
          doc.setLineWidth(0.25);
          doc.setLineDashPattern([1.8, 1.8], 0);
          doc.rect(x, y, photoWidthMm, photoHeightMm);
          doc.setLineDashPattern([], 0);
        } else if (guideStyle === "corner") {
          const markLen = 3.5;
          doc.setDrawColor(82, 82, 91);
          doc.setLineWidth(0.25);
          doc.line(x, y + markLen, x, y);
          doc.line(x, y, x + markLen, y);
          doc.line(x + photoWidthMm - markLen, y, x + photoWidthMm, y);
          doc.line(x + photoWidthMm, y, x + photoWidthMm, y + markLen);
          doc.line(x, y + photoHeightMm - markLen, x, y + photoHeightMm);
          doc.line(x, y + photoHeightMm, x + markLen, y + photoHeightMm);
          doc.line(
            x + photoWidthMm - markLen,
            y + photoHeightMm,
            x + photoWidthMm,
            y + photoHeightMm
          );
          doc.line(
            x + photoWidthMm,
            y + photoHeightMm,
            x + photoWidthMm,
            y + photoHeightMm - markLen
          );
        }
      }

      const footerFontPt = 7;
      const footerFontMm = (footerFontPt * 25.4) / 72;
      doc.setFontSize(footerFontPt);
      doc.setTextColor(113, 113, 122);
      if (
        isPdfSafeText(footerText) &&
        footerFits(gridBottomMm, footerFontMm, doc.getTextWidth(footerText))
      ) {
        doc.text(
          footerText,
          paperWidthMm / 2,
          paperHeightMm - PRINTER_SAFE_MARGIN_MM,
          { align: "center" }
        );
      }

      const fileName = `${fileBaseName}.pdf`;
      doc.save(fileName);
      showStatus(
        `Downloaded ${fileName}. Next: print it using the steps below.`,
        "success"
      );
    } catch {
      showStatus(
        "Could not create the PDF. Please try JPEG or PNG under “Other formats”.",
        "error"
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadRaster = (format: "jpeg" | "png") => {
    const canvas = canvasRef.current;
    if (!canvas || !canExport) return;
    setIsExporting(true);
    clearStatus();

    const mime = format === "jpeg" ? "image/jpeg" : "image/png";
    const quality = format === "jpeg" ? 0.98 : undefined;
    canvas.toBlob(
      async (blob) => {
        try {
          if (!blob) throw new Error("Export failed");
          const raw = new Uint8Array(await blob.arrayBuffer());
          const tagged =
            format === "jpeg"
              ? setJpegDpi(raw, EXPORT_DPI)
              : setPngDpi(raw, EXPORT_DPI);
          const url = URL.createObjectURL(
            new Blob([tagged as BlobPart], { type: mime })
          );
          const filename = `${fileBaseName}.${format === "jpeg" ? "jpg" : "png"}`;
          const link = document.createElement("a");
          link.download = filename;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(url), 10000);
          showStatus(
            `Downloaded ${filename}. Next: print it using the steps below.`,
            "success"
          );
        } catch {
          showStatus(
            `Could not create the ${format.toUpperCase()} file. Please try Download PDF.`,
            "error"
          );
        } finally {
          setIsExporting(false);
        }
      },
      mime,
      quality
    );
  };

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas || !canExport) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showStatus("Please allow popups to open the browser print dialog.", "error");
      return;
    }

    const dataUrl = canvas.toDataURL("image/jpeg", 1.0);
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Passport Photo Sheet - Print Sheet Maker</title>
          <style>
            @page {
              size: ${paperWidthMm}mm ${paperHeightMm}mm;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #fff;
            }
            img {
              width: ${paperWidthMm}mm;
              height: ${paperHeightMm}mm;
              display: block;
            }
          </style>
        </head>
        <body>
          <img id="sheet" src="${dataUrl}" alt="Printable passport photo sheet" />
          <script>
            (function () {
              var closed = false;
              function closeSoon() {
                if (closed) return;
                closed = true;
                setTimeout(function () { window.close(); }, 300);
              }
              window.addEventListener("afterprint", closeSoon);
              function go() {
                window.print();
                // Fallback for browsers without a reliable afterprint (older
                // Safari/iOS): close once the tab regains focus after the dialog.
                setTimeout(function () {
                  window.addEventListener("focus", closeSoon);
                }, 1000);
              }
              var img = document.getElementById("sheet");
              if (img.complete) go(); else img.onload = go;
            })();
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    showStatus(
      "Print window opened. Follow the steps below so the photos print at the exact size.",
      "success"
    );
  };

  const handleCopy = () => {
    const canvas = canvasRef.current;
    if (!canvas || !canExport) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2400);
      } catch {
        showStatus(
          "Direct clipboard copy is not supported here. Please use Download instead.",
          "error"
        );
      }
    }, "image/png");
  };

  const handleReset = () => {
    setImageSrc(null);
    setLoadedSrc(null);
    setImageSize(null);
    setCrop(DEFAULT_CROP);
    setPhotoCountChoice(null);
    clearStatus();
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const copyPresets = [2, 4, 6, 8, maxCapacity].filter(
    (v, i, a) => a.indexOf(v) === i && v >= 1 && v <= maxCapacity
  );

  const openZoom = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setZoomUrl(URL.createObjectURL(blob));
        const dialog = zoomDialogRef.current;
        if (dialog && !dialog.open) dialog.showModal();
      },
      "image/jpeg",
      0.9
    );
  };
  const closeZoom = () => zoomDialogRef.current?.close();

  const exportHintId = "passport-export-hint";
  const disabledReason = !photoFits
    ? `${photoSizeLabel} photos don't fit on ${currentPaper.shortName}. Pick bigger paper, turn the paper, or make the edge margin smaller.`
    : !hasPhoto
      ? "Upload your photo in step 1 (or try the sample) to turn on download."
      : null;
  const downloadPdfLabel = isExporting
    ? "Creating PDF…"
    : canExport
      ? `Download PDF · ${photosLabel(activePhotoCount)}`
      : "Download PDF";

  const choiceClass = (active: boolean) =>
    `rounded-xl text-left transition cursor-pointer ${
      active
        ? "bg-[#eef6e4] text-zinc-950 ring-2 ring-[#4d7c0f]"
        : "bg-[#f5f5f7] hover:bg-[#ebeced] text-zinc-800"
    }`;

  return (
    <div className="rounded-3xl bg-[#f5f5f7] p-2 sm:p-5 lg:p-6 space-y-2 sm:space-y-5">
      <input
        ref={fileInputRef}
        type="file"
        aria-label="Change passport photo"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* STEP 1: UPLOAD */}
      <section
        aria-labelledby="passport-step-1"
        className="rounded-2xl bg-white p-4 sm:p-5"
      >
        <StepHeader
          id="passport-step-1"
          step={1}
          title="Upload your photo"
          hint="Front-facing, plain light background, good light."
        />
        {!imageSrc ? (
          <UploadDropzone
            title="Upload your passport photo"
            hint="JPG, PNG or WebP · never leaves your device"
            onFiles={(files) => files[0] && processFile(files[0])}
            secondaryAction={
              <button
                type="button"
                onClick={handleLoadSample}
                className={secondaryButtonClass}
              >
                Try sample
              </button>
            }
          />
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border-2 border-dashed px-3 py-3 transition-colors ${
              isDragging
                ? "border-[#4d7c0f] bg-[#eef6e4]"
                : "border-zinc-200 bg-[#fafafa]"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element -- local data URL */}
              <img
                src={imageSrc}
                alt="Your uploaded photo"
                className="h-14 w-11 shrink-0 rounded-lg object-cover bg-white"
              />
              <div className="min-w-0">
                <p className="text-sm font-bold text-zinc-950">Photo added</p>
                <p className="text-xs text-zinc-600">
                  {photoFits
                    ? `${photosLabel(activePhotoCount)} of ${photoSizeLabel} on ${currentPaper.shortName}`
                    : `${photoSizeLabel} doesn't fit on ${currentPaper.shortName}`}
                  <span className="hidden sm:inline"> · drop a new photo here to replace it</span>
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`${secondaryButtonClass} whitespace-nowrap px-3`}
              >
                <Upload aria-hidden="true" className="h-4 w-4 text-[#3f6212]" />
                Change photo
              </button>
              <button
                type="button"
                onClick={handleReset}
                className={`${secondaryButtonClass} whitespace-nowrap px-3`}
              >
                <Trash2 aria-hidden="true" className="h-4 w-4 text-zinc-600" />
                Remove
              </button>
            </div>
          </div>
        )}
        {hasPhoto && imageSrc && (
          <div
            aria-labelledby="passport-face-title"
            role="group"
            className="mt-4 pt-4 border-t border-[#ebeced] flex flex-col-reverse sm:flex-row gap-4 sm:gap-6"
          >
            <div className="w-full max-w-[280px] mx-auto sm:mx-0 shrink-0">
              <CropEditor
                src={imageSrc}
                aspect={cropAspect}
                value={crop}
                onChange={setCrop}
                overlay={cropOverlay}
                label="Position your face"
                maxWidthPx={280}
              />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <h3
                id="passport-face-title"
                className="text-sm font-bold tracking-tight text-zinc-950"
              >
                Position your face
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Drag the photo to move it and use the slider (or pinch) to zoom.
                Every photo on the sheet uses this framing.
              </p>
              {isCustomSize ? (
                <FieldHint>
                  Keep your face inside the oval and centred. Check your
                  document&apos;s rules for the exact head size.
                </FieldHint>
              ) : (
                <>
                  <ul className="space-y-1.5 text-xs text-zinc-700">
                    <li className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="inline-block h-0.5 w-5 shrink-0 rounded bg-[#a3e635] ring-1 ring-[#65a30d]/40"
                      />
                      Green line = top of head
                    </li>
                    <li className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="inline-block h-3 w-5 shrink-0 rounded-sm border-y border-dashed border-[#ca8a04] bg-[#facc15]/30"
                      />
                      Yellow band = where the chin should sit
                    </li>
                  </ul>
                  <FieldHint>
                    Zoom until the chin lands in the yellow band and the top of
                    the head touches the green line.
                  </FieldHint>
                  <FieldHint>
                    <strong className="text-zinc-800">
                      {currentStandard.headApprox
                        ? "Head size (approximate):"
                        : "Head size:"}
                    </strong>{" "}
                    {headRangeLabel} chin to crown.{" "}
                    {currentStandard.id === "35x45" &&
                      "The band covers UK 29–34 mm and Schengen/EU 32–36 mm."}
                  </FieldHint>
                </>
              )}
              {isLowResolution && (
                <FieldHint tone="warning">
                  This photo is low resolution for this size — it may print
                  blurry. Use the original camera photo if you can.
                </FieldHint>
              )}
            </div>
          </div>
        )}
        {uploadError && (
          <div className="mt-3">
            <ToolStatus status={{ tone: "error", text: uploadError }} />
          </div>
        )}
      </section>

      {/* MAIN: CONTROLS + PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-5 items-start">
        {/* LEFT COLUMN: steps 2–4 */}
        <div className="order-2 lg:order-1 lg:col-span-6 rounded-2xl bg-white p-4 sm:p-6 flex flex-col gap-7">
          {/* STEP 2: COUNTRY */}
          <section aria-labelledby="passport-step-2">
            <StepHeader
              id="passport-step-2"
              step={2}
              title="Choose your country"
              hint="This sets the photo size."
              aside={
                <span className="text-[11px] font-bold text-[#365314] bg-[#eef6e4] px-2 py-0.5 rounded-full whitespace-nowrap">
                  {photoSizeLabel}
                </span>
              }
            />

            <div
              role="group"
              aria-label="Country or document"
              className="grid grid-cols-2 sm:grid-cols-3 gap-2"
            >
              {PASSPORT_STANDARDS.map((std) => {
                const active = photoStandardId === std.id;
                return (
                  <button
                    key={std.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setPhotoStandardId(std.id);
                      clearStatus();
                    }}
                    className={`min-h-[60px] px-3 py-2.5 ${choiceClass(active)}`}
                  >
                    <span className="block text-xs font-bold text-zinc-950 truncate">
                      <span aria-hidden="true">{std.flag} </span>
                      {std.regionCode}
                    </span>
                    <span className="mt-1 block text-[11px] font-semibold text-[#365314]">
                      {std.sizeLabel}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                aria-pressed={photoStandardId === "custom"}
                onClick={() => {
                  setPhotoStandardId("custom");
                  clearStatus();
                }}
                className={`min-h-[60px] px-3 py-2.5 ${choiceClass(photoStandardId === "custom")}`}
              >
                <span className="block text-xs font-bold text-zinc-950 truncate">
                  Other size
                </span>
                <span className="mt-1 block text-[11px] text-zinc-600 truncate">
                  Type width × height
                </span>
              </button>
            </div>

            {photoStandardId === "custom" && (
              <div className="space-y-1.5 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <label
                    htmlFor="passport-custom-width-mm"
                    className="text-[11px] font-bold text-zinc-700 block"
                  >
                    Width (mm)
                    <input
                      id="passport-custom-width-mm"
                      type="number"
                      {...customWidthField.inputProps}
                      aria-describedby="passport-custom-size-hint"
                      className="mt-1 w-full min-h-[40px] bg-[#f5f5f7] rounded-xl px-3 py-1.5 text-sm font-mono text-zinc-950 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-400"
                    />
                    {customWidthField.error && (
                      <span className="mt-1 block text-[11px] font-medium text-red-700">
                        {customWidthField.error}
                      </span>
                    )}
                  </label>
                  <label
                    htmlFor="passport-custom-height-mm"
                    className="text-[11px] font-bold text-zinc-700 block"
                  >
                    Height (mm)
                    <input
                      id="passport-custom-height-mm"
                      type="number"
                      {...customHeightField.inputProps}
                      aria-describedby="passport-custom-size-hint"
                      className="mt-1 w-full min-h-[40px] bg-[#f5f5f7] rounded-xl px-3 py-1.5 text-sm font-mono text-zinc-950 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-400"
                    />
                    {customHeightField.error && (
                      <span className="mt-1 block text-[11px] font-medium text-red-700">
                        {customHeightField.error}
                      </span>
                    )}
                  </label>
                </div>
                <FieldHint id="passport-custom-size-hint">
                  15–120 mm per side. 1 inch = 25.4 mm.
                </FieldHint>
              </div>
            )}
          </section>

          {/* STEP 3: PAPER & COUNT */}
          <section
            aria-labelledby="passport-step-3"
            className="pt-6 border-t border-[#ebeced]"
          >
            <StepHeader
              id="passport-step-3"
              step={3}
              title="Choose paper & how many"
              hint="A4 or Letter for a home printer; 4 × 6 in for photo paper or a print shop."
            />

            <div
              role="group"
              aria-label="Paper size"
              className="grid grid-cols-2 sm:grid-cols-3 gap-2"
            >
              {PASSPORT_PAPER_SIZES.map((paper) => {
                const active = paperSizeId === paper.id;
                return (
                  <button
                    key={paper.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => handlePaperChange(paper.id)}
                    className={`min-h-[56px] px-3 py-2 ${choiceClass(active)}`}
                  >
                    <span className="block font-bold text-xs text-zinc-950 truncate">
                      {paper.shortName}
                    </span>
                    <span className="mt-1 block text-[11px] text-zinc-600 truncate">
                      {paper.use}
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                aria-label={`Turn the paper. Now ${orientation}; switch to ${orientation === "landscape" ? "portrait" : "landscape"}`}
                onClick={() => {
                  setOrientation(
                    orientation === "landscape" ? "portrait" : "landscape"
                  );
                  clearStatus();
                }}
                className={`min-h-[56px] px-3 py-2 ${choiceClass(false)}`}
              >
                <span className="flex items-center gap-1.5 font-bold text-xs text-zinc-950">
                  <RefreshCw aria-hidden="true" className="h-3.5 w-3.5 text-[#3f6212]" />
                  Turn paper
                </span>
                <span className="mt-1 block text-[11px] text-zinc-600 capitalize">
                  Now: {orientation}
                </span>
              </button>
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span
                  id="passport-count-label"
                  className="text-xs font-bold text-zinc-800"
                >
                  How many photos
                </span>
                <span className="text-[11px] text-zinc-600">
                  {photoFits
                    ? `Up to ${maxCapacity} fit on ${currentPaper.shortName}`
                    : "None fit"}
                </span>
              </div>
              {photoFits && (
                <div
                  role="group"
                  aria-labelledby="passport-count-label"
                  className="flex items-center gap-1.5"
                >
                  {copyPresets.map((count) => {
                    const isSelected = activePhotoCount === count;
                    const isMax = count === maxCapacity;
                    return (
                      <button
                        key={count}
                        type="button"
                        aria-pressed={isSelected}
                        aria-label={
                          isMax
                            ? `${count} photos (fill the sheet)`
                            : `${count} photos`
                        }
                        onClick={() => {
                          setPhotoCountChoice(isMax ? "max" : count);
                          clearStatus();
                        }}
                        className={`min-h-[42px] flex-1 py-2 px-1 rounded-xl text-sm font-bold transition cursor-pointer ${
                          isSelected
                            ? "bg-zinc-950 text-white"
                            : "bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced]"
                        }`}
                      >
                        {isMax ? `All ${count}` : count}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span
                  id="passport-marks-label"
                  className="text-xs font-bold text-zinc-800"
                >
                  Cutting marks
                </span>
                <button
                  type="button"
                  aria-expanded={showAdvancedSpacing}
                  aria-controls="passport-spacing-panel"
                  onClick={() => setShowAdvancedSpacing(!showAdvancedSpacing)}
                  className="min-h-[32px] inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-[#3f6212] hover:bg-[#f5f5f7] cursor-pointer"
                >
                  <SlidersHorizontal aria-hidden="true" className="h-3.5 w-3.5" />
                  Spacing
                  <ChevronDown
                    aria-hidden="true"
                    className={`h-3.5 w-3.5 transition ${showAdvancedSpacing ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              <div
                role="group"
                aria-labelledby="passport-marks-label"
                className="grid grid-cols-2 sm:grid-cols-4 gap-1.5"
              >
                {(
                  [
                    { id: "corner", label: "Corners" },
                    { id: "dashed", label: "Dashed box" },
                    { id: "solid", label: "Solid box" },
                    { id: "none", label: "None" },
                  ] as const
                ).map((style) => {
                  const isSelected = guideStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => {
                        setGuideStyle(style.id);
                        clearStatus();
                      }}
                      className={`min-h-[40px] py-2 px-1 rounded-xl text-xs transition cursor-pointer ${
                        isSelected
                          ? "bg-[#eef6e4] text-[#365314] font-bold ring-2 ring-[#4d7c0f]"
                          : "bg-[#f5f5f7] text-zinc-700 font-semibold hover:bg-[#ebeced]"
                      }`}
                    >
                      {style.label}
                    </button>
                  );
                })}
              </div>
              <FieldHint>Thin lines that show you where to cut.</FieldHint>

              {showAdvancedSpacing && (
                <div id="passport-spacing-panel" className="space-y-2 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label
                      htmlFor="passport-gap-mm"
                      className="block rounded-xl bg-[#f5f5f7] p-3"
                    >
                      <span className="flex justify-between text-xs font-semibold text-zinc-800 mb-1">
                        <span>Space between photos</span>
                        <span className="font-mono">{gapMm} mm</span>
                      </span>
                      <input
                        id="passport-gap-mm"
                        type="range"
                        min={0}
                        max={8}
                        step={0.5}
                        value={gapMm}
                        onChange={(e) => {
                          setGapMm(parseFloat(e.target.value));
                          clearStatus();
                        }}
                        className="w-full accent-[#4d7c0f] cursor-pointer"
                      />
                    </label>
                    <label
                      htmlFor="passport-margin-mm"
                      className="block rounded-xl bg-[#f5f5f7] p-3"
                    >
                      <span className="flex justify-between text-xs font-semibold text-zinc-800 mb-1">
                        <span>Edge margin</span>
                        <span className="font-mono">{marginMm} mm</span>
                      </span>
                      <input
                        id="passport-margin-mm"
                        type="range"
                        min={1}
                        max={12}
                        step={0.5}
                        value={marginMm}
                        onChange={(e) => {
                          setMarginMm(parseFloat(e.target.value));
                          clearStatus();
                        }}
                        className="w-full accent-[#4d7c0f] cursor-pointer"
                      />
                    </label>
                  </div>
                  <FieldHint>
                    Edge margin is the blank border around the sheet. Most home
                    printers need at least 3–4 mm.
                  </FieldHint>
                </div>
              )}
            </div>
          </section>

          {/* STEP 4: DOWNLOAD & PRINT */}
          <section
            aria-labelledby="passport-step-4"
            className="pt-6 border-t border-[#ebeced] space-y-3"
          >
            <StepHeader
              id="passport-step-4"
              step={4}
              title="Download & print"
              hint="Prints at exact size when you print at 100%."
            />

            <button
              type="button"
              onClick={() => void handleDownloadPdf()}
              disabled={isExporting || !canExport}
              aria-describedby={disabledReason ? exportHintId : undefined}
              className={`${primaryButtonClass} w-full`}
            >
              <Download aria-hidden="true" className="h-4 w-4 shrink-0" />
              {downloadPdfLabel}
            </button>

            {disabledReason && (
              <FieldHint id={exportHintId} tone={photoFits ? "muted" : "error"}>
                {disabledReason}
              </FieldHint>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handlePrint}
                disabled={!canExport}
                aria-describedby={disabledReason ? exportHintId : undefined}
                className={secondaryButtonClass}
              >
                <Printer aria-hidden="true" className="h-4 w-4 text-[#3f6212]" />
                Print
              </button>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!canExport}
                aria-describedby={disabledReason ? exportHintId : undefined}
                className={secondaryButtonClass}
              >
                {copied ? (
                  <>
                    <CheckCheck aria-hidden="true" className="h-4 w-4 text-[#3f6212]" />
                    <span className="text-[#365314]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy aria-hidden="true" className="h-4 w-4 text-zinc-600" />
                    Copy image
                  </>
                )}
              </button>
            </div>

            <details className="group rounded-xl border border-[#ebeced] px-3 py-2">
              <summary className="flex min-h-[32px] cursor-pointer list-none items-center justify-between gap-2 text-xs font-semibold text-zinc-700 [&::-webkit-details-marker]:hidden">
                Other formats (JPEG, PNG)
                <ChevronDown
                  aria-hidden="true"
                  className="h-4 w-4 text-zinc-500 transition group-open:rotate-180"
                />
              </summary>
              <div className="mt-2 grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadRaster("jpeg")}
                  disabled={isExporting || !canExport}
                  className={`${secondaryButtonClass} justify-start text-left`}
                >
                  <Download aria-hidden="true" className="h-4 w-4 shrink-0" />
                  JPEG (for photo kiosks / print shops)
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadRaster("png")}
                  disabled={isExporting || !canExport}
                  className={`${secondaryButtonClass} justify-start text-left`}
                >
                  <Download aria-hidden="true" className="h-4 w-4 shrink-0" />
                  PNG
                </button>
              </div>
            </details>

            <ToolStatus status={status} />

            <PrintTipsPanel
              paperLabel={currentPaper.shortName}
              open={status?.tone === "success"}
              extraSteps={[
                <>
                  Use matte or glossy photo paper and &lsquo;Best&rsquo; /
                  &lsquo;Photo&rsquo; quality.
                </>,
              ]}
            />
          </section>
        </div>

        {/* RIGHT COLUMN: PREVIEW */}
        <section
          aria-labelledby="passport-preview-title"
          className="order-1 lg:order-2 lg:col-span-6 lg:sticky lg:top-24 rounded-2xl bg-white p-3 sm:p-6 flex flex-col"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="min-w-0">
              <h3
                id="passport-preview-title"
                className="text-sm font-bold tracking-tight text-zinc-950"
              >
                Preview of your sheet
              </h3>
              <p className="text-xs text-zinc-600 truncate">
                {photoFits
                  ? `${photosLabel(activePhotoCount)} · ${photoSizeLabel} · ${currentPaper.shortName}`
                  : `Doesn't fit on ${currentPaper.shortName}`}
              </p>
            </div>
            <button
              type="button"
              onClick={openZoom}
              className={`${secondaryButtonClass} shrink-0 min-h-[40px] px-3`}
            >
              <Maximize2 aria-hidden="true" className="h-4 w-4" />
              Zoom
            </button>
          </div>

          <button
            type="button"
            onClick={openZoom}
            aria-label="Enlarge the preview"
            className="w-full flex items-center justify-center p-2 sm:p-6 min-h-[220px] sm:min-h-[320px] lg:min-h-[420px] overflow-hidden bg-[#f5f5f7] rounded-xl cursor-zoom-in"
          >
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={
                photoFits
                  ? `Preview: ${photosLabel(activePhotoCount, "passport photo")} (${photoWidthMm} by ${photoHeightMm} mm) on ${currentPaper.name}`
                  : `${photoWidthMm} by ${photoHeightMm} mm photos don't fit on ${currentPaper.name}`
              }
              className="max-w-full max-h-[62vh] sm:max-h-[420px] lg:max-h-[400px] xl:max-h-[430px] w-auto h-auto rounded-md bg-white shadow-sm"
            />
          </button>

          <div className="mt-3 space-y-1">
            <FieldHint>
              <strong className="text-zinc-800">Photo guide:</strong>{" "}
              {photoGuide} — check your country&apos;s official rules.
            </FieldHint>
            <FieldHint>
              Prints at exact size ({paperWidthMm} × {paperHeightMm} mm sheet)
              when printed at 100%.
            </FieldHint>
          </div>
        </section>
      </div>

      <MobileActionBar summary={summaryText}>
        <button
          type="button"
          onClick={() => void handleDownloadPdf()}
          disabled={isExporting || !canExport}
          aria-describedby={disabledReason ? exportHintId : undefined}
          className={`${primaryButtonClass} min-h-[44px] px-4 py-2`}
        >
          <Download aria-hidden="true" className="h-4 w-4 shrink-0" />
          {isExporting ? "Creating…" : "Download PDF"}
        </button>
      </MobileActionBar>

      <dialog
        ref={zoomDialogRef}
        aria-labelledby="passport-zoom-title"
        onClose={() => {
          if (zoomUrl) URL.revokeObjectURL(zoomUrl);
          setZoomUrl(null);
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeZoom();
        }}
        className="m-auto w-[min(96vw,1100px)] max-h-[94vh] overflow-hidden rounded-2xl bg-white p-0 backdrop:bg-zinc-950/70"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#ebeced] px-4 py-3">
          <div className="min-w-0">
            <h2
              id="passport-zoom-title"
              className="text-sm font-bold text-zinc-950"
            >
              Preview of your sheet
            </h2>
            <p className="truncate text-xs text-zinc-600">{summaryText}</p>
          </div>
          <button
            type="button"
            onClick={closeZoom}
            autoFocus
            className={`${secondaryButtonClass} shrink-0 min-h-[40px] px-3`}
          >
            <X aria-hidden="true" className="h-4 w-4" />
            Close
          </button>
        </div>
        <div className="flex max-h-[calc(94vh-66px)] justify-center overflow-auto bg-[#f5f5f7] p-3">
          {zoomUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- local blob URL
            <img
              src={zoomUrl}
              alt={`Enlarged preview: ${summaryText}`}
              className="h-auto max-h-[calc(94vh-90px)] max-w-full rounded bg-white object-contain"
            />
          )}
        </div>
      </dialog>
    </div>
  );
}
