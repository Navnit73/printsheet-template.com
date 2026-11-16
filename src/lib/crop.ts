/**
 * Shared crop model used by the on-screen CropEditor AND the PDF/canvas export,
 * so what people position on screen is exactly what prints.
 *
 * zoom = 1 means the largest rectangle of the target aspect that fits in the
 * image ("cover"). centerX/centerY are the crop centre in normalised image
 * coordinates (0..1).
 */
export interface CropState {
  zoom: number;
  centerX: number;
  centerY: number;
}

export const DEFAULT_CROP: CropState = { zoom: 1, centerX: 0.5, centerY: 0.5 };
export const MIN_ZOOM = 1;
export const MAX_ZOOM = 5;

export interface SourceRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

/** Clamp a crop so the crop rectangle always stays inside the image. */
export function clampCrop(
  crop: CropState,
  imgW: number,
  imgH: number,
  aspect: number
): CropState {
  const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, crop.zoom || 1));
  const { sw, sh } = cropSize(imgW, imgH, aspect, zoom);
  const halfW = sw / 2 / imgW;
  const halfH = sh / 2 / imgH;
  const cx = Math.min(1 - halfW, Math.max(halfW, crop.centerX));
  const cy = Math.min(1 - halfH, Math.max(halfH, crop.centerY));
  return { zoom, centerX: Number.isFinite(cx) ? cx : 0.5, centerY: Number.isFinite(cy) ? cy : 0.5 };
}

function cropSize(imgW: number, imgH: number, aspect: number, zoom: number) {
  const imgAspect = imgW / Math.max(1, imgH);
  let baseW: number;
  let baseH: number;
  if (imgAspect > aspect) {
    baseH = imgH;
    baseW = imgH * aspect;
  } else {
    baseW = imgW;
    baseH = imgW / aspect;
  }
  return { sw: baseW / zoom, sh: baseH / zoom };
}

/** Source rectangle (in image pixels) for drawImage(img, sx, sy, sw, sh, …). */
export function getSourceRect(
  imgW: number,
  imgH: number,
  aspect: number,
  crop: CropState = DEFAULT_CROP
): SourceRect {
  const c = clampCrop(crop, imgW, imgH, aspect);
  const { sw, sh } = cropSize(imgW, imgH, aspect, c.zoom);
  return {
    sx: c.centerX * imgW - sw / 2,
    sy: c.centerY * imgH - sh / 2,
    sw,
    sh,
  };
}

/**
 * Renders the cropped region to a data URL of exactly outW × outH pixels.
 * Use for PDF tiles: doc.addImage(dataUrl, "JPEG", x, y, wMm, hMm).
 */
export function renderCropToDataUrl(
  img: HTMLImageElement,
  outW: number,
  outH: number,
  crop: CropState = DEFAULT_CROP,
  mime: "image/jpeg" | "image/png" = "image/jpeg",
  quality = 0.94
): string {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(outW));
  canvas.height = Math.max(1, Math.round(outH));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingQuality = "high";
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const r = getSourceRect(iw, ih, canvas.width / canvas.height, crop);
  ctx.drawImage(img, r.sx, r.sy, r.sw, r.sh, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL(mime, quality);
}
