import type { PageContent, PageId, PageMeta } from "@/types/spec";
import { PAGES_META } from "@/data/site-meta";

export interface PageImageSpec {
  index: number; // 1..10
  slotSlug: string;
  src: string;
  alt: string;
  title: string;
  caption: string;
  badge: string;
  sectionHeading: string;
  specHighlights: [string, string, string];
  width: number;
  height: number;
}

export interface PageCtaButton {
  label: string;
  href: string;
  sublabel?: string;
}

export interface PageCtaConfig {
  heroPrimary: PageCtaButton;
  heroSecondary: PageCtaButton;
  midBanner: {
    eyebrow: string;
    heading: string;
    body: string;
    primary: PageCtaButton;
    secondary: PageCtaButton;
    trustPoints: [string, string, string];
  };
  sidebarCard: {
    eyebrow: string;
    heading: string;
    body: string;
    button: PageCtaButton;
    secondaryLink: PageCtaButton;
  };
  bottomCard: {
    eyebrow: string;
    heading: string;
    body: string;
    primary: PageCtaButton;
    secondary: PageCtaButton;
  };
}

/**
 * Registry of real Nano Banana WebP images populated phase-by-phase (8 pages per phase).
 * No synthetic SVG/card overlays—only genuine Nano Banana generated photography converted to WebP.
 */
export const PHASE_GENERATED_IMAGES: Partial<Record<PageId, PageImageSpec[]>> = {};

export function getPageImages(
  meta: PageMeta,
  _content: PageContent
): PageImageSpec[] {
  return PHASE_GENERATED_IMAGES[meta.id] || [];
}

const TARGET_TOOLS_BY_PAGE: Partial<
  Record<PageId, { primary: PageId; secondary: PageId }>
> = {
  HOME: { primary: "T01", secondary: "T11" },
  "HB-PH": { primary: "T01", secondary: "T06" },
  "HB-BC": { primary: "T11", secondary: "T14" },
  "HB-LS": { primary: "T17", secondary: "T22" },
  "HB-JB": { primary: "T24", secondary: "T28" },
  G01: { primary: "T01", secondary: "T03" },
  G02: { primary: "T05", secondary: "T10" },
  G03: { primary: "T01", secondary: "T10" },
  G04: { primary: "T02", secondary: "T08" },
  G05: { primary: "T13", secondary: "T11" },
  G06: { primary: "T22", secondary: "T17" },
  G07: { primary: "T17", secondary: "T18" },
  G08: { primary: "T29", secondary: "T24" },
  G09: { primary: "T18", secondary: "T15" },
  G10: { primary: "T24", secondary: "T25" },
  H01: { primary: "T01", secondary: "T03" },
  H02: { primary: "T01", secondary: "T09" },
  H03: { primary: "T01", secondary: "T10" },
  H04: { primary: "T03", secondary: "T01" },
  H05: { primary: "T11", secondary: "T14" },
  H06: { primary: "T11", secondary: "T13" },
  H07: { primary: "T12", secondary: "T14" },
  H08: { primary: "T11", secondary: "T15" },
  H09: { primary: "T17", secondary: "T18" },
  H10: { primary: "T20", secondary: "T17" },
  H11: { primary: "T22", secondary: "T19" },
  H12: { primary: "T06", secondary: "T07" },
  H13: { primary: "T08", secondary: "T09" },
  H14: { primary: "T27", secondary: "T24" },
  B01: { primary: "T01", secondary: "T10" },
  B02: { primary: "T28", secondary: "T24" },
  B03: { primary: "T29", secondary: "T24" },
  B04: { primary: "T22", secondary: "T17" },
  B05: { primary: "T22", secondary: "T19" },
  B06: { primary: "T01", secondary: "T03" },
  B07: { primary: "T13", secondary: "T14" },
  B08: { primary: "T14", secondary: "T16" },
  B09: { primary: "T11", secondary: "T12" },
  B10: { primary: "T24", secondary: "T26" },
  B11: { primary: "T22", secondary: "T17" },
  B12: { primary: "T18", secondary: "T22" },
  CS01: { primary: "T11", secondary: "T12" },
  CS02: { primary: "T08", secondary: "T09" },
  CS03: { primary: "T24", secondary: "T25" },
  CS04: { primary: "T28", secondary: "T24" },
  CS05: { primary: "T22", secondary: "T18" },
  CS06: { primary: "T15", secondary: "T11" },
};

export function getPageCtas(
  meta: PageMeta,
  content: PageContent
): PageCtaConfig {
  const isTool = meta.type === "Tool";
  const isHome = meta.id === "HOME";
  const isHub = meta.type === "Hub";

  const mappedTargets = TARGET_TOOLS_BY_PAGE[meta.id] || {
    primary: "T01" as PageId,
    secondary: "T11" as PageId,
  };

  const relatedToolId: PageId =
    content.relatedLinks?.find(
      (r) => PAGES_META[r.targetId]?.type === "Tool" && r.targetId !== meta.id
    )?.targetId ||
    meta.parentHub ||
    "HOME";

  const primaryTargetMeta = isTool
    ? meta
    : PAGES_META[mappedTargets.primary] || PAGES_META.T01;
  const secondaryTargetMeta = isTool
    ? PAGES_META[relatedToolId] || PAGES_META[meta.parentHub || "HOME"]
    : PAGES_META[mappedTargets.secondary] ||
      PAGES_META[meta.parentHub || "HOME"];

  const parentHubMeta = meta.parentHub
    ? PAGES_META[meta.parentHub]
    : PAGES_META.HOME;

  if (isHome) {
    return {
      heroPrimary: {
        label: "Open Interactive Print Sheet Studio",
        href: "#interactive-studio-workspace",
        sublabel: "Free · Instant Browser PDF",
      },
      heroSecondary: {
        label: "Browse All 4 Print Categories",
        href: "#choose-your-print-sheet",
      },
      midBanner: {
        eyebrow: "INSTANT BROWSER LAYOUT STUDIO",
        heading: "Create Exact-Size Photo, Card & Label Sheets in Seconds",
        body: "Skip complex word-processor tables. Pick A4, A3, US Letter, or 4×6 inch paper, drop in your images or text, and export a 100%-scale print-ready PDF.",
        primary: {
          label: "Launch Quick Print Studio Above",
          href: "#interactive-studio-workspace",
        },
        secondary: {
          label: "Try Photo Sheet Maker",
          href: "/photo-sheets/photo-sheet-maker/",
        },
        trustPoints: [
          "100% Free & No Sign-Up",
          "Locked Millimetre PDFs",
          "Runs Locally in Your Browser",
        ],
      },
      sidebarCard: {
        eyebrow: "QUICK STUDIO LAUNCH",
        heading: "Build Your Print Sheet",
        body: "Use the interactive 5-in-1 studio on this page or jump straight to a dedicated sheet maker.",
        button: {
          label: "Jump to Interactive Studio",
          href: "#interactive-studio-workspace",
        },
        secondaryLink: {
          label: "Read Master Photo Print Guide",
          href: "/guides/how-to-print-multiple-pictures-on-one-page/",
        },
      },
      bottomCard: {
        eyebrow: "READY TO PRINT AT 100% SCALE?",
        heading: "Start Your Free Print Sheet Layout Now",
        body: "Choose a specialized generator below or scroll up to export your print-ready PDF with optional hairline crop marks.",
        primary: {
          label: "Use Interactive Studio Now",
          href: "#interactive-studio-workspace",
        },
        secondary: {
          label: "Open 10-Up Business Card Maker",
          href: "/business-cards/business-card-sheet-maker/",
        },
      },
    };
  }

  if (isTool) {
    return {
      heroPrimary: {
        label: `Start Your ${meta.primaryKeyword} Layout`,
        href: "#interactive-studio-workspace",
        sublabel: "Free Print-Ready PDF",
      },
      heroSecondary: {
        label: `Explore ${parentHubMeta.primaryKeyword}`,
        href: parentHubMeta.url,
      },
      midBanner: {
        eyebrow: "FREE INTERACTIVE SHEET GENERATOR",
        heading: `Build & Download Your ${meta.h1.split(":")[0]} PDF`,
        body: `Configure paper size, margins, gutters, and crop marks in real time using the ${meta.primaryKeyword} workspace above—no account or watermark.`,
        primary: {
          label: "Scroll Up to Interactive Tool",
          href: "#interactive-studio-workspace",
        },
        secondary: {
          label: `Try ${secondaryTargetMeta.primaryKeyword}`,
          href: secondaryTargetMeta.url,
        },
        trustPoints: [
          "Exact 100% Scale PDF",
          "A4, Letter, A3 & 4×6 Ready",
          "Files Never Leave Your Device",
        ],
      },
      sidebarCard: {
        eyebrow: "LIVE TOOL ON THIS PAGE",
        heading: `Use ${meta.primaryKeyword}`,
        body: "Configure your grid in the interactive studio at the top of this page and download a print-ready PDF.",
        button: {
          label: "Jump to Tool Workspace",
          href: "#interactive-studio-workspace",
        },
        secondaryLink: {
          label: `All ${parentHubMeta.primaryKeyword}`,
          href: parentHubMeta.url,
        },
      },
      bottomCard: {
        eyebrow: "PRINT-READY IN UNDER A MINUTE",
        heading: `Ready to Print Your ${meta.h1.split(":")[0]}?`,
        body: "Jump back to the live canvas workspace above to customize your layout and download a locked-scale PDF, or explore companion tools.",
        primary: {
          label: "Open Tool Workspace Above",
          href: "#interactive-studio-workspace",
        },
        secondary: {
          label: `Browse ${parentHubMeta.primaryKeyword}`,
          href: parentHubMeta.url,
        },
      },
    };
  }

  if (isHub) {
    return {
      heroPrimary: {
        label: `Launch ${primaryTargetMeta.primaryKeyword}`,
        href: primaryTargetMeta.url,
        sublabel: "Most Popular Tool",
      },
      heroSecondary: {
        label: `Try ${secondaryTargetMeta.primaryKeyword}`,
        href: secondaryTargetMeta.url,
      },
      midBanner: {
        eyebrow: "CHOOSE YOUR FREE GENERATOR",
        heading: `Start Designing with Our ${meta.h1.split(":")[0]}`,
        body: `Jump directly into our most popular browser-based sheet maker in this collection and export a millimetre-exact PDF in seconds.`,
        primary: {
          label: `Open ${primaryTargetMeta.primaryKeyword}`,
          href: primaryTargetMeta.url,
        },
        secondary: {
          label: `Open ${secondaryTargetMeta.primaryKeyword}`,
          href: secondaryTargetMeta.url,
        },
        trustPoints: [
          "Free & No Registration",
          "Built-In Crop & Bleed Guides",
          "Instant 300 DPI PDF Export",
        ],
      },
      sidebarCard: {
        eyebrow: "FEATURED HUB TOOL",
        heading: primaryTargetMeta.h1.split(":")[0],
        body: "Skip the setup guesswork and build your sheet directly in your browser.",
        button: {
          label: `Open ${primaryTargetMeta.primaryKeyword}`,
          href: primaryTargetMeta.url,
        },
        secondaryLink: {
          label: `Try ${secondaryTargetMeta.primaryKeyword}`,
          href: secondaryTargetMeta.url,
        },
      },
      bottomCard: {
        eyebrow: "START PRINTING TODAY",
        heading: `Create Your First Sheet with ${primaryTargetMeta.h1.split(":")[0]}`,
        body: "Pick a tool from this hub to arrange your content on A4, Letter, or 4×6 sheets and download a crisp PDF immediately.",
        primary: {
          label: `Launch ${primaryTargetMeta.primaryKeyword}`,
          href: primaryTargetMeta.url,
        },
        secondary: {
          label: `Open ${secondaryTargetMeta.primaryKeyword}`,
          href: secondaryTargetMeta.url,
        },
      },
    };
  }

  return {
    heroPrimary: {
      label: `Open Free ${primaryTargetMeta.primaryKeyword} Tool`,
      href: primaryTargetMeta.url,
      sublabel: "Instant PDF Generator",
    },
    heroSecondary: {
      label: `Try ${secondaryTargetMeta.primaryKeyword}`,
      href: secondaryTargetMeta.url,
    },
    midBanner: {
      eyebrow: "FASTER BROWSER ALTERNATIVE",
      heading: `Skip Manual Setup — Use Our Free ${primaryTargetMeta.h1.split(":")[0]}`,
      body: `Instead of wrestling with printer driver scaling or manual table margins, generate a locked 100%-scale PDF directly in your browser using our ${primaryTargetMeta.primaryKeyword} tool.`,
      primary: {
        label: `Launch ${primaryTargetMeta.primaryKeyword} Now`,
        href: primaryTargetMeta.url,
      },
      secondary: {
        label: `Explore ${secondaryTargetMeta.primaryKeyword}`,
        href: secondaryTargetMeta.url,
      },
      trustPoints: [
        "Zero Software Install",
        "Exact Millimetre Grid Presets",
        "Free Print-Ready PDF Download",
      ],
    },
    sidebarCard: {
      eyebrow: "TRY THE MATCHING TOOL",
      heading: primaryTargetMeta.h1.split(":")[0],
      body: `Apply everything in this ${meta.type.toLowerCase()} immediately with our free online sheet generator.`,
      button: {
        label: `Open ${primaryTargetMeta.primaryKeyword}`,
        href: primaryTargetMeta.url,
      },
      secondaryLink: {
        label: `Browse ${parentHubMeta.primaryKeyword}`,
        href: parentHubMeta.url,
      },
    },
    bottomCard: {
      eyebrow: "PUT THIS WORKFLOW INTO ACTION",
      heading: `Build Your Sheet with ${primaryTargetMeta.h1.split(":")[0]}`,
      body: "Generate a print-ready PDF with exact margins, custom gutters, and hairline crop marks right now—completely free and with no sign-up.",
      primary: {
        label: `Launch ${primaryTargetMeta.primaryKeyword}`,
        href: primaryTargetMeta.url,
      },
      secondary: {
        label: `Try ${secondaryTargetMeta.primaryKeyword}`,
        href: secondaryTargetMeta.url,
      },
    },
  };
}
