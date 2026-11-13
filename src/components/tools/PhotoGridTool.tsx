"use client";

import React, { useMemo, useState } from "react";
import {
  Download,
  ImagePlus,
  RotateCw,
  Scissors,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { PageId } from "@/types/spec";
import {
  createSamplePhotoDataUrl,
  drawCropMarksPdf,
  fileToDataUrl,
  getOrientedPaper,
  PAPER_SIZES,
  renderImageToBoxDataUrl,
  type PaperSizeId,
} from "@/lib/pdf-utils";

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

export function PhotoGridTool({ pageId }: { pageId: PageId }) {
  const presets = useMemo(() => getPresetsForTool(pageId), [pageId]);
  const [selectedPresetId, setSelectedPresetId] = useState(presets[0].id);
  const preset =
    presets.find((p) => p.id === selectedPresetId) ?? presets[0];

  const [paper, setPaper] = useState<PaperSizeId>(preset.paper);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    preset.orientation
  );
  const [marginMm, setMarginMm] = useState(
    preset.paper === "4x6" ? 4 : 10
  );
  const [gutterMm, setGutterMm] = useState(
    preset.paper === "4x6" ? 3 : 5
  );
  const [fitMode, setFitMode] = useState<"cover" | "contain">("cover");
  const [showCutGuides, setShowCutGuides] = useState(true);
  const [captionText, setCaptionText] = useState("Summer Memory Sheet");
  const [images, setImages] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const orientedPaper = getOrientedPaper(paper, orientation);
  const printableW = Math.max(20, orientedPaper.widthMm - marginMm * 2);
  const printableH = Math.max(20, orientedPaper.heightMm - marginMm * 2);
  const computedSlots = useMemo(
    () => preset.computeSlots(printableW, printableH, gutterMm),
    [preset, printableW, printableH, gutterMm]
  );

  function selectPreset(p: LayoutPreset) {
    setSelectedPresetId(p.id);
    setPaper(p.paper);
    setOrientation(p.orientation);
    setMarginMm(p.paper === "4x6" ? 4 : 10);
    setGutterMm(p.paper === "4x6" ? 3 : 5);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const loaded: string[] = [];
    for (const file of Array.from(files)) {
      loaded.push(await fileToDataUrl(file));
    }
    setImages((prev) =>
      preset.duplicateFirst ? [loaded[0]] : [...prev, ...loaded]
    );
    setStatusMsg(`${loaded.length} photo(s) loaded.`);
    e.target.value = "";
  }

  function handleLoadSamples() {
    const count = preset.duplicateFirst ? 1 : Math.min(preset.slotCount, 6);
    const samples = Array.from({ length: count }, (_, idx) =>
      createSamplePhotoDataUrl(idx, `Photo ${idx + 1}`)
    );
    setImages(samples);
    setStatusMsg(`Loaded ${samples.length} sample photo(s) for preview.`);
  }

  function rotateImageList() {
    if (images.length < 2) return;
    setImages((prev) => [...prev.slice(1), prev[0]]);
  }

  async function handleDownloadPdf() {
    setIsExporting(true);
    setStatusMsg(null);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation,
        unit: "mm",
        format: [orientedPaper.widthMm, orientedPaper.heightMm],
      });

      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, orientedPaper.widthMm, orientedPaper.heightMm, "F");

      for (let i = 0; i < computedSlots.length; i++) {
        const slot = computedSlots[i];
        const x = marginMm + slot.x;
        const y = marginMm + slot.y;
        const imgSrc = preset.duplicateFirst
          ? images[0]
          : images[i % Math.max(1, images.length)];

        if (images.length > 0 && imgSrc) {
          const { dataUrl, format } = await renderImageToBoxDataUrl(
            imgSrc,
            slot.w / Math.max(1, slot.h),
            fitMode
          );
          doc.addImage(dataUrl, format, x, y, slot.w, slot.h);
        } else {
          doc.setDrawColor(212, 212, 216);
          doc.setLineWidth(0.3);
          doc.rect(x, y, slot.w, slot.h);
        }

        if (showCutGuides) {
          drawCropMarksPdf(doc, x, y, slot.w, slot.h, 2.5, 0.8);
        }
      }

      if (preset.captionArea && captionText.trim()) {
        doc.setTextColor(24, 24, 27);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(paper === "4x6" ? 12 : 16);
        doc.text(
          captionText.trim(),
          orientedPaper.widthMm / 2,
          orientedPaper.heightMm - marginMm - 4,
          { align: "center" }
        );
      }

      doc.save(`print-sheet-${pageId.toLowerCase()}-${paper}.pdf`);
      setStatusMsg("Print-ready PDF downloaded.");
    } catch (err) {
      setStatusMsg(
        err instanceof Error ? err.message : "Could not generate PDF."
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="rounded-3xl bg-[#f5f5f7] p-4 sm:p-6 space-y-4">
      {/* Top toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3.5">
        <div
          role="group"
          aria-label="Photo sheet layout presets"
          className="flex flex-wrap items-center gap-1.5"
        >
          {presets.map((p) => {
            const active = p.id === preset.id;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={active}
                onClick={() => selectPreset(p)}
                className={`min-h-[36px] rounded-xl px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
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
        <div className="text-xs font-mono text-zinc-600">
          {orientedPaper.widthMm} × {orientedPaper.heightMm} mm ·{" "}
          {computedSlots.length} slot{computedSlots.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* Main split workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Controls sidebar */}
        <div className="lg:col-span-4 rounded-2xl bg-white p-5 space-y-5">
          <div>
            <p className="text-xs font-bold tracking-tight text-zinc-950 mb-2.5">
              1. Upload Photos
            </p>
            <div className="flex flex-wrap gap-2">
              <label className="min-h-[36px] inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#4d7c0f] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#3f6212] transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#3f6212]">
                <ImagePlus aria-hidden="true" className="h-4 w-4 text-white" />
                <span>
                  {preset.duplicateFirst ? "Choose Photo" : "Add Photos"}
                </span>
                <input
                  type="file"
                  aria-label={preset.duplicateFirst ? "Choose photo file" : "Add photo files"}
                  accept="image/*"
                  multiple={!preset.duplicateFirst}
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
              <button
                type="button"
                onClick={handleLoadSamples}
                className="min-h-[36px] inline-flex items-center gap-1.5 rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-[#ebeced] cursor-pointer"
              >
                <Sparkles aria-hidden="true" className="h-3.5 w-3.5 text-[#3f6212]" />
                Load Samples
              </button>
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={rotateImageList}
                  aria-label="Cycle photo order"
                  className="min-h-[36px] inline-flex items-center gap-1 rounded-xl bg-[#f5f5f7] px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-[#ebeced] cursor-pointer"
                >
                  <RotateCw aria-hidden="true" className="h-3.5 w-3.5" />
                  Cycle
                </button>
              )}
              {images.length > 0 && (
                <button
                  type="button"
                  onClick={() => setImages([])}
                  aria-label="Clear uploaded photos"
                  className="min-h-[36px] inline-flex items-center gap-1 rounded-xl bg-[#f5f5f7] px-2.5 py-2 text-xs text-zinc-700 hover:text-zinc-950 cursor-pointer"
                >
                  <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                  Clear
                </button>
              )}
            </div>
            {images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {images.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative h-11 w-11 overflow-hidden rounded-xl bg-[#f5f5f7]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Uploaded photo ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="photo-paper-size"
                className="block text-xs font-semibold text-zinc-700 mb-1"
              >
                Paper Size
              </label>
              <select
                id="photo-paper-size"
                value={paper}
                onChange={(e) => setPaper(e.target.value as PaperSizeId)}
                className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs text-zinc-900"
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
                Orientation
              </label>
              <select
                id="photo-orientation"
                value={orientation}
                onChange={(e) =>
                  setOrientation(e.target.value as "portrait" | "landscape")
                }
                className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs text-zinc-900"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#f5f5f7] p-2.5">
              <label
                htmlFor="photo-margin-mm"
                className="block text-xs font-semibold text-zinc-700 mb-1"
              >
                Margin ({marginMm} mm)
              </label>
              <input
                id="photo-margin-mm"
                type="range"
                min={0}
                max={20}
                value={marginMm}
                onChange={(e) => setMarginMm(Number(e.target.value))}
                className="w-full accent-[#4d7c0f]"
              />
            </div>
            <div className="rounded-xl bg-[#f5f5f7] p-2.5">
              <label
                htmlFor="photo-spacing-mm"
                className="block text-xs font-semibold text-zinc-700 mb-1"
              >
                Spacing ({gutterMm} mm)
              </label>
              <input
                id="photo-spacing-mm"
                type="range"
                min={0}
                max={15}
                value={gutterMm}
                onChange={(e) => setGutterMm(Number(e.target.value))}
                className="w-full accent-[#4d7c0f]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div
              role="group"
              aria-label="Photo fit mode"
              className="flex rounded-xl bg-[#f5f5f7] p-1 text-xs"
            >
              <button
                type="button"
                aria-pressed={fitMode === "cover"}
                onClick={() => setFitMode("cover")}
                className={`min-h-[30px] rounded-lg px-2.5 py-1 font-semibold transition cursor-pointer ${
                  fitMode === "cover"
                    ? "bg-white text-zinc-950"
                    : "text-zinc-700"
                }`}
              >
                Crop to Fill
              </button>
              <button
                type="button"
                aria-pressed={fitMode === "contain"}
                onClick={() => setFitMode("contain")}
                className={`min-h-[30px] rounded-lg px-2.5 py-1 font-semibold transition cursor-pointer ${
                  fitMode === "contain"
                    ? "bg-white text-zinc-950"
                    : "text-zinc-700"
                }`}
              >
                Fit Whole
              </button>
            </div>

            <label className="min-h-[32px] inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showCutGuides}
                onChange={(e) => setShowCutGuides(e.target.checked)}
                className="h-4 w-4 rounded accent-[#4d7c0f]"
              />
              <Scissors aria-hidden="true" className="h-3.5 w-3.5 text-zinc-600" />
              Cut marks
            </label>
          </div>

          {preset.captionArea && (
            <div>
              <label
                htmlFor="photo-caption-text"
                className="block text-xs font-semibold text-zinc-700 mb-1"
              >
                Bottom Caption / Title
              </label>
              <input
                id="photo-caption-text"
                type="text"
                value={captionText}
                onChange={(e) => setCaptionText(e.target.value)}
                className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs text-zinc-900"
                placeholder="Add caption text..."
              />
            </div>
          )}

          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#4d7c0f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#3f6212] disabled:bg-zinc-200 disabled:text-zinc-600 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <Download aria-hidden="true" className="h-4 w-4" />
              {isExporting
                ? "Building Print-Ready PDF..."
                : "Download Print-Ready PDF"}
            </button>
            <p className="text-[11px] text-zinc-600 text-center">
              100% browser-side · Print at{" "}
              <strong className="text-zinc-800">Actual Size (100%)</strong>
            </p>
            {statusMsg && (
              <p
                role="status"
                aria-live="polite"
                className="text-xs text-[#365314] bg-[#eef6e4] rounded-xl px-3 py-2 text-center"
              >
                {statusMsg}
              </p>
            )}
          </div>
        </div>

        {/* Live sheet preview — Flat borderless surface */}
        <div className="lg:col-span-8 rounded-2xl bg-white p-6 sm:p-8 flex items-center justify-center min-h-[420px]">
          <div
            role="region"
            aria-label={`Live photo sheet layout preview with ${computedSlots.length} slots`}
            className="relative bg-[#f5f5f7] rounded-xl"
            style={{
              aspectRatio: `${orientedPaper.widthMm} / ${orientedPaper.heightMm}`,
              width: orientation === "landscape" ? "min(100%, 540px)" : "min(100%, 380px)",
            }}
          >
            {computedSlots.map((slot, idx) => {
              const leftPct = ((marginMm + slot.x) / orientedPaper.widthMm) * 100;
              const topPct = ((marginMm + slot.y) / orientedPaper.heightMm) * 100;
              const widthPct = (slot.w / orientedPaper.widthMm) * 100;
              const heightPct = (slot.h / orientedPaper.heightMm) * 100;
              const src = preset.duplicateFirst
                ? images[0]
                : images[idx];

              return (
                <div
                  key={idx}
                  className="absolute overflow-hidden flex items-center justify-center rounded-md bg-white"
                  style={{
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    width: `${widthPct}%`,
                    height: `${heightPct}%`,
                  }}
                >
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt={`Sheet slot ${idx + 1}`}
                      className={`h-full w-full ${
                        fitMode === "cover" ? "object-cover" : "object-contain"
                      }`}
                    />
                  ) : (
                    <div className="text-center px-1">
                      <span className="block text-[10px] font-mono font-semibold text-zinc-600">
                        {Math.round(slot.w)}×{Math.round(slot.h)}mm
                      </span>
                      <span className="block text-[10px] text-zinc-600">
                        Slot {idx + 1}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {preset.captionArea && captionText.trim() && (
              <div className="absolute bottom-2 inset-x-0 text-center text-xs font-bold text-zinc-900 px-3 truncate">
                {captionText}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
