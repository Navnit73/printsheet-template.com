import type { Metadata } from "next";
import { DirectoryIndexPage } from "@/components/page/DirectoryIndexPage";
import { SITE_NAME, SITE_URL } from "@/data/site-meta";

const TITLE = "Print Sheet Maker Blog: Paper, Printers & Workflow Tips";
const DESCRIPTION =
  "Compare label printers, photo and sticker paper finishes, home printing vs print shop costs, Cricut vinyl, and design templates across categories.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/blog/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/blog/`,
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: `${SITE_URL}/og/blog.png`, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [`${SITE_URL}/og/blog.png`],
  },
};

export default function BlogIndexPage() {
  return (
    <DirectoryIndexPage
      pageType="Blog"
      url="/blog/"
      eyebrow="PRINT BLOG & COMPARISONS"
      title={TITLE}
      description={DESCRIPTION}
      intro="Side-by-side comparisons of printers, sticker vinyls, photo paper finishes, software workflows, and unit costs before buying stock or hardware."
    />
  );
}
