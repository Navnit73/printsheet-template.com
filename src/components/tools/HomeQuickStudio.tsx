"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  IdCard,
  Image as ImageIcon,
  Package,
  Tag,
} from "lucide-react";
import { PassportSheetTool } from "./PassportSheetTool";

const PhotoGridTool = dynamic(
  () => import("./PhotoGridTool").then((m) => m.PhotoGridTool),
  {
    loading: () => (
      <div
        role="status"
        aria-live="polite"
        className="h-96 rounded-3xl bg-[#f5f5f7] animate-pulse p-6 flex items-center justify-center text-xs font-medium text-zinc-700"
      >
        Loading Photo Sheet Studio...
      </div>
    ),
  }
);

const BusinessCardTool = dynamic(
  () => import("./BusinessCardTool").then((m) => m.BusinessCardTool),
  {
    loading: () => (
      <div
        role="status"
        aria-live="polite"
        className="h-96 rounded-3xl bg-[#f5f5f7] animate-pulse p-6 flex items-center justify-center text-xs font-medium text-zinc-700"
      >
        Loading Business Card Studio...
      </div>
    ),
  }
);

const LabelSheetTool = dynamic(
  () => import("./LabelSheetTool").then((m) => m.LabelSheetTool),
  {
    loading: () => (
      <div
        role="status"
        aria-live="polite"
        className="h-96 rounded-3xl bg-[#f5f5f7] animate-pulse p-6 flex items-center justify-center text-xs font-medium text-zinc-700"
      >
        Loading Labels &amp; Stickers Studio...
      </div>
    ),
  }
);

const JarBottleLabelTool = dynamic(
  () => import("./JarBottleLabelTool").then((m) => m.JarBottleLabelTool),
  {
    loading: () => (
      <div
        role="status"
        aria-live="polite"
        className="h-96 rounded-3xl bg-[#f5f5f7] animate-pulse p-6 flex items-center justify-center text-xs font-medium text-zinc-700"
      >
        Loading Jar &amp; Bottle Label Studio...
      </div>
    ),
  }
);

type StudioTab = "passport" | "photo" | "cards" | "labels" | "jars";

export function HomeQuickStudio() {
  const [tab, setTab] = useState<StudioTab>("passport");

  const tabs: {
    id: StudioTab;
    label: string;
    shortDesc: string;
    icon: React.ReactNode;
    hubHref: string;
    hubLabel: string;
  }[] = [
    {
      id: "passport",
      label: "Passport (EU / UK / IN / US)",
      shortDesc:
        "35×45 mm (EU/UK/IN), 2×2 in (US/OCI), 50×70 mm (CA) & custom ID sheets on 4×6 or A4.",
      icon: <IdCard aria-hidden="true" className="h-4 w-4" />,
      hubHref: "/photo-sheets/passport-photo-sheet-maker/",
      hubLabel: "Full Passport Sheet Guide",
    },
    {
      id: "photo",
      label: "Photo Sheets",
      shortDesc:
        "Arrange 2, 4, 6, 8, or 9 photos onto A4, A3, Letter, or 4×6 sheets.",
      icon: <ImageIcon aria-hidden="true" className="h-4 w-4" />,
      hubHref: "/photo-sheets/",
      hubLabel: "All 10 Photo Tools",
    },
    {
      id: "cards",
      label: "Business Cards",
      shortDesc:
        "8-up and 10-up printable business card sheets with crop marks & QR codes.",
      icon: <CreditCard aria-hidden="true" className="h-4 w-4" />,
      hubHref: "/business-cards/",
      hubLabel: "All 6 Card Tools",
    },
    {
      id: "labels",
      label: "Labels & Stickers",
      shortDesc:
        "Custom A4 & Letter sticker grids, round seals, address labels & barcodes.",
      icon: <Tag aria-hidden="true" className="h-4 w-4" />,
      hubHref: "/labels-stickers/",
      hubLabel: "All 7 Label Tools",
    },
    {
      id: "jars",
      label: "Jar & Bottle Labels",
      shortDesc:
        "Front labels, lid circles & wrap bands for jars, spices, candles & bottles.",
      icon: <Package aria-hidden="true" className="h-4 w-4" />,
      hubHref: "/jar-bottle-labels/",
      hubLabel: "All 7 Jar & Bottle Tools",
    },
  ];

  const activeMeta = tabs.find((t) => t.id === tab)!;

  function handleTabKeyDown(
    e: React.KeyboardEvent<HTMLButtonElement>,
    idx: number
  ) {
    let nextIdx: number | null = null;
    if (e.key === "ArrowRight") {
      nextIdx = (idx + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      nextIdx = (idx - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      nextIdx = 0;
    } else if (e.key === "End") {
      nextIdx = tabs.length - 1;
    }
    if (nextIdx !== null) {
      e.preventDefault();
      const nextTab = tabs[nextIdx];
      setTab(nextTab.id);
      const btn = document.getElementById(`studio-tab-${nextTab.id}`);
      btn?.focus();
    }
  }

  return (
    <div className="space-y-3.5">
      {/* Clean Borderless Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-[#f5f5f7] p-2">
        <div
          role="tablist"
          aria-label="Select print sheet tool category"
          className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0"
        >
          {tabs.map((t, idx) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                id={`studio-tab-${t.id}`}
                type="button"
                role="tab"
                tabIndex={active ? 0 : -1}
                aria-selected={active}
                aria-controls={`studio-panel-${t.id}`}
                onClick={() => setTab(t.id)}
                onKeyDown={(e) => handleTabKeyDown(e, idx)}
                className={`shrink-0 min-h-[38px] inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                  active
                    ? "bg-white text-zinc-950"
                    : "text-zinc-700 hover:bg-white/70 hover:text-zinc-950"
                }`}
              >
                <span aria-hidden="true" className="text-[#3f6212]">
                  {t.icon}
                </span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 px-2 sm:px-1">
          <span className="text-[11px] text-zinc-600 hidden xl:inline truncate max-w-xs">
            {activeMeta.shortDesc}
          </span>
          <Link
            href={activeMeta.hubHref}
            className="shrink-0 min-h-[34px] inline-flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-[#3f6212] hover:text-[#365314] transition"
          >
            <span>{activeMeta.hubLabel}</span>
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Active Studio Panel */}
      <div
        id={`studio-panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`studio-tab-${tab}`}
      >
        {tab === "passport" && <PassportSheetTool pageId="T07" />}
        {tab === "photo" && <PhotoGridTool pageId="T01" />}
        {tab === "cards" && <BusinessCardTool pageId="T14" />}
        {tab === "labels" && <LabelSheetTool pageId="T17" />}
        {tab === "jars" && <JarBottleLabelTool pageId="T24" />}
      </div>
    </div>
  );
}
