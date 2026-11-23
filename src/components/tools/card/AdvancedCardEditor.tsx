"use client";

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  AlignCenter,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignHorizontalJustifyCenter,
  AlignLeft,
  AlignRight,
  AlignStartHorizontal,
  AlignStartVertical,
  AlignVerticalJustifyCenter,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Bold,
  Check,
  Circle,
  Copy,
  Crop,
  Download,
  Eraser,
  Eye,
  EyeOff,
  Grid3x3,
  HelpCircle,
  ImagePlus,
  Italic,
  Keyboard,
  Layers,
  LayoutTemplate,
  Lock,
  LockOpen,
  Magnet,
  Minus,
  Palette,
  Plus,
  QrCode,
  Redo2,
  RefreshCw,
  RotateCcw,
  Ruler,
  Save,
  Search,
  Shapes,
  SlidersHorizontal,
  Sparkles,
  Square,
  SquareDashed,
  Star,
  Trash2,
  Triangle,
  Type,
  Underline,
  Undo2,
  X,
} from "lucide-react";
import { fileToDataUrl, loadImageElement } from "@/lib/pdf-utils";
import { useNumberField } from "@/lib/use-number-field";
import { ensureGoogleFontsLoaded } from "./fonts";
import { CARD_ICONS, getCardIcon } from "./icons";
import { checkTextLayerContrast, findLowContrastLayers, isEdgeToEdgeOrDarkSide } from "./contrast";
import {
  hexToRgb,
  initialsOf,
  layoutCardBack,
  previewFit,
  type BackStyleId,
  type CardContent,
  type Fonts,
  type SheetPreset,
  type SheetPresetId,
} from "./engine";
import {
  buildTemplateDesign,
  compileSide,
  elsToSide,
  layerLabel,
  makeIcon,
  makeImage,
  makeLine,
  makeShape,
  makeText,
  type CardDesign,
  type GalleryTemplateId,
  type IconLayer,
  type ImageLayer,
  type Layer,
  type LineLayer,
  type ShapeLayer,
  type SideBackground,
  type TextLayer,
} from "./editor-model";
import {
  hasSeenTour,
  loadBrandColors,
  markTourSeen,
  saveBrandColors,
  type PersistedCardDesign,
} from "./export";
import { AdvancedCanvas, type LayerPatch } from "./AdvancedCanvas";
import {
  AdvancedColorPicker,
  BackgroundPanel,
  FontPicker,
  PrintExportModal,
  SaveShareModal,
  TemplateGalleryPanel,
} from "./EditorControls";
import { ImageToolsModal, type ImageEditResult } from "./ImageToolsModal";

const round2 = (n: number) => Math.round(n * 100) / 100;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

async function normalizeUploadedImage(file: File): Promise<{ src: string; ratio: number; name: string }> {
  const raw = await fileToDataUrl(file);
  const img = await loadImageElement(raw);
  const nw = img.naturalWidth || 300;
  const nh = img.naturalHeight || 150;
  const scale = Math.min(1, 1400 / Math.max(nw, nh));
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(nw * scale));
  c.height = Math.max(1, Math.round(nh * scale));
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return { src: c.toDataURL("image/png"), ratio: nw / nh, name: file.name.replace(/\.[^.]+$/, "") || "Logo" };
}

function SmallNum({
  label,
  value,
  min,
  max,
  unit = "mm",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  const id = useId();
  const f = useNumberField(round2(value), (v) => onChange(round2(v)), { min, max, unit });
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[10px] font-semibold text-zinc-600">
        {label}
      </label>
      <input
        id={id}
        type="text"
        className="h-8 w-full rounded-lg bg-[#f5f5f7] px-2 text-xs text-zinc-950 focus:bg-white focus:outline-2 focus:outline-[#4d7c0f]"
        {...f.inputProps}
      />
    </div>
  );
}

const TOUR_STEPS = [
  {
    title: "1. Add elements, templates & backgrounds",
    body: "Use the left panel to switch templates, change the card background (solid, gradient, pattern or photo), or add text, shapes, lines, icons, logos and QR codes.",
    badge: "Left panel",
  },
  {
    title: "2. Drag, resize, rotate & edit right on the card",
    body: "Click any element to move, resize or rotate it with smart snapping guides. Double-click any text box to edit words directly on the card, and keep key info inside the dashed green Safe Area.",
    badge: "Centre canvas",
  },
  {
    title: "3. Fine-tune, switch front/back & export",
    body: "Use the right panel to pick fonts, brand colours, contrast fixes, and layers. Toggle Front / Back in the top bar, then hit Download for print-ready PDF, PNG or SVG.",
    badge: "Right panel & top bar",
  },
];

export interface AdvancedCardEditorProps {
  open: boolean;
  design: CardDesign;
  activeSide: "front" | "back";
  includeBack: boolean;
  sheetId: SheetPresetId | "custom";
  customSheet: { paper: "a4" | "letter" | "a3"; cols: number; rows: number; cardW: number; cardH: number; gapX: number; gapY: number };
  sheet: SheetPreset;
  showCropMarks: boolean;
  includeBleed: boolean;
  offsetX: number;
  offsetY: number;
  templateId: GalleryTemplateId;
  accentHex: string;
  content: CardContent;
  tagline: string;
  backStyle: BackStyleId;
  logo: { src: string; w: number; h: number; name: string } | null;
  qr: { src: string; target: string } | null;
  fonts: Fonts;
  canUndo: boolean;
  canRedo: boolean;
  saveStatus: "saved" | "saving" | "unsaved";
  persistedPayload: PersistedCardDesign;
  onSetSide: (side: "front" | "back") => void;
  onToggleBack: (on: boolean) => void;
  onChangeLayer: (side: "front" | "back", id: string, patch: LayerPatch, group?: string) => void;
  onAddLayer: (side: "front" | "back", layer: Layer) => void;
  onRemoveLayer: (side: "front" | "back", id: string) => void;
  onDuplicateLayer: (side: "front" | "back", id: string) => void;
  onReorderLayer: (side: "front" | "back", id: string, mode: "up" | "down" | "front" | "back") => void;
  onSetBackground: (side: "front" | "back", bg: SideBackground, group?: string) => void;
  onReplaceSide: (side: "front" | "back", next: CardDesign["front"]) => void;
  onApplyTemplate: (templateId: GalleryTemplateId, nextDesign: CardDesign) => void;
  onPatchSilently: (side: "front" | "back", id: string, patch: Partial<ImageLayer>) => void;
  onUndo: () => void;
  onRedo: () => void;
  onChangeSheetId: (id: SheetPresetId | "custom") => void;
  onChangeCustomSheet: (patch: Partial<AdvancedCardEditorProps["customSheet"]>) => void;
  onToggleCropMarks: (on: boolean) => void;
  onToggleBleed: (on: boolean) => void;
  onLoadPayload: (payload: PersistedCardDesign) => void;
  onClose: () => void;
}

export function AdvancedCardEditor(props: AdvancedCardEditorProps) {
  const {
    open,
    design,
    activeSide,
    includeBack,
    sheetId,
    customSheet,
    sheet,
    showCropMarks,
    includeBleed,
    offsetX,
    offsetY,
    templateId,
    accentHex,
    content,
    tagline,
    backStyle,
    logo,
    qr,
    fonts,
    canUndo,
    canRedo,
    saveStatus,
    persistedPayload,
    onSetSide,
    onToggleBack,
    onChangeLayer,
    onAddLayer,
    onRemoveLayer,
    onDuplicateLayer,
    onReorderLayer,
    onSetBackground,
    onReplaceSide,
    onApplyTemplate,
    onPatchSilently,
    onUndo,
    onRedo,
    onChangeSheetId,
    onChangeCustomSheet,
    onToggleCropMarks,
    onToggleBleed,
    onLoadPayload,
    onClose,
  } = props;

  const W = sheet.cardW;
  const H = sheet.cardH;
  const sideDesign = design[activeSide];

  const [leftTab, setLeftTab] = useState<"add" | "templates" | "background">("add");
  const [rightTab, setRightTab] = useState<"properties" | "layers">("properties");
  const [mobileSheet, setMobileSheet] = useState<"none" | "add" | "properties" | "layers" | "background" | "templates">("none");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [snapEnabled, setSnapEnabled] = useState<boolean>(true);
  const [iconQuery, setIconQuery] = useState<string>("");
  const [brandColors, setBrandColors] = useState<string[]>(() => loadBrandColors(accentHex));
  const [eyedropperCb, setEyedropperCb] = useState<((hex: string) => void) | null>(null);
  const [imageModal, setImageModal] = useState<{ layerId: string; tab: "bg" | "crop" } | null>(null);
  const [exportOpen, setExportOpen] = useState<boolean>(false);
  const [saveOpen, setSaveOpen] = useState<boolean>(false);
  const [shortcutsOpen, setShortcutsOpen] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const imageUploadRef = useRef<HTMLInputElement>(null);
  const replaceImgRef = useRef<HTMLInputElement>(null);
  const uid = useId();

  // Load Google Fonts & trigger first-time beginner tour once when editor opens
  useEffect(() => {
    if (!open) return;
    ensureGoogleFontsLoaded();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!hasSeenTour()) {
      const id = window.setTimeout(() => setTourStep(0), 180);
      return () => {
        window.clearTimeout(id);
        document.body.style.overflow = prevOverflow;
      };
    }
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Keep toast brief
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  // Regenerate QR data URL whenever a QR layer's qrText or colors change
  const pendingQrs = useMemo(() => {
    const out: Array<{ side: "front" | "back"; id: string; text: string; fg: string; bg: string; sig: string }> = [];
    for (const s of ["front", "back"] as const) {
      for (const l of design[s].layers) {
        if (l.kind === "image" && l.qrText !== undefined) {
          const text = l.qrText.trim();
          const fg = l.qrFg || "#09090b";
          const bg = l.qrBg || "#ffffff";
          const sig = `${text}|${fg}|${bg}`;
          if (text && l.qrFor !== sig) {
            out.push({ side: s, id: l.id, text, fg, bg, sig });
          }
        }
      }
    }
    return out;
  }, [design]);

  const pendingQrKey = pendingQrs.map((q) => `${q.side}:${q.id}:${q.sig}`).join("||");
  useEffect(() => {
    if (!open || !pendingQrs.length) return;
    let cancelled = false;
    void import("qrcode").then(async (QR) => {
      for (const item of pendingQrs) {
        try {
          const src = await QR.toDataURL(item.text, {
            width: 480,
            margin: 1,
            color: { dark: item.fg, light: item.bg },
          });
          if (!cancelled) onPatchSilently(item.side, item.id, { src, qrFor: item.sig });
        } catch {
          if (!cancelled) onPatchSilently(item.side, item.id, { qrFor: item.sig });
        }
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pendingQrKey]);

  const compiled = useMemo(() => compileSide(sideDesign, W, H, previewFit), [sideDesign, W, H]);
  const selectedLayer = useMemo(() => sideDesign.layers.find((l) => l.id === selectedId) ?? null, [sideDesign.layers, selectedId]);
  const selectedBox = selectedLayer ? (compiled.bounds.get(selectedLayer.id) ?? selectedLayer) : null;
  const lowContrastList = useMemo(() => findLowContrastLayers(sideDesign, compiled.bounds), [sideDesign, compiled.bounds]);
  const edgeInfo = useMemo(() => isEdgeToEdgeOrDarkSide(sideDesign, W, H), [sideDesign, W, H]);

  // Global keyboard shortcuts inside the full-screen editor
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inInput =
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable);

      if (e.key === "Escape") {
        if (eyedropperCb) {
          setEyedropperCb(null);
          return;
        }
        if (editingTextId) {
          setEditingTextId(null);
          return;
        }
        if (imageModal) {
          setImageModal(null);
          return;
        }
        if (exportOpen) {
          setExportOpen(false);
          return;
        }
        if (saveOpen) {
          setSaveOpen(false);
          return;
        }
        if (shortcutsOpen) {
          setShortcutsOpen(false);
          return;
        }
        if (selectedId) {
          setSelectedId(null);
          return;
        }
      }

      if (inInput) return;

      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) onRedo();
        else onUndo();
        return;
      }
      if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        onRedo();
        return;
      }
      if (mod && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        setZoom((z) => clamp(round2(z + 0.15), 0.5, 2.5));
        return;
      }
      if (mod && e.key === "-") {
        e.preventDefault();
        setZoom((z) => clamp(round2(z - 0.15), 0.5, 2.5));
        return;
      }
      if (mod && e.key === "0") {
        e.preventDefault();
        setZoom(1);
        return;
      }

      if (!selectedLayer) return;

      if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        onDuplicateLayer(activeSide, selectedLayer.id);
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && !selectedLayer.locked) {
        e.preventDefault();
        onRemoveLayer(activeSide, selectedLayer.id);
        setSelectedId(null);
        return;
      }
      if (e.key.startsWith("Arrow") && !selectedLayer.locked) {
        e.preventDefault();
        const step = e.shiftKey ? 2 : e.altKey ? 0.1 : 0.5;
        const patch: LayerPatch = {};
        if (e.key === "ArrowLeft") patch.x = round2(selectedLayer.x - step);
        if (e.key === "ArrowRight") patch.x = round2(selectedLayer.x + step);
        if (e.key === "ArrowUp") patch.y = round2(selectedLayer.y - step);
        if (e.key === "ArrowDown") patch.y = round2(selectedLayer.y + step);
        onChangeLayer(activeSide, selectedLayer.id, patch, `nudge-${selectedLayer.id}`);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    open,
    activeSide,
    selectedId,
    selectedLayer,
    editingTextId,
    eyedropperCb,
    imageModal,
    exportOpen,
    saveOpen,
    shortcutsOpen,
    onUndo,
    onRedo,
    onDuplicateLayer,
    onRemoveLayer,
    onChangeLayer,
  ]);

  const handleAddBrandColor = useCallback((hex: string) => {
    setBrandColors((prev) => {
      if (prev.some((c) => c.toLowerCase() === hex.toLowerCase())) return prev;
      const next = [hex, ...prev].slice(0, 12);
      saveBrandColors(next);
      return next;
    });
  }, []);

  const handleRemoveBrandColor = useCallback((hex: string) => {
    setBrandColors((prev) => {
      const next = prev.filter((c) => c.toLowerCase() !== hex.toLowerCase());
      saveBrandColors(next);
      return next;
    });
  }, []);

  const addAndSelect = useCallback(
    (layer: Layer) => {
      onAddLayer(activeSide, layer);
      setSelectedId(layer.id);
      setRightTab("properties");
    },
    [activeSide, onAddLayer]
  );

  const handleUploadImageLayer = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      try {
        const { src, ratio, name } = await normalizeUploadedImage(file);
        const w = ratio >= 1 ? 24 : 24 * ratio;
        const h = w / ratio;
        addAndSelect(
          makeImage(src, ratio, name, {
            isLogo: true,
            x: round2((W - w) / 2),
            y: round2((H - h) / 2),
            w: round2(w),
            h: round2(h),
          })
        );
        setToast("Image added! Tip: Use 'Remove background' or 'Crop' in the right panel.");
      } catch {
        setToast("Could not read that image. Try a PNG, JPG, WebP or SVG.");
      }
    },
    [W, H, addAndSelect]
  );

  const handleReplaceSelectedImage = useCallback(
    async (file: File | undefined) => {
      if (!file || !selectedLayer || selectedLayer.kind !== "image") return;
      try {
        const { src, ratio, name } = await normalizeUploadedImage(file);
        const nextH = round2(selectedLayer.w / ratio);
        onChangeLayer(activeSide, selectedLayer.id, { src, originalSrc: src, ratio, name, h: nextH });
        setToast("Image replaced.");
      } catch {
        setToast("Could not read that image.");
      }
    },
    [activeSide, onChangeLayer, selectedLayer]
  );

  const handleApplyImageTools = useCallback(
    (result: ImageEditResult) => {
      if (!imageModal) return;
      const target = sideDesign.layers.find((l): l is ImageLayer => l.id === imageModal.layerId && l.kind === "image");
      if (!target) {
        setImageModal(null);
        return;
      }
      const nextH = round2(target.w / result.ratio);
      onChangeLayer(activeSide, target.id, {
        src: result.src,
        originalSrc: result.originalSrc,
        ratio: result.ratio,
        h: nextH,
        name: result.name ?? target.name,
      });
      setImageModal(null);
      setToast("Image updated!");
    },
    [activeSide, imageModal, onChangeLayer, sideDesign.layers]
  );

  const applyTemplateById = useCallback(
    (tplId: GalleryTemplateId) => {
      const next = buildTemplateDesign({
        templateId: tplId,
        W,
        H,
        accentHex,
        content,
        tagline,
        backStyle,
        logo,
        qr,
        fit: previewFit,
        fonts,
      });
      onApplyTemplate(tplId, next);
      setSelectedId(null);
      setEditingTextId(null);
      setToast("Template applied. Press Undo anytime to revert.");
    },
    [W, H, accentHex, content, tagline, backStyle, logo, qr, fonts, onApplyTemplate]
  );

  const applyBackQuickStarter = (preset: "logo" | "qr" | "tagline" | "solid" | "blank") => {
    if (preset === "blank") {
      onReplaceSide("back", { bg: "#ffffff", background: { type: "solid", color: "#ffffff" }, layers: [] });
      setSelectedId(null);
      return;
    }
    if (preset === "qr") {
      const target = qr?.target || (content.website ? `https://${content.website.replace(/^https?:\/\//i, "")}` : "https://example.com");
      const layers: Layer[] = [
        makeImage(qr?.src || "", 1, "QR code", {
          fieldKey: "qr",
          x: round2(W / 2 - 11),
          y: round2(H / 2 - 14),
          w: 22,
          h: 22,
          qrText: target,
          qrFor: qr?.src ? `${target}|#09090b|#ffffff` : undefined,
          qrFg: "#09090b",
          qrBg: "#ffffff",
        }),
        makeText({
          name: "Website",
          fieldKey: "website",
          text: content.website || content.company || "Scan to connect",
          x: 8,
          y: round2(H / 2 + 10.5),
          w: W - 16,
          size: 7.5,
          bold: true,
          align: "center",
          color: "#27272a",
          fontId: "inter",
          family: "helvetica",
        }),
      ];
      onReplaceSide("back", { bg: "#ffffff", background: { type: "solid", color: "#ffffff" }, layers });
      setSelectedId(null);
      return;
    }
    const backContent = {
      title: content.company.trim() || content.fullName.trim(),
      tagline: tagline.trim(),
      website: content.website.trim(),
      initials: initialsOf(content.fullName, content.company),
    };
    const els = layoutCardBack(W, H, preset, hexToRgb(accentHex), backContent, logo, previewFit, fonts);
    onReplaceSide(
      "back",
      elsToSide(els, W, H, {
        logo: logo ? { src: logo.src, w: logo.w, h: logo.h } : undefined,
      })
    );
    setSelectedId(null);
  };

  const filteredIcons = useMemo(() => {
    const q = iconQuery.trim().toLowerCase();
    if (!q) return CARD_ICONS;
    return CARD_ICONS.filter((ic) => ic.label.toLowerCase().includes(q) || ic.category.includes(q) || ic.id.includes(q));
  }, [iconQuery]);

  if (!open || typeof document === "undefined") return null;

  const setSel = (patch: LayerPatch, group?: string) => {
    if (selectedLayer) onChangeLayer(activeSide, selectedLayer.id, patch, group);
  };

  const selectedIdx = selectedLayer ? sideDesign.layers.findIndex((l) => l.id === selectedLayer.id) : -1;
  const selectedContrast =
    selectedLayer && selectedLayer.kind === "text" ? checkTextLayerContrast(selectedLayer, sideDesign, compiled.bounds) : null;
  const selectedFittedPt =
    selectedLayer && selectedLayer.kind === "text" ? compiled.fittedSizes.get(selectedLayer.id) ?? selectedLayer.size : null;

  /* ---------------- Reusable Panel Sections (Desktop + Mobile Sheet) ---------------- */

  const renderAddContent = () => (
    <div className="space-y-4">
      {/* Text presets */}
      <div>
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Text</p>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() =>
              addAndSelect(
                makeText({
                  name: "Heading",
                  text: "Add a heading",
                  size: 13,
                  bold: true,
                  fontId: "inter",
                  x: 8,
                  y: round2(H / 2 - 5),
                  w: W - 16,
                })
              )
            }
            className="flex w-full items-center gap-2.5 rounded-xl bg-[#f5f5f7] px-3 py-2.5 text-left hover:bg-[#eef6e4] transition cursor-pointer"
          >
            <Type className="h-4 w-4 shrink-0 text-[#4d7c0f]" />
            <span>
              <span className="block text-sm font-bold text-zinc-950">Add a heading</span>
              <span className="block text-[10px] text-zinc-500">Large bold name or title</span>
            </span>
          </button>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() =>
                addAndSelect(
                  makeText({
                    name: "Subheading",
                    text: "Subheading",
                    size: 9,
                    bold: true,
                    color: accentHex,
                    fontId: "inter",
                    x: 8,
                    y: round2(H / 2 - 2),
                    w: W - 16,
                  })
                )
              }
              className="rounded-xl bg-[#f5f5f7] px-2.5 py-2 text-xs font-semibold text-zinc-800 hover:bg-[#eef6e4] cursor-pointer"
            >
              Subheading
            </button>
            <button
              type="button"
              onClick={() =>
                addAndSelect(
                  makeText({
                    name: "Body text",
                    text: "Contact detail or note",
                    size: 7.5,
                    fontId: "inter",
                    x: 8,
                    y: round2(H / 2 + 3),
                    w: W - 16,
                  })
                )
              }
              className="rounded-xl bg-[#f5f5f7] px-2.5 py-2 text-xs font-medium text-zinc-800 hover:bg-[#eef6e4] cursor-pointer"
            >
              Body text
            </button>
          </div>
        </div>
      </div>

      {/* Logo / Image & QR */}
      <div>
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Logo, Image &amp; QR</p>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => imageUploadRef.current?.click()}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-[#f5f5f7] p-3 text-center hover:bg-[#eef6e4] transition cursor-pointer"
          >
            <ImagePlus className="h-5 w-5 text-[#4d7c0f]" />
            <span className="text-xs font-semibold text-zinc-900">Logo / Image</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const target =
                qr?.target ||
                (content.website.trim()
                  ? /^https?:\/\//i.test(content.website.trim())
                    ? content.website.trim()
                    : `https://${content.website.trim()}`
                  : content.email.trim()
                    ? `mailto:${content.email.trim()}`
                    : "https://example.com");
              addAndSelect(
                makeImage("", 1, "QR code", {
                  fieldKey: "qr",
                  x: round2(W - 22),
                  y: round2(H - 22),
                  w: 16,
                  h: 16,
                  qrText: target,
                  qrFg: "#09090b",
                  qrBg: "#ffffff",
                })
              );
            }}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-[#f5f5f7] p-3 text-center hover:bg-[#eef6e4] transition cursor-pointer"
          >
            <QrCode className="h-5 w-5 text-[#4d7c0f]" />
            <span className="text-xs font-semibold text-zinc-900">QR Code</span>
          </button>
        </div>
      </div>

      {/* Shapes */}
      <div>
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Shapes</p>
        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              ["rect", "Box", Square],
              ["rounded-rect", "Rounded", Square],
              ["ellipse", "Circle", Circle],
              ["frame", "Outline", SquareDashed],
              ["triangle", "Triangle", Triangle],
              ["star", "Star", Star],
            ] as const
          ).map(([kind, label, Icon]) => (
            <button
              key={kind}
              type="button"
              onClick={() =>
                addAndSelect(
                  makeShape(kind, accentHex, {
                    x: kind === "frame" ? 3 : round2(W / 2 - 10),
                    y: kind === "frame" ? 3 : round2(H / 2 - 8),
                    w: kind === "frame" ? W - 6 : kind === "ellipse" || kind === "star" || kind === "triangle" ? 16 : 22,
                    h: kind === "frame" ? H - 6 : kind === "ellipse" || kind === "star" || kind === "triangle" ? 16 : 14,
                    radius: kind === "rounded-rect" ? 2.5 : 0,
                  })
                )
              }
              className="flex flex-col items-center justify-center gap-1 rounded-xl bg-[#f5f5f7] py-2.5 text-[11px] font-semibold text-zinc-800 hover:bg-[#eef6e4] cursor-pointer"
            >
              <Icon className={`h-4 w-4 text-zinc-700 ${kind === "rounded-rect" ? "rounded" : ""}`} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Lines */}
      <div>
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Lines &amp; dividers</p>
        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              ["solid", "Solid"],
              ["dashed", "Dashed"],
              ["dotted", "Dotted"],
            ] as const
          ).map(([dash, label]) => (
            <button
              key={dash}
              type="button"
              onClick={() =>
                addAndSelect(
                  makeLine(accentHex, {
                    dash,
                    x: round2(W / 2 - 18),
                    y: round2(H / 2 - 1),
                    w: 36,
                    h: 2,
                    strokeW: 0.5,
                  })
                )
              }
              className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-[#f5f5f7] py-2.5 text-[11px] font-semibold text-zinc-800 hover:bg-[#eef6e4] cursor-pointer"
            >
              <span
                className="block w-8 border-t-2 border-zinc-700"
                style={{ borderTopStyle: dash }}
              />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Icons */}
      <div>
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Icons</p>
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={iconQuery}
            onChange={(e) => setIconQuery(e.target.value)}
            placeholder="Search icons (phone, mail, star…)"
            className="h-8 w-full rounded-xl bg-[#f5f5f7] pl-8 pr-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-2 focus:outline-[#4d7c0f]"
          />
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {filteredIcons.map((ic) => (
            <button
              key={ic.id}
              type="button"
              title={`Add ${ic.label} icon`}
              onClick={() =>
                addAndSelect(
                  makeIcon(ic.id, accentHex, ic.label, {
                    x: round2(W / 2 - 3),
                    y: round2(H / 2 - 3),
                    w: 5.5,
                    h: 5.5,
                  })
                )
              }
              className="flex flex-col items-center justify-center gap-1 rounded-xl bg-[#f5f5f7] p-2 hover:bg-[#eef6e4] transition cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-zinc-800" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                {ic.paths.map((d, i) => (
                  <path key={i} d={d} />
                ))}
                {ic.circles?.map(([cx, cy, r], i) => (
                  <circle key={i} cx={cx} cy={cy} r={r} />
                ))}
              </svg>
              <span className="w-full truncate text-center text-[9px] font-medium text-zinc-600">{ic.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBackgroundContent = () => (
    <div className="space-y-4">
      {activeSide === "back" && (
        <div className="space-y-2 rounded-2xl bg-[#eef6e4] p-3">
          <p className="text-xs font-bold text-[#365314]">Quick back-side layouts</p>
          <p className="text-[11px] text-[#3f6212]">Start the back with a centred logo, QR code, tagline, or solid colour.</p>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {(
              [
                ["logo", "Logo centred"],
                ["qr", "QR + website"],
                ["tagline", "Dark tagline"],
                ["solid", "Solid colour"],
              ] as const
            ).map(([preset, lbl]) => (
              <button
                key={preset}
                type="button"
                onClick={() => applyBackQuickStarter(preset)}
                className="rounded-xl bg-white px-2.5 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-50 ring-1 ring-[#4d7c0f]/20 cursor-pointer"
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>
      )}
      <BackgroundPanel
        side={sideDesign}
        sideName={activeSide}
        brandColors={brandColors}
        onSetBackground={(bg, group) => onSetBackground(activeSide, bg, group)}
        onAddBrandColor={handleAddBrandColor}
        onRemoveBrandColor={handleRemoveBrandColor}
        onRequestEyedropper={(cb) => setEyedropperCb(() => cb)}
        onError={(m) => setToast(m)}
      />
    </div>
  );

  const renderTemplatesContent = () => (
    <TemplateGalleryPanel
      activeTemplateId={templateId}
      W={W}
      H={H}
      accentHex={accentHex}
      content={content}
      tagline={tagline}
      backStyle={backStyle}
      logo={logo}
      qr={qr}
      fonts={fonts}
      onApplyTemplate={applyTemplateById}
      onResetCurrent={() => applyTemplateById(templateId)}
    />
  );

  const renderPropertiesContent = () => {
    if (!selectedLayer || !selectedBox) {
      return (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#f5f5f7] p-3.5 text-xs leading-relaxed text-zinc-600">
            <p className="font-bold text-zinc-900">No element selected</p>
            <p className="mt-1">
              Click any item on the card to edit its font, colour, rotation or opacity — or customize the card background below.
            </p>
          </div>
          {renderBackgroundContent()}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Selected header + quick layer actions */}
        <div className="flex items-center justify-between gap-2 border-b border-zinc-100 pb-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-zinc-950">{layerLabel(selectedLayer)}</p>
            <p className="text-[10px] capitalize text-zinc-500">
              {selectedLayer.kind === "image" && selectedLayer.qrText !== undefined ? "QR Code" : selectedLayer.kind}
              {selectedLayer.locked ? " · Locked" : ""}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Duplicate (Ctrl/Cmd+D)"
              onClick={() => onDuplicateLayer(activeSide, selectedLayer.id)}
              className="grid h-8 w-8 place-items-center rounded-lg bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced] cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title={selectedLayer.locked ? "Unlock" : "Lock position"}
              onClick={() => setSel({ locked: !selectedLayer.locked })}
              className={`grid h-8 w-8 place-items-center rounded-lg cursor-pointer ${
                selectedLayer.locked ? "bg-amber-100 text-amber-800" : "bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced]"
              }`}
            >
              {selectedLayer.locked ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              title="Delete (Del)"
              onClick={() => {
                onRemoveLayer(activeSide, selectedLayer.id);
                setSelectedId(null);
              }}
              className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-700 hover:bg-red-100 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* TEXT PROPERTIES */}
        {selectedLayer.kind === "text" && (
          <div className="space-y-3.5">
            <div>
              <label htmlFor={`${uid}-txt`} className="mb-1 block text-[11px] font-semibold text-zinc-700">
                Text content
              </label>
              <textarea
                id={`${uid}-txt`}
                rows={2}
                value={selectedLayer.text}
                onChange={(e) => setSel({ text: e.target.value }, `txt-${selectedLayer.id}`)}
                className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs text-zinc-950 focus:bg-white focus:outline-2 focus:outline-[#4d7c0f]"
              />
            </div>

            <div>
              <p className="mb-1 text-[11px] font-semibold text-zinc-700">Font</p>
              <FontPicker
                value={selectedLayer.fontId ?? selectedLayer.family}
                sampleText={selectedLayer.text}
                onChange={(fontId, pdfFallback) => setSel({ fontId, family: pdfFallback } as Partial<TextLayer>)}
              />
            </div>

            {/* Size + Auto-fit */}
            <div className="space-y-2">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <SmallNum
                    label="Font size (pt)"
                    unit="pt"
                    value={selectedLayer.size}
                    min={4}
                    max={72}
                    onChange={(size) => setSel({ size } as Partial<TextLayer>, `sz-${selectedLayer.id}`)}
                  />
                </div>
                <button
                  type="button"
                  aria-label="Decrease font size"
                  onClick={() => setSel({ size: round2(clamp(selectedLayer.size - 0.5, 4, 72)) } as Partial<TextLayer>)}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced] cursor-pointer"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Increase font size"
                  onClick={() => setSel({ size: round2(clamp(selectedLayer.size + 0.5, 4, 72)) } as Partial<TextLayer>)}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced] cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <label className="flex cursor-pointer items-center justify-between gap-2 rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-zinc-800">
                  <Sparkles className="h-3.5 w-3.5 text-[#4d7c0f]" />
                  Auto-fit long text
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(selectedLayer.autoFit)}
                  onChange={(e) => setSel({ autoFit: e.target.checked } as Partial<TextLayer>)}
                  className="h-4 w-4 accent-[#4d7c0f]"
                />
              </label>
              {selectedLayer.autoFit && selectedFittedPt !== null && selectedFittedPt < selectedLayer.size - 0.1 && (
                <p className="text-[11px] font-medium text-[#365314]">
                  Auto-fitted to {selectedFittedPt.toFixed(1)} pt so it won&rsquo;t overflow the box.
                </p>
              )}
            </div>

            {/* Style & Alignment toggles */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-zinc-700">Style &amp; alignment</p>
              <div className="grid grid-cols-7 gap-1">
                <button
                  type="button"
                  title="Bold"
                  aria-pressed={selectedLayer.bold}
                  onClick={() => setSel({ bold: !selectedLayer.bold } as Partial<TextLayer>)}
                  className={`grid h-8 place-items-center rounded-lg cursor-pointer ${
                    selectedLayer.bold ? "bg-[#4d7c0f] text-white" : "bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced]"
                  }`}
                >
                  <Bold className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Italic"
                  aria-pressed={selectedLayer.italic}
                  onClick={() => setSel({ italic: !selectedLayer.italic } as Partial<TextLayer>)}
                  className={`grid h-8 place-items-center rounded-lg cursor-pointer ${
                    selectedLayer.italic ? "bg-[#4d7c0f] text-white" : "bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced]"
                  }`}
                >
                  <Italic className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Underline"
                  aria-pressed={Boolean(selectedLayer.underline)}
                  onClick={() => setSel({ underline: !selectedLayer.underline } as Partial<TextLayer>)}
                  className={`grid h-8 place-items-center rounded-lg cursor-pointer ${
                    selectedLayer.underline ? "bg-[#4d7c0f] text-white" : "bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced]"
                  }`}
                >
                  <Underline className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="UPPERCASE"
                  aria-pressed={Boolean(selectedLayer.uppercase)}
                  onClick={() => setSel({ uppercase: !selectedLayer.uppercase } as Partial<TextLayer>)}
                  className={`grid h-8 place-items-center rounded-lg text-[10px] font-bold cursor-pointer ${
                    selectedLayer.uppercase ? "bg-[#4d7c0f] text-white" : "bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced]"
                  }`}
                >
                  AA
                </button>
                {(
                  [
                    ["left", AlignLeft],
                    ["center", AlignCenter],
                    ["right", AlignRight],
                  ] as const
                ).map(([al, Icon]) => (
                  <button
                    key={al}
                    type="button"
                    title={`Align ${al}`}
                    aria-pressed={selectedLayer.align === al}
                    onClick={() => setSel({ align: al } as Partial<TextLayer>)}
                    className={`grid h-8 place-items-center rounded-lg cursor-pointer ${
                      selectedLayer.align === al ? "bg-[#4d7c0f] text-white" : "bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced]"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Text Colour + Live WCAG Contrast Check */}
            <AdvancedColorPicker
              label="Text colour"
              value={selectedLayer.color}
              brandColors={brandColors}
              onChange={(color) => setSel({ color } as Partial<TextLayer>, `col-${selectedLayer.id}`)}
              onAddBrandColor={handleAddBrandColor}
              onRemoveBrandColor={handleRemoveBrandColor}
              onRequestCanvasEyedropper={(cb) => setEyedropperCb(() => cb)}
            />

            {selectedContrast && selectedContrast.level === "warn" && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-2.5 text-[11px] text-amber-950">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="font-semibold">
                    Low readability ({selectedContrast.ratio.toFixed(1)}:1 contrast)
                  </p>
                  <p className="text-amber-900">This text may look faint on the background when printed.</p>
                  <button
                    type="button"
                    onClick={() => setSel({ color: selectedContrast.suggestedHex } as Partial<TextLayer>)}
                    className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-zinc-950 hover:bg-amber-600 cursor-pointer"
                  >
                    Fix contrast automatically
                  </button>
                </div>
              </div>
            )}

            {/* Letter & line spacing */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 flex justify-between text-[10px] font-semibold text-zinc-600">
                  <span>Letter spacing</span>
                  <span className="font-mono">{selectedLayer.track.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={0.45}
                  step={0.01}
                  value={selectedLayer.track}
                  onChange={(e) => setSel({ track: Number(e.target.value) } as Partial<TextLayer>, `tr-${selectedLayer.id}`)}
                  className="w-full accent-[#4d7c0f]"
                />
              </div>
              <div>
                <label className="mb-1 flex justify-between text-[10px] font-semibold text-zinc-600">
                  <span>Line spacing</span>
                  <span className="font-mono">{selectedLayer.leading.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min={0.9}
                  max={2}
                  step={0.05}
                  value={selectedLayer.leading}
                  onChange={(e) => setSel({ leading: Number(e.target.value) } as Partial<TextLayer>, `ld-${selectedLayer.id}`)}
                  className="w-full accent-[#4d7c0f]"
                />
              </div>
            </div>
          </div>
        )}

        {/* SHAPE PROPERTIES */}
        {(selectedLayer.kind === "rect" ||
          selectedLayer.kind === "rounded-rect" ||
          selectedLayer.kind === "ellipse" ||
          selectedLayer.kind === "frame" ||
          selectedLayer.kind === "triangle" ||
          selectedLayer.kind === "star") && (
          <div className="space-y-3.5">
            <AdvancedColorPicker
              label={selectedLayer.kind === "frame" ? "Outline colour" : "Fill colour"}
              value={selectedLayer.color}
              brandColors={brandColors}
              onChange={(color) => setSel({ color } as Partial<ShapeLayer>, `sc-${selectedLayer.id}`)}
              onAddBrandColor={handleAddBrandColor}
              onRemoveBrandColor={handleRemoveBrandColor}
              onRequestCanvasEyedropper={(cb) => setEyedropperCb(() => cb)}
            />
            {selectedLayer.kind === "frame" && (
              <div>
                <label className="mb-1 flex justify-between text-[11px] font-semibold text-zinc-700">
                  <span>Border thickness</span>
                  <span className="font-mono text-zinc-500">{selectedLayer.strokeW.toFixed(1)} mm</span>
                </label>
                <input
                  type="range"
                  min={0.15}
                  max={3}
                  step={0.05}
                  value={selectedLayer.strokeW}
                  onChange={(e) => setSel({ strokeW: Number(e.target.value) } as Partial<ShapeLayer>, `sw-${selectedLayer.id}`)}
                  className="w-full accent-[#4d7c0f]"
                />
              </div>
            )}
            {(selectedLayer.kind === "rect" || selectedLayer.kind === "rounded-rect" || selectedLayer.kind === "frame") && (
              <div>
                <label className="mb-1 flex justify-between text-[11px] font-semibold text-zinc-700">
                  <span>Corner roundness</span>
                  <span className="font-mono text-zinc-500">{(selectedLayer.radius ?? 0).toFixed(1)} mm</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={12}
                  step={0.5}
                  value={selectedLayer.radius ?? 0}
                  onChange={(e) => setSel({ radius: Number(e.target.value) } as Partial<ShapeLayer>, `rad-${selectedLayer.id}`)}
                  className="w-full accent-[#4d7c0f]"
                />
              </div>
            )}
          </div>
        )}

        {/* LINE PROPERTIES */}
        {selectedLayer.kind === "line" && (
          <div className="space-y-3.5">
            <AdvancedColorPicker
              label="Line colour"
              value={selectedLayer.color}
              brandColors={brandColors}
              onChange={(color) => setSel({ color } as Partial<LineLayer>, `lc-${selectedLayer.id}`)}
              onAddBrandColor={handleAddBrandColor}
              onRemoveBrandColor={handleRemoveBrandColor}
              onRequestCanvasEyedropper={(cb) => setEyedropperCb(() => cb)}
            />
            <div>
              <label className="mb-1 flex justify-between text-[11px] font-semibold text-zinc-700">
                <span>Line thickness</span>
                <span className="font-mono text-zinc-500">{selectedLayer.strokeW.toFixed(2)} mm</span>
              </label>
              <input
                type="range"
                min={0.2}
                max={4}
                step={0.1}
                value={selectedLayer.strokeW}
                onChange={(e) => setSel({ strokeW: Number(e.target.value) } as Partial<LineLayer>, `lw-${selectedLayer.id}`)}
                className="w-full accent-[#4d7c0f]"
              />
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(["solid", "dashed", "dotted"] as const).map((dash) => (
                <button
                  key={dash}
                  type="button"
                  onClick={() => setSel({ dash } as Partial<LineLayer>)}
                  className={`rounded-xl py-1.5 text-xs font-semibold capitalize cursor-pointer ${
                    (selectedLayer.dash ?? "solid") === dash ? "bg-[#4d7c0f] text-white" : "bg-[#f5f5f7] text-zinc-700"
                  }`}
                >
                  {dash}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ICON PROPERTIES */}
        {selectedLayer.kind === "icon" && (
          <div className="space-y-3.5">
            <AdvancedColorPicker
              label="Icon colour"
              value={selectedLayer.color}
              brandColors={brandColors}
              onChange={(color) => setSel({ color } as Partial<IconLayer>, `ic-${selectedLayer.id}`)}
              onAddBrandColor={handleAddBrandColor}
              onRemoveBrandColor={handleRemoveBrandColor}
              onRequestCanvasEyedropper={(cb) => setEyedropperCb(() => cb)}
            />
            <div>
              <label className="mb-1 flex justify-between text-[11px] font-semibold text-zinc-700">
                <span>Line weight</span>
                <span className="font-mono text-zinc-500">{(selectedLayer.strokeW ?? 2).toFixed(1)}</span>
              </label>
              <input
                type="range"
                min={1}
                max={3.5}
                step={0.25}
                value={selectedLayer.strokeW ?? 2}
                onChange={(e) => setSel({ strokeW: Number(e.target.value) } as Partial<IconLayer>, `iw-${selectedLayer.id}`)}
                className="w-full accent-[#4d7c0f]"
              />
            </div>
          </div>
        )}

        {/* IMAGE / LOGO / QR PROPERTIES */}
        {selectedLayer.kind === "image" && (
          <div className="space-y-3.5">
            {selectedLayer.qrText !== undefined ? (
              <>
                <div>
                  <label htmlFor={`${uid}-qr-url`} className="mb-1 block text-[11px] font-semibold text-zinc-700">
                    QR destination link or text
                  </label>
                  <input
                    id={`${uid}-qr-url`}
                    type="text"
                    value={selectedLayer.qrText}
                    onChange={(e) => setSel({ qrText: e.target.value } as Partial<ImageLayer>, `qr-${selectedLayer.id}`)}
                    placeholder="https://your-website.com"
                    className="h-9 w-full rounded-xl bg-[#f5f5f7] px-3 text-xs text-zinc-950 focus:bg-white focus:outline-2 focus:outline-[#4d7c0f]"
                  />
                </div>
                <AdvancedColorPicker
                  compact
                  label="QR code colour"
                  value={selectedLayer.qrFg || "#09090b"}
                  brandColors={brandColors}
                  onChange={(qrFg) => setSel({ qrFg } as Partial<ImageLayer>, `qrf-${selectedLayer.id}`)}
                  onAddBrandColor={handleAddBrandColor}
                  onRemoveBrandColor={handleRemoveBrandColor}
                  onRequestCanvasEyedropper={(cb) => setEyedropperCb(() => cb)}
                />
                <AdvancedColorPicker
                  compact
                  label="QR backdrop"
                  value={selectedLayer.qrBg || "#ffffff"}
                  brandColors={brandColors}
                  onChange={(qrBg) => setSel({ qrBg } as Partial<ImageLayer>, `qrb-${selectedLayer.id}`)}
                  onAddBrandColor={handleAddBrandColor}
                  onRemoveBrandColor={handleRemoveBrandColor}
                  onRequestCanvasEyedropper={(cb) => setEyedropperCb(() => cb)}
                />
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setImageModal({ layerId: selectedLayer.id, tab: "bg" })}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#eef6e4] px-3 py-2.5 text-xs font-bold text-[#365314] hover:bg-[#dff0c8] cursor-pointer"
                  >
                    <Eraser className="h-4 w-4" />
                    Remove background
                  </button>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setImageModal({ layerId: selectedLayer.id, tab: "crop" })}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-[#ebeced] cursor-pointer"
                    >
                      <Crop className="h-3.5 w-3.5" />
                      Crop
                    </button>
                    <button
                      type="button"
                      onClick={() => replaceImgRef.current?.click()}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-[#ebeced] cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Replace
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1 flex justify-between text-[11px] font-semibold text-zinc-700">
                    <span>Corner roundness</span>
                    <span className="font-mono text-zinc-500">{(selectedLayer.radius ?? 0).toFixed(1)} mm</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={Math.round(Math.min(selectedLayer.w, selectedLayer.h) / 2)}
                    step={0.5}
                    value={selectedLayer.radius ?? 0}
                    onChange={(e) => setSel({ radius: Number(e.target.value) } as Partial<ImageLayer>, `irad-${selectedLayer.id}`)}
                    className="w-full accent-[#4d7c0f]"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* ALIGNMENT & CENTRING */}
        <div className="space-y-2 border-t border-zinc-100 pt-3">
          <p className="text-[11px] font-semibold text-zinc-700">Align on card</p>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setSel({ x: round2((W - selectedBox.w) / 2) })}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#f5f5f7] py-2 text-[11px] font-semibold text-zinc-800 hover:bg-[#eef6e4] cursor-pointer"
            >
              <AlignHorizontalJustifyCenter className="h-3.5 w-3.5 text-[#4d7c0f]" />
              Centre horiz.
            </button>
            <button
              type="button"
              onClick={() => setSel({ y: round2((H - selectedBox.h) / 2) })}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#f5f5f7] py-2 text-[11px] font-semibold text-zinc-800 hover:bg-[#eef6e4] cursor-pointer"
            >
              <AlignVerticalJustifyCenter className="h-3.5 w-3.5 text-[#4d7c0f]" />
              Centre vert.
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1">
            <button
              type="button"
              title="Align to left safe edge"
              onClick={() => setSel({ x: 4 })}
              className="grid h-8 place-items-center rounded-lg bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced] cursor-pointer"
            >
              <AlignStartVertical className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="Align to right safe edge"
              onClick={() => setSel({ x: round2(W - 4 - selectedBox.w) })}
              className="grid h-8 place-items-center rounded-lg bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced] cursor-pointer"
            >
              <AlignEndVertical className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="Align to top safe edge"
              onClick={() => setSel({ y: 4 })}
              className="grid h-8 place-items-center rounded-lg bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced] cursor-pointer"
            >
              <AlignStartHorizontal className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="Align to bottom safe edge"
              onClick={() => setSel({ y: round2(H - 4 - selectedBox.h) })}
              className="grid h-8 place-items-center rounded-lg bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced] cursor-pointer"
            >
              <AlignEndHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* OPACITY & ROTATION */}
        <div className="space-y-3 border-t border-zinc-100 pt-3">
          <div>
            <label className="mb-1 flex justify-between text-[11px] font-semibold text-zinc-700">
              <span>Opacity</span>
              <span className="font-mono text-zinc-500">{Math.round((selectedLayer.opacity ?? 1) * 100)}%</span>
            </label>
            <input
              type="range"
              min={0.05}
              max={1}
              step={0.05}
              value={selectedLayer.opacity ?? 1}
              onChange={(e) => setSel({ opacity: Number(e.target.value) }, `op-${selectedLayer.id}`)}
              className="w-full accent-[#4d7c0f]"
            />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-zinc-700">
              <span>Rotation</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-zinc-500">{Math.round(selectedLayer.rotation ?? 0)}°</span>
                {(selectedLayer.rotation ?? 0) !== 0 && (
                  <button
                    type="button"
                    onClick={() => setSel({ rotation: 0 })}
                    className="rounded bg-[#f5f5f7] px-1.5 py-0.5 text-[10px] text-zinc-700 hover:bg-[#ebeced] cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={Math.round(selectedLayer.rotation ?? 0)}
              onChange={(e) => setSel({ rotation: Number(e.target.value) }, `rot-${selectedLayer.id}`)}
              className="w-full accent-[#4d7c0f]"
            />
          </div>
        </div>

        {/* LAYER ORDER */}
        <div className="space-y-1.5 border-t border-zinc-100 pt-3">
          <p className="text-[11px] font-semibold text-zinc-700">Layer order</p>
          <div className="grid grid-cols-4 gap-1">
            <button
              type="button"
              disabled={selectedIdx >= sideDesign.layers.length - 1}
              onClick={() => onReorderLayer(activeSide, selectedLayer.id, "front")}
              className="rounded-lg bg-[#f5f5f7] py-1.5 text-[10px] font-semibold text-zinc-700 hover:bg-[#ebeced] disabled:opacity-40 cursor-pointer"
            >
              Front
            </button>
            <button
              type="button"
              disabled={selectedIdx >= sideDesign.layers.length - 1}
              onClick={() => onReorderLayer(activeSide, selectedLayer.id, "up")}
              className="rounded-lg bg-[#f5f5f7] py-1.5 text-[10px] font-semibold text-zinc-700 hover:bg-[#ebeced] disabled:opacity-40 cursor-pointer"
            >
              Up
            </button>
            <button
              type="button"
              disabled={selectedIdx <= 0}
              onClick={() => onReorderLayer(activeSide, selectedLayer.id, "down")}
              className="rounded-lg bg-[#f5f5f7] py-1.5 text-[10px] font-semibold text-zinc-700 hover:bg-[#ebeced] disabled:opacity-40 cursor-pointer"
            >
              Down
            </button>
            <button
              type="button"
              disabled={selectedIdx <= 0}
              onClick={() => onReorderLayer(activeSide, selectedLayer.id, "back")}
              className="rounded-lg bg-[#f5f5f7] py-1.5 text-[10px] font-semibold text-zinc-700 hover:bg-[#ebeced] disabled:opacity-40 cursor-pointer"
            >
              Back
            </button>
          </div>
        </div>

        {/* EXACT POSITION & SIZE */}
        <div className="space-y-1.5 border-t border-zinc-100 pt-3">
          <p className="text-[11px] font-semibold text-zinc-700">Position &amp; size (mm)</p>
          <div className="grid grid-cols-2 gap-2">
            <SmallNum label="X (left)" value={selectedLayer.x} min={-W} max={W * 2} onChange={(x) => setSel({ x }, `x-${selectedLayer.id}`)} />
            <SmallNum label="Y (top)" value={selectedLayer.y} min={-H} max={H * 2} onChange={(y) => setSel({ y }, `y-${selectedLayer.id}`)} />
            <SmallNum
              label="Width"
              value={selectedLayer.w}
              min={1}
              max={W * 2}
              onChange={(w) =>
                setSel(
                  selectedLayer.kind === "image"
                    ? { w, h: round2(w / selectedLayer.ratio) }
                    : selectedLayer.kind === "icon"
                      ? { w, h: w }
                      : { w },
                  `w-${selectedLayer.id}`
                )
              }
            />
            {selectedLayer.kind !== "text" && selectedLayer.kind !== "line" && (
              <SmallNum
                label="Height"
                value={selectedLayer.h}
                min={0.5}
                max={H * 2}
                onChange={(h) =>
                  setSel(
                    selectedLayer.kind === "image"
                      ? { h, w: round2(h * selectedLayer.ratio) }
                      : selectedLayer.kind === "icon"
                        ? { w: h, h }
                        : { h },
                    `h-${selectedLayer.id}`
                  )
                }
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderLayersContent = () => (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-zinc-600">
          {sideDesign.layers.length} {sideDesign.layers.length === 1 ? "layer" : "layers"} on {activeSide} (top first)
        </p>
      </div>
      {sideDesign.layers.length === 0 ? (
        <div className="rounded-2xl bg-[#f5f5f7] p-4 text-center text-xs text-zinc-600">
          Nothing on the {activeSide} yet. Add text, logos, shapes, icons or a QR code from the left panel.
        </div>
      ) : (
        <ul className="space-y-1">
          {[...sideDesign.layers].reverse().map((l, revIdx) => {
            const origIdx = sideDesign.layers.length - 1 - revIdx;
            const active = l.id === selectedId;
            const renderBadge = () => {
              if (l.kind === "text") return <Type className="h-3.5 w-3.5 text-zinc-600" />;
              if (l.kind === "image" && l.qrText !== undefined) return <QrCode className="h-3.5 w-3.5 text-zinc-600" />;
              if (l.kind === "image") return <ImagePlus className="h-3.5 w-3.5 text-zinc-600" />;
              if (l.kind === "line") return <Minus className="h-3.5 w-3.5 text-zinc-600" />;
              if (l.kind === "icon") {
                const def = getCardIcon(l.iconId);
                return (
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke={l.color} strokeWidth={2}>
                    {def.paths.map((d, i) => (
                      <path key={i} d={d} />
                    ))}
                  </svg>
                );
              }
              return <span className="h-3.5 w-3.5 rounded-xs ring-1 ring-black/15" style={{ backgroundColor: l.color }} />;
            };

            return (
              <li
                key={l.id}
                className={`rounded-xl border transition ${
                  active ? "border-[#4d7c0f] bg-[#eef6e4]/60" : "border-transparent bg-[#f5f5f7] hover:bg-[#ebeced]"
                }`}
              >
                <div className="flex items-center gap-1 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(l.id);
                      setRightTab("properties");
                    }}
                    className={`flex min-h-[34px] min-w-0 flex-1 items-center gap-2 rounded-lg px-2 text-left text-xs font-semibold cursor-pointer ${
                      l.hidden ? "text-zinc-400 line-through" : "text-zinc-900"
                    }`}
                  >
                    <span className="shrink-0">{renderBadge()}</span>
                    <span className="truncate">{layerLabel(l)}</span>
                  </button>
                  <button
                    type="button"
                    title="Move up"
                    disabled={origIdx >= sideDesign.layers.length - 1}
                    onClick={() => onReorderLayer(activeSide, l.id, "up")}
                    className="grid h-7 w-7 place-items-center rounded-lg text-zinc-500 hover:bg-white disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    disabled={origIdx <= 0}
                    onClick={() => onReorderLayer(activeSide, l.id, "down")}
                    className="grid h-7 w-7 place-items-center rounded-lg text-zinc-500 hover:bg-white disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    title={l.hidden ? "Show layer" : "Hide layer"}
                    onClick={() => onChangeLayer(activeSide, l.id, { hidden: !l.hidden })}
                    className="grid h-7 w-7 place-items-center rounded-lg text-zinc-600 hover:bg-white cursor-pointer"
                  >
                    {l.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    type="button"
                    title={l.locked ? "Unlock layer" : "Lock layer"}
                    onClick={() => onChangeLayer(activeSide, l.id, { locked: !l.locked })}
                    className={`grid h-7 w-7 place-items-center rounded-lg hover:bg-white cursor-pointer ${
                      l.locked ? "text-amber-600" : "text-zinc-600"
                    }`}
                  >
                    {l.locked ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {active && (
                  <div className="flex items-center justify-end gap-1 border-t border-[#4d7c0f]/15 px-2 py-1">
                    <button
                      type="button"
                      onClick={() => onDuplicateLayer(activeSide, l.id)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold text-zinc-700 hover:bg-white cursor-pointer"
                    >
                      <Copy className="h-3 w-3" /> Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onRemoveLayer(activeSide, l.id);
                        setSelectedId(null);
                      }}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold text-red-700 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  const imageModalLayer = imageModal
    ? (sideDesign.layers.find((l): l is ImageLayer => l.id === imageModal.layerId && l.kind === "image") ?? null)
    : null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#f5f5f7] text-zinc-950"
      role="dialog"
      aria-modal="true"
      aria-label="Advanced Business Card Editor"
    >
      {/* Hidden file inputs */}
      <input
        ref={imageUploadRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        className="sr-only"
        onChange={(e) => {
          void handleUploadImageLayer(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input
        ref={replaceImgRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        className="sr-only"
        onChange={(e) => {
          void handleReplaceSelectedImage(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {/* ==================== TOP BAR ==================== */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-zinc-200 bg-white px-3 py-2 sm:px-4">
        {/* Back to simple mode + Undo / Redo */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-[#f5f5f7] px-3 text-xs font-bold text-zinc-900 hover:bg-[#ebeced] transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-[#4d7c0f]" />
            <span className="hidden sm:inline">Back to simple mode</span>
            <span className="sm:hidden">Simple</span>
          </button>

          <div className="h-5 w-px bg-zinc-200 hidden sm:block" />

          <div className="inline-flex items-center rounded-xl bg-[#f5f5f7] p-0.5">
            <button
              type="button"
              title="Undo (Ctrl/Cmd + Z)"
              aria-label="Undo"
              disabled={!canUndo}
              onClick={onUndo}
              className="grid h-8 w-8 place-items-center rounded-lg text-zinc-700 hover:bg-white disabled:opacity-35 cursor-pointer"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Redo (Ctrl/Cmd + Shift + Z)"
              aria-label="Redo"
              disabled={!canRedo}
              onClick={onRedo}
              className="grid h-8 w-8 place-items-center rounded-lg text-zinc-700 hover:bg-white disabled:opacity-35 cursor-pointer"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>

          {/* Zoom */}
          <div className="hidden md:inline-flex items-center rounded-xl bg-[#f5f5f7] p-0.5">
            <button
              type="button"
              title="Zoom out (Ctrl/Cmd -)"
              aria-label="Zoom out"
              onClick={() => setZoom((z) => clamp(round2(z - 0.15), 0.5, 2.5))}
              className="grid h-8 w-7 place-items-center rounded-lg text-zinc-700 hover:bg-white cursor-pointer"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="Reset zoom to fit (Ctrl/Cmd 0)"
              onClick={() => setZoom(1)}
              className="min-w-[46px] px-1.5 text-center font-mono text-[11px] font-semibold text-zinc-800 hover:text-[#4d7c0f] cursor-pointer"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              title="Zoom in (Ctrl/Cmd +)"
              aria-label="Zoom in"
              onClick={() => setZoom((z) => clamp(round2(z + 0.15), 0.5, 2.5))}
              className="grid h-8 w-7 place-items-center rounded-lg text-zinc-700 hover:bg-white cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Front / Back Toggle */}
        <div className="flex items-center gap-2">
          <div role="tablist" aria-label="Card side" className="inline-flex rounded-xl bg-[#f5f5f7] p-1">
            {(["front", "back"] as const).map((s) => {
              const active = activeSide === s;
              return (
                <button
                  key={s}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    onSetSide(s);
                    setSelectedId(null);
                    setEditingTextId(null);
                    if (s === "back" && !includeBack) {
                      onToggleBack(true);
                      setToast("Double-sided printing enabled so your back design prints on page 2.");
                    }
                  }}
                  className={`min-h-[30px] rounded-lg px-3.5 text-xs font-bold transition cursor-pointer ${
                    active ? "bg-white text-zinc-950 shadow-xs" : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  {s === "front" ? "Front" : "Back"}
                  {s === "back" && includeBack && <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#4d7c0f]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Save status, Help/Tour, Save/Share, Download, Close */}
        <div className="flex items-center gap-1.5">
          <span
            title="Changes auto-save locally in your browser"
            className="hidden xl:inline-flex items-center gap-1 rounded-full bg-[#eef6e4] px-2.5 py-1 text-[11px] font-semibold text-[#365314]"
          >
            <Check className="h-3 w-3" />
            {saveStatus === "saving" ? "Saving…" : "Auto-saved"}
          </span>

          <button
            type="button"
            title="Keyboard shortcuts"
            aria-label="Keyboard shortcuts"
            onClick={() => setShortcutsOpen((v) => !v)}
            className="hidden sm:grid h-9 w-9 place-items-center rounded-xl bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced] cursor-pointer"
          >
            <Keyboard className="h-4 w-4" />
          </button>

          <button
            type="button"
            title="Quick 3-step guide"
            aria-label="Start 3-step tour"
            onClick={() => setTourStep(0)}
            className="grid h-9 w-9 place-items-center rounded-xl bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced] cursor-pointer"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setSaveOpen(true)}
            title="Save, share link, or load a design file"
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-[#f5f5f7] px-3 text-xs font-bold text-zinc-800 hover:bg-[#ebeced] cursor-pointer"
          >
            <Save className="h-3.5 w-3.5 text-amber-600" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            type="button"
            onClick={() => setExportOpen(true)}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-[#4d7c0f] px-3.5 text-xs font-bold text-white hover:bg-[#3f6212] transition cursor-pointer shadow-xs"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>

          <button
            type="button"
            title="Close Advanced Editor"
            aria-label="Close Advanced Editor"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl bg-[#f5f5f7] text-zinc-600 hover:bg-[#ebeced] hover:text-zinc-950 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ==================== MAIN 3-PANE STUDIO ==================== */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* LEFT PANEL (Desktop & Tablet md+) */}
        <aside className="hidden md:flex w-[256px] lg:w-[276px] shrink-0 flex-col border-r border-zinc-200 bg-white">
          <div className="grid grid-cols-3 gap-1 border-b border-zinc-100 p-2">
            {(
              [
                ["add", "Add", Shapes],
                ["templates", "Templates", LayoutTemplate],
                ["background", "Backdrop", Palette],
              ] as const
            ).map(([id, label, Icon]) => {
              const active = leftTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setLeftTab(id)}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-bold transition cursor-pointer ${
                    active ? "bg-[#eef6e4] text-[#365314]" : "text-zinc-600 hover:bg-[#f5f5f7] hover:text-zinc-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </div>
          <div className="flex-1 overflow-y-auto p-3.5">
            {leftTab === "add" && renderAddContent()}
            {leftTab === "templates" && renderTemplatesContent()}
            {leftTab === "background" && renderBackgroundContent()}
          </div>
        </aside>

        {/* CENTRE CANVAS AREA */}
        <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Canvas Sub-Toolbar (Guides, Bleed, Grid, Snap, Alerts) */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200/80 bg-white/90 px-3 py-1.5 backdrop-blur-xs">
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                title="Show or hide safe-area and bleed guides"
                aria-pressed={showGuides}
                onClick={() => setShowGuides((v) => !v)}
                className={`inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-[11px] font-semibold transition cursor-pointer ${
                  showGuides ? "bg-[#eef6e4] text-[#365314]" : "bg-[#f5f5f7] text-zinc-600 hover:bg-[#ebeced]"
                }`}
              >
                <Ruler className="h-3.5 w-3.5" />
                Guides
              </button>
              <button
                type="button"
                title="Extend colour 3 mm past the cut line so no white edge shows when trimmed"
                aria-pressed={includeBleed}
                onClick={() => onToggleBleed(!includeBleed)}
                className={`inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-[11px] font-semibold transition cursor-pointer ${
                  includeBleed ? "bg-amber-100 text-amber-900 ring-1 ring-amber-400/60" : "bg-[#f5f5f7] text-zinc-600 hover:bg-[#ebeced]"
                }`}
              >
                Bleed 3 mm
              </button>
              <button
                type="button"
                title="Toggle 5 mm alignment grid"
                aria-pressed={showGrid}
                onClick={() => setShowGrid((v) => !v)}
                className={`inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-[11px] font-semibold transition cursor-pointer ${
                  showGrid ? "bg-[#eef6e4] text-[#365314]" : "bg-[#f5f5f7] text-zinc-600 hover:bg-[#ebeced]"
                }`}
              >
                <Grid3x3 className="h-3.5 w-3.5" />
                Grid
              </button>
              <button
                type="button"
                title="Snap elements to centre lines, safe area and other items (hold Alt to temporarily bypass)"
                aria-pressed={snapEnabled}
                onClick={() => setSnapEnabled((v) => !v)}
                className={`inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-[11px] font-semibold transition cursor-pointer ${
                  snapEnabled ? "bg-[#eef6e4] text-[#365314]" : "bg-[#f5f5f7] text-zinc-600 hover:bg-[#ebeced]"
                }`}
              >
                <Magnet className="h-3.5 w-3.5" />
                Snap
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {lowContrastList.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(lowContrastList[0].layer.id);
                    setRightTab("properties");
                    setMobileSheet("properties");
                  }}
                  title="Click to inspect low-contrast text"
                  className="inline-flex h-7 items-center gap-1 rounded-full bg-amber-100 px-2.5 text-[11px] font-bold text-amber-900 hover:bg-amber-200 cursor-pointer"
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                  {lowContrastList.length} contrast {lowContrastList.length === 1 ? "warning" : "warnings"}
                </button>
              )}
              {(edgeInfo.isDark || edgeInfo.touchesEdge) && !includeBleed && (
                <button
                  type="button"
                  onClick={() => onToggleBleed(true)}
                  title="Dark or edge-to-edge card: turn on 3 mm bleed for clean trimming"
                  className="hidden sm:inline-flex h-7 items-center gap-1 rounded-full bg-amber-50 px-2.5 text-[11px] font-semibold text-amber-900 ring-1 ring-amber-300 hover:bg-amber-100 cursor-pointer"
                >
                  Edge ink · Enable 3 mm bleed
                </button>
              )}
              <button
                type="button"
                onClick={() => applyTemplateById(templateId)}
                title="Reset card layout back to template"
                className="hidden xl:inline-flex h-7 items-center gap-1 rounded-lg bg-[#f5f5f7] px-2 text-[11px] font-semibold text-zinc-600 hover:bg-[#ebeced] cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                Reset template
              </button>
            </div>
          </div>

          {/* Interactive Canvas */}
          <AdvancedCanvas
            W={W}
            H={H}
            side={sideDesign}
            sideName={activeSide}
            selectedId={selectedId}
            editingTextId={editingTextId}
            zoom={zoom}
            showGuides={showGuides}
            includeBleed={includeBleed}
            showGrid={showGrid}
            snapEnabled={snapEnabled}
            eyedropperActive={Boolean(eyedropperCb)}
            onSelect={(id) => {
              setSelectedId(id);
              if (id) setRightTab("properties");
            }}
            onStartEditText={(id) => {
              setSelectedId(id);
              setEditingTextId(id);
            }}
            onStopEditText={() => setEditingTextId(null)}
            onChange={(id, patch, group) => onChangeLayer(activeSide, id, patch, group)}
            onZoomChange={setZoom}
            onEyedropperSample={(hex) => {
              eyedropperCb?.(hex);
              setEyedropperCb(null);
              setToast(`Sampled ${hex.toUpperCase()}`);
            }}
            onCancelEyedropper={() => setEyedropperCb(null)}
            onDropImageFile={(file) => void handleUploadImageLayer(file)}
          />

          {/* Floating Toast */}
          {toast && (
            <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full bg-zinc-950 px-4 py-2 text-xs font-semibold text-white shadow-lg">
              {toast}
            </div>
          )}

          {/* Optional 3-step First-Time Beginner Tour */}
          {tourStep !== null && (
            <div className="absolute bottom-4 right-4 left-4 sm:left-auto z-40 sm:w-80 rounded-2xl border border-amber-300 bg-white p-4 shadow-2xl">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-900">
                  <Sparkles className="h-3 w-3 text-amber-600" />
                  {TOUR_STEPS[tourStep].badge} · {tourStep + 1} / {TOUR_STEPS.length}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    markTourSeen();
                    setTourStep(null);
                  }}
                  className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 cursor-pointer"
                >
                  Skip
                </button>
              </div>
              <h4 className="mt-2 text-sm font-bold text-zinc-950">{TOUR_STEPS[tourStep].title}</h4>
              <p className="mt-1 text-xs leading-relaxed text-zinc-600">{TOUR_STEPS[tourStep].body}</p>
              <div className="mt-3 flex items-center justify-between">
                <button
                  type="button"
                  disabled={tourStep === 0}
                  onClick={() => setTourStep((s) => (s && s > 0 ? s - 1 : 0))}
                  className="rounded-lg bg-[#f5f5f7] px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-[#ebeced] disabled:opacity-40 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (tourStep >= TOUR_STEPS.length - 1) {
                      markTourSeen();
                      setTourStep(null);
                    } else {
                      setTourStep(tourStep + 1);
                    }
                  }}
                  className="rounded-lg bg-[#4d7c0f] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#3f6212] cursor-pointer"
                >
                  {tourStep >= TOUR_STEPS.length - 1 ? "Start designing" : "Next tip"}
                </button>
              </div>
            </div>
          )}

          {/* Keyboard Shortcuts Popover */}
          {shortcutsOpen && (
            <div className="absolute top-12 right-4 z-40 w-72 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-950">Keyboard shortcuts</h4>
                <button type="button" onClick={() => setShortcutsOpen(false)} className="text-zinc-500 hover:text-zinc-900 cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <dl className="mt-2.5 space-y-1.5 text-xs">
                {[
                  ["Ctrl / Cmd + Z", "Undo"],
                  ["Ctrl / Cmd + Shift + Z", "Redo"],
                  ["Ctrl / Cmd + D", "Duplicate selected"],
                  ["Arrow keys", "Nudge 0.5 mm (Shift = 2 mm)"],
                  ["Delete / Backspace", "Delete selected"],
                  ["Double-click text", "Edit text directly"],
                  ["Hold Alt while dragging", "Disable snapping"],
                  ["Ctrl / Cmd + / - / 0", "Zoom in / out / fit"],
                ].map(([k, desc]) => (
                  <div key={k} className="flex items-center justify-between gap-2">
                    <dt className="rounded bg-[#f5f5f7] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-zinc-800">{k}</dt>
                    <dd className="text-right text-[11px] text-zinc-600">{desc}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </main>

        {/* RIGHT PANEL (Desktop lg+, collapsible on tablet md) */}
        <aside className="hidden lg:flex w-[304px] shrink-0 flex-col border-l border-zinc-200 bg-white">
          <div className="grid grid-cols-2 gap-1 border-b border-zinc-100 p-2">
            <button
              type="button"
              onClick={() => setRightTab("properties")}
              className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                rightTab === "properties" ? "bg-[#eef6e4] text-[#365314]" : "text-zinc-600 hover:bg-[#f5f5f7]"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Properties
            </button>
            <button
              type="button"
              onClick={() => setRightTab("layers")}
              className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                rightTab === "layers" ? "bg-[#eef6e4] text-[#365314]" : "text-zinc-600 hover:bg-[#f5f5f7]"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Layers ({sideDesign.layers.length})
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3.5">
            {rightTab === "properties" ? renderPropertiesContent() : renderLayersContent()}
          </div>
        </aside>
      </div>

      {/* ==================== RESPONSIVE TABLET / MOBILE BOTTOM BAR & DRAWER ==================== */}
      <div className="lg:hidden shrink-0 border-t border-zinc-200 bg-white px-2 py-1.5">
        <div className="flex items-center justify-around gap-1">
          {(
            [
              ["add", "Add", Shapes, "md:hidden"],
              ["properties", "Edit", SlidersHorizontal, ""],
              ["layers", `Layers (${sideDesign.layers.length})`, Layers, ""],
              ["background", "Backdrop", Palette, "md:hidden"],
              ["templates", "Templates", LayoutTemplate, "md:hidden"],
            ] as const
          ).map(([id, label, Icon, vis]) => {
            const active = mobileSheet === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setMobileSheet(active ? "none" : id)}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[11px] font-bold transition cursor-pointer ${vis} ${
                  active ? "bg-[#eef6e4] text-[#365314]" : "text-zinc-600 hover:bg-[#f5f5f7]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {mobileSheet !== "none" && (
        <div className="lg:hidden fixed inset-x-0 bottom-[58px] z-40 max-h-[58vh] overflow-y-auto rounded-t-3xl border-t border-zinc-200 bg-white p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">{mobileSheet}</h4>
            <button
              type="button"
              onClick={() => setMobileSheet("none")}
              className="grid h-7 w-7 place-items-center rounded-lg bg-[#f5f5f7] text-zinc-700 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {mobileSheet === "add" && renderAddContent()}
          {mobileSheet === "properties" && renderPropertiesContent()}
          {mobileSheet === "layers" && renderLayersContent()}
          {mobileSheet === "background" && renderBackgroundContent()}
          {mobileSheet === "templates" && renderTemplatesContent()}
        </div>
      )}

      {/* ==================== SUB-MODALS ==================== */}
      {imageModal && imageModalLayer && (
        <ImageToolsModal
          initialTab={imageModal.tab}
          src={imageModalLayer.src}
          originalSrc={imageModalLayer.originalSrc}
          name={imageModalLayer.name}
          onApply={handleApplyImageTools}
          onClose={() => setImageModal(null)}
        />
      )}

      {exportOpen && (
        <PrintExportModal
          design={design}
          sheetId={sheetId}
          customSheet={customSheet}
          sheet={sheet}
          includeBack={includeBack}
          showCropMarks={showCropMarks}
          includeBleed={includeBleed}
          offsetX={offsetX}
          offsetY={offsetY}
          onChangeSheetId={onChangeSheetId}
          onChangeCustomSheet={onChangeCustomSheet}
          onToggleBack={onToggleBack}
          onToggleCropMarks={onToggleCropMarks}
          onToggleBleed={onToggleBleed}
          onClose={() => setExportOpen(false)}
        />
      )}

      {saveOpen && (
        <SaveShareModal
          payload={persistedPayload}
          onLoadPayload={(loaded) => {
            onLoadPayload(loaded);
            setSelectedId(null);
            setEditingTextId(null);
            setToast("Design loaded!");
          }}
          onClose={() => setSaveOpen(false)}
        />
      )}
    </div>,
    document.body
  );
}
