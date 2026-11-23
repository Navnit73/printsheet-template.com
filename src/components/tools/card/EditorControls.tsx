"use client";

import React, { useId, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bookmark,
  Check,
  ChevronDown,
  Copy,
  Download,
  FileCode2,
  FileImage,
  FileText,
  FolderOpen,
  ImagePlus,
  Link2,
  Pipette,
  Plus,
  RotateCcw,
  Save,
  Scissors,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { checkGridFit, fileToDataUrl, loadImageElement, PAPER_SIZES, PRINTER_SAFE_MARGIN_MM } from "@/lib/pdf-utils";
import { useNumberField } from "@/lib/use-number-field";
import { CARD_FONTS, getCardFont, type FontCategory } from "./fonts";
import {
  PAPER_SHORT,
  previewFit,
  SHEET_PRESETS,
  type BackStyleId,
  type CardContent,
  type CutGuideStyle,
  type Fonts,
  type PatternKind,
  type SheetPreset,
  type SheetPresetId,
} from "./engine";
import {
  buildTemplateDesign,
  compileSide,
  GALLERY_TEMPLATES,
  getSideBackground,
  type CardDesign,
  type GalleryTemplateId,
  type SideBackground,
  type SideDesign,
} from "./editor-model";
import { CardFacePreview } from "./CardFacePreview";
import { isEdgeToEdgeOrDarkSide } from "./contrast";
import {
  buildShareLink,
  deleteNamedSnapshot,
  downloadDesignJson,
  exportAdvancedPdf,
  exportSidePng,
  exportSideSvg,
  loadSavedSnapshots,
  parseDesignJson,
  saveNamedSnapshot,
  type NamedDesignSnapshot,
  type PersistedCardDesign,
} from "./export";

/* ------------------------------------------------------------------------- */
/* 1. Advanced Color Picker (Swatches + Saved Brand Colours + Eyedropper)    */
/* ------------------------------------------------------------------------- */

const QUICK_SWATCHES = [
  "#111111",
  "#ffffff",
  "#52525b",
  "#3f6212",
  "#4d7c0f",
  "#f59e0b",
  "#1e3a8a",
  "#0f766e",
  "#9f1239",
  "#c2410c",
  "#6b21a8",
  "#f5f5f4",
];

declare global {
  interface Window {
    EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> };
  }
}

export function AdvancedColorPicker({
  label,
  value,
  brandColors,
  onChange,
  onAddBrandColor,
  onRemoveBrandColor,
  onRequestCanvasEyedropper,
  compact = false,
}: {
  label: string;
  value: string;
  brandColors: string[];
  onChange: (hex: string) => void;
  onAddBrandColor: (hex: string) => void;
  onRemoveBrandColor: (hex: string) => void;
  onRequestCanvasEyedropper?: (onPicked: (hex: string) => void) => void;
  compact?: boolean;
}) {
  const id = useId();
  const [editingHex, setEditingHex] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);

  const normalized = /^#[0-9a-f]{6}$/i.test(value) ? value : "#18181b";
  const isSaved = brandColors.some((c) => c.toLowerCase() === normalized.toLowerCase());
  const displayHex = editingHex !== null ? editingHex : normalized.toUpperCase();

  async function handleEyedropper() {
    if (typeof window !== "undefined" && window.EyeDropper) {
      try {
        setPicking(true);
        const dropper = new window.EyeDropper();
        const result = await dropper.open();
        if (result?.sRGBHex) {
          onChange(result.sRGBHex);
          setEditingHex(null);
        }
      } catch {
        // user cancelled
      } finally {
        setPicking(false);
      }
      return;
    }
    if (onRequestCanvasEyedropper) {
      onRequestCanvasEyedropper((hex) => {
        onChange(hex);
        setEditingHex(null);
      });
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-[11px] font-semibold text-zinc-700">
          {label}
        </label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Pick a colour from your screen or card"
            onClick={() => void handleEyedropper()}
            className={`inline-flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-semibold transition cursor-pointer ${
              picking ? "bg-amber-500 text-zinc-950" : "bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced]"
            }`}
          >
            <Pipette className="h-3 w-3" />
            Eyedropper
          </button>
          {!isSaved && (
            <button
              type="button"
              title="Save this colour to Brand Colours"
              onClick={() => onAddBrandColor(normalized)}
              className="inline-flex h-7 items-center gap-1 rounded-lg bg-[#eef6e4] px-2 text-[11px] font-semibold text-[#365314] hover:bg-[#dff0c8] cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              Save
            </button>
          )}
        </div>
      </div>

      {/* Color input + Hex input */}
      <div className="flex items-center gap-2">
        <label className="relative h-9 w-11 shrink-0 cursor-pointer overflow-hidden rounded-xl ring-1 ring-zinc-300">
          <span className="block h-full w-full" style={{ backgroundColor: normalized }} />
          <input
            id={id}
            type="color"
            value={normalized}
            onChange={(e) => {
              onChange(e.target.value);
              setEditingHex(null);
            }}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
        <input
          type="text"
          aria-label={`${label} hex code`}
          value={displayHex}
          onFocus={() => setEditingHex(normalized.toUpperCase())}
          onChange={(e) => {
            const v = e.target.value;
            setEditingHex(v);
            const cleaned = v.trim().startsWith("#") ? v.trim() : `#${v.trim()}`;
            if (/^#[0-9a-f]{6}$/i.test(cleaned)) {
              onChange(cleaned);
            }
          }}
          onBlur={() => setEditingHex(null)}
          className="h-9 min-w-0 flex-1 rounded-xl bg-[#f5f5f7] px-3 font-mono text-xs text-zinc-900 focus:bg-white focus:outline-2 focus:outline-[#4d7c0f]"
          placeholder="#3F6212"
        />
      </div>

      {/* Saved Brand Colours */}
      {brandColors.length > 0 && (
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Brand colours</p>
          <div className="flex flex-wrap gap-1.5">
            {brandColors.map((hex) => {
              const active = normalized.toLowerCase() === hex.toLowerCase();
              return (
                <div key={hex} className="group relative">
                  <button
                    type="button"
                    title={`Brand colour ${hex.toUpperCase()}`}
                    aria-label={`Use brand colour ${hex}`}
                    onClick={() => {
                      onChange(hex);
                      setEditingHex(null);
                    }}
                    className={`h-6 w-6 rounded-full transition cursor-pointer ${
                      active ? "ring-2 ring-[#4d7c0f] ring-offset-1" : "ring-1 ring-black/15 hover:scale-110"
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                  {brandColors.length > 1 && (
                    <button
                      type="button"
                      aria-label={`Remove ${hex} from brand colours`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveBrandColor(hex);
                      }}
                      className="absolute -right-1 -top-1 hidden h-3.5 w-3.5 items-center justify-center rounded-full bg-zinc-900 text-white group-hover:flex cursor-pointer"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Swatches */}
      {!compact && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {QUICK_SWATCHES.map((hex) => {
            const active = normalized.toLowerCase() === hex.toLowerCase();
            return (
              <button
                key={hex}
                type="button"
                title={hex.toUpperCase()}
                aria-label={`${label} ${hex}`}
                onClick={() => {
                  onChange(hex);
                  setEditingHex(null);
                }}
                className={`h-6 w-6 rounded-full transition cursor-pointer ${
                  active ? "ring-2 ring-[#4d7c0f] ring-offset-1" : "ring-1 ring-black/15 hover:scale-110"
                }`}
                style={{ backgroundColor: hex }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* 2. Searchable Font Picker with Live Preview                                */
/* ------------------------------------------------------------------------- */

const FONT_CATS: Array<{ id: "all" | FontCategory; label: string }> = [
  { id: "all", label: "All" },
  { id: "sans", label: "Sans" },
  { id: "serif", label: "Serif" },
  { id: "display", label: "Display" },
  { id: "mono", label: "Mono" },
];

export function FontPicker({
  value,
  sampleText,
  onChange,
}: {
  value?: string;
  sampleText?: string;
  onChange: (fontId: string, pdfFallback: "helvetica" | "times" | "courier") => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<"all" | FontCategory>("all");
  const current = getCardFont(value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CARD_FONTS.filter((f) => {
      if (cat !== "all" && f.category !== cat) return false;
      if (!q) return true;
      return f.name.toLowerCase().includes(q) || f.hint.toLowerCase().includes(q) || f.category.includes(q);
    });
  }, [query, cat]);

  const preview = (sampleText || "Alex Morgan").trim().split("\n")[0].slice(0, 22) || "Aa Bb Cc";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-[40px] w-full items-center justify-between gap-2 rounded-xl bg-[#f5f5f7] px-3 py-2 text-left text-xs font-semibold text-zinc-900 hover:bg-[#ebeced] cursor-pointer"
      >
        <span className="truncate text-sm" style={{ fontFamily: current.cssFamily }}>
          {current.name}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-zinc-500 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-1.5 rounded-2xl border border-zinc-200 bg-white p-2.5 shadow-lg">
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fonts…"
              className="h-8 w-full rounded-lg bg-[#f5f5f7] pl-8 pr-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-2 focus:outline-[#4d7c0f]"
              autoFocus
            />
          </div>
          <div className="mb-2 flex flex-wrap gap-1">
            {FONT_CATS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCat(c.id)}
                className={`rounded-lg px-2 py-1 text-[10px] font-semibold transition cursor-pointer ${
                  cat === c.id ? "bg-[#4d7c0f] text-white" : "bg-[#f5f5f7] text-zinc-600 hover:bg-[#ebeced]"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="max-h-56 space-y-1 overflow-y-auto pr-0.5">
            {filtered.length === 0 ? (
              <p className="py-4 text-center text-xs text-zinc-500">No fonts match &ldquo;{query}&rdquo;</p>
            ) : (
              filtered.map((f) => {
                const active = f.id === current.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      onChange(f.id, f.pdfFallback);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left transition cursor-pointer ${
                      active ? "bg-[#eef6e4] ring-1 ring-[#4d7c0f]" : "hover:bg-[#f5f5f7]"
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-zinc-950" style={{ fontFamily: f.cssFamily }}>
                        {preview}
                      </span>
                      <span className="block text-[10px] text-zinc-500">
                        {f.name} · {f.hint}
                      </span>
                    </div>
                    {active && <Check className="h-3.5 w-3.5 shrink-0 text-[#4d7c0f]" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* 3. Background Panel (Solid / Gradient / Pattern / Uploaded Image)          */
/* ------------------------------------------------------------------------- */

const GRADIENT_PRESETS = [
  { name: "Forest Dawn", from: "#1a2e05", to: "#4d7c0f", angle: 135 },
  { name: "Midnight Slate", from: "#0f172a", to: "#334155", angle: 135 },
  { name: "Warm Amber", from: "#92400e", to: "#f59e0b", angle: 120 },
  { name: "Ocean Deep", from: "#0f766e", to: "#1e3a8a", angle: 135 },
  { name: "Soft Ivory", from: "#ffffff", to: "#f5f5f4", angle: 180 },
  { name: "Plum Dusk", from: "#3b0764", to: "#9f1239", angle: 135 },
  { name: "Sage Mist", from: "#ecfccb", to: "#f5f5f7", angle: 145 },
  { name: "Graphite", from: "#18181b", to: "#27272a", angle: 160 },
];

const PATTERN_OPTIONS: Array<{ id: PatternKind; label: string }> = [
  { id: "dots", label: "Dots" },
  { id: "grid", label: "Fine grid" },
  { id: "diagonal", label: "Diagonal" },
  { id: "crosshatch", label: "Crosshatch" },
  { id: "waves", label: "Waves" },
  { id: "diamonds", label: "Diamonds" },
];

export function BackgroundPanel({
  side,
  sideName,
  brandColors,
  onSetBackground,
  onAddBrandColor,
  onRemoveBrandColor,
  onRequestEyedropper,
  onError,
}: {
  side: SideDesign;
  sideName: "front" | "back";
  brandColors: string[];
  onSetBackground: (bg: SideBackground, group?: string) => void;
  onAddBrandColor: (hex: string) => void;
  onRemoveBrandColor: (hex: string) => void;
  onRequestEyedropper?: (onPicked: (hex: string) => void) => void;
  onError: (msg: string) => void;
}) {
  const bg = getSideBackground(side);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleBgImageUpload(file: File | undefined) {
    if (!file) return;
    try {
      const raw = await fileToDataUrl(file);
      const img = await loadImageElement(raw);
      const nw = img.naturalWidth || 800;
      const nh = img.naturalHeight || 500;
      const scale = Math.min(1, 1600 / Math.max(nw, nh));
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(nw * scale));
      c.height = Math.max(1, Math.round(nh * scale));
      const ctx = c.getContext("2d");
      if (!ctx) throw new Error("Canvas error");
      ctx.drawImage(img, 0, 0, c.width, c.height);
      const dataUrl = c.toDataURL("image/jpeg", 0.9);
      onSetBackground({
        type: "image",
        src: dataUrl,
        fit: "cover",
        opacity: 1,
        tint: "none",
        tintOpacity: 0.35,
      });
    } catch {
      onError("Could not read that background image. Try a PNG or JPG.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-1 rounded-xl bg-[#f5f5f7] p-1">
        {(
          [
            ["solid", "Solid"],
            ["gradient", "Gradient"],
            ["pattern", "Pattern"],
            ["image", "Image"],
          ] as const
        ).map(([t, label]) => {
          const active = bg.type === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => {
                if (t === bg.type) return;
                if (t === "solid") onSetBackground({ type: "solid", color: side.bg || "#ffffff" });
                else if (t === "gradient") onSetBackground({ type: "gradient", from: side.bg === "#ffffff" ? "#1a2e05" : side.bg, to: "#4d7c0f", angle: 135 });
                else if (t === "pattern") onSetBackground({ type: "pattern", bg: "#ffffff", fg: "#4d7c0f", pattern: "dots", opacity: 0.16, scale: 1 });
                else onSetBackground({ type: "image", src: bg.type === "image" ? bg.src : "", fit: "cover", opacity: 1, tint: "none", tintOpacity: 0.35 });
              }}
              className={`rounded-lg py-1.5 text-[11px] font-semibold transition cursor-pointer ${
                active ? "bg-white text-zinc-950 shadow-xs" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {bg.type === "solid" && (
        <AdvancedColorPicker
          label={`Card ${sideName} colour`}
          value={bg.color}
          brandColors={brandColors}
          onChange={(color) => onSetBackground({ type: "solid", color }, `bg-${sideName}`)}
          onAddBrandColor={onAddBrandColor}
          onRemoveBrandColor={onRemoveBrandColor}
          onRequestCanvasEyedropper={onRequestEyedropper}
        />
      )}

      {bg.type === "gradient" && (
        <div className="space-y-3.5">
          <div>
            <p className="mb-1.5 text-[11px] font-semibold text-zinc-700">Gradient presets</p>
            <div className="grid grid-cols-4 gap-1.5">
              {GRADIENT_PRESETS.map((gp) => (
                <button
                  key={gp.name}
                  type="button"
                  title={gp.name}
                  onClick={() => onSetBackground({ type: "gradient", from: gp.from, to: gp.to, angle: gp.angle })}
                  className="h-9 rounded-xl ring-1 ring-black/10 transition hover:scale-105 cursor-pointer"
                  style={{ backgroundImage: `linear-gradient(${gp.angle}deg, ${gp.from}, ${gp.to})` }}
                />
              ))}
            </div>
          </div>
          <AdvancedColorPicker
            compact
            label="Start colour"
            value={bg.from}
            brandColors={brandColors}
            onChange={(from) => onSetBackground({ ...bg, from }, `bg-gf-${sideName}`)}
            onAddBrandColor={onAddBrandColor}
            onRemoveBrandColor={onRemoveBrandColor}
            onRequestCanvasEyedropper={onRequestEyedropper}
          />
          <AdvancedColorPicker
            compact
            label="End colour"
            value={bg.to}
            brandColors={brandColors}
            onChange={(to) => onSetBackground({ ...bg, to }, `bg-gt-${sideName}`)}
            onAddBrandColor={onAddBrandColor}
            onRemoveBrandColor={onRemoveBrandColor}
            onRequestCanvasEyedropper={onRequestEyedropper}
          />
          <div>
            <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-zinc-700">
              <span>Angle</span>
              <span className="font-mono text-zinc-500">{bg.angle}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              step={5}
              value={bg.angle}
              onChange={(e) => onSetBackground({ ...bg, angle: Number(e.target.value) }, `bg-ga-${sideName}`)}
              className="w-full accent-[#4d7c0f]"
            />
            <div className="mt-1.5 flex gap-1">
              {[0, 45, 90, 135, 180].map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => onSetBackground({ ...bg, angle: a })}
                  className={`flex-1 rounded-lg py-1 text-[10px] font-semibold cursor-pointer ${
                    bg.angle === a ? "bg-[#4d7c0f] text-white" : "bg-[#f5f5f7] text-zinc-600 hover:bg-[#ebeced]"
                  }`}
                >
                  {a}°
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {bg.type === "pattern" && (
        <div className="space-y-3.5">
          <div>
            <p className="mb-1.5 text-[11px] font-semibold text-zinc-700">Pattern style</p>
            <div className="grid grid-cols-2 gap-1.5">
              {PATTERN_OPTIONS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSetBackground({ ...bg, pattern: p.id })}
                  className={`rounded-xl px-2.5 py-2 text-xs font-semibold transition cursor-pointer ${
                    bg.pattern === p.id ? "bg-[#eef6e4] text-[#365314] ring-1 ring-[#4d7c0f]" : "bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <AdvancedColorPicker
            compact
            label="Base colour"
            value={bg.bg}
            brandColors={brandColors}
            onChange={(color) => onSetBackground({ ...bg, bg: color }, `bg-pb-${sideName}`)}
            onAddBrandColor={onAddBrandColor}
            onRemoveBrandColor={onRemoveBrandColor}
            onRequestCanvasEyedropper={onRequestEyedropper}
          />
          <AdvancedColorPicker
            compact
            label="Pattern colour"
            value={bg.fg}
            brandColors={brandColors}
            onChange={(fg) => onSetBackground({ ...bg, fg }, `bg-pf-${sideName}`)}
            onAddBrandColor={onAddBrandColor}
            onRemoveBrandColor={onRemoveBrandColor}
            onRequestCanvasEyedropper={onRequestEyedropper}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 flex justify-between text-[11px] font-semibold text-zinc-700">
                <span>Visibility</span>
                <span className="font-mono text-zinc-500">{Math.round(bg.opacity * 100)}%</span>
              </label>
              <input
                type="range"
                min={0.05}
                max={0.7}
                step={0.05}
                value={bg.opacity}
                onChange={(e) => onSetBackground({ ...bg, opacity: Number(e.target.value) }, `bg-po-${sideName}`)}
                className="w-full accent-[#4d7c0f]"
              />
            </div>
            <div>
              <label className="mb-1 flex justify-between text-[11px] font-semibold text-zinc-700">
                <span>Size</span>
                <span className="font-mono text-zinc-500">{bg.scale.toFixed(1)}×</span>
              </label>
              <input
                type="range"
                min={0.6}
                max={2.4}
                step={0.1}
                value={bg.scale}
                onChange={(e) => onSetBackground({ ...bg, scale: Number(e.target.value) }, `bg-ps-${sideName}`)}
                className="w-full accent-[#4d7c0f]"
              />
            </div>
          </div>
        </div>
      )}

      {bg.type === "image" && (
        <div className="space-y-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              void handleBgImageUpload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {bg.src ? (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-2xl ring-1 ring-zinc-200" style={{ aspectRatio: "90 / 55" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={bg.src} alt="Background" className="h-full w-full object-cover" />
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex-1 rounded-xl bg-[#f5f5f7] py-2 text-xs font-semibold text-zinc-800 hover:bg-[#ebeced] cursor-pointer"
                >
                  Replace photo
                </button>
                <button
                  type="button"
                  onClick={() => onSetBackground({ type: "solid", color: "#ffffff" })}
                  className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 cursor-pointer"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {(["cover", "contain"] as const).map((fit) => (
                  <button
                    key={fit}
                    type="button"
                    onClick={() => onSetBackground({ ...bg, fit })}
                    className={`rounded-xl py-1.5 text-xs font-semibold cursor-pointer ${
                      bg.fit === fit ? "bg-[#4d7c0f] text-white" : "bg-[#f5f5f7] text-zinc-700"
                    }`}
                  >
                    {fit === "cover" ? "Fill card" : "Fit inside"}
                  </button>
                ))}
              </div>
              <div>
                <label className="mb-1 flex justify-between text-[11px] font-semibold text-zinc-700">
                  <span>Photo opacity</span>
                  <span className="font-mono text-zinc-500">{Math.round((bg.opacity ?? 1) * 100)}%</span>
                </label>
                <input
                  type="range"
                  min={0.15}
                  max={1}
                  step={0.05}
                  value={bg.opacity ?? 1}
                  onChange={(e) => onSetBackground({ ...bg, opacity: Number(e.target.value) }, `bg-io-${sideName}`)}
                  className="w-full accent-[#4d7c0f]"
                />
              </div>
              <div>
                <p className="mb-1 text-[11px] font-semibold text-zinc-700">Readability tint overlay</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    ["none", "None"],
                    ["#000000", "Dark"],
                    ["#ffffff", "Light"],
                    ["#1a2e05", "Forest"],
                  ].map(([tint, lbl]) => (
                    <button
                      key={tint}
                      type="button"
                      onClick={() => onSetBackground({ ...bg, tint })}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold cursor-pointer ${
                        (bg.tint ?? "none") === tint ? "bg-[#4d7c0f] text-white" : "bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced]"
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
                {bg.tint && bg.tint !== "none" && (
                  <div className="mt-2">
                    <label className="mb-1 flex justify-between text-[11px] font-semibold text-zinc-700">
                      <span>Tint strength</span>
                      <span className="font-mono text-zinc-500">{Math.round((bg.tintOpacity ?? 0.35) * 100)}%</span>
                    </label>
                    <input
                      type="range"
                      min={0.1}
                      max={0.85}
                      step={0.05}
                      value={bg.tintOpacity ?? 0.35}
                      onChange={(e) => onSetBackground({ ...bg, tintOpacity: Number(e.target.value) }, `bg-it-${sideName}`)}
                      className="w-full accent-[#4d7c0f]"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-300 bg-[#fafafa] px-4 py-8 text-center hover:border-[#4d7c0f] hover:bg-[#f7fbf1] cursor-pointer"
            >
              <ImagePlus className="h-6 w-6 text-[#4d7c0f]" />
              <span className="text-xs font-bold text-zinc-900">Upload background image</span>
              <span className="text-[11px] text-zinc-500">JPG, PNG or WebP · fills the whole card</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* 4. Template Gallery with Live Mini Previews + Reset to Template            */
/* ------------------------------------------------------------------------- */

export function TemplateGalleryPanel({
  activeTemplateId,
  W,
  H,
  accentHex,
  content,
  tagline,
  backStyle,
  logo,
  qr,
  fonts,
  onApplyTemplate,
  onResetCurrent,
}: {
  activeTemplateId: GalleryTemplateId;
  W: number;
  H: number;
  accentHex: string;
  content: CardContent;
  tagline: string;
  backStyle: BackStyleId;
  logo: { src: string; w: number; h: number } | null;
  qr: { src: string; target: string } | null;
  fonts: Fonts;
  onApplyTemplate: (templateId: GalleryTemplateId) => void;
  onResetCurrent: () => void;
}) {
  const previews = useMemo(() => {
    return GALLERY_TEMPLATES.map((tpl) => {
      const built = buildTemplateDesign({
        templateId: tpl.id,
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
      const compiled = compileSide(built.front, W, H, previewFit);
      return { tpl, els: compiled.els };
    });
  }, [W, H, accentHex, content, tagline, backStyle, logo, qr, fonts]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-zinc-900">Start from a template</p>
        <button
          type="button"
          onClick={onResetCurrent}
          title="Reset the card back to your current template layout"
          className="inline-flex items-center gap-1 rounded-lg bg-[#f5f5f7] px-2.5 py-1.5 text-[11px] font-semibold text-zinc-700 hover:bg-[#ebeced] cursor-pointer"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>
      <p className="text-[11px] leading-relaxed text-zinc-600">
        Your name, contact details, logo and QR code carry over automatically. Press Undo any time to go back.
      </p>
      <div className="grid grid-cols-1 gap-2.5">
        {previews.map(({ tpl, els }) => {
          const active = tpl.id === activeTemplateId;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onApplyTemplate(tpl.id)}
              className={`group rounded-2xl p-2 text-left transition cursor-pointer ${
                active ? "bg-[#eef6e4] ring-2 ring-[#4d7c0f]" : "bg-[#f5f5f7] hover:bg-[#ebeced]"
              }`}
            >
              <div
                className="relative w-full overflow-hidden rounded-lg bg-white ring-1 ring-zinc-200"
                style={{ aspectRatio: `${W} / ${H}`, containerType: "inline-size" }}
              >
                {tpl.id === "blank" ? (
                  <div className="flex h-full w-full items-center justify-center text-[11px] text-zinc-400">Blank canvas</div>
                ) : (
                  <CardFacePreview W={W} H={H} els={els} images={{ logo: logo?.src, qr: qr?.src }} label={tpl.label} />
                )}
              </div>
              <div className="mt-1.5 flex items-center justify-between px-0.5">
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-950">
                    {tpl.label}
                    {tpl.badge && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
                        <Sparkles className="h-2.5 w-2.5" />
                        {tpl.badge}
                      </span>
                    )}
                  </span>
                  <span className="block text-[10px] text-zinc-600">{tpl.hint}</span>
                </div>
                {active && <Check className="h-4 w-4 text-[#4d7c0f]" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* 5. Print & Export Modal (PDF sheet/single, PNG, SVG, Paper/Count, Bleed)   */
/* ------------------------------------------------------------------------- */

function ModalNum({
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
  const f = useNumberField(value, (v) => onChange(Math.round(v * 100) / 100), { min, max, unit });
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[10px] font-semibold text-zinc-600">
        {label}
      </label>
      <input
        id={id}
        type="text"
        className="h-9 w-full rounded-xl bg-white px-2.5 text-xs text-zinc-950 ring-1 ring-zinc-200 focus:outline-2 focus:outline-[#4d7c0f]"
        {...f.inputProps}
      />
    </div>
  );
}

const CUT_GUIDE_OPTIONS: Array<{ id: CutGuideStyle; label: string; hint: string; badge?: string }> = [
  { id: "dashed-grid", label: "Easy cut lines", hint: "Full dashed lines across the page — easiest for scissors & ruler", badge: "Easiest" },
  { id: "card-outline", label: "Card outlines", hint: "Thin dashed box around every card + margin ticks" },
  { id: "crop-marks", label: "Pro corner marks", hint: "Outer & gap corner marks — for paper trimmers" },
  { id: "none", label: "No guides", hint: "Clean sheet — for pre-cut card paper" },
];

export function PrintExportModal({
  design,
  sheetId,
  customSheet,
  sheet,
  includeBack,
  cutGuideStyle,
  singleCut,
  includeBleed,
  offsetX,
  offsetY,
  onChangeSheetId,
  onChangeCustomSheet,
  onToggleBack,
  onChangeCutGuideStyle,
  onToggleSingleCut,
  onToggleBleed,
  onClose,
}: {
  design: CardDesign;
  sheetId: SheetPresetId | "custom";
  customSheet: { paper: "a4" | "letter" | "a3"; cols: number; rows: number; cardW: number; cardH: number; gapX: number; gapY: number };
  sheet: SheetPreset;
  includeBack: boolean;
  cutGuideStyle: CutGuideStyle;
  singleCut: boolean;
  includeBleed: boolean;
  offsetX: number;
  offsetY: number;
  onChangeSheetId: (id: SheetPresetId | "custom") => void;
  onChangeCustomSheet: (patch: Partial<typeof customSheet>) => void;
  onToggleBack: (on: boolean) => void;
  onChangeCutGuideStyle: (style: CutGuideStyle) => void;
  onToggleSingleCut: (on: boolean) => void;
  onToggleBleed: (on: boolean) => void;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const paper = PAPER_SIZES[sheet.paper];
  const paperShort = PAPER_SHORT[sheet.paper];
  const cardCount = sheet.cols * sheet.rows;
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

  const frontEdge = isEdgeToEdgeOrDarkSide(design.front, sheet.cardW, sheet.cardH);
  const backEdge = includeBack ? isEdgeToEdgeOrDarkSide(design.back, sheet.cardW, sheet.cardH) : { isDark: false, touchesEdge: false };
  const hasDarkEdge = frontEdge.isDark || frontEdge.touchesEdge || backEdge.isDark || backEdge.touchesEdge;
  const maxSheetBleed = Math.min(3, sheet.cols > 1 ? sheet.gapX / 2 : 3, sheet.rows > 1 ? sheet.gapY / 2 : 3);

  async function runExport(key: string, fn: () => Promise<string>) {
    setBusy(key);
    setNotice(null);
    try {
      const msg = await fn();
      setNotice({ tone: "success", text: msg });
    } catch (err) {
      setNotice({ tone: "error", text: err instanceof Error ? err.message : "Export failed. Please try again." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Download print-ready files"
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-zinc-950">Print &amp; Export</h3>
            <p className="text-xs text-zinc-600">Choose your paper, cards per page, cut guides, and file format.</p>
          </div>
          <button
            type="button"
            aria-label="Close export modal"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {/* Paper size & cards per page */}
          <section className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">1. Paper size &amp; cards per page</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.values(SHEET_PRESETS).map((preset) => {
                const active = sheetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onChangeSheetId(preset.id)}
                    className={`rounded-xl px-3.5 py-2.5 text-left transition cursor-pointer ${
                      active ? "bg-[#eef6e4] ring-2 ring-[#4d7c0f]" : "bg-[#f5f5f7] hover:bg-[#ebeced]"
                    }`}
                  >
                    <span className={`block text-xs font-bold ${active ? "text-[#365314]" : "text-zinc-900"}`}>{preset.label}</span>
                    <span className="mt-0.5 block text-[11px] text-zinc-600">{preset.note}</span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => {
                if (sheetId !== "custom") {
                  const { paper: pp, cols, rows, cardW, cardH, gapX, gapY } = sheet;
                  onChangeCustomSheet({ paper: pp, cols, rows, cardW, cardH, gapX, gapY });
                }
                onChangeSheetId("custom");
              }}
              className={`w-full rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition cursor-pointer ${
                sheetId === "custom" ? "bg-[#eef6e4] text-[#365314] ring-2 ring-[#4d7c0f]" : "bg-[#f5f5f7] text-zinc-800 hover:bg-[#ebeced]"
              }`}
            >
              Custom paper, card dimensions &amp; count per page…
            </button>

            {sheetId === "custom" && (
              <div className="space-y-3 rounded-2xl bg-[#f5f5f7] p-3.5">
                <div className="grid grid-cols-3 gap-2">
                  {(["a4", "letter", "a3"] as const).map((pid) => (
                    <button
                      key={pid}
                      type="button"
                      onClick={() => onChangeCustomSheet({ paper: pid })}
                      className={`rounded-xl py-2 text-xs font-semibold cursor-pointer ${
                        customSheet.paper === pid ? "bg-[#4d7c0f] text-white" : "bg-white text-zinc-700 hover:bg-zinc-100"
                      }`}
                    >
                      {PAPER_SHORT[pid]}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  <ModalNum label="Across" unit="" value={customSheet.cols} min={1} max={12} onChange={(cols) => onChangeCustomSheet({ cols: Math.round(cols) })} />
                  <ModalNum label="Down" unit="" value={customSheet.rows} min={1} max={20} onChange={(rows) => onChangeCustomSheet({ rows: Math.round(rows) })} />
                  <ModalNum label="Width" value={customSheet.cardW} min={20} max={200} onChange={(cardW) => onChangeCustomSheet({ cardW })} />
                  <ModalNum label="Height" value={customSheet.cardH} min={20} max={200} onChange={(cardH) => onChangeCustomSheet({ cardH })} />
                  <ModalNum label="Gap X" value={customSheet.gapX} min={0} max={40} onChange={(gapX) => onChangeCustomSheet({ gapX })} />
                  <ModalNum label="Gap Y" value={customSheet.gapY} min={0} max={40} onChange={(gapY) => onChangeCustomSheet({ gapY })} />
                </div>
                {gridBad && (
                  <p className="text-xs font-medium text-red-700">
                    Doesn&rsquo;t fit on {paperShort}. Maximum {gridCheck.maxCols} across × {gridCheck.maxRows} down at this card size.
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Print & cutting options */}
          <section className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">2. Cutting guides, bleed &amp; sides</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CUT_GUIDE_OPTIONS.map((opt) => {
                const active = cutGuideStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeCutGuideStyle(opt.id)}
                    className={`rounded-xl px-3 py-2.5 text-left transition cursor-pointer ${
                      active ? "bg-[#eef6e4] ring-2 ring-[#4d7c0f]" : "bg-[#f5f5f7] hover:bg-[#ebeced]"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-950">
                      <Scissors className={`h-3.5 w-3.5 shrink-0 ${active ? "text-[#4d7c0f]" : "text-zinc-500"}`} />
                      {opt.label}
                      {opt.badge && (
                        <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-900">
                          {opt.badge}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-zinc-600">{opt.hint}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-[#f5f5f7] p-3 text-xs">
                <input
                  type="checkbox"
                  checked={singleCut}
                  disabled={sheetId === "custom"}
                  onChange={(e) => onToggleSingleCut(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#4d7c0f]"
                />
                <span>
                  <span className="block font-bold text-zinc-900">Single-cut edges</span>
                  <span className="text-[11px] text-zinc-600">Cards touch — half as many cuts, no tiny strips</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-[#f5f5f7] p-3 text-xs">
                <input
                  type="checkbox"
                  checked={includeBleed}
                  onChange={(e) => onToggleBleed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#4d7c0f]"
                />
                <span>
                  <span className="block font-bold text-zinc-900">Edge bleed (3 mm)</span>
                  <span className="text-[11px] text-zinc-600">Extends background past cut lines</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-[#f5f5f7] p-3 text-xs">
                <input
                  type="checkbox"
                  checked={includeBack}
                  onChange={(e) => onToggleBack(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#4d7c0f]"
                />
                <span>
                  <span className="block font-bold text-zinc-900">Include back side</span>
                  <span className="text-[11px] text-zinc-600">Mirrored page 2 for double-sided</span>
                </span>
              </label>
            </div>

            {hasDarkEdge && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-950">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="space-y-1">
                  <p className="font-bold">
                    {frontEdge.isDark || backEdge.isDark
                      ? "Dark / edge-to-edge card detected"
                      : "Coloured elements reach the card edge"}
                  </p>
                  <p className="leading-relaxed text-amber-900">
                    When ink prints right to the edge, tiny trimming shifts can leave thin white slivers. Keep{" "}
                    <strong>Edge bleed</strong> turned on and turn off <strong>Single-cut edges</strong> (or choose an 8-per-page sheet for wider gaps).
                  </p>
                  {includeBleed && maxSheetBleed < 3 && (
                    <p className="text-[11px] font-semibold text-amber-800">
                      Note: On this sheet layout, bleed is capped to {maxSheetBleed.toFixed(1)} mm so cards don&rsquo;t touch. Switch to 8 per page (or Single Card PDF) for full 3 mm bleed.
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Download formats */}
          <section className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">3. Choose download format</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={busy !== null || gridBad}
                onClick={() =>
                  void runExport("pdf-sheet", async () => {
                    await exportAdvancedPdf({
                      mode: "sheet",
                      design,
                      sheet,
                      includeBack,
                      showCropMarks: cutGuideStyle !== "none",
                      cutGuideStyle,
                      includeBleed,
                      offsetX,
                      offsetY,
                      filename: `business-cards-${cardCount}up-${sheet.paper}.pdf`,
                    });
                    return `Downloaded ${cardCount}-card ${paperShort} print sheet PDF${includeBack ? " (front & back)" : ""}. Print at 100% / Actual size.`;
                  })
                }
                className="flex items-center gap-3 rounded-2xl bg-[#4d7c0f] p-4 text-left text-white hover:bg-[#3f6212] disabled:opacity-50 transition cursor-pointer"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15">
                  <Download className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <span className="block text-sm font-bold">
                    {busy === "pdf-sheet" ? "Building PDF…" : `Print Sheet PDF (${cardCount} cards)`}
                  </span>
                  <span className="block text-[11px] text-lime-100">
                    {paperShort} · {sheet.cardW} × {sheet.cardH} mm{includeBack ? " · 2 pages" : ""}
                  </span>
                </div>
              </button>

              <button
                type="button"
                disabled={busy !== null}
                onClick={() =>
                  void runExport("pdf-single", async () => {
                    await exportAdvancedPdf({
                      mode: "single",
                      design,
                      sheet,
                      includeBack,
                      showCropMarks: cutGuideStyle !== "none",
                      cutGuideStyle,
                      includeBleed,
                      offsetX: 0,
                      offsetY: 0,
                      filename: `business-card-single-${sheet.cardW}x${sheet.cardH}mm.pdf`,
                    });
                    return `Downloaded print-shop single-card PDF${includeBleed ? " with 3 mm bleed" : ""}.`;
                  })
                }
                className="flex items-center gap-3 rounded-2xl bg-[#f5f5f7] p-4 text-left text-zinc-900 hover:bg-[#ebeced] disabled:opacity-50 transition cursor-pointer"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#4d7c0f] ring-1 ring-zinc-200">
                  <FileText className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <span className="block text-sm font-bold">
                    {busy === "pdf-single" ? "Building PDF…" : "Single Card PDF"}
                  </span>
                  <span className="block text-[11px] text-zinc-600">
                    Best for commercial printers{includeBleed ? " · full 3 mm bleed" : ""}
                  </span>
                </div>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* PNG */}
              <div className="rounded-2xl border border-zinc-200 p-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  <FileImage className="h-4 w-4 text-amber-600" />
                  <div>
                    <p className="text-xs font-bold text-zinc-950">High-res PNG (300 DPI)</p>
                    <p className="text-[11px] text-zinc-500">Crisp image for sharing or online print upload</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() =>
                      void runExport("png-front", async () => {
                        await exportSidePng(design.front, sheet.cardW, sheet.cardH, "business-card-front-300dpi.png", {
                          bleedMm: includeBleed ? 3 : 0,
                          dpi: 300,
                        });
                        return "Downloaded 300 DPI Front PNG.";
                      })
                    }
                    className="flex-1 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-600 disabled:opacity-50 cursor-pointer"
                  >
                    {busy === "png-front" ? "Rendering…" : "Front PNG"}
                  </button>
                  {includeBack && (
                    <button
                      type="button"
                      disabled={busy !== null}
                      onClick={() =>
                        void runExport("png-back", async () => {
                          await exportSidePng(design.back, sheet.cardW, sheet.cardH, "business-card-back-300dpi.png", {
                            bleedMm: includeBleed ? 3 : 0,
                            dpi: 300,
                          });
                          return "Downloaded 300 DPI Back PNG.";
                        })
                      }
                      className="flex-1 rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs font-bold text-zinc-900 hover:bg-[#ebeced] disabled:opacity-50 cursor-pointer"
                    >
                      {busy === "png-back" ? "Rendering…" : "Back PNG"}
                    </button>
                  )}
                </div>
              </div>

              {/* SVG */}
              <div className="rounded-2xl border border-zinc-200 p-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  <FileCode2 className="h-4 w-4 text-[#4d7c0f]" />
                  <div>
                    <p className="text-xs font-bold text-zinc-950">Scalable Vector SVG</p>
                    <p className="text-[11px] text-zinc-500">Editable vectors for Illustrator, Figma or print shops</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() =>
                      void runExport("svg-front", async () => {
                        exportSideSvg(design.front, sheet.cardW, sheet.cardH, "business-card-front.svg", {
                          bleedMm: includeBleed ? 3 : 0,
                        });
                        return "Downloaded Front SVG.";
                      })
                    }
                    className="flex-1 rounded-xl bg-[#eef6e4] px-3 py-2 text-xs font-bold text-[#365314] hover:bg-[#dff0c8] disabled:opacity-50 cursor-pointer"
                  >
                    Front SVG
                  </button>
                  {includeBack && (
                    <button
                      type="button"
                      disabled={busy !== null}
                      onClick={() =>
                        void runExport("svg-back", async () => {
                          exportSideSvg(design.back, sheet.cardW, sheet.cardH, "business-card-back.svg", {
                            bleedMm: includeBleed ? 3 : 0,
                          });
                          return "Downloaded Back SVG.";
                        })
                      }
                      className="flex-1 rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs font-bold text-zinc-900 hover:bg-[#ebeced] disabled:opacity-50 cursor-pointer"
                    >
                      Back SVG
                    </button>
                  )}
                </div>
              </div>
            </div>

            {notice && (
              <div
                className={`rounded-xl px-3.5 py-2.5 text-xs font-medium ${
                  notice.tone === "success" ? "bg-[#eef6e4] text-[#365314]" : "bg-red-50 text-red-800"
                }`}
              >
                {notice.text}
              </div>
            )}
          </section>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-200 bg-[#fafafa] px-5 py-3 text-[11px] text-zinc-600">
          <span className="inline-flex items-center gap-1.5">
            <Scissors className="h-3.5 w-3.5 text-[#4d7c0f]" />
            Tip: Always print PDFs at <strong>100% / Actual size</strong> on 250–300 gsm card stock.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 hover:bg-zinc-50 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* 6. Save & Share Modal (Share Link + JSON File + Local Browser Snapshots)  */
/* ------------------------------------------------------------------------- */

export function SaveShareModal({
  payload,
  onLoadPayload,
  onClose,
}: {
  payload: PersistedCardDesign;
  onLoadPayload: (loaded: PersistedCardDesign) => void;
  onClose: () => void;
}) {
  const [snapName, setSnapName] = useState(
    `${payload.simple.fullName || "My card"} (${new Date().toLocaleDateString()})`
  );
  const [snapshots, setSnapshots] = useState<NamedDesignSnapshot[]>(() => loadSavedSnapshots());
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  async function handleCopyShareLink() {
    const { url, strippedImages } = buildShareLink(payload);
    try {
      await navigator.clipboard.writeText(url);
      setShareMsg(
        strippedImages
          ? "Share link copied! Note: Large uploaded photos were omitted from the link — use 'Save design file' below to share logos/photos too."
          : "Share link copied to clipboard! Anyone with this link can open and edit your design."
      );
    } catch {
      window.prompt("Copy your shareable design link:", url);
    }
  }

  function handleSaveSnapshot() {
    const next = saveNamedSnapshot(snapName, payload);
    setSnapshots(next);
    setShareMsg(`Saved "${snapName.trim() || "Card design"}" in this browser.`);
  }

  async function handleImportJson(file: File | undefined) {
    if (!file) return;
    setImportError(null);
    try {
      const txt = await file.text();
      const parsed = parseDesignJson(txt);
      if (!parsed) {
        setImportError("That file doesn't look like a saved business card design.");
        return;
      }
      onLoadPayload(parsed);
      onClose();
    } catch {
      setImportError("Could not read that design file.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Save and share your design"
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-zinc-950">Save &amp; Share Design</h3>
            <p className="text-xs text-zinc-600">Your work auto-saves in this browser automatically.</p>
          </div>
          <button
            type="button"
            aria-label="Close save modal"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {/* Share link & File backup */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => void handleCopyShareLink()}
              className="flex items-center gap-2.5 rounded-2xl bg-[#4d7c0f] px-4 py-3 text-left text-white hover:bg-[#3f6212] cursor-pointer"
            >
              <Link2 className="h-4 w-4 shrink-0" />
              <div>
                <span className="block text-xs font-bold">Copy share link</span>
                <span className="block text-[10px] text-lime-100">Open on another device</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                downloadDesignJson(payload, `business-card-${(payload.simple.fullName || "design").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`);
                setShareMsg("Downloaded design backup (.json) with all images included.");
              }}
              className="flex items-center gap-2.5 rounded-2xl bg-amber-500 px-4 py-3 text-left text-zinc-950 hover:bg-amber-600 cursor-pointer"
            >
              <Save className="h-4 w-4 shrink-0" />
              <div>
                <span className="block text-xs font-bold">Save design file</span>
                <span className="block text-[10px] text-zinc-800">Full backup (.json)</span>
              </div>
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 rounded-2xl bg-[#f5f5f7] px-3.5 py-2.5">
            <span className="text-xs text-zinc-700">Have a saved <strong>.json</strong> card file?</span>
            <input
              ref={jsonInputRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(e) => {
                void handleImportJson(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => jsonInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50 cursor-pointer"
            >
              <FolderOpen className="h-3.5 w-3.5" />
              Load file
            </button>
          </div>

          {shareMsg && <p className="rounded-xl bg-[#eef6e4] px-3.5 py-2.5 text-xs font-medium text-[#365314]">{shareMsg}</p>}
          {importError && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">{importError}</p>}

          {/* Save named snapshot in browser */}
          <div className="space-y-2.5 border-t border-zinc-200 pt-4">
            <p className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
              <Bookmark className="h-3.5 w-3.5 text-[#4d7c0f]" />
              Saved versions in this browser
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={snapName}
                onChange={(e) => setSnapName(e.target.value)}
                placeholder="Version name (e.g. Dark Minimal v2)"
                className="h-9 min-w-0 flex-1 rounded-xl bg-[#f5f5f7] px-3 text-xs text-zinc-900 focus:bg-white focus:outline-2 focus:outline-[#4d7c0f]"
              />
              <button
                type="button"
                onClick={handleSaveSnapshot}
                className="inline-flex h-9 shrink-0 items-center gap-1 rounded-xl bg-zinc-900 px-3.5 text-xs font-bold text-white hover:bg-zinc-800 cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
                Save version
              </button>
            </div>
            {snapshots.length === 0 ? (
              <p className="text-[11px] text-zinc-500">No named versions saved yet.</p>
            ) : (
              <ul className="max-h-44 space-y-1.5 overflow-y-auto">
                {snapshots.map((snap) => (
                  <li key={snap.id} className="flex items-center justify-between gap-2 rounded-xl bg-[#f5f5f7] px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-zinc-900">{snap.name}</p>
                      <p className="text-[10px] text-zinc-500">{new Date(snap.savedAt).toLocaleString()}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onLoadPayload(snap.payload);
                          onClose();
                        }}
                        className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-[#365314] ring-1 ring-zinc-200 hover:bg-[#eef6e4] cursor-pointer"
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${snap.name}`}
                        onClick={() => setSnapshots(deleteNamedSnapshot(snap.id))}
                        className="grid h-7 w-7 place-items-center rounded-lg text-zinc-500 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
