import type { HeadingNode, InlineLinkRef, PageContent, PageId } from "@/types/spec";

export interface HowToStep {
  heading: string;
  body: string;
  extra?: string;
  sub?: [
    { h4: string; body: string },
    { h4: string; body: string },
  ];
}

export interface HowToInput {
  id: PageId;
  hubId: PageId;
  hubAnchor: string;
  subtitle: string;
  intro: string[];
  needsIntro: string;
  needs: [
    { h3: string; body: string },
    { h3: string; body: string },
  ];
  stepsH2: string;
  stepsIntro: string;
  steps: [HowToStep, HowToStep, HowToStep, HowToStep, HowToStep];
  fixesIntro: string;
  fixes: [
    { h3: string; body: string },
    { h3: string; body: string },
    { h3: string; body: string },
  ];
  fasterIntro: string;
  fasterSub1Body: string;
  fasterToolHeading: string;
  fasterToolTarget: PageId;
  fasterToolAnchor: string;
  fasterToolBody: string;
  complianceCallout?: {
    variant: "rules" | "affiliation";
    title: string;
    body: string;
  };
  faqs: [
    { q: string; a: string },
    { q: string; a: string },
    { q: string; a: string },
  ];
  relatedH3s: [
    { heading: string; targetId: PageId; anchor: string; desc: string },
    { heading: string; targetId: PageId; anchor: string; desc: string },
  ];
  extraHubLink?: InlineLinkRef;
}

export function buildHowToContent(spec: HowToInput): PageContent {
  const sections: HeadingNode[] = [
    {
      level: 2,
      text: "What you need before you start",
      paragraphs: [spec.needsIntro],
      callout: spec.complianceCallout,
      children: spec.needs.map((n) => ({
        level: 3 as const,
        text: n.h3,
        paragraphs: [n.body],
      })),
    },
    {
      level: 2,
      text: spec.stepsH2,
      paragraphs: [spec.stepsIntro],
      children: spec.steps.map((s) => ({
        level: 3 as const,
        text: s.heading,
        paragraphs: s.extra ? [s.body, s.extra] : [s.body],
        children: s.sub
          ? [
              { level: 4 as const, text: s.sub[0].h4, paragraphs: [s.sub[0].body] },
              { level: 4 as const, text: s.sub[1].h4, paragraphs: [s.sub[1].body] },
            ]
          : undefined,
      })),
    },
    {
      level: 2,
      text: "Common problems and quick fixes",
      paragraphs: [spec.fixesIntro],
      children: spec.fixes.map((f) => ({
        level: 3 as const,
        text: f.h3,
        paragraphs: [f.body],
      })),
    },
    {
      level: 2,
      text: "Faster option: let a layout tool do the work",
      paragraphs: [spec.fasterIntro],
      inlineLinks: [{ targetId: spec.fasterToolTarget, anchor: spec.fasterToolAnchor }],
      children: [
        {
          level: 3,
          text: "When a sheet maker saves time",
          paragraphs: [spec.fasterSub1Body],
        },
        {
          level: 3,
          text: spec.fasterToolHeading,
          link: { targetId: spec.fasterToolTarget, anchor: spec.fasterToolAnchor },
          paragraphs: [spec.fasterToolBody],
        },
      ],
    },
    {
      level: 2,
      text: "Frequently asked questions",
      paragraphs: [
        "Direct troubleshooting answers covering exact printer scaling, grid presets, and alternative PDF layouts.",
      ],
      children: spec.faqs.map((f) => ({
        level: 3 as const,
        text: f.q,
        paragraphs: [f.a],
      })),
    },
    {
      level: 2,
      text: "Related tutorials and tools",
      paragraphs: [
        "Continue with related step-by-step print guides or open the parent hub for all interactive sheet templates.",
      ],
      inlineLinks: spec.extraHubLink
        ? [{ targetId: spec.hubId, anchor: spec.hubAnchor }, spec.extraHubLink]
        : [{ targetId: spec.hubId, anchor: spec.hubAnchor }],
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
        summary: "Explore every tool and guide in this cluster.",
      },
      {
        targetId: spec.fasterToolTarget,
        anchor: spec.fasterToolAnchor,
        summary: spec.fasterToolBody,
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

