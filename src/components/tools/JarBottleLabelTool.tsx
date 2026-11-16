"use client";

import React, { useMemo, useState } from "react";
import { AlertTriangle, Download, Loader2, Scissors, X } from "lucide-react";
import type { PageId } from "@/types/spec";
import {
  checkGridFit,
  fileToDataUrl,
  getImageNaturalSize,
  PAPER_SIZES,
  PRINTER_SAFE_MARGIN_MM,
} from "@/lib/pdf-utils";
import { useNumberField } from "@/lib/use-number-field";
import {
  FieldHint,
  MobileActionBar,
  PrintTipsPanel,
  primaryButtonClass,
  StepHeader,
  ToolStatus,
  UploadDropzone,
  type ToolStatusValue,
} from "@/components/tools/ui/ToolUi";
import {
  hexToRgb,
  makeMeasure,
  useLabelMeasure,
  fillReachesEdge,
  effectiveStyle,
  buildLabelScene,
  drawLabelScene,
  LabelArt,
  LabelStylePicker,
  FontPairPicker,
  ColourSwatchPicker,
  type LabelStyleId,
  type FontPairId,
  type LabelPrim,
  type LabelDesign,
} from "@/components/tools/ui/LabelDesign";

const WRAP_OVERLAP_MM = 10;
type SheetPaper = "a4" | "letter";

interface ContainerPreset {
  id: string;
  /** What kind of container/spot this goes on — shown as a small tag. */
  kind: string;
  /** Plain-language name, e.g. "Wide-mouth lid". */
  name: string;
  wMm: number;
  hMm: number;
  cols: number;
  rows: number;
  round?: boolean;
  defaultTitle: string;
  defaultSub: string;
  defaultMeta: string;
}

function getPresets(pageId: PageId): ContainerPreset[] {
  switch (pageId) {
    case "T25":
      return [
        {
          id: "mason-reg-lid",
          kind: "Lid circle",
          name: "Regular-mouth lid",
          wMm: 60,
          hMm: 60,
          cols: 3,
          rows: 4,
          round: true,
          defaultTitle: "Dill Pickles",
          defaultSub: "Batch #04 · Pantry",
          defaultMeta: "Canned: Oct 2026",
        },
        {
          id: "mason-wide-lid",
          kind: "Lid circle",
          name: "Wide-mouth lid",
          wMm: 76,
          hMm: 76,
          cols: 2,
          rows: 3,
          round: true,
          defaultTitle: "Whole Peaches",
          defaultSub: "Light Syrup · 16 oz",
          defaultMeta: "Best By: Oct 2027",
        },
        {
          id: "mason-body",
          kind: "Jar front",
          name: "Mason jar front",
          wMm: 90,
          hMm: 55,
          cols: 2,
          rows: 5,
          defaultTitle: "Homemade Salsa",
          defaultSub: "Tomatoes, Onion, Lime, Salt",
          defaultMeta: "Processed: 12 Oct 2026",
        },
      ];
    case "T26":
      return [
        {
          id: "jam-classic",
          kind: "Jar front",
          name: "Jam jar front",
          wMm: 85,
          hMm: 50,
          cols: 2,
          rows: 5,
          defaultTitle: "Strawberry Jam",
          defaultSub: "Strawberries, Sugar, Lemon Juice",
          defaultMeta: "Best Before: Sep 2027 · 220 g",
        },
        {
          id: "jam-lid",
          kind: "Lid circle",
          name: "Jam jar lid",
          wMm: 50,
          hMm: 50,
          cols: 3,
          rows: 5,
          round: true,
          defaultTitle: "Raspberry Jelly",
          defaultSub: "Small Batch Kitchen",
          defaultMeta: "Autumn Harvest",
        },
        {
          id: "marmalade",
          kind: "Jar front",
          name: "Tall jar front",
          wMm: 70,
          hMm: 65,
          cols: 2,
          rows: 4,
          defaultTitle: "Seville Marmalade",
          defaultSub: "Oranges, Cane Sugar, Water",
          defaultMeta: "Batch 11 · Check local rules",
        },
      ];
    case "T27":
      return [
        {
          id: "spice-round",
          kind: "Spice jar",
          name: "Spice jar lid",
          wMm: 38,
          hMm: 38,
          cols: 4,
          rows: 6,
          round: true,
          defaultTitle: "Smoked Paprika",
          defaultSub: "Pantry · Mild",
          defaultMeta: "Refilled: 2026",
        },
        {
          id: "spice-rect",
          kind: "Spice jar",
          name: "Spice jar front",
          wMm: 60,
          hMm: 35,
          cols: 3,
          rows: 7,
          defaultTitle: "Ground Cumin",
          defaultSub: "Warm Earthy Blend",
          defaultMeta: "A–Z Rack",
        },
      ];
    case "T28":
      return [
        {
          id: "candle-front",
          kind: "Candle",
          name: "Candle jar front",
          wMm: 75,
          hMm: 60,
          cols: 2,
          rows: 4,
          defaultTitle: "Cedar & Bergamot",
          defaultSub: "Hand-Poured Soy Wax · 8 oz (226 g)",
          defaultMeta: "Burn time ~45 hrs · Burn within sight",
        },
        {
          id: "candle-wrap",
          kind: "Wrap-around band",
          name: "Candle jar wrap",
          wMm: 180,
          hMm: 50,
          cols: 1,
          rows: 5,
          defaultTitle: "Evening Linen",
          defaultSub: "100% Soy Wax · 220 g Net Wt",
          defaultMeta: "Trim wick to 5 mm. Keep away from drafts & pets.",
        },
        {
          id: "candle-warn",
          kind: "Candle",
          name: "Safety sticker (base)",
          wMm: 45,
          hMm: 45,
          cols: 4,
          rows: 5,
          round: true,
          defaultTitle: "CANDLE SAFETY",
          defaultSub: "Trim wick to 5 mm. Never leave burning unattended.",
          defaultMeta: "Check local warning rules",
        },
      ];
    case "T29":
      return [
        {
          id: "bottle-front",
          kind: "Bottle",
          name: "Bottle front",
          wMm: 90,
          hMm: 110,
          cols: 2,
          rows: 2,
          defaultTitle: "Cold-Pressed Apple",
          defaultSub: "100% Orchard Apples · 500 ml",
          defaultMeta: "Keep Refrigerated · Shake Well",
        },
        {
          id: "bottle-wrap",
          kind: "Wrap-around band",
          name: "Juice / sauce bottle wrap",
          wMm: 190,
          hMm: 65,
          cols: 1,
          rows: 4,
          defaultTitle: "Ginger Citrus Tonic",
          defaultSub: "Water, Ginger Root, Lemon, Raw Honey",
          defaultMeta: "330 ml · Batch 08 · Best Before Nov 2026",
        },
        {
          id: "bottle-small",
          kind: "Bottle",
          name: "Small sauce / oil bottle",
          wMm: 60,
          hMm: 80,
          cols: 3,
          rows: 3,
          defaultTitle: "Chili Garlic Oil",
          defaultSub: "Cold-Infused · 150 ml",
          defaultMeta: "Store in cool dark place",
        },
      ];
    case "T30":
      return [
        {
          id: "vial-10ml",
          kind: "Vial",
          name: "10 ml dropper bottle",
          wMm: 55,
          hMm: 25,
          cols: 3,
          rows: 9,
          defaultTitle: "Lavender Oil",
          defaultSub: "Lavandula angustifolia · 10 ml",
          defaultMeta: "External use only · Keep from children",
        },
        {
          id: "vial-15ml",
          kind: "Vial",
          name: "15 ml dropper bottle",
          wMm: 68,
          hMm: 32,
          cols: 2,
          rows: 8,
          defaultTitle: "Peppermint Blend",
          defaultSub: "100% Pure Essential Oil · 15 ml",
          defaultMeta: "Dilute before skin contact",
        },
        {
          id: "vial-5ml",
          kind: "Vial",
          name: "5 ml sample vial",
          wMm: 45,
          hMm: 20,
          cols: 4,
          rows: 11,
          defaultTitle: "Rosehip Serum",
          defaultSub: "Botanical Face Oil · 5 ml",
          defaultMeta: "Batch #19 · Patch test first",
        },
      ];
    case "T24":
    default:
      return [
        {
          id: "jar-front",
          kind: "Jar front",
          name: "Jar front",
          wMm: 85,
          hMm: 50,
          cols: 2,
          rows: 5,
          defaultTitle: "Rolled Oats",
          defaultSub: "Wholegrain Pantry Staple",
          defaultMeta: "Filled: Oct 2026",
        },
        {
          id: "jar-lid",
          kind: "Lid circle",
          name: "Jar lid",
          wMm: 55,
          hMm: 55,
          cols: 3,
          rows: 4,
          round: true,
          defaultTitle: "Brown Rice",
          defaultSub: "Long Grain",
          defaultMeta: "20 min simmer",
        },
        {
          id: "jar-wrap",
          kind: "Wrap-around band",
          name: "Jar wrap",
          wMm: 185,
          hMm: 45,
          cols: 1,
          rows: 5,
          defaultTitle: "Spiced Apple Butter",
          defaultSub: "Apples, Cinnamon, Cloves, Cider",
          defaultMeta: "Keep chilled after opening",
        },
      ];
  }
}

const DEFAULT_SPICE_LIST = [
  "Allspice",
  "Basil",
  "Black Pepper",
  "Cardamom",
  "Cayenne",
  "Chili Flakes",
  "Cinnamon",
  "Cloves",
  "Coriander",
  "Cumin",
  "Curry Powder",
  "Fennel Seeds",
  "Garlic Powder",
  "Ginger",
  "Nutmeg",
  "Onion Powder",
  "Oregano",
  "Paprika",
  "Rosemary",
  "Sage",
  "Thyme",
  "Turmeric",
];


/* ------------------------------------------------------------------------- */
/* Label design engine                                                        */
/*                                                                            */
/* One layout pass produces a list of primitives in label-local millimetres.  */
/* The PDF renderer and the SVG preview both draw that same list, so line     */
/* breaks, sizes and positions match. Exported for LabelSheetTool.           */
interface SheetLayout {
  cols: number;
  rows: number;
  gap: number;
  startX: number;
  startY: number;
  reduced: boolean;
}

/**
 * Centres the preset grid on the paper with at least PRINTER_SAFE_MARGIN_MM on
 * every side. Tightens the gap (5 → 2 mm) before dropping rows/cols, and only
 * drops what checkGridFit says cannot fit.
 */
function computeSheetLayout(paperW: number, paperH: number, w: number, h: number, cols: number, rows: number): SheetLayout {
  const base = {
    paperW,
    paperH,
    cols,
    rows,
    itemW: w,
    itemH: h,
    marginX: PRINTER_SAFE_MARGIN_MM,
    marginY: PRINTER_SAFE_MARGIN_MM,
    centered: true,
  };
  let gap = 5;
  let c = cols;
  let r = rows;
  let reduced = false;
  const found = [5, 4, 3, 2].find((g) => checkGridFit({ ...base, gapX: g, gapY: g }).fits);
  if (found !== undefined) {
    gap = found;
  } else {
    gap = 3;
    const f = checkGridFit({ ...base, gapX: gap, gapY: gap });
    c = Math.min(cols, f.maxCols);
    r = Math.min(rows, f.maxRows);
    reduced = true;
  }
  const usedW = c * w + Math.max(0, c - 1) * gap;
  const usedH = r * h + Math.max(0, r - 1) * gap;
  return { cols: c, rows: r, gap, startX: (paperW - usedW) / 2, startY: (paperH - usedH) / 2, reduced };
}

const SUBTITLE_COPY: Partial<Record<PageId, { label: string; placeholder: string }>> = {
  T24: { label: "Description", placeholder: "e.g. Wholegrain · 500 g" },
  T25: { label: "Contents or ingredients", placeholder: "e.g. Cucumbers, dill, garlic" },
  T26: { label: "Ingredients", placeholder: "e.g. Strawberries, sugar, lemon" },
  T27: { label: "Description", placeholder: "e.g. Mild · smoky" },
  T28: { label: "Scent or wax", placeholder: "e.g. Soy wax · 8 oz" },
  T29: { label: "Ingredients or size", placeholder: "e.g. 100% apples · 500 ml" },
  T30: { label: "Oil name & size", placeholder: "e.g. Lavandula angustifolia · 10 ml" },
};

const PAPER_NAME: Record<SheetPaper, string> = { a4: "A4", letter: "US Letter" };
const BACKGROUND_SWATCHES = [
  { name: "Cream", hex: "#f6efe1" },
  { name: "Sage", hex: "#e3ebd8" },
  { name: "Blush", hex: "#f6e2dc" },
  { name: "Sky", hex: "#dde8f2" },
  { name: "Butter", hex: "#f8efc4" },
  { name: "Charcoal", hex: "#2b2b2e" },
];
const labelCls = "block text-xs font-semibold text-zinc-800 mb-1";
const textFieldCls = "w-full min-h-[40px] rounded-xl bg-[#f5f5f7] px-3 py-2 text-sm text-zinc-950";
const sectionCls = "pt-6 first:pt-0 border-t border-[#ebeced] first:border-t-0";

function presetSize(p: { wMm: number; hMm: number; round?: boolean }): string {
  return p.round ? `${p.wMm} mm circle` : `${p.wMm} × ${p.hMm} mm`;
}

/** Tiny outline of the label shape so presets are recognisable at a glance. */
function ShapeIcon({ w, h, round, active }: { w: number; h: number; round: boolean; active: boolean }) {
  const max = 26;
  const scale = max / Math.max(w, h);
  const iw = Math.max(8, Math.round(w * scale));
  const ih = Math.max(5, Math.round(h * scale));
  return (
    <span aria-hidden="true" className="inline-flex h-7 w-7 shrink-0 items-center justify-center">
      <span
        className={`block border-[1.5px] ${round ? "rounded-full" : "rounded-[3px]"} ${
          active ? "border-[#4d7c0f] bg-white" : "border-zinc-400 bg-white"
        }`}
        style={{ width: iw, height: ih }}
      />
    </span>
  );
}

/* ------------------------------------------------------------------------- */
/* Component                                                                  */
/* ------------------------------------------------------------------------- */

export function JarBottleLabelTool({ pageId }: { pageId: PageId }) {
  const presets = useMemo(() => getPresets(pageId), [pageId]);
  const [selectedId, setSelectedId] = useState(presets[0].id);
  const preset = presets.find((p) => p.id === selectedId) ?? presets[0];
  const isWrap = preset.id.endsWith("-wrap");

  const [paper, setPaper] = useState<SheetPaper>("a4");
  const [title, setTitle] = useState(preset.defaultTitle);
  const [subtitle, setSubtitle] = useState(preset.defaultSub);
  const [metaLine, setMetaLine] = useState(preset.defaultMeta);
  const [accentHex, setAccentHex] = useState("#3f6212");
  const [frameStyle, setFrameStyle] = useState<LabelStyleId>("bordered");
  const [fontPair, setFontPair] = useState<FontPairId>("modern");
  const [logo, setLogo] = useState<{ src: string; w: number; h: number } | null>(null);
  const [bgOn, setBgOn] = useState(false);
  const [bgHex, setBgHex] = useState("#f6efe1");
  const [showCutLines, setShowCutLines] = useState(true);
  const [useMultiSpices, setUseMultiSpices] = useState(pageId === "T27");
  const [spiceListText, setSpiceListText] = useState(DEFAULT_SPICE_LIST.join("\n"));
  const [measureMode, setMeasureMode] = useState<"around" | "across">("around");
  const [jarDiameterMm, setJarDiameterMm] = useState(60);
  const [jarAroundMm, setJarAroundMm] = useState(188);
  const [customWrapW, setCustomWrapW] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState<(ToolStatusValue & { key: string }) | null>(null);

  const paperDim = PAPER_SIZES[paper];
  const paperName = PAPER_NAME[paper];
  const wMm = isWrap && customWrapW ? customWrapW : preset.wMm;
  const hMm = preset.hMm;
  const round = !!preset.round;
  const effectiveFrame = effectiveStyle(frameStyle, round);
  const measure = useLabelMeasure();

  const layout = computeSheetLayout(paperDim.widthMm, paperDim.heightMm, wMm, hMm, preset.cols, preset.rows);
  const perSheet = layout.cols * layout.rows;
  // Small print only where there's room for a readable line.
  const showMeta = hMm >= 28;

  const diameterF = useNumberField(jarDiameterMm, (v) => setJarDiameterMm(Math.round(v)), {
    min: 20,
    max: 150,
    step: 1,
    unit: "mm",
  });
  const aroundF = useNumberField(jarAroundMm, (v) => setJarAroundMm(Math.round(v)), {
    min: 60,
    max: 470,
    step: 1,
    unit: "mm",
  });
  const wrapLenMm =
    measureMode === "around"
      ? Math.round(jarAroundMm + WRAP_OVERLAP_MM)
      : Math.round(Math.PI * jarDiameterMm + WRAP_OVERLAP_MM);
  const printableW = Math.round((paperDim.widthMm - 2 * PRINTER_SAFE_MARGIN_MM) * 10) / 10;
  const wrapTooLong = wrapLenMm > printableW;
  const measureField = measureMode === "around" ? aroundF : diameterF;
  const containerWord = pageId === "T29" ? "bottle" : "jar";

  const spiceNames = useMemo(
    () =>
      spiceListText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    [spiceListText]
  );
  const multi = pageId === "T27" && useMultiSpices && spiceNames.length > 0;
  const labelCount = multi ? spiceNames.length : perSheet;
  const pageCount = perSheet > 0 ? Math.ceil(labelCount / perSheet) : 0;
  const summary = `${labelCount} label${labelCount === 1 ? "" : "s"} · ${pageCount} page${pageCount === 1 ? "" : "s"}`;
  const previewTitle = multi ? spiceNames[0] : title;
  const background = bgOn ? hexToRgb(bgHex) : null;
  const design: Omit<LabelDesign, "title"> = {
    w: wMm,
    h: hMm,
    round,
    style: effectiveFrame,
    accent: hexToRgb(accentHex),
    background,
    fonts: fontPair,
    subtitle,
    meta: showMeta ? metaLine : "",
    logo,
  };
  const previewPrims = buildLabelScene({ ...design, title: previewTitle }, measure);
  const edgeFill = fillReachesEdge(effectiveFrame, round, background);
  const subtitleCopy = SUBTITLE_COPY[pageId] ?? { label: "Second line", placeholder: "e.g. Ingredients or scent" };

  const exportBlocker =
    perSheet < 1
      ? `This ${wMm} × ${hMm} mm label is larger than the printable area of ${paperName}. Pick a smaller size in step 1.`
      : null;

  const inputsKey = JSON.stringify([
    selectedId,
    paper,
    title,
    subtitle,
    metaLine,
    accentHex,
    frameStyle,
    fontPair,
    logo?.src.length ?? 0,
    bgOn && bgHex,
    showCutLines,
    useMultiSpices,
    spiceListText,
    customWrapW,
  ]);
  const visibleStatus = status && status.key === inputsKey ? status : null;

  function handleSelectPreset(p: ContainerPreset) {
    // Keep anything the user typed; only swap fields still showing the old default.
    if (title === preset.defaultTitle) setTitle(p.defaultTitle);
    if (subtitle === preset.defaultSub) setSubtitle(p.defaultSub);
    if (metaLine === preset.defaultMeta) setMetaLine(p.defaultMeta);
    if (p.round && frameStyle === "banner") setFrameStyle("bordered");
    setCustomWrapW(null);
    setSelectedId(p.id);
  }

  function sortSpicesAlphabetically() {
    setSpiceListText([...spiceNames].sort((a, b) => a.localeCompare(b)).join("\n"));
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
        format: [paperDim.widthMm, paperDim.heightMm],
      });
      const pdfMeasure = makeMeasure(doc);
      const scenes = new Map<string, LabelPrim[]>();
      const images = new Map<string, string>();

      for (let page = 0; page < pageCount; page++) {
        if (page > 0) doc.addPage([paperDim.widthMm, paperDim.heightMm], "portrait");
        for (let s = 0; s < perSheet; s++) {
          const idx = page * perSheet + s;
          if (idx >= labelCount) break;
          const r = Math.floor(s / layout.cols);
          const c = s % layout.cols;
          const x = layout.startX + c * (wMm + layout.gap);
          const y = layout.startY + r * (hMm + layout.gap);
          const cx = x + wMm / 2;
          const cy = y + hMm / 2;

          const slotTitle = multi ? spiceNames[idx] : title;
          let prims = scenes.get(slotTitle);
          if (!prims) {
            prims = buildLabelScene({ ...design, title: slotTitle }, pdfMeasure);
            scenes.set(slotTitle, prims);
          }
          await drawLabelScene(doc, prims, x, y, images);

          if (showCutLines) {
            doc.setDrawColor(161, 161, 170);
            doc.setLineWidth(0.25);
            if (round) doc.circle(cx, cy, Math.min(wMm, hMm) / 2);
            else doc.rect(x, y, wMm, hMm);
          }
        }
      }

      doc.save(`jar-bottle-labels-${pageId.toLowerCase()}-${paper}.pdf`);
      setStatus({
        tone: "success",
        text: (
          <>
            <strong>PDF downloaded</strong> — {labelCount} label{labelCount === 1 ? "" : "s"} on {pageCount} {paperName} page
            {pageCount === 1 ? "" : "s"}. Follow the print steps below for the exact size.
          </>
        ),
        key,
      });
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        document.getElementById("jar-download-step")?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  async function handleLogo(files: File[]) {
    const f = files[0];
    if (!f || !f.type.startsWith("image/")) {
      setStatus({ tone: "error", text: "That file isn't an image. Try a PNG or JPG.", key: inputsKey });
      return;
    }
    try {
      const src = await fileToDataUrl(f);
      const size = await getImageNaturalSize(src);
      setLogo({ src, w: size.width, h: size.height });
      setStatus(null);
    } catch {
      setStatus({ tone: "error", text: "Could not read that image. Try a JPG or PNG.", key: inputsKey });
    }
  }

  /* ---- preview: the same primitives as the PDF, drawn as SVG ---- */
  const previewWidth = round ? 240 : Math.round(Math.min(520, Math.max(220, wMm * 3)));
  const downloadLabel = `Download PDF · ${labelCount} label${labelCount === 1 ? "" : "s"}`;
  const pct = (mm: number, of: number) => `${(mm / of) * 100}%`;

  return (
    <div className="rounded-3xl bg-[#f5f5f7] p-2 sm:p-5 lg:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-5 items-start">
        {/* Controls */}
        <div className="order-2 lg:order-1 lg:col-span-5 rounded-2xl bg-white p-4 sm:p-6 space-y-6">
          {/* Step 1 — container */}
          <section className={sectionCls} aria-labelledby="jar-step-1">
            <StepHeader
              id="jar-step-1"
              step={1}
              title="What are you labelling?"
              hint="Pick the spot the label goes. Sizes fit most common containers."
            />
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2" role="group" aria-label="Container label presets">
                {presets.map((p) => {
                  const active = p.id === preset.id;
                  const pw = p.id === preset.id ? wMm : p.wMm;
                  const l = computeSheetLayout(paperDim.widthMm, paperDim.heightMm, pw, p.hMm, p.cols, p.rows);
                  const n = l.cols * l.rows;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => handleSelectPreset(p)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ring-1 transition cursor-pointer ${
                        active ? "bg-[#eef6e4] ring-2 ring-[#4d7c0f]" : "bg-white ring-zinc-200 hover:ring-zinc-300 hover:bg-[#fafafa]"
                      }`}
                    >
                      <ShapeIcon w={p.wMm} h={p.hMm} round={!!p.round} active={active} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{p.kind}</span>
                        <span className="block text-sm font-bold text-zinc-950">{p.name}</span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-xs font-semibold text-zinc-800">{presetSize({ ...p, wMm: pw })}</span>
                        <span className="block text-[11px] text-zinc-600">{n} per sheet</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {isWrap && (
                <div className="rounded-2xl bg-[#f5f5f7] p-3.5 space-y-3">
                  <p className="text-sm font-bold text-zinc-950">Measure your {containerWord}</p>
                  <ol className="space-y-1.5 text-xs text-zinc-700">
                    {[
                      `Wrap a strip of paper around the ${containerWord} where the label will go.`,
                      "Mark where the end meets the strip.",
                      `Lay it flat and measure up to the mark — or measure straight across the ${containerWord} instead.`,
                    ].map((t, i) => (
                      <li key={i} className="flex gap-2 leading-relaxed">
                        <span
                          aria-hidden="true"
                          className="mt-px inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-zinc-700"
                        >
                          {i + 1}
                        </span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ol>
                  <div role="radiogroup" aria-label="How did you measure?" className="flex flex-wrap gap-1 rounded-xl bg-white p-1">
                    {(
                      [
                        ["around", "Around (paper strip)"],
                        ["across", "Across (diameter)"],
                      ] as const
                    ).map(([id, text]) => (
                      <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={measureMode === id}
                        onClick={() => setMeasureMode(id)}
                        className={`min-h-[34px] flex-1 rounded-lg px-3 text-xs font-semibold transition cursor-pointer ${
                          measureMode === id ? "bg-[#4d7c0f] text-white" : "text-zinc-700 hover:bg-[#f5f5f7]"
                        }`}
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-end gap-2">
                    <div>
                      <label htmlFor={measureMode === "around" ? "jar-around-mm" : "jar-diameter-mm"} className={labelCls}>
                        {measureMode === "around" ? `Distance around the ${containerWord} (mm)` : `${containerWord === "bottle" ? "Bottle" : "Jar"} diameter (mm)`}
                      </label>
                      <input
                        key={measureMode}
                        id={measureMode === "around" ? "jar-around-mm" : "jar-diameter-mm"}
                        type="number"
                        {...measureField.inputProps}
                        aria-describedby="jar-wrap-hint"
                        className="w-28 min-h-[40px] rounded-xl bg-white px-3 py-2 text-sm text-zinc-950"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setCustomWrapW(wrapLenMm)}
                      disabled={wrapTooLong || wrapLenMm === wMm}
                      className="min-h-[40px] rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-[#3f6212] ring-1 ring-[#4d7c0f]/40 hover:bg-[#eef6e4] disabled:text-zinc-400 disabled:ring-zinc-200 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Apply to label
                    </button>
                    {customWrapW !== null && (
                      <button
                        type="button"
                        onClick={() => setCustomWrapW(null)}
                        className="min-h-[40px] px-2 text-xs font-semibold text-zinc-600 hover:underline cursor-pointer"
                      >
                        Reset to {preset.wMm} mm
                      </button>
                    )}
                  </div>
                  {measureField.error && <FieldHint tone="error">{measureField.error}</FieldHint>}
                  <p className="text-xs text-zinc-800">
                    Label length: <strong className="text-[#365314]">{wrapLenMm} mm</strong>
                    <span className="text-zinc-600">
                      {" "}
                      ({measureMode === "around" ? `${jarAroundMm}` : `π × ${jarDiameterMm}`} + {WRAP_OVERLAP_MM} mm overlap)
                      {customWrapW === wrapLenMm ? " · applied" : ` · label is now ${wMm} mm`}
                    </span>
                  </p>
                  <FieldHint id="jar-wrap-hint" tone={wrapTooLong ? "error" : "muted"}>
                    {wrapTooLong
                      ? `${wrapLenMm} mm is longer than the printable width of ${paperName} (${printableW} mm). Use a smaller jar, or print the wrap in two pieces.`
                      : `We add ${WRAP_OVERLAP_MM} mm of overlap so the two ends tuck over each other at the back — no gap showing.`}
                  </FieldHint>
                </div>
              )}

              <div>
                <span id="jar-paper-label" className={labelCls}>
                  Sheet size
                </span>
                <div role="radiogroup" aria-labelledby="jar-paper-label" className="inline-flex rounded-xl bg-[#f5f5f7] p-1">
                  {(["a4", "letter"] as SheetPaper[]).map((pp) => (
                    <button
                      key={pp}
                      type="button"
                      role="radio"
                      aria-checked={paper === pp}
                      onClick={() => setPaper(pp)}
                      className={`min-h-[36px] rounded-lg px-4 text-sm font-semibold transition cursor-pointer ${
                        paper === pp ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-600 hover:text-zinc-900"
                      }`}
                    >
                      {PAPER_NAME[pp]}
                    </button>
                  ))}
                </div>
                <div className="mt-1.5">
                  <FieldHint>Print on full-page sticker paper, then cut out each label.</FieldHint>
                </div>
              </div>
            </div>
          </section>

          {/* Step 2 — text */}
          <section className={sectionCls} aria-labelledby="jar-step-2">
            <StepHeader
              id="jar-step-2"
              step={2}
              title="Your text"
              hint="Long text shrinks to fit. Leave a box empty to skip that line."
            />
            <div className="space-y-4">
              {pageId === "T27" && (
                <div className="rounded-2xl bg-[#f5f5f7] p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="inline-flex items-center gap-2 min-h-[36px] text-sm font-semibold text-zinc-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useMultiSpices}
                        onChange={(e) => setUseMultiSpices(e.target.checked)}
                        className="accent-[#4d7c0f] h-4 w-4"
                      />
                      One label per spice
                    </label>
                    {useMultiSpices && (
                      <button
                        type="button"
                        onClick={sortSpicesAlphabetically}
                        className="min-h-[32px] text-xs font-semibold text-[#3f6212] hover:underline px-2 cursor-pointer"
                      >
                        Sort A–Z
                      </button>
                    )}
                  </div>
                  {useMultiSpices && (
                    <>
                      <textarea
                        id="jar-spice-list"
                        aria-label="Spice names, one per line"
                        aria-describedby="jar-spice-hint"
                        rows={5}
                        value={spiceListText}
                        onChange={(e) => setSpiceListText(e.target.value)}
                        className="w-full rounded-xl bg-white px-3 py-2 text-sm text-zinc-950"
                      />
                      <FieldHint id="jar-spice-hint">
                        <strong>One per line — each line becomes one label.</strong> The name replaces the title below.
                      </FieldHint>
                      <p className="text-xs font-semibold text-[#3f6212]" aria-live="polite">
                        {spiceNames.length > 0
                          ? `${spiceNames.length} spice${spiceNames.length === 1 ? "" : "s"} → ${summary}`
                          : "List is empty — the name below is used instead."}
                      </p>
                    </>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="jar-label-title" className={labelCls}>
                  {pageId === "T27" ? "Spice name" : "Product name"}
                </label>
                <input
                  id="jar-label-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={multi}
                  className={`${textFieldCls} disabled:text-zinc-400`}
                />
                {multi && (
                  <div className="mt-1.5">
                    <FieldHint>Using the names from your spice list instead.</FieldHint>
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="jar-label-subtitle" className={labelCls}>
                  {subtitleCopy.label} <span className="font-normal text-zinc-500">(optional)</span>
                </label>
                <input
                  id="jar-label-subtitle"
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder={subtitleCopy.placeholder}
                  className={textFieldCls}
                />
              </div>
              <div>
                <label htmlFor="jar-label-meta" className={labelCls}>
                  Small print <span className="font-normal text-zinc-500">(date, batch, weight…)</span>
                </label>
                <input
                  id="jar-label-meta"
                  type="text"
                  value={metaLine}
                  onChange={(e) => setMetaLine(e.target.value)}
                  aria-describedby={!showMeta && metaLine.trim() ? "jar-meta-hint" : undefined}
                  className={textFieldCls}
                />
                {!showMeta && metaLine.trim() && (
                  <div className="mt-1.5">
                    <FieldHint id="jar-meta-hint" tone="warning">
                      Too small to print on {hMm} mm-tall labels — it will be left off.
                    </FieldHint>
                  </div>
                )}
              </div>
              <div>
                <span className={labelCls}>
                  Logo or picture <span className="font-normal text-zinc-500">(optional)</span>
                </span>
                {logo ? (
                  <div className="flex items-center gap-3 rounded-xl bg-[#f5f5f7] p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logo.src} alt="Your logo" className={`h-12 w-12 bg-white object-contain p-1 ${round ? "rounded-full" : "rounded-lg"}`} />
                    <p className="min-w-0 flex-1 text-xs text-zinc-700">
                      Placed {round ? "above the name, kept inside the circle" : wMm / hMm > 2 ? "to the left of the name" : "above the name"}.
                    </p>
                    <button
                      type="button"
                      onClick={() => setLogo(null)}
                      className="inline-flex min-h-[36px] items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-zinc-700 hover:bg-white cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                      Remove
                    </button>
                  </div>
                ) : (
                  <UploadDropzone
                    compact
                    onFiles={handleLogo}
                    title="Add a logo"
                    buttonLabel="Choose image"
                    inputLabel="Upload a logo or picture for the label"
                    hint="PNG with a transparent background looks best · stays on your device"
                  />
                )}
              </div>
            </div>
          </section>

          {/* Step 3 — style */}
          <section className={sectionCls} aria-labelledby="jar-step-3">
            <StepHeader id="jar-step-3" step={3} title="Style" hint="Pick a design, fonts and colours. The preview updates as you go." />
            <div className="space-y-5">
              <LabelStylePicker
                name="jar-frame"
                value={frameStyle}
                onChange={setFrameStyle}
                measure={measure}
                sample={{ ...design, title: previewTitle }}
              />
              <FontPairPicker name="jar-fonts" value={fontPair} onChange={setFontPair} />
              <div>
                <ColourSwatchPicker label="Colour" value={accentHex} onChange={setAccentHex} hintId="jar-colour-hint" />
                <div className="mt-1.5">
                  <FieldHint id="jar-colour-hint">Used for borders, bands and accents.</FieldHint>
                </div>
              </div>
              <div className="rounded-2xl bg-[#f5f5f7] p-3.5 space-y-3">
                <label className="inline-flex items-center gap-2 min-h-[36px] text-sm font-semibold text-zinc-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bgOn}
                    onChange={(e) => setBgOn(e.target.checked)}
                    className="accent-[#4d7c0f] h-4 w-4"
                  />
                  Background colour
                </label>
                {bgOn && (
                  <div className="[&_label]:bg-white">
                    <ColourSwatchPicker
                      label="Fill"
                      value={bgHex}
                      onChange={setBgHex}
                      swatches={BACKGROUND_SWATCHES}
                    />
                  </div>
                )}
                {edgeFill && (
                  <FieldHint>
                    Colour runs right up to the cut line. For full-colour edges, print slightly larger or trim just inside the line.
                  </FieldHint>
                )}
              </div>
              <div>
                <label className="inline-flex items-center gap-2 min-h-[36px] text-sm font-medium text-zinc-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCutLines}
                    onChange={(e) => setShowCutLines(e.target.checked)}
                    aria-describedby="jar-cut-hint"
                    className="accent-[#4d7c0f] h-4 w-4"
                  />
                  <Scissors className="h-3.5 w-3.5 text-zinc-600" aria-hidden="true" />
                  Print cut lines
                </label>
                <div className="pl-6">
                  <FieldHint id="jar-cut-hint">A thin grey outline to cut along. Turn it off if you use pre-cut labels.</FieldHint>
                </div>
              </div>
            </div>
          </section>

          {/* Step 4 — download */}
          <section id="jar-download-step" className={sectionCls} aria-labelledby="jar-step-4">
            <StepHeader
              id="jar-step-4"
              step={4}
              title="Download & print"
              hint={`You'll get a PDF sized exactly to ${paperName} — ${summary}.`}
            />
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExporting || !!exportBlocker}
                aria-describedby={exportBlocker ? "jar-export-blocker" : undefined}
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
                <FieldHint id="jar-export-blocker" tone="error">
                  {exportBlocker}
                </FieldHint>
              )}
              <ToolStatus status={visibleStatus} />
              <PrintTipsPanel
                paperLabel={paperName}
                open={visibleStatus?.tone === "success"}
                extraSteps={["For glossy or waterproof labels, use vinyl/sticker paper and your printer's 'Glossy' setting."]}
                cutStep="Cut along the outline (round labels: use scissors or a circle punch)."
              />
              <div className="rounded-xl bg-[#f5f5f7] px-3.5 py-2.5 text-[11px] text-zinc-700 flex items-start gap-2">
                <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0 text-amber-700" aria-hidden="true" />
                <span className="leading-relaxed">
                  Selling food, candles, oils or cosmetics? Check local labelling rules for weights, allergens, batch codes and
                  safety warnings before printing.
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Preview */}
        <div className="order-1 lg:order-2 lg:col-span-7 lg:sticky lg:top-24 rounded-2xl bg-white p-4 sm:p-8 flex flex-col items-center justify-center gap-4 lg:min-h-[420px]">
          <div className="w-full flex items-center justify-between gap-2 text-xs">
            <span className="font-bold text-zinc-950">Preview</span>
            <span className="text-zinc-600">
              {preset.name} · {presetSize({ wMm, hMm, round })}
            </span>
          </div>
          <div className="rounded-2xl bg-[#f5f5f7] p-4 sm:p-6 w-full flex items-center justify-center">
            <div
              className={`relative bg-white overflow-hidden ${round ? "rounded-full" : "rounded-[3px]"} ${
                round ? "max-lg:max-w-[min(100%,190px)]" : ""
              }`}
              style={{
                width: `min(100%, ${previewWidth}px)`,
                aspectRatio: `${wMm} / ${hMm}`,
                containerType: "inline-size",
                outline: showCutLines ? "1px dashed #a1a1aa" : undefined,
              }}
            >
              <LabelArt prims={previewPrims} w={wMm} h={hMm} />
            </div>
          </div>

          {/* Whole-sheet thumbnail */}
          <div className="w-full flex items-center gap-4 rounded-2xl bg-[#fafafa] p-3 ring-1 ring-[#ebeced]">
            <div
              role="img"
              aria-label={`${perSheet} labels arranged ${layout.cols} across by ${layout.rows} down on ${paperName}`}
              className="relative shrink-0 bg-white shadow-sm ring-1 ring-zinc-200"
              style={{ width: 92, aspectRatio: `${paperDim.widthMm} / ${paperDim.heightMm}` }}
            >
              {Array.from({ length: perSheet }).map((_, s) => {
                const r = Math.floor(s / layout.cols);
                const c = s % layout.cols;
                const x = layout.startX + c * (wMm + layout.gap);
                const y = layout.startY + r * (hMm + layout.gap);
                const used = s < labelCount;
                return (
                  <span
                    key={s}
                    className={`absolute block overflow-hidden ${round ? "rounded-full" : "rounded-[1px]"} ${
                      used ? "bg-[#eef6e4]" : "bg-zinc-100"
                    }`}
                    style={{
                      left: pct(x, paperDim.widthMm),
                      top: pct(y, paperDim.heightMm),
                      width: pct(wMm, paperDim.widthMm),
                      height: pct(hMm, paperDim.heightMm),
                      boxShadow: used ? `inset 0 0 0 1px ${accentHex}` : undefined,
                    }}
                  />
                );
              })}
            </div>
            <div className="min-w-0 text-xs text-zinc-700 space-y-1">
              <p className="text-sm font-bold text-zinc-950">
                {perSheet} labels on {paperName}
              </p>
              <p>
                {layout.cols} across × {layout.rows} down, centred on the page.
              </p>
              {layout.reduced && perSheet > 0 && (
                <p className="text-amber-800">
                  Reduced from {preset.cols} × {preset.rows} so every label stays inside the printable area.
                </p>
              )}
              {pageCount > 1 && <p className="font-semibold text-[#3f6212]">{summary}</p>}
            </div>
          </div>
        </div>
      </div>

      <MobileActionBar summary={exportBlocker ? "Can't download yet — see step 1" : `${labelCount} label${labelCount === 1 ? "" : "s"} · ${paperName}${pageCount > 1 ? ` · ${pageCount} pages` : ""}`}>
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
