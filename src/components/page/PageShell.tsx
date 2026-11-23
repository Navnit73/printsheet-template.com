import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Info,
  Layers,
  Printer,
  Sparkles,
} from "lucide-react";
import type { HeadingNode, PageContent, PageMeta } from "@/types/spec";
import { PAGES_META } from "@/data/site-meta";
import {
  getPageCtas,
  getPageImages,
  type PageCtaConfig,
  type PageImageSpec,
} from "@/data/page-media-ctas";
import { ToolWorkspace } from "@/components/tools/ToolWorkspace";
import { HomeQuickStudio } from "@/components/tools/HomeQuickStudio";
import { StudioActionLink } from "@/components/tools/ui/StudioTrigger";
import { JsonLd } from "@/components/seo/JsonLd";
import { assignHeadingIds } from "@/lib/headings";

function EditorialFigure({
  image,
  ctaHref,
  ctaLabel,
  compact = false,
}: {
  image: PageImageSpec;
  ctaHref?: string;
  ctaLabel?: string;
  compact?: boolean;
}) {
  return (
    <figure
      className={`${
        compact ? "my-0" : "my-8"
      } rounded-3xl bg-[#f5f5f7] p-2.5 sm:p-3.5 overflow-hidden flex flex-col justify-between`}
    >
      <div>
        <div
          className="relative overflow-hidden rounded-2xl bg-white"
          style={{ aspectRatio: `${image.width} / ${image.height}` }}
        >
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading="lazy"
            sizes={
              compact
                ? "(max-width: 768px) 100vw, 320px"
                : "(max-width: 1024px) 100vw, 840px"
            }
            className="w-full h-full object-cover transition duration-300 hover:scale-[1.01]"
          />
        </div>

        <figcaption className="mt-3 px-1.5 pb-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#eef6e4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#365314]">
              <span>{image.badge}</span>
            </span>
            {ctaHref && ctaLabel && (
              <StudioActionLink
                href={ctaHref}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#3f6212] hover:text-[#365314] transition cursor-pointer"
              >
                <span>{ctaLabel}</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </StudioActionLink>
            )}
          </div>

          <p className="text-xs sm:text-sm font-bold text-zinc-950 leading-snug">
            {image.title}
          </p>
          <p className="text-xs text-zinc-600 leading-relaxed">
            {image.caption}
          </p>
        </figcaption>
      </div>

      {!compact && image.specHighlights && image.specHighlights.length > 0 && (
        <div className="mt-2.5 pt-2.5 px-1.5 flex flex-wrap items-center gap-2">
          {image.specHighlights.map((spec, sIdx) => (
            <span
              key={sIdx}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-700"
            >
              <CheckCircle2 className="h-3 w-3 text-[#4d7c0f] shrink-0" />
              <span>{spec}</span>
            </span>
          ))}
        </div>
      )}
    </figure>
  );
}

function MidContentCtaBanner({
  midBanner,
}: {
  midBanner: PageCtaConfig["midBanner"];
}) {
  return (
    <div className="mt-12 rounded-3xl bg-[#eef6e4] p-6 sm:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#3f6212]">
            — {midBanner.eyebrow} —
          </p>
          <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-950 leading-snug">
            {midBanner.heading}
          </p>
          <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
            {midBanner.body}
          </p>
          <div className="pt-1 flex flex-wrap items-center gap-2.5 text-xs font-semibold text-[#365314]">
            {midBanner.trustPoints.map((pt, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/85 px-3 py-1"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-[#4d7c0f] shrink-0" />
                <span>{pt}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
          <StudioActionLink
            href={midBanner.primary.href}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-3 text-xs sm:text-sm font-bold text-zinc-950 transition cursor-pointer"
          >
            <Printer className="h-4 w-4 shrink-0" />
            <span>{midBanner.primary.label}</span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </StudioActionLink>
          <StudioActionLink
            href={midBanner.secondary.href}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-zinc-50 px-4 py-2.5 text-xs font-bold text-zinc-900 transition cursor-pointer"
          >
            <span>{midBanner.secondary.label}</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#4d7c0f] shrink-0" />
          </StudioActionLink>
        </div>
      </div>
    </div>
  );
}

function renderHeadingBlock(
  node: HeadingNode,
  idx: number,
  headingIds: Map<HeadingNode, string>,
  isCardGridSection = false,
  sectionImage?: PageImageSpec,
  sectionCtaHref?: string,
  sectionCtaLabel?: string
) {
  const id = headingIds.get(node) || `section-${idx}`;

  if (node.level === 2) {
    const isHubToolsSection =
      node.text.toLowerCase().includes("tools in this collection") ||
      node.text.toLowerCase().includes("choose your print sheet");
    const isRelatedSection =
      node.text.toLowerCase().includes("more print sheet tools") ||
      node.text.toLowerCase().includes("related ") ||
      node.text.toLowerCase().includes("try it yourself") ||
      node.text.toLowerCase().includes("popular tools and guides");

    const useCardGrid = isHubToolsSection || isRelatedSection;

    return (
      <section
        key={`${id}-${idx}`}
        id={id}
        className="scroll-mt-24"
      >
        <div className="mb-6">
          {useCardGrid && (
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#4d7c0f] mb-2">
              — {isHubToolsSection ? "PRINT SHEET STUDIO" : "EXPLORE MORE"} —
            </p>
          )}
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
            {node.text}
          </h2>
        </div>

        {node.paragraphs?.map((p, pIdx) => (
          <p
            key={pIdx}
            className="text-base text-zinc-600 leading-relaxed mb-4 max-w-3xl"
          >
            {p}
          </p>
        ))}

        {sectionImage && (
          <EditorialFigure
            image={sectionImage}
            ctaHref={sectionCtaHref}
            ctaLabel={sectionCtaLabel}
          />
        )}

        {node.callout && <CalloutBox callout={node.callout} />}

        {node.bullets && node.bullets.length > 0 && (
          <ul className="my-6 space-y-3 text-zinc-700">
            {node.bullets.map((b, bIdx) => (
              <li
                key={bIdx}
                className="flex items-start gap-3 text-sm leading-relaxed"
              >
                <CheckCircle2
                  className="h-4 w-4 text-[#4d7c0f] shrink-0 mt-1"
                  strokeWidth={2}
                />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}

        {node.table && <SpecTable table={node.table} />}

        {node.inlineLinks && node.inlineLinks.length > 0 && (
          <div className="my-4 flex flex-wrap gap-2">
            {node.inlineLinks.map((lnk) => {
              const target = PAGES_META[lnk.targetId];
              return (
                <Link
                  key={`${lnk.targetId}-${lnk.anchor}`}
                  href={target.url}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#eef6e4] px-3.5 py-2 text-xs font-semibold text-[#365314] hover:bg-[#e2efd3] transition"
                >
                  <span>{lnk.anchor}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#4d7c0f]" />
                </Link>
              );
            })}
          </div>
        )}

        {node.children && node.children.length > 0 && (
          <div
            className={
              useCardGrid
                ? "mt-8 grid grid-cols-1 md:grid-cols-2 gap-5"
                : "mt-8 space-y-10"
            }
          >
            {node.children.map((child, cIdx) =>
              renderHeadingBlock(child, cIdx, headingIds, useCardGrid)
            )}
          </div>
        )}
      </section>
    );
  }

  if (node.level === 3) {
    const targetMeta = node.link ? PAGES_META[node.link.targetId] : null;
    const sameAnchorAsText =
      Boolean(node.link) &&
      node.text.trim().toLowerCase() === node.link!.anchor.trim().toLowerCase();

    if (isCardGridSection) {
      return (
        <div
          key={`${id}-${idx}`}
          id={id}
          className="rounded-2xl bg-[#f5f5f7] p-6 flex flex-col justify-between transition hover:bg-[#eef6e4]/55"
        >
          <div>
            <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center text-[#4d7c0f] mb-3.5">
              {targetMeta ? (
                <Layers className="h-4 w-4" strokeWidth={1.75} />
              ) : (
                <Sparkles className="h-4 w-4" strokeWidth={1.75} />
              )}
            </div>

            <h3 className="text-lg font-bold tracking-tight text-zinc-950 leading-snug mb-2">
              {node.link && targetMeta && sameAnchorAsText ? (
                <Link
                  href={targetMeta.url}
                  className="inline-flex items-center gap-1.5 text-zinc-950 hover:text-[#4d7c0f] transition"
                >
                  <span>{node.text}</span>
                  <ArrowUpRight className="h-4 w-4 text-[#4d7c0f] shrink-0" />
                </Link>
              ) : (
                node.text
              )}
            </h3>

            {node.paragraphs?.map((p, pIdx) => (
              <p
                key={pIdx}
                className="text-sm text-zinc-600 leading-relaxed mb-3 last:mb-0"
              >
                {p}
              </p>
            ))}

            {node.callout && <CalloutBox callout={node.callout} />}
          </div>

          {(node.bullets && node.bullets.length > 0) ||
          (node.link && targetMeta && !sameAnchorAsText) ||
          (node.inlineLinks && node.inlineLinks.length > 0) ||
          (node.link && targetMeta && sameAnchorAsText) ? (
            <div className="mt-4 pt-3.5 border-t border-[#e4e4e7]/80 space-y-2.5">
              {node.bullets && node.bullets.length > 0 && (
                <ul className="space-y-1.5 text-xs font-medium text-zinc-800">
                  {node.bullets.map((b, bIdx) => (
                    <li
                      key={bIdx}
                      className="flex items-start gap-2 pt-1 first:pt-0"
                    >
                      <CheckCircle2
                        className="h-3.5 w-3.5 text-[#4d7c0f] shrink-0 mt-0.5"
                        strokeWidth={1.75}
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                {node.link && targetMeta && (
                  <Link
                    href={targetMeta.url}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#eef6e4] px-3 py-1.5 text-xs font-semibold text-[#365314] hover:bg-[#e2efd3] transition"
                  >
                    <span>
                      {sameAnchorAsText
                        ? `Open ${node.link.anchor}`
                        : node.link.anchor}
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[#4d7c0f]" />
                  </Link>
                )}
                {node.inlineLinks?.map((lnk) => {
                  const target = PAGES_META[lnk.targetId];
                  return (
                    <Link
                      key={`${lnk.targetId}-${lnk.anchor}`}
                      href={target.url}
                      className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-[#eef6e4] hover:text-[#365314] transition"
                    >
                      <span>{lnk.anchor}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-[#4d7c0f]" />
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      );
    }

    return (
      <div key={`${id}-${idx}`} id={id} className="space-y-2.5">
        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-950 leading-snug">
          {node.link && targetMeta && sameAnchorAsText ? (
            <Link
              href={targetMeta.url}
              className="inline-flex items-center gap-1.5 text-zinc-950 hover:text-[#4d7c0f] transition"
            >
              <span>{node.text}</span>
              <ArrowUpRight className="h-4 w-4 text-[#4d7c0f] shrink-0" />
            </Link>
          ) : (
            node.text
          )}
        </h3>

        {node.paragraphs?.map((p, pIdx) => (
          <p
            key={pIdx}
            className="text-sm sm:text-base text-zinc-600 leading-relaxed max-w-3xl"
          >
            {p}
          </p>
        ))}

        {node.callout && <CalloutBox callout={node.callout} />}

        {node.bullets && node.bullets.length > 0 && (
          <ul className="pt-1 space-y-2 text-sm text-zinc-600">
            {node.bullets.map((b, bIdx) => (
              <li key={bIdx} className="flex items-start gap-2.5">
                <CheckCircle2
                  className="h-4 w-4 text-[#4d7c0f] shrink-0 mt-0.5"
                  strokeWidth={1.75}
                />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}

        {node.table && <SpecTable table={node.table} />}

        {((node.link && targetMeta && !sameAnchorAsText) ||
          (node.inlineLinks && node.inlineLinks.length > 0)) && (
          <div className="pt-1.5 flex flex-wrap gap-2">
            {node.link && targetMeta && !sameAnchorAsText && (
              <Link
                href={targetMeta.url}
                className="inline-flex items-center gap-1 rounded-xl bg-[#eef6e4] px-3 py-1.5 text-xs font-semibold text-[#365314] hover:bg-[#e2efd3] transition"
              >
                <span>{node.link.anchor}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-[#4d7c0f]" />
              </Link>
            )}
            {node.inlineLinks?.map((lnk) => {
              const target = PAGES_META[lnk.targetId];
              return (
                <Link
                  key={`${lnk.targetId}-${lnk.anchor}`}
                  href={target.url}
                  className="inline-flex items-center gap-1 rounded-xl bg-[#f5f5f7] px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-[#ebeced] transition"
                >
                  <span>{lnk.anchor}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#4d7c0f]" />
                </Link>
              );
            })}
          </div>
        )}

        {node.children && node.children.length > 0 && (
          <div className="mt-4 space-y-4 pl-4">
            {node.children.map((child, cIdx) =>
              renderHeadingBlock(child, cIdx, headingIds, false)
            )}
          </div>
        )}
      </div>
    );
  }

  // H4
  const h4Target = node.link ? PAGES_META[node.link.targetId] : null;
  const sameH4AnchorAsText =
    Boolean(node.link) &&
    node.text.trim().toLowerCase() === node.link!.anchor.trim().toLowerCase();

  return (
    <div key={`${id}-${idx}`} id={id} className="space-y-1.5">
      <h4 className="text-sm font-bold text-zinc-950">
        {node.link && h4Target && sameH4AnchorAsText ? (
          <Link
            href={h4Target.url}
            className="text-[#4d7c0f] hover:underline underline-offset-2"
          >
            {node.text}
          </Link>
        ) : (
          node.text
        )}
      </h4>
      {node.paragraphs?.map((p, pIdx) => (
        <p key={pIdx} className="text-sm text-zinc-600 leading-relaxed">
          {p}
        </p>
      ))}
      {node.callout && <CalloutBox callout={node.callout} />}
      {node.bullets && node.bullets.length > 0 && (
        <ul className="space-y-1.5 text-xs text-zinc-600">
          {node.bullets.map((b, bIdx) => (
            <li key={bIdx} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#4d7c0f] shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
      {node.table && <SpecTable table={node.table} />}
      {((node.link && h4Target && !sameH4AnchorAsText) ||
        (node.inlineLinks && node.inlineLinks.length > 0)) && (
        <div className="pt-1 flex flex-wrap gap-2">
          {node.link && h4Target && !sameH4AnchorAsText && (
            <Link
              href={h4Target.url}
              className="inline-flex items-center gap-1 rounded-xl bg-[#eef6e4] px-3 py-1 text-xs font-semibold text-[#365314] hover:bg-[#e2efd3] transition"
            >
              <span>{node.link.anchor}</span>
              <ArrowUpRight className="h-3 w-3 text-[#4d7c0f]" />
            </Link>
          )}
          {node.inlineLinks?.map((lnk) => {
            const target = PAGES_META[lnk.targetId];
            return (
              <Link
                key={`${lnk.targetId}-${lnk.anchor}`}
                href={target.url}
                className="inline-flex items-center gap-1 rounded-xl bg-[#f5f5f7] px-3 py-1 text-xs font-semibold text-zinc-800 hover:bg-[#ebeced] transition"
              >
                <span>{lnk.anchor}</span>
                <ArrowUpRight className="h-3 w-3 text-[#4d7c0f]" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CalloutBox({
  callout,
}: {
  callout: NonNullable<HeadingNode["callout"]>;
}) {
  const isWarning =
    callout.variant === "rules" || callout.variant === "real-data";

  return (
    <div className="my-5 rounded-2xl bg-[#f5f5f7] p-5 flex items-start gap-3.5">
      <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center shrink-0">
        {isWarning ? (
          <AlertTriangle
            className="h-4 w-4 text-amber-600"
            strokeWidth={1.75}
          />
        ) : (
          <Info className="h-4 w-4 text-[#4d7c0f]" strokeWidth={1.75} />
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold text-zinc-950">{callout.title}</p>
        <p className="text-xs leading-relaxed text-zinc-600">{callout.body}</p>
      </div>
    </div>
  );
}

function SpecTable({
  table,
}: {
  table: NonNullable<HeadingNode["table"]>;
}) {
  return (
    <div className="my-5 rounded-3xl bg-[#f5f5f7] p-2.5 sm:p-3.5 overflow-x-auto">
      <div className="rounded-2xl bg-white overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#f5f5f7]/60 text-zinc-950">
            <tr>
              {table.headers.map((h, i) => (
                <th key={i} scope="col" className="px-4 py-3 font-bold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-zinc-600">
            {table.rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className="odd:bg-white even:bg-[#f5f5f7]/40 hover:bg-[#eef6e4]/40 transition"
              >
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    className={`px-4 py-3 ${
                      cIdx === 0 ? "font-semibold text-zinc-950" : ""
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PageShell({
  meta,
  content,
}: {
  meta: PageMeta;
  content: PageContent;
}) {
  const parentHub = meta.parentHub ? PAGES_META[meta.parentHub] : null;
  const isHome = meta.id === "HOME";
  // On pages with an interactive tool, keep the hero short so the tool sits near the fold;
  // the remaining intro copy renders above the article content instead.
  const hasTool = isHome || Boolean(meta.toolEngine);
  const topIntroParagraphs = hasTool
    ? content.introParagraphs.slice(0, 1)
    : content.introParagraphs;
  const deferredHomeIntroParagraphs = hasTool
    ? content.introParagraphs.slice(1)
    : [];

  const hasNotices = Boolean(
    meta.requiresLocalRulesNote ||
      meta.requiresBrandNonAffiliationNote ||
      meta.isCaseStudyScaffold
  );

  const pageImages = getPageImages(meta);
  const ctas = getPageCtas(meta, content);
  const hasSixOrMoreSections = content.sections.length >= 6;
  const headingIds = assignHeadingIds(content.sections);

  return (
    <>
      <JsonLd meta={meta} content={content} headingIds={headingIds} />

      {/* Top Studio Hero */}
      <div className="bg-white">
        <div className="page-container pt-8 pb-10 sm:pt-12 sm:pb-12">
          {/* Breadcrumbs */}
          {!isHome && (
            <nav
              aria-label="Breadcrumb"
              className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-zinc-600"
            >
              <Link
                href="/"
                className="font-medium text-zinc-600 hover:text-[#4d7c0f] transition"
              >
                print sheet maker
              </Link>
              {parentHub && parentHub.id !== "HOME" && (
                <>
                  <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 text-zinc-400" />
                  <Link
                    href={parentHub.url}
                    className="font-medium text-zinc-600 hover:text-[#4d7c0f] transition"
                  >
                    {parentHub.primaryKeyword}
                  </Link>
                </>
              )}
              <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 text-zinc-400" />
              <span className="text-zinc-950 font-semibold truncate max-w-[260px] sm:max-w-none">
                {meta.primaryKeyword}
              </span>
            </nav>
          )}

          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#4d7c0f]">
                — {isHome ? "ONLINE STUDIO" : meta.type} —
              </span>
              <span className="inline-flex items-center rounded-full bg-[#f5f5f7] px-3 py-1 text-[11px] font-medium text-zinc-600">
                Free · No Sign-Up · Print-Ready PDF
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-950 leading-[1.1] text-balance">
              {meta.h1}
            </h1>

            {!isHome && (
              <p className="mt-4 text-base sm:text-lg font-medium text-zinc-700 max-w-3xl leading-relaxed">
                {content.subtitle}
              </p>
            )}

            <div className="mt-4 space-y-3 max-w-3xl text-sm sm:text-base text-zinc-600 leading-relaxed">
              {topIntroParagraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {/* Hero Action CTA Bar */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <StudioActionLink
                href={ctas.heroPrimary.href}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-3 text-xs sm:text-sm font-bold text-zinc-950 transition cursor-pointer"
              >
                <Printer className="h-4 w-4 shrink-0" />
                <span>{ctas.heroPrimary.label}</span>
                {ctas.heroPrimary.sublabel && (
                  <span className="hidden sm:inline-flex rounded-md bg-zinc-950/10 px-2 py-0.5 text-[10px] font-semibold text-zinc-950">
                    {ctas.heroPrimary.sublabel}
                  </span>
                )}
                <ArrowRight className="h-4 w-4 shrink-0" />
              </StudioActionLink>

              <StudioActionLink
                href={ctas.heroSecondary.href}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#f5f5f7] hover:bg-[#ebeced] px-4 py-3 text-xs sm:text-sm font-semibold text-zinc-800 hover:text-zinc-950 transition cursor-pointer"
              >
                <span>{ctas.heroSecondary.label}</span>
                <ArrowUpRight className="h-4 w-4 text-[#4d7c0f] shrink-0" />
              </StudioActionLink>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Tool Section (Homepage Quick Studio OR Dedicated Tool Engine) */}
      {(isHome || meta.toolEngine) && (
        <section
          id="interactive-studio-workspace"
          aria-label="Interactive Print Sheet Tool"
          className="page-container scroll-mt-24"
        >
          {isHome ? (
            <HomeQuickStudio />
          ) : (
            meta.toolEngine && (
              <ToolWorkspace pageId={meta.id} engine={meta.toolEngine} />
            )
          )}
        </section>
      )}

      {/* Mandatory safety / compliance / scaffold notices (calm strip below workspace) */}
      {hasNotices && (
        <section
          aria-label="Important compliance and compatibility notices"
          className="page-container pt-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {meta.requiresLocalRulesNote && (
              <div className="rounded-2xl bg-[#f5f5f7] px-4 py-3.5 text-xs text-zinc-600 flex items-start gap-3">
                <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle
                    className="h-3.5 w-3.5 text-amber-600"
                    strokeWidth={1.75}
                  />
                </div>
                <div>
                  <span className="font-bold text-zinc-950 block mb-0.5">
                    Check local rules
                  </span>
                  <span className="leading-relaxed">
                    Always verify current local government, postal, food,
                    candle, or cosmetic packaging regulations (photo dimensions,
                    allergen declarations, net weights, burn warnings) before
                    final printing.
                  </span>
                </div>
              </div>
            )}

            {meta.requiresBrandNonAffiliationNote && (
              <div className="rounded-2xl bg-[#f5f5f7] px-4 py-3.5 text-xs text-zinc-600 flex items-start gap-3">
                <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center shrink-0 mt-0.5">
                  <Info
                    className="h-3.5 w-3.5 text-[#4d7c0f]"
                    strokeWidth={1.75}
                  />
                </div>
                <div>
                  <span className="font-bold text-zinc-950 block mb-0.5">
                    Independent compatibility note
                  </span>
                  <span className="leading-relaxed">
                    Print Sheet Maker is not affiliated with, endorsed by, or
                    sponsored by Avery, Canva, Cricut, Epson, Adobe (Photoshop,
                    Lightroom, InDesign), Microsoft Word, Kodak, or Officeworks.
                    Product sizes and workflows are described purely for
                    compatible sheet layouts.
                  </span>
                </div>
              </div>
            )}

            {meta.isCaseStudyScaffold && (
              <div className="rounded-2xl bg-[#f5f5f7] px-4 py-3.5 text-xs text-zinc-600 flex items-start gap-3">
                <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center shrink-0 mt-0.5">
                  <Info
                    className="h-3.5 w-3.5 text-[#4d7c0f]"
                    strokeWidth={1.75}
                  />
                </div>
                <div>
                  <span className="font-bold text-zinc-950 block mb-0.5">
                    [REAL DATA NEEDED] Case Study Scaffold
                  </span>
                  <span className="leading-relaxed">
                    This workflow case study preserves explicit [REAL DATA
                    NEEDED] placeholders under Results and Lessons so only
                    verified metrics and user feedback are published.
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Main Editorial / Outline Content */}
      <article
        className={`page-container ${
          hasTool ? "pt-16 sm:pt-20" : "pt-4"
        } pb-4`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16">
          <div className="lg:col-span-8 xl:col-span-9 min-w-0">
            {deferredHomeIntroParagraphs.length > 0 && (
              <div className="mb-10 space-y-4 text-sm sm:text-base text-zinc-600 leading-relaxed max-w-3xl">
                {deferredHomeIntroParagraphs.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            )}

            {/* Image 1: Lead Studio Overview Figure (rendered only when real Nano Banana images exist for this page) */}
            {pageImages[0] && (
              <EditorialFigure
                image={pageImages[0]}
                ctaHref={ctas.heroPrimary.href}
                ctaLabel={ctas.heroPrimary.label}
              />
            )}

            {/* Sections with Images 2..7 & Mid-Article CTA Banner */}
            {content.sections.map((section, idx) => {
              let sectionImg: PageImageSpec | undefined;
              if (idx < 4) {
                sectionImg = pageImages[idx + 1];
              } else if (hasSixOrMoreSections && (idx === 4 || idx === 5)) {
                sectionImg = pageImages[idx + 1];
              }

              return (
                <div
                  key={`section-wrap-${idx}`}
                  className="mt-12 pt-10 border-t border-[#ebeced] first:mt-0 first:pt-0 first:border-t-0 sm:mt-16 sm:pt-12 sm:first:mt-0 sm:first:pt-0"
                >
                  {renderHeadingBlock(
                    section,
                    idx,
                    headingIds,
                    false,
                    sectionImg,
                    ctas.midBanner.primary.href,
                    ctas.midBanner.primary.label
                  )}

                  {/* Hub pages have 4 H2s, so render Images 6 & 7 as a 2-col Cluster Spotlight after H2[1] when available */}
                  {!hasSixOrMoreSections &&
                    idx === 1 &&
                    pageImages[5] &&
                    pageImages[6] && (
                      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <EditorialFigure
                          image={pageImages[5]}
                          ctaHref={ctas.midBanner.primary.href}
                          ctaLabel={ctas.midBanner.primary.label}
                          compact
                        />
                        <EditorialFigure
                          image={pageImages[6]}
                          ctaHref={ctas.midBanner.secondary.href}
                          ctaLabel={ctas.midBanner.secondary.label}
                          compact
                        />
                      </div>
                    )}

                  {/* Mid-Article Conversion Banner right after H2[1] */}
                  {idx === 1 && (
                    <MidContentCtaBanner midBanner={ctas.midBanner} />
                  )}
                </div>
              );
            })}

            {/* Images 8, 9, 10: Visual Print Calibration, Trimming & Spec Gallery (only when available) */}
            {pageImages[7] && pageImages[8] && pageImages[9] && (
              <section
                id="visual-print-calibration-gallery"
                className="scroll-mt-24 mt-20"
              >
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#4d7c0f] mb-2">
                      — STUDIO CALIBRATION &amp; FINISHING —
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
                      Print Verification, Trimming &amp; Spec Reference
                    </h2>
                  </div>
                  <StudioActionLink
                    href={ctas.heroPrimary.href}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-3.5 py-2 text-xs font-bold text-zinc-950 transition cursor-pointer"
                  >
                    <span>{ctas.heroPrimary.label}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-zinc-950" />
                  </StudioActionLink>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[pageImages[7], pageImages[8], pageImages[9]].map((img) => (
                    <EditorialFigure
                      key={img.slotSlug}
                      image={img}
                      ctaHref={ctas.heroPrimary.href}
                      ctaLabel="Open Tool"
                      compact
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Bottom Conversion CTA Card */}
            <section
              aria-label="Start Your Print Sheet"
              className="mt-16 rounded-3xl bg-zinc-950 text-white p-7 sm:p-10"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2.5 max-w-2xl">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#a3e635]">
                    — {ctas.bottomCard.eyebrow} —
                  </p>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    {ctas.bottomCard.heading}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {ctas.bottomCard.body}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <StudioActionLink
                    href={ctas.bottomCard.primary.href}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-3 text-xs sm:text-sm font-bold text-zinc-950 transition cursor-pointer"
                  >
                    <Printer className="h-4 w-4 shrink-0" />
                    <span>{ctas.bottomCard.primary.label}</span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </StudioActionLink>
                  <StudioActionLink
                    href={ctas.bottomCard.secondary.href}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-3 text-xs sm:text-sm font-semibold text-zinc-100 transition cursor-pointer"
                  >
                    <span>{ctas.bottomCard.secondary.label}</span>
                    <ArrowUpRight className="h-4 w-4 text-[#a3e635] shrink-0" />
                  </StudioActionLink>
                </div>
              </div>
            </section>
          </div>

          {/* Sticky Table of Contents, Quick-Launch CTA & Hub Navigation */}
          <aside className="lg:col-span-4 xl:col-span-3 hidden lg:block">
            <div className="sticky top-24 space-y-4">
              {/* Sidebar Quick-Launch CTA Card */}
              <div className="rounded-3xl bg-[#eef6e4] p-5 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#3f6212]">
                  {ctas.sidebarCard.eyebrow}
                </p>
                <p className="text-sm font-extrabold text-zinc-950 leading-snug">
                  {ctas.sidebarCard.heading}
                </p>
                <p className="text-xs text-zinc-700 leading-relaxed">
                  {ctas.sidebarCard.body}
                </p>
                <StudioActionLink
                  href={ctas.sidebarCard.button.href}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-3.5 py-2.5 text-xs font-bold text-zinc-950 transition cursor-pointer"
                >
                  <span>{ctas.sidebarCard.button.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                </StudioActionLink>
                <Link
                  href={ctas.sidebarCard.secondaryLink.href}
                  className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-white hover:bg-zinc-50 px-3 py-2 text-[11px] font-bold text-zinc-800 transition"
                >
                  <span>{ctas.sidebarCard.secondaryLink.label}</span>
                  <ArrowUpRight className="h-3 w-3 text-[#4d7c0f] shrink-0" />
                </Link>
              </div>

              <div className="rounded-3xl bg-[#f5f5f7] p-5 space-y-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4d7c0f] mb-2.5">
                    On This Page
                  </p>
                  <ul className="space-y-1 text-xs">
                    {content.sections.map((s) => {
                      const anchor = headingIds.get(s) || "section";
                      return (
                        <li key={anchor}>
                          <a
                            href={`#${anchor}`}
                            className="rounded-xl px-2.5 py-1.5 text-zinc-600 hover:bg-white hover:text-zinc-950 font-medium leading-snug block transition"
                          >
                            {s.text}
                          </a>
                        </li>
                      );
                    })}
                    {pageImages.length >= 10 && (
                      <li>
                        <a
                          href="#visual-print-calibration-gallery"
                          className="rounded-xl px-2.5 py-1.5 text-zinc-600 hover:bg-white hover:text-zinc-950 font-medium leading-snug block transition"
                        >
                          Print Verification &amp; Spec Reference
                        </a>
                      </li>
                    )}
                  </ul>
                </div>

                {parentHub && (
                  <div className="pt-4 border-t border-[#e4e4e7] space-y-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-600">
                      Category Hub
                    </p>
                    <Link
                      href={parentHub.url}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-950 hover:text-[#4d7c0f] transition"
                    >
                      <span>{parentHub.primaryKeyword}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-[#4d7c0f]" />
                    </Link>
                    <p className="text-[11px] text-zinc-600 leading-relaxed">
                      Browse every tool, size guide, and tutorial in this
                      collection.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}
