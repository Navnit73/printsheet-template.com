import { PAPER_SIZES, type PaperSizeId } from "@/lib/pdf-utils";
import type { SideDesign } from "../card/editor-model";
import { renderSideToCanvas } from "../card/export";
import type { FontPairId, LabelStyleId } from "../ui/LabelDesign";
import { applyLabelSlotOverride, type DynamicSlotOverride, type LabelTemplateId } from "./label-templates";

export type LabelCutGuideStyle = "dashed-outline" | "dashed-grid" | "crop-marks" | "none";

export interface LabelGridState {
  paper: PaperSizeId;
  cols: number;
  rows: number;
  labelW: number;
  labelH: number;
  marginTop: number;
  marginLeft: number;
  gapX: number;
  gapY: number;
  round?: boolean;
}

/* ------------------------------------------------------------------------- */
/* Print-ready PDF Export for Labels & Stickers (Sheet or Single Sticker)    */
/* ------------------------------------------------------------------------- */

function drawLabelCropMarks(
  doc: import("jspdf").jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  bleedMm: number
) {
  const off = Math.max(0.8, bleedMm + 0.5);
  const len = 2.5;
  doc.setDrawColor(113, 113, 122);
  doc.setLineWidth(0.18);
  // Top-left
  doc.line(x - off - len, y, x - off, y);
  doc.line(x, y - off - len, x, y - off);
  // Top-right
  doc.line(x + w + off, y, x + w + off + len, y);
  doc.line(x + w, y - off - len, x + w, y - off);
  // Bottom-left
  doc.line(x - off - len, y + h, x - off, y + h);
  doc.line(x, y + h + off, x, y + h + off + len);
  // Bottom-right
  doc.line(x + w + off, y + h, x + w + off + len, y + h);
  doc.line(x + w, y + h + off, x + w, y + h + off + len);
}

export async function exportLabelAdvancedPdf(params: {
  mode: "sheet" | "single";
  side: SideDesign;
  grid: LabelGridState;
  labelCount: number;
  pageCount: number;
  showBorders: boolean;
  showCropMarks: boolean;
  cutGuideStyle?: LabelCutGuideStyle;
  includeBleed: boolean;
  slotOverrides?: DynamicSlotOverride[];
  filename: string;
}): Promise<{ effectiveBleedMm: number }> {
  const { mode, side, grid, labelCount, pageCount, showBorders, showCropMarks, cutGuideStyle, includeBleed, slotOverrides, filename } = params;
  const resolvedStyle: LabelCutGuideStyle =
    cutGuideStyle ?? (showBorders ? "dashed-outline" : showCropMarks ? "crop-marks" : "none");
  const { jsPDF } = await import("jspdf");

  const round = Boolean(grid.round);
  const diameter = Math.min(grid.labelW, grid.labelH);
  const W = round ? diameter : grid.labelW;
  const H = round ? diameter : grid.labelH;

  if (mode === "single") {
    const bleed = includeBleed ? 3 : 0;
    const hasMarks = resolvedStyle !== "none";
    const margin = hasMarks ? 8 : bleed;
    const pageW = W + 2 * margin;
    const pageH = H + 2 * margin;
    const doc = new jsPDF({ orientation: pageW >= pageH ? "landscape" : "portrait", unit: "mm", format: [pageW, pageH] });
    const canvas = await renderSideToCanvas(side, W, H, { bleedMm: bleed, dpi: 360, round });
    doc.addImage(canvas.toDataURL("image/png"), "PNG", margin - bleed, margin - bleed, W + 2 * bleed, H + 2 * bleed, "lbl-single");
    if (resolvedStyle === "dashed-outline" || resolvedStyle === "dashed-grid") {
      doc.setDrawColor(140, 140, 150);
      doc.setLineWidth(0.2);
      doc.setLineDashPattern([1.8, 1.4], 0);
      if (round) doc.circle(margin + W / 2, margin + H / 2, W / 2);
      else doc.rect(margin, margin, W, H);
      doc.setLineDashPattern([], 0);
    }
    if (hasMarks) {
      drawLabelCropMarks(doc, margin, margin, W, H, bleed);
    }
    doc.save(filename);
    return { effectiveBleedMm: bleed };
  }

  // Multi-label A4 / US Letter Sheet PDF
  const paper = PAPER_SIZES[grid.paper];
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [paper.widthMm, paper.heightMm] });
  const slotsPerPage = grid.cols * grid.rows;

  // Clamp bleed safely so neighbouring labels never overlap across tight Avery sheet gaps
  const maxBleedX = grid.cols > 1 ? grid.gapX / 2 : 3;
  const maxBleedY = grid.rows > 1 ? grid.gapY / 2 : 3;
  const effectiveBleedMm = includeBleed ? Math.max(0, Math.min(3, maxBleedX, maxBleedY)) : 0;

  // Cache rendered PNGs by override signature so repeating labels render ONCE and embed once!
  const renderCache = new Map<string, { dataUrl: string; alias: string }>();
  let aliasSeq = 0;

  async function getSlotImage(idx: number) {
    const override = slotOverrides && slotOverrides.length > 0 ? slotOverrides[idx % slotOverrides.length] : null;
    const sig = override ? JSON.stringify(override) : "__base__";
    const hit = renderCache.get(sig);
    if (hit) return hit;
    const resolvedSide = override ? applyLabelSlotOverride(side, override) : side;
    const canvas = await renderSideToCanvas(resolvedSide, W, H, {
      bleedMm: effectiveBleedMm,
      dpi: 320,
      round,
    });
    const entry = { dataUrl: canvas.toDataURL("image/png"), alias: `lbl-${aliasSeq++}` };
    renderCache.set(sig, entry);
    return entry;
  }

  for (let page = 0; page < Math.max(1, pageCount); page++) {
    if (page > 0) doc.addPage([paper.widthMm, paper.heightMm], "portrait");

    for (let s = 0; s < slotsPerPage; s++) {
      const i = page * slotsPerPage + s;
      if (i >= labelCount) break;
      const r = Math.floor(s / grid.cols);
      const c = s % grid.cols;
      const cellX = grid.marginLeft + c * (grid.labelW + grid.gapX);
      const cellY = grid.marginTop + r * (grid.labelH + grid.gapY);
      const ox = round ? cellX + (grid.labelW - diameter) / 2 : cellX;
      const oy = round ? cellY + (grid.labelH - diameter) / 2 : cellY;

      const img = await getSlotImage(i);
      doc.addImage(
        img.dataUrl,
        "PNG",
        ox - effectiveBleedMm,
        oy - effectiveBleedMm,
        W + 2 * effectiveBleedMm,
        H + 2 * effectiveBleedMm,
        img.alias
      );

      if (resolvedStyle === "dashed-outline" || (round && resolvedStyle === "dashed-grid")) {
        doc.setDrawColor(135, 135, 145);
        doc.setLineWidth(0.2);
        doc.setLineDashPattern([1.8, 1.4], 0);
        if (round) doc.circle(ox + W / 2, oy + H / 2, W / 2);
        else doc.rect(ox, oy, W, H);
        doc.setLineDashPattern([], 0);
      }

      if (resolvedStyle === "crop-marks" && !round && grid.gapX >= 4 && grid.gapY >= 4) {
        drawLabelCropMarks(doc, ox, oy, W, H, effectiveBleedMm);
      }
    }

    // Full-sheet dashed cut lines (rectangular sheets)
    if (resolvedStyle === "dashed-grid" && !round) {
      const gridW = grid.cols * grid.labelW + (grid.cols - 1) * grid.gapX;
      const gridH = grid.rows * grid.labelH + (grid.rows - 1) * grid.gapY;
      const ext = 4.5;
      const topY = Math.max(1.5, grid.marginTop - ext);
      const botY = Math.min(paper.heightMm - 1.5, grid.marginTop + gridH + ext);
      const leftX = Math.max(1.5, grid.marginLeft - ext);
      const rightX = Math.min(paper.widthMm - 1.5, grid.marginLeft + gridW + ext);
      const xs = Array.from(
        new Set(
          Array.from({ length: grid.cols }, (_, c) => grid.marginLeft + c * (grid.labelW + grid.gapX)).flatMap((x) => [
            round2(x),
            round2(x + grid.labelW),
          ])
        )
      );
      const ys = Array.from(
        new Set(
          Array.from({ length: grid.rows }, (_, r) => grid.marginTop + r * (grid.labelH + grid.gapY)).flatMap((y) => [
            round2(y),
            round2(y + grid.labelH),
          ])
        )
      );

      doc.setDrawColor(135, 135, 145);
      doc.setLineWidth(0.2);
      doc.setLineDashPattern([2, 1.6], 0);
      for (const x of xs) doc.line(x, topY, x, botY);
      for (const y of ys) doc.line(leftX, y, rightX, y);
      doc.setLineDashPattern([], 0);
    }

    // Outer sheet grid crop marks
    if (resolvedStyle === "crop-marks" || resolvedStyle === "dashed-grid") {
      const gridW = grid.cols * grid.labelW + (grid.cols - 1) * grid.gapX;
      const gridH = grid.rows * grid.labelH + (grid.rows - 1) * grid.gapY;
      const off = Math.max(1, effectiveBleedMm + 0.6);
      const len = 3;
      doc.setDrawColor(100, 100, 110);
      doc.setLineWidth(0.2);
      const xs = Array.from(
        new Set(
          Array.from({ length: grid.cols }, (_, c) => grid.marginLeft + c * (grid.labelW + grid.gapX)).flatMap((x) => [
            round2(x),
            round2(x + grid.labelW),
          ])
        )
      );
      const ys = Array.from(
        new Set(
          Array.from({ length: grid.rows }, (_, r) => grid.marginTop + r * (grid.labelH + grid.gapY)).flatMap((y) => [
            round2(y),
            round2(y + grid.labelH),
          ])
        )
      );
      for (const x of xs) {
        if (grid.marginTop - off > 1) doc.line(x, Math.max(0.5, grid.marginTop - off - len), x, grid.marginTop - off);
        if (grid.marginTop + gridH + off < paper.heightMm - 1)
          doc.line(x, grid.marginTop + gridH + off, x, Math.min(paper.heightMm - 0.5, grid.marginTop + gridH + off + len));
      }
      for (const y of ys) {
        if (grid.marginLeft - off > 1) doc.line(Math.max(0.5, grid.marginLeft - off - len), y, grid.marginLeft - off, y);
        if (grid.marginLeft + gridW + off < paper.widthMm - 1)
          doc.line(grid.marginLeft + gridW + off, y, Math.min(paper.widthMm - 0.5, grid.marginLeft + gridW + off + len), y);
      }
    }
  }

  doc.save(filename);
  return { effectiveBleedMm };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/* ------------------------------------------------------------------------- */
/* Auto-save, Share link, JSON Backup & Named Local Snapshots                 */
/* ------------------------------------------------------------------------- */

export interface PersistedLabelDesign {
  v: 1;
  savedAt: number;
  grid: LabelGridState;
  labelTitle: string;
  labelSub: string;
  accentHex: string;
  labelStyle: LabelStyleId;
  fontPair: FontPairId;
  eventName: string;
  returnAddress: string;
  showBorders: boolean;
  showCropMarks: boolean;
  cutGuideStyle?: LabelCutGuideStyle;
  includeBleed: boolean;
  hasCustomDesign: boolean;
  templateId: LabelTemplateId;
  side: SideDesign;
}

export interface LabelNamedSnapshot {
  id: string;
  name: string;
  savedAt: number;
  payload: PersistedLabelDesign;
}

const AUTOSAVE_PREFIX = "printsheet_label_autosave_v1_";
const SNAPSHOTS_KEY = "printsheet_label_snapshots_v1";
const TOUR_SEEN_KEY = "printsheet_label_tour_seen_v1";

function stripOriginals(side: SideDesign): SideDesign {
  return {
    ...side,
    layers: side.layers.map((l) => (l.kind === "image" ? { ...l, originalSrc: undefined } : l)),
  };
}

export function saveAutoLabelDesign(pageId: string, payload: PersistedLabelDesign): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(`${AUTOSAVE_PREFIX}${pageId}`, JSON.stringify(payload));
    return true;
  } catch {
    try {
      window.localStorage.setItem(`${AUTOSAVE_PREFIX}${pageId}`, JSON.stringify({ ...payload, side: stripOriginals(payload.side) }));
      return true;
    } catch {
      return false;
    }
  }
}

export function loadAutoLabelDesign(pageId: string): PersistedLabelDesign | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`${AUTOSAVE_PREFIX}${pageId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedLabelDesign;
    if (parsed && parsed.v === 1 && parsed.grid && parsed.side?.layers) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function loadLabelSnapshots(): LabelNamedSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SNAPSHOTS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveLabelSnapshot(name: string, payload: PersistedLabelDesign): LabelNamedSnapshot[] {
  const existing = loadLabelSnapshots();
  const snap: LabelNamedSnapshot = {
    id: `lsnap-${Date.now().toString(36)}`,
    name: name.trim() || `Label design ${existing.length + 1}`,
    savedAt: Date.now(),
    payload: { ...payload, side: stripOriginals(payload.side) },
  };
  const next = [snap, ...existing].slice(0, 10);
  try {
    window.localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(next));
  } catch {
    try {
      window.localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(next.slice(0, 3)));
    } catch {
      // ignore
    }
  }
  return next;
}

export function deleteLabelSnapshot(id: string): LabelNamedSnapshot[] {
  const next = loadLabelSnapshots().filter((s) => s.id !== id);
  try {
    window.localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}

export function hasSeenLabelTour(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(TOUR_SEEN_KEY) === "1";
  } catch {
    return true;
  }
}

export function markLabelTourSeen(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOUR_SEEN_KEY, "1");
  } catch {
    // ignore
  }
}

function utf8ToBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToUtf8(b64: string): string {
  const padded = b64.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((b64.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function buildLabelShareLink(payload: PersistedLabelDesign): { url: string; strippedImages: boolean } {
  const baseUrl = typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}` : "";
  const compact = (stripImg: boolean): PersistedLabelDesign => ({
    ...payload,
    side: {
      ...payload.side,
      background:
        stripImg && payload.side.background?.type === "image"
          ? { type: "solid", color: payload.side.bg || "#ffffff" }
          : payload.side.background,
      layers: payload.side.layers
        .filter((l) => !(stripImg && l.kind === "image" && !l.qrText && !l.barcodeText))
        .map((l) =>
          l.kind === "image"
            ? {
                ...l,
                src: l.qrText || l.barcodeText ? "" : l.src,
                qrFor: undefined,
                barcodeFor: undefined,
                originalSrc: undefined,
              }
            : l
        ),
    },
  });

  const full = utf8ToBase64Url(JSON.stringify(compact(false)));
  if (full.length <= 12000) return { url: `${baseUrl}#label=${full}`, strippedImages: false };
  const light = utf8ToBase64Url(JSON.stringify(compact(true)));
  return { url: `${baseUrl}#label=${light}`, strippedImages: true };
}

export function decodeLabelShareHash(hash: string): PersistedLabelDesign | null {
  if (!hash || !hash.includes("label=")) return null;
  try {
    const match = hash.match(/label=([A-Za-z0-9_-]+)/);
    if (!match) return null;
    const parsed = JSON.parse(base64UrlToUtf8(match[1])) as PersistedLabelDesign;
    if (parsed && parsed.v === 1 && parsed.grid && parsed.side?.layers) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function downloadLabelDesignJson(payload: PersistedLabelDesign, filename = "label-sticker-design.json") {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function parseLabelDesignJson(text: string): PersistedLabelDesign | null {
  try {
    const parsed = JSON.parse(text) as PersistedLabelDesign;
    if (parsed && parsed.v === 1 && parsed.grid && parsed.side?.layers) return parsed;
    return null;
  } catch {
    return null;
  }
}
