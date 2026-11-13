import type { HeadingNode, PageContent, PageId } from "@/types/spec";

interface PhotoToolSpecInput {
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

const PHOTO_TOOL_TAILOR: Record<
  string,
  {
    stepsLead: string;
    uploadHint: string;
    gridHint: string;
    orientHint: string;
    gapHint: string;
    cropHint: string;
    exportHint: string;
    presetsIntro: string;
    settingsLead: string;
    trayNote: string;
    scale100: string;
    marginRule: string;
    pdfVsJpg: string;
    projectsLead: string;
    projectVerb: (proj: string) => string;
    tipsLead: string;
    tipVerb: (tip: string) => string;
  }
> = {
  T01: {
    stepsLead: "Arrange mixed portrait and landscape images onto one sheet inside your browser in four quick steps—no layout software needed.",
    uploadHint: "Batch-select 3, 6, 8, 9, or 10 JPG, PNG, or WebP pictures directly from desktop folders or phone camera rolls.",
    gridHint: "Tap the 2×2, 3×2, 3×3, or 5×2 preset grid matching how many photos you want per A4, A3, or Letter page.",
    orientHint: "Match sheet orientation (Portrait vs Landscape) to whether most uploaded shots are tall verticals or wide horizontals.",
    gapHint: "Use a 4–8 mm cut gutter when separating individual prints with scissors, or set 0–2 mm spacing for tight contact-sheet catalogs.",
    cropHint: "Choose Crop to Fill for sleek equal rectangles, or switch to Fit Whole to preserve full wide-angle edges without trimming.",
    exportHint: "Download the locked-scale PDF and print at 100% / Actual Size so multi-photo frames hold clean, uniform proportions.",
    presetsIntro: "Each preset calculates multi-up photo frames and margins automatically so 3 to 10 pictures balance across the sheet.",
    settingsLead: "Even crisp multi-photo sheets shrink asymmetrically if browser PDF drivers override margins. Lock these tray settings first.",
    trayNote: "Confirm A4, A3, or US Letter selection in your print dialog matches the exact paper pack sitting in your inkjet tray.",
    scale100: "Turn off Fit to Printable Area or Shrink Oversized Pages so your calculated photo grid holds exact printed centimetres.",
    marginRule: "Keep an 8–10 mm outer sheet margin when printing onto borderless-incapable office trays so outer photo rims are never clipped.",
    pdfVsJpg: "Native PDF locks millimeter frame placement across copy shops and laptops, whereas raw JPG files depend on erratic DPI tags.",
    projectsLead: "Grouping multiple shots onto one A4 or A3 sheet cuts specialty glossy photo paper costs sharply across everyday projects.",
    projectVerb: (p) => `Consolidating photos for ${p.toLowerCase()} onto a single master PDF speeds up cutting and keeps frame widths consistent.`,
    tipsLead: "Apply these quick pre-print checks to keep skin tones accurate and frame edges crisp on heavyweight photo paper.",
    tipVerb: (tip) => `Prioritizing "${tip.toLowerCase()}" saves glossy ink sheets from awkward aspect-ratio clipping or soft 72 DPI stretching.`,
  },
  T02: {
    stepsLead: "Fit two generous half-page photos (~13 × 18 cm / 5 × 7 in equivalent) onto one sheet cleanly in four steps.",
    uploadHint: "Drop two high-resolution portraits or landscapes from your device—both slots resize cleanly without uploading to any server.",
    gridHint: "Select the 2-photo stack on Landscape or Portrait A4/Letter to maximize printed photo area for framing and albums.",
    orientHint: "Switch to Landscape paper for two upright 5×7 portrait shots side-by-side, or Portrait paper for two wide horizontal frames.",
    gapHint: "Keep a crisp 6–10 mm center cutter gutter so a single straight slice splits both 5×7-sized prints cleanly down the middle.",
    cropHint: "Pick Cover to fill each generous half-page frame symmetrically, or Contain to keep the complete camera sensor ratio visible.",
    exportHint: "Export the two-photo PDF and print at 100% scale on heavyweight 200+ gsm glossy or luster photo paper.",
    presetsIntro: "Our 2-up templates turn one economical A4 sheet into two clear 5×7-equivalent display photos with one straight cut.",
    settingsLead: "Two-photo sheets span nearly the full paper area, so driver Shrink-to-Fit margins create noticeable uneven side borders.",
    trayNote: "Verify A4 (210 × 297 mm) or US Letter cardstock selection matches your glossy pack before sending the two-up job.",
    scale100: "Print strictly at Actual Size (100%) so both half-page frames drop straight into standard 5×7-inch and 13×18 cm picture frames.",
    marginRule: "Maintain at least a 5 mm perimeter margin unless using dedicated Borderless Glossy mode on a rear-feed photo printer.",
    pdfVsJpg: "Exporting a 2-up PDF keeps both embedded images crisp at print time without macOS Preview or Windows Photos re-compressing detail.",
    projectsLead: "Printing two photos per page halves photo paper waste when making gift portraits, portfolio spreads, and greeting inserts.",
    projectVerb: (p) => `A 2-up sheet sizes ${p.toLowerCase()} comfortably for wall frames and clean desk stands with minimal paper trimming.`,
    tipsLead: "Run these simple half-page photo checks so dual prints come off glossy sheets balanced and ready for a straight middle cut.",
    tipVerb: (tip) => `Taking a moment to "${tip.toLowerCase()}" guarantees two evenly centered prints without uneven top or bottom borders.`,
  },
  T03: {
    stepsLead: "Arrange four crisp quadrant photos (~9 × 13 cm each) across one A4 or Letter page with a clean cross-cut guide.",
    uploadHint: "Load four favorite travel shots, product photos, or event highlights directly into the live 2×2 preview workspace.",
    gridHint: "Activate the classic 2×2 quadrant preset or switch to a 4-strip column layout for narrow photo-booth bookmarks.",
    orientHint: "Keep Portrait orientation for vertical 3:4/2:3 phone snapshots, or toggle Landscape when printing four wide DSLR scenes.",
    gapHint: "A 4–6 mm white cross gutter creates classic gallery borders and leaves forgiving tolerance for sliding a paper trimmer.",
    cropHint: "Toggle Crop to Fill so all four quadrants match identical rectangle heights, or Fit Whole for mixed portrait/landscape ratios.",
    exportHint: "Click Download Print-Ready PDF and run it at 100% scale onto A4 photo glossy or matte presentation paper.",
    presetsIntro: "Each 4-photo grid balances vertical and horizontal symmetry so just one crosswise and one lengthwise cut finishes all four prints.",
    settingsLead: "With four quadrants sharing vertical height, fit-to-page driver squeezing leaves thinner left-right borders than top-bottom.",
    trayNote: "Lock the same paper size (A4 or US Letter) in both browser tool controls and your operating system print dialog.",
    scale100: "Force 100% / Actual Size scaling so all four prints measure uniform ~9 × 13 cm dimensions ready for small desktop frames.",
    marginRule: "A 6–8 mm outer page border keeps corner frames safely inside non-borderless office laser and home inkjet mechanical feed paths.",
    pdfVsJpg: "PDF delivery holds crisp white border symmetry across Windows and macOS print queues where JPG photo wizards add auto-crops.",
    projectsLead: "Four-up sheets hit the sweet spot between vivid snapshot detail and economical ink-per-print cost for craft projects.",
    projectVerb: (p) => `Four-quadrant formatting keeps ${p.toLowerCase()} uniform in scale and quick to slice in under thirty seconds.`,
    tipsLead: "Use these four-shot formatting habits to keep color consistency and straight cuts clean across every 2×2 print.",
    tipVerb: (tip) => `Remembering to "${tip.toLowerCase()}" prevents mismatched image orientations from turning side-by-side quadrants sideways.`,
  },
  T04: {
    stepsLead: "Repeat one image 4, 6, 8, 9, 12, or 16 times across a single page in one step-and-repeat pass.",
    uploadHint: "Select your master portrait, logo badge, QR flyer, or product card once—the repeat engine populates every slot instantly.",
    gridHint: "Choose how many identical copies you need per sheet (from 2 large flyers to 16 crisp wallet-sized giveaways).",
    orientHint: "Flip sheet orientation between Portrait and Landscape to test which grid yields higher print yield per A4 page.",
    gapHint: "Set 0 mm hairline touch cuts when using a rotary trimmer cleanly, or add 3–5 mm spacing between thick bordered badges.",
    cropHint: "Lock exact aspect preservation so copying an image 9 or 16 times never squashes logos or portraits out of round.",
    exportHint: "Download one compact PDF containing your entire repeated sheet and save it for instant future re-runs.",
    presetsIntro: "Step-and-repeat presets tile one high-res image edge-to-edge without duplicating gigabytes of redundant file uploads.",
    settingsLead: "Step-and-repeat grids need identical millimeter pitch on every copy—make sure print drivers do not auto-shrink outer rows.",
    trayNote: "Double check tray settings (A4 photo matte vs Letter glossy) so repeated wallet sheets match your cardstock pack.",
    scale100: "Disable Fit to Page so repeated wallet prints, locker stickers, or loyalty cards keep consistent exact measurements.",
    marginRule: "Allow a 5–6 mm tray grip margin around the sheet perimeter so printer rollers never drag ink across corner duplicate tiles.",
    pdfVsJpg: "Step-and-repeat PDF reuses one clean embedded image resource rather than saving lower-quality screenshots.",
    projectsLead: "Repeating one picture per sheet eliminates repetitive copy-pasting inside Word or slide decks whenever handing out dozens.",
    projectVerb: (p) => `Batch tiling turns ${p.toLowerCase()} into a fast one-sheet job rather than printing wasteful single pictures.`,
    tipsLead: "Quick resolution and trimming reminders when tiling one master photograph many times per sheet.",
    tipVerb: (tip) => `Taking time to "${tip.toLowerCase()}" ensures the twelfth cut copy looks just as balanced and unclipped as the first.`,
  },
  T05: {
    stepsLead: "Enlarge one high-resolution image across 2×2 (4 pages), 3×3 (9 pages), or 4×4 (16 pages) with clean alignment overlap.",
    uploadHint: "Load your sharpest original poster image, classroom chart, or pattern file straight into the multi-page tile slicer.",
    gridHint: "Choose 2×2 (4 A4 sheets ≈ A2 size), 3×3 (9 sheets), or 4×4 (16 sheets) to set target physical wall dimensions.",
    orientHint: "Match tile page orientation to your poster shape—tall vertical portraits slice efficiently onto Portrait A4 tiles.",
    gapHint: "Configure a 10–15 mm overlap margin (instead of blank gap) so neighboring paper edges tape flat behind the trimmed seam.",
    cropHint: "Let the slicer proportionally fill the target poster canvas cleanly so no edge tile prints half-empty white strips.",
    exportHint: "Export the multi-page poster PDF, verify Actual Size (100%), and assemble tiles row by row with matte tape.",
    presetsIntro: "Poster tiling calculates proportional pixel slicing and optional overlap glue tabs automatically across 4 to 16 printer sheets.",
    settingsLead: "A tiny 2% scale difference breaks poster grid seams across 3-foot spans—lock 100% actual scaling before printing all tiles.",
    trayNote: "Feed identical plain 100–160 gsm A4 or Letter matte presentation paper throughout the entire multi-page run.",
    scale100: "Select Actual Size (100%) strictly—Shrink to Printable Area creates thin white gaps inside tiled seam edges.",
    marginRule: "Keep trim marks enabled along sheet edges so a steel ruler slices right down the 5 mm overlap boundary cleanly.",
    pdfVsJpg: "Multi-page vector PDF delivers numbered tile pages in exact row-column order so assembly on the floor takes minutes.",
    projectsLead: "Desktop poster splitting turns an ordinary home printer into a large-format wall banner, sewing pattern, or event backdrop generator.",
    projectVerb: (p) => `Multi-page tiling makes oversized ${p.toLowerCase()} achievable on standard office paper without commercial plotter wait times.`,
    tipsLead: "Essential pixel-density and seam-taping practices so tiled wall prints look unified from normal viewing distance.",
    tipVerb: (tip) => `Remembering to "${tip.toLowerCase()}" avoids soft pixel blocks when enlarging photos across 4 or 9 joined sheets.`,
  },
  T06: {
    stepsLead: "Arrange 35 × 45 mm (EU/UK/IN/AU) or 2 × 2 inch (US/India Visa) passport photos onto one compliant A4 sheet.",
    uploadHint: "Choose your crisp plain-background ID portrait—nothing leaves your computer, keeping personal biometric photos completely private.",
    gridHint: "Pick the exact country preset (UK 35×45 mm, US 2×2 in, Schengen 35×45 mm) to fit 8, 12, or 20 photos onto A4/Letter.",
    orientHint: "Leave A4 sheets in standard Portrait layout so multiple neat rows of 35 × 45 mm ID photos fit with clean trimming corridors.",
    gapHint: "Keep 4–6 mm white spacing plus corner cut marks between passport frames so scissor cuts never bite into shoulders.",
    cropHint: "Align the live crop box carefully so eye level and crown-to-chin proportions satisfy official country passport biometric rules.",
    exportHint: "Export the calibration PDF and print strictly at 100% scale with Borderless turned OFF on glossy photo paper.",
    presetsIntro: "Calibrated government dimension presets enforce exact 35 × 45 mm and 51 × 51 mm bounding boxes directly in PDF coordinates.",
    settingsLead: "Embassies and passport offices reject prints off by even 2–3 mm—follow every 100% scaling setting rigidly.",
    trayNote: "Confirm physical A4 photo paper vs US Letter cardstock selection carefully so scale never compresses vertically.",
    scale100: "Disable Fit to Page and Borderless overscan—even 3% borderless enlargement pushes head heights outside official biometric zones.",
    marginRule: "Maintain a generous 10–12 mm page outer margin so home inkjet rollers keep sheet corners completely flat and un-skewed.",
    pdfVsJpg: "Exporting exact-scale PDF prevents kiosk or Windows print dialogs from arbitrarily cropping 35 × 45 mm photos into wide 4:3 slots.",
    projectsLead: "Generating multiple biometric ID copies at home saves high photo-booth charges across passports, visas, rail passes, and badges.",
    projectVerb: (p) => `A curated multi-up A4 ID sheet handles ${p.toLowerCase()} with crisp backup copies left in your travel folder.`,
    tipsLead: "Critical government inspection checks—lighting, matte vs gloss stock, and millimeter verification with a ruler—before mailing.",
    tipVerb: (tip) => `Making sure you "${tip.toLowerCase()}" protects applications from frustrating biometric template rejections.`,
  },
  T07: {
    stepsLead: "Place 4 or 6 official passport photos onto a single cheap 4 × 6 inch (10 × 15 cm) drugstore or home photo sheet.",
    uploadHint: "Drop your compliant passport portrait cleanly inside the browser—zero third-party uploads of sensitive identity pictures.",
    gridHint: "Pick 6× European/UK 35 × 45 mm photos per 4×6 sheet, or 6× compact 2 × 2 inch US frames carefully packed onto 4×6.",
    orientHint: "Switch the 4×6 template to Landscape for three-across columns of tall 35 × 45 mm photos (2 rows × 3 columns = 6 prints).",
    gapHint: "Allow small 2–3 mm cut corridors between ID blocks, trimming cleanly with a steel straightedge after kiosk pickup.",
    cropHint: "Verify neutral grey/off-white background lighting and balanced shoulder symmetry inside each preview box before exporting.",
    exportHint: "Save as a crisp PDF (or high-DPI image if uploading to a 4×6 lab print kiosk) and select uncropped 4×6 printing.",
    presetsIntro: "Our 4×6 passport sheet templates pack the maximum legal photo count onto the cheapest single photo-lab print format worldwide.",
    settingsLead: "Photo kiosks often apply subtle 'Auto-Crop' edge zoom by default unless you disable borderless zoom at checkout.",
    trayNote: "Set paper to exact 4 × 6 inch (101.6 × 152.4 mm) when loading mini glossy trays in Canon Selphy, Epson, or HP Envy printers.",
    scale100: "Keep 100% Actual Size scale active; Borderless auto-expansion zooms a 4×6 print ~3% and slightly enlarges the 35 × 45 mm frame.",
    marginRule: "Leave at least a 2–3 mm safety margin around the 4×6 outer rim so kiosk roller cutters never trim outer head edges.",
    pdfVsJpg: "Home inkjet printers honor exact millimeters via PDF; retail lab kiosks accept 1200 × 1800 px at 100% 'do not crop' mode.",
    projectsLead: "Packing 4–6 ID prints onto a single 4×6 kiosk sheet routinely turns a \$15 booth fee into a \$0.35 print.",
    projectVerb: (p) => `Lab-sized 4×6 templates let you complete ${p.toLowerCase()} locally using any drugstore photo terminal.`,
    tipsLead: "Ruler-verify finished 4×6 passport prints at home before cutting apart and submitting with official forms.",
    tipVerb: (tip) => `Remembering to "${tip.toLowerCase()}" avoids kiosk over-cropping slicing off the sides of 2 × 2 inch photos.`,
  },
  T08: {
    stepsLead: "Generate clean 1-up, 2-up, or 4-up printable layouts scaled exactly for 4 × 6 inch (101.6 × 152.4 mm / 4R) paper.",
    uploadHint: "Load one showcase photo or two to four snapshots for multi-up 4×6 glossy postcard printing.",
    gridHint: "Select single full-bleed 4×6, split 2-up 3×4 inch pockets, or 4-up wallet grids tuned specifically for 4R paper.",
    orientHint: "Match Landscape 4×6 orientation for wide 3:2 DSLR photos, or Portrait 4×6 for vertical smartphone snaps.",
    gapHint: "Add crisp 3–5 mm classic Polaroid-style white framing borders around edges, or tighten spacing to 2 mm for crisp splits.",
    cropHint: "Check Crop to Fill carefully on 4:3 phone photos—3:2 4×6 paper trims roughly 10% off the top and bottom unless Fit Whole is on.",
    exportHint: "Download exact 4×6 PDF coordinates or double-up two 4R images onto one A4 sheet when printing at home.",
    presetsIntro: "Each 4×6 preset respects the true 2:3 (101.6 × 152.4 mm) aspect ratio and protects image edges from aggressive lab trims.",
    settingsLead: "Most modern smartphone cameras shoot 4:3 rather than 3:2—choosing the right Fit mode preserves important photo heads and corners.",
    trayNote: "Feed 4×6-inch rear photo tray glossy sheets with the glossy coated side facing according to your printer feeder icon.",
    scale100: "Use Actual Size (100%) with manual borders if framing in standard 4×6 mats, or subtle borderless mode only for scenery without text.",
    marginRule: "Keep a minimum 4 mm white margin around split 2-up 3×4 mini-prints so separating them leaves clean edges.",
    pdfVsJpg: "PDF output handles calibrated white margins around 4R frames reliably across both home trays and photo-center uploads.",
    projectsLead: "Pre-framed 4×6 sheets make scrapbook pockets, fridge magnets, recipe cards, and thank-you postcards effortless to batch print.",
    projectVerb: (p) => `Dedicated 4R geometry fits ${p.toLowerCase()} smoothly into standard 4×6 archival sleeves without awkward trimming.`,
    tipsLead: "Small ratio and ink-drying tips for clean, fingerprint-free glossy 4×6 home prints.",
    tipVerb: (tip) => `Habitually making sure you "${tip.toLowerCase()}" keeps smartphone edges intact on classic 3:2 4×6 paper.`,
  },
  T09: {
    stepsLead: "Combine 2, 4, 6, or 9 photos into a tight, balanced 4 × 6 inch postcard collage sized cleanly for instant printing.",
    uploadHint: "Select 2 to 9 JPG/PNG snapshots at once and drag or cycle slots until colors and faces sit evenly balanced.",
    gridHint: "Pick clean 2×1, 2×2, 3×2, or 3×3 collage matrices engineered cleanly around 101.6 × 152.4 mm 4R dimensions.",
    orientHint: "Switch the 4×6 collage canvas between Portrait and Landscape depending on whether it lands in a vertical or horizontal frame.",
    gapHint: "Adjust crisp interior collage frame lines from tight 1.5 mm mosaic gaps up to generous 5 mm gallery-style white separators.",
    cropHint: "Preview cell framing up close before exporting so faces inside skinny collage strips stay centered cleanly.",
    exportHint: "Export at full print scale (300 DPI equivalent PDF) ready for local pharmacy print pickup or home rear-tray feeding.",
    presetsIntro: "Balanced 4×6 collage templates automate even inner gutters and clean outer postcard margins with zero manual ruler nudging.",
    settingsLead: "Dense 6-up and 9-up collages on tiny 4×6 cards look cluttered if thick printer auto-borders squeeze inner cells.",
    trayNote: "Specify 4 × 6 inch / 4R Borderless or Minimal-Margin setting when sending 4×6 collage sheets to color inkjets.",
    scale100: "Print at 100% scale (avoid extreme overscan zoom) so edge mosaic shots on 4×6 collages do not clip against frame mats.",
    marginRule: "Keeping a clean 4 mm outer white border around the whole 4×6 collage guarantees framing mats never cover edge tiles.",
    pdfVsJpg: "PDF collage layout stays ultra sharp at 1200 × 1800 px equivalent resolution without messaging-app compression blur.",
    projectsLead: "Mini 4×6 collages make affordable photo booth keepsakes, seasonal postcards, mood snippets, and locker pin-ups.",
    projectVerb: (p) => `Compact 4×6 grids turn ${p.toLowerCase()} into affordable, album-ready story cards in seconds.`,
    tipsLead: "Visual curation tips so crowded 4×6 postcard collages remain balanced and clear rather than visually noisy.",
    tipVerb: (tip) => `Remembering to "${tip.toLowerCase()}" gives tiny 4×6 collage tiles cleaner breathing room inside multi-photo frames.`,
  },
  T10: {
    stepsLead: "Arrange 4, 6, 9, or 12 memories into an economical full-size A4 (210 × 297 mm) collage ready for desk or wall framing.",
    uploadHint: "Batch-load up to 12 photos straight from laptop folders or phones—process stays entirely offline inside your tab.",
    gridHint: "Choose symmetric 2×2, 3×2, 3×3, or 4×3 A4 grids with optional clean gallery borders around every tile.",
    orientHint: "Portrait A4 suits classic multi-row scrapbooks and year-in-review posters, while Landscape A4 creates cinema-like grids.",
    gapHint: "Add 6–10 mm crisp gallery white spacing between tiles so each individual memory stands out distinctly inside large frames.",
    cropHint: "Use Cycle & Fit controls carefully per tile so panoramic groups fit comfortably alongside close-up portraits.",
    exportHint: "Export exact 210 × 297 mm A4 PDF at crisp print quality—zero login or corner watermarks attached.",
    presetsIntro: "Large-canvas A4 collage layouts calculate mathematical border spacing across full 2480 × 3508 px print resolution.",
    settingsLead: "Full-page A4 collages fill home trays completely—set crisp matte or glossy paper profiles so colors match screen brightness.",
    trayNote: "Confirm standard ISO A4 paper selection (not US Letter) so balanced 10 mm top/bottom gallery margins stay equal.",
    scale100: "Disable browser Fit-to-Page shrinkage so your finished A4 collage fills standard 21 × 29.7 cm IKEA and craft frames cleanly.",
    marginRule: "Reserve 10–12 mm outer page breathing space so plastic frame rabbet lips never hide outer tile corners.",
    pdfVsJpg: "Full-page A4 PDF preserves fine facial sharpness across 9 to 12 sub-images simultaneously at 300 DPI quality.",
    projectsLead: "A4 collages give birthdays, travel milestones, and classroom boards impressive wall presence at a fraction of lab canvas prices.",
    projectVerb: (p) => `Full-sheet A4 compositing makes ${p.toLowerCase()} frame-ready directly off an ordinary home color inkjet.`,
    tipsLead: "Simple composition and paper weight advice so home-printed A4 collages never curl inside wall frames.",
    tipVerb: (tip) => `Ensuring you "${tip.toLowerCase()}" stops dark ink coverage from warping lightweight office paper on multi-photo A4 collages.`,
  },
};

function buildPhotoToolContent(spec: PhotoToolSpecInput): PageContent {
  const t = PHOTO_TOOL_TAILOR[spec.id] ?? PHOTO_TOOL_TAILOR.T01;
  const sections: HeadingNode[] = [
    {
      level: 2,
      text: spec.h2Steps,
      paragraphs: [t.stepsLead],
      children: [
        {
          level: 3,
          text: spec.steps[0],
          paragraphs: [t.uploadHint],
        },
        {
          level: 3,
          text: spec.steps[1],
          paragraphs: [t.gridHint],
          children: [
            {
              level: 4,
              text: spec.step2Sub[0],
              paragraphs: [t.orientHint],
            },
            {
              level: 4,
              text: spec.step2Sub[1],
              paragraphs: [t.gapHint],
            },
          ],
        },
        {
          level: 3,
          text: spec.steps[2],
          paragraphs: [t.cropHint],
        },
        {
          level: 3,
          text: spec.steps[3],
          paragraphs: [t.exportHint],
        },
      ],
    },
    {
      level: 2,
      text: spec.h2Layouts,
      paragraphs: [t.presetsIntro],
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
      paragraphs: [t.settingsLead],
      children: [
        {
          level: 3,
          text: "Page size and orientation",
          children: [
            {
              level: 4,
              text: spec.paperNote,
              paragraphs: [t.trayNote],
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
              paragraphs: [t.scale100],
            },
            {
              level: 4,
              text: "Keep a safe margin",
              paragraphs: [t.marginRule],
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
              paragraphs: [t.pdfVsJpg],
            },
          ],
        },
      ],
    },
    {
      level: 2,
      text: spec.h2Projects,
      paragraphs: [t.projectsLead],
      children: spec.projects.map((proj) => ({
        level: 3 as const,
        text: proj,
        paragraphs: [t.projectVerb(proj)],
      })),
    },
    {
      level: 2,
      text: "Tips for cleaner, sharper prints",
      paragraphs: [t.tipsLead],
      inlineLinks: [
        { targetId: "G01", anchor: "how to print many pictures on one page" },
      ],
      children: spec.tips.map((tip) => ({
        level: 3 as const,
        text: tip,
        paragraphs: [t.tipVerb(tip)],
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

export const PHOTO_TOOLS_CONTENT: Partial<Record<PageId, PageContent>> = {
  T01: buildPhotoToolContent({
    id: "T01",
    subtitle:
      "Arrange 3, 5, 6, 8, 9, or 10 photos onto one A4, A3, or Letter sheet and export a print-ready PDF.",
    intro: [
      "Need to arrange photos for printing onto a single sheet without wrestling with word-processor tables? Drop your images into the free online photo sheet maker above, pick a multi-photo grid such as 6-up, 8-up, 9-up, or 10-up, adjust spacing, and export an exact-scale PDF in seconds.",
      "This a4 page photo tool works for mixed orientations, custom margins, and cut guides. Whether you want to combine photos in one page for a family album or print different photos on one page for school handouts, everything runs privately in your browser with no sign-up.",
    ],
    h2Steps: "How to use the photo sheet maker in 4 steps",
    steps: [
      "Step 1: Upload your photos",
      "Step 2: Pick a sheet size and grid",
      "Step 3: Adjust spacing, crop and order",
      "Step 4: Download the print-ready PDF",
    ],
    step2Sub: ["Choose A4, A3 or Letter", "Set rows, columns and gutters"],
    h2Layouts: "Arrange photos for printing: layouts and presets",
    presets: [
      {
        name: "Equal-size photo grid",
        s1: "6, 8, 9 or 10 photos per page",
        s2: "Best for albums and contact sheets",
        desc: "Place multiple photos in one A4 paper grid with identical frame widths. Ideal when you want to print 3 photos on one page, print 6 pictures per page, or fit up to 10 snapshots onto one sheet.",
      },
      {
        name: "Mixed-size photo layout",
        s1: "One hero photo plus small prints",
        s2: "Best for scrapbooks and posters",
        desc: "Feature one large focal image on the top half of the page alongside four smaller detail frames below—perfect when you need to print different size photos on one page.",
      },
      {
        name: "Merged photo strip",
        s1: "Two or three photos joined edge to edge",
        s2: "Best for before-and-after pages",
        desc: "Set spacing to 0–2 mm to merge image on one page into a clean horizontal or vertical comparison strip.",
      },
    ],
    h2Settings: "Arrange photos for printing online: paper size and print settings",
    paperNote: "Using A4, A3 or Letter",
    recSettingHeading:
      "Print different photos on one page: recommended settings",
    recSettingBody:
      "When you arrange multiple photos on one page online, choose A4 (210 × 297 mm) with a 10 mm outer margin and 5 mm gutter for general home inkjets, or switch to A3 when printing large 10-photo contact sheets.",
    h2Projects: "Combine photos in one page for everyday projects",
    projects: [
      "Family albums and school projects",
      "Product and listing photos",
      "Reference and mood-board sheets",
    ],
    tips: [
      "Match photo orientation before you arrange",
      "Leave a 5 mm safe margin for home printers",
      "Export as PDF to keep the layout locked",
    ],
    faqs: [
      {
        q: "Can I print different photos on one page?",
        a: "Yes. Upload as many distinct JPG or PNG files as you need—each grid slot accepts a different photo so you can print different photos on one page cleanly.",
      },
      {
        q: "How do I combine photos in one page?",
        a: "Upload your files in Step 1, choose a preset grid (or click Cycle to reorder slots), and export the combined PDF sheet. It is the fastest way to combine images in one page without editing layers.",
      },
      {
        q: "Is it free to arrange photos for printing online?",
        a: "Yes. You can arrange photos for printing online completely free with no account, daily limit, or watermark.",
      },
      {
        q: "How many photos fit on an A4 sheet?",
        a: "An A4 printable photo layout comfortably holds 2 large 4×6 prints, 4 album prints, 6–8 journal snapshots, or 9–10 wallet-sized pictures per page.",
      },
    ],
    relatedH3s: [
      {
        targetId: "T03",
        anchor: "print 4 photos on one page",
        desc: "Dedicated 2×2 and 4-strip maker for four-photo sheets.",
      },
      {
        targetId: "T04",
        anchor: "print picture multiple times on one page",
        desc: "Duplicate one photo across 4 to 16 identical wallet or tag slots.",
      },
      {
        targetId: "T10",
        anchor: "a4 collage maker",
        desc: "Build decorative A4 collages with titles and custom borders.",
      },
      {
        targetId: "T05",
        anchor: "print big picture on multiple pages",
        desc: "Split one large photo into multi-page wall poster tiles.",
      },
      {
        targetId: "B01",
        anchor: "software to print multiple photos on one page",
        desc: "Compare browser photo grid makers with desktop print apps.",
      },
      {
        targetId: "H03",
        anchor: "how to print multiple images on one page in photoshop",
        desc: "Compare Lightroom and Photoshop Contact Sheet II against browser grids.",
      },
      {
        targetId: "H04",
        anchor: "how to print multiple pictures on one page epson iprint",
        desc: "Walk through mobile multi-photo layouts with Epson iPrint vs A4 PDF.",
      },
    ],
  }),

  T02: buildPhotoToolContent({
    id: "T02",
    subtitle:
      "Place two photos side by side or stacked vertically on a single A4 or Letter sheet and export a print-ready PDF.",
    intro: [
      "Use this tool to print 2 photos on one page cleanly without stretching or clipping either image. Upload two pictures, pick stacked portrait, side-by-side landscape, or a 60/40 comparison split, and download a print-ready PDF in seconds.",
      "Home printers waste half a sheet when you print a single half-page image at a time. Whether you want to merge 2 photos in one page for a school report, print front and back ID scans, or compare before-and-after shots, this two-photo sheet maker locks exact spacing automatically.",
    ],
    h2Steps: "How to use the two-photo sheet maker in 4 steps",
    steps: [
      "Step 1: Add your two photos",
      "Step 2: Choose stacked or side-by-side",
      "Step 3: Fit, crop and centre each photo",
      "Step 4: Download and print the PDF",
    ],
    step2Sub: [
      "Portrait page: stacked layout",
      "Landscape page: side-by-side layout",
    ],
    h2Layouts: "Print 2 photos on one page: layouts and presets",
    presets: [
      {
        name: "Two photos stacked",
        s1: "Each photo about half the page height",
        s2: "Best for portrait photos",
        desc: "Places two landscape or square frames one above the other on a portrait A4 or Letter sheet, ideal when printing two 4×6-sized snapshots on one page.",
      },
      {
        name: "Two photos side by side",
        s1: "Landscape sheet, equal widths",
        s2: "Best for comparisons",
        desc: "Switches the sheet to landscape and aligns both photos left-to-right so portrait photos fill each half cleanly.",
      },
      {
        name: "One large and one small photo",
        s1: "60/40 split with shared margins",
        s2: "Best for feature-and-detail pages",
        desc: "Gives your hero shot 60% of the sheet height while reserving 40% for a secondary detail or close-up.",
      },
    ],
    h2Settings: "Print two photos on one page: paper size and print settings",
    paperNote: "Using A4 or Letter",
    recSettingHeading: "Merge 2 photos in one page: recommended settings",
    recSettingBody:
      "If you want to merge 2 images in one page as a seamless side-by-side card, lower Spacing to 0–2 mm and enable Crop to Fill. If you plan to cut the two pictures apart, keep Spacing at 8–10 mm and turn Cut marks on.",
    h2Projects: "Print 2 pictures on one page for everyday projects",
    projects: [
      "Before-and-after comparisons",
      "Front and back of an ID or document",
      "Greeting-card and craft inserts",
    ],
    tips: [
      "Pick the same aspect ratio for both photos",
      "Keep 10 mm between photos for clean cutting",
      "Use Actual Size in the print dialog",
    ],
    faqs: [
      {
        q: "How to print 2 photos on one page?",
        a: "Click Add Photos, select your two pictures, pick Stacked or Side-by-Side, and click Download Print-Ready PDF. Print the PDF at 100% scale.",
      },
      {
        q: "How to print two photos on one A4 page?",
        a: "Leave Paper Size set to A4 (210 × 297 mm). Stacked fits two landscape photos cleanly, while Side-by-Side fits two vertical portraits side by side.",
      },
      {
        q: "How do I merge two photos in one page?",
        a: "To merge two photos in one page edge-to-edge, set the spacing slider to 0 mm and download the combined sheet as a single PDF.",
      },
      {
        q: "Can the two photos be different sizes?",
        a: "Yes. Use Fit Whole to show each original photo uncropped regardless of resolution, or choose the 60/40 Split preset to highlight one larger image.",
      },
    ],
    relatedH3s: [
      {
        targetId: "T03",
        anchor: "print 4 photos on one page",
        desc: "Upgrade to a 2×2 grid when you need four photos on one sheet.",
      },
      {
        targetId: "T01",
        anchor: "arrange photos for printing",
        desc: "Arrange 3, 6, 8, 9, or 10 photos on one A4 or A3 page.",
      },
      {
        targetId: "T04",
        anchor: "print picture multiple times on one page",
        desc: "Repeat one photo across wallet or badge slots automatically.",
      },
    ],
  }),

  T03: buildPhotoToolContent({
    id: "T03",
    subtitle:
      "Place four photos into a balanced 2×2 grid, four stacked strips, or mixed hero sheet on A4 or Letter.",
    intro: [
      "Use this free maker to print 4 photos on one page in seconds—perfect for photo albums, school displays, and compact travel journals. Drop in four pictures, choose a 2×2 grid or vertical strip layout, and download a crisp PDF with optional cut guides.",
      "Instead of guessing margins in a document editor, our four-photo sheet maker calculates equal quarters automatically so you can print 4 pictures on one page or print 4 images on one page with uniform white borders.",
    ],
    h2Steps: "How to use the four-photo sheet maker in 4 steps",
    steps: [
      "Step 1: Upload four photos",
      "Step 2: Select the 2x2 grid or a strip layout",
      "Step 3: Align, crop and reorder photos",
      "Step 4: Download the PDF and print",
    ],
    step2Sub: [
      "2x2 grid for a portrait A4 page",
      "Four horizontal strips",
    ],
    h2Layouts: "Print 4 photos on one page: layouts and presets",
    presets: [
      {
        name: "2x2 grid on A4",
        s1: "Four equal quarters with even gutters",
        s2: "Best for matching photo sizes",
        desc: "Divides the printable page into four identical frames so every snapshot prints at the exact same height and width.",
      },
      {
        name: "Four stacked strips",
        s1: "Landscape photos in a vertical stack",
        s2: "Best for photo-booth style prints",
        desc: "Stacks four wide panoramic or horizontal photos down the page—great for sequential steps or photo-booth memories.",
      },
      {
        name: "Four mixed-size photos",
        s1: "One tall photo and three small ones",
        s2: "Best for collage-style pages",
        desc: "Highlights one wide hero image across the top with three matching detail shots aligned below.",
      },
    ],
    h2Settings: "Print 4 pictures on one page: paper size and print settings",
    paperNote: "Using A4 or Letter",
    recSettingHeading: "Print 4 images on one page: recommended settings",
    recSettingBody:
      "For standard A4 photo paper, keep margins at 10 mm and spacing at 5 mm so each 2×2 cell measures roughly 92 × 136 mm—a crisp postcard-friendly proportion.",
    h2Projects: "How to print four pictures on one page for everyday projects",
    projects: [
      "Photo albums and journals",
      "School displays and class projects",
      "Cutting four small prints from one sheet",
    ],
    tips: [
      "Use photos of similar brightness for a balanced page",
      "Keep gutters at 5 to 10 mm if you plan to cut",
      "Print a test page on plain paper first",
    ],
    faqs: [
      {
        q: "How do I print 4 pictures on one page?",
        a: "Click Add Photos to upload your four pictures, keep the 2×2 Equal Grid active, and export the print-ready PDF. Open the PDF and print at 100% scale.",
      },
      {
        q: "How to print four photos on one page?",
        a: "Whether you start from phone photos or DSLR exports, this 2×2 maker resizes all four frames uniformly onto one A4 or US Letter page with no login.",
      },
      {
        q: "How to print 4 photos per page?",
        a: "Choosing the 2×2 grid puts exactly four photos per page. If you have more than four photos, run a second sheet in seconds.",
      },
      {
        q: "Can I print 4 different photos on one page?",
        a: "Yes—you can upload four completely different photos, reorder them with Cycle, and switch between Crop to Fill and Fit Whole anytime.",
      },
    ],
    relatedH3s: [
      {
        targetId: "T02",
        anchor: "print 2 photos on one page",
        desc: "Need larger half-page prints? Switch to our two-photo maker.",
      },
      {
        targetId: "T01",
        anchor: "arrange photos for printing",
        desc: "Fit 6, 8, 9, or 10 photos onto a single A4 or A3 sheet.",
      },
      {
        targetId: "T08",
        anchor: "printable 4x6 photo template",
        desc: "Create 4×6 lab-ready photo grids and bordered prints.",
      },
    ],
  }),

  T04: buildPhotoToolContent({
    id: "T04",
    subtitle:
      "Upload one photo once and tile 2, 4, 9, or 12 identical copies across one A4 or Letter sheet.",
    intro: [
      "Use this duplicate photo sheet maker to print picture multiple times on one page without duplicating layers in an image editor. Upload one portrait, logo, or product shot, pick how many copies you want per sheet, and download a PDF with hairline trim marks.",
      "From wallet-sized family portraits to repeating craft badge inserts, you can print one picture multiple times on one page in seconds—saving photo paper and ensuring every cut copy is identical.",
    ],
    h2Steps: "How to use the duplicate photo sheet maker in 4 steps",
    steps: [
      "Step 1: Upload a single photo",
      "Step 2: Set how many copies you need",
      "Step 3: Choose the copy size and spacing",
      "Step 4: Download the sheet and print",
    ],
    step2Sub: [
      "Auto-fill the sheet with copies",
      "Set an exact number of copies",
    ],
    h2Layouts: "Print picture multiple times on one page: layouts and presets",
    presets: [
      {
        name: "Wallet-size copies",
        s1: "About 8 to 9 copies per A4 sheet",
        s2: "Best for gifts and school forms",
        desc: "Fills a 3×3 grid on A4 or Letter so you can print multiple copies of photo on one page at classic wallet dimensions.",
      },
      {
        name: "Small square copies",
        s1: "Square crops in a tight grid",
        s2: "Best for badges, magnets and stickers",
        desc: "Tiles 12 compact slots per sheet—ideal for button badges, fridge magnets, and square craft inserts.",
      },
      {
        name: "Large repeated prints",
        s1: "Two to four copies per page",
        s2: "Best for crafts and displays",
        desc: "Repeats one large flyer, artwork, or portrait 2 or 4 times on a single sheet for fast cutting.",
      },
    ],
    h2Settings:
      "Print one picture multiple times on one page: paper size and print settings",
    paperNote: "Using A4 or Letter",
    recSettingHeading:
      "How to print same photo multiple times on one page: recommended settings",
    recSettingBody:
      "Enable Cut marks and set Spacing to 5 mm so a paper trimmer glides straight between repeated copies without clipping borders.",
    h2Projects:
      "Print multiple copies of photo on one page for everyday projects",
    projects: [
      "Cutting multiple copies of one portrait",
      "Printing the same logo or product photo",
      "Making identical craft or badge inserts",
    ],
    tips: [
      "Start from the highest-resolution original",
      "Add thin cut guides between copies",
      "Avoid enlarging small photos past their native size",
    ],
    faqs: [
      {
        q: "How to print a picture multiple times on one page?",
        a: "Click Choose Photo, upload your single picture, choose 9-up, 12-up, 4-up, or 2-up above the workspace, and export the print-ready PDF.",
      },
      {
        q: "How to print duplicate images on one page?",
        a: "This tool duplicates your uploaded file across every slot automatically—no copying or pasting needed.",
      },
      {
        q: "How to print same image multiple times?",
        a: "Pick a preset count, turn on Cut marks for easy trimming, and print the downloaded PDF at Actual Size (100%).",
      },
      {
        q: "How many copies of one photo fit on A4?",
        a: "Depending on copy size, 2 half-page copies, 4 quarter-page prints, 9 wallet copies, or 12 small badge prints fit cleanly on A4.",
      },
    ],
    relatedH3s: [
      {
        targetId: "T01",
        anchor: "arrange photos for printing",
        desc: "Need different photos on one sheet instead of copies? Use our multi-photo grid.",
      },
      {
        targetId: "T02",
        anchor: "print 2 photos on one page",
        desc: "Print two photos side by side or stacked vertically.",
      },
      {
        targetId: "T06",
        anchor: "passport photo sheet maker",
        desc: "Locked 35 × 45 mm and 2 × 2 inch sheets for official IDs.",
      },
      {
        targetId: "B01",
        anchor: "app to arrange photos for printing",
        desc: "Review free vs paid software options for multi-photo print sheets.",
      },
    ],
  }),

  T05: buildPhotoToolContent({
    id: "T05",
    subtitle:
      "Split one large image across 4, 6, 9, or 12 sheets with tape overlap and crop marks to assemble wall posters at home.",
    intro: [
      "Use this free poster splitter to print big picture on multiple pages using any standard home or office printer. Upload a large photo, artwork, or classroom chart, pick a 2×2, 3×3, or custom sheet grid, add tape overlap, and export a multi-page PDF ready to trim and tape.",
      "Instead of paying for wide-format plotting on quick wall art or banners, you can print large picture multiple pages in seconds—with numbered Row and Column assembly labels on every tile.",
    ],
    h2Steps: "How to use the poster splitter in 4 steps",
    steps: [
      "Step 1: Upload your large image",
      "Step 2: Choose poster size or page count",
      "Step 3: Preview overlap, crop marks and page order",
      "Step 4: Download all pages as one PDF",
    ],
    step2Sub: [
      "Pick a grid such as 2x2 or 3x3",
      "Set tile overlap for easy taping",
    ],
    h2Layouts: "Print big picture on multiple pages: layouts and presets",
    presets: [
      {
        name: "2x2 poster (4 sheets)",
        s1: "About 420 x 594 mm on A4 sheets",
        s2: "Best for wall art and school posters",
        desc: "Splits one image across four A4 or Letter pages to create a medium-sized poster nearly twice as wide and tall as one sheet.",
      },
      {
        name: "3x3 poster (9 sheets)",
        s1: "Roughly A1-sized final poster",
        s2: "Best for banners and murals",
        desc: "Spreads your artwork across nine sheets for an impressive A1-scale wall display or party backdrop.",
      },
      {
        name: "Custom poster size",
        s1: "Enter final width and height",
        s2: "Best for exact frame or wall sizes",
        desc: "Adjust Columns (1–6) and Rows (1–6) independently for wide horizontal banners or tall vertical charts.",
      },
    ],
    h2Settings:
      "Print large picture multiple pages: paper size and print settings",
    paperNote: "Using A4 or Letter tiles",
    recSettingHeading: "Print picture on several pages: recommended settings",
    recSettingBody:
      "Keep an 8 mm margin and 8 mm tape overlap so every printer border is trimmed cleanly and adjacent tiles align without gaps.",
    h2Projects: "Print one image on multiple pages for everyday projects",
    projects: [
      "Wall posters and banners",
      "Classroom maps and charts",
      "Large stencils and craft templates",
    ],
    tips: [
      "Start with a high-resolution image",
      "Keep 5 to 10 mm overlap for trimming",
      "Number the pages before you tape them together",
    ],
    faqs: [
      {
        q: "Can I print one photo on multiple pages?",
        a: "Yes. Upload any JPG or PNG above, choose 2×2, 3×3, or a custom column/row grid, and export a multi-page PDF where each page prints one numbered tile.",
      },
      {
        q: "How many pages do I need to print a big picture?",
        a: "A 2×2 grid (4 pages) yields roughly an A2 poster; a 3×3 grid (9 pages) yields roughly an A1 poster; and a 4×3 grid (12 pages) creates a wide banner.",
      },
      {
        q: "How do I print a picture larger than one page?",
        a: "Split the image into overlapping tiles in this poster splitter, print the resulting PDF at 100% scale, trim one edge of each overlap, and tape the tiles together from behind.",
      },
      {
        q: "What resolution does a poster need?",
        a: "Aim for at least 1,500–2,500 pixels on the short side for a 2×2 poster, or 3,000+ pixels for a 3×3 wall mural viewed up close.",
      },
    ],
    relatedH3s: [
      {
        targetId: "G02",
        anchor: "how to print a big picture on multiple pages",
        desc: "Read the complete guide to resolution, overlap, and poster taping.",
      },
      {
        targetId: "T01",
        anchor: "arrange photos for printing",
        desc: "Go the other direction: combine many small photos onto one sheet.",
      },
      {
        targetId: "T10",
        anchor: "a4 collage maker",
        desc: "Build a single-sheet A4 photo collage with borders and titles.",
      },
    ],
  }),

  T06: buildPhotoToolContent({
    id: "T06",
    subtitle:
      "Turn one passport or visa photo into a ready-to-cut A4 sheet with 35×45 mm or 2×2 inch slots.",
    intro: [
      "Use this free passport photo sheet maker to repeat a compliant ID photo 6, 8, or 16 times on a single A4 page. Choose 35 × 45 mm or 2 × 2 inch presets, add thin cut marks, and export a print-ready PDF with zero sign-up.",
      "Printing passport photos on a4 sheet at home saves money when you need multiple copies for visas, school forms, and exam applications—just be sure to verify your country's current photo rules before printing.",
    ],
    h2Steps: "How to use the passport photo sheet maker in 4 steps",
    steps: [
      "Step 1: Upload your passport photo",
      "Step 2: Pick the photo size for your country",
      "Step 3: Set the number of photos per sheet",
      "Step 4: Download and print on A4",
    ],
    step2Sub: [
      "Common sizes: 35x45 mm and 2x2 in",
      "Spacing for clean cutting",
    ],
    h2Layouts: "Passport photo sheet maker: layouts and presets",
    presets: [
      {
        name: "35 x 45 mm photos (8 per sheet)",
        s1: "Used in many countries",
        s2: "Best for visa and passport forms",
        desc: "Places 8 or 16 exact 35 × 45 mm frames onto an A4 sheet—matching the standard UK, EU, Australian, and Indian passport photo dimensions.",
      },
      {
        name: "2 x 2 inch photos (6 per sheet)",
        s1: "US-style passport size",
        s2: "Best for US applications",
        desc: "Arranges six 50.8 × 50.8 mm (2 × 2 in) squares centered on A4 with generous trimming room.",
      },
      {
        name: "Mixed sizes on one sheet",
        s1: "Combine two standard sizes",
        s2: "Best for multi-form applications",
        desc: "Switch between 8-up and 16-up grids or adjust paper size to Letter when preparing multiple ID sets.",
      },
    ],
    h2Settings:
      "Passport size photo sheet maker: paper size and print settings",
    paperNote: "Using A4",
    recSettingHeading:
      "Print multiple passport photos on one page: recommended settings",
    recSettingBody:
      "Always print on glossy or semi-gloss photo paper with Actual Size (100%) selected—never Fit to Page, which shrinks 35 × 45 mm frames by 3–5% and can cause rejection.",
    h2Projects: "Passport photos on A4 sheet for everyday projects",
    projects: [
      "Passport and visa applications",
      "School and exam forms",
      "ID cards and membership applications",
    ],
    tips: [
      "Check your country's current photo rules before printing",
      "Print on glossy photo paper at 100% scale",
      "Cut along the guides with a paper trimmer",
    ],
    faqs: [
      {
        q: "How do I print multiple passport photos on one page?",
        a: "Upload your cropped passport photo above, select 35 × 45 mm or 2 × 2 in, download the A4 PDF, and print it at 100% scale on photo paper.",
      },
      {
        q: "What size is a passport photo?",
        a: "The two most common sizes are 35 × 45 mm (UK, Europe, Australia, India) and 2 × 2 inches / 51 × 51 mm (United States). Always confirm your issuing authority's latest guidelines.",
      },
      {
        q: "Can I print passport photos at home?",
        a: "Yes, as long as your inkjet printer uses high-quality photo paper, neutral lighting/background rules are met, and you print at 100% scale.",
      },
      {
        q: "Does this tool crop my face automatically?",
        a: "No—use Crop to Fill for centered framing or prepare your head-height crop first so face proportions comply with official biometric rules.",
      },
    ],
    relatedH3s: [
      {
        targetId: "T07",
        anchor: "passport photo template 4x6",
        desc: "Format passport photos onto a 4×6 print for cheap photo-lab kiosks.",
      },
      {
        targetId: "H12",
        anchor: "how to print multiple passport photos on one page",
        desc: "Step-by-step guide to cutting, scaling, and checking official rules.",
      },
      {
        targetId: "T01",
        anchor: "arrange photos for printing",
        desc: "Arrange general family and event photos onto A4 sheets.",
      },
    ],
  }),

  T07: buildPhotoToolContent({
    id: "T07",
    subtitle:
      "Arrange 2×2 inch or 35×45 mm passport photos onto a 4×6 inch (102 × 152 mm) sheet for photo labs and kiosks.",
    intro: [
      "Use this free passport photo template 4x6 to place two 2 × 2 inch photos or four 35 × 45 mm photos onto a standard 4×6 photo print. Export the ready-to-print sheet and order a single inexpensive 4×6 print at any local drugstore kiosk or photo lab.",
      "Compared with paying studio fees, preparing your own 4x6 passport template lets you arrange passport photo to 4x6 online in under a minute. Always check local passport rules for head size, background colour, and matte/glossy paper before submitting.",
    ],
    h2Steps: "How to use the 4x6 passport photo template in 4 steps",
    steps: [
      "Step 1: Upload your passport photo",
      "Step 2: Select the passport size",
      "Step 3: Fit the photos onto a 4x6 sheet",
      "Step 4: Download and print at a photo shop",
    ],
    step2Sub: [
      "4x6 inch / 6x4 inch orientation",
      "Safe margins for lab printers",
    ],
    h2Layouts: "Passport photo template 4x6: layouts and presets",
    presets: [
      {
        name: "2 x 2 inch (two photos on a 4x6)",
        s1: "Two photos with a centred gap",
        s2: "Best for US passports",
        desc: "Places two exact 50.8 × 50.8 mm squares side by side inside a 4×6 landscape frame with safe outer lab margins.",
      },
      {
        name: "35 x 45 mm (two photos on a 4x6)",
        s1: "Metric standard for many countries",
        s2: "Best for visas and IDs",
        desc: "Places up to four 35 × 45 mm metric ID frames neatly inside a 6×4 inch sheet.",
      },
      {
        name: "Four small photos on a 4x6",
        s1: "Compact 25 x 35 mm size",
        s2: "Best for exam and club forms",
        desc: "Fits eight compact 25 × 35 mm stamp-style ID photos onto one 4×6 card.",
      },
    ],
    h2Settings: "4x6 passport template: paper size and print settings",
    paperNote: "Using 4x6 inch (102 x 152 mm)",
    recSettingHeading: "Arrange passport photo to 4x6 online: recommended settings",
    recSettingBody:
      "Leave at least a 4 mm outer margin on 4×6 sheets because photo kiosks often trim 1–2 mm during borderless lab printing.",
    h2Projects: "Passport 4x6 template for everyday projects",
    projects: [
      "Photo-lab printing of passport photos",
      "Drugstore and kiosk print orders",
      "Printing on 4x6 photo printers at home",
    ],
    tips: [
      "Order as 4x6 prints and choose no auto-crop",
      "Keep important edges away from the trim line",
      "Export at 300 DPI or higher",
    ],
    faqs: [
      {
        q: "How do I arrange a passport photo to 4x6 online?",
        a: "Upload your photo above, choose the 2 × 2 in or 35 × 45 mm preset, and download the 4×6 PDF sheet. No Photoshop is needed.",
      },
      {
        q: "What is the standard passport photo template 4x6?",
        a: "A standard 4×6 (6×4) sheet is 101.6 × 152.4 mm and typically holds two 2 × 2 inch photos or four 35 × 45 mm photos cleanly.",
      },
      {
        q: "How many passport photos fit on a 4x6 print?",
        a: "Two 2 × 2 inch US passport photos fit comfortably with safe margins, or up to four 35 × 45 mm metric ID photos.",
      },
      {
        q: "Can I use this at a photo kiosk?",
        a: "Yes—bring the exported 4×6 file on a phone or USB drive and select 'No Crop / Original' at the kiosk.",
      },
    ],
    relatedH3s: [
      {
        targetId: "T06",
        anchor: "passport photo sheet maker",
        desc: "Use an A4 sheet instead when printing 8 to 16 passport photos at home.",
      },
      {
        targetId: "H12",
        anchor: "how to print multiple passport photos on one page",
        desc: "Full checklist for scaling, lighting, and cutting ID prints.",
      },
      {
        targetId: "T08",
        anchor: "printable 4x6 photo template",
        desc: "General blank and multi-slot 4×6 photo grids.",
      },
    ],
  }),

  T08: buildPhotoToolContent({
    id: "T08",
    subtitle:
      "Free printable 4×6 (102 × 152 mm) photo templates: full-bleed single, 2-up, 4-up grids, and caption cards.",
    intro: [
      "Use this printable 4x6 photo template builder to lay out single snapshots, 2-up mini prints, 4-up wallet grids, or photo-plus-caption postcards at exact 4×6 inch (4R) size. Drop in your photos and download a print-ready PDF with zero sign-up.",
      "Whether you are preparing a 4x6 photo grid for a home photo printer or formatting a 4x6 picture template for a store kiosk, this browser tool guarantees true 101.6 × 152.4 mm proportions without needing Photoshop.",
    ],
    h2Steps: "How to use the 4x6 photo template maker in 4 steps",
    steps: [
      "Step 1: Choose a 4x6 template",
      "Step 2: Drop in your photos",
      "Step 3: Adjust spacing, borders and crop",
      "Step 4: Download the print-ready PDF",
    ],
    step2Sub: [
      "Portrait or landscape orientation",
      "Borders, margins and bleed",
    ],
    h2Layouts: "Printable 4x6 photo template: layouts and presets",
    presets: [
      {
        name: "Single full-bleed 4x6",
        s1: "One photo filling the print",
        s2: "Best for lab prints",
        desc: "Creates a classic single 4×6 photo template with clean optional white borders or zero-margin framing.",
      },
      {
        name: "2-up and 4-up grids",
        s1: "Two or four photos on one 4x6",
        s2: "Best for mini prints and stickers",
        desc: "Splits a single 4×6 sheet into two 3×4 inch prints or a four-slot 4×6 photo grid for journals and mini albums.",
      },
      {
        name: "Card-style 4x6 template",
        s1: "Photo plus caption area",
        s2: "Best for postcards and photo cards",
        desc: "Combines a top photo frame with a clean white bottom strip for dates, locations, or postcard greetings.",
      },
    ],
    h2Settings: "4x6 photo template: paper size and print settings",
    paperNote: "Using 4x6 inch (102 x 152 mm)",
    recSettingHeading: "4x6 photo grid: recommended settings",
    recSettingBody:
      "Keep Margin at 3–4 mm and Spacing at 3 mm when building a 2-up or 4-up 4×6 photo grid so no edge gets clipped at a drugstore kiosk.",
    h2Projects: "4x6 photo template for printing for everyday projects",
    projects: [
      "Photo-lab and kiosk orders",
      "Postcards and photo cards",
      "Memory boards and scrapbook pages",
    ],
    tips: [
      "Match the template orientation to your photos",
      "Add 3 mm bleed for full-bleed prints",
      "Save as high-quality JPG or PDF",
    ],
    faqs: [
      {
        q: "Where can I get a printable 4x6 photo template?",
        a: "Right here—select a 1-up, 2-up, 4-up, or caption card preset above, upload your photos, and export a free printable 4×6 PDF.",
      },
      {
        q: "What is the size of a 4x6 photo template?",
        a: "A 4×6 photo template measures 4 × 6 inches, equal to 101.6 × 152.4 mm (often sold as 4R photo paper).",
      },
      {
        q: "Can I print a 4x6 template at home?",
        a: "Yes. Load 4×6 (4R) photo paper into your inkjet's rear or photo tray, select 4×6 in the print dialog, and print at 100% scale.",
      },
      {
        q: "How do I make a 4x6 photo grid?",
        a: "Click the 2-Up or 4-Up Grid button above the preview, add your pictures, and download the finished sheet.",
      },
    ],
    relatedH3s: [
      {
        targetId: "T09",
        anchor: "4x6 collage maker",
        desc: "Build multi-frame 4×6 collages and photo-booth strips.",
      },
      {
        targetId: "T07",
        anchor: "passport photo template 4x6",
        desc: "Place exact 2×2 in or 35×45 mm ID photos on a 4×6 sheet.",
      },
      {
        targetId: "G04",
        anchor: "print multiple 4x6 photos on one page",
        desc: "Learn how two 4×6 (4R) prints fit onto a single A4 page.",
      },
      {
        targetId: "H13",
        anchor: "print 4x6 photos at home",
        desc: "Step-by-step glossy paper feeder and driver setup guide for 4R prints.",
      },
      {
        targetId: "B06",
        anchor: "a4 inkjet photo paper",
        desc: "Compare glossy, matte, and satin photo paper when cutting 4×6 from A4.",
      },
    ],
  }),

  T09: buildPhotoToolContent({
    id: "T09",
    subtitle:
      "Design 4×6 inch photo collages, 2×3 photo-booth strips with captions, and hero-plus-small highlight cards.",
    intro: [
      "Use this free 4x6 collage maker to combine multiple memories onto a single 4×6 inch photo print without paying for complex collage apps. Pick a 4-photo grid, photo-booth strip, or hero-and-detail layout, add your shots, and export a crisp 4×6 PDF.",
      "Because every export from our 4x6 photo collage maker is locked to 101.6 × 152.4 mm, you can create 4x6 photo collage prints for weddings, parties, or travel albums and print them cleanly at any kiosk or home 4×6 printer.",
    ],
    h2Steps: "How to use the 4x6 collage maker in 4 steps",
    steps: [
      "Step 1: Upload photos for your collage",
      "Step 2: Pick a 4x6 collage layout",
      "Step 3: Rearrange, crop and add borders",
      "Step 4: Download the 4x6 collage",
    ],
    step2Sub: [
      "Choose 2, 3, 4 or 6 photo layouts",
      "Set border width and colour",
    ],
    h2Layouts: "4x6 collage maker: layouts and presets",
    presets: [
      {
        name: "Classic 4-photo collage",
        s1: "Four equal frames",
        s2: "Best for event highlights",
        desc: "Places four photos in a tight, balanced 2×2 4×6 collage template with clean white borders.",
      },
      {
        name: "Photo-booth strip collage",
        s1: "Vertical frames with a caption area",
        s2: "Best for weddings and parties",
        desc: "Arranges six frames in two vertical columns with a custom event title or date line at the bottom.",
      },
      {
        name: "Hero-plus-small collage",
        s1: "One large photo and smaller frames",
        s2: "Best for travel and baby milestones",
        desc: "Pairs one wide feature snapshot on the left with two stacked secondary moments on the right.",
      },
    ],
    h2Settings: "4x6 photo collage maker: paper size and print settings",
    paperNote: "Using 4x6 inch (102 x 152 mm)",
    recSettingHeading: "Create 4x6 photo collage: recommended settings",
    recSettingBody:
      "Use 3–4 mm outer margins and 2–3 mm gutters so white borders look crisp even if a photo kiosk trims 1 mm around the outside.",
    h2Projects: "4x6 collage maker free for everyday projects",
    projects: [
      "Wedding and party prints",
      "Travel and holiday highlights",
      "Baby and family milestone cards",
    ],
    tips: [
      "Pick photos with one consistent colour tone",
      "Use thin white borders for a clean look",
      "Download at 300 DPI for photo-lab quality",
    ],
    faqs: [
      {
        q: "Is there a free 4x6 collage maker?",
        a: "Yes. This 4x6 collage maker free tool runs completely in your browser with no account, trial limit, or watermark.",
      },
      {
        q: "How do I create a 4x6 photo collage?",
        a: "Upload 3 to 6 photos, choose Classic 4-Photo, Photo-Booth Strip, or Hero+2, adjust spacing, and click Download Print-Ready PDF.",
      },
      {
        q: "Can I use a 4x6 collage maker app on my phone?",
        a: "Yes—our responsive web tool works directly inside iPhone Safari and Android Chrome so you never need to install a separate 4x6 collage maker app.",
      },
      {
        q: "What size should a 4x6 collage be?",
        a: "A 4×6 collage measures 4 × 6 inches (101.6 × 152.4 mm), or 1200 × 1800 pixels at 300 DPI.",
      },
    ],
    relatedH3s: [
      {
        targetId: "T08",
        anchor: "printable 4x6 photo template",
        desc: "Need blank 4×6 grids or single-photo frames? Open our 4×6 templates.",
      },
      {
        targetId: "T10",
        anchor: "a4 collage maker",
        desc: "Scale up to full-page A4 collages for posters and wall frames.",
      },
      {
        targetId: "CS02",
        anchor: "4x6 photo booth template",
        desc: "See a wedding photographer workflow for 4×6 photo-booth strips.",
      },
      {
        targetId: "H04",
        anchor: "epson print multiple photos on one page",
        desc: "See how Epson Wi-Fi mobile apps print 4×6 collage files cleanly.",
      },
    ],
  }),

  T10: buildPhotoToolContent({
    id: "T10",
    subtitle:
      "Build full-page A4 (210 × 297 mm) photo collages with equal grids, mixed frames, and custom poster titles.",
    intro: [
      "Use this free a4 collage maker to arrange your favourite photos into a full-page A4 layout ready for home or copy-shop printing. Choose a 2×3 grid, a 5-frame mixed poster, or a titled collage sheet, and export a print-ready PDF with zero sign-up.",
      "An a4 size collage maker saves time when preparing school projects, wall frames, or club newsletters—you can create a4 collage sheets online and print at exact 210 × 297 mm dimensions in under two minutes.",
    ],
    h2Steps: "How to use the A4 collage maker in 4 steps",
    steps: [
      "Step 1: Add your photos",
      "Step 2: Choose an A4 collage layout",
      "Step 3: Rearrange, crop and set spacing",
      "Step 4: Download the A4 PDF or JPG",
    ],
    step2Sub: [
      "Portrait or landscape A4",
      "Spacing, borders and rounded corners",
    ],
    h2Layouts: "A4 collage maker: layouts and presets",
    presets: [
      {
        name: "Grid collage",
        s1: "Equal frames in rows and columns",
        s2: "Best for neat albums and school projects",
        desc: "Arranges six photos cleanly in a 2×3 A4 photo collage template with balanced spacing.",
      },
      {
        name: "Freeform collage",
        s1: "Mixed frame sizes in one layout",
        s2: "Best for scrapbooks and posters",
        desc: "Combines one wide banner image on top with four balanced smaller frames below for dynamic storytelling.",
      },
      {
        name: "Photo-and-text collage",
        s1: "Frames plus a title area",
        s2: "Best for greeting pages and newsletters",
        desc: "Includes a clean bottom title line under a 2×2 photo grid for family dates, class names, or trip titles.",
      },
    ],
    h2Settings: "A4 size collage maker: paper size and print settings",
    paperNote: "Using A4 (210 x 297 mm)",
    recSettingHeading: "Create A4 collage: recommended settings",
    recSettingBody:
      "For framed A4 wall prints, keep a 10 mm outer margin so the frame mat never hides the outer edges of your photos, and set spacing to 4–6 mm.",
    h2Projects: "Collage maker A4 size for everyday projects",
    projects: [
      "School posters and projects",
      "Wall displays and notice boards",
      "Gift pages and greeting cards",
    ],
    tips: [
      "Use consistent photo orientation within a row",
      "Keep 5 mm spacing for a cleaner grid",
      "Export as PDF for exact A4 sizing",
    ],
    faqs: [
      {
        q: "Is there a free A4 collage maker online?",
        a: "Yes. You can use this a4 collage maker online completely free in any modern browser with no account or watermark.",
      },
      {
        q: "How do I create an A4 collage?",
        a: "Upload 4 to 6 photos, pick Grid, Mixed Frame, or Photo + Title above, type an optional caption, and click Download Print-Ready PDF.",
      },
      {
        q: "What resolution do I need for an A4 collage?",
        a: "An A4 page at 300 DPI is 2480 × 3508 pixels overall, so standard 1200+ pixel phone photos look crisp inside multi-photo A4 collage frames.",
      },
      {
        q: "Can I make an A4 size collage on my phone?",
        a: "Yes. Open this page in your mobile browser, upload photos straight from your camera roll, and save the A4 PDF to print wirelessly.",
      },
    ],
    relatedH3s: [
      {
        targetId: "T01",
        anchor: "arrange photos for printing",
        desc: "Need 8, 9, or 10 plain photos on an A4 sheet? Use the photo sheet maker.",
      },
      {
        targetId: "T09",
        anchor: "4x6 collage maker",
        desc: "Design smaller 4×6 inch collages for photo-lab printing.",
      },
      {
        targetId: "T05",
        anchor: "print big picture on multiple pages",
        desc: "Split one big collage or image into a multi-page wall poster.",
      },
      {
        targetId: "G02",
        anchor: "how to print a big picture on multiple pages",
        desc: "Learn tile overlap and DPI limits when scaling wall collages past A4.",
      },
      {
        targetId: "H03",
        anchor: "photoshop print multiple images on one page",
        desc: "Follow our Adobe Photoshop & Lightroom grid export tutorial.",
      },
    ],
  }),
};

