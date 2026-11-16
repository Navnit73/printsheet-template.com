import type { HeadingNode, PageContent, PageId } from "@/types/spec";

interface CaseStudyInput {
  id: PageId;
  hubId: PageId;
  hubAnchor: string;
  subtitle: string;
  intro: string[];
  challengeH2: string;
  challengeIntro: string;
  challengeSub1: { h3: string; body: string };
  challengeSub2: { h3: string; body: string };
  solutionH2: string;
  solutionIntro: string;
  solutionStep1: { h3: string; body: string };
  solutionStep2: { h3: string; body: string; h4: string; h4Body: string };
  solutionStep3: { h3: string; body: string; h4: string; h4Body: string };
  resultsIntro: string;
  resultsH3s: [
    { h3: string; body: string },
    { h3: string; body: string },
    { h3: string; body: string },
  ];
  lessonsH3s: [
    { h3: string; body: string },
    { h3: string; body: string },
    { h3: string; body: string },
  ];
  complianceNote?: {
    variant: "rules" | "affiliation";
    title: string;
    body: string;
  };
  faqs: [
    { q: string; a: string },
    { q: string; a: string },
  ];
  tryH3s: [
    { heading: string; targetId: PageId; anchor: string; desc: string },
    { heading: string; targetId: PageId; anchor: string; desc: string },
  ];
}

function buildCaseStudyContent(spec: CaseStudyInput): PageContent {
  const sections: HeadingNode[] = [
    {
      level: 2,
      text: spec.challengeH2,
      paragraphs: [spec.challengeIntro],
      callout: spec.complianceNote,
      children: [
        {
          level: 3,
          text: spec.challengeSub1.h3,
          paragraphs: [spec.challengeSub1.body],
        },
        {
          level: 3,
          text: spec.challengeSub2.h3,
          paragraphs: [spec.challengeSub2.body],
        },
      ],
    },
    {
      level: 2,
      text: spec.solutionH2,
      paragraphs: [spec.solutionIntro],
      children: [
        {
          level: 3,
          text: spec.solutionStep1.h3,
          paragraphs: [spec.solutionStep1.body],
        },
        {
          level: 3,
          text: spec.solutionStep2.h3,
          paragraphs: [spec.solutionStep2.body],
          children: [
            {
              level: 4,
              text: spec.solutionStep2.h4,
              paragraphs: [spec.solutionStep2.h4Body],
            },
          ],
        },
        {
          level: 3,
          text: spec.solutionStep3.h3,
          paragraphs: [spec.solutionStep3.body],
          children: [
            {
              level: 4,
              text: spec.solutionStep3.h4,
              paragraphs: [spec.solutionStep3.h4Body],
            },
          ],
        },
      ],
    },
    {
      level: 2,
      text: "Results",
      paragraphs: [spec.resultsIntro],
      children: spec.resultsH3s.map((r) => ({
        level: 3 as const,
        text: r.h3,
        paragraphs: [r.body],
      })),
    },
    {
      level: 2,
      text: "Lessons you can reuse",
      paragraphs: [
        "Core mechanical and layout checkpoints that apply immediately to any similar print batch using this workflow.",
      ],
      children: spec.lessonsH3s.map((l) => ({
        level: 3 as const,
        text: l.h3,
        paragraphs: [l.body],
      })),
    },
    {
      level: 2,
      text: "Frequently asked questions",
      paragraphs: [
        "Practical questions raised when planning similar home or small-batch print runs.",
      ],
      children: spec.faqs.map((f) => ({
        level: 3 as const,
        text: f.q,
        paragraphs: [f.a],
      })),
    },
    {
      level: 2,
      text: "Try it yourself",
      paragraphs: [
        "Replicate this sheet workflow directly in your browser using the matching tools below or browse the full cluster hub.",
      ],
      inlineLinks: [{ targetId: spec.hubId, anchor: spec.hubAnchor }],
      children: spec.tryH3s.map((t) => ({
        level: 3 as const,
        text: t.heading,
        link: { targetId: t.targetId, anchor: t.anchor },
        paragraphs: [t.desc],
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
        summary: "Browse all tools, tutorials, and guides in this category.",
      },
      ...spec.tryH3s.map((t) => ({
        targetId: t.targetId,
        anchor: t.anchor,
        summary: t.desc,
      })),
    ],
    faqs: spec.faqs.map((f) => ({ question: f.q, answer: f.a })),
  };
}

export const CASE_STUDIES_CONTENT: Partial<Record<PageId, PageContent>> = {
  CS01: buildCaseStudyContent({
    id: "CS01",
    hubId: "HB-BC",
    hubAnchor: "layout for business cards",
    subtitle:
      "Practical workflow showing how a small studio or freelancer organizes 100 A4/Letter sheets into 1,000 crisp cards cleanly at home.",
    intro: [
      "Producing crisp home made business cards across 100 cardstock sheets (yielding 1,000 finished 10-up cards) gives freelancers total control over paper batches, ink revisions, and last-minute client meetings. Instead of reordering full online minimums whenever a phone number or URL shifts, splitting 1,000 cards into modular 100- or 200-card runs prevents stale cardboard waste.",
      "This case-study workflow breaks down the preparation brief, 10-up sheet layout setup, trimmer tolerances, and how to evaluate sheet cost, batch timing, and print quality before running a full pack.",
    ],
    challengeH2: "The challenge: home made business cards",
    challengeIntro:
      "Turning a pile of blank 280 gsm matte A4 sheets into durable, pocket-ready home made business cards requires solving registration drift and rough hand-cut edges right from sheet one.",
    challengeSub1: {
      h3: "The brief: professional cards on a small budget",
      body: "Produce crisp single- or dual-sided cards on 250–300 gsm smooth uncoated cardstock without paying commercial digital press shipping or sitting through multi-day wait times, while keeping edges straight enough for networking events.",
    },
    challengeSub2: {
      h3: "What went wrong with the first print",
      body: "Typical initial test runs fail when word-processor tables print at 'Fit to Page' scale (~95%), leaving narrow outer trim marks skewed by several millimetres toward one side or smudging wet ink along sliding paper-trimmer bars.",
    },
    solutionH2: "The solution: how a freelancer used the business card sheet maker",
    solutionIntro:
      "Locking artwork inside a calibrated 10-up PDF sheet generator eliminated word-processor shifting and let ten cards slice cleanly in straight passes.",
    solutionStep1: {
      h3: "Choosing paper and printer settings",
      body: "Select smooth uncoated matte 250–300 gsm card packs matched specifically to inkjet or laser chemistry, load flat through a rear manual feed tray in small 10-sheet batches, and switch printer driver Media Type cleanly to Heavyweight Matte / Cardstock.",
    },
    solutionStep2: {
      h3: "Laying out 10 cards per A4 sheet",
      body: "Arrange a symmetrical 2 × 5 grid inside the Business Card Sheet Maker (90 × 55 mm or 85 × 55 mm on A4; 3.5 × 2 in on US Letter) keeping readable typography safely 3 mm inside trim boundaries.",
      h4: "Paper weight and finish",
      h4Body:
        "Matte 280–300 gsm board gives true commercial stiffness inside wallets while absorbing dye or pigment ink touch-dry before blade trimming.",
    },
    solutionStep3: {
      h3: "Cutting and finishing at home",
      body: "Stack no more than two finished dry sheets per cut on a guillotine or heavy rotary trimmer, trimming continuous vertical columns first before cross-slicing horizontal rows cleanly.",
      h4: "Crop marks and cut guides",
      h4Body:
        "Keep light corner trim ticks visible in the outer margins (leaving clean white gutters between cards) so knife blades never slip across dark print borders.",
    },
    resultsIntro:
      "Evaluate cost, cutting pace, and edge finish across ten manageable 100-card (10-sheet) batches rather than printing all 100 sheets unattended.",
    resultsH3s: [
      {
        h3: "Cost per card compared with a print shop",
        body: "Divide your 100-sheet heavyweight cardstock pack cost plus ink or toner share across 1,000 finished cards (10 cards per sheet). Home runs win on flexibility when printing 50–200 cards at a time or updating details often, while static 1,000-card drops with heavy full-bleed dark backgrounds are often cheaper at commercial gang printers.",
      },
      {
        h3: "Time spent per 100 cards",
        body: "Splitting 1,000 cards into ten 10-sheet batches keeps rear manual tray feeding reliable and ink drying manageable. Each 100-card run covers exporting one 10-up PDF, feeding 10 sheets through the heavy-stock tray, letting ink cure before clamping, and making straight column-then-row guillotine passes.",
      },
      {
        h3: "Quality feedback from clients",
        body: "When printed at Actual Size (100%) on 280–300 gsm smooth matte board with outer corner crop ticks and 3 mm inner safe margins, edges stay square and small contact details or QR codes remain sharp and scannable in everyday wallet use.",
      },
    ],
    lessonsH3s: [
      {
        h3: "Test on plain paper first",
        body: "Verify 100% scale alignment on ordinary 80 gsm copy paper first before touching costly heavyweight stock so no full box spoils on asymmetric margins.",
      },
      {
        h3: "Add bleed and crop marks",
        body: "Keep corner trim ticks clear outside safe text regions (plus 3 mm colour bleed if full-bleed borders are used) to absorb tiny ±0.5 mm blade shifts cleanly.",
      },
      {
        h3: "Batch cut for consistency",
        body: "Trim 1–2 sheets carefully using a clamped guillotine stop rail rather than cutting five thick boards at once or relying on handheld scissors.",
      },
    ],
    faqs: [
      {
        q: "How long does it take to make 1,000 cards at home?",
        a: "Splitting 100 cardstock sheets (1,000 cards) into ten 10-sheet (100-card) micro-runs prevents paper jams and ink smudging—exact elapsed time depends on your printer's heavyweight-media speed, ink drying time, and whether you slice 1–2 sheets at a time on a rotary or guillotine trimmer.",
      },
      {
        q: "Is home printing worth it for business cards?",
        a: "Home printing excels for flexible small batches (20 to 200 cards), urgent next-morning events, and frequent detail changes; massive unchanging 1,000+ card drops often win at commercial gang printers once details stabilise.",
      },
    ],
    tryH3s: [
      {
        heading: "Print multiple business cards on one page",
        targetId: "T11",
        anchor: "business card page template",
        desc: "Upload your finished front/back card artwork cleanly into a 10-up crop-marked PDF sheet.",
      },
      {
        heading: "Print business cards at home",
        targetId: "H07",
        anchor: "free business card templates print at home",
        desc: "Review full cardstock GSM limits, manual tray feed directions, and ink curing checks.",
      },
    ],
  }),

  CS02: buildCaseStudyContent({
    id: "CS02",
    hubId: "HB-PH",
    hubAnchor: "photo layout maker for printing",
    subtitle:
      "Step-by-step workflow showing how event photographers turn a single 4×6 postcard sheet into twin 2×6 inch custom guest keepsake strips.",
    intro: [
      "Building a custom 4x6 photo booth template lets photographers, wedding hosts, and DIY reception stations output iconic twin 2×6 inch guest strips straight onto standard, affordable 4 × 6 inch glossy postcards. Rather than paying custom dye-sub software subscriptions, locking two vertical three-shot columns side-by-side splits one 4R sheet down the middle cleanly for the guestbook and favour table.",
      "Follow this event workflow breakdown—from column math and wedding monogram footers to paper budgeting, on-site cutting pace, and print quality checks.",
    ],
    challengeH2: "The challenge: 4x6 photo booth template",
    challengeIntro:
      "Standard gallery collage presets misalign central trim lines and squeeze caption footers awkwardly when adapting a 4x6 photo booth template onto physical event printers.",
    challengeSub1: {
      h3: "The brief: branded photo strips for a wedding",
      body: "Produce repeatable twin-strip keepsakes containing three crisp candid wedding poses stacked above couple names and celebration date, printing rapidly onto glossy 4×6 in (102 × 152 mm) stock.",
    },
    challengeSub2: {
      h3: "Why standard templates did not fit",
      body: "Off-the-shelf social collage apps export low-res squares or asymmetric outer edges, leaving one strip slightly wider than 2 inches after bisecting down the centre seam.",
    },
    solutionH2: "The solution: how a wedding photographer used the 4x6 collage maker",
    solutionIntro:
      "Locking two symmetric columns across a 4×6 PDF canvas gave exact 2-inch halves with generous top/bottom trim tolerance.",
    solutionStep1: {
      h3: "Building the strip layout on a 4x6 sheet",
      body: "Set canvas strictly to 4 × 6 inch (102 × 152 mm) portrait with symmetrical left/right strip zones separated by a faint central cutting tick so one straight rotary trimmer slice splits two clean strips instantly.",
    },
    solutionStep2: {
      h3: "Adding names, date and a logo",
      body: "Reserve the bottom ~22–28 mm band across each strip identically for couple names, event venue, date, and tiny floral or monogram marks cleanly clear of the portrait boxes.",
      h4: "Two strips per 4x6",
      h4Body:
        "Duplicate Strip A symmetrically onto Strip B beside it so guests get one copy to pocket home while taping the second copy directly inside the wedding guestbook!",
    },
    solutionStep3: {
      h3: "Printing and cutting on site",
      body: "Print cleanly at 100% scale onto resin-coated 4×6 glossy cards via rear tray feed (or dye-sub 4×6 media), then drop each finished card into a fixed rotary cutter guide aligned along the central cut tick.",
      h4: "Caption area and branding",
      h4Body:
        "Keep celebration dates bold in simple serif or clean sans-serif black ink on bright white strip borders so flash photography doesn't clash visually.",
    },
    resultsIntro:
      "Plan reception print throughput, guest strip balance, and per-strip supply cost before event doors open.",
    resultsH3s: [
      {
        h3: "Prints per hour on the day",
        body: "Because every 4×6 postcard yields two finished 2×6 strips after one central cut, guest throughput doubles per print cycle. Base your reception capacity on your specific inkjet or dye-sub 4×6 speed in high-quality photo mode rather than plain-paper draft specs.",
      },
      {
        h3: "Guest feedback",
        body: "Symmetrical 2×6 halves with a dedicated white bottom caption band keep couple names, wedding dates, and vertical three-frame poses balanced—giving guests one clean strip to pocket home and a matching twin strip for the guestbook.",
      },
      {
        h3: "Cost per strip",
        body: "Putting two strips on each 4×6 sheet halves media spend per keepsake compared with single-strip prints. Divide your 4×6 glossy paper pack and ink or ribbon pack cost by double the number of 4×6 cards printed.",
      },
    ],
    lessonsH3s: [
      {
        h3: "Match the template to your printer's paper size",
        body: "Double-check whether the printer outputs exact 102 × 152 mm 4×6 cards natively without silent Borderless crop zoom eating side photo edges.",
      },
      {
        h3: "Reserve a caption area",
        body: "Always allocate fixed whitespace underneath photo frames before guests pose rather than letting text overlap over shoes or dark tuxedo jackets.",
      },
      {
        h3: "Keep a spare set of sheets",
        body: "Pack extra glossy 4×6 sleeves and test ink levels beforehand so peak dance-floor bursts never stall empty.",
      },
    ],
    faqs: [
      {
        q: "What size is a photo booth strip?",
        a: "Classic American & UK reception strips measure 2 × 6 inches (51 × 152 mm)—designed explicitly so two symmetrical strips sit side by side on one standard 4 × 6 inch (102 × 152 mm) postcard print.",
      },
      {
        q: "Can I print photo booth strips on a home printer?",
        a: "Yes. Set up a two-column 4x6 photo booth template PDF inside Print Sheet Maker's 4×6 Collage Maker, print onto coated glossy 4×6 photo paper, and make one clean vertical centre cut.",
      },
    ],
    tryH3s: [
      {
        heading: "4x6 collage maker",
        targetId: "T09",
        anchor: "4x6 collage maker free",
        desc: "Build twin-strip and multi-photo grid collages sized strictly for 4×6 photo paper.",
      },
      {
        heading: "Printable 4x6 photo template",
        targetId: "T08",
        anchor: "4x6 photo template",
        desc: "Format single bordered 4×6 snapshots or two 4R images across A4 sheets free.",
      },
    ],
  }),

  CS03: buildCaseStudyContent({
    id: "CS03",
    hubId: "HB-JB",
    hubAnchor: "label designs for jars",
    subtitle:
      "Practical workflow for seasonal harvest labelling—sizing honey jar fronts & lids, adding harvest batch codes, and checking local honey laws.",
    intro: [
      "Generating honey jar labels printable sheets at home gives backyard apiaries and weekend market sellers fresh harvest agility without ordering bulky rolls before autumn extraction finishes. Rather than crossing out mismatched weights in felt marker, batch-printing clean sheets for 8 oz hex jars or 1 lb Muth/mason pots lets keepers swap floral source (Clover, Wildflower, Manuka) and pack dates in minutes.",
      "Review this structured honey harvest workflow—covering glass sizing, batch fields, waterproof stock choices, and legal food labelling reminders.",
    ],
    challengeH2: "The challenge: honey jar labels printable",
    challengeIntro:
      "Seasonal beekeeping harvests change yield volumes overnight—making flexible home honey jar labels printable across varied jar weights essential before opening weekend market tables.",
    challengeSub1: {
      h3: "The brief: tidy labels for a harvest",
      body: "Label 120 freshly bottled glass harvest jars cleanly with matching honey jar template framing, floral source notes, apiary origin, and crystal-clear net weight without sticky peeling seams.",
    },
    challengeSub2: {
      h3: "Label requirements for honey sales",
      body: "Unlike casual cupboard swaps, market and retail sales typically require legible net weight (grams / oz), floral/origin name, producer address/contact, batch lot date, and regional raw-honey / infant health notices.",
    },
    complianceNote: {
      variant: "rules",
      title: "Check Local Rules for Honey & Food Sales",
      body: "Honey labelling regulations vary strictly by country, state, and farmers market board (e.g. FDA net-weight type height, country-of-origin rules, UK/EU lot marking, raw-honey advisory warnings for infants under 12 months). Always check your local agriculture/food authority guidelines before selling.",
    },
    solutionH2: "The solution: how a backyard beekeeper used the jam and jelly label maker",
    solutionIntro:
      "Using a browser preserves & jar sheet tool turned one clean honey jar label template across six A4 sheets cleanly without design software.",
    solutionStep1: {
      h3: "Choosing a label size for the jar",
      body: "Measure strictly the flat front panel of octagonal/hex glass (or flat lid cap) so edges clear angled glass shoulders; match that millimetre footprint inside the 14-up or 24-up sheet preset.",
    },
    solutionStep2: {
      h3: "Adding batch and best-before dates",
      body: "Reserve a tidy horizontal footer line inside your free printable honey labels sheet for extraction month and harvest batch ID so jars track cleanly back to hive inspections.",
      h4: "Round lid versus front labels",
      h4Body:
        "Clear flat screw lids accept 45–50 mm round tamper-seal or monogram circles gracefully while keeping glowing golden honey totally visible through the front glass.",
    },
    solutionStep3: {
      h3: "Printing and applying the labels",
      body: "Ensure wiped jar glass is sparkling clean and oil-free using a spritz of rubbing alcohol on cloth before smoothing on your honey jar labels template free sheets.",
      h4: "Date and batch fields",
      h4Body:
        "Wait until jarred caps settle completely dry at room temperature so lingering jar-washing moisture never wrinkles edges overnight.",
    },
    resultsIntro:
      "Review batch sheet count, proof-sheet waste prevention, and market shelf presentation checkpoints before bottling a full harvest.",
    resultsH3s: [
      {
        h3: "Time to label 120 jars",
        body: "At 14 to 24 labels per A4 sheet, 120 jar fronts fit across just 5 to 9 printed sheets. Once a locked template is saved, updating floral source or net weight takes seconds so most hands-on time goes into wiping glass clean and pressing labels straight.",
      },
      {
        h3: "Waste and reprints",
        body: "Checking one plain-paper test sheet behind a blank label sheet against daylight prevents feeding an entire adhesive pack misaligned—keeping spare replacements limited to a few crooked hand-applied stickers.",
      },
      {
        h3: "Customer response at the market",
        body: "Crisp front panels showing floral origin, net weight, apiary contact details, and harvest batch codes build shopper confidence while leaving enough bare glass visible to show the honey's natural colour.",
      },
    ],
    lessonsH3s: [
      {
        h3: "Check local labelling rules",
        body: "Always double-check current agricultural cottage-food statutes for required infant feeding notices, net weight units, and apiary contact lines before printing a whole harvest.",
      },
      {
        h3: "Use waterproof labels",
        body: "Honey jars endure sticky drips wiped clean under kitchen taps—choosing waterproof matte inkjet vinyl or laser polyester stops ruined labels when rinsing drips off lids.",
      },
      {
        h3: "Print a spare sheet",
        body: "Keep one spare unpeeled sheet tucked flat inside market tub kits to rescue any scuffed jar corners right before opening bell.",
      },
    ],
    faqs: [
      {
        q: "What should a honey jar label include?",
        a: "Most regions require clear product identification ('Pure Raw Honey'), net quantity/weight (grams & oz), floral origin if claimed, producer name & physical/post address, batch/date info, and applicable advisory warnings—check local laws first.",
      },
      {
        q: "Can I use free honey label templates for selling honey?",
        a: "Yes—you can use free honey label templates inside Print Sheet Maker for personal gifts or commercial market jars free without royalties, provided your printed copy complies fully with your local food-safety regulations.",
      },
    ],
    tryH3s: [
      {
        heading: "Jam label template",
        targetId: "T26",
        anchor: "free jam label templates",
        desc: "Format classic harvest pots, date footers, and preserve fronts cleanly right in your browser.",
      },
      {
        heading: "Jar label template",
        targetId: "T24",
        anchor: "free printable jar labels",
        desc: "Build flexible round lid seals and straight front panels sized accurately for any jar.",
      },
    ],
  }),

  CS04: buildCaseStudyContent({
    id: "CS04",
    hubId: "HB-JB",
    hubAnchor: "label designs for jars",
    subtitle:
      "Practical workflow for indie candle pourers standardising scent swaps, locked CLP/fire warnings, and heat-tolerant A4 batch printing.",
    intro: [
      "Standardising on reusable candle jar label templates lets small-batch soy and beeswax studios launch ten distinct autumn scents on the same vessel without rebuilding document grids from scratch every week. Instead of nudging individual margins in clunky office programs, locking a master layout separates scent name swaps cleanly from mandatory fire-safety text.",
      "Review this streamlined studio workflow—highlighting heat-resistant stock choices, safety compliance boxes, and repeatable batch checks across seasonal scents.",
    ],
    challengeH2: "The challenge: candle jar label templates",
    challengeIntro:
      "Rotating limited collections creates bottlenecks whenever bespoke artwork files force makers to hunt down margins, resize font blocks, and verify safety disclaimers separately on every new scent.",
    challengeSub1: {
      h3: "The brief: consistent labels across scents",
      body: "Maintain razor-consistent alignment across 8–12 scents stocked side-by-side on boutique shelves while keeping micro safety copy crystal clear across every jar batch.",
    },
    challengeSub2: {
      h3: "Why hand-made labels slowed production",
      body: "Tweaking loose text boxes inside ad-hoc graphic editors introduced uneven top padding, accidental missed burn-time typos, and wasted test sheets whenever vessel lines restocked.",
    },
    complianceNote: {
      variant: "rules",
      title: "Check Local Candle Fire-Safety & Allergen Rules",
      body: "Candle retail sales strictly enforce safety formatting (ASTM F2058 / EN 15494 pictograms, UK/EU CLP chemical allergen statements on scented blends, net wax weights, and maker details). Always check local regulations before pouring wholesale or retail stock.",
    },
    solutionH2: "The solution: how a small-batch candle brand used the candle label maker",
    solutionIntro:
      "Unifying every vessel around repeatable candle jar label templates locked spacing dimensions once while letting makers change fragrance copy smoothly.",
    solutionStep1: {
      h3: "One template for every scent",
      body: "Measure straight-walled apothecary tumblers once (e.g. 70 × 55 mm matte front square + 50 mm round base warning), select the matching preset grid, and keep sheet geometry constant across the whole brand line.",
    },
    solutionStep2: {
      h3: "Adding safety warnings and burn time",
      body: "Build locked bottom disclaimer footers or dedicate an entire 24-up circle warning sticker sheet specifically for pouring bases cleanly.",
      h4: "Scent name variants",
      h4Body:
        "Swap exclusively the Hero Scent headline and two scent-note descriptors per batch sheet—leaving logo position, wax weight, and margins untouched.",
    },
    solutionStep3: {
      h3: "Printing batches on A4 label sheets",
      body: "Export individual batch sheet PDFs at 100% Scale onto heat-tolerant matte polyester or oil-resistant coated vinyl stock via manual rear feed.",
      h4: "Safety warning block",
      h4Body:
        "Keep crisp fire caution text legible at 6–8 pt pure black ink on clean white/matte ground for frictionless compliance inspection.",
    },
    resultsIntro:
      "Keep seasonal scent runs consistent by locking sheet geometry and validating label adhesion under real vessel warmth.",
    resultsH3s: [
      {
        h3: "Labels per hour",
        body: "Because front scent panels and circular base warning sheets export at exact 100% scale on standard A4 or US Letter sheets, pouring batches avoid per-scent layout adjustments and move straight from PDF export to clean wiped glass.",
      },
      {
        h3: "Reprint rate",
        body: "Separating fixed vessel margins and mandatory burn disclaimers from seasonal scent headline edits prevents margin drift and missed safety copy across restocks.",
      },
      {
        h3: "Time saved per batch",
        body: "Standardising on one verified vessel grid across an entire 8–12 scent line reduces each seasonal update to swapping the scent headline and two note lines instead of rebuilding page coordinates.",
      },
    ],
    lessonsH3s: [
      {
        h3: "Use one master template",
        body: "Standardising on 1–2 vessel diameters across an entire shop line multiplies label efficiency cleanly across seasons.",
      },
      {
        h3: "Keep safety text in a locked block",
        body: "Never shrink required burn caution pictograms or net weights just to squeeze a long poetic scent description onto a small 4 oz tin.",
      },
      {
        h3: "Print on heat-resistant stock",
        body: "Test-burn one finished jar down to 10 mm wax depth to prove adhesive and ink survive vessel warmth cleanly without edge curling.",
      },
    ],
    faqs: [
      {
        q: "How do I keep candle labels consistent?",
        a: "Stick to one fixed jar vessel line, lock margin coordinates inside consistent candle jar label templates, apply using a simple tabletop jar alignment cradle, and change only scent headlines per run.",
      },
      {
        q: "What label stock suits candle jars?",
        a: "Heat-tolerant, oil-resistant matte polypropylene/polyester (BOPP) or matte inkjet vinyl resists lingering wax warmth and fragrance oil spots noticeably better than porous untreated office paper.",
      },
    ],
    tryH3s: [
      {
        heading: "Candle label maker",
        targetId: "T28",
        anchor: "candle label creator",
        desc: "Build scent front badges, full vessel wraps, and warning base sheets right in your browser.",
      },
      {
        heading: "Best label printer for candles",
        targetId: "B02",
        anchor: "candle label printer",
        desc: "Compare monochrome thermal warning printers, home sheet inkjets, and commercial lasers.",
      },
    ],
  }),

  CS05: buildCaseStudyContent({
    id: "CS05",
    hubId: "HB-LS",
    hubAnchor: "label sticker sheet maker",
    subtitle:
      "Practical workflow for stationery & Etsy shop creators streamlining repeat A4/Letter planner sheets without fragile spreadsheet alignment.",
    intro: [
      "Adopting a repeatable planner sticker sheet maker workflow lets stationery creators publish tidy, evenly spaced functional tracker boxes, icon badges, and seasonal quote sheets faster without fighting hand-measured canvas rulers each launch. Whether exporting printable home PDF sheets for digital customers or testing physical A4 vinyl runs on studio printers, reusing one locked master grid multiplies weekly shop listings cleanly.",
      "Review this step-by-step stationery seller workflow—covering fixed grid spacing, kiss-cut gutters, non-affiliation notes, and pre-listing print checks.",
    ],
    challengeH2: "The challenge: planner sticker sheet maker",
    challengeIntro:
      "Launching seasonal drops inside complex graphic suites turns tiny grid spacing tweaks into hours of tedious box-nudging unless built atop an automated planner sticker sheet maker structure.",
    challengeSub1: {
      h3: "The brief: dozens of sheet designs per month",
      body: "Publish cohesive collections of weekly trackers, weather icons, habit checkboxes, and decorative headers sharing identical card spacing and crisp cut gutters.",
    },
    challengeSub2: {
      h3: "Why spreadsheets and image editors were slow",
      body: "Pasting crisp icons manually into Excel or dragging 36 tiny PNGs pixel-by-pixel inside raster image layers introduced drift between sheets—forcing re-exports whenever cut margins kissed illustrations too tightly.",
    },
    complianceNote: {
      variant: "affiliation",
      title: "Independent Etsy Seller Workflow Note",
      body: "Print Sheet Maker is an independent browser sheet layout tool and is not affiliated with Etsy Inc. Always proof-test physical cut prints cleanly before publishing digital download files or shipping physical sticker packs.",
    },
    solutionH2: "The solution: how an Etsy planner-sticker seller used the sticker sheet maker",
    solutionIntro:
      "Separating fixed grid coordinates from seasonal artwork allowed one clean template formula to generate sheet after sheet rapidly.",
    solutionStep1: {
      h3: "Building a sheet grid once",
      body: "Establish standard A4 or 5×7 inch planner card geometry once—setting uniform 2.5–3 mm cutting gutters between icons and generous outer sheet grip margins.",
    },
    solutionStep2: {
      h3: "Dropping in new artwork",
      body: "Swap updated seasonal floral PNGs, autumn pastel colour tags, or holiday checklists directly into pre-spaced slots without touching spacing coordinates.",
      h4: "Sticker sizes and spacing",
      h4Body:
        "Match classic 1.5 inch (38 mm) vertical planner column widths cleanly so digital customers or craft cutter machines fit popular ring/coil planners smoothly.",
    },
    solutionStep3: {
      h3: "Exporting print and cut files",
      body: "Download locked 100%-scale print PDF sheets with toggleable faint outer trim boxes cleanly intact for scissors/trimmers or matte vinyl testing.",
      h4: "Cut lines and kiss-cut export",
      h4Body:
        "Leaving subtle light-grey borders optional lets hand-cutters trim straight clean edges while giving clean contrast guidelines around pastel illustrations.",
    },
    resultsIntro:
      "Standardising sheet geometry keeps multi-SKU seasonal launches fast, consistent, and crisp across every cut line.",
    resultsH3s: [
      {
        h3: "Design time per sheet",
        body: "Using a locked master A4 or 5×7 grid removes repetitive manual spacing adjustments so new seasonal palettes and icon sets drop straight into fixed 38 mm planner column widths.",
      },
      {
        h3: "Error rate on cut lines",
        body: "Maintaining uniform 2.5–3 mm cutting gutters and optional faint outer trim guides keeps scissors, paper trimmers, and plotter passes clear of adjacent sticker artwork.",
      },
      {
        h3: "Listings published per week",
        body: "When outer margins, sheet sizes, and cut gutters stay consistent across collections, shops can prepare cohesive multi-sheet packs from one verified template layout.",
      },
    ],
    lessonsH3s: [
      {
        h3: "Reuse one grid for similar sheets",
        body: "Keeping outer sheet borders and planner column widths locked across themes cuts customer support questions on sizing to zero.",
      },
      {
        h3: "Keep a cut-line layer",
        body: "Always verify light scissor/plotter margins on matte test sheets before selling glossy vinyl or holographic runs.",
      },
      {
        h3: "Test print each new design",
        body: "Print Sheet 1 on cheap matte paper and verify readability at actual ~12 mm icon scale—small text blurs surprisingly fast below 6 pt!",
      },
    ],
    faqs: [
      {
        q: "How do I design planner stickers for sale?",
        a: "Create crisp 300 DPI illustrations sized cleanly to popular planner box columns (often 38 mm wide), arrange them consistently with 2–3 mm gutters inside a planner sticker sheet maker grid, and test-print physical proofs on matte vinyl before listing.",
      },
      {
        q: "What sheet size do planner stickers use?",
        a: "Physical mail-order planners often cut down to 5×7 inch or half-Letter kiss-cut sheets from standard US Letter / ISO A4 master sticker sheets, while printable digital PDF kits supply full A4 and Letter masters.",
      },
    ],
    tryH3s: [
      {
        heading: "Sticker sheet maker online",
        targetId: "T22",
        anchor: "label sticker paper a4 template",
        desc: "Arrange planner icons and small product stickers across A4 pages cleanly in your browser.",
      },
      {
        heading: "Custom sticker sheet printing",
        targetId: "B11",
        anchor: "a4 stickers printed",
        desc: "Compare home DIY sheet runs vs outsourced kiss-cut print vendor economics.",
      },
    ],
  }),

  CS06: buildCaseStudyContent({
    id: "CS06",
    hubId: "HB-BC",
    hubAnchor: "layout for business cards",
    subtitle:
      "Practical workflow showing how event planners batch 120 wedding seating cards across twelve 10-up perforated cardstock sheets cleanly.",
    intro: [
      "Tackling a wedding seating chart using an avery place card template style 10-up workflow saves hundreds compared with hand-lettered calligraphy commissions while letting last-minute RSVP table swaps happen minutes before printing. By matching 3.5 × 2 inch (or 85 × 55 mm) perforated cardstock layouts across twelve crisp sheets, 120 uniform guest name cards pop apart effortlessly.",
      "Follow this event workflow breakdown—covering non-affiliation rules, guest-list spreadsheet cleanup, perforated alignment checks, and day-of spares.",
    ],
    challengeH2: "The challenge: avery place card template",
    challengeIntro:
      "Preparing an avery place card template (or compatible 10-up perforated seat card) run for 120 wedding guests fails rapidly if margins drift 2 mm off tear scores—ruining an entire \$25 box of cream textured cardstock.",
    challengeSub1: {
      h3: "The brief: 120 place cards for a reception",
      body: "Print 120 legible guest name + table-number seating cards cleanly on heavyweight uncoated ivory or bright matte 10-up card sheets with crisp tear edges.",
    },
    challengeSub2: {
      h3: "Matching the layout to perforated sheets",
      body: "Trying to manually align two columns of five text boxes inside standard word processors routinely pushes rows 4 and 5 downward across micro-perforation score teeth when fonts wrap onto two lines.",
    },
    complianceNote: {
      variant: "affiliation",
      title: "Independent Compatibility Reference Note",
      body: "Print Sheet Maker is completely independent and has no affiliation with or endorsement from Avery Products Corporation. Always run one plain-paper proof test held up to your perforated sheet against daylight before feeding textured cardstock.",
    },
    solutionH2: "The solution: how a wedding planner used the Avery-compatible business card layout tool",
    solutionIntro:
      "Using exact-scale multi-cell PDF imposition locked every guest name safely dead-centre inside tear zones.",
    solutionStep1: {
      h3: "Choosing a sheet layout",
      body: "Select US Letter 10-up (3.5 × 2 in) or ISO A4 10-up matching your physical blank box dimensions precisely, leaving faint border preview OFF before printing onto pre-scored stock.",
    },
    solutionStep2: {
      h3: "Merging guest names",
      body: "Paste cleaned single-line guest names and clean 'Table 4' subscripts across individual cells (moving long double-barrelled names down one font point cleanly rather than breaking vertical symmetry).",
      h4: "Guest names from a spreadsheet",
      h4Body:
        "Audit final guest CSV columns carefully for accents, hyphenated last names, and 'Plus One' placeholders BEFORE locking the sheet PDF!",
    },
    solutionStep3: {
      h3: "Printing, tearing and folding",
      body: "Load cardstock flat via the rear manual tray set to Actual Size (100%), let dry 10 minutes, and bend gently backward/forward cleanly along micro-perforations.",
      h4: "Folded versus flat cards",
      h4Body:
        "Flat 10-up business-card sized slips stand cleanly upright inside brass, wood, or cork table cardholders; if folding freestanding tent cards instead, pick larger 4-up or 6-up tent sheets and score with a blunt bone folder.",
    },
    resultsIntro:
      "Batching 120 guest cards across twelve 10-up sheets keeps last-minute RSVP edits manageable right up to rehearsal day.",
    resultsH3s: [
      {
        h3: "Time to print 120 cards",
        body: "Twelve 10-up sheets feed reliably in small rear-tray stacks, and micro-perforated cards separate cleanly along pre-scored lines once ink dries—leaving most of the prep time for guest-list proofreading.",
      },
      {
        h3: "Misprint rate",
        body: "Holding one plain-paper proof behind a blank perforated sheet against daylight catches tray-feed orientation or margin scaling errors before committing heavyweight ivory cardstock.",
      },
      {
        h3: "Planner and client feedback",
        body: "Centred single-line guest names with clean table numbers stay legible across reception tables and stand cleanly in brass, wood, or cork cardholders without ragged hand-cut borders.",
      },
    ],
    lessonsH3s: [
      {
        h3: "Check names twice before printing",
        body: "Hand final exported PDF sheets to two different family members to proofread every single spelling and table number cleanly before burning final cardstock.",
      },
      {
        h3: "Use perforated sheets for clean edges",
        body: "Micro-perforated 'Clean Edge' compatible packs snap apart virtually smooth—zero sliding guillotine setup needed for flat place slips inside card stands.",
      },
      {
        h3: "Print a spare sheet",
        body: "Always keep one unprinted extra blank cardstock sheet plus one printed blank border frame in your emergency wedding kit beside a metallic marker for unexpected day-of table guests.",
      },
    ],
    faqs: [
      {
        q: "How do I print place cards ten to a sheet?",
        a: "Open Print Sheet Maker's Avery-compatible Business Card Sheet tool, match your Letter (3.5×2 in) or A4 grid, toggle Multi-Label editing to enter 10 guest names per sheet, export at 100% scale PDF, and feed perforated card stock.",
      },
      {
        q: "Can I use a place card template with non-Avery sheets?",
        a: "Yes—generic 10-up Letter or A4 perforated cardstock packs share identical outer grid spacing (just run one copy-paper proof held behind a blank sheet up to daylight to verify alignment first!).",
      },
    ],
    tryH3s: [
      {
        heading: "Avery business card template",
        targetId: "T15",
        anchor: "avery business card template for word",
        desc: "Format compatible 10-up Letter or A4 perforated card sheets directly in your browser.",
      },
      {
        heading: "Print multiple business cards on one page",
        targetId: "T11",
        anchor: "business card page template",
        desc: "Tile monograms, seat backs, or thank-you note inserts 10-up across heavy cardstock.",
      },
    ],
  }),
};

