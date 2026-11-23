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
  Barcode,
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
import { ensureGoogleFontsLoaded } from "../card/fonts";
import { CARD_ICONS, getCardIcon } from "../card/icons";
import { checkTextLayerContrast, findLowContrastLayers, isEdgeToEdgeOrDarkSide } from "../card/contrast";
import { previewFit } from "../card/engine";
import {
  compileSide,
  layerLabel,
  makeIcon,
  makeImage,
  makeLine,
  makeShape,
  makeText,
  type IconLayer,
  type ImageLayer,
  type Layer,
  type LineLayer,
  type ShapeLayer,
  type SideBackground,
  type SideDesign,
  type TextLayer,
} from "../card/editor-model";
import { loadBrandColors, saveBrandColors } from "../card/export";
import { AdvancedCanvas, type LayerPatch } from "../card/AdvancedCanvas";
import { AdvancedColorPicker, BackgroundPanel, FontPicker } from "../card/EditorControls";
import { ImageToolsModal, type ImageEditResult } from "../card/ImageToolsModal";
import type { FontPairId } from "../ui/LabelDesign";
import {
  buildLabelTemplateSide,
  type DynamicSlotOverride,
  type LabelTemplateId,
} from "./label-templates";
import {
  hasSeenLabelTour,
  markLabelTourSeen,
  type LabelCutGuideStyle,
  type LabelGridState,
  type PersistedLabelDesign,
} from "./label-export";
import {
  LabelPrintExportModal,
  LabelSaveShareModal,
  LabelTemplateGalleryPanel,
} from "./LabelExportModals";

const round2 = (n: number) => Math.round(n * 100) / 100;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

async function normalizeImage(file: File): Promise<{ src: string; ratio: number; name: string }> {
  const raw = await fileToDataUrl(file);
  const img = await loadImageElement(raw);
  const nw = img.naturalWidth || 300;
  const nh = img.naturalHeight || 300;
  const scale = Math.min(1, 1400 / Math.max(nw, nh));
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(nw * scale));
  c.height = Math.max(1, Math.round(nh * scale));
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return { src: c.toDataURL("image/png"), ratio: nw / nh, name: file.name.replace(/\.[^.]+$/, "") || "Sticker" };
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

const STICKER_BACKDROPS = [
  { label: "Pure White", bg: { type: "solid", color: "#ffffff" } as SideBackground, swatch: "#ffffff" },
  { label: "Kraft Paper", bg: { type: "pattern", bg: "#dec7a0", fg: "#5c422a", pattern: "dots", opacity: 0.08, scale: 0.9 } as SideBackground, swatch: "#dec7a0" },
  { label: "Warm Cream", bg: { type: "solid", color: "#faf7f2" } as SideBackground, swatch: "#faf7f2" },
  { label: "Sage Tint", bg: { type: "solid", color: "#eef6e4" } as SideBackground, swatch: "#eef6e4" },
  { label: "Matte Dark", bg: { type: "solid", color: "#18181b" } as SideBackground, swatch: "#18181b" },
];

const TOUR_STEPS = [
  {
    title: "1. Pick a template or drop in elements",
    body: "Use the left panel to pick a label/sticker template, switch backgrounds (including Kraft paper, gradients & patterns), or add text, artwork, QR codes, barcodes, shapes & 32 icons.",
    badge: "Left panel",
  },
  {
    title: "2. Drag, resize, rotate & edit right on the label",
    body: "Drag items smoothly with smart alignment guides. Double-click any text to edit in place, and keep important text inside the dashed green Safe Area (especially for round stickers!).",
    badge: "Centre canvas",
  },
  {
    title: "3. Style, check readability & print your sheet",
    body: "Use the right panel to pick fonts, brand colours, remove sticker backgrounds, or manage layers. Click Download to export an aligned A4/Letter sheet PDF, 300 DPI PNG, or vector SVG.",
    badge: "Right panel & top bar",
  },
];

export interface AdvancedLabelEditorProps {
  open: boolean;
  side: SideDesign;
  grid: LabelGridState;
  labelCount: number;
  pageCount: number;
  isListMode: boolean;
  listCount: number;
  cutGuideStyle: LabelCutGuideStyle;
  includeBleed: boolean;
  templateId: LabelTemplateId;
  accentHex: string;
  fontPair: FontPairId;
  title: string;
  subtitle: string;
  eyebrow?: string;
  slotOverrides?: DynamicSlotOverride[];
  canUndo: boolean;
  canRedo: boolean;
  saveStatus: "saved" | "saving" | "unsaved";
  persistedPayload: PersistedLabelDesign;
  onChangeGrid: (next: LabelGridState) => void;
  onChangeLayer: (id: string, patch: LayerPatch, group?: string) => void;
  onAddLayer: (layer: Layer) => void;
  onRemoveLayer: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
  onReorderLayer: (id: string, mode: "up" | "down" | "front" | "back") => void;
  onSetBackground: (bg: SideBackground, group?: string) => void;
  onApplyTemplate: (templateId: LabelTemplateId, nextSide: SideDesign) => void;
  onPatchSilently: (id: string, patch: Partial<ImageLayer>) => void;
  onUndo: () => void;
  onRedo: () => void;
  onChangeCutGuideStyle: (style: LabelCutGuideStyle) => void;
  onToggleBleed: (on: boolean) => void;
  onLoadPayload: (payload: PersistedLabelDesign) => void;
  onClose: () => void;
}

export function AdvancedLabelEditor(props: AdvancedLabelEditorProps) {
  const {
    open,
    side,
    grid,
    labelCount,
    pageCount,
    isListMode,
    listCount,
    cutGuideStyle,
    includeBleed,
    templateId,
    accentHex,
    fontPair,
    title,
    subtitle,
    eyebrow,
    slotOverrides,
    canUndo,
    canRedo,
    saveStatus,
    persistedPayload,
    onChangeGrid,
    onChangeLayer,
    onAddLayer,
    onRemoveLayer,
    onDuplicateLayer,
    onReorderLayer,
    onSetBackground,
    onApplyTemplate,
    onPatchSilently,
    onUndo,
    onRedo,
    onChangeCutGuideStyle,
    onToggleBleed,
    onLoadPayload,
    onClose,
  } = props;

  const round = Boolean(grid.round);
  const diameter = Math.min(grid.labelW, grid.labelH);
  const W = round ? diameter : grid.labelW;
  const H = round ? diameter : grid.labelH;

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
  const [barcodeErrorMap, setBarcodeErrorMap] = useState<Record<string, string>>({});

  const imageUploadRef = useRef<HTMLInputElement>(null);
  const replaceImgRef = useRef<HTMLInputElement>(null);
  const uid = useId();

  useEffect(() => {
    if (!open) return;
    ensureGoogleFontsLoaded();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!hasSeenLabelTour()) {
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

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  // Live QR code generation for QR layers
  const pendingQrs = useMemo(() => {
    const out: Array<{ id: string; text: string; fg: string; bg: string; sig: string }> = [];
    for (const l of side.layers) {
      if (l.kind === "image" && l.qrText !== undefined) {
        const text = l.qrText.trim();
        const fg = l.qrFg || "#09090b";
        const bg = l.qrBg || "#ffffff";
        const sig = `${text}|${fg}|${bg}`;
        if (text && l.qrFor !== sig) out.push({ id: l.id, text, fg, bg, sig });
      }
    }
    return out;
  }, [side.layers]);

  const pendingQrKey = pendingQrs.map((q) => `${q.id}:${q.sig}`).join("||");
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
          if (!cancelled) onPatchSilently(item.id, { src, qrFor: item.sig });
        } catch {
          if (!cancelled) onPatchSilently(item.id, { qrFor: item.sig });
        }
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pendingQrKey]);

  // Live Barcode generation for Barcode layers via jsbarcode
  const pendingBarcodes = useMemo(() => {
    const out: Array<{ id: string; code: string; format: "CODE128" | "EAN13" | "UPC"; sig: string }> = [];
    for (const l of side.layers) {
      if (l.kind === "image" && l.barcodeText !== undefined) {
        const code = l.barcodeText.trim();
        const format = l.barcodeFormat ?? "CODE128";
        const sig = `${format}|${code}`;
        if (code && l.barcodeFor !== sig) out.push({ id: l.id, code, format, sig });
      }
    }
    return out;
  }, [side.layers]);

  const pendingBcKey = pendingBarcodes.map((b) => `${b.id}:${b.sig}`).join("||");
  useEffect(() => {
    if (!open || !pendingBarcodes.length) return;
    let cancelled = false;
    void import("jsbarcode").then((m) => {
      const JsBarcode = m.default;
      for (const item of pendingBarcodes) {
        try {
          const canvas = document.createElement("canvas");
          JsBarcode(canvas, item.code, {
            format: item.format,
            width: 2,
            height: 55,
            displayValue: true,
            fontSize: 13,
            margin: 6,
            background: "#ffffff",
            lineColor: "#000000",
          });
          const src = canvas.toDataURL("image/png");
          const ratio = canvas.width / Math.max(1, canvas.height);
          if (!cancelled) {
            setBarcodeErrorMap((prev) => {
              const next = { ...prev };
              delete next[item.id];
              return next;
            });
            onPatchSilently(item.id, { src, ratio, barcodeFor: item.sig });
          }
        } catch {
          if (!cancelled) {
            setBarcodeErrorMap((prev) => ({
              ...prev,
              [item.id]: `Not a valid ${item.format} code (check digit count or characters).`,
            }));
            onPatchSilently(item.id, { barcodeFor: item.sig });
          }
        }
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pendingBcKey]);

  const compiled = useMemo(() => compileSide(side, W, H, previewFit), [side, W, H]);
  const selectedLayer = useMemo(() => side.layers.find((l) => l.id === selectedId) ?? null, [side.layers, selectedId]);
  const selectedBox = selectedLayer ? (compiled.bounds.get(selectedLayer.id) ?? selectedLayer) : null;
  const lowContrastList = useMemo(() => findLowContrastLayers(side, compiled.bounds), [side, compiled.bounds]);
  const edgeInfo = useMemo(() => isEdgeToEdgeOrDarkSide(side, W, H), [side, W, H]);

  // Global keyboard shortcuts
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inInput =
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable);

      if (e.key === "Escape") {
        if (eyedropperCb) return setEyedropperCb(null);
        if (editingTextId) return setEditingTextId(null);
        if (imageModal) return setImageModal(null);
        if (exportOpen) return setExportOpen(false);
        if (saveOpen) return setSaveOpen(false);
        if (shortcutsOpen) return setShortcutsOpen(false);
        if (selectedId) return setSelectedId(null);
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
        onDuplicateLayer(selectedLayer.id);
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && !selectedLayer.locked) {
        e.preventDefault();
        onRemoveLayer(selectedLayer.id);
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
        onChangeLayer(selectedLayer.id, patch, `nudge-${selectedLayer.id}`);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    open,
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
      onAddLayer(layer);
      setSelectedId(layer.id);
      setRightTab("properties");
    },
    [onAddLayer]
  );

  const handleUploadStickerImage = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      try {
        const { src, ratio, name } = await normalizeImage(file);
        const maxSide = Math.min(W, H) * 0.58;
        const w = ratio >= 1 ? maxSide : maxSide * ratio;
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
        setToast("Image added! Tip: Click 'Remove background' or 'Crop' on the right.");
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
        const { src, ratio, name } = await normalizeImage(file);
        const nextH = round2(selectedLayer.w / ratio);
        onChangeLayer(selectedLayer.id, { src, originalSrc: src, ratio, name, h: nextH });
        setToast("Image replaced.");
      } catch {
        setToast("Could not read that image.");
      }
    },
    [onChangeLayer, selectedLayer]
  );

  const handleApplyImageTools = useCallback(
    (result: ImageEditResult) => {
      if (!imageModal) return;
      const target = side.layers.find((l): l is ImageLayer => l.id === imageModal.layerId && l.kind === "image");
      if (!target) {
        setImageModal(null);
        return;
      }
      const nextH = round2(target.w / result.ratio);
      onChangeLayer(target.id, {
        src: result.src,
        originalSrc: result.originalSrc,
        ratio: result.ratio,
        h: nextH,
        name: result.name ?? target.name,
      });
      setImageModal(null);
      setToast("Image updated!");
    },
    [imageModal, onChangeLayer, side.layers]
  );

  const handleResetTemplate = useCallback(() => {
    const built = buildLabelTemplateSide({
      templateId,
      w: W,
      h: H,
      round,
      accentHex,
      fontPair,
      title,
      subtitle,
      eyebrow,
    });
    onApplyTemplate(templateId, built);
    setSelectedId(null);
    setEditingTextId(null);
    setToast("Reset to template. Press Undo anytime to revert.");
  }, [templateId, W, H, round, accentHex, fontPair, title, subtitle, eyebrow, onApplyTemplate]);

  const filteredIcons = useMemo(() => {
    const q = iconQuery.trim().toLowerCase();
    if (!q) return CARD_ICONS;
    return CARD_ICONS.filter((ic) => ic.label.toLowerCase().includes(q) || ic.category.includes(q) || ic.id.includes(q));
  }, [iconQuery]);

  if (!open || typeof document === "undefined") return null;

  const setSel = (patch: LayerPatch, group?: string) => {
    if (selectedLayer) onChangeLayer(selectedLayer.id, patch, group);
  };
  const selectedIdx = selectedLayer ? side.layers.findIndex((l) => l.id === selectedLayer.id) : -1;
  const selectedContrast =
    selectedLayer && selectedLayer.kind === "text" ? checkTextLayerContrast(selectedLayer, side, compiled.bounds) : null;
  const selectedFittedPt =
    selectedLayer && selectedLayer.kind === "text" ? compiled.fittedSizes.get(selectedLayer.id) ?? selectedLayer.size : null;

  /* ---------------- Left Panel Sections ---------------- */

  const renderAddContent = () => (
    <div className="space-y-4">
      {/* Text */}
      <div>
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Text</p>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() =>
              addAndSelect(
                makeText({
                  name: "Main title",
                  text: "Your label title",
                  size: round2(clamp(Math.min(W, H) * 0.25, 8, 18)),
                  bold: true,
                  align: "center",
                  fontId: "inter",
                  x: round2(W * 0.1),
                  y: round2(H * 0.36),
                  w: round2(W * 0.8),
                })
              )
            }
            className="flex w-full items-center gap-2.5 rounded-xl bg-[#f5f5f7] px-3 py-2.5 text-left hover:bg-[#eef6e4] transition cursor-pointer"
          >
            <Type className="h-4 w-4 shrink-0 text-[#4d7c0f]" />
            <span>
              <span className="block text-sm font-bold text-zinc-950">Add title text</span>
              <span className="block text-[10px] text-zinc-500">Product name, greeting or badge</span>
            </span>
          </button>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() =>
                addAndSelect(
                  makeText({
                    name: "Subtitle",
                    text: "Handmade · Fresh",
                    size: round2(clamp(Math.min(W, H) * 0.14, 6, 11)),
                    bold: true,
                    align: "center",
                    color: accentHex,
                    fontId: "inter",
                    x: round2(W * 0.12),
                    y: round2(H * 0.56),
                    w: round2(W * 0.76),
                  })
                )
              }
              className="rounded-xl bg-[#f5f5f7] px-2.5 py-2 text-xs font-semibold text-zinc-800 hover:bg-[#eef6e4] cursor-pointer"
            >
              Subtitle
            </button>
            <button
              type="button"
              onClick={() =>
                addAndSelect(
                  makeText({
                    name: "Small note",
                    text: "Net Wt. 200g · $12.00",
                    size: 6.5,
                    align: "center",
                    fontId: "inter",
                    x: round2(W * 0.12),
                    y: round2(H * 0.72),
                    w: round2(W * 0.76),
                  })
                )
              }
              className="rounded-xl bg-[#f5f5f7] px-2.5 py-2 text-xs font-medium text-zinc-800 hover:bg-[#eef6e4] cursor-pointer"
            >
              Price / Note
            </button>
          </div>
        </div>
      </div>

      {/* Artwork, QR & Barcode */}
      <div>
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Artwork, QR &amp; Barcode</p>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => imageUploadRef.current?.click()}
            className="flex flex-col items-center justify-center gap-1 rounded-xl bg-[#f5f5f7] px-2 py-2.5 text-center hover:bg-[#eef6e4] transition cursor-pointer"
          >
            <ImagePlus className="h-4 w-4 text-[#4d7c0f]" />
            <span className="text-[11px] font-semibold text-zinc-900">Logo / Art</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const sz = round2(clamp(Math.min(W, H) * 0.34, 10, 18));
              addAndSelect(
                makeImage("", 1, "QR code", {
                  x: round2((W - sz) / 2),
                  y: round2((H - sz) / 2),
                  w: sz,
                  h: sz,
                  qrText: "https://your-shop.example",
                  qrFg: "#09090b",
                  qrBg: "#ffffff",
                })
              );
            }}
            className="flex flex-col items-center justify-center gap-1 rounded-xl bg-[#f5f5f7] px-2 py-2.5 text-center hover:bg-[#eef6e4] transition cursor-pointer"
          >
            <QrCode className="h-4 w-4 text-[#4d7c0f]" />
            <span className="text-[11px] font-semibold text-zinc-900">QR Code</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const bw = round2(clamp(W * 0.65, 18, 46));
              const bh = round2(bw / 2.2);
              addAndSelect(
                makeImage("", 2.2, "Barcode", {
                  x: round2((W - bw) / 2),
                  y: round2(H - bh - 4),
                  w: bw,
                  h: bh,
                  barcodeText: "SKU-1042",
                  barcodeFormat: "CODE128",
                })
              );
            }}
            className="flex flex-col items-center justify-center gap-1 rounded-xl bg-[#f5f5f7] px-2 py-2.5 text-center hover:bg-[#eef6e4] transition cursor-pointer"
          >
            <Barcode className="h-4 w-4 text-[#4d7c0f]" />
            <span className="text-[11px] font-semibold text-zinc-900">Barcode</span>
          </button>
        </div>
      </div>

      {/* Shapes */}
      <div>
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Shapes &amp; Badges</p>
        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              ["rect", "Box", Square],
              ["rounded-rect", "Pill / Tag", Square],
              ["ellipse", "Circle", Circle],
              ["frame", "Border", SquareDashed],
              ["triangle", "Triangle", Triangle],
              ["star", "Star", Star],
            ] as const
          ).map(([kind, label, Icon]) => {
            const s = Math.min(W, H);
            return (
              <button
                key={kind}
                type="button"
                onClick={() =>
                  addAndSelect(
                    makeShape(kind, accentHex, {
                      x: kind === "frame" ? 2.5 : round2(W / 2 - s * 0.2),
                      y: kind === "frame" ? 2.5 : round2(H / 2 - s * 0.16),
                      w: kind === "frame" ? round2(W - 5) : round2(s * 0.4),
                      h: kind === "frame" ? round2(H - 5) : kind === "rounded-rect" ? round2(s * 0.22) : round2(s * 0.4),
                      radius: kind === "rounded-rect" ? 3 : kind === "frame" && round ? W / 2 : 0,
                    })
                  )
                }
                className="flex flex-col items-center justify-center gap-1 rounded-xl bg-[#f5f5f7] py-2.5 text-[11px] font-semibold text-zinc-800 hover:bg-[#eef6e4] cursor-pointer"
              >
                <Icon className="h-4 w-4 text-zinc-700" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lines */}
      <div>
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Dividers</p>
        <div className="grid grid-cols-3 gap-1.5">
          {(["solid", "dashed", "dotted"] as const).map((dash) => (
            <button
              key={dash}
              type="button"
              onClick={() =>
                addAndSelect(
                  makeLine(accentHex, {
                    dash,
                    x: round2(W * 0.2),
                    y: round2(H / 2 - 1),
                    w: round2(W * 0.6),
                    h: 2,
                    strokeW: 0.45,
                  })
                )
              }
              className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-[#f5f5f7] py-2.5 text-[11px] font-semibold capitalize text-zinc-800 hover:bg-[#eef6e4] cursor-pointer"
            >
              <span className="block w-8 border-t-2 border-zinc-700" style={{ borderTopStyle: dash }} />
              {dash}
            </button>
          ))}
        </div>
      </div>

      {/* Icons */}
      <div>
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Sticker icons</p>
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={iconQuery}
            onChange={(e) => setIconQuery(e.target.value)}
            placeholder="Search icons (heart, leaf, gift, tag…)"
            className="h-8 w-full rounded-xl bg-[#f5f5f7] pl-8 pr-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-2 focus:outline-[#4d7c0f]"
          />
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {filteredIcons.map((ic) => {
            const sz = round2(clamp(Math.min(W, H) * 0.16, 4.5, 9));
            return (
              <button
                key={ic.id}
                type="button"
                title={`Add ${ic.label} icon`}
                onClick={() =>
                  addAndSelect(
                    makeIcon(ic.id, accentHex, ic.label, {
                      x: round2(W / 2 - sz / 2),
                      y: round2(H / 2 - sz / 2),
                      w: sz,
                      h: sz,
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
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderBackgroundContent = () => (
    <div className="space-y-4">
      <div>
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Quick sticker paper</p>
        <div className="grid grid-cols-5 gap-1.5">
          {STICKER_BACKDROPS.map((item) => (
            <button
              key={item.label}
              type="button"
              title={item.label}
              onClick={() => onSetBackground(item.bg)}
              className="flex flex-col items-center gap-1 rounded-xl bg-[#f5f5f7] p-1.5 hover:bg-[#ebeced] cursor-pointer"
            >
              <span className="h-6 w-6 rounded-full ring-1 ring-black/15" style={{ backgroundColor: item.swatch }} />
              <span className="w-full truncate text-center text-[9px] font-semibold text-zinc-700">{item.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>
      <BackgroundPanel
        side={side}
        sideName="front"
        brandColors={brandColors}
        onSetBackground={(bg, group) => onSetBackground(bg, group)}
        onAddBrandColor={handleAddBrandColor}
        onRemoveBrandColor={handleRemoveBrandColor}
        onRequestEyedropper={(cb) => setEyedropperCb(() => cb)}
        onError={(m) => setToast(m)}
      />
    </div>
  );

  const renderTemplatesContent = () => (
    <LabelTemplateGalleryPanel
      activeTemplateId={templateId}
      w={W}
      h={H}
      round={round}
      accentHex={accentHex}
      fontPair={fontPair}
      title={title}
      subtitle={subtitle}
      eyebrow={eyebrow}
      onApplyTemplate={(tplId, built) => {
        onApplyTemplate(tplId, built);
        setSelectedId(null);
        setEditingTextId(null);
        setToast("Template applied!");
      }}
      onResetCurrent={handleResetTemplate}
    />
  );

  /* ---------------- Right Panel: Properties & Layers ---------------- */

  const renderPropertiesContent = () => {
    if (!selectedLayer || !selectedBox) {
      return (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#f5f5f7] p-3.5 text-xs leading-relaxed text-zinc-600">
            <p className="font-bold text-zinc-900">Click anything on the {round ? "sticker" : "label"} to edit</p>
            <p className="mt-1">
              Or pick a paper colour, Kraft texture, gradient, pattern or background photo below.
            </p>
          </div>
          {renderBackgroundContent()}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-zinc-100 pb-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-zinc-950">{layerLabel(selectedLayer)}</p>
            <p className="text-[10px] capitalize text-zinc-500">
              {selectedLayer.kind === "image" && selectedLayer.barcodeText !== undefined
                ? "Scannable Barcode"
                : selectedLayer.kind === "image" && selectedLayer.qrText !== undefined
                  ? "QR Code"
                  : selectedLayer.kind}
              {selectedLayer.labelSlotKey && isListMode ? " · Auto-fills from your list" : ""}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Duplicate (Ctrl/Cmd+D)"
              onClick={() => onDuplicateLayer(selectedLayer.id)}
              className="grid h-8 w-8 place-items-center rounded-lg bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced] cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title={selectedLayer.locked ? "Unlock" : "Lock"}
              onClick={() => setSel({ locked: !selectedLayer.locked })}
              className={`grid h-8 w-8 place-items-center rounded-lg cursor-pointer ${
                selectedLayer.locked ? "bg-amber-100 text-amber-800" : "bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced]"
              }`}
            >
              {selectedLayer.locked ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              title="Delete"
              onClick={() => {
                onRemoveLayer(selectedLayer.id);
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
                Text
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

            <div className="space-y-2">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <SmallNum
                    label="Size (pt)"
                    unit="pt"
                    value={selectedLayer.size}
                    min={4}
                    max={72}
                    onChange={(size) => setSel({ size } as Partial<TextLayer>, `sz-${selectedLayer.id}`)}
                  />
                </div>
                <button
                  type="button"
                  aria-label="Smaller text"
                  onClick={() => setSel({ size: round2(clamp(selectedLayer.size - 0.5, 4, 72)) } as Partial<TextLayer>)}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced] cursor-pointer"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Larger text"
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
                  Auto-fitted to {selectedFittedPt.toFixed(1)} pt so it stays inside the label.
                </p>
              )}
            </div>

            <div className="grid grid-cols-7 gap-1">
              <button
                type="button"
                title="Bold"
                onClick={() => setSel({ bold: !selectedLayer.bold } as Partial<TextLayer>)}
                className={`grid h-8 place-items-center rounded-lg cursor-pointer ${
                  selectedLayer.bold ? "bg-[#4d7c0f] text-white" : "bg-[#f5f5f7] text-zinc-700"
                }`}
              >
                <Bold className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                title="Italic"
                onClick={() => setSel({ italic: !selectedLayer.italic } as Partial<TextLayer>)}
                className={`grid h-8 place-items-center rounded-lg cursor-pointer ${
                  selectedLayer.italic ? "bg-[#4d7c0f] text-white" : "bg-[#f5f5f7] text-zinc-700"
                }`}
              >
                <Italic className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                title="Underline"
                onClick={() => setSel({ underline: !selectedLayer.underline } as Partial<TextLayer>)}
                className={`grid h-8 place-items-center rounded-lg cursor-pointer ${
                  selectedLayer.underline ? "bg-[#4d7c0f] text-white" : "bg-[#f5f5f7] text-zinc-700"
                }`}
              >
                <Underline className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                title="UPPERCASE"
                onClick={() => setSel({ uppercase: !selectedLayer.uppercase } as Partial<TextLayer>)}
                className={`grid h-8 place-items-center rounded-lg text-[10px] font-bold cursor-pointer ${
                  selectedLayer.uppercase ? "bg-[#4d7c0f] text-white" : "bg-[#f5f5f7] text-zinc-700"
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
                  onClick={() => setSel({ align: al } as Partial<TextLayer>)}
                  className={`grid h-8 place-items-center rounded-lg cursor-pointer ${
                    selectedLayer.align === al ? "bg-[#4d7c0f] text-white" : "bg-[#f5f5f7] text-zinc-700"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>

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
                <div className="space-y-1.5">
                  <p className="font-semibold">Low readability ({selectedContrast.ratio.toFixed(1)}:1 contrast)</p>
                  <button
                    type="button"
                    onClick={() => setSel({ color: selectedContrast.suggestedHex } as Partial<TextLayer>)}
                    className="rounded-lg bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-zinc-950 hover:bg-amber-600 cursor-pointer"
                  >
                    Fix contrast automatically
                  </button>
                </div>
              </div>
            )}

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
              label={selectedLayer.kind === "frame" ? "Border colour" : "Fill colour"}
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
                  max={Math.round(Math.min(W, H) / 2)}
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
                <span>Thickness</span>
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
                <span>Stroke weight</span>
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

        {/* IMAGE / BARCODE / QR PROPERTIES */}
        {selectedLayer.kind === "image" && (
          <div className="space-y-3.5">
            {selectedLayer.barcodeText !== undefined ? (
              <>
                <div>
                  <label htmlFor={`${uid}-bc-fmt`} className="mb-1 block text-[11px] font-semibold text-zinc-700">
                    Barcode type
                  </label>
                  <select
                    id={`${uid}-bc-fmt`}
                    value={selectedLayer.barcodeFormat ?? "CODE128"}
                    onChange={(e) =>
                      setSel({ barcodeFormat: e.target.value as "CODE128" | "EAN13" | "UPC" } as Partial<ImageLayer>)
                    }
                    className="h-9 w-full rounded-xl bg-[#f5f5f7] px-3 text-xs text-zinc-950 focus:bg-white focus:outline-2 focus:outline-[#4d7c0f]"
                  >
                    <option value="CODE128">Code 128 (SKU / text / numbers)</option>
                    <option value="EAN13">EAN-13 (12 or 13 digits)</option>
                    <option value="UPC">UPC-A (11 or 12 digits)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor={`${uid}-bc-val`} className="mb-1 block text-[11px] font-semibold text-zinc-700">
                    Barcode value
                  </label>
                  <input
                    id={`${uid}-bc-val`}
                    type="text"
                    value={selectedLayer.barcodeText}
                    onChange={(e) => setSel({ barcodeText: e.target.value } as Partial<ImageLayer>, `bc-${selectedLayer.id}`)}
                    placeholder="SKU-1042"
                    className="h-9 w-full rounded-xl bg-[#f5f5f7] px-3 font-mono text-xs text-zinc-950 focus:bg-white focus:outline-2 focus:outline-[#4d7c0f]"
                  />
                  {barcodeErrorMap[selectedLayer.id] && (
                    <p className="mt-1 text-[11px] font-medium text-red-700">{barcodeErrorMap[selectedLayer.id]}</p>
                  )}
                </div>
              </>
            ) : selectedLayer.qrText !== undefined ? (
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
                    placeholder="https://your-shop.com"
                    className="h-9 w-full rounded-xl bg-[#f5f5f7] px-3 text-xs text-zinc-950 focus:bg-white focus:outline-2 focus:outline-[#4d7c0f]"
                  />
                </div>
                <AdvancedColorPicker
                  compact
                  label="QR colour"
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
                      Crop / Circle
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

        {/* ALIGNMENT */}
        <div className="space-y-2 border-t border-zinc-100 pt-3">
          <p className="text-[11px] font-semibold text-zinc-700">Align on {round ? "sticker" : "label"}</p>
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
            <button type="button" title="Align left" onClick={() => setSel({ x: 3 })} className="grid h-8 place-items-center rounded-lg bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced] cursor-pointer">
              <AlignStartVertical className="h-3.5 w-3.5" />
            </button>
            <button type="button" title="Align right" onClick={() => setSel({ x: round2(W - 3 - selectedBox.w) })} className="grid h-8 place-items-center rounded-lg bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced] cursor-pointer">
              <AlignEndVertical className="h-3.5 w-3.5" />
            </button>
            <button type="button" title="Align top" onClick={() => setSel({ y: 3 })} className="grid h-8 place-items-center rounded-lg bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced] cursor-pointer">
              <AlignStartHorizontal className="h-3.5 w-3.5" />
            </button>
            <button type="button" title="Align bottom" onClick={() => setSel({ y: round2(H - 3 - selectedBox.h) })} className="grid h-8 place-items-center rounded-lg bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced] cursor-pointer">
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
                    className="rounded bg-[#f5f5f7] px-1.5 py-0.5 text-[10px] text-zinc-700 cursor-pointer"
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
            {(
              [
                ["front", "Front", selectedIdx >= side.layers.length - 1],
                ["up", "Up", selectedIdx >= side.layers.length - 1],
                ["down", "Down", selectedIdx <= 0],
                ["back", "Back", selectedIdx <= 0],
              ] as const
            ).map(([dir, lbl, dis]) => (
              <button
                key={dir}
                type="button"
                disabled={dis}
                onClick={() => onReorderLayer(selectedLayer.id, dir)}
                className="rounded-lg bg-[#f5f5f7] py-1.5 text-[10px] font-semibold text-zinc-700 hover:bg-[#ebeced] disabled:opacity-40 cursor-pointer"
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {/* POSITION & SIZE */}
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
      <p className="text-[11px] font-semibold text-zinc-600">
        {side.layers.length} {side.layers.length === 1 ? "layer" : "layers"} (top first)
      </p>
      {side.layers.length === 0 ? (
        <div className="rounded-2xl bg-[#f5f5f7] p-4 text-center text-xs text-zinc-600">
          Empty canvas. Add text, logos, icons, QR codes or barcodes from the left panel.
        </div>
      ) : (
        <ul className="space-y-1">
          {[...side.layers].reverse().map((l, revIdx) => {
            const origIdx = side.layers.length - 1 - revIdx;
            const active = l.id === selectedId;
            const badge = () => {
              if (l.kind === "text") return <Type className="h-3.5 w-3.5 text-zinc-600" />;
              if (l.kind === "image" && l.barcodeText !== undefined) return <Barcode className="h-3.5 w-3.5 text-zinc-600" />;
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
                    <span className="shrink-0">{badge()}</span>
                    <span className="truncate">{layerLabel(l)}</span>
                  </button>
                  <button
                    type="button"
                    title="Move up"
                    disabled={origIdx >= side.layers.length - 1}
                    onClick={() => onReorderLayer(l.id, "up")}
                    className="grid h-7 w-7 place-items-center rounded-lg text-zinc-500 hover:bg-white disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    disabled={origIdx <= 0}
                    onClick={() => onReorderLayer(l.id, "down")}
                    className="grid h-7 w-7 place-items-center rounded-lg text-zinc-500 hover:bg-white disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    title={l.hidden ? "Show" : "Hide"}
                    onClick={() => onChangeLayer(l.id, { hidden: !l.hidden })}
                    className="grid h-7 w-7 place-items-center rounded-lg text-zinc-600 hover:bg-white cursor-pointer"
                  >
                    {l.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    type="button"
                    title={l.locked ? "Unlock" : "Lock"}
                    onClick={() => onChangeLayer(l.id, { locked: !l.locked })}
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
                      onClick={() => onDuplicateLayer(l.id)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold text-zinc-700 hover:bg-white cursor-pointer"
                    >
                      <Copy className="h-3 w-3" /> Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onRemoveLayer(l.id);
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
    ? (side.layers.find((l): l is ImageLayer => l.id === imageModal.layerId && l.kind === "image") ?? null)
    : null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#f5f5f7] text-zinc-950"
      role="dialog"
      aria-modal="true"
      aria-label="Advanced Label & Sticker Editor"
    >
      <input
        ref={imageUploadRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        className="sr-only"
        onChange={(e) => {
          void handleUploadStickerImage(e.target.files?.[0]);
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

          <div className="hidden sm:block h-5 w-px bg-zinc-200" />

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

          <div className="hidden md:inline-flex items-center rounded-xl bg-[#f5f5f7] p-0.5">
            <button
              type="button"
              title="Zoom out"
              aria-label="Zoom out"
              onClick={() => setZoom((z) => clamp(round2(z - 0.15), 0.5, 2.5))}
              className="grid h-8 w-7 place-items-center rounded-lg text-zinc-700 hover:bg-white cursor-pointer"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="Fit to screen"
              onClick={() => setZoom(1)}
              className="min-w-[46px] px-1.5 text-center font-mono text-[11px] font-semibold text-zinc-800 hover:text-[#4d7c0f] cursor-pointer"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              title="Zoom in"
              aria-label="Zoom in"
              onClick={() => setZoom((z) => clamp(round2(z + 0.15), 0.5, 2.5))}
              className="grid h-8 w-7 place-items-center rounded-lg text-zinc-700 hover:bg-white cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Shape Toggle (Rectangle / Round) */}
        <div className="flex items-center gap-2">
          <div role="group" aria-label="Label shape" className="inline-flex rounded-xl bg-[#f5f5f7] p-1">
            <button
              type="button"
              aria-pressed={!round}
              onClick={() => onChangeGrid({ ...grid, round: false })}
              className={`inline-flex min-h-[30px] items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition cursor-pointer ${
                !round ? "bg-white text-zinc-950 shadow-xs" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <Square className="h-3.5 w-3.5" />
              Rectangle
            </button>
            <button
              type="button"
              aria-pressed={round}
              onClick={() => {
                const d = Math.min(grid.labelW, grid.labelH);
                onChangeGrid({ ...grid, round: true, labelW: d, labelH: d });
              }}
              className={`inline-flex min-h-[30px] items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition cursor-pointer ${
                round ? "bg-white text-zinc-950 shadow-xs" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <Circle className="h-3.5 w-3.5" />
              Round
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          <span className="hidden xl:inline-flex items-center gap-1 rounded-full bg-[#eef6e4] px-2.5 py-1 text-[11px] font-semibold text-[#365314]">
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
            title="Save, share link, or load design file"
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

      {/* ==================== 3-PANE STUDIO ==================== */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* LEFT PANEL */}
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

        {/* CENTRE CANVAS */}
        <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200/80 bg-white/90 px-3 py-1.5 backdrop-blur-xs">
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                aria-pressed={showGuides}
                onClick={() => setShowGuides((v) => !v)}
                className={`inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-[11px] font-semibold cursor-pointer ${
                  showGuides ? "bg-[#eef6e4] text-[#365314]" : "bg-[#f5f5f7] text-zinc-600"
                }`}
              >
                <Ruler className="h-3.5 w-3.5" />
                Guides
              </button>
              <button
                type="button"
                aria-pressed={includeBleed}
                onClick={() => onToggleBleed(!includeBleed)}
                className={`inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-[11px] font-semibold cursor-pointer ${
                  includeBleed ? "bg-amber-100 text-amber-900 ring-1 ring-amber-400/60" : "bg-[#f5f5f7] text-zinc-600"
                }`}
              >
                Bleed 3 mm
              </button>
              <button
                type="button"
                aria-pressed={showGrid}
                onClick={() => setShowGrid((v) => !v)}
                className={`inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-[11px] font-semibold cursor-pointer ${
                  showGrid ? "bg-[#eef6e4] text-[#365314]" : "bg-[#f5f5f7] text-zinc-600"
                }`}
              >
                <Grid3x3 className="h-3.5 w-3.5" />
                Grid
              </button>
              <button
                type="button"
                aria-pressed={snapEnabled}
                onClick={() => setSnapEnabled((v) => !v)}
                className={`inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-[11px] font-semibold cursor-pointer ${
                  snapEnabled ? "bg-[#eef6e4] text-[#365314]" : "bg-[#f5f5f7] text-zinc-600"
                }`}
              >
                <Magnet className="h-3.5 w-3.5" />
                Snap
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {isListMode && listCount > 1 && (
                <span className="hidden sm:inline-flex h-7 items-center gap-1 rounded-full bg-[#eef6e4] px-2.5 text-[11px] font-semibold text-[#365314]">
                  <Sparkles className="h-3 w-3 text-[#4d7c0f]" />
                  Style applies to all {listCount} list items
                </span>
              )}
              {lowContrastList.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(lowContrastList[0].layer.id);
                    setRightTab("properties");
                    setMobileSheet("properties");
                  }}
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
                  className="hidden sm:inline-flex h-7 items-center gap-1 rounded-full bg-amber-50 px-2.5 text-[11px] font-semibold text-amber-900 ring-1 ring-amber-300 hover:bg-amber-100 cursor-pointer"
                >
                  Edge ink · Enable bleed
                </button>
              )}
              <button
                type="button"
                onClick={handleResetTemplate}
                className="hidden xl:inline-flex h-7 items-center gap-1 rounded-lg bg-[#f5f5f7] px-2 text-[11px] font-semibold text-zinc-600 hover:bg-[#ebeced] cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>
          </div>

          <AdvancedCanvas
            W={W}
            H={H}
            side={side}
            sideName="label"
            round={round}
            itemLabel={round ? "sticker" : "label"}
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
            onChange={(id, patch, group) => onChangeLayer(id, patch, group)}
            onZoomChange={setZoom}
            onEyedropperSample={(hex) => {
              eyedropperCb?.(hex);
              setEyedropperCb(null);
              setToast(`Sampled ${hex.toUpperCase()}`);
            }}
            onCancelEyedropper={() => setEyedropperCb(null)}
            onDropImageFile={(file) => void handleUploadStickerImage(file)}
          />

          {toast && (
            <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full bg-zinc-950 px-4 py-2 text-xs font-semibold text-white shadow-lg">
              {toast}
            </div>
          )}

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
                    markLabelTourSeen();
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
                  className="rounded-lg bg-[#f5f5f7] px-3 py-1.5 text-xs font-semibold text-zinc-700 disabled:opacity-40 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (tourStep >= TOUR_STEPS.length - 1) {
                      markLabelTourSeen();
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
                  ["Hold Alt while dragging", "Bypass snap"],
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

        {/* RIGHT PANEL */}
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
              Layers ({side.layers.length})
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3.5">
            {rightTab === "properties" ? renderPropertiesContent() : renderLayersContent()}
          </div>
        </aside>
      </div>

      {/* MOBILE / TABLET BOTTOM BAR */}
      <div className="lg:hidden shrink-0 border-t border-zinc-200 bg-white px-2 py-1.5">
        <div className="flex items-center justify-around gap-1">
          {(
            [
              ["add", "Add", Shapes, "md:hidden"],
              ["properties", "Edit", SlidersHorizontal, ""],
              ["layers", `Layers (${side.layers.length})`, Layers, ""],
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

      {/* SUB-MODALS */}
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
        <LabelPrintExportModal
          side={side}
          grid={grid}
          labelCount={labelCount}
          pageCount={pageCount}
          cutGuideStyle={cutGuideStyle}
          includeBleed={includeBleed}
          slotOverrides={slotOverrides}
          onChangeGrid={onChangeGrid}
          onChangeCutGuideStyle={onChangeCutGuideStyle}
          onToggleBleed={onToggleBleed}
          onClose={() => setExportOpen(false)}
        />
      )}

      {saveOpen && (
        <LabelSaveShareModal
          payload={persistedPayload}
          onLoadPayload={(loaded) => {
            onLoadPayload(loaded);
            setSelectedId(null);
            setEditingTextId(null);
            setToast("Label design loaded!");
          }}
          onClose={() => setSaveOpen(false)}
        />
      )}
    </div>,
    document.body
  );
}
