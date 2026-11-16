"use client";

import React, { useMemo, useState } from "react";
import { AlertTriangle, Download, Scissors } from "lucide-react";
import type { PageId } from "@/types/spec";
import { PAPER_SIZES, type PaperSizeId } from "@/lib/pdf-utils";

interface ContainerPreset {
  id: string;
  label: string;
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
          label: "Regular Mouth Lid (60 mm)",
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
          label: "Wide Mouth Lid (76 mm)",
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
          label: "Jar Front Label (90 × 55 mm)",
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
          label: "Classic Jam Front (85 × 50 mm)",
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
          label: "Jar Lid Seal (50 mm)",
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
          label: "Tall Preserve (70 × 65 mm)",
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
          label: "Spice Lid Round (38 mm)",
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
          label: "Spice Jar Front (60 × 35 mm)",
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
          label: "Candle Jar Front (75 × 60 mm)",
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
          label: "Candle Wrap (180 × 50 mm)",
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
          label: "Bottom Warning Circle (45 mm)",
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
          label: "Glass Bottle Front (90 × 110 mm)",
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
          label: "Full Wrap Juice/Sauce (190 × 65 mm)",
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
          label: "Small Sauce/Oil (60 × 80 mm)",
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
          label: "10 ml Dropper Vial (55 × 25 mm)",
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
          label: "15 ml Apothecary (68 × 32 mm)",
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
          label: "5 ml Sample Vial (45 × 20 mm)",
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
          label: "Jar Front (85 × 50 mm)",
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
          label: "Round Jar Lid (55 mm)",
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
          label: "Jar Wrap (185 × 45 mm)",
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

export function JarBottleLabelTool({ pageId }: { pageId: PageId }) {
  const presets = useMemo(() => getPresets(pageId), [pageId]);
  const [selectedId, setSelectedId] = useState(presets[0].id);
  const preset = presets.find((p) => p.id === selectedId) ?? presets[0];

  const [paper, setPaper] = useState<PaperSizeId>("a4");
  const [title, setTitle] = useState(preset.defaultTitle);
  const [subtitle, setSubtitle] = useState(preset.defaultSub);
  const [metaLine, setMetaLine] = useState(preset.defaultMeta);
  const [accentHex, setAccentHex] = useState("#3f6212");
  const [frameStyle, setFrameStyle] = useState<"bordered" | "banner" | "minimal">(
    "bordered"
  );
  const [showCutLines, setShowCutLines] = useState(true);
  const [useMultiSpices, setUseMultiSpices] = useState(pageId === "T27");
  const [spiceListText, setSpiceListText] = useState(
    DEFAULT_SPICE_LIST.join("\n")
  );
  const [jarDiameterMm, setJarDiameterMm] = useState(65);
  const [isExporting, setIsExporting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const paperDim = PAPER_SIZES[paper];
  const totalSlots = preset.cols * preset.rows;
  const recommendedWrapMm = Math.round(jarDiameterMm * Math.PI - 4);

  function handleSelectPreset(p: ContainerPreset) {
    setSelectedId(p.id);
    setTitle(p.defaultTitle);
    setSubtitle(p.defaultSub);
    setMetaLine(p.defaultMeta);
  }

  function sortSpicesAlphabetically() {
    const sorted = spiceListText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    setSpiceListText(sorted.join("\n"));
  }

  async function handleDownloadPdf() {
    setIsExporting(true);
    setStatusMsg(null);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [paperDim.widthMm, paperDim.heightMm],
      });

      const gapX = 5;
      const gapY = 5;
      const totalW = preset.cols * preset.wMm + (preset.cols - 1) * gapX;
      const totalH = preset.rows * preset.hMm + (preset.rows - 1) * gapY;
      const startX = Math.max(5, (paperDim.widthMm - totalW) / 2);
      const startY = Math.max(5, (paperDim.heightMm - totalH) / 2);

      const cleanHex = accentHex.replace("#", "");
      const num = parseInt(cleanHex, 16);
      const ar = Number.isNaN(num) ? 77 : (num >> 16) & 255;
      const ag = Number.isNaN(num) ? 124 : (num >> 8) & 255;
      const ab = Number.isNaN(num) ? 15 : num & 255;

      const spiceNames = spiceListText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      for (let r = 0; r < preset.rows; r++) {
        for (let c = 0; c < preset.cols; c++) {
          const idx = r * preset.cols + c;
          const x = startX + c * (preset.wMm + gapX);
          const y = startY + r * (preset.hMm + gapY);
          const cx = x + preset.wMm / 2;
          const cy = y + preset.hMm / 2;

          if (showCutLines) {
            doc.setDrawColor(161, 161, 170);
            doc.setLineWidth(0.25);
            if (preset.round) {
              doc.circle(cx, cy, preset.wMm / 2);
            } else {
              doc.rect(x, y, preset.wMm, preset.hMm);
            }
          }

          if (frameStyle === "bordered") {
            doc.setDrawColor(ar, ag, ab);
            doc.setLineWidth(0.5);
            if (preset.round) {
              doc.circle(cx, cy, Math.max(4, preset.wMm / 2 - 2.5));
            } else {
              doc.rect(x + 2, y + 2, preset.wMm - 4, preset.hMm - 4);
            }
          } else if (frameStyle === "banner" && !preset.round) {
            doc.setFillColor(ar, ag, ab);
            doc.rect(x, y, preset.wMm, Math.min(8, preset.hMm * 0.25), "F");
          }

          const slotTitle =
            pageId === "T27" && useMultiSpices && spiceNames.length > 0
              ? spiceNames[idx % spiceNames.length]
              : title;

          const titleFontSize =
            preset.hMm < 26 ? 8.5 : preset.round ? 10 : 12;
          const subFontSize = preset.hMm < 26 ? 5.5 : 7.5;

          doc.setTextColor(9, 9, 11);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(titleFontSize);
          doc.text(slotTitle || "Label", cx, cy - (preset.hMm < 26 ? 1.5 : 3), {
            align: "center",
            maxWidth: preset.wMm - 6,
          });

          if (subtitle.trim()) {
            doc.setTextColor(82, 82, 91);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(subFontSize);
            doc.text(subtitle.trim(), cx, cy + (preset.hMm < 26 ? 2.5 : 3), {
              align: "center",
              maxWidth: preset.wMm - 8,
            });
          }

          if (metaLine.trim() && preset.hMm >= 28) {
            doc.setTextColor(ar, ag, ab);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(6.5);
            doc.text(metaLine.trim(), cx, y + preset.hMm - 4.5, {
              align: "center",
              maxWidth: preset.wMm - 8,
            });
          }
        }
      }

      doc.save(`jar-bottle-labels-${pageId.toLowerCase()}-${paper}.pdf`);
      setStatusMsg(`Downloaded ${totalSlots}-label print-ready PDF.`);
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : "PDF export failed.");
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
          aria-label="Container label presets"
        >
          {presets.map((p) => {
            const active = p.id === preset.id;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={active}
                onClick={() => handleSelectPreset(p)}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
                  active
                    ? "bg-[#4d7c0f] text-white"
                    : "bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced]"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <div className="text-xs font-mono text-zinc-600">
          {totalSlots} per sheet · {preset.wMm} × {preset.hMm} mm
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-5 rounded-2xl bg-white p-5 space-y-4">
          {pageId === "T27" && (
            <div className="rounded-2xl bg-[#f5f5f7] p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-1.5 min-h-[32px] text-xs font-semibold text-zinc-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useMultiSpices}
                    onChange={(e) => setUseMultiSpices(e.target.checked)}
                    className="accent-[#4d7c0f] h-4 w-4"
                  />
                  Print full A–Z spice list ({totalSlots} jars)
                </label>
                <button
                  type="button"
                  onClick={sortSpicesAlphabetically}
                  className="text-xs font-semibold text-[#3f6212] hover:underline px-2 py-1 cursor-pointer"
                >
                  Sort A–Z
                </button>
              </div>
              {useMultiSpices && (
                <textarea
                  aria-label="Spice list (one spice per line)"
                  rows={4}
                  value={spiceListText}
                  onChange={(e) => setSpiceListText(e.target.value)}
                  className="w-full rounded-xl bg-white px-3 py-2 text-xs text-zinc-950"
                />
              )}
            </div>
          )}

          <div className="space-y-2.5">
            <div>
              <label
                htmlFor="jar-label-title"
                className="block text-xs font-semibold text-zinc-700 mb-1"
              >
                {pageId === "T27" && useMultiSpices
                  ? "Fallback / Single Title"
                  : "Main Label Name"}
              </label>
              <input
                id="jar-label-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs text-zinc-950"
              />
            </div>
            <div>
              <label
                htmlFor="jar-label-subtitle"
                className="block text-xs font-semibold text-zinc-700 mb-1"
              >
                Ingredients / Scent / Blend Note
              </label>
              <input
                id="jar-label-subtitle"
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs text-zinc-950"
              />
            </div>
            <div>
              <label
                htmlFor="jar-label-meta"
                className="block text-xs font-semibold text-zinc-700 mb-1"
              >
                Date / Batch / Weight / Warning Line
              </label>
              <input
                id="jar-label-meta"
                type="text"
                value={metaLine}
                onChange={(e) => setMetaLine(e.target.value)}
                className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs text-zinc-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="jar-label-paper"
                className="block text-xs font-semibold text-zinc-700 mb-1"
              >
                Sheet Paper
              </label>
              <select
                id="jar-label-paper"
                value={paper}
                onChange={(e) => setPaper(e.target.value as PaperSizeId)}
                className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs text-zinc-950"
              >
                <option value="a4">{PAPER_SIZES.a4.label}</option>
                <option value="letter">{PAPER_SIZES.letter.label}</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="jar-label-frame"
                className="block text-xs font-semibold text-zinc-700 mb-1"
              >
                Frame Style
              </label>
              <select
                id="jar-label-frame"
                value={frameStyle}
                onChange={(e) =>
                  setFrameStyle(
                    e.target.value as "bordered" | "banner" | "minimal"
                  )
                }
                className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs text-zinc-950"
              >
                <option value="bordered">Classic Border</option>
                <option value="banner">Top Accent Bar</option>
                <option value="minimal">Clean Minimal</option>
              </select>
            </div>
          </div>

          {(pageId === "T28" || pageId === "T29" || pageId === "T24") && (
            <div className="rounded-2xl bg-[#f5f5f7] p-3.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-zinc-700">
                  Wrap-Around Sizing Helper
                </span>
                <span className="font-mono text-[#365314] font-semibold">
                  Max wrap: {recommendedWrapMm} mm
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <label
                  htmlFor="jar-diameter-mm"
                  className="text-zinc-700 font-medium"
                >
                  Jar/Bottle Diameter (mm):
                </label>
                <input
                  id="jar-diameter-mm"
                  type="number"
                  min={20}
                  max={140}
                  value={jarDiameterMm}
                  onChange={(e) => setJarDiameterMm(Number(e.target.value))}
                  className="w-20 rounded-xl bg-white px-2.5 py-1.5 text-xs text-zinc-950"
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 min-h-[32px] text-xs font-medium text-zinc-700 cursor-pointer">
              Accent
              <input
                type="color"
                value={accentHex}
                onChange={(e) => setAccentHex(e.target.value)}
                className="h-8 w-10 rounded-md bg-[#f5f5f7] cursor-pointer"
              />
            </label>
            <label className="inline-flex items-center gap-1.5 min-h-[32px] py-1 text-xs font-medium text-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showCutLines}
                onChange={(e) => setShowCutLines(e.target.checked)}
                className="accent-[#4d7c0f] h-4 w-4"
              />
              <Scissors className="h-3.5 w-3.5 text-zinc-600" aria-hidden="true" />
              Cut outlines
            </label>
          </div>

          <div className="rounded-2xl bg-[#f5f5f7] p-3.5 text-[11px] text-zinc-700 flex items-start gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center shrink-0">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />
            </div>
            <span className="leading-relaxed">
              Selling food, candles, oils, or cosmetics? Check local labelling rules for mandatory weights, allergens, batch codes, and safety warnings before printing.
            </span>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-zinc-950 hover:bg-amber-600 disabled:bg-zinc-200 disabled:text-zinc-600 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {isExporting
                ? "Building Label Sheet..."
                : `Download ${totalSlots}-Label PDF`}
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

        {/* Live Close-up Preview — flat borderless surface */}
        <div className="lg:col-span-7 rounded-2xl bg-white p-6 flex flex-col items-center justify-center gap-5 min-h-[420px]">
          <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-600">
            Single Label Preview ({preset.wMm} × {preset.hMm} mm)
          </p>
          <div
            className={`relative bg-[#f5f5f7] flex flex-col items-center justify-center p-6 text-center ${
              preset.round ? "rounded-full" : "rounded-2xl"
            }`}
            style={{
              width: preset.round ? 220 : Math.min(340, Math.max(200, preset.wMm * 2.4)),
              aspectRatio: `${preset.wMm} / ${preset.hMm}`,
            }}
          >
            {frameStyle === "banner" && !preset.round && (
              <div
                className="absolute inset-x-0 top-0 h-3 rounded-t-2xl"
                style={{ backgroundColor: accentHex }}
              />
            )}
            <p className="relative z-10 text-base font-bold text-zinc-950 leading-tight">
              {pageId === "T27" && useMultiSpices
                ? spiceListText.split("\n")[0] || title
                : title}
            </p>
            {subtitle && (
              <p className="relative z-10 text-xs text-zinc-600 mt-1 max-w-[90%]">
                {subtitle}
              </p>
            )}
            {metaLine && (
              <p
                className="relative z-10 text-[11px] font-semibold mt-2"
                style={{ color: accentHex }}
              >
                {metaLine}
              </p>
            )}
          </div>
          <p className="text-xs text-zinc-600 font-mono">
            Exports {preset.cols} × {preset.rows} ({totalSlots} labels) centered on{" "}
            {paperDim.label}
          </p>
        </div>
      </div>
    </div>
  );
}

