import type { Metadata } from "next";
import {
  buildDynamicMetadata,
  getRouteSlugs,
  resolveDynamicPage,
} from "@/data/pages-registry";
import { PageShell } from "@/components/page/PageShell";

const PREFIX = "/how-to";

export const dynamicParams = false;

export function generateStaticParams() {
  return getRouteSlugs(PREFIX);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return buildDynamicMetadata(PREFIX, slug);
}

export default async function HowToPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { meta, content } = resolveDynamicPage(PREFIX, slug);
  return <PageShell meta={meta} content={content} />;
}
