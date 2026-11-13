import type { PageContent, PageId } from "@/types/spec";
import { buildHowToContent } from "./howto-builder";

export const HOWTOS_CONTENT_2: Partial<Record<PageId, PageContent>> = {
  H08: buildHowToContent({
    id: "H08",
    hubId: "HB-BC",
    hubAnchor: "layout for business cards",
    subtitle:
      "Line up fronts and backs symmetrically on manual-flip or auto-duplex home printers—plus fixes for upside-down flip errors.",
    intro: [
      "Learning how to print double sided business cards at home doubles the utility of every card—leaving clean contact lines on the front while adding an appointment grid, QR booking link, or map on the reverse. Because standard automatic duplexers pull thick cardstock clumsily and skew alignments by 2–3 mm, learning a simple one-sheet test-mark manual flip prevents cropped backs cleanly.",
      "Follow this five-step front-and-back alignment routine, learn the exact difference between Flip on Long Edge vs Short Edge, and test alignment cleanly before feeding heavyweight cardstock.",
    ],
    needsIntro:
      "Use a thick opaque cardstock sheet and keep artwork cleanly centered before testing front-to-back flip direction.",
    needs: [
      {
        h3: "A front and a back design",
        body: "Keep front artwork simple and avoid wrapping hairline frames close to the trim edge on the reverse side—symmetric 3–4 mm safe zones absorb natural ~1 mm paper-roller shift gracefully.",
      },
      {
        h3: "A printer with duplex or manual flip",
        body: "Even if your inkjet includes auto-duplexing, manual rear-tray flipping outperforms auto-duplex mechanisms on stiff 250–300 gsm card sheets that jam inside tight internal U-turn rollers.",
      },
    ],
    stepsH2: "Step-by-step: print using duplex or manual double-sided printing",
    stepsIntro:
      "Follow these calibration steps carefully whenever tackling print double sided business cards at home runs so Page 2 never prints upside down or shifted left.",
    steps: [
      {
        heading: "Step 1: Make a two-page PDF (front, back)",
        body: "Export a clean two-page PDF where Page 1 holds all 10 card fronts symmetrically centered and Page 2 holds the back of business card template artwork centered identically.",
      },
      {
        heading: "Step 2: Print the front on a test sheet",
        body: "Print Page 1 alone onto a sheet of ordinary 80 gsm paper first, drawing a small pencil arrow at the top-right corner while it sits facing out in your tray.",
        sub: [
          {
            h4: "Duplex printers",
            body: "If printing lighter ~180–200 gsm stock on a straight-path auto-duplexer, select Two-Sided -> Flip on Long Edge (for portrait sheets holding horizontal cards) and test one blank page against light.",
          },
          {
            h4: "Manual flip: long edge vs short edge",
            body: "On portrait A4/Letter sheets, flipping paper horizontally like turning a book page keeps heads upright on both front and back (Long Edge); flipping top-over-bottom flips Page 2 upside down unless using Short Edge setting.",
          },
        ],
      },
      {
        heading: "Step 3: Mark the paper orientation",
        body: "Watch carefully how the top corner arrow exits your printer—face-up vs face-down and head-first vs foot-first—so you re-insert the cardstock identically on Pass 2.",
      },
      {
        heading: "Step 4: Flip and print the back",
        body: "Load the printed sheet back into the rear manual feed facing cleanly for Page 2, then print Page 2 alone onto the blank side.",
        sub: [
          {
            h4: "Back of business card template",
            body: "An ideal back of business card template skips thin double borders right next to outer trim edges—giving natural ~1.5 mm roller tolerance so cards still look centred after trimming.",
          },
          {
            h4: "Alignment marks",
            body: "Place outer corner crop ticks exclusively on Page 1 (front), never printing double overlapping cut lines on Page 2 unless verifying registration on copy paper first.",
          },
        ],
      },
      {
        heading: "Step 5: Check alignment and cut",
        body: "Hold your completed test sheet directly up against a bright window! Look through the sheet to verify Page 2 QR codes sit cleanly inside Page 1 boxes, then slice exclusively using Page 1's crop ticks.",
      },
    ],
    fixesIntro:
      "Double-sided misalignment happens consistently in predictable patterns—check which fix matches your test sheet immediately.",
    fixes: [
      {
        h3: "The back is upside down",
        body: "You inverted top-to-bottom rotation when reloading the rear tray (or used Short Edge instead of Long Edge binding on a portrait PDF). Rotate sheet 180° in tray reload—or toggle Long/Short flip inside Print Properties.",
      },
      {
        h3: "Front and back are misaligned",
        body: "Push plastic edge-guides firmly against your paper stack inside the feed tray without bowing sheets, and ensure your layout grids on Page 1 and Page 2 share symmetrical identical left/right margins.",
      },
      {
        h3: "Ink shows through the card",
        body: "Paper lighter than 200 gsm bleeds heavy dark backs faintly through to the front under desk lamps. Switch to thick 280–300 gsm high-opacity matte cardstock.",
      },
    ],
    fasterIntro:
      "Tired of shifting Word tables separately on Page 1 and Page 2? Generate an exact mirrored two-page sheet automatically in seconds.",
    fasterSub1Body:
      "Enable Include Back Side inside our Business Card Studio to create locked symmetrical Page 1 and Page 2 PDF sheets tuned specifically for double-sided home flipping.",
    fasterToolHeading: "Printable business cards",
    fasterToolTarget: "T12",
    fasterToolAnchor: "business card printable",
    fasterToolBody:
      "Build matching front and back sheets automatically inside Printable Business Cards—download an aligned 2-page PDF and print safely at home.",
    faqs: [
      {
        q: "How do I print double sided business cards on a printer without duplex?",
        a: "Print Page 1 (fronts) first onto cardstock, note exact tray orientation, flip sheets horizontally like turning a book page back into the manual feed tray, and print Page 2 alone.",
      },
      {
        q: "What goes on the back of a business card?",
        a: "Great reverse options include a sharp 20 mm QR code linking to your booking/portfolio page, street directions, brief service list, or appointment reminder lines.",
      },
      {
        q: "Is there a double sided card template for Word?",
        a: "While many people search for a double sided card template word file, fixed table alignment inside Word shifts easily across versions; using a locked vector two-page PDF keeps fronts and backs centered reliably.",
      },
    ],
    relatedH3s: [
      {
        heading: "Print business cards at home",
        targetId: "H07",
        anchor: "free business card templates print at home",
        desc: "Review cardstock GSM weights, rear-feed steps, and clean guillotine cutting setups.",
      },
      {
        heading: "Print multiple business cards on one page",
        targetId: "T11",
        anchor: "business card page template",
        desc: "Upload both front and back PNG card graphics to generate a clean 2-page 10-up PDF.",
      },
    ],
  }),

  H09: buildHowToContent({
    id: "H09",
    hubId: "HB-LS",
    hubAnchor: "label sticker sheet maker",
    subtitle:
      "Print identical product, return-address, or classroom tags across an entire sheet cleanly—comparing Word Mailings tables against instant PDFs.",
    intro: [
      "Knowing how to print multiple labels on one page turns tedious manual cutting into a clean one-minute run across pre-scored sticker sheets. Whether printing 24 matching honey jars, 14 return-address envelopes, or two large parcel slips per page, duplicating one layout accurately across every row prevents drifted text near the bottom edge.",
      "Below we step through how to build sheets inside Microsoft Word's Mailings tab or a static PDF, diagnose downward drift, and generate exact-scale sheets straight from your browser.",
    ],
    needsIntro:
      "Measure your physical pack first or pull the template SKU code from the sheet carton before placing text.",
    needs: [
      {
        h3: "Your label sheet product number or measurements",
        body: "Note your pack's exact grid (e.g. 2×7 = 14-up, 3×8 = 24-up), ISO A4 vs US Letter sheet format, and single-cell height/width in millimetres.",
      },
      {
        h3: "Label text or artwork",
        body: "Draft clean concise lines (2–4 short rows for return addresses, bold item title + batch date for product jars) plus any small transparent logo badge.",
      },
    ],
    stepsH2: "Step-by-step: print using Word, PDF and an online label tool",
    stepsIntro:
      "Choose your preferred route below for reliable how to print multiple labels on one sheet and clean label sheet fills without overflowing cells.",
    steps: [
      {
        heading: "Step 1: Find the label grid size",
        body: "Count labels across and down your blank sheet. Confirm whether outer columns sit flush against 5 mm margins or feature 2–4 mm horizontal gap strips between stickers.",
      },
      {
        heading: "Step 2: Create one label",
        body: "Build your first single cell cleanly with generous ~2.5 mm inside padding away from border edges before duplicating it sheet-wide.",
        sub: [
          {
            h4: "Word Mailings labels",
            body: "Inside Microsoft Word open Mailings -> Labels -> Options -> select product vendor & code -> type copy inside Address -> check 'Full page of the same label' -> click New Document to expose the editable table.",
          },
          {
            h4: "PDF method",
            body: "For how to print multiple labels on one page pdf precision across different PCs, exporting a locked vector PDF stops Word font substitutions from expanding row heights unexpectedly.",
          },
        ],
      },
      {
        heading: "Step 3: Duplicate it across the sheet",
        body: "When pasting formatting across manual Word table grids, paste cell contents cleanly without stretching row heights downward—always verify View -> Gridlines stays symmetrical on Row 8.",
      },
      {
        heading: "Step 4: Print one test page on plain paper",
        body: "Always test first on ordinary 80 gsm sheet paper and hold it directly behind your blank peel sheet up toward daylight.",
        sub: [
          {
            h4: "Online label tool",
            body: "Dedicated browser sheet builders skip manual table pasting completely—typing once fills all 10, 14, or 24 slots mathematically at exact millimetre gaps.",
          },
          {
            h4: "Label alignment settings",
            body: "Inside Chrome, Preview, or Acrobat Print settings, lock Scale strictly at 100% / Actual Size and disable 'Fit to Printable Area'.",
          },
        ],
      },
      {
        heading: "Step 5: Print on the label sheet",
        body: "Load one pre-cut sticker sheet face-up or face-down per your printer tray icon through the manual feed with media type set to Labels / Heavyweight Paper.",
      },
    ],
    fixesIntro:
      "Even one wrong driver option spoils twenty sticker cells—spot these three common snags immediately.",
    fixes: [
      {
        h3: "Only the first label prints",
        body: "In Word Mailings -> Labels, clicking 'Single label' leaves Row 1 Column 1 selected rather than switching the radio toggle up to 'Full page of the same label'.",
      },
      {
        h3: "Labels drift down the sheet",
        body: "Drift happens whenever US Letter paper templates print onto A4 paper (or vice versa), OR when Print Scaling defaults to Fit (~96%), pulling Row 7 up by 5–7 mm.",
      },
      {
        h3: "Text is cut off at label edges",
        body: "Turn off Word's automatic cell resize, shrink oversized fonts slightly, and keep at least 2.5 mm cushion inside each rectangle.",
      },
    ],
    fasterIntro:
      "Tired of battling hidden Word table borders that shove rows off pre-cut sheets? Fill an exact grid directly in your browser.",
    fasterSub1Body:
      "A purpose-built sheet builder locks true physical geometry—letting you adjust custom margins or toggle subtle cut lines cleanly before saving one universal PDF.",
    fasterToolHeading: "Printable label maker",
    fasterToolTarget: "T17",
    fasterToolAnchor: "a4 printable labels",
    fasterToolBody:
      "Design one clean label and duplicate it cleanly across 10-up, 14-up, 24-up, or custom A4/Letter grids in Printable Label Maker free.",
    complianceCallout: {
      variant: "affiliation",
      title: "Independent Word & Label Formatting Guide",
      body: "Print Sheet Maker is an independent web utility not affiliated with Microsoft Corporation or pre-cut label brands.",
    },
    faqs: [
      {
        q: "How do I print multiple labels on one sheet in Word?",
        a: "Open Word -> Mailings -> Labels -> pick Options matching your sheet code -> type your text -> choose 'Full page of the same label' -> New Document to review all rows, then print at 100% scale.",
      },
      {
        q: "How to print two labels on one page?",
        a: "For how to print two labels on one page cleanly, choose a 2-up half-sheet shipping preset inside Word Labels or Print Sheet Maker's Printable Label Maker, verify A4/Letter match, and export.",
      },
      {
        q: "How to print multiple labels on one page pdf?",
        a: "To solve how to print multiple labels on one page pdf cleanly without layout shift, either generate your sheet directly inside Print Sheet Maker or Save As PDF from Word and print with Actual Size (100%) checked—handling multiple labels on one page and how do i print multiple labels on one page smoothly every time.",
      },
    ],
    relatedH3s: [
      {
        heading: "How do i print different address labels on one sheet",
        targetId: "H10",
        anchor: "how to print labels with multiple address on one page",
        desc: "Populate unique recipient names and postcodes onto separate labels cleanly in one sheet.",
      },
      {
        heading: "A4 labels template",
        targetId: "T18",
        anchor: "a4 4x6 labels",
        desc: "Dial in custom rows, columns, margins, and gaps for unbranded A4 label packs.",
      },
    ],
  }),

  H10: buildHowToContent({
    id: "H10",
    hubId: "HB-LS",
    hubAnchor: "label sticker sheet maker",
    subtitle:
      "Populate distinct recipient names and postal codes onto every cell of an address sheet—comparing Word Mail Merge against fast CSV/browser paste.",
    intro: [
      "Answering how do i print different address labels on one sheet stops holiday card senders, wedding planners, and small Etsy sellers from tearing up dozens of half-used pages one address at a time. Whether running a clean Excel spreadsheet through Microsoft Word Mail Merge or pasting 14 distinct addresses into a browser address grid tool, every label slot takes its own recipient cleanly.",
      "Follow this step-by-step workflow to tidy your spreadsheet columns, populate individual sheet cells without triggering repeated copies, and print crisp readable labels.",
    ],
    needsIntro:
      "Clean up blank rows and long apartment strings in your spreadsheet before connecting a label template.",
    needs: [
      {
        h3: "A list of addresses in a spreadsheet",
        body: "Keep recipient columns neatly organised (Full Name, Street Line 1, Street Line 2, City/State/Postcode) with clear column headers in Row 1 and zero trailing blank spacer rows.",
      },
      {
        h3: "Your label sheet size",
        body: "Confirm your adhesive pack layout—typically 2×7 (14-up) on A4 or 3×10 (30-up) on US Letter—before formatting address fonts.",
      },
    ],
    stepsH2: "Step-by-step: print using mail merge or a bulk address tool",
    stepsIntro:
      "Complete these exact five steps for smooth how to print labels with multiple address on one page runs without duplicate glitches.",
    steps: [
      {
        heading: "Step 1: Tidy the address list",
        body: "Scan long business names and dual-line apartment numbers so no single address climbs over 4–5 lines tall—oversized addresses clip horizontally on narrow 3-column sheets.",
      },
      {
        heading: "Step 2: Choose the label layout",
        body: "Open a blank grid matching your sheet SKU or custom cell dimensions in millimetres.",
        sub: [
          {
            h4: "Excel and CSV columns",
            body: "Format postcodes/ZIP codes as Text inside Excel BEFORE saving so leading zeros (e.g. 02138 or 0800) aren't accidentally stripped into 4-digit numbers!",
          },
          {
            h4: "Word mail merge",
            body: "In Word open Mailings -> Start Mail Merge -> Labels -> pick sheet number -> Select Recipients -> Use Existing List -> point at your spreadsheet -> insert Address Block into cell 1 -> ALWAYS click Update Labels (otherwise only label 1 updates!) -> Finish & Merge.",
          },
        ],
      },
      {
        heading: "Step 3: Merge or paste addresses",
        body: "When doing just 10–30 holiday parcels, skipping Word's complex Next Record rules by simply clicking into individual browser label cells lets you type or paste unique recipients straight onto page 1 visually.",
      },
      {
        heading: "Step 4: Preview every label",
        body: "Always inspect the Preview Results view across every row—checking especially where long double-barrelled street names wrap.",
        sub: [
          {
            h4: "Online address label tool",
            body: "Browser address label tools swap instantly between Repeat Mode (return addresses) and Multi-Entry Mode (distinct shipping recipients per cell) with zero CSV wizard menus.",
          },
          {
            h4: "Return-address labels",
            body: "Reserve the remaining unused empty cells at the bottom of a mixed dispatch sheet for extra return-address stickers so zero adhesive labels go to waste.",
          },
        ],
      },
      {
        heading: "Step 5: Print and check alignment",
        body: "Run a quick copy-paper alignment check, lock Print Scale to 100% Actual Size, and feed matte white adhesive sheets flat via the rear manual tray.",
      },
    ],
    fixesIntro:
      "Mail merge throws classic frustrating errors when one tiny button gets skipped—spot all three below immediately.",
    fixes: [
      {
        h3: "Addresses run off the label",
        body: "Drop font size slightly from 12 pt to 10–11 pt readable sans-serif, tighten paragraph line spacing inside table cells to 1.0 single spacing (0 pt after), and verify zero unwanted extra tabs slipped into Excel cells.",
      },
      {
        h3: "Same address on every label",
        body: "In Word Mail Merge, you forgot the «Next Record» field tag before cells 2–14! Always click 'Update Labels' under Mailings after formatting cell 1 so Word inserts «Next Record» across every label automatically.",
      },
      {
        h3: "Special characters appear wrong",
        body: "Accents (é, ü, ñ) corrupt when CSV files export in legacy ANSI encoding instead of UTF-8. Either save straight as native .xlsx for Word Mail Merge or copy-paste directly into a UTF-8 browser label maker.",
      },
    ],
    fasterIntro:
      "Only mailing 14 holiday cards or 8 e-commerce parcels today? Skip configuring multi-step Excel ODBC Mail Merge links altogether.",
    fasterSub1Body:
      "Switch our browser address label maker to Multi-Address mode to edit every single slot on your A4 sheet visually in thirty seconds flat.",
    fasterToolHeading: "A4 address labels",
    fasterToolTarget: "T20",
    fasterToolAnchor: "a4 shipping labels",
    fasterToolBody:
      "Open A4 Address Labels, toggle individual cells, enter or paste distinct recipient addresses cleanly, and download a 100% crisp PDF immediately.",
    faqs: [
      {
        q: "How to print multiple address labels on one sheet?",
        a: "For fast how to print multiple address labels on one sheet batches, use Print Sheet Maker's Individual Cell mode for 8–24 recipients directly, OR run Word Mailings -> Start Mail Merge -> Labels linked to a clean .xlsx sheet.",
      },
      {
        q: "How to print labels with multiple addresses on one page?",
        a: "Whether using Word Mail Merge ('Update Labels' inserts «Next Record» tags automatically) or pasting straight into multi-cell grid editors, every slot pulls a unique recipient without wasting single sheets.",
      },
      {
        q: "Can I print different shipping labels on one page?",
        a: "Yes. Larger 2×4 (8-up) A4 shipping label presets give ample room for unique To/From addresses and tracking references across eight distinct parcels per page.",
      },
    ],
    relatedH3s: [
      {
        heading: "How to print multiple labels on one page",
        targetId: "H09",
        anchor: "how to print multiple labels on one page",
        desc: "Fill an entire sheet cleanly with duplicates of one label or custom office grids.",
      },
      {
        heading: "A4 address labels",
        targetId: "T20",
        anchor: "a4 shipping labels",
        desc: "Format 14-up mailing and 8-up shipping sheets immediately in your browser.",
      },
    ],
  }),

  H11: buildHowToContent({
    id: "H11",
    hubId: "HB-LS",
    hubAnchor: "label sticker sheet maker",
    subtitle:
      "Tile logos, planner icons, or small shop brand decals cleanly across A4 printable vinyl or matte sticker paper with smart trim spacing.",
    intro: [
      "Knowing how to print multiple stickers on one page lets small shops, crafters, and journal fans turn one pack of A4 adhesive vinyl into dozens of crisp custom decals at a fraction of commercial kiss-cut costs. Whether printing logo seals to stick onto bakery boxes or cutting mini planner icons by hand, smart margins and ink dry times protect bright colour saturation.",
      "Follow these five steps to format multiple stickers on one page cleanly, choose printer-compatible matte or glossy vinyl, and prevent ink from smudging on blade rollers.",
    ],
    needsIntro:
      "Verify adhesive stock chemistry and export clean high-resolution artwork before tiling your first sheet.",
    needs: [
      {
        h3: "Sticker paper that matches your printer",
        body: "Strictly pair Inkjet Sticker Paper / Printable Vinyl with inkjet printers, and heat-rated Laser Sticker Paper with laser fusers—feeding the wrong coating melts glue or puddles liquid ink.",
      },
      {
        h3: "Your sticker artwork",
        body: "Gather 300 DPI PNG graphics (transparent backgrounds keep sheets tidy) or crisp typographic logo badges ready for resizing.",
      },
    ],
    stepsH2: "Step-by-step: print using an A4 sticker sheet",
    stepsIntro:
      "Produce clean, bubble-free custom sheets for planners, brand seals, and logos using these print stickers on a4 best practices.",
    steps: [
      {
        heading: "Step 1: Resize artwork to final sticker size",
        body: "Set physical output proportions—such as 35 × 35 mm mini seals, 50 mm box logos, or 25 mm planner dots—so you don't print tiny fuzzy stamps or massive decals by mistake.",
      },
      {
        heading: "Step 2: Arrange stickers on an A4 page",
        body: "Keep artwork safely inside a ~196 × 283 mm live printable box centered on ISO A4 (210 × 297 mm) so hardware tray rollers never scrape corner ink.",
        sub: [
          {
            h4: "Print stickers on A4 at the right size",
            body: "When preparing print stickers on a4 layouts, locking cell width and height inside a vector PDF preserves identical brand scaling across every reorder.",
          },
          {
            h4: "Print multiple logos on one page",
            body: "For how to print multiple logos on one page branding runs, repeating a single square PNG across a 4×6 (24-up) or 3×4 (12-up) A4 grid cuts cost down to pennies per package.",
          },
        ],
      },
      {
        heading: "Step 3: Leave gaps for cutting",
        body: "Always leave 2–4 mm empty space between every sticker image on the A4 canvas—packing borders edge-to-edge leaves no safe scissor corridor and chips adjacent paint or logos.",
      },
      {
        heading: "Step 4: Print on sticker paper",
        body: "Feed one single sheet via the rear manual tray, switch printer driver Media Type to Glossy Photo / Inkjet Matte / Vinyl, and turn Print Quality up to High.",
        sub: [
          {
            h4: "Cut lines",
            body: "Toggle subtle light-grey outline borders when trimming square/rectangle seals by hand with scissors or a guillotine.",
          },
          {
            h4: "Print your own stickers paper tips",
            body: "Following clean print your own stickers paper habits—flat feeding plus 15-minute air curing—keeps matte and vinyl colors razor crisp before touching blades.",
          },
        ],
      },
      {
        heading: "Step 5: Cut by hand or with a machine",
        body: "Optional upgrade: roll clear self-adhesive cold laminate smoothly across cured vinyl stickers before slicing with craft scissors, rotary trimmers, or craft cutting machines for true water resistance.",
      },
    ],
    fixesIntro:
      "Ruined sticker vinyl gets pricey fast—diagnose sizing shrinkage, peeling lamination, and ink smears with these three checks.",
    fixes: [
      {
        h3: "Stickers print too small",
        body: "Verify Print Scale stays at Actual Size (100%) inside Chrome or Preview—never 'Fit to Page' or accidental N-up shrinking inside printer driver preferences.",
      },
      {
        h3: "Edges peel after cutting",
        body: "Rounded corners resist snagging far better than sharp 90° paper points on water bottles and envelopes. Also avoid stretching laminate tension aggressively while smoothing it down—tension makes stickers curl backward off cups.",
      },
      {
        h3: "Ink smears on the sticker sheet",
        body: "Touch testing glossy sticker sheets straight off the exit tray smears dye instantly. Let coated inkjet vinyl dry flat undisturbed for 15–20 minutes (or confirm you didn't mistakenly feed laser-only stock into an inkjet).",
      },
    ],
    fasterIntro:
      "Tired of dragging twenty tiny PNG copies manually around blank pages and eyeing uneven scissors spacing? Auto-tile your sheet grid cleanly in seconds.",
    fasterSub1Body:
      "Upload one logo or illustration once, dial desired width/height and gap spacing on A4, preview every row, and export a 100%-scale print-ready PDF.",
    fasterToolHeading: "Sticker sheet maker online",
    fasterToolTarget: "T22",
    fasterToolAnchor: "label sticker paper a4 template",
    fasterToolBody:
      "Launch Sticker Sheet Maker Online right in your browser to arrange multiple logos or icons cleanly across A4 sticker sheets.",
    faqs: [
      {
        q: "How to print multiple stickers on one page?",
        a: "To nail how to print multiple stickers on one page quickly, upload your design to Print Sheet Maker's Sticker Sheet Maker Online, choose grid size with 2–3 mm cutting gaps, export at 100% scale PDF, and print onto inkjet or laser sticker sheets.",
      },
      {
        q: "How to print multiple logos on one page?",
        a: "Knowing how to print multiple logos on one page is effortless: drop your single transparent PNG logo into our A4 grid builder, repeat across 12, 24, or 35 cells with subtle optional trim borders, and download one ready-to-print sheet.",
      },
      {
        q: "Can I print stickers on normal paper?",
        a: "Yes for draft cut checks—or with craft glue/tape on scrapbooks—though real peel-and-stick convenience requires buying matte or glossy A4 self-adhesive sticker paper.",
      },
    ],
    relatedH3s: [
      {
        heading: "Sticker paper size A4",
        targetId: "G06",
        anchor: "a4 paper stickers",
        desc: "Compare matte white, glossy photo, and waterproof printable vinyl A4 sheets.",
      },
      {
        heading: "Sticker sheet maker online",
        targetId: "T22",
        anchor: "label sticker paper a4 template",
        desc: "Build your custom A4 sticker PDF sheet immediately free.",
      },
    ],
  }),

  H12: buildHowToContent({
    id: "H12",
    hubId: "HB-PH",
    hubAnchor: "photo layout maker for printing",
    subtitle:
      "Pack compliant 35 × 45 mm or 2 × 2 inch ID photos neatly onto affordable 4×6 or A4 photo paper at 100% exact scale.",
    intro: [
      "Learning how to print multiple passport photos on one page drops the cost of family visa, ID badge, and renewal photos from high-street booth fees down to one affordable 4×6 or A4 photo print. Simply locking exact millimetre geometry (e.g. 35 × 45 mm for UK/EU/Australia/India or 2 × 2 in for US/India visas) onto a crisp sheet PDF produces 6 to 16 uniform prints ready for clean trimming.",
      "Follow these careful country-rule checks, exact crop math, and 100% scale settings—plus tips when sending your combined layout cleanly to a local pharmacy 4×6 kiosk.",
    ],
    needsIntro:
      "Verify government biometrics lighting rules before laying multiple duplicates across a single sheet.",
    needs: [
      {
        h3: "A compliant passport photo",
        body: "Shoot against a plain off-white or cream wall in soft natural window lighting (zero harsh face shadows), neutral mouth-closed expression, no tinted glasses, and proper head-to-frame proportions matching your passport authority.",
      },
      {
        h3: "Photo paper in A4 or 4x6",
        body: "Use high-grade matte or smooth glossy/satin resin-coated inkjet photo paper (200–260 gsm)—plain 80 gsm office paper fails government sharpness and ink-longevity standards.",
      },
    ],
    stepsH2: "Step-by-step: print using A4 or 4x6 passport sheets",
    stepsIntro:
      "Complete these exact formatting and calibration checks so print multiple passport size photos on one page outputs hold official millimetre tolerance cleanly.",
    steps: [
      {
        heading: "Step 1: Check your country's photo rules",
        body: "Every issuing authority publishes strict head-height, eye-level band, and background contrast targets (for example UK/EU/AU 35 × 45 mm typically asks for a 29–34 mm chin-to-crown face size).",
      },
      {
        heading: "Step 2: Crop to the exact size",
        body: "Verify image framing matches your exact regional aspect ratio so heads neither squeeze horizontally nor crop ears.",
        sub: [
          {
            h4: "35x45 mm layout",
            body: "Standard across the UK, EU, Schengen visas, Australia, New Zealand, and Canada (varies cleanly by doc—always check local official specs!): leaves clean room for 6 prints on 4×6 or 16+ on A4.",
          },
          {
            h4: "2x2 inch layout",
            body: "US Passport & Green Card standard (51 × 51 mm): neatly fits up to 6 prints across a 4×6 postcard sheet (3×2 grid) or 12+ on A4/Letter.",
          },
        ],
      },
      {
        heading: "Step 3: Place photos in a grid",
        body: "Maintain a tidy 3–5 mm white gap between passport boxes with crisp hairline corner trim marks so cutting never slices across white border checks or clothing edges.",
      },
      {
        heading: "Step 4: Print at 100% scale",
        body: "Open your sheet PDF and confirm Scale = 100% / Actual Size (Borderless OFF!) before pressing Print—even a tiny 4% printer shrink turns a 35 mm portrait into a rejected 33.6 mm cut.",
        sub: [
          {
            h4: "Print multiple passport size photos on one page",
            body: "When producing print multiple passport size photos on one page sets for school IDs or family travel renewals, double-check physical width with a metric ruler on sheet 1.",
          },
          {
            h4: "Photo lab alternative",
            body: "No photo printer at home? Export a 4×6 in (102 × 152 mm) 300 DPI multi-passport sheet, carry the file on USB to any retail 4×6 photo kiosk, and pay pennies for one standard 4×6 chemical lab print.",
          },
        ],
      },
      {
        heading: "Step 5: Cut along the guides",
        body: "Use a sliding rotary trimmer or sharp craft blade alongside a steel straightedge—freehand office scissors often leave wavy uneven edges rejected by passport scanners.",
      },
    ],
    fixesIntro:
      "Government offices reject ID sheets aggressively on minor scaling or exposure flaws—check all three before submitting applications.",
    fixes: [
      {
        h3: "Photos are not the right size",
        body: "Measure finished cut boxes carefully with a millimetre ruler! If slightly tiny, 'Fit to Printable Area' or Borderless expansion was active in your print driver. Re-export PDF and lock Actual Size 100%.",
      },
      {
        h3: "Face is cropped too tightly",
        body: "Ensure shoulders and full hair crown remain generously visible inside the original portrait photo BEFORE selecting passport tile ratios so automatic Cover crops don't slice hair tops.",
      },
      {
        h3: "Prints look washed out",
        body: "Verify driver Media Type matches Glossy/Semi-Gloss Photo Paper rather than Plain Paper, and run printer nozzle-check cleaning if magenta/cyan tints shift skin tones unnaturally.",
      },
    ],
    fasterIntro:
      "Stop pasting passport squares inside flaky word-processor margins—lock millimetre-accurate grid PDFs automatically.",
    fasterSub1Body:
      "Our passport layout templates fix exact 35 × 45 mm or 2 × 2 inch frames onto A4 or 4×6 canvases at 100% true print coordinates in seconds.",
    fasterToolHeading: "Passport photo sheet maker",
    fasterToolTarget: "T06",
    fasterToolAnchor: "passport size photo maker a4 sheet",
    fasterToolBody:
      "Generate an aligned 35 × 45 mm or 2 × 2 in passport photo grid on A4 (or switch to 4×6 kiosk templates) directly in your browser.",
    complianceCallout: {
      variant: "rules",
      title: "Check local official passport & visa rules before submitting",
      body: "Print Sheet Maker strictly helps arrange correctly sized photos onto printable sheets—it does NOT verify biometric rules. Always check your country's official passport authority guidelines for required dimensions, head-height ratios, paper finish (matte vs glossy limits), and background colour rules before mailing.",
    },
    faqs: [
      {
        q: "How to print multiple passport size photos on one page?",
        a: "For reliable how to print multiple passport size photos on one page output, upload your compliant photo into Print Sheet Maker's Passport Photo Sheet Maker (A4) or 4×6 template, lock 35 × 45 mm or 2 × 2 in sizing, export at 100% PDF, and cut neatly along guides.",
      },
      {
        q: "How many passport photos fit on A4?",
        a: "A portrait A4 page comfortably accommodates 12 to 20 standard 35 × 45 mm prints (with easy cutting gutters) or 12 classic 2 × 2 inch US passport portraits.",
      },
      {
        q: "Can I use a photo lab instead of printing at home?",
        a: "Yes—build a 6-up 4×6 passport sheet template first, save it as a crisp high-res JPEG/PDF, and order one cheap standard 4×6 print at any local store photo counter.",
      },
    ],
    relatedH3s: [
      {
        heading: "Passport photo sheet maker",
        targetId: "T06",
        anchor: "passport size photo maker a4 sheet",
        desc: "Fit up to 20 standard passport/ID photos cleanly on one A4 PDF sheet.",
      },
      {
        heading: "Passport photo template 4x6",
        targetId: "T07",
        anchor: "4x6 passport template",
        desc: "Pack 4 or 6 passport prints neatly onto affordable 4×6 lab postcard stock.",
      },
    ],
  }),

  H13: buildHowToContent({
    id: "H13",
    hubId: "HB-PH",
    hubAnchor: "photo layout maker for printing",
    subtitle:
      "Load 4×6 glossy paper cleanly without jams, match driver settings to prevent borders, and trim costs per snapshot at home.",
    intro: [
      "Knowing how to print 4x6 photos at home puts spontaneous keepsakes, scrapbook moments, and mini greeting cards right at your desk anytime. While nearly every modern home inkjet supports compact 4 × 6 inch (102 × 152 mm) postcard packs, skipped tray sliders, wrong Paper Size menus, and forgotten Borderless switches routinely burn costly coated paper on thick awkward white stripes.",
      "Walk through these five physical home photo printer 4x6 steps—fixing edge cropping and rear-tray feeding snags along the way.",
    ],
    needsIntro:
      "Check tray width guides and glossy sheet coating compatibility before queuing your first 4×6 snapshot.",
    needs: [
      {
        h3: "A photo printer or inkjet that supports 4x6",
        body: "Look for physical plastic width-slider rails inside either a dedicated top-rear photo slot or main tray marked clearly with '4×6 / 10×15 cm' notch detents.",
      },
      {
        h3: "4x6 photo paper",
        body: "Use dedicated inkjet-compatible 200–260 gsm Glossy, Semi-Gloss/Satin, or Matte 4×6 inch photo cards (stored flat inside sealed sleeves between runs so curling doesn't catch print heads).",
      },
    ],
    stepsH2: "Step-by-step: print using a home photo printer",
    stepsIntro:
      "Follow these physical loading and driver ticks to print 4x6 photos at home cleanly without edge borders or roller tracks.",
    steps: [
      {
        heading: "Step 1: Choose a 4x6 photo template",
        body: "Check whether you want one full 4×6 print or multiple mini photos packed onto 4×6 stock (like 4-up wallets or 2-up booth strips). Prepare the file at crisp 1,200 × 1,800 px (300 DPI) cleanly.",
      },
      {
        heading: "Step 2: Load 4x6 paper in the correct tray",
        body: "Check tray orientation icons stamped into the plastic feeder—some printers require the shiny printable face DOWN inside a bottom cassette, while rear vertical feeds almost always load shiny face UP facing you!",
        sub: [
          {
            h4: "Home photo printer 4x6 options",
            body: "Modern home photo printer 4x6 feeders slide plastic width guides tightly flush against both sides of the stack so sheets never twist skewed halfway past inkjet nozzles.",
          },
          {
            h4: "Borderless printing",
            body: "Want edge-to-edge full bleed postcard gloss with zero white rim? Turn ON Borderless Printing inside the print driver when printing 1 full photo—yet turn Borderless OFF whenever printing delicate collages or passport grids!",
          },
        ],
      },
      {
        heading: "Step 3: Set paper size to 4x6 or 6x4",
        body: "Inside your Windows/macOS print popup, change Paper Size from Letter/A4 down to '4 × 6 in (10 × 15 cm)' or '4×6 Borderless', and verify Orientation (Portrait vs Landscape) matches your image.",
      },
      {
        heading: "Step 4: Choose high quality",
        body: "Match Media Type strictly to 'Photo Paper Glossy' (or Semi-Gloss/Matte) and toggle Quality = High so deep shadows look velvety rich.",
        sub: [
          {
            h4: "At home photo printer 4x6 paper tips",
            body: "Following smart at home photo printer 4x6 maintenance—never touching coated glossy faces with bare fingers—keeps fingerprints invisible beneath clear ink.",
          },
          {
            h4: "Ink and paper cost",
            body: "Buying bulk 100-sheet glossy 4×6 packs averages \$0.10–\$0.16 per sheet; paired with refillable tank ink (\$0.02–\$0.05 per print), home 4×6 snapshots cost ~\$0.15–\$0.20 each.",
          },
        ],
      },
      {
        heading: "Step 5: Print and let ink dry",
        body: "Remove finished 4×6 cards gently by the narrow edges and lay them single-file across a clean desk for 10–15 minutes before stacking or slipping into clear plastic album pockets.",
      },
    ],
    fixesIntro:
      "Even dedicated photo inkjets misfeed 4×6 postcards occasionally—solve borders, crops, and pickup roller slips below.",
    fixes: [
      {
        h3: "White borders appear",
        body: "You either left 'Borderless' unchecked inside Print Settings OR your smartphone captured a wider 16:9 / 4:3 frame rather than native 3:2 (4×6). Either crop slightly beforehand to 3:2 or enable 'Fill Frame + Borderless'.",
      },
      {
        h3: "Photos print cropped",
        body: "Notice Borderless drivers intentionally zoom images ~3% past physical edges to wipe off mechanical tolerance. Keep subjects' foreheads, ears, and text signatures 4–5 mm inward away from borders!",
      },
      {
        h3: "Paper jams in the rear tray",
        body: "Don't stuff 40 stiff glossy cards into an angled rear slot at once—load 5–10 sheets maximum, flex the top curl gently flat backward beforehand, and wipe dust off pickup rubber wheels with a slightly damp lint-free cloth.",
      },
    ],
    fasterIntro:
      "Printing mini wallet collages, photo-booth strips, or bordered clean frames onto 4×6 cards without Photoshop cropping hassle?",
    fasterSub1Body:
      "Build ready-to-print 1-up, 2-up, or 4-up 4×6 PDF sheets cleanly in your browser so orientation, margins, and aspect framing lock accurately before touching glossy cards.",
    fasterToolHeading: "Printable 4x6 photo template",
    fasterToolTarget: "T08",
    fasterToolAnchor: "4x6 photo template",
    fasterToolBody:
      "Open Printable 4x6 Photo Template to frame single clean bordered 4×6 snapshots or split A4 paper neatly into twin 4R cards free.",
    faqs: [
      {
        q: "Can I print 4x6 photos at home?",
        a: "Yes—when you print 4x6 photos at home using coated inkjet 4×6 paper, correct Glossy Media Type settings, and High Quality output, home inkjets match commercial kiosk clarity effortlessly.",
      },
      {
        q: "What is the best home photo printer for 4x6?",
        a: "Six-colour dye inkjets (like Epson EcoTank Photo or Canon PIXMA G/TS series) deliver gorgeous skin tones and whisper-low ink costs compared to tiny triple-colour cartridge printers—turning any desk into an affordable home photo printer 4x6 setup.",
      },
      {
        q: "How much does it cost to print a 4x6 photo at home?",
        a: "Expect roughly \$0.15–\$0.22 total per print using bulk 4×6 glossy paper + ink-tank bottles, rising closer to \$0.40–\$0.65+ if running small replacement ink cartridges.",
      },
    ],
    relatedH3s: [
      {
        heading: "Print multiple 4x6 photos on one page",
        targetId: "G04",
        anchor: "4r photo size in a4 paper",
        desc: "Fit two full 4×6 (4R) keepsakes cleanly onto A4 sheets when you run out of 4×6 packs.",
      },
      {
        heading: "Printable 4x6 photo template",
        targetId: "T08",
        anchor: "4x6 photo template",
        desc: "Design crisp single or multi-frame 4×6 layouts immediately in your browser.",
      },
    ],
  }),

  H14: buildHowToContent({
    id: "H14",
    hubId: "HB-JB",
    hubAnchor: "label designs for jars",
    subtitle:
      "Build custom jam, mason jar, and spice tables cleanly inside Microsoft Word—plus why locked vector PDFs skip alignment shifts.",
    intro: [
      "Knowing how to set up a jar label template word file inside Microsoft Word lets home cooks and crafters format matching jam, spice, and pantry stickers using software already sitting on their laptop. While Word's Mailings tab creates quick table cells in seconds, typing oversized spice names quietly stretches rows downward unless fixed cell dimensions stay locked.",
      "Follow this five-step Word table routine covering jam jar grids, spice racks, and canning margins—plus fixes when tables shift across rows and a faster browser PDF alternative.",
    ],
    needsIntro:
      "Grab your blank label sheet code and physical jar measurements before creating the Word document table.",
    needs: [
      {
        h3: "Microsoft Word",
        body: "Use desktop Microsoft Word (Windows or Mac); web browser Word Online strips out crucial Mailings -> Labels layout wizards and precise table-height locking controls.",
      },
      {
        h3: "Your label sheet product number",
        body: "Find the SKU code on your blank adhesive sheet box (or use a steel ruler to note top/left margins, single label width × height, and horizontal/vertical gaps).",
      },
    ],
    stepsH2: "Step-by-step: print using Microsoft Word",
    stepsIntro:
      "Use these five disciplined steps whenever creating a clean jar label template word grid for preserves, pantry staples, or herbs.",
    steps: [
      {
        heading: "Step 1: Open Mailings, Labels and choose your sheet",
        body: "Open a blank document -> click the Mailings tab -> Labels -> Options -> pick your vendor sheet number (or click New Label to enter ruler measurements) -> click OK -> click New Document so your grid opens as an editable full-sheet table.",
      },
      {
        heading: "Step 2: Insert a table sized to the labels",
        body: "Click Table Layout -> View Gridlines so faint blue cell boundaries display on screen without accidentally printing black outlines around every die-cut sticker. Crucial step: under Table Properties -> Row, check Specify height and select 'Exactly' so long words never expand a row downward!",
        sub: [
          {
            h4: "Jam label template Word",
            body: "When formatting a jam label template word grid (often 8-up or 14-up rectangles), centre-align cell content both horizontally and vertically inside Table Layout alignment icons.",
          },
          {
            h4: "Mason jar label template Word",
            body: "Building a mason jar label template word grid? Add an extra bottom cell line for 'Made On / Best Before' inside crisp 63.5 × 38.1 mm pantry cells or 50 mm square blocks.",
          },
        ],
      },
      {
        heading: "Step 3: Type your first label",
        body: "Format cell 1 cleanly using clean readable typography (keep text 2.5–3 mm away from grid borders via Cell Margins inside Table Properties).",
      },
      {
        heading: "Step 4: Copy it to every cell",
        body: "Duplicate identical jam batches cleanly across every cell, OR type distinct herbs cell-by-cell when printing custom rack spice strips.",
        sub: [
          {
            h4: "Spice label template Word",
            body: "Creating a crisp spice label template word list? Stick consistently to single-line bold names (e.g. CUMIN, CORIANDER, OREGANO) at one uniform font size so rows never wobble.",
          },
          {
            h4: "Round label tweaks",
            body: "Notice Word tables remain rectangular even when your physical sticker sheet holds circular lid discs! Inside each square cell, stick tightly to short centred lines inside an invisible inner circle so letters never touch curved peel rims.",
          },
        ],
      },
      {
        heading: "Step 5: Print one test page",
        body: "Print onto plain 80 gsm sheet paper first, hold it directly behind a blank adhesive sheet up against daylight to confirm grid accuracy, then print at 100% scale.",
      },
    ],
    fixesIntro:
      "Word's dynamic table auto-sizing loves ruining pre-cut sticker registration—repair all three glitches before printing matte packs.",
    fixes: [
      {
        h3: "Table cells shift on printing",
        body: "Verify Table Properties -> Options -> UNCHECK 'Automatically resize to fit contents' AND lock every Row Height mode from 'At least' to 'Exactly'. Leaving 'At least' lets any wrapped line nudge rows 2–8 clean off the sheet.",
      },
      {
        h3: "Text overflows the label",
        body: "Keep spice/ingredient font sizes modest (9–11 pt readable caps/serif) and widen internal left/right cell padding inside Table Properties -> Cell Margins rather than manually hitting Spacebar.",
      },
      {
        h3: "Fonts change on another computer",
        body: "Downloaded script fonts disappear if opening your .docx on a friend's laptop, wrapping rows wildly. Always click File -> Save As -> PDF inside Word right before moving files across computers or printers!",
      },
    ],
    fasterIntro:
      "Tired of hunting down hidden 'Exactly' row-height checkboxes inside Microsoft Word just to print spice rack stickers?",
    fasterSub1Body:
      "Our browser jar label studio fixes row heights, padding, circle lid margins, and A4/Letter dimensions natively into an exact vector PDF—zero Word formatting required.",
    fasterToolHeading: "Jar label template",
    fasterToolTarget: "T24",
    fasterToolAnchor: "free printable jar labels",
    fasterToolBody:
      "Open Jar Label Template right in your browser to type flavour, spice, or canning lines into locked grids and export ready-to-print PDFs free.",
    complianceCallout: {
      variant: "affiliation",
      title: "Independent Word Tutorial & Local Labelling Note",
      body: "Print Sheet Maker is independent and not affiliated with Microsoft Corporation. If printing labels for retail jams, spice blends, or foods for commercial sale, always check local food-safety rules for mandatory allergen and net-weight labels.",
    },
    faqs: [
      {
        q: "Is there a jar label template in Word?",
        a: "Yes—inside desktop Word's Mailings -> Labels -> Options menu you can pick pre-cut sheet codes (or define custom jar dimensions) to build a jar label template word table grid cleanly.",
      },
      {
        q: "How do I make a spice labels word template?",
        a: "To make a crisp spice labels word template without slipping rows, set your Word label table's Row Height strictly to 'Exactly', disable auto-resize, stay concise inside cell margins, and save to PDF before printing—or build it directly in Print Sheet Maker's Spice Labels tool.",
      },
      {
        q: "Can I make round labels in Word?",
        a: "Yes—even though Word draws square/rectangular table cells matching the label grid centres, typing centred lines safely inside each square lets text drop cleanly onto round pre-cut lid sheets.",
      },
    ],
    relatedH3s: [
      {
        heading: "Jar label template",
        targetId: "T24",
        anchor: "free printable jar labels",
        desc: "Build pantry, jam, and lid jar sheets directly in your browser without Word tables.",
      },
      {
        heading: "Spice labels printable",
        targetId: "T27",
        anchor: "spice jar labels printable",
        desc: "Customize full-kitchen minimalist spice rack and lid stickers straight to PDF.",
      },
    ],
  }),
};

