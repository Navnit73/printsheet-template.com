export type PaperSizeId = "a4" | "a3" | "letter" | "4x6";

export interface PaperDimensions {
  id: PaperSizeId;
  label: string;
  widthMm: number;
  heightMm: number;
}

export const PAPER_SIZES: Record<PaperSizeId, PaperDimensions> = {
  a4: { id: "a4", label: "A4 (210 × 297 mm)", widthMm: 210, heightMm: 297 },
  a3: { id: "a3", label: "A3 (297 × 420 mm)", widthMm: 297, heightMm: 420 },
  letter: {
    id: "letter",
    label: "US Letter (8.5 × 11 in)",
    widthMm: 215.9,
    heightMm: 279.4,
  },
  "4x6": {
    id: "4x6",
    label: "4×6 in / 4R (101.6 × 152.4 mm)",
    widthMm: 101.6,
    heightMm: 152.4,
  },
};

export function getOrientedPaper(
  paperId: PaperSizeId,
  orientation: "portrait" | "landscape"
): { widthMm: number; heightMm: number } {
  const base = PAPER_SIZES[paperId];
  if (orientation === "landscape") {
    return {
      widthMm: Math.max(base.widthMm, base.heightMm),
      heightMm: Math.min(base.widthMm, base.heightMm),
    };
  }
  return {
    widthMm: Math.min(base.widthMm, base.heightMm),
    heightMm: Math.max(base.widthMm, base.heightMm),
  };
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export async function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

/**
 * Renders an image into a target pixel box on an offscreen canvas with either
 * "cover" (crop to fill) or "contain" (fit inside with optional background)
 * so jsPDF receives a clean JPEG/PNG matching the exact slot aspect ratio.
 */
export async function renderImageToBoxDataUrl(
  src: string,
  targetAspect: number,
  fit: "cover" | "contain",
  bgColor = "#ffffff",
  targetLongSidePx = 1200
): Promise<{ dataUrl: string; format: "JPEG" | "PNG" }> {
  const img = await loadImageElement(src);
  const w =
    targetAspect >= 1
      ? targetLongSidePx
      : Math.max(200, Math.round(targetLongSidePx * targetAspect));
  const h =
    targetAspect >= 1
      ? Math.max(200, Math.round(targetLongSidePx / targetAspect))
      : targetLongSidePx;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);

  const imgAspect = img.naturalWidth / Math.max(1, img.naturalHeight);
  let drawW = w;
  let drawH = h;
  let dx = 0;
  let dy = 0;

  if (fit === "cover") {
    if (imgAspect > targetAspect) {
      drawH = h;
      drawW = h * imgAspect;
      dx = (w - drawW) / 2;
    } else {
      drawW = w;
      drawH = w / imgAspect;
      dy = (h - drawH) / 2;
    }
  } else {
    if (imgAspect > targetAspect) {
      drawW = w;
      drawH = w / imgAspect;
      dy = (h - drawH) / 2;
    } else {
      drawH = h;
      drawW = h * imgAspect;
      dx = (w - drawW) / 2;
    }
  }

  ctx.drawImage(img, dx, dy, drawW, drawH);
  return {
    dataUrl: canvas.toDataURL("image/jpeg", 0.92),
    format: "JPEG",
  };
}

/**
 * Creates crisp synthetic sample images via canvas for instant zero-upload testing.
 */
export function createSamplePhotoDataUrl(
  index: number,
  label: string,
  accentHex = "#4d7c0f"
): string {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 675;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const palettes = [
    ["#f4f4f5", "#18181b", accentHex],
    ["#ecfccb", "#18181b", "#3f6212"],
    ["#e4e4e7", "#09090b", "#4d7c0f"],
    ["#fafafa", "#27272a", "#65a30d"],
  ];
  const [bg, ink, hi] = palettes[index % palettes.length];

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Architectural print-registration motif
  ctx.strokeStyle = hi;
  ctx.lineWidth = 6;
  ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

  ctx.fillStyle = hi;
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2 - 40, 110, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 72px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`0${index + 1}`, canvas.width / 2, canvas.height / 2 - 38);

  ctx.fillStyle = ink;
  ctx.font = "600 36px sans-serif";
  ctx.fillText(label, canvas.width / 2, canvas.height / 2 + 125);

  ctx.fillStyle = "#52525b";
  ctx.font = "24px monospace";
  ctx.fillText("PRINT SHEET MAKER SAMPLE", canvas.width / 2, canvas.height / 2 + 175);

  return canvas.toDataURL("image/png");
}

export function drawCropMarksPdf(
  doc: import("jspdf").jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  markLen = 3,
  offset = 1
) {
  doc.setDrawColor(113, 113, 122);
  doc.setLineWidth(0.2);

  // Top-left
  doc.line(x - offset - markLen, y, x - offset, y);
  doc.line(x, y - offset - markLen, x, y - offset);
  // Top-right
  doc.line(x + w + offset, y, x + w + offset + markLen, y);
  doc.line(x + w, y - offset - markLen, x + w, y - offset);
  // Bottom-left
  doc.line(x - offset - markLen, y + h, x - offset, y + h);
  doc.line(x, y + h + offset, x, y + h + offset + markLen);
  // Bottom-right
  doc.line(x + w + offset, y + h, x + w + offset + markLen, y + h);
  doc.line(x + w, y + h + offset, x + w, y + h + offset + markLen);
}

