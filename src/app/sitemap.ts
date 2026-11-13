import type { MetadataRoute } from "next";
import { ALL_PAGES, SITE_URL } from "@/data/site-meta";
import type { PageMeta } from "@/types/spec";

const HUB_MODIFIED = new Date("2026-11-13T00:00:00.000Z");
const CONTENT_MODIFIED = new Date("2026-11-13T00:00:00.000Z");

const INDEX_DIRECTORY_URLS = ["/guides/", "/how-to/", "/blog/"];

function getPriority(page: PageMeta): number {
  if (page.type === "Homepage") return 1.0;
  if (page.type === "Hub") return 0.9;
  if (page.type === "Tool") return 0.85;
  if (page.type === "Guide" || page.type === "How-To") return 0.75;
  return 0.65;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const pageEntries: MetadataRoute.Sitemap = ALL_PAGES.filter(
    (page) => !page.isCaseStudyScaffold
  ).map((page) => ({
    url: `${SITE_URL}${page.url}`,
    lastModified:
      page.type === "Homepage" || page.type === "Hub" || page.type === "Tool"
        ? HUB_MODIFIED
        : CONTENT_MODIFIED,
    changeFrequency:
      page.type === "Tool" || page.type === "Hub" || page.type === "Homepage"
        ? "weekly"
        : "monthly",
    priority: getPriority(page),
  }));

  const directoryEntries: MetadataRoute.Sitemap = INDEX_DIRECTORY_URLS.map(
    (url) => ({
      url: `${SITE_URL}${url}`,
      lastModified: HUB_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.8,
    })
  );

  return [...pageEntries, ...directoryEntries];
}
