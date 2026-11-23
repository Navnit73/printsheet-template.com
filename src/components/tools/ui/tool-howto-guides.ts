import type { ToolHowToGuide } from "./FullPageToolShell";

export const PASSPORT_HOW_TO: ToolHowToGuide = {
  title: "Passport Photo Sheet Guide",
  subtitle: "Create compliant multi-up ID photo sheets ready for home printers or 4×6 photo kiosks.",
  steps: [
    {
      stepNumber: 1,
      title: "Pick country / ID size",
      description:
        "Start by selecting 35×45 mm (UK, EU, India, Schengen), 2×2 in (USA, OCI), Canada, China, or custom millimetre dimensions.",
    },
    {
      stepNumber: 2,
      title: "Upload & align your face",
      description:
        "Choose a front-facing photo (plain light background). Drag and zoom so the top of your head touches the green line and your chin sits inside the yellow band.",
    },
    {
      stepNumber: 3,
      title: "Choose paper, count & cut marks",
      description:
        "Pick 4×6 in for photo paper/kiosks or A4 / Letter for home printers, then pick how many copies. Dashed box cut marks are selected by default.",
    },
    {
      stepNumber: 4,
      title: "Download & print at 100%",
      description:
        "Export a PDF (for home printing) or 300 DPI JPEG/PNG (for photo kiosks). Print at Actual Size (100% scale) and trim along the dashed box guides.",
    },
  ],
  printChecklist: [
    "Set paper size in the print dialog to match your sheet (4×6 in, A4, or US Letter).",
    "Set scale to 100% / Actual size — turn off 'Fit to page' or 'Shrink to fit'.",
    "Select matte or glossy photo paper and 'Best' or 'Photo' print quality.",
  ],
  tips: [
    "Click the Zoom button above the preview to inspect fine details before downloading.",
    "Check your local government's background, glasses, and expression rules before printing.",
  ],
};

export const PHOTO_GRID_HOW_TO: ToolHowToGuide = {
  title: "Photo Sheet & Collage Guide",
  subtitle: "Arrange multiple photos or repeat one shot across A4, A3, Letter, or 4×6 sheets.",
  steps: [
    {
      stepNumber: 1,
      title: "Add & order your photos",
      description:
        "Drop multiple JPG/PNG/WebP images at once, or load samples to test. Drag thumbnails or use arrows to reorder how they fill the sheet.",
    },
    {
      stepNumber: 2,
      title: "Pick a grid layout",
      description:
        "Choose 2-up, 4-up, 6-up, 8-up, 9-up, or mixed-size layouts tailored to your sheet.",
    },
    {
      stepNumber: 3,
      title: "Adjust paper, margins & fit",
      description:
        "Set your printer paper size, edge margins, cut gaps, and choose 'Fill the slot' (crop to fit) or 'Show whole photo' (white borders).",
    },
    {
      stepNumber: 4,
      title: "Download print-ready PDF",
      description:
        "Click Download PDF and print at 100% Actual Size. Trim along the corner cut marks.",
    },
  ],
  printChecklist: [
    "Match the printer paper size to A4, A3, US Letter, or 4×6 in.",
    "Always print at 100% / Actual size so slot dimensions stay true.",
    "Print one plain-paper draft first if checking margins on a new printer.",
  ],
  tips: [
    "Tap any photo spot directly on the Live Sheet Preview to swap its photo, clear it, or drag-crop what stays inside the frame.",
    "If you upload fewer photos than slots, photos repeat cleanly to fill the page.",
  ],
};

export const POSTER_SPLITTER_HOW_TO: ToolHowToGuide = {
  title: "Multi-Page Poster Guide",
  subtitle: "Split any high-resolution photo or banner across multiple A4, Letter, or A3 pages.",
  steps: [
    {
      stepNumber: 1,
      title: "Upload a high-resolution image",
      description:
        "Drop your artwork and check the Print Quality badge. Higher pixel dimensions give sharper wall posters.",
    },
    {
      stepNumber: 2,
      title: "Set finished size or page grid",
      description:
        "Type your target width/height in cm or inches, or pick 2×2, 2×3, 3×3, or 4×3 tile grids.",
    },
    {
      stepNumber: 3,
      title: "Crop, overlap & paper settings",
      description:
        "Frame the crop area, keep an 8–10 mm overlap strip for easy taping, and leave Row/Col labels on so assembly is effortless.",
    },
    {
      stepNumber: 4,
      title: "Download & tape tiles together",
      description:
        "Print all PDF pages at 100% scale, trim one overlap edge from each joining pair, align the dashed lines, and tape from the back.",
    },
  ],
  printChecklist: [
    "Print every page in the PDF at 100% / Actual size — never 'Fit to page'.",
    "Keep the same paper size (A4, US Letter, or A3) and orientation for all tiles.",
    "Start assembling from Row 1, Col 1 (top-left) and work across each row.",
  ],
  tips: [
    "If the tool suggests flipping page orientation, click it to keep more of your image with less trimming.",
    "Trim just one overlapping edge per seam so the artwork overlaps smoothly with zero white gap.",
  ],
};

export const BUSINESS_CARD_HOW_TO: ToolHowToGuide = {
  title: "Business Card Sheet Guide",
  subtitle: "Design 8-up or 10-up cards in easy Normal mode — or open the Advanced Editor for full layer freedom.",
  steps: [
    {
      stepNumber: 1,
      title: "Enter details or upload a card",
      description:
        "Type your name, role, contact info and optional logo — or switch to 'I already have a design' to tile a finished Canva/Photoshop PNG.",
    },
    {
      stepNumber: 2,
      title: "Choose style, font, colour & QR",
      description:
        "Pick from 8 clean card templates, choose typography and brand colour, or add an automatic scannable QR code.",
    },
    {
      stepNumber: 3,
      title: "Set sheet, cut guides & back side",
      description:
        "Select A4 10-up, US Letter 10-up, Avery perforated templates, or custom grids. Enable Single-cut layout for faster trimming or add a double-sided back.",
    },
    {
      stepNumber: 4,
      title: "Download & print on cardstock",
      description:
        "Export your 300 DPI PDF, test once on plain paper, then print on 250–300 gsm cardstock at 100% scale.",
    },
  ],
  printChecklist: [
    "Print at 100% / Actual size so every card measures 3.5×2 in, 85×55 mm, or 90×50 mm.",
    "Set paper type to 'Cardstock' or 'Heavy' in your printer dialog.",
    "For double-sided cards: print page 1, flip along the long edge, then print page 2.",
  ],
  tips: [
    "Need custom drag-and-drop shapes, icons, gradients, or logo background removal? Click 'Advanced Editor' in the top bar anytime.",
    "For dark/full-bleed cards, enable 'Add edge bleed (3 mm)' in Step 3 so trimming leaves no white edges.",
  ],
};

export const LABEL_SHEET_HOW_TO: ToolHowToGuide = {
  title: "Label & Sticker Sheet Guide",
  subtitle: "Match pre-cut Avery packs or lay out custom rectangular, round, address, barcode & badge sheets.",
  steps: [
    {
      stepNumber: 1,
      title: "Pick paper & label grid",
      description:
        "Choose A4 or US Letter and select a pre-calibrated pack (like Avery L7160, 5160, round circles) or enter custom ruler measurements.",
    },
    {
      stepNumber: 2,
      title: "Add text, lists or artwork",
      description:
        "Type label text, paste bulk addresses, enter Code 128/EAN-13/UPC barcodes, paste attendee names, or upload sticker graphics.",
    },
    {
      stepNumber: 3,
      title: "Style & set cut guides",
      description:
        "Choose a label frame, fonts and colour, and pick dashed cut outlines for plain sticker paper or 'No guides' for pre-cut sheets.",
    },
    {
      stepNumber: 4,
      title: "Test alignment & download PDF",
      description:
        "Print one test sheet on plain paper, hold it behind your sticker sheet against a window to verify alignment, then print on label stock.",
    },
  ],
  printChecklist: [
    "Print at 100% / Actual size — scaling even 2% throws off multi-row label sheets.",
    "Always test-print on plain paper first before feeding sticker or Avery sheets.",
    "Check your printer's tray diagram so you load the adhesive side the right way up.",
  ],
  tips: [
    "Click 'Advanced Editor' in the top bar whenever you want drag-and-drop layers, Kraft textures, icons, or PNG/SVG export.",
    "Leave 'Fill the whole sheet' checked to repeat a single item across every empty slot.",
  ],
};

export const JAR_BOTTLE_HOW_TO: ToolHowToGuide = {
  title: "Jar & Bottle Label Guide",
  subtitle: "Size front labels, round lid seals, and wrap-around bands for jars, candles, bottles and vials.",
  steps: [
    {
      stepNumber: 1,
      title: "Pick container & sheet size",
      description:
        "Select a jar front, lid circle, spice tag, candle safety sticker, or wrap band — use the built-in circumference calculator for wrap-arounds.",
    },
    {
      stepNumber: 2,
      title: "Enter product text & logo",
      description:
        "Add your product title, ingredients/scent, batch/date small print, and optional transparent PNG logo (or batch-print A–Z spice lists).",
    },
    {
      stepNumber: 3,
      title: "Choose style & background",
      description:
        "Pick a frame style, font pair, accent colour, optional warm background fill, and cut outlines.",
    },
    {
      stepNumber: 4,
      title: "Download & print on sticker paper",
      description:
        "Export your A4 or Letter PDF at 100% scale. Use matte or glossy waterproof vinyl sticker paper for refrigerated jars and bath/oil bottles.",
    },
  ],
  printChecklist: [
    "Print at 100% / Actual size on full-sheet sticker or waterproof vinyl paper.",
    "Select 'Glossy' or 'Matte Photo' paper setting for richer ink on vinyl sheets.",
    "Measure the straight-wall section of tapered jars before cutting wrap-around labels.",
  ],
  tips: [
    "For wrap-around bands, wrap a strip of paper around the jar, mark the overlap, measure it in mm, and click 'Apply to label' — we add 10 mm overlap automatically.",
    "Selling food, candles, or cosmetics? Always verify local allergen, net weight, and burn-safety label regulations before printing batches.",
  ],
};
