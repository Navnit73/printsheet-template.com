import type { PageContent, PageId } from "@/types/spec";
import { buildHowToContent } from "./howto-builder";

export const HOWTOS_CONTENT_1: Partial<Record<PageId, PageContent>> = {
  H01: buildHowToContent({
    id: "H01",
    hubId: "HB-PH",
    hubAnchor: "photo layout maker for printing",
    subtitle:
      "Print 2, 4, 9, or 35 pictures onto one sheet on Windows 11 using File Explorer's built-in Print Pictures dialog—or bypass rigid presets cleanly.",
    intro: [
      "Knowing how to print multiple photos on one page windows 11 saves paper, protects ink cartridges, and gives clean matching cuts without installing Photoshop. While the updated Windows 11 Photos app strips out classic multi-picture grids, Windows 11 quietly keeps the classic Print Pictures wizard tucked right inside File Explorer—ready whenever you select two or more pictures.",
      "Follow these five clean steps to launch the hidden dialog on any PC or laptop, fix accidental face cropping caused by default checkbox settings, and switch smoothly to a browser sheet PDF when you need custom margins or exact millimetre framing.",
    ],
    needsIntro:
      "Gather your source image files in one folder and confirm your tray paper matches your layout before opening File Explorer.",
    needs: [
      {
        h3: "A Windows 11 PC and a connected printer",
        body: "Make sure your inkjet or laser printer driver is installed (not just a generic offline PDF driver) so paper sizes like A4, US Letter, and 4×6 appear cleanly inside the Print Pictures wizard. You can also choose Microsoft Print to PDF first if you prefer previewing exact sheets before feeding expensive photo stock.",
      },
      {
        h3: "Photos saved in one folder",
        body: "Copy all target JPG or PNG pictures into a single dedicated folder on your desktop or Pictures library. Trying to Ctrl-select scattered photos across cloud OneDrive folders or different sub-directories frequently resets your selection before the right-click menu opens.",
      },
    ],
    stepsH2: "Step-by-step: print using the Windows 11 Photos and print dialogs",
    stepsIntro:
      "Follow this exact sequence to learn how to print multiple pictures on one page windows 11 using native File Explorer controls instead of the stripped single-print Photos viewer.",
    steps: [
      {
        heading: "Step 1: Select your photos in File Explorer",
        body: "Open File Explorer (Windows + E) and navigate to the folder holding your snapshots. Hold down Ctrl and click each photo you want included—or press Ctrl+A if every picture in the folder belongs on the sheet.",
        extra:
          "Aim for matching orientation (all vertical portraits or all horizontal landscapes) whenever possible so every cell crops predictably.",
      },
      {
        heading: "Step 2: Right-click and choose Print",
        body: "Right-click any highlighted image. Because Windows 11 tucks legacy actions beneath a modern menu layer, click 'Show more options' at the bottom (or press Shift+F10) and select Print to open the Print Pictures window.",
        sub: [
          {
            h4: "Contact sheet layout",
            body: "Scrolling the right-hand layout rail down reveals 'Contact sheet (35)', packing thirty-five clean thumbnail indexes onto a single A4 or Letter sheet with optional filenames printed underneath.",
          },
          {
            h4: "4x6 and wallet sizes",
            body: "Midway down the rail you will find '4×6 in. (2)', '5×7 in. (2)', and 'Wallet (9)'—the fastest native grids for albums, greeting cards, and school swap prints.",
          },
        ],
      },
      {
        heading: "Step 3: Pick a layout such as contact sheet or full-page",
        body: "Click your chosen multi-picture grid on the right column and inspect the central page preview. Notice you can duplicate a single photo multiple times across one page using the Copies stepper beside each thumbnail in the preview tray.",
      },
      {
        heading: "Step 4: Set paper size and quality",
        body: "Look along the top toolbar inside Print Pictures: choose your physical Printer, exact Paper size (ISO A4 vs US Letter), Quality (High for glossy stock), and Paper type matching the pack loaded in your tray.",
        sub: [
          {
            h4: "Print preview check",
            body: "Scroll through every generated sheet in the preview arrow buttons—especially when printing 6 or 12 pictures across two pages—so no family face splits mid-frame.",
          },
          {
            h4: "Scaling and margins",
            body: "Crucially, check the bottom-right 'Fit picture to frame' box. Checked = zooms images aggressively to fill boxes cleanly (cropping outer borders); unchecked = preserves full photo width inside gentle white letterbox bars.",
          },
        ],
      },
      {
        heading: "Step 5: Check the preview and print",
        body: "Once orientation, quality, and framing look balanced, click Print. Run sheet 1 on plain 80 gsm copy paper whenever testing a brand-new paper type so expensive glossy sheets never waste on upside-down margins.",
      },
    ],
    fixesIntro:
      "Windows Print Pictures hides settings behind legacy menus—these three quick repairs solve the glitches most laptop owners hit.",
    fixes: [
      {
        h3: "Photos print too small",
        body: "Check that you did not accidentally select Wallet (9) when wanting 4×6 (2), and open Printer Properties -> Page Setup to ensure 'Pages per Sheet' (N-up printing inside the printer driver itself) is still set to 1 Normal-size page rather than compounding 4-up inside 4-up.",
      },
      {
        h3: "Layout options are missing",
        body: "If right-clicking only launches the modern Photos app rather than Print Pictures, you either highlighted non-standard HEIC files straight from an iPhone or clicked Print inside the single-image Photos window. Convert HEIC images to standard JPG first, and trigger Print strictly from File Explorer ('Show more options -> Print').",
      },
      {
        h3: "The printer ignores the settings",
        body: "Some OEM printer utilities override Windows dialog margins automatically. Printing once to 'Microsoft Print to PDF', opening that PDF in Microsoft Edge, and choosing Actual Size (100% scale) forces hardware drivers to obey exact page proportions.",
      },
    ],
    fasterIntro:
      "Tired of hunting through Show More Options menus or fighting rigid Microsoft crop boxes? Use a dedicated browser sheet builder to lock exact grids in seconds.",
    fasterSub1Body:
      "Windows limits you strictly to 1, 2, 4, 9, or 35 cells—with zero control over custom spacing, square Instagram cards, cut guides, or mixed 2×3 layouts. Whenever you want exact metric borders, repeat copies, or zero portrait head slicing, a PDF layout generator finishes faster.",
    fasterToolHeading: "Arrange photos for printing",
    fasterToolTarget: "T01",
    fasterToolAnchor: "a4 page photo",
    fasterToolBody:
      "Drop your photos directly into our browser Arrange Photos tool, choose any A4 or Letter grid (2, 4, 6, 9, 12, or custom), toggle crop marks, and export a 100% exact PDF.",
    complianceCallout: {
      variant: "affiliation",
      title: "Independent Windows 11 Workflow Guide",
      body: "Print Sheet Maker is an independent web utility not affiliated with Microsoft or Windows. Built-in File Explorer steps above match standard Windows 11 23H2/24H2 desktop setups.",
    },
    faqs: [
      {
        q: "How to print multiple pictures on one page in Photos?",
        a: "The modern Windows 11 Photos viewer only prints one photo per sheet directly; for how to print multiple pictures on one page in photos style multi-grids, select your images in File Explorer -> Show more options -> Print to launch Print Pictures.",
      },
      {
        q: "How to print multiple pictures on one page from laptop?",
        a: "For anyone learning how to print multiple pictures on one page from laptop cleanly, either use File Explorer's right-click Print wizard or arrange pictures directly in Print Sheet Maker's free browser tool for custom grids and crisp PDF output.",
      },
      {
        q: "Can Windows 11 print more than 9 photos on one page?",
        a: "Windows 11 jumps straight from Wallet (9) to Contact sheet (35). For intermediate sizes like 12-up, 16-up, or 20-up ID grids, export a custom grid PDF with Print Sheet Maker instead.",
      },
    ],
    relatedH3s: [
      {
        heading: "How to print multiple pictures on one page",
        targetId: "G01",
        anchor: "how to print many pictures on one page",
        desc: "Read the complete cross-device reference covering 300 DPI sizing, aspect ratios, and paper costs.",
      },
      {
        heading: "How to print multiple pictures on one page from phone",
        targetId: "H02",
        anchor: "how to print multiple photos on one page from mobile",
        desc: "Print tidy multi-photo sheets straight from iPhone or Android without touching a PC.",
      },
    ],
  }),

  H02: buildHowToContent({
    id: "H02",
    hubId: "HB-PH",
    hubAnchor: "photo layout maker for printing",
    subtitle:
      "Combine 2, 4, 6, or 9 camera-roll photos onto a single A4 or US Letter page straight from your iPhone or Android browser—no PC needed.",
    intro: [
      "Figuring out how to print multiple pictures on one page from phone frustrates both iPhone and Android owners because native AirPrint and Android Default Print Services default to spilling one single image per expensive sheet. Instead of burning four sheets for four small snapshots, you can assemble a crisp multi-photo sheet PDF right inside Safari or Chrome in under a minute.",
      "This guide walks step by step through arranging camera-roll shots on mobile, saving an exact-scale PDF, and sending that sheet cleanly over Wi-Fi AirPrint, Mopria, or to a local print shop.",
    ],
    needsIntro:
      "Check two mobile basics before building your sheet so wireless transfers never stall mid-print.",
    needs: [
      {
        h3: "Your photos in the phone gallery",
        body: "Save target shots inside an album inside Apple Photos or Google Photos first. If picking images straight from WhatsApp or text messages, download full originals whenever available—messaging compression turns large prints grainy.",
      },
      {
        h3: "A Wi-Fi or Bluetooth printer, or a PDF to send",
        body: "Keep your phone and printer connected to the exact same 2.4 GHz or 5 GHz home Wi-Fi network. No printer at home? Saving your multi-picture page as a crisp mobile PDF lets you email or USB-transfer a single ready-to-cut sheet to any neighbourhood print counter.",
      },
    ],
    stepsH2: "Step-by-step: print using your phone",
    stepsIntro:
      "Use this fast mobile workflow whenever you need how to print multiple pictures on one page from phone cleanly without wrestling cluttered ad-filled app stores.",
    steps: [
      {
        heading: "Step 1: Open the photos you want to print",
        body: "Gather the 2, 4, 6, or 9 photos you want combined into one page inside a quick mobile album so your photo picker loads them immediately without scrolling through thousands of screenshots.",
      },
      {
        heading: "Step 2: Build a sheet in a layout tool or app",
        body: "Open a lightweight mobile browser layout studio (like Print Sheet Maker above) directly inside Safari or Chrome, choose A4 or US Letter paper, pick your grid count, and tap slots to pick photos straight from your gallery.",
        sub: [
          {
            h4: "iPhone and AirPrint",
            body: "Apple's built-in Photos Share -> Print menu supports only one image per sheet natively unless exporting a combined PDF or using third-party printer utilities.",
          },
          {
            h4: "Android and Mopria",
            body: "Android's Default Print Service mirrors iOS—great for single 4×6 postcards, yet lacking native 4-up or 9-up contact grids until combined into one multi-up PDF file first.",
          },
        ],
      },
      {
        heading: "Step 3: Save the sheet as a PDF or image",
        body: "Tap Download PDF inside your mobile layout studio. On iPhone this drops cleanly into Files (Downloads); on Android it saves straight into your Files / Downloads folder with sharp vector coordinates intact.",
      },
      {
        heading: "Step 4: Send it to the printer",
        body: "Open the saved multi-photo PDF, tap the Share icon (iOS) or three-dot Print menu (Android Chrome/Files), select your Wi-Fi printer, and confirm paper size matches your physical tray.",
        sub: [
          {
            h4: "Printer-brand apps",
            body: "Apps like Epson iPrint, Canon PRINT, and HP Smart offer quick wireless status checks and let you lock 'Photo Glossy' media modes when iOS AirPrint hides paper coatings.",
          },
          {
            h4: "Share to a print shop",
            body: "If sending to a pharmacy kiosk or stationery counter, share that locked PDF file cleanly via email or store upload so lab kiosks don't double-crop your borders.",
          },
        ],
      },
      {
        heading: "Step 5: Check alignment on the first sheet",
        body: "Inspect margin symmetry on plain paper first if doing passport cuts or precision photo strips; switch to coated glossy sheets once scale and orientation are confirmed.",
      },
    ],
    fixesIntro:
      "Wireless mobile print frameworks apply quirky silent defaults—fix all three glitches below before tapping Print a second time.",
    fixes: [
      {
        h3: "The photos shrink on the page",
        body: "Check Paper Size inside the iOS AirPrint or Android print banner! Many wireless queues default to 4×6 in postcard size from your previous print job—tapping Paper Size and switching back to A4 or US Letter restores full size instantly.",
      },
      {
        h3: "AirPrint shows only one photo",
        body: "Opening two photos in Apple Photos and tapping Print intentionally queues Page 1 and Page 2 separately. Combining pictures onto a single PDF page first guarantees all frames print together on sheet one.",
      },
      {
        h3: "The sheet cuts off at the edges",
        body: "Mobile phone screens capture tall 19.5:9 ratios that do not match 3:2 print boxes. Inside the layout builder, leave outer page margins at 8–10 mm and inspect faces in the live preview before downloading your PDF.",
      },
    ],
    fasterIntro:
      "Skip downloading bloated 200 MB printer utility apps loaded with subscription banners—do everything directly in Safari or Android Chrome.",
    fasterSub1Body:
      "Manufacturer apps often cap layouts to clunky 2×2 squares or compress high-resolution portraits aggressively over Wi-Fi. Generating your multi-photo PDF right in your mobile browser preserves razor-sharp image quality and runs completely offline once loaded.",
    fasterToolHeading: "Arrange photos for printing",
    fasterToolTarget: "T01",
    fasterToolAnchor: "a4 page photo",
    fasterToolBody:
      "Tap to open our mobile-ready Arrange Photos maker, pick 2-up, 4-up, or custom cells directly from your camera roll, and export a ready-to-AirPrint PDF.",
    faqs: [
      {
        q: "How to print multiple photos on one page from mobile?",
        a: "For how to print multiple photos on one page from mobile cleanly without desktop PCs, arrange your shots in Print Sheet Maker via Safari or Chrome, save the single combined PDF, and print that PDF via AirPrint or Android Print.",
      },
      {
        q: "Which app prints several photos on one page?",
        a: "Epson iPrint, HP Smart, Canon PRINT, and Collage makers exist, though most users find a zero-install browser PDF generator faster because it works universally across every printer brand with zero logins.",
      },
      {
        q: "Can I print multiple pictures from my phone without a computer?",
        a: "Yes—100% from your phone. Build the layout PDF in your mobile browser and either print directly over Wi-Fi or take the saved PDF to any store kiosk.",
      },
    ],
    relatedH3s: [
      {
        heading: "How to print multiple pictures on one page",
        targetId: "G01",
        anchor: "how to print many pictures on one page",
        desc: "Compare device methods, pixel charts, and layout formulas across phone, laptop, and photo labs.",
      },
      {
        heading: "Software to print multiple photos on one page",
        targetId: "B01",
        anchor: "app to arrange photos for printing",
        desc: "Review free vs paid photo layout apps and software options for mobile and desktop.",
      },
    ],
  }),

  H03: buildHowToContent({
    id: "H03",
    hubId: "HB-PH",
    hubAnchor: "photo layout maker for printing",
    subtitle:
      "Arrange custom 300 DPI multi-photo sheets in Adobe Photoshop layers or automate exact packages with Lightroom Classic's Print module.",
    intro: [
      "Mastering how to print multiple images on one page in photoshop—alongside Lightroom's dedicated Print module—gives photographers colour-profile precision when printing archival portfolios, model cards, or multi-up 4×6 proofs. While beginners struggle placing images manually across layers, setting one true-scale 300 DPI document keeps faces crisp and prevents colour shifts.",
      "Below is the clean five-step Photoshop canvas workflow plus Lightroom's faster Picture Package option, fixes for dark ink prints, and when a two-click browser sheet beats launching Creative Cloud altogether.",
    ],
    needsIntro:
      "Confirm colour profile consistency and true export resolution before setting up your blank sheet canvas.",
    needs: [
      {
        h3: "Photoshop or Lightroom installed",
        body: "Use any modern Creative Cloud version of Adobe Photoshop (for exact layer grids or File -> Automate -> Contact Sheet II) or Adobe Lightroom Classic's built-in Print tab.",
      },
      {
        h3: "Photos edited and exported at the final size",
        body: "Keep edited master files in sRGB IEC61966-2.1 (or Adobe RGB if using ICC-profiled fine-art papers) rather than 72 DPI screen web saves so resampling never blurs eyelashes or skies.",
      },
    ],
    stepsH2: "Step-by-step: print using Photoshop and Lightroom",
    stepsIntro:
      "Follow this streamlined path for how to print multiple images on one page in photoshop without uneven layer gaps or cropped outer guides.",
    steps: [
      {
        heading: "Step 1: Create a new document at paper size",
        body: "Press Ctrl+N / Cmd+N in Photoshop -> choose the Print tab -> select A4 (210 × 297 mm) or US Letter (8.5 × 11 in). Verify Resolution locks strictly at 300 Pixels/Inch and Color Mode stays RGB 8-bit.",
      },
      {
        heading: "Step 2: Place each photo as a layer",
        body: "Drag photos straight onto the blank canvas (or use File -> Place Embedded) so every picture stays a sharp Smart Object you can resize nondestructively.",
        sub: [
          {
            h4: "Photoshop Picture Package",
            body: "For fast automatic thumbnails, go to File -> Automate -> Contact Sheet II, pick a folder, type column/row counts and spacing, and let Photoshop build a tidy multi-grid layer stack automatically.",
          },
          {
            h4: "Lightroom Print module",
            body: "For lightroom print multiple photos on one page workflows, open the Print tab -> Layout Style -> Single Image/Contact Sheet (for mixed folders) or Picture Package (to repeat one portrait in multiple sizes on one page).",
          },
        ],
      },
      {
        heading: "Step 3: Arrange and align the photos",
        body: "In Photoshop, turn on View -> Guides / Snap, duplicate cleanly sized Smart Object frames with Alt+Drag, and click Align Left / Distribute Vertical Centers along the Move tool bar for spotless grid symmetry.",
      },
      {
        heading: "Step 4: Use File, Print and set scale to 100%",
        body: "Press Ctrl+P / Cmd+P to open the Photoshop Print dialog. Scroll Position and Size down and confirm Scale reads exactly 100.00%—never check 'Scale to Fit Media' when custom margin borders matter.",
        sub: [
          {
            h4: "Resolution settings",
            body: "Keep canvas documents at true 300 PPI (so photoshop print multiple images on one page output feeds clean native data to Epson/Canon 300/360 DPI drivers cleanly).",
          },
          {
            h4: "Print to PDF",
            body: "Need a lab proof instead? Go to File -> Save a Copy -> Photoshop PDF (High Quality Print preset, preserve Photoshop editing turned off for small crisp file sizes).",
          },
        ],
      },
      {
        heading: "Step 5: Export as PDF for a proof",
        body: "Inspect borders and typography once at 100% zoom inside Adobe Reader or Preview before feeding fine-art rag or resin-coated glossy paper.",
      },
    ],
    fixesIntro:
      "Even seasoned designers hit colour-management mismatches in Photoshop—check these three classic culprits immediately.",
    fixes: [
      {
        h3: "Photos look soft after printing",
        body: "Verify Image -> Image Size wasn't accidentally built at 72 Pixels/Inch. A 72 PPI A4 document measures only 595 × 842 px—rebuilding at 300 PPI restores razor detail instantly.",
      },
      {
        h3: "Colours change at the printer",
        body: "Double colour-management ruins prints! If Photoshop Color Handling says 'Photoshop Manages Colors', you MUST disable colour adjustment inside the printer driver's Color Options dialog; or switch to 'Printer Manages Colors' and feed clean sRGB.",
      },
      {
        h3: "The layout does not centre on the page",
        body: "Desktop printers sometimes have asymmetric feed/trail margins (e.g. 3 mm top vs 14 mm bottom). Leave generous 10–15 mm white outer canvas framing inside your Photoshop layout so mechanical feed offsets vanish visually.",
      },
    ],
    fasterIntro:
      "Launching Creative Cloud just to lay out two 4×6 travel snaps or four passport IDs takes longer than printing the whole sheet online.",
    fasterSub1Body:
      "When you don't need custom ICC fine-art profiling—and just want clean, symmetrical 2-up, 4-up, or 9-up placement with sharp crop ticks—a browser layout maker prints identical vector PDFs in fifteen seconds.",
    fasterToolHeading: "Arrange photos for printing",
    fasterToolTarget: "T01",
    fasterToolAnchor: "a4 page photo",
    fasterToolBody:
      "Skip setting Photoshop Smart Object guides manually—arrange multiple photos cleanly onto one exact A4 or Letter PDF right in your browser.",
    complianceCallout: {
      variant: "affiliation",
      title: "Independent Photoshop & Lightroom Guide",
      body: "Print Sheet Maker is an independent web tool not affiliated with Adobe Inc. Menu paths reflect modern Photoshop and Lightroom Classic desktop releases.",
    },
    faqs: [
      {
        q: "How to print multiple photos on one page in Photoshop?",
        a: "For both print multiple images on one page photoshop and print multiple photos on one page photoshop tasks, build an A4 or Letter document at 300 PPI, place photos via File -> Place Embedded (or Automate -> Contact Sheet II), and print at 100% Scale.",
      },
      {
        q: "Can Lightroom print multiple photos on one page?",
        a: "Yes. Open the Print module in Lightroom Classic, choose Single Image / Contact Sheet or Custom Package on the right panel, drag photos into your grid cells, and hit Print.",
      },
      {
        q: "What resolution should I use in Photoshop?",
        a: "Always build photographic print sheets at 300 Pixels/Inch (300 DPI) matching physical inches or millimetres.",
      },
    ],
    relatedH3s: [
      {
        heading: "How to print multiple pictures on one page",
        targetId: "G01",
        anchor: "how to print many pictures on one page",
        desc: "Compare Photoshop/Lightroom against OS dialogs and fast browser sheet tools.",
      },
      {
        heading: "Print multiple photos on one page Windows 11",
        targetId: "H01",
        anchor: "how to print multiple pictures on one page from laptop",
        desc: "Print multi-photo grids natively on Windows 11 without Creative Cloud installed.",
      },
    ],
  }),

  H04: buildHowToContent({
    id: "H04",
    hubId: "HB-PH",
    hubAnchor: "photo layout maker for printing",
    subtitle:
      "Navigate Epson iPrint's Collage & Multi-Print menus on iOS and Android—plus fixes when layout grids look greyed out.",
    intro: [
      "Figuring out how to print multiple pictures on one page epson iprint puzzles many EcoTank and Expression owners because the standard 'Photos' tile inside the app only dumps single full-page images. Tucked inside Epson iPrint's Collage / Layout controls, however, you can print 2-up and 4-up grids directly over Wi-Fi onto A4 or 4×6 glossy paper.",
      "Follow these clear mobile steps for epson iprint multiple photos on one page printing, see why certain layout buttons grey out unexpectedly, and switch quickly to a combined PDF whenever iPrint hides custom grids.",
    ],
    needsIntro:
      "Ensure Wi-Fi discovery and matching firmware drivers are ready before opening Epson iPrint.",
    needs: [
      {
        h3: "An Epson printer connected to Wi-Fi",
        body: "Power on your Epson printer and verify it sits on the same Wi-Fi SSID as your phone (or connect briefly via Wi-Fi Direct if away from a router).",
      },
      {
        h3: "The Epson iPrint app installed",
        body: "Install the free Epson iPrint app (or newer Epson Smart Panel utility) from the App Store or Google Play and let it finish locating your printer IP address on the top header bar.",
      },
    ],
    stepsH2: "Step-by-step: print using the Epson iPrint app",
    stepsIntro:
      "Work cleanly through the mobile menus below to achieve epson print multiple photos on one page results directly from your tablet or smartphone.",
    steps: [
      {
        heading: "Step 1: Open Epson iPrint and tap Photo",
        body: "Launch Epson iPrint, confirm your exact EcoTank / WorkForce / XP printer name appears at the top, and tap Print Photos (or Collage / Multi-Print depending on your OS app version).",
      },
      {
        heading: "Step 2: Select the photos to print",
        body: "Tap the 2, 4, or multiple camera-roll pictures you want grouped together. Be careful with Copies counters—make sure you don't accidentally queue 4 separate full pages instead of 1 multi-layout sheet.",
        sub: [
          {
            h4: "Layout options in iPrint",
            body: "Tap the Layout / Collage icon or Print Settings gear at top right and change from 1-up Borderless to 2-up, 4-up, or Split Collage frames.",
          },
          {
            h4: "Paper size and type",
            body: "Explicitly set Paper Size to A4 (or Letter / 4×6) and Media Type to Photo Paper Glossy or Matte—leaving 'Plain Paper' selected causes washed-out inkjet blacks.",
          },
        ],
      },
      {
        heading: "Step 3: Choose the layout option",
        body: "Review how iPrint places your images inside its preset slots. Drag slightly within any collage cell if faces sit too close to an edge.",
      },
      {
        heading: "Step 4: Pick the paper size and quality",
        body: "Open Quality and bump from Standard to High whenever printing keepsakes or passport faces on coated stock.",
        sub: [
          {
            h4: "Borderless printing",
            body: "Keep Borderless OFF for multi-picture cut sheets so Epson's driver doesn't enlarge outer edges off the page.",
          },
          {
            h4: "Print from the printer driver",
            body: "Printing from desktop instead? Open Windows/macOS Print Properties -> Page Layout tab -> Multi-Page (2-up / 4-up) to replicate multiple layouts natively inside the PC Epson driver.",
          },
        ],
      },
      {
        heading: "Step 5: Send the job to the printer",
        body: "Tap Print, let the coated photo sheet settle face-up into the output tray, and allow glossy ink 10 minutes to dry cleanly before trimming.",
      },
    ],
    fixesIntro:
      "Epson's mobile app greyed-out buttons confuse thousands of users—these quick checks restore multi-up choices immediately.",
    fixes: [
      {
        h3: "The app prints only one photo",
        body: "You left the Print Setting mode on default 'Standard 1-per-page' inside Print Photos, where choosing 4 pictures queues 4 separate sheets! Switch specifically into Collage/Layout mode (or export a multi-photo PDF via Print Sheet Maker and print via iPrint -> Print Documents).",
      },
      {
        h3: "Layout option is greyed out",
        body: "Selecting incompatible paper sizes (like Envelope or CD/DVD) or turning Borderless ON locks out certain N-up layout presets. Reset Borderless to OFF and Paper Size to A4/Letter first to unlock 2-up and 4-up options.",
      },
      {
        h3: "Print quality is low",
        body: "Check that Media Type matches glossy/matte photo paper—iPrint throttles nozzle ink density sharply whenever Paper Type stays on Plain Paper.",
      },
    ],
    fasterIntro:
      "Tired of rigid mobile collage slots or cropped 4:3 portraits inside Epson iPrint? Build your exact sheet as a clean PDF first and send it straight to iPrint -> Print Documents.",
    fasterSub1Body:
      "When printing custom passport sizes, 6-up grids, or mixed orientations on an Epson inkjet, generating one exact vector PDF in your browser skips iPrint's clunky layout limits completely.",
    fasterToolHeading: "Arrange photos for printing",
    fasterToolTarget: "T01",
    fasterToolAnchor: "a4 page photo",
    fasterToolBody:
      "Create your custom 2, 4, 6, or 9-photo sheet PDF right here, then open it inside Epson iPrint's Document viewer for sharp 100%-scale wireless prints.",
    complianceCallout: {
      variant: "affiliation",
      title: "Independent Epson iPrint Guide",
      body: "Print Sheet Maker is independent and not affiliated with Seiko Epson Corporation. Screen names reflect standard Epson iPrint mobile utility workflows.",
    },
    faqs: [
      {
        q: "How do I print multiple pictures on one page Epson?",
        a: "To solve how to print multiple pictures on one page epson cleanly, switch inside Epson iPrint to Collage/Multi-page layout (with Borderless turned OFF), OR export a combined PDF sheet in Print Sheet Maker and print via iPrint -> Documents.",
      },
      {
        q: "Does Epson iPrint support collage layouts?",
        a: "Yes—Epson iPrint offers basic 2-up and 4-up frames on phone screens, though custom row/column grids, cut guides, and exact millimetre sizes require combining into a PDF first.",
      },
      {
        q: "Can I print multiple photos from the Epson driver on a PC?",
        a: "Yes. Inside the Windows or macOS Epson printer driver, open the More Options / Layout tab and pick Multi-Page -> 2-up or 4-up (or use Windows Print Pictures right-click menu).",
      },
    ],
    relatedH3s: [
      {
        heading: "How to print multiple pictures on one page from phone",
        targetId: "H02",
        anchor: "how to print multiple photos on one page from mobile",
        desc: "Compare AirPrint, Android Mopria, and mobile PDF workflows across all printer brands.",
      },
      {
        heading: "How to print multiple pictures on one page",
        targetId: "G01",
        anchor: "how to print many pictures on one page",
        desc: "Read the complete cross-device photo sheet reference and DPI sizing guide.",
      },
    ],
  }),

  H05: buildHowToContent({
    id: "H05",
    hubId: "HB-BC",
    hubAnchor: "layout for business cards",
    subtitle:
      "Export your single-card Canva design cleanly at 300 DPI PDF, tile 10 crisp copies onto A4 or US Letter paper free, and cut razor-straight.",
    intro: [
      "Knowing how to print multiple business cards on one sheet canva unlocks total home-printing freedom without paying commercial Canva Print shipping minimums. When you design a standard 85 × 55 mm, 90 × 55 mm, or 3.5 × 2 inch card inside Canva, downloading it normally exports only one tiny card per PDF page—unless you impose ten cards neatly across one print sheet yourself.",
      "Follow this quick six-step workflow to export your crisp Canva artwork with bleed and crop safety, tile ten matching cards onto A4 or Letter cardstock free, and troubleshoot off-centre printer cuts.",
    ],
    needsIntro:
      "Prepare your finished Canva card project and load compatible heavyweight stock before arranging the 10-up sheet.",
    needs: [
      {
        h3: "A finished Canva business card design",
        body: "Open your finished front (and optional back) card inside Canva. Verify names, phone digits, and QR codes sit comfortably inside a 3 mm inner safe zone away from borders.",
      },
      {
        h3: "Heavy paper or card stock",
        body: "Stock 250–300 gsm smooth matte cardstock (uncut A4/Letter sheets for guillotine trimming, or pre-perforated 10-up Letter packs compatible with standard Avery sizes).",
      },
    ],
    stepsH2: "Step-by-step: print using Canva",
    stepsIntro:
      "Complete these exact export and imposition steps for print multiple business cards on one page canva runs cleanly on any desktop printer.",
    steps: [
      {
        heading: "Step 1: Download your design as a print PDF",
        body: "Inside Canva click Share -> Download -> File type: PDF Print (not Standard PDF or compressed PNG). If your card background has solid dark colours touching the edges, check 'Crop marks and bleed' (or download crisp high-res 300 DPI PNG if tiling directly inside a sheet maker).",
      },
      {
        heading: "Step 2: Open the PDF in a layout tool",
        body: "Canva doesn't natively pack 10 copies onto one downloadable A4/Letter home PDF effortlessly for free. Instead, drop your exported card artwork straight into a dedicated 10-up sheet imposition grid.",
        sub: [
          {
            h4: "Print PDF with crop marks and bleed",
            body: "Downloading crisp PDF Print / high-res PNG maintains razor-sharp hairline typography and crisp QR corners before duplicating across the sheet.",
          },
          {
            h4: "Print multiple cards on one page Canva method",
            body: "Alternative manual method inside Canva: create an A4 canvas, download your single card as PNG, re-upload it, and manually align 2 columns × 5 rows—though automated 10-up grid makers keep exact millimetre coordinates automatically.",
          },
        ],
      },
      {
        heading: "Step 3: Place the card in a sheet grid",
        body: "Select A4 (10-up 85×55 or 90×55 mm) or US Letter (10-up 3.5×2 in) matching your finished Canva card dimensions so zero accidental stretching occurs.",
      },
      {
        heading: "Step 4: Add crop marks and bleed",
        body: "Toggle subtle corner trim guides ON when cutting solid A4 cardstock with a sliding trimmer; switch guides OFF only when printing onto pre-scored perforated packs.",
        sub: [
          {
            h4: "Print Canva business cards at home",
            body: "Learning to print canva business cards at home reliably hinges on confirming exact scale=100% before hitting print on thick stock.",
          },
          {
            h4: "Test print on plain paper",
            body: "Print sheet one on plain 80 gsm copy paper and hold it over a window against perforated stock—or measure card width with a metric ruler—to confirm exact physical dimensions.",
          },
        ],
      },
      {
        heading: "Step 5: Print at 100% and cut",
        body: "Feed cardstock flat through your printer's manual rear tray with paper set to Heavy Cardstock, select Actual Size (100%), and trim columns then rows smoothly with a guillotine or steel ruler.",
      },
    ],
    fixesIntro:
      "Canva cards frequently print slightly shrunk or mismatched against perforated card edges—fix all three snags cleanly below.",
    fixes: [
      {
        h3: "Cards do not align with the cut lines",
        body: "Remember Canva's standard Business Card template defaults to 3.5 × 2 inches (88.9 × 50.8 mm). Trying to drop an 88.9 × 50.8 mm PNG into an 85 × 55 mm European sheet causes borders to skew—always match sheet grid size to your Canva canvas size!",
      },
      {
        h3: "Canva prints one card per page",
        body: "Opening Canva's 1-card PDF in Preview or Chrome and clicking Print defaults to putting one giant card alone on Page 1. Export the card image and tile it 10-up in Print Sheet Maker first so one sheet yields ten crisp cards.",
      },
      {
        h3: "Colours look different from the screen",
        body: "Bright neon RGB greens and blues soften slightly on matte ink-absorbing cardstock. Enable 'Photo Matte' paper settings and boost contrast slightly before export.",
      },
    ],
    fasterIntro:
      "Don't waste 20 minutes manually lining up ten tiny boxes inside a fresh blank Canva A4 file—tile your exported card automatically in two clicks.",
    fasterSub1Body:
      "Uploading your single exported Canva card image once fills an entire 8-up or 10-up A4/Letter sheet with locked crop ticks and optional two-sided alignment immediately.",
    fasterToolHeading: "Print multiple business cards on one page",
    fasterToolTarget: "T11",
    fasterToolAnchor: "business card page template",
    fasterToolBody:
      "Upload your exported Canva front/back card artwork into our Business Card Sheet Maker to generate a locked 10-up crop-marked PDF ready to print at home.",
    complianceCallout: {
      variant: "affiliation",
      title: "Independent Canva Companion Workflow",
      body: "Print Sheet Maker is an independent PDF layout utility and is not affiliated with or endorsed by Canva Pty Ltd.",
    },
    faqs: [
      {
        q: "How do I print Canva business cards at home?",
        a: "Export your single Canva card at high resolution, drop it into a 10-up Card Sheet Maker grid matching your card dimensions, download the sheet PDF, and print at 100% Actual Size onto 250–300 gsm cardstock.",
      },
      {
        q: "Can Canva print ten cards on one A4 page?",
        a: "Canva's home download defaults to 1 card per page unless you manually duplicate 10 instances onto an A4 canvas—or use Print Sheet Maker to tile ten automatically in one click.",
      },
      {
        q: "Do I need crop marks for Canva cards?",
        a: "Keep subtle crop marks turned ON whenever trimming solid cardstock sheets by hand or rotary cutter; turn them OFF only for pre-perforated Avery-compatible card packs.",
      },
    ],
    relatedH3s: [
      {
        heading: "Print business cards at home",
        targetId: "H07",
        anchor: "free business card templates print at home",
        desc: "Read the complete cardstock GSM, tray path, and ink drying guide for home card printing.",
      },
      {
        heading: "Print multiple business cards on one page",
        targetId: "T11",
        anchor: "business card page template",
        desc: "Launch our browser 10-up card sheet tiler immediately.",
      },
    ],
  }),

  H06: buildHowToContent({
    id: "H06",
    hubId: "HB-BC",
    hubAnchor: "layout for business cards",
    subtitle:
      "Automate 10-up step-and-repeat imposition inside Adobe InDesign using bleed and slug marks—or tile ready card PDFs in your browser.",
    intro: [
      "Knowing how to print multiple business cards on one sheet indesign gives print designers micro-accurate control over crop ticks, 3 mm bleeds, and dual-sided slug alignment on heavy cardstock. Whether placing client AI/PSD artwork onto a master A4 document or configuring step-and-repeat grids cleanly, accurate imposition saves trimming headaches.",
      "Follow this step-by-step InDesign and PDF method—including quick fixes when bleed edges print as thin white borders—or speed up quick runs with a browser multi-card sheet generator.",
    ],
    needsIntro:
      "Prepare your single-card vector artwork with 3 mm bleed included before building the multi-up sheet document.",
    needs: [
      {
        h3: "InDesign or a PDF editor",
        body: "Any recent desktop release of Adobe InDesign (or a standalone imposition PDF tool) works cleanly with vector placement and crop mark generation.",
      },
      {
        h3: "A business card file with bleed",
        body: "Start with your single 85 × 55 mm, 90 × 55 mm, or 3.5 × 2 in card exported cleanly with 3 mm full bleed on all edges (skipping crop marks inside the child file so parent imposition marks handle cutting cleanly).",
      },
    ],
    stepsH2: "Step-by-step: print using InDesign and PDF",
    stepsIntro:
      "Use this clean imposition pattern whenever tackling how to print multiple business cards on one sheet indesign for home proof sheets or local digital copy shops.",
    steps: [
      {
        heading: "Step 1: Set up an A4 or Letter document",
        body: "Press Ctrl+N / Cmd+N -> Print -> choose A4 (210 × 297 mm) or US Letter (8.5 × 11 in) with 2 pages if building front and back cards. Set Margins around 10 mm on all four sides.",
      },
      {
        heading: "Step 2: Place the card file with bleed",
        body: "Press Ctrl+D / Cmd+D (Check 'Show Import Options') and select your single-card artwork. Under Crop To, pick Bleed Bounding Box only if leaving gutters between cards, or Trim Bounding Box if stacking butt-to-butt.",
        sub: [
          {
            h4: "Step and repeat",
            body: "With one placed card frame selected, choose Edit -> Step and Repeat (Ctrl+Alt+U). Set Rows: 5, Columns: 2, and Vertical/Horizontal offsets equal to card size plus crisp 4–6 mm gutter spacing.",
          },
          {
            h4: "Crop marks and slug",
            body: "Add tiny 0.25 pt hairline trim ticks inside the outer white margin gaps (on a dedicated Non-Printing guide layer or visible black lines) so rotary cutters align outside colour fills cleanly.",
          },
        ],
      },
      {
        heading: "Step 3: Duplicate cards in a grid",
        body: "Ensure all 10 placed frames align symmetrically around the geometric centre of the sheet so flipping cardstock for Page 2 keeps front and back perfectly registered.",
      },
      {
        heading: "Step 4: Add crop marks",
        body: "Place outer corner trim marks strictly in the clean sheet margin between cards—never draw crossing lines right through card ink faces.",
        sub: [
          {
            h4: "Print booklet or imposition",
            body: "Alternatively, check your print shop's Acrobat Booklet/Multiple Pages Per Sheet Print menu when simply imposing an existing 2-up card PDF quickly without opening InDesign.",
          },
          {
            h4: "PDF-only alternative",
            body: "Already have a crisp card PNG/JPG or want instant 10-up layout math without drawing manual InDesign crop lines? Upload straight into a browser PDF tiler.",
          },
        ],
      },
      {
        heading: "Step 5: Export and print as PDF",
        body: "Go to File -> Export -> Adobe PDF (Print) -> High Quality Print, open the exported 10-up sheet, and verify Actual Size (100% scale) in the print dialog before feeding cardstock.",
      },
    ],
    fixesIntro:
      "Imposition mistakes waste expensive 300 gsm card sheets rapidly—check these three classic InDesign pitfalls first.",
    fixes: [
      {
        h3: "Cards drift out of alignment",
        body: "Verify you copied an exact Vertical/Horizontal Offset equal to Frame Width + Gutter inside Step and Repeat. If gutter is 4 mm and card width is 85 mm, horizontal offset must read exactly 89 mm (not 85 mm).",
      },
      {
        h3: "Bleed prints as white lines",
        body: "If placing bleed frames tight together without gutters, one tiny 0.5 mm blade wobble cuts into the neighbour card! Either maintain a 4–6 mm blank gutter gap with individual bleed frames around every card, or share symmetrical background colours cleanly.",
      },
      {
        h3: "Printing shrinks the sheet",
        body: "InDesign and Acrobat default to 'Scale to Fit' on many drivers. Always set Page Scaling = None / Actual Size (100%) on every print run.",
      },
    ],
    fasterIntro:
      "Need 10-up cardstock sheets right now without setting up custom InDesign slug layers, frame offsets, and step-and-repeat grids?",
    fasterSub1Body:
      "For quick client proofs, emergency networking backups, or clean monochrome layouts, dropping your single card graphic into an automatic 10-up sheet generator eliminates manual math altogether.",
    fasterToolHeading: "Print multiple business cards on one page",
    fasterToolTarget: "T11",
    fasterToolAnchor: "business card page template",
    fasterToolBody:
      "Generate a calibrated 8-up or 10-up print-ready PDF directly in your browser with automatic crop marks and optional front/back alignment.",
    complianceCallout: {
      variant: "affiliation",
      title: "Independent InDesign Tutorial",
      body: "Print Sheet Maker is independent and not affiliated with Adobe Inc. All InDesign menu names describe standard desktop Print Publishing conventions.",
    },
    faqs: [
      {
        q: "How to print multiple business cards on one sheet pdf?",
        a: "For anyone tackling how to print multiple business cards on one sheet pdf quickly without InDesign, upload your finished single card graphic into Print Sheet Maker's 10-up Card Sheet Maker and download an exact-scale multi-up PDF with crop ticks included.",
      },
      {
        q: "Can I do imposition without InDesign?",
        a: "Yes—our browser-based Card Sheet Maker handles exact 8-up and 10-up grid spacing, gutters, and crop guides natively without Creative Cloud subscriptions.",
      },
      {
        q: "How many cards fit on one sheet?",
        a: "Ten standard cards fit comfortably in a 2×5 grid on both ISO A4 (85×55 mm or 90×55 mm) and US Letter (3.5×2 in) cardstock sheets.",
      },
    ],
    relatedH3s: [
      {
        heading: "How to print multiple business cards on one sheet Canva",
        targetId: "H05",
        anchor: "print canva business cards at home",
        desc: "Export and tile Canva cards cleanly onto 10-up A4/Letter cardstock sheets.",
      },
      {
        heading: "Print multiple business cards on one page",
        targetId: "T11",
        anchor: "business card page template",
        desc: "Tile any card graphic automatically 8-up or 10-up in your browser.",
      },
    ],
  }),

  H07: buildHowToContent({
    id: "H07",
    hubId: "HB-BC",
    hubAnchor: "layout for business cards",
    subtitle:
      "Everything needed to print crisp cards at home: cardstock GSM limits, manual rear-feed setup, perforated vs guillotine cuts, and ink tips.",
    intro: [
      "Learning to print business cards at home gives freelancers, pop-up makers, and small clubs instant fresh batches of 20 or 50 cards overnight without waiting for courier print shops. The secret separating crisp studio-grade home cards from flimsy curled paper is pairing the right 250–300 gsm uncoated matte cardstock with 100%-scale crop-marked PDFs and straight rear-tray feeding.",
      "Follow this complete five-step home print checklist covering printer paper limits, smooth trimming, and quick fixes for smeared toner or crooked edges.",
    ],
    needsIntro:
      "Confirm your desktop printer's physical paper-path geometry and card thickness limit before buying bulk reams.",
    needs: [
      {
        h3: "A printer that accepts card stock",
        body: "Inkjets and lasers with a flat rear manual feed (or bypass flap) push stiff 250–300 gsm card cleanly without harsh U-turn rollers. Printers relying solely on bottom under-tray U-turns handle max ~200–220 gsm reliably without jamming.",
      },
      {
        h3: "Business card paper or perforated sheets",
        body: "Choose uncut heavyweight matte cardstock (slicing crisp flush edges on a rotary/guillotine trimmer) OR pre-scored micro-perforated 10-up sheets compatible with clean tear-apart edges.",
      },
    ],
    stepsH2: "Step-by-step: print using a home printer",
    stepsIntro:
      "Print durable, stiff, pocket-ready home cards cleanly using these five physical calibration steps.",
    steps: [
      {
        heading: "Step 1: Prepare a print-ready card sheet",
        body: "Build a crisp vector PDF holding 8 or 10 cards arranged evenly across A4 or US Letter—keeping every text line 3 mm clear inside trim lines.",
      },
      {
        heading: "Step 2: Choose the right paper",
        body: "Heavy paper stiffness turns an amateur flyer feel into genuine tactile authority the instant a client takes your card.",
        sub: [
          {
            h4: "Best paper for printing business cards at home",
            body: "Aim for smooth uncoated matte 250–300 gsm cardstock (approx. 92–110 lb cover)—and verify ink-compatible packaging (inkjet matte vs laser smooth) so surface text stays sharp.",
          },
          {
            h4: "Perforated versus plain card stock",
            body: "Perforated 10-up packs save trimming tools yet fail if design borders shift even 1 mm off score lines; solid cardstock + a \$25 sliding rotary cutter handles dark bleeds seamlessly.",
          },
        ],
      },
      {
        heading: "Step 3: Set printer to high quality and plain card or heavy paper",
        body: "Inside Print Properties, switch Media Type to Heavyweight / Matte Presentation / Cardstock (and High Quality ink). For lasers, selecting 'Heavy Paper' slows fuser rollers slightly so dry toner bonds firmly instead of flaking off.",
      },
      {
        heading: "Step 4: Print one test sheet",
        body: "Always verify one test page on plain 80 gsm paper first, then run a single cardstock sheet to check drying speed and colour saturation.",
        sub: [
          {
            h4: "Print out business cards at home on one A4 sheet",
            body: "When you print out business cards at home across A4 or Letter, printing one calibrated test sheet saves nine costly card sheets if tray alignment drifts.",
          },
          {
            h4: "Cutting tools",
            body: "Skip household kitchen scissors—invest in a metal safety ruler + sharp #11 hobby blade on a self-healing mat, or a guillotine lever cutter for razor-straight columns.",
          },
        ],
      },
      {
        heading: "Step 5: Cut cards with a guillotine or trimmer",
        body: "Let freshly printed inkjet cardstock air-dry flat for 15 minutes before stacking or pressing under trimmer clamp bars, then make full continuous vertical cuts before cross-slicing rows.",
      },
    ],
    fixesIntro:
      "Home card runs fail most often due to wet roller marks or rushed cutting—fix all three glitches easily.",
    fixes: [
      {
        h3: "Ink smudges on card stock",
        body: "Using glossy cardstock in a normal pigment inkjet—or immediately feeding a glossy laser card through an inkjet—leaves wet ink pools! Stick strictly to uncoated/matte cardstock rated for your specific printer type and let ink dry flat.",
      },
      {
        h3: "Cards print off-centre",
        body: "Ensure PDF scaling sits on Actual Size (100%), push paper side guides snugly against cardstock edges inside the rear tray, and avoid overloaded paper stacks.",
      },
      {
        h3: "Cut edges look rough",
        body: "Dull rotary blades crush cardstock pulp fibres. Replace dull blades, press clamp rails firmly while cutting, and trim 1–2 sheets at a time instead of stacking 5 thick card sheets together.",
      },
    ],
    fasterIntro:
      "Skip wrestling table margins inside word processors—use free business card templates print at home ready as pure 100%-scale vector PDFs.",
    fasterSub1Body:
      "Generate crisp minimalist typography, add a sharp scannable QR code, preview both A4 90×55/85×55 and Letter 3.5×2 layouts, and export immediately with built-in crop guides.",
    fasterToolHeading: "Printable business cards",
    fasterToolTarget: "T12",
    fasterToolAnchor: "business card printable",
    fasterToolBody:
      "Open our Printable Business Cards builder to design, customise, and download 10-up print-ready PDF cardstock sheets free.",
    faqs: [
      {
        q: "What is the best way to print business cards at home?",
        a: "The best way to print business cards at home is creating a 100%-scale vector PDF using Printable Business Cards, feeding 250–300 gsm matte cardstock one sheet at a time via the rear manual tray, and trimming cleanly along crop marks with a paper trimmer.",
      },
      {
        q: "What paper should I use to print business cards at home?",
        a: "Use heavy 250–300 gsm (90–110 lb cover) matte smooth cardstock matched to your inkjet or laser printer. Avoid flimsy 160 gsm index cards that bend inside wallets.",
      },
      {
        q: "Can I print my own business cards at home for free?",
        a: "Yes—when you print your own business cards at home using Print Sheet Maker, generating and downloading crisp print-ready multi-up PDFs costs zero dollars with no account or watermarks (you pay only for blank cardstock and ink).",
      },
    ],
    relatedH3s: [
      {
        heading: "Print double sided business cards at home",
        targetId: "H08",
        anchor: "back of business card template",
        desc: "Align fronts and backs accurately on manual flip or duplex home printers.",
      },
      {
        heading: "Printable business cards",
        targetId: "T12",
        anchor: "business card printable",
        desc: "Create crisp blank or text-filled 10-up card sheets ready to print.",
      },
    ],
  }),
};

