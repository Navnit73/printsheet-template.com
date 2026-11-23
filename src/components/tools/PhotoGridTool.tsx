"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Eraser,
  ImagePlus,
  RotateCcw,
  RotateCw,
  Scissors,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import type { PageId } from "@/types/spec";
import {
  createSamplePhotoDataUrl,
  fileToDataUrl,
  getImageNaturalSize,
  getOrientedPaper,
  loadImageElement,
  PAPER_SIZES,
  PRINTER_SAFE_MARGIN_MM,
  renderImageToBoxDataUrl,
  type PaperSizeId,
} from "@/lib/pdf-utils";
import {
  FieldHint,
  PrintTipsPanel,
  ToolStatus,
  UploadDropzone,
  primaryButtonClass,
  secondaryButtonClass,
  type ToolStatusValue,
} from "@/components/tools/ui/ToolUi";
import { FullPageToolShell, type ToolStepDef } from "@/components/tools/ui/FullPageToolShell";
import { PHOTO_GRID_HOW_TO } from "@/components/tools/ui/tool-howto-guides";
import { CropEditor } from "@/components/tools/ui/CropEditor";
import { DownloadPassBadge, useDownloadGate } from "@/components/payment/DownloadPaywallProvider";
import {
  DEFAULT_CROP,
  getSourceRect,
  renderCropToDataUrl,
  type CropState,
} from "@/lib/crop";

interface LayoutPreset {
  id: string;
  label: string;
  paper: PaperSizeId;
  orientation: "portrait" | "landscape";
  slotCount: number;
  duplicateFirst?: boolean;
  captionArea?: boolean;
  computeSlots: (
    printableW: number,
    printableH: number,
    gutter: number
  ) => { x: number; y: number; w: number; h: number }[];
}

function gridSlots(
  cols: number,
  rows: number,
  printableW: number,
  printableH: number,
  gutter: number,
  fixedCell?: { w: number; h: number }
) {
  const slots: { x: number; y: number; w: number; h: number }[] = [];
  if (fixedCell) {
    const totalW = cols * fixedCell.w + (cols - 1) * gutter;
    const totalH = rows * fixedCell.h + (rows - 1) * gutter;
    const startX = Math.max(0, (printableW - totalW) / 2);
    const startY = Math.max(0, (printableH - totalH) / 2);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        slots.push({
          x: startX + c * (fixedCell.w + gutter),
          y: startY + r * (fixedCell.h + gutter),
          w: fixedCell.w,
          h: fixedCell.h,
        });
      }
    }
    return slots;
  }

  const cellW = Math.max(10, (printableW - (cols - 1) * gutter) / cols);
  const cellH = Math.max(10, (printableH - (rows - 1) * gutter) / rows);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      slots.push({
        x: c * (cellW + gutter),
        y: r * (cellH + gutter),
        w: cellW,
        h: cellH,
      });
    }
  }
  return slots;
}

function getPresetsForTool(pageId: PageId): LayoutPreset[] {
  switch (pageId) {
    case "T02":
      return [
        {
          id: "2-stacked",
          label: "2 Stacked (Portrait)",
          paper: "a4",
          orientation: "portrait",
          slotCount: 2,
          computeSlots: (w, h, g) => gridSlots(1, 2, w, h, g),
        },
        {
          id: "2-side",
          label: "2 Side-by-Side (Landscape)",
          paper: "a4",
          orientation: "landscape",
          slotCount: 2,
          computeSlots: (w, h, g) => gridSlots(2, 1, w, h, g),
        },
        {
          id: "2-60-40",
          label: "60 / 40 Split",
          paper: "a4",
          orientation: "portrait",
          slotCount: 2,
          computeSlots: (w, h, g) => {
            const topH = (h - g) * 0.6;
            const botH = (h - g) * 0.4;
            return [
              { x: 0, y: 0, w, h: topH },
              { x: 0, y: topH + g, w, h: botH },
            ];
          },
        },
      ];
    case "T03":
      return [
        {
          id: "4-grid",
          label: "2×2 Equal Grid",
          paper: "a4",
          orientation: "portrait",
          slotCount: 4,
          computeSlots: (w, h, g) => gridSlots(2, 2, w, h, g),
        },
        {
          id: "4-strips",
          label: "4 Stacked Strips",
          paper: "a4",
          orientation: "portrait",
          slotCount: 4,
          computeSlots: (w, h, g) => gridSlots(1, 4, w, h, g),
        },
        {
          id: "4-mixed",
          label: "1 Large + 3 Small",
          paper: "a4",
          orientation: "portrait",
          slotCount: 4,
          computeSlots: (w, h, g) => {
            const heroH = (h - g) * 0.62;
            const rowH = (h - g) * 0.38;
            const smallW = (w - 2 * g) / 3;
            return [
              { x: 0, y: 0, w, h: heroH },
              { x: 0, y: heroH + g, w: smallW, h: rowH },
              { x: smallW + g, y: heroH + g, w: smallW, h: rowH },
              { x: 2 * (smallW + g), y: heroH + g, w: smallW, h: rowH },
            ];
          },
        },
      ];
    case "T04":
      return [
        {
          id: "dup-9",
          label: "Wallet Copies (9 per A4)",
          paper: "a4",
          orientation: "portrait",
          slotCount: 9,
          duplicateFirst: true,
          computeSlots: (w, h, g) => gridSlots(3, 3, w, h, g),
        },
        {
          id: "dup-12",
          label: "Square Badges (12 per A4)",
          paper: "a4",
          orientation: "portrait",
          slotCount: 12,
          duplicateFirst: true,
          computeSlots: (w, h, g) => gridSlots(3, 4, w, h, g),
        },
        {
          id: "dup-4",
          label: "4 Large Copies",
          paper: "a4",
          orientation: "portrait",
          slotCount: 4,
          duplicateFirst: true,
          computeSlots: (w, h, g) => gridSlots(2, 2, w, h, g),
        },
        {
          id: "dup-2",
          label: "2 Half-Page Copies",
          paper: "a4",
          orientation: "portrait",
          slotCount: 2,
          duplicateFirst: true,
          computeSlots: (w, h, g) => gridSlots(1, 2, w, h, g),
        },
      ];
    case "T06":
      return [
        {
          id: "pp-35x45-8",
          label: "35 × 45 mm (8 on A4)",
          paper: "a4",
          orientation: "portrait",
          slotCount: 8,
          duplicateFirst: true,
          computeSlots: (w, h, g) =>
            gridSlots(4, 2, w, h, g, { w: 35, h: 45 }),
        },
        {
          id: "pp-35x45-16",
          label: "35 × 45 mm (16 on A4)",
          paper: "a4",
          orientation: "portrait",
          slotCount: 16,
          duplicateFirst: true,
          computeSlots: (w, h, g) =>
            gridSlots(4, 4, w, h, g, { w: 35, h: 45 }),
        },
        {
          id: "pp-2x2-6",
          label: "2 × 2 in / 51 × 51 mm (6 on A4)",
          paper: "a4",
          orientation: "portrait",
          slotCount: 6,
          duplicateFirst: true,
          computeSlots: (w, h, g) =>
            gridSlots(3, 2, w, h, g, { w: 50.8, h: 50.8 }),
        },
      ];
    case "T07":
      return [
        {
          id: "pp4x6-2x2",
          label: "2 × 2 in (2 on 4×6)",
          paper: "4x6",
          orientation: "landscape",
          slotCount: 2,
          duplicateFirst: true,
          computeSlots: (w, h, g) =>
            gridSlots(2, 1, w, h, g, { w: 50.8, h: 50.8 }),
        },
        {
          id: "pp4x6-35x45",
          label: "35 × 45 mm (4 on 4×6)",
          paper: "4x6",
          orientation: "landscape",
          slotCount: 4,
          duplicateFirst: true,
          computeSlots: (w, h, g) =>
            gridSlots(2, 2, w, h, g, { w: 35, h: 45 }),
        },
        {
          id: "pp4x6-25x35",
          label: "25 × 35 mm (8 on 4×6)",
          paper: "4x6",
          orientation: "landscape",
          slotCount: 8,
          duplicateFirst: true,
          computeSlots: (w, h, g) =>
            gridSlots(4, 2, w, h, g, { w: 25, h: 35 }),
        },
      ];
    case "T08":
      return [
        {
          id: "4x6-single",
          label: "Single Full 4×6",
          paper: "4x6",
          orientation: "landscape",
          slotCount: 1,
          computeSlots: (w, h, g) => gridSlots(1, 1, w, h, g),
        },
        {
          id: "4x6-2up",
          label: "2-Up Grid on 4×6",
          paper: "4x6",
          orientation: "landscape",
          slotCount: 2,
          computeSlots: (w, h, g) => gridSlots(2, 1, w, h, g),
        },
        {
          id: "4x6-4up",
          label: "4-Up Grid on 4×6",
          paper: "4x6",
          orientation: "landscape",
          slotCount: 4,
          computeSlots: (w, h, g) => gridSlots(2, 2, w, h, g),
        },
        {
          id: "4x6-card",
          label: "Photo + Caption Card",
          paper: "4x6",
          orientation: "portrait",
          slotCount: 1,
          captionArea: true,
          computeSlots: (w, h) => [{ x: 0, y: 0, w, h: h * 0.78 }],
        },
      ];
    case "T09":
      return [
        {
          id: "4x6-col-4",
          label: "Classic 4-Photo Collage",
          paper: "4x6",
          orientation: "landscape",
          slotCount: 4,
          computeSlots: (w, h, g) => gridSlots(2, 2, w, h, g),
        },
        {
          id: "4x6-booth",
          label: "Photo-Booth Strip (2×3)",
          paper: "4x6",
          orientation: "portrait",
          slotCount: 6,
          captionArea: true,
          computeSlots: (w, h, g) => gridSlots(2, 3, w, h * 0.85, g),
        },
        {
          id: "4x6-hero",
          label: "1 Hero + 2 Small",
          paper: "4x6",
          orientation: "landscape",
          slotCount: 3,
          computeSlots: (w, h, g) => {
            const leftW = (w - g) * 0.6;
            const rightW = (w - g) * 0.4;
            const halfH = (h - g) / 2;
            return [
              { x: 0, y: 0, w: leftW, h },
              { x: leftW + g, y: 0, w: rightW, h: halfH },
              { x: leftW + g, y: halfH + g, w: rightW, h: halfH },
            ];
          },
        },
      ];
    case "T10":
      return [
        {
          id: "a4-col-6",
          label: "A4 Grid (2×3)",
          paper: "a4",
          orientation: "portrait",
          slotCount: 6,
          computeSlots: (w, h, g) => gridSlots(2, 3, w, h, g),
        },
        {
          id: "a4-col-free",
          label: "Mixed Frame Poster (5)",
          paper: "a4",
          orientation: "portrait",
          slotCount: 5,
          computeSlots: (w, h, g) => {
            const topH = (h - 2 * g) * 0.45;
            const midH = (h - 2 * g) * 0.275;
            const halfW = (w - g) / 2;
            return [
              { x: 0, y: 0, w, h: topH },
              { x: 0, y: topH + g, w: halfW, h: midH },
              { x: halfW + g, y: topH + g, w: halfW, h: midH },
              { x: 0, y: topH + midH + 2 * g, w: halfW, h: midH },
              { x: halfW + g, y: topH + midH + 2 * g, w: halfW, h: midH },
            ];
          },
        },
        {
          id: "a4-col-title",
          label: "Photo + Title Collage",
          paper: "a4",
          orientation: "portrait",
          slotCount: 4,
          captionArea: true,
          computeSlots: (w, h, g) => gridSlots(2, 2, w, h * 0.85, g),
        },
      ];
    case "T01":
    default:
      return [
        {
          id: "grid-6",
          label: "6 Photos (2×3)",
          paper: "a4",
          orientation: "portrait",
          slotCount: 6,
          computeSlots: (w, h, g) => gridSlots(2, 3, w, h, g),
        },
        {
          id: "grid-8",
          label: "8 Photos (2×4)",
          paper: "a4",
          orientation: "portrait",
          slotCount: 8,
          computeSlots: (w, h, g) => gridSlots(2, 4, w, h, g),
        },
        {
          id: "grid-9",
          label: "9 Photos (3×3)",
          paper: "a4",
          orientation: "portrait",
          slotCount: 9,
          computeSlots: (w, h, g) => gridSlots(3, 3, w, h, g),
        },
        {
          id: "grid-10",
          label: "10 Photos (2×5)",
          paper: "a4",
          orientation: "portrait",
          slotCount: 10,
          computeSlots: (w, h, g) => gridSlots(2, 5, w, h, g),
        },
        {
          id: "grid-3",
          label: "3 Photos (1×3)",
          paper: "a4",
          orientation: "landscape",
          slotCount: 3,
          computeSlots: (w, h, g) => gridSlots(3, 1, w, h, g),
        },
        {
          id: "mixed-hero",
          label: "Mixed Hero + 4 Small",
          paper: "a4",
          orientation: "portrait",
          slotCount: 5,
          computeSlots: (w, h, g) => {
            const topH = (h - g) * 0.58;
            const botH = (h - g) * 0.42;
            const halfW = (w - g) / 2;
            const quarterH = (botH - g) / 2;
            return [
              { x: 0, y: 0, w, h: topH },
              { x: 0, y: topH + g, w: halfW, h: quarterH },
              { x: halfW + g, y: topH + g, w: halfW, h: quarterH },
              { x: 0, y: topH + g + quarterH + g, w: halfW, h: quarterH },
              { x: halfW + g, y: topH + g + quarterH + g, w: halfW, h: quarterH },
            ];
          },
        },
      ];
  }
}



interface Photo {
  id: string;
  src: string;
  /** Natural pixel size — needed so the preview uses the same crop maths as the PDF. */
  w: number;
  h: number;
}

/** Explicit per-slot choice: a photo id, or null when the person cleared the slot. */
type SlotChoice = string | null;

interface SlotPhoto {
  /** Photo for the slot, or null when the slot is empty. */
  photo: Photo | null;
  /** Index into the uploaded photo list (-1 when empty). */
  photoIndex: number;
  /** True when this slot re-uses a photo that already appears in an earlier slot. */
  repeat: boolean;
  /** True when the person picked (or cleared) this slot themselves. */
  explicit: boolean;
}

/**
 * Single source of truth for which photo goes in which slot — used by BOTH the
 * live preview and the PDF export so they can never disagree.
 * - duplicateFirst presets: every slot shows photo 1 (copies are the point).
 * - an explicit per-slot choice (photo id or "cleared") always wins.
 * - otherwise: photos fill slots in order and repeat to fill remaining slots;
 *   photos beyond the slot count are not used.
 */
function assignPhotosToSlots(
  photos: Photo[],
  slotCount: number,
  duplicateFirst: boolean | undefined,
  choices: Record<number, SlotChoice>
): SlotPhoto[] {
  const seen = new Set<string>();
  return Array.from({ length: slotCount }, (_, i) => {
    if (photos.length === 0) return { photo: null, photoIndex: -1, repeat: false, explicit: false };
    if (duplicateFirst) return { photo: photos[0], photoIndex: 0, repeat: false, explicit: false };
    let photoIndex = i % photos.length;
    let explicit = false;
    if (Object.prototype.hasOwnProperty.call(choices, i)) {
      const choice = choices[i];
      if (choice === null) return { photo: null, photoIndex: -1, repeat: false, explicit: true };
      const found = photos.findIndex((p) => p.id === choice);
      // A choice pointing at a removed photo falls back to auto-fill.
      if (found >= 0) {
        photoIndex = found;
        explicit = true;
      }
    }
    const photo = photos[photoIndex];
    const repeat = seen.has(photo.id);
    seen.add(photo.id);
    return { photo, photoIndex, repeat, explicit };
  });
}

/**
 * Positions an <img> inside its slot so it shows exactly the source rectangle
 * getSourceRect() picks — the same rectangle renderCropToDataUrl() prints.
 */
function cropImageStyle(photo: Photo, aspect: number, crop: CropState): React.CSSProperties {
  const r = getSourceRect(photo.w, photo.h, aspect, crop);
  return {
    position: "absolute",
    maxWidth: "none",
    width: `${(photo.w / r.sw) * 100}%`,
    height: `${(photo.h / r.sh) * 100}%`,
    left: `${(-r.sx / r.sw) * 100}%`,
    top: `${(-r.sy / r.sh) * 100}%`,
  };
}

/** Crop marks like drawCropMarksPdf, but every segment is clipped to the page so nothing is drawn off-sheet. */
function drawCropMarksOnPage(
  doc: import("jspdf").jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  pageW: number,
  pageH: number,
  markLen = 2.5,
  offset = 0.8
) {
  doc.setDrawColor(113, 113, 122);
  doc.setLineWidth(0.2);
  const clampX = (v: number) => Math.min(pageW, Math.max(0, v));
  const clampY = (v: number) => Math.min(pageH, Math.max(0, v));
  const hLine = (x1: number, x2: number, yy: number) => {
    if (yy < 0 || yy > pageH) return;
    const a = clampX(x1);
    const b = clampX(x2);
    if (Math.abs(b - a) >= 0.3) doc.line(a, yy, b, yy);
  };
  const vLine = (xx: number, y1: number, y2: number) => {
    if (xx < 0 || xx > pageW) return;
    const a = clampY(y1);
    const b = clampY(y2);
    if (Math.abs(b - a) >= 0.3) doc.line(xx, a, xx, b);
  };
  hLine(x - offset - markLen, x - offset, y);
  vLine(x, y - offset - markLen, y - offset);
  hLine(x + w + offset, x + w + offset + markLen, y);
  vLine(x + w, y - offset - markLen, y - offset);
  hLine(x - offset - markLen, x - offset, y + h);
  vLine(x, y + h + offset, y + h + offset + markLen);
  hLine(x + w + offset, x + w + offset + markLen, y + h);
  vLine(x + w, y + h + offset, y + h + offset + markLen);
}


/** "A4", "US Letter", "4×6 in" — short paper name for plain-language text. */
function shortPaperLabel(id: PaperSizeId) {
  return PAPER_SIZES[id].label.split(" (")[0].split(" / ")[0];
}

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp";

type StatusArea = "upload" | "download";

export function PhotoGridTool({
  pageId,
  open = true,
  onClose = () => {},
  headerCenter,
  autoSampleSignal = 0,
}: {
  pageId: PageId;
  open?: boolean;
  onClose?: () => void;
  headerCenter?: React.ReactNode;
  autoSampleSignal?: number;
}) {
  const { requirePayment } = useDownloadGate();
  const [activeStep, setActiveStep] = useState(0);
  const presets = useMemo(() => getPresetsForTool(pageId), [pageId]);
  const [selectedPresetId, setSelectedPresetId] = useState(presets[0].id);
  const preset =
    presets.find((p) => p.id === selectedPresetId) ?? presets[0];

  const [paper, setPaper] = useState<PaperSizeId>(preset.paper);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    preset.orientation
  );
  const [marginMm, setMarginMm] = useState(
    preset.paper === "4x6" ? PRINTER_SAFE_MARGIN_MM : 10
  );
  const [gutterMm, setGutterMm] = useState(
    preset.paper === "4x6" ? 3 : 5
  );
  const [fitMode, setFitMode] = useState<"cover" | "contain">("cover");
  const [showCutGuides, setShowCutGuides] = useState(true);
  const [captionText, setCaptionText] = useState("Summer Memory Sheet");
  const [photos, setPhotos] = useState<Photo[]>([]);
  /** slot index → explicit photo id (or null = cleared). Overrides auto-fill. */
  const [slotChoices, setSlotChoices] = useState<Record<number, SlotChoice>>({});
  /** slot index → crop for the photo that was in it when the crop was set. */
  const [slotCrops, setSlotCrops] = useState<Record<number, { photoId: string; crop: CropState }>>({});
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState<{ area: StatusArea; value: ToolStatusValue } | null>(null);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const slotFileInputRef = useRef<HTMLInputElement>(null);
  const slotPanelRef = useRef<HTMLDivElement>(null);
  const slotButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const nextPhotoId = useRef(1);

  // Any settings change makes the last "downloaded" / error message stale.
  const clearStatus = () => setStatus(null);

  const orientedPaper = getOrientedPaper(paper, orientation);
  const paperShort = shortPaperLabel(paper);
  const printableW = Math.max(20, orientedPaper.widthMm - marginMm * 2);
  const printableH = Math.max(20, orientedPaper.heightMm - marginMm * 2);
  const computedSlots = useMemo(
    () => preset.computeSlots(printableW, printableH, gutterMm),
    [preset, printableW, printableH, gutterMm]
  );
  const slotPhotos = useMemo(
    () => assignPhotosToSlots(photos, computedSlots.length, preset.duplicateFirst, slotChoices),
    [photos, computedSlots.length, preset.duplicateFirst, slotChoices]
  );
  const slotCount = computedSlots.length;
  const usedPhotoIds = new Set(
    slotPhotos.flatMap((s) => (s.photo ? [s.photo.id] : []))
  );
  const unusedPhotoCount = preset.duplicateFirst
    ? 0
    : photos.filter((p) => !usedPhotoIds.has(p.id)).length;
  const hasRepeats = slotPhotos.some((s) => s.repeat);
  const hasPhotos = photos.length > 0;
  const photosWord = (n: number) => `${n} photo${n === 1 ? "" : "s"}`;
  const perPageText = `${photosWord(slotCount)} per ${paperShort} page`;
  const downloadLabel = isExporting
    ? "Making your PDF…"
    : `Download PDF · ${photosWord(slotCount)}`;
  const disabledReason = hasPhotos
    ? null
    : preset.duplicateFirst
      ? "Add a photo first (or load a sample) to download."
      : "Add at least one photo first (or load samples) to download.";

  /** Copies share one crop on duplicate-photo sheets; otherwise each slot has its own. */
  const cropKey = (slotIdx: number) => (preset.duplicateFirst ? 0 : slotIdx);
  function cropFor(slotIdx: number, photoId: string): CropState {
    const saved = slotCrops[cropKey(slotIdx)];
    return saved && saved.photoId === photoId ? saved.crop : DEFAULT_CROP;
  }
  function setCropFor(slotIdx: number, photoId: string, crop: CropState) {
    setSlotCrops((prev) => ({ ...prev, [cropKey(slotIdx)]: { photoId, crop } }));
    clearStatus();
  }

  /** Keep only per-slot settings whose slot index still exists. */
  function pruneToSlotCount<T>(rec: Record<number, T>, count: number) {
    const next: Record<number, T> = {};
    for (const [k, v] of Object.entries(rec)) {
      if (Number(k) < count) next[Number(k)] = v;
    }
    return next;
  }

  function selectPreset(p: LayoutPreset) {
    setSelectedPresetId(p.id);
    setPaper(p.paper);
    setOrientation(p.orientation);
    setMarginMm(p.paper === "4x6" ? PRINTER_SAFE_MARGIN_MM : 10);
    setGutterMm(p.paper === "4x6" ? 3 : 5);
    setSlotChoices((prev) => (p.duplicateFirst ? {} : pruneToSlotCount(prev, p.slotCount)));
    // Slot shapes change with the layout, so crops start fresh.
    setSlotCrops({});
    setSelectedSlot(null);
    clearStatus();
  }

  async function loadPhoto(file: File): Promise<Photo> {
    const src = await fileToDataUrl(file);
    // Make sure the browser can actually decode it (HEIC etc. can't).
    const img = await loadImageElement(src);
    return {
      id: `p${nextPhotoId.current++}`,
      src,
      w: img.naturalWidth || img.width,
      h: img.naturalHeight || img.height,
    };
  }

  async function addFiles(files: File[]) {
    if (files.length === 0) return;
    const loaded: Photo[] = [];
    const bad: string[] = [];
    for (const file of files) {
      try {
        loaded.push(await loadPhoto(file));
      } catch {
        bad.push(file.name || "a file");
      }
    }
    if (loaded.length > 0) {
      setPhotos((prev) =>
        preset.duplicateFirst ? [loaded[0]] : [...prev, ...loaded]
      );
    }
    if (bad.length > 0) {
      setStatus({
        area: "upload",
        value: {
          tone: "error",
          text: `Couldn't read ${bad.join(", ")} — use JPG, PNG or WebP. iPhone HEIC photos: share as JPG first.${
            loaded.length > 0 ? ` Added ${photosWord(loaded.length)}.` : ""
          }`,
        },
      });
    } else {
      setStatus({
        area: "upload",
        value: {
          tone: "success",
          text: preset.duplicateFirst
            ? "Photo added — it's copied into every spot on the sheet."
            : `${photosWord(loaded.length)} added.`,
        },
      });
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    void addFiles(files);
  }

  /** "Replace photo" for the selected slot. */
  async function handleSlotFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    const slotIdx = selectedSlot;
    if (!file || slotIdx === null) return;
    try {
      const photo = await loadPhoto(file);
      if (preset.duplicateFirst) {
        setPhotos([photo]);
      } else {
        setPhotos((prev) => [...prev, photo]);
        setSlotChoices((prev) => ({ ...prev, [slotIdx]: photo.id }));
      }
      setStatus({
        area: "upload",
        value: {
          tone: "success",
          text: preset.duplicateFirst
            ? "Photo replaced in every spot."
            : `Photo added to spot ${slotIdx + 1}.`,
        },
      });
    } catch {
      setStatus({
        area: "upload",
        value: {
          tone: "error",
          text: `Couldn't read ${file.name || "that file"} — use JPG, PNG or WebP. iPhone HEIC photos: share as JPG first.`,
        },
      });
    }
  }

  async function handleLoadSamples() {
    const count = preset.duplicateFirst ? 1 : preset.slotCount;
    const samples = await Promise.all(
      Array.from({ length: count }, async (_, idx) => {
        const src = createSamplePhotoDataUrl(idx, `Photo ${idx + 1}`);
        const size = await getImageNaturalSize(src).catch(() => ({ width: 900, height: 675 }));
        return { id: `p${nextPhotoId.current++}`, src, w: size.width, h: size.height };
      })
    );
    setPhotos(samples);
    setSlotChoices({});
    setSlotCrops({});
    setStatus({
      area: "upload",
      value: {
        tone: "info",
        text: `Showing ${count === 1 ? "a sample photo" : `${count} sample photos`} — replace with your own any time.`,
      },
    });
  }

  function rotateImageList() {
    if (photos.length < 2) return;
    setPhotos((prev) => [...prev.slice(1), prev[0]]);
    clearStatus();
  }

  function movePhoto(from: number, to: number) {
    if (from === to || to < 0 || to >= photos.length) return;
    setPhotos((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    clearStatus();
  }

  function removeImage(idx: number) {
    const removed = photos[idx];
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    if (removed) {
      // Slots that pointed at this photo go back to automatic.
      setSlotChoices((prev) => {
        const next = { ...prev };
        for (const [k, v] of Object.entries(prev)) if (v === removed.id) delete next[Number(k)];
        return next;
      });
    }
    if (photos.length <= 1) setSelectedSlot(null);
    clearStatus();
  }

  function removeAll() {
    setPhotos([]);
    setSlotChoices({});
    setSlotCrops({});
    setSelectedSlot(null);
    clearStatus();
  }

  function chooseForSlot(slotIdx: number, choice: SlotChoice | undefined) {
    setSlotChoices((prev) => {
      const next = { ...prev };
      if (choice === undefined) delete next[slotIdx];
      else next[slotIdx] = choice;
      return next;
    });
    clearStatus();
  }

  function openSlot(idx: number) {
    setSelectedSlot((cur) => (cur === idx ? null : idx));
  }

  function closeSlotPanel() {
    const idx = selectedSlot;
    setSelectedSlot(null);
    if (idx !== null) slotButtonRefs.current[idx]?.focus();
  }

  // Move focus into the slot panel when it opens (keyboard + screen readers).
  useEffect(() => {
    if (selectedSlot === null) return;
    const panel = slotPanelRef.current;
    if (!panel) return;
    panel.focus({ preventScroll: true });
    panel.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedSlot]);

  async function executeDownloadPdf() {
    if (!hasPhotos) return;
    setIsExporting(true);
    setStatus(null);
    try {
      const { jsPDF } = await import("jspdf");
      const pageW = orientedPaper.widthMm;
      const pageH = orientedPaper.heightMm;
      const doc = new jsPDF({
        orientation,
        unit: "mm",
        format: [pageW, pageH],
      });

      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageW, pageH, "F");

      // Same photo + same slot shape + same crop → render once.
      const rendered = new Map<string, { dataUrl: string; format: "JPEG" | "PNG" }>();
      const decoded = new Map<string, HTMLImageElement>();

      for (let i = 0; i < computedSlots.length; i++) {
        const slot = computedSlots[i];
        const x = marginMm + slot.x;
        const y = marginMm + slot.y;
        const { photo } = slotPhotos[i];

        if (photo) {
          const aspect = slot.w / Math.max(1, slot.h);
          if (fitMode === "cover") {
            const crop = cropFor(i, photo.id);
            // ~300 DPI, capped so big slots stay light; same rect maths as the preview.
            const pxPerMm = Math.min(300 / 25.4, 2400 / Math.max(slot.w, slot.h));
            const outW = Math.round(slot.w * pxPerMm);
            const outH = Math.round(slot.h * pxPerMm);
            const key = `${photo.id}|${outW}x${outH}|${crop.zoom}|${crop.centerX}|${crop.centerY}`;
            let img = rendered.get(key);
            if (!img) {
              let el = decoded.get(photo.id);
              if (!el) {
                el = await loadImageElement(photo.src);
                decoded.set(photo.id, el);
              }
              img = { dataUrl: renderCropToDataUrl(el, outW, outH, crop), format: "JPEG" };
              rendered.set(key, img);
            }
            doc.addImage(img.dataUrl, img.format, x, y, slot.w, slot.h);
          } else {
            const key = `${photo.id}|contain|${aspect.toFixed(4)}`;
            let img = rendered.get(key);
            if (!img) {
              img = await renderImageToBoxDataUrl(photo.src, aspect, "contain");
              rendered.set(key, img);
            }
            doc.addImage(img.dataUrl, img.format, x, y, slot.w, slot.h);
          }
        }
        // Empty (cleared) spots print blank; the cut marks still show where they are.

        if (showCutGuides) {
          drawCropMarksOnPage(doc, x, y, slot.w, slot.h, pageW, pageH);
        }
      }

      if (preset.captionArea && captionText.trim()) {
        doc.setTextColor(24, 24, 27);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(paper === "4x6" ? 12 : 16);
        doc.text(
          captionText.trim(),
          pageW / 2,
          pageH - marginMm - 4,
          { align: "center" }
        );
      }

      doc.save(`print-sheet-${pageId.toLowerCase()}-${paper}.pdf`);
      setHasDownloaded(true);
      setStatus({
        area: "download",
        value: {
          tone: "success",
          text: (
            <>
              PDF downloaded — {perPageText}. Print it at{" "}
              <strong>100% / Actual size</strong> (steps below).
            </>
          ),
        },
      });
    } catch (err) {
      setStatus({
        area: "download",
        value: {
          tone: "error",
          text: err instanceof Error ? err.message : "Could not generate PDF.",
        },
      });
    } finally {
      setIsExporting(false);
    }
  }

  function handleDownloadPdf() {
    if (!hasPhotos) return;
    requirePayment({
      itemTitle: "Photo Print Sheet PDF",
      itemSummary: `${perPageText} · ${paperShort}`,
      onApproved: executeDownloadPdf,
    });
  }

  const fitOptions: { id: "cover" | "contain"; title: string; hint: string }[] = [
    { id: "cover", title: "Fill the slot", hint: "trims edges" },
    { id: "contain", title: "Show whole photo", hint: "adds white space" },
  ];

  const sel =
    selectedSlot !== null && selectedSlot < slotCount ? selectedSlot : null;
  const selSlot = sel !== null ? computedSlots[sel] : null;
  const selPhoto = sel !== null ? slotPhotos[sel] : null;

  const prevSampleSignalRef = useRef(0);
  useEffect(() => {
    if (autoSampleSignal > prevSampleSignalRef.current) {
      prevSampleSignalRef.current = autoSampleSignal;
      void handleLoadSamples();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSampleSignal]);

  const steps: ToolStepDef[] = [
    {
      id: "photos",
      number: 1,
      label: "Photos",
      title: preset.duplicateFirst ? "Add your photo" : "Add your photos",
      hint: preset.duplicateFirst
        ? "Pick one photo — it's copied into every spot on the sheet."
        : "Pick the photos you want to print. You can choose several at once.",
      badge: hasPhotos ? (
        <span className="rounded-full bg-[#eef6e4] px-2.5 py-0.5 text-[11px] font-bold text-[#365314]">
          {photosWord(photos.length)}
        </span>
      ) : undefined,
      content: (
        <div className="space-y-4">
          {!hasPhotos ? (
            <UploadDropzone
              onFiles={(files) => void addFiles(files)}
              accept={ACCEPTED_TYPES}
              multiple={!preset.duplicateFirst}
              title={preset.duplicateFirst ? "Add your photo" : "Add your photos"}
              buttonLabel={preset.duplicateFirst ? "Choose photo" : "Choose photos"}
              secondaryAction={
                <button
                  type="button"
                  onClick={() => void handleLoadSamples()}
                  className={secondaryButtonClass}
                >
                  <Sparkles aria-hidden="true" className="h-4 w-4 text-[#3f6212]" />
                  {preset.duplicateFirst ? "Load sample" : "Load samples"}
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              <ul
                aria-label="Your photos (in sheet order)"
                className="flex flex-wrap gap-2"
                data-testid="pg-photo-strip"
              >
                {photos.map((p, idx) => {
                  const canReorder = !preset.duplicateFirst && photos.length > 1;
                  const unused = !preset.duplicateFirst && !usedPhotoIds.has(p.id);
                  return (
                    <li
                      key={p.id}
                      draggable={canReorder}
                      onDragStart={(e) => {
                        setDragIndex(idx);
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", String(idx));
                      }}
                      onDragOver={(e) => {
                        if (dragIndex === null) return;
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        if (dragOverIndex !== idx) setDragOverIndex(idx);
                      }}
                      onDragLeave={() => {
                        if (dragOverIndex === idx) setDragOverIndex(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (dragIndex !== null) movePhoto(dragIndex, idx);
                        setDragIndex(null);
                        setDragOverIndex(null);
                      }}
                      onDragEnd={() => {
                        setDragIndex(null);
                        setDragOverIndex(null);
                      }}
                      className={`relative h-16 w-16 overflow-hidden rounded-xl bg-[#f5f5f7] ${
                        canReorder ? "cursor-grab active:cursor-grabbing" : ""
                      } ${unused ? "opacity-40" : ""} ${
                        dragIndex === idx ? "opacity-50" : ""
                      } ${
                        dragOverIndex === idx && dragIndex !== idx
                          ? "ring-2 ring-[#4d7c0f] ring-offset-1"
                          : ""
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.src}
                        alt={`Uploaded photo ${idx + 1}${unused ? " (not on the sheet)" : ""}`}
                        draggable={false}
                        className="h-full w-full object-cover pointer-events-none"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute top-0.5 left-0.5 rounded bg-zinc-950/75 px-1 text-[9px] font-bold text-white"
                      >
                        {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        aria-label={`Remove photo ${idx + 1}`}
                        className="absolute top-0.5 right-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950/75 text-white hover:bg-zinc-950 cursor-pointer"
                      >
                        <X aria-hidden="true" className="h-3.5 w-3.5" />
                      </button>
                      {canReorder && (
                        <div className="absolute bottom-0.5 inset-x-0.5 flex justify-between">
                          <button
                            type="button"
                            onClick={() => movePhoto(idx, idx - 1)}
                            disabled={idx === 0}
                            aria-label={`Move photo ${idx + 1} earlier`}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-zinc-900 hover:bg-white cursor-pointer disabled:invisible"
                          >
                            <ChevronLeft aria-hidden="true" className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => movePhoto(idx, idx + 1)}
                            disabled={idx === photos.length - 1}
                            aria-label={`Move photo ${idx + 1} later`}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-zinc-900 hover:bg-white cursor-pointer disabled:invisible"
                          >
                            <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
              {!preset.duplicateFirst && photos.length > 1 && (
                <FieldHint>
                  Drag photos (or use the arrows) to change the order they fill the sheet. Tap a spot in the preview to pick its photo or crop it.
                </FieldHint>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={secondaryButtonClass}
                >
                  <ImagePlus aria-hidden="true" className="h-4 w-4 text-[#3f6212]" />
                  {preset.duplicateFirst ? "Change photo" : "Add more"}
                </button>
                {photos.length > 1 && !preset.duplicateFirst && (
                  <button
                    type="button"
                    onClick={rotateImageList}
                    aria-label="Shuffle photo order (move first photo to the end)"
                    className={secondaryButtonClass}
                  >
                    <RotateCw aria-hidden="true" className="h-4 w-4" />
                    Shuffle order
                  </button>
                )}
                <button
                  type="button"
                  onClick={removeAll}
                  className={secondaryButtonClass}
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                  Remove all
                </button>
              </div>
              {unusedPhotoCount > 0 && (
                <FieldHint tone="warning">
                  This layout holds {photosWord(slotCount)}, so {photosWord(unusedPhotoCount)} (faded) won&apos;t be printed. Remove some (×), tap a spot to swap one in, or pick a bigger layout in step 2.
                </FieldHint>
              )}
              {!preset.duplicateFirst && hasRepeats && (
                <FieldHint>
                  {photosWord(photos.length)} for {slotCount} spots — your photos repeat to fill the sheet (marked &ldquo;copy&rdquo; in the preview). Add more to fill every spot.
                </FieldHint>
              )}
            </div>
          )}
          {status?.area === "upload" && <ToolStatus status={status.value} />}
        </div>
      ),
    },
    {
      id: "layout",
      number: 2,
      label: "Layout",
      title: "Choose a layout",
      hint: "How many photos go on one page, and how they're arranged.",
      badge: (
        <span className="rounded-full bg-[#eef6e4] px-2.5 py-0.5 text-[11px] font-bold text-[#365314]">
          {photosWord(slotCount)}
        </span>
      ),
      content: (
        <div className="space-y-4">
          <div
            role="group"
            aria-label="Layout presets"
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
          >
            {presets.map((p) => {
              const active = p.id === preset.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => selectPreset(p)}
                  className={`min-h-[44px] rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition cursor-pointer ${
                    active
                      ? "bg-[#4d7c0f] text-white"
                      : "bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced] hover:text-zinc-950"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <div className="rounded-xl bg-[#eef6e4] px-3.5 py-2.5 text-xs font-semibold text-[#365314]">
            {perPageText}
          </div>
        </div>
      ),
    },
    {
      id: "paper",
      number: 3,
      label: "Paper",
      title: "Paper & spacing",
      hint: "Match the paper in your printer. The defaults work for most people.",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="photo-paper-size"
                className="block text-xs font-semibold text-zinc-700 mb-1"
              >
                Paper size
              </label>
              <select
                id="photo-paper-size"
                value={paper}
                onChange={(e) => {
                  setPaper(e.target.value as PaperSizeId);
                  clearStatus();
                }}
                className="w-full min-h-[40px] rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs text-zinc-900"
              >
                {Object.values(PAPER_SIZES).map((ps) => (
                  <option key={ps.id} value={ps.id}>
                    {ps.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="photo-orientation"
                className="block text-xs font-semibold text-zinc-700 mb-1"
              >
                Page direction
              </label>
              <select
                id="photo-orientation"
                value={orientation}
                onChange={(e) => {
                  setOrientation(e.target.value as "portrait" | "landscape");
                  clearStatus();
                }}
                className="w-full min-h-[40px] rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs text-zinc-900"
              >
                <option value="portrait">Portrait (tall)</option>
                <option value="landscape">Landscape (wide)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="rounded-xl bg-[#f5f5f7] p-3">
              <label
                htmlFor="photo-margin-mm"
                className="block text-xs font-semibold text-zinc-700 mb-1"
              >
                Edge margin: {marginMm} mm
              </label>
              <input
                id="photo-margin-mm"
                type="range"
                min={PRINTER_SAFE_MARGIN_MM}
                max={20}
                value={marginMm}
                aria-describedby="photo-margin-hint"
                onChange={(e) => {
                  setMarginMm(Number(e.target.value));
                  clearStatus();
                }}
                className="w-full accent-[#4d7c0f]"
              />
              <FieldHint id="photo-margin-hint">
                Blank border round the page — printers can&apos;t print right to the edge.
              </FieldHint>
            </div>
            <div className="rounded-xl bg-[#f5f5f7] p-3">
              <label
                htmlFor="photo-spacing-mm"
                className="block text-xs font-semibold text-zinc-700 mb-1"
              >
                Gap between photos: {gutterMm} mm
              </label>
              <input
                id="photo-spacing-mm"
                type="range"
                min={0}
                max={15}
                value={gutterMm}
                aria-describedby="photo-spacing-hint"
                onChange={(e) => {
                  setGutterMm(Number(e.target.value));
                  clearStatus();
                }}
                className="w-full accent-[#4d7c0f]"
              />
              <FieldHint id="photo-spacing-hint">
                Room to cut between photos.
              </FieldHint>
            </div>
          </div>

          <div>
            <p
              id="photo-fit-label"
              className="text-xs font-semibold text-zinc-700 mb-1.5"
            >
              How photos fit their spot
            </p>
            <div
              role="radiogroup"
              aria-labelledby="photo-fit-label"
              aria-describedby="photo-fit-hint"
              className="grid grid-cols-2 gap-1.5"
            >
              {fitOptions.map((opt) => {
                const active = fitMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      setFitMode(opt.id);
                      clearStatus();
                    }}
                    className={`min-h-[44px] rounded-xl px-3 py-2 text-left text-xs transition cursor-pointer ring-1 ${
                      active
                        ? "bg-[#eef6e4] ring-[#4d7c0f] text-zinc-950"
                        : "bg-[#f5f5f7] ring-transparent text-zinc-700 hover:bg-[#ebeced]"
                    }`}
                  >
                    <span className="block font-semibold">{opt.title}</span>
                    <span className="block text-zinc-600">({opt.hint})</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-1.5">
              <FieldHint id="photo-fit-hint">
                {fitMode === "cover"
                  ? "Photos fill their spot edge to edge; a little may be trimmed off the sides. Tap a photo in the preview to choose what's kept."
                  : "Nothing is trimmed; you may see white bars beside or above the photo."}
              </FieldHint>
            </div>
          </div>

          <label className="min-h-[36px] flex items-start gap-2 text-xs text-zinc-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showCutGuides}
              onChange={(e) => {
                setShowCutGuides(e.target.checked);
                clearStatus();
              }}
              className="mt-0.5 h-4 w-4 rounded accent-[#4d7c0f]"
            />
            <span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-800">
                <Scissors aria-hidden="true" className="h-3.5 w-3.5 text-zinc-600" />
                Print cut marks
              </span>
              <span className="block text-zinc-600">
                Small lines at each corner showing where to cut.
              </span>
            </span>
          </label>

          {preset.captionArea && (
            <div>
              <label
                htmlFor="photo-caption-text"
                className="block text-xs font-semibold text-zinc-700 mb-1"
              >
                Caption at the bottom (optional)
              </label>
              <input
                id="photo-caption-text"
                type="text"
                value={captionText}
                onChange={(e) => {
                  setCaptionText(e.target.value);
                  clearStatus();
                }}
                className="w-full min-h-[40px] rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs text-zinc-900"
                placeholder="Add caption text..."
              />
            </div>
          )}
        </div>
      ),
    },
    {
      id: "export",
      number: 4,
      label: "Export",
      title: "Download & print",
      hint: "You get a PDF that prints at the exact size. Nothing is uploaded — it's all made on your device.",
      content: (
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExporting || !hasPhotos}
            aria-describedby={disabledReason ? "photo-download-hint" : undefined}
            className={`${primaryButtonClass} w-full`}
          >
            <Download aria-hidden="true" className="h-4 w-4" />
            {downloadLabel}
          </button>
          <DownloadPassBadge />
          {disabledReason && (
            <FieldHint id="photo-download-hint">{disabledReason}</FieldHint>
          )}
          <ToolStatus status={status?.area === "download" ? status.value : null} />
          <PrintTipsPanel paperLabel={paperShort} open={hasDownloaded} />
        </div>
      ),
    },
  ];

  const previewNode = (
    <div className="w-full flex flex-col items-center gap-4">
      <div
        role="region"
        aria-label={`Live preview: ${perPageText}`}
        data-testid="pg-preview"
        onKeyDown={(e) => {
          if (e.key === "Escape" && sel !== null) {
            e.preventDefault();
            closeSlotPanel();
          }
        }}
        className={`relative bg-white ring-1 ring-zinc-200 shadow-md ${
          orientation === "landscape"
            ? "w-[min(100%,540px,calc(58vh*var(--paper-ar)))]"
            : "w-[min(100%,400px,calc(62vh*var(--paper-ar)))]"
        }`}
        style={
          {
            aspectRatio: `${orientedPaper.widthMm} / ${orientedPaper.heightMm}`,
            "--paper-ar": (orientedPaper.widthMm / orientedPaper.heightMm).toFixed(4),
          } as React.CSSProperties
        }
      >
        {computedSlots.map((slot, idx) => {
          const leftPct = ((marginMm + slot.x) / orientedPaper.widthMm) * 100;
          const topPct = ((marginMm + slot.y) / orientedPaper.heightMm) * 100;
          const widthPct = (slot.w / orientedPaper.widthMm) * 100;
          const heightPct = (slot.h / orientedPaper.heightMm) * 100;
          const { photo, photoIndex, repeat } = slotPhotos[idx];
          const selected = sel === idx;
          const sizeText = `${Math.round(slot.w)}×${Math.round(slot.h)} mm`;
          const box = {
            left: `${leftPct}%`,
            top: `${topPct}%`,
            width: `${widthPct}%`,
            height: `${heightPct}%`,
          };
          const selectedCls = selected
            ? "z-10 outline outline-2 outline-offset-1 outline-[#4d7c0f]"
            : "";

          if (!photo) {
            return (
              <button
                key={idx}
                ref={(el) => {
                  slotButtonRefs.current[idx] = el;
                }}
                type="button"
                data-slot={idx}
                onClick={() =>
                  hasPhotos ? openSlot(idx) : fileInputRef.current?.click()
                }
                aria-label={
                  hasPhotos
                    ? `Spot ${idx + 1} (${sizeText}) is empty — choose a photo`
                    : `Add photo (slot ${idx + 1}, ${sizeText})`
                }
                aria-pressed={hasPhotos ? selected : undefined}
                className={`absolute flex flex-col items-center justify-center gap-0.5 border border-dashed border-zinc-300 bg-[#fafafa] text-zinc-600 hover:bg-[#eef6e4] hover:text-[#3f6212] cursor-pointer ${selectedCls}`}
                style={box}
              >
                <ImagePlus aria-hidden="true" className="h-4 w-4" />
                <span className="text-[10px] font-semibold">
                  {hasPhotos ? "Empty" : "Add photo"}
                </span>
              </button>
            );
          }

          const aspect = slot.w / Math.max(1, slot.h);
          return (
            <button
              key={idx}
              ref={(el) => {
                slotButtonRefs.current[idx] = el;
              }}
              type="button"
              data-slot={idx}
              onClick={() => openSlot(idx)}
              aria-pressed={selected}
              aria-label={`Spot ${idx + 1}: photo ${photoIndex + 1}${repeat ? " (copy)" : ""}. Change photo or crop`}
              className={`group absolute overflow-hidden flex items-center justify-center bg-white cursor-pointer ${selectedCls}`}
              style={box}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={`Sheet slot ${idx + 1}: photo ${photoIndex + 1}${repeat ? " (copy)" : ""}`}
                draggable={false}
                className={
                  fitMode === "cover" ? "pointer-events-none" : "h-full w-full object-contain"
                }
                style={
                  fitMode === "cover"
                    ? cropImageStyle(photo, aspect, cropFor(idx, photo.id))
                    : undefined
                }
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"
              />
              {repeat && (
                <span className="absolute top-1 right-1 rounded bg-zinc-950/75 px-1 py-px text-[9px] font-semibold uppercase tracking-wide text-white">
                  copy
                </span>
              )}
            </button>
          );
        })}

        {preset.captionArea && captionText.trim() && (
          <div className="absolute bottom-2 inset-x-0 text-center text-xs font-bold text-zinc-900 px-3 truncate">
            {captionText}
          </div>
        )}
      </div>

      {sel !== null && selSlot && selPhoto && (
        <div
          ref={slotPanelRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby="pg-slot-panel-title"
          tabIndex={-1}
          data-testid="pg-slot-panel"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              e.stopPropagation();
              closeSlotPanel();
            }
          }}
          className="w-full max-w-[520px] rounded-2xl bg-white p-4 shadow-md ring-1 ring-zinc-200 space-y-4 outline-none focus-visible:ring-2 focus-visible:ring-[#4d7c0f]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3
                id="pg-slot-panel-title"
                className="text-sm font-bold text-zinc-950"
              >
                {preset.duplicateFirst
                  ? "Your photo (every spot)"
                  : `Spot ${sel + 1}`}
                <span className="ml-1.5 font-medium text-zinc-600">
                  {Math.round(selSlot.w)} × {Math.round(selSlot.h)} mm
                </span>
              </h3>
              <p className="text-xs text-zinc-600">
                {selPhoto.photo
                  ? preset.duplicateFirst
                    ? "Changes apply to every copy on the sheet."
                    : `Photo ${selPhoto.photoIndex + 1}${
                        selPhoto.explicit ? " (your pick)" : " (automatic)"
                      }`
                  : "Empty — prints blank."}
              </p>
            </div>
            <button
              type="button"
              onClick={closeSlotPanel}
              aria-label="Close spot settings"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced] cursor-pointer"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => slotFileInputRef.current?.click()}
              className={secondaryButtonClass}
            >
              <ImagePlus aria-hidden="true" className="h-4 w-4 text-[#3f6212]" />
              Replace photo
            </button>
            {!preset.duplicateFirst && selPhoto.photo && (
              <button
                type="button"
                onClick={() => chooseForSlot(sel, null)}
                className={secondaryButtonClass}
              >
                <Eraser aria-hidden="true" className="h-4 w-4" />
                Clear slot
              </button>
            )}
            {!preset.duplicateFirst && selPhoto.explicit && (
              <button
                type="button"
                onClick={() => chooseForSlot(sel, undefined)}
                className={secondaryButtonClass}
              >
                <RotateCcw aria-hidden="true" className="h-4 w-4" />
                Back to automatic
              </button>
            )}
          </div>

          {!preset.duplicateFirst && photos.length > 0 && (
            <div>
              <p
                id="pg-slot-choose-label"
                className="text-xs font-semibold text-zinc-700 mb-1.5"
              >
                Choose from your photos
              </p>
              <div
                role="radiogroup"
                aria-labelledby="pg-slot-choose-label"
                className="flex flex-wrap gap-2"
              >
                {photos.map((p, pIdx) => {
                  const active = selPhoto.photo?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      aria-label={`Photo ${pIdx + 1}`}
                      onClick={() => chooseForSlot(sel, p.id)}
                      className={`relative h-12 w-12 overflow-hidden rounded-lg cursor-pointer ring-2 ${
                        active ? "ring-[#4d7c0f]" : "ring-transparent hover:ring-zinc-300"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.src}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      {active && (
                        <span className="absolute bottom-0.5 right-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#4d7c0f] text-white">
                          <Check aria-hidden="true" className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selPhoto.photo &&
            (fitMode === "cover" ? (
              <div>
                <p className="text-xs font-semibold text-zinc-700 mb-1.5">
                  Crop: drag to move, zoom to trim more
                </p>
                <CropEditor
                  key={`${cropKey(sel)}-${selPhoto.photo.id}`}
                  src={selPhoto.photo.src}
                  aspect={selSlot.w / Math.max(1, selSlot.h)}
                  value={cropFor(sel, selPhoto.photo.id)}
                  onChange={(c) => {
                    const id = selPhoto.photo?.id;
                    if (id) setCropFor(sel, id, c);
                  }}
                  label={`Position photo in spot ${sel + 1}`}
                  maxWidthPx={260}
                />
              </div>
            ) : (
              <FieldHint>
                Cropping is available with &ldquo;Fill the slot&rdquo; (step 3). &ldquo;Show whole photo&rdquo; never trims anything.
              </FieldHint>
            ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        aria-label={preset.duplicateFirst ? "Choose photo file" : "Add photo files"}
        accept={ACCEPTED_TYPES}
        multiple={!preset.duplicateFirst}
        onChange={handleFileChange}
        className="sr-only"
        tabIndex={-1}
      />
      <input
        ref={slotFileInputRef}
        type="file"
        aria-label="Choose a photo for this spot"
        accept={ACCEPTED_TYPES}
        onChange={(e) => void handleSlotFileChange(e)}
        className="sr-only"
        tabIndex={-1}
      />

      <FullPageToolShell
        open={open}
        onClose={onClose}
        toolTitle="Photo Sheet Maker"
        toolSummary={perPageText}
        steps={steps}
        activeStep={activeStep}
        onStepChange={setActiveStep}
        headerCenter={headerCenter}
        preview={previewNode}
        previewFooter={
          <p className="text-xs text-zinc-600 text-center">
            <span className="font-semibold text-zinc-800">{perPageText}</span>
            {" · "}
            {orientation === "portrait" ? "portrait" : "landscape"}
            {hasPhotos
              ? sel === null && " · tap a photo to change or crop it"
              : " · tap a spot to add a photo"}
          </p>
        }
        primaryAction={{
          label: downloadLabel,
          mobileLabel: isExporting ? "Making PDF…" : "Download PDF",
          onClick: handleDownloadPdf,
          disabled: isExporting || !hasPhotos,
          loading: isExporting,
          describedBy: disabledReason ? "photo-download-hint" : undefined,
        }}
        howTo={PHOTO_GRID_HOW_TO}
        mobileSummary={`${hasPhotos ? photosWord(slotCount) : "No photos yet"} · ${paperShort}`}
      />
    </>
  );
}
