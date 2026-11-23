"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, Crop, Eraser, Pipette, RefreshCw, RotateCcw, Scissors, X } from "lucide-react";
import { DEFAULT_CROP, getSourceRect, type CropState } from "@/lib/crop";
import { fileToDataUrl, loadImageElement } from "@/lib/pdf-utils";
import { CropEditor } from "@/components/tools/ui/CropEditor";

export interface ImageEditResult {
  src: string;
  originalSrc: string;
  ratio: number;
  name?: string;
  radius?: number;
}

type RGBTuple = [number, number, number];

function rgbDist(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/** Detect average corner colour from an image to pre-seed the background remover. */
function detectCornerColor(data: Uint8ClampedArray, w: number, h: number): RGBTuple {
  const coords: Array<[number, number]> = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
    [Math.floor(w / 2), 0],
    [Math.floor(w / 2), h - 1],
  ];
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  for (const [x, y] of coords) {
    const idx = (y * w + x) * 4;
    if (data[idx + 3] > 20) {
      r += data[idx];
      g += data[idx + 1];
      b += data[idx + 2];
      count++;
    }
  }
  if (!count) return [255, 255, 255];
  return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
}

/**
 * Removes background colour via border flood-fill (keeps enclosed interior whites safe)
 * or global colour matching, with smooth edge feathering and optional transparent trim.
 */
function processRemoveBackground(
  img: HTMLImageElement,
  target: RGBTuple,
  tolerance: number,
  feather: number,
  mode: "edges" | "global",
  trimEmpty: boolean
): { dataUrl: string; ratio: number } {
  const nw = img.naturalWidth || img.width || 300;
  const nh = img.naturalHeight || img.height || 300;
  const scale = Math.min(1, 1000 / Math.max(nw, nh));
  const w = Math.max(1, Math.round(nw * scale));
  const h = Math.max(1, Math.round(nh * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { dataUrl: img.src, ratio: nw / nh };
  ctx.drawImage(img, 0, 0, w, h);

  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;
  const [tr, tg, tb] = target;
  const hard = tolerance * 2.2;
  const soft = hard + feather * 2.2;

  if (mode === "global") {
    for (let i = 0; i < d.length; i += 4) {
      const dist = rgbDist(d[i], d[i + 1], d[i + 2], tr, tg, tb);
      if (dist <= hard) {
        d[i + 3] = 0;
      } else if (feather > 0 && dist < soft) {
        const factor = (dist - hard) / Math.max(1, soft - hard);
        d[i + 3] = Math.round(d[i + 3] * factor);
      }
    }
  } else {
    // Border flood-fill BFS
    const visited = new Uint8Array(w * h);
    const removed = new Uint8Array(w * h);
    const queue = new Int32Array(w * h);
    let head = 0;
    let tail = 0;

    const tryPush = (x: number, y: number) => {
      const p = y * w + x;
      if (visited[p]) return;
      visited[p] = 1;
      const idx = p * 4;
      if (d[idx + 3] === 0) {
        removed[p] = 1;
        queue[tail++] = p;
        return;
      }
      const dist = rgbDist(d[idx], d[idx + 1], d[idx + 2], tr, tg, tb);
      if (dist <= hard) {
        d[idx + 3] = 0;
        removed[p] = 1;
        queue[tail++] = p;
      } else if (feather > 0 && dist < soft) {
        const factor = (dist - hard) / Math.max(1, soft - hard);
        d[idx + 3] = Math.round(d[idx + 3] * factor);
      }
    };

    for (let x = 0; x < w; x++) {
      tryPush(x, 0);
      tryPush(x, h - 1);
    }
    for (let y = 1; y < h - 1; y++) {
      tryPush(0, y);
      tryPush(w - 1, y);
    }

    while (head < tail) {
      const p = queue[head++];
      const x = p % w;
      const y = (p - x) / w;
      if (x > 0) tryPush(x - 1, y);
      if (x < w - 1) tryPush(x + 1, y);
      if (y > 0) tryPush(x, y - 1);
      if (y < h - 1) tryPush(x, y + 1);
    }

    // One-pixel feather pass around removed edge pixels
    if (feather > 0) {
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const p = y * w + x;
          if (removed[p]) continue;
          if (removed[p - 1] || removed[p + 1] || removed[p - w] || removed[p + w]) {
            const idx = p * 4;
            const dist = rgbDist(d[idx], d[idx + 1], d[idx + 2], tr, tg, tb);
            if (dist < soft) {
              const factor = Math.max(0, (dist - hard * 0.7) / Math.max(1, soft - hard * 0.7));
              d[idx + 3] = Math.round(d[idx + 3] * factor);
            }
          }
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  if (!trimEmpty) {
    return { dataUrl: canvas.toDataURL("image/png"), ratio: w / h };
  }

  // Trim fully transparent border pixels
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] > 12) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX || maxY < minY) {
    return { dataUrl: canvas.toDataURL("image/png"), ratio: w / h };
  }
  const pad = 2;
  const sx = Math.max(0, minX - pad);
  const sy = Math.max(0, minY - pad);
  const sw = Math.min(w - sx, maxX - minX + 1 + pad * 2);
  const sh = Math.min(h - sy, maxY - minY + 1 + pad * 2);
  const out = document.createElement("canvas");
  out.width = sw;
  out.height = sh;
  const octx = out.getContext("2d");
  if (!octx) return { dataUrl: canvas.toDataURL("image/png"), ratio: w / h };
  octx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
  return { dataUrl: out.toDataURL("image/png"), ratio: sw / sh };
}

/** Render cropped region preserving PNG alpha transparency. */
function renderTransparentCrop(
  img: HTMLImageElement,
  aspect: number,
  crop: CropState,
  circleMask: boolean
): { dataUrl: string; ratio: number } {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const r = getSourceRect(iw, ih, aspect, crop);
  const longSide = Math.min(1000, Math.max(400, Math.round(Math.max(r.sw, r.sh))));
  const outW = aspect >= 1 ? longSide : Math.max(100, Math.round(longSide * aspect));
  const outH = aspect >= 1 ? Math.max(100, Math.round(longSide / aspect)) : longSide;
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  if (circleMask) {
    ctx.beginPath();
    ctx.arc(outW / 2, outH / 2, Math.min(outW, outH) / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
  }
  ctx.drawImage(img, r.sx, r.sy, r.sw, r.sh, 0, 0, outW, outH);
  return { dataUrl: canvas.toDataURL("image/png"), ratio: outW / outH };
}

const ASPECT_PRESETS = [
  { id: "orig", label: "Original", value: 0 },
  { id: "1:1", label: "Square (1:1)", value: 1 },
  { id: "circle", label: "Circle", value: 1, circle: true },
  { id: "4:3", label: "4 : 3", value: 4 / 3 },
  { id: "16:9", label: "Wide (16:9)", value: 16 / 9 },
] as const;

export function ImageToolsModal({
  initialTab = "bg",
  src,
  originalSrc,
  name,
  onApply,
  onClose,
}: {
  initialTab?: "bg" | "crop";
  src: string;
  originalSrc?: string;
  name: string;
  onApply: (result: ImageEditResult) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"bg" | "crop">(initialTab);
  const [baseSrc, setBaseSrc] = useState<string>(originalSrc || src);
  const [workingSrc, setWorkingSrc] = useState<string>(src);
  const [workingName, setWorkingName] = useState<string>(name);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [natRatio, setNatRatio] = useState<number>(1);

  // Background remover state
  const [targetColor, setTargetColor] = useState<RGBTuple>([255, 255, 255]);
  const [tolerance, setTolerance] = useState<number>(28);
  const [feather, setFeather] = useState<number>(8);
  const [bgMode, setBgMode] = useState<"edges" | "global">("edges");
  const [trimEmpty, setTrimEmpty] = useState<boolean>(true);
  const [pickingColor, setPickingColor] = useState<boolean>(false);
  const [bgPreview, setBgPreview] = useState<{ dataUrl: string; ratio: number } | null>(null);

  // Crop state
  const [aspectId, setAspectId] = useState<(typeof ASPECT_PRESETS)[number]["id"]>("orig");
  const [crop, setCrop] = useState<CropState>(DEFAULT_CROP);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load current working source image
  useEffect(() => {
    let cancelled = false;
    void loadImageElement(workingSrc).then((img) => {
      if (cancelled) return;
      setImgEl(img);
      const nw = img.naturalWidth || 300;
      const nh = img.naturalHeight || 300;
      setNatRatio(nw / nh);
      // Sample corner colour on initial load
      const c = document.createElement("canvas");
      const s = Math.min(1, 200 / Math.max(nw, nh));
      c.width = Math.max(1, Math.round(nw * s));
      c.height = Math.max(1, Math.round(nh * s));
      const ctx = c.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, c.width, c.height);
        const corner = detectCornerColor(ctx.getImageData(0, 0, c.width, c.height).data, c.width, c.height);
        setTargetColor(corner);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [workingSrc]);

  // Live background removal preview
  useEffect(() => {
    if (tab !== "bg" || !imgEl) return;
    const timer = window.setTimeout(() => {
      const res = processRemoveBackground(imgEl, targetColor, tolerance, feather, bgMode, trimEmpty);
      setBgPreview(res);
    }, 30);
    return () => window.clearTimeout(timer);
  }, [tab, imgEl, targetColor, tolerance, feather, bgMode, trimEmpty]);

  async function handleReplaceFile(file: File | undefined) {
    if (!file) return;
    try {
      const raw = await fileToDataUrl(file);
      const img = await loadImageElement(raw);
      const nw = img.naturalWidth || 300;
      const nh = img.naturalHeight || 300;
      const scale = Math.min(1, 1400 / Math.max(nw, nh));
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(nw * scale));
      c.height = Math.max(1, Math.round(nh * scale));
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, c.width, c.height);
      const png = c.toDataURL("image/png");
      setBaseSrc(png);
      setWorkingSrc(png);
      setWorkingName(file.name.replace(/\.[^.]+$/, "") || "Logo");
      setCrop(DEFAULT_CROP);
    } catch {
      // ignore invalid file
    }
  }

  function handlePickColorClick(e: React.MouseEvent<HTMLImageElement>) {
    if (!pickingColor || !imgEl) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const ny = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    const c = document.createElement("canvas");
    c.width = imgEl.naturalWidth || 300;
    c.height = imgEl.naturalHeight || 300;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(imgEl, 0, 0);
    const px = Math.min(c.width - 1, Math.round(nx * c.width));
    const py = Math.min(c.height - 1, Math.round(ny * c.height));
    const data = ctx.getImageData(px, py, 1, 1).data;
    setTargetColor([data[0], data[1], data[2]]);
    setPickingColor(false);
  }

  const activePreset = ASPECT_PRESETS.find((p) => p.id === aspectId) ?? ASPECT_PRESETS[0];
  const effectiveAspect = activePreset.value > 0 ? activePreset.value : natRatio;

  function handleApply() {
    if (!imgEl) return;
    if (tab === "bg") {
      const res = bgPreview ?? processRemoveBackground(imgEl, targetColor, tolerance, feather, bgMode, trimEmpty);
      onApply({ src: res.dataUrl, originalSrc: baseSrc, ratio: res.ratio, name: workingName });
    } else {
      const isCircle = "circle" in activePreset && activePreset.circle;
      const res = renderTransparentCrop(imgEl, effectiveAspect, crop, Boolean(isCircle));
      onApply({ src: res.dataUrl, originalSrc: baseSrc, ratio: res.ratio, name: workingName });
    }
  }

  const targetHex = `#${targetColor.map((v) => v.toString(16).padStart(2, "0")).join("")}`;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Edit logo or image"
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#eef6e4] text-[#3f6212]">
              {tab === "bg" ? <Eraser className="h-4 w-4" /> : <Crop className="h-4 w-4" />}
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-950">Edit logo &amp; image</h3>
              <p className="text-[11px] text-zinc-600">Remove a solid background, crop cleanly, or replace the file</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              className="sr-only"
              onChange={(e) => {
                void handleReplaceFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl bg-[#f5f5f7] px-3 text-xs font-semibold text-zinc-800 hover:bg-[#ebeced] cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Replace image
            </button>
            <button
              type="button"
              aria-label="Close image editor"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-xl bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="flex items-center justify-between gap-2 border-b border-zinc-100 bg-[#fafafa] px-5 py-2.5">
          <div className="inline-flex rounded-xl bg-[#ebeced] p-1">
            <button
              type="button"
              onClick={() => setTab("bg")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                tab === "bg" ? "bg-white text-zinc-950 shadow-xs" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <Eraser className="h-3.5 w-3.5" />
              Remove background
            </button>
            <button
              type="button"
              onClick={() => setTab("crop")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                tab === "crop" ? "bg-white text-zinc-950 shadow-xs" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <Crop className="h-3.5 w-3.5" />
              Crop &amp; shape
            </button>
          </div>
          {workingSrc !== baseSrc && (
            <button
              type="button"
              onClick={() => {
                setWorkingSrc(baseSrc);
                setCrop(DEFAULT_CROP);
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-600 hover:text-zinc-950 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset to original
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === "bg" ? (
            <div className="space-y-4">
              {/* Preview area with transparency checkerboard */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-zinc-700">
                      {pickingColor ? "Click any background pixel below" : "Original"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPickingColor((p) => !p)}
                      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold cursor-pointer ${
                        pickingColor ? "bg-amber-500 text-zinc-950" : "bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced]"
                      }`}
                    >
                      <Pipette className="h-3 w-3" />
                      {pickingColor ? "Click image…" : "Pick colour"}
                    </button>
                  </div>
                  <div
                    className={`flex h-48 items-center justify-center overflow-hidden rounded-2xl border p-3 ${
                      pickingColor ? "border-amber-500 ring-2 ring-amber-400/50 cursor-crosshair" : "border-zinc-200"
                    }`}
                    style={{
                      backgroundImage:
                        "linear-gradient(45deg, #e4e4e7 25%, transparent 25%), linear-gradient(-45deg, #e4e4e7 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e4e4e7 75%), linear-gradient(-45deg, transparent 75%, #e4e4e7 75%)",
                      backgroundSize: "14px 14px",
                      backgroundPosition: "0 0, 0 7px, 7px -7px, -7px 0",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={workingSrc}
                      alt="Original image"
                      onClick={handlePickColorClick}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#365314]">Transparent preview</span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-600">
                      Removing
                      <span className="inline-block h-3.5 w-3.5 rounded-full ring-1 ring-black/20" style={{ backgroundColor: targetHex }} />
                    </span>
                  </div>
                  <div
                    className="flex h-48 items-center justify-center overflow-hidden rounded-2xl border border-[#4d7c0f]/40 p-3"
                    style={{
                      backgroundImage:
                        "linear-gradient(45deg, #e4e4e7 25%, transparent 25%), linear-gradient(-45deg, #e4e4e7 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e4e4e7 75%), linear-gradient(-45deg, transparent 75%, #e4e4e7 75%)",
                      backgroundSize: "14px 14px",
                      backgroundPosition: "0 0, 0 7px, 7px -7px, -7px 0",
                    }}
                  >
                    {bgPreview && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={bgPreview.dataUrl} alt="Background removed preview" className="max-h-full max-w-full object-contain" />
                    )}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-[#f5f5f7] p-4">
                <div>
                  <label className="mb-1 flex items-center justify-between text-xs font-semibold text-zinc-800">
                    <span>Strength (tolerance)</span>
                    <span className="font-mono text-zinc-600">{tolerance}</span>
                  </label>
                  <input
                    type="range"
                    min={4}
                    max={95}
                    value={tolerance}
                    onChange={(e) => setTolerance(Number(e.target.value))}
                    className="w-full accent-[#4d7c0f]"
                  />
                  <p className="mt-0.5 text-[11px] text-zinc-600">Higher removes off-white shadows and compression artefacts.</p>
                </div>
                <div>
                  <label className="mb-1 flex items-center justify-between text-xs font-semibold text-zinc-800">
                    <span>Edge smoothing</span>
                    <span className="font-mono text-zinc-600">{feather}</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={25}
                    value={feather}
                    onChange={(e) => setFeather(Number(e.target.value))}
                    className="w-full accent-[#4d7c0f]"
                  />
                  <p className="mt-0.5 text-[11px] text-zinc-600">Softens jagged edges around curves and text.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-800">Mode:</span>
                  {(
                    [
                      ["edges", "Outside edges only"],
                      ["global", "All matching pixels"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setBgMode(id)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                        bgMode === id ? "bg-[#4d7c0f] text-white" : "bg-white text-zinc-700 hover:bg-zinc-100"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-zinc-800">
                  <input
                    type="checkbox"
                    checked={trimEmpty}
                    onChange={(e) => setTrimEmpty(e.target.checked)}
                    className="h-4 w-4 accent-[#4d7c0f]"
                  />
                  <Scissors className="h-3.5 w-3.5 text-zinc-500" />
                  Trim empty transparent margins
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {ASPECT_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setAspectId(p.id);
                      setCrop(DEFAULT_CROP);
                    }}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      aspectId === p.id ? "bg-[#4d7c0f] text-white" : "bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced]"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <CropEditor
                src={workingSrc}
                aspect={effectiveAspect}
                value={crop}
                onChange={setCrop}
                maxWidthPx={360}
                overlay={
                  "circle" in activePreset && activePreset.circle ? (
                    <div className="h-full w-full rounded-full ring-2 ring-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
                  ) : undefined
                }
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-zinc-200 px-5 py-3.5">
          <p className="text-[11px] text-zinc-600">All image edits run privately in your browser.</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[40px] rounded-xl bg-[#f5f5f7] px-4 text-xs font-semibold text-zinc-800 hover:bg-[#ebeced] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#4d7c0f] px-4 text-xs font-bold text-white hover:bg-[#3f6212] cursor-pointer"
            >
              <Check className="h-4 w-4" />
              {tab === "bg" ? "Apply transparent background" : "Apply crop"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
