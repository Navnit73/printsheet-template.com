"use client";

import React, { useEffect, useRef, useState } from "react";
import { Minus, Move, Plus, RotateCcw } from "lucide-react";
import {
  clampCrop,
  DEFAULT_CROP,
  getSourceRect,
  MAX_ZOOM,
  MIN_ZOOM,
  type CropState,
} from "@/lib/crop";

/**
 * Drag-to-move / zoom crop frame. The visible frame has the exact aspect of
 * the printed slot, and uses the same maths (src/lib/crop.ts) as the export.
 *
 * - Drag (mouse / touch / pen) to move the photo
 * - Zoom with the slider, +/- buttons, mouse wheel or pinch
 * - Arrow keys move, +/- keys zoom (frame is focusable)
 */
export function CropEditor({
  src,
  aspect,
  value,
  onChange,
  overlay,
  label = "Position your photo",
  maxWidthPx = 320,
}: {
  src: string;
  /** width / height of the printed slot */
  aspect: number;
  value: CropState;
  onChange: (next: CropState) => void;
  /** Guide drawn over the frame (e.g. head oval). Should be pointer-events-none. */
  overlay?: React.ReactNode;
  label?: string;
  maxWidthPx?: number;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameW, setFrameW] = useState(0);
  const [nat, setNat] = useState<{ w: number; h: number; src: string } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ dist: number; zoom: number } | null>(null);

  // Natural image size.
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setNat({ w: img.naturalWidth, h: img.naturalHeight, src });
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  // Frame width (responsive).
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setFrameW(entries[0]?.contentRect.width ?? 0);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ready = nat && nat.src === src && frameW > 0;
  const crop = ready ? clampCrop(value, nat.w, nat.h, aspect) : value;
  const rect = ready ? getSourceRect(nat.w, nat.h, aspect, crop) : null;
  const scale = rect ? frameW / rect.sw : 1; // screen px per image px

  const commit = (next: CropState) => {
    if (!nat) return;
    onChange(clampCrop(next, nat.w, nat.h, aspect));
  };

  const moveByScreenPx = (dx: number, dy: number) => {
    if (!nat) return;
    commit({
      ...crop,
      centerX: crop.centerX - dx / scale / nat.w,
      centerY: crop.centerY - dy / scale / nat.h,
    });
  };

  const setZoom = (z: number) =>
    commit({ ...crop, zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z)) });

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      pinchStart.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom: crop.zoom };
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const nextPt = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, nextPt);
    if (pointers.current.size === 2 && pinchStart.current) {
      const [a, b] = Array.from(pointers.current.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      setZoom(pinchStart.current.zoom * (dist / Math.max(1, pinchStart.current.dist)));
      return;
    }
    moveByScreenPx(nextPt.x - prev.x, nextPt.y - prev.y);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 20 : 5;
    const map: Record<string, () => void> = {
      ArrowLeft: () => moveByScreenPx(step, 0),
      ArrowRight: () => moveByScreenPx(-step, 0),
      ArrowUp: () => moveByScreenPx(0, step),
      ArrowDown: () => moveByScreenPx(0, -step),
      "+": () => setZoom(crop.zoom + 0.1),
      "=": () => setZoom(crop.zoom + 0.1),
      "-": () => setZoom(crop.zoom - 0.1),
    };
    const fn = map[e.key];
    if (fn) {
      e.preventDefault();
      fn();
    }
  };

  // Non-passive wheel listener so we can prevent page scroll while zooming.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * 0.0015);
      if (!nat) return;
      onChange(clampCrop({ ...value, zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value.zoom * factor)) }, nat.w, nat.h, aspect));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [nat, value, aspect, onChange]);

  return (
    <div className="space-y-3">
      <div className="mx-auto" style={{ maxWidth: maxWidthPx }}>
        <div
          ref={frameRef}
          role="application"
          tabIndex={0}
          aria-label={`${label}. Drag to move, use arrow keys to move, plus and minus to zoom.`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
          className="relative w-full overflow-hidden rounded-lg bg-zinc-100 cursor-grab active:cursor-grabbing touch-none select-none outline-offset-2"
          style={{ aspectRatio: `${aspect}` }}
        >
          {ready && rect && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt=""
              draggable={false}
              className="absolute max-w-none pointer-events-none"
              style={{
                width: nat.w * scale,
                height: nat.h * scale,
                left: -rect.sx * scale,
                top: -rect.sy * scale,
              }}
            />
          )}
          {overlay && <div className="pointer-events-none absolute inset-0">{overlay}</div>}
          <span className="pointer-events-none absolute bottom-1.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white">
            <Move aria-hidden="true" className="h-3 w-3" /> Drag to move
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => setZoom(crop.zoom - 0.15)}
          className="h-9 w-9 shrink-0 inline-flex items-center justify-center rounded-lg bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced] cursor-pointer"
        >
          <Minus aria-hidden="true" className="h-4 w-4" />
        </button>
        <input
          type="range"
          aria-label="Zoom"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.01}
          value={crop.zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="w-full accent-[#4d7c0f] cursor-pointer"
        />
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => setZoom(crop.zoom + 0.15)}
          className="h-9 w-9 shrink-0 inline-flex items-center justify-center rounded-lg bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced] cursor-pointer"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onChange(DEFAULT_CROP)}
          className="h-9 shrink-0 inline-flex items-center gap-1 rounded-lg bg-[#f5f5f7] px-2.5 text-xs font-semibold text-zinc-700 hover:bg-[#ebeced] cursor-pointer"
        >
          <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>
    </div>
  );
}

/**
 * Passport head-position guide drawn in slot coordinates (mm).
 * Shows an oval for the head plus chin and crown lines for the allowed range.
 */
export function HeadGuideOverlay({
  slotWidthMm,
  slotHeightMm,
  headMinMm,
  headMaxMm,
  /** distance from top of photo to top of head (crown), mm — typical ≈ 3–6 mm */
  crownTopMm,
}: {
  slotWidthMm: number;
  slotHeightMm: number;
  headMinMm: number;
  headMaxMm: number;
  crownTopMm?: number;
}) {
  const crown = crownTopMm ?? Math.max(2, (slotHeightMm - headMaxMm) * 0.4);
  const chinMin = crown + headMinMm;
  const chinMax = crown + headMaxMm;
  const headMid = (headMinMm + headMaxMm) / 2;
  const cx = slotWidthMm / 2;
  const cy = crown + headMid / 2;
  const rx = headMid * 0.36;
  const ry = headMid / 2;
  return (
    <svg
      viewBox={`0 0 ${slotWidthMm} ${slotHeightMm}`}
      className="h-full w-full"
      aria-hidden="true"
    >
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill="none"
        stroke="white"
        strokeWidth={0.5}
        strokeDasharray="1.2 0.8"
      />
      <line x1={0} x2={slotWidthMm} y1={crown} y2={crown} stroke="#a3e635" strokeWidth={0.35} />
      <line x1={0} x2={slotWidthMm} y1={chinMin} y2={chinMin} stroke="#facc15" strokeWidth={0.35} strokeDasharray="1 0.6" />
      <line x1={0} x2={slotWidthMm} y1={chinMax} y2={chinMax} stroke="#facc15" strokeWidth={0.35} strokeDasharray="1 0.6" />
      <rect
        x={0}
        y={chinMin}
        width={slotWidthMm}
        height={chinMax - chinMin}
        fill="#facc15"
        opacity={0.12}
      />
    </svg>
  );
}
