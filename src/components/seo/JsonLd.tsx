import type { HeadingNode, PageContent, PageMeta } from "@/types/spec";
import {
  PAGES_META,
  SITE_NAME,
  SITE_URL,
  getPagesByCluster,
} from "@/data/site-meta";
import { getPageImages } from "@/data/page-media-ctas";
import { assignHeadingIds, cleanSchemaText } from "@/lib/headings";
import {
  getOgImageUrl,
  ORG_ID,
  SITE_LOGO_URL,
  WEBSITE_ID,
} from "@/lib/seo-urls";

export function JsonLd({
  meta,
  content,
  headingIds,
}: {
  meta: PageMeta;
  content: PageContent;
  headingIds?: Map<HeadingNode, string>;
}) {
  const resolvedHeadingIds = headingIds || assignHeadingIds(content.sections);
  const canonicalUrl = `${SITE_URL}${meta.url}`;
  const ogImageUrl = getOgImageUrl(meta);
  const pageImages = getPageImages(meta).map((img) =>
    img.src.startsWith("http://") || img.src.startsWith("https://")
      ? img.src
      : `${SITE_URL}${img.src}`
  );
  const primaryImages = pageImages.length > 0 ? [...pageImages, ogImageUrl] : [ogImageUrl];

  const schemas: Record<string, unknown>[] = [];

  // 1. BreadcrumbList (only on non-homepage routes)
  if (meta.id !== "HOME") {
    const breadcrumbItems: {
      "@type": string;
      position: number;
      name: string;
      item: string;
    }[] = [
      {
        "@type": "ListItem",
        position: 1,
        name: SITE_NAME,
        item: `${SITE_URL}/`,
      },
    ];

    if (meta.parentHub && meta.parentHub !== "HOME") {
      const hub = PAGES_META[meta.parentHub];
      breadcrumbItems.push({
        "@type": "ListItem",
        position: 2,
        name: hub.h1.split(":")[0].trim(),
        item: `${SITE_URL}${hub.url}`,
      });
      breadcrumbItems.push({
        "@type": "ListItem",
        position: 3,
        name: meta.h1.split(":")[0].trim(),
        item: canonicalUrl,
      });
    } else {
      breadcrumbItems.push({
        "@type": "ListItem",
        position: 2,
        name: meta.h1.split(":")[0].trim(),
        item: canonicalUrl,
      });
    }

    schemas.push({
      "@type": "BreadcrumbList",
      "@id": `${canonicalUrl}#breadcrumb`,
      itemListElement: breadcrumbItems,
    });
  }

  // 2. Page-type specific schema
  if (meta.id === "HOME") {
    schemas.push({
      "@type": "Organization",
      "@id": ORG_ID,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: {
        "@type": "ImageObject",
        url: SITE_LOGO_URL,
        width: 512,
        height: 512,
      },
      description: meta.metaDescription,
    });

    schemas.push({
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      description: meta.metaDescription,
      inLanguage: "en",
      publisher: { "@id": ORG_ID },
    });

    schemas.push({
      "@type": "WebApplication",
      "@id": `${canonicalUrl}#webapp`,
      name: meta.h1,
      url: `${SITE_URL}/`,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "All",
      browserRequirements: "Requires HTML5 Canvas and JavaScript",
      inLanguage: "en",
      isAccessibleForFree: true,
      screenshot: pageImages[0] || ogImageUrl,
      featureList: [
        "Multi-photo sheet grid maker for A4, US Letter, A3 and 4x6",
        "Biometric passport photo sheet generator (EU, UK, India, US)",
        "10-up & 8-up business card layout tool with crop marks & duplex back page",
        "Custom label, round sticker & barcode (Code 128, EAN-13, UPC) sheet generator",
        "Jar, candle & bottle wrap-around label generator with circumference sizing",
      ],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description: meta.metaDescription,
      publisher: { "@id": ORG_ID },
    });
  } else if (meta.type === "Hub") {
    const clusterPages = getPagesByCluster(meta.cluster).filter(
      (p) => p.id !== meta.id && !p.isCaseStudyScaffold
    );
    schemas.push({
      "@type": "CollectionPage",
      "@id": `${canonicalUrl}#collection`,
      name: meta.h1,
      description: meta.metaDescription,
      url: canonicalUrl,
      inLanguage: "en",
      primaryImageOfPage: pageImages[0] || ogImageUrl,
      isPartOf: { "@id": WEBSITE_ID },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: clusterPages.length,
        itemListElement: clusterPages.map((p, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: p.h1,
          url: `${SITE_URL}${p.url}`,
        })),
      },
    });
  } else if (meta.type === "Tool") {
    schemas.push({
      "@type": "WebApplication",
      "@id": `${canonicalUrl}#webapp`,
      name: meta.h1,
      url: canonicalUrl,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "All",
      browserRequirements: "Requires HTML5 Canvas and JavaScript",
      inLanguage: "en",
      isAccessibleForFree: true,
      screenshot: pageImages[0] || ogImageUrl,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description: meta.metaDescription,
      isPartOf: { "@id": WEBSITE_ID },
      publisher: {
        "@type": "Organization",
        "@id": ORG_ID,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
      },
    });
  } else if (meta.type === "How-To") {
    const stepsSection =
      content.sections.find(
        (s) =>
          s.text.toLowerCase().includes("step-by-step") ||
          s.children?.some((c) => /^step\s+\d+/i.test(c.text))
      ) || content.sections[1];

    const howToSteps =
      stepsSection?.children?.map((stepNode, idx) => ({
        "@type": "HowToStep",
        position: idx + 1,
        name: stepNode.text,
        text: cleanSchemaText((stepNode.paragraphs || []).join(" ")),
        url: `${canonicalUrl}#${resolvedHeadingIds.get(stepNode) || `step-${idx + 1}`}`,
      })) || [];

    schemas.push({
      "@type": "HowTo",
      "@id": `${canonicalUrl}#howto`,
      name: meta.h1,
      description: meta.metaDescription,
      url: canonicalUrl,
      image: primaryImages,
      inLanguage: "en",
      step: howToSteps,
    });
  } else if (!meta.isCaseStudyScaffold) {
    const articleType =
      meta.type === "Blog"
        ? "BlogPosting"
        : meta.type === "Guide"
          ? "TechArticle"
          : "Article";

    schemas.push({
      "@type": articleType,
      "@id": `${canonicalUrl}#article`,
      headline: meta.h1,
      description: meta.metaDescription,
      url: canonicalUrl,
      inLanguage: "en",
      image: primaryImages,
      datePublished: "2025-01-15T00:00:00.000Z",
      dateModified: "2026-11-13T00:00:00.000Z",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonicalUrl,
      },
      author: {
        "@type": "Organization",
        "@id": ORG_ID,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
      },
      publisher: {
        "@type": "Organization",
        "@id": ORG_ID,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        logo: {
          "@type": "ImageObject",
          url: SITE_LOGO_URL,
          width: 512,
          height: 512,
        },
      },
    });
  }

  // 3. FAQPage schema (only for complete non-scaffold pages)
  if (!meta.isCaseStudyScaffold) {
    const faqSection = content.sections.find((s) =>
      s.text.toLowerCase().includes("frequently asked questions")
    );
    if (faqSection?.children && faqSection.children.length > 0) {
      const faqEntities = faqSection.children
        .filter((q) => q.paragraphs && q.paragraphs.length > 0)
        .map((q) => ({
          "@type": "Question",
          name: cleanSchemaText(q.text),
          acceptedAnswer: {
            "@type": "Answer",
            text: cleanSchemaText(q.paragraphs!.join(" ")),
          },
        }));
      if (faqEntities.length > 0) {
        schemas.push({
          "@type": "FAQPage",
          "@id": `${canonicalUrl}#faq`,
          mainEntity: faqEntities,
        });
      }
    } else if (content.faqs && content.faqs.length > 0) {
      schemas.push({
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        mainEntity: content.faqs.map((f) => ({
          "@type": "Question",
          name: cleanSchemaText(f.question),
          acceptedAnswer: {
            "@type": "Answer",
            text: cleanSchemaText(f.answer),
          },
        })),
      });
    }
  }

  const graphPayload = {
    "@context": "https://schema.org",
    "@graph": schemas,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graphPayload) }}
    />
  );
}
