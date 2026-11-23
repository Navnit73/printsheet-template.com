"use client";

import React, { useId, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bookmark,
  Check,
  Circle,
  Copy,
  Download,
  FileCode2,
  FileImage,
  FileText,
  FolderOpen,
  Link2,
  RotateCcw,
  Save,
  Scissors,
  Sparkles,
  Square,
  Trash2,
  X,
} from "lucide-react";
import { checkGridFit, PAPER_SIZES } from "@/lib/pdf-utils";
import { useNumberField } from "@/lib/use-number-field";
import { previewFit } from "../card/engine";
import { compileSide, type SideDesign } from "../card/editor-model";
import { CardFacePreview } from "../card/CardFacePreview";
import { isEdgeToEdgeOrDarkSide } from "../card/contrast";
import { exportSidePng, exportSideSvg } from "../card/export";
import type { FontPairId } from "../ui/LabelDesign";
import {
  buildLabelTemplateSide,
  LABEL_GALLERY_TEMPLATES,
  type DynamicSlotOverride,
  type LabelTemplateId,
} from "./label-templates";
import {
  buildLabelShareLink,
  deleteLabelSnapshot,
  downloadLabelDesignJson,
  exportLabelAdvancedPdf,
  loadLabelSnapshots,
  parseLabelDesignJson,
  saveLabelSnapshot,
  type LabelCutGuideStyle,
  type LabelGridState,
  type LabelNamedSnapshot,
  type PersistedLabelDesign,
} from "./label-export";

/* ------------------------------------------------------------------------- */
/* 1. Label & Sticker Template Gallery (live round or rectangular previews)   */
/* ------------------------------------------------------------------------- */

export function LabelTemplateGalleryPanel({
  activeTemplateId,
  w,
  h,
  round,
  accentHex,
  fontPair,
  title,
  subtitle,
  eyebrow,
  onApplyTemplate,
  onResetCurrent,
}: {
  activeTemplateId: LabelTemplateId;
  w: number;
  h: number;
  round: boolean;
  accentHex: string;
  fontPair: FontPairId;
  title: string;
  subtitle: string;
  eyebrow?: string;
  onApplyTemplate: (templateId: LabelTemplateId, side: SideDesign) => void;
  onResetCurrent: () => void;
}) {
  const templates = useMemo(
    () => LABEL_GALLERY_TEMPLATES.filter((t) => !(round && t.rectOnly)),
    [round]
  );

  const previews = useMemo(() => {
    return templates.map((tpl) => {
      const built = buildLabelTemplateSide({
        templateId: tpl.id,
        w,
        h,
        round,
        accentHex,
        fontPair,
        title: title || (round ? "Handmade Seal" : "Pantry Label"),
        subtitle: subtitle || "Small Batch · Fresh",
        eyebrow,
      });
      const compiled = compileSide(built, w, h, previewFit);
      return { tpl, built, els: compiled.els };
    });
  }, [templates, w, h, round, accentHex, fontPair, title, subtitle, eyebrow]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-zinc-900">Label &amp; sticker templates</p>
        <button
          type="button"
          onClick={onResetCurrent}
          title="Reset back to your current template"
          className="inline-flex items-center gap-1 rounded-lg bg-[#f5f5f7] px-2.5 py-1.5 text-[11px] font-semibold text-zinc-700 hover:bg-[#ebeced] cursor-pointer"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>
      <p className="text-[11px] leading-relaxed text-zinc-600">
        Tap any template to start fast — your text and brand colour carry over automatically. Press Undo anytime.
      </p>
      <div className={round ? "grid grid-cols-2 gap-2" : "grid grid-cols-1 gap-2.5"}>
        {previews.map(({ tpl, built, els }) => {
          const active = tpl.id === activeTemplateId;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onApplyTemplate(tpl.id, built)}
              className={`rounded-2xl p-2 text-left transition cursor-pointer ${
                active ? "bg-[#eef6e4] ring-2 ring-[#4d7c0f]" : "bg-[#f5f5f7] hover:bg-[#ebeced]"
              }`}
            >
              <div
                className={`relative mx-auto overflow-hidden bg-white ring-1 ring-zinc-200 ${round ? "w-20 rounded-full" : "w-full rounded-lg"}`}
                style={{ aspectRatio: `${w} / ${h}`, containerType: "inline-size" }}
              >
                {tpl.id === "blank" ? (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">Blank</div>
                ) : (
                  <CardFacePreview W={w} H={h} els={els} images={{}} label={tpl.label} />
                )}
              </div>
              <div className={`mt-1.5 flex items-center justify-between gap-1 px-0.5 ${round ? "text-center justify-center" : ""}`}>
                <div className="min-w-0">
                  <span className={`flex items-center gap-1 text-xs font-bold text-zinc-950 ${round ? "justify-center" : ""}`}>
                    <span className="truncate">{tpl.label}</span>
                    {tpl.badge && !round && (
                      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
                        <Sparkles className="h-2.5 w-2.5" />
                        {tpl.badge}
                      </span>
                    )}
                  </span>
                  {!round && <span className="block truncate text-[10px] text-zinc-600">{tpl.hint}</span>}
                </div>
                {active && !round && <Check className="h-4 w-4 shrink-0 text-[#4d7c0f]" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* 2. Print & Export Modal (Sheet PDF, Single Sticker PDF, 300 DPI PNG, SVG) */
/* ------------------------------------------------------------------------- */

const QUICK_SHEET_PRESETS: Array<{
  id: string;
  label: string;
  sub: string;
  a4: Omit<LabelGridState, "paper">;
  letter: Omit<LabelGridState, "paper">;
}> = [
  {
    id: "2x5",
    label: "10 per sheet (Large)",
    sub: "99 × 55 mm · fits Avery 5163",
    a4: { cols: 2, rows: 5, labelW: 99, labelH: 55, marginTop: 11, marginLeft: 4.5, gapX: 3, gapY: 0, round: false },
    letter: { cols: 2, rows: 5, labelW: 101.6, labelH: 50.8, marginTop: 12.7, marginLeft: 4, gapX: 4.7, gapY: 0, round: false },
  },
  {
    id: "address",
    label: "14 per sheet (Address)",
    sub: "99 × 38 mm · fits Avery L7163",
    a4: { cols: 2, rows: 7, labelW: 99.1, labelH: 38.1, marginTop: 15.15, marginLeft: 4.65, gapX: 2.5, gapY: 0, round: false },
    letter: { cols: 2, rows: 7, labelW: 101.6, labelH: 33.9, marginTop: 21, marginLeft: 4, gapX: 4.7, gapY: 0, round: false },
  },
  {
    id: "stickers",
    label: "12 per sheet (Stickers)",
    sub: "58 × 62 mm · roomy cut gaps",
    a4: { cols: 3, rows: 4, labelW: 58, labelH: 62, marginTop: 14, marginLeft: 12, gapX: 6, gapY: 6, round: false },
    letter: { cols: 3, rows: 4, labelW: 58, labelH: 62, marginTop: 9, marginLeft: 15, gapX: 6, gapY: 4, round: false },
  },
  {
    id: "round50",
    label: "15 per sheet (Round Ø 50 mm)",
    sub: "50 mm circle seals & stickers",
    a4: { cols: 3, rows: 5, labelW: 50, labelH: 50, marginTop: 15, marginLeft: 20, gapX: 10, gapY: 4, round: true },
    letter: { cols: 3, rows: 5, labelW: 50, labelH: 50, marginTop: 12, marginLeft: 23, gapX: 10, gapY: 3, round: true },
  },
  {
    id: "round40",
    label: "24 per sheet (Round Ø 40 mm)",
    sub: "40 mm small circle stickers",
    a4: { cols: 4, rows: 6, labelW: 40, labelH: 40, marginTop: 13, marginLeft: 12, gapX: 8, gapY: 5, round: true },
    letter: { cols: 4, rows: 6, labelW: 40, labelH: 40, marginTop: 10, marginLeft: 15, gapX: 8, gapY: 4, round: true },
  },
  {
    id: "shipping",
    label: "8 per sheet (Shipping)",
    sub: "99 × 68 mm · fits Avery L7165",
    a4: { cols: 2, rows: 4, labelW: 99.1, labelH: 67.7, marginTop: 13.1, marginLeft: 4.65, gapX: 2.5, gapY: 0, round: false },
    letter: { cols: 2, rows: 3, labelW: 101.6, labelH: 84.7, marginTop: 12.7, marginLeft: 4, gapX: 4.7, gapY: 0, round: false },
  },
];

function ExportNum({
  label,
  value,
  min,
  max,
  unit = "mm",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  const id = useId();
  const f = useNumberField(value, (v) => onChange(Math.round(v * 100) / 100), { min, max, unit });
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[10px] font-semibold text-zinc-600">
        {label}
      </label>
      <input
        id={id}
        type="text"
        className="h-9 w-full rounded-xl bg-white px-2.5 text-xs text-zinc-950 ring-1 ring-zinc-200 focus:outline-2 focus:outline-[#4d7c0f]"
        {...f.inputProps}
      />
    </div>
  );
}

const LABEL_CUT_OPTIONS: Array<{ id: LabelCutGuideStyle; label: string; hint: string; badge?: string; rectOnly?: boolean }> = [
  { id: "dashed-outline", label: "Dashed outlines", hint: "Dashed border around every label/circle — easiest for scissors", badge: "Easiest" },
  { id: "dashed-grid", label: "Full dashed lines", hint: "Straight dashed lines across the sheet — great for ruler & trimmer", rectOnly: true },
  { id: "crop-marks", label: "Corner crop marks", hint: "Outer trim marks — keeps artwork untouched" },
  { id: "none", label: "No guides", hint: "Best for pre-cut Avery / peel-off sticker sheets" },
];

export function LabelPrintExportModal({
  side,
  grid,
  labelCount,
  pageCount,
  cutGuideStyle,
  includeBleed,
  slotOverrides,
  onChangeGrid,
  onChangeCutGuideStyle,
  onToggleBleed,
  onClose,
}: {
  side: SideDesign;
  grid: LabelGridState;
  labelCount: number;
  pageCount: number;
  cutGuideStyle: LabelCutGuideStyle;
  includeBleed: boolean;
  slotOverrides?: DynamicSlotOverride[];
  onChangeGrid: (next: LabelGridState) => void;
  onChangeCutGuideStyle: (style: LabelCutGuideStyle) => void;
  onToggleBleed: (on: boolean) => void;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [showCustom, setShowCustom] = useState(false);

  const round = Boolean(grid.round);
  const diameter = Math.min(grid.labelW, grid.labelH);
  const W = round ? diameter : grid.labelW;
  const H = round ? diameter : grid.labelH;
  const paper = PAPER_SIZES[grid.paper];
  const paperShort = grid.paper === "letter" ? "US Letter" : "A4";
  const slotsPerPage = grid.cols * grid.rows;
  const effectiveLabelCount = Math.max(1, labelCount || slotsPerPage);
  const effectivePageCount = Math.max(1, pageCount || 1);

  const gridCheck = checkGridFit({
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
  const gridBad = !gridCheck.fits;

  const edgeInfo = isEdgeToEdgeOrDarkSide(side, W, H);
  const hasDarkEdge = edgeInfo.isDark || edgeInfo.touchesEdge;
  const maxSheetBleed = Math.min(3, grid.cols > 1 ? grid.gapX / 2 : 3, grid.rows > 1 ? grid.gapY / 2 : 3);

  async function runExport(key: string, fn: () => Promise<string>) {
    setBusy(key);
    setNotice(null);
    try {
      const msg = await fn();
      setNotice({ tone: "success", text: msg });
    } catch (err) {
      setNotice({ tone: "error", text: err instanceof Error ? err.message : "Export failed. Please try again." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Download print-ready labels and stickers"
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-zinc-950">Print &amp; Export Labels / Stickers</h3>
            <p className="text-xs text-zinc-600">Choose your paper, count per sheet, cut outlines, bleed, and format.</p>
          </div>
          <button
            type="button"
            aria-label="Close export modal"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {/* Paper size & shape */}
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">1. Paper size &amp; labels per page</h4>
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-xl bg-[#f5f5f7] p-0.5">
                  {(["a4", "letter"] as const).map((pp) => (
                    <button
                      key={pp}
                      type="button"
                      onClick={() => onChangeGrid({ ...grid, paper: pp })}
                      className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                        grid.paper === pp ? "bg-white text-zinc-950 shadow-xs" : "text-zinc-600 hover:text-zinc-900"
                      }`}
                    >
                      {pp === "a4" ? "A4" : "US Letter"}
                    </button>
                  ))}
                </div>
                <div className="inline-flex rounded-xl bg-[#f5f5f7] p-0.5">
                  <button
                    type="button"
                    onClick={() => onChangeGrid({ ...grid, round: false })}
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold cursor-pointer ${
                      !round ? "bg-white text-zinc-950 shadow-xs" : "text-zinc-600"
                    }`}
                  >
                    <Square className="h-3 w-3" /> Rect
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChangeGrid({ ...grid, round: true, labelW: diameter, labelH: diameter })
                    }
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold cursor-pointer ${
                      round ? "bg-white text-zinc-950 shadow-xs" : "text-zinc-600"
                    }`}
                  >
                    <Circle className="h-3 w-3" /> Round
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUICK_SHEET_PRESETS.map((p) => {
                const spec = grid.paper === "letter" ? p.letter : p.a4;
                const active =
                  spec.cols === grid.cols &&
                  spec.rows === grid.rows &&
                  spec.labelW === grid.labelW &&
                  spec.labelH === grid.labelH &&
                  Boolean(spec.round) === round;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onChangeGrid({ paper: grid.paper, ...spec })}
                    className={`rounded-xl px-3 py-2 text-left transition cursor-pointer ${
                      active ? "bg-[#eef6e4] ring-2 ring-[#4d7c0f]" : "bg-[#f5f5f7] hover:bg-[#ebeced]"
                    }`}
                  >
                    <span className={`block text-xs font-bold ${active ? "text-[#365314]" : "text-zinc-900"}`}>{p.label}</span>
                    <span className="block text-[11px] text-zinc-600">{p.sub}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowCustom((v) => !v)}
              className="text-xs font-semibold text-[#3f6212] hover:underline cursor-pointer"
            >
              {showCustom ? "Hide custom grid measurements" : "Adjust custom columns, rows, label size & margins…"}
            </button>

            {showCustom && (
              <div className="space-y-2.5 rounded-2xl bg-[#f5f5f7] p-3.5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <ExportNum label="Across" unit="" value={grid.cols} min={1} max={10} onChange={(cols) => onChangeGrid({ ...grid, cols: Math.round(cols) })} />
                  <ExportNum label="Down" unit="" value={grid.rows} min={1} max={20} onChange={(rows) => onChangeGrid({ ...grid, rows: Math.round(rows) })} />
                  {round ? (
                    <ExportNum label="Diameter" value={diameter} min={10} max={180} onChange={(d) => onChangeGrid({ ...grid, labelW: d, labelH: d })} />
                  ) : (
                    <>
                      <ExportNum label="Width" value={grid.labelW} min={10} max={200} onChange={(labelW) => onChangeGrid({ ...grid, labelW })} />
                      <ExportNum label="Height" value={grid.labelH} min={10} max={260} onChange={(labelH) => onChangeGrid({ ...grid, labelH })} />
                    </>
                  )}
                  <ExportNum label="Top margin" value={grid.marginTop} min={0} max={80} onChange={(marginTop) => onChangeGrid({ ...grid, marginTop })} />
                  <ExportNum label="Left margin" value={grid.marginLeft} min={0} max={80} onChange={(marginLeft) => onChangeGrid({ ...grid, marginLeft })} />
                  <ExportNum label="Gap across" value={grid.gapX} min={0} max={40} onChange={(gapX) => onChangeGrid({ ...grid, gapX })} />
                  <ExportNum label="Gap down" value={grid.gapY} min={0} max={40} onChange={(gapY) => onChangeGrid({ ...grid, gapY })} />
                </div>
                {gridBad && (
                  <p className="text-xs font-semibold text-red-700">
                    Labels overflow {paperShort} (max {gridCheck.maxCols} across × {gridCheck.maxRows} down at this size).
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Guides & Bleed */}
          <section className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">2. Cutting guides &amp; bleed</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {LABEL_CUT_OPTIONS.filter((o) => !(round && o.rectOnly)).map((opt) => {
                const active = cutGuideStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeCutGuideStyle(opt.id)}
                    className={`rounded-xl px-3 py-2.5 text-left transition cursor-pointer ${
                      active ? "bg-[#eef6e4] ring-2 ring-[#4d7c0f]" : "bg-[#f5f5f7] hover:bg-[#ebeced]"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-950">
                      <Scissors className={`h-3.5 w-3.5 shrink-0 ${active ? "text-[#4d7c0f]" : "text-zinc-500"}`} />
                      {opt.label}
                      {opt.badge && (
                        <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-900">
                          {opt.badge}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-zinc-600">{opt.hint}</span>
                  </button>
                );
              })}
            </div>
            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-[#f5f5f7] p-3 text-xs">
              <input
                type="checkbox"
                checked={includeBleed}
                onChange={(e) => onToggleBleed(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#4d7c0f]"
              />
              <span>
                <span className="block font-bold text-zinc-900">Edge bleed (3 mm)</span>
                <span className="text-[11px] text-zinc-600">Extends background past cut edge so no white rim shows</span>
              </span>
            </label>

            {hasDarkEdge && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-950">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="space-y-1">
                  <p className="font-bold">Coloured / dark background reaches the sticker edge</p>
                  <p className="leading-relaxed text-amber-900">
                    Turn on <strong>Edge bleed</strong> so tiny alignment shifts on your printer won&rsquo;t leave white rims.
                    {includeBleed && maxSheetBleed < 3 && (
                      <>
                        {" "}
                        On tightly packed sheets, bleed is automatically capped to{" "}
                        <strong>{maxSheetBleed.toFixed(1)} mm</strong> so labels don&rsquo;t overlap (use wider gaps or Single Sticker PDF for full 3 mm bleed).
                      </>
                    )}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Download formats */}
          <section className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">3. Download format</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={busy !== null || gridBad}
                onClick={() =>
                  void runExport("pdf-sheet", async () => {
                    await exportLabelAdvancedPdf({
                      mode: "sheet",
                      side,
                      grid,
                      labelCount: effectiveLabelCount,
                      pageCount: effectivePageCount,
                      showBorders: cutGuideStyle === "dashed-outline",
                      showCropMarks: cutGuideStyle === "crop-marks" || cutGuideStyle === "dashed-grid",
                      cutGuideStyle,
                      includeBleed,
                      slotOverrides,
                      filename: `labels-${effectiveLabelCount}up-${grid.paper}.pdf`,
                    });
                    return `Downloaded ${effectiveLabelCount}-label ${paperShort} sheet PDF (${effectivePageCount} page${effectivePageCount === 1 ? "" : "s"}). Print at 100% / Actual size.`;
                  })
                }
                className="flex items-center gap-3 rounded-2xl bg-[#4d7c0f] p-4 text-left text-white hover:bg-[#3f6212] disabled:opacity-50 transition cursor-pointer"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15">
                  <Download className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <span className="block text-sm font-bold">
                    {busy === "pdf-sheet" ? "Building PDF…" : `Print Sheet PDF (${effectiveLabelCount} labels)`}
                  </span>
                  <span className="block text-[11px] text-lime-100">
                    {paperShort} · {round ? `Ø ${W} mm circles` : `${W} × ${H} mm`}
                  </span>
                </div>
              </button>

              <button
                type="button"
                disabled={busy !== null}
                onClick={() =>
                  void runExport("pdf-single", async () => {
                    await exportLabelAdvancedPdf({
                      mode: "single",
                      side,
                      grid,
                      labelCount: 1,
                      pageCount: 1,
                      showBorders: cutGuideStyle === "dashed-outline",
                      showCropMarks: cutGuideStyle !== "none",
                      cutGuideStyle,
                      includeBleed,
                      filename: `single-${round ? "round-sticker" : "label"}-${W}x${H}mm.pdf`,
                    });
                    return `Downloaded single ${round ? "round sticker" : "label"} PDF${includeBleed ? " with 3 mm bleed" : ""}.`;
                  })
                }
                className="flex items-center gap-3 rounded-2xl bg-[#f5f5f7] p-4 text-left text-zinc-900 hover:bg-[#ebeced] disabled:opacity-50 transition cursor-pointer"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#4d7c0f] ring-1 ring-zinc-200">
                  <FileText className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <span className="block text-sm font-bold">
                    {busy === "pdf-single" ? "Building PDF…" : `Single ${round ? "Sticker" : "Label"} PDF`}
                  </span>
                  <span className="block text-[11px] text-zinc-600">
                    For print shops &amp; roll printers{includeBleed ? " · 3 mm bleed" : ""}
                  </span>
                </div>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={busy !== null}
                onClick={() =>
                  void runExport("png", async () => {
                    await exportSidePng(side, W, H, `${round ? "round-sticker" : "label"}-300dpi.png`, {
                      bleedMm: includeBleed ? 3 : 0,
                      dpi: 300,
                      round,
                    });
                    return `Downloaded crisp 300 DPI PNG${round ? " (transparent circle — ready for Cricut & die-cut upload)" : ""}.`;
                  })
                }
                className="flex items-center gap-3 rounded-2xl bg-amber-500 p-3.5 text-left text-zinc-950 hover:bg-amber-600 disabled:opacity-50 transition cursor-pointer"
              >
                <FileImage className="h-5 w-5 shrink-0" />
                <div>
                  <span className="block text-xs font-bold">
                    {busy === "png" ? "Rendering PNG…" : "Download PNG (300 DPI)"}
                  </span>
                  <span className="block text-[11px] text-zinc-900">
                    {round ? "Transparent circle · great for Cricut" : "High-res image for online printing"}
                  </span>
                </div>
              </button>

              <button
                type="button"
                disabled={busy !== null}
                onClick={() =>
                  void runExport("svg", async () => {
                    exportSideSvg(side, W, H, `${round ? "round-sticker" : "label"}.svg`, {
                      bleedMm: includeBleed ? 3 : 0,
                      round,
                    });
                    return "Downloaded standalone vector SVG.";
                  })
                }
                className="flex items-center gap-3 rounded-2xl bg-[#eef6e4] p-3.5 text-left text-[#365314] hover:bg-[#dff0c8] disabled:opacity-50 transition cursor-pointer"
              >
                <FileCode2 className="h-5 w-5 shrink-0 text-[#4d7c0f]" />
                <div>
                  <span className="block text-xs font-bold">Download Vector SVG</span>
                  <span className="block text-[11px] text-[#3f6212]">Scalable paths for Illustrator &amp; cutters</span>
                </div>
              </button>
            </div>

            {notice && (
              <div
                className={`rounded-xl px-3.5 py-2.5 text-xs font-medium ${
                  notice.tone === "success" ? "bg-[#eef6e4] text-[#365314]" : "bg-red-50 text-red-800"
                }`}
              >
                {notice.text}
              </div>
            )}
          </section>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-200 bg-[#fafafa] px-5 py-3 text-[11px] text-zinc-600">
          <span className="inline-flex items-center gap-1.5">
            <Scissors className="h-3.5 w-3.5 text-[#4d7c0f]" />
            Tip: Print a test page on plain paper at <strong>100% / Actual size</strong> before loading sticker sheets.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 hover:bg-zinc-50 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* 3. Save & Share Modal for Labels & Stickers                                */
/* ------------------------------------------------------------------------- */

export function LabelSaveShareModal({
  payload,
  onLoadPayload,
  onClose,
}: {
  payload: PersistedLabelDesign;
  onLoadPayload: (loaded: PersistedLabelDesign) => void;
  onClose: () => void;
}) {
  const [snapName, setSnapName] = useState(
    `${payload.labelTitle || "My label"} (${new Date().toLocaleDateString()})`
  );
  const [snapshots, setSnapshots] = useState<LabelNamedSnapshot[]>(() => loadLabelSnapshots());
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  async function handleCopyShareLink() {
    const { url, strippedImages } = buildLabelShareLink(payload);
    try {
      await navigator.clipboard.writeText(url);
      setShareMsg(
        strippedImages
          ? "Share link copied! Large uploaded images were omitted from the URL — use 'Save design file' below to share images too."
          : "Share link copied! Open it anywhere to resume editing this label."
      );
    } catch {
      window.prompt("Copy your shareable label link:", url);
    }
  }

  async function handleImportJson(file: File | undefined) {
    if (!file) return;
    setImportError(null);
    try {
      const parsed = parseLabelDesignJson(await file.text());
      if (!parsed) {
        setImportError("That file doesn't look like a saved label/sticker design.");
        return;
      }
      onLoadPayload(parsed);
      onClose();
    } catch {
      setImportError("Could not read that file.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Save and share your label design"
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-zinc-950">Save &amp; Share Label Design</h3>
            <p className="text-xs text-zinc-600">Changes auto-save automatically in this browser.</p>
          </div>
          <button
            type="button"
            aria-label="Close save modal"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => void handleCopyShareLink()}
              className="flex items-center gap-2.5 rounded-2xl bg-[#4d7c0f] px-4 py-3 text-left text-white hover:bg-[#3f6212] cursor-pointer"
            >
              <Link2 className="h-4 w-4 shrink-0" />
              <div>
                <span className="block text-xs font-bold">Copy share link</span>
                <span className="block text-[10px] text-lime-100">Open on another device</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                downloadLabelDesignJson(
                  payload,
                  `label-design-${(payload.labelTitle || "sticker").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`
                );
                setShareMsg("Downloaded label backup (.json) with all images included.");
              }}
              className="flex items-center gap-2.5 rounded-2xl bg-amber-500 px-4 py-3 text-left text-zinc-950 hover:bg-amber-600 cursor-pointer"
            >
              <Save className="h-4 w-4 shrink-0" />
              <div>
                <span className="block text-xs font-bold">Save design file</span>
                <span className="block text-[10px] text-zinc-800">Full backup (.json)</span>
              </div>
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 rounded-2xl bg-[#f5f5f7] px-3.5 py-2.5">
            <span className="text-xs text-zinc-700">Have a saved <strong>.json</strong> label file?</span>
            <input
              ref={jsonInputRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(e) => {
                void handleImportJson(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => jsonInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50 cursor-pointer"
            >
              <FolderOpen className="h-3.5 w-3.5" />
              Load file
            </button>
          </div>

          {shareMsg && <p className="rounded-xl bg-[#eef6e4] px-3.5 py-2.5 text-xs font-medium text-[#365314]">{shareMsg}</p>}
          {importError && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">{importError}</p>}

          <div className="space-y-2.5 border-t border-zinc-200 pt-4">
            <p className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
              <Bookmark className="h-3.5 w-3.5 text-[#4d7c0f]" />
              Saved label versions in this browser
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={snapName}
                onChange={(e) => setSnapName(e.target.value)}
                placeholder="Version name (e.g. Kraft Candle Seal)"
                className="h-9 min-w-0 flex-1 rounded-xl bg-[#f5f5f7] px-3 text-xs text-zinc-900 focus:bg-white focus:outline-2 focus:outline-[#4d7c0f]"
              />
              <button
                type="button"
                onClick={() => {
                  setSnapshots(saveLabelSnapshot(snapName, payload));
                  setShareMsg(`Saved "${snapName.trim() || "Label design"}" in this browser.`);
                }}
                className="inline-flex h-9 shrink-0 items-center gap-1 rounded-xl bg-zinc-900 px-3.5 text-xs font-bold text-white hover:bg-zinc-800 cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
                Save
              </button>
            </div>
            {snapshots.length === 0 ? (
              <p className="text-[11px] text-zinc-500">No saved label versions yet.</p>
            ) : (
              <ul className="max-h-44 space-y-1.5 overflow-y-auto">
                {snapshots.map((snap) => (
                  <li key={snap.id} className="flex items-center justify-between gap-2 rounded-xl bg-[#f5f5f7] px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-zinc-900">{snap.name}</p>
                      <p className="text-[10px] text-zinc-500">{new Date(snap.savedAt).toLocaleString()}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onLoadPayload(snap.payload);
                          onClose();
                        }}
                        className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-[#365314] ring-1 ring-zinc-200 hover:bg-[#eef6e4] cursor-pointer"
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${snap.name}`}
                        onClick={() => setSnapshots(deleteLabelSnapshot(snap.id))}
                        className="grid h-7 w-7 place-items-center rounded-lg text-zinc-500 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
