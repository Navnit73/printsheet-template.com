"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { PageId, ToolEngineKind } from "@/types/spec";

const PassportSheetTool = dynamic(() =>
  import("./PassportSheetTool").then((m) => m.PassportSheetTool)
);
const PhotoGridTool = dynamic(() =>
  import("./PhotoGridTool").then((m) => m.PhotoGridTool)
);
const PosterSplitterTool = dynamic(() =>
  import("./PosterSplitterTool").then((m) => m.PosterSplitterTool)
);
const BusinessCardTool = dynamic(() =>
  import("./BusinessCardTool").then((m) => m.BusinessCardTool)
);
const LabelSheetTool = dynamic(() =>
  import("./LabelSheetTool").then((m) => m.LabelSheetTool)
);
const JarBottleLabelTool = dynamic(() =>
  import("./JarBottleLabelTool").then((m) => m.JarBottleLabelTool)
);

export function ToolWorkspace({
  pageId,
  engine,
}: {
  pageId: PageId;
  engine: ToolEngineKind;
}) {
  switch (engine) {
    case "passport-sheet":
      return <PassportSheetTool pageId={pageId} />;
    case "poster-splitter":
      return <PosterSplitterTool />;
    case "business-card":
      return <BusinessCardTool pageId={pageId} />;
    case "label-sheet":
      return <LabelSheetTool pageId={pageId} />;
    case "jar-bottle":
      return <JarBottleLabelTool pageId={pageId} />;
    case "photo-grid":
    default:
      return <PhotoGridTool pageId={pageId} />;
  }
}
