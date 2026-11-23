"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { CheckCircle2, Maximize2, Sparkles } from "lucide-react";
import type { PageId, ToolEngineKind } from "@/types/spec";
import { SheetLauncherVisual } from "./ui/SheetLauncherVisual";
import {
  OPEN_STUDIO_EVENT,
  hasAutoOpenHash,
  type OpenStudioDetail,
} from "./ui/StudioTrigger";

const PassportSheetTool = dynamic(
  () => import("./PassportSheetTool").then((m) => m.PassportSheetTool),
  { ssr: false }
);
const PhotoGridTool = dynamic(
  () => import("./PhotoGridTool").then((m) => m.PhotoGridTool),
  { ssr: false }
);
const PosterSplitterTool = dynamic(
  () => import("./PosterSplitterTool").then((m) => m.PosterSplitterTool),
  { ssr: false }
);
const BusinessCardTool = dynamic(
  () => import("./BusinessCardTool").then((m) => m.BusinessCardTool),
  { ssr: false }
);
const LabelSheetTool = dynamic(
  () => import("./LabelSheetTool").then((m) => m.LabelSheetTool),
  { ssr: false }
);
const JarBottleLabelTool = dynamic(
  () => import("./JarBottleLabelTool").then((m) => m.JarBottleLabelTool),
  { ssr: false }
);

interface EngineLauncherInfo {
  badge: string;
  headline: string;
  description: string;
  steps: [string, string, string];
  supportsSample: boolean;
  advancedHint?: string;
}

const ENGINE_LAUNCHER_INFO: Record<ToolEngineKind, EngineLauncherInfo> = {
  "passport-sheet": {
    badge: "4×6 & A4 • Exact mm",
    headline: "Launch Passport & ID Photo Studio",
    description:
      "Opens an uncluttered full-page studio with step-by-step controls, official country presets, crop centering, and a live 600 DPI preview sheet.",
    steps: [
      "Select country size preset",
      "Upload portrait or load sample",
      "Export exact-scale PDF or JPG",
    ],
    supportsSample: true,
  },
  "photo-grid": {
    badge: "1–12+ Per Sheet • Zero Scale Drift",
    headline: "Launch Photo Grid Print Studio",
    description:
      "Opens a clean full-page canvas where you upload photos, adjust grid rows, gaps, borders or collage presets, and inspect every cell live.",
    steps: [
      "Add photos or load demo set",
      "Pick layout preset & margins",
      "Export 100% scale PDF sheet",
    ],
    supportsSample: true,
  },
  "poster-splitter": {
    badge: "Multi-Page Poster Tiling",
    headline: "Launch Large Poster Tiler Studio",
    description:
      "Split high-resolution artwork or photos across multiple US Letter or A4 pages with trim crop guides and overlap glue strips.",
    steps: [
      "Upload artwork or load sample",
      "Choose total pages wide × tall",
      "Download multi-page tiled PDF",
    ],
    supportsSample: true,
  },
  "business-card": {
    badge: "10-Up Sheet • Corner Crop Marks",
    headline: "Launch Business Card Sheet Studio",
    description:
      "Start with our fast Normal card form or artwork upload, inspect front & back sheets cleanly, and open Advanced Designer only if needed.",
    steps: [
      "Enter text or upload card art",
      "Choose 10-up or double-sided sheet",
      "Export vector PDF with crop marks",
    ],
    supportsSample: false,
    advancedHint: "Includes an optional Advanced Card Designer inside the studio",
  },
  "label-sheet": {
    badge: "Letter & A4 Label Grids",
    headline: "Launch Label & Sticker Sheet Studio",
    description:
      "Pick a rectangular, round, address, shipping, or barcode grid, customize text cleanly, calibrate printer drift, and export a 100% scale PDF.",
    steps: [
      "Pick label sheet preset or grid",
      "Customize text, barcode or style",
      "Calibrate alignment & export PDF",
    ],
    supportsSample: false,
    advancedHint: "Includes an optional Advanced Label Designer inside the studio",
  },
  "jar-bottle": {
    badge: "Custom Container Wrap + Lid",
    headline: "Launch Jar & Bottle Label Studio",
    description:
      "Enter your jar circumference or wrap dimensions, style ingredient/batch fields cleanly, and tile matching wrap + lid sheets for cutting.",
    steps: [
      "Enter bottle/jar dimensions",
      "Edit title, weight & batch info",
      "Download cut-ready PDF sheet",
    ],
    supportsSample: false,
  },
};

export function ToolWorkspace({
  pageId,
  engine,
}: {
  pageId: PageId;
  engine: ToolEngineKind;
}) {
  const [studioOpen, setStudioOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [autoSampleSignal, setAutoSampleSignal] = useState(0);

  const info = ENGINE_LAUNCHER_INFO[engine];
  const supportsSampleRef = useRef(info.supportsSample);
  useEffect(() => {
    supportsSampleRef.current = info.supportsSample;
  }, [info.supportsSample]);

  const handleOpenStudio = useCallback((withSample = false) => {
    setHasMounted(true);
    if (withSample && supportsSampleRef.current) {
      setAutoSampleSignal((n) => n + 1);
    }
    setStudioOpen(true);
  }, []);

  useEffect(() => {
    const handleEvent = (ev: Event) => {
      const detail = (ev as CustomEvent<OpenStudioDetail>).detail ?? {};
      handleOpenStudio(Boolean(detail.sample));
    };

    const checkHash = () => {
      const hash = window.location.hash || "";
      if (!hasAutoOpenHash(hash)) return;
      handleOpenStudio(false);
      const lower = hash.toLowerCase();
      if (lower === "#open-studio" || lower === "#interactive-studio-workspace") {
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );
      }
    };

    window.addEventListener(OPEN_STUDIO_EVENT, handleEvent);
    window.addEventListener("hashchange", checkHash);
    const rafId = window.requestAnimationFrame(checkHash);

    return () => {
      window.removeEventListener(OPEN_STUDIO_EVENT, handleEvent);
      window.removeEventListener("hashchange", checkHash);
      window.cancelAnimationFrame(rafId);
    };
  }, [handleOpenStudio]);

  return (
    <>
      <div className="rounded-3xl bg-[#f5f5f7] p-3 sm:p-5">
        <div className="rounded-2xl bg-white p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef6e4] px-3 py-1 text-xs font-semibold text-[#3f6212]">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Normal Full-Page Studio
              </span>
              <span className="inline-flex items-center rounded-full bg-[#f5f5f7] px-3 py-1 text-xs font-semibold text-zinc-600">
                {info.badge}
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
                {info.headline}
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-zinc-600">
                {info.description}
              </p>
            </div>

            <ol className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {info.steps.map((stepText, idx) => (
                <li
                  key={stepText}
                  className="rounded-xl bg-[#f5f5f7] px-3.5 py-2.5 flex items-start gap-2.5"
                >
                  <span className="h-5 w-5 rounded-full bg-white text-[11px] font-bold text-[#3f6212] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-medium text-zinc-700 leading-snug">
                    {stepText}
                  </span>
                </li>
              ))}
            </ol>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleOpenStudio(false)}
                className="min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-zinc-950 hover:bg-amber-600 transition cursor-pointer shadow-xs"
              >
                <Maximize2 className="h-4 w-4" aria-hidden="true" />
                <span>Open Full-Page Studio</span>
              </button>

              {info.supportsSample && (
                <button
                  type="button"
                  onClick={() => handleOpenStudio(true)}
                  className="min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#eef6e4] px-5 py-3 text-sm font-semibold text-[#3f6212] hover:bg-[#e2efd0] transition cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span>Try with Sample</span>
                </button>
              )}
            </div>

            {info.advancedHint && (
              <p className="text-xs text-zinc-500">
                {info.advancedHint} — stays clean in Normal mode until you ask for Advanced.
              </p>
            )}
          </div>

          <div className="lg:col-span-5">
            <button
              type="button"
              onClick={() => handleOpenStudio(false)}
              aria-label={`${info.headline} preview button`}
              className="w-full text-left group cursor-pointer focus-visible:outline-none"
            >
              <SheetLauncherVisual
                engine={engine}
                pageId={pageId}
                className="group-hover:bg-[#e5e6e8] transition"
              />
            </button>
          </div>
        </div>
      </div>

      {hasMounted && engine === "passport-sheet" && (
        <PassportSheetTool
          pageId={pageId}
          open={studioOpen}
          onClose={() => setStudioOpen(false)}
          autoSampleSignal={autoSampleSignal}
        />
      )}
      {hasMounted && engine === "photo-grid" && (
        <PhotoGridTool
          pageId={pageId}
          open={studioOpen}
          onClose={() => setStudioOpen(false)}
          autoSampleSignal={autoSampleSignal}
        />
      )}
      {hasMounted && engine === "poster-splitter" && (
        <PosterSplitterTool
          open={studioOpen}
          onClose={() => setStudioOpen(false)}
          autoSampleSignal={autoSampleSignal}
        />
      )}
      {hasMounted && engine === "business-card" && (
        <BusinessCardTool
          pageId={pageId}
          open={studioOpen}
          onClose={() => setStudioOpen(false)}
        />
      )}
      {hasMounted && engine === "label-sheet" && (
        <LabelSheetTool
          pageId={pageId}
          open={studioOpen}
          onClose={() => setStudioOpen(false)}
        />
      )}
      {hasMounted && engine === "jar-bottle" && (
        <JarBottleLabelTool
          pageId={pageId}
          open={studioOpen}
          onClose={() => setStudioOpen(false)}
        />
      )}
    </>
  );
}
