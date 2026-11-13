import type { PageContent, PageMeta } from "@/types/spec";
import {
  PAGES_META,
  SITE_NAME,
  SITE_URL,
  getPagesByCluster,
} from "@/data/site-meta";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function JsonLd({
  meta,
  content,
}: {
  meta: PageMeta;
  content: PageContent;
}) {
  const canonicalUrl = `${SITE_URL}${meta.url}`;
  const ogImageUrl = `${SITE_URL}/opengraph-image`;
  const orgId = `${SITE_URL}/#organization`;
  const websiteId = `${SITE_URL}/#website`;
  const schemas: Record<string, unknown>[] = [];

  // 1. BreadcrumbList (only on non-homepage routes with >= 2 items)
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
        name: hub.primaryKeyword,
        item: `${SITE_URL}${hub.url}`,
      });
      breadcrumbItems.push({
        "@type": "ListItem",
        position: 3,
        name: meta.h1,
        item: canonicalUrl,
      });
    } else {
      breadcrumbItems.push({
        "@type": "ListItem",
        position: 2,
        name: meta.h1,
        item: canonicalUrl,
      });
    }

    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbItems,
    });
  }

  // 2. Page-type specific schema
  if (meta.id === "HOME") {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": orgId,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: ogImageUrl,
      description: meta.metaDescription,
    });

    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": websiteId,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      description: meta.metaDescription,
      inLanguage: "en-US",
      publisher: {
        "@id": orgId,
      },
    });

    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: meta.h1,
      url: `${SITE_URL}/`,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "All",
      browserRequirements: "Requires HTML5 Canvas and JavaScript",
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description: meta.metaDescription,
      publisher: {
        "@id": orgId,
      },
    });
  } else if (meta.type === "Hub") {
    const clusterPages = getPagesByCluster(meta.cluster).filter(
      (p) => p.id !== meta.id
    );
    schemas.push({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${canonicalUrl}#collection`,
      name: meta.h1,
      description: meta.metaDescription,
      url: canonicalUrl,
      inLanguage: "en-US",
      isPartOf: {
        "@id": websiteId,
      },
      hasPart: clusterPages.map((p) => ({
        "@type": p.type === "Tool" ? "WebApplication" : "WebPage",
        name: p.h1,
        url: `${SITE_URL}${p.url}`,
      })),
    });
  } else if (meta.type === "Tool") {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: meta.h1,
      url: canonicalUrl,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "All",
      browserRequirements: "Requires HTML5 Canvas and JavaScript",
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description: meta.metaDescription,
      publisher: {
        "@type": "Organization",
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
        text: (stepNode.paragraphs || []).join(" "),
        url: `${canonicalUrl}#${slugify(stepNode.text)}`,
      })) || [];

    schemas.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: meta.h1,
      description: meta.metaDescription,
      url: canonicalUrl,
      inLanguage: "en-US",
      step: howToSteps,
    });
  } else {
    const articleType =
      meta.type === "Blog"
        ? "BlogPosting"
        : meta.type === "Guide"
          ? "TechArticle"
          : "Article";

    schemas.push({
      "@context": "https://schema.org",
      "@type": articleType,
      headline: meta.h1,
      description: meta.metaDescription,
      url: canonicalUrl,
      inLanguage: "en-US",
      image: [ogImageUrl],
      datePublished: "2025-01-15T00:00:00.000Z",
      dateModified: "2025-02-20T00:00:00.000Z",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonicalUrl,
      },
      author: {
        "@type": "Organization",
        name: SITE_NAME,
        url: `${SITE_URL}/`,
      },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        logo: {
          "@type": "ImageObject",
          url: ogImageUrl,
        },
      },
    });
  }

  // 3. FAQPage schema extracted from the FAQ section
  const faqSection = content.sections.find((s) =>
    s.text.toLowerCase().includes("frequently asked questions")
  );
  if (faqSection?.children && faqSection.children.length > 0) {
    const faqEntities = faqSection.children
      .filter((q) => q.paragraphs && q.paragraphs.length > 0)
      .map((q) => ({
        "@type": "Question",
        name: q.text,
        acceptedAnswer: {
          "@type": "Answer",
          text: q.paragraphs!.join(" "),
        },
      }));
    if (faqEntities.length > 0) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqEntities,
      });
    }
  } else if (content.faqs && content.faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: content.faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.answer,
        },
      })),
    });
  }

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
