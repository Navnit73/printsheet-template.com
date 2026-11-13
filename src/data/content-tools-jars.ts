import type { HeadingNode, InlineLinkRef, PageContent, PageId } from "@/types/spec";

interface JarPreset {
  name: string;
  s1: string;
  s2: string;
  desc: string;
}

interface JarToolInput {
  id: PageId;
  subtitle: string;
  intro: string[];
  h2Steps: string;
  stepsIntro: string;
  steps: [string, string, string, string];
  stepBodies: [string, string, string, string];
  step2Sub: [
    { h4: string; body: string },
    { h4: string; body: string },
  ];
  h2Layouts: string;
  layoutsIntro: string;
  presets: [JarPreset, JarPreset, JarPreset];
  h2Settings: string;
  settingsIntro: string;
  recSettingHeading: string;
  recSettingBody: string;
  h2Projects: string;
  projectsIntro: string;
  projects: [
    { h3: string; body: string },
    { h3: string; body: string },
    { h3: string; body: string },
  ];
  tips: [
    { h3: string; body: string },
    { h3: string; body: string },
    { h3: string; body: string },
  ];
  complianceNote?: {
    variant: "rules" | "affiliation";
    title: string;
    body: string;
  };
  guideLinkText: string;
  guideLinkAnchor: string;
  faqs: [
    { q: string; a: string },
    { q: string; a: string },
    { q: string; a: string },
    { q: string; a: string },
  ];
  relatedH3s: {
    heading: string;
    targetId: PageId;
    anchor: string;
    desc: string;
  }[];
  extraLinks?: InlineLinkRef[];
}

const JAR_TOOL_TAILOR: Record<
  string,
  {
    gridGeometry: string;
    hierarchyRule: string;
    paperLead: string;
    paperNote: string;
    scaleSummary: string;
    scaleDialog: string;
    safeMargin: string;
    vectorLead: string;
    vectorDetail: string;
    faqIntro: string;
    moreIntro: string;
  }
> = {
  T24: {
    gridGeometry: "Rectangles and round toppers stay proportionally spaced on A4 or Letter sheets so pantry sets match uniformly across shelves.",
    hierarchyRule: "Give primary jar contents bold visual contrast while reserving compact bottom bands for packaging dates and storage guidance.",
    paperLead: "Set your print canvas to match your adhesive paper pack before measuring wrap widths or round lids.",
    paperNote: "Use ISO A4 (210 × 297 mm) across UK, Europe, and Australia or US Letter (8.5 × 11 in) in North America so rows align accurately.",
    scaleSummary: "Even a small shrink-to-fit margin adjustment can make circular toppers too narrow for metal twist lids.",
    scaleDialog: "Choose Actual Size (100%) in Acrobat or browser PDF dialogs so cylindrical wraparound strips meet cleanly at a 3–5 mm seam.",
    safeMargin: "Keep net weight, ingredient summaries, and decorative borders 2.5 to 3 mm inside cut guides on home-trimmed jars.",
    vectorLead: "Clean vector PDF paths prevent soft or ragged outlines around fine jar borders and compact allergen text.",
    vectorDetail: "Raster screenshots soften small typography; native browser PDFs keep 6–7 pt ingredients razor sharp on coated adhesive sheets.",
    faqIntro: "Practical answers covering jar diameter measurement, kitchen durability, and print scaling accuracy.",
    moreIntro: "Jump to dedicated canning, preserve, spice, candle, bottle, or essential oil sheets from the list below.",
  },
  T25: {
    gridGeometry: "Balanced oval, panel, and circle placements mirror Ball and Kerr mason jar flat faces alongside screw-band lid disks.",
    hierarchyRule: "Keep cultivar names, brine strengths, and canning dates bold and easy to scan in dimly lit root cellars or pantries.",
    paperLead: "Select the exact cardstock or kraft sticker stock loaded into your rear tray before generating mason jar sheets.",
    paperNote: "Match US Letter cardstock for standard North American canning sticker packs or A4 matte sheets for UK Kilner and Mason preserves.",
    scaleSummary: "Percentage shrinkage leaves flat lid circles undersized inside 70 mm regular-mouth and 86 mm wide-mouth screw bands.",
    scaleDialog: "Disable Fit to Page so regular-mouth (60–65 mm flat center) and wide-mouth (75–80 mm center) lid circles match lid rings closely.",
    safeMargin: "Keep vintage decorative borders inside a 3 mm inset on textured kraft or embossed mason jar sheets.",
    vectorLead: "Crisp hairline borders and clean vector lines stand out vividly even on warm unbleached brown kraft label stocks.",
    vectorDetail: "Vector output prevents feathered dark edges when printing fine mason jar date lines on home inkjet printers.",
    faqIntro: "Answers tailored to regular-mouth vs wide-mouth mason lids, fridge moisture, and removable freezing adhesives.",
    moreIntro: "Pair mason jar sets with traditional jam preserves, pantry spice circles, or browse our full Jar & Bottle hub.",
  },
  T26: {
    gridGeometry: "Scalloped preserve panels and narrow shoulder neck seals nest densely to waste minimal sheet paper across large harvest runs.",
    hierarchyRule: "Allocate distinct vertical zones for harvest year, fruit/floral variety, and net weight so cottage-food stalls display clearly.",
    paperLead: "Pair paper stock choice with jam warmth—let boiled jars reach room temperature before applying permanent acrylic stickers.",
    paperNote: "A4 waterproof matte vinyl and coated gloss sheets resist honey drips and sticky spoons cleanly across market tables.",
    scaleSummary: "Scaling mistakes shrink neck tamper strips short so security seals fail to fold cleanly across hexagonal twist caps.",
    scaleDialog: "Verify 100% scale before batch printing holiday baskets of 190 ml hex and 370 ml straight jam jars.",
    safeMargin: "Inset allergen bolding ('Made in a kitchen handling...') 2.5 mm away from scissors cut borders.",
    vectorLead: "Vector text maintains crisp batch stamps and barcode readability even on small 8 oz honey or preserve testers.",
    vectorDetail: "Crisp PDF typography lets tiny mandatory producer addresses remain effortlessly legible alongside stylized flavor headers.",
    faqIntro: "Key cottage food labeling checks, washable jar adhesives, and multi-up preserve yield answers.",
    moreIntro: "Continue with canning mason jar sheets, kitchen pantry ideas, or return to the parent jar label studio.",
  },
  T27: {
    gridGeometry: "Tightly packed 38 mm round lid circles and compact 48 × 30 mm spice jar fronts fit an entire spice rack onto 1–2 pages.",
    hierarchyRule: "Make uppercase single-word spice names pop visually so drawer tops scan at a glance while prepping dinner.",
    paperLead: "Ensure your printer media setting selects heavyweight gloss or vinyl so saturated grease-resistant inks bond cleanly.",
    paperNote: "Print on ISO A4 or US Letter matte vinyl / coated polyester for cabinet-door and stove-adjacent steam resistance.",
    scaleSummary: "Even 2 mm scaling drift causes small 38 mm round spice stickers to hang over bevelled magnetic or bamboo jar rims.",
    scaleDialog: "Lock Actual Size (100%) so circular drawer lids punch cleanly with standard 1.5-inch (38 mm) lever punches.",
    safeMargin: "Center short spice names vertically inside 38 mm circles with at least 3 mm clearance for multi-word herbs like 'Smoked Paprika'.",
    vectorLead: "Deep monochrome or rich slate vector fills stay remarkably legible under kitchen under-cabinet LED strips.",
    vectorDetail: "PDF vector curves keep circular spice borders clean even across dense 24-to-35-up sheet matrices.",
    faqIntro: "Answers covering 38 mm spice cap fits, kitchen oil splashes, and matching rectangular apothecary bottles.",
    moreIntro: "Explore full-size glass jars, Microsoft Word spice tables, or dropper vial makers next.",
  },
  T28: {
    gridGeometry: "Coordinated front vessel labels and small round bottom safety decals keep poured soy and beeswax tins retail-ready.",
    hierarchyRule: "Reserve clean negative space around fragrance notes on front tins while boxing flame safety icons onto vessel bases.",
    paperLead: "Select textured matte, linen, or smudge-proof laser label stocks engineered to tolerate gentle warmth around candle glass.",
    paperNote: "Confirm US Letter vs A4 sheet dimensions when pairing commercial Avery round bases with wide apothecary wraparounds.",
    scaleSummary: "Undersized wraps create uneven gaps on matte black tins while oversized wraps buckle near shoulder tapers.",
    scaleDialog: "Lock print scale at 100% so measured candle tin circumferences leave an exact, clean 4 mm vertical rear seam gap.",
    safeMargin: "Keep burn-hour disclosures and warning icons cleanly inside bottom decals to stay well within safety print guidelines.",
    vectorLead: "High-contrast minimalist vector typography prints cleanly onto matte cream and kraft textured candle labels without bleeding.",
    vectorDetail: "Vector line rules keep delicate fragrance pyramids and bottom caution symbols sharp down to compact 5 pt text.",
    faqIntro: "Answers on heat-tolerant candle adhesives, vessel diameter math, and mandatory ASTM/safety bottom decals.",
    moreIntro: "Compare thermal vs inkjet candle printers or generate matching essential oil room-spray vial labels.",
  },
  T29: {
    gridGeometry: "Tall front-face panels and sleek cylindrical wrap strips calculate cleanly around standard 330 ml beer and 750 ml wine glass.",
    hierarchyRule: "Place vintage, ABV, and bold brand marks high above curved bottom punts where glass cylinders stay straightest.",
    paperLead: "Use chill-resistant BOPP vinyl, waterproof polyester, or dry matte uncoated stock depending on ice-bucket immersion plans.",
    paperNote: "Match landscape or portrait A4 orientation cleanly so wide horizontal wine wraps never clip near unprintable top/bottom margins.",
    scaleSummary: "Fit-to-page driver scaling disrupts tall wine wrap seam spacing and skews paired front-and-back bottle runs.",
    scaleDialog: "Print strictly at Actual Size (100%) and let pigment or laser prints set completely before wetting bottle glass or chilling.",
    safeMargin: "Keep tall bottle borders 3 mm inside straight-wall glass zones to stop corners lifting near bottle shoulders or tapers.",
    vectorLead: "Rich vector solids and crisp crest lines prevent unsightly inkjet banding across large dark craft-beer wrap areas.",
    vectorDetail: "Full vector PDFs preserve hairline vintner accents, batch numbers, and small mandatory volume statements on every bottle.",
    faqIntro: "Guidance on condensation-proof bottle stocks, cold-rinse glue removal, and avoiding tapered glass bubbles.",
    moreIntro: "Compare dedicated wine printers, step down to small roller vials, or return to the jar & bottle hub.",
  },
  T30: {
    gridGeometry: "Ultra-compact 45 × 20 mm and 50 × 25 mm wrap grids pack up to 48 miniature vial strips cleanly onto a single sheet.",
    hierarchyRule: "Separate botanical or serum actives clearly from dilution ratios so tiny 10 ml rollers stay safe and effortless to identify.",
    paperLead: "Print oil-bottle labels strictly onto BOPP vinyl, waterproof synthetic sheets, or laminated inkjets that resist citrus oils.",
    paperNote: "Tiny 20 mm tall strips require exact sheet tray registration—calibrate A4 vs Letter margins on plain paper first.",
    scaleSummary: "Even 4% page shrinkage reduces tiny vial wraps short of overlapping seams or squeezes 6 pt oil warnings illegible.",
    scaleDialog: "Verify 100% scale strictly so miniature wrap lengths hug 16 mm and 22 mm amber glass vial diameters cleanly.",
    safeMargin: "Keep tiny dilution percentages 2 mm inside trim edges—oil drips smudge uncoated ink near cut boundaries fast.",
    vectorLead: "Zero-blur vector PDF typography is indispensable when fitting ingredient warnings onto 10 ml essential oil rollers.",
    vectorDetail: "High-resolution vector PDFs render sharp botanical Latin names down to 5.5–6 pt without blurry pixel staircases.",
    faqIntro: "Answers on essential-oil resistant films, overlapping vs butt-seam wraps, and small-dropper batch sizing.",
    moreIntro: "Explore full-size bottle wraps, 38 mm spice lid seals, or the Bottle Label Printer comparison guide.",
  },
};

function buildJarToolContent(spec: JarToolInput): PageContent {
  const t = JAR_TOOL_TAILOR[spec.id] ?? JAR_TOOL_TAILOR.T24;
  const sections: HeadingNode[] = [
    {
      level: 2,
      text: spec.h2Steps,
      paragraphs: [spec.stepsIntro],
      children: [
        {
          level: 3,
          text: spec.steps[0],
          paragraphs: [spec.stepBodies[0]],
        },
        {
          level: 3,
          text: spec.steps[1],
          paragraphs: [spec.stepBodies[1]],
          children: [
            {
              level: 4,
              text: spec.step2Sub[0].h4,
              paragraphs: [spec.step2Sub[0].body],
            },
            {
              level: 4,
              text: spec.step2Sub[1].h4,
              paragraphs: [spec.step2Sub[1].body],
            },
          ],
        },
        {
          level: 3,
          text: spec.steps[2],
          paragraphs: [spec.stepBodies[2]],
        },
        {
          level: 3,
          text: spec.steps[3],
          paragraphs: [spec.stepBodies[3]],
        },
      ],
    },
    {
      level: 2,
      text: spec.h2Layouts,
      paragraphs: [spec.layoutsIntro],
      children: spec.presets.map((p) => ({
        level: 3 as const,
        text: p.name,
        paragraphs: [p.desc],
        children: [
          {
            level: 4 as const,
            text: p.s1,
            paragraphs: [t.gridGeometry],
          },
          {
            level: 4 as const,
            text: p.s2,
            paragraphs: [t.hierarchyRule],
          },
        ],
      })),
    },
    {
      level: 2,
      text: spec.h2Settings,
      paragraphs: [spec.settingsIntro],
      children: [
        {
          level: 3,
          text: "Page size and orientation",
          paragraphs: [t.paperLead],
          children: [
            {
              level: 4,
              text: "Using A4 or Letter label sheets",
              paragraphs: [t.paperNote],
            },
          ],
        },
        {
          level: 3,
          text: "Scale, margins and bleed",
          paragraphs: [t.scaleSummary],
          children: [
            {
              level: 4,
              text: "Print at 100% or Actual Size",
              paragraphs: [t.scaleDialog],
            },
            {
              level: 4,
              text: "Keep a safe margin",
              paragraphs: [t.safeMargin],
            },
          ],
        },
        {
          level: 3,
          text: spec.recSettingHeading,
          paragraphs: [spec.recSettingBody],
        },
        {
          level: 3,
          text: "Print quality and file format",
          paragraphs: [t.vectorLead],
          children: [
            {
              level: 4,
              text: "PDF versus JPG output",
              paragraphs: [t.vectorDetail],
            },
          ],
        },
      ],
    },
    {
      level: 2,
      text: spec.h2Projects,
      paragraphs: [spec.projectsIntro],
      children: spec.projects.map((proj) => ({
        level: 3 as const,
        text: proj.h3,
        paragraphs: [proj.body],
      })),
    },
    {
      level: 2,
      text: "Tips for cleaner, sharper prints",
      paragraphs: [spec.guideLinkText],
      inlineLinks: [{ targetId: "G10", anchor: spec.guideLinkAnchor }],
      callout: spec.complianceNote,
      children: spec.tips.map((tip) => ({
        level: 3 as const,
        text: tip.h3,
        paragraphs: [tip.body],
      })),
    },
    {
      level: 2,
      text: "Frequently asked questions",
      paragraphs: [t.faqIntro],
      children: spec.faqs.map((f) => ({
        level: 3 as const,
        text: f.q,
        paragraphs: [f.a],
      })),
    },
    {
      level: 2,
      text: "More print sheet tools and guides",
      paragraphs: [t.moreIntro],
      inlineLinks: [
        { targetId: "HB-JB", anchor: "label designs for jars" },
        ...(spec.extraLinks ?? []),
      ],
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
    breadcrumbAnchor: "label designs for jars",
    sections,
    relatedLinks: [
      {
        targetId: "HB-JB",
        anchor: "label designs for jars",
        summary: "Browse all jar, canning, jam, spice, candle, bottle, and vial makers.",
      },
      {
        targetId: "G10",
        anchor: spec.guideLinkAnchor,
        summary: "Check exact millimetre and inch dimensions from 2 oz up to 32 oz containers.",
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

export const JAR_TOOL_CONTENT: Partial<Record<PageId, PageContent>> = {
  T24: buildJarToolContent({
    id: "T24",
    subtitle:
      "Create custom printable jar labels for lids, pantry fronts, and small-batch food jars—exported as an exact-scale PDF.",
    intro: [
      "Use this jar label template maker to format crisp, aligned jar stickers directly in your browser with zero software install or sign-up. Pick a round lid label, a clean rectangular front badge, or a neck/wrap strip, type your ingredients and date, and export free printable jar labels in seconds.",
      "Every layout tiles evenly onto A4 or US Letter sticker sheets with clear safety margins so jar labels printable at home look sharp on glass, tins, and plastic tubs alike.",
    ],
    h2Steps: "How to use the jar label maker in 4 steps",
    stepsIntro:
      "Configure editable jar labels cleanly for home pantries, market stalls, or handmade gifts using the studio above.",
    steps: [
      "Step 1: Choose your jar label size",
      "Step 2: Edit the name, ingredients and date",
      "Step 3: Preview the labels on the sheet",
      "Step 4: Download the PDF and print",
    ],
    stepBodies: [
      "Measure the flat printable face of your jar (avoiding curved shoulders near the neck and base) and select a matching sheet preset.",
      "Fill in your product title, subtitle, net weight, ingredients list, and made-on or best-before date using editable jar labels fields.",
      "Review how many labels fit on each A4 or US Letter page, toggle border cut guides for uncut sheets, or disable borders for pre-scored Avery-compatible sheets.",
      "Click Download PDF and verify sizing with a quick copy-paper test print before feeding matte or waterproof sticker stock.",
    ],
    step2Sub: [
      {
        h4: "Round, square and rectangle labels",
        body: "Switch cleanly between lid circles, square kraft badges, and wide horizontal front panels within a single jar sticker template studio.",
      },
      {
        h4: "Front, lid and wrap-around labels",
        body: "Pair a bold lid disc with a concise front panel or extended wrap strip when containers need front branding plus reverse nutrition or allergen notes.",
      },
    ],
    h2Layouts: "Jar label template: layouts and presets",
    layoutsIntro:
      "Start with a jar label template layout calibrated to straight-sided glass jars, apothecary tumblers, and quilted pantry containers.",
    presets: [
      {
        name: "Round jar lid labels",
        s1: "Circle labels sized to the lid",
        s2: "Best for gift jars",
        desc: "Circular 45 mm to 60 mm discs drop cleanly onto metal screw lids, keeping jar bodies unobstructed when showing layered dry mixes or golden honey.",
      },
      {
        name: "Rectangle front labels",
        s1: "Landscape labels for jar sides",
        s2: "Best for pantry and food jars",
        desc: "Classic 63.5 × 38.1 mm and 70 × 45 mm rectangular blocks balance bold serif titles with room for ingredient and storage lines.",
      },
      {
        name: "Wrap-around labels",
        s1: "Labels that wrap the jar neck or body",
        s2: "Best for craft and product jars",
        desc: "Wide horizontal panels combine front branding on the middle third with batch dates, barcodes, and handling info along the back seam.",
      },
    ],
    h2Settings: "Free printable jar labels: paper size and print settings",
    settingsIntro:
      "Follow these print-dialog defaults so free printable jar labels transfer smoothly from your screen to matte, kraft, or waterproof adhesive sheets.",
    recSettingHeading: "Editable jar labels: recommended settings",
    recSettingBody:
      "Use matte uncoated sheets for rustic pantry jars, or inkjet printable vinyl laminated with clear sheet film for sauces and kitchen jars wiped with damp cloths. Keeping editable jar labels at 100% scale ensures every jar sticker template cuts evenly.",
    h2Projects: "Jar labels printable for everyday projects",
    projectsIntro:
      "Printing jar labels printable sheets at home lets households and artisan makers adapt batch dates cleanly without minimum order runs.",
    projects: [
      {
        h3: "Pantry organising and gifts",
        body: "Unify pasta, grains, teas, coffee beans, and cookie-mix gift jars with matching clean typography in under five minutes.",
      },
      {
        h3: "Homemade food and craft products",
        body: "Create seasonal chutney, nut-butter, pickle, or scrub batches with clear ingredient lists and date stamps.",
      },
      {
        h3: "Farmers market stalls",
        body: "Print small-run labels the night before weekend markets whenever flavours or harvest batches change.",
      },
    ],
    complianceNote: {
      variant: "rules",
      title: "Check local rules before selling packaged food or jars",
      body: "Food, honey, cosmetics, and homemade gift stalls must follow local food-safety and packaging laws (allergen emphasis, net weight units, batch codes, and producer address). Note: Any compatible label sizes mentioned for Avery or other brands are independent references—Print Sheet Maker has no affiliation with those brands.",
    },
    guideLinkText:
      "Need exact sizing tables for small, medium, and large glass containers? See our detailed",
    guideLinkAnchor: "2 oz jar label template",
    tips: [
      {
        h3: "Measure the jar before choosing label size",
        body: "Wrap a flexible tailor's tape or paper strip around the flat cylindrical wall—avoiding tapered glass shoulders where stiff paper creases.",
      },
      {
        h3: "Use waterproof sticker paper for the fridge",
        body: "Refrigerated jams, pickles, and dressings draw condensation; standard uncoated paper wrinkles unless printed on polypropylene or matte vinyl stock.",
      },
      {
        h3: "Add a date line for freshness tracking",
        body: "Include a pre-printed Date line or printed month/year stamp so pantry staples and preserves rotate safely.",
      },
    ],
    faqs: [
      {
        q: "Where can I find a free jar label template?",
        a: "You can generate free jar label templates download PDFs right here in your browser—supporting printable jar labels template sheets for round lids, rectangles, and wrap strips with zero sign-up.",
      },
      {
        q: "How do I make jar labels at home?",
        a: "Measure your jar's flat panel, enter those dimensions into this editable free printable labels for jars studio, fill in product name and date, print at 100% scale on copy paper to test fit, then print onto adhesive label sheets.",
      },
      {
        q: "What size jar labels should I use?",
        a: "Small 2–4 oz spice or sample jars suit 45–55 mm wide rectangles or 38 mm round lids; standard 8 oz (250 ml) jars typically take 70 × 45 mm panels and 50 mm round lids.",
      },
      {
        q: "Can I edit jar labels before printing?",
        a: "Yes. Unlike static free printable jar labels template downloads or complex PSD files, every title, ingredient block, border, and cell count stays live and editable before PDF export.",
      },
    ],
    relatedH3s: [
      {
        heading: "Mason jar labels printable",
        targetId: "T25",
        anchor: "mason jar labels printable",
        desc: "Format canning dates and regular or wide-mouth lids on dedicated mason jar sheets.",
      },
      {
        heading: "4 oz jar label template",
        targetId: "G10",
        anchor: "2 oz jar label template",
        desc: "Look up exact height and width dimensions for 2 oz, 4 oz, 8 oz, and 16 oz containers.",
      },
      {
        heading: "Spice labels printable",
        targetId: "T27",
        anchor: "spice labels printable",
        desc: "Build minimalist pantry and rack spice labels in sheet grids.",
      },
    ],
  }),

  T25: buildJarToolContent({
    id: "T25",
    subtitle:
      "Make regular-mouth and wide-mouth mason jar lid circles, canning batch labels, and tie-on gift tags in a print-ready PDF.",
    intro: [
      "Create mason jar labels printable sheets sized specifically for preserving jars, two-piece canning lids, and reusable pantry glass. Pick regular-mouth (50–58 mm) or wide-mouth (65–70 mm) disc circles, rectangular batch cards, or favour tags and export an exact-scale PDF straight from your browser.",
      "With built-in Contents, Batch, and Processing Date lines, busy home canners and cottage-kitchen cooks get crisp canning jar labels printable on standard matte, dissolvable, or textured kraft sticker paper.",
    ],
    h2Steps: "How to use the mason jar and canning label maker in 4 steps",
    stepsIntro:
      "Generate a full sheet of perfectly sized lid seals, body tags, or gift neck cards in under two minutes.",
    steps: [
      "Step 1: Choose mason jar or canning jar",
      "Step 2: Add contents and canning date",
      "Step 3: Pick lid and body label sizes",
      "Step 4: Download the PDF and print",
    ],
    stepBodies: [
      "Select whether you are labelling regular-mouth (70 mm metal cap, ~50 mm recessed centre) or wide-mouth (86 mm metal cap, ~65–68 mm flat lid) preserving jars.",
      "Type the recipe name, optional batch note, and canning or best-before date fields.",
      "Match circle diameter for flat lid centres, classic rectangles for smooth-sided Ball or Bernardin-compatible jars, or bordered tag rectangles for twine gift ties.",
      "Export a 100%-scale vector PDF and print on plain cardstock for tags or self-adhesive sheets for lids and fronts.",
    ],
    step2Sub: [
      {
        h4: "Regular-mouth and wide-mouth lids",
        body: "Measure the flat inner medallion inside the metal screw band rather than the outer rim so lid decals sit completely flat without lifting at the groove.",
      },
      {
        h4: "Best-by and processing date fields",
        body: "Leaving a clean printed date line—or typing the canning month right on the PDF—helps track pantry stock rotation cleanly across seasons.",
      },
    ],
    h2Layouts: "Mason jar labels printable: layouts and presets",
    layoutsIntro:
      "Three purpose-built mason jar labels printable presets keep quilted, embossed, and smooth-walled canning jars tidy.",
    presets: [
      {
        name: "Mason jar lid labels",
        s1: "Round labels sized to regular and wide mouth lids",
        s2: "Best for gifts and storage",
        desc: "Round circles drop cleanly inside two-piece canning rings, making lid tops the cleanest printable spot on heavily quilted glass jars.",
      },
      {
        name: "Canning labels with dates",
        s1: "Contents, batch and date lines",
        s2: "Best for preserves and pickles",
        desc: "Structured rectangular formats pair high-contrast recipe names with neat Contents, Made On, and Shelf Use lines.",
      },
      {
        name: "Tag-style mason jar labels",
        s1: "Tags to tie around the neck",
        s2: "Best for gifts and party favours",
        desc: "Cleanly bordered tags print 8 or 10 per cardstock sheet for hole-punching and tying with baker's twine around gift jars.",
      },
    ],
    h2Settings: "Canning jar labels printable: paper size and print settings",
    settingsIntro:
      "Wait until processed jars are completely cool and dry before applying your canning jar labels printable sheets.",
    recSettingHeading: "Mason jar lid labels printable: recommended settings",
    recSettingBody:
      "Print mason jar lid labels printable sheets on matte or kraft label stock at 100% scale, and feed cardstock through a straight bypass path when creating tie-on tags for jars printable at home.",
    h2Projects: "Ball jar labels printable for everyday projects",
    projectsIntro:
      "Compatible sizes for classic mason jars turn seasonal harvests and handmade gifts into cohesive keepsakes—Ball jar labels printable in crisp batches without software fees.",
    projects: [
      {
        h3: "Home canning and preserves",
        body: "Track tomato passata, dill pickles, peach halves, and apple butter cleanly across cellar shelves by harvest year.",
      },
      {
        h3: "Gifts and party favours",
        body: "Add monogrammed wide-mouth lid decals or printable kraft neck tags for bridal showers, teacher gifts, and holiday cookie jars.",
      },
      {
        h3: "Pantry and freezer labelling",
        body: "Use cold-rated removable labels on freezer-safe straight-sided pint jars so broths and berries stay clearly dated without glue residue later.",
      },
    ],
    complianceNote: {
      variant: "affiliation",
      title: "Independent template compatibility & food rules note",
      body: "Print Sheet Maker is independent and not affiliated with Ball, Bernardin, or Avery—any diameter or sheet sizes referenced for compatible regular-mouth and wide-mouth mason jars are sizing guides only. Always wait until processed jars cool completely before applying labels, and check local food-labelling rules if selling home preserves.",
    },
    guideLinkText:
      "Double-checking body versus lid measurements? Consult our chart linking container ounces to label sizes in",
    guideLinkAnchor: "2 oz jar label template",
    tips: [
      {
        h3: "Use removable or dissolvable labels for reusable jars",
        body: "Home canners wash and reuse glass hundreds of times; choose water-dissolvable cornstarch labels or low-tack removable stock so jars soak clean effortlessly.",
      },
      {
        h3: "Always add a date line",
        body: "Standard canning guidance recommends consuming home-canned goods within a year for peak quality—make the month and year immediately scannable.",
      },
      {
        h3: "Test the label on one jar before printing a sheet",
        body: "Cut out one plain-paper proof and wrap or lay it against your specific quilted jar face before running full adhesive sheets.",
      },
    ],
    faqs: [
      {
        q: "Where can I get mason jar labels printable for free?",
        a: "Right here—this browser studio exports mason jar lid, body, and tag sheets as free printable labels for mason jars in vector PDF format with zero sign-up.",
      },
      {
        q: "How do I make canning labels?",
        a: "Choose whether you want lid discs or rectangular batch panels, enter your preserve name and date, pick A4 or Letter stock, and export a 100% scale PDF ready for matte or dissolvable sheets.",
      },
      {
        q: "What size is a mason jar lid label?",
        a: "A regular-mouth mason jar lid centre accepts a 50 mm (2 inch) circle label cleanly inside the ring; a wide-mouth lid accepts a 63–68 mm (2.5 inch) circle label.",
      },
      {
        q: "Can I print ball jar labels at home?",
        a: "Yes. Any home inkjet or laser printer works cleanly for labels compatible with Ball or Bernardin regular and wide-mouth jars using flat lid circles, smooth front panels, or tie-on tags.",
      },
    ],
    relatedH3s: [
      {
        heading: "Jar label template",
        targetId: "T24",
        anchor: "jar label template",
        desc: "Build versatile round, square, or rectangular pantry and product jar sheets.",
      },
      {
        heading: "Jam label template",
        targetId: "T26",
        anchor: "jam label template",
        desc: "Format classic strawberry, marmalade, and jelly jar sheets with flavour and date lines.",
      },
      {
        heading: "4 oz jar label template",
        targetId: "G10",
        anchor: "2 oz jar label template",
        desc: "Compare lid diameters and flat panel heights across 2 oz to 32 oz jars.",
      },
      {
        heading: "Candy & pickle jar label ideas",
        targetId: "B10",
        anchor: "pickle jar label template",
        desc: "Browse creative pantry, pickle, and homemade spread label ideas.",
      },
    ],
  }),

  T26: buildJarToolContent({
    id: "T26",
    subtitle:
      "Design traditional or minimalist jam, jelly, and marmalade jar labels with flavour, batch date, and market-ready clarity.",
    intro: [
      "Use this free jam label template maker to give homemade strawberry jam, crabapple jelly, and citrus marmalade a clean shelf-ready finish without hiring a designer. Pick a classic serif frame, a modern minimalist label, or a preserves collection style, add your flavour and date, and export free jam label templates as crisp PDFs.",
      "Everything renders directly in your browser onto standard A4 or US Letter sheets, making jam jar labels printable in small kitchen batches at 100% exact scale.",
    ],
    h2Steps: "How to use the jam and jelly label maker in 4 steps",
    stepsIntro:
      "Create cohesive preserves branding across 4 oz sampler jars, 8 oz faceted pots, and standard hex jam jars.",
    steps: [
      "Step 1: Pick a jam or jelly label style",
      "Step 2: Add flavour, date and your name",
      "Step 3: Fit labels to the jar size",
      "Step 4: Download the PDF and print",
    ],
    stepBodies: [
      "Select Classic preserves framing, Clean Minimal typography, or Marmalade/Jelly batch styling from the preset switcher.",
      "Enter flavour name, maker/kitchen line, batch date, and key ingredients or net weight.",
      "Choose rectangular panels sized for standard 8 oz (250 ml) jars or circular lid toppers when working with multi-faceted hex glass.",
      "Save the print-ready PDF and run a quick plain-paper wrap check on an empty cool jar before printing matte or textured stock.",
    ],
    step2Sub: [
      {
        h4: "Flavour name and fruit icon",
        body: "Keep the fruit flavour as the largest typographic element on the label so shoppers and guests spot Blackberry, Plum, or Seville Marmalade across the table.",
      },
      {
        h4: "Batch and best-before date",
        body: "Reserve a tidy bottom line for 'Made July 2026' or 'Best Before' stamps so pantry jars and market stock stay organised.",
      },
    ],
    h2Layouts: "Jam label template: layouts and presets",
    layoutsIntro:
      "Choose a jam label template layout balanced for faceted hex jars, round 250 ml pots, and sample-pack jelly glasses.",
    presets: [
      {
        name: "Classic jam jar label",
        s1: "Vintage serif with a fruit icon",
        s2: "Best for farmers markets",
        desc: "Double hairline borders and framed titles echo traditional orchard kitchen styling across cream, kraft, or bright matte paper.",
      },
      {
        name: "Minimal jam label",
        s1: "Clean type and flavour line",
        s2: "Best for gifts",
        desc: "Generous white space and crisp black-and-lime sans typography keep the spotlight on jewel-toned preserves inside the glass.",
      },
      {
        name: "Marmalade and jelly label",
        s1: "Citrus or jelly styling",
        s2: "Best for preserves collections",
        desc: "Colour-consistent layout frames keep multi-flavour gift boxes unified across clear jellies, curds, and chunky chutneys.",
      },
    ],
    h2Settings: "Free jam label templates: paper size and print settings",
    settingsIntro:
      "Keep text sharp and margins even across every pot with these free jam label templates export checks.",
    recSettingHeading: "Jelly jar label template: recommended settings",
    recSettingBody:
      "For damp larder shelves or chilled open jars, print your jelly jar label template onto matte inkjet waterproof vinyl or kraft-textured label stock at 100% scale.",
    h2Projects: "Jam jar labels printable for everyday projects",
    projectsIntro:
      "Clean jam jar template sheets elevate every small-batch preserve run from holiday hampers to roadside honesty boxes.",
    projects: [
      {
        h3: "Homemade jam gifts",
        body: "Bundle three seasonal mini flavours in a cardboard carrier with personalised kitchen labels for neighbours and family.",
      },
      {
        h3: "Farmers market stalls",
        body: "Print small micro-batches on demand as wild blackberries, figs, or quince ripen week by week.",
      },
      {
        h3: "Wedding and holiday favours",
        body: "Create compact 4 oz sample jar labels featuring couple initials, date, and preserve flavour in minutes.",
      },
    ],
    complianceNote: {
      variant: "rules",
      title: "Check local food-labelling rules before selling preserves",
      body: "Cottage food and farmers market rules vary by country and state—check local requirements for full ingredient lists, allergen declarations, sugar weight percentages, net weight units, and producer address before commercial sale.",
    },
    guideLinkText:
      "Measuring hex jars versus straight 4 oz and 8 oz jelly pots? Reference exact flat panel heights in our",
    guideLinkAnchor: "2 oz jar label template",
    tips: [
      {
        h3: "Add allergen and ingredient lines if you sell",
        body: "Even for single-fruit jams, clearly listing ingredients, pectin, acid, and potential trace allergens protects customers and satisfies market inspectors.",
      },
      {
        h3: "Use freezer-proof labels for stored batches",
        body: "Freezer jams and curds expand when frozen and collect frost; standard office glue peels off in cold storage unless rated for low temperatures.",
      },
      {
        h3: "Keep fonts large enough for market lighting",
        body: "Outdoor canopy shade makes tiny 7 pt text hard to read—keep flavour titles at least 14–18 pt in solid black ink.",
      },
    ],
    faqs: [
      {
        q: "Where can I get free jam label templates?",
        a: "This online studio generates homemade jam labels printable right in your browser—supporting free printable jam label templates and jelly jar labels printable free PDF downloads without accounts.",
      },
      {
        q: "How do I print jam jar labels?",
        a: "Select a jam jar template size matching your jar's flat panel, enter flavour and date details, print one copy-paper proof to verify wrap fit, and then feed A4 or Letter matte sticker sheets at 100% scale.",
      },
      {
        q: "Can I make jelly jar labels online?",
        a: "Yes. Switch to the Minimal or Marmalade/Jelly layout preset above to print crisp 4 oz or 8 oz jelly labels immediately.",
      },
      {
        q: "What size are jam jar labels?",
        a: "An average 8 oz (250 ml) jar usually fits a 63.5 × 38.1 mm or 70 × 45 mm front rectangle (or a narrow 50 × 35 mm panel on 6-sided hex jars), paired with an optional 50 mm lid circle.",
      },
    ],
    relatedH3s: [
      {
        heading: "Jar label template",
        targetId: "T24",
        anchor: "jar label template",
        desc: "Build flexible round, square, or front-panel jar labels for any pantry container.",
      },
      {
        heading: "Mason jar labels printable",
        targetId: "T25",
        anchor: "mason jar labels printable",
        desc: "Format canning batch dates and regular or wide-mouth lids cleanly.",
      },
      {
        heading: "Honey jar labels printable",
        targetId: "CS03",
        anchor: "honey jar labels printable",
        desc: "Read how a small beekeeper organised 120 jars in one evening using browser sheet templates.",
      },
      {
        heading: "Food & gift jar label ideas",
        targetId: "B10",
        anchor: "candy jar labels template free",
        desc: "Explore inspiring jam, candy, nut-butter, and gift preserve designs.",
      },
      {
        heading: "Jar label template Word",
        targetId: "H14",
        anchor: "jam label template word",
        desc: "Compare classic Word table layouts against exact-scale PDF jam sheets.",
      },
    ],
  }),

  T27: buildJarToolContent({
    id: "T27",
    subtitle:
      "Build matching minimalist spice rack labels and round spice lid discs with customizable herb lists and alphabetical layout.",
    intro: [
      "Create uniform spice labels printable sheets for apothecary spice drawers, magnetic tins, and bamboo countertop racks in minutes. Pick tiny round lid stickers or sleek rectangular front badges, populate individual cells with all your herbs and blends, and export spice jar labels printable directly to PDF.",
      "With every cell editable in your browser, you get a completely free spice jar template studio—printing exact sheets at home without paying for pre-printed bundles full of spices you never cook with.",
    ],
    h2Steps: "How to use the spice jar label maker in 4 steps",
    stepsIntro:
      "Turn mismatched store spice bottles into a calm, legible kitchen spice drawer using clean multi-label sheets.",
    steps: [
      "Step 1: Choose a spice jar label size",
      "Step 2: Pick your spices from the list",
      "Step 3: Pick a label style",
      "Step 4: Download the PDF and print",
    ],
    stepBodies: [
      "Measure your miniature 2 oz or 4 oz spice jars or flat lid caps (often 35–40 mm circles or 45 × 25 mm rectangles) and select the matching sheet grid.",
      "Enter a whole kitchen pantry of herbs and spices across consecutive slots on one sheet—from Allspice to Za'atar—editing every word freely.",
      "Choose minimalist uppercase typography, subtle double borders, or small spice-heat/use notes underneath each name.",
      "Download your vector PDF and print at 100% scale onto waterproof matte or clear matte sticker sheets.",
    ],
    step2Sub: [
      {
        h4: "Round lid and rectangle front labels",
        body: "Use circular decals if jars sit upright inside deep kitchen drawers where you only look straight down, or front rectangles on tiered shelf racks.",
      },
      {
        h4: "A to Z and category sorting",
        body: "Organise your grid alphabetically or group baking spices (cinnamon, nutmeg, cardamom) together so printing matches your rack order.",
      },
    ],
    h2Layouts: "Spice labels printable: layouts and presets",
    layoutsIntro:
      "Every spice labels printable preset accommodates common IKEA-style glass shakers, Bambu square jars, and magnetic tins.",
    presets: [
      {
        name: "Minimalist spice labels",
        s1: "Clean type, no icons",
        s2: "Best for modern kitchens",
        desc: "Sharp tracked-out black sans-serif or timeless serif text on crisp white or matte clear film blends smoothly into minimalist pantry aesthetics.",
      },
      {
        name: "Round spice jar labels",
        s1: "Circle labels for jar lids",
        s2: "Best for drawers and racks",
        desc: "Sized around 35 mm to 45 mm discs, compact lid seals make drawer inserts readable at a single glance while cooking.",
      },
      {
        name: "Spice labels with blend notes",
        s1: "Name plus use or heat level",
        s2: "Best for cooks and gifts",
        desc: "Add subtle origin, heat, or pairing lines (e.g. 'Smoked Paprika — Sweet Spanish') on 50 × 30 mm panels.",
      },
    ],
    h2Settings: "Spice jar labels printable: paper size and print settings",
    settingsIntro:
      "Kitchen steam and oily cooking fingers require sturdy adhesion on spice jar labels printable sheets.",
    recSettingHeading: "Editable spice label template: recommended settings",
    recSettingBody:
      "An editable spice label template works best printed in high-contrast black ink onto waterproof matte vinyl or matte clear sticker paper—and let ink cure for 15 minutes before handling near a stove.",
    h2Projects: "Spice labels printable free for everyday projects",
    projectsIntro:
      "Having spice labels printable free in custom batches lets cooks match newly bought blends to their existing jar set anytime.",
    projects: [
      {
        h3: "Spice rack and drawer organising",
        body: "Rebottle cluttered supermarket jars into uniform square glass pots labelled edge to edge across one A4 sheet.",
      },
      {
        h3: "Gift sets of spice blends",
        body: "Mix homemade taco seasoning, chai masala, and BBQ rubs in 2 oz mini jars for tasteful housewarming presents.",
      },
      {
        h3: "Meal-prep and pantry labelling",
        body: "Keep whole peppercorns, dried chillies, bay leaves, and specialty salts matched cleanly beside dry baking staples.",
      },
    ],
    guideLinkText:
      "Checking dimensions for miniature 2 oz and 4 oz spice vials? See exact millimetre widths in our",
    guideLinkAnchor: "2 oz jar label template",
    tips: [
      {
        h3: "Sort labels alphabetically for fast finding",
        body: "Typing names A–Z into the multi-label grid helps during sheet cutting AND makes laying labels onto filled jars fast and error-free.",
      },
      {
        h3: "Use waterproof stickers for kitchen use",
        body: "Steam from simmering pans and damp dishcloth wipes quickly ruins plain paper; choose matte waterproof vinyl or laminate plain sticker sheets with clear matte book-covering film.",
      },
      {
        h3: "Label the lid and the front for drawers",
        body: "If you sometimes move spices from a counter rack to a drawer, print one small front strip plus one matching tiny cap dot on the same sheet.",
      },
    ],
    faqs: [
      {
        q: "Where can I get printable spice labels for free?",
        a: "This free spice jar template generator lets you type your own herb list—producing editable free spice label packs (compatible with standard A4 or Avery-sized sheets) right as a print-ready PDF.",
      },
      {
        q: "How do I make editable spice labels?",
        a: "Switch to multi-label editing in the tool studio above, type one spice name per label box, choose minimalist rectangular or round sizing, and download your custom PDF.",
      },
      {
        q: "What size are spice jar labels?",
        a: "Most standard 4 oz square or round spice jars fit 38–48 mm wide × 25–38 mm tall front labels, while flat twist caps typically take 35–40 mm diameter circles.",
      },
      {
        q: "Can I print spice labels at home?",
        a: "Yes. Any home inkjet or laser printer produces ultra-clean black-on-white or matte vinyl labels when set to 100% scale and Heavy/Matte paper mode.",
      },
    ],
    relatedH3s: [
      {
        heading: "Jar label template",
        targetId: "T24",
        anchor: "jar label template",
        desc: "Design matching larger pantry jars for flour, grains, coffee, and dry staples.",
      },
      {
        heading: "Round labels for printer",
        targetId: "T19",
        anchor: "round labels for printer",
        desc: "Generate exact-diameter lid dots for spice caps and apothecary drawers.",
      },
      {
        heading: "Jar label template Word",
        targetId: "H14",
        anchor: "jar label template word",
        desc: "Compare Word table templates with browser-based exact PDF generation.",
      },
    ],
  }),

  T28: buildJarToolContent({
    id: "T28",
    subtitle:
      "Create heat-friendly front panels, full-wrap vessel bands, and wick warning base discs for soy and beeswax candle jars.",
    intro: [
      "Use this free candle label maker to design front-panel brand labels, clean wrap-around bands, and crisp base warning discs in a single browser workspace. Choose presets sized for standard 4 oz, 8 oz, and 12 oz candle vessels, add scent notes, wax weight, and safety copy, and download a print-ready PDF.",
      "Every layout works on home inkjet or laser printers without needing thermal rolls or paid design suites, making this candle jar label maker ideal for seasonal test batches and artisan craft markets.",
    ],
    h2Steps: "How to use the candle label maker in 4 steps",
    stepsIntro:
      "Lay out cohesive scent labels and bottom safety warnings quickly inside the candle label maker studio.",
    steps: [
      "Step 1: Choose your candle jar size",
      "Step 2: Add scent, brand name and warnings",
      "Step 3: Fit labels to the jar curve",
      "Step 4: Download the PDF and print",
    ],
    stepBodies: [
      "Measure straight wall height (between the base radius and upper rim) and pick a front square, compact rectangle, or wrap-around strip.",
      "Type your candle studio name, fragrance blend, net wax weight, burn-time note, and clear caution text.",
      "Remember that even straight tumblers can taper slightly near the base; verify paper-strip contact cleanly before setting label height.",
      "Export a 100% scale PDF and print onto oil-resistant matte or textured label sheets.",
    ],
    step2Sub: [
      {
        h4: "Wrap-around and front-panel labels",
        body: "Use crisp front squares on amber apothecary jars and matte ceramic vessels; reserve long wrap bands strictly for cylindrical straight-walled glass.",
      },
      {
        h4: "Safety warning and burn-time fields",
        body: "Pair every vessel label batch with a sheet of clean circular warning stickers sized to sit recessed inside the glass bottom.",
      },
    ],
    h2Layouts: "Candle label maker: layouts and presets",
    layoutsIntro:
      "Pick a candle label maker preset calibrated for tins, apothecary tumblers, and luxury glass vessels.",
    presets: [
      {
        name: "Front panel candle label",
        s1: "Brand, scent and weight",
        s2: "Best for small jars and tins",
        desc: "Balanced 50 × 50 mm or 70 × 55 mm rectangular badges highlight collection name and scent notes cleanly without bubbling on tapered glass.",
      },
      {
        name: "Wrap-around candle label",
        s1: "Label that wraps the full jar",
        s2: "Best for straight-sided jars",
        desc: "Wide horizontal bands give studio luxury presentation across straight-walled tumblers while leaving a subtle 3–5 mm glass gap or seamless back overlap.",
      },
      {
        name: "Lid and bottom labels",
        s1: "Round lid label and warning sticker",
        s2: "Best for retail packaging",
        desc: "Circular 45–55 mm safety base discs hold trim-wick warnings, fire pictograms, and maker details cleanly out of sight underneath each candle.",
      },
    ],
    h2Settings: "Candle label maker online: paper size and print settings",
    settingsIntro:
      "Follow clean scaling and media defaults inside this candle label maker online so oil-rich fragrances never stain thin uncoated labels.",
    recSettingHeading: "Candle label maker free: recommended settings",
    recSettingBody:
      "Print candle label maker free sheets at 100% scale onto heat-safe, oil-resistant vinyl or coated matte polyester (BOPP-compatible) sheets rather than thin uncoated paper, which absorbs fragrance oil around seams.",
    h2Projects: "Custom candle label maker for everyday projects",
    projectsIntro:
      "A fast custom candle label maker (and practical candle label creator) empowers candle studios to launch limited-edition scents overnight.",
    projects: [
      {
        h3: "Handmade candle sellers",
        body: "Test ten autumn scent blends in 20-jar runs without committing to expensive die-cut roll minimums.",
      },
      {
        h3: "Craft fairs and gift shops",
        body: "Pair consistent apothecary jar fronts with matching round lid seals and safety warning discs printed at home.",
      },
      {
        h3: "Wedding and party favour candles",
        body: "Create personalised travel-tin lids and miniature 2 oz glass labels displaying guest dates and custom scent names.",
      },
    ],
    complianceNote: {
      variant: "rules",
      title: "Check local rules for candle fire-safety & CLP warning labels",
      body: "Retail candles in the US, UK, EU, Australia, and Canada face strict safety labelling rules (ASTM F2058 / EN 15494 pictograms, UK/EU CLP fragrance allergen statements, net weight, and maker contact info). Always check local candle safety regulations before selling.",
    },
    guideLinkText:
      "Checking front panel sizes on 4 oz travel tins versus 8 oz tumblers? Reference our sizing guide for",
    guideLinkAnchor: "2 oz jar label template",
    tips: [
      {
        h3: "Add burn safety warnings required in your region",
        body: "Place trim-wick, keep-within-sight, and heat-surface warnings legibly on your base disc or reverse panel.",
      },
      {
        h3: "Use heat-resistant or oil-proof label paper",
        body: "Glass walls warm up above 50 °C toward the final third of a burn, and fragrance oils soften cheap glues—choose heat-tolerant matte polypropylene or laser-rated stock.",
      },
      {
        h3: "Test a single label on a finished candle jar",
        body: "Test-burn one labelled jar down to the final centimetre of wax to confirm adhesive never peels, bubbles, or discolours from glass warmth.",
      },
    ],
    faqs: [
      {
        q: "Can I make candle labels online for free?",
        a: "Yes. This custom candle label maker creates unlimited print-ready front panels, wrap bands, and safety base stickers directly as vector PDFs with no paywall.",
      },
      {
        q: "How do I create custom candle labels?",
        a: "Measure the flat straight section of your vessel, pick a front or wrap layout above, type your scent name, weight, and safety copy, and export a 100% scale PDF sheet.",
      },
      {
        q: "What size should candle labels be?",
        a: "Popular 8–9 oz straight glass tumblers typically look well-balanced with a 65 × 65 mm or 75 × 50 mm front label and a 50 mm circular base warning sticker.",
      },
      {
        q: "What do candle labels need to include?",
        a: "Key retail elements include brand name, scent name, net wax weight (g and oz), flame-safety warning text/pictograms, maker address/contact, and regional allergen declarations (e.g. CLP).",
      },
    ],
    relatedH3s: [
      {
        heading: "Jar label template",
        targetId: "T24",
        anchor: "jar label template",
        desc: "Format generic pantry, apothecary, and cosmetic jar sheets in any grid.",
      },
      {
        heading: "Best label printer for candles",
        targetId: "B02",
        anchor: "best label printer for candles",
        desc: "Compare thermal rolls, inkjet sheets, and laser copiers for candle businesses.",
      },
      {
        heading: "Candle jar label templates",
        targetId: "CS04",
        anchor: "candle jar label templates",
        desc: "See the case-study scaffold for how small-batch candle studios streamline multi-scent sheets.",
      },
    ],
  }),

  T29: buildJarToolContent({
    id: "T29",
    subtitle:
      "Design waterproof-ready front panels and seamless wrap labels for juice bottles, syrup flasks, hot-sauce glass, and plastic squeeze bottles.",
    intro: [
      "Use this bottle label maker to build crisp, fitted beverage and condiment labels directly on your browser canvas—ideal as a glass bottle label maker for cold-pressed juices, hot sauces, and kombucha, or a flexible plastic bottle label maker for sauces and cleaners. Enter circumference and straight body height, add ingredients and batch notes, and export an exact-scale PDF.",
      "Unlike generic sticker boxes, every preset factors in cylindrical bottle curvature and seam overlaps so printable sheets sit flat without wrinkling along sloped bottle shoulders.",
    ],
    h2Steps: "How to use the bottle label maker in 4 steps",
    stepsIntro:
      "Measure any glass or PET plastic container once and generate an exact-scale wrap or front bottle label sheet in seconds.",
    steps: [
      "Step 1: Choose your bottle type and size",
      "Step 2: Add the product name and details",
      "Step 3: Fit labels to the bottle curve",
      "Step 4: Download the PDF and print",
    ],
    stepBodies: [
      "Select Front Rectangle for curved flasks, Wrap-Around for straight cylindrical bottles, or Small Front for slender oil and dressing necks.",
      "Type your drink or condiment name, volume (ml / fl oz), key ingredients, shake-well prompts, and best-before date.",
      "Enter the exact flat cylindrical height (leaving at least 4–6 mm clear below the shoulder curve and above the base heel) and test with a paper strip.",
      "Export a 100%-scale PDF and print onto matte waterproof vinyl or coated polyester stock compatible with condensation and chillers.",
    ],
    step2Sub: [
      {
        h4: "Measure bottle height and circumference",
        body: "Check height strictly along the flat vertical section with a flat ruler; wrap paper tape tightly around the circumference and deduct 4–6 mm for clean seam spacing.",
      },
      {
        h4: "Waterproof and wrap-around label settings",
        body: "Keep front logos centered horizontally so even when full wraps meet on the back, the main visual lands dead-on-centre facing shelves.",
      },
    ],
    h2Layouts: "Bottle label maker: layouts and presets",
    layoutsIntro:
      "Three tuned bottle label maker presets cover sauces, syrups, cold-pressed drinks, and sample oils.",
    presets: [
      {
        name: "Front label for glass bottles",
        s1: "Straight rectangle label",
        s2: "Best for sauces and syrups",
        desc: "Compact tall or wide front badges apply easily without trapping diagonal air bubbles on gently tapered glass bottles.",
      },
      {
        name: "Wrap-around juice bottle label",
        s1: "Full-wrap label with a seam",
        s2: "Best for juice and drinks",
        desc: "Balanced wrap widths separate bold front branding from side ingredients, nutrition notes, and storage rules cleanly on one pass.",
      },
      {
        name: "Small bottle label",
        s1: "Compact front label",
        s2: "Best for oils and samples",
        desc: "Narrow vertical spice bottle labels template and mini sample-flask grids fit 50 ml, 100 ml, and slender hot-sauce bottles smoothly.",
      },
    ],
    h2Settings: "Glass bottle label maker: paper size and print settings",
    settingsIntro:
      "Keep moisture out and ink locked sharp across glass bottle label maker and cold-fridge drink runs.",
    recSettingHeading: "Plastic bottle label maker: recommended settings",
    recSettingBody:
      "A flexible plastic bottle label maker layout needs conformable matte or clear waterproof vinyl rather than stiff cardboard-heavy paper, which pops off flexible PET squeeze bottles when gripped.",
    h2Projects: "Juice bottle label maker for everyday projects",
    projectsIntro:
      "Using a browser juice bottle label maker lets home kitchens, micro-breweries, and farmers market vendors print fresh drink batches on demand.",
    projects: [
      {
        h3: "Homemade drinks and sauces",
        body: "Bottle limoncello, elderflower cordial, chilli oil, and cold-brew concentrate with clear shake-well instructions and batch dates.",
      },
      {
        h3: "Craft sellers and market stalls",
        body: "Launch seasonal juice flavours and holiday gift sets quickly without paying roll-printing setup plates.",
      },
      {
        h3: "Party and event drinks",
        body: "Wrap miniature sparkling water, soda, or celebratory prosecco bottles cleanly with custom event dates and guest messages.",
      },
    ],
    complianceNote: {
      variant: "rules",
      title: "Check local food & beverage labelling rules",
      body: "Bottled beverages, sauces, infused oils, and alcoholic drinks must comply with local regulations covering net fluid volume, ingredients and allergens, alcohol ABV (where applicable), nutrition panels, and producer details. Always check local laws before selling.",
    },
    guideLinkText:
      "Comparing bottle heights with standard 2 oz, 4 oz, and 8 oz containers? Review dimensions in our",
    guideLinkAnchor: "2 oz jar label template",
    tips: [
      {
        h3: "Measure circumference before sizing a wrap label",
        body: "Never estimate diameter visually—a 3 mm error in circumference creates an awkward gap or forces wrapped text over the opposite border.",
      },
      {
        h3: "Use waterproof or oil-proof label stock",
        body: "Beverage coolers and olive-oil drips destroy regular office paper within hours; print onto waterproof matte vinyl or clear BOPP-style sheets.",
      },
      {
        h3: "Leave a small gap at the seam",
        body: "For wrap labels, sizing width 4–6 mm shorter than circumference—or leaving a clean vertical unprinted edge for slight overlap—prevents ink smudging at the join.",
      },
    ],
    faqs: [
      {
        q: "Can I make bottle labels at home?",
        a: "Yes. With a standard inkjet or laser printer loaded with waterproof adhesive sheets, this bottle label maker produces chilled-ready bottle label maker for printing sheets at zero cost.",
      },
      {
        q: "What size should bottle labels be?",
        a: "A 250–330 ml juice or soda bottle typically fits a 180 × 55 mm wrap or a 60 × 70 mm front panel; slim 150 ml woozy hot-sauce bottles usually wrap cleanly around 140 × 65 mm.",
      },
      {
        q: "What label paper is best for glass bottles?",
        a: "Waterproof matte vinyl or laser-safe white/clear polyester adhesive sheets resist ice buckets, fridge condensation, and sauce drips cleanly.",
      },
      {
        q: "Do I need a label printer for bottles?",
        a: "No. While high-volume bottlers use roll machines, a regular A4/Letter colour inkjet or laser printer prints crisp multi-up sheets for small-to-medium runs.",
      },
    ],
    relatedH3s: [
      {
        heading: "Bottle label printer",
        targetId: "G08",
        anchor: "bottle label printer",
        desc: "Decide when dedicated roll machines beat printable sheets for high-volume bottling.",
      },
      {
        heading: "Wine label printer",
        targetId: "B03",
        anchor: "wine label printer",
        desc: "Compare home printers, waterproof stock, and press finishes for wine and beer bottles.",
      },
      {
        heading: "Vial label printer",
        targetId: "T30",
        anchor: "vial label printer",
        desc: "Print tiny 5 ml, 10 ml, and 15 ml dropper, cosmetic, and essential oil labels.",
      },
    ],
  }),

  T30: buildJarToolContent({
    id: "T30",
    subtitle:
      "Make ultra-crisp sheets for 5 ml, 10 ml, and 15 ml dropper bottles, apothecary flasks, and sample vials on any regular desktop printer.",
    intro: [
      "Think you need a dedicated vial label printer to get legible tiny bottles? You can generate high-resolution vector sheets for 5 ml, 10 ml, and 15 ml dropper bottles right here on your regular home inkjet or laser printer. Set exact narrow dimensions, enter botanical name, dilution, or batch details, and export a crystal-clear PDF.",
      "Ideal as both an essential oil label maker and an apothecary bottle label template generator, locking vector fonts keeps 6 pt copy razor-sharp without blurry raster edges.",
    ],
    h2Steps: "How to use the vial and essential oil label maker in 4 steps",
    stepsIntro:
      "Even though searches often ask for a 'vial label printer', any modern 600 DPI laser or inkjet printer handles miniature vials smoothly when grids lock exact dimensions.",
    steps: [
      "Step 1: Choose a vial or dropper bottle size",
      "Step 2: Add the product name and details",
      "Step 3: Fit labels to the tiny surface",
      "Step 4: Download the PDF and print",
    ],
    stepBodies: [
      "Measure the straight cylinder between the neck crimp and the bottom curve—most 10 ml amber droppers have only ~28–32 mm of flat vertical wall.",
      "Keep copy concise: bold common name, Latin botanical name or cosmetic shade, volume in ml, and brief safety direction.",
      "Choose a 55 × 25 mm or 63.5 × 28 mm wrap grid so ends meet neatly without climbing onto curved amber glass.",
      "Export a pure vector PDF and print at 100% scale onto oil-proof matte vinyl or laser polyester label sheets.",
    ],
    step2Sub: [
      {
        h4: "5 ml, 10 ml and 15 ml bottle sizes",
        body: "Standard amber dropper vials wrap comfortably around 50 × 22 mm (5 ml), 60 × 28 mm (10 ml), and 70 × 35 mm (15 ml), depending on specific glass shoulders.",
      },
      {
        h4: "Tiny-text legibility settings",
        body: "Stick to clean sans-serif type in solid black on bright matte white—skip thin light weights or textured grey backgrounds that fill in at tiny font sizes.",
      },
    ],
    h2Layouts: "Vial label printer: layouts and presets",
    layoutsIntro:
      "Select a miniature format tuned cleanly for essential oil droppers, skincare serums, and sample tins—no specialty vial label printer required.",
    presets: [
      {
        name: "Essential oil bottle labels",
        s1: "Name, blend and dilution",
        s2: "Best for aromatherapy sellers",
        desc: "Compact horizontal bands separate bold oil names (Lavender, Tea Tree) from botanical species, ml capacity, and neat dilution notes.",
      },
      {
        name: "Apothecary-style labels",
        s1: "Vintage framed layout",
        s2: "Best for gifts and craft products",
        desc: "Crisp hairline borders on cream, kraft, or matte white paper capture classic apothecary cabinet character cleanly on miniature flasks.",
      },
      {
        name: "Cosmetic jar and vial labels",
        s1: "Small labels for creams and samples",
        s2: "Best for handmade cosmetics",
        desc: "Neat rectangular and mini-disc cosmetic jar label templates fit 10 g lip balms, salve tins, serum vials, and sample compacts.",
      },
    ],
    h2Settings: "Label printer for essential oil bottles: paper size and print settings",
    settingsIntro:
      "Most makers searching for a label printer for essential oil bottles really need waterproof stock and exact 100% vector PDF scale rather than expensive hardware.",
    recSettingHeading: "Apothecary bottle label template: recommended settings",
    recSettingBody:
      "Whether printing an apothecary bottle label template or miniature serums, disable photo enhancement/smoothing, select 100% Actual Size, and choose oil-resistant polyester or matte inkjet vinyl sealed with clear matte laminate.",
    h2Projects: "Label printer for small bottles for everyday projects",
    projectsIntro:
      "Replacing dedicated label printer for small bottles hardware with vector multi-up sheets saves equipment costs while handling tiny runs cleanly.",
    projects: [
      {
        h3: "Essential oil and aromatherapy products",
        body: "Print custom rollerball blends, room spray droppers, and sample vials for workshops or aromatherapy kits.",
      },
      {
        h3: "Handmade cosmetics and samples",
        body: "Format beard oils, nail cuticle serums, and whipped balm sample jars with legible INCI ingredients and batch numbers.",
      },
      {
        h3: "Craft and apothecary-style gifts",
        body: "Label miniature botanical bath salts, bitters droppers, and herbal tincture favours clearly in one pass.",
      },
    ],
    complianceNote: {
      variant: "rules",
      title: "Check local labelling rules for essential oils, cosmetics & vials",
      body: "Note: No dedicated thermal vial label printer is needed for home small-batch sheets—a 600 DPI home laser or inkjet prints vector PDFs cleanly. However, essential oils, cosmetics, balms, and clinical/prescription containers carry strict legal requirements (INCI ingredient names, hazard pictograms, batch numbers, net quantity, and safety warnings). Always check local regulations before commercial sale, and never improvise medical or prescription bottles.",
    },
    guideLinkText:
      "Verify tiny vial circumferences and flat body heights alongside 2 oz containers in our",
    guideLinkAnchor: "2 oz jar label template",
    tips: [
      {
        h3: "Check local labelling rules for oils and cosmetics",
        body: "Undiluted essential oils may require child-safety warnings or hazard symbols, while cosmetics require full ingredient listings by weight in descending order.",
      },
      {
        h3: "Use oil-proof label stock",
        body: "Citrus and mint essential oils act as natural solvents that soften standard glue and smear paper ink—always print on oil-resistant synthetic vinyl or polyester.",
      },
      {
        h3: "Keep text above 5 pt for legibility",
        body: "Below 5 pt, ink droplets bleed together on most desktop printers; abbreviate layout headings cleanly rather than shrinking text below readability.",
      },
    ],
    faqs: [
      {
        q: "Do I need a vial label printer?",
        a: "No special vial label printer hardware is needed for small batches. Exporting a sharp vector PDF onto A4 or Letter oil-proof sheets on a standard laser or high-resolution inkjet gives clean, readable labels down to 5–6 pt type.",
      },
      {
        q: "How do I print labels for essential oil bottles?",
        a: "Measure the flat wall of your 5 ml, 10 ml, or 15 ml dropper, enter those exact dimensions above, export the PDF, test alignment on plain paper first, and print onto waterproof oil-proof matte vinyl.",
      },
      {
        q: "What label size fits a 10 ml bottle?",
        a: "Most standard 10 ml amber glass dropper bottles accept a label roughly 55–65 mm wide by 25–28 mm tall—check with a ruler first because taller shoulders slightly reduce flat wall height.",
      },
      {
        q: "Can I print apothecary bottle labels at home?",
        a: "Yes. Pick the framed apothecary bottle label template preset above to tile vintage-bordered labels across A4 or US Letter cream or matte white sticker sheets.",
      },
    ],
    relatedH3s: [
      {
        heading: "Bottle label maker",
        targetId: "T29",
        anchor: "bottle label maker",
        desc: "Format larger glass and plastic beverage, syrup, and sauce bottle wraps.",
      },
      {
        heading: "Jar label template",
        targetId: "T24",
        anchor: "jar label template",
        desc: "Build pantry jars, gift tubs, and round lid stickers in any custom grid.",
      },
      {
        heading: "Bottle label printer",
        targetId: "G08",
        anchor: "bottle label printer",
        desc: "See when printable home sheets beat dedicated bottle label printer machines.",
      },
    ],
  }),
};

