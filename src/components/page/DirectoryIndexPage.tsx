import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { ALL_PAGES, PAGES_META, SITE_NAME, SITE_URL } from "@/data/site-meta";
import { ALL_PAGE_CONTENT } from "@/data/pages-registry";
import { WEBSITE_ID } from "@/lib/seo-urls";
import type { ClusterId, PageMeta, PageType } from "@/types/spec";

const CLUSTER_LABELS: Record<ClusterId, { title: string; hubHref: string }> = {
  home: { title: "All Print Sheet Tools", hubHref: "/" },
  "photo-sheets": { title: "Photo Sheets & Passport Grids", hubHref: "/photo-sheets/" },
  "business-cards": { title: "Business Cards & Card Stock", hubHref: "/business-cards/" },
  "labels-stickers": { title: "Labels, Addresses & Stickers", hubHref: "/labels-stickers/" },
  "jar-bottle-labels": { title: "Jar, Candle & Bottle Labels", hubHref: "/jar-bottle-labels/" },
};

const CLUSTER_ORDER: ClusterId[] = [
  "photo-sheets",
  "business-cards",
  "labels-stickers",
  "jar-bottle-labels",
];

export function DirectoryIndexPage({
  pageType,
  url,
  eyebrow,
  title,
  description,
  intro,
}: {
  pageType: Extract<PageType, "Guide" | "How-To" | "Blog">;
  url: "/guides/" | "/how-to/" | "/blog/";
  eyebrow: string;
  title: string;
  description: string;
  intro: string;
}) {
  const items = ALL_PAGES.filter(
    (p) => p.type === pageType && !p.isCaseStudyScaffold
  );

  const grouped = CLUSTER_ORDER.map((cluster) => ({
    cluster,
    label: CLUSTER_LABELS[cluster],
    pages: items.filter((p) => p.cluster === cluster),
  })).filter((g) => g.pages.length > 0);

  const canonicalUrl = `${SITE_URL}${url}`;

  const graphSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: title, item: canonicalUrl },
        ],
      },
      {
        "@type": "CollectionPage",
        "@id": `${canonicalUrl}#collection`,
        name: title,
        description,
        url: canonicalUrl,
        inLanguage: "en",
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: items.length,
          itemListElement: items.map((p: PageMeta, idx: number) => ({
            "@type": "ListItem",
            position: idx + 1,
            name: p.h1,
            url: `${SITE_URL}${p.url}`,
          })),
        },
      },
    ],
  };

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(graphSchema),
        }}
      />

      <div className="mx-auto max-w-6xl px-4 pt-8 pb-20 sm:px-6">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-zinc-600"
        >
          <Link href="/" className="hover:text-[#3f6212] transition font-medium">
            Home
          </Link>
          <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 text-zinc-400" />
          <span className="font-semibold text-zinc-900">{title}</span>
        </nav>

        <header className="max-w-3xl space-y-3 mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#4d7c0f]">
            — {eyebrow} —
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 leading-[1.12]">
            {title}
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed">
            {intro}
          </p>
        </header>

        <div className="space-y-12">
          {grouped.map((group) => (
            <section key={group.cluster} aria-labelledby={`group-${group.cluster}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                <h2
                  id={`group-${group.cluster}`}
                  className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950"
                >
                  {group.label.title}
                </h2>
                <Link
                  href={group.label.hubHref}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#3f6212] hover:text-[#365314] transition"
                >
                  <span>Open category tools</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.pages.map((page) => {
                  const pageContent = ALL_PAGE_CONTENT[page.id];
                  const hub = page.parentHub ? PAGES_META[page.parentHub] : undefined;
                  return (
                    <Link
                      key={page.id}
                      href={page.url}
                      className="group rounded-2xl bg-[#f5f5f7] hover:bg-[#eef6e4] p-5 transition flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-1.5">
                        <span className="inline-block rounded-lg bg-white px-2.5 py-0.5 text-[11px] font-bold text-[#365314]">
                          {hub ? hub.primaryKeyword : page.cluster}
                        </span>
                        <h3 className="text-base font-bold text-zinc-950 group-hover:text-[#365314] transition leading-snug">
                          {page.h1}
                        </h3>
                        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                          {pageContent?.subtitle || page.metaDescription}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#3f6212]">
                        <span>Read {pageType.toLowerCase()}</span>
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
