import type { PageContent, PageId, PageMeta } from "@/types/spec";
import { PAGES_META } from "@/data/site-meta";

export interface PageImageSpec {
  index: number; // 1..10
  slotSlug: string;
  src: string;
  alt: string;
  title: string;
  caption: string;
  badge: string;
  sectionHeading: string;
  specHighlights: [string, string, string];
  width: number;
  height: number;
}

export interface PageCtaButton {
  label: string;
  href: string;
  sublabel?: string;
}

export interface PageCtaConfig {
  heroPrimary: PageCtaButton;
  heroSecondary: PageCtaButton;
  midBanner: {
    eyebrow: string;
    heading: string;
    body: string;
    primary: PageCtaButton;
    secondary: PageCtaButton;
    trustPoints: [string, string, string];
  };
  sidebarCard: {
    eyebrow: string;
    heading: string;
    body: string;
    button: PageCtaButton;
    secondaryLink: PageCtaButton;
  };
  bottomCard: {
    eyebrow: string;
    heading: string;
    body: string;
    primary: PageCtaButton;
    secondary: PageCtaButton;
  };
}

/**
 * Registry of real Nano Banana WebP images populated phase-by-phase (8 pages per phase).
 * No synthetic SVG/card overlays—only genuine Nano Banana generated photography converted to WebP.
 */
function makeImageSpec(
  src: `/images/${string}.webp`,
  slotSlug: string,
  badge: string,
  title: string,
  alt: string,
  caption: string,
  sectionHeading: string,
  specHighlights: [string, string, string],
  index = 1
): PageImageSpec {
  return {
    index,
    slotSlug,
    src,
    alt,
    title,
    caption,
    badge,
    sectionHeading,
    specHighlights,
    width: 1200,
    height: 675,
  };
}

export const PHASE_GENERATED_IMAGES: Partial<Record<PageId, PageImageSpec[]>> = {
  HOME: [
    makeImageSpec(
      "/images/print-sheet-maker-studio-overview.webp",
      "studio-overview",
      "STUDIO ARCHITECTURE",
      "Print Sheet Maker Multi-Up Grid Blueprint",
      "Print Sheet Maker workspace blueprint showing multi-up A4 and 4x6 photo, business card, sticker, and jar label print sheets with trim marks",
      "Browser-based imposition engine generates 300 DPI PDF sheets with calibrated margins, gutters, and crop marks for home printers.",
      "Studio Capabilities at a Glance",
      ["300 DPI Vector PDF", "A4 / Letter / 4x6", "Zero Server Upload"],
      1
    ),
    makeImageSpec(
      "/images/a4-vs-us-letter-paper-dimensions-mm.webp",
      "paper-format-comparison",
      "PAPER STANDARDS",
      "A4 (210 x 297 mm) vs US Letter (8.5 x 11 in) Safe Margins",
      "Technical comparison diagram contrasting A4 210 by 297 mm and US Letter 215.9 by 279.4 mm printable grid areas and unprintable printer margins",
      "Compare exact width, height, and safe 5 mm home-printer margins between ISO A4 and ANSI US Letter stocks before exporting.",
      "Supported Paper Formats",
      ["A4: 210 x 297 mm", "Letter: 215.9 x 279.4 mm", "Actual Size (100%)"],
      2
    ),
  ],
  "HB-PH": [
    makeImageSpec(
      "/images/a4-photo-sheet-grid-layout-mm.webp",
      "a4-photo-sheet-grid",
      "PHOTO SHEET GRID",
      "A4 Multi-Up Photo Layout Grid & Cut Gutters",
      "Technical blueprint showing A4 multi-photo grid arrangement with configurable cell margins, corner trim guides, and 100 percent print scale",
      "Arrange 2, 4, 6, or 9 photos on A4, US Letter, or 4x6 glossy paper with equal cut gutters and zero aspect-ratio distortion.",
      "Multi-Up Photo Sheet Geometry",
      ["2-up to 16-up Grids", "Zero Aspect Distortion", "Custom Bleed & Gap"],
      1
    ),
    makeImageSpec(
      "/images/passport-photo-sheet-35x45mm-2x2in.webp",
      "passport-grid-preview",
      "ID PHOTO COMPLIANCE",
      "35x45 mm & 2x2 in Passport Photo 4x6 and A4 Sheet Geometry",
      "Diagram illustrating compliant 35 by 45 mm UK, EU, and Indian passport photos and 2 by 2 inch US passport photos nested on 4x6 and A4 sheets",
      "Generate biometric 35x45 mm or 2x2 inch ID photo sheets tiled cleanly onto 4x6-inch photo paper or full A4 sheets.",
      "Biometric Passport Presets",
      ["35x45 mm (EU/UK/IN)", "2x2 in (US 51x51 mm)", "Fits 4x6 & A4"],
      2
    ),
  ],
  "HB-BC": [
    makeImageSpec(
      "/images/business-card-10up-sheet-crop-marks.webp",
      "business-card-10up",
      "10-UP CARD GRID",
      "10-Up Business Card Sheet with Trim & Bleed Marks",
      "Blueprint showing ten standard 3.5 by 2 inch business cards arranged in a 2-by-5 imposition grid with corner trim crop marks on Letter and A4",
      "Impose 10 standard 3.5x2 in (US) or 85x55 mm (EU/UK) cards per sheet with corner crop marks and 3 mm bleed extension.",
      "Standard 10-Up Card Imposition",
      ["3.5x2 in & 85x55 mm", "Avery 8371 / C32011", "Corner Crop Marks"],
      1
    ),
    makeImageSpec(
      "/images/double-sided-business-card-duplex-alignment.webp",
      "duplex-alignment",
      "DUPLEX REGISTRATION",
      "Front & Back Double-Sided Card Mirror Flip Guide",
      "Diagram showing horizontal page-2 mirroring for double-sided business card printing on manual duplex home printers",
      "Center-mirrored front and back PDF imposition keeps double-sided card edges aligned within home duplex mechanical tolerances.",
      "Double-Sided Printing Alignment",
      ["Mirrored Back Page", "Center-Symmetric Grid", "Long-Edge Duplex"],
      2
    ),
  ],
  "HB-LS": [
    makeImageSpec(
      "/images/a4-label-sticker-sheet-grid-dimensions.webp",
      "a4-label-grid",
      "STICKER & LABEL GRIDS",
      "A4 Label & Die-Cut Sticker Sheet Matrix Dimensions",
      "Dimensional blueprint displaying A4 210 by 297 mm adhesive label rows, columns, vertical pitch, horizontal pitch, and top-left start offsets",
      "Match precut Avery A4/Letter label pitches or lay out kiss-cut sticker sheets with crisp dark borders and barcode/QR zones.",
      "Precision Sheet Pitch Geometry",
      ["21 to 65 Labels / A4", "Exact Row/Col Pitch", "300 DPI Barcodes"],
      1
    ),
    makeImageSpec(
      "/images/round-circle-label-sheet-diameter-grid.webp",
      "circle-label-matrix",
      "ROUND CIRCLE LABELS",
      "Circular Sticker & Lid Seal Diameter Packing Grid",
      "Geometric layout diagram of 25 mm, 38 mm, 50 mm, and 63 mm circular sticker labels arranged with even gaps on an A4 sheet",
      "Pack round seals and product stickers in clean circular grids sized from 25 mm tamper tabs to 63.5 mm jar toppers.",
      "Circular Seal & Topper Packing",
      ["25 to 75 mm Circles", "Even Gutter Spacing", "Curved Ring Safe Zone"],
      2
    ),
  ],
  "HB-JB": [
    makeImageSpec(
      "/images/jar-wrap-label-circumference-lid-diagram.webp",
      "jar-circumference-diagram",
      "JAR WRAP CALCULATOR",
      "Cylindrical Jar Circumference (pi x d) & Wrap Label Sizing",
      "Diagram showing jar diameter to circumference calculation pi times d minus seam gap alongside flat rectangular wrap and round lid labels",
      "Convert jar or bottle diameter into exact wraparound label width with a clean 4 mm overlap gap plus matching top lid seals.",
      "Wraparound & Lid Sizing Formula",
      ["Width = pi x Diameter", "3–5 mm Seam Gap", "Square & Oval Shapes"],
      1
    ),
    makeImageSpec(
      "/images/round-circle-label-sheet-diameter-grid.webp",
      "jar-lid-seals",
      "TOP LID LABELS",
      "Mason, Spice & Candle Jar Lid Sticker Diameter Grid",
      "Printable sheet layout illustrating circular spice jar and mason lid stickers tiled cleanly for hand trimming or craft punches",
      "Pair front jar wraps with matching 38 mm to 70 mm circular lid seals on the same 300 DPI A4 or Letter PDF workflow.",
      "Coordinated Lid Toppers",
      ["38 mm Spice Lids", "70 mm Regular Mason", "86 mm Wide-Mouth"],
      2
    ),
  ],
  T01: [
    makeImageSpec(
      "/images/a4-photo-sheet-grid-layout-mm.webp",
      "photo-sheet-grid",
      "FLEXIBLE PHOTO GRID",
      "Arrange Multiple Photos on One A4 or Letter Sheet",
      "Diagram illustrating custom multi-photo row and column imposition on A4 and US Letter with independent cell padding and crop guides",
      "Drop heterogeneous photos into a uniform multi-up grid on A4, Letter, or 4x6 paper without cropping subjects unexpectedly.",
      "How the Photo Grid Calculator Works",
      ["Custom Rows x Cols", "Cover or Contain Fit", "A4 / Letter / 4x6"],
      1
    ),
  ],
  T02: [
    makeImageSpec(
      "/images/a4-photo-sheet-grid-layout-mm.webp",
      "two-photo-sheet",
      "2-UP HALF-PAGE SHEET",
      "Print 2 Photos Per Page (13x18 cm / 5x7 in Equivalent)",
      "Technical sheet diagram demonstrating two large 5x7 inch equivalent photo slots stacked horizontally or vertically on one A4 sheet",
      "Split one A4 or Letter sheet into two crisp 5x7-sized portrait or landscape slots with a clean 5 mm center trim gutter.",
      "2-Up Sheet Layout Specifications",
      ["2 Large Slots / Page", "~13 x 18 cm (5x7 in)", "50% Paper Savings"],
      1
    ),
  ],
  T03: [
    makeImageSpec(
      "/images/a4-photo-sheet-grid-layout-mm.webp",
      "four-photo-sheet",
      "4-UP QUADRANT SHEET",
      "Print 4 Photos on One A4 or Letter Sheet (2x2 Grid)",
      "Four-quadrant 2 by 2 photo sheet diagram showing balanced top, bottom, and center cut margins for framing or scrapbooking",
      "Tile four 9x13 cm (approx. 3.5x5 in) photos in a symmetric 2x2 grid on A4 or Letter cardstock with one vertical and one horizontal cut.",
      "2x2 Four-Photo Sheet Geometry",
      ["2x2 Symmetric Grid", "~9 x 13 cm Per Photo", "Single Cross Cut"],
      1
    ),
  ],
  T04: [
    makeImageSpec(
      "/images/a4-photo-sheet-grid-layout-mm.webp",
      "duplicate-photo-sheet",
      "DUPLICATE STEP-AND-REPEAT",
      "Step-and-Repeat Single Image Across Full Print Sheet",
      "Step-and-repeat imposition blueprint repeating one photo 4, 8, 9, or 16 times across an A4 sheet with uniform trim lines",
      "Upload one photo once and tile identical wallet prints, event tickets, or product thumbnails cleanly across an entire page.",
      "Duplicate Photo Sheet Repetition",
      ["Upload Once, Tile N-Up", "4 to 24 Copies/Page", "Identical Scale Lock"],
      1
    ),
  ],
  T05: [
    makeImageSpec(
      "/images/multi-page-poster-tiling-grid.webp",
      "poster-tile-grid",
      "MULTI-PAGE POSTER SPLIT",
      "Slice One High-Resolution Image Across 2x2 to 4x4 Pages",
      "Poster tiling diagram dividing a high-resolution artwork into numbered A4 tile sheets with 10 mm glue overlap strips",
      "Enlarge banners and wall art onto standard home A4 or Letter sheets with numbered tile markers and clean glue-overlap margins.",
      "Poster Tiling & Seam Alignment",
      ["2x2, 3x3 & 4x4 Tiles", "10 mm Glue Overlap", "Auto Row-Col Labels"],
      1
    ),
  ],
  T06: [
    makeImageSpec(
      "/images/passport-photo-sheet-35x45mm-2x2in.webp",
      "passport-a4-sheet",
      "35x45 MM & 2x2 IN",
      "Official Passport Photo Sheet Fit (A4 & Letter)",
      "Calibrated 35 by 45 mm UK, EU, Schengen, Australian, and Indian passport photo grid alongside 2 by 2 inch US passport slots",
      "Generate biometric passport, visa, and driving license grids sized to exact millimeter dimensions on A4, Letter, or 4x6 stock.",
      "Country Passport Size Matrix",
      ["UK/EU/AU/IN: 35x45 mm", "US/India Visa: 2x2 in", "8 to 20 Prints/A4"],
      1
    ),
  ],
  T07: [
    makeImageSpec(
      "/images/passport-photo-sheet-35x45mm-2x2in.webp",
      "passport-4x6-card",
      "4x6 INCH PHOTO PAPER",
      "Fit 4 or 6 Biometric Passport Photos on One 4x6 Sheet",
      "4 by 6 inch lab-print diagram demonstrating 6 European 35 by 45 mm photos or 6 slightly trimmed US 2 by 2 inch slots without scaling errors",
      "Turn cheap kiosk or drugstore 4x6-inch photo prints into 6 compliant passport photos for a fraction of booth pricing.",
      "4x6 Kiosk Print Optimization",
      ["6x 35x45 mm per 4x6", "4x/6x 2x2 in on 4x6", "100% Scale Export"],
      1
    ),
  ],
  T08: [
    makeImageSpec(
      "/images/a4-photo-sheet-grid-layout-mm.webp",
      "4x6-photo-template",
      "4x6 (10x15 CM) STOCK",
      "Printable 4x6 Photo Sheet Grid & Margin Templates",
      "Blueprint showing 1-up, 2-up 3x4 in, and 4-up wallet splits tailored cleanly inside 101.6 by 152.4 mm (4x6 inch) borderless or bordered prints",
      "Create clean 1-up 4x6 prints, 2-up 3x4 photos, or 4-up wallet cards calibrated for standard 10x15 cm glossy paper.",
      "4x6 Stock Sub-Grid Options",
      ["101.6 x 152.4 mm Exact", "Borderless or 3 mm", "Wallet & 2-Up Splits"],
      1
    ),
  ],
  T09: [
    makeImageSpec(
      "/images/a4-photo-sheet-grid-layout-mm.webp",
      "4x6-collage-grid",
      "4x6 COLLAGE LAYOUT",
      "Arrange 2 to 9 Memory Shots Inside One 4x6 Print",
      "4x6 collage grid layout showing balanced multi-photo cells separated by crisp white borders inside a 4 by 6 inch postcard frame",
      "Compose clean 2-shot, 4-shot, or 6-shot photo collages exported at full 300 DPI (1200 x 1800 px) ready for any 4x6 printer or lab.",
      "4x6 Collage Spacing Rules",
      ["1200 x 1800 px @300", "2 to 9 Photo Cells", "Balanced White Gutters"],
      1
    ),
  ],
  T10: [
    makeImageSpec(
      "/images/a4-photo-sheet-grid-layout-mm.webp",
      "a4-collage-grid",
      "A4 PHOTO COLLAGE",
      "Full-Bleed & Bordered A4 (210 x 297 mm) Collage Grid",
      "Full-page A4 collage schematic illustrating symmetric 4, 6, 9, and 12 frame grids scaled for home inkjet photo paper",
      "Build crisp, frame-ready A4 photo collages on 210x297 mm paper with adjustable white frame padding and zero compression artifacts.",
      "Frame-Ready A4 Collage Export",
      ["2480 x 3508 px @300", "3x2, 3x3 & 4x3 Grids", "Frame-Safe Margins"],
      1
    ),
  ],
  T11: [
    makeImageSpec(
      "/images/business-card-10up-sheet-crop-marks.webp",
      "card-10up-imposition",
      "10-UP SHEET IMPOSITION",
      "Print 10 Business Cards on One A4 or Letter Sheet",
      "Diagram of a 2-column by 5-row 10-up business card sheet showing exact 88.9 by 50.8 mm and 85 by 55 mm cell boundaries",
      "Pack 10 professional business cards per page with crisp corner crop lines and zero image compression for straight-edge guillotine cuts.",
      "10-Up Sheet Dimensions",
      ["US: 3.5 x 2 in (10-up)", "EU/UK: 85 x 55 mm", "Crop Marks Included"],
      1
    ),
  ],
  T12: [
    makeImageSpec(
      "/images/business-card-10up-sheet-crop-marks.webp",
      "printable-card-sheet",
      "CUSTOMIZABLE CARDS",
      "Design & Print 10 Cards Per Page Direct from Browser",
      "Technical diagram showing editable typography safe zones, QR code placement, and cut boundaries inside printable business card cells",
      "Customize brand name, role, phone, website, and optional vector QR code across a full 10-card cardstock PDF sheet.",
      "Card Stock & Safe-Zone Spec",
      ["250–350 gsm Cardstock", "Vector Text + QR", "3 mm Inner Safe Zone"],
      1
    ),
  ],
  T13: [
    makeImageSpec(
      "/images/business-card-10up-sheet-crop-marks.webp",
      "card-template-grid",
      "MINIMALIST CARD GRID",
      "Print-Ready Business Card Template Typography & Grid",
      "Blueprint showing clean business card safe-margin grid, hierarchy zones for logo/name/contact, and bleed trim lines",
      "Start from balanced minimalist card templates pre-spaced at 10 cards per sheet on Letter or A4 heavy matte paper.",
      "Card Safe-Zone Guidelines",
      ["3.5 x 2 in Standard", "100% Vector Fonts", "Instant PDF Sheet"],
      1
    ),
  ],
  T14: [
    makeImageSpec(
      "/images/double-sided-business-card-duplex-alignment.webp",
      "online-card-duplex",
      "FRONT + BACK MAKER",
      "Double-Sided Business Card Sheet Alignment Blueprint",
      "Duplex printing alignment schematic displaying Page 1 card fronts paired with horizontally mirrored Page 2 card backs",
      "Design custom single-sided or mirrored double-sided business cards with QR codes and instant 10-up PDF download.",
      "Duplex Card Back Mirroring",
      ["QR Code Supported", "Front + Mirrored Back", "Zero Watermarks"],
      1
    ),
  ],
  T15: [
    makeImageSpec(
      "/images/business-card-10up-sheet-crop-marks.webp",
      "avery-card-layout",
      "AVERY PERFORATED GRID",
      "Perforated Avery 8371 / 8871 / C32011 Card Alignment",
      "Dimensional template matching Avery 10-up perforated business card sheet offsets, top margins, and vertical gutters",
      "Align perfectly with pre-perforated Avery 5371, 8371, 8871 (US Letter) and C32011 (A4) micro-perforated business card packs.",
      "Avery Micro-Perf Coordinates",
      ["Letter: 19 mm Top Offset", "A4 C32011: 15x11 mm", "Flush 0 mm Card Edges"],
      1
    ),
  ],
  T16: [
    makeImageSpec(
      "/images/business-card-10up-sheet-crop-marks.webp",
      "visiting-card-sheet",
      "VISITING CARD SHEET",
      "90x50 mm & 85x55 mm Regional Visiting Card Layouts",
      "Regional visiting card blueprint comparing 90 by 50 mm Indian/Commonwealth standard against 85 by 55 mm UK/EU and 88.9 by 50.8 mm US formats",
      "Format compact 90x50 mm Indian/Eastern European visiting cards or 85x55 mm UK/EU cards neatly 10-up per A4 sheet.",
      "International Visiting Card Sizes",
      ["IN: 90 x 50 mm", "UK/EU: 85 x 55 mm", "US: 88.9 x 50.8 mm"],
      1
    ),
  ],
  T17: [
    makeImageSpec(
      "/images/a4-label-sticker-sheet-grid-dimensions.webp",
      "printable-label-sheet",
      "CUSTOM LABEL GRID",
      "Configurable Row, Column, Pitch & Margin Label Sheet",
      "Diagram breaking down label height, label width, horizontal pitch, vertical pitch, and top-left margin offsets on A4 label paper",
      "Build sharp rectangular labels with custom text, SKU badges, or borders tailored to any plain or die-cut sticker pack.",
      "Label Sheet Dimension Controls",
      ["1 to 65 Labels / Sheet", "Live Pitch Preview", "Border Toggle Included"],
      1
    ),
  ],
  T18: [
    makeImageSpec(
      "/images/a4-label-sticker-sheet-grid-dimensions.webp",
      "a4-label-template",
      "A4 LABEL PITCH MATRIX",
      "Standard A4 1-Up, 8-Up, 21-Up & 24-Up Label Geometry",
      "A4 sticker label sheet schematic displaying common 21-up 63.5 by 38.1 mm, 24-up 70 by 37 mm, and 8-up 99.1 by 67.7 mm formats",
      "Choose ready-calibrated A4 8-up, 14-up, 21-up, or 24-up label templates compatible with popular Avery L7160 and J8160 sheets.",
      "Popular A4 Label Codes Supported",
      ["L7160 (21-Up 63.5x38)", "L7163 (14-Up 99x38)", "A4 210 x 297 mm Exact"],
      1
    ),
  ],
  T19: [
    makeImageSpec(
      "/images/round-circle-label-sheet-diameter-grid.webp",
      "round-label-grid",
      "CIRCLE DIE-CUT GRID",
      "Round Sticker Diameter Grid (25 mm to 63.5 mm)",
      "Technical grid illustrating crisp circular sticker labels on an A4 sheet with curved safe-margin rings and trim paths",
      "Create circular favor stickers, bottle lid seals, and bakery toppers from 25 mm up to 63.5 mm with centered circular trim outlines.",
      "Round Sticker Sizing Options",
      ["25 / 38 / 50 / 63.5 mm", "Centered Text Safe Zone", "Faint Cut Rings"],
      1
    ),
  ],
  T20: [
    makeImageSpec(
      "/images/a4-label-sticker-sheet-grid-dimensions.webp",
      "address-label-sheet",
      "SHIPPING & RETURN MAIL",
      "14-Up & 21-Up A4 Address & Parcel Label Grid",
      "Address label imposition guide showing sender return block and large recipient address block formatting inside 99.1 by 38.1 mm and 63.5 by 38.1 mm cells",
      "Print crisp return-address mailers (21-up) or shipping parcel labels (8-up / 14-up) cleanly onto A4 Avery or blank adhesive paper.",
      "Mail & Parcel Label Formats",
      ["Return: 63.5 x 38.1 mm", "Parcel: 99.1 x 67.7 mm", "Auto Batch Repeat"],
      1
    ),
  ],
  T21: [
    makeImageSpec(
      "/images/a4-label-sticker-sheet-grid-dimensions.webp",
      "barcode-a4-sheet",
      "CODE 128 / EAN / UPC",
      "Sharp 300 DPI Vector Barcode Sticker Sheet on A4",
      "High-contrast barcode label blueprint showing quiet-zone padding around Code 128 and EAN-13 bars inside compact 48.5 by 25.4 mm and 63.5 by 38.1 mm cells",
      "Generate crisp black-and-white Code 128, EAN-13, or SKU inventory barcode sheets with mandatory quiet zones for instant scanner reads.",
      "Scanner-Safe Quiet Zone Spec",
      ["Code 128 / EAN-13", "Mandatory Quiet Zone", "24 to 40 SKUs / A4"],
      1
    ),
  ],
  T22: [
    makeImageSpec(
      "/images/a4-label-sticker-sheet-grid-dimensions.webp",
      "sticker-sheet-maker",
      "PRINT THEN CUT READY",
      "Custom A4 Sticker Sheet Grid with Die-Cut Outline",
      "A4 sticker sheet diagram showing graphic tiles surrounded by clean 2 mm cut outlines and corner calibration spacing for home trimming or craft plotters",
      "Arrange custom sticker designs across A4 vinyl or matte sticker paper with crisp outlines ready for scissors, trimmers, or Cricut.",
      "Sticker Paper & Cut Margin Rules",
      ["2–4 mm Bleed Buffer", "A4 Matte & Gloss Vinyl", "Zero Ink Smear Margins"],
      1
    ),
  ],
  T23: [
    makeImageSpec(
      "/images/a4-label-sticker-sheet-grid-dimensions.webp",
      "name-tag-sheet",
      "8-UP EVENT BADGES",
      "8-Up & 10-Up Printable Conference Name Tag Sheet",
      "Name tag sheet blueprint illustrating 8 large 99 by 68 mm badge frames with bold attendee first names, titles, and lanyard punch spacing",
      "Format clean 8-up adhesive or cardstock event badges with oversized bold attendee names legible from 2 meters away.",
      "Readable Badge Typography Spec",
      ["8-Up (~99 x 68 mm)", "Large First-Name Type", "Adhesive or Insert"],
      1
    ),
  ],
  T24: [
    makeImageSpec(
      "/images/jar-wrap-label-circumference-lid-diagram.webp",
      "jar-label-sheet",
      "CUSTOM JAR & LID MATRIX",
      "Jar Diameter to Label Width & Height Blueprint",
      "Technical diagram linking cylindrical jar body height and diameter circumference calculation to a printable sheet of front and lid stickers",
      "Measure jar circumference once and output front labels, ingredient backs, and matching circular lid seals on A4 waterproof sheets.",
      "Jar Measurement Checklist",
      ["Front + Lid Options", "Seamless Circumference", "Waterproof Vinyl Ready"],
      1
    ),
  ],
  T25: [
    makeImageSpec(
      "/images/jar-wrap-label-circumference-lid-diagram.webp",
      "mason-jar-sheet",
      "BALL & KERR MASON FIT",
      "Regular Mouth (70 mm) & Wide Mouth (86 mm) Mason Labels",
      "Blueprint showing exact 54 by 82 mm pantry front ovals and 60 mm / 75 mm circular lid labels sized for regular and wide-mouth mason jars",
      "Pre-sized canning, pickle, and pantry mason jar labels covering both flat side panels and 70 mm / 86 mm screw-band lids.",
      "Mason Mouth Diameter Presets",
      ["Regular Ring: 70 mm", "Wide Mouth: 86 mm", "Flat Side Panels"],
      1
    ),
  ],
  T26: [
    makeImageSpec(
      "/images/jar-wrap-label-circumference-lid-diagram.webp",
      "jam-jar-sheet",
      "PRESERVES & HONEY JARS",
      "Hex & Round Jam Jar Front, Wrap & Seal Labels",
      "Label layout blueprint for 190 ml and 370 ml jam jars showing scalloped front labels alongside narrow neck tamper seals",
      "Print classic preserve, chutney, and honey jar labels with allergen ingredient blocks, batch dates, and circular lid toppers.",
      "Cottage Food Label Fields",
      ["Allergen & Net Weight", "Batch Date Zone", "Lid Seal + Front"],
      1
    ),
  ],
  T27: [
    makeImageSpec(
      "/images/round-circle-label-sheet-diameter-grid.webp",
      "spice-jar-lids",
      "38 MM SPICE LID SEALS",
      "38 mm Round Lid Seals & 50x35 mm Spice Bottle Labels",
      "Sheet schematic showing 24 or 35 compact 38 mm round spice lid labels and narrow vertical body tags packed efficiently on one A4 sheet",
      "Organize an entire spice rack with matching 38 mm drawer-top lid circles and compact rectangular jar-front tags on a single sheet.",
      "Spice Rack Label Fit Guide",
      ["38 mm Top-Drawer Lids", "48x30 mm Small Glass", "24–35 Labels / A4"],
      1
    ),
  ],
  T28: [
    makeImageSpec(
      "/images/jar-wrap-label-circumference-lid-diagram.webp",
      "candle-vessel-sheet",
      "CANDLE VESSEL & WARNING",
      "4 oz, 8 oz & 9 oz Candle Vessel Wrap + Bottom Safety Labels",
      "Candle packaging diagram pairing clean front scent labels with mandatory bottom flame-safety warning circle decals on A4 cardstock or sticker vinyl",
      "Size minimalist scent labels for 4 oz tins, 8 oz apothecary tumblers, and matching bottom burn-warning stickers in one PDF run.",
      "Popular Candle Vessel Sizes",
      ["4 oz Tin: 50 mm Lid", "8 oz Tumbler: 75x60 mm", "Bottom Warning Zone"],
      1
    ),
  ],
  T29: [
    makeImageSpec(
      "/images/jar-wrap-label-circumference-lid-diagram.webp",
      "bottle-wrap-sheet",
      "WINE, BEER & OIL BOTTLES",
      "750 ml Wine & 330 ml Beer Straight-Wall Wraparound Grid",
      "Bottle wrap diagram illustrating how straight vertical wall height dictates maximum crisp non-wrinkling label height on glass bottles",
      "Print vertical or wraparound wine, craft beer, kombucha, and sauce bottle labels sized for the flat straight cylinder section.",
      "Preventing Tapered Neck Wrinkles",
      ["750 ml Wine: 90x105 mm", "330 ml Beer: 95x75 mm", "4–6 Labels Per A4"],
      1
    ),
  ],
  T30: [
    makeImageSpec(
      "/images/a4-label-sticker-sheet-grid-dimensions.webp",
      "vial-micro-labels",
      "ESSENTIAL OIL 10 ML VIALS",
      "Micro 45x20 mm & 50x25 mm Essential Oil & Serum Labels",
      "High-density micro-label grid blueprint illustrating 36 to 48 oil-resistant miniature labels for 5 ml, 10 ml, and 15 ml dropper vials",
      "Pack 36+ smudge-resistant micro-labels sized cleanly for 5 ml, 10 ml, and 30 ml amber dropper vials with room for crisp drop counts.",
      "Roller & Dropper Vial Matrix",
      ["10 ml Roller: 45x20 mm", "15 ml Dropper: 50x25 mm", "Up to 48 / A4 Sheet"],
      1
    ),
  ],
  G01: [
    makeImageSpec(
      "/images/a4-photo-sheet-grid-layout-mm.webp",
      "guide-multi-photo",
      "COMPLETE PHOTO GUIDE",
      "Multi-Photo Sheet Setup Reference Diagram",
      "Step-by-step print grid reference diagram showing row-column choices, margin padding, and 100 percent scaling settings across desktop and mobile",
      "Choose the best paper stock, grid count, and print scaling factor for crystal-clear multi-photo home prints.",
      "Grid Count vs Print Size Overview",
      ["2-up / 4-up / 9-up", "Glossy vs Satin Stock", "No-Crop Scaling"],
      1
    ),
  ],
  G02: [
    makeImageSpec(
      "/images/multi-page-poster-tiling-grid.webp",
      "guide-poster-tiling",
      "POSTER TILING SPEC",
      "How Multi-Page Poster Overlap & Trim Lines Align",
      "Diagram explaining how a 3 by 3 multi-page poster split adds 10 mm glue margins and corner trim crosses on adjacent A4 sheets",
      "Understand pixel resolution minimums (DPI) and glue overlap tabs before tiling wall posters across multiple A4 or Letter pages.",
      "Overlap & Minimum Resolution Guide",
      ["Minimum 150 DPI", "10 mm Tape Seam", "2x2 to 4x4 Scaling"],
      1
    ),
  ],
  G03: [
    makeImageSpec(
      "/images/a4-vs-us-letter-paper-dimensions-mm.webp",
      "guide-a4-pixels",
      "A4 PIXEL & MM CHART",
      "A4 Exact Pixel Counts at 72, 150, 300 & 600 DPI",
      "A4 size chart diagram displaying 210 by 297 mm physical dimensions converted into 2480 by 3508 pixels at 300 DPI alongside standard photo ratios",
      "Reference exact millimeter, inch, and 300 DPI pixel targets when laying out photos or digital artwork for crisp A4 printing.",
      "300 DPI A4 Reference Targets",
      ["210 x 297 mm", "8.27 x 11.69 in", "2480 x 3508 px @300"],
      1
    ),
  ],
  G04: [
    makeImageSpec(
      "/images/a4-photo-sheet-grid-layout-mm.webp",
      "guide-4r-on-a4",
      "4R ON A4 FIT PROOF",
      "Why Two Horizontal 4x6 (4R) Photos Fit Cleanly on A4",
      "Geometric proof illustrating two 102 by 152 mm 4R prints stacked vertically on 210 by 297 mm A4 vs Letter sheets with cut margins",
      "Visualize how two borderless 4R (4x6 inch) photos fit comfortably on one A4 sheet with a 5 mm trim gap and why 3 cannot fit unscaled.",
      "Exact Area Fit Math on A4",
      ["4R = 101.6 x 152.4 mm", "2x 4R Fits A4 Cleanly", "Zero Shrinkage Required"],
      1
    ),
  ],
  G05: [
    makeImageSpec(
      "/images/business-card-10up-sheet-crop-marks.webp",
      "guide-card-standards",
      "GLOBAL CARD SIZES",
      "US 3.5x2 in vs EU 85x55 mm vs JP 91x55 mm Bleed & Safe Zones",
      "Side-by-side blueprint comparing North American, European/UK, and Japanese standard business card trim boxes, bleed margins, and text safe zones",
      "Apply industry-standard 3 mm bleed and 3 mm inner safe margins so home cuts and commercial runs never slice logos or phone digits.",
      "Bleed & Safe Zone Measurements",
      ["US: 88.9 x 50.8 mm", "UK/EU: 85 x 55 mm", "Safe Zone: 3 mm Inside"],
      1
    ),
  ],
  G06: [
    makeImageSpec(
      "/images/a4-label-sticker-sheet-grid-dimensions.webp",
      "guide-sticker-paper",
      "VINYL VS MATTE PAPER",
      "Sticker Paper Weight, Backing Release & Printer Feed Diagram",
      "Diagram showing ink absorption vs coating layers across A4 glossy, matte, clear, and printable vinyl sticker stocks",
      "Choose between ink-receptive coated vinyl, smudge-proof matte paper, and laser-safe stocks before loading thick sheets into rear trays.",
      "Stock Thickness & Printer Feed",
      ["Rear Tray Recommended", "Vinyl = Water Resistant", "Cold Laminate Seals Ink"],
      1
    ),
  ],
  G07: [
    makeImageSpec(
      "/images/a4-label-sticker-sheet-grid-dimensions.webp",
      "guide-label-paper",
      "INKJET VS LASER STOCK",
      "Adhesive Label Sheet Selection & Fuser Heat Safety",
      "Diagram contrasting laser-rated high-temp acrylic adhesive sheets against absorbent inkjet topcoats and thermal roll alternatives",
      "Prevent sticky roller jams by matching laser-safe adhesives to fuser printers and rapid-dry coated sheets to home inkjets.",
      "Adhesive & Printer Compatibility",
      ["Laser Needs High-Temp", "Inkjet = Coated Top", "Never Re-Feed Partial"],
      1
    ),
  ],
  G08: [
    makeImageSpec(
      "/images/jar-wrap-label-circumference-lid-diagram.webp",
      "guide-label-printers",
      "SHEETS VS DEDICATED",
      "Dedicated Roll Label Printers vs Full-Color A4 Inkjet Sheets",
      "Comparison schematic contrasting 4x6 direct thermal monochrome rolls against full-color 300 DPI A4 printable sticker sheets",
      "Decide when monochrome shipping roll printers make financial sense versus full-color glossy A4 sheets for apothecary jars.",
      "Cost & Color Capability Matrix",
      ["Thermal: Fast B&W Only", "Inkjet Sheet: Full Color", "Break-Even Volume Check"],
      1
    ),
  ],
  G09: [
    makeImageSpec(
      "/images/a4-label-sticker-sheet-grid-dimensions.webp",
      "guide-avery-codes",
      "AVERY NUMBER DECODER",
      "Avery US Letter vs Avery Europe/UK A4 Code Numbering Guide",
      "Cross-reference diagram comparing US Letter 5160/5371/28878 codes against European A4 L7160/J8160/C32011 grid geometries",
      "Decode Avery packaging numbers quickly so US Letter templates never drift onto A4 sheets or vice versa.",
      "US Letter vs A4 Code Rules",
      ["L7xxx / J8xxx = A4", "51xx / 81xx / 28xxx = LTR", "Always Match Sheet Size"],
      1
    ),
  ],
  G10: [
    makeImageSpec(
      "/images/jar-wrap-label-circumference-lid-diagram.webp",
      "guide-4oz-jar",
      "2 OZ TO 16 OZ CHART",
      "4 oz, 8 oz & 16 oz Jar Circumference & Height Cheat Sheet",
      "Proportional jar measurement diagram indexing straight-wall heights and circumferences across common 2 oz, 4 oz, 8 oz, and 16 oz retail jars",
      "Measure your straight-wall panel zone properly on curved shoulders so 4 oz and 8 oz jar labels apply bubble-free every time.",
      "Common Jar Size Reference",
      ["4 oz Straight: ~185x50 mm", "8 oz Mason: ~225x65 mm", "4 mm Seam Gap Standard"],
      1
    ),
  ],
  H08: [
    makeImageSpec(
      "/images/double-sided-business-card-duplex-alignment.webp",
      "howto-duplex-cards",
      "DUPLEX TEST STEP",
      "Pencil-Mark Duplex Orientation & Shift Correction Guide",
      "Hands-on calibration diagram showing a quick one-sheet corner X test to verify flip axis (long edge vs short edge) on home printers",
      "Run a quick plain-paper corner check before feeding expensive cardstock so front and back card prints land within 1 mm.",
      "1-Minute Duplex Orientation Test",
      ["Print Draft on Plain", "Long-Edge Flip Check", "Mirror Back Active"],
      1
    ),
  ],
  H12: [
    makeImageSpec(
      "/images/passport-photo-sheet-35x45mm-2x2in.webp",
      "howto-passport-sheet",
      "DIY PASSPORT PRINT",
      "Borderless Off & 100% Scale Lock for Biometric Compliance",
      "Screenshot-style diagram emphasizing Actual Size (100 percent) and disabling Fit-to-Page so 35x45 mm head heights remain compliant",
      "Disable printer Fit-to-Page shrinkage so every home-printed passport photo measures within exact government millimeter tolerances.",
      "Critical Printer Dialog Settings",
      ["Scale = 100% / Actual", "Borderless = OFF", "Glossy Photo Paper"],
      1
    ),
  ],
};

export function getPageImages(
  meta: PageMeta
): PageImageSpec[] {
  return PHASE_GENERATED_IMAGES[meta.id] || [];
}

const TARGET_TOOLS_BY_PAGE: Partial<
  Record<PageId, { primary: PageId; secondary: PageId }>
> = {
  HOME: { primary: "T01", secondary: "T11" },
  "HB-PH": { primary: "T01", secondary: "T06" },
  "HB-BC": { primary: "T11", secondary: "T14" },
  "HB-LS": { primary: "T17", secondary: "T22" },
  "HB-JB": { primary: "T24", secondary: "T28" },
  G01: { primary: "T01", secondary: "T03" },
  G02: { primary: "T05", secondary: "T10" },
  G03: { primary: "T01", secondary: "T10" },
  G04: { primary: "T02", secondary: "T08" },
  G05: { primary: "T13", secondary: "T11" },
  G06: { primary: "T22", secondary: "T17" },
  G07: { primary: "T17", secondary: "T18" },
  G08: { primary: "T29", secondary: "T24" },
  G09: { primary: "T18", secondary: "T15" },
  G10: { primary: "T24", secondary: "T25" },
  H01: { primary: "T01", secondary: "T03" },
  H02: { primary: "T01", secondary: "T09" },
  H03: { primary: "T01", secondary: "T10" },
  H04: { primary: "T03", secondary: "T01" },
  H05: { primary: "T11", secondary: "T14" },
  H06: { primary: "T11", secondary: "T13" },
  H07: { primary: "T12", secondary: "T14" },
  H08: { primary: "T11", secondary: "T15" },
  H09: { primary: "T17", secondary: "T18" },
  H10: { primary: "T20", secondary: "T17" },
  H11: { primary: "T22", secondary: "T19" },
  H12: { primary: "T06", secondary: "T07" },
  H13: { primary: "T08", secondary: "T09" },
  H14: { primary: "T27", secondary: "T24" },
  B01: { primary: "T01", secondary: "T10" },
  B02: { primary: "T28", secondary: "T24" },
  B03: { primary: "T29", secondary: "T24" },
  B04: { primary: "T22", secondary: "T17" },
  B05: { primary: "T22", secondary: "T19" },
  B06: { primary: "T01", secondary: "T03" },
  B07: { primary: "T13", secondary: "T14" },
  B08: { primary: "T14", secondary: "T16" },
  B09: { primary: "T11", secondary: "T12" },
  B10: { primary: "T24", secondary: "T26" },
  B11: { primary: "T22", secondary: "T17" },
  B12: { primary: "T18", secondary: "T22" },
  CS01: { primary: "T11", secondary: "T12" },
  CS02: { primary: "T08", secondary: "T09" },
  CS03: { primary: "T24", secondary: "T25" },
  CS04: { primary: "T28", secondary: "T24" },
  CS05: { primary: "T22", secondary: "T18" },
  CS06: { primary: "T15", secondary: "T11" },
};

export function getPageCtas(
  meta: PageMeta,
  content: PageContent
): PageCtaConfig {
  const isTool = meta.type === "Tool";
  const isHome = meta.id === "HOME";
  const isHub = meta.type === "Hub";

  const mappedTargets = TARGET_TOOLS_BY_PAGE[meta.id] || {
    primary: "T01" as PageId,
    secondary: "T11" as PageId,
  };

  const relatedToolId: PageId =
    content.relatedLinks?.find(
      (r) => PAGES_META[r.targetId]?.type === "Tool" && r.targetId !== meta.id
    )?.targetId ||
    meta.parentHub ||
    "HOME";

  const primaryTargetMeta = isTool
    ? meta
    : PAGES_META[mappedTargets.primary] || PAGES_META.T01;
  const secondaryTargetMeta = isTool
    ? PAGES_META[relatedToolId] || PAGES_META[meta.parentHub || "HOME"]
    : PAGES_META[mappedTargets.secondary] ||
      PAGES_META[meta.parentHub || "HOME"];

  const parentHubMeta = meta.parentHub
    ? PAGES_META[meta.parentHub]
    : PAGES_META.HOME;

  if (isHome) {
    return {
      heroPrimary: {
        label: "Open Interactive Print Sheet Studio",
        href: "#interactive-studio-workspace",
        sublabel: "Free · Instant Browser PDF",
      },
      heroSecondary: {
        label: "Browse All 4 Print Categories",
        href: "#choose-your-print-sheet",
      },
      midBanner: {
        eyebrow: "INSTANT BROWSER LAYOUT STUDIO",
        heading: "Create Exact-Size Photo, Card & Label Sheets in Seconds",
        body: "Skip complex word-processor tables. Pick A4, A3, US Letter, or 4×6 inch paper, drop in your images or text, and export a 100%-scale print-ready PDF.",
        primary: {
          label: "Launch Quick Print Studio Above",
          href: "#interactive-studio-workspace",
        },
        secondary: {
          label: "Try Photo Sheet Maker",
          href: "/photo-sheets/photo-sheet-maker/",
        },
        trustPoints: [
          "100% Free & No Sign-Up",
          "Locked Millimetre PDFs",
          "Runs Locally in Your Browser",
        ],
      },
      sidebarCard: {
        eyebrow: "QUICK STUDIO LAUNCH",
        heading: "Build Your Print Sheet",
        body: "Use the interactive 5-in-1 studio on this page or jump straight to a dedicated sheet maker.",
        button: {
          label: "Jump to Interactive Studio",
          href: "#interactive-studio-workspace",
        },
        secondaryLink: {
          label: "Read Master Photo Print Guide",
          href: "/guides/how-to-print-multiple-pictures-on-one-page/",
        },
      },
      bottomCard: {
        eyebrow: "READY TO PRINT AT 100% SCALE?",
        heading: "Start Your Free Print Sheet Layout Now",
        body: "Choose a specialized generator below or scroll up to export your print-ready PDF with optional hairline crop marks.",
        primary: {
          label: "Use Interactive Studio Now",
          href: "#interactive-studio-workspace",
        },
        secondary: {
          label: "Open 10-Up Business Card Maker",
          href: "/business-cards/business-card-sheet-maker/",
        },
      },
    };
  }

  if (isTool) {
    return {
      heroPrimary: {
        label: `Start Your ${meta.primaryKeyword} Layout`,
        href: "#interactive-studio-workspace",
        sublabel: "Free Print-Ready PDF",
      },
      heroSecondary: {
        label: `Explore ${parentHubMeta.primaryKeyword}`,
        href: parentHubMeta.url,
      },
      midBanner: {
        eyebrow: "FREE INTERACTIVE SHEET GENERATOR",
        heading: `Build & Download Your ${meta.h1.split(":")[0]} PDF`,
        body: `Configure paper size, margins, gutters, and crop marks in real time using the ${meta.primaryKeyword} workspace above—no account or watermark.`,
        primary: {
          label: "Scroll Up to Interactive Tool",
          href: "#interactive-studio-workspace",
        },
        secondary: {
          label: `Try ${secondaryTargetMeta.primaryKeyword}`,
          href: secondaryTargetMeta.url,
        },
        trustPoints: [
          "Exact 100% Scale PDF",
          "A4, Letter, A3 & 4×6 Ready",
          "Files Never Leave Your Device",
        ],
      },
      sidebarCard: {
        eyebrow: "LIVE TOOL ON THIS PAGE",
        heading: `Use ${meta.primaryKeyword}`,
        body: "Configure your grid in the interactive studio at the top of this page and download a print-ready PDF.",
        button: {
          label: "Jump to Tool Workspace",
          href: "#interactive-studio-workspace",
        },
        secondaryLink: {
          label: `All ${parentHubMeta.primaryKeyword}`,
          href: parentHubMeta.url,
        },
      },
      bottomCard: {
        eyebrow: "PRINT-READY IN UNDER A MINUTE",
        heading: `Ready to Print Your ${meta.h1.split(":")[0]}?`,
        body: "Jump back to the live canvas workspace above to customize your layout and download a locked-scale PDF, or explore companion tools.",
        primary: {
          label: "Open Tool Workspace Above",
          href: "#interactive-studio-workspace",
        },
        secondary: {
          label: `Browse ${parentHubMeta.primaryKeyword}`,
          href: parentHubMeta.url,
        },
      },
    };
  }

  if (isHub) {
    return {
      heroPrimary: {
        label: `Launch ${primaryTargetMeta.primaryKeyword}`,
        href: primaryTargetMeta.url,
        sublabel: "Most Popular Tool",
      },
      heroSecondary: {
        label: `Try ${secondaryTargetMeta.primaryKeyword}`,
        href: secondaryTargetMeta.url,
      },
      midBanner: {
        eyebrow: "CHOOSE YOUR FREE GENERATOR",
        heading: `Start Designing with Our ${meta.h1.split(":")[0]}`,
        body: `Jump directly into our most popular browser-based sheet maker in this collection and export a millimetre-exact PDF in seconds.`,
        primary: {
          label: `Open ${primaryTargetMeta.primaryKeyword}`,
          href: primaryTargetMeta.url,
        },
        secondary: {
          label: `Open ${secondaryTargetMeta.primaryKeyword}`,
          href: secondaryTargetMeta.url,
        },
        trustPoints: [
          "Free & No Registration",
          "Built-In Crop & Bleed Guides",
          "Instant 300 DPI PDF Export",
        ],
      },
      sidebarCard: {
        eyebrow: "FEATURED HUB TOOL",
        heading: primaryTargetMeta.h1.split(":")[0],
        body: "Skip the setup guesswork and build your sheet directly in your browser.",
        button: {
          label: `Open ${primaryTargetMeta.primaryKeyword}`,
          href: primaryTargetMeta.url,
        },
        secondaryLink: {
          label: `Try ${secondaryTargetMeta.primaryKeyword}`,
          href: secondaryTargetMeta.url,
        },
      },
      bottomCard: {
        eyebrow: "START PRINTING TODAY",
        heading: `Create Your First Sheet with ${primaryTargetMeta.h1.split(":")[0]}`,
        body: "Pick a tool from this hub to arrange your content on A4, Letter, or 4×6 sheets and download a crisp PDF immediately.",
        primary: {
          label: `Launch ${primaryTargetMeta.primaryKeyword}`,
          href: primaryTargetMeta.url,
        },
        secondary: {
          label: `Open ${secondaryTargetMeta.primaryKeyword}`,
          href: secondaryTargetMeta.url,
        },
      },
    };
  }

  return {
    heroPrimary: {
      label: `Open Free ${primaryTargetMeta.primaryKeyword} Tool`,
      href: primaryTargetMeta.url,
      sublabel: "Instant PDF Generator",
    },
    heroSecondary: {
      label: `Try ${secondaryTargetMeta.primaryKeyword}`,
      href: secondaryTargetMeta.url,
    },
    midBanner: {
      eyebrow: "FASTER BROWSER ALTERNATIVE",
      heading: `Skip Manual Setup — Use Our Free ${primaryTargetMeta.h1.split(":")[0]}`,
      body: `Instead of wrestling with printer driver scaling or manual table margins, generate a locked 100%-scale PDF directly in your browser using our ${primaryTargetMeta.primaryKeyword} tool.`,
      primary: {
        label: `Launch ${primaryTargetMeta.primaryKeyword} Now`,
        href: primaryTargetMeta.url,
      },
      secondary: {
        label: `Explore ${secondaryTargetMeta.primaryKeyword}`,
        href: secondaryTargetMeta.url,
      },
      trustPoints: [
        "Zero Software Install",
        "Exact Millimetre Grid Presets",
        "Free Print-Ready PDF Download",
      ],
    },
    sidebarCard: {
      eyebrow: "TRY THE MATCHING TOOL",
      heading: primaryTargetMeta.h1.split(":")[0],
      body: `Apply everything in this ${meta.type.toLowerCase()} immediately with our free online sheet generator.`,
      button: {
        label: `Open ${primaryTargetMeta.primaryKeyword}`,
        href: primaryTargetMeta.url,
      },
      secondaryLink: {
        label: `Browse ${parentHubMeta.primaryKeyword}`,
        href: parentHubMeta.url,
      },
    },
    bottomCard: {
      eyebrow: "PUT THIS WORKFLOW INTO ACTION",
      heading: `Build Your Sheet with ${primaryTargetMeta.h1.split(":")[0]}`,
      body: "Generate a print-ready PDF with exact margins, custom gutters, and hairline crop marks right now—completely free and with no sign-up.",
      primary: {
        label: `Launch ${primaryTargetMeta.primaryKeyword}`,
        href: primaryTargetMeta.url,
      },
      secondary: {
        label: `Try ${secondaryTargetMeta.primaryKeyword}`,
        href: secondaryTargetMeta.url,
      },
    },
  };
}
