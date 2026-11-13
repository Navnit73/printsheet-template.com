import type { PageContent, PageId } from "@/types/spec";

export const GUIDES_CONTENT_1: Partial<Record<PageId, PageContent>> = {
  G01: {
    id: "G01",
    subtitle:
      "Every method, resolution check, layout formula, and print-dialog setting explained clearly for printing several pictures per sheet.",
    breadcrumbAnchor: "photo layout maker for printing",
    introParagraphs: [
      "Knowing how to print multiple pictures on one page saves paper, lowers photo-paper costs, and produces neat matching prints on any home inkjet or laser printer. Whether you want two 4×6 snapshots on one A4 sheet, four matching greeting inserts, or a nine-tile contact sheet from a laptop or phone, the layout step always comes before clicking Print.",
      "This complete pillar guide walks through all three practical workflows—browser photo sheet makers, built-in computer dialogs, and mobile apps—plus exact 300 DPI pixel formulas, scaling traps, and paper choices so you never waste glossy sheets on clipped faces or blurry crops.",
    ],
    sections: [
      {
        level: 2,
        text: "How to print multiple photos on one page: the three main methods",
        paragraphs: [
          "Before picking settings, decide whether you need exact millimetre sizes or quick casual thumbnails. Every way to learn how to print multiple photos on one page falls into one of three reliable workflows below.",
        ],
        table: {
          headers: ["Method", "Best For", "Exact Sizes?", "Works Offline / Zero Install"],
          rows: [
            ["Browser photo sheet maker", "Exact 4×6, wallet, passport & mixed tiles", "Yes (millimetre PDF)", "Yes (any modern browser)"],
            ["OS print dialog (Windows / macOS)", "Fast contact sheets & 2/4-up prints", "Limited presets only", "Built into OS"],
            ["Phone or printer-brand app", "Direct wireless camera-roll prints", "Basic grid choices", "Requires vendor app"],
          ],
        },
        children: [
          {
            level: 3,
            text: "Use an online photo sheet maker",
            paragraphs: [
              "When you need predictable margins, custom cell counts (for example three rows of two, or mixed portrait and landscape frames), or a reusable file you can take to a local copy shop, a dedicated browser layout builder is the fastest option.",
              "You upload images from disk or phone gallery, lock A4 or US Letter orientation, pick Cover (trim to fill) or Contain (keep entire frame intact), toggle faint trim lines, and export a 100%-scale vector PDF.",
            ],
            children: [
              {
                level: 4,
                text: "Best when you want exact sizes and a PDF",
                paragraphs: [
                  "Built-in operating system print dialogs quietly rescale cells based on hidden printer driver margins. Generating a locked PDF first guarantees two printers on two continents produce identical physical print dimensions.",
                ],
              },
            ],
          },
          {
            level: 3,
            text: "Use the built-in print dialog on your computer",
            paragraphs: [
              "Windows 11 File Explorer and macOS Preview both offer quick multi-picture grid options without opening any editor. They work well when casual spacing is fine and all source photos share roughly the same orientation.",
            ],
            children: [
              {
                level: 4,
                text: "Photos app and picture print layouts",
                paragraphs: [
                  "In Windows Print Pictures you pick Contact Sheet (35), Wallet (9), 4×6 (2 per Letter/A4), or 5×7 (2 per sheet). Beware the checked 'Fit picture to frame' box, which aggressively crops portraits unless unchecked.",
                ],
              },
            ],
          },
          {
            level: 3,
            text: "Use a phone or printer app",
            paragraphs: [
              "iOS Share Sheet Print allows basic single-photo printing via AirPrint, while brand apps such as Canon PRINT, HP Smart, and Epson iPrint add simple 2-up and 4-up collage grids on Wi-Fi.",
            ],
            children: [
              {
                level: 4,
                text: "Printer-brand apps and AirPrint",
                paragraphs: [
                  "Mobile printer apps compress large raw photos aggressively before wireless transfer—good enough for quick 4×6 snapshots, less reliable when printing crisp 300 DPI keepsakes or text collages.",
                ],
              },
            ],
          },
        ],
      },
      {
        level: 2,
        text: "How do I print multiple pictures on one page without losing quality?",
        paragraphs: [
          "The most common question beginners ask—how do i print multiple pictures on one page without soft faces or pixelated textures—comes down to three technical checks: source pixels per inch, disabled print-driver shrink, and matching paper coating.",
        ],
        children: [
          {
            level: 3,
            text: "Match picture size to print size",
            paragraphs: [
              "Every digital image has a fixed width and height in pixels. Printing a 600 × 800 px messaging-app thumbnail at half-A4 size stretches sparse pixels across inches of coated paper.",
            ],
            children: [
              {
                level: 4,
                text: "Pixels needed for 300 DPI",
                paragraphs: [
                  "Multiply target print inches by 300 to find ideal pixels. A 4×6 in (102 × 152 mm) print shines at 1,200 × 1,800 px; a 5×7 in slot needs 1,500 × 2,100 px; wallet 2.5×3.5 in tiles stay razor-sharp even from 750 × 1,050 px smartphone crops.",
                ],
              },
            ],
          },
          {
            level: 3,
            text: "Turn off scaling and borderless crop",
            paragraphs: [
              "In your PDF viewer print box, always select 'Actual Size' or '100% Scale'. Avoid 'Fit to Printable Area' whenever layout grids rely on exact inch or millimetre sizing, and keep 'Borderless' off unless artwork intentionally bleeds past sheet edges—borderless drivers expand pages by 2–4% and clip outer photo frames.",
            ],
          },
          {
            level: 3,
            text: "Choose the right paper and print quality",
            paragraphs: [
              "Switch the media type dropdown from 'Plain Paper' to 'Photo Matte', 'Premium Glossy', or 'Semi-Gloss/Satin' before hitting Print. Setting Media Type instructs an inkjet head to meter finer ink droplets cleanly into microporous resin coatings rather than flooding pulp fibres.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Layouts for printing several pictures on one page",
        paragraphs: [
          "Choosing the right cell grid avoids awkward wide white strips and minimises trimming time with scissors or a rotary cutter. Use our interactive photo builders like our 2-up layout maker when deciding",
        ],
        inlineLinks: [{ targetId: "T02", anchor: "how to print 2 pictures on one page" }],
        table: {
          headers: ["Grid / Pictures per Sheet", "Approx. Cell Size on A4", "Best Practical Use"],
          rows: [
            ["2-up Landscape", "138 × 198 mm (or two 4×6 in)", "Full 4R/4×6 prints, half-page recipes, travel cards"],
            ["4-up (2 × 2)", "95 × 138 mm (approx. 3.7 × 5.4 in)", "Greeting inserts, scrapbook tiles, comparison sheets"],
            ["6-up (2 × 3)", "90 × 90 mm or 88 × 92 mm", "Square Instagram tiles, product catalogue thumbnails"],
            ["9-up (3 × 3)", "60 × 90 mm (approx. 2.4 × 3.5 in)", "Wallet photos, student IDs, craft swap cards"],
            ["16-up to 24-up", "45 × 65 mm / 35 × 45 mm", "Contact proofs, passport/visa grids, inventory tags"],
          ],
        },
        children: [
          {
            level: 3,
            text: "2, 4 and 6 picture layouts",
            paragraphs: [
              "Even symmetric grids print and cut cleanly in straight continuous trimmer passes across an A4 or Letter sheet.",
            ],
            children: [
              {
                level: 4,
                text: "Two pictures on one page",
                paragraphs: [
                  "Rotating A4 to landscape lets two vertical 4×6 in (102 × 152 mm) snapshots sit side by side cleanly, or hold two full-width A5 prints per sheet with a single centre slice.",
                ],
              },
              {
                level: 4,
                text: "Four pictures on one page",
                paragraphs: [
                  "A 2×2 grid matches standard portrait A4 proportions (1:1.414) almost identically inside each quadrant, so rectangular DSLR and phone camera shots need minimal cropping.",
                ],
              },
            ],
          },
          {
            level: 3,
            text: "Mixed-size and different-photo layouts",
            paragraphs: [
              "Collage and memory-board sheets combine one hero 5×7 frame alongside two or three smaller portrait tiles. To prevent stretching, use 'Contain' fit mode if ratios vary wildly between vertical phones and horizontal cameras, or unify orientation per sheet.",
            ],
          },
          {
            level: 3,
            text: "Passport, wallet and 4x6 sheets",
            paragraphs: [
              "When printing visa/ID sets or classic pocket wallet prints, standardising on dedicated fixed-millimetre grids guarantees compliant head height (e.g. 35 × 45 mm or 2 × 2 in) while packing 6 to 12 duplicates onto a single affordable photo sheet.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "How to print more than one photo on a page for specific tools",
        paragraphs: [
          "Sometimes you are forced to work inside existing studio or office software—here is how each environment handles how to print more than one photo on a page cleanly.",
        ],
        children: [
          {
            level: 3,
            text: "Windows 11 and the Photos app",
            paragraphs: [
              "Select multiple images inside File Explorer (Ctrl+Click), press Ctrl+P to open the classic Print Pictures wizard, choose 4×6 (2), Wallet (9), or Contact Sheet (35), and verify paper size matches the tray.",
            ],
          },
          {
            level: 3,
            text: "Photoshop and Lightroom",
            paragraphs: [
              "Photoshop uses File -> Automate -> Contact Sheet II (or manual canvas guides) to build exact 300 DPI multi-image documents, whereas Lightroom's dedicated Print module Picture Package / Custom Package handles repeatable templates in seconds.",
            ],
          },
          {
            level: 3,
            text: "Phone and Epson iPrint",
            paragraphs: [
              "On iOS and Android, wireless utility apps let you tap 2-up or 4-up frames on 4×6 or A4 glossy sheets—just double-check paper size detection so A4 isn't accidentally printed as Letter.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Common mistakes when printing many pictures on one page",
        paragraphs: [
          "Troubleshooting why sheets fail when learning how to print many pictures on one page nearly always traces back to one of three avoidable glitches.",
        ],
        children: [
          {
            level: 3,
            text: "Blurry or stretched pictures",
            paragraphs: [
              "Saving thumbnails straight out of chat apps strips resolution below 150 DPI. Always pull original full-resolution files from cloud backup or camera storage, and maintain locked aspect ratios instead of dragging corner handles unevenly.",
            ],
          },
          {
            level: 3,
            text: "Pictures cropped at the edges",
            paragraphs: [
              "Most cameras capture 4:3 or 16:9 photos while print cells use 3:2 (4×6) or 1:1.41 (A4). Preview every cell before exporting and check whether heads or chins sit right against a trim border.",
            ],
          },
          {
            level: 3,
            text: "Uneven spacing and margins",
            paragraphs: [
              "Unadjusted printers have narrower top grip margins than bottom trail margins. Turning off 'Scale to Fit' and setting symmetrical 8–10 mm outer margins inside a PDF grid keeps white borders crisp.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Frequently asked questions",
        paragraphs: [
          "Quick troubleshooting answers covering how to print multiple images on one page and how to print multiple images in one page workflows.",
        ],
        children: [
          {
            level: 3,
            text: "Can I print multiple photos on one page for free?",
            paragraphs: [
              "Yes. Print Sheet Maker arranges multiple pictures onto A4, Letter, or 4×6 PDF sheets directly inside your browser at zero cost, with no account, watermark, or upload queue—handling how to print multiple pictures on one page reliably across any OS.",
            ],
          },
          {
            level: 3,
            text: "How many pictures can I print on one A4 page?",
            paragraphs: [
              "On one A4 sheet (210 × 297 mm) you can fit two 4×6 in (4R) prints, four crisp 95 × 135 mm quarter-sheet cards, nine wallet prints, or twelve to twenty 35 × 45 mm ID photos.",
            ],
          },
          {
            level: 3,
            text: "Why does my printer shrink or crop my pictures?",
            paragraphs: [
              "Your print dialog likely defaults either to 'Fit to Page' (shrinking grids unpredictably) or 'Fill Frame / Borderless' (zooming artwork outward so edge subjects clip off).",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Related tools and guides",
        paragraphs: [
          "Put this guide into practice immediately with our browser sheet generators or platform-specific tutorials.",
        ],
        inlineLinks: [{ targetId: "HB-PH", anchor: "photo layout maker for printing" }],
        children: [
          {
            level: 3,
            text: "Arrange photos for printing",
            link: { targetId: "T01", anchor: "a4 page photo" },
            paragraphs: [
              "Launch the flexible multi-grid sheet maker to combine up to 24 images onto one A4 or US Letter PDF.",
            ],
          },
          {
            level: 3,
            text: "Print 4 photos on one page",
            link: { targetId: "T03", anchor: "how to print 4 images on one page" },
            paragraphs: [
              "Drop four portraits or landscapes into a balanced 2×2 quadrant sheet ready for one horizontal and one vertical slice.",
            ],
          },
          {
            level: 3,
            text: "Print multiple photos on one page Windows 11",
            link: { targetId: "H01", anchor: "how to print multiple pictures on one page from laptop" },
            paragraphs: [
              "Walk through Windows 11 Print Pictures and browser-PDF fixes when built-in dialogs misbehave.",
            ],
          },
        ],
      },
    ],
    relatedLinks: [
      { targetId: "HB-PH", anchor: "photo layout maker for printing", summary: "Browse all 10 photo sheet tools and guides." },
      { targetId: "T01", anchor: "a4 page photo", summary: "Arrange custom multi-photo sheets in your browser." },
      { targetId: "T02", anchor: "how to print 2 pictures on one page", summary: "Create crisp two-photo sheets on A4 or Letter." },
      { targetId: "T03", anchor: "how to print 4 images on one page", summary: "Generate balanced 2×2 four-photo sheets." },
      { targetId: "H01", anchor: "how to print multiple pictures on one page from laptop", summary: "Step-by-step Windows 11 photo printing instructions." },
    ],
    faqs: [
      {
        question: "Can I print multiple photos on one page for free?",
        answer:
          "Yes. Print Sheet Maker lets you arrange 2, 4, 6, 9, or custom grids onto A4, Letter, or 4×6 PDFs directly in your browser free with zero watermarks or sign-up.",
      },
      {
        question: "How many pictures can I print on one A4 page?",
        answer:
          "One A4 sheet holds two 4×6 in (4R) prints, four quarter-page photos, nine pocket wallet shots, or twelve to twenty standard 35 × 45 mm ID/passport portraits.",
      },
      {
        question: "Why does my printer shrink or crop my pictures?",
        answer:
          "Shrinking comes from Fit-to-Page driver scaling; edge cropping occurs when Fit/Fill Photo to Frame zooms a 4:3 smartphone image to fill a narrow 3:2 rectangle.",
      },
    ],
  },

  G02: {
    id: "G02",
    subtitle:
      "Split oversized artwork, classroom maps, sewing patterns, and wall photography across tiled A4 or US Letter pages cleanly.",
    breadcrumbAnchor: "photo layout maker for printing",
    introParagraphs: [
      "Learning how to print a big picture on multiple pages turns any ordinary home inkjet or office laser printer into a poster workshop. Instead of paying print-shop wide-format rates for temporary birthday banners, science fair displays, or craft patterns, you simply slice one high-resolution image into overlapping A4 or US Letter tiles and tape the seams cleanly together.",
      "This complete poster printing guide covers splitting math, glue-tab overlap widths, minimum DPI rules for A2/A1/A0 wall sizes, and paper weights that lie flat instead of curling after assembly.",
    ],
    sections: [
      {
        level: 2,
        text: "How to print a big picture on multiple pages: the quick method",
        paragraphs: [
          "The cleanest approach when figuring out how to print a big picture on multiple pages follows three repeatable stages: calculate sheet rows and columns, reserve an overlap strip, and trim precisely along crop ticks.",
        ],
        children: [
          {
            level: 3,
            text: "Split the image into a grid of tiles",
            paragraphs: [
              "Choose how many sheets wide by how many sheets tall your final poster should span—for example 2×2 (4 pages ≈ A2), 3×3 (9 pages ≈ A1), or 4×4 (16 pages for bold corridor banners).",
            ],
          },
          {
            level: 3,
            text: "Add overlap and crop marks",
            paragraphs: [
              "Every home printer leaves a ~5 mm unprintable border on normal plain paper. Setting an 8–12 mm tile overlap plus tiny corner crop ticks gives you a crisp gluing flap and exact alignment target so you never have white printer-margin stripes breaking the artwork.",
            ],
          },
          {
            level: 3,
            text: "Print and tape the pages together",
            paragraphs: [
              "Trim only one overlapping edge (say the left edge of Column 2, and top edge of Row 2), apply acid-free glue stick or double-sided runner tape onto the covered tab underneath, and burnish flat from the rear with archival drafting or clear tape.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "How to print one image on multiple pages in common programs",
        paragraphs: [
          "Here is how different free and desktop tools solve how to print one image on multiple pages, how to print a picture in multiple pages, and how to print a picture on multiple pages cleanly.",
        ],
        children: [
          {
            level: 3,
            text: "Use a poster splitter tool",
            paragraphs: [
              "Dedicated browser poster splitters handle the pixel cropping math, overlap margins, page-numbering labels, and multi-page PDF creation in under ten seconds.",
            ],
            children: [
              {
                level: 4,
                text: "Fastest method for most people",
                paragraphs: [
                  "No software install or manual canvas slices: pick rows × columns, preview exact split seams right over your photo, and download one ready-to-print multi-page PDF.",
                ],
              },
            ],
          },
          {
            level: 3,
            text: "Use your printer's poster option",
            paragraphs: [
              "Adobe Acrobat Reader's built-in Print -> Poster option (and select Canon/Epson Windows driver utilities) can enlarge single PDFs by 200% or 300% onto tiled sheets with Cut Marks enabled.",
            ],
            children: [
              {
                level: 4,
                text: "Windows and macOS print dialogs",
                paragraphs: [
                  "Windows users often find 'Poster' inside proprietary manufacturer dialogs (Epson/Brother), whereas macOS native Preview lacks built-in multi-page poster tiling unless exported via a multi-page PDF splitter first.",
                ],
              },
            ],
          },
          {
            level: 3,
            text: "Use Word, PowerPoint or Photoshop tiling",
            paragraphs: [
              "Microsoft Excel and Publisher offer rudimentary multi-page grid scaling, while Photoshop requires slicing guides manually and exporting individual crops.",
            ],
            children: [
              {
                level: 4,
                text: "Tile page by page",
                paragraphs: [
                  "Manual slicing works when adjusting colour shifts per tile, yet takes ten times longer than generating an automatic tiled PDF when figuring out how to print picture in multiple pages.",
                ],
              },
            ],
          },
        ],
      },
      {
        level: 2,
        text: "How to print a picture larger than one page at the right size",
        paragraphs: [
          "To master how to print a picture larger than one page without muddy blocky squares, pair real-world viewing distance with honest source pixel counts.",
        ],
        table: {
          headers: ["Target Poster Size", "Approx. A4 Grid", "Finished Dimensions", "Recommended Min Source Pixels"],
          rows: [
            ["2 × 2 Grid (Approx. A2)", "4 sheets portrait", "~380 × 550 mm (15 × 22 in)", "1,800 × 2,600 px"],
            ["3 × 3 Grid (Approx. A1)", "9 sheets portrait", "~570 × 825 mm (22 × 32 in)", "2,500 × 3,600 px"],
            ["4 × 4 Grid (Approx. A0)", "16 sheets portrait", "~760 × 1,100 mm (30 × 43 in)", "3,200 × 4,500 px"],
          ],
        },
        children: [
          {
            level: 3,
            text: "Pick a final poster size",
            paragraphs: [
              "Always subtract 10–15 mm per internal seam from raw sheet multiples when calculating finished wall width.",
            ],
            children: [
              {
                level: 4,
                text: "Common sizes: A2, A1 and A0",
                paragraphs: [
                  "Notice ISO A-series geometry: two A4 sheets taped side-by-side equal A3, four sheets form A2 (with trim loss), and eight to nine sheets build an A1 bedroom poster.",
                ],
              },
            ],
          },
          {
            level: 3,
            text: "Check resolution before you split",
            paragraphs: [
              "Wall posters are read from three to six feet away, so they tolerate lower effective PPI than hand-held album prints.",
            ],
            children: [
              {
                level: 4,
                text: "Minimum DPI for wall posters",
                paragraphs: [
                  "Aim for 150 DPI at finished wall scale for crisp lettering and charts, or at least 100–120 DPI for scenic wall photography viewed across a room.",
                ],
              },
            ],
          },
          {
            level: 3,
            text: "Choose paper that holds tape and ink",
            paragraphs: [
              "Standard 80 gsm copy paper ripples heavily under full-coverage dark ink photos and tears cleanly during trimming. Stepping up to 120–170 gsm heavyweight matte presentation paper costs pennies per sheet yet lies dramatically flatter on foam board.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Assembling a multi-page poster neatly",
        paragraphs: [
          "The cleanest print ruins itself if assembled haphazardly—take five quiet minutes at a kitchen table for seamless seams.",
        ],
        children: [
          {
            level: 3,
            text: "Trim or fold the overlap edges",
            paragraphs: [
              "Use a metal safety ruler and sharp craft knife—or a rotary bypass trimmer—to slice straight along the printed overlap crop marks on the overlapping edge of each right and bottom neighbour sheet.",
            ],
          },
          {
            level: 3,
            text: "Number the sheets and align the grid",
            paragraphs: [
              "Write light pencil coordinates (Row 1 Col 1, Row 1 Col 2...) on the blank back before shuffling trimmed sheets. Lay the entire grid dry first, aligning internal lines such as horizons or text baselines before applying adhesive.",
            ],
          },
          {
            level: 3,
            text: "Mount the poster on a wall or board",
            paragraphs: [
              "Dry-fit tiles Row by Row into wide horizontal strips first, then unite horizontal strips together over a flat sheet of A1/A2 foam core for rigid tabletop displays or locker walls.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Troubleshooting multi-page picture printing",
        paragraphs: [
          "Avoid re-printing 9 sheets by checking ink levels and scaling lock before firing the whole job.",
        ],
        children: [
          {
            level: 3,
            text: "Pages do not line up",
            paragraphs: [
              "Check that 'Fit to Page' wasn't left checked on page 1 or that paper guides inside the printer tray aren't loose—skewed trays twist diagonals across seams.",
            ],
          },
          {
            level: 3,
            text: "Colours differ between sheets",
            paragraphs: [
              "Always disable printer 'Auto Colour Enhance' on individual pages and print consecutive sheets in one uninterrupted run with full ink cartridges so nozzles never starve mid-poster.",
            ],
          },
          {
            level: 3,
            text: "Edges are cut off",
            paragraphs: [
              "Keep a non-zero overlap margin (8–10 mm) in your poster splitter so unprintable hardware margins stay outside the final trimmed artwork.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Frequently asked questions",
        paragraphs: [
          "Answers to common questions about how do i print a big picture on multiple pages and how do i print a large image on multiple pages.",
        ],
        children: [
          {
            level: 3,
            text: "How do I print one photo on 4 pages?",
            paragraphs: [
              "For anyone asking how to print 1 photo on 4 pages or how to print 1 image on multiple pages, open our Poster Splitter tool, upload your high-res file, set Grid to 2×2 (A4 or Letter), keep Overlap enabled at 10 mm, and download the 4-page PDF.",
            ],
          },
          {
            level: 3,
            text: "Is it free to print a big picture on multiple pages?",
            paragraphs: [
              "Yes. Using Print Sheet Maker's browser poster splitter costs nothing—you only supply regular A4 or US Letter paper and printer ink.",
            ],
          },
          {
            level: 3,
            text: "How many sheets do I need for an A1 poster?",
            paragraphs: [
              "Standard ISO geometry uses 8 sheets of A4 mathematically, though once you reserve internal glue-overlap tabs on a regular home printer, a 3×3 (9-sheet) grid safely delivers full ~57 × 82 cm A1 wall impact.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Related tools and guides",
        paragraphs: [
          "Open our free poster tool to slice an image immediately, or review exact A4 pixel charts before enlarging.",
        ],
        inlineLinks: [{ targetId: "HB-PH", anchor: "photo layout maker for printing" }],
        children: [
          {
            level: 3,
            text: "Print big picture on multiple pages",
            link: { targetId: "T05", anchor: "print large picture multiple pages" },
            paragraphs: [
              "Split any JPEG or PNG across 2×2, 3×3, or custom A4/Letter grids with crop guides and overlap control.",
            ],
          },
          {
            level: 3,
            text: "Arrange photos for printing",
            link: { targetId: "T01", anchor: "a4 page photo" },
            paragraphs: [
              "Switch to multi-picture packing when fitting several photos onto a single page instead.",
            ],
          },
          {
            level: 3,
            text: "Photos A4 size",
            link: { targetId: "G03", anchor: "prints a4 size" },
            paragraphs: [
              "Check pixels per inch, A4 vs Letter dimensions, and aspect ratios.",
            ],
          },
        ],
      },
    ],
    relatedLinks: [
      { targetId: "HB-PH", anchor: "photo layout maker for printing", summary: "Browse all photo layout tools and guides." },
      { targetId: "T05", anchor: "print large picture multiple pages", summary: "Use our free browser poster splitter tool." },
      { targetId: "T01", anchor: "a4 page photo", summary: "Arrange multiple photos cleanly on one A4 page." },
      { targetId: "G03", anchor: "prints a4 size", summary: "Reference exact A4 pixel, millimetre, and inch sizes." },
    ],
    faqs: [
      {
        question: "How do I print one photo on 4 pages?",
        answer:
          "Upload your photo into the Poster Splitter tool, select a 2×2 page grid (4 pages), keep a 10 mm overlap and crop marks turned on, export the 4-page PDF, print at 100% scale, and trim the overlap seams.",
      },
      {
        question: "Is it free to print a big picture on multiple pages?",
        answer:
          "Yes. Splitting an image into a tiled multi-page PDF in our browser tool is 100% free with no account or watermarks.",
      },
      {
        question: "How many sheets do I need for an A1 poster?",
        answer:
          "A 3×3 grid (9 A4 sheets) accounts nicely for home printer margins and glue tabs while producing a full A1-class wall poster.",
      },
    ],
  },

  G03: {
    id: "G03",
    subtitle:
      "Exact A4 measurements in millimetres, inches, and pixels across 72, 150, and 300 DPI—plus how standard photo prints pack onto A4 sheets.",
    breadcrumbAnchor: "photo layout maker for printing",
    introParagraphs: [
      "Understanding exact photos a4 size dimensions eliminates cropped heads, soft pixels, and surprise white borders when preparing school projects, portfolios, or lab orders. An ISO A4 sheet always measures precisely 210 × 297 millimetres (8.27 × 11.69 inches), yet the pixel count you need depends on printer DPI and how many prints a4 size share the page.",
      "Below you will find complete millimetre, inch, and pixel conversion charts for a4 sheet size image files, packing counts for 4×6, 5×7, and passport portraits, plus realistic home ink and paper cost estimates.",
    ],
    sections: [
      {
        level: 2,
        text: "A4 paper size in millimetres, inches and pixels",
        paragraphs: [
          "Digital files have no physical size until mapped to Dots Per Inch (DPI). Every calculator below turns raw dimensions for an a4 paper image size or a4 paper size image into concrete pixel targets.",
        ],
        table: {
          headers: ["DPI Setting", "Portrait A4 (Pixels)", "Landscape A4 (Pixels)", "Typical Use"],
          rows: [
            ["72 DPI", "595 × 842 px", "842 × 595 px", "Web previews & email thumbnails (too blurry to print)"],
            ["150 DPI", "1,240 × 1,754 px", "1,754 × 1,240 px", "Plain-paper drafts, classroom posters, quick handouts"],
            ["300 DPI", "2,480 × 3,508 px", "3,508 × 2,480 px", "Lab-sharp full-sheet photos a4 size & archival prints"],
            ["600 DPI", "4,960 × 7,016 px", "7,016 × 4,960 px", "Micro-typography, line art, fine engraving scans"],
          ],
        },
        children: [
          {
            level: 3,
            text: "A4 dimensions at 72, 150 and 300 DPI",
            paragraphs: [
              "For full-page borderless prints a4 size quality, target 2,480 × 3,508 pixels (about 8.7 megapixels). Older 12 MP smartphone cameras capture 3,024 × 4,032 px—more than enough crisp detail for full A4 glossy prints.",
            ],
            children: [
              {
                level: 4,
                text: "Pixels for web, draft and photo prints",
                paragraphs: [
                  "Never upscale a small 800 px web screenshot up to 3,508 px expecting sharpness—inventing pixels only softens edges. Instead, print smaller 4-up or 6-up tiles when only low-res photos a4 size assets are available.",
                ],
              },
            ],
          },
          {
            level: 3,
            text: "A4 versus Letter paper",
            paragraphs: [
              "Outside North America, ISO A4 is universal for both copy paper and inkjet photo packs; North American stationery aisles stock US Letter instead.",
            ],
            children: [
              {
                level: 4,
                text: "Letter is 216 x 279 mm",
                paragraphs: [
                  "US Letter (8.5 × 11 in) is 6 mm wider yet 18 mm shorter than A4 (210 × 297 mm). Downloading an a4 paper size photo template and printing onto US Letter clips the bottom 18 mm unless paper settings match.",
                ],
              },
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Photo size in A4 paper: how many standard prints fit",
        paragraphs: [
          "Rather than dedicating an entire costly sheet to one snapshot, planning photo size in a4 paper lets you slice multiple standard keepsakes cleanly from a single 210 × 297 mm page.",
        ],
        table: {
          headers: ["Standard Print Size", "Dimensions (mm / in)", "Fits Per A4 Sheet", "Waste / Margin Notes"],
          rows: [
            ["4×6 in (4R)", "102 × 152 mm", "2 prints (Landscape A4)", "Leaves slim ~6 mm border on A4 edges"],
            ["5×7 in (5R)", "127 × 178 mm", "2 prints (tight margin)", "Needs borderless or 125 × 175 mm slight trim"],
            ["Wallet (2.5×3.5 in)", "63.5 × 88.9 mm", "9 prints (3 × 3 grid)", "Clean fit inside standard 5 mm printer margins"],
            ["Square 90×90 mm", "90 × 90 mm", "6 prints (2 × 3 grid)", "Easy grid for social-media printouts"],
            ["Passport (UK/EU/AU)", "35 × 45 mm", "16–20 prints", "Plenty of white cut gutters for straight scissors"],
          ],
        },
        children: [
          {
            level: 3,
            text: "4x6 and 5x7 photos on A4",
            paragraphs: [
              "Two 4×6 in (102 × 152 mm) snapshots pack comfortably side by side on landscape A4 (297 mm wide easily holds 102 + 102 = 204 mm?Wait: rotated so each 152 mm height sits along 210 mm height, two 102 mm widths = 204 mm inside 297 mm width—actually 204 mm wide leaves massive margin, or stacked vertically inside portrait A4: 2 × 152 mm = 304 mm doesn't fit!). Always orient two 4×6s vertically side-by-side along landscape 297 mm width (102 × 2 = 204 mm width, 152 mm height <= 210 mm)!",
            ],
          },
          {
            level: 3,
            text: "Passport and wallet photos on A4",
            paragraphs: [
              "Packing 9 wallet keepsakes or 16–20 ID shots onto one a4 size photo sheet drops per-photo printing expense down to fractions of a penny.",
            ],
            children: [
              {
                level: 4,
                text: "35x45 mm passport size",
                paragraphs: [
                  "Official UK, EU, Australian, and Indian passport rules stipulate 35 × 45 mm framing (US uses 2 × 2 in / 51 × 51 mm). Always confirm head-height rules with your local passport authority before mailing home-cut copies.",
                ],
              },
            ],
          },
          {
            level: 3,
            text: "Square and panoramic photos on A4",
            paragraphs: [
              "Six 90 × 90 mm square frames fit effortlessly in a 2×3 portrait A4 grid without uneven leftovers.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Image size A4 paper: what resolution do you need?",
        paragraphs: [
          "Picking the right image size a4 paper starts with comparing camera sensor aspect ratio against ISO A-series sheet geometry so faces aren't chopped.",
        ],
        children: [
          {
            level: 3,
            text: "Minimum pixel size for a sharp A4 photo",
            paragraphs: [
              "While 2,480 × 3,508 px delivers strict 300 DPI for full prints a4 size work, everyday portraits down to 1,800 × 2,500 px (~215 DPI) still render remarkably clean at arm's length on semi-gloss paper.",
            ],
          },
          {
            level: 3,
            text: "Resizing and cropping a photo to A4",
            paragraphs: [
              "An a4 sheet size image ratio differs slightly from most DSLR (3:2) and smartphone (4:3) captures, meaning borderless edge-to-edge fills crop narrow strips along either the long or short side.",
            ],
            children: [
              {
                level: 4,
                text: "Aspect ratio 1:1.414",
                paragraphs: [
                  "ISO A4 holds a mathematical 1:√2 (1:1.414) ratio—meaning a 4:3 (1:1.333) phone photo loses ~5% off the top/bottom when cropped to A4, while a 3:2 (1:1.5) camera shot trims ~6% off the left/right edges.",
                ],
              },
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Cost of A4 size photo print and print options",
        paragraphs: [
          "Evaluating the true a4 size photo print cost / cost of a4 size photo print helps balance DIY home convenience against commercial kiosks.",
        ],
        children: [
          {
            level: 3,
            text: "Print at home",
            paragraphs: [
              "Home refillable ink-tank printers (Epson EcoTank / Canon MegaTank) cut ink costs dramatically compared to tiny 5 ml cartridge models, making multi-photo A4 sheets far cheaper than high-street booths.",
            ],
            children: [
              {
                level: 4,
                text: "Paper and ink cost per sheet",
                paragraphs: [
                  "Decent 200–250 gsm resin-coated A4 photo paper typically costs \$0.20–\$0.45 per sheet in bulk packs; tank ink adds roughly \$0.05–\$0.15 per full-colour page, while small cartridge printers run \$0.60–\$1.20+ in ink alone.",
                ],
              },
            ],
          },
          {
            level: 3,
            text: "Print at a photo lab or kiosk",
            paragraphs: [
              "Lab kiosks charge roughly \$1.50–\$4.00 per single A4 sheet, making them ideal if you only print two posters a year—especially when exporting multi-up a4 size paper photo PDF sheets via Print Sheet Maker first so one A4 lab print returns 4 or 9 finished snapshots.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Tools that place photos on A4 sheets automatically",
        paragraphs: [
          "Stop calculating pixel gutters manually—browser sheet builders map exact A4 dimensions into drag-and-drop grids immediately.",
        ],
        children: [
          {
            level: 3,
            text: "A4 photo sheet maker",
            paragraphs: [
              "Tile 2, 4, 6, 9, or 16 crisp frames across portrait or landscape A4 PDFs with toggleable crop marks.",
            ],
          },
          {
            level: 3,
            text: "A4 collage maker",
            paragraphs: [
              "Arrange family keepsakes, holiday grids, and memory boards in matching A4 layouts with balanced clean borders.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Frequently asked questions",
        paragraphs: [
          "Essential answers on photos a4 size pixel targets, orientation, and cost savings.",
        ],
        children: [
          {
            level: 3,
            text: "What size is an A4 photo in pixels?",
            paragraphs: [
              "For standard 300 DPI photo printing, a full A4 image measures 2,480 × 3,508 pixels (portrait) or 3,508 × 2,480 pixels (landscape). For 150 DPI plain-paper drafts, 1,240 × 1,754 px works cleanly.",
            ],
          },
          {
            level: 3,
            text: "What is the best photo size for A4 paper?",
            paragraphs: [
              "Packing either two 4×6 in (4R) prints or four quarter-page prints on a single A4 page balances visual impact, zero aspect-ratio distortion, and paper savings best.",
            ],
          },
          {
            level: 3,
            text: "Is A4 photo printing expensive?",
            paragraphs: [
              "Printing single huge photos a4 size on tiny ink cartridges gets costly, but switching to tank ink plus packing 4 to 9 prints per a4 paper image size sheet reduces unit cost to pennies per photo.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Related tools and guides",
        paragraphs: [
          "Build your own A4 multi-photo PDF immediately or compare paper finishes before buying glossy sheets.",
        ],
        inlineLinks: [{ targetId: "HB-PH", anchor: "photo layout maker for printing" }],
        children: [
          {
            level: 3,
            text: "Arrange photos for printing",
            link: { targetId: "T01", anchor: "a4 page photo" },
            paragraphs: [
              "Place 2 to 24 individual or identical photos onto one exact-scale A4 sheet.",
            ],
          },
          {
            level: 3,
            text: "A4 collage maker",
            link: { targetId: "T10", anchor: "a4 size collage maker" },
            paragraphs: [
              "Design balanced A4 photo collages ready for home printers or print-shop kiosks.",
            ],
          },
          {
            level: 3,
            text: "A4 inkjet photo paper",
            link: { targetId: "B06", anchor: "4r photo paper" },
            paragraphs: [
              "Compare matte, satin, and glossy A4 photo paper coatings and weights before buying.",
            ],
          },
        ],
      },
    ],
    relatedLinks: [
      { targetId: "HB-PH", anchor: "photo layout maker for printing", summary: "Return to the Photo Layout hub." },
      { targetId: "T01", anchor: "a4 page photo", summary: "Arrange multi-photo A4 sheets cleanly in your browser." },
      { targetId: "T10", anchor: "a4 size collage maker", summary: "Create structured A4 photo collages." },
      { targetId: "B06", anchor: "4r photo paper", summary: "Choose the right glossy, matte, or satin inkjet paper." },
    ],
    faqs: [
      {
        question: "What size is an A4 photo in pixels?",
        answer:
          "At print-grade 300 DPI, an A4 photo measures 2,480 × 3,508 pixels (portrait) or 3,508 × 2,480 pixels (landscape).",
      },
      {
        question: "What is the best photo size for A4 paper?",
        answer:
          "For everyday albums, placing two 4×6 in (4R) prints on landscape A4 or four quarter-page prints on portrait A4 maximises sheet usage with crisp framing.",
      },
      {
        question: "Is A4 photo printing expensive?",
        answer:
          "Full-page photos use more ink per sheet, yet tiling 2, 4, or 9 photos onto one A4 page—especially with tank printers or bulk paper—cuts per-photo cost drastically.",
      },
    ],
  },

  G04: {
    id: "G04",
    subtitle:
      "The exact geometry of 4R / 4×6 inch prints on ISO A4 sheets—why two fit effortlessly, cut-line math, and trim templates.",
    breadcrumbAnchor: "photo layout maker for printing",
    introParagraphs: [
      "Knowing how to print multiple 4x6 photos on one page lets anyone with normal A4 paper produce lab-sized 4R prints cleanly at home without stocking separate 4×6 trays. Because two 4×6 inch snapshots fit neatly side by side inside a landscape 210 × 297 mm A4 sheet, cutting just one straight line down the middle separates two keepsake prints in seconds.",
      "Below we break down 4r size in a4 paper geometry, why two prints is the physical sheet limit, portrait versus landscape placement, and clean cut-guide templates.",
    ],
    sections: [
      {
        level: 2,
        text: "How to print 2 4x6 photos on one page of A4",
        paragraphs: [
          "The classic workflow for how to print 2 4x6 photos on one page relies on rotating your A4 canvas sideways (landscape) so two vertical 4×6 frames stand shoulder to shoulder.",
        ],
        children: [
          {
            level: 3,
            text: "The size maths: 4x6 versus A4",
            paragraphs: [
              "Always check millimetre widths first so images aren't silently shrunk below album dimensions.",
            ],
            children: [
              {
                level: 4,
                text: "102 x 152 mm vs 210 x 297 mm",
                paragraphs: [
                  "A standard 4×6 inch (4R) print equals 101.6 × 152.4 mm (commonly rounded to 102 × 152 mm). Placing two side-by-side vertically across landscape A4 occupies 204 mm of the 297 mm sheet width and 152 mm of the 210 mm sheet height—leaving generous trim borders even on printers with wide non-borderless margins.",
                ],
              },
            ],
          },
          {
            level: 3,
            text: "Two 4x6 photos on one A4 sheet",
            paragraphs: [
              "Set page orientation to Landscape, disable 'Scale to Fit', centre a 2-column grid with a 6–10 mm centre gutter, and turn on light outer crop ticks so trimming takes three clean slices.",
            ],
          },
          {
            level: 3,
            text: "Why two is the practical limit",
            paragraphs: [
              "Many users hope three 4×6 shots will squeeze onto A4. Geometrically, three 102 × 152 mm prints require 46,512 sq mm—still smaller than A4's 62,370 sq mm—yet cannot tessellate cleanly without overlapping borders.",
            ],
            children: [
              {
                level: 4,
                text: "Leftover space on the sheet",
                paragraphs: [
                  "Printing two vertical 4×6s side by side in portrait orientation (top half + leftovers) would take 152 × 2 = 304 mm tall—7 mm taller than A4! Placing two across landscape leaves ~90 mm × 210 mm spare along the side, ideal for two extra wallet shots if desired.",
                ],
              },
            ],
          },
        ],
      },
      {
        level: 2,
        text: "4R size in A4 paper: what is 4R?",
        paragraphs: [
          "In Asia, Australia, and commercial photo labs worldwide, '4R size in a4 paper' simply refers to standard 4×6 inch prints arranged onto larger A4 sheets. Comparing 4r photo size in a4 paper formats ensures album sleeves match.",
        ],
        table: {
          headers: ["Lab Code", "Inches", "Millimetres", "Fit on A4 (210 × 297 mm)"],
          rows: [
            ["3R (3×5)", "3.5 × 5 in", "89 × 127 mm", "Up to 4 prints (tight margin rotated)"],
            ["4R (4×6)", "4 × 6 in", "102 × 152 mm", "2 prints cleanly + spare margin strip"],
            ["5R (5×7)", "5 × 7 in", "127 × 178 mm", "1–2 prints (2 fills edge-to-edge)"],
            ["8R (8×10)", "8 × 10 in", "203 × 254 mm", "1 print per A4 sheet"],
          ],
        },
        children: [
          {
            level: 3,
            text: "4R, 4x6 and 6x4 are the same size",
            paragraphs: [
              "Lab names 4R, 4×6 (US), and 6×4 (UK) all describe the identical 102 × 152 mm physical frame.",
            ],
            children: [
              {
                level: 4,
                text: "Portrait versus landscape naming",
                paragraphs: [
                  "Listing the smaller number first (4×6) usually describes portrait orientation, whereas 6×4 implies landscape—both fit identically inside the same glass photo frame rotated 90 degrees.",
                ],
              },
            ],
          },
          {
            level: 3,
            text: "Common 4R photo paper sizes",
            paragraphs: [
              "You can buy pre-cut 4×6 in (4R) postcard packs for instant borderless prints, OR cut two 4R prints out of bulk A4 glossy sheets using our multi-photo PDF layout when learning how to print multiple 4x6 on one page.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "4x6 picture arrangement for printing on A4",
        paragraphs: [
          "A tidy 4x6 picture arrangement for printing avoids crooked scissor lines and protects white borders evenly.",
        ],
        children: [
          {
            level: 3,
            text: "Portrait and landscape arrangements",
            paragraphs: [
              "Even when a photo was captured horizontally, rotate the frame 90 degrees inside your layout grid so both slots stand upright side by side on landscape A4. This guarantees uniform alignment along top and bottom cut lines when solving how to print two 4x6 pictures on one page.",
            ],
          },
          {
            level: 3,
            text: "Add margins and cut guides",
            paragraphs: [
              "Rather than pressing photos butt-to-butt (0 mm gap), keep a slim space between the two frames so minor blade wobble never slices into neighbouring sky or hair.",
            ],
            children: [
              {
                level: 4,
                text: "Safe 3 mm margins",
                paragraphs: [
                  "Leaving at least a 3–5 mm gutter and light outer crop marks lets one vertical slice bisect both photos evenly, leaving crisp borderless or thin-white-framed 4×6 keepsakes.",
                ],
              },
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Tools for printing multiple 4x6 photos on A4",
        paragraphs: [
          "Stop dragging photos around Word docs—browser builders automate multiple 4x6 photos on a4 placement immediately.",
        ],
        children: [
          {
            level: 3,
            text: "4x6 photo template",
            paragraphs: [
              "Lock exact 4×6 in or multi-up 4R sheets cleanly in PDF without aspect distortion.",
            ],
          },
          {
            level: 3,
            text: "A4 photo sheet maker",
            paragraphs: [
              "Switch effortlessly between 2-up 4×6s and 4-up or 9-up thumbnail sheets in seconds.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Frequently asked questions",
        paragraphs: [
          "Quick answers on 4r photo size in a4 paper geometry and home cutting.",
        ],
        children: [
          {
            level: 3,
            text: "How many 4x6 photos fit on an A4 sheet?",
            paragraphs: [
              "Two full-sized 4×6 in (102 × 152 mm) prints fit cleanly on one A4 sheet in landscape orientation with ample trimming margin—enough room beside them for one or two tiny wallet photos if needed.",
            ],
          },
          {
            level: 3,
            text: "Can I print 4x6 photos on A4 paper at home?",
            paragraphs: [
              "Yes. Lay out two 4×6 frames on an A4 PDF at 100% scale, print onto glossy or satin A4 inkjet photo paper, and slice cleanly with a paper trimmer or ruler.",
            ],
          },
          {
            level: 3,
            text: "What is the difference between 4R and 4x6?",
            paragraphs: [
              "None in physical dimension: 4R is simply the international photo-lab designation for a 4 × 6 inch (102 × 152 mm) print.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Related tools and guides",
        paragraphs: [
          "Start laying out 4×6 sheets directly in your browser or dial in single-tray home printer settings.",
        ],
        inlineLinks: [{ targetId: "HB-PH", anchor: "photo layout maker for printing" }],
        children: [
          {
            level: 3,
            text: "Printable 4x6 photo template",
            link: { targetId: "T08", anchor: "4x6 photo template" },
            paragraphs: [
              "Build single-sheet or A4-packed 4×6 layouts with custom borders and crop marks.",
            ],
          },
          {
            level: 3,
            text: "4x6 collage maker",
            link: { targetId: "T09", anchor: "4x6 collage maker free" },
            paragraphs: [
              "Combine 2, 4, or 6 small memories cleanly onto one classic 4×6 postcard sheet.",
            ],
          },
          {
            level: 3,
            text: "Print 4x6 photos at home",
            link: { targetId: "H13", anchor: "at home photo printer 4x6" },
            paragraphs: [
              "Follow our step-by-step home tray, paper-coating, and driver setup checklist.",
            ],
          },
        ],
      },
    ],
    relatedLinks: [
      { targetId: "HB-PH", anchor: "photo layout maker for printing", summary: "Explore all Photo Sheet tools." },
      { targetId: "T08", anchor: "4x6 photo template", summary: "Build ready-to-print 4×6 photo sheets." },
      { targetId: "T09", anchor: "4x6 collage maker free", summary: "Make multi-picture 4×6 collages online." },
      { targetId: "H13", anchor: "at home photo printer 4x6", summary: "Print crisp 4×6 photos at home." },
    ],
    faqs: [
      {
        question: "How many 4x6 photos fit on an A4 sheet?",
        answer:
          "Two full-sized 4×6 inch (102 × 152 mm) photos fit comfortably on one landscape A4 sheet without shrinking.",
      },
      {
        question: "Can I print 4x6 photos on A4 paper at home?",
        answer:
          "Yes. Export a 2-up A4 layout PDF at 100% scale, print on A4 glossy or matte photo paper, and separate the two prints cleanly with a trimmer.",
      },
      {
        question: "What is the difference between 4R and 4x6?",
        answer: "They refer to the exact same 4 × 6 inch (102 × 152 mm) standard print size.",
      },
    ],
  },

  G05: {
    id: "G05",
    subtitle:
      "Regional dimensions (3.5×2 in, 90×55 mm, 85×55 mm), 3 mm bleed rules, safe margins, 300 DPI prep, and front/back structure.",
    breadcrumbAnchor: "layout for business cards",
    introParagraphs: [
      "Using the exact standard business card format prevents awkward wallet overhangs, clipped email addresses, and rejected commercial print-shop uploads. While 3.5 × 2 inches dominates in the US and Canada, Australia, New Zealand, Europe, and Japan each favour distinct metric card dimensions—and knowing bleed, trim, and safe-zone geometry keeps your typography crisp on both home cardstock and offset presses.",
      "This complete specification guide covers regional business cards format tables, business card dimensions template rules, software setup comparisons, and downloadable 10-up sheet tips.",
    ],
    sections: [
      {
        level: 2,
        text: "Standard business card size by region",
        paragraphs: [
          "Match your standard business card format to the pockets, cardholders, and stationery boxes common where you meet clients.",
        ],
        table: {
          headers: ["Region", "Finished Trim Size", "With 3 mm Bleed", "Common Sheet Grid"],
          rows: [
            ["US & Canada", "3.5 × 2 in (88.9 × 50.8 mm)", "3.75 × 2.25 in (95 × 57 mm)", "10-up on US Letter (2 × 5)"],
            ["UK & Western Europe", "85 × 55 mm (3.35 × 2.17 in)", "91 × 61 mm", "10-up on A4 (2 × 5)"],
            ["Australia & New Zealand", "90 × 55 mm (3.54 × 2.17 in)", "96 × 61 mm", "10-up on A4 (2 × 5)"],
            ["Japan", "91 × 55 mm (Meishi)", "97 × 61 mm", "10-up on A4 (2 × 5)"],
            ["China / Hong Kong / Singapore", "90 × 54 mm", "96 × 60 mm", "10-up on A4 (2 × 5)"],
          ],
        },
        children: [
          {
            level: 3,
            text: "US and Canada: 3.5 x 2 inches",
            paragraphs: [
              "North American business cards format packs, rotary Rolodex files, and pre-perforated Avery sheets all standardise strictly on 3.5 × 2 inches so ten cards pack cleanly into a 2×5 grid on US Letter paper.",
            ],
            children: [
              {
                level: 4,
                text: "Metric equivalent: 89 x 51 mm",
                paragraphs: [
                  "Converted to metric for digital layouts, 3.5 × 2 in equals 88.9 × 50.8 mm (rounded cleanly to 89 × 51 mm in international CAD programs).",
                ],
              },
            ],
          },
          {
            level: 3,
            text: "Europe, UK and Australia: common metric sizes",
            paragraphs: [
              "ISO ID-1 credit-card proportions inspire 85 × 55 mm across the UK and EU, whereas Australia and New Zealand favour a slightly wider 90 × 55 mm cut—both drop comfortably 10-up onto ISO A4 cardstock.",
            ],
          },
          {
            level: 3,
            text: "Asia: common name card sizes",
            paragraphs: [
              "Japanese meishi cards measure 91 × 55 mm and East Asian visiting cards commonly run 90 × 54 mm—fitting easily inside standard 10-up A4 sheets with generous trim gutters.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Business card dimensions template: bleed, trim and safe zone",
        paragraphs: [
          "Every clean business card dimensions template divides artwork into three invisible concentric frames: outer bleed edge, physical trim line, and inner safe text zone.",
        ],
        children: [
          {
            level: 3,
            text: "Bleed: 3 mm beyond the trim",
            paragraphs: [
              "Whenever your card features a dark background, full-bleed photo, or coloured side strip, extend colour 3 mm (0.125 in) past the trim edge on every side. Guillotine blades shift ±0.5–1 mm during stacking—bleed ensures zero hairline white slivers remain along cut borders.",
            ],
          },
          {
            level: 3,
            text: "Safe zone for text and logos",
            paragraphs: [
              "Place all text, logos, QR codes, and borders well inside the physical card edge.",
            ],
            children: [
              {
                level: 4,
                text: "3 mm inside the trim",
                paragraphs: [
                  "Keeping every readable glyph at least 3 mm (preferably 4–5 mm) inside the cut trim protects names and phone digits from minor feeder tilt on home inkjet printers or commercial presses alike.",
                ],
              },
            ],
          },
          {
            level: 3,
            text: "Resolution and colour mode",
            paragraphs: [
              "Export typography as live vector PDF rather than flattened JPEGs whenever possible so small 7.5 pt contact lines never fuzz.",
            ],
            children: [
              {
                level: 4,
                text: "300 DPI and CMYK vs RGB",
                paragraphs: [
                  "Keep embedded photos at 300 DPI minimum (1,050 × 600 px minimum at trim, 1,125 × 675 px with bleed). Offset presses expect CMYK colour separation, while desktop RGB inkjet drivers convert bright sRGB files automatically.",
                ],
              },
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Business card size template for design software",
        paragraphs: [
          "Different apps handle multi-up sheets differently—pick a business card size template setup matching the software you actually own.",
        ],
        children: [
          {
            level: 3,
            text: "Photoshop and Illustrator",
            paragraphs: [
              "Designers building a business card size illustrator template or business card size template psd file set a single-card artboard (with 3 mm bleed) in Vector Illustrator or 300 DPI Photoshop, then drop the exported PDF into a 10-up imposition sheet—or upload directly into our browser multi-card sheet generator.",
            ],
          },
          {
            level: 3,
            text: "Word and Google Docs",
            paragraphs: [
              "Word relies on fixed 2×5 table grids matching Avery paper codes; turning off table auto-resize prevents cell height creep when bold fonts wrap onto two lines.",
            ],
          },
          {
            level: 3,
            text: "Canva and online makers",
            paragraphs: [
              "Canva exports crisp single cards cleanly, yet its free multi-up printing defaults expect paid print orders—upload your single exported card PNG/PDF into our 10-up Card Sheet Maker to tile ten on A4 or Letter free.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Typical business card layout: what goes where",
        paragraphs: [
          "A typical business card layout earns second glances through calm whitespace rather than stuffing seven social handles into 85 × 55 mm.",
        ],
        children: [
          {
            level: 3,
            text: "Front: logo, name and role",
            paragraphs: [
              "Reserve the front face for primary brand identity (clean mark + company name), person's name at 11–14 pt, short role title at 8.5–9.5 pt, and the two quickest contact paths (phone + email or website).",
            ],
          },
          {
            level: 3,
            text: "Back: QR code, address or tagline",
            paragraphs: [
              "Offload website links, booking pages, maps, or appointment reminder lines onto the back face.",
            ],
            children: [
              {
                level: 4,
                text: "Keep the back uncluttered",
                paragraphs: [
                  "Print QR codes at least 18–22 mm square with pure black modules on white or light pastel cardstock so dim pub or conference lighting scans smoothly.",
                ],
              },
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Standard business card template files to download",
        paragraphs: [
          "Skip broken ZIP archives of outdated software files—generate clean standard business card template PDFs tailored to your paper tray right in the browser.",
        ],
        children: [
          {
            level: 3,
            text: "Blank business card template",
            paragraphs: [
              "Export crisp empty crop-marked 10-up sheets to hand-stamp or hand-calligraph artisanal craft cards.",
            ],
          },
          {
            level: 3,
            text: "A4 and Letter card sheets",
            paragraphs: [
              "Always lock your business cards format sheet grid to the exact cardstock pack loaded (85×55 mm / 90×55 mm on A4; 3.5×2 in on Letter).",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Frequently asked questions",
        paragraphs: [
          "Quick checks on standard business card format specs before exporting your print sheet.",
        ],
        children: [
          {
            level: 3,
            text: "What is the standard business card size?",
            paragraphs: [
              "In the US and Canada, 3.5 × 2 inches (89 × 51 mm) is standard; in the UK and Western Europe it is 85 × 55 mm; in Australia and New Zealand it is 90 × 55 mm.",
            ],
          },
          {
            level: 3,
            text: "What is a standard business card format for printing?",
            paragraphs: [
              "The safest standard business card format for home or commercial printing is a 300 DPI vector PDF set to exact regional trim size (with 3 mm bleed for full-colour edges and 3 mm inner safe margins for text).",
            ],
          },
          {
            level: 3,
            text: "Should I add bleed to my business card file?",
            paragraphs: [
              "Yes whenever colour, borders, or photos touch any edge of the finished card; leave clean white cards without bleed if printing onto plain white un-trimmed borders or perforated 10-up packs.",
            ],
          },
        ],
      },
      {
        level: 2,
        text: "Related tools and guides",
        paragraphs: [
          "Launch a clean 10-up card generator in your browser or compare editable templates.",
        ],
        inlineLinks: [{ targetId: "HB-BC", anchor: "layout for business cards" }],
        children: [
          {
            level: 3,
            text: "Business card template",
            link: { targetId: "T13", anchor: "template to make business cards" },
            paragraphs: [
              "Start from clean blank, typographic, or QR-ready card designs sized for A4 and Letter.",
            ],
          },
          {
            level: 3,
            text: "Print multiple business cards on one page",
            link: { targetId: "T11", anchor: "business card page template" },
            paragraphs: [
              "Tile 8 or 10 copies of your finished artwork cleanly across heavy cardstock sheets.",
            ],
          },
          {
            level: 3,
            text: "Layout for business cards",
            link: { targetId: "HB-BC", anchor: "layout for business cards" },
            paragraphs: [
              "Browse all six card tools plus Canva, InDesign, and double-sided alignment guides.",
            ],
          },
        ],
      },
    ],
    relatedLinks: [
      { targetId: "HB-BC", anchor: "layout for business cards", summary: "Browse the full Business Cards cluster." },
      { targetId: "T13", anchor: "template to make business cards", summary: "Use our free editable business card templates." },
      { targetId: "T11", anchor: "business card page template", summary: "Tile 8 or 10 cards cleanly onto one A4 or Letter PDF." },
    ],
    faqs: [
      {
        question: "What is the standard business card size?",
        answer:
          "3.5 × 2 inches (89 × 51 mm) in the US and Canada; 85 × 55 mm in the UK and Europe; 90 × 55 mm in Australia and New Zealand.",
      },
      {
        question: "What is a standard business card format for printing?",
        answer:
          "A high-resolution vector PDF at 300 DPI with crisp outlines, 3 mm safe text inset, and 3 mm outer bleed where artwork meets card edges.",
      },
      {
        question: "Should I add bleed to my business card file?",
        answer:
          "Add 3 mm bleed whenever backgrounds or photos extend to the cut edge so cutting tolerance never leaves thin white strips.",
      },
    ],
  },
};
