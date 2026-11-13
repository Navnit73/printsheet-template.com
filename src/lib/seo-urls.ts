import { SITE_URL } from "@/data/site-meta";
import type { PageMeta } from "@/types/spec";

export const SITE_LOGO_URL = `${SITE_URL}/logo.png`;
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/**
 * Resolves the canonical Open Graph image path for any page without trailing-slash redirects.
 */
export function getOgImageUrl(meta: PageMeta): string {
  if (meta.type === "Homepage") return `${SITE_URL}/og/home.png`;
  if (meta.type === "Guide") return `${SITE_URL}/og/guides.png`;
  if (meta.type === "How-To") return `${SITE_URL}/og/how-to.png`;
  if (meta.type === "Blog" || meta.type === "Case Study") {
    return `${SITE_URL}/og/blog.png`;
  }

  switch (meta.cluster) {
    case "photo-sheets":
      return `${SITE_URL}/og/photo-sheets.png`;
    case "business-cards":
      return `${SITE_URL}/og/business-cards.png`;
    case "labels-stickers":
      return `${SITE_URL}/og/labels-stickers.png`;
    case "jar-bottle-labels":
      return `${SITE_URL}/og/jar-bottle-labels.png`;
    default:
      return `${SITE_URL}/og/home.png`;
  }
}

