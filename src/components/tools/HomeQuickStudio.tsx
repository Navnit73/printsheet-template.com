"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Grid,
  IdCard,
  Maximize2,
  Package,
  Sparkles,
  Tag,
} from "lucide-react";
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

type HomeTabId = "passport" | "photo" | "cards" | "labels" | "jars";

interface TabDef {
  id: HomeTabId;
  label: string;
  shortLabel: string;
  badge: string;
  headline: string;
  desc: string;
  steps: [string, string, string];
  supportsSample: boolean;
  advancedHint?: string;
  hubUrl: string;
  fullUrl: string;
  engine: ToolEngineKind;
  pageId: PageId;
  Icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabDef[] = [
  {
    id: "passport",
    label: "Passport & ID",
    shortLabel: "Passport",
    badge: "4×6 & A4",
    headline: "Exact-Size Passport & Visa Photo Sheet",
    desc: "Pick US, UK, EU, India or Schengen dimensions first, upload a single portrait, and export a 100% scale 4×6 photo card or A4 sheet with dashed box cut guides.",
    steps: [
      "Pick official country size",
      "Upload portrait or load demo",
      "Export exact-scale PDF or JPG",
    ],
    supportsSample: true,
    hubUrl: "/photo-sheets/",
    fullUrl: "/photo-sheets/passport-photo-sheet-maker/",
    engine: "passport-sheet",
    pageId: "T07",
    Icon: IdCard,
  },
  {
    id: "photo",
    label: "Photo Grids",
    shortLabel: "Photos",
    badge: "1–12+ / sheet",
    headline: "Multi-Up Photo Sheet & Collage Grid",
    desc: "Arrange multiple photos per sheet in 2-up, 4-up, wallet 9-up, or custom grids with crisp spacing, crop fit, and print-safe margins.",
    steps: [
      "Add one or more photos",
      "Choose grid rows & columns",
      "Set US Letter, A4 or 4×6 paper",
    ],
    supportsSample: true,
    hubUrl: "/photo-sheets/",
    fullUrl: "/photo-sheets/photo-sheet-maker/",
    engine: "photo-grid",
    pageId: "T01",
    Icon: Grid,
  },
  {
    id: "cards",
    label: "Business Cards",
    shortLabel: "Cards",
    badge: "10-Up / Sheet",
    headline: "2×5 Business Card Sheet & Back Print",
    desc: "Fill a clean standard card form in seconds or upload artwork for an exact 10-up printable sheet with corner crop marks. Optional Advanced Editor inside.",
    steps: [
      "Enter card contact details",
      "Pick clean palette & paper size",
      "Optional Advanced Editor or Export",
    ],
    supportsSample: false,
    advancedHint: "Includes optional Advanced Card Designer inside",
    hubUrl: "/business-cards/",
    fullUrl: "/business-cards/double-sided-card-sheet-maker/",
    engine: "business-card",
    pageId: "T14",
    Icon: CreditCard,
  },
  {
    id: "labels",
    label: "Labels & Stickers",
    shortLabel: "Labels",
    badge: "Avery / A4",
    headline: "Precision Sticker, Address & Barcode Sheets",
    desc: "Select standard Letter or A4 label grids, edit your sticker text or barcode/QR code, and calibrate zero-drift printer offsets cleanly.",
    steps: [
      "Choose template or paper grid",
      "Edit label copy & styling",
      "Print alignment test or export PDF",
    ],
    supportsSample: false,
    advancedHint: "Includes optional Advanced Label Studio inside",
    hubUrl: "/labels-stickers/",
    fullUrl: "/labels-stickers/printable-label-sheet-maker/",
    engine: "label-sheet",
    pageId: "T17",
    Icon: Tag,
  },
  {
    id: "jars",
    label: "Jars & Bottles",
    shortLabel: "Jars",
    badge: "Custom mm/in",
    headline: "Wrap-Around Jar & Bottle Label Maker",
    desc: "Match your exact container diameter and label height to tile crisp wrap bands and matching circular lid labels onto US Letter or A4.",
    steps: [
      "Set jar width, height & lid size",
      "Fill product, batch & weight info",
      "Tile onto sheet & export PDF",
    ],
    supportsSample: false,
    hubUrl: "/jar-bottle-labels/",
    fullUrl: "/jar-bottle-labels/jar-label-sheet-maker/",
    engine: "jar-bottle",
    pageId: "T24",
    Icon: Package,
  },
];

function isHomeTabId(value?: string): value is HomeTabId {
  return TABS.some((t) => t.id === value);
}

export function HomeQuickStudio() {
  const [activeTab, setActiveTab] = useState<HomeTabId>("passport");
  const activeTabRef = useRef<HomeTabId>("passport");
  const [studioOpen, setStudioOpen] = useState(false);
  const [mountedTabs, setMountedTabs] = useState<Partial<Record<HomeTabId, boolean>>>({});
  const [autoSampleSignal, setAutoSampleSignal] = useState(0);

  const selectTab = (tabId: HomeTabId) => {
    activeTabRef.current = tabId;
    setActiveTab(tabId);
  };

  const launchStudio = useCallback((tabId?: HomeTabId, withSample?: boolean) => {
    const target = tabId ?? activeTabRef.current;
    activeTabRef.current = target;
    setActiveTab(target);
    setMountedTabs((prev) => (prev[target] ? prev : { ...prev, [target]: true }));
    if (withSample) {
      setAutoSampleSignal((n) => n + 1);
    }
    setStudioOpen(true);
  }, []);

  useEffect(() => {
    const handleEvent = (ev: Event) => {
      const detail = (ev as CustomEvent<OpenStudioDetail>).detail ?? {};
      const nextTab = isHomeTabId(detail.tab) ? detail.tab : undefined;
      launchStudio(nextTab, Boolean(detail.sample));
    };

    const checkHash = () => {
      const hash = window.location.hash || "";
      if (!hasAutoOpenHash(hash)) return;
      const lower = hash.toLowerCase();
      if (lower.startsWith("#card=")) {
        launchStudio("cards", false);
        return;
      }
      if (lower.startsWith("#label=")) {
        launchStudio("labels", false);
        return;
      }
      launchStudio(undefined, false);
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
  }, [launchStudio]);

  const currentTab = TABS.find((t) => t.id === activeTab) || TABS[0];

  const fullPageHeaderSwitcher = (
    <div
      className="flex items-center gap-1 rounded-xl bg-[#f5f5f7] p-1 border border-[#e5e5e7]"
      role="tablist"
      aria-label="Switch active studio tool"
    >
      {TABS.map((tab) => {
        const isCurrent = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isCurrent}
            onClick={() => launchStudio(tab.id, false)}
            className={`min-h-[30px] px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
              isCurrent
                ? "bg-white text-[#365314] shadow-2xs"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            {tab.shortLabel}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Studio Category Switcher */}
      <div className="rounded-3xl bg-[#f5f5f7] p-3 sm:p-5 space-y-4">
        <div
          role="tablist"
          aria-label="Interactive print studios"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 rounded-2xl bg-white p-1.5"
        >
          {TABS.map((tab) => {
            const Icon = tab.Icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => selectTab(tab.id)}
                className={`min-h-[46px] flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-left transition cursor-pointer ${
                  isSelected
                    ? "bg-[#eef6e4] text-[#365314]"
                    : "text-zinc-700 hover:bg-[#f5f5f7] hover:text-zinc-950"
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isSelected ? "text-[#4d7c0f]" : "text-zinc-500"
                    }`}
                  />
                  <span className="text-xs font-bold truncate">{tab.label}</span>
                </span>
                <span
                  className={`hidden xl:inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    isSelected
                      ? "bg-white text-[#3f6212]"
                      : "bg-[#f5f5f7] text-zinc-500"
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Calm Uncluttered Studio Launcher Card */}
        <div className="rounded-2xl bg-white p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef6e4] px-3 py-1 text-xs font-semibold text-[#3f6212]">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Full-Page Normal Studio
              </span>
              <span className="inline-flex items-center rounded-full bg-[#f5f5f7] px-3 py-1 text-xs font-semibold text-zinc-600">
                {currentTab.badge}
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
                {currentTab.headline}
              </h3>
              <p className="text-sm sm:text-base leading-relaxed text-zinc-600">
                {currentTab.desc}
              </p>
            </div>

            {/* 3 Clear Micro-Steps */}
            <ol className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {currentTab.steps.map((stepText, idx) => (
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

            {/* Primary & Secondary Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => launchStudio(currentTab.id, false)}
                className="min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-zinc-950 hover:bg-amber-600 transition cursor-pointer shadow-xs"
              >
                <Maximize2 className="h-4 w-4" aria-hidden="true" />
                <span>Open Full-Page Studio</span>
              </button>

              {currentTab.supportsSample && (
                <button
                  type="button"
                  onClick={() => launchStudio(currentTab.id, true)}
                  className="min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#eef6e4] px-5 py-3 text-sm font-semibold text-[#3f6212] hover:bg-[#e2efd0] transition cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span>Try with Sample</span>
                </button>
              )}

              <Link
                href={currentTab.hubUrl}
                className="min-h-[46px] inline-flex items-center gap-1.5 rounded-xl bg-[#f5f5f7] px-4 py-3 text-sm font-semibold text-zinc-700 hover:bg-[#ebeced] hover:text-zinc-950 transition"
              >
                <span>All {currentTab.shortLabel} Tools</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            {currentTab.advancedHint && (
              <p className="text-xs text-zinc-500">
                {currentTab.advancedHint} — stays simple by default until you click Advanced.
              </p>
            )}
          </div>

          {/* Interactive Click-to-Launch Preview Graphic */}
          <div className="lg:col-span-5">
            <button
              type="button"
              onClick={() => launchStudio(currentTab.id, false)}
              aria-label={`Launch ${currentTab.headline} in full page`}
              className="w-full text-left group cursor-pointer focus-visible:outline-none"
            >
              <SheetLauncherVisual
                engine={currentTab.engine}
                pageId={currentTab.pageId}
                className="group-hover:bg-[#e5e6e8] transition"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Full-Page Normal Studio Overlays (lazily mounted once opened) */}
      {mountedTabs.passport && (
        <PassportSheetTool
          pageId="T07"
          initialPaperSize="4x6"
          open={studioOpen && activeTab === "passport"}
          onClose={() => setStudioOpen(false)}
          headerCenter={fullPageHeaderSwitcher}
          autoSampleSignal={autoSampleSignal}
        />
      )}
      {mountedTabs.photo && (
        <PhotoGridTool
          pageId="T01"
          open={studioOpen && activeTab === "photo"}
          onClose={() => setStudioOpen(false)}
          headerCenter={fullPageHeaderSwitcher}
          autoSampleSignal={autoSampleSignal}
        />
      )}
      {mountedTabs.cards && (
        <BusinessCardTool
          pageId="T14"
          open={studioOpen && activeTab === "cards"}
          onClose={() => setStudioOpen(false)}
          headerCenter={fullPageHeaderSwitcher}
        />
      )}
      {mountedTabs.labels && (
        <LabelSheetTool
          pageId="T17"
          open={studioOpen && activeTab === "labels"}
          onClose={() => setStudioOpen(false)}
          headerCenter={fullPageHeaderSwitcher}
        />
      )}
      {mountedTabs.jars && (
        <JarBottleLabelTool
          pageId="T24"
          open={studioOpen && activeTab === "jars"}
          onClose={() => setStudioOpen(false)}
          headerCenter={fullPageHeaderSwitcher}
        />
      )}
    </div>
  );
}
