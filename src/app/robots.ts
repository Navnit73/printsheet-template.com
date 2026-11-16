import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/site-meta";

// Required for `output: "export"` (Cloudflare Pages static hosting).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

