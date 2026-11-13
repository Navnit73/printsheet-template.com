import type { ContentTable, HeadingNode, PageContent, PageId } from "@/types/spec";

export interface BlogComparisonSection {
  h2: string;
  intro: string;
  strengthH3: string;
  strengthBody: string;
  watchOutH3: string;
  watchOutBody: string;
  tipH4: string;
  tipBody: string;
}

export interface BlogInput {
  id: PageId;
  hubId: PageId;
  hubAnchor: string;
  subtitle: string;
  intro: string[];
  quickH2: string;
  quickSub1H3: string;
  quickSub1Body: string;
  quickSub2Body: string;
  comparisonTable?: ContentTable;
  callout?: {
    variant: "rules" | "affiliation" | "tip";
    title: string;
    body: string;
  };
  options: [
    BlogComparisonSection,
    BlogComparisonSection,
    BlogComparisonSection,
    BlogComparisonSection,
    BlogComparisonSection,
  ];
  howToChooseIntro: string;
  chooseCriteria: [
    { h3: string; body: string },
    { h3: string; body: string },
    { h3: string; body: string },
  ];
  faqs: [
    { q: string; a: string },
    { q: string; a: string },
    { q: string; a: string },
  ];
  relatedH3s: [
    { heading: string; targetId: PageId; anchor: string; desc: string },
    { heading: string; targetId: PageId; anchor: string; desc: string },
  ];
}

export function buildBlogContent(spec: BlogInput): PageContent {
  const sections: HeadingNode[] = [
    {
      level: 2,
      text: spec.quickH2,
      paragraphs: [
        `Before choosing between methods covered in ${spec.quickH2.toLowerCase()}, evaluate batch size, coated paper costs, and real print speed per sheet.`,
      ],
      table: spec.comparisonTable,
      callout: spec.callout,
      children: [
        {
          level: 3,
          text: spec.quickSub1H3,
          paragraphs: [spec.quickSub1Body],
        },
        {
          level: 3,
          text: "How we compared the options",
          paragraphs: [spec.quickSub2Body],
        },
      ],
    },
    ...spec.options.map((opt) => ({
      level: 2 as const,
      text: opt.h2,
      paragraphs: [opt.intro],
      children: [
        {
          level: 3 as const,
          text: opt.strengthH3,
          paragraphs: [opt.strengthBody],
        },
        {
          level: 3 as const,
          text: opt.watchOutH3,
          paragraphs: [opt.watchOutBody],
          children: [
            {
              level: 4 as const,
              text: opt.tipH4,
              paragraphs: [opt.tipBody],
            },
          ],
        },
      ],
    })),
    {
      level: 2,
      text: "How to choose",
      paragraphs: [spec.howToChooseIntro],
      children: spec.chooseCriteria.map((c) => ({
        level: 3 as const,
        text: c.h3,
        paragraphs: [c.body],
      })),
    },
    {
      level: 2,
      text: "Frequently asked questions",
      paragraphs: [
        `Practical cost, durability, and workflow answers comparing ${spec.quickSub1H3.toLowerCase()} against ${spec.hubAnchor} print sheets.`,
      ],
      children: spec.faqs.map((f) => ({
        level: 3 as const,
        text: f.q,
        paragraphs: [f.a],
      })),
    },
    {
      level: 2,
      text: "Related tools and guides",
      paragraphs: [
        `Put these comparisons into practice using our ${spec.hubAnchor} studio or explore ${spec.relatedH3s.map((r) => r.anchor).slice(0, 2).join(" and ")}.`,
      ],
      inlineLinks: [{ targetId: spec.hubId, anchor: spec.hubAnchor }],
      children: spec.relatedH3s.map((r) => ({
        level: 3 as const,
        text: r.heading,
        link: { targetId: r.targetId, anchor: r.anchor },
        paragraphs: [r.desc],
      })),
    },
  ];

  return {
    id: spec.id,
    subtitle: spec.subtitle,
    introParagraphs: spec.intro,
    breadcrumbAnchor: spec.hubAnchor,
    sections,
    relatedLinks: [
      {
        targetId: spec.hubId,
        anchor: spec.hubAnchor,
        summary: "Browse all tools, tutorials, and buyer guides in this category.",
      },
      ...spec.relatedH3s.map((r) => ({
        targetId: r.targetId,
        anchor: r.anchor,
        summary: r.desc,
      })),
    ],
    faqs: spec.faqs.map((f) => ({ question: f.q, answer: f.a })),
  };
}

