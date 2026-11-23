import { FONT_PAIRS } from "@/lib/pdf-utils";
import { hexToRgb, mix, textOn } from "../card/engine";
import {
  makeIcon,
  makeImage,
  makeLine,
  makeShape,
  makeText,
  rgbToHex,
  type LabelSlotKey,
  type Layer,
  type SideBackground,
  type SideDesign,
} from "../card/editor-model";
import type { FontPairId, LabelStyleId } from "../ui/LabelDesign";

export type LabelTemplateId =
  | LabelStyleId
  | "thank-you"
  | "handmade-seal"
  | "product-tag"
  | "shipping-pro"
  | "blank";

export interface LabelTemplateDef {
  id: LabelTemplateId;
  label: string;
  hint: string;
  badge?: string;
  rectOnly?: boolean;
}

export const LABEL_GALLERY_TEMPLATES: LabelTemplateDef[] = [
  { id: "bordered", label: "Thin border", hint: "Clean frame inside the edge" },
  { id: "classic", label: "Classic", hint: "Double border & refined serif" },
  { id: "band", label: "Bold band / Seal", hint: "High-impact colour fill" },
  { id: "kraft", label: "Kraft paper", hint: "Warm artisan paper & dash border" },
  { id: "minimal", label: "Minimal", hint: "Spaced capitals & hairline rule" },
  { id: "banner", label: "Top band", hint: "Coloured header strip", rectOnly: true },
  { id: "plain", label: "Simple clean", hint: "Crisp centred text on white" },
  { id: "thank-you", label: "Thank You", hint: "Friendly parcel & order sticker", badge: "Sticker" },
  { id: "handmade-seal", label: "Handmade Seal", hint: "Craft badge with eco leaf", badge: "Sticker" },
  { id: "product-tag", label: "Product Tag", hint: "Item name, note & price badge", badge: "Shop" },
  { id: "shipping-pro", label: "Shipping Box", hint: "Header band & parcel icon", badge: "Pro", rectOnly: true },
  { id: "blank", label: "Blank", hint: "Empty canvas to build from scratch" },
];

const round2 = (n: number) => Math.round(n * 100) / 100;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export interface LabelTemplateInput {
  templateId: LabelTemplateId;
  w: number;
  h: number;
  round: boolean;
  accentHex: string;
  fontPair: FontPairId;
  title: string;
  subtitle: string;
  eyebrow?: string;
  stickerImage?: string;
}

/** Builds a clean, fully editable SideDesign for any rectangular or round label/sticker. */
export function buildLabelTemplateSide(input: LabelTemplateInput): SideDesign {
  const { w, h, round, accentHex, fontPair, title, subtitle, eyebrow, stickerImage } = input;
  const tpl: LabelTemplateId = round && (input.templateId === "banner" || input.templateId === "shipping-pro") ? "bordered" : input.templateId;
  const s = Math.min(w, h);
  const accent = hexToRgb(accentHex);
  const onAccent = rgbToHex(textOn(accent));
  const pair = FONT_PAIRS[fontPair] ?? FONT_PAIRS.modern;
  const headFont = pair.heading;
  const bodyFont = pair.body;

  const titlePt = round2(clamp(s * (round ? 0.25 : 0.3), 7.5, 22));
  const subPt = round2(clamp(titlePt * 0.56, 5.5, 11));
  const eyePt = round2(clamp(titlePt * 0.45, 5, 8.5));
  const inset = round2(clamp(s * 0.055, 1.5, 3));
  const textPad = round2(round ? s * 0.14 : clamp(s * 0.1, 3, 6));
  const textW = round2(Math.max(8, w - textPad * 2));

  const mainText = title.trim() || "Handmade Label";
  const subText = subtitle.trim();
  const eyeText = (eyebrow ?? "").trim();

  if (tpl === "blank") {
    return { bg: "#ffffff", background: { type: "solid", color: "#ffffff" }, layers: [] };
  }

  // ---- Pro Sticker & Label Templates ----

  if (tpl === "thank-you") {
    const softBg = rgbToHex(mix(accent, [255, 255, 255], 0.91));
    const layers: Layer[] = [];
    if (round) {
      layers.push(makeShape("ellipse", accentHex, { name: "Outer ring", x: inset, y: inset, w: w - inset * 2, h: h - inset * 2, opacity: 0.12 }));
      layers.push(makeShape("frame", accentHex, { name: "Inner border", x: inset + 1, y: inset + 1, w: w - (inset + 1) * 2, h: h - (inset + 1) * 2, radius: w / 2, strokeW: 0.4 }));
    } else {
      layers.push(makeShape("frame", accentHex, { name: "Rounded border", x: inset, y: inset, w: w - inset * 2, h: h - inset * 2, radius: 3, strokeW: 0.45 }));
    }
    const iconSz = round2(clamp(s * 0.16, 4.5, 9));
    layers.push(makeIcon("heart", accentHex, "Heart icon", { x: round2(w / 2 - iconSz / 2), y: round2(h * 0.17), w: iconSz, h: iconSz }));
    layers.push(
      makeText({
        name: "Main text",
        labelSlotKey: "title",
        text: title.trim() || "Thank You!",
        x: textPad,
        y: round2(h * 0.4),
        w: textW,
        size: round2(clamp(titlePt * 1.05, 8, 22)),
        bold: true,
        align: "center",
        fontId: "playfair",
        family: "times",
        color: "#18181b",
        autoFit: true,
        maxLines: 2,
      })
    );
    layers.push(
      makeText({
        name: "Subtitle",
        labelSlotKey: "subtitle",
        text: subText || "For supporting my small shop",
        x: textPad,
        y: round2(h * 0.68),
        w: textW,
        size: subPt,
        align: "center",
        fontId: "dm-sans",
        family: "helvetica",
        color: accentHex,
        autoFit: true,
        maxLines: 2,
      })
    );
    const bg: SideBackground = { type: "solid", color: softBg };
    return { bg: softBg, background: bg, layers };
  }

  if (tpl === "handmade-seal") {
    const kraftBg = "#e6d3b3";
    const kraftInk = "#3d2b1a";
    const layers: Layer[] = [];
    if (round) {
      layers.push(
        makeShape("frame", kraftInk, {
          name: "Outer ring",
          x: inset,
          y: inset,
          w: w - inset * 2,
          h: h - inset * 2,
          radius: w / 2,
          strokeW: 0.45,
          opacity: 0.65,
        })
      );
    } else {
      layers.push(
        makeShape("frame", kraftInk, {
          name: "Artisan frame",
          x: inset,
          y: inset,
          w: w - inset * 2,
          h: h - inset * 2,
          radius: 2,
          strokeW: 0.45,
          opacity: 0.65,
        })
      );
    }
    const iconSz = round2(clamp(s * 0.16, 4.5, 8.5));
    layers.push(makeIcon("leaf", accentHex, "Leaf icon", { x: round2(w / 2 - iconSz / 2), y: round2(h * 0.15), w: iconSz, h: iconSz }));
    layers.push(
      makeText({
        name: "Main text",
        labelSlotKey: "title",
        text: mainText,
        x: textPad,
        y: round2(h * 0.39),
        w: textW,
        size: titlePt,
        bold: true,
        align: "center",
        fontId: "lora",
        family: "times",
        color: kraftInk,
        autoFit: true,
        maxLines: 2,
      })
    );
    layers.push(makeLine(kraftInk, { name: "Divider", x: round2(w * 0.3), y: round2(h * 0.63), w: round2(w * 0.4), h: 1.4, strokeW: 0.35, dash: "dashed", opacity: 0.65 }));
    layers.push(
      makeText({
        name: "Subtitle",
        labelSlotKey: "subtitle",
        text: subText || "SMALL BATCH · HANDCRAFTED",
        x: textPad,
        y: round2(h * 0.71),
        w: textW,
        size: round2(clamp(subPt * 0.85, 5, 9)),
        bold: true,
        uppercase: true,
        track: 0.1,
        align: "center",
        fontId: "montserrat",
        family: "helvetica",
        color: kraftInk,
        autoFit: true,
        maxLines: 1,
      })
    );
    const bg: SideBackground = { type: "pattern", bg: kraftBg, fg: kraftInk, pattern: "dots", opacity: 0.08, scale: 0.9 };
    return { bg: kraftBg, background: bg, layers };
  }

  if (tpl === "product-tag") {
    const layers: Layer[] = [
      makeShape("rounded-rect", accentHex, {
        name: "Header pill",
        x: round2(w * 0.24),
        y: round2(h * 0.12),
        w: round2(w * 0.52),
        h: round2(clamp(h * 0.16, 4.5, 8.5)),
        radius: 3,
      }),
      makeText({
        name: "Badge label",
        labelSlotKey: "eyebrow",
        text: eyeText || "SPECIAL EDITION",
        x: round2(w * 0.25),
        y: round2(h * 0.145),
        w: round2(w * 0.5),
        size: round2(clamp(eyePt * 0.9, 4.8, 7.5)),
        bold: true,
        uppercase: true,
        track: 0.08,
        align: "center",
        fontId: "montserrat",
        family: "helvetica",
        color: onAccent,
        autoFit: true,
        maxLines: 1,
      }),
      makeText({
        name: "Product title",
        labelSlotKey: "title",
        text: mainText,
        x: textPad,
        y: round2(h * 0.38),
        w: textW,
        size: titlePt,
        bold: true,
        align: "center",
        fontId: "plus-jakarta",
        family: "helvetica",
        color: "#111111",
        autoFit: true,
        maxLines: 2,
      }),
      makeText({
        name: "Product details",
        labelSlotKey: "subtitle",
        text: subText || "Net Wt. 250g · Handmade",
        x: textPad,
        y: round2(h * 0.72),
        w: textW,
        size: subPt,
        align: "center",
        fontId: "inter",
        family: "helvetica",
        color: "#52525b",
        autoFit: true,
        maxLines: 2,
      }),
    ];
    return { bg: "#ffffff", background: { type: "solid", color: "#ffffff" }, layers };
  }

  if (tpl === "shipping-pro") {
    const bandH = round2(clamp(h * 0.24, 6, 13));
    const iconSz = round2(clamp(bandH * 0.52, 3.5, 6.5));
    const layers: Layer[] = [
      makeShape("rect", accentHex, { name: "Top header band", x: 0, y: 0, w, h: bandH }),
      makeIcon("package", onAccent, "Parcel icon", { x: 4, y: round2((bandH - iconSz) / 2), w: iconSz, h: iconSz }),
      makeText({
        name: "Header label",
        labelSlotKey: "eyebrow",
        text: eyeText || "SHIP TO / HANDLE WITH CARE",
        x: round2(6 + iconSz),
        y: round2(bandH * 0.3),
        w: round2(w - 10 - iconSz),
        size: round2(clamp(eyePt, 5.5, 9)),
        bold: true,
        uppercase: true,
        track: 0.08,
        align: "left",
        fontId: "montserrat",
        family: "helvetica",
        color: onAccent,
        autoFit: true,
        maxLines: 1,
      }),
      makeText({
        name: "Main text",
        labelSlotKey: "title",
        text: mainText,
        x: 5,
        y: round2(bandH + h * 0.14),
        w: round2(w - 10),
        size: titlePt,
        bold: true,
        align: "left",
        fontId: "inter",
        family: "helvetica",
        color: "#111111",
        autoFit: true,
        maxLines: 2,
      }),
      makeText({
        name: "Subtitle",
        labelSlotKey: "subtitle",
        text: subText || "Order #1042 · Express",
        x: 5,
        y: round2(bandH + h * 0.45),
        w: round2(w - 10),
        size: subPt,
        align: "left",
        fontId: "inter",
        family: "helvetica",
        color: "#52525b",
        autoFit: true,
        maxLines: 2,
      }),
    ];
    return { bg: "#ffffff", background: { type: "solid", color: "#ffffff" }, layers };
  }

  // ---- Standard 7 Simple Mode Styles converted into Editable Layers ----

  const layers: Layer[] = [];
  let bgHex = "#ffffff";
  let titleColor = "#18181b";
  let subColor = "#52525b";
  let topOffset = round2(h * (subText ? 0.28 : 0.38));

  if (tpl === "kraft") {
    bgHex = "#dec7a0";
    titleColor = "#3d2b1a";
    subColor = "#5c422a";
    layers.push(
      makeShape("frame", "#5c422a", {
        name: "Kraft border",
        x: inset,
        y: inset,
        w: w - inset * 2,
        h: h - inset * 2,
        radius: round ? w / 2 : 2,
        strokeW: 0.4,
      })
    );
  } else if (tpl === "bordered") {
    layers.push(
      makeShape("frame", accentHex, {
        name: "Border frame",
        x: inset,
        y: inset,
        w: w - inset * 2,
        h: h - inset * 2,
        radius: round ? w / 2 : 0.6,
        strokeW: 0.5,
      })
    );
  } else if (tpl === "classic") {
    layers.push(
      makeShape("frame", accentHex, {
        name: "Outer frame",
        x: inset,
        y: inset,
        w: w - inset * 2,
        h: h - inset * 2,
        radius: round ? w / 2 : 2,
        strokeW: 0.55,
      }),
      makeShape("frame", accentHex, {
        name: "Inner frame",
        x: inset + 1.1,
        y: inset + 1.1,
        w: w - (inset + 1.1) * 2,
        h: h - (inset + 1.1) * 2,
        radius: round ? w / 2 : 1.2,
        strokeW: 0.25,
      })
    );
  } else if (tpl === "band") {
    if (round) {
      bgHex = accentHex;
      titleColor = onAccent;
      subColor = rgbToHex(mix(textOn(accent), accent, 0.2));
      layers.push(
        makeShape("frame", onAccent, {
          name: "Seal ring",
          x: inset,
          y: inset,
          w: w - inset * 2,
          h: h - inset * 2,
          radius: w / 2,
          strokeW: 0.35,
          opacity: 0.8,
        })
      );
    } else {
      const bandH = round2(subText ? h * 0.56 : h);
      layers.push(makeShape("rect", accentHex, { name: "Colour band", x: 0, y: 0, w, h: bandH }));
      titleColor = onAccent;
      topOffset = round2(bandH * (eyeText ? 0.44 : 0.32));
    }
  } else if (tpl === "banner") {
    const bh = round2(clamp(h * 0.24, 5, 13));
    layers.push(makeShape("rect", accentHex, { name: "Top band", x: 0, y: 0, w, h: bh }));
    if (eyeText) {
      layers.push(
        makeText({
          name: "Banner text",
          labelSlotKey: "eyebrow",
          text: eyeText,
          x: textPad,
          y: round2(bh * 0.28),
          w: textW,
          size: eyePt,
          bold: true,
          uppercase: true,
          track: 0.08,
          align: "center",
          fontId: bodyFont,
          family: bodyFont,
          color: onAccent,
          autoFit: true,
          maxLines: 1,
        })
      );
    }
    topOffset = round2(bh + (h - bh) * (subText ? 0.22 : 0.34));
  } else if (tpl === "plain" || tpl === "minimal") {
    titleColor = accentHex;
  }

  if (stickerImage) {
    const pad = round ? 0 : 2;
    layers.push(
      makeImage(stickerImage, 1, "Sticker artwork", {
        labelSlotKey: "stickerArt",
        isLogo: true,
        fit: round ? "cover" : "contain",
        x: pad,
        y: pad,
        w: round2(w - pad * 2),
        h: round2(h - pad * 2),
      })
    );
    return { bg: bgHex, background: { type: "solid", color: bgHex }, layers };
  }

  if (eyeText && tpl !== "banner") {
    layers.push(
      makeText({
        name: "Top line",
        labelSlotKey: "eyebrow",
        text: eyeText,
        x: textPad,
        y: round2(Math.max(inset + 2, topOffset - eyePt * 0.45 - 2)),
        w: textW,
        size: eyePt,
        bold: true,
        uppercase: true,
        track: 0.1,
        align: "center",
        fontId: bodyFont,
        family: bodyFont,
        color: tpl === "band" && !round ? onAccent : accentHex,
        autoFit: true,
        maxLines: 1,
      })
    );
  }

  if (title.trim()) {
    layers.push(
      makeText({
        name: "Main text",
        labelSlotKey: "title",
        text: title.trim(),
        x: textPad,
        y: topOffset,
        w: textW,
        size: titlePt,
        bold: true,
        align: "center",
        fontId: headFont,
        family: headFont,
        color: titleColor,
        autoFit: true,
        maxLines: 2,
      })
    );
  }

  if ((tpl === "minimal" || tpl === "classic") && subText) {
    const lineW = round2(Math.min(textW * 0.45, 18));
    layers.push(
      makeLine(accentHex, {
        name: "Divider line",
        x: round2(w / 2 - lineW / 2),
        y: round2(h * 0.56),
        w: lineW,
        h: 1.5,
        strokeW: 0.35,
      })
    );
  }

  if (subText) {
    const subY = tpl === "band" && !round ? round2(h * 0.66) : round2(Math.min(h - inset - 6, h * 0.64));
    layers.push(
      makeText({
        name: "Second line",
        labelSlotKey: "subtitle",
        text: subText,
        x: textPad,
        y: subY,
        w: textW,
        size: subPt,
        italic: tpl === "classic",
        uppercase: tpl === "minimal",
        track: tpl === "minimal" ? 0.12 : 0,
        align: "center",
        fontId: bodyFont,
        family: bodyFont,
        color: subColor,
        autoFit: true,
        maxLines: 2,
      })
    );
  }

  return { bg: bgHex, background: { type: "solid", color: bgHex }, layers };
}

/** Builds an editable label SideDesign from any of the 4 LabelSheetTool modes. */
export function buildInitialLabelFromMode(params: {
  mode: "address" | "barcode" | "nametag" | "title";
  w: number;
  h: number;
  round: boolean;
  labelStyle: LabelStyleId;
  fontPair: FontPairId;
  accentHex: string;
  labelTitle: string;
  labelSub: string;
  eventName: string;
  firstPerson?: { person: string; role: string };
  returnAddress: string;
  firstAddress?: string;
  firstBarcode?: { code: string; name: string; price: string; format: "CODE128" | "EAN13" | "UPC"; dataUrl?: string };
  firstSticker?: string;
}): SideDesign {
  const { mode, w, h, round } = params;

  if (mode === "address") {
    const pad = round2(clamp(Math.min(w, h) * 0.09, 2.5, 5));
    const layers: Layer[] = [];
    let top = pad;
    if (params.returnAddress.trim()) {
      layers.push(
        makeText({
          name: "Return address",
          labelSlotKey: "returnAddress",
          text: params.returnAddress.trim(),
          x: pad,
          y: top,
          w: round2(w - pad * 2),
          size: 6.5,
          align: "left",
          fontId: "inter",
          family: "helvetica",
          color: "#52525b",
          autoFit: true,
          maxLines: 1,
        })
      );
      top = round2(top + 4.5);
    }
    layers.push(
      makeText({
        name: "Recipient address",
        labelSlotKey: "address",
        text: params.firstAddress || "Jamie Chen\n42 Oakridge Ave\nPortland, OR 97209",
        x: pad,
        y: top,
        w: round2(w - pad * 2),
        size: 9.5,
        bold: false,
        align: "left",
        fontId: "inter",
        family: "helvetica",
        color: "#111111",
        leading: 1.25,
        autoFit: true,
        maxLines: 5,
      })
    );
    return { bg: "#ffffff", background: { type: "solid", color: "#ffffff" }, layers };
  }

  if (mode === "barcode") {
    const pad = round2(clamp(Math.min(w, h) * 0.08, 2, 4));
    const b = params.firstBarcode;
    const header = b ? [b.name, b.price].filter(Boolean).join(" · ") : "Product Name · $14.00";
    const layers: Layer[] = [
      makeText({
        name: "Product & price",
        labelSlotKey: "barcodeHeader",
        text: header,
        x: pad,
        y: pad,
        w: round2(w - pad * 2),
        size: 8,
        bold: true,
        align: "center",
        fontId: "inter",
        family: "helvetica",
        color: "#111111",
        autoFit: true,
        maxLines: 1,
      }),
      makeImage(b?.dataUrl || "", 2.3, "Barcode", {
        labelSlotKey: "barcode",
        x: pad,
        y: round2(pad + 5),
        w: round2(w - pad * 2),
        h: round2(Math.max(8, h - pad * 2 - 5.5)),
        barcodeText: b?.code || "SKU-1042",
        barcodeFormat: b?.format || "CODE128",
        barcodeFor: b?.dataUrl ? `${b.format}|${b.code}` : undefined,
      }),
    ];
    return { bg: "#ffffff", background: { type: "solid", color: "#ffffff" }, layers };
  }

  if (mode === "nametag") {
    return buildLabelTemplateSide({
      templateId: params.labelStyle,
      w,
      h,
      round,
      accentHex: params.accentHex,
      fontPair: params.fontPair,
      eyebrow: params.eventName,
      title: params.firstPerson?.person || "Alex Morgan",
      subtitle: params.firstPerson?.role || "Keynote Speaker",
    });
  }

  return buildLabelTemplateSide({
    templateId: params.labelStyle,
    w,
    h,
    round,
    accentHex: params.accentHex,
    fontPair: params.fontPair,
    title: params.labelTitle,
    subtitle: params.labelSub,
    stickerImage: params.firstSticker,
  });
}

/* ------------------------------------------------------------------------- */
/* Dynamic List Mail-Merge + Two-Way Sync Helpers                             */
/* ------------------------------------------------------------------------- */

export interface DynamicSlotOverride {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  address?: string;
  returnAddress?: string;
  barcodeHeader?: string;
  barcodeSrc?: string;
  barcodeText?: string;
  stickerSrc?: string;
}

/** Applies per-slot dynamic data (e.g. guest name, address, barcode) onto a custom template SideDesign. */
export function applyLabelSlotOverride(side: SideDesign, data: DynamicSlotOverride): SideDesign {
  return {
    ...side,
    layers: side.layers.map((l) => {
      if (!l.labelSlotKey) return l;
      if (l.kind === "text") {
        if (l.labelSlotKey === "title" && data.title !== undefined) return { ...l, text: data.title };
        if (l.labelSlotKey === "subtitle" && data.subtitle !== undefined) return { ...l, text: data.subtitle };
        if (l.labelSlotKey === "eyebrow" && data.eyebrow !== undefined) return { ...l, text: data.eyebrow };
        if (l.labelSlotKey === "address" && data.address !== undefined) return { ...l, text: data.address };
        if (l.labelSlotKey === "returnAddress" && data.returnAddress !== undefined) return { ...l, text: data.returnAddress };
        if (l.labelSlotKey === "barcodeHeader" && data.barcodeHeader !== undefined) return { ...l, text: data.barcodeHeader };
      } else if (l.kind === "image") {
        if (l.labelSlotKey === "barcode" && data.barcodeSrc) {
          return { ...l, src: data.barcodeSrc, barcodeText: data.barcodeText ?? l.barcodeText };
        }
        if (l.labelSlotKey === "stickerArt" && data.stickerSrc) {
          return { ...l, src: data.stickerSrc };
        }
      }
      return l;
    }),
  };
}

export interface SyncedLabelFields {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  returnAddress?: string;
}

export function extractSyncedLabelFields(side: SideDesign): SyncedLabelFields {
  const out: SyncedLabelFields = {};
  for (const l of side.layers) {
    if (l.kind !== "text" || !l.labelSlotKey) continue;
    if (l.labelSlotKey === "title" && out.title === undefined) out.title = l.text.trim();
    else if (l.labelSlotKey === "subtitle" && out.subtitle === undefined) out.subtitle = l.text.trim();
    else if (l.labelSlotKey === "eyebrow" && out.eyebrow === undefined) out.eyebrow = l.text.trim();
    else if (l.labelSlotKey === "returnAddress" && out.returnAddress === undefined) out.returnAddress = l.text.trim();
  }
  return out;
}

export function applySimpleLabelFieldToSide(side: SideDesign, key: LabelSlotKey, value: string): SideDesign {
  return {
    ...side,
    layers: side.layers.map((l) => (l.kind === "text" && l.labelSlotKey === key ? { ...l, text: value } : l)),
  };
}
