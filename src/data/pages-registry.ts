import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { PageContent, PageId, PageMeta } from "@/types/spec";
import {
  ALL_PAGE_IDS,
  ALL_PAGES,
  PAGES_META,
  SITE_NAME,
  SITE_URL,
  getPageByUrl,
} from "@/data/site-meta";
import { getOgImageUrl } from "@/lib/seo-urls";
import { HOME_AND_HUB_CONTENT } from "@/data/content-home-hubs";
import { PHOTO_TOOLS_CONTENT } from "@/data/content-tools-photo";
import { CARD_TOOLS_CONTENT } from "@/data/content-tools-cards";
import { LABEL_TOOL_CONTENT } from "@/data/content-tools-labels";
import { JAR_TOOL_CONTENT } from "@/data/content-tools-jars";
import { GUIDES_CONTENT_1 } from "@/data/content-guides-1";
import { GUIDES_CONTENT_2 } from "@/data/content-guides-2";
import { HOWTOS_CONTENT_1 } from "@/data/content-howtos-1";
import { HOWTOS_CONTENT_2 } from "@/data/content-howtos-2";
import { BLOGS_CONTENT_1 } from "@/data/content-blogs-1";
import { BLOGS_CONTENT_2 } from "@/data/content-blogs-2";
import { CASE_STUDIES_CONTENT } from "@/data/content-case-studies";

const MERGED_CONTENT: Partial<Record<PageId, PageContent>> = {
  ...HOME_AND_HUB_CONTENT,
  ...PHOTO_TOOLS_CONTENT,
  ...CARD_TOOLS_CONTENT,
  ...LABEL_TOOL_CONTENT,
  ...JAR_TOOL_CONTENT,
  ...GUIDES_CONTENT_1,
  ...GUIDES_CONTENT_2,
  ...HOWTOS_CONTENT_1,
  ...HOWTOS_CONTENT_2,
  ...BLOGS_CONTENT_1,
  ...BLOGS_CONTENT_2,
  ...CASE_STUDIES_CONTENT,
};

export const ALL_PAGE_CONTENT: Record<PageId, PageContent> = Object.fromEntries(
  ALL_PAGE_IDS.map((id) => {
    const content = MERGED_CONTENT[id];
    if (!content) {
      throw new Error(`Missing page content in registry for PageId "${id}"`);
    }
    return [id, content];
  })
) as Record<PageId, PageContent>;

function normalizePrefix(prefix: string): string {
  if (prefix === "" || prefix === "/") return "/";
  const trimmed = prefix.replace(/^\/+|\/+$/g, "");
  return `/${trimmed}/`;
}

export function getPageByRoute(
  prefix: string,
  slug?: string
): { meta: PageMeta; content: PageContent } | null {
  const base = normalizePrefix(prefix);
  const url = slug ? `${base}${slug.replace(/^\/+|\/+$/g, "")}/` : base;
  const meta = getPageByUrl(url);
  if (!meta) return null;
  const content = ALL_PAGE_CONTENT[meta.id];
  if (!content) return null;
  return { meta, content };
}

export function getRouteSlugs(prefix: string): Array<{ slug: string }> {
  const base = normalizePrefix(prefix);
  if (base === "/") return [];

  return ALL_PAGES.filter(
    (page) => page.url.startsWith(base) && page.url !== base
  ).map((page) => ({
    slug: page.url.slice(base.length).replace(/\/+$/, ""),
  }));
}

export function buildPageMetadata(id: PageId): Metadata {
  const meta = PAGES_META[id];
  const canonicalUrl = `${SITE_URL}${meta.url}`;
  const ogImageUrl = getOgImageUrl(meta);
  const shouldIndex = !meta.isCaseStudyScaffold;
  const isArticle =
    meta.type === "Guide" ||
    meta.type === "How-To" ||
    meta.type === "Blog" ||
    meta.type === "Case Study";

  return {
    title: {
      absolute: meta.seoTitle,
    },
    description: meta.metaDescription,
    keywords: [meta.primaryKeyword, ...(meta.secondaryKeywords || [])],
    alternates: {
      canonical: meta.url,
    },
    robots: shouldIndex
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        }
      : {
          index: false,
          follow: true,
          googleBot: {
            index: false,
            follow: true,
          },
        },
    openGraph: {
      title: meta.seoTitle,
      description: meta.metaDescription,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: isArticle ? "article" : "website",
      locale: "en_US",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: meta.h1,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.seoTitle,
      description: meta.metaDescription,
      images: [ogImageUrl],
    },
  };
}

export function buildDynamicMetadata(prefix: string, slug: string): Metadata {
  const match = getPageByRoute(prefix, slug);
  if (!match) {
    notFound();
  }
  return buildPageMetadata(match.meta.id);
}

export function resolveDynamicPage(
  prefix: string,
  slug: string
): { meta: PageMeta; content: PageContent } {
  const match = getPageByRoute(prefix, slug);
  if (!match) {
    notFound();
  }
  return match;
}
