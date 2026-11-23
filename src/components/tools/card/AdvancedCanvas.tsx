"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pipette, RotateCw, Type } from "lucide-react";
import { PT_TO_MM, cssStack, previewFit } from "./engine";
import {
  compileSide,
  getSideBackground,
  layerLabel,
  type Box,
  type Layer,
  type SideDesign,
  type TextLayer,
} from "./editor-model";
import { CardFacePreview } from "./CardFacePreview";
import { sampleColorFromSide } from "./export";

export type LayerPatch = Partial<Layer>;

type HandleDir = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

interface SnapGuides {
  x?: number;
  y?: number;
}

interface TransientOp {
  id: string;
  patch: LayerPatch;
  hud: string;
}

const BLEED_MM = 3;
const SAFE_MM = 4;
const GRID_MM = 5;
const SNAP_PX = 6;
const round2 = (n: number) => Math.round(n * 100) / 100;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function normalizeAngle(deg: number): number {
  let a = ((deg + 180) % 360 + 360) % 360 - 180;
  if (a === -180) a = 180;
  return Math.round(a);
}

export const AdvancedCanvas = React.memo(function AdvancedCanvas({
  W,
  H,
  side,
  sideName,
  round = false,
  itemLabel = "card",
  selectedId,
  editingTextId,
  zoom,
  showGuides,
  includeBleed,
  showGrid,
  snapEnabled,
  eyedropperActive,
  onSelect,
  onStartEditText,
  onStopEditText,
  onChange,
  onZoomChange,
  onEyedropperSample,
  onCancelEyedropper,
  onDropImageFile,
}: {
  W: number;
  H: number;
  side: SideDesign;
  sideName: "front" | "back" | "label";
  /** Circular trim & safe-area guides (for round labels / stickers). */
  round?: boolean;
  /** Friendly noun for captions/tooltips (e.g. "card", "label", "sticker"). */
  itemLabel?: string;
  selectedId: string | null;
  editingTextId: string | null;
  zoom: number;
  showGuides: boolean;
  includeBleed: boolean;
  showGrid: boolean;
  snapEnabled: boolean;
  eyedropperActive: boolean;
  onSelect: (id: string | null) => void;
  onStartEditText: (id: string) => void;
  onStopEditText: () => void;
  onChange: (id: string, patch: LayerPatch, group?: string) => void;
  onZoomChange: (nextZoom: number) => void;
  onEyedropperSample: (hex: string) => void;
  onCancelEyedropper: () => void;
  onDropImageFile: (file: File) => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState<{ w: number; h: number }>({ w: 720, h: 460 });
  const [guides, setGuides] = useState<SnapGuides>({});
  const [transient, setTransient] = useState<TransientOp | null>(null);
  const [dragOverFile, setDragOverFile] = useState(false);

  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef<TransientOp | null>(null);
  const sessionRef = useRef(0);

  const opRef = useRef<
    | {
        kind: "move";
        layer: Layer;
        box: Box;
        sx: number;
        sy: number;
        pxPerMm: number;
        otherBoxes: Box[];
      }
    | {
        kind: "resize";
        dir: HandleDir;
        layer: Layer;
        box: Box;
        sx: number;
        sy: number;
        pxPerMm: number;
      }
    | {
        kind: "rotate";
        layer: Layer;
        cxPx: number;
        cyPx: number;
        startPointerAngle: number;
        startRot: number;
      }
    | null
  >(null);

  // Measure available stage size so zoom=1 fits cleanly on desktop, tablet, and mobile.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r && r.width > 0 && r.height > 0) {
        setStageSize({ w: r.width, h: r.height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Ctrl/Cmd + mouse wheel zoom on the canvas stage.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      onZoomChange(clamp(Math.round((zoom + delta) * 100) / 100, 0.5, 2.5));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoom, onZoomChange]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Apply transient drag/resize/rotate patch locally at 60fps without re-rendering parent panels.
  const effectiveSide = useMemo<SideDesign>(() => {
    if (!transient) return side;
    return {
      ...side,
      layers: side.layers.map((l) => (l.id === transient.id ? ({ ...l, ...transient.patch } as Layer) : l)),
    };
  }, [side, transient]);

  const compiled = useMemo(() => compileSide(effectiveSide, W, H, previewFit), [effectiveSide, W, H]);

  const bleedPadMm = showGuides || includeBleed ? BLEED_MM : 0;
  const totalW = W + bleedPadMm * 2;
  const totalH = H + bleedPadMm * 2;
  const availW = Math.max(220, stageSize.w - 64);
  const availH = Math.max(160, stageSize.h - 72);
  const basePxPerMm = Math.min(availW / totalW, availH / totalH, 8.2);
  const pxPerMm = basePxPerMm * zoom;
  const cardWidthPx = W * pxPerMm;
  const cardHeightPx = H * pxPerMm;
  const bleedPx = bleedPadMm * pxPerMm;

  const pctX = (mm: number) => `${(mm / W) * 100}%`;
  const pctY = (mm: number) => `${(mm / H) * 100}%`;

  const scheduleTransient = (next: TransientOp) => {
    pendingRef.current = next;
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (pendingRef.current) setTransient(pendingRef.current);
      });
    }
  };

  const beginMove = (e: React.PointerEvent, layer: Layer) => {
    if (eyedropperActive || editingTextId === layer.id) return;
    e.stopPropagation();
    if (editingTextId && editingTextId !== layer.id) onStopEditText();
    onSelect(layer.id);
    if (layer.locked) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const box = compiled.bounds.get(layer.id) ?? { x: layer.x, y: layer.y, w: layer.w, h: layer.h };
    const otherBoxes: Box[] = [];
    for (const o of side.layers) {
      if (o.id === layer.id || o.hidden) continue;
      otherBoxes.push(compiled.bounds.get(o.id) ?? { x: o.x, y: o.y, w: o.w, h: o.h });
    }
    opRef.current = {
      kind: "move",
      layer,
      box,
      sx: e.clientX,
      sy: e.clientY,
      pxPerMm: rect.width / W,
      otherBoxes,
    };
  };

  const beginResize = (e: React.PointerEvent, layer: Layer, dir: HandleDir) => {
    if (eyedropperActive || layer.locked) return;
    e.stopPropagation();
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const box = compiled.bounds.get(layer.id) ?? { x: layer.x, y: layer.y, w: layer.w, h: layer.h };
    opRef.current = {
      kind: "resize",
      dir,
      layer,
      box,
      sx: e.clientX,
      sy: e.clientY,
      pxPerMm: rect.width / W,
    };
  };

  const beginRotate = (e: React.PointerEvent, layer: Layer) => {
    if (eyedropperActive || layer.locked) return;
    e.stopPropagation();
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const box = compiled.bounds.get(layer.id) ?? { x: layer.x, y: layer.y, w: layer.w, h: layer.h };
    const cxPx = rect.left + ((box.x + box.w / 2) / W) * rect.width;
    const cyPx = rect.top + ((box.y + box.h / 2) / H) * rect.height;
    const startPointerAngle = (Math.atan2(e.clientY - cyPx, e.clientX - cxPx) * 180) / Math.PI;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    opRef.current = {
      kind: "rotate",
      layer,
      cxPx,
      cyPx,
      startPointerAngle,
      startRot: layer.rotation ?? 0,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const op = opRef.current;
    if (!op) return;

    if (op.kind === "move") {
      const dx = (e.clientX - op.sx) / op.pxPerMm;
      const dy = (e.clientY - op.sy) / op.pxPerMm;
      let nx = op.layer.x + dx;
      let ny = op.layer.y + dy;
      const { w, h } = op.box;
      const activeGuides: SnapGuides = {};

      if (snapEnabled && !e.altKey) {
        const tol = SNAP_PX / op.pxPerMm;
        const xTargets: number[] = [0, SAFE_MM, W / 2, W - SAFE_MM, W];
        const yTargets: number[] = [0, SAFE_MM, H / 2, H - SAFE_MM, H];
        for (const ob of op.otherBoxes) {
          xTargets.push(ob.x, ob.x + ob.w / 2, ob.x + ob.w);
          yTargets.push(ob.y, ob.y + ob.h / 2, ob.y + ob.h);
        }
        if (showGrid) {
          for (let gx = GRID_MM; gx < W; gx += GRID_MM) xTargets.push(gx);
          for (let gy = GRID_MM; gy < H; gy += GRID_MM) yTargets.push(gy);
        }

        // Check left, center, right of dragged box
        let bestXDiff = tol;
        let snappedX: number | undefined;
        let guideX: number | undefined;
        for (const t of xTargets) {
          const candidates: Array<[number, number]> = [
            [Math.abs(nx - t), t],
            [Math.abs(nx + w / 2 - t), t - w / 2],
            [Math.abs(nx + w - t), t - w],
          ];
          for (const [diff, val] of candidates) {
            if (diff < bestXDiff) {
              bestXDiff = diff;
              snappedX = val;
              guideX = t;
            }
          }
        }
        if (snappedX !== undefined) {
          nx = snappedX;
          activeGuides.x = guideX;
        }

        // Check top, middle, bottom of dragged box
        let bestYDiff = tol;
        let snappedY: number | undefined;
        let guideY: number | undefined;
        for (const t of yTargets) {
          const candidates: Array<[number, number]> = [
            [Math.abs(ny - t), t],
            [Math.abs(ny + h / 2 - t), t - h / 2],
            [Math.abs(ny + h - t), t - h],
          ];
          for (const [diff, val] of candidates) {
            if (diff < bestYDiff) {
              bestYDiff = diff;
              snappedY = val;
              guideY = t;
            }
          }
        }
        if (snappedY !== undefined) {
          ny = snappedY;
          activeGuides.y = guideY;
        }
      }

      setGuides(activeGuides);
      const rx = round2(nx);
      const ry = round2(ny);
      scheduleTransient({
        id: op.layer.id,
        patch: { x: rx, y: ry },
        hud: `X ${rx.toFixed(1)} · Y ${ry.toFixed(1)} mm`,
      });
    } else if (op.kind === "resize") {
      // Rotate pointer delta into the element's local axes
      const rawDx = (e.clientX - op.sx) / op.pxPerMm;
      const rawDy = (e.clientY - op.sy) / op.pxPerMm;
      const rad = -((op.layer.rotation ?? 0) * Math.PI) / 180;
      const dx = rawDx * Math.cos(rad) - rawDy * Math.sin(rad);
      const dy = rawDx * Math.sin(rad) + rawDy * Math.cos(rad);

      const { layer, box, dir } = op;
      const isCorner = dir.length === 2;
      let nx = layer.x;
      let ny = layer.y;
      let nw = box.w;
      let nh = box.h;

      if (dir.includes("e")) nw = clamp(box.w + dx, 2, W * 2);
      if (dir.includes("w")) {
        nw = clamp(box.w - dx, 2, W * 2);
        nx = layer.x + (box.w - nw);
      }
      if (dir.includes("s")) nh = clamp(box.h + dy, 0.5, H * 2);
      if (dir.includes("n")) {
        nh = clamp(box.h - dy, 0.5, H * 2);
        ny = layer.y + (box.h - nh);
      }

      if (layer.kind === "text") {
        if (isCorner) {
          const factor = clamp(nw / Math.max(2, box.w), 0.35, 3);
          const nextSize = round2(clamp(layer.size * factor, 4, 72));
          scheduleTransient({
            id: layer.id,
            patch: { x: round2(nx), y: round2(ny), w: round2(nw), size: nextSize } as Partial<TextLayer>,
            hud: `${nextSize.toFixed(1)} pt · W ${nw.toFixed(1)} mm`,
          });
        } else {
          scheduleTransient({
            id: layer.id,
            patch: { x: round2(nx), w: round2(nw) },
            hud: `Width ${nw.toFixed(1)} mm`,
          });
        }
      } else if (layer.kind === "image" || layer.kind === "icon") {
        const ratio = layer.kind === "image" ? layer.ratio : 1;
        if (dir === "n" || dir === "s") {
          nw = clamp(nh * ratio, 2, W * 2);
        } else {
          nh = clamp(nw / ratio, 2, H * 2);
        }
        if (dir.includes("w")) nx = layer.x + (box.w - nw);
        if (dir.includes("n")) ny = layer.y + (box.h - nh);
        scheduleTransient({
          id: layer.id,
          patch: { x: round2(nx), y: round2(ny), w: round2(nw), h: round2(nh) },
          hud: `${nw.toFixed(1)} × ${nh.toFixed(1)} mm`,
        });
      } else if (layer.kind === "line") {
        scheduleTransient({
          id: layer.id,
          patch: { x: round2(nx), w: round2(nw) },
          hud: `Length ${nw.toFixed(1)} mm`,
        });
      } else {
        if (e.shiftKey && isCorner) {
          const sideLen = Math.max(nw, nh);
          nw = sideLen;
          nh = sideLen;
        }
        scheduleTransient({
          id: layer.id,
          patch: { x: round2(nx), y: round2(ny), w: round2(nw), h: round2(nh) },
          hud: `${nw.toFixed(1)} × ${nh.toFixed(1)} mm`,
        });
      }
    } else if (op.kind === "rotate") {
      const currAngle = (Math.atan2(e.clientY - op.cyPx, e.clientX - op.cxPx) * 180) / Math.PI;
      let nextRot = normalizeAngle(op.startRot + (currAngle - op.startPointerAngle));
      if (e.shiftKey) {
        nextRot = normalizeAngle(Math.round(nextRot / 15) * 15);
      } else if (snapEnabled) {
        const snaps = [-180, -135, -90, -45, 0, 45, 90, 135, 180];
        const near = snaps.find((s) => Math.abs(s - nextRot) <= 4);
        if (near !== undefined) nextRot = normalizeAngle(near);
      }
      scheduleTransient({
        id: op.layer.id,
        patch: { rotation: nextRot },
        hud: `${nextRot}°`,
      });
    }
  };

  const endPointer = () => {
    if (!opRef.current) return;
    opRef.current = null;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const finalOp = pendingRef.current ?? transient;
    pendingRef.current = null;
    setGuides({});
    setTransient(null);
    if (finalOp) {
      sessionRef.current += 1;
      onChange(finalOp.id, finalOp.patch, `canvas-op-${sessionRef.current}`);
    }
  };

  async function handleCardEyedropperClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!eyedropperActive || !cardRef.current) return;
    e.stopPropagation();
    const rect = cardRef.current.getBoundingClientRect();
    const nx = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const ny = clamp((e.clientY - rect.top) / rect.height, 0, 1);
    const hex = await sampleColorFromSide(side, W, H, nx, ny);
    onEyedropperSample(hex);
  }

  const editingLayer = editingTextId
    ? (effectiveSide.layers.find((l): l is TextLayer => l.id === editingTextId && l.kind === "text") ?? null)
    : null;
  const editingBox = editingLayer ? (compiled.bounds.get(editingLayer.id) ?? editingLayer) : null;
  const editingFittedSize = editingLayer ? (compiled.fittedSizes.get(editingLayer.id) ?? editingLayer.size) : 9;

  // Bleed backdrop CSS so the 3 mm bleed zone visually mirrors the card's background
  const bgSpec = getSideBackground(effectiveSide);
  const bleedBgStyle: React.CSSProperties =
    bgSpec.type === "solid"
      ? { backgroundColor: bgSpec.color }
      : bgSpec.type === "gradient"
        ? { backgroundImage: `linear-gradient(${bgSpec.angle}deg, ${bgSpec.from}, ${bgSpec.to})` }
        : bgSpec.type === "pattern"
          ? { backgroundColor: bgSpec.bg }
          : bgSpec.type === "image" && bgSpec.src
            ? {
                backgroundImage: `url(${bgSpec.src})`,
                backgroundSize: bgSpec.fit === "cover" ? "cover" : "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }
            : { backgroundColor: effectiveSide.bg || "#ffffff" };

  return (
    <div
      ref={stageRef}
      onPointerDown={() => {
        if (eyedropperActive) {
          onCancelEyedropper();
          return;
        }
        if (editingTextId) onStopEditText();
        onSelect(null);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!dragOverFile) setDragOverFile(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverFile(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOverFile(false);
        const f = e.dataTransfer.files?.[0];
        if (f && f.type.startsWith("image/")) onDropImageFile(f);
      }}
      className={`relative flex flex-1 items-center justify-center overflow-auto select-none transition-colors ${
        dragOverFile ? "bg-[#eef6e4]" : "bg-[#f0f0f2]"
      }`}
      style={{
        backgroundImage: "radial-gradient(#d4d4d8 0.85px, transparent 0.85px)",
        backgroundSize: "18px 18px",
      }}
    >
      {/* Eyedropper helper pill */}
      {eyedropperActive && (
        <div className="pointer-events-auto absolute top-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-zinc-950 px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
          <Pipette className="h-3.5 w-3.5 text-amber-400" />
          Click anywhere on the {itemLabel} to pick a colour
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCancelEyedropper();
            }}
            className="ml-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px] hover:bg-white/25 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Drag & drop overlay */}
      {dragOverFile && (
        <div className="pointer-events-none absolute inset-4 z-30 flex items-center justify-center rounded-3xl border-2 border-dashed border-[#4d7c0f] bg-[#eef6e4]/80 text-sm font-bold text-[#365314]">
          Drop image to place on {itemLabel}
        </div>
      )}

      {/* Outer print frame (trim + optional 3 mm bleed zone) */}
      <div
        className="relative shrink-0"
        style={{
          width: cardWidthPx + bleedPx * 2,
          height: cardHeightPx + bleedPx * 2,
          padding: bleedPx,
        }}
      >
        {/* Bleed background extension when bleed is enabled */}
        {bleedPx > 0 && (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 ${round ? "rounded-full" : "rounded-[2px]"} ${
              includeBleed ? "opacity-95 shadow-sm" : "bg-white/45"
            }`}
            style={includeBleed ? bleedBgStyle : undefined}
          />
        )}

        {/* Bleed outline & legend */}
        {showGuides && bleedPx > 0 && (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 border border-dashed ${round ? "rounded-full" : ""} ${
              includeBleed ? "border-amber-600/80" : "border-zinc-400/60"
            }`}
          >
            <span className="absolute -top-5 left-0 rounded bg-amber-100/90 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900">
              {includeBleed ? "Bleed (+3 mm)" : "3 mm bleed guide"}
            </span>
          </div>
        )}

        {/* Actual trim box (e.g. 90 × 55 mm card or Ø 50 mm round sticker) */}
        <div
          ref={cardRef}
          onClick={eyedropperActive ? handleCardEyedropperClick : undefined}
          onPointerMove={handlePointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          className={`relative bg-white shadow-[0_12px_36px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.08)] ${
            round ? "rounded-full" : ""
          } ${eyedropperActive ? "cursor-crosshair" : ""}`}
          style={{
            width: cardWidthPx,
            height: cardHeightPx,
            containerType: "inline-size",
          }}
        >
          {/* Clipped artwork layer */}
          <div className={`pointer-events-none absolute inset-0 overflow-hidden ${round ? "rounded-full" : ""}`}>
            <CardFacePreview
              W={W}
              H={H}
              els={compiled.els}
              images={{}}
              label={`${sideName} of ${itemLabel}`}
              editingLayerId={editingTextId}
            />
          </div>

          {/* Optional 5 mm grid */}
          {showGrid && (
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 ${round ? "rounded-full" : ""}`}
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(77,124,15,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(77,124,15,0.14) 1px, transparent 1px)",
                backgroundSize: `${GRID_MM * pxPerMm}px ${GRID_MM * pxPerMm}px`,
              }}
            />
          )}

          {/* Safe-area guide */}
          {showGuides && (
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute border border-dashed border-emerald-600/65 ${round ? "rounded-full" : ""}`}
              style={{
                left: pctX(Math.min(SAFE_MM, W * 0.12)),
                top: pctY(Math.min(SAFE_MM, H * 0.12)),
                right: pctX(Math.min(SAFE_MM, W * 0.12)),
                bottom: pctY(Math.min(SAFE_MM, H * 0.12)),
              }}
            >
              <span
                className={`absolute rounded bg-white/80 px-1 text-[9px] font-semibold text-emerald-800 ${
                  round ? "bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap" : "bottom-0.5 right-1"
                }`}
              >
                Safe area
              </span>
            </div>
          )}

          {/* Smart alignment snap guides */}
          {guides.x !== undefined && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 z-20 w-[1.5px] bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.8)]"
              style={{ left: pctX(guides.x) }}
            />
          )}
          {guides.y !== undefined && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 z-20 h-[1.5px] bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.8)]"
              style={{ top: pctY(guides.y) }}
            />
          )}

          {/* Interactive layer hitboxes, selection chrome, resize & rotate handles */}
          {!eyedropperActive && (
            <div className="absolute inset-0 z-10 touch-none">
              {effectiveSide.layers.map((layer) => {
                if (layer.hidden) return null;
                const box = compiled.bounds.get(layer.id) ?? { x: layer.x, y: layer.y, w: layer.w, h: layer.h };
                const hitH = Math.max(box.h, 3.2);
                const topMm = box.y - (hitH - box.h) / 2;
                const isSelected = layer.id === selectedId;
                const isEditing = layer.id === editingTextId;
                const rot = layer.rotation ?? 0;

                if (isEditing) return null;

                const handles: Array<{ dir: HandleDir; cls: string; cursor: string }> =
                  layer.kind === "line"
                    ? [
                        { dir: "w", cls: "-left-1.5 top-1/2 -translate-y-1/2", cursor: "cursor-ew-resize" },
                        { dir: "e", cls: "-right-1.5 top-1/2 -translate-y-1/2", cursor: "cursor-ew-resize" },
                      ]
                    : layer.kind === "text"
                      ? [
                          { dir: "nw", cls: "-top-1.5 -left-1.5", cursor: "cursor-nwse-resize" },
                          { dir: "ne", cls: "-top-1.5 -right-1.5", cursor: "cursor-nesw-resize" },
                          { dir: "sw", cls: "-bottom-1.5 -left-1.5", cursor: "cursor-nesw-resize" },
                          { dir: "se", cls: "-bottom-1.5 -right-1.5", cursor: "cursor-nwse-resize" },
                          { dir: "w", cls: "-left-1.5 top-1/2 -translate-y-1/2 !h-4 !w-2 !rounded-full", cursor: "cursor-ew-resize" },
                          { dir: "e", cls: "-right-1.5 top-1/2 -translate-y-1/2 !h-4 !w-2 !rounded-full", cursor: "cursor-ew-resize" },
                        ]
                      : [
                          { dir: "nw", cls: "-top-1.5 -left-1.5", cursor: "cursor-nwse-resize" },
                          { dir: "ne", cls: "-top-1.5 -right-1.5", cursor: "cursor-nesw-resize" },
                          { dir: "sw", cls: "-bottom-1.5 -left-1.5", cursor: "cursor-nesw-resize" },
                          { dir: "se", cls: "-bottom-1.5 -right-1.5", cursor: "cursor-nwse-resize" },
                          ...(layer.kind !== "image" && layer.kind !== "icon"
                            ? [
                                { dir: "n" as const, cls: "-top-1.5 left-1/2 -translate-x-1/2", cursor: "cursor-ns-resize" },
                                { dir: "s" as const, cls: "-bottom-1.5 left-1/2 -translate-x-1/2", cursor: "cursor-ns-resize" },
                                { dir: "w" as const, cls: "-left-1.5 top-1/2 -translate-y-1/2", cursor: "cursor-ew-resize" },
                                { dir: "e" as const, cls: "-right-1.5 top-1/2 -translate-y-1/2", cursor: "cursor-ew-resize" },
                              ]
                            : []),
                        ];

                return (
                  <div
                    key={layer.id}
                    title={layer.kind === "text" ? `${layerLabel(layer)} — double-click to edit text` : layerLabel(layer)}
                    onPointerDown={(e) => beginMove(e, layer)}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      if (layer.kind === "text" && !layer.locked) {
                        onStartEditText(layer.id);
                      }
                    }}
                    className={`absolute ${layer.locked ? "cursor-not-allowed" : "cursor-move"} ${
                      isSelected
                        ? "ring-2 ring-[#4d7c0f] ring-offset-1 ring-offset-transparent"
                        : "hover:ring-1 hover:ring-dashed hover:ring-[#4d7c0f]/70"
                    }`}
                    style={{
                      left: pctX(box.x),
                      top: pctY(topMm),
                      width: pctX(Math.max(box.w, 2)),
                      height: pctY(hitH),
                      transform: rot ? `rotate(${rot}deg)` : undefined,
                      transformOrigin: "center center",
                    }}
                  >
                    {/* Live drag/resize/rotate HUD readout */}
                    {transient && transient.id === layer.id && (
                      <div className="pointer-events-none absolute -top-8 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full bg-zinc-950 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-white shadow">
                        {transient.hud}
                      </div>
                    )}

                    {/* Quick "Edit text" pill for beginners on selected text */}
                    {isSelected && layer.kind === "text" && !layer.locked && !transient && (
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartEditText(layer.id);
                        }}
                        className="absolute -bottom-7 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-white shadow hover:bg-[#4d7c0f] cursor-pointer"
                      >
                        <Type className="h-2.5 w-2.5" />
                        Edit text
                      </button>
                    )}

                    {/* Resize & Rotate handles */}
                    {isSelected && !layer.locked && (
                      <>
                        {handles.map((h) => (
                          <span
                            key={h.dir}
                            role="presentation"
                            onPointerDown={(e) => beginResize(e, layer, h.dir)}
                            className={`absolute z-20 h-3 w-3 rounded-full border-2 border-white bg-[#4d7c0f] shadow ${h.cls} ${h.cursor}`}
                          />
                        ))}
                        {/* Rotation stem + knob */}
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute -top-6 left-1/2 h-5 w-px -translate-x-1/2 bg-[#4d7c0f]"
                        />
                        <span
                          role="presentation"
                          title="Drag to rotate (hold Shift for 15° steps)"
                          onPointerDown={(e) => beginRotate(e, layer)}
                          className="absolute -top-9 left-1/2 z-20 grid h-5 w-5 -translate-x-1/2 place-items-center rounded-full border border-[#4d7c0f] bg-white text-[#4d7c0f] shadow hover:bg-[#eef6e4] cursor-grab active:cursor-grabbing"
                        >
                          <RotateCw className="h-2.5 w-2.5" />
                        </span>
                      </>
                    )}
                  </div>
                );
              })}

              {/* Direct on-canvas inline text editor */}
              {editingLayer && editingBox && (
                <div
                  onPointerDown={(e) => e.stopPropagation()}
                  className="absolute z-30"
                  style={{
                    left: pctX(editingLayer.x),
                    top: pctY(editingLayer.y),
                    width: pctX(Math.max(editingLayer.w, 8)),
                    minHeight: pctY(Math.max(editingBox.h, 5)),
                    transform: editingLayer.rotation ? `rotate(${editingLayer.rotation}deg)` : undefined,
                    transformOrigin: "center center",
                  }}
                >
                  <textarea
                    autoFocus
                    value={editingLayer.text}
                    onChange={(e) => onChange(editingLayer.id, { text: e.target.value }, `inline-text-${editingLayer.id}`)}
                    onBlur={onStopEditText}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === "Escape") {
                        e.preventDefault();
                        onStopEditText();
                      }
                    }}
                    rows={Math.max(1, editingLayer.text.split("\n").length)}
                    className="w-full resize-none overflow-hidden rounded-xs bg-white/15 p-0 outline-2 outline-amber-500"
                    style={{
                      fontFamily: cssStack(editingLayer.family, editingLayer.text, editingLayer.fontId),
                      fontSize: `${editingFittedSize * PT_TO_MM * pxPerMm}px`,
                      lineHeight: editingLayer.leading,
                      fontWeight: editingLayer.bold ? 700 : 400,
                      fontStyle: editingLayer.italic ? "italic" : "normal",
                      textDecoration: editingLayer.underline ? "underline" : undefined,
                      textTransform: editingLayer.uppercase ? "uppercase" : undefined,
                      textAlign: editingLayer.align,
                      letterSpacing: editingLayer.track ? `${editingLayer.track}em` : undefined,
                      color: editingLayer.color,
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dimensions caption under canvas */}
        <div className="pointer-events-none absolute -bottom-6 inset-x-0 flex items-center justify-center gap-2 text-[10px] font-medium text-zinc-500">
          <span>
            {sideName === "label" ? (round ? `Round ${itemLabel}` : `${itemLabel[0].toUpperCase()}${itemLabel.slice(1)}`) : sideName === "front" ? "Front" : "Back"} ·{" "}
            {round ? `Ø ${W} mm` : `${W} × ${H} mm`}
          </span>
          {includeBleed && <span className="text-amber-700">· +3 mm bleed</span>}
        </div>
      </div>
    </div>
  );
});
