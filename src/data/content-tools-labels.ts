import type { HeadingNode, InlineLinkRef, PageContent, PageId } from "@/types/spec";

interface LabelPreset {
  name: string;
  s1: string;
  s2: string;
  desc: string;
}

interface LabelToolInput {
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
  presets: [LabelPreset, LabelPreset, LabelPreset];
  h2Settings: string;
  settingsIntro: string;
  paperNote: string;
  paperBody: string;
  recSettingHeading?: string;
  recSettingBody?: string;
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
  relatedExtraLinks?: InlineLinkRef[];
}

function buildLabelToolContent(spec: LabelToolInput): PageContent {
  const settingsChildren: HeadingNode[] = [
    {
      level: 3,
      text: "Page size and orientation",
      paragraphs: [
        "Set your document dimensions to match the exact sheet pack in your printer feed tray before placing text or artwork.",
      ],
      children: [
        {
          level: 4,
          text: spec.paperNote,
          paragraphs: [spec.paperBody],
        },
      ],
    },
    {
      level: 3,
      text: "Scale, margins and bleed",
      paragraphs: [
        "Label alignment fails most often when PDF viewers shrink a sheet to fit hardware margins. Lock scale at 100% and maintain clear inner padding.",
      ],
      children: [
        {
          level: 4,
          text: "Print at 100% or Actual Size",
          paragraphs: [
            "Always choose Actual Size (100% scale) in Chrome, Edge, Preview, or Adobe Acrobat so every row and column lands on its physical die-cut label.",
          ],
        },
        {
          level: 4,
          text: "Keep a safe margin",
          paragraphs: [
            "Keep logos, postal lines, and barcodes at least 2.5 to 3 mm inside the outer cut edge so 1 mm paper feed tolerance never clips content.",
          ],
        },
      ],
    },
  ];

  if (spec.recSettingHeading && spec.recSettingBody) {
    settingsChildren.push({
      level: 3,
      text: spec.recSettingHeading,
      paragraphs: [spec.recSettingBody],
    });
  }

  settingsChildren.push({
    level: 3,
    text: "Print quality and file format",
    paragraphs: [
      "Choosing a vector PDF layout keeps fonts, cut lines, and barcode bars crisp regardless of printer DPI.",
    ],
    children: [
      {
        level: 4,
        text: "PDF versus JPG output",
        paragraphs: [
          "Export print sheets as vector PDF rather than JPG screenshots. Vector PDF preserves exact millimetre grid coordinates and prevents JPEG compression blur around small type and barcode edges.",
        ],
      },
    ],
  });

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
            paragraphs: [
              "Pre-measured row, column, and gutter spacing is built directly into the preset coordinates so labels remain balanced edge to edge.",
            ],
          },
          {
            level: 4 as const,
            text: p.s2,
            paragraphs: [
              "Combine crisp sans-serif text with optional border or crop guides depending on whether you peel pre-cut labels or trim full-sheet sticker stock.",
            ],
          },
        ],
      })),
    },
    {
      level: 2,
      text: spec.h2Settings,
      paragraphs: [spec.settingsIntro],
      children: settingsChildren,
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
      paragraphs: [
        spec.guideLinkText,
        "Run these quick physical checks whenever switching to a new pack of adhesive sheets or adhesive vinyl.",
      ],
      inlineLinks: [{ targetId: "G07", anchor: spec.guideLinkAnchor }],
      children: spec.tips.map((t) => ({
        level: 3 as const,
        text: t.h3,
        paragraphs: [t.body],
      })),
    },
    {
      level: 2,
      text: "Frequently asked questions",
      paragraphs: [
        "Key technical answers on paper sizing, printer alignment, and browser-based PDF export before you print a full pack.",
      ],
      children: spec.faqs.map((f) => ({
        level: 3 as const,
        text: f.q,
        paragraphs: [f.a],
      })),
    },
    {
      level: 2,
      text: "More print sheet tools and guides",
      paragraphs: [
        "Continue browsing related sheet generators or return to the parent hub for all label and sticker formats.",
      ],
      inlineLinks: [
        { targetId: "HB-LS", anchor: "label sticker sheet maker" },
        ...(spec.relatedExtraLinks ?? []),
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
    breadcrumbAnchor: "label sticker sheet maker",
    sections,
    relatedLinks: [
      {
        targetId: "HB-LS",
        anchor: "label sticker sheet maker",
        summary: "Explore all A4 label, circle, address, barcode, and sticker tools.",
      },
      {
        targetId: "G07",
        anchor: "a4 size label",
        summary: "Check standard A4 label sheet sizes, paper weights, and printer compatibility.",
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

export const LABEL_TOOL_CONTENT: Partial<Record<PageId, PageContent>> = {
  T17: buildLabelToolContent({
    id: "T17",
    subtitle:
      "Design rectangle, square, or round label sheets in your browser and export an exact-scale PDF for inkjet or laser printers.",
    intro: [
      "This printable label maker lets you design custom labels, fill an A4 or US Letter sheet automatically, and download a print-ready PDF with zero sign-up. Everything runs locally in your browser so your product names, storage lists, and brand graphics never leave your device.",
      "Whether you are printing pantry tags, small-batch retail packaging, or classroom folder labels, you can pick standard A4 printable labels or dial in exact width, height, and margin values to match pre-cut sheets or full-sheet sticker stock.",
    ],
    h2Steps: "How to use the printable label maker in 4 steps",
    stepsIntro:
      "Use the interactive printable label maker studio above to configure a sheet grid, enter your copy, preview every row, and export a clean vector PDF.",
    steps: [
      "Step 1: Choose a label size and sheet",
      "Step 2: Add text, icons and borders",
      "Step 3: Duplicate labels across the sheet",
      "Step 4: Download the print-ready PDF",
    ],
    stepBodies: [
      "Select A4 (210 × 297 mm) or US Letter (8.5 × 11 in) and choose a preset grid such as 2×5 (10-up), 3×8 (24-up), or a custom row and column layout that matches your pre-scored sheet.",
      "Type a label title, subtitle, and short note, or switch to an uploadable image or badge graphic. Choose solid, dashed, or clean borderless styling depending on whether you are using die-cut sheets or hand trimming.",
      "Repeat one identical label across the whole sheet for product batches, or populate consecutive cells when organising shelves, spice racks, and office binders in a single pass.",
      "Generate and save a vector PDF at exact millimetre scale, then print a single test run on plain paper before feeding adhesive sheets.",
    ],
    step2Sub: [
      {
        h4: "Rectangle, square and round labels",
        body: "Switch shapes to fit rectangular shipping zones, square product packaging, or circular seal stickers without changing spreadsheets or installing desktop suites.",
      },
      {
        h4: "Bold, outline and icon styles",
        body: "Pair strong bold headings with thin outline cut guides or category accents so labels remain readable from a shelf distance.",
      },
    ],
    h2Layouts: "Printable label maker: layouts and presets",
    layoutsIntro:
      "Start from three practical preset families engineered around common adhesive sheet dimensions and everyday organisation tasks.",
    presets: [
      {
        name: "Pantry and storage labels",
        s1: "Simple text with an icon",
        s2: "Best for home organising",
        desc: "Wide 63.5 × 38.1 mm (21-up) or 99.1 × 57 mm (10-up) cells give clear typographic hierarchy for flour, pasta, linen tubs, and seasonal storage boxes.",
      },
      {
        name: "Product and shop labels",
        s1: "Name, size and barcode zone",
        s2: "Best for small sellers",
        desc: "Compact 3×8 (24-up) grids fit brand name, scent or flavour variant, net weight, and SKU reference neatly on kraft or matte white packaging.",
      },
      {
        name: "Office and file labels",
        s1: "Plain, high-contrast text",
        s2: "Best for folders and shelves",
        desc: "Clean high-contrast black-on-white layouts fit lever-arch spines, hanging file tabs, and warehouse bin markers with maximum legibility.",
      },
    ],
    h2Settings: "Free printable label maker: paper size and print settings",
    settingsIntro:
      "Follow these printer and scaling rules inside the free printable label maker workflow so every sheet peels cleanly on the first try.",
    paperNote: "Using A4 or Letter label sheets",
    paperBody:
      "A4 printable labels (210 × 297 mm) dominate in the UK, Europe, and Australia, while US Letter (215.9 × 279.4 mm) is standard across North America. Never swap the two without updating the sheet preset.",
    recSettingHeading: "Online label maker printable: recommended settings",
    recSettingBody:
      "Set paper type in your printer driver to Labels or Heavy Matte Paper, turn off Borderless printing (which subtly enlarges artwork), and feed one adhesive sheet at a time through the rear or bypass tray. Our online label maker printable presets already include safe hardware margins.",
    h2Projects: "Printable label maker online for everyday projects",
    projectsIntro:
      "A flexible printable label maker online eliminates expensive pre-printed rolls when you only need a few dozen crisp labels at a time.",
    projects: [
      {
        h3: "Home organising and storage",
        body: "Standardise spice drawers, laundry hampers, toy tubs, and garage hardware totes in matching typography across one or two A4 sheets.",
      },
      {
        h3: "Small shop product labels",
        body: "Test new seasonal SKUs, sample packs, and pop-up market packaging without paying print-shop setup fees or minimum order quantities.",
      },
      {
        h3: "Classroom and office labelling",
        body: "Print student tray names, book-bin categories, AV cable tags, and shared supply cupboard labels ready to apply before term starts.",
      },
    ],
    tips: [
      {
        h3: "Match the label size to your sticker sheet",
        body: "Measure the top margin, side margin, and gap between labels on your physical sheet before picking a grid preset.",
      },
      {
        h3: "Use matte paper for cleaner text",
        body: "Matte sticker paper absorbs dye and pigment ink sharply, avoiding the slight ink spread seen on cheap glossy sheets and making small ingredients lists easy to read.",
      },
      {
        h3: "Print a test page on plain paper first",
        body: "Print onto ordinary 80 gsm copy paper, hold it directly behind a blank label sheet against a window or lamp, and verify grid alignment before risking adhesive stock.",
      },
    ],
    guideLinkText:
      "Not sure how label sheet grids translate to physical packs? Review our reference chart covering",
    guideLinkAnchor: "a4 size label",
    faqs: [
      {
        q: "Is there a free printable label maker?",
        a: "Yes. Print Sheet Maker provides a free printable label maker directly in your browser with no account, watermark, or export limit, producing a product label sheet maker PDF in seconds.",
      },
      {
        q: "How do I make labels online?",
        a: "Choose your paper size and grid preset in the label maker online free printable editor above, type your label text or upload an image, verify spacing in the sheet preview, and download the print-ready PDF.",
      },
      {
        q: "What label paper should I buy?",
        a: "Match the paper coating to your printer: choose inkjet matte or inkjet vinyl for inkjet printers, and laser-rated adhesive sheets for laser printers so heat fusers do not melt the glue.",
      },
      {
        q: "Can I print labels on a regular printer?",
        a: "Yes. Any home inkjet or laser printer can print standard A4 or US Letter label sheets provided you select 'Labels' or 'Thick Paper' in the print dialog and print at 100% scale.",
      },
    ],
    relatedH3s: [
      {
        heading: "A4 labels template",
        targetId: "T18",
        anchor: "a4 labels template",
        desc: "Generate custom rows, columns, margins, and gaps for any blank A4 label sheet.",
      },
      {
        heading: "Sticker sheet maker online",
        targetId: "T22",
        anchor: "sticker sheet maker online",
        desc: "Lay out custom die-cut or kiss-cut stickers on full A4 sticker sheets.",
      },
      {
        heading: "Label paper for printer",
        targetId: "G07",
        anchor: "a4 size label",
        desc: "Compare matte, glossy, kraft, and waterproof label paper specs before ordering packs.",
      },
    ],
  }),

  T18: buildLabelToolContent({
    id: "T18",
    subtitle:
      "Generate exact-dimension A4 label sheet templates with custom rows, columns, margins, and inter-label gaps for any blank sheet.",
    intro: [
      "Use this A4 labels template tool to match almost any unbranded, office-supply, or pre-scored sticker sheet by entering rows, columns, margins, and label dimensions. Instead of struggling with shifted table cells inside word processors, you get an exact-scale PDF in seconds.",
      "Whether you are setting up an 8-up shipping layout, a 24-up product sheet, or specialty A4 4x6 labels style sizing for large boxes, your measurements lock cleanly to the 210 × 297 mm ISO A4 canvas.",
    ],
    h2Steps: "How to use the A4 label template generator in 4 steps",
    stepsIntro:
      "Configure any blank A4 label layout cleanly by matching the physical measurements on your sheet packaging.",
    steps: [
      "Step 1: Enter rows and columns",
      "Step 2: Set label width and height",
      "Step 3: Set margins and gaps",
      "Step 4: Download the blank template",
    ],
    stepBodies: [
      "Count how many labels sit across each row and down each column on your A4 sheet, then dial those counts into the grid controls.",
      "Type the exact width and height of one individual label in millimetres so the PDF coordinates mirror your pre-cut sheet.",
      "Adjust top margin, side margin, and vertical or horizontal gutters to handle kiss-cut gap strips between labels.",
      "Export a filled or clean guide-outline template PDF and test alignment on copy paper before running adhesive packs.",
    ],
    step2Sub: [
      {
        h4: "Measure your label sheet",
        body: "Use a steel metric ruler to measure from the top edge of the paper to the first label cut line, and from the left edge to column one.",
      },
      {
        h4: "Top and side margin settings",
        body: "Even a 2 mm discrepancy in top margin compounds across 8 or 10 rows down the page, so setting exact outer margins keeps the bottom row centered.",
      },
    ],
    h2Layouts: "A4 labels template: layouts and presets",
    layoutsIntro:
      "Every A4 labels template preset below maps to widely sold metric label grids and custom cutter sheets.",
    presets: [
      {
        name: "2 x 5 labels (10-up)",
        s1: "Large address-style labels",
        s2: "Best for shipping and mail",
        desc: "Two columns by five rows (typically 99.1 × 57 mm or 105 × 57 mm) leaves plenty of space for courier addresses, logos, and handling instructions.",
      },
      {
        name: "3 x 8 labels (24-up)",
        s1: "Standard small labels",
        s2: "Best for jars and products",
        desc: "Three columns by eight rows (around 63.5 × 33.9 mm or 70 × 37 mm) is the most popular general-purpose grid for jars, barcodes, and batch codes.",
      },
      {
        name: "Custom grid",
        s1: "Any size, margin and gap",
        s2: "Best for unusual sheets",
        desc: "Dial in bespoke grids such as A4 4x6 labels style quartets, 2×2 quarter-sheets, or narrow 4×12 spice strip sheets.",
      },
    ],
    h2Settings: "A4 label sheet template: paper size and print settings",
    settingsIntro:
      "Locking print driver scale ensures your A4 label sheet template produces crisp alignment down to the final row.",
    paperNote: "Using A4 (210 x 297 mm)",
    paperBody:
      "Confirm your print dialog paper size is set to A4 (210 × 297 mm) and not US Letter. Printing an A4 PDF onto A4 stock with Letter selected in the driver shifts every row upward or clips the bottom row.",
    recSettingHeading: "A4 label template maker: recommended settings",
    recSettingBody:
      "Select 100% / Actual Size, set paper thickness to Labels or Cardstock so ink dries cleanly, and keep dashed crop borders enabled only when printing onto full uncut sticker sheets. This A4 label template maker exports true vector coordinates.",
    h2Projects: "A4 size label template for everyday projects",
    projectsIntro:
      "An accurate A4 size label template rescues blank sheet packs whose original software template links have expired or no longer open.",
    projects: [
      {
        h3: "Matching an unfamiliar label sheet",
        body: "Bought bulk unbranded label packs with no template code? Measure width, height, and margins once and generate a reusable PDF grid in under two minutes.",
      },
      {
        h3: "Printing on blank sticker paper",
        body: "Use full uncut A4 adhesive sheets with faint crop lines enabled so you can slice any custom rectangular label size cleanly with a sliding trimmer.",
      },
      {
        h3: "Aligning labels for guillotine cutting",
        body: "Set zero gaps between labels when printing onto full-sheet cardstock or vinyl so a single straight guillotine pass trims two neighbouring columns at once.",
      },
    ],
    tips: [
      {
        h3: "Measure the sheet with a ruler before you enter sizes",
        body: "Never guess 'about 7 cm'—one millimetre error across 3 columns or 8 rows adds up to 3–8 mm of drift by the far corner of the sheet.",
      },
      {
        h3: "Print the grid on plain paper and hold it up to the sheet",
        body: "Place your plain-paper test print directly behind a blank label sheet against daylight so you can see immediately whether the grid lines kiss every pre-cut border.",
      },
      {
        h3: "Allow 1 to 2 mm tolerance for printer drift",
        body: "Desktop paper rollers vary by ±1 mm from sheet to sheet. Keep text and borders 2–3 mm inside the cell box rather than flush against the cut line.",
      },
    ],
    guideLinkText:
      "Compare standard European and Australian sheet dimensions in our full reference on",
    guideLinkAnchor: "a4 size label",
    faqs: [
      {
        q: "How do I make an A4 labels template?",
        a: "Choose an A4 labels template preset in the generator above, verify rows, columns, and cell dimensions against your sheet, add text or keep cells blank for handwriting, and export at 100% scale PDF.",
      },
      {
        q: "What is the size of an A4 label sheet?",
        a: "An A4 label sheet always measures 210 × 297 mm (8.27 × 11.69 inches). Individual label sizes vary from 2 per sheet (half-A4) up to 65+ mini labels per sheet.",
      },
      {
        q: "Can I use this with any brand of labels?",
        a: "Yes. Because you can adjust rows, columns, width, height, and margins freely, sheets compatible with Avery, Herma, Officeworks, or unbranded generic packs all align cleanly (this tool is independent and not affiliated with any label brand).",
      },
      {
        q: "How do I fix labels that print out of alignment?",
        a: "First verify the PDF viewer is set to Actual Size (100%), not Fit to Page. Next confirm the printer driver paper size is A4 rather than Letter, and test feed orientation on plain paper.",
      },
    ],
    relatedH3s: [
      {
        heading: "Printable label maker",
        targetId: "T17",
        anchor: "printable label maker",
        desc: "Build full product, pantry, and office label sheets with rich text and icons.",
      },
      {
        heading: "A4 address labels",
        targetId: "T20",
        anchor: "a4 address labels",
        desc: "Format 14-up mailing and 8-up parcel shipping sheets ready for postal runs.",
      },
      {
        heading: "Label paper for printer",
        targetId: "G07",
        anchor: "a4 size label",
        desc: "Browse common A4 grid sizes, paper stocks, and compatibility charts.",
      },
    ],
  }),

  T19: buildLabelToolContent({
    id: "T19",
    subtitle:
      "Design circular seal stickers, jar lid badges, and packaging labels in exact millimetre diameters across A4 or US Letter sheets.",
    intro: [
      "Printing round labels for printer sheets requires circular safe zones and crisp bleed so artwork still looks centred if a sheet feeds slightly off-axis. This free circle label sheet maker places exact-diameter rings across A4 or Letter pages directly in your browser.",
      "Choose popular diameters such as 25 mm, 40 mm, 50 mm, or 60 mm, add curved-friendly centred text or a brand badge, and export a vector PDF ready for pre-scored circle label packs or hand craft punches.",
    ],
    h2Steps: "How to use the circle label sheet maker in 4 steps",
    stepsIntro:
      "Set up circular seals and jar lid decals cleanly in four fast steps with live sheet previews.",
    steps: [
      "Step 1: Choose a circle diameter",
      "Step 2: Add text, logo or artwork",
      "Step 3: Fill the sheet with circles",
      "Step 4: Download the PDF and print",
    ],
    stepBodies: [
      "Pick a preset circle diameter or type a custom diameter in millimetres to match your pre-cut round label pack or lever circle punch.",
      "Type short centred lines (brand, flavour, date) or upload a crisp square PNG logo that scales smoothly inside the circular safe zone.",
      "Choose how many columns and rows fit comfortably on A4 or Letter with clean cut gaps around every circle.",
      "Save the print-ready PDF and run a quick test page on copy paper held behind your round label sheet.",
    ],
    step2Sub: [
      {
        h4: "Common diameters: 25, 40, 50 and 60 mm",
        body: "25 mm works for envelope seals and tiny cosmetic lids; 40–50 mm suits standard mason jar caps and gift bags; 60–75 mm fits wide candle lids and takeaway boxes.",
      },
      {
        h4: "Bleed beyond the circle edge",
        body: "When printing tinted backgrounds on pre-cut round sheets, extend colour slightly outside the perimeter or keep artwork safely inside a white border.",
      },
    ],
    h2Layouts: "Round labels for printer: layouts and presets",
    layoutsIntro:
      "Pick one of these diameter-tuned round labels for printer layouts to maximise labels per page without crowding cut edges.",
    presets: [
      {
        name: "Small circles (25 mm)",
        s1: "About 48 per A4 sheet",
        s2: "Best for seals and badges",
        desc: "Compact 25 mm discs pack densely on an A4 sheet, ideal for tissue-paper seals, reward stars, spice cap dots, and lip-balm bases.",
      },
      {
        name: "Medium circles (50 mm)",
        s1: "About 15 per A4 sheet",
        s2: "Best for jar lids and favours",
        desc: "Balanced 50 mm rounds give ample room for an event monogram, batch date, or handmade soap brand stamp without dominating small lids.",
      },
      {
        name: "Large circles (60 mm)",
        s1: "About 12 per A4 sheet",
        s2: "Best for packaging and gifts",
        desc: "Bold 60 mm discs stand out clearly on pastry boxes, mailer tubes, gift hampers, and wide candle tins.",
      },
    ],
    h2Settings: "Circle labels for printer: paper size and print settings",
    settingsIntro:
      "Follow these alignment guidelines so your circle labels for printer sheets come out crisp and evenly framed.",
    paperNote: "Using A4 or Letter",
    paperBody:
      "Check whether your circle label sheets are cut to ISO A4 (210 × 297 mm) or US Letter (8.5 × 11 in). Matching the document page size prevents vertical cumulative drift on rows 4 through 7.",
    h2Projects: "Label printer round labels for everyday projects",
    projectsIntro:
      "Desktop label printer round labels give makers, bakeries, and event hosts full-colour branding without thermal monochrome limits.",
    projects: [
      {
        h3: "Jar lids and gift seals",
        body: "Cap honey, jam, candle, and bath-salt lids with clean circular seals that list scent, roast date, or event thank-you notes.",
      },
      {
        h3: "Product packaging",
        body: "Seal kraft bakery boxes, coffee pouches, and mailer envelopes with round logo stickers printed in small fresh batches.",
      },
      {
        h3: "Classroom badges and crafts",
        body: "Create colour-coded reading level stickers, science kit markers, and craft fair price dots directly from your browser.",
      },
    ],
    tips: [
      {
        h3: "Print slightly past the circle edge for clean cuts",
        body: "If your design fills the circle with a solid colour, bleeding 1–2 mm past the cut boundary prevents thin white crescents when die-cut sheets shift slightly.",
      },
      {
        h3: "Use a circle punch for perfect shapes",
        body: "Printing onto full uncut sticker sheets and punching out circles with a 25 mm, 38 mm, or 50 mm craft lever punch guarantees zero printer-alignment headaches.",
      },
      {
        h3: "Choose waterproof sticker paper for kitchen use",
        body: "For cold bottles, chilled jars, or hand-washed containers, pick matte waterproof vinyl sticker paper compatible with your inkjet or laser printer.",
      },
    ],
    guideLinkText:
      "Need help pairing sheet diameters with standard packaging? Check our full dimensions guide for",
    guideLinkAnchor: "a4 size label",
    faqs: [
      {
        q: "Can I print round labels on a normal printer?",
        a: "Yes. Any home inkjet or laser printer handles round labels for printer sheets cleanly when loaded one sheet at a time and printed at 100% Actual Size.",
      },
      {
        q: "What size round labels should I use?",
        a: "Choose 25 mm for envelope seals and tiny dropper lids, 38–50 mm for standard jam or mason jar lids, and 60–75 mm for candle lids, bakery boxes, and pouches.",
      },
      {
        q: "How many circles fit on an A4 sheet?",
        a: "About 48 circles of 25 mm diameter, 24 circles of 40 mm diameter, 15 circles of 50 mm diameter, or 12 circles of 60 mm diameter fit cleanly on one A4 sheet with cut spacing.",
      },
      {
        q: "Can I cut circle labels without a machine?",
        a: "Yes. Either buy pre-scored circular label sheets compatible with standard A4 templates, or print onto full uncut sticker sheets and punch them quickly with a hand craft circle punch.",
      },
    ],
    relatedH3s: [
      {
        heading: "Sticker sheet maker online",
        targetId: "T22",
        anchor: "sticker sheet maker online",
        desc: "Build mixed sticker sheets and full-page sticker layouts for inkjet or laser printers.",
      },
      {
        heading: "Printable label maker",
        targetId: "T17",
        anchor: "printable label maker",
        desc: "Create rectangular and square labels for pantries, products, and office shelves.",
      },
      {
        heading: "Mason jar labels printable",
        targetId: "T25",
        anchor: "mason jar labels printable",
        desc: "Design matching body and lid labels sized specifically for wide-mouth and regular mason jars.",
      },
    ],
  }),

  T20: buildLabelToolContent({
    id: "T20",
    subtitle:
      "Format repeating return-address labels or multi-recipient shipping sheets on A4 label stock and export a sharp vector PDF.",
    intro: [
      "Create crisp A4 address labels and courier parcel tags directly in your browser without setting up mail-merge tables or paid desktop software. Choose a 14-up mailing layout, an 8-up shipping grid, or a two-up half-sheet format, enter one or multiple addresses, and export a ready-to-print PDF.",
      "Designed as both a fast return-address tool and a flexible shipping label sheet maker, every preset locks recipient blocks safely away from outer cut lines so barcodes and postcodes scan reliably at sorting depots.",
    ],
    h2Steps: "How to use the address and shipping label sheet maker in 4 steps",
    stepsIntro:
      "Prepare clean postal sheets in minutes with this online address and shipping label sheet maker.",
    steps: [
      "Step 1: Choose an address or shipping label size",
      "Step 2: Type or paste your addresses",
      "Step 3: Preview all labels on the sheet",
      "Step 4: Download the PDF and print",
    ],
    stepBodies: [
      "Pick a classic 2×7 (14-up) mailing grid, a larger 2×4 (8-up) parcel grid, or a 2-up half-sheet layout on A4.",
      "Fill every cell with one return address for bulk stationery, or toggle multi-entry mode to paste unique recipient names and postal codes per slot.",
      "Inspect line wrapping across the full sheet preview so long street names and international postcodes never truncate.",
      "Export your vector PDF, print at 100% scale on copy paper first to verify tray registration, then feed adhesive label sheets.",
    ],
    step2Sub: [
      {
        h4: "Single address or many addresses",
        body: "Use repeat mode for branded return-address stickers, or batch-entry mode when fulfilling an afternoon of marketplace parcel orders.",
      },
      {
        h4: "Sender and return-address layout",
        body: "Reserve the top two lines for an understated sender address or small brand line above a bold recipient block for rapid courier sorting.",
      },
    ],
    h2Layouts: "A4 address labels: layouts and presets",
    layoutsIntro:
      "Select the A4 address labels grid size that matches the envelopes, satchels, or cardboard mailers in your dispatch workflow.",
    presets: [
      {
        name: "2 x 7 address labels (14-up)",
        s1: "Standard mailing label grid",
        s2: "Best for envelopes and parcels",
        desc: "Fourteen 99.1 × 38.1 mm labels per A4 sheet offer generous legibility for DL, C5, and wedding invitation envelopes without wasted margins.",
      },
      {
        name: "2 x 4 shipping labels (8-up)",
        s1: "Larger labels with room for barcodes",
        s2: "Best for e-commerce parcels",
        desc: "Eight 99.1 × 67.7 mm labels per sheet give ample height for To/From addresses, order IDs, fragile notices, and tracking references.",
      },
      {
        name: "Half-sheet shipping labels",
        s1: "Two labels per A4 sheet",
        s2: "Best for large parcels",
        desc: "Two large 199.6 × 143.5 mm zones fit oversized carton labels, pallet slips, and courier manifests cleanly on standard A4 stock.",
      },
    ],
    h2Settings: "A4 shipping labels: paper size and print settings",
    settingsIntro:
      "Prevent clipped postcodes on A4 shipping labels by keeping print scaling locked and toner contrast dark.",
    paperNote: "Using A4",
    paperBody:
      "Keep your document size and print driver locked to ISO A4 (210 × 297 mm) when printing on shipping label paper A4 packs so the bottom row never drops off the sheet.",
    recSettingHeading: "A4 address label template: recommended settings",
    recSettingBody:
      "Enable 100% Actual Size, choose Standard or High quality black text, and use matte shipping label paper A4 packs so ink dries immediately without smudging during packing. This A4 address label template setup keeps edges razor-sharp.",
    h2Projects: "Shipping labels A4 for everyday projects",
    projectsIntro:
      "Clean shipping labels A4 save hours compared to handwriting packages or taping trimmed copy paper onto satchels.",
    projects: [
      {
        h3: "Online sellers and Etsy shops",
        body: "Print tidy return-address badges and tracking parcel slips in one quick pass right from your packing desk.",
      },
      {
        h3: "Wedding and event invitations",
        body: "Generate uniform guest envelope labels and RSVP return-address sets on matte white or kraft stock with matching typography.",
      },
      {
        h3: "Small businesses and clubs",
        body: "Mail invoices, membership welcome kits, and seasonal newsletters with crisp, scannable address blocks.",
      },
    ],
    tips: [
      {
        h3: "Use 11 pt or larger for postal readability",
        body: "Automated postal optical readers and delivery drivers in low light read 11–13 pt clean sans-serif type far more reliably than decorative scripts.",
      },
      {
        h3: "Test alignment on plain paper first",
        body: "A five-second plain-paper check against a blank label sheet prevents spoiling an entire pack of adhesive parcel sheets.",
      },
      {
        h3: "Use high-contrast ink on white sheets",
        body: "Stick to solid black ink on bright matte white label stock so addresses stay readable inside clear poly courier pouches.",
      },
    ],
    guideLinkText:
      "Want exact metric cell specs for 14-up, 16-up, and 8-up packs? Browse our dimensions chart for",
    guideLinkAnchor: "a4 size label",
    faqs: [
      {
        q: "How do I print A4 address labels?",
        a: "Open this address label sheet maker, pick the 2×7 (14-up) or 2×4 (8-up) layout, type or paste your addresses, export the PDF, and print at 100% Actual Size onto A4 label sheets.",
      },
      {
        q: "What is the best A4 shipping label size?",
        a: "For everyday satchels and medium boxes, 2×4 (8-up, ~99.1 × 67.7 mm) gives clear space for To/From blocks; for bulky cartons or marketplace waybills, 2-up half-sheet labels work best.",
      },
      {
        q: "Can I print different addresses on one sheet?",
        a: "Yes. Switch from Repeat mode to Individual Cells inside the tool editor above to type or paste a distinct recipient into every label position on the A4 sheet.",
      },
      {
        q: "Do I need special paper for shipping labels?",
        a: "Self-adhesive A4 address or shipping label sheets save packing tape and stay flat in rain, though matte uncoated inkjet or laser sheets handle handwriting and stamps best.",
      },
    ],
    relatedH3s: [
      {
        heading: "How do i print different address labels on one sheet",
        targetId: "H10",
        anchor: "how do i print different address labels on one sheet",
        desc: "Follow our step-by-step workflow for printing mixed recipient lists without spreadsheet headaches.",
      },
      {
        heading: "A4 labels template",
        targetId: "T18",
        anchor: "a4 labels template",
        desc: "Build custom row and column dimensions for non-standard blank A4 label packs.",
      },
      {
        heading: "Barcode sticker A4 sheet",
        targetId: "T21",
        anchor: "barcode sticker a4 sheet",
        desc: "Generate scannable EAN-13, UPC, and Code 128 SKU barcode stickers across A4 pages.",
      },
    ],
  }),

  T21: buildLabelToolContent({
    id: "T21",
    subtitle:
      "Generate crisp vector Code 128, EAN-13, and UPC barcode stickers across A4 label sheets ready for laser or inkjet printing.",
    intro: [
      "Build a scannable barcode sticker A4 sheet directly in your browser without paying for proprietary barcode software. Enter one SKU to repeat across the sheet or a list of mixed product codes, pick your label size, and download a crisp vector PDF.",
      "Every bar is rendered cleanly with generous quiet zones so handheld laser scanners, camera POS apps, and warehouse readers decode your labels instantly—making this barcode label sheet maker dependable for retail shelves and stockrooms.",
    ],
    h2Steps: "How to use the barcode label sheet maker in 4 steps",
    stepsIntro:
      "Turn raw SKU strings or retail GTIN numbers into a sharp multi-up sheet using the barcode label sheet maker above.",
    steps: [
      "Step 1: Enter product codes",
      "Step 2: Choose barcode type and label size",
      "Step 3: Fill the A4 sheet with labels",
      "Step 4: Download the PDF and print",
    ],
    stepBodies: [
      "Paste a single SKU to tile across every label or enter separate product codes, titles, and prices per label slot.",
      "Choose Code 128 for flexible alphanumeric SKUs, EAN-13 for 13-digit retail goods, or UPC-A for 12-digit North American retail items.",
      "Select an A4 barcode label grid such as 3×8 (24-up) or 4×10 (40-up) so every sticker aligns cleanly on standard metric label packs.",
      "Download the vector PDF and print at 100% scale with pure black ink on bright matte white label stock.",
    ],
    step2Sub: [
      {
        h4: "Common barcode types: EAN-13, UPC and Code 128",
        body: "Use Code 128 for internal stockroom bins, warehouse locations, and custom SKUs; use EAN-13 or UPC-A when encoding official retail product numbers.",
      },
      {
        h4: "Label size and quiet zone",
        body: "Every barcode needs blank white space (quiet zone) to the left and right of the outer bars. Never place borders or price text directly against the first or last bar.",
      },
    ],
    h2Layouts: "Barcode sticker A4 sheet: layouts and presets",
    layoutsIntro:
      "Choose a barcode sticker A4 sheet configuration tailored to single-SKU cartons, mixed shelves, or retail hang tags.",
    presets: [
      {
        name: "Single product code",
        s1: "One barcode repeated across the sheet",
        s2: "Best for one SKU",
        desc: "Fills all 24 or 40 labels on the A4 sheet with identical barcode artwork so you can label an entire production batch in seconds.",
      },
      {
        name: "Multiple SKU sheet",
        s1: "A different code in each label",
        s2: "Best for mixed inventory",
        desc: "Place distinct product codes across consecutive label positions when preparing small sample assortments or boutique restocks.",
      },
      {
        name: "Barcode with price",
        s1: "Barcode plus product name and price",
        s2: "Best for retail shelves",
        desc: "Pairs a crisp scannable bar block with item title, variant, and unit price cleanly stacked above or below the human-readable digits.",
      },
    ],
    h2Settings: "Barcode sticker paper A4: paper size and print settings",
    settingsIntro:
      "Getting clean scans from barcode sticker paper A4 depends on sharp black contrast and zero print-driver scaling distortion.",
    paperNote: "Using A4",
    paperBody:
      "Select ISO A4 (210 × 297 mm) in both the tool and your printer dialog so tall columns on a 24-up or 40-up barcode sticker paper A4 sheet stay aligned.",
    recSettingHeading: "Barcode sticker A4 size: recommended settings",
    recSettingBody:
      "Print at 600 DPI or higher on matte paper—glossy coatings scatter laser beams and cause misreads. Keep barcode sticker A4 size proportions locked at 100% scale so narrow bars never blur together.",
    h2Projects: "Barcode label sheet generator for everyday projects",
    projectsIntro:
      "A browser-based barcode label sheet generator lets growing shops print accurate barcodes on demand without dedicated thermal hardware.",
    projects: [
      {
        h3: "Retail and shop inventory",
        body: "Tag packaged candles, stationery, coffee bags, and boutique apparel for instant POS checkout scanning.",
      },
      {
        h3: "Warehouse and stockroom labels",
        body: "Print shelf-edge bin location codes and carton SKU stickers using Code 128 on durable A4 size barcode paper.",
      },
      {
        h3: "Craft and handmade product tags",
        body: "Apply clean miniature product stickers to the base of jars, soap sleeves, and market display cards.",
      },
    ],
    tips: [
      {
        h3: "Print barcodes in black on white for best scanning",
        body: "Pure black (#000000) ink on bright white matte paper delivers the highest reflectance contrast for red-laser and camera scanners.",
      },
      {
        h3: "Keep the quiet zone around each code",
        body: "Ensure at least 3 mm of uninterrupted white margin on both horizontal ends of the bars so scanners detect where each code starts and ends.",
      },
      {
        h3: "Test scanning a printed label before printing the sheet",
        body: "Print a single plain-paper proof and scan it with your smartphone camera or checkout scanner before committing a full pack of A4 size barcode paper.",
      },
    ],
    guideLinkText:
      "Look up compatible 24-up, 40-up, and 65-up metric label sizes in our reference chart on",
    guideLinkAnchor: "a4 size label",
    faqs: [
      {
        q: "Can I print barcode stickers on A4 sheets?",
        a: "Yes. Any laser or high-resolution inkjet printer can output sharp scannable barcode sheets onto pre-cut A4 matte label packs when printed at 100% scale.",
      },
      {
        q: "What size should a barcode label be?",
        a: "Most retail Code 128 or EAN-13 stickers need at least 38 × 21 mm up to 63.5 × 33.9 mm so bars stay wide enough to read reliably without expensive industrial print heads.",
      },
      {
        q: "Which barcode type should I use?",
        a: "Choose Code 128 for custom alphanumeric SKUs, bin IDs, and internal tracking; choose EAN-13 or UPC-A only when encoding official 13-digit or 12-digit retail barcodes.",
      },
      {
        q: "Can I print different barcodes on one sheet?",
        a: "Yes. Use multi-SKU mode in the generator above to assign separate codes and captions to labels across a single A4 barcode sheet.",
      },
    ],
    relatedH3s: [
      {
        heading: "A4 address labels",
        targetId: "T20",
        anchor: "a4 address labels",
        desc: "Format 14-up mailing and 8-up parcel shipping sheets to pair with barcoded stock.",
      },
      {
        heading: "A4 labels template",
        targetId: "T18",
        anchor: "a4 labels template",
        desc: "Dial in custom rows, columns, and margins for specialty unbranded label packs.",
      },
      {
        heading: "Printable label maker",
        targetId: "T17",
        anchor: "printable label maker",
        desc: "Create general text, pantry, and small-shop packaging labels in your browser.",
      },
    ],
  }),

  T22: buildLabelToolContent({
    id: "T22",
    subtitle:
      "Arrange die-cut illustrations, planner icons, or brand logo stickers across full A4 sticker sheets with clean cutting gaps.",
    intro: [
      "Use this sticker sheet maker online to tile your artwork across an A4 or US Letter page, set clean cutting spacing, and export a print-ready PDF with zero sign-up. You can upload one sticker image to duplicate across an entire sheet or mix sizes for planners, brand freebies, and packaging.",
      "Unlike cluttered design suites, every printable sticker sheet maker control locks directly to physical millimetre margins so full-sheet vinyl, matte adhesive stock, and Avery-style cut packs print crisp on the first try.",
    ],
    h2Steps: "How to use the sticker sheet maker in 4 steps",
    stepsIntro:
      "Turn single PNG/JPG illustrations or clean typography badges into full A4 sticker sheets ready for scissors, craft trimmers, or kiss-cut blade plotters.",
    steps: [
      "Step 1: Choose a sticker size and shape",
      "Step 2: Upload or create your artwork",
      "Step 3: Arrange stickers across the A4 sheet",
      "Step 4: Download the PDF and print",
    ],
    stepBodies: [
      "Pick a compact planner grid, an 8 sticker a4 template style layout, or a single giant bumper/laptop layout.",
      "Upload transparent PNG illustrations or clean badge text, then toggle subtle outer cut borders if you plan to trim stickers by hand.",
      "Preview every row on the live A4 sticker paper format grid and tune gap spacing so blades or scissors never nick neighbouring art.",
      "Export a high-clarity PDF and print onto matte, glossy, or waterproof vinyl sticker sheets at 100% scale.",
    ],
    step2Sub: [
      {
        h4: "Rectangles, circles and custom shapes",
        body: "Keep rectangular borders tight for quick paper-trimmer passes, or switch to circular frames for badge seals and round packaging stickers.",
      },
      {
        h4: "Cut lines for kiss-cut and hand cutting",
        body: "Enable light dashed guides when trimming by hand with scissors or a craft knife, or disable borders when printing artwork onto pre-scored kiss-cut vinyl.",
      },
    ],
    h2Layouts: "Sticker sheet maker online: layouts and presets",
    layoutsIntro:
      "Each sticker sheet maker online preset handles spacing, margin safety, and density so you fit maximum stickers per sheet.",
    presets: [
      {
        name: "Small stickers (grid sheet)",
        s1: "Many small stickers per sheet",
        s2: "Best for planners and journals",
        desc: "Pack 24, 36, or 48 mini icons across one sheet—ideal for habit trackers, calendar dates, teacher rewards, and craft fair sampler sheets.",
      },
      {
        name: "Mixed-size sticker sheet",
        s1: "Large and small stickers together",
        s2: "Best for product and gift sheets",
        desc: "Pair hero brand logos with smaller thank-you seals and batch stickers on an 8 sticker a4 template or 12-up layout.",
      },
      {
        name: "Single large sticker per page",
        s1: "One big sticker on A4",
        s2: "Best for laptop and wall stickers",
        desc: "Fill nearly the entire printable area of A4 sticker paper with a single bold decal for storage bins, toolboxes, or window signage.",
      },
    ],
    h2Settings: "A4 sticker paper template: paper size and print settings",
    settingsIntro:
      "Following exact tray and scaling rules for your A4 sticker paper template avoids ink smudging and clipped outer edges.",
    paperNote: "Using A4 or Letter",
    paperBody:
      "Verify whether your adhesive vinyl or paper is cut to A4 size sticker paper format (210 × 297 mm) or US Letter (8.5 × 11 in) before choosing the sheet preset.",
    recSettingHeading: "Printable sticker sheet maker: recommended settings",
    recSettingBody:
      "People searching for an A4 size sticker paper format in Word or an A4 size sticker paper format in Excel often run into shifted table margins; our printable sticker sheet maker solves that directly in vector PDF. Choose 'Photo Paper' or 'Glossy/Matte Vinyl' in your printer driver at high quality.",
    h2Projects: "A4 sticker sheet template for everyday projects",
    projectsIntro:
      "A dependable A4 sticker sheet template turns any colour inkjet printer into an on-demand sticker studio.",
    projects: [
      {
        h3: "Planner and journal stickers",
        body: "Print dated week headers, pastel habit flags, and decorative stickers on matte writeable sticker paper.",
      },
      {
        h3: "Branding stickers for small shops",
        body: "Add custom thank-you seals and logo badges to bakery boxes, candle mailers, and apparel tissue folds—cheaper than ordering bulky rolls for new SKUs.",
      },
      {
        h3: "Party favour and classroom stickers",
        body: "Create themed birthday bag seals, name tags, and gold-star alternatives in minutes using any uploaded illustration.",
      },
    ],
    tips: [
      {
        h3: "Leave 2 mm between stickers for cutting",
        body: "A 2 to 3 mm gap gives scissors, guillotine blades, and cutting mats breathing room so trimming one row never slices into the next.",
      },
      {
        h3: "Use waterproof vinyl for outdoor stickers",
        body: "Standard uncoated paper tears when wet; choose printable vinyl sticker sheets plus a clear self-adhesive laminate film for water bottles and laptops.",
      },
      {
        h3: "Add a thin cut line in a separate layer",
        body: "Toggle subtle light-grey cut guides on blank full-sheet vinyl so you always know exactly where each sticker boundary sits before cutting.",
      },
    ],
    guideLinkText:
      "Looking to match a specific pre-cut metric sheet pack or paper GSM? Check our guide to",
    guideLinkAnchor: "a4 size label",
    faqs: [
      {
        q: "How do I make a sticker sheet online?",
        a: "Open this printable sticker sheet maker, upload your sticker image or create text labels, pick an A4 label sticker paper A4 template grid, and export a 100%-scale print-ready PDF.",
      },
      {
        q: "What size is an A4 sticker sheet?",
        a: "An A4 sticker sheet measures 210 × 297 mm (2,480 × 3,508 px at 300 DPI). Leave at least a 5 mm hardware margin on every side unless your printer specifically supports borderless thick media.",
      },
      {
        q: "Can I print stickers on a normal printer?",
        a: "Yes. Most home inkjet printers handle matte, glossy, and inkjet printable vinyl sticker sheets cleanly when loaded one sheet at a time via the rear feed.",
      },
      {
        q: "Do I need a cutting machine?",
        a: "No. While our sheets work great alongside craft cutters, you can enable subtle dashed cut borders and slice straight grids with scissors or a sliding paper trimmer.",
      },
    ],
    relatedH3s: [
      {
        heading: "Sticker paper size A4",
        targetId: "G06",
        anchor: "sticker paper size a4",
        desc: "Compare matte, glossy, clear, and vinyl A4 sticker sheet finishes and printer compatibility.",
      },
      {
        heading: "How to print multiple stickers on one page",
        targetId: "H11",
        anchor: "how to print multiple stickers on one page",
        desc: "Step-by-step tutorial covering paper feed direction, drying time, and clean cutting.",
      },
      {
        heading: "Round labels for printer",
        targetId: "T19",
        anchor: "round labels for printer",
        desc: "Tile exact circular diameters across A4 or Letter sheets for jar caps and seals.",
      },
    ],
  }),

  T23: buildLabelToolContent({
    id: "T23",
    subtitle:
      "Create printable event name tags, conference badge inserts, and desk tent cards across A4 or US Letter sheets.",
    intro: [
      "Use this free name tag maker to build a clean sheet of personalised name badges, adhesive event stickers, or folded table tent cards directly in your browser. Paste a guest list or print blank 'Hello my name is' tags in seconds, with zero account or watermark.",
      "Every layout locks neatly to standard A4 or US Letter grids so conference volunteers, teachers, and wedding hosts can export a print-ready PDF at exact scale.",
    ],
    h2Steps: "How to use the name tag sheet maker in 4 steps",
    stepsIntro:
      "Prepare crisp, high-readability event tags for guests, students, or staff in four simple steps.",
    steps: [
      "Step 1: Choose a name tag size",
      "Step 2: Type or paste your names",
      "Step 3: Pick a style and add a logo",
      "Step 4: Download the printable sheet",
    ],
    stepBodies: [
      "Select an 8-up or 10-up badge grid matching standard A4/Letter name tag inserts, adhesive sticker packs, or folded place cards.",
      "Fill every card with a blank template or paste multiple attendee names and job titles across distinct labels on the sheet.",
      "Pick a clean dark header accent or minimal outline frame and include an event name, role, or table number.",
      "Export a sharp vector PDF and print at 100% scale on heavy matte cardstock or adhesive badge sheets.",
    ],
    step2Sub: [
      {
        h4: "Sticker and badge sizes",
        body: "Standard pin-on and lanyard badge inserts typically measure 90 × 55 mm or 85 × 54 mm (10-up per sheet) or larger 99 × 68 mm (8-up).",
      },
      {
        h4: "Name list and bulk import",
        body: "Switch to Multi-Label mode to enter distinct attendee names in each sheet position so you never have to duplicate pages manually.",
      },
    ],
    h2Layouts: "Free name tag maker: layouts and presets",
    layoutsIntro:
      "Choose one of these free name tag maker layouts tuned for clear legibility across meeting rooms and event halls.",
    presets: [
      {
        name: "Sticker name tags",
        s1: "Large 'Hello my name is' style",
        s2: "Best for events and classes",
        desc: "High-contrast 99 × 67 mm labels print cleanly on peel-and-stick A4 paper for mixers, orientations, and volunteer check-ins.",
      },
      {
        name: "Badge insert name tags",
        s1: "Fits standard badge holders",
        s2: "Best for conferences and offices",
        desc: "Exact 90 × 55 mm or 85 × 54 mm inserts drop cleanly into clear plastic lanyard sleeves after a few straight trimmer cuts.",
      },
      {
        name: "Table and desk name tags",
        s1: "Folded tent cards",
        s2: "Best for meetings and weddings",
        desc: "Generous wide cells on heavy cardstock fold or trim into crisp seat markers and conference table placards.",
      },
    ],
    h2Settings: "Free name tag maker: paper size and print settings",
    settingsIntro:
      "Keep lanyard inserts and peel-and-stick badges aligned with these quick free name tag maker settings.",
    paperNote: "Using A4 or Letter",
    paperBody:
      "Verify whether your clear badge sleeves or adhesive badge sheets follow A4 (210 × 297 mm) or US Letter (8.5 × 11 in) dimensions so cut borders align properly.",
    h2Projects: "Free name tag maker for everyday projects",
    projectsIntro:
      "Events of every size benefit from having a fast free name tag maker ready before doors open.",
    projects: [
      {
        h3: "Conferences and workshops",
        body: "Print first names large enough to read across a room, with company name or workshop track underneath.",
      },
      {
        h3: "School and club events",
        body: "Make field-trip badges, parent-teacher night stickers, and sports-club registration cards in minutes.",
      },
      {
        h3: "Weddings and parties",
        body: "Print minimalist seat place cards and matching guest favour tags on textured ivory or bright white cardstock.",
      },
    ],
    tips: [
      {
        h3: "Use 24 pt or larger for names",
        body: "Small 11 pt text forces people to squint awkwardly at someone's chest. Keep first names bold at 20–28 pt so guests read them comfortably at conversation distance.",
      },
      {
        h3: "Add the company or role in a smaller line",
        body: "Using a smaller 10–12 pt weight for titles, schools, or table numbers preserves clean visual hierarchy without crowding the card.",
      },
      {
        h3: "Print extras for late arrivals",
        body: "Always run one spare sheet of blank framed tags with the same header so walk-in guests can write their name with a black marker and match everyone else.",
      },
    ],
    guideLinkText:
      "Need metric cell charts for 8-up and 10-up A4 sheets? Look up compatible formats in our guide to",
    guideLinkAnchor: "a4 size label",
    faqs: [
      {
        q: "Is there a free name tag maker?",
        a: "Yes. This free name tag maker creates multi-up PDF sheets directly in your browser with no sign-up, watermark, or email wall.",
      },
      {
        q: "How do I print name tags on a sheet?",
        a: "Pick an 8-up or 10-up preset above, type your guest names or leave blank lines for handwriting, export the vector PDF, and print at 100% scale on cardstock or adhesive label sheets.",
      },
      {
        q: "Can I print many names at once?",
        a: "Yes. Toggle individual cell mode to place up to 8, 10, or 14 unique names on a single sheet, or generate extra sheets for larger guest lists.",
      },
      {
        q: "What size is a standard name tag?",
        a: "Most adhesive name tags measure around 99 × 67 mm (3.9 × 2.6 in), while plastic lanyard badge inserts typically use 90 × 55 mm or 85 × 54 mm (business-card size).",
      },
    ],
    relatedH3s: [
      {
        heading: "Printable label maker",
        targetId: "T17",
        anchor: "printable label maker",
        desc: "Build product, storage, and custom adhesive label sheets for everyday projects.",
      },
      {
        heading: "Sticker sheet maker online",
        targetId: "T22",
        anchor: "sticker sheet maker online",
        desc: "Tile custom artwork and event seal stickers on full A4 sticker paper.",
      },
      {
        heading: "A4 labels template",
        targetId: "T18",
        anchor: "a4 labels template",
        desc: "Configure exact custom rows, columns, and gaps for any unbranded label pack.",
      },
    ],
  }),
};

