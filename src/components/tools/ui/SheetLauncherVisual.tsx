"use client";

import React from "react";
import type { PageId, ToolEngineKind } from "@/types/spec";

interface SheetLauncherVisualProps {
  engine: ToolEngineKind;
  pageId?: PageId;
  className?: string;
}

const SHEET_LABEL_BY_ENGINE: Record<ToolEngineKind, string> = {
  "passport-sheet": "ID & Passport Sheet",
  "photo-grid": "Photo Print Grid",
  "poster-splitter": "Multi-Page Poster Tile",
  "business-card": "10-Up Card Sheet",
  "label-sheet": "Grid Sticker & Label Sheet",
  "jar-bottle": "Custom Wrap & Lid Sheet",
};

function getFooterMeta(engine: ToolEngineKind, pageId?: PageId): string {
  if (engine === "passport-sheet") {
    return pageId === "T06" ? "4×6 Photo Card • Exact mm" : "4×6 & A4 • 600 DPI Cut Guides";
  }
  if (engine === "photo-grid") {
    if (pageId === "T02") return "2-Up Sheet • Zero Margin Waste";
    if (pageId === "T03") return "Contact Sheet • Auto Filenames";
    if (pageId === "T04") return "Multi-Size Collage Layout";
    if (pageId === "T08") return "4-Up Grid • Crisp Borders";
    if (pageId === "T09") return "9-Up Wallet Pack • 2.5×3.5\"";
    if (pageId === "T10") return "School Pack • Mixed Print Sizes";
    return "US Letter & A4 • Auto Bleed";
  }
  if (engine === "poster-splitter") {
    return "Tiled Letter / A4 • Glue Tabs";
  }
  if (engine === "business-card") {
    if (pageId === "T14") return "Double-Sided • Front & Back Sync";
    if (pageId === "T15") return "Vertical Folded Tent & Loyalty";
    if (pageId === "T16") return "vCard QR • Offline Vector PDF";
    return "2×5 10-Up • Corner Crop Marks";
  }
  if (engine === "label-sheet") {
    if (pageId === "T18") return "Circular Cut Ring • Safe Margin";
    if (pageId === "T19" || pageId === "T20") return "3-Column Return & Address Grid";
    if (pageId === "T21") return "4×6 Thermal & 2-Up Shipping";
    if (pageId === "T22") return "Code-128 & Batch QR Labels";
    return "Letter & A4 • Zero Drift Calibration";
  }
  return "Custom Width × Height + Lid Circle";
}

function SheetDiagram({
  engine,
  pageId,
}: {
  engine: ToolEngineKind;
  pageId?: PageId;
}) {
  if (engine === "passport-sheet") {
    const count = pageId === "T06" ? 4 : 6;
    const cols = count === 4 ? "grid-cols-2" : "grid-cols-3";
    return (
      <div className={`grid ${cols} gap-2.5 w-full h-full items-center`}>
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="relative aspect-[35/45] rounded-lg border border-dashed border-[#4d7c0f]/45 bg-[#f7fbf1] p-1.5 flex flex-col items-center justify-end overflow-hidden"
          >
            <div className="w-4 h-4 rounded-full bg-[#4d7c0f]/25 mb-1" />
            <div className="w-7 h-3.5 rounded-t-full bg-[#4d7c0f]/20" />
            <span className="absolute top-1 right-1 h-1 w-1 rounded-full bg-[#4d7c0f]/60" />
          </div>
        ))}
      </div>
    );
  }

  if (engine === "photo-grid") {
    if (pageId === "T02") {
      return (
        <div className="grid grid-cols-1 gap-2.5 w-full h-full">
          {[0, 1].map((idx) => (
            <div
              key={idx}
              className="rounded-lg border border-dashed border-[#4d7c0f]/45 bg-[#eef6e4]/65 flex items-center justify-center relative"
            >
              <div className="h-6 w-8 rounded bg-white/80 border border-[#4d7c0f]/25" />
            </div>
          ))}
        </div>
      );
    }

    if (pageId === "T04" || pageId === "T10") {
      return (
        <div className="grid grid-cols-2 grid-rows-3 gap-2 w-full h-full">
          <div className="col-span-2 row-span-2 rounded-lg border border-dashed border-[#4d7c0f]/45 bg-[#eef6e4]/70 flex items-center justify-center">
            <div className="h-7 w-11 rounded bg-white/85 border border-[#4d7c0f]/25" />
          </div>
          <div className="rounded-lg border border-dashed border-zinc-300 bg-[#f5f5f7] flex items-center justify-center">
            <div className="h-3.5 w-5 rounded bg-white border border-zinc-200" />
          </div>
          <div className="rounded-lg border border-dashed border-zinc-300 bg-[#f5f5f7] flex items-center justify-center">
            <div className="h-3.5 w-5 rounded bg-white border border-zinc-200" />
          </div>
        </div>
      );
    }

    if (pageId === "T03") {
      return (
        <div className="grid grid-cols-4 gap-1.5 w-full h-full">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div key={idx} className="flex flex-col gap-0.5">
              <div className="flex-1 rounded bg-[#eef6e4]/80 border border-[#4d7c0f]/25" />
              <div className="h-1 w-3/4 mx-auto rounded-full bg-zinc-300" />
            </div>
          ))}
        </div>
      );
    }

    if (pageId === "T09") {
      return (
        <div className="grid grid-cols-3 gap-1.5 w-full h-full">
          {Array.from({ length: 9 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-md border border-dashed border-[#4d7c0f]/40 bg-[#f7fbf1] flex items-center justify-center"
            >
              <div className="h-3 w-3 rounded-full bg-[#4d7c0f]/25" />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-2.5 w-full h-full">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-dashed border-[#4d7c0f]/45 bg-[#f7fbf1] flex flex-col items-center justify-center gap-1"
          >
            <div className="h-4 w-5 rounded-sm bg-[#4d7c0f]/20" />
            <div className="h-1 w-8 rounded-full bg-[#4d7c0f]/30" />
          </div>
        ))}
      </div>
    );
  }

  if (engine === "poster-splitter") {
    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-2 w-full h-full">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="relative rounded-lg border border-dashed border-[#4d7c0f]/55 bg-white p-2 flex flex-col justify-between shadow-2xs"
          >
            <span className="text-[9px] font-bold text-[#3f6212]">
              Tile {idx + 1}
            </span>
            <div className="h-5 rounded bg-[#eef6e4] border border-[#4d7c0f]/20" />
            <div className="h-1.5 w-full rounded bg-amber-500/25" />
          </div>
        ))}
      </div>
    );
  }

  if (engine === "business-card") {
    const showQr = pageId === "T16";
    return (
      <div className="grid grid-cols-2 grid-rows-4 gap-1.5 w-full h-full">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="relative rounded-md border border-zinc-200 bg-[#f5f5f7]/60 px-2 py-1.5 flex items-center justify-between gap-1.5"
          >
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <div className="h-1.5 w-10 rounded-full bg-zinc-800/80" />
              <div className="h-1 w-7 rounded-full bg-[#4d7c0f]/60" />
            </div>
            {showQr ? (
              <div className="h-4 w-4 rounded-xs border border-zinc-700 bg-white grid grid-cols-2 gap-0.5 p-0.5 shrink-0">
                <span className="bg-zinc-900" />
                <span className="bg-zinc-400" />
                <span className="bg-zinc-400" />
                <span className="bg-zinc-900" />
              </div>
            ) : (
              <div className="h-2.5 w-2.5 rounded-full bg-[#eef6e4] border border-[#4d7c0f]/40 shrink-0" />
            )}
          </div>
        ))}
      </div>
    );
  }

  if (engine === "label-sheet") {
    if (pageId === "T18") {
      return (
        <div className="grid grid-cols-3 grid-rows-3 gap-2.5 w-full h-full items-center justify-items-center">
          {Array.from({ length: 9 }).map((_, idx) => (
            <div
              key={idx}
              className="w-10 h-10 rounded-full border border-dashed border-[#4d7c0f]/55 bg-[#f7fbf1] flex flex-col items-center justify-center gap-0.5"
            >
              <span className="h-1 w-5 rounded-full bg-[#3f6212]/70" />
              <span className="h-1 w-3.5 rounded-full bg-zinc-400" />
            </div>
          ))}
        </div>
      );
    }

    if (pageId === "T21") {
      return (
        <div className="grid grid-cols-1 grid-rows-2 gap-2.5 w-full h-full">
          {[0, 1].map((idx) => (
            <div
              key={idx}
              className="rounded-lg border border-dashed border-zinc-300 bg-[#f5f5f7]/70 p-2 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="h-1.5 w-12 rounded-full bg-zinc-800/80" />
                <span className="h-2 w-6 rounded bg-[#eef6e4] border border-[#4d7c0f]/30" />
              </div>
              <div className="flex items-end justify-between gap-2">
                <div className="space-y-1">
                  <div className="h-1 w-16 rounded-full bg-zinc-400" />
                  <div className="h-1 w-12 rounded-full bg-zinc-300" />
                </div>
                <div className="h-3.5 w-10 flex gap-0.5 items-stretch">
                  <span className="w-1 bg-zinc-800" />
                  <span className="w-0.5 bg-zinc-800" />
                  <span className="w-1.5 bg-zinc-800" />
                  <span className="w-0.5 bg-zinc-800" />
                  <span className="w-1 bg-zinc-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (pageId === "T22") {
      return (
        <div className="grid grid-cols-2 grid-rows-4 gap-2 w-full h-full">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-md border border-dashed border-zinc-300 bg-white px-2 py-1 flex flex-col justify-center gap-1"
            >
              <div className="h-2.5 w-full flex gap-0.5 justify-center">
                <span className="w-1 bg-zinc-900" />
                <span className="w-0.5 bg-zinc-900" />
                <span className="w-1.5 bg-zinc-900" />
                <span className="w-0.5 bg-zinc-900" />
                <span className="w-1 bg-zinc-900" />
                <span className="w-1 bg-zinc-900" />
              </div>
              <div className="h-1 w-10 mx-auto rounded-full bg-zinc-400" />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 grid-rows-5 gap-1.5 w-full h-full">
        {Array.from({ length: 15 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-sm border border-dashed border-[#4d7c0f]/45 bg-[#f7fbf1] px-1.5 py-1 flex flex-col justify-center gap-0.5"
          >
            <div className="h-1 w-3/4 rounded-full bg-zinc-700/70" />
            <div className="h-1 w-1/2 rounded-full bg-zinc-400" />
          </div>
        ))}
      </div>
    );
  }

  // jar-bottle
  return (
    <div className="flex flex-col justify-between gap-2.5 w-full h-full">
      <div className="flex-1 rounded-lg border border-dashed border-[#4d7c0f]/55 bg-[#f7fbf1] p-2.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[9px] font-bold text-[#3f6212]">
          <span>WRAP BAND</span>
          <span>190 × 55 mm</span>
        </div>
        <div className="space-y-1 my-auto">
          <div className="h-2 w-24 rounded-full bg-zinc-900/80" />
          <div className="h-1 w-16 rounded-full bg-[#4d7c0f]/60" />
        </div>
        <div className="flex justify-between text-[9px] text-zinc-500">
          <span>Batch • Net Wt</span>
          <span>Safe Margin</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 items-center justify-items-center">
        {[0, 1, 2].map((idx) => (
          <div
            key={idx}
            className="w-9 h-9 rounded-full border border-dashed border-zinc-400 bg-[#f5f5f7] flex items-center justify-center"
          >
            <span className="h-1.5 w-4 rounded-full bg-zinc-600/60" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SheetLauncherVisual({
  engine,
  pageId,
  className = "",
}: SheetLauncherVisualProps) {
  return (
    <div
      className={`rounded-3xl bg-[#ebeced]/70 p-4 sm:p-5 flex flex-col items-center justify-center ${className}`}
    >
      {/* Paper Sheet Mockup */}
      <div className="w-full max-w-[270px] aspect-[8.5/10.2] rounded-2xl bg-white p-3.5 shadow-[0_14px_34px_-16px_rgba(17,17,17,0.18)] ring-1 ring-black/5 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2 border-b border-[#ebeced]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            {SHEET_LABEL_BY_ENGINE[engine]}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#eef6e4] px-2 py-0.5 text-[10px] font-semibold text-[#3f6212]">
            100% Scale
          </span>
        </div>

        <div className="flex-1 py-2.5 flex items-center justify-center min-h-0">
          <SheetDiagram engine={engine} pageId={pageId} />
        </div>

        <div className="pt-2 border-t border-[#ebeced] flex items-center justify-between text-[10px] font-medium text-zinc-500">
          <span>{getFooterMeta(engine, pageId)}</span>
          <span className="font-semibold text-[#3f6212]">PDF Ready</span>
        </div>
      </div>
    </div>
  );
}
