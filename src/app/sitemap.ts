import type { MetadataRoute } from "next";
import { ALL_PAGES, SITE_URL } from "@/data/site-meta";
import type { PageMeta } from "@/types/spec";

const LAST_MODIFIED = new Date("2025-02-20T00:00:00.000Z");

function getPriority(page: PageMeta): number {
  if (page.type === "Homepage") return 1.0;
  if (page.type === "Hub") return 0.9;
  if (page.type === "Tool") return 0.85;
  if (page.type === "Guide" || page.type === "How-To") return 0.75;
  return 0.65;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return ALL_PAGES.map((page) => ({
    url: `${SITE_URL}${page.url}`,
    lastModified: LAST_MODIFIED,
    changeFrequency:
      page.type === "Tool" || page.type === "Hub" || page.type === "Homepage"
        ? "weekly"
        : "monthly",
    priority: getPriority(page),
  }));
}
