import type { Metadata } from "next";
import { PAGES_META } from "@/data/site-meta";
import { ALL_PAGE_CONTENT, buildPageMetadata } from "@/data/pages-registry";
import { PageShell } from "@/components/page/PageShell";

export const metadata: Metadata = buildPageMetadata("HOME");

export default function HomePage() {
  return <PageShell meta={PAGES_META.HOME} content={ALL_PAGE_CONTENT.HOME} />;
}
