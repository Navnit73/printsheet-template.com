"use client";

import React, { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  Check,
  Download,
  ImagePlus,
  Pencil,
  QrCode,
  RefreshCw,
  Scissors,
  SlidersHorizontal,
  Trash2,
  Undo2,
} from "lucide-react";
import type { PageId } from "@/types/spec";
import {
  checkGridFit,
  fileToDataUrl,
  FONT_PAIRS,
  loadImageElement,
  PAPER_SIZES,
  PRINTER_SAFE_MARGIN_MM,
  renderImageToBoxDataUrl,
  } from "@/lib/pdf-utils";
import { useNumberField } from "@/lib/use-number-field";
import {
  FieldHint,
  MobileActionBar,
  PrintTipsPanel,
  StepHeader,
  ToolStatus,
  UploadDropzone,
  primaryButtonClass,
  secondaryButtonClass,
  type ToolStatusValue,
} from "@/components/tools/ui/ToolUi";
import {
  approxFit,
  drawCardElsPdf,
  drawGridCropMarks,
  getInitialConfig,
  hexToRgb,
  initialsOf,
  layoutCardBack,
  layoutCardFront,
  pdfFitFor,
  previewFit,
  SHEET_PRESETS,
  sheetGeometry,
  PAPER_SHORT,
  type BackStyleId,
  type CardContent,
  type CardStyleId,
  type Fonts,
  type FontPairId,
  type SheetPreset,
  type SheetPresetId,
} from "./card/engine";
import { CardFacePreview } from "./card/CardFacePreview";
import { CardEditorOverlay, CardEditorPanel, type LayerPatch } from "./card/CardEditor";
import { compileSide, elsToSide, newLayerId, type CardDesign, type ImageLayer, type Layer, type SideDesign } from "./card/editor-model";
import { useHistory } from "./card/useHistory";
import { checkRowClass, inputClass, labelClass } from "./card/styles";

/* ------------------------------------------------------------------------- */
/* Preview rendering of the same layout                                       */
/* ------------------------------------------------------------------------- */

const noopSubscribe = () => () => {};


/* ------------------------------------------------------------------------- */
/* Sheet geometry shared by the PDF export and the whole-sheet thumbnail      */
/* ------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------- */
/* Small UI pieces                                                            */
/* ------------------------------------------------------------------------- */

const STYLE_OPTIONS: Array<{ id: CardStyleId; label: string; hint: string }> = [
  { id: "minimal", label: "Modern", hint: "Colour bar on top" },
  { id: "clean", label: "Minimal", hint: "Airy, with a thin accent line" },
  { id: "classic", label: "Classic", hint: "Centred with a frame" },
  { id: "bold-logo", label: "Bold", hint: "Colour stripe on the side" },
  { id: "split", label: "Split", hint: "Colour panel with initials or logo" },
  { id: "monogram", label: "Monogram", hint: "Centred, initials in a circle" },
  { id: "dark", label: "Dark", hint: "Light text on a dark card" },
  { id: "blank", label: "Blank", hint: "Empty outlines to fill in" },
];

const FONT_OPTIONS: Array<{ id: FontPairId; hint: string }> = [
  { id: "modern", hint: "Clean sans-serif" },
  { id: "classic", hint: "Traditional serif" },
  { id: "editorial", hint: "Serif name, sans details" },
  { id: "typewriter", hint: "Monospaced" },
];

const COLOR_PRESETS: Array<{ name: string; hex: string }> = [
  { name: "Forest green", hex: "#3f6212" },
  { name: "Navy", hex: "#1e3a8a" },
  { name: "Teal", hex: "#0f766e" },
  { name: "Burgundy", hex: "#9f1239" },
  { name: "Terracotta", hex: "#c2410c" },
  { name: "Plum", hex: "#6b21a8" },
  { name: "Mustard", hex: "#a16207" },
  { name: "Graphite", hex: "#3f3f46" },
];

const BACK_OPTIONS: Array<{ id: BackStyleId; label: string; hint: string }> = [
  { id: "logo", label: "Logo centred", hint: "Your logo (or initials) on white" },
  { id: "tagline", label: "Company + tagline", hint: "Name and tagline on dark" },
  { id: "solid", label: "Solid colour", hint: "Your colour with the website" },
];

/** Tiny CSS mock-up of a card style, drawn in the current accent colour. */
function StyleThumb({ id, accent }: { id: CardStyleId; accent: string }) {
  const line = (w: string, extra = "") => (
    <span className={`block h-[3px] rounded-full bg-zinc-300 ${extra}`} style={{ width: w }} />
  );
  return (
    <span
      aria-hidden="true"
      className={`relative block w-full overflow-hidden rounded-[5px] bg-white ${
        id === "blank" ? "border border-dashed border-zinc-300" : "ring-1 ring-zinc-200"
      }`}
      style={{ aspectRatio: "90 / 55" }}
    >
      {id === "minimal" && (
        <>
          <span className="absolute inset-x-0 top-0 h-[5%]" style={{ backgroundColor: accent }} />
          <span className="absolute left-[9%] top-[22%] flex w-full flex-col gap-[3px]">
            <span className="block h-[4px] w-[45%] rounded-full bg-zinc-800" />
            <span className="block h-[3px] w-[32%] rounded-full" style={{ backgroundColor: accent }} />
          </span>
          <span className="absolute bottom-[12%] left-[9%] flex w-full flex-col gap-[3px]">
            {line("38%")}
            {line("48%")}
          </span>
        </>
      )}
      {id === "classic" && (
        <>
          <span className="absolute inset-[6%] rounded-[2px] border" style={{ borderColor: accent }} />
          <span className="absolute inset-x-0 top-[24%] flex flex-col items-center gap-[3px]">
            <span className="block h-[4px] w-[42%] rounded-full bg-zinc-800" />
            <span className="block h-[3px] w-[30%] rounded-full" style={{ backgroundColor: accent }} />
          </span>
          <span className="absolute inset-x-0 bottom-[17%] flex flex-col items-center gap-[3px]">
            {line("36%")}
            {line("44%")}
          </span>
        </>
      )}
      {id === "clean" && (
        <>
          <span className="absolute left-[11%] top-[17%] block h-[2px] w-[26%] rounded-full bg-zinc-400" />
          <span className="absolute left-[11%] top-[29%] flex w-full flex-col gap-[3px]">
            <span className="block h-[4px] w-[40%] rounded-full bg-zinc-800" />
            <span className="block h-[3px] w-[28%] rounded-full" style={{ backgroundColor: accent }} />
          </span>
          <span className="absolute bottom-[34%] left-[11%] block h-[1.5px] w-[10%]" style={{ backgroundColor: accent }} />
          <span className="absolute bottom-[13%] left-[11%] flex w-full flex-col gap-[3px]">
            {line("34%")}
            {line("42%")}
          </span>
        </>
      )}
      {id === "split" && (
        <>
          <span className="absolute inset-y-0 left-0 flex w-[34%] items-center justify-center text-[11px] font-bold text-white" style={{ backgroundColor: accent }}>
            AM
          </span>
          <span className="absolute left-[42%] top-[18%] flex w-full flex-col gap-[3px]">
            <span className="block h-[4px] w-[30%] rounded-full bg-zinc-800" />
            <span className="block h-[3px] w-[22%] rounded-full" style={{ backgroundColor: accent }} />
          </span>
          <span className="absolute bottom-[13%] left-[42%] flex w-full flex-col gap-[3px]">
            {line("28%")}
            {line("36%")}
          </span>
        </>
      )}
      {id === "monogram" && (
        <>
          <span className="absolute left-1/2 top-[9%] block h-[22%] -translate-x-1/2 rounded-full" style={{ backgroundColor: accent, aspectRatio: "1" }} />
          <span className="absolute inset-x-0 top-[40%] flex flex-col items-center gap-[3px]">
            <span className="block h-[4px] w-[40%] rounded-full bg-zinc-800" />
            <span className="block h-[3px] w-[28%] rounded-full" style={{ backgroundColor: accent }} />
          </span>
          <span className="absolute inset-x-0 bottom-[11%] flex flex-col items-center gap-[3px]">
            {line("34%")}
            {line("42%")}
          </span>
        </>
      )}
      {id === "dark" && (
        <span className="absolute inset-0 bg-zinc-900">
          <span className="absolute left-[10%] top-[17%] block h-[17%] w-[2px]" style={{ backgroundColor: accent, filter: "brightness(1.6)" }} />
          <span className="absolute left-[15%] top-[18%] flex w-full flex-col gap-[3px]">
            <span className="block h-[4px] w-[40%] rounded-full bg-white" />
            <span className="block h-[3px] w-[28%] rounded-full" style={{ backgroundColor: accent, filter: "brightness(1.6)" }} />
          </span>
          <span className="absolute bottom-[13%] left-[10%] flex w-full flex-col gap-[3px]">
            <span className="block h-[3px] w-[34%] rounded-full bg-zinc-500" />
            <span className="block h-[3px] w-[42%] rounded-full bg-zinc-500" />
          </span>
        </span>
      )}
      {id === "bold-logo" && (
        <>
          <span className="absolute inset-y-0 left-0 w-[5%]" style={{ backgroundColor: accent }} />
          <span className="absolute left-[13%] top-[16%] flex w-full flex-col gap-[3px]">
            <span className="block h-[4px] w-[45%] rounded-full bg-zinc-800" />
            <span className="block h-[3px] w-[32%] rounded-full" style={{ backgroundColor: accent }} />
          </span>
          <span className="absolute right-[8%] top-[14%] h-[22%] w-[18%] rounded-[2px] bg-zinc-200" />
          <span className="absolute bottom-[12%] left-[13%] flex w-full flex-col gap-[3px]">
            {line("38%")}
            {line("48%")}
          </span>
        </>
      )}
    </span>
  );
}

/** Compact "file is loaded" row with a thumbnail, Replace and Remove. */
function LoadedFileRow({
  src,
  name,
  fallbackName,
  accept,
  replaceLabel,
  onReplace,
  onRemove,
  thumbAspect,
}: {
  src: string;
  name: string;
  fallbackName: string;
  accept: string;
  replaceLabel: string;
  onReplace: (file: File | undefined) => void;
  onRemove: () => void;
  thumbAspect?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-[#f5f5f7] p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="h-11 w-auto max-w-[80px] shrink-0 rounded-md bg-white object-contain ring-1 ring-zinc-200"
        style={thumbAspect ? { aspectRatio: thumbAspect, objectFit: "cover" } : undefined}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-zinc-950">{name || fallbackName}</p>
        <p className="text-xs text-[#3f6212]">Added</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          aria-label={replaceLabel}
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            onReplace(f);
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`${secondaryButtonClass} bg-white hover:bg-[#ebeced]`}
        >
          <RefreshCw aria-hidden="true" className="h-4 w-4" />
          Replace
        </button>
        <button
          type="button"
          onClick={onRemove}
          className={`${secondaryButtonClass} bg-white hover:bg-[#ebeced]`}
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
          Remove
        </button>
      </div>
    </div>
  );
}


/* ------------------------------------------------------------------------- */
/* Tool                                                                       */
/* ------------------------------------------------------------------------- */

type SheetChoice = SheetPresetId | "custom";
interface CustomSheet {
  paper: "a4" | "letter" | "a3";
  cols: number;
  rows: number;
  cardW: number;
  cardH: number;
  gapX: number;
  gapY: number;
}
const EMPTY_SIDE: SideDesign = { bg: "#ffffff", layers: [] };
const EMPTY_DESIGN: CardDesign = { front: EMPTY_SIDE, back: EMPTY_SIDE };

/** One labelled mm/count input that lets people type freely (see useNumberField). */
function SheetNumber({
  label,
  value,
  onChange,
  min,
  max,
  unit = "mm",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  unit?: string;
}) {
  const id = useId();
  const f = useNumberField(value, (v) => onChange(Math.round(v * 100) / 100), { min, max, unit });
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[11px] font-semibold text-zinc-700">
        {label}
      </label>
      <input id={id} type="text" className={`${inputClass} min-h-[40px] !py-1.5 bg-white`} {...f.inputProps} />
      {f.error && <p className="mt-0.5 text-[11px] text-red-700">{f.error}</p>}
    </div>
  );
}

export function BusinessCardTool({ pageId }: { pageId: PageId }) {
  const init = getInitialConfig(pageId);
  const [mode, setMode] = useState<"design" | "upload">(init.mode);
  const [sheetId, setSheetId] = useState<SheetChoice>(init.sheet);
  const [styleId, setStyleId] = useState<CardStyleId>(init.style);

  const [fullName, setFullName] = useState("Alex Morgan");
  const [role, setRole] = useState("Independent Print Designer");
  const [company, setCompany] = useState("Northlight Studio");
  const [phone, setPhone] = useState("+1 (555) 234-8910");
  const [email, setEmail] = useState("alex@northlight.example");
  const [website, setWebsite] = useState("northlight.example");
  const [accentHex, setAccentHex] = useState("#3f6212");
  const [includeBack, setIncludeBack] = useState(false);
  const [fontPairId, setFontPairId] = useState<FontPairId>("modern");
  const [backStyle, setBackStyle] = useState<BackStyleId>("tagline");
  const [tagline, setTagline] = useState("Brand identity, packaging and print layouts.");
  const [includeQr, setIncludeQr] = useState(!!init.qr);
  const [qrState, setQrState] = useState<{ target: string; url: string }>({ target: "", url: "" });
  const [uploadedFront, setUploadedFront] = useState<string | null>(null);
  const [uploadedName, setUploadedName] = useState<string>("");
  const [logo, setLogo] = useState<{ src: string; w: number; h: number; name: string } | null>(null);
  const [showCropMarks, setShowCropMarks] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState<ToolStatusValue | null>(null);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [previewSide, setPreviewSide] = useState<"front" | "back">("front");
  const [custom, setCustom] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const hist = useHistory<CardDesign>(EMPTY_DESIGN);
  const [customSheet, setCustomSheet] = useState<CustomSheet>({
    paper: "a4", cols: 2, rows: 5, cardW: 90, cardH: 55, gapX: 6, gapY: 2,
  });
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const uid = useId();

  const sheet: SheetPreset =
    sheetId === "custom"
      ? { id: "a4-10up", label: "Custom", note: "", ...customSheet }
      : SHEET_PRESETS[sheetId];
  const paper = PAPER_SIZES[sheet.paper];
  const paperShort = PAPER_SHORT[sheet.paper];
  const cardCount = sheet.cols * sheet.rows;
  const isBlank = styleId === "blank";
  const blankView = isBlank && !custom;
  const canBack = mode === "design" && (custom || !isBlank);
  const backOn = includeBack && canBack;
  const side = backOn ? previewSide : "front";
  const needsUpload = mode === "upload" && !uploadedFront;
  const accent = hexToRgb(accentHex);
  const geo = sheetGeometry(sheet, paper.widthMm, paper.heightMm, offsetX, offsetY);
  // Flipping the paper along the long edge mirrors left and right, so the back page is shifted the opposite way.
  const geoBack = sheetGeometry(sheet, paper.widthMm, paper.heightMm, -offsetX, offsetY);
  const gridCheck = checkGridFit({
    paperW: paper.widthMm,
    paperH: paper.heightMm,
    cols: sheet.cols,
    rows: sheet.rows,
    itemW: sheet.cardW,
    itemH: sheet.cardH,
    gapX: sheet.gapX,
    gapY: sheet.gapY,
    marginX: PRINTER_SAFE_MARGIN_MM,
    marginY: PRINTER_SAFE_MARGIN_MM,
    centered: true,
  });
  const gridBad = sheetId === "custom" && !gridCheck.fits;

  // QR target: website → URL, else email → mailto:, else phone → tel:. Never a placeholder.
  const qrTarget = useMemo(() => {
    const w = website.trim();
    if (w) return /^https?:\/\//i.test(w) ? w : `https://${w}`;
    const e = email.trim();
    if (e) return `mailto:${e}`;
    const p = phone.replace(/[^\d+]/g, "");
    if (p) return `tel:${p}`;
    return "";
  }, [website, email, phone]);

  useEffect(() => {
    if (!includeQr || !qrTarget) return;
    let cancelled = false;
    import("qrcode")
      .then((QRCode) =>
        QRCode.toDataURL(qrTarget, {
          width: 240,
          margin: 1,
          color: { dark: "#09090b", light: "#ffffff" },
        })
      )
      .then((url) => {
        if (!cancelled) setQrState({ target: qrTarget, url });
      })
      .catch(() => {
        if (!cancelled) setQrState({ target: qrTarget, url: "" });
      });
    return () => {
      cancelled = true;
    };
  }, [includeQr, qrTarget]);

  const qrDataUrl = includeQr && qrTarget && qrState.target === qrTarget ? qrState.url : "";
  const showQr = !isBlank && !!qrDataUrl;

  const content: CardContent = { fullName, role, company, phone, email, website };
  const pair = FONT_PAIRS[fontPairId];
  const fonts: Fonts = { heading: pair.heading, body: pair.body };
  const backContent = {
    title: company.trim() || fullName.trim(),
    tagline: tagline.trim(),
    website: website.trim(),
    initials: initialsOf(fullName, company),
  };
  const isDarkDesign = custom
    ? hist.present.front.bg.toLowerCase() !== "#ffffff" || (backOn && hist.present.back.bg.toLowerCase() !== "#ffffff")
    : (!isBlank && mode === "design" && styleId === "dark") || (backOn && backStyle !== "logo");

  const fit = hydrated ? previewFit : approxFit;
  const design = hist.present;
  const compiledFront = custom ? compileSide(design.front, sheet.cardW, sheet.cardH, fit) : null;
  const compiledBack = custom ? compileSide(design.back, sheet.cardW, sheet.cardH, fit) : null;
  const frontEls = compiledFront
    ? compiledFront.els
    : isBlank
      ? []
      : layoutCardFront(sheet.cardW, sheet.cardH, styleId, accent, content, logo, showQr, fit, fonts);
  const backEls = compiledBack
    ? compiledBack.els
    : backOn
      ? layoutCardBack(sheet.cardW, sheet.cardH, backStyle, accent, backContent, logo, fit, fonts)
      : [];

  /* ---- Free-edit mode ---- */
  function startCustom() {
    const W = sheet.cardW;
    const H = sheet.cardH;
    const front = isBlank
      ? EMPTY_SIDE
      : elsToSide(frontEls, W, H, {
          logo: logo ? { src: logo.src, w: logo.w, h: logo.h } : undefined,
          qr: qrDataUrl ? { src: qrDataUrl, target: qrTarget } : undefined,
        });
    const back = elsToSide(layoutCardBack(W, H, backStyle, accent, backContent, logo, fit, fonts), W, H, {
      logo: logo ? { src: logo.src, w: logo.w, h: logo.h } : undefined,
    });
    hist.reset({ front, back });
    setSelectedId(null);
    setConfirmExit(false);
    setCustom(true);
    setPreviewSide("front");
    setStatus(null);
  }
  function exitCustom() {
    setCustom(false);
    setConfirmExit(false);
    setSelectedId(null);
    setPreviewSide("front");
  }
  const editSide: "front" | "back" = backOn ? previewSide : "front";
  const mapSide = (d: CardDesign, fn: (s: SideDesign) => SideDesign): CardDesign => ({ ...d, [editSide]: fn(d[editSide]) });
  const updateLayer = (id: string, patch: LayerPatch, group?: string) =>
    hist.set((d) => mapSide(d, (s) => ({ ...s, layers: s.layers.map((l) => (l.id === id ? ({ ...l, ...patch } as Layer) : l)) })), group);
  const addLayer = (layer: Layer) => {
    hist.set((d) => mapSide(d, (s) => ({ ...s, layers: [...s.layers, layer] })));
    setSelectedId(layer.id);
  };
  const removeLayer = (id: string) => {
    hist.set((d) => mapSide(d, (s) => ({ ...s, layers: s.layers.filter((l) => l.id !== id) })));
    setSelectedId(null);
  };
  const duplicateLayer = (id: string) => {
    const src = design[editSide].layers.find((l) => l.id === id);
    if (!src) return;
    const copy = { ...src, id: newLayerId(), x: src.x + 2, y: src.y + 2, locked: false } as Layer;
    addLayer(copy);
  };
  const reorderLayer = (id: string, dir: 1 | -1) =>
    hist.set((d) =>
      mapSide(d, (s) => {
        const i = s.layers.findIndex((l) => l.id === id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= s.layers.length) return s;
        const layers = [...s.layers];
        [layers[i], layers[j]] = [layers[j], layers[i]];
        return { ...s, layers };
      })
    );
  const patchSilently = (which: "front" | "back", id: string, patch: Partial<ImageLayer>) =>
    hist.patchSilently((d) => ({
      ...d,
      [which]: { ...d[which], layers: d[which].layers.map((l) => (l.id === id && l.kind === "image" ? { ...l, ...patch } : l)) },
    }));
  const previewImages = { logo: logo?.src, qr: qrDataUrl || undefined };
  const frontLabel = [fullName, role, company, phone, email, website].filter((s) => s.trim()).join(", ");
  const backLabel = [
    backStyle === "logo" ? (logo ? "Logo" : backContent.initials) : "",
    backStyle === "solid" ? backContent.website || backContent.title : backContent.title,
    backContent.tagline || (backStyle === "tagline" ? backContent.website : ""),
  ]
    .filter(Boolean)
    .join(", ");

  const clearStatus = () => setStatus(null);

  async function acceptCardFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus({ tone: "error", text: "That file isn't an image. Please choose a PNG or JPG." });
      return;
    }
    try {
      setUploadedFront(await fileToDataUrl(file));
      setUploadedName(file.name);
      setMode("upload");
      setStatus(null);
    } catch {
      setStatus({ tone: "error", text: "Could not read that image. Try a PNG or JPG." });
    }
  }

  async function acceptLogoFile(file: File | undefined) {
    if (!file) return;
    try {
      const raw = await fileToDataUrl(file);
      const img = await loadImageElement(raw);
      const w = img.naturalWidth || 300;
      const h = img.naturalHeight || 150;
      // Normalise to PNG so jsPDF accepts any format (JPG, WebP, SVG) and keeps transparency.
      const scale = Math.min(1, 1200 / Math.max(w, h));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(w * scale));
      canvas.height = Math.max(1, Math.round(h * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setLogo({ src: canvas.toDataURL("image/png"), w, h, name: file.name });
      setStatus(null);
    } catch {
      setStatus({ tone: "error", text: "Could not read that logo. Try a PNG or JPG." });
    }
  }

  async function handleDownloadPdf() {
    if (needsUpload || gridBad) return;
    setIsExporting(true);
    setStatus(null);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [paper.widthMm, paper.heightMm],
      });
      const pdfFit = pdfFitFor(doc);
      const { cells } = geo;
      const marks = (g = geo) =>
        showCropMarks &&
        drawGridCropMarks(doc, { startX: g.startX, startY: g.startY, sheet, paperW: paper.widthMm, paperH: paper.heightMm });

      if (mode === "upload" && uploadedFront) {
        const prepared = await renderImageToBoxDataUrl(uploadedFront, sheet.cardW / sheet.cardH, "cover");
        for (const [x, y] of cells) {
          doc.addImage(prepared.dataUrl, prepared.format, x, y, sheet.cardW, sheet.cardH);
        }
      } else {
        const els = custom
          ? compileSide(design.front, sheet.cardW, sheet.cardH, pdfFit).els
          : isBlank
            ? []
            : layoutCardFront(sheet.cardW, sheet.cardH, styleId, accent, content, logo, showQr, pdfFit, fonts);
        const images = { logo: logo?.src, qr: qrDataUrl || undefined };
        for (const [x, y] of cells) {
          doc.setFillColor(255, 255, 255);
          doc.rect(x, y, sheet.cardW, sheet.cardH, "F");
          if (blankView) {
            doc.setDrawColor(212, 212, 216);
            doc.setLineWidth(0.2);
            doc.rect(x, y, sheet.cardW, sheet.cardH);
          } else {
            drawCardElsPdf(doc, els, x, y, images);
          }
        }
      }
      marks();

      if (backOn) {
        doc.addPage([paper.widthMm, paper.heightMm], "portrait");
        const els = custom
          ? compileSide(design.back, sheet.cardW, sheet.cardH, pdfFit).els
          : layoutCardBack(sheet.cardW, sheet.cardH, backStyle, accent, backContent, logo, pdfFit, fonts);
        for (const [x, y] of geoBack.cells) {
          doc.setFillColor(255, 255, 255);
          doc.rect(x, y, sheet.cardW, sheet.cardH, "F");
          drawCardElsPdf(doc, els, x, y, { logo: logo?.src });
        }
        marks(geoBack);
      }

      doc.save(`business-cards-${pageId.toLowerCase()}-${sheet.paper}.pdf`);
      setStatus({
        tone: "success",
        text: backOn
          ? `Your PDF is downloaded: ${cardCount} card fronts on page 1 and the backs on page 2. Follow the print steps below.`
          : `Your PDF is downloaded: ${cardCount} cards on one ${paperShort} page. Follow the print steps below.`,
      });
      setTipsOpen(true);
    } catch (err) {
      setStatus({
        tone: "error",
        text: err instanceof Error ? `Sorry, the PDF could not be made: ${err.message}` : "Sorry, the PDF could not be made.",
      });
    } finally {
      setIsExporting(false);
    }
  }

  const recW = Math.round((sheet.cardW / 25.4) * 300);
  const recH = Math.round((sheet.cardH / 25.4) * 300);
  const sizeHint = `PNG or JPG · best at ${recW} × ${recH} px or larger (same shape as a ${sheet.cardW} × ${sheet.cardH} mm card) · stays on your device`;

  const downloadLabel = isExporting ? "Making your PDF…" : `Download PDF · ${cardCount} cards`;
  const downloadHintId = `${uid}-download-hint`;
  const downloadButton = (extra = "") => (
    <button
      type="button"
      onClick={handleDownloadPdf}
      disabled={isExporting || needsUpload || gridBad}
      aria-describedby={needsUpload ? downloadHintId : undefined}
      className={`${primaryButtonClass} ${extra}`}
    >
      <Download aria-hidden="true" className="h-4 w-4" />
      {downloadLabel}
    </button>
  );

  const extraSteps: React.ReactNode[] = [
    <>
      Use thick card paper (250–300 gsm) and set paper type to <strong>&lsquo;Cardstock&rsquo;</strong> /{" "}
      <strong>&lsquo;Heavy&rsquo;</strong>.
    </>,
  ];
  if (backOn) {
    extraSteps.push(
      <>
        For the back: flip the sheet along the <strong>long edge</strong> and print page 2.
      </>
    );
  }
  if (isDarkDesign) {
    extraSteps.push(
      <>
        Dark or coloured cards: cut exactly on the guides, or a hair inside them, so no white edge shows. If your
        printer offers <strong>borderless</strong> printing, it gives the cleanest edges.
      </>
    );
  }

  const sheetStep = mode === "design" && !custom ? 3 : 2;
  const downloadStep = sheetStep + 1;

  /* ---- Preview pieces ---- */
  const cardFace = (which: "front" | "back") => {
    if (which === "back") {
      return <CardFacePreview W={sheet.cardW} H={sheet.cardH} els={backEls} images={{ logo: logo?.src }} label={backLabel} />;
    }
    if (mode === "upload") {
      return uploadedFront ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={uploadedFront} alt="Your card design" className="absolute inset-0 h-full w-full object-cover" />
      ) : null;
    }
    if (blankView) return null;
    return <CardFacePreview W={sheet.cardW} H={sheet.cardH} els={frontEls} images={previewImages} label={frontLabel} />;
  };

  const pct = (v: number, total: number) => `${(v / total) * 100}%`;
  const markLen = 3;
  const tg = side === "back" ? geoBack : geo;
  const sheetThumb = (
    <div
      className="relative w-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.06)]"
      style={{ aspectRatio: `${paper.widthMm} / ${paper.heightMm}` }}
      role="img"
      aria-label={`Whole ${paperShort} page with ${cardCount} cards in ${sheet.rows} rows of ${sheet.cols}`}
    >
      {tg.cells.map(([x, y], i) => (
        <div
          key={i}
          className={`absolute overflow-hidden ${
            side === "front" && needsUpload
              ? "border border-dashed border-zinc-300"
              : side === "front" && blankView
                ? "ring-[0.5px] ring-zinc-300"
              : side === "front" && mode === "design"
                ? "ring-[0.5px] ring-zinc-200"
                : ""
          }`}
          style={{
            left: pct(x, paper.widthMm),
            top: pct(y, paper.heightMm),
            width: pct(sheet.cardW, paper.widthMm),
            height: pct(sheet.cardH, paper.heightMm),
            containerType: "inline-size",
          }}
          aria-hidden="true"
        >
          {cardFace(side)}
        </div>
      ))}
      {showCropMarks && (
        <div aria-hidden="true">
          {Array.from(new Set(tg.cells.flatMap(([x]) => [x, x + sheet.cardW]))).flatMap((x) => [
            [x, tg.startY - 1 - markLen],
            [x, tg.startY + tg.gridH + 1],
          ]).map(([x, y], i) => (
            <span
              key={`v${i}`}
              className="absolute w-px bg-zinc-500"
              style={{ left: pct(x, paper.widthMm), top: pct(y, paper.heightMm), height: pct(markLen, paper.heightMm) }}
            />
          ))}
          {Array.from(new Set(tg.cells.flatMap(([, y]) => [y, y + sheet.cardH]))).flatMap((y) => [
            [tg.startX - 1 - markLen, y],
            [tg.startX + tg.gridW + 1, y],
          ]).map(([x, y], i) => (
            <span
              key={`h${i}`}
              className="absolute h-px bg-zinc-500"
              style={{ left: pct(x, paper.widthMm), top: pct(y, paper.heightMm), width: pct(markLen, paper.widthMm) }}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div
      onChangeCapture={clearStatus}
      className="rounded-3xl bg-[#f5f5f7] p-2 sm:p-5 lg:p-6 space-y-2 sm:space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3.5">
        <div role="group" aria-label="How do you want to make your card?" className="flex flex-wrap items-center gap-1.5">
          {(
            [
              ["design", "Design my card here", Pencil],
              ["upload", "I already have a design", ImagePlus],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              aria-pressed={mode === id}
              onClick={() => {
                setMode(id);
                clearStatus();
              }}
              className={`min-h-[42px] inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition cursor-pointer ${
                mode === id ? "bg-[#4d7c0f] text-white" : "bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced]"
              }`}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
        <div className="text-xs text-zinc-600">
          {cardCount} cards per {paperShort} page · each {sheet.cardW} × {sheet.cardH} mm
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-5 items-start">
        {/* ---------------- Controls ---------------- */}
        <div className="order-2 lg:order-1 lg:col-span-5 rounded-2xl bg-white p-4 sm:p-6 space-y-7">
          {mode === "upload" ? (
            <section aria-labelledby={`${uid}-s1`}>
              <StepHeader
                id={`${uid}-s1`}
                step={1}
                title="Upload your card design"
                hint="Use a finished card picture, e.g. exported from Canva or Photoshop. We repeat it across the page."
              />
              {uploadedFront ? (
                <LoadedFileRow
                  src={uploadedFront}
                  name={uploadedName}
                  fallbackName="Your card design"
                  accept="image/jpeg,image/png,image/webp"
                  replaceLabel="Replace card design image"
                  onReplace={(f) => void acceptCardFile(f)}
                  onRemove={() => {
                    setUploadedFront(null);
                    setUploadedName("");
                    clearStatus();
                  }}
                  thumbAspect={`${sheet.cardW} / ${sheet.cardH}`}
                />
              ) : (
                <UploadDropzone
                  title="Choose your card design"
                  buttonLabel="Choose image"
                  inputLabel="Upload business card design"
                  hint={sizeHint}
                  onFiles={(files) => void acceptCardFile(files[0])}
                />
              )}
              <div className="mt-4 rounded-2xl border border-dashed border-[#4d7c0f]/50 bg-[#f7fbf1] p-3.5">
                <p className="text-sm font-bold text-zinc-950">No design yet? Make one here</p>
                <p className="mt-0.5 text-xs leading-relaxed text-zinc-600">
                  Build your card from scratch and edit every part: text, fonts, colours, logo, shapes, QR codes, card size and sheet layout.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMode("design");
                    startCustom();
                  }}
                  className={`${secondaryButtonClass} mt-2.5 bg-white hover:bg-[#ebeced]`}
                >
                  <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
                  Design &amp; edit my card
                </button>
              </div>
            </section>
          ) : custom ? (
            <section aria-labelledby={`${uid}-s1`}>
              <StepHeader
                id={`${uid}-s1`}
                step={1}
                title="Edit your card"
                hint="Everything is editable: click an item on the card to change it, drag to move it, add your own text, shapes, images and QR codes."
              />
              <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl bg-[#eef6e4] p-3 text-xs text-[#365314]">
                <SlidersHorizontal aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1">
                  Free-edit mode is on. Your preset details are now ordinary items you can change.
                </span>
                {confirmExit ? (
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold">Discard your edits?</span>
                    <button type="button" onClick={exitCustom} className={`${secondaryButtonClass} !min-h-[36px] bg-white`}>
                      Yes, go back
                    </button>
                    <button type="button" onClick={() => setConfirmExit(false)} className={`${secondaryButtonClass} !min-h-[36px] bg-white`}>
                      Keep editing
                    </button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setConfirmExit(true)} className={`${secondaryButtonClass} !min-h-[36px] bg-white`}>
                    <Undo2 aria-hidden="true" className="h-4 w-4" />
                    Back to presets
                  </button>
                )}
              </div>
              <CardEditorPanel
                W={sheet.cardW}
                H={sheet.cardH}
                side={editSide}
                design={design[editSide]}
                bounds={(editSide === "back" ? compiledBack : compiledFront)?.bounds ?? new Map()}
                selectedId={selectedId}
                defaultQrText={qrTarget}
                canUndo={hist.canUndo}
                canRedo={hist.canRedo}
                onSelect={setSelectedId}
                onChange={updateLayer}
                onAdd={addLayer}
                onRemove={removeLayer}
                onDuplicate={duplicateLayer}
                onReorder={reorderLayer}
                onSetBg={(bg) => hist.set((d) => mapSide(d, (sd) => ({ ...sd, bg })), `bg-${editSide}`)}
                onUndo={hist.undo}
                onRedo={hist.redo}
                onPatchSilently={patchSilently}
                onError={(text) => setStatus({ tone: "error", text })}
              />
              {!backOn && (
                <FieldHint>To design the back of the card too, tick &ldquo;Also print the back&rdquo; in the next step.</FieldHint>
              )}
            </section>
          ) : (
            <>
              <section aria-labelledby={`${uid}-s1`}>
                <StepHeader
                  id={`${uid}-s1`}
                  step={1}
                  title="Your details"
                  hint="Type what should appear on the card. Leave a box empty to hide that line."
                />
                {isBlank ? (
                  <div className="space-y-3 rounded-2xl bg-[#f5f5f7] p-4">
                    <FieldHint>
                      You picked <strong>Blank</strong> cards — they print as empty outlines, so no details are
                      needed.
                    </FieldHint>
                    <button
                      type="button"
                      onClick={() => setStyleId("minimal")}
                      className={`${secondaryButtonClass} bg-white hover:bg-[#ebeced]`}
                    >
                      <Pencil aria-hidden="true" className="h-4 w-4" />
                      Add my details instead
                    </button>{" "}
                    <button type="button" onClick={startCustom} className={`${secondaryButtonClass} bg-white hover:bg-[#ebeced]`}>
                      <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
                      Design from scratch
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(
                        [
                          ["card-full-name", "Your name", fullName, setFullName, "text", "name"],
                          ["card-role", "Job title", role, setRole, "text", "organization-title"],
                          ["card-company", "Company", company, setCompany, "text", "organization"],
                          ["card-phone", "Phone", phone, setPhone, "tel", "tel"],
                          ["card-email", "Email", email, setEmail, "email", "email"],
                          ["card-website", "Website", website, setWebsite, "text", "url"],
                        ] as const
                      ).map(([id, label, value, setter, type, auto]) => (
                        <div key={id}>
                          <label htmlFor={id} className={labelClass}>
                            {label}
                          </label>
                          <input
                            id={id}
                            type={type}
                            autoComplete={auto}
                            value={value}
                            onChange={(e) => setter(e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className={labelClass}>Logo (optional)</p>
                      {logo ? (
                        <LoadedFileRow
                          src={logo.src}
                          name={logo.name}
                          fallbackName="Your logo"
                          accept="image/jpeg,image/png,image/webp,image/svg+xml"
                          replaceLabel="Replace company logo image"
                          onReplace={(f) => void acceptLogoFile(f)}
                          onRemove={() => {
                            setLogo(null);
                            clearStatus();
                          }}
                        />
                      ) : (
                        <UploadDropzone
                          compact
                          title="Add a logo"
                          buttonLabel="Choose logo"
                          inputLabel="Upload company logo image"
                          accept="image/jpeg,image/png,image/webp,image/svg+xml"
                          hint="PNG with a see-through background looks best"
                          onFiles={(files) => void acceptLogoFile(files[0])}
                        />
                      )}
                    </div>
                  </div>
                )}
              </section>

              <section aria-labelledby={`${uid}-s2`}>
                <StepHeader
                  id={`${uid}-s2`}
                  step={2}
                  title="Pick a style"
                  hint="Tap a design. You can change it any time — your details stay."
                />
                <div role="group" aria-label="Card style" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {STYLE_OPTIONS.map((st) => {
                    const active = styleId === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          setStyleId(st.id);
                          clearStatus();
                        }}
                        className={`relative flex flex-col gap-2 rounded-xl p-2 text-left transition cursor-pointer ${
                          active
                            ? "bg-[#eef6e4] ring-2 ring-[#4d7c0f]"
                            : "bg-[#f5f5f7] ring-1 ring-transparent hover:bg-[#ebeced]"
                        }`}
                      >
                        <StyleThumb id={st.id} accent={accentHex} />
                        <span className="px-0.5">
                          <span className="flex items-center gap-1 text-sm font-bold text-zinc-950">
                            {st.label}
                            {active && <Check aria-hidden="true" className="h-3.5 w-3.5 text-[#4d7c0f]" />}
                          </span>
                          <span className="block text-[11px] leading-snug text-zinc-600">{st.hint}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {!isBlank && (
                  <div className="mt-4 space-y-4">
                    {styleId === "dark" && (
                      <FieldHint>
                        Dark cards print ink right to the edge — cut exactly on the guides (or a hair inside) so no
                        white edge shows.
                      </FieldHint>
                    )}
                    <div role="group" aria-labelledby={`${uid}-font-label`}>
                      <p id={`${uid}-font-label`} className={labelClass}>
                        Font
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {FONT_OPTIONS.map((f) => {
                          const p = FONT_PAIRS[f.id];
                          const active = fontPairId === f.id;
                          return (
                            <button
                              key={f.id}
                              type="button"
                              aria-pressed={active}
                              onClick={() => setFontPairId(f.id)}
                              className={`flex min-h-[44px] flex-col items-start gap-0.5 rounded-xl px-3 py-2 text-left transition cursor-pointer ${
                                active
                                  ? "bg-[#eef6e4] ring-2 ring-[#4d7c0f]"
                                  : "bg-[#f5f5f7] ring-1 ring-transparent hover:bg-[#ebeced]"
                              }`}
                            >
                              <span className="text-lg font-bold leading-tight text-zinc-950" style={{ fontFamily: p.cssHeading }}>
                                Aa <span className="text-sm font-normal text-zinc-600" style={{ fontFamily: p.cssBody }}>Aa</span>
                              </span>
                              <span className="text-xs font-semibold text-zinc-900">{p.label}</span>
                              <span className="text-[11px] leading-snug text-zinc-600">{f.hint}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p id={`${uid}-colour-label`} className={labelClass}>
                        Colour
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <div role="group" aria-labelledby={`${uid}-colour-label`} className="flex flex-wrap gap-1.5">
                          {COLOR_PRESETS.map((cp) => {
                            const active = accentHex.toLowerCase() === cp.hex;
                            return (
                              <button
                                key={cp.hex}
                                type="button"
                                aria-pressed={active}
                                aria-label={cp.name}
                                title={cp.name}
                                onClick={() => setAccentHex(cp.hex)}
                                className={`grid h-10 w-10 place-items-center rounded-full transition cursor-pointer ${
                                  active ? "ring-2 ring-[#4d7c0f] ring-offset-2" : "ring-1 ring-black/10 hover:scale-105"
                                }`}
                                style={{ backgroundColor: cp.hex }}
                              >
                                {active && <Check aria-hidden="true" className="h-4 w-4 text-white" />}
                              </button>
                            );
                          })}
                        </div>
                        <label
                          htmlFor="card-accent-color"
                          className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl bg-[#f5f5f7] px-3 text-xs font-medium text-zinc-700 hover:bg-[#ebeced]"
                        >
                          Custom
                          <span className="font-mono text-zinc-600">{accentHex.toUpperCase()}</span>
                          <input
                            id="card-accent-color"
                            type="color"
                            value={accentHex}
                            onChange={(e) => setAccentHex(e.target.value)}
                            className="h-8 w-10 cursor-pointer rounded-md bg-white"
                          />
                        </label>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className={checkRowClass}>
                        <input
                          type="checkbox"
                          checked={includeQr}
                          onChange={(e) => setIncludeQr(e.target.checked)}
                          className="h-5 w-5 shrink-0 accent-[#4d7c0f]"
                        />
                        <QrCode aria-hidden="true" className="h-4 w-4 text-zinc-600" />
                        Add a QR code
                      </label>
                      <FieldHint tone={includeQr && !qrTarget ? "warning" : "muted"}>
                        {!includeQr
                          ? "People can scan it with their phone camera to open your website."
                          : qrTarget
                            ? `Scanning it opens: ${qrTarget}`
                            : "Add a website, email or phone number in step 1 so the QR code has somewhere to go."}
                      </FieldHint>
                    </div>
                    <div className="rounded-2xl border border-dashed border-[#4d7c0f]/50 bg-[#f7fbf1] p-3.5">
                      <p className="text-sm font-bold text-zinc-950">Want full control?</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-zinc-600">
                        Edit every part by hand: move, resize or delete any item, change each font, size and colour, and add extra text,
                        shapes, images and QR codes. Your current design is the starting point.
                      </p>
                      <button type="button" onClick={startCustom} className={`${secondaryButtonClass} mt-2.5 bg-white hover:bg-[#ebeced]`}>
                        <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
                        Edit every detail
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}

          <section aria-labelledby={`${uid}-s3`}>
            <StepHeader
              id={`${uid}-s3`}
              step={sheetStep}
              title="Sheet & paper"
              hint="Choose the paper you'll print on and how many cards fit on it."
            />
            <fieldset className="space-y-2">
              <legend className={labelClass}>Sheet layout</legend>
              {Object.values(SHEET_PRESETS).map((s) => {
                const active = s.id === sheetId;
                return (
                  <label
                    key={s.id}
                    className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition ${
                      active
                        ? "bg-[#eef6e4] font-semibold text-[#365314] ring-2 ring-[#4d7c0f]"
                        : "bg-[#f5f5f7] text-zinc-800 hover:bg-[#ebeced]"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`${uid}-sheet`}
                      value={s.id}
                      checked={active}
                      onChange={() => setSheetId(s.id)}
                      className="h-4 w-4 shrink-0 accent-[#4d7c0f]"
                    />
                    {s.label}
                  </label>
                );
              })}
              <label
                className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition ${
                  sheetId === "custom"
                    ? "bg-[#eef6e4] font-semibold text-[#365314] ring-2 ring-[#4d7c0f]"
                    : "bg-[#f5f5f7] text-zinc-800 hover:bg-[#ebeced]"
                }`}
              >
                <input
                  type="radio"
                  name={`${uid}-sheet`}
                  value="custom"
                  checked={sheetId === "custom"}
                  onChange={() => {
                    if (sheetId !== "custom") {
                      const { paper: pp, cols, rows, cardW, cardH, gapX, gapY } = sheet;
                      setCustomSheet({ paper: pp, cols, rows, cardW, cardH, gapX, gapY });
                    }
                    setSheetId("custom");
                  }}
                  className="h-4 w-4 shrink-0 accent-[#4d7c0f]"
                />
                Custom — set the paper, card size and layout yourself
              </label>
              {sheetId !== "custom" && <FieldHint>{sheet.note}</FieldHint>}
            </fieldset>

            {sheetId === "custom" && (
              <div className="mt-3 space-y-3 rounded-2xl bg-[#f5f5f7] p-3.5">
                <div>
                  <label htmlFor={`${uid}-paper`} className={labelClass}>
                    Paper
                  </label>
                  <select
                    id={`${uid}-paper`}
                    value={customSheet.paper}
                    onChange={(e) => setCustomSheet((c) => ({ ...c, paper: e.target.value as CustomSheet["paper"] }))}
                    className={`${inputClass} bg-white`}
                  >
                    {(["a4", "letter", "a3"] as const).map((id) => (
                      <option key={id} value={id}>
                        {PAPER_SIZES[id].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  <SheetNumber label="Cards across" unit="" value={customSheet.cols} min={1} max={12} onChange={(cols) => setCustomSheet((c) => ({ ...c, cols: Math.round(cols) }))} />
                  <SheetNumber label="Cards down" unit="" value={customSheet.rows} min={1} max={20} onChange={(rows) => setCustomSheet((c) => ({ ...c, rows: Math.round(rows) }))} />
                  <SheetNumber label="Card width" value={customSheet.cardW} min={20} max={200} onChange={(cardW) => setCustomSheet((c) => ({ ...c, cardW }))} />
                  <SheetNumber label="Card height" value={customSheet.cardH} min={20} max={200} onChange={(cardH) => setCustomSheet((c) => ({ ...c, cardH }))} />
                  <SheetNumber label="Gap across" value={customSheet.gapX} min={0} max={50} onChange={(gapX) => setCustomSheet((c) => ({ ...c, gapX }))} />
                  <SheetNumber label="Gap down" value={customSheet.gapY} min={0} max={50} onChange={(gapY) => setCustomSheet((c) => ({ ...c, gapY }))} />
                </div>
                {gridBad ? (
                  <FieldHint tone="error">
                    That doesn&rsquo;t fit on {paperShort} (printers can&rsquo;t reach the last {PRINTER_SAFE_MARGIN_MM} mm of each edge). At most{" "}
                    {gridCheck.maxCols} across × {gridCheck.maxRows} down fit at this size. Make cards smaller or use fewer.
                  </FieldHint>
                ) : (
                  <FieldHint>
                    {cardCount} cards, each {sheet.cardW} × {sheet.cardH} mm, centred on the page.
                    {custom && " Items on your card keep their position when you change the card size."}
                  </FieldHint>
                )}
              </div>
            )}

            <details className="mt-4 rounded-xl bg-[#f5f5f7] px-3.5 py-2.5">
              <summary className="cursor-pointer text-sm font-medium text-zinc-900">Fine-tune print alignment</summary>
              <div className="mt-3 space-y-2.5">
                <FieldHint>
                  If your printer prints a little off-centre, nudge the whole grid. Use a negative number to move left or up. The back page is
                  mirrored automatically for flip-over printing.
                </FieldHint>
                <div className="grid grid-cols-2 gap-2.5">
                  <SheetNumber label="Shift right (mm)" value={offsetX} min={-10} max={10} onChange={setOffsetX} />
                  <SheetNumber label="Shift down (mm)" value={offsetY} min={-10} max={10} onChange={setOffsetY} />
                </div>
                {(offsetX !== 0 || offsetY !== 0) && (
                  <button type="button" onClick={() => { setOffsetX(0); setOffsetY(0); }} className={`${secondaryButtonClass} bg-white`}>
                    Reset to centred
                  </button>
                )}
              </div>
            </details>

            <div className="mt-4 space-y-1.5">
              <label className={checkRowClass}>
                <input
                  type="checkbox"
                  checked={showCropMarks}
                  onChange={(e) => setShowCropMarks(e.target.checked)}
                  className="h-5 w-5 shrink-0 accent-[#4d7c0f]"
                />
                <Scissors aria-hidden="true" className="h-4 w-4 text-zinc-600" />
                Show cut guides
              </label>
              <FieldHint>
                Small lines printed outside the cards that show exactly where to cut. They are not printed on the
                cards themselves.
              </FieldHint>
            </div>

            {canBack && (
              <div className="mt-4 space-y-1.5">
                <label className={checkRowClass}>
                  <input
                    type="checkbox"
                    checked={includeBack}
                    onChange={(e) => {
                      setIncludeBack(e.target.checked);
                      setPreviewSide(e.target.checked ? "back" : "front");
                    }}
                    className="h-5 w-5 shrink-0 accent-[#4d7c0f]"
                  />
                  Also print the back (for double-sided printing)
                </label>
                <FieldHint>Print page 1, flip the paper, then print page 2.</FieldHint>
              </div>
            )}

            {backOn && !custom && (
              <div className="mt-3 grid grid-cols-1 gap-3 rounded-2xl bg-[#f5f5f7] p-3.5">
                <fieldset>
                  <legend className={labelClass}>Back design</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {BACK_OPTIONS.map((bo) => {
                      const active = backStyle === bo.id;
                      return (
                        <label
                          key={bo.id}
                          className={`flex min-h-[44px] cursor-pointer items-start gap-2.5 rounded-xl px-3 py-2.5 text-sm transition ${
                            active ? "bg-[#eef6e4] ring-2 ring-[#4d7c0f]" : "bg-white hover:bg-[#ebeced]"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`${uid}-back`}
                            value={bo.id}
                            checked={active}
                            onChange={() => {
                              setBackStyle(bo.id);
                              setPreviewSide("back");
                            }}
                            className="mt-0.5 h-4 w-4 shrink-0 accent-[#4d7c0f]"
                          />
                          <span>
                            <span className={`block font-semibold ${active ? "text-[#365314]" : "text-zinc-900"}`}>{bo.label}</span>
                            <span className="block text-[11px] leading-snug text-zinc-600">{bo.hint}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                <div>
                  <label htmlFor="card-back-tagline" className={labelClass}>
                    Tagline (optional)
                  </label>
                  <input
                    id="card-back-tagline"
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. what you do, in a few words"
                    className={`${inputClass} bg-white`}
                  />
                </div>
                {backStyle === "logo" && !logo && (
                  <FieldHint>No logo added, so your initials are shown. Add a logo in step 1 to use it here.</FieldHint>
                )}
              </div>
            )}
          </section>

          <section aria-labelledby={`${uid}-s4`} className="space-y-3">
            <StepHeader
              id={`${uid}-s4`}
              step={downloadStep}
              title="Download & print"
              hint={
                backOn
                  ? `You'll get a 2-page PDF: fronts on page 1, backs on page 2 (${paperShort}).`
                  : `You'll get a PDF with ${cardCount} cards on one ${paperShort} page.`
              }
            />
            {downloadButton("w-full")}
            {needsUpload && (
              <FieldHint id={downloadHintId}>Upload your card design in step 1 to turn on the download.</FieldHint>
            )}
            <ToolStatus status={status} />
            <PrintTipsPanel
              paperLabel={paperShort}
              open={tipsOpen}
              extraSteps={extraSteps}
              cutStep="Cut along the crop marks with a paper trimmer for straight edges."
            />
          </section>
        </div>

        {/* ---------------- Preview ---------------- */}
        <div className="order-1 lg:order-2 lg:col-span-7 lg:sticky lg:top-24 rounded-2xl bg-white p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-sm font-bold tracking-tight text-zinc-950">Preview</h3>
            {backOn && (
              <div role="tablist" aria-label="Card side" className="inline-flex rounded-xl bg-[#f5f5f7] p-1">
                {(["front", "back"] as const).map((s) => (
                  <button
                    key={s}
                    id={`${uid}-tab-${s}`}
                    type="button"
                    role="tab"
                    aria-selected={side === s}
                    aria-controls={`${uid}-panel`}
                    onClick={() => setPreviewSide(s)}
                    className={`min-h-[36px] rounded-lg px-4 text-sm font-semibold transition cursor-pointer ${
                      side === s ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    {s === "front" ? "Front" : "Back"}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            id={`${uid}-panel`}
            {...(backOn ? { role: "tabpanel", "aria-labelledby": `${uid}-tab-${side}` } : {})}
            className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-6 sm:gap-8"
          >
            {/* Close-up of one card */}
            <figure className="w-full max-w-[360px] sm:flex-1">
              {needsUpload ? (
                <div
                  className="flex flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed border-zinc-300 bg-[#fafafa] px-4 text-center"
                  style={{ aspectRatio: `${sheet.cardW} / ${sheet.cardH}` }}
                >
                  <ImagePlus aria-hidden="true" className="h-6 w-6 text-[#3f6212]" />
                  <span className="text-sm font-semibold text-zinc-900">Your card will appear here</span>
                  <span className="text-xs text-zinc-600">Upload your design in step 1</span>
                </div>
              ) : (
                <div
                  role="region"
                  aria-label={`One business card, ${side}`}
                  className={`relative overflow-hidden rounded-md bg-white shadow-sm ${
                    "ring-1 ring-zinc-300"
                  }`}
                  style={{ aspectRatio: `${sheet.cardW} / ${sheet.cardH}`, containerType: "inline-size" }}
                >
                  {side === "front" && blankView ? (
                    <div className="h-full w-full flex items-center justify-center text-xs text-zinc-600">
                      Blank card outline
                    </div>
                  ) : (
                    cardFace(side)
                  )}
                  {custom && (
                    <CardEditorOverlay
                      W={sheet.cardW}
                      H={sheet.cardH}
                      layers={design[editSide].layers}
                      bounds={(editSide === "back" ? compiledBack : compiledFront)?.bounds ?? new Map()}
                      selectedId={selectedId}
                      onSelect={setSelectedId}
                      onChange={updateLayer}
                      onDelete={removeLayer}
                      onDuplicate={duplicateLayer}
                      onUndo={hist.undo}
                      onRedo={hist.redo}
                    />
                  )}
                </div>
              )}
              <figcaption className="mt-2 text-center text-xs text-zinc-600">
                One card, actual shape · {sheet.cardW} × {sheet.cardH} mm
                {backOn && (side === "front" ? " · page 1" : " · page 2")}
                {custom && <span className="block">Click to select · drag to move · green dot resizes · arrow keys nudge</span>}
              </figcaption>
            </figure>

            {/* Whole sheet at scale */}
            <figure className="w-[170px] sm:w-[190px] shrink-0">
              <div className="rounded-xl bg-[#f5f5f7] p-3">{sheetThumb}</div>
              <figcaption className="mt-2 text-center text-xs text-zinc-600">
                Whole page · {paperShort} · {cardCount} cards
              </figcaption>
            </figure>
          </div>
        </div>
      </div>

      <MobileActionBar summary={`${cardCount} cards · ${paperShort}${backOn ? " · 2 pages" : ""}`}>
        {downloadButton("px-4")}
      </MobileActionBar>
    </div>
  );
}
