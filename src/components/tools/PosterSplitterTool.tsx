"use client";

import React, { useState } from "react";
import { Download, Grid3X3, Info, Ruler, RotateCw, Sparkles } from "lucide-react";
import {
  createSamplePhotoDataUrl,
  drawCropMarksPdf,
  fileToDataUrl,
  getImageNaturalSize,
  getOrientedPaper,
  loadImageElement,
  PAPER_SIZES,
  PRINTER_SAFE_MARGIN_MM,
  type PaperSizeId,
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
import { CropEditor } from "@/components/tools/ui/CropEditor";
import { DEFAULT_CROP, getSourceRect, type CropState } from "@/lib/crop";
import { useNumberField } from "@/lib/use-number-field";
import { DownloadPassBadge, useDownloadGate } from "@/components/payment/DownloadPaywallProvider";

type Status = { area: "upload" | "download"; value: ToolStatusValue } | null;

/** Per-tile canvas limits — stays well under iOS Safari's canvas caps. */
const MAX_TILE_SIDE_PX = 4096;
const MAX_TILE_AREA_PX = 16_000_000;
/** ~300 DPI — no point rasterising tiles finer than this. */
const MAX_PX_PER_MM = 300 / 25.4;
const LOW_DPI_THRESHOLD = 100;
const GREAT_DPI_THRESHOLD = 150;

const toCm = (mm: number) => Math.round(mm / 10);
const toIn = (mm: number) => Math.round(mm / 25.4);

/** Margin needed to fit the Row/Col label below the tile without touching it or the unprintable edge. */
const LABEL_IN_MARGIN_MIN_MM = 7;

function posterSize(
  paperW: number,
  paperH: number,
  margin: number,
  overlap: number,
  cols: number,
  rows: number
) {
  const tileW = paperW - margin * 2;
  const tileH = paperH - margin * 2;
  return {
    tileW,
    tileH,
    fullW: cols * tileW - (cols - 1) * overlap,
    fullH: rows * tileH - (rows - 1) * overlap,
  };
}

/** Fraction of the image kept when "cover"-cropping it to the target aspect (1 = no crop). */
function keptFraction(imageAspect: number, targetAspect: number) {
  return Math.min(imageAspect, targetAspect) / Math.max(imageAspect, targetAspect);
}

const MAX_PAGES_PER_SIDE = 10;
type FitMode = "cover" | "contain";
type SizeUnit = "cm" | "in";
const TARGET_LIMITS: Record<SizeUnit, { min: number; max: number; step: number }> = {
  cm: { min: 20, max: 500, step: 0.5 },
  in: { min: 8, max: 200, step: 0.5 },
};

/** Fewest pages along one side so n tiles (sharing `overlap`) reach `lengthMm`. */
function pagesToReach(lengthMm: number, tileMm: number, overlap: number) {
  const step = Math.max(1, tileMm - overlap);
  return Math.max(1, Math.ceil((lengthMm - overlap) / step - 1e-9));
}

/**
 * Where the image sits on the finished poster, in poster millimetres.
 * Shared by the preview AND the per-tile PDF export so they always match.
 * - cover: the crop rectangle (src/lib/crop.ts) fills the whole poster.
 * - contain: the whole image, centred, with white borders.
 */
function imagePlacement(
  imgW: number,
  imgH: number,
  fullW: number,
  fullH: number,
  fit: FitMode,
  crop: CropState
) {
  if (fit === "contain") {
    const mmPerPx = Math.min(fullW / imgW, fullH / imgH);
    return {
      mmPerPx,
      offsetX: (fullW - imgW * mmPerPx) / 2,
      offsetY: (fullH - imgH * mmPerPx) / 2,
    };
  }
  const r = getSourceRect(imgW, imgH, fullW / Math.max(1, fullH), crop);
  const mmPerPx = fullW / r.sw;
  return { mmPerPx, offsetX: -r.sx * mmPerPx, offsetY: -r.sy * mmPerPx };
}

const fmt1 = (n: number) => (Math.round(n * 10) / 10).toString();

export function PosterSplitterTool() {
  const { requirePayment } = useDownloadGate();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [paper, setPaper] = useState<PaperSizeId>("a4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait"
  );
  const [manualCols, setManualCols] = useState(2);
  const [manualRows, setManualRows] = useState(2);
  /** "pages": cols/rows picked by hand. "target": derived from the wanted finished size. */
  const [sizeMode, setSizeMode] = useState<"pages" | "target">("pages");
  const [targetValue, setTargetValue] = useState(100);
  const [targetUnit, setTargetUnit] = useState<SizeUnit>("cm");
  const [targetDim, setTargetDim] = useState<"width" | "height">("width");
  const [fitMode, setFitMode] = useState<FitMode>("cover");
  const [posterCrop, setPosterCrop] = useState<CropState>(DEFAULT_CROP);
  const [marginMm, setMarginMm] = useState(8);
  const [overlapMm, setOverlapMm] = useState(8);
  const [showNumbers, setShowNumbers] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [hasDownloaded, setHasDownloaded] = useState(false);

  // Any settings change makes the last success / error message stale.
  const clearStatus = () => setStatus(null);

  const orientedPaper = getOrientedPaper(paper, orientation);
  const imageAspect = imageSize ? imageSize.width / Math.max(1, imageSize.height) : null;

  // Target size → pages across × down (at least the wanted size, in the image's shape).
  const tileWNow = orientedPaper.widthMm - marginMm * 2;
  const tileHNow = orientedPaper.heightMm - marginMm * 2;
  const targetMm = targetValue * (targetUnit === "cm" ? 10 : 25.4);
  const shapeAspect = imageAspect ?? tileWNow / Math.max(1, tileHNow);
  const wantW = targetDim === "width" ? targetMm : targetMm * shapeAspect;
  const wantH = targetDim === "height" ? targetMm : targetMm / shapeAspect;
  const rawTargetCols = pagesToReach(wantW, tileWNow, overlapMm);
  const rawTargetRows = pagesToReach(wantH, tileHNow, overlapMm);
  const targetCapped =
    rawTargetCols > MAX_PAGES_PER_SIDE || rawTargetRows > MAX_PAGES_PER_SIDE;
  const targetCols = Math.min(MAX_PAGES_PER_SIDE, rawTargetCols);
  const targetRows = Math.min(MAX_PAGES_PER_SIDE, rawTargetRows);
  const cols = sizeMode === "target" ? targetCols : manualCols;
  const rows = sizeMode === "target" ? targetRows : manualRows;
  const setPages = (c: number, r: number) => {
    setManualCols(c);
    setManualRows(r);
    setSizeMode("pages");
  };
  const limits = TARGET_LIMITS[targetUnit];
  const targetField = useNumberField(
    targetValue,
    (v) => {
      setTargetValue(v);
      clearStatus();
    },
    { min: limits.min, max: limits.max, step: limits.step, unit: targetUnit }
  );
  function changeTargetUnit(u: SizeUnit) {
    if (u === targetUnit) return;
    const converted = u === "in" ? targetValue / 2.54 : targetValue * 2.54;
    const lim = TARGET_LIMITS[u];
    const rounded = Math.round(converted / lim.step) * lim.step;
    setTargetValue(Math.min(lim.max, Math.max(lim.min, rounded)));
    setTargetUnit(u);
    clearStatus();
  }

  const { tileW: tilePrintW, tileH: tilePrintH, fullW, fullH } = posterSize(
    orientedPaper.widthMm,
    orientedPaper.heightMm,
    marginMm,
    overlapMm,
    cols,
    rows
  );
  const stepX = tilePrintW - overlapMm;
  const stepY = tilePrintH - overlapMm;
  const posterAspect = fullW / Math.max(1, fullH);

  // Image placement (shared with export) + quality info
  const placement = imageSize
    ? imagePlacement(imageSize.width, imageSize.height, fullW, fullH, fitMode, posterCrop)
    : null;
  const imagePrintW = imageSize && placement ? imageSize.width * placement.mmPerPx : fullW;
  const imagePrintH = imageSize && placement ? imageSize.height * placement.mmPerPx : fullH;
  const effectiveDpi = placement ? Math.round(25.4 / placement.mmPerPx) : null;
  const isLowRes = effectiveDpi !== null && effectiveDpi < LOW_DPI_THRESHOLD;
  const quality =
    effectiveDpi === null
      ? null
      : effectiveDpi >= GREAT_DPI_THRESHOLD
        ? { label: "Great", cls: "bg-[#eef6e4] text-[#365314]" }
        : effectiveDpi >= LOW_DPI_THRESHOLD
          ? { label: "OK", cls: "bg-[#f5f5f7] text-zinc-800" }
          : { label: "May look blurry", cls: "bg-amber-50 text-amber-900" };
  const pageCount = rows * cols;
  const pagesText = `${pageCount} page${pageCount === 1 ? "" : "s"}`;
  const paperShort = PAPER_SIZES[paper].label.split(" (")[0];
  const finishedCm = `${toCm(fullW)} × ${toCm(fullH)}`;
  const finishedIn = `${toIn(fullW)} × ${toIn(fullH)}`;
  const exactCm = `${fmt1(fullW / 10)} × ${fmt1(fullH / 10)}`;
  const exactIn = `${fmt1(fullW / 25.4)} × ${fmt1(fullH / 25.4)}`;
  const keptNow = imageAspect ? keptFraction(imageAspect, posterAspect) : 1;
  // Fill: share of the image that's trimmed. Fit: share of the poster left white.
  const trimmedPct =
    fitMode === "cover" && imageSize && placement
      ? Math.round(
          (1 -
            Math.min(1, (fullW * fullH) / (imagePrintW * imagePrintH))) *
            100
        )
      : 0;
  const isCropped = fitMode === "cover" && trimmedPct >= 2;
  const whitePct =
    fitMode === "contain" ? Math.round((1 - keptNow) * 100) : 0;

  // Would flipping the sheets (and swapping rows/cols) crop less?
  const flippedOrientation = orientation === "portrait" ? "landscape" : "portrait";
  const flippedPaper = getOrientedPaper(paper, flippedOrientation);
  const flipped = posterSize(
    flippedPaper.widthMm,
    flippedPaper.heightMm,
    marginMm,
    overlapMm,
    rows,
    cols
  );
  const keptFlipped = imageAspect
    ? keptFraction(imageAspect, flipped.fullW / Math.max(1, flipped.fullH))
    : 1;
  const suggestFlip = imageAspect !== null && keptFlipped - keptNow > 0.1;

  function applyFlip() {
    setOrientation(flippedOrientation);
    // In target mode pages are re-derived for the new direction automatically.
    if (sizeMode === "pages") {
      setManualCols(rows);
      setManualRows(cols);
    }
    clearStatus();
  }

  async function addFile(file: File | undefined) {
    if (!file) return;
    try {
      const url = await fileToDataUrl(file);
      const img = await loadImageElement(url);
      setImageSrc(url);
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      setPosterCrop(DEFAULT_CROP);
      setStatus({
        area: "upload",
        value: { tone: "success", text: "Image added — check the preview, then pick a size." },
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

  async function handleLoadSample() {
    const url = createSamplePhotoDataUrl(0, "Poster Artwork");
    setImageSrc(url);
    setPosterCrop(DEFAULT_CROP);
    try {
      setImageSize(await getImageNaturalSize(url));
    } catch {
      setImageSize(null);
    }
    setStatus({
      area: "upload",
      value: { tone: "info", text: "Showing a sample image — upload your own any time." },
    });
  }


  async function executeDownloadPosterPdf() {
    if (!imageSrc) return;
    setIsExporting(true);
    setStatus(null);
    try {
      const img = await loadImageElement(imageSrc);
      const { jsPDF } = await import("jspdf");
      const pageW = orientedPaper.widthMm;
      const pageH = orientedPaper.heightMm;

      const doc = new jsPDF({
        orientation,
        unit: "mm",
        format: [pageW, pageH],
      });

      // Place the image on the poster (fill + crop, or fit with white borders),
      // in poster millimetres — the same maths the preview uses.
      const imgW = img.naturalWidth || img.width;
      const imgH = img.naturalHeight || img.height;
      const { mmPerPx, offsetX, offsetY } = imagePlacement(
        imgW,
        imgH,
        fullW,
        fullH,
        fitMode,
        posterCrop
      );

      // Per-tile canvas resolution: no finer than the source or ~300 DPI,
      // and capped so each canvas stays within mobile limits.
      let pxPerMm = Math.min(1 / mmPerPx, MAX_PX_PER_MM);
      pxPerMm = Math.max(pxPerMm, 2);
      pxPerMm = Math.min(
        pxPerMm,
        MAX_TILE_SIDE_PX / Math.max(tilePrintW, tilePrintH),
        Math.sqrt(MAX_TILE_AREA_PX / (tilePrintW * tilePrintH))
      );
      const tw = Math.max(1, Math.round(tilePrintW * pxPerMm));
      const th = Math.max(1, Math.round(tilePrintH * pxPerMm));

      const tileCanvas = document.createElement("canvas");
      tileCanvas.width = tw;
      tileCanvas.height = th;
      const tctx = tileCanvas.getContext("2d");
      if (!tctx) throw new Error("Canvas unavailable in this browser.");
      tctx.imageSmoothingQuality = "high";

      const total = rows * cols;
      let pageIdx = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (pageIdx > 0) {
            doc.addPage([pageW, pageH], orientation);
          }
          pageIdx++;

          // Tile rectangle in poster mm → source rectangle in image px.
          const tileX = c * stepX;
          const tileY = r * stepY;
          const sx = (tileX - offsetX) / mmPerPx;
          const sy = (tileY - offsetY) / mmPerPx;
          const sw = tilePrintW / mmPerPx;
          const sh = tilePrintH / mmPerPx;

          tctx.fillStyle = "#ffffff";
          tctx.fillRect(0, 0, tw, th);
          // Clip the source rect to the image ourselves (white borders in fit
          // mode) — some browsers mishandle out-of-bounds drawImage sources.
          const cx0 = Math.max(0, sx);
          const cy0 = Math.max(0, sy);
          const cx1 = Math.min(imgW, sx + sw);
          const cy1 = Math.min(imgH, sy + sh);
          if (cx1 > cx0 && cy1 > cy0) {
            const kx = tw / sw;
            const ky = th / sh;
            tctx.drawImage(
              img,
              cx0,
              cy0,
              cx1 - cx0,
              cy1 - cy0,
              (cx0 - sx) * kx,
              (cy0 - sy) * ky,
              (cx1 - cx0) * kx,
              (cy1 - cy0) * ky
            );
          }
          doc.addImage(
            tileCanvas.toDataURL("image/jpeg", 0.92),
            "JPEG",
            marginMm,
            marginMm,
            tilePrintW,
            tilePrintH
          );

          drawCropMarksPdf(doc, marginMm, marginMm, tilePrintW, tilePrintH, 3, 1);

          // Dashed guide for the overlap / glue band on edges shared with a neighbour.
          if (overlapMm > 0) {
            doc.setDrawColor(77, 124, 15);
            doc.setLineWidth(0.2);
            doc.setLineDashPattern([1.5, 1.5], 0);
            const left = marginMm;
            const top = marginMm;
            const right = marginMm + tilePrintW;
            const bottom = marginMm + tilePrintH;
            if (c > 0) doc.line(left + overlapMm, top, left + overlapMm, bottom);
            if (c < cols - 1) doc.line(right - overlapMm, top, right - overlapMm, bottom);
            if (r > 0) doc.line(left, top + overlapMm, right, top + overlapMm);
            if (r < rows - 1) doc.line(left, bottom - overlapMm, right, bottom - overlapMm);
            doc.setLineDashPattern([], 0);
          }

          if (showNumbers) {
            const label = `Row ${r + 1}, Col ${c + 1} · Page ${pageIdx} of ${total}${
              overlapMm > 0 ? ` · Overlap ${overlapMm} mm` : ""
            }`;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);
            doc.setTextColor(82, 82, 91);
            if (marginMm >= LABEL_IN_MARGIN_MIN_MM) {
              // In the bottom margin, clear of the crop marks and inside the printable area.
              doc.text(label, marginMm + 5, pageH - PRINTER_SAFE_MARGIN_MM);
            } else {
              // Small label inside the tile's top-left corner on a white backing.
              const textW = doc.getTextWidth(label);
              const pad = 1;
              const fontH = 7 * (25.4 / 72);
              const bx = marginMm + 1.5;
              const by = marginMm + 1.5;
              doc.setFillColor(255, 255, 255);
              doc.rect(bx, by, textW + pad * 2, fontH + pad * 2, "F");
              doc.text(label, bx + pad, by + pad + fontH * 0.8);
            }
          }
        }
      }
      tileCanvas.width = 0;
      tileCanvas.height = 0;

      doc.save(`poster-${cols}x${rows}-${paper}.pdf`);
      setHasDownloaded(true);
      setStatus({
        area: "download",
        value: {
          tone: "success",
          text: (
            <>
              PDF downloaded — {total} page{total === 1 ? "" : "s"} making a
              poster about {finishedCm} cm ({finishedIn} in). Print at{" "}
              <strong>100% / Actual size</strong>, then follow the steps below.
            </>
          ),
        },
      });
    } catch (err) {
      setStatus({
        area: "download",
        value: {
          tone: "error",
          text: err instanceof Error ? err.message : "Failed to build poster PDF.",
        },
      });
    } finally {
      setIsExporting(false);
    }
  }

  function handleDownloadPosterPdf() {
    if (!imageSrc) return;
    requirePayment({
      itemTitle: "Multi-Page Poster PDF",
      itemSummary: `${pagesText} (${cols} × ${rows} tiles) · ${paperShort}`,
      onApproved: executeDownloadPosterPdf,
    });
  }


  const presetSizes = [
    { c: 2, r: 2 },
    { c: 2, r: 3 },
    { c: 3, r: 3 },
    { c: 4, r: 3 },
  ];

  const fitOptions: { id: FitMode; title: string; hint: string }[] = [
    { id: "cover", title: "Fill the poster", hint: "trims edges" },
    { id: "contain", title: "Show whole image", hint: "white borders" },
  ];

  return (
    <div className="rounded-3xl bg-[#f5f5f7] p-2 sm:p-5 lg:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-5 items-start">
        {/* Controls */}
        <div className="order-2 lg:order-1 lg:col-span-5 rounded-2xl bg-white p-4 sm:p-6 space-y-7">
          {/* Step 1 — image */}
          <section aria-labelledby="ps-step-1" className="space-y-3">
            <StepHeader
              step={1}
              id="ps-step-1"
              title="Upload your image"
              hint="A big, sharp photo or artwork works best — it gets printed across several pages."
            />
            {imageSrc && imageSize && quality && (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageSrc}
                  alt="Your uploaded image"
                  className="h-14 w-14 shrink-0 rounded-xl object-cover bg-[#f5f5f7]"
                />
                <div className="min-w-0 space-y-1">
                  <span
                    data-testid="poster-quality"
                    className={`inline-flex flex-wrap items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold ${quality.cls}`}
                  >
                    <Info className="h-3 w-3" aria-hidden="true" />
                    Print quality: {quality.label}
                  </span>
                  <p className="text-[11px] text-zinc-600">
                    {imageSize.width} × {imageSize.height} px · about {effectiveDpi} dots
                    per inch at this poster size
                  </p>
                </div>
              </div>
            )}
            {isLowRes && (
              <FieldHint tone="warning">
                Your image is small for a poster this big, so it may look blurry.
                Use a larger image or choose fewer pages in step 2.
              </FieldHint>
            )}
            <UploadDropzone
              onFiles={(files) => void addFile(files[0])}
              title={imageSrc ? "Use a different image" : "Upload your image"}
              buttonLabel={imageSrc ? "Choose another" : "Choose image"}
              compact={!!imageSrc}
              inputLabel="Upload poster image"
              secondaryAction={
                imageSrc ? undefined : (
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className={secondaryButtonClass}
                  >
                    <Sparkles className="h-4 w-4 text-[#3f6212]" aria-hidden="true" />
                    Try sample
                  </button>
                )
              }
            />
            {status?.area === "upload" && <ToolStatus status={status.value} />}
          </section>

          {/* Step 2 — size */}
          <section aria-labelledby="ps-step-2" className="space-y-4">
            <StepHeader
              step={2}
              id="ps-step-2"
              title="Choose poster size"
              hint="Type the size you want, or pick how many pages across and down."
            />

            {/* Target finished size */}
            <div
              data-testid="poster-target"
              className={`rounded-xl p-3 space-y-2.5 ring-1 ${
                sizeMode === "target"
                  ? "bg-[#eef6e4] ring-[#4d7c0f]"
                  : "bg-[#f5f5f7] ring-transparent"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p
                  id="poster-target-label"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-800"
                >
                  <Ruler className="h-3.5 w-3.5 text-[#3f6212]" aria-hidden="true" />
                  Finished size you want
                </p>
                <div
                  role="radiogroup"
                  aria-label="Size applies to"
                  className="inline-flex rounded-lg bg-white p-0.5"
                >
                  {(["width", "height"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      role="radio"
                      aria-checked={targetDim === d}
                      onClick={() => {
                        setTargetDim(d);
                        setSizeMode("target");
                        clearStatus();
                      }}
                      className={`min-h-[32px] rounded-md px-2.5 text-xs font-semibold cursor-pointer ${
                        targetDim === d
                          ? "bg-zinc-950 text-white"
                          : "text-zinc-700 hover:bg-[#f5f5f7]"
                      }`}
                    >
                      {d === "width" ? "Width" : "Height"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-stretch gap-2">
                <label htmlFor="poster-target-size" className="sr-only">
                  Poster {targetDim} in {targetUnit === "cm" ? "centimetres" : "inches"}
                </label>
                <input
                  id="poster-target-size"
                  type="number"
                  {...targetField.inputProps}
                  onChange={(e) => {
                    // Typing a size switches to "target size" mode.
                    setSizeMode("target");
                    targetField.inputProps.onChange(e);
                  }}
                  aria-describedby="poster-target-result"
                  className="min-w-0 flex-1 min-h-[42px] rounded-xl bg-white px-3 py-2 text-sm font-semibold text-zinc-950 ring-1 ring-zinc-200 aria-[invalid=true]:ring-red-500"
                />
                <div
                  role="radiogroup"
                  aria-label="Unit"
                  className="inline-flex shrink-0 rounded-xl bg-white p-0.5 ring-1 ring-zinc-200"
                >
                  {(["cm", "in"] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      role="radio"
                      aria-checked={targetUnit === u}
                      aria-label={u === "cm" ? "Centimetres" : "Inches"}
                      onClick={() => {
                        changeTargetUnit(u);
                        setSizeMode("target");
                      }}
                      className={`min-w-[44px] rounded-lg px-2.5 text-xs font-bold cursor-pointer ${
                        targetUnit === u
                          ? "bg-[#4d7c0f] text-white"
                          : "text-zinc-700 hover:bg-[#f5f5f7]"
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              {targetField.error && (
                <FieldHint tone="warning">{targetField.error}</FieldHint>
              )}
              <p
                id="poster-target-result"
                aria-live="polite"
                className="text-xs text-zinc-700"
              >
                {sizeMode === "target" ? (
                  <>
                    <span className="font-semibold text-zinc-950">
                      {targetCols} across × {targetRows} down ({targetCols * targetRows}{" "}
                      pages)
                    </span>{" "}
                    → exactly {exactCm} cm ({exactIn} in)
                    {!imageSrc && " · add your image to match its shape"}
                  </>
                ) : (
                  <>
                    Would use {targetCols} × {targetRows} pages.{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setSizeMode("target");
                        clearStatus();
                      }}
                      className="font-semibold text-[#3f6212] underline underline-offset-2 cursor-pointer"
                    >
                      Use this size
                    </button>
                  </>
                )}
              </p>
              {targetCapped && (
                <FieldHint tone="warning">
                  That&apos;s more than {MAX_PAGES_PER_SIDE} pages on a side, so it&apos;s
                  capped — try bigger paper (A3) for a poster this large.
                </FieldHint>
              )}
            </div>

            <p
              id="poster-pages-label"
              className="text-xs font-semibold text-zinc-700"
            >
              Or choose pages across/down
            </p>
            <div
              className="grid grid-cols-2 gap-1.5"
              role="group"
              aria-labelledby="poster-pages-label"
            >
              {presetSizes.map((p) => {
                const active = sizeMode === "pages" && cols === p.c && rows === p.r;
                const s = posterSize(
                  orientedPaper.widthMm,
                  orientedPaper.heightMm,
                  marginMm,
                  overlapMm,
                  p.c,
                  p.r
                );
                return (
                  <button
                    key={`${p.c}x${p.r}`}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setPages(p.c, p.r);
                      clearStatus();
                    }}
                    className={`min-h-[52px] rounded-xl px-3 py-2 text-left transition cursor-pointer ${
                      active
                        ? "bg-[#4d7c0f] text-white"
                        : "bg-[#f5f5f7] text-zinc-800 hover:bg-[#ebeced]"
                    }`}
                  >
                    <span className="block text-xs font-bold">
                      {p.c * p.r} pages ({p.c} × {p.r})
                    </span>
                    <span
                      className={`block text-[11px] ${active ? "text-white/85" : "text-zinc-600"}`}
                    >
                      ≈ {toCm(s.fullW)} × {toCm(s.fullH)} cm · {toIn(s.fullW)} × {toIn(s.fullH)} in
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#f5f5f7] p-3">
                <label
                  htmlFor="poster-cols"
                  className="block text-xs font-semibold text-zinc-700 mb-1"
                >
                  Pages across: {cols}
                </label>
                <input
                  id="poster-cols"
                  type="range"
                  min={1}
                  max={MAX_PAGES_PER_SIDE}
                  value={cols}
                  onChange={(e) => {
                    setPages(Number(e.target.value), rows);
                    clearStatus();
                  }}
                  className="w-full accent-[#4d7c0f]"
                />
              </div>
              <div className="rounded-xl bg-[#f5f5f7] p-3">
                <label
                  htmlFor="poster-rows"
                  className="block text-xs font-semibold text-zinc-700 mb-1"
                >
                  Pages down: {rows}
                </label>
                <input
                  id="poster-rows"
                  type="range"
                  min={1}
                  max={MAX_PAGES_PER_SIDE}
                  value={rows}
                  onChange={(e) => {
                    setPages(cols, Number(e.target.value));
                    clearStatus();
                  }}
                  className="w-full accent-[#4d7c0f]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="poster-tile-paper"
                  className="block text-xs font-semibold text-zinc-700 mb-1"
                >
                  Paper size
                </label>
                <select
                  id="poster-tile-paper"
                  value={paper}
                  onChange={(e) => {
                    setPaper(e.target.value as PaperSizeId);
                    clearStatus();
                  }}
                  className="w-full min-h-[40px] rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs text-zinc-950"
                >
                  <option value="a4">{PAPER_SIZES.a4.label}</option>
                  <option value="letter">{PAPER_SIZES.letter.label}</option>
                  <option value="a3">{PAPER_SIZES.a3.label}</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="poster-orientation"
                  className="block text-xs font-semibold text-zinc-700 mb-1"
                >
                  Page direction
                </label>
                <select
                  id="poster-orientation"
                  value={orientation}
                  onChange={(e) => {
                    setOrientation(e.target.value as "portrait" | "landscape");
                    clearStatus();
                  }}
                  className="w-full min-h-[40px] rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs text-zinc-950"
                >
                  <option value="portrait">Portrait (tall)</option>
                  <option value="landscape">Landscape (wide)</option>
                </select>
              </div>
            </div>

            <div>
              <p
                id="poster-fit-label"
                className="text-xs font-semibold text-zinc-700 mb-1.5"
              >
                How the image fits the poster
              </p>
              <div
                role="radiogroup"
                aria-labelledby="poster-fit-label"
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
            </div>

            <div
              data-testid="poster-finished-size"
              className="rounded-xl bg-[#eef6e4] px-4 py-3 text-[#365314]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#3f6212]">
                Finished poster
              </p>
              <p className="text-base font-bold text-zinc-950">
                {exactCm} cm{" "}
                <span className="font-semibold text-zinc-700">({exactIn} in)</span>
              </p>
              <p className="text-xs">
                {pagesText} of {paperShort} · {cols} across × {rows} down
              </p>
              {imageSrc && fitMode === "contain" && whitePct >= 2 && (
                <p className="text-xs">
                  Image prints {fmt1(imagePrintW / 10)} × {fmt1(imagePrintH / 10)} cm
                  with white borders.
                </p>
              )}
            </div>

            {imageSrc && isCropped && (
              <FieldHint>
                Your image is a different shape from the poster, so about{" "}
                {trimmedPct}% is trimmed off the edges — drag below to choose
                what&apos;s kept, or pick &ldquo;Show whole image&rdquo;.
              </FieldHint>
            )}
            {imageSrc && fitMode === "contain" && whitePct >= 2 && (
              <FieldHint>
                The whole image is shown; about {whitePct}% of the poster is
                white border (see preview).
              </FieldHint>
            )}
            {suggestFlip && (
              <button
                type="button"
                onClick={applyFlip}
                className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl bg-[#eef6e4] px-3 py-2 text-xs font-semibold text-[#3f6212] hover:bg-[#e2efd3] cursor-pointer"
              >
                <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                Use {flippedOrientation} pages
                {sizeMode === "pages" ? ` (${rows} across × ${cols} down)` : ""} —{" "}
                {fitMode === "cover" ? "less trimming" : "smaller borders"}
              </button>
            )}

            {imageSrc && fitMode === "cover" && (
              <div data-testid="poster-crop">
                <p className="text-xs font-semibold text-zinc-700 mb-1.5">
                  Choose which part is kept
                </p>
                <CropEditor
                  src={imageSrc}
                  aspect={posterAspect}
                  value={posterCrop}
                  onChange={(c) => {
                    setPosterCrop(c);
                    clearStatus();
                  }}
                  label="Position your image on the poster"
                  maxWidthPx={260}
                />
              </div>
            )}
          </section>

          {/* Step 3 — overlap & margins */}
          <section aria-labelledby="ps-step-3" className="space-y-4">
            <StepHeader
              step={3}
              id="ps-step-3"
              title="Overlap & margins"
              hint="The defaults work for most home printers."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#f5f5f7] p-3">
                <label
                  htmlFor="poster-overlap-mm"
                  className="block text-xs font-semibold text-zinc-700 mb-1"
                >
                  Overlap for taping: {overlapMm} mm
                </label>
                <input
                  id="poster-overlap-mm"
                  type="range"
                  min={0}
                  max={15}
                  value={overlapMm}
                  aria-describedby="poster-overlap-hint"
                  onChange={(e) => {
                    setOverlapMm(Number(e.target.value));
                    clearStatus();
                  }}
                  className="w-full accent-[#4d7c0f]"
                />
                <FieldHint id="poster-overlap-hint">
                  Each page shares this strip with its neighbour so you can
                  glue/tape them.
                </FieldHint>
              </div>
              <div className="rounded-xl bg-[#f5f5f7] p-3">
                <label
                  htmlFor="poster-margin-mm"
                  className="block text-xs font-semibold text-zinc-700 mb-1"
                >
                  Edge margin: {marginMm} mm
                </label>
                <input
                  id="poster-margin-mm"
                  type="range"
                  min={PRINTER_SAFE_MARGIN_MM}
                  max={15}
                  value={marginMm}
                  aria-describedby="poster-margin-hint"
                  onChange={(e) => {
                    setMarginMm(Number(e.target.value));
                    clearStatus();
                  }}
                  className="w-full accent-[#4d7c0f]"
                />
                <FieldHint id="poster-margin-hint">
                  Blank border printers need — they can&apos;t print right to the
                  edge.
                </FieldHint>
              </div>
            </div>

            <label className="min-h-[36px] flex items-start gap-2 text-xs text-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showNumbers}
                onChange={(e) => {
                  setShowNumbers(e.target.checked);
                  clearStatus();
                }}
                className="mt-0.5 accent-[#4d7c0f] h-4 w-4"
              />
              <span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-800">
                  <Grid3X3 className="h-3.5 w-3.5 text-zinc-600" aria-hidden="true" />
                  Print page labels (Row / Col)
                </span>
                <span className="block text-zinc-600">
                  A small label on each page so you know where it goes.
                </span>
              </span>
            </label>
          </section>

          {/* Step 4 — download */}
          <section aria-labelledby="ps-step-4" className="space-y-3">
            <StepHeader
              step={4}
              id="ps-step-4"
              title="Download & assemble"
              hint="You get one PDF with every page. Nothing is uploaded — it's all made on your device."
            />
            <button
              type="button"
              onClick={handleDownloadPosterPdf}
              disabled={isExporting || !imageSrc}
              aria-describedby={imageSrc ? undefined : "poster-download-hint"}
              className={`${primaryButtonClass} w-full`}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {isExporting ? "Making your PDF…" : `Download PDF · ${pagesText}`}
            </button>
            <DownloadPassBadge />
            {!imageSrc && (
              <FieldHint id="poster-download-hint">
                Upload an image first (or try the sample) to download.
              </FieldHint>
            )}
            <ToolStatus status={status?.area === "download" ? status.value : null} />
            <PrintTipsPanel
              paperLabel={paperShort}
              open={hasDownloaded}
              extraSteps={[
                "Trim the overlap strip off one page of each pair.",
                "Line pages up using the dashed lines and Row/Col labels, then tape from behind.",
              ]}
              cutStep="Start with the top-left page (Row 1, Col 1) and work across."
            />
          </section>
        </div>

        {/* Preview */}
        <div className="order-1 lg:order-2 lg:col-span-7 lg:sticky lg:top-24 rounded-2xl bg-white p-4 sm:p-8 flex flex-col items-center justify-center gap-3 lg:min-h-[420px]">
          <div
            data-testid="poster-preview"
            className={`relative overflow-hidden ${
              imageSrc ? "bg-white ring-1 ring-zinc-200" : "bg-[#f5f5f7]"
            } w-[min(100%,460px,calc(46vh*var(--poster-ar)))] lg:w-[min(100%,460px,calc(70vh*var(--poster-ar)))]`}
            style={
              {
                aspectRatio: `${fullW} / ${fullH}`,
                // Constrain by width AND height so tall layouts (e.g. 1×6) always fit.
                "--poster-ar": posterAspect.toFixed(4),
              } as React.CSSProperties
            }
          >
            {imageSrc && imageSize && placement ? (
              // Same placement maths as the PDF export (imagePlacement).
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt={`Poster preview split into ${rows} rows by ${cols} columns (${rows * cols} pages)`}
                className="absolute max-w-none"
                style={{
                  left: `${(placement.offsetX / fullW) * 100}%`,
                  top: `${(placement.offsetY / fullH) * 100}%`,
                  width: `${(imagePrintW / fullW) * 100}%`,
                  height: `${(imagePrintH / fullH) * 100}%`,
                }}
              />
            ) : imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt={`Poster preview split into ${rows} rows by ${cols} columns (${rows * cols} pages)`}
                className={`h-full w-full ${fitMode === "cover" ? "object-cover" : "object-contain"}`}
              />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-zinc-600 bg-[#f5f5f7] p-2 text-center">
                <Grid3X3 className="h-8 w-8 mb-2 text-zinc-600" aria-hidden="true" />
                <span className="text-xs font-medium">
                  Your image will appear here
                </span>
              </div>
            )}

            {/* Real tile boundaries (overlapping tiles show as double lines = glue band) */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              {Array.from({ length: rows * cols }).map((_, i) => {
                const r = Math.floor(i / cols);
                const c = i % cols;
                return (
                  <div
                    key={i}
                    className="absolute flex items-start justify-start p-1"
                    style={{
                      left: `${((c * stepX) / fullW) * 100}%`,
                      top: `${((r * stepY) / fullH) * 100}%`,
                      width: `${(tilePrintW / fullW) * 100}%`,
                      height: `${(tilePrintH / fullH) * 100}%`,
                      border: "1px solid rgba(255,255,255,0.9)",
                      boxShadow: "0 0 0 1px rgba(24,24,27,0.45)",
                    }}
                  >
                    <span className="rounded bg-white/90 px-1 py-px text-[10px] font-mono font-bold text-zinc-950">
                      R{r + 1}·C{c + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-xs text-zinc-600 text-center">
            <span className="font-semibold text-zinc-800">
              Finished poster {exactCm} cm ({exactIn} in)
            </span>
            {" · "}
            {pagesText} of {paperShort}
          </p>
        </div>
      </div>

      <MobileActionBar summary={`${pagesText} · ${paperShort}`}>
        <button
          type="button"
          onClick={handleDownloadPosterPdf}
          disabled={isExporting || !imageSrc}
          aria-describedby={imageSrc ? undefined : "poster-download-hint"}
          className={primaryButtonClass}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          {isExporting ? "Making PDF…" : "Download PDF"}
        </button>
      </MobileActionBar>
    </div>
  );
}
