import type { MetadataRoute } from "next";
import { ALL_PAGES, SITE_URL } from "@/data/site-meta";

// Required for `output: "export"` (Cloudflare Pages static hosting).
export const dynamic = "force-static";

const INDEX_DIRECTORY_URLS = ["/guides/", "/how-to/", "/blog/"];

export default function sitemap(): MetadataRoute.Sitemap {
  const pageEntries: MetadataRoute.Sitemap = ALL_PAGES.filter(
    (page) => !page.isCaseStudyScaffold
  ).map((page) => ({
    url: `${SITE_URL}${page.url}`,
  }));

  const directoryEntries: MetadataRoute.Sitemap = INDEX_DIRECTORY_URLS.map(
    (url) => ({
      url: `${SITE_URL}${url}`,
    })
  );

  return [...pageEntries, ...directoryEntries];
}
