import type { Metadata } from "next";
import { DirectoryIndexPage } from "@/components/page/DirectoryIndexPage";
import { SITE_NAME, SITE_URL } from "@/data/site-meta";

const TITLE = "Step-by-Step Print Tutorials & Troubleshooting Guides";
const DESCRIPTION =
  "Step-by-step printing tutorials for Windows 11, iPhone, Android, Photoshop, Canva, InDesign, Word, Epson iPrint and double-sided business cards.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/how-to/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/how-to/`,
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: `${SITE_URL}/og/how-to.png`, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [`${SITE_URL}/og/how-to.png`],
  },
};

export default function HowToIndexPage() {
  return (
    <DirectoryIndexPage
      pageType="How-To"
      url="/how-to/"
      eyebrow="HOW-TO TUTORIALS"
      title={TITLE}
      description={DESCRIPTION}
      intro="Follow clear, software-specific instructions for printing multiple photos, passport grids, labels, stickers, and two-sided business cards at true 100% scale."
    />
  );
}
