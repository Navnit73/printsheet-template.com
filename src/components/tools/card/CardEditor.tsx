"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  AlignCenter,
  AlignHorizontalJustifyCenter,
  AlignLeft,
  AlignRight,
  AlignVerticalJustifyCenter,
  ArrowDown,
  ArrowUp,
  Bold,
  Circle,
  Copy,
  Eye,
  EyeOff,
  ImagePlus,
  Italic,
  Lock,
  LockOpen,
  QrCode,
  Redo2,
  Square,
  SquareDashed,
  Trash2,
  Type,
  Undo2,
} from "lucide-react";
import { fileToDataUrl, loadImageElement, type PdfFontFamily } from "@/lib/pdf-utils";
import { useNumberField } from "@/lib/use-number-field";
import {
  FAMILY_LABEL,
  layerLabel,
  makeImage,
  makeShape,
  makeText,
  type Box,
  type ImageLayer,
  type Layer,
  type SideDesign,
  type TextLayer,
} from "./editor-model";
import { inputClass, labelClass, toggleBtnClass, toolBtnClass } from "./styles";

export type LayerPatch = Partial<Layer>;
export type OnChange = (id: string, patch: LayerPatch, group?: string) => void;

const round2 = (n: number) => Math.round(n * 100) / 100;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export const SWATCHES = [
  "#18181b", "#ffffff", "#71717a", "#3f6212", "#1e3a8a", "#0f766e", "#9f1239", "#c2410c", "#6b21a8", "#a16207",
];

/* ------------------------------------------------------------------------- */
/* Canvas overlay: select, drag, resize and nudge items directly on the card   */
/* ------------------------------------------------------------------------- */

const SNAP_PX = 6;
const MIN_HIT_MM = 3;

export function CardEditorOverlay({
  W,
  H,
  layers,
  bounds,
  selectedId,
  onSelect,
  onChange,
  onDelete,
  onDuplicate,
  onUndo,
  onRedo,
}: {
  W: number;
  H: number;
  layers: Layer[];
  bounds: Map<string, Box>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: OnChange;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onUndo: () => void;
  onRedo: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const session = useRef(0);
  const drag = useRef<{
    mode: "move" | "resize";
    layer: Layer;
    box: Box;
    sx: number;
    sy: number;
    k: number;
    group: string;
  } | null>(null);
  const [guides, setGuides] = useState<{ x?: number; y?: number }>({});

  const pct = (v: number, total: number) => `${(v / total) * 100}%`;

  const begin = (e: React.PointerEvent, layer: Layer, mode: "move" | "resize") => {
    e.stopPropagation();
    onSelect(layer.id);
    rootRef.current?.focus({ preventScroll: true });
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect || layer.locked) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    session.current += 1;
    drag.current = {
      mode,
      layer,
      box: bounds.get(layer.id) ?? layer,
      sx: e.clientX,
      sy: e.clientY,
      k: W / rect.width,
      group: `drag-${layer.id}-${session.current}`,
    };
  };

  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = (e.clientX - d.sx) * d.k;
    const dy = (e.clientY - d.sy) * d.k;
    const { layer, box } = d;
    if (d.mode === "move") {
      let nx = layer.x + dx;
      let ny = layer.y + dy;
      const snap = SNAP_PX * d.k;
      const gx: number[] = [0, 4, W / 2 - box.w / 2, W - box.w - 4, W - box.w];
      const gy: number[] = [0, 4, H / 2 - box.h / 2, H - box.h - 4, H - box.h];
      const g: { x?: number; y?: number } = {};
      const sx = gx.find((v) => Math.abs(v - nx) < snap);
      const sy = gy.find((v) => Math.abs(v - ny) < snap);
      if (sx !== undefined) {
        nx = sx;
        g.x = sx === W / 2 - box.w / 2 ? W / 2 : sx === 0 ? 0 : sx === W - box.w ? W : sx < W / 2 ? sx : sx + box.w;
      }
      if (sy !== undefined) {
        ny = sy;
        g.y = sy === H / 2 - box.h / 2 ? H / 2 : sy === 0 ? 0 : sy === H - box.h ? H : sy < H / 2 ? sy : sy + box.h;
      }
      setGuides(g);
      onChange(layer.id, { x: round2(nx), y: round2(ny) }, d.group);
    } else if (layer.kind === "text") {
      onChange(layer.id, { w: round2(clamp(layer.w + dx, 4, 400)) }, d.group);
    } else if (layer.kind === "image") {
      const w = clamp(layer.w + dx, 2, 400);
      onChange(layer.id, { w: round2(w), h: round2(w / layer.ratio) }, d.group);
    } else {
      onChange(layer.id, { w: round2(clamp(layer.w + dx, 0.5, 400)), h: round2(clamp(layer.h + dy, 0.2, 400)) }, d.group);
    }
  };

  const end = () => {
    drag.current = null;
    setGuides({});
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
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
    const sel = layers.find((l) => l.id === selectedId);
    if (e.key === "Escape") return onSelect(null);
    if (!sel) return;
    if (mod && e.key.toLowerCase() === "d") {
      e.preventDefault();
      onDuplicate(sel.id);
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      onDelete(sel.id);
    } else if (e.key.startsWith("Arrow") && !sel.locked) {
      e.preventDefault();
      const step = e.shiftKey ? 1 : 0.1;
      const patch: LayerPatch = {};
      if (e.key === "ArrowLeft") patch.x = round2(sel.x - step);
      if (e.key === "ArrowRight") patch.x = round2(sel.x + step);
      if (e.key === "ArrowUp") patch.y = round2(sel.y - step);
      if (e.key === "ArrowDown") patch.y = round2(sel.y + step);
      onChange(sel.id, patch, `nudge-${sel.id}`);
    }
  };

  return (
    <div
      ref={rootRef}
      role="application"
      aria-label="Card editor. Click an item to select it, drag to move it. With an item selected, arrow keys nudge it, Delete removes it."
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={() => onSelect(null)}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      className="absolute inset-0 touch-none outline-none focus-visible:ring-2 focus-visible:ring-[#4d7c0f]"
    >
      {guides.x !== undefined && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 w-px bg-fuchsia-500" style={{ left: pct(guides.x, W) }} />
      )}
      {guides.y !== undefined && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 h-px bg-fuchsia-500" style={{ top: pct(guides.y, H) }} />
      )}
      {layers.map((l) => {
        if (l.hidden) return null;
        const b = bounds.get(l.id) ?? l;
        const hitH = Math.max(b.h, MIN_HIT_MM);
        const top = b.y - (hitH - b.h) / 2;
        const selected = l.id === selectedId;
        return (
          <div
            key={l.id}
            title={layerLabel(l)}
            onPointerDown={(e) => begin(e, l, "move")}
            className={`absolute ${l.locked ? "pointer-events-none" : "cursor-move"} ${
              selected
                ? "outline outline-[1.5px] outline-offset-[1px] outline-[#4d7c0f]"
                : "hover:outline hover:outline-1 hover:outline-dashed hover:outline-zinc-500"
            }`}
            style={{ left: pct(b.x, W), top: pct(top, H), width: pct(Math.max(b.w, 1), W), height: pct(hitH, H) }}
          >
            {selected && !l.locked && (
              <span
                role="presentation"
                onPointerDown={(e) => begin(e, l, "resize")}
                className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 cursor-nwse-resize rounded-full border-2 border-white bg-[#4d7c0f] shadow"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* Panel: toolbar, background, layers and the selected item's properties       */
/* ------------------------------------------------------------------------- */

function NumField({
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
  const f = useNumberField(round2(value), (v) => onChange(round2(v)), { min, max, unit });
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

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (hex: string) => void }) {
  const id = useId();
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        {SWATCHES.map((hex) => {
          const active = value.toLowerCase() === hex;
          return (
            <button
              key={hex}
              type="button"
              aria-label={`${label} ${hex}`}
              aria-pressed={active}
              onClick={() => onChange(hex)}
              className={`h-8 w-8 rounded-full cursor-pointer transition ${
                active ? "ring-2 ring-[#4d7c0f] ring-offset-2" : "ring-1 ring-black/15 hover:scale-105"
              }`}
              style={{ backgroundColor: hex }}
            />
          );
        })}
        <label
          htmlFor={id}
          className="inline-flex min-h-[36px] cursor-pointer items-center gap-2 rounded-xl bg-[#f5f5f7] px-2.5 text-[11px] font-medium text-zinc-700 hover:bg-[#ebeced]"
        >
          Any colour
          <span className="font-mono text-zinc-600">{value.toUpperCase()}</span>
          <input id={id} type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-6 w-8 cursor-pointer rounded bg-white" />
        </label>
      </div>
    </div>
  );
}

/** PNG-normalise any uploaded image so jsPDF accepts it, capped for file size. */
async function readImage(file: File) {
  const raw = await fileToDataUrl(file);
  const img = await loadImageElement(raw);
  const w = img.naturalWidth || 300;
  const h = img.naturalHeight || 150;
  const scale = Math.min(1, 1600 / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return { src: canvas.toDataURL("image/png"), ratio: w / h };
}

const KIND_ICON = { text: Type, rect: Square, ellipse: Circle, frame: SquareDashed, image: ImagePlus } as const;

export function CardEditorPanel({
  W,
  H,
  side,
  design,
  bounds,
  selectedId,
  defaultQrText,
  canUndo,
  canRedo,
  onSelect,
  onChange,
  onAdd,
  onRemove,
  onDuplicate,
  onReorder,
  onSetBg,
  onUndo,
  onRedo,
  onPatchSilently,
  onError,
}: {
  W: number;
  H: number;
  side: "front" | "back";
  design: SideDesign;
  bounds: Map<string, Box>;
  selectedId: string | null;
  defaultQrText: string;
  canUndo: boolean;
  canRedo: boolean;
  onSelect: (id: string | null) => void;
  onChange: OnChange;
  onAdd: (layer: Layer) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onReorder: (id: string, dir: 1 | -1) => void;
  onSetBg: (hex: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  /** Update layers without an undo step (async QR image arriving). */
  onPatchSilently: (side: "front" | "back", id: string, patch: Partial<ImageLayer>) => void;
  onError: (message: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const uid = useId();
  const selected = design.layers.find((l) => l.id === selectedId) ?? null;
  const box = selected ? (bounds.get(selected.id) ?? selected) : null;

  // Keep QR layers' pictures in step with their text.
  const pendingQr = useMemo(
    () =>
      design.layers
        .filter((l): l is ImageLayer => l.kind === "image" && !!l.qrText && l.qrFor !== l.qrText)
        .map((l) => [l.id, l.qrText as string] as const),
    [design.layers]
  );
  const pendingKey = pendingQr.map(([id, t]) => `${id}:${t}`).join("|");
  useEffect(() => {
    if (!pendingQr.length) return;
    let cancelled = false;
    void import("qrcode").then(async (QR) => {
      for (const [id, text] of pendingQr) {
        try {
          const src = await QR.toDataURL(text, { width: 480, margin: 1, color: { dark: "#09090b", light: "#ffffff" } });
          if (!cancelled) onPatchSilently(side, id, { src, qrFor: text });
        } catch {
          if (!cancelled) onPatchSilently(side, id, { qrFor: text });
        }
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingKey, side]);

  async function addImage(file: File | undefined) {
    if (!file) return;
    try {
      const { src, ratio } = await readImage(file);
      onAdd(makeImage(src, ratio, file.name.replace(/\.[^.]+$/, "") || "Image"));
    } catch {
      onError("Could not read that image. Try a PNG or JPG.");
    }
  }

  const addQr = () => {
    const l = makeImage("", 1, "QR code", { qrText: defaultQrText || "https://", w: 16, h: 16 });
    onAdd(l);
  };

  const set = (patch: LayerPatch, group?: string) => selected && onChange(selected.id, patch, group);
  const idx = selected ? design.layers.indexOf(selected) : -1;

  return (
    <div className="space-y-5">
      {/* Add + history */}
      <div>
        <p className={labelClass}>Add to the {side}</p>
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
          <button type="button" className={toolBtnClass} onClick={() => onAdd(makeText({ x: W / 2 - 25, y: H / 2 - 3 }))}>
            <Type aria-hidden="true" className="h-4 w-4" /> Text
          </button>
          <button type="button" className={toolBtnClass} onClick={() => onAdd(makeShape("rect", "#3f6212", { x: W / 2 - 12, y: H / 2 - 7 }))}>
            <Square aria-hidden="true" className="h-4 w-4" /> Box
          </button>
          <button type="button" className={toolBtnClass} onClick={() => onAdd(makeShape("ellipse", "#3f6212", { x: W / 2 - 10, y: H / 2 - 10, w: 20, h: 20 }))}>
            <Circle aria-hidden="true" className="h-4 w-4" /> Circle
          </button>
          <button type="button" className={toolBtnClass} onClick={() => onAdd(makeShape("frame", "#3f6212", { x: 3, y: 3, w: W - 6, h: H - 6 }))}>
            <SquareDashed aria-hidden="true" className="h-4 w-4" /> Outline
          </button>
          <button type="button" className={toolBtnClass} onClick={() => fileRef.current?.click()}>
            <ImagePlus aria-hidden="true" className="h-4 w-4" /> Image
          </button>
          <button type="button" className={toolBtnClass} onClick={addQr}>
            <QrCode aria-hidden="true" className="h-4 w-4" /> QR code
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          aria-label="Add an image to the card"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            void addImage(f);
          }}
        />
        <div className="mt-2 flex gap-1.5">
          <button type="button" className={toolBtnClass} onClick={onUndo} disabled={!canUndo}>
            <Undo2 aria-hidden="true" className="h-4 w-4" /> Undo
          </button>
          <button type="button" className={toolBtnClass} onClick={onRedo} disabled={!canRedo}>
            <Redo2 aria-hidden="true" className="h-4 w-4" /> Redo
          </button>
        </div>
      </div>

      <ColorField label={`Card background (${side})`} value={design.bg} onChange={onSetBg} />

      {/* Layers */}
      <div>
        <p className={labelClass}>Everything on the {side} (top first)</p>
        {design.layers.length === 0 ? (
          <p className="rounded-xl bg-[#f5f5f7] p-3 text-xs text-zinc-600">Nothing here yet. Use the buttons above to add text, shapes, an image or a QR code.</p>
        ) : (
          <ul className="max-h-60 space-y-1 overflow-y-auto rounded-xl bg-[#f5f5f7] p-1.5">
            {[...design.layers].reverse().map((l) => {
              const Icon = l.kind === "image" && l.qrText ? QrCode : KIND_ICON[l.kind];
              const active = l.id === selectedId;
              return (
                <li key={l.id} className={`flex items-center gap-1 rounded-lg ${active ? "bg-white ring-2 ring-[#4d7c0f]" : "hover:bg-white/70"}`}>
                  <button
                    type="button"
                    onClick={() => onSelect(l.id)}
                    aria-pressed={active}
                    className={`flex min-h-[40px] min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg px-2 text-left text-xs font-medium ${
                      l.hidden ? "text-zinc-400" : "text-zinc-900"
                    }`}
                  >
                    <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-zinc-600" />
                    <span className="truncate">{layerLabel(l)}</span>
                  </button>
                  <button
                    type="button"
                    aria-label={l.hidden ? `Show ${layerLabel(l)}` : `Hide ${layerLabel(l)}`}
                    onClick={() => onChange(l.id, { hidden: !l.hidden })}
                    className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg text-zinc-600 hover:bg-zinc-100"
                  >
                    {l.hidden ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    aria-label={l.locked ? `Unlock ${layerLabel(l)}` : `Lock ${layerLabel(l)} in place`}
                    onClick={() => onChange(l.id, { locked: !l.locked })}
                    className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg text-zinc-600 hover:bg-zinc-100"
                  >
                    {l.locked ? <Lock aria-hidden="true" className="h-4 w-4" /> : <LockOpen aria-hidden="true" className="h-4 w-4" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Selected item */}
      {selected && box ? (
        <section aria-labelledby={`${uid}-sel`} className="space-y-4 rounded-2xl bg-[#f5f5f7] p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 id={`${uid}-sel`} className="text-sm font-bold text-zinc-950">
              Edit: {layerLabel(selected)}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              <button type="button" className={`${toolBtnClass} bg-white`} aria-label="Move up a layer" onClick={() => onReorder(selected.id, 1)} disabled={idx >= design.layers.length - 1}>
                <ArrowUp aria-hidden="true" className="h-4 w-4" />
              </button>
              <button type="button" className={`${toolBtnClass} bg-white`} aria-label="Move down a layer" onClick={() => onReorder(selected.id, -1)} disabled={idx <= 0}>
                <ArrowDown aria-hidden="true" className="h-4 w-4" />
              </button>
              <button type="button" className={`${toolBtnClass} bg-white`} onClick={() => onDuplicate(selected.id)}>
                <Copy aria-hidden="true" className="h-4 w-4" /> Duplicate
              </button>
              <button type="button" className={`${toolBtnClass} bg-white text-red-700`} onClick={() => onRemove(selected.id)}>
                <Trash2 aria-hidden="true" className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>

          {selected.kind === "text" && <TextControls l={selected} set={set} uid={uid} />}

          {(selected.kind === "rect" || selected.kind === "ellipse" || selected.kind === "frame") && (
            <>
              <ColorField label={selected.kind === "frame" ? "Line colour" : "Fill colour"} value={selected.color} onChange={(color) => set({ color }, `c-${selected.id}`)} />
              {selected.kind === "frame" && (
                <NumField label="Line thickness" value={selected.strokeW} min={0.1} max={5} onChange={(strokeW) => set({ strokeW }, `s-${selected.id}`)} />
              )}
            </>
          )}

          {selected.kind === "image" && selected.qrText !== undefined && (
            <div>
              <label htmlFor={`${uid}-qr`} className={labelClass}>
                QR code opens this link or text
              </label>
              <input
                id={`${uid}-qr`}
                type="text"
                value={selected.qrText}
                onChange={(e) => set({ qrText: e.target.value }, `qr-${selected.id}`)}
                className={`${inputClass} bg-white`}
                placeholder="https://your-website.com"
              />
            </div>
          )}

          <div>
            <p className={labelClass}>Position and size</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <NumField label="Left" value={selected.x} min={-W} max={W * 2} onChange={(x) => set({ x }, `x-${selected.id}`)} />
              <NumField label="Top" value={selected.y} min={-H} max={H * 2} onChange={(y) => set({ y }, `y-${selected.id}`)} />
              <NumField label="Width" value={selected.w} min={1} max={W * 2} onChange={(w) => set(selected.kind === "image" ? { w, h: round2(w / selected.ratio) } : { w }, `w-${selected.id}`)} />
              {selected.kind !== "text" && (
                <NumField label="Height" value={selected.h} min={0.2} max={H * 2} onChange={(h) => set(selected.kind === "image" ? { h, w: round2(h * selected.ratio) } : { h }, `h-${selected.id}`)} />
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button type="button" className={`${toolBtnClass} bg-white`} onClick={() => set({ x: round2((W - box.w) / 2) })}>
                <AlignHorizontalJustifyCenter aria-hidden="true" className="h-4 w-4" /> Centre across
              </button>
              <button type="button" className={`${toolBtnClass} bg-white`} onClick={() => set({ y: round2((H - box.h) / 2) })}>
                <AlignVerticalJustifyCenter aria-hidden="true" className="h-4 w-4" /> Centre down
              </button>
            </div>
          </div>
        </section>
      ) : (
        <p className="rounded-xl bg-[#f5f5f7] p-3 text-xs leading-relaxed text-zinc-600">
          Click anything on the card (or in the list above) to change its text, font, size, colour and position. Drag to move it, drag the green dot to resize,
          or use the arrow keys for tiny nudges.
        </p>
      )}
    </div>
  );
}

function TextControls({ l, set, uid }: { l: TextLayer; set: (p: LayerPatch, group?: string) => void; uid: string }) {
  const tracked = l.track > 0;
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`${uid}-text`} className={labelClass}>
          Text (press Enter for a new line)
        </label>
        <textarea
          id={`${uid}-text`}
          rows={2}
          value={l.text}
          onChange={(e) => set({ text: e.target.value }, `t-${l.id}`)}
          className={`${inputClass} bg-white`}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-family`} className={labelClass}>
            Font
          </label>
          <select
            id={`${uid}-family`}
            value={l.family}
            onChange={(e) => set({ family: e.target.value as PdfFontFamily })}
            className={`${inputClass} bg-white`}
          >
            {(Object.keys(FAMILY_LABEL) as PdfFontFamily[]).map((f) => (
              <option key={f} value={f}>
                {FAMILY_LABEL[f]}
              </option>
            ))}
          </select>
        </div>
        <NumField label="Size (pt)" unit="pt" value={l.size} min={3} max={72} onChange={(size) => set({ size }, `z-${l.id}`)} />
      </div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Text style">
        <button type="button" aria-pressed={l.bold} aria-label="Bold" className={toggleBtnClass(l.bold)} onClick={() => set({ bold: !l.bold })}>
          <Bold aria-hidden="true" className="h-4 w-4" />
        </button>
        <button type="button" aria-pressed={l.italic} aria-label="Italic" className={toggleBtnClass(l.italic)} onClick={() => set({ italic: !l.italic })}>
          <Italic aria-hidden="true" className="h-4 w-4" />
        </button>
        {(
          [
            ["left", AlignLeft],
            ["center", AlignCenter],
            ["right", AlignRight],
          ] as const
        ).map(([a, Icon]) => (
          <button key={a} type="button" aria-pressed={l.align === a} aria-label={`Align ${a}`} className={toggleBtnClass(l.align === a)} onClick={() => set({ align: a })}>
            <Icon aria-hidden="true" className="h-4 w-4" />
          </button>
        ))}
      </div>
      <ColorField label="Text colour" value={l.color} onChange={(color) => set({ color }, `col-${l.id}`)} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-track`} className={labelClass}>
            Letter spacing {tracked ? `(${l.track.toFixed(2)} em)` : "(normal)"}
          </label>
          <input
            id={`${uid}-track`}
            type="range"
            min={0}
            max={0.5}
            step={0.01}
            value={l.track}
            onChange={(e) => set({ track: Number(e.target.value) }, `tr-${l.id}`)}
            className="w-full accent-[#4d7c0f]"
          />
          {tracked && l.text.includes("\n") && <p className="text-[11px] text-zinc-600">Letter spacing works on single-line text.</p>}
        </div>
        <div>
          <label htmlFor={`${uid}-lead`} className={labelClass}>
            Line spacing ({l.leading.toFixed(2)})
          </label>
          <input
            id={`${uid}-lead`}
            type="range"
            min={0.9}
            max={2}
            step={0.05}
            value={l.leading}
            onChange={(e) => set({ leading: Number(e.target.value) }, `ld-${l.id}`)}
            className="w-full accent-[#4d7c0f]"
          />
        </div>
      </div>
    </div>
  );
}

