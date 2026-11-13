import type { Metadata } from "next";
import { DirectoryIndexPage } from "@/components/page/DirectoryIndexPage";
import { SITE_NAME, SITE_URL } from "@/data/site-meta";

const TITLE = "Print Size Guides, Paper Charts & Template Specs";
const DESCRIPTION =
  "Browse all 10 print sheet reference guides covering A4 photo dimensions, 4x6 multi-up layouts, business card bleed rules, sticker paper and jar sizes.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/guides/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/guides/`,
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: `${SITE_URL}/og/guides.png`, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [`${SITE_URL}/og/guides.png`],
  },
};

export default function GuidesIndexPage() {
  return (
    <DirectoryIndexPage
      pageType="Guide"
      url="/guides/"
      eyebrow="PRINT SIZE REFERENCE"
      title={TITLE}
      description={DESCRIPTION}
      intro="Verified millimetre, inch, pixel, and bleed reference charts for A4, US Letter, 4×6 photo sheets, business card stock, sticker papers, and jar containers."
    />
  );
}
