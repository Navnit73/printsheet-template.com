import type { PageContent, PageId } from "@/types/spec";

export const HOME_AND_HUB_CONTENT: Partial<Record<PageId, PageContent>> = {
  HOME: {
    id: "HOME",
    subtitle:
      "Arrange photos, business cards, labels, and stickers onto exact A4, A3, Letter, and 4×6 sheets directly in your browser.",
    introParagraphs: [
      "This free print sheet maker turns photos, contact details, barcodes, and product labels into exact-scale print layouts in seconds. Pick a paper size such as A4, A3, US Letter, or 4×6 inch, arrange your grid, and export a crisp, print-ready PDF directly in your browser with no sign-up or watermark.",
      "Home printers, office copy centres, and craft cutters all perform better when your artwork is locked to physical millimetres instead of a loose word-processor table. Whether you are preparing ten business cards on a card stock sheet, arranging family snapshots for an album, or laying out round pantry seals, every tool here renders locally on your device so files never leave your computer.",
    ],
    sections: [
      {
        level: 2,
        text: "Choose your print sheet",
        paragraphs: [
          "Start by choosing one of the four print sheet categories below. Each hub groups specialised sheet tools, paper-size references, step-by-step tutorials, and printer guides so you never waste a sheet testing margins by hand.",
        ],
        children: [
          {
            level: 3,
            text: "Photo sheets",
            paragraphs: [
              "Combine multiple snapshots onto one page, repeat a single portrait across wallet slots, build A4 or 4×6 collages, prepare passport grids, or split a large wall poster across multiple sheets.",
            ],
            inlineLinks: [
              { targetId: "HB-PH", anchor: "photo layout maker for printing" },
            ],
            children: [
              {
                level: 4,
                text: "Multi-photo pages, collages and passport sheets",
                paragraphs: [
                  "Supports 2-up, 4-up, 6-up, 8-up, 9-up, and 10-up photo grids alongside 35 × 45 mm and 2 × 2 inch passport sheet layouts.",
                ],
              },
            ],
          },
          {
            level: 3,
            text: "Business cards",
            paragraphs: [
              "Design or upload card artwork, place 8 or 10 cards per sheet with hairline crop marks, export front-and-back PDFs, or align layouts to perforated card stock.",
            ],
            inlineLinks: [
              { targetId: "HB-BC", anchor: "layout for business cards" },
            ],
            children: [
              {
                level: 4,
                text: "Card sheets, templates and makers",
                paragraphs: [
                  "Includes US 3.5 × 2 inch, metric 90 × 55 mm, European 85 × 55 mm, and regional visiting card presets.",
                ],
              },
            ],
          },
          {
            level: 3,
            text: "Labels and stickers",
            paragraphs: [
              "Build printable label grids, circular seals, bulk address and shipping sheets, scannable EAN-13/UPC/Code 128 barcode sheets, planner sticker pages, and conference name tags.",
            ],
            inlineLinks: [
              { targetId: "HB-LS", anchor: "label sticker sheet maker" },
            ],
            children: [
              {
                level: 4,
                text: "Label sheets, sticker sheets and name tags",
                paragraphs: [
                  "Configure custom rows, columns, margins, and gaps in millimetres to match blank or pre-cut A4 and Letter sheets.",
                ],
              },
            ],
          },
          {
            level: 3,
            text: "Jar, bottle and candle labels",
            paragraphs: [
              "Size front labels, lid circles, and wrap-around bands for mason jars, jam preserves, A–Z spice racks, soy candles, glass juice bottles, and essential oil dropper vials.",
            ],
            inlineLinks: [
              { targetId: "HB-JB", anchor: "label designs for jars" },
            ],
            children: [
              {
                level: 4,
                text: "Food, drink and candle labels",
                paragraphs: [
                  "Includes built-in circumference wrap calculators, batch/date fields, and safety warning blocks (always check local labelling rules before selling).",
                ],
              },
            ],
          },
        ],
      },
      {
        level: 2,
        text: "How a print sheet maker works",
        paragraphs: [
          "Every layout tool in this print sheet maker follows the same three-step workflow so you can move from raw content to a finished sheet in under two minutes without installing desktop publishing software.",
        ],
        children: [
          {
            level: 3,
            text: "Upload or type your content",
            paragraphs: [
              "Drop in JPG or PNG photos, upload an exported Canva or Photoshop card image, paste a list of shipping addresses or conference guest names, or type product details directly into a clean form.",
            ],
          },
          {
            level: 3,
            text: "Pick a sheet size and grid",
            paragraphs: [
              "Select A4 (210 × 297 mm), A3 (297 × 420 mm), US Letter (8.5 × 11 in), or 4×6 inch (101.6 × 152.4 mm). Choose a preset grid—such as 2×2 photos, 10-up business cards, or 24-up A4 labels—and fine-tune spacing, margins, and crop marks while watching the proportional preview update in real time.",
            ],
          },
          {
            level: 3,
            text: "Download a print-ready PDF",
            paragraphs: [
              "Click Download Print-Ready PDF to generate a locked-dimension PDF file in your browser. Open the PDF and print at Actual Size (100% scale) so every photo, card, and label matches your ruler measurements down to the millimetre.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Online sheet maker for every print layout",
        paragraphs: [
          "Using an online sheet maker avoids the distortion that happens when office apps automatically shrink margins or rescale photos. Instead of guessing how many inches wide a cell is inside a word processor, an online sheet maker computes exact physical coordinates on the page canvas.",
        ],
        children: [
          {
            level: 3,
            text: "Print layout generator for any paper size",
            paragraphs: [
              "A reliable print layout generator lets you switch paper standards without rebuilding your design from scratch. Whether your local store stocks metric A4 sheets or North American Letter card stock, the print layout generator recalculates centering, margins, and slot counts automatically.",
            ],
            children: [
              {
                level: 4,
                text: "A4, A3, Letter and 4x6",
                table: {
                  headers: ["Paper Format", "Millimetres", "Inches", "Best For"],
                  rows: [
                    ["A4", "210 × 297 mm", "8.27 × 11.69 in", "Home printers, labels, stickers, A4 collages"],
                    ["A3", "297 × 420 mm", "11.69 × 16.54 in", "Large photo sheets, multi-tile posters"],
                    ["US Letter", "215.9 × 279.4 mm", "8.5 × 11 in", "North American card stock and label sheets"],
                    ["4×6 in (4R)", "101.6 × 152.4 mm", "4 × 6 in", "Photo kiosks, dye-sub printers, passport strips"],
                  ],
                },
              },
            ],
          },
          {
            level: 3,
            text: "Custom print sheet maker options",
            paragraphs: [
              "Every project has different cutting and finishing needs. With a custom print sheet maker, you control outer margins, horizontal and vertical gutters, crop-to-fill versus fit-whole framing, and hairline trim guides.",
            ],
            children: [
              {
                level: 4,
                text: "Grids, margins and cut guides",
                paragraphs: [
                  "Turn on corner crop marks when trimming cards with a steel ruler or guillotine, or switch on full dashed cut outlines when testing alignment on plain paper before feeding expensive sticker sheets.",
                ],
              },
            ],
          },
          {
            level: 3,
            text: "Sheet creator online: no sign-up needed",
            paragraphs: [
              "A sheet creator online should never force you to create an account just to print four photos or a sheet of spice labels. Because all canvas rendering and PDF assembly run client-side inside your browser, there are no upload queues, account walls, or usage watermarks.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Convert images to printable PDF sheets",
        paragraphs: [
          "Raw JPG and PNG files store pixels, not reliable print dimensions—printers often guess 72 DPI or 96 DPI and print images huge or tiny. Converting your images into a structured PDF locks exact millimetre placement.",
        ],
        children: [
          {
            level: 3,
            text: "Image to printable PDF",
            paragraphs: [
              "Use the image to printable PDF workflow when you want to combine several JPG or PNG files onto one A4 sheet, repeat one portrait across wallet-size frames, or split a single large illustration across multiple pages.",
            ],
            children: [
              {
                level: 4,
                text: "JPG and PNG to print-ready PDF",
                paragraphs: [
                  "Our converter normalises image aspect ratios inside each grid slot and embeds high-resolution compressed frames directly inside the PDF page box, eliminating browser print-dialog surprises.",
                ],
              },
            ],
          },
          {
            level: 3,
            text: "PDF sheet maker for multi-page files",
            paragraphs: [
              "When you need front-and-back business cards or a 2×2 or 3×3 tiled wall poster, the PDF sheet maker automatically emits multi-page PDF documents with consistent registration and row/column assembly markers.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Why use a print sheet maker?",
        paragraphs: [
          "Switching from ad-hoc printing to a purpose-built print sheet maker pays off immediately in lower paper waste, cleaner cuts, and predictable alignment across printers.",
        ],
        children: [
          {
            level: 3,
            text: "Save paper and time",
            paragraphs: [
              "Instead of printing one 4×6 photo on a full sheet of A4 photo paper and throwing away half the page, a print sheet maker fills every square centimetre efficiently with matching or mixed layouts.",
            ],
          },
          {
            level: 3,
            text: "Print at exact sizes",
            paragraphs: [
              "Passport authorities, retail barcode scanners, and pre-cut sticker sheets tolerate only a millimetre or two of error. Locking dimensions in a print layout maker ensures your 35 × 45 mm or 90 × 55 mm boxes stay true to scale.",
            ],
          },
          {
            level: 3,
            text: "Works with any printer",
            paragraphs: [
              "Because the final export is a standard PDF, you can print at home on an inkjet or laser printer, print wirelessly from a phone, or save the file to a USB drive for a local copy shop or photo kiosk.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Popular tools and guides",
        paragraphs: [
          "Jump straight to our most-used print layout maker tools or start with a foundational size guide.",
        ],
        children: [
          {
            level: 3,
            text: "Most-used print sheet tools",
            paragraphs: [
              "Choose a dedicated tool below to open the workspace preconfigured for your exact paper size and layout.",
            ],
            inlineLinks: [
              { targetId: "T14", anchor: "make business cards online" },
              { targetId: "T12", anchor: "printable business cards" },
              { targetId: "T13", anchor: "business card template" },
              { targetId: "T17", anchor: "printable label maker" },
              { targetId: "T01", anchor: "arrange photos for printing" },
              { targetId: "T22", anchor: "sticker sheet maker online" },
              { targetId: "T24", anchor: "jar label template" },
              { targetId: "T28", anchor: "candle label maker" },
            ],
            children: [
              {
                level: 4,
                text: "Business cards, photo sheets and labels",
                paragraphs: [
                  "All eight popular tools above work without login and export print-ready PDFs scaled to A4, Letter, or 4×6.",
                ],
              },
            ],
          },
          {
            level: 3,
            text: "Beginner guides",
            paragraphs: [
              "If you are choosing paper weight, comparing thermal label printers against standard inkjets, or checking standard card dimensions before designing, visit our guides inside each category hub.",
            ],
            inlineLinks: [
              { targetId: "G01", anchor: "how to print multiple pictures on one page" },
              { targetId: "G05", anchor: "standard business card format" },
              { targetId: "G07", anchor: "label paper for printer" },
              { targetId: "G06", anchor: "sticker paper size a4" },
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Frequently asked questions",
        children: [
          {
            level: 3,
            text: "Is the print sheet maker free?",
            paragraphs: [
              "Yes. Every tool, template, and PDF export in this print sheet maker is completely free to use for personal, craft, and small-business projects with no watermarks.",
            ],
          },
          {
            level: 3,
            text: "Do I need to sign up?",
            paragraphs: [
              "No sign-up or email address is required. You can open any print layout maker, upload images or type text, and download your PDF immediately.",
            ],
          },
          {
            level: 3,
            text: "What paper sizes are supported?",
            paragraphs: [
              "The print sheet maker supports A4 (210 × 297 mm), A3 (297 × 420 mm), US Letter (8.5 × 11 in), and 4×6 inch (101.6 × 152.4 mm), plus custom millimetre grid sizing for label and jar sheets.",
            ],
          },
        ],
      },
    ],
  },

  "HB-PH": {
    id: "HB-PH",
    subtitle:
      "Every photo sheet generator, collage tool, passport grid, poster splitter, and step-by-step photo printing tutorial in one hub.",
    introParagraphs: [
      "Use this photo layout maker for printing when you want multiple pictures on a single page, exact passport photo sheets, 4×6 lab templates, or tiled multi-page wall posters. Every tool outputs a clean, print-ready PDF directly in your browser.",
      "Different photo projects require different layouts: printing two 4×6 photos on A4 uses different spacing than repeating one portrait nine times for wallet cards. Browse the collection below to jump straight to the right tool or read the master photo-printing guide first.",
    ],
    sections: [
      {
        level: 2,
        text: "Tools in this collection",
        children: [
          {
            level: 3,
            text: "Arrange photos for printing",
            link: { targetId: "T01", anchor: "arrange photos for printing" },
            paragraphs: [
              "Flexible A4, A3, and Letter multi-photo grid maker for 3, 5, 6, 8, 9, or 10 photos per page plus mixed hero layouts.",
            ],
            children: [{ level: 4, text: "Best for: family albums and school projects" }],
          },
          {
            level: 3,
            text: "Print 2 photos on one page",
            link: { targetId: "T02", anchor: "print 2 photos on one page" },
            paragraphs: [
              "Two-photo sheet maker with stacked portrait, side-by-side landscape, and 60/40 split presets.",
            ],
            children: [{ level: 4, text: "Best for: before-and-after comparisons" }],
          },
          {
            level: 3,
            text: "Print 4 photos on one page",
            link: { targetId: "T03", anchor: "print 4 photos on one page" },
            paragraphs: [
              "Four-photo sheet maker supporting 2×2 grids, 4 vertical strips, and 1-large-plus-3-small layouts.",
            ],
            children: [{ level: 4, text: "Best for: photo albums and journals" }],
          },
          {
            level: 3,
            text: "Print picture multiple times on one page",
            link: {
              targetId: "T04",
              anchor: "print picture multiple times on one page",
            },
            paragraphs: [
              "Upload one photo once and repeat it 2, 4, 9, or 12 times across an A4 or Letter sheet with cut marks.",
            ],
            children: [
              { level: 4, text: "Best for: cutting multiple copies of one portrait" },
            ],
          },
          {
            level: 3,
            text: "Print big picture on multiple pages",
            link: {
              targetId: "T05",
              anchor: "print big picture on multiple pages",
            },
            paragraphs: [
              "Poster splitter that tiles any large image across 2×2, 3×3, or custom sheet grids with tape overlap.",
            ],
            children: [{ level: 4, text: "Best for: wall posters and banners" }],
          },
          {
            level: 3,
            text: "Passport photo sheet maker",
            link: { targetId: "T06", anchor: "passport photo sheet maker" },
            paragraphs: [
              "Arrange 35 × 45 mm or 2 × 2 inch passport photos onto an A4 sheet with precise trim guides.",
            ],
            children: [
              { level: 4, text: "Best for: passport and visa applications" },
            ],
          },
          {
            level: 3,
            text: "Passport photo template 4x6",
            link: { targetId: "T07", anchor: "passport photo template 4x6" },
            paragraphs: [
              "Place 2, 4, or 8 ID-sized photos onto a standard 4×6 inch sheet for inexpensive photo-lab printing.",
            ],
            children: [
              {
                level: 4,
                text: "Best for: photo-lab printing of passport photos",
              },
            ],
          },
          {
            level: 3,
            text: "Printable 4x6 photo template",
            link: { targetId: "T08", anchor: "printable 4x6 photo template" },
            paragraphs: [
              "Blank and multi-slot 4×6 photo grids including full-bleed single, 2-up, 4-up, and photo-plus-caption cards.",
            ],
            children: [{ level: 4, text: "Best for: photo-lab and kiosk orders" }],
          },
          {
            level: 3,
            text: "4x6 collage maker",
            link: { targetId: "T09", anchor: "4x6 collage maker" },
            paragraphs: [
              "Create 4×6 collages, 2×3 photo-booth strips with event captions, and multi-photo highlight cards.",
            ],
            children: [{ level: 4, text: "Best for: wedding and party prints" }],
          },
          {
            level: 3,
            text: "A4 collage maker",
            link: { targetId: "T10", anchor: "a4 collage maker" },
            paragraphs: [
              "Build full-page A4 photo collages with grids, mixed frame layouts, and poster titles.",
            ],
            children: [
              { level: 4, text: "Best for: school posters and projects" },
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Photo layout maker for printing: how to choose",
        paragraphs: [
          "Picking the right photo layout maker for printing comes down to three practical decisions: the paper loaded in your printer, how many photos belong on one sheet, and whether you plan to keep the sheet intact or cut the pictures apart.",
        ],
        children: [
          {
            level: 3,
            text: "By paper size",
            paragraphs: [
              "If you are printing on standard office A4 or US Letter paper at home, start with T01, T02, T03, T04, T06, or T10. If you are sending files to a drugstore photo kiosk or printing on a compact 4×6 dye-sub printer, use T07, T08, or T09 so your export matches 101.6 × 152.4 mm natively.",
            ],
          },
          {
            level: 3,
            text: "By number of photos",
            paragraphs: [
              "For exactly two photos, T02 gives clean 50/50 and 60/40 splits. For four photos, T03 locks a balanced 2×2 grid. For 6, 8, 9, or 10 photos—or mixed sizes—T01 handles any count cleanly.",
            ],
          },
          {
            level: 3,
            text: "By final use",
            paragraphs: [
              "Keep cut marks turned on whenever you plan to trim prints with a paper trimmer (passport sheets, wallet copies, mini prints). Turn borders white and keep a 5 mm outer margin when framing a full-page collage.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Photo printing guides and tutorials",
        paragraphs: [
          "Read our device-specific tutorials, size charts, and photo-paper comparisons below.",
        ],
        children: [
          {
            level: 3,
            text: "Start with the master guide",
            paragraphs: [
              "Begin with our comprehensive walkthrough covering resolutions, scaling settings, and printer dialogs across devices.",
            ],
            inlineLinks: [
              {
                targetId: "G01",
                anchor: "how to print multiple pictures on one page",
              },
              {
                targetId: "G02",
                anchor: "how to print a big picture on multiple pages",
              },
              { targetId: "G03", anchor: "photos a4 size" },
              {
                targetId: "G04",
                anchor: "print multiple 4x6 photos on one page",
              },
            ],
          },
          {
            level: 3,
            text: "App-specific tutorials",
            paragraphs: [
              "Prefer using built-in OS tools, mobile apps, or Adobe software? Follow our step-by-step tutorials and paper guides.",
            ],
            inlineLinks: [
              {
                targetId: "H01",
                anchor: "print multiple photos on one page windows 11",
              },
              {
                targetId: "H02",
                anchor: "how to print multiple pictures on one page from phone",
              },
              {
                targetId: "H03",
                anchor:
                  "how to print multiple images on one page in photoshop",
              },
              {
                targetId: "H04",
                anchor:
                  "how to print multiple pictures on one page epson iprint",
              },
              {
                targetId: "H12",
                anchor: "how to print multiple passport photos on one page",
              },
              { targetId: "H13", anchor: "print 4x6 photos at home" },
              {
                targetId: "B01",
                anchor: "software to print multiple photos on one page",
              },
              { targetId: "B06", anchor: "a4 inkjet photo paper" },
              { targetId: "CS02", anchor: "4x6 photo booth template" },
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Frequently asked questions",
        children: [
          {
            level: 3,
            text: "What is a photo layout maker?",
            paragraphs: [
              "A photo layout maker for printing arranges one or more digital photos into calibrated slots on a physical paper sheet (such as A4, Letter, or 4×6) and exports a PDF at exact scale.",
            ],
          },
          {
            level: 3,
            text: "Is it free to arrange photos for printing?",
            paragraphs: [
              "Yes. Every photo layout maker for printing on this site is 100% free with no account sign-up, page limit, or watermark.",
            ],
          },
          {
            level: 3,
            text: "Which tool is best for passport photos?",
            paragraphs: [
              "Choose the Passport Photo Sheet Maker if you are printing on A4 paper at home, or the Passport Photo Template 4x6 if you are ordering a 4×6 print from a local photo shop.",
            ],
          },
        ],
      },
    ],
  },

  "HB-BC": {
    id: "HB-BC",
    subtitle:
      "Browse every business card sheet maker, blank template, online card creator, visiting card designer, and home-printing tutorial.",
    introParagraphs: [
      "Choosing the right layout for business cards ensures crisp typography, accurate trim lines, and zero wasted card stock when printing at home or sending files to a copy shop. Here you can design a card online, impose an existing Canva or Photoshop export onto a 10-up sheet, or download blank printable sheets.",
      "Every tool lets you work with standard US 3.5 × 2 inch, metric 90 × 55 mm, and European 85 × 55 mm dimensions—including two-sided front-and-back PDF export and hairline crop marks.",
    ],
    sections: [
      {
        level: 2,
        text: "Tools in this collection",
        children: [
          {
            level: 3,
            text: "Print multiple business cards on one page",
            link: {
              targetId: "T11",
              anchor: "print multiple business cards on one page",
            },
            paragraphs: [
              "Upload an exported card image and tile 8 or 10 copies onto A4 or Letter with crop marks and double-sided support.",
            ],
            children: [
              {
                level: 4,
                text: "Best for: short runs for events and trade shows",
              },
            ],
          },
          {
            level: 3,
            text: "Printable business cards",
            link: { targetId: "T12", anchor: "printable business cards" },
            paragraphs: [
              "Generate blank cut-guide card sheets or clean minimal card PDFs ready for heavy matte card stock.",
            ],
            children: [{ level: 4, text: "Best for: free cards for new freelancers" }],
          },
          {
            level: 3,
            text: "Business card template",
            link: { targetId: "T13", anchor: "business card template" },
            paragraphs: [
              "Editable blank, plain-text, and logo-plus-QR templates formatted to standard regional dimensions.",
            ],
            children: [{ level: 4, text: "Best for: freelancers and consultants" }],
          },
          {
            level: 3,
            text: "Make business cards online",
            link: { targetId: "T14", anchor: "make business cards online" },
            paragraphs: [
              "Full online maker with modern minimal, classic framed, and bold accent-stripe presets plus front/back layout.",
            ],
            children: [
              { level: 4, text: "Best for: new businesses and startups" },
            ],
          },
          {
            level: 3,
            text: "Avery business card template",
            link: { targetId: "T15", anchor: "avery business card template" },
            paragraphs: [
              "Avery-compatible 8376-style Letter 10-up and A4 10-up perforated sheet layouts (independent, non-affiliated tool).",
            ],
            children: [
              { level: 4, text: "Best for: perforated card sheets at home" },
            ],
          },
          {
            level: 3,
            text: "Visiting card design template",
            link: { targetId: "T16", anchor: "visiting card design template" },
            paragraphs: [
              "Regional visiting card and name card designer featuring QR codes for digital profiles and portfolios.",
            ],
            children: [
              { level: 4, text: "Best for: professionals and consultants" },
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Business card design layout options",
        paragraphs: [
          "A balanced business card design layout guides the reader's eye from your name and role to the single fastest way to contact you. Avoid cramming every social handle onto a 90 × 55 mm rectangle.",
        ],
        children: [
          {
            level: 3,
            text: "Simple business card layout",
            paragraphs: [
              "A simple business card layout uses generous white space, one sans-serif or serif typeface in two weights, and a single accent colour such as dark charcoal paired with deep lime green.",
            ],
            children: [
              {
                level: 4,
                text: "Text-first and logo-first versions",
                paragraphs: [
                  "Choose text-first when your name and title are the primary brand, or logo-first when your business emblem sits opposite a clean contact block.",
                ],
              },
            ],
          },
          {
            level: 3,
            text: "Business card layout for printing",
            paragraphs: [
              "Any business card layout for printing needs predictable margins so a guillotine or rotary trimmer never clips letters.",
            ],
            children: [
              {
                level: 4,
                text: "Trim, bleed and safe zone",
                paragraphs: [
                  "Keep all text and QR codes at least 3 mm inside the trim line (the safe zone), and extend background fills 3 mm past the trim edge if you print edge-to-edge.",
                ],
              },
            ],
          },
          {
            level: 3,
            text: "Business card layout maker tools",
            paragraphs: [
              "Using a dedicated business card layout maker removes manual ruler math: the tool spaces 8 or 10 cards symmetrically on the sheet and adds subtle corner crop marks automatically.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Business card guides, how-tos and ideas",
        paragraphs: [
          "Explore size specifications, at-home printing tutorials, cost comparisons, and profession templates below.",
        ],
        children: [
          {
            level: 3,
            text: "Size, bleed and format",
            inlineLinks: [
              { targetId: "G05", anchor: "standard business card format" },
            ],
            paragraphs: [
              "Compare US 3.5 × 2 inch, metric 90 × 55 mm, and European 85 × 55 mm specs before you export.",
            ],
          },
          {
            level: 3,
            text: "Print at home",
            inlineLinks: [
              { targetId: "H07", anchor: "print business cards at home" },
              {
                targetId: "H08",
                anchor: "print double sided business cards at home",
              },
              {
                targetId: "H05",
                anchor: "how to print multiple business cards on one sheet canva",
              },
              {
                targetId: "H06",
                anchor:
                  "how to print multiple business cards on one sheet indesign",
              },
              { targetId: "B09", anchor: "home business card printer" },
              { targetId: "CS01", anchor: "home made business cards" },
              { targetId: "CS06", anchor: "avery place card template" },
            ],
            paragraphs: [
              "Step-by-step alignment workflows for home inkjets, Canva exports, InDesign imposition, and duplex printing.",
            ],
          },
          {
            level: 3,
            text: "Templates by profession",
            inlineLinks: [
              { targetId: "B07", anchor: "student business card template" },
              { targetId: "B08", anchor: "creative business card design ideas" },
            ],
            paragraphs: [
              "Browse layout ideas tailored for students, trades, real estate agents, bakeries, and minimalist creatives.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Frequently asked questions",
        children: [
          {
            level: 3,
            text: "What is the best layout for business cards?",
            paragraphs: [
              "The best layout for business cards places 10 cards (2 columns × 5 rows) on an A4 or Letter sheet for standard sizes, keeping at least a 3 mm inner safe margin for text and corner crop marks for clean cutting.",
            ],
          },
          {
            level: 3,
            text: "How do I print business cards from a template?",
            paragraphs: [
              "Pick a template tool above, enter your contact details or upload your finished card artwork, download the PDF, test one sheet on plain paper, and print onto 250–300 gsm card stock at 100% scale.",
            ],
          },
          {
            level: 3,
            text: "What size should my card layout be?",
            paragraphs: [
              "Use 3.5 × 2 inches (88.9 × 50.8 mm) in the US and Canada, 90 × 55 mm in Australia and India, or 85 × 55 mm across most of Europe and the UK.",
            ],
          },
        ],
      },
    ],
  },

  "HB-LS": {
    id: "HB-LS",
    subtitle:
      "Every label sheet maker, custom A4 grid template, round label tool, bulk address sheet, barcode generator, sticker sheet maker, and name tag builder.",
    introParagraphs: [
      "Use this label sticker sheet maker hub to build exact-size label grids and sticker sheets for home organisation, e-commerce shipping, retail barcodes, planner stickers, and events. Pick a tool below to configure your grid and download a print-ready PDF.",
      "Whether you are printing onto pre-cut A4 label sheets or cutting full-sheet sticker paper by hand, accurate row, column, margin, and gap settings prevent the downward alignment drift that ruins label sheets.",
    ],
    sections: [
      {
        level: 2,
        text: "Tools in this collection",
        children: [
          {
            level: 3,
            text: "Printable label maker",
            link: { targetId: "T17", anchor: "printable label maker" },
            paragraphs: [
              "Design rectangular or square labels with titles, subtitles, and borders and repeat them across A4 or Letter sheets.",
            ],
            children: [
              { level: 4, text: "Best for: home organising and storage" },
            ],
          },
          {
            level: 3,
            text: "A4 labels template",
            link: { targetId: "T18", anchor: "a4 labels template" },
            paragraphs: [
              "Enter custom rows, columns, margins, gaps, and label millimetres to match any unfamiliar pre-cut A4 label pack.",
            ],
            children: [
              { level: 4, text: "Best for: matching an unfamiliar label sheet" },
            ],
          },
          {
            level: 3,
            text: "Round labels for printer",
            link: { targetId: "T19", anchor: "round labels for printer" },
            paragraphs: [
              "Fill A4 or Letter sheets with 25 mm, 40 mm, 50 mm, or 60 mm circles for seals, jar lids, and product stickers.",
            ],
            children: [
              { level: 4, text: "Best for: jar lids and gift seals" },
            ],
          },
          {
            level: 3,
            text: "A4 address labels",
            link: { targetId: "T20", anchor: "a4 address labels" },
            paragraphs: [
              "Paste multiple recipient addresses to print a different address on every slot of a 14-up or 8-up A4 shipping sheet.",
            ],
            children: [
              { level: 4, text: "Best for: online sellers and etsy shops" },
            ],
          },
          {
            level: 3,
            text: "Barcode sticker A4 sheet",
            link: { targetId: "T21", anchor: "barcode sticker a4 sheet" },
            paragraphs: [
              "Generate scannable Code 128, EAN-13, or UPC-A barcode stickers with optional SKU names and prices on A4.",
            ],
            children: [
              { level: 4, text: "Best for: retail and shop inventory" },
            ],
          },
          {
            level: 3,
            text: "Sticker sheet maker online",
            link: { targetId: "T22", anchor: "sticker sheet maker online" },
            paragraphs: [
              "Upload multiple sticker images onto an A4 sticker sheet with optional cut outlines for scissors or cutting machines.",
            ],
            children: [
              { level: 4, text: "Best for: planner and journal stickers" },
            ],
          },
          {
            level: 3,
            text: "Free name tag maker",
            link: { targetId: "T23", anchor: "free name tag maker" },
            paragraphs: [
              "Paste attendee names and roles to generate a full sheet of adhesive or badge-insert name tags in seconds.",
            ],
            children: [
              { level: 4, text: "Best for: conferences and workshops" },
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Label sticker sheet maker: how to choose",
        paragraphs: [
          "Selecting the right label sticker sheet maker starts with matching your paper stock and printer type to the way the labels will be used.",
        ],
        children: [
          {
            level: 3,
            text: "Label paper versus sticker paper",
            paragraphs: [
              "Pre-cut label paper comes scored into exact rows and columns (like 2×7 or 3×8) so you peel each label straight off the backing. Full-sheet sticker paper has one unbroken adhesive surface, which is ideal for custom sticker shapes, round seals, and cutting machines.",
            ],
          },
          {
            level: 3,
            text: "Finishes and printers",
            paragraphs: [
              "Use matte uncoated sheets for crisp black barcodes and address text, glossy sticker paper for vibrant illustration colours, and printable vinyl when stickers need splash or oil resistance. Always confirm your sheet is rated for inkjet or laser before feeding it.",
            ],
          },
          {
            level: 3,
            text: "Grid size and sheet size",
            paragraphs: [
              "Measure an unknown label sheet with a metric ruler (top margin, left margin, label width, label height, and horizontal/vertical gaps) and enter those exact numbers into our A4 Labels Template.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Guides and how-tos",
        paragraphs: [
          "Learn how A4 sticker sizes, label paper coatings, Avery template codes, and bulk printing work together.",
        ],
        children: [
          {
            level: 3,
            text: "Print multiple labels or stickers on one page",
            inlineLinks: [
              { targetId: "G06", anchor: "sticker paper size a4" },
              { targetId: "G07", anchor: "label paper for printer" },
              { targetId: "H09", anchor: "how to print multiple labels on one page" },
              {
                targetId: "H10",
                anchor: "how do i print different address labels on one sheet",
              },
              {
                targetId: "H11",
                anchor: "how to print multiple stickers on one page",
              },
              { targetId: "B04", anchor: "glossy sticker paper a4" },
              { targetId: "B05", anchor: "cricut printable sticker paper" },
              { targetId: "B11", anchor: "custom sticker sheet printing" },
              { targetId: "B12", anchor: "a4 sticker paper officeworks" },
              { targetId: "CS05", anchor: "planner sticker sheet maker" },
            ],
            paragraphs: [
              "Guides covering A4 sticker finishes, vinyl print-then-cut workflows, retail buying options, and multi-label tutorials.",
            ],
          },
          {
            level: 3,
            text: "Avery template numbers",
            inlineLinks: [{ targetId: "G09", anchor: "avery template 28878" }],
            paragraphs: [
              "Decode common five-digit template numbers and match compatible non-brand label sheets without extra software.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Frequently asked questions",
        children: [
          {
            level: 3,
            text: "What is a label sticker sheet maker?",
            paragraphs: [
              "A label sticker sheet maker is a browser tool that lays out text, barcodes, names, or artwork across a grid matching physical label or sticker paper and exports a true-to-scale PDF.",
            ],
          },
          {
            level: 3,
            text: "Can I use any brand of label sheet?",
            paragraphs: [
              "Yes. Use our custom millimetre grid controls in the A4 Labels Template tool to match any pack of A4 or Letter labels regardless of brand.",
            ],
          },
          {
            level: 3,
            text: "How do I align labels?",
            paragraphs: [
              "Print one sheet onto plain office paper first, hold it behind your label sheet against a window, and adjust top or left margins by 1 mm if needed before printing on the real adhesive sheet.",
            ],
          },
        ],
      },
    ],
  },

  "HB-JB": {
    id: "HB-JB",
    subtitle:
      "Printable label makers, jar size charts, bottle-printer buying guides, and container templates for pantries, preserves, candles, and oils.",
    introParagraphs: [
      "Find printable label designs for jars, bottles, candles, and essential oil vials in minutes. Pick a container-specific tool below to size front labels, round lid circles, or full wrap-around bands and export a print-ready PDF.",
      "Curved glass and plastic containers need careful measurements and material choices—especially when labels face kitchen steam, fridge condensation, wax warmth, or essential oils. Use the size charts and checklists here alongside each maker.",
    ],
    sections: [
      {
        level: 2,
        text: "Tools in this collection",
        children: [
          {
            level: 3,
            text: "Jar label template",
            link: { targetId: "T24", anchor: "jar label template" },
            paragraphs: [
              "General-purpose jar front, round lid, and wrap-around label sheet maker with date and ingredient lines.",
            ],
            children: [
              { level: 4, text: "Best for: pantry organising and gifts" },
            ],
          },
          {
            level: 3,
            text: "Mason jar labels printable",
            link: { targetId: "T25", anchor: "mason jar labels printable" },
            paragraphs: [
              "Regular-mouth (60 mm) and wide-mouth (76 mm) lid labels plus canning body labels with batch and processing dates.",
            ],
            children: [
              { level: 4, text: "Best for: home canning and preserves" },
            ],
          },
          {
            level: 3,
            text: "Jam label template",
            link: { targetId: "T26", anchor: "jam label template" },
            paragraphs: [
              "Classic, minimal, and marmalade jar label makers with flavour, fruit notes, and best-before lines.",
            ],
            children: [{ level: 4, text: "Best for: homemade jam gifts" }],
          },
          {
            level: 3,
            text: "Spice labels printable",
            link: { targetId: "T27", anchor: "spice labels printable" },
            paragraphs: [
              "Pre-loaded A–Z spice list for round spice lids and rectangular fronts so you can label an entire rack in one print.",
            ],
            children: [
              { level: 4, text: "Best for: spice rack and drawer organising" },
            ],
          },
          {
            level: 3,
            text: "Candle label maker",
            link: { targetId: "T28", anchor: "candle label maker" },
            paragraphs: [
              "Front panel, wrap-around, and bottom burn-safety warning circle templates sized for candle jars and tins.",
            ],
            children: [
              { level: 4, text: "Best for: handmade candle sellers" },
            ],
          },
          {
            level: 3,
            text: "Bottle label maker",
            link: { targetId: "T29", anchor: "bottle label maker" },
            paragraphs: [
              "Glass bottle, full-wrap juice, and small sauce bottle templates with a built-in circumference wrap calculator.",
            ],
            children: [
              { level: 4, text: "Best for: homemade drinks and sauces" },
            ],
          },
          {
            level: 3,
            text: "Vial label printer",
            link: { targetId: "T30", anchor: "vial label printer" },
            paragraphs: [
              "Compact 5 ml, 10 ml, and 15 ml dropper vial and apothecary labels designed to keep tiny text legible.",
            ],
            children: [
              {
                level: 4,
                text: "Best for: essential oil and aromatherapy products",
              },
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Label designs for jars: how to make them fit",
        paragraphs: [
          "Even attractive label designs for jars look crooked or bubble up if the label height exceeds the straight wall of the glass. Follow three simple prep rules before printing your sheet.",
        ],
        children: [
          {
            level: 3,
            text: "Measure first",
            paragraphs: [
              "Measure only the flat, vertical section of the jar between the shoulder curve and bottom heel. For wrap-around labels, wrap a strip of paper around the container and subtract 3 to 4 mm so the seam does not overlap awkwardly.",
            ],
          },
          {
            level: 3,
            text: "Pick waterproof materials",
            paragraphs: [
              "Kitchen jars, chilled drink bottles, and essential oil droppers face moisture and oils. Choose waterproof matte vinyl or BOPP label stock so ink never runs.",
            ],
          },
          {
            level: 3,
            text: "Add dates and warnings",
            paragraphs: [
              "Include a canning date on home preserves, net weight and allergen info on food jars, and safety burn instructions on candles. Always check local labelling rules before selling products publicly.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Guides and ideas",
        paragraphs: [
          "Explore jar capacity charts, bottle printer hardware comparisons, Word tutorials, and real production workflows.",
        ],
        children: [
          {
            level: 3,
            text: "Jar label sizes",
            inlineLinks: [
              { targetId: "G10", anchor: "4 oz jar label template" },
              { targetId: "H14", anchor: "jar label template word" },
            ],
            paragraphs: [
              "Dimension reference for 2 oz, 4 oz, and 8 oz jars plus Microsoft Word table instructions.",
            ],
          },
          {
            level: 3,
            text: "Bottle label printers",
            inlineLinks: [
              { targetId: "G08", anchor: "bottle label printer" },
              { targetId: "B02", anchor: "best label printer for candles" },
              { targetId: "B03", anchor: "wine label printer" },
            ],
            paragraphs: [
              "Compare thermal, colour inkjet, and standard sheet printers for bottles, wine, beer, and candle jars.",
            ],
          },
          {
            level: 3,
            text: "Label ideas for pantry and gifts",
            inlineLinks: [
              { targetId: "B10", anchor: "candy jar labels template free" },
              { targetId: "CS03", anchor: "honey jar labels printable" },
              { targetId: "CS04", anchor: "candle jar label templates" },
            ],
            paragraphs: [
              "Inspiration for food jars, gift spreads, backyard honey batches, and small-batch candle workflows.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Frequently asked questions",
        children: [
          {
            level: 3,
            text: "What are the best label designs for jars?",
            paragraphs: [
              "Clean, high-contrast label designs for jars with a clear product name, thin border or header bar, and legible batch date look great on glass and remain easy to read in pantries or markets.",
            ],
          },
          {
            level: 3,
            text: "Do I need a special printer?",
            paragraphs: [
              "No. Standard home inkjet and laser printers handle A4 and Letter label sheets cleanly as long as you buy sheet paper matched to your printer type.",
            ],
          },
          {
            level: 3,
            text: "Are free label designs for jars safe to use for selling?",
            paragraphs: [
              "Yes, our templates and generated PDFs are free to use commercially, provided you verify and include all mandatory ingredient, weight, allergen, and safety disclosures required by your local rules.",
            ],
          },
        ],
      },
    ],
  },
};

