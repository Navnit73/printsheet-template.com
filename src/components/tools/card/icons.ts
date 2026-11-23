export type IconCategory = "contact" | "social" | "business" | "accent";

export interface CardIconDef {
  id: string;
  label: string;
  category: IconCategory;
  /** SVG path `d` strings on a 0 0 24 24 stroke viewBox (strokeLinecap="round", strokeLinejoin="round"). */
  paths: string[];
  /** Optional circles `[cx, cy, r]`. */
  circles?: Array<[number, number, number]>;
}

/**
 * Pure vector icon primitives on a 24×24 coordinate space so every icon renders
 * identically across the live HTML preview, Canvas 2D PNG/PDF export, and SVG export.
 */
export const CARD_ICONS: CardIconDef[] = [
  // Contact
  {
    id: "phone",
    label: "Phone",
    category: "contact",
    paths: [
      "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
    ],
  },
  {
    id: "smartphone",
    label: "Mobile",
    category: "contact",
    paths: ["M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z", "M12 18h.01"],
  },
  {
    id: "mail",
    label: "Email",
    category: "contact",
    paths: ["M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z", "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"],
  },
  {
    id: "globe",
    label: "Website",
    category: "contact",
    circles: [[12, 12, 10]],
    paths: ["M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20", "M2 12h20"],
  },
  {
    id: "map-pin",
    label: "Location",
    category: "contact",
    circles: [[12, 10, 3]],
    paths: ["M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"],
  },
  {
    id: "message",
    label: "Chat / WhatsApp",
    category: "contact",
    paths: ["M7.9 20A9 9 0 1 0 4 16.1L2 22Z"],
  },

  // Social
  {
    id: "linkedin",
    label: "LinkedIn",
    category: "social",
    circles: [[4, 4, 2]],
    paths: ["M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z", "M2 9h4v12H2z"],
  },
  {
    id: "instagram",
    label: "Instagram",
    category: "social",
    paths: [
      "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z",
      "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z",
      "M17.5 6.5h.01",
    ],
  },
  {
    id: "x-social",
    label: "X / Twitter",
    category: "social",
    paths: ["M4 4l16 16", "M20 4L4 20"],
  },
  {
    id: "github",
    label: "GitHub",
    category: "social",
    paths: [
      "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4",
      "M9 18c-4.51 2-5-2-7-2",
    ],
  },
  {
    id: "youtube",
    label: "YouTube",
    category: "social",
    paths: [
      "M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17",
      "m10 15 5-3-5-3z",
    ],
  },
  {
    id: "at-sign",
    label: "Handle (@)",
    category: "social",
    circles: [[12, 12, 4]],
    paths: ["M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"],
  },

  // Business
  {
    id: "briefcase",
    label: "Briefcase",
    category: "business",
    paths: [
      "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",
      "M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z",
    ],
  },
  {
    id: "building",
    label: "Office",
    category: "business",
    paths: [
      "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z",
      "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2",
      "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2",
      "M10 6h4",
      "M10 10h4",
      "M10 14h4",
      "M10 18h4",
    ],
  },
  {
    id: "calendar",
    label: "Calendar",
    category: "business",
    paths: [
      "M8 2v4",
      "M16 2v4",
      "M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
      "M3 10h18",
    ],
  },
  {
    id: "clock",
    label: "Hours",
    category: "business",
    circles: [[12, 12, 10]],
    paths: ["M12 6v6l4 2"],
  },
  {
    id: "award",
    label: "Award",
    category: "business",
    circles: [[12, 8, 6]],
    paths: ["M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"],
  },
  {
    id: "check-circle",
    label: "Verified",
    category: "business",
    circles: [[12, 12, 10]],
    paths: ["m9 12 2 2 4-4"],
  },

  // Accents & craft
  {
    id: "star",
    label: "Star",
    category: "accent",
    paths: ["M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"],
  },
  {
    id: "sparkles",
    label: "Sparkles",
    category: "accent",
    paths: [
      "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
      "M20 3v4",
      "M22 5h-4",
    ],
  },
  {
    id: "heart",
    label: "Heart",
    category: "accent",
    paths: [
      "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
    ],
  },
  {
    id: "leaf",
    label: "Eco / Leaf",
    category: "accent",
    paths: [
      "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z",
      "M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12",
    ],
  },
  {
    id: "camera",
    label: "Camera",
    category: "accent",
    circles: [[12, 13, 3]],
    paths: [
      "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",
    ],
  },
  {
    id: "coffee",
    label: "Cafe / Coffee",
    category: "accent",
    paths: [
      "M10 2v2",
      "M14 2v2",
      "M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1",
      "M6 2v2",
    ],
  },
];

const ICON_MAP = new Map(CARD_ICONS.map((i) => [i.id, i]));

export function getCardIcon(id: string): CardIconDef {
  return ICON_MAP.get(id) ?? CARD_ICONS[0];
}
