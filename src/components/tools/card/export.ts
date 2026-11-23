import { loadImageElement, PAPER_SIZES } from "@/lib/pdf-utils";
import { getCardFont, getGoogleFontsUrl, isBuiltinPdfFont } from "./fonts";
import { getCardIcon } from "./icons";
import {
  PT_TO_MM,
  cssStack,
  drawCardElsPdf,
  drawSheetCutGuides,
  pdfFitFor,
  previewFit,
  rgbCss,
  sheetGeometry,
  type BackStyleId,
  type CardStyleId,
  type CutGuideStyle,
  type FontPairId,
  type PatternKind,
  type RGB,
  type SheetPreset,
  type SheetPresetId,
} from "./engine";
import {
  compileSide,
  getSideBackground,
  type CardDesign,
  type GalleryTemplateId,
  type SideDesign,
} from "./editor-model";

/* ------------------------------------------------------------------------- */
/* Canvas 2D high-DPI renderer (powers 300-360 DPI PNG, PDF & Eyedropper)    */
/* ------------------------------------------------------------------------- */

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function drawPatternCanvas(
  ctx: CanvasRenderingContext2D,
  wPx: number,
  hPx: number,
  bg: RGB,
  fg: RGB,
  pattern: PatternKind,
  opacity: number,
  scale: number,
  pxPerMm: number
) {
  ctx.fillStyle = rgbCss(bg);
  ctx.fillRect(0, 0, wPx, hPx);

  const sz = Math.max(8, Math.round(8 * scale * (pxPerMm / 4)));
  const tile = document.createElement("canvas");
  tile.width = sz;
  tile.height = sz;
  const tctx = tile.getContext("2d");
  if (!tctx) return;

  tctx.strokeStyle = `rgba(${fg[0]}, ${fg[1]}, ${fg[2]}, ${opacity})`;
  tctx.fillStyle = `rgba(${fg[0]}, ${fg[1]}, ${fg[2]}, ${opacity})`;
  tctx.lineCap = "round";

  if (pattern === "dots") {
    tctx.beginPath();
    tctx.arc(sz / 2, sz / 2, Math.max(1.2, sz * 0.14), 0, Math.PI * 2);
    tctx.fill();
  } else if (pattern === "grid") {
    tctx.lineWidth = Math.max(1, sz * 0.06);
    tctx.beginPath();
    tctx.moveTo(sz, 0);
    tctx.lineTo(0, 0);
    tctx.lineTo(0, sz);
    tctx.stroke();
  } else if (pattern === "diagonal") {
    tctx.lineWidth = Math.max(1, sz * 0.09);
    tctx.beginPath();
    tctx.moveTo(-sz * 0.25, sz * 0.25);
    tctx.lineTo(sz * 0.25, -sz * 0.25);
    tctx.moveTo(0, sz);
    tctx.lineTo(sz, 0);
    tctx.moveTo(sz * 0.75, sz * 1.25);
    tctx.lineTo(sz * 1.25, sz * 0.75);
    tctx.stroke();
  } else if (pattern === "crosshatch") {
    tctx.lineWidth = Math.max(1, sz * 0.06);
    tctx.beginPath();
    tctx.moveTo(0, 0);
    tctx.lineTo(sz, sz);
    tctx.moveTo(sz, 0);
    tctx.lineTo(0, sz);
    tctx.stroke();
  } else if (pattern === "waves") {
    tctx.lineWidth = Math.max(1, sz * 0.08);
    tctx.beginPath();
    tctx.moveTo(0, sz * 0.5);
    tctx.quadraticCurveTo(sz * 0.25, sz * 0.15, sz * 0.5, sz * 0.5);
    tctx.quadraticCurveTo(sz * 0.75, sz * 0.85, sz, sz * 0.5);
    tctx.stroke();
  } else if (pattern === "diamonds") {
    tctx.lineWidth = Math.max(1, sz * 0.07);
    tctx.beginPath();
    tctx.moveTo(sz / 2, 1);
    tctx.lineTo(sz - 1, sz / 2);
    tctx.lineTo(sz / 2, sz - 1);
    tctx.lineTo(1, sz / 2);
    tctx.closePath();
    tctx.stroke();
  }

  const pat = ctx.createPattern(tile, "repeat");
  if (pat) {
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, wPx, hPx);
  }
}

function drawCoverOrContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  fit: "cover" | "contain"
) {
  const iw = img.naturalWidth || img.width || 1;
  const ih = img.naturalHeight || img.height || 1;
  const ia = iw / ih;
  const ba = w / Math.max(1, h);
  let dw = w;
  let dh = h;
  let dx = x;
  let dy = y;
  if (fit === "cover") {
    if (ia > ba) {
      dh = h;
      dw = h * ia;
      dx = x + (w - dw) / 2;
    } else {
      dw = w;
      dh = w / ia;
      dy = y + (h - dh) / 2;
    }
  } else {
    if (ia > ba) {
      dw = w;
      dh = w / ia;
      dy = y + (h - dh) / 2;
    } else {
      dh = h;
      dw = h * ia;
      dx = x + (w - dw) / 2;
    }
  }
  ctx.drawImage(img, dx, dy, dw, dh);
}

/**
 * Renders a SideDesign onto a high-DPI HTML5 canvas.
 * If bleedMm > 0, the canvas is (W + 2*bleedMm) × (H + 2*bleedMm) and backgrounds plus
 * edge-touching fills extend seamlessly into the bleed area.
 */
export async function renderSideToCanvas(
  side: SideDesign,
  W: number,
  H: number,
  opts: { bleedMm?: number; dpi?: number; round?: boolean; images?: { logo?: string; qr?: string } } = {}
): Promise<HTMLCanvasElement> {
  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore font loading timeout
    }
  }

  const bleed = Math.max(0, opts.bleedMm ?? 0);
  const dpi = opts.dpi ?? 300;
  const k = dpi / 25.4; // px per mm
  const totalW = W + bleed * 2;
  const totalH = H + bleed * 2;

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(totalW * k));
  canvas.height = Math.max(1, Math.round(totalH * k));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (opts.round) {
    // Clip round stickers/labels to an exact transparent circle (including bleed ring if enabled)
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
  }

  // Base white paper inside trim/bleed shape
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const { els } = compileSide(side, W, H, previewFit);

  // Preload all image sources referenced by elements
  const imgCache = new Map<string, HTMLImageElement>();
  const srcs = new Set<string>();
  for (const el of els) {
    if (el.kind === "bg-image" && el.src) srcs.add(el.src);
    if (el.kind === "image") {
      const s = el.src ?? (el.which ? opts.images?.[el.which] : undefined);
      if (s) srcs.add(s);
    }
  }
  await Promise.all(
    Array.from(srcs).map(async (s) => {
      try {
        imgCache.set(s, await loadImageElement(s));
      } catch {
        // ignore broken image
      }
    })
  );

  // Draw background (covering full canvas including bleed)
  const bg = getSideBackground(side);
  if (bg.type === "solid") {
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (bg.type === "gradient") {
    const rad = ((bg.angle - 90) * Math.PI) / 180;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const halfDiag = Math.hypot(canvas.width, canvas.height) / 2;
    const dx = Math.cos(rad) * halfDiag;
    const dy = Math.sin(rad) * halfDiag;
    const grad = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
    grad.addColorStop(0, bg.from);
    grad.addColorStop(1, bg.to);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (bg.type === "pattern") {
    const patEl = els.find((e) => e.kind === "bg-pattern");
    if (patEl && patEl.kind === "bg-pattern") {
      drawPatternCanvas(ctx, canvas.width, canvas.height, patEl.bg, patEl.fg, patEl.pattern, patEl.patternOpacity, patEl.scale, k);
    }
  } else if (bg.type === "image" && bg.src) {
    const img = imgCache.get(bg.src);
    if (img) {
      ctx.save();
      ctx.globalAlpha = bg.opacity ?? 1;
      drawCoverOrContain(ctx, img, 0, 0, canvas.width, canvas.height, bg.fit);
      ctx.restore();
    }
    if (bg.tint && bg.tint !== "none") {
      ctx.save();
      ctx.globalAlpha = bg.tintOpacity ?? 0.35;
      ctx.fillStyle = bg.tint;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  }

  // Translate to trim area origin
  ctx.save();
  ctx.translate(bleed * k, bleed * k);

  for (let idx = 0; idx < els.length; idx++) {
    const el = els[idx];
    // Skip background elements (already rendered full-bleed above)
    if (el.kind === "bg-gradient" || el.kind === "bg-pattern" || el.kind === "bg-image") continue;
    if (idx === 0 && el.kind === "rect" && !el.layerId && el.x <= 0 && el.y <= 0 && el.w >= W - 0.01 && el.h >= H - 0.01) continue;

    ctx.save();
    if (el.opacity !== undefined && el.opacity < 1) {
      ctx.globalAlpha = el.opacity;
    }

    const applyRotation = (cxMm: number, cyMm: number) => {
      if (el.rotation) {
        ctx.translate(cxMm * k, cyMm * k);
        ctx.rotate((el.rotation * Math.PI) / 180);
        ctx.translate(-cxMm * k, -cyMm * k);
      }
    };

    if (el.kind === "rect") {
      // Extend edge-touching non-rotated rectangles into the bleed margin automatically.
      let x = el.x;
      let y = el.y;
      let w = el.w;
      let h = el.h;
      if (bleed > 0 && !el.rotation && !el.radius) {
        if (x <= 0.2) {
          w += bleed + x;
          x = -bleed;
        }
        if (y <= 0.2) {
          h += bleed + y;
          y = -bleed;
        }
        if (el.x + el.w >= W - 0.2) w += bleed;
        if (el.y + el.h >= H - 0.2) h += bleed;
      }
      applyRotation(el.x + el.w / 2, el.y + el.h / 2);
      ctx.fillStyle = rgbCss(el.fill);
      if (el.radius && el.radius > 0) {
        roundRectPath(ctx, x * k, y * k, w * k, h * k, el.radius * k);
        ctx.fill();
        if (el.stroke && el.lineWidth) {
          ctx.strokeStyle = rgbCss(el.stroke);
          ctx.lineWidth = el.lineWidth * k;
          ctx.stroke();
        }
      } else {
        ctx.fillRect(x * k, y * k, w * k, h * k);
        if (el.stroke && el.lineWidth) {
          ctx.strokeStyle = rgbCss(el.stroke);
          ctx.lineWidth = el.lineWidth * k;
          ctx.strokeRect(x * k, y * k, w * k, h * k);
        }
      }
    } else if (el.kind === "circle") {
      applyRotation(el.cx, el.cy);
      ctx.fillStyle = rgbCss(el.fill);
      ctx.beginPath();
      ctx.arc(el.cx * k, el.cy * k, el.r * k, 0, Math.PI * 2);
      ctx.fill();
    } else if (el.kind === "ellipse") {
      applyRotation(el.cx, el.cy);
      ctx.fillStyle = rgbCss(el.fill);
      ctx.beginPath();
      ctx.ellipse(el.cx * k, el.cy * k, Math.max(0.1, el.rx * k), Math.max(0.1, el.ry * k), 0, 0, Math.PI * 2);
      ctx.fill();
      if (el.stroke && el.lineWidth) {
        ctx.strokeStyle = rgbCss(el.stroke);
        ctx.lineWidth = el.lineWidth * k;
        ctx.stroke();
      }
    } else if (el.kind === "frame") {
      applyRotation(el.x + el.w / 2, el.y + el.h / 2);
      ctx.strokeStyle = rgbCss(el.stroke);
      ctx.lineWidth = el.lineWidth * k;
      if (el.radius && el.radius > 0) {
        roundRectPath(ctx, el.x * k, el.y * k, el.w * k, el.h * k, el.radius * k);
        ctx.stroke();
      } else {
        ctx.strokeRect(el.x * k, el.y * k, el.w * k, el.h * k);
      }
    } else if (el.kind === "triangle") {
      applyRotation(el.x + el.w / 2, el.y + el.h / 2);
      ctx.beginPath();
      ctx.moveTo((el.x + el.w * 0.5) * k, (el.y + el.h * 0.03) * k);
      ctx.lineTo((el.x + el.w * 0.97) * k, (el.y + el.h * 0.97) * k);
      ctx.lineTo((el.x + el.w * 0.03) * k, (el.y + el.h * 0.97) * k);
      ctx.closePath();
      ctx.fillStyle = rgbCss(el.fill);
      ctx.fill();
      if (el.stroke && el.lineWidth) {
        ctx.strokeStyle = rgbCss(el.stroke);
        ctx.lineWidth = el.lineWidth * k;
        ctx.stroke();
      }
    } else if (el.kind === "star") {
      applyRotation(el.x + el.w / 2, el.y + el.h / 2);
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 0.48 : 0.2;
        const a = ((i * 36 - 90) * Math.PI) / 180;
        const px = (el.x + el.w * (0.5 + r * Math.cos(a))) * k;
        const py = (el.y + el.h * (0.5 + r * Math.sin(a))) * k;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = rgbCss(el.fill);
      ctx.fill();
      if (el.stroke && el.lineWidth) {
        ctx.strokeStyle = rgbCss(el.stroke);
        ctx.lineWidth = el.lineWidth * k;
        ctx.stroke();
      }
    } else if (el.kind === "line") {
      applyRotation(el.x + el.w / 2, el.y + el.h / 2);
      ctx.strokeStyle = rgbCss(el.stroke);
      ctx.lineWidth = Math.max(1, el.lineWidth * k);
      if (el.dash === "dashed") ctx.setLineDash([el.lineWidth * 3 * k, el.lineWidth * 2 * k]);
      else if (el.dash === "dotted") ctx.setLineDash([el.lineWidth * k, el.lineWidth * 1.8 * k]);
      const midY = (el.y + el.h / 2) * k;
      ctx.beginPath();
      ctx.moveTo(el.x * k, midY);
      ctx.lineTo((el.x + el.w) * k, midY);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (el.kind === "icon") {
      const def = getCardIcon(el.iconId);
      applyRotation(el.x + el.w / 2, el.y + el.h / 2);
      ctx.translate(el.x * k, el.y * k);
      ctx.scale((el.w * k) / 24, (el.h * k) / 24);
      ctx.strokeStyle = rgbCss(el.color);
      ctx.lineWidth = el.strokeWidth ?? 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (const d of def.paths) {
        ctx.stroke(new Path2D(d));
      }
      if (def.circles) {
        for (const [cx, cy, r] of def.circles) {
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    } else if (el.kind === "image") {
      const src = el.src ?? (el.which ? opts.images?.[el.which] : undefined);
      const img = src ? imgCache.get(src) : undefined;
      if (img) {
        applyRotation(el.x + el.w / 2, el.y + el.h / 2);
        if (el.radius && el.radius > 0) {
          roundRectPath(ctx, el.x * k, el.y * k, el.w * k, el.h * k, el.radius * k);
          ctx.clip();
        }
        drawCoverOrContain(ctx, img, el.x * k, el.y * k, el.w * k, el.h * k, el.fit ?? "contain");
      }
    } else if (el.kind === "text") {
      const { opts: to, layout } = el;
      const bx = el.boxX ?? (to.align === "center" ? to.x - to.maxWidth / 2 : to.align === "right" ? to.x - to.maxWidth : to.x);
      const bw = el.boxW ?? to.maxWidth;
      const bh = Math.max(layout.heightMm, layout.fontSize * PT_TO_MM * (to.lineHeightFactor ?? 1.2));
      applyRotation(bx + bw / 2, to.y + bh / 2);

      const style = to.fontStyle ?? "normal";
      const weight = style === "bold" || style === "bolditalic" ? "700" : "400";
      const italic = style === "italic" || style === "bolditalic" ? "italic " : "";
      const stack = cssStack(to.fontFamily ?? "helvetica", el.text, el.fontId);
      const fontPx = layout.fontSize * PT_TO_MM * k;
      ctx.font = `${italic}${weight} ${fontPx}px ${stack}`;
      ctx.fillStyle = rgbCss(to.color ?? [24, 24, 27]);
      ctx.textBaseline = "top";
      const align = to.align ?? "left";
      ctx.textAlign = align;
      const trackPx = el.trackEm ? el.trackEm * fontPx : 0;

      layout.lines.forEach((line, i) => {
        const ly = (to.y + i * layout.lineHeightMm) * k;
        if (trackPx > 0) {
          ctx.textAlign = "left";
          let cursor = to.x * k;
          for (const ch of Array.from(line)) {
            ctx.fillText(ch, cursor, ly);
            cursor += ctx.measureText(ch).width + trackPx;
          }
          if (el.underline) {
            ctx.fillRect(to.x * k, ly + fontPx * 0.95, Math.max(0, cursor - to.x * k - trackPx), Math.max(1, fontPx * 0.07));
          }
        } else {
          ctx.fillText(line, to.x * k, ly);
          if (el.underline) {
            const w = ctx.measureText(line).width;
            const ux = align === "center" ? to.x * k - w / 2 : align === "right" ? to.x * k - w : to.x * k;
            ctx.fillRect(ux, ly + fontPx * 0.95, w, Math.max(1, fontPx * 0.07));
          }
        }
      });
    }

    ctx.restore();
  }

  ctx.restore();
  return canvas;
}

/** Sample the exact hex colour at normalized coordinates (0..1, 0..1) on a card side (Eyedropper fallback). */
export async function sampleColorFromSide(side: SideDesign, W: number, H: number, normX: number, normY: number): Promise<string> {
  const canvas = await renderSideToCanvas(side, W, H, { dpi: 96 });
  const ctx = canvas.getContext("2d");
  if (!ctx) return "#18181b";
  const px = Math.max(0, Math.min(canvas.width - 1, Math.round(normX * canvas.width)));
  const py = Math.max(0, Math.min(canvas.height - 1, Math.round(normY * canvas.height)));
  const data = ctx.getImageData(px, py, 1, 1).data;
  return `#${[data[0], data[1], data[2]].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/* ------------------------------------------------------------------------- */
/* Download helper                                                            */
/* ------------------------------------------------------------------------- */

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/* ------------------------------------------------------------------------- */
/* PNG Export (300 DPI print-ready)                                           */
/* ------------------------------------------------------------------------- */

export async function exportSidePng(
  side: SideDesign,
  W: number,
  H: number,
  filename: string,
  opts: { bleedMm?: number; dpi?: number; round?: boolean } = {}
): Promise<void> {
  const canvas = await renderSideToCanvas(side, W, H, {
    bleedMm: opts.bleedMm ?? 0,
    dpi: opts.dpi ?? 300,
    round: opts.round,
  });
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Failed to encode PNG");
  triggerBlobDownload(blob, filename);
}

/* ------------------------------------------------------------------------- */
/* SVG Export (standalone vector file)                                        */
/* ------------------------------------------------------------------------- */

function escXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildSideSvgString(
  side: SideDesign,
  W: number,
  H: number,
  opts: { bleedMm?: number; round?: boolean } = {}
): string {
  const bleed = Math.max(0, opts.bleedMm ?? 0);
  const totalW = W + 2 * bleed;
  const totalH = H + 2 * bleed;
  const { els } = compileSide(side, W, H, previewFit);

  const defs: string[] = [];
  const body: string[] = [];
  if (opts.round) {
    defs.push(
      `<clipPath id="round-label-clip"><circle cx="${(totalW / 2).toFixed(3)}" cy="${(totalH / 2).toFixed(3)}" r="${(Math.min(totalW, totalH) / 2).toFixed(3)}" /></clipPath>`
    );
  }
  const usedCustomFonts = new Set<string>();

  for (const el of els) {
    if (el.kind === "text" && el.fontId && !isBuiltinPdfFont(el.fontId)) {
      usedCustomFonts.add(el.fontId);
    }
  }
  if (usedCustomFonts.size > 0) {
    defs.push(`<style>@import url("${escXml(getGoogleFontsUrl())}");</style>`);
  }

  // Background
  const bg = getSideBackground(side);
  if (bg.type === "solid") {
    body.push(`<rect x="0" y="0" width="${totalW}" height="${totalH}" fill="${escXml(bg.color)}" />`);
  } else if (bg.type === "gradient") {
    const rad = ((bg.angle - 90) * Math.PI) / 180;
    const x1 = (50 - Math.cos(rad) * 50).toFixed(1);
    const y1 = (50 - Math.sin(rad) * 50).toFixed(1);
    const x2 = (50 + Math.cos(rad) * 50).toFixed(1);
    const y2 = (50 + Math.sin(rad) * 50).toFixed(1);
    defs.push(
      `<linearGradient id="card-bg-grad" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%"><stop offset="0%" stop-color="${escXml(bg.from)}" /><stop offset="100%" stop-color="${escXml(bg.to)}" /></linearGradient>`
    );
    body.push(`<rect x="0" y="0" width="${totalW}" height="${totalH}" fill="url(#card-bg-grad)" />`);
  } else if (bg.type === "pattern") {
    const sz = +(4 * bg.scale).toFixed(2);
    let inner = "";
    if (bg.pattern === "dots") inner = `<circle cx="${sz / 2}" cy="${sz / 2}" r="${(sz * 0.14).toFixed(2)}" fill="${escXml(bg.fg)}" fill-opacity="${bg.opacity}" />`;
    else if (bg.pattern === "grid") inner = `<path d="M ${sz} 0 L 0 0 0 ${sz}" fill="none" stroke="${escXml(bg.fg)}" stroke-opacity="${bg.opacity}" stroke-width="${(sz * 0.06).toFixed(2)}" />`;
    else if (bg.pattern === "diagonal") inner = `<path d="M 0 ${sz} L ${sz} 0 M -${sz * 0.25} ${sz * 0.25} L ${sz * 0.25} -${sz * 0.25} M ${sz * 0.75} ${sz * 1.25} L ${sz * 1.25} ${sz * 0.75}" fill="none" stroke="${escXml(bg.fg)}" stroke-opacity="${bg.opacity}" stroke-width="${(sz * 0.09).toFixed(2)}" />`;
    else if (bg.pattern === "crosshatch") inner = `<path d="M 0 0 L ${sz} ${sz} M ${sz} 0 L 0 ${sz}" fill="none" stroke="${escXml(bg.fg)}" stroke-opacity="${bg.opacity}" stroke-width="${(sz * 0.06).toFixed(2)}" />`;
    else if (bg.pattern === "waves") inner = `<path d="M 0 ${sz * 0.5} Q ${sz * 0.25} ${sz * 0.15} ${sz * 0.5} ${sz * 0.5} T ${sz} ${sz * 0.5}" fill="none" stroke="${escXml(bg.fg)}" stroke-opacity="${bg.opacity}" stroke-width="${(sz * 0.08).toFixed(2)}" />`;
    else if (bg.pattern === "diamonds") inner = `<path d="M ${sz / 2} 0.3 L ${sz - 0.3} ${sz / 2} L ${sz / 2} ${sz - 0.3} L 0.3 ${sz / 2} Z" fill="none" stroke="${escXml(bg.fg)}" stroke-opacity="${bg.opacity}" stroke-width="${(sz * 0.07).toFixed(2)}" />`;
    defs.push(`<pattern id="card-bg-pat" width="${sz}" height="${sz}" patternUnits="userSpaceOnUse">${inner}</pattern>`);
    body.push(`<rect x="0" y="0" width="${totalW}" height="${totalH}" fill="${escXml(bg.bg)}" />`);
    body.push(`<rect x="0" y="0" width="${totalW}" height="${totalH}" fill="url(#card-bg-pat)" />`);
  } else if (bg.type === "image" && bg.src) {
    const par = bg.fit === "cover" ? "xMidYMid slice" : "xMidYMid meet";
    body.push(`<rect x="0" y="0" width="${totalW}" height="${totalH}" fill="#ffffff" />`);
    body.push(`<image href="${escXml(bg.src)}" x="0" y="0" width="${totalW}" height="${totalH}" preserveAspectRatio="${par}" opacity="${bg.opacity ?? 1}" />`);
    if (bg.tint && bg.tint !== "none") {
      body.push(`<rect x="0" y="0" width="${totalW}" height="${totalH}" fill="${escXml(bg.tint)}" opacity="${bg.tintOpacity ?? 0.35}" />`);
    }
  }

  const layersXml: string[] = [];
  els.forEach((el, idx) => {
    if (el.kind === "bg-gradient" || el.kind === "bg-pattern" || el.kind === "bg-image") return;
    if (idx === 0 && el.kind === "rect" && !el.layerId && el.x <= 0 && el.y <= 0 && el.w >= W - 0.01 && el.h >= H - 0.01) return;

    const opAttr = el.opacity !== undefined && el.opacity < 1 ? ` opacity="${el.opacity}"` : "";
    const rotAttr = (cx: number, cy: number) => (el.rotation ? ` transform="rotate(${el.rotation} ${cx.toFixed(2)} ${cy.toFixed(2)})"` : "");

    if (el.kind === "rect") {
      let x = el.x;
      let y = el.y;
      let w = el.w;
      let h = el.h;
      if (bleed > 0 && !el.rotation && !el.radius) {
        if (x <= 0.2) { w += bleed + x; x = -bleed; }
        if (y <= 0.2) { h += bleed + y; y = -bleed; }
        if (el.x + el.w >= W - 0.2) w += bleed;
        if (el.y + el.h >= H - 0.2) h += bleed;
      }
      const rx = el.radius ? ` rx="${el.radius}" ry="${el.radius}"` : "";
      const st = el.stroke && el.lineWidth ? ` stroke="${rgbCss(el.stroke)}" stroke-width="${el.lineWidth}"` : "";
      layersXml.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${rgbCss(el.fill)}"${rx}${st}${opAttr}${rotAttr(el.x + el.w / 2, el.y + el.h / 2)} />`);
    } else if (el.kind === "circle") {
      layersXml.push(`<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${rgbCss(el.fill)}"${opAttr}${rotAttr(el.cx, el.cy)} />`);
    } else if (el.kind === "ellipse") {
      const st = el.stroke && el.lineWidth ? ` stroke="${rgbCss(el.stroke)}" stroke-width="${el.lineWidth}"` : "";
      layersXml.push(`<ellipse cx="${el.cx}" cy="${el.cy}" rx="${el.rx}" ry="${el.ry}" fill="${rgbCss(el.fill)}"${st}${opAttr}${rotAttr(el.cx, el.cy)} />`);
    } else if (el.kind === "frame") {
      const rx = el.radius ? ` rx="${el.radius}" ry="${el.radius}"` : "";
      layersXml.push(`<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" fill="none" stroke="${rgbCss(el.stroke)}" stroke-width="${el.lineWidth}"${rx}${opAttr}${rotAttr(el.x + el.w / 2, el.y + el.h / 2)} />`);
    } else if (el.kind === "triangle") {
      const pts = `${(el.x + el.w * 0.5).toFixed(2)},${(el.y + el.h * 0.03).toFixed(2)} ${(el.x + el.w * 0.97).toFixed(2)},${(el.y + el.h * 0.97).toFixed(2)} ${(el.x + el.w * 0.03).toFixed(2)},${(el.y + el.h * 0.97).toFixed(2)}`;
      const st = el.stroke && el.lineWidth ? ` stroke="${rgbCss(el.stroke)}" stroke-width="${el.lineWidth}"` : "";
      layersXml.push(`<polygon points="${pts}" fill="${rgbCss(el.fill)}"${st}${opAttr}${rotAttr(el.x + el.w / 2, el.y + el.h / 2)} />`);
    } else if (el.kind === "star") {
      const pts: string[] = [];
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 0.48 : 0.2;
        const a = ((i * 36 - 90) * Math.PI) / 180;
        pts.push(`${(el.x + el.w * (0.5 + r * Math.cos(a))).toFixed(2)},${(el.y + el.h * (0.5 + r * Math.sin(a))).toFixed(2)}`);
      }
      const st = el.stroke && el.lineWidth ? ` stroke="${rgbCss(el.stroke)}" stroke-width="${el.lineWidth}"` : "";
      layersXml.push(`<polygon points="${pts.join(" ")}" fill="${rgbCss(el.fill)}"${st}${opAttr}${rotAttr(el.x + el.w / 2, el.y + el.h / 2)} />`);
    } else if (el.kind === "line") {
      const midY = el.y + el.h / 2;
      const dash = el.dash === "dashed" ? ` stroke-dasharray="${(el.lineWidth * 3).toFixed(2)} ${(el.lineWidth * 2).toFixed(2)}"` : el.dash === "dotted" ? ` stroke-dasharray="${el.lineWidth.toFixed(2)} ${(el.lineWidth * 1.8).toFixed(2)}"` : "";
      layersXml.push(`<line x1="${el.x}" y1="${midY}" x2="${el.x + el.w}" y2="${midY}" stroke="${rgbCss(el.stroke)}" stroke-width="${el.lineWidth}"${dash}${opAttr}${rotAttr(el.x + el.w / 2, midY)} />`);
    } else if (el.kind === "icon") {
      const def = getCardIcon(el.iconId);
      const sx = el.w / 24;
      const sy = el.h / 24;
      const shapes = [
        ...def.paths.map((d) => `<path d="${escXml(d)}" />`),
        ...(def.circles ?? []).map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}" />`),
      ].join("");
      layersXml.push(
        `<g${opAttr}${rotAttr(el.x + el.w / 2, el.y + el.h / 2)}><g transform="translate(${el.x} ${el.y}) scale(${sx.toFixed(4)} ${sy.toFixed(4)})" fill="none" stroke="${rgbCss(el.color)}" stroke-width="${el.strokeWidth ?? 2}" stroke-linecap="round" stroke-linejoin="round">${shapes}</g></g>`
      );
    } else if (el.kind === "image" && el.src) {
      let clip = "";
      if (el.radius && el.radius > 0) {
        const cid = `clip-img-${idx}`;
        defs.push(`<clipPath id="${cid}"><rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" rx="${el.radius}" ry="${el.radius}" /></clipPath>`);
        clip = ` clip-path="url(#${cid})"`;
      }
      const par = el.fit === "cover" ? "xMidYMid slice" : "xMidYMid meet";
      layersXml.push(`<image href="${escXml(el.src)}" x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" preserveAspectRatio="${par}"${clip}${opAttr}${rotAttr(el.x + el.w / 2, el.y + el.h / 2)} />`);
    } else if (el.kind === "text") {
      const { opts: to, layout } = el;
      const font = getCardFont(el.fontId, to.fontFamily);
      const weight = to.fontStyle === "bold" || to.fontStyle === "bolditalic" ? "700" : "400";
      const fStyle = to.fontStyle === "italic" || to.fontStyle === "bolditalic" ? "italic" : "normal";
      const anchor = to.align === "center" ? "middle" : to.align === "right" ? "end" : "start";
      const fontSizeMm = layout.fontSize * PT_TO_MM;
      const trackAttr = el.trackEm ? ` letter-spacing="${(el.trackEm * fontSizeMm).toFixed(3)}"` : "";
      const decAttr = el.underline ? ` text-decoration="underline"` : "";
      const bx = el.boxX ?? (to.align === "center" ? to.x - to.maxWidth / 2 : to.align === "right" ? to.x - to.maxWidth : to.x);
      const bw = el.boxW ?? to.maxWidth;
      const bh = Math.max(layout.heightMm, fontSizeMm * (to.lineHeightFactor ?? 1.2));
      const lines = layout.lines
        .map((line, i) => {
          const yPos = to.y + i * layout.lineHeightMm + fontSizeMm * 0.85;
          return `<text x="${to.x}" y="${yPos.toFixed(3)}" font-family="${escXml(font.cssFamily)}" font-size="${fontSizeMm.toFixed(3)}" font-weight="${weight}" font-style="${fStyle}" fill="${rgbCss(to.color ?? [24, 24, 27])}" text-anchor="${anchor}"${trackAttr}${decAttr}>${escXml(line)}</text>`;
        })
        .join("");
      layersXml.push(`<g${opAttr}${rotAttr(bx + bw / 2, to.y + bh / 2)}>${lines}</g>`);
    }
  });

  const translateOpen = bleed > 0 ? `<g transform="translate(${bleed} ${bleed})">` : "";
  const translateClose = bleed > 0 ? "</g>" : "";
  const roundOpen = opts.round ? `<g clip-path="url(#round-label-clip)">` : "";
  const roundClose = opts.round ? "</g>" : "";

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}mm" height="${totalH}mm" viewBox="0 0 ${totalW} ${totalH}">`,
    defs.length ? `<defs>${defs.join("")}</defs>` : "",
    roundOpen,
    ...body,
    translateOpen,
    ...layersXml,
    translateClose,
    roundClose,
    `</svg>`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function exportSideSvg(side: SideDesign, W: number, H: number, filename: string, opts: { bleedMm?: number; round?: boolean } = {}) {
  const svg = buildSideSvgString(side, W, H, opts);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  triggerBlobDownload(blob, filename);
}

/* ------------------------------------------------------------------------- */
/* Print-ready PDF Export (sheet or single card, crop marks + bleed)          */
/* ------------------------------------------------------------------------- */

/** True when a side uses advanced visuals that benefit from 360 DPI composited rendering in PDF. */
function sideNeedsCompositePdf(side: SideDesign, bleedMm: number): boolean {
  if (bleedMm > 0) return true;
  const bg = getSideBackground(side);
  if (bg.type !== "solid") return true;
  for (const l of side.layers) {
    if (l.hidden) continue;
    if ((l.rotation && Math.abs(l.rotation) > 0.01) || (l.opacity !== undefined && l.opacity < 0.999)) return true;
    if (l.kind === "icon" || l.kind === "triangle" || l.kind === "star" || l.kind === "rounded-rect") return true;
    if (l.kind === "line" && l.dash && l.dash !== "solid") return true;
    if (l.kind === "image" && ((l.radius ?? 0) > 0 || l.fit === "cover")) return true;
    if (l.kind === "text" && (!isBuiltinPdfFont(l.fontId) || l.underline)) return true;
    if ((l.kind === "rect" || l.kind === "ellipse") && l.strokeColor) return true;
  }
  return false;
}

export async function exportAdvancedPdf(params: {
  mode: "sheet" | "single";
  design: CardDesign;
  sheet: SheetPreset;
  includeBack: boolean;
  showCropMarks: boolean;
  cutGuideStyle?: CutGuideStyle;
  includeBleed: boolean;
  offsetX: number;
  offsetY: number;
  filename: string;
}): Promise<{ effectiveBleedMm: number }> {
  const { mode, design, sheet, includeBack, showCropMarks, cutGuideStyle, includeBleed, offsetX, offsetY, filename } = params;
  const resolvedStyle: CutGuideStyle = cutGuideStyle ?? (showCropMarks ? "dashed-grid" : "none");
  const { jsPDF } = await import("jspdf");

  if (mode === "single") {
    const bleed = includeBleed ? 3 : 0;
    const hasMarks = resolvedStyle !== "none";
    const margin = hasMarks ? 8 : bleed;
    const pageW = sheet.cardW + 2 * margin;
    const pageH = sheet.cardH + 2 * margin;
    const doc = new jsPDF({ orientation: pageW >= pageH ? "landscape" : "portrait", unit: "mm", format: [pageW, pageH] });

    const drawSinglePage = async (side: SideDesign, alias: string) => {
      const canvas = await renderSideToCanvas(side, sheet.cardW, sheet.cardH, { bleedMm: bleed, dpi: 360 });
      const dataUrl = canvas.toDataURL("image/png");
      doc.addImage(dataUrl, "PNG", margin - bleed, margin - bleed, sheet.cardW + 2 * bleed, sheet.cardH + 2 * bleed, alias);
      if (hasMarks) {
        if (resolvedStyle === "card-outline" || resolvedStyle === "dashed-grid") {
          doc.setDrawColor(140, 140, 150);
          doc.setLineWidth(0.2);
          doc.setLineDashPattern([1.8, 1.4], 0);
          doc.rect(margin, margin, sheet.cardW, sheet.cardH);
          doc.setLineDashPattern([], 0);
        }
        const off = Math.max(1.2, bleed + 0.8);
        const len = 3.5;
        const x0 = margin;
        const y0 = margin;
        const x1 = margin + sheet.cardW;
        const y1 = margin + sheet.cardH;
        doc.setDrawColor(100, 100, 110);
        doc.setLineWidth(0.2);
        // Top-left
        doc.line(x0 - off - len, y0, x0 - off, y0);
        doc.line(x0, y0 - off - len, x0, y0 - off);
        // Top-right
        doc.line(x1 + off, y0, x1 + off + len, y0);
        doc.line(x1, y0 - off - len, x1, y0 - off);
        // Bottom-left
        doc.line(x0 - off - len, y1, x0 - off, y1);
        doc.line(x0, y1 + off, x0, y1 + off + len);
        // Bottom-right
        doc.line(x1 + off, y1, x1 + off + len, y1);
        doc.line(x1, y1 + off, x1, y1 + off + len);
      }
    };

    await drawSinglePage(design.front, "card-front");
    if (includeBack) {
      doc.addPage([pageW, pageH], pageW >= pageH ? "landscape" : "portrait");
      await drawSinglePage(design.back, "card-back");
    }
    doc.save(filename);
    return { effectiveBleedMm: bleed };
  }

  // Multi-card sheet PDF
  const paper = PAPER_SIZES[sheet.paper];
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [paper.widthMm, paper.heightMm] });
  const pdfFit = pdfFitFor(doc);
  const geo = sheetGeometry(sheet, paper.widthMm, paper.heightMm, offsetX, offsetY);
  const geoBack = sheetGeometry(sheet, paper.widthMm, paper.heightMm, -offsetX, offsetY);

  // Clamp bleed safely so neighbouring cards never overlap across small grid gaps
  const maxBleedX = sheet.cols > 1 ? sheet.gapX / 2 : 3;
  const maxBleedY = sheet.rows > 1 ? sheet.gapY / 2 : 3;
  const effectiveBleedMm = includeBleed ? Math.max(0, Math.min(3, maxBleedX, maxBleedY)) : 0;

  const drawSideOnSheet = async (side: SideDesign, cells: Array<[number, number]>, g: typeof geo, alias: string) => {
    if (sideNeedsCompositePdf(side, effectiveBleedMm)) {
      const canvas = await renderSideToCanvas(side, sheet.cardW, sheet.cardH, { bleedMm: effectiveBleedMm, dpi: 360 });
      const dataUrl = canvas.toDataURL("image/png");
      const drawW = sheet.cardW + 2 * effectiveBleedMm;
      const drawH = sheet.cardH + 2 * effectiveBleedMm;
      for (const [x, y] of cells) {
        doc.addImage(dataUrl, "PNG", x - effectiveBleedMm, y - effectiveBleedMm, drawW, drawH, alias);
      }
    } else {
      const els = compileSide(side, sheet.cardW, sheet.cardH, pdfFit).els;
      for (const [x, y] of cells) {
        doc.setFillColor(255, 255, 255);
        doc.rect(x, y, sheet.cardW, sheet.cardH, "F");
        drawCardElsPdf(doc, els, x, y, {});
      }
    }
    drawSheetCutGuides(doc, {
      startX: g.startX,
      startY: g.startY,
      sheet,
      paperW: paper.widthMm,
      paperH: paper.heightMm,
      bleedMm: effectiveBleedMm,
      style: resolvedStyle,
    });
  };

  await drawSideOnSheet(design.front, geo.cells, geo, "sheet-front");
  if (includeBack) {
    doc.addPage([paper.widthMm, paper.heightMm], "portrait");
    await drawSideOnSheet(design.back, geoBack.cells, geoBack, "sheet-back");
  }

  doc.save(filename);
  return { effectiveBleedMm };
}

/* ------------------------------------------------------------------------- */
/* Auto-save, Share link, JSON export/import, Saved Brand Colours & Snapshots */
/* ------------------------------------------------------------------------- */

export interface SavedSimpleState {
  fullName: string;
  role: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  accentHex: string;
  styleId: CardStyleId;
  fontPairId: FontPairId;
  backStyle: BackStyleId;
  tagline: string;
  includeQr: boolean;
  includeBack: boolean;
  showCropMarks: boolean;
  cutGuideStyle?: CutGuideStyle;
  singleCut?: boolean;
  includeBleed: boolean;
  sheetId: SheetPresetId | "custom";
  customSheet: {
    paper: "a4" | "letter" | "a3";
    cols: number;
    rows: number;
    cardW: number;
    cardH: number;
    gapX: number;
    gapY: number;
  };
  offsetX: number;
  offsetY: number;
}

export interface PersistedCardDesign {
  v: 1;
  savedAt: number;
  simple: SavedSimpleState;
  hasCustomDesign: boolean;
  templateId: GalleryTemplateId;
  design: CardDesign;
}

export interface NamedDesignSnapshot {
  id: string;
  name: string;
  savedAt: number;
  payload: PersistedCardDesign;
}

const AUTOSAVE_PREFIX = "printsheet_card_autosave_v1_";
const BRAND_COLORS_KEY = "printsheet_card_brand_colors_v1";
const SNAPSHOTS_KEY = "printsheet_card_snapshots_v1";
const TOUR_SEEN_KEY = "printsheet_card_tour_seen_v1";

function stripHeavyOriginalSrc(design: CardDesign): CardDesign {
  const cleanSide = (s: SideDesign): SideDesign => ({
    ...s,
    layers: s.layers.map((l) => (l.kind === "image" ? { ...l, originalSrc: undefined } : l)),
  });
  return { front: cleanSide(design.front), back: cleanSide(design.back) };
}

export function saveAutoDesign(pageId: string, payload: PersistedCardDesign): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(`${AUTOSAVE_PREFIX}${pageId}`, JSON.stringify(payload));
    return true;
  } catch {
    // Retry without redundant originalSrc backups if quota was exceeded by large images
    try {
      const lighter: PersistedCardDesign = { ...payload, design: stripHeavyOriginalSrc(payload.design) };
      window.localStorage.setItem(`${AUTOSAVE_PREFIX}${pageId}`, JSON.stringify(lighter));
      return true;
    } catch {
      return false;
    }
  }
}

export function loadAutoDesign(pageId: string): PersistedCardDesign | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`${AUTOSAVE_PREFIX}${pageId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedCardDesign;
    if (parsed && parsed.v === 1 && parsed.simple && parsed.design?.front && parsed.design?.back) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearAutoDesign(pageId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(`${AUTOSAVE_PREFIX}${pageId}`);
  } catch {
    // ignore
  }
}

export function loadBrandColors(seed?: string): string[] {
  const defaults = seed ? [seed, "#111111", "#f59e0b", "#1e3a8a"] : ["#3f6212", "#111111", "#f59e0b", "#1e3a8a"];
  if (typeof window === "undefined") return defaults;
  try {
    const raw = window.localStorage.getItem(BRAND_COLORS_KEY);
    if (!raw) return defaults;
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr.filter((c): c is string => typeof c === "string" && /^#[0-9a-f]{6}$/i.test(c));
    return defaults;
  } catch {
    return defaults;
  }
}

export function saveBrandColors(colors: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(BRAND_COLORS_KEY, JSON.stringify(colors.slice(0, 16)));
  } catch {
    // ignore
  }
}

export function loadSavedSnapshots(): NamedDesignSnapshot[] {
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

export function saveNamedSnapshot(name: string, payload: PersistedCardDesign): NamedDesignSnapshot[] {
  const existing = loadSavedSnapshots();
  const snap: NamedDesignSnapshot = {
    id: `snap-${Date.now().toString(36)}`,
    name: name.trim() || `Card design ${existing.length + 1}`,
    savedAt: Date.now(),
    payload: { ...payload, design: stripHeavyOriginalSrc(payload.design) },
  };
  const next = [snap, ...existing].slice(0, 10);
  try {
    window.localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(next));
  } catch {
    // keep smaller list if tight on quota
    try {
      window.localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(next.slice(0, 3)));
    } catch {
      // ignore
    }
  }
  return next;
}

export function deleteNamedSnapshot(id: string): NamedDesignSnapshot[] {
  const next = loadSavedSnapshots().filter((s) => s.id !== id);
  try {
    window.localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}

export function hasSeenTour(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(TOUR_SEEN_KEY) === "1";
  } catch {
    return true;
  }
}

export function markTourSeen(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOUR_SEEN_KEY, "1");
  } catch {
    // ignore
  }
}

/* ---- URL hash sharing & JSON file export ---- */

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

export function buildShareLink(payload: PersistedCardDesign): { url: string; strippedImages: boolean } {
  const baseUrl = typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}` : "";
  const compact = (stripImg: boolean): PersistedCardDesign => {
    const cleanSide = (s: SideDesign): SideDesign => ({
      ...s,
      background: stripImg && s.background?.type === "image" ? { type: "solid", color: s.bg || "#18181b" } : s.background,
      layers: s.layers
        .filter((l) => !(stripImg && l.kind === "image" && !l.qrText))
        .map((l) => (l.kind === "image" ? { ...l, src: l.qrText ? "" : l.src, qrFor: undefined, originalSrc: undefined } : l)),
    });
    return { ...payload, design: { front: cleanSide(payload.design.front), back: cleanSide(payload.design.back) } };
  };

  const fullEncoded = utf8ToBase64Url(JSON.stringify(compact(false)));
  if (fullEncoded.length <= 12000) {
    return { url: `${baseUrl}#card=${fullEncoded}`, strippedImages: false };
  }
  const lightEncoded = utf8ToBase64Url(JSON.stringify(compact(true)));
  return { url: `${baseUrl}#card=${lightEncoded}`, strippedImages: true };
}

export function decodeShareHash(hash: string): PersistedCardDesign | null {
  if (!hash || !hash.includes("card=")) return null;
  try {
    const match = hash.match(/card=([A-Za-z0-9_-]+)/);
    if (!match) return null;
    const parsed = JSON.parse(base64UrlToUtf8(match[1])) as PersistedCardDesign;
    if (parsed && parsed.v === 1 && parsed.simple && parsed.design?.front && parsed.design?.back) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function downloadDesignJson(payload: PersistedCardDesign, filename = "business-card-design.json") {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  triggerBlobDownload(blob, filename);
}

export function parseDesignJson(text: string): PersistedCardDesign | null {
  try {
    const parsed = JSON.parse(text) as PersistedCardDesign;
    if (parsed && parsed.v === 1 && parsed.simple && parsed.design?.front && parsed.design?.back) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
