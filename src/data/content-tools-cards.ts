import type { HeadingNode, PageContent, PageId } from "@/types/spec";

interface CardToolInput {
  id: PageId;
  subtitle: string;
  intro: string[];
  h2Steps: string;
  steps: [string, string, string, string];
  step2Sub: [string, string];
  h2Layouts: string;
  presets: [
    { name: string; s1: string; s2: string; desc: string },
    { name: string; s1: string; s2: string; desc: string },
    { name: string; s1: string; s2: string; desc: string },
  ];
  h2Settings: string;
  paperNote: string;
  recSettingHeading: string;
  recSettingBody: string;
  h2Projects: string;
  projects: [string, string, string];
  tips: [string, string, string];
  faqs: [
    { q: string; a: string },
    { q: string; a: string },
    { q: string; a: string },
    { q: string; a: string },
  ];
  relatedH3s: { targetId: PageId; anchor: string; desc: string }[];
}

function buildCardToolContent(spec: CardToolInput): PageContent {
  const sections: HeadingNode[] = [
    {
      level: 2,
      text: spec.h2Steps,
      paragraphs: [
        "Build and export an exact-scale sheet directly in your browser—no desktop software, login, or design file conversion needed.",
      ],
      children: [
        {
          level: 3,
          text: spec.steps[0],
          paragraphs: [
            "Upload an existing card artwork image or stay in Edit Card Details to build a clean card directly in the live editor.",
          ],
        },
        {
          level: 3,
          text: spec.steps[1],
          paragraphs: [
            "Select A4 10-up (90 × 55 mm), US Letter 10-up (3.5 × 2 in), or 8-up sheet presets depending on your region and card stock.",
          ],
          children: [
            {
              level: 4,
              text: spec.step2Sub[0],
              paragraphs: [
                "Switching sheet presets automatically adjusts card dimensions, gutters, and centering on A4 or Letter paper.",
              ],
            },
            {
              level: 4,
              text: spec.step2Sub[1],
              paragraphs: [
                "Keep Crop marks enabled for razor-sharp cuts with a guillotine, or disable them when feeding pre-perforated card sheets.",
              ],
            },
          ],
        },
        {
          level: 3,
          text: spec.steps[2],
          paragraphs: [
            "Review the close-up front preview and the full-sheet grid indicator. Enable Include Back Side to generate a matching Page 2 for two-sided printing.",
          ],
        },
        {
          level: 3,
          text: spec.steps[3],
          paragraphs: [
            "Click Download PDF and print at 100% / Actual Size on 250–300 gsm card stock after verifying alignment on plain paper.",
          ],
        },
      ],
    },
    {
      level: 2,
      text: spec.h2Layouts,
      paragraphs: [
        "Choose a layout preset below to start with balanced typography, safe margins, and print-ready spacing.",
      ],
      children: spec.presets.map((p) => ({
        level: 3 as const,
        text: p.name,
        paragraphs: [p.desc],
        children: [
          { level: 4 as const, text: p.s1 },
          { level: 4 as const, text: p.s2 },
        ],
      })),
    },
    {
      level: 2,
      text: spec.h2Settings,
      paragraphs: [
        "Accurate scaling makes the difference between clean, symmetrical cards and off-centre cuts. Follow these paper and print-dialog checks before running heavy card stock.",
      ],
      children: [
        {
          level: 3,
          text: "Page size and orientation",
          children: [
            {
              level: 4,
              text: spec.paperNote,
              paragraphs: [
                "Match the PDF sheet size (A4 or US Letter) to the exact physical paper pack loaded in your printer tray.",
              ],
            },
          ],
        },
        {
          level: 3,
          text: "Scale, margins and bleed",
          children: [
            {
              level: 4,
              text: "Print at 100% or Actual Size",
              paragraphs: [
                "Turn off 'Fit to Page' or 'Shrink to Printable Area' in your print dialog so a 90 × 55 mm card never shrinks to 86 × 52 mm.",
              ],
            },
            {
              level: 4,
              text: "Keep a safe margin",
              paragraphs: [
                "Keep names, phone numbers, and QR codes at least 3 mm inside the card edge so minor paper feed skew never clips a letter.",
              ],
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
          children: [
            {
              level: 4,
              text: "PDF versus JPG output",
              paragraphs: [
                "Always print business cards from a PDF rather than a raw JPG so vector text, accent rules, and QR codes stay crisp at 600–1200 DPI.",
              ],
            },
          ],
        },
      ],
    },
    {
      level: 2,
      text: spec.h2Projects,
      paragraphs: [
        "Printing your own sheets on demand lets you update phone numbers, QR links, or event titles immediately without ordering 500 outdated cards.",
      ],
      children: spec.projects.map((proj) => ({
        level: 3 as const,
        text: proj,
        paragraphs: [
          `For ${proj.toLowerCase()}, generating a 10-card sheet PDF means you can print a fresh batch of 20 or 50 cards whenever an event comes up.`,
        ],
      })),
    },
    {
      level: 2,
      text: "Tips for cleaner, sharper prints",
      paragraphs: [
        "Follow these three quick production tips and check our size reference before feeding heavy card stock.",
      ],
      inlineLinks: [
        { targetId: "G05", anchor: "business card dimensions template" },
      ],
      children: spec.tips.map((t) => ({
        level: 3 as const,
        text: t,
        paragraphs: [
          `Applying this habit (${t.toLowerCase()}) keeps edges crisp and prevents ink rub or misaligned backs.`,
        ],
      })),
    },
    {
      level: 2,
      text: "Frequently asked questions",
      children: spec.faqs.map((f) => ({
        level: 3 as const,
        text: f.q,
        paragraphs: [f.a],
      })),
    },
    {
      level: 2,
      text: "More print sheet tools and guides",
      children: spec.relatedH3s.map((r) => ({
        level: 3 as const,
        text: r.anchor,
        link: { targetId: r.targetId, anchor: r.anchor },
        paragraphs: [r.desc],
      })),
    },
  ];

  return {
    id: spec.id,
    subtitle: spec.subtitle,
    introParagraphs: spec.intro,
    sections,
  };
}

export const CARD_TOOLS_CONTENT: Partial<Record<PageId, PageContent>> = {
  T11: buildCardToolContent({
    id: "T11",
    subtitle:
      "Tile 8 or 10 copies of your business card or ID card onto one A4 or Letter page with crop marks and double-sided PDF export.",
    intro: [
      "Use this free business card sheet maker to print multiple business cards on one page from any PNG or JPG design. Upload your finished card image (or build one right in the editor), pick an 8-up or 10-up grid, and export a print-ready PDF with corner crop marks.",
      "Design apps like Canva, Photoshop, and Illustrator often export a single card per page. Rather than setting up manual tables or a business card a4 template PSD every time, this browser sheet tool lets you print multiple business cards on one sheet—plus multiple ID cards on one page—in under a minute.",
    ],
    h2Steps: "How to use the business card sheet maker in 4 steps",
    steps: [
      "Step 1: Upload your card design",
      "Step 2: Choose 8 or 10 cards per sheet",
      "Step 3: Add crop marks and bleed",
      "Step 4: Download the A4 or Letter PDF",
    ],
    step2Sub: ["8-up and 10-up layouts", "Crop marks and bleed settings"],
    h2Layouts: "Print multiple business cards on one page: layouts and presets",
    presets: [
      {
        name: "10 cards per A4 sheet",
        s1: "Standard 2 x 5 grid",
        s2: "Best for most home and office printers",
        desc: "Fits 10 cards (90 × 55 mm) neatly onto A4 paper—ideal when searching for an a4 business card template word or a4 business card template psd 10 per sheet alternative.",
      },
      {
        name: "8 cards per Letter sheet",
        s1: "Standard US 2 x 4 layout",
        s2: "Best for US card stock",
        desc: "Leaves wider gaps between US 3.5 × 2 inch cards for easier hand cutting with a rotary trimmer or business card cut out template.",
      },
      {
        name: "Full-page card sheet",
        s1: "Edge-to-edge sheet with cut guides",
        s2: "Best for guillotine and craft cutters",
        desc: "Adds corner crop marks outside every card slot so your business card cutting template produces square, repeatable corners.",
      },
    ],
    h2Settings: "Business card sheet template: paper size and print settings",
    paperNote: "Using A4 or Letter",
    recSettingHeading:
      "Print multiple business cards on one sheet: recommended settings",
    recSettingBody:
      "Select Heavy Card / Matte Cardstock in your printer driver, set Print Scale to 100%, and keep Crop marks enabled when cutting plain A4 card stock.",
    h2Projects: "Business card page template for everyday projects",
    projects: [
      "Short runs for events and trade shows",
      "Small business and freelance cards",
      "ID and membership cards",
    ],
    tips: [
      "Print one test sheet on plain paper",
      "Turn off scaling and print at 100%",
      "Use heavier card stock if your printer allows",
    ],
    faqs: [
      {
        q: "How to print multiple business cards on one page?",
        a: "Click Upload Card Image above, select your exported card file, choose 10-up A4 or 8-up Letter, turn on Crop marks, and click Download 10-Card PDF.",
      },
      {
        q: "How to print multiple business cards on one sheet?",
        a: "Our sheet generator automatically tiles 8 or 10 cards onto a single A4 or Letter page so you do not need Word, PSD, or InDesign imposition.",
      },
      {
        q: "What is a business card A4 template?",
        a: "A business card A4 template arranges 8 or 10 standard cards across a 210 × 297 mm sheet with consistent margins and cut marks.",
      },
      {
        q: "Does the sheet include crop marks?",
        a: "Yes—toggle Crop marks on to print crisp hairline corner guides outside every card for easy guillotine trimming.",
      },
    ],
    relatedH3s: [
      {
        targetId: "T12",
        anchor: "printable business cards",
        desc: "Need blank sheets or quick printable cards without uploading? Start here.",
      },
      {
        targetId: "T15",
        anchor: "avery business card template",
        desc: "Align directly to Avery 8376-style perforated business card sheets.",
      },
      {
        targetId: "H05",
        anchor: "how to print multiple business cards on one sheet canva",
        desc: "Step-by-step workflow for tiling Canva card exports onto one sheet.",
      },
    ],
  }),

  T12: buildCardToolContent({
    id: "T12",
    subtitle:
      "Generate free blank printable business card sheets or minimal contact cards as instant print-ready PDFs.",
    intro: [
      "Create printable business cards directly in your browser with no sign-up or design software required. Choose a blank sheet for handwriting or rubber stamps, or type your name, role, and contact details to download a 10-card print-ready PDF in seconds.",
      "This business card printable maker gives freelancers, clubs, and local shops a fast free business card print out whenever you need blank business cards printable on A4 or Letter stock.",
    ],
    h2Steps: "How to use the printable business card maker in 4 steps",
    steps: [
      "Step 1: Choose a blank or styled card",
      "Step 2: Add your name, role and contact details",
      "Step 3: Preview front and back",
      "Step 4: Download the print-ready PDF",
    ],
    step2Sub: ["Standard card sizes", "Front and back layouts"],
    h2Layouts: "Printable business cards: layouts and presets",
    presets: [
      {
        name: "Blank printable cards",
        s1: "Plain cards ready for handwriting or stamps",
        s2: "Best for quick, low-cost cards",
        desc: "Select Blank Sheet to output empty card outlines on A4 or Letter—ideal when you want blank business cards to print and stamp or sign by hand.",
      },
      {
        name: "Minimal text cards",
        s1: "Name, role and one contact line",
        s2: "Best for freelancers and students",
        desc: "Clean high-contrast typography with a lime or charcoal top accent bar that prints crisply on any home inkjet or laser.",
      },
      {
        name: "Logo and photo cards",
        s1: "Space for logo or portrait",
        s2: "Best for small businesses",
        desc: "Upload a brand mark or headshot via the Logo button to place it automatically in the top-right corner of every card.",
      },
    ],
    h2Settings: "Free printable business cards: paper size and print settings",
    paperNote: "Using A4 or Letter",
    recSettingHeading:
      "Free business card print out: recommended settings",
    recSettingBody:
      "Use 240–300 gsm matte card stock, disable automatic page scaling, and keep Crop marks active if trimming full sheets with a paper cutter.",
    h2Projects: "Blank business cards printable for everyday projects",
    projects: [
      "Free cards for new freelancers",
      "Event and networking cards",
      "Cards for clubs and volunteers",
    ],
    tips: [
      "Use matte card stock for cleaner text",
      "Keep text 3 mm inside the trim line",
      "Proofread phone numbers and emails twice",
    ],
    faqs: [
      {
        q: "Where can I get free printable business cards?",
        a: "Right here—pick Blank Sheet or one of the clean text styles above and export a free printable business cards PDF immediately with no login.",
      },
      {
        q: "Can I print blank business cards at home?",
        a: "Yes. Load heavy card stock into your home printer, choose Blank Sheet above, and print at 100% scale with hairline cut outlines.",
      },
      {
        q: "What paper works best for printable business cards?",
        a: "Uncoated or matte 250–300 gsm (90–110 lb cover) card stock gives printable business cards crisp text and a sturdy hand-feel without ink smudging.",
      },
      {
        q: "Is there a free business card print out PDF?",
        a: "Yes—every sheet you build here downloads as a clean, multi-card PDF with zero watermarks.",
      },
    ],
    relatedH3s: [
      {
        targetId: "T13",
        anchor: "business card template",
        desc: "Browse editable blank and styled business card templates.",
      },
      {
        targetId: "T14",
        anchor: "make business cards online",
        desc: "Customise fonts, colours, logos, and QR codes online.",
      },
      {
        targetId: "H07",
        anchor: "print business cards at home",
        desc: "Read the full guide on paper weight, printer settings, and cutting.",
      },
    ],
  }),

  T13: buildCardToolContent({
    id: "T13",
    subtitle:
      "Pick a free blank, plain, or logo-ready business card template, customise your details, and export a print-ready PDF.",
    intro: [
      "Choose a free business card template above to create polished, cut-ready cards in minutes without wrestling with Photoshop, Illustrator, or Word documents. Pick a blank outline, plain text layout, or logo-plus-QR template, edit your details, and export a 10-card print-ready PDF.",
      "Our browser-based template to make business cards gives you exact regional sizing (3.5 × 2 in or 90 × 55 mm), optional back-side printing, and clean corner crop marks—so anyone looking for business card templates free or a plain business card template can go straight to print.",
    ],
    h2Steps: "How to use the business card template library in 4 steps",
    steps: [
      "Step 1: Browse the template library",
      "Step 2: Pick a blank or styled design",
      "Step 3: Edit text, logo and colours",
      "Step 4: Download the template as PDF",
    ],
    step2Sub: [
      "Horizontal and vertical templates",
      "Standard size and bleed",
    ],
    h2Layouts: "Business card template: layouts and presets",
    presets: [
      {
        name: "Blank business card template",
        s1: "Empty layout with guides",
        s2: "Best for custom designs",
        desc: "An empty blank business card template grid with precise 90 × 55 mm or 3.5 × 2 inch trim guides—ideal for rubber stamps or uploading an Illustrator/PSD export.",
      },
      {
        name: "Plain business card template",
        s1: "Minimal text-first layout",
        s2: "Best for professionals",
        desc: "A distraction-free plain business card template with strong hierarchy for your name, title, phone, email, and website.",
      },
      {
        name: "Editable template with logo area",
        s1: "Logo, name and QR zone",
        s2: "Best for small businesses",
        desc: "Combines your uploaded brand logo with an automatic QR code so clients can open your portfolio or booking page instantly.",
      },
    ],
    h2Settings: "Blank business card template: paper size and print settings",
    paperNote: "Using 3.5 x 2 in or 90 x 55 mm",
    recSettingHeading:
      "Business card templates free: recommended settings",
    recSettingBody:
      "Choose US Letter 10-up for 3.5 × 2 inch cards or A4 10-up for 90 × 55 mm cards, and always print at Actual Size (100%) so trim marks match your cutter.",
    h2Projects: "Free business card design templates for everyday projects",
    projects: [
      "Freelancers and consultants",
      "Small shops and local services",
      "Students and job seekers",
    ],
    tips: [
      "Keep one font family and two weights",
      "Leave generous white space",
      "Export with 3 mm bleed for professional printing",
    ],
    faqs: [
      {
        q: "Where can I download a free business card template?",
        a: "Select any preset style above, customise your text or leave it blank, and click Download 10-Card PDF to get a free business card template ready for printing.",
      },
      {
        q: "What is a blank business card template?",
        a: "A blank business card template is an empty sheet layout marked with exact card dimensions and crop guides so you can print blank frames or place custom artwork inside.",
      },
      {
        q: "Can I edit a business card template online?",
        a: "Yes. Edit every line of text, accent colour, logo, QR code, and back-side message live in your browser before exporting your PDF.",
      },
      {
        q: "Which business card template format is best?",
        a: "PDF is best for printing because it preserves exact millimetre dimensions and sharp vector text across Word, Adobe tools, home printers, and copy shops.",
      },
    ],
    relatedH3s: [
      {
        targetId: "T14",
        anchor: "make business cards online",
        desc: "Customise colours, logos, and two-sided layouts with our online card maker.",
      },
      {
        targetId: "T12",
        anchor: "printable business cards",
        desc: "Download blank printable sheets or minimal cut-ready card PDFs.",
      },
    ],
  }),

  T14: buildCardToolContent({
    id: "T14",
    subtitle:
      "Design your own business card online with logo upload, QR codes, custom accent colours, and instant 10-up PDF export.",
    intro: [
      "Use this free maker to make business cards online in minutes—no graphic-design background or account required. Enter your name, job title, company, and contact details, upload a logo or toggle a QR code, and export a print-ready 10-card PDF for A4 or US Letter.",
      "Built for people who want to create business cards free online and print at home or at a local copy shop, our online maker pairs clean typography with crisp crop marks and optional two-sided backs.",
    ],
    h2Steps: "How to use the business card maker in 4 steps",
    steps: [
      "Step 1: Start a new card",
      "Step 2: Add your logo, name and contact details",
      "Step 3: Choose fonts, colours and layout",
      "Step 4: Download the print-ready PDF",
    ],
    step2Sub: ["Fonts and colour pairs", "Front and back sides"],
    h2Layouts: "Make business cards online: layouts and presets",
    presets: [
      {
        name: "Modern minimal card",
        s1: "Clean type, one accent colour",
        s2: "Best for consultants and creatives",
        desc: "A crisp top accent bar paired with left-aligned contact lines and generous white space.",
      },
      {
        name: "Classic professional card",
        s1: "Serif type, centred layout",
        s2: "Best for finance and legal",
        desc: "A centred, thin-framed layout with timeless balance for traditional professions.",
      },
      {
        name: "Bold logo-first card",
        s1: "Large logo, short details",
        s2: "Best for shops and trades",
        desc: "A strong vertical colour stripe on the left paired with your logo and high-contrast contact details.",
      },
    ],
    h2Settings: "Make business cards online free: paper size and print settings",
    paperNote: "Using 3.5 x 2 in or 90 x 55 mm",
    recSettingHeading:
      "Create business cards free online: recommended settings",
    recSettingBody:
      "Choose an accent colour with strong contrast on white card stock (like lime-700, charcoal, or navy), enable Crop marks, and print Page 1 + Page 2 if you include a card back.",
    h2Projects: "Design your business card online free for everyday projects",
    projects: [
      "New businesses and startups",
      "Freelancers building a portfolio",
      "Event teams that need fast cards",
    ],
    tips: [
      "Limit the card to the details people really need",
      "Check contrast so text stays readable",
      "Download a PDF proof before printing",
    ],
    faqs: [
      {
        q: "Can I make business cards online for free?",
        a: "Yes. You can make business cards online free with zero sign-up, zero watermarks, and unlimited edits right in your browser.",
      },
      {
        q: "How do I design my business card online?",
        a: "Pick Modern Minimal, Classic Framed, or Bold Stripe above, fill in your contact fields, optionally add a logo and QR code, and click Download 10-Card PDF.",
      },
      {
        q: "Can I add my logo to a business card online?",
        a: "Yes—click the Logo button to upload a PNG or JPG logo and it will appear cleanly on every card across the print sheet.",
      },
      {
        q: "Can I print the cards at home?",
        a: "Yes. Print the exported PDF onto 250–300 gsm card stock at 100% scale and trim along the corner crop marks.",
      },
    ],
    relatedH3s: [
      {
        targetId: "T13",
        anchor: "business card template",
        desc: "Start from a blank or plain printable card template.",
      },
      {
        targetId: "T12",
        anchor: "printable business cards",
        desc: "Print blank sheets or minimal cards straight from your browser.",
      },
      {
        targetId: "T16",
        anchor: "visiting card design template",
        desc: "Design regional visiting cards and name cards with QR links.",
      },
    ],
  }),

  T15: buildCardToolContent({
    id: "T15",
    subtitle:
      "Align your card design or uploaded artwork to Avery-compatible 8376-style 10-up Letter and A4 perforated card sheets.",
    intro: [
      "Need an Avery business card template layout without installing desktop plugins? Select the 8376-style 10-per-Letter preset (3.5 × 2 in) or 10-per-A4 preset above, type your details or upload card artwork, and download a print-ready PDF aligned for perforated card sheets.",
      "Print Sheet Maker is an independent tool and is not affiliated with Avery. Our Avery-compatible grid presets let you print avery business cards on Letter or A4 sheets cleanly—and you can always turn off crop marks when feeding pre-perforated card stock.",
    ],
    h2Steps:
      "How to use the Avery-compatible business card layout tool in 4 steps",
    steps: [
      "Step 1: Select your Avery sheet number",
      "Step 2: Add your card design",
      "Step 3: Check the grid against the sheet",
      "Step 4: Download the PDF and print",
    ],
    step2Sub: [
      "Find your Avery product number",
      "Align the layout to the sheet",
    ],
    h2Layouts: "Avery business card template: layouts and presets",
    presets: [
      {
        name: "Avery 8376-style layout",
        s1: "Common US business card sheet",
        s2: "Best for US Letter users",
        desc: "Uses a 2 × 5 grid of 3.5 × 2 inch (88.9 × 50.8 mm) cards centered on US Letter—compatible with standard 10-up micro-perforated sheets such as avery business cards 8376.",
      },
      {
        name: "10-up A4 layout",
        s1: "2 x 5 grid for A4 sheets",
        s2: "Best for A4 perforated sheets",
        desc: "Spaces ten 90 × 55 mm cards evenly across A4 for metric perforated card packs.",
      },
      {
        name: "Two-sided card layout",
        s1: "Front and back alignment helper",
        s2: "Best for double-sided sheets",
        desc: "Enable Include Back Side to emit Page 2 centered identically to Page 1 so front and back line up cleanly on duplex sheets.",
      },
    ],
    h2Settings:
      "Avery business card template for Word: paper size and print settings",
    paperNote: "Using Letter or A4",
    recSettingHeading:
      "Printable business cards Avery: recommended settings",
    recSettingBody:
      "Always turn off Crop marks when printing onto pre-perforated sheets, test-print one sheet on plain paper first, and hold it behind your perforated sheet against a light to confirm alignment.",
    h2Projects: "Print Avery business cards for everyday projects",
    projects: [
      "Perforated card sheets at home",
      "Small office and school printing",
      "Events and trade-show cards",
    ],
    tips: [
      "Print one page on plain paper to test alignment",
      "Disable 'fit to page' in the print dialog",
      "Feed sheets the same way every time",
    ],
    faqs: [
      {
        q: "Is there an Avery business card template for Word?",
        a: "Yes, Word includes built-in label wizards, or you can skip Word alignment issues entirely by generating a locked-scale PDF right here in your browser.",
      },
      {
        q: "How do I print Avery business cards?",
        a: "Choose the 10-per-Letter 8376-style preset (or A4 10-up), fill in your card or upload your design, uncheck Crop marks, print a plain-paper test, and then print on your perforated sheet at 100% scale.",
      },
      {
        q: "Where do I find the Avery 8376 business card template?",
        a: "Select '10 per Letter · 8376-style (3.5 × 2 in)' in the Sheet Layout Preset dropdown above—it matches the standard 2 × 5 US Letter grid.",
      },
      {
        q: "Can I print Avery cards at home?",
        a: "Yes. Most inkjet and laser printers handle micro-perforated card sheets cleanly via the rear or bypass tray when set to Heavy Cardstock.",
      },
    ],
    relatedH3s: [
      {
        targetId: "T11",
        anchor: "print multiple business cards on one page",
        desc: "Impose uploaded card images onto A4 or Letter with cut marks.",
      },
      {
        targetId: "T13",
        anchor: "business card template",
        desc: "Browse editable blank and styled business card templates.",
      },
      {
        targetId: "G09",
        anchor: "avery template 28878",
        desc: "Decode common five-digit Avery template numbers and tab layouts.",
      },
    ],
  }),

  T16: buildCardToolContent({
    id: "T16",
    subtitle:
      "Create regional visiting cards, compact name cards, and QR-enabled calling cards with instant 10-up PDF export.",
    intro: [
      "Design a crisp visiting card design template in minutes—tailored for regional visiting card, name card, and calling card standards. Enter your details, turn on a scannable QR code for your website or digital profile, and download a print-ready A4 or Letter PDF free with no sign-up.",
      "Whether you call it a name card template or a personal calling card, this free name card maker online free tool lays out 10 crisp cards per sheet with clean margins and crop guides.",
    ],
    h2Steps: "How to use the visiting card and name card maker in 4 steps",
    steps: [
      "Step 1: Choose visiting or name card size",
      "Step 2: Add your details and logo",
      "Step 3: Pick a layout and colours",
      "Step 4: Download the print-ready PDF",
    ],
    step2Sub: [
      "Regional size presets",
      "Single and double-sided designs",
    ],
    h2Layouts: "Visiting card design template: layouts and presets",
    presets: [
      {
        name: "Classic visiting card",
        s1: "Centred text with a logo",
        s2: "Best for professionals",
        desc: "Select Classic Framed for a balanced, formal visiting card layout design suited for doctors, accountants, and consultants.",
      },
      {
        name: "Compact name card",
        s1: "Small card with name and one contact",
        s2: "Best for events and students",
        desc: "Select Modern Minimal to keep only your name, role, phone, and email crisp on an 85 × 55 mm or 90 × 55 mm name card printable sheet.",
      },
      {
        name: "Digital-first visiting card",
        s1: "QR code linked to a profile",
        s2: "Best for networking",
        desc: "Automatically embeds a high-contrast QR code linking straight to your website, LinkedIn, or portfolio.",
      },
    ],
    h2Settings: "Name card template: paper size and print settings",
    paperNote: "Using Regional card sizes on A4",
    recSettingHeading:
      "Name card maker online free: recommended settings",
    recSettingBody:
      "Use 90 × 55 mm (10 per A4) for India, Australia, and Southeast Asia, or 85 × 55 mm for Europe and the UK, and keep the QR code at least 15 × 15 mm for reliable phone scanning.",
    h2Projects: "Name card printable for everyday projects",
    projects: [
      "Professionals and consultants",
      "Students and job seekers",
      "Event and conference attendees",
    ],
    tips: [
      "Pick the size standard of your region",
      "Add a QR code for your website or profile",
      "Keep fonts above 7 pt for legibility",
    ],
    faqs: [
      {
        q: "Where can I get a visiting card design template?",
        a: "Pick any preset above—Modern Minimal, Classic Framed, Bold Stripe, or QR Visiting—customise your text, and download the 10-card print-ready PDF for free.",
      },
      {
        q: "What is a name card template?",
        a: "A name card template is a pre-sized layout (typically 90 × 55 mm or 85 × 55 mm) formatted to hold your name, title, contact details, and optional QR code.",
      },
      {
        q: "Can I make a visiting card online for free?",
        a: "Yes. Our name card design online free maker requires no login and exports clean PDFs you can print immediately.",
      },
      {
        q: "Can I print a visiting card at home?",
        a: "Yes—print the exported PDF at 100% scale onto 250–300 gsm card stock and trim along the corner crop marks.",
      },
    ],
    relatedH3s: [
      {
        targetId: "T14",
        anchor: "make business cards online",
        desc: "Explore our full business card maker with front and back templates.",
      },
      {
        targetId: "T13",
        anchor: "business card template",
        desc: "Start with a blank or plain printable card layout.",
      },
      {
        targetId: "T12",
        anchor: "printable business cards",
        desc: "Download blank card sheets or simple printable cards.",
      },
    ],
  }),
};

