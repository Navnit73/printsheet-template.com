export type PageId =
  | "HOME"
  | "HB-PH"
  | "HB-BC"
  | "HB-LS"
  | "HB-JB"
  | "T01"
  | "T02"
  | "T03"
  | "T04"
  | "T05"
  | "T06"
  | "T07"
  | "T08"
  | "T09"
  | "T10"
  | "T11"
  | "T12"
  | "T13"
  | "T14"
  | "T15"
  | "T16"
  | "T17"
  | "T18"
  | "T19"
  | "T20"
  | "T21"
  | "T22"
  | "T23"
  | "T24"
  | "T25"
  | "T26"
  | "T27"
  | "T28"
  | "T29"
  | "T30"
  | "G01"
  | "G02"
  | "G03"
  | "G04"
  | "G05"
  | "G06"
  | "G07"
  | "G08"
  | "G09"
  | "G10"
  | "H01"
  | "H02"
  | "H03"
  | "H04"
  | "H05"
  | "H06"
  | "H07"
  | "H08"
  | "H09"
  | "H10"
  | "H11"
  | "H12"
  | "H13"
  | "H14"
  | "B01"
  | "B02"
  | "B03"
  | "B04"
  | "B05"
  | "B06"
  | "B07"
  | "B08"
  | "B09"
  | "B10"
  | "B11"
  | "B12"
  | "CS01"
  | "CS02"
  | "CS03"
  | "CS04"
  | "CS05"
  | "CS06";

export type PageType =
  | "Homepage"
  | "Hub"
  | "Tool"
  | "Guide"
  | "How-To"
  | "Blog"
  | "Case Study";

export type ClusterId =
  | "home"
  | "photo-sheets"
  | "business-cards"
  | "labels-stickers"
  | "jar-bottle-labels";

export type ToolEngineKind =
  | "photo-grid"
  | "passport-sheet"
  | "poster-splitter"
  | "business-card"
  | "label-sheet"
  | "jar-bottle";

export interface InlineLinkRef {
  targetId: PageId;
  anchor: string;
}

export interface ContentTable {
  headers: string[];
  rows: string[][];
}

export interface HeadingNode {
  level: 2 | 3 | 4;
  text: string;
  link?: InlineLinkRef;
  paragraphs?: string[];
  bullets?: string[];
  table?: ContentTable;
  inlineLinks?: InlineLinkRef[];
  callout?: {
    variant: "tip" | "rules" | "affiliation" | "real-data";
    title: string;
    body: string;
  };
  children?: HeadingNode[];
}

export interface PageMeta {
  id: PageId;
  url: string;
  type: PageType;
  cluster: ClusterId;
  parentHub?: PageId;
  priority: "P1" | "P2" | "P3";
  rank: number;
  seoTitle: string;
  metaDescription: string;
  h1: string;
  primaryKeyword: string;
  secondaryKeywords?: string[];
  targetWordCount: number;
  toolEngine?: ToolEngineKind;
  requiresLocalRulesNote?: boolean;
  requiresBrandNonAffiliationNote?: boolean;
  isCaseStudyScaffold?: boolean;
}

export interface PageContent {
  id: PageId;
  subtitle: string;
  introParagraphs: string[];
  breadcrumbAnchor?: string;
  sections: HeadingNode[];
  relatedLinks?: { targetId: PageId; anchor: string; summary?: string }[];
  faqs?: { question: string; answer: string }[];
}

