import type { Metadata } from "next";
import { PAGES_META } from "@/data/site-meta";
import { ALL_PAGE_CONTENT, buildPageMetadata } from "@/data/pages-registry";
import { PageShell } from "@/components/page/PageShell";

export const metadata: Metadata = buildPageMetadata("HB-LS");

export default function LabelsStickersHubPage() {
  return (
    <PageShell
      meta={PAGES_META["HB-LS"]}
      content={ALL_PAGE_CONTENT["HB-LS"]}
    />
  );
}

