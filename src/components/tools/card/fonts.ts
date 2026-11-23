import type { PdfFontFamily } from "@/lib/pdf-utils";

export type FontCategory = "sans" | "serif" | "display" | "mono";

export interface CardFont {
  id: string;
  name: string;
  category: FontCategory;
  cssFamily: string;
  pdfFallback: PdfFontFamily;
  /** Google Fonts family query spec (omit for system/built-in fonts). */
  googleSpec?: string;
  hint: string;
}

export const CARD_FONTS: CardFont[] = [
  // Built-in / system-safe PDF fonts first
  {
    id: "helvetica",
    name: "Helvetica / Clean Sans",
    category: "sans",
    cssFamily: 'Helvetica, "Helvetica Neue", Arial, sans-serif',
    pdfFallback: "helvetica",
    hint: "Crisp classic sans-serif",
  },
  {
    id: "inter",
    name: "Inter",
    category: "sans",
    cssFamily: '"Inter", Helvetica, Arial, sans-serif',
    pdfFallback: "helvetica",
    googleSpec: "Inter:ital,wght@0,400;0,600;0,700;1,400;1,700",
    hint: "Modern geometric UI sans",
  },
  {
    id: "dm-sans",
    name: "DM Sans",
    category: "sans",
    cssFamily: '"DM Sans", Helvetica, Arial, sans-serif',
    pdfFallback: "helvetica",
    googleSpec: "DM+Sans:ital,wght@0,400;0,600;0,700;1,400;1,700",
    hint: "Friendly clean studio sans",
  },
  {
    id: "montserrat",
    name: "Montserrat",
    category: "sans",
    cssFamily: '"Montserrat", Helvetica, Arial, sans-serif',
    pdfFallback: "helvetica",
    googleSpec: "Montserrat:ital,wght@0,400;0,600;0,700;1,400;1,700",
    hint: "Bold urban geometric",
  },
  {
    id: "plus-jakarta",
    name: "Plus Jakarta Sans",
    category: "sans",
    cssFamily: '"Plus Jakarta Sans", Helvetica, Arial, sans-serif',
    pdfFallback: "helvetica",
    googleSpec: "Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;1,400;1,700",
    hint: "Contemporary brand sans",
  },
  {
    id: "poppins",
    name: "Poppins",
    category: "sans",
    cssFamily: '"Poppins", Helvetica, Arial, sans-serif',
    pdfFallback: "helvetica",
    googleSpec: "Poppins:ital,wght@0,400;0,600;0,700;1,400;1,700",
    hint: "Rounded geometric",
  },
  {
    id: "lato",
    name: "Lato",
    category: "sans",
    cssFamily: '"Lato", Helvetica, Arial, sans-serif',
    pdfFallback: "helvetica",
    googleSpec: "Lato:ital,wght@0,400;0,700;1,400;1,700",
    hint: "Warm humanist sans",
  },
  {
    id: "times",
    name: "Times / Classic Serif",
    category: "serif",
    cssFamily: '"Times New Roman", Times, Georgia, serif',
    pdfFallback: "times",
    hint: "Traditional editorial serif",
  },
  {
    id: "playfair",
    name: "Playfair Display",
    category: "serif",
    cssFamily: '"Playfair Display", Georgia, serif',
    pdfFallback: "times",
    googleSpec: "Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,700",
    hint: "Luxury high-contrast serif",
  },
  {
    id: "merriweather",
    name: "Merriweather",
    category: "serif",
    cssFamily: '"Merriweather", Georgia, serif',
    pdfFallback: "times",
    googleSpec: "Merriweather:ital,wght@0,400;0,700;1,400;1,700",
    hint: "Sturdy readable serif",
  },
  {
    id: "lora",
    name: "Lora",
    category: "serif",
    cssFamily: '"Lora", Georgia, serif',
    pdfFallback: "times",
    googleSpec: "Lora:ital,wght@0,400;0,600;0,700;1,400;1,700",
    hint: "Calligraphic modern serif",
  },
  {
    id: "cormorant",
    name: "Cormorant Garamond",
    category: "serif",
    cssFamily: '"Cormorant Garamond", Georgia, serif',
    pdfFallback: "times",
    googleSpec: "Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700",
    hint: "Refined boutique serif",
  },
  {
    id: "space-grotesk",
    name: "Space Grotesk",
    category: "display",
    cssFamily: '"Space Grotesk", Helvetica, Arial, sans-serif',
    pdfFallback: "helvetica",
    googleSpec: "Space+Grotesk:wght@400;600;700",
    hint: "Tech & creative display",
  },
  {
    id: "oswald",
    name: "Oswald",
    category: "display",
    cssFamily: '"Oswald", Helvetica, Arial, sans-serif',
    pdfFallback: "helvetica",
    googleSpec: "Oswald:wght@400;600;700",
    hint: "Condensed impact headline",
  },
  {
    id: "raleway",
    name: "Raleway",
    category: "display",
    cssFamily: '"Raleway", Helvetica, Arial, sans-serif',
    pdfFallback: "helvetica",
    googleSpec: "Raleway:ital,wght@0,400;0,600;0,700;1,400;1,700",
    hint: "Elegant architectural display",
  },
  {
    id: "courier",
    name: "Courier / Typewriter",
    category: "mono",
    cssFamily: '"Courier New", Courier, monospace',
    pdfFallback: "courier",
    hint: "Classic typewriter mono",
  },
  {
    id: "jetbrains-mono",
    name: "JetBrains Mono",
    category: "mono",
    cssFamily: '"JetBrains Mono", "Courier New", monospace',
    pdfFallback: "courier",
    googleSpec: "JetBrains+Mono:ital,wght@0,400;0,700;1,400;1,700",
    hint: "Clean developer monospace",
  },
];

const FONT_MAP = new Map(CARD_FONTS.map((f) => [f.id, f]));

export function getCardFont(fontId?: string, fallbackFamily: PdfFontFamily = "helvetica"): CardFont {
  if (fontId && FONT_MAP.has(fontId)) return FONT_MAP.get(fontId)!;
  return FONT_MAP.get(fallbackFamily) ?? CARD_FONTS[0];
}

export function isBuiltinPdfFont(fontId?: string): boolean {
  return !fontId || fontId === "helvetica" || fontId === "times" || fontId === "courier";
}

const GOOGLE_LINK_ID = "printsheet-card-google-fonts";

export function getGoogleFontsUrl(): string {
  const specs = CARD_FONTS.filter((f) => f.googleSpec).map((f) => `family=${f.googleSpec}`);
  return `https://fonts.googleapis.com/css2?${specs.join("&")}&display=swap`;
}

/** Lazily injects the Google Fonts stylesheet once in the browser so font picker & canvas preview live. */
export function ensureGoogleFontsLoaded(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(GOOGLE_LINK_ID)) return;
  const link = document.createElement("link");
  link.id = GOOGLE_LINK_ID;
  link.rel = "stylesheet";
  link.href = getGoogleFontsUrl();
  document.head.appendChild(link);
}
