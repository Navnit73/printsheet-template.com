import type { Metadata } from "next";
import { PAGES_META } from "@/data/site-meta";
import { ALL_PAGE_CONTENT, buildPageMetadata } from "@/data/pages-registry";
import { PageShell } from "@/components/page/PageShell";

export const metadata: Metadata = buildPageMetadata("HB-BC");

export default function BusinessCardsHubPage() {
  return (
    <PageShell
      meta={PAGES_META["HB-BC"]}
      content={ALL_PAGE_CONTENT["HB-BC"]}
    />
  );
}

