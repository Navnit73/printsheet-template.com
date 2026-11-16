"use client";

import React, { useState } from "react";
import { Download, Grid3X3, ImagePlus, Sparkles } from "lucide-react";
import {
  createSamplePhotoDataUrl,
  drawCropMarksPdf,
  fileToDataUrl,
  getOrientedPaper,
  loadImageElement,
  PAPER_SIZES,
  type PaperSizeId,
} from "@/lib/pdf-utils";

export function PosterSplitterTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [paper, setPaper] = useState<PaperSizeId>("a4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait"
  );
  const [cols, setCols] = useState(2);
  const [rows, setRows] = useState(2);
  const [marginMm, setMarginMm] = useState(8);
  const [overlapMm, setOverlapMm] = useState(8);
  const [showNumbers, setShowNumbers] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const orientedPaper = getOrientedPaper(paper, orientation);
  const tilePrintW = orientedPaper.widthMm - marginMm * 2;
  const tilePrintH = orientedPaper.heightMm - marginMm * 2;
  const totalPosterW = Math.round(
    cols * tilePrintW - (cols - 1) * overlapMm
  );
  const totalPosterH = Math.round(
    rows * tilePrintH - (rows - 1) * overlapMm
  );

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageSrc(await fileToDataUrl(file));
    setStatusMsg("Image loaded for poster tiling.");
    e.target.value = "";
  }

  function handleLoadSample() {
    setImageSrc(createSamplePhotoDataUrl(0, "Poster Artwork"));
    setStatusMsg("Loaded sample poster image.");
  }

  async function handleDownloadPosterPdf() {
    setIsExporting(true);
    setStatusMsg(null);
    try {
      const src = imageSrc || createSamplePhotoDataUrl(0, "Poster Artwork");
      const img = await loadImageElement(src);
      const { jsPDF } = await import("jspdf");

      const doc = new jsPDF({
        orientation,
        unit: "mm",
        format: [orientedPaper.widthMm, orientedPaper.heightMm],
      });

      const stepX = tilePrintW - overlapMm;
      const stepY = tilePrintH - overlapMm;
      const fullW = cols * tilePrintW - (cols - 1) * overlapMm;
      const fullH = rows * tilePrintH - (rows - 1) * overlapMm;

      // Map image to cover fullW x fullH cleanly
      const canvas = document.createElement("canvas");
      const pxPerMm = 6; // ~150 DPI crisp preview/poster export without huge RAM spikes
      canvas.width = Math.max(400, Math.round(fullW * pxPerMm));
      canvas.height = Math.max(400, Math.round(fullH * pxPerMm));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const imgAspect = img.naturalWidth / Math.max(1, img.naturalHeight);
      const targetAspect = canvas.width / canvas.height;
      let dw = canvas.width;
      let dh = canvas.height;
      let dx = 0;
      let dy = 0;
      if (imgAspect > targetAspect) {
        dw = canvas.height * imgAspect;
        dx = (canvas.width - dw) / 2;
      } else {
        dh = canvas.width / imgAspect;
        dy = (canvas.height - dh) / 2;
      }
      ctx.drawImage(img, dx, dy, dw, dh);

      let pageIdx = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (pageIdx > 0) {
            doc.addPage([orientedPaper.widthMm, orientedPaper.heightMm], orientation);
          }
          pageIdx++;

          const sx = Math.round(c * stepX * pxPerMm);
          const sy = Math.round(r * stepY * pxPerMm);
          const sw = Math.round(tilePrintW * pxPerMm);
          const sh = Math.round(tilePrintH * pxPerMm);

          const tileCanvas = document.createElement("canvas");
          tileCanvas.width = sw;
          tileCanvas.height = sh;
          const tctx = tileCanvas.getContext("2d");
          if (tctx) {
            tctx.fillStyle = "#ffffff";
            tctx.fillRect(0, 0, sw, sh);
            tctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
            const tileUrl = tileCanvas.toDataURL("image/jpeg", 0.92);
            doc.addImage(
              tileUrl,
              "JPEG",
              marginMm,
              marginMm,
              tilePrintW,
              tilePrintH
            );
          }

          drawCropMarksPdf(
            doc,
            marginMm,
            marginMm,
            tilePrintW,
            tilePrintH,
            3,
            1
          );

          if (showNumbers) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(82, 82, 91);
            doc.text(
              `Tile Row ${r + 1}, Col ${c + 1} (Page ${pageIdx} of ${
                rows * cols
              }) · Overlap ${overlapMm} mm`,
              marginMm,
              orientedPaper.heightMm - 3
            );
          }
        }
      }

      doc.save(`poster-${cols}x${rows}-${paper}.pdf`);
      setStatusMsg(
        `Downloaded ${rows * cols}-page poster PDF (${totalPosterW} × ${totalPosterH} mm).`
      );
    } catch (err) {
      setStatusMsg(
        err instanceof Error ? err.message : "Failed to build poster PDF."
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="rounded-3xl bg-[#f5f5f7] p-4 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3.5">
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Poster grid size presets"
        >
          {[
            { label: "2×2 (4 Sheets)", c: 2, r: 2 },
            { label: "3×3 (9 Sheets)", c: 3, r: 3 },
            { label: "2×3 (6 Sheets)", c: 2, r: 3 },
            { label: "4×3 (12 Sheets)", c: 4, r: 3 },
          ].map((preset) => {
            const active = cols === preset.c && rows === preset.r;
            return (
              <button
                key={preset.label}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setCols(preset.c);
                  setRows(preset.r);
                }}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
                  active
                    ? "bg-[#4d7c0f] text-white"
                    : "bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced]"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        <div className="text-xs font-mono text-zinc-600">
          Final poster: {totalPosterW} × {totalPosterH} mm ({rows * cols} pages)
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-4 rounded-2xl bg-white p-5 space-y-4">
          <div>
            <p className="text-xs font-bold tracking-tight text-zinc-950 mb-2">
              1. Upload Large Image
            </p>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-600 transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-amber-800">
                <ImagePlus className="h-4 w-4 text-zinc-950" aria-hidden="true" />
                <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
              <button
                type="button"
                onClick={handleLoadSample}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-[#ebeced] cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#3f6212]" aria-hidden="true" />
                Sample Art
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="poster-tile-paper"
                className="block text-xs font-semibold text-zinc-700 mb-1"
              >
                Tile Paper
              </label>
              <select
                id="poster-tile-paper"
                value={paper}
                onChange={(e) => setPaper(e.target.value as PaperSizeId)}
                className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs text-zinc-950"
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
                Orientation
              </label>
              <select
                id="poster-orientation"
                value={orientation}
                onChange={(e) =>
                  setOrientation(e.target.value as "portrait" | "landscape")
                }
                className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs text-zinc-950"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#f5f5f7] p-2.5">
              <label
                htmlFor="poster-cols"
                className="block text-xs font-semibold text-zinc-700 mb-1"
              >
                Columns ({cols})
              </label>
              <input
                id="poster-cols"
                type="range"
                min={1}
                max={6}
                value={cols}
                onChange={(e) => setCols(Number(e.target.value))}
                className="w-full accent-[#4d7c0f]"
              />
            </div>
            <div className="rounded-xl bg-[#f5f5f7] p-2.5">
              <label
                htmlFor="poster-rows"
                className="block text-xs font-semibold text-zinc-700 mb-1"
              >
                Rows ({rows})
              </label>
              <input
                id="poster-rows"
                type="range"
                min={1}
                max={6}
                value={rows}
                onChange={(e) => setRows(Number(e.target.value))}
                className="w-full accent-[#4d7c0f]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#f5f5f7] p-2.5">
              <label
                htmlFor="poster-margin-mm"
                className="block text-xs font-semibold text-zinc-700 mb-1"
              >
                Margin ({marginMm} mm)
              </label>
              <input
                id="poster-margin-mm"
                type="range"
                min={4}
                max={15}
                value={marginMm}
                onChange={(e) => setMarginMm(Number(e.target.value))}
                className="w-full accent-[#4d7c0f]"
              />
            </div>
            <div className="rounded-xl bg-[#f5f5f7] p-2.5">
              <label
                htmlFor="poster-overlap-mm"
                className="block text-xs font-semibold text-zinc-700 mb-1"
              >
                Tape Overlap ({overlapMm} mm)
              </label>
              <input
                id="poster-overlap-mm"
                type="range"
                min={0}
                max={15}
                value={overlapMm}
                onChange={(e) => setOverlapMm(Number(e.target.value))}
                className="w-full accent-[#4d7c0f]"
              />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 min-h-[32px] py-1 text-xs font-medium text-zinc-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showNumbers}
              onChange={(e) => setShowNumbers(e.target.checked)}
              className="accent-[#4d7c0f] h-4 w-4"
            />
            <Grid3X3 className="h-3.5 w-3.5 text-zinc-600" aria-hidden="true" />
            Print page assembly labels (Row/Col)
          </label>

          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleDownloadPosterPdf}
              disabled={isExporting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-zinc-950 hover:bg-amber-600 disabled:bg-zinc-200 disabled:text-zinc-600 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {isExporting
                ? "Splitting Poster..."
                : `Download ${rows * cols}-Page Poster PDF`}
            </button>
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

        <div className="lg:col-span-8 rounded-2xl bg-white p-6 sm:p-8 flex items-center justify-center min-h-[420px]">
          <div
            className="relative rounded-2xl bg-[#f5f5f7] overflow-hidden"
            style={{
              aspectRatio: `${totalPosterW} / ${totalPosterH}`,
              width: "min(100%, 460px)",
            }}
          >
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt={`Poster preview split into ${rows} rows by ${cols} columns (${rows * cols} sheets)`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-zinc-600 bg-[#f5f5f7]">
                <Grid3X3 className="h-8 w-8 mb-2 text-zinc-600" aria-hidden="true" />
                <span className="text-xs font-medium">
                  Upload an image or click Sample Art
                </span>
              </div>
            )}

            {/* Tile overlay grid */}
            <div
              className="absolute inset-0 grid gap-1 p-1 pointer-events-none"
              style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`,
              }}
            >
              {Array.from({ length: rows * cols }).map((_, i) => {
                const r = Math.floor(i / cols) + 1;
                const c = (i % cols) + 1;
                return (
                  <div
                    key={i}
                    className="rounded-lg bg-white/25 flex items-start justify-start p-1.5"
                  >
                    <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-mono font-bold text-zinc-950">
                      R{r}·C{c}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

