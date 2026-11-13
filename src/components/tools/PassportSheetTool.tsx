"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  CheckCheck,
  Copy,
  Download,
  Info,
  Printer,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Upload,
} from "lucide-react";
import type { PageId } from "@/types/spec";

export interface PassportPaperOption {
  id: "4x6" | "a4" | "letter" | "5x7" | "3.5x5";
  shortName: string;
  name: string;
  widthMm: number;
  heightMm: number;
  badge?: string;
}

export interface PassportStandardOption {
  id: "35x45" | "51x51" | "35x35" | "50x70" | "33x48";
  regionCode: string;
  flag: string;
  name: string;
  country: string;
  widthMm: number;
  heightMm: number;
  spec: string;
}

export const PASSPORT_PAPER_SIZES: PassportPaperOption[] = [
  {
    id: "4x6",
    shortName: "4 × 6 in",
    name: "4 × 6 inches (10 × 15 cm)",
    widthMm: 152.4,
    heightMm: 101.6,
    badge: "Kiosk",
  },
  {
    id: "a4",
    shortName: "A4 Sheet",
    name: "A4 (210 × 297 mm)",
    widthMm: 297.0,
    heightMm: 210.0,
    badge: "Home",
  },
  {
    id: "letter",
    shortName: "US Letter",
    name: "US Letter (8.5 × 11 in)",
    widthMm: 279.4,
    heightMm: 215.9,
  },
  {
    id: "5x7",
    shortName: "5 × 7 in",
    name: "5 × 7 inches (13 × 18 cm)",
    widthMm: 177.8,
    heightMm: 127.0,
  },
  {
    id: "3.5x5",
    shortName: "3.5 × 5 in",
    name: "3.5 × 5 inches (9 × 13 cm)",
    widthMm: 127.0,
    heightMm: 88.9,
  },
];

export const PASSPORT_STANDARDS: PassportStandardOption[] = [
  {
    id: "35x45",
    regionCode: "EU / UK / IN",
    flag: "🇪🇺",
    name: "EU, UK, India & Schengen",
    country: "UK, EU, India, Australia & 50+ countries",
    widthMm: 35,
    heightMm: 45,
    spec: "35 × 45 mm",
  },
  {
    id: "51x51",
    regionCode: "US / OCI",
    flag: "🇺🇸",
    name: "US Passport & India OCI",
    country: "United States, India OCI & 2×2 in visas",
    widthMm: 50.8,
    heightMm: 50.8,
    spec: "2 × 2 in (51 × 51 mm)",
  },
  {
    id: "35x35",
    regionCode: "IN Square",
    flag: "🇮🇳",
    name: "India PAN / 3.5 × 3.5 cm",
    country: "India PAN card & square ID forms",
    widthMm: 35,
    heightMm: 35,
    spec: "35 × 35 mm",
  },
  {
    id: "50x70",
    regionCode: "Canada",
    flag: "🇨🇦",
    name: "Canada Passport & Visa",
    country: "Canada passport & citizenship",
    widthMm: 50,
    heightMm: 70,
    spec: "50 × 70 mm",
  },
  {
    id: "33x48",
    regionCode: "China",
    flag: "🇨🇳",
    name: "China Passport & Visa",
    country: "China passport & consular visa",
    widthMm: 33,
    heightMm: 48,
    spec: "33 × 48 mm",
  },
];

function createSamplePortraitDataUrl(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 700;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = "#f4f4f5";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#d4d4d8";
  ctx.setLineDash([10, 8]);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(350, 360, 170, 215, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#18181b";
  ctx.beginPath();
  ctx.ellipse(350, 890, 260, 240, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#4d7c0f";
  ctx.beginPath();
  ctx.moveTo(275, 650);
  ctx.lineTo(350, 720);
  ctx.lineTo(425, 650);
  ctx.lineTo(395, 625);
  ctx.lineTo(305, 625);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#d4a373";
  ctx.fillRect(305, 535, 90, 115);
  ctx.beginPath();
  ctx.ellipse(350, 365, 128, 165, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#27272a";
  ctx.beginPath();
  ctx.ellipse(350, 275, 132, 110, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 24px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SAMPLE PORTRAIT", 350, 815);
  ctx.fillStyle = "#a1a1aa";
  ctx.font = "18px monospace";
  ctx.fillText("Upload your own photo above", 350, 848);

  return canvas.toDataURL("image/png");
}

function getDefaultsForPage(pageId?: PageId): {
  paperId: PassportPaperOption["id"];
  standardId: PassportStandardOption["id"];
  orientation: "landscape" | "portrait";
} {
  if (pageId === "T07") {
    return {
      paperId: "4x6",
      standardId: "35x45",
      orientation: "landscape",
    };
  }
  return {
    paperId: "a4",
    standardId: "35x45",
    orientation: "portrait",
  };
}

export interface PassportSheetToolProps {
  pageId?: PageId;
  initialPaperSize?: PassportPaperOption["id"];
  initialPhotoStandard?: PassportStandardOption["id"];
  initialPhotoCount?: number;
}

export function PassportSheetTool({
  pageId,
  initialPaperSize,
  initialPhotoStandard,
  initialPhotoCount,
}: PassportSheetToolProps) {
  const defaults = getDefaultsForPage(pageId);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [paperSizeId, setPaperSizeId] = useState<PassportPaperOption["id"]>(
    initialPaperSize ?? defaults.paperId
  );
  const [photoStandardId, setPhotoStandardId] = useState<
    PassportStandardOption["id"] | "custom"
  >(initialPhotoStandard ?? defaults.standardId);
  const [customPhotoWidth, setCustomPhotoWidth] = useState<number>(35);
  const [customPhotoHeight, setCustomPhotoHeight] = useState<number>(45);

  const [guideStyle, setGuideStyle] = useState<
    "corner" | "dashed" | "solid" | "none"
  >("corner");
  const [gapMm, setGapMm] = useState<number>(2.5);
  const [marginMm, setMarginMm] = useState<number>(4);
  const [showAdvancedSpacing, setShowAdvancedSpacing] = useState<boolean>(false);
  const [orientation, setOrientation] = useState<"landscape" | "portrait">(
    (initialPaperSize ?? defaults.paperId) === "a4" ||
      (initialPaperSize ?? defaults.paperId) === "letter"
      ? "portrait"
      : "landscape"
  );
  const [photoCountOverride, setPhotoCountOverride] = useState<number | null>(
    initialPhotoCount ?? null
  );
  const [exportFormat, setExportFormat] = useState<"pdf" | "jpeg" | "png">(
    "pdf"
  );

  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  const currentPaper =
    PASSPORT_PAPER_SIZES.find((p) => p.id === paperSizeId) ||
    PASSPORT_PAPER_SIZES[0];
  const currentStandard =
    PASSPORT_STANDARDS.find((s) => s.id === photoStandardId) ||
    PASSPORT_STANDARDS[0];

  const safeCustomW = Math.min(120, Math.max(15, customPhotoWidth || 35));
  const safeCustomH = Math.min(120, Math.max(15, customPhotoHeight || 45));

  const photoWidthMm =
    photoStandardId === "custom" ? safeCustomW : currentStandard.widthMm;
  const photoHeightMm =
    photoStandardId === "custom" ? safeCustomH : currentStandard.heightMm;

  const paperWidthMm =
    orientation === "landscape"
      ? Math.max(currentPaper.widthMm, currentPaper.heightMm)
      : Math.min(currentPaper.widthMm, currentPaper.heightMm);
  const paperHeightMm =
    orientation === "landscape"
      ? Math.min(currentPaper.widthMm, currentPaper.heightMm)
      : Math.max(currentPaper.widthMm, currentPaper.heightMm);

  const DPI = 300;
  const mmToPx = (mm: number) => (mm * DPI) / 25.4;

  const paperWidthPx = Math.round(mmToPx(paperWidthMm));
  const paperHeightPx = Math.round(mmToPx(paperHeightMm));
  const photoWidthPx = Math.round(mmToPx(photoWidthMm));
  const photoHeightPx = Math.round(mmToPx(photoHeightMm));
  const gapPx = Math.round(mmToPx(gapMm));
  const marginPx = Math.round(mmToPx(marginMm));

  const availableWidth = Math.max(1, paperWidthPx - 2 * marginPx);
  const availableHeight = Math.max(1, paperHeightPx - 2 * marginPx);

  const maxCols = Math.max(
    1,
    Math.floor((availableWidth + gapPx) / (photoWidthPx + gapPx))
  );
  const maxRows = Math.max(
    1,
    Math.floor((availableHeight + gapPx) / (photoHeightPx + gapPx))
  );
  const maxCapacity = maxCols * maxRows;

  const activePhotoCount = photoCountOverride
    ? Math.min(photoCountOverride, maxCapacity)
    : maxCapacity;

  const computeSlotLayout = useCallback(() => {
    let cols = maxCols;
    let rows = Math.ceil(activePhotoCount / cols);
    if (rows > maxRows) {
      rows = maxRows;
      cols = Math.ceil(activePhotoCount / rows);
    }

    const gridWidthMm = cols * photoWidthMm + (cols - 1) * gapMm;
    const gridHeightMm = rows * photoHeightMm + (rows - 1) * gapMm;
    const startXMm = (paperWidthMm - gridWidthMm) / 2;
    const startYMm = (paperHeightMm - gridHeightMm) / 2;

    const slots: Array<{ xMm: number; yMm: number }> = [];
    let placed = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (placed >= activePhotoCount) break;
        slots.push({
          xMm: startXMm + c * (photoWidthMm + gapMm),
          yMm: startYMm + r * (photoHeightMm + gapMm),
        });
        placed++;
      }
    }
    return { cols, rows, slots };
  }, [
    maxCols,
    maxRows,
    activePhotoCount,
    photoWidthMm,
    photoHeightMm,
    gapMm,
    paperWidthMm,
    paperHeightMm,
  ]);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = paperWidthPx;
    canvas.height = paperHeightPx;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, paperWidthPx, paperHeightPx);

    const { slots } = computeSlotLayout();
    const img = imageElementRef.current;

    slots.forEach((slot, idx) => {
      const x = Math.round(mmToPx(slot.xMm));
      const y = Math.round(mmToPx(slot.yMm));

      if (img) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, photoWidthPx, photoHeightPx);
        ctx.clip();

        const imgAspect = img.width / img.height;
        const targetAspect = photoWidthPx / photoHeightPx;
        let drawW = photoWidthPx;
        let drawH = photoHeightPx;
        let drawX = x;
        let drawY = y;

        if (imgAspect > targetAspect) {
          drawW = photoHeightPx * imgAspect;
          drawX = x - (drawW - photoWidthPx) / 2;
        } else {
          drawH = photoWidthPx / imgAspect;
          drawY = y - (drawH - photoHeightPx) / 2;
        }

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.restore();
      } else {
        // Architectural blueprint slot preview before photo upload
        ctx.fillStyle = "#F4F4F5";
        ctx.fillRect(x, y, photoWidthPx, photoHeightPx);

        // Head & shoulders guide silhouette inside empty slot
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, photoWidthPx, photoHeightPx);
        ctx.clip();

        ctx.strokeStyle = "#D4D4D8";
        ctx.lineWidth = Math.max(2, Math.round(photoWidthPx * 0.008));
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.ellipse(
          x + photoWidthPx / 2,
          y + photoHeightPx * 0.42,
          photoWidthPx * 0.25,
          photoHeightPx * 0.26,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = "#71717A";
        ctx.font = `bold ${Math.max(16, Math.round(photoWidthPx * 0.085))}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(
          `#${idx + 1}`,
          x + photoWidthPx / 2,
          y + photoHeightPx * 0.44
        );

        ctx.fillStyle = "#4D7C0F";
        ctx.font = `600 ${Math.max(14, Math.round(photoWidthPx * 0.068))}px monospace`;
        ctx.fillText(
          `${photoWidthMm}×${photoHeightMm}mm`,
          x + photoWidthPx / 2,
          y + photoHeightPx * 0.82
        );
        ctx.restore();
      }

      if (guideStyle === "solid") {
        ctx.strokeStyle = "#A1A1AA";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, photoWidthPx, photoHeightPx);
      } else if (guideStyle === "dashed") {
        ctx.save();
        ctx.strokeStyle = "#71717A";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 8]);
        ctx.strokeRect(x, y, photoWidthPx, photoHeightPx);
        ctx.restore();
      } else if (guideStyle === "corner") {
        const markLen = Math.round(mmToPx(3.5));
        ctx.save();
        ctx.strokeStyle = "#52525B";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(x, y + markLen);
        ctx.lineTo(x, y);
        ctx.lineTo(x + markLen, y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + photoWidthPx - markLen, y);
        ctx.lineTo(x + photoWidthPx, y);
        ctx.lineTo(x + photoWidthPx, y + markLen);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, y + photoHeightPx - markLen);
        ctx.lineTo(x, y + photoHeightPx);
        ctx.lineTo(x + markLen, y + photoHeightPx);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + photoWidthPx - markLen, y + photoHeightPx);
        ctx.lineTo(x + photoWidthPx, y + photoHeightPx);
        ctx.lineTo(x + photoWidthPx, y + photoHeightPx - markLen);
        ctx.stroke();

        ctx.restore();
      }
    });

    // Calibration footer
    ctx.save();
    ctx.fillStyle = "#71717A";
    ctx.font = `${Math.round(mmToPx(2.2))}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = "center";
    const standardLabel =
      photoStandardId === "custom"
        ? `Custom ${photoWidthMm}×${photoHeightMm} mm`
        : `${currentStandard.regionCode} (${photoWidthMm}×${photoHeightMm} mm)`;
    const footerText = `Print Sheet Maker · ${currentPaper.name} · ${standardLabel} · ${activePhotoCount} Photos · Print at 100% Scale`;
    ctx.fillText(
      footerText,
      paperWidthPx / 2,
      paperHeightPx - Math.round(mmToPx(2.2))
    );
    ctx.restore();
  }, [
    paperWidthPx,
    paperHeightPx,
    photoWidthPx,
    photoHeightPx,
    computeSlotLayout,
    guideStyle,
    photoStandardId,
    photoWidthMm,
    photoHeightMm,
    currentStandard.regionCode,
    currentPaper.name,
    activePhotoCount,
  ]);

  useEffect(() => {
    if (!imageSrc) {
      imageElementRef.current = null;
      renderCanvas();
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      imageElementRef.current = img;
      renderCanvas();
    };
    img.src = imageSrc;
    return () => {
      cancelled = true;
    };
  }, [imageSrc, renderCanvas]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handlePaperChange = (id: PassportPaperOption["id"]) => {
    setPaperSizeId(id);
    setOrientation(id === "a4" || id === "letter" ? "portrait" : "landscape");
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setStatusMessage("Please choose a valid image file (JPG, PNG, or WebP).");
      return;
    }
    setStatusMessage(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setImageSrc(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleLoadSample = () => {
    const sample = createSamplePortraitDataUrl();
    if (sample) {
      setStatusMessage(null);
      setImageSrc(sample);
    }
  };

  const ensureImageForExport = (): HTMLImageElement | null => {
    if (imageElementRef.current) return imageElementRef.current;
    return null;
  };

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    setStatusMessage(null);

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: orientation === "landscape" ? "landscape" : "portrait",
        unit: "mm",
        format: [paperWidthMm, paperHeightMm],
      });

      const img = ensureImageForExport();
      let croppedDataUrl: string | null = null;

      if (img) {
        const tileCanvas = document.createElement("canvas");
        tileCanvas.width = Math.max(600, photoWidthPx);
        tileCanvas.height = Math.max(600, photoHeightPx);
        const tctx = tileCanvas.getContext("2d");
        if (!tctx) throw new Error("Canvas context unavailable");

        const imgAspect = img.width / img.height;
        const targetAspect = photoWidthMm / photoHeightMm;
        let drawW = tileCanvas.width;
        let drawH = tileCanvas.height;
        let drawX = 0;
        let drawY = 0;

        if (imgAspect > targetAspect) {
          drawW = tileCanvas.height * imgAspect;
          drawX = -(drawW - tileCanvas.width) / 2;
        } else {
          drawH = tileCanvas.width / imgAspect;
          drawY = -(drawH - tileCanvas.height) / 2;
        }

        tctx.fillStyle = "#ffffff";
        tctx.fillRect(0, 0, tileCanvas.width, tileCanvas.height);
        tctx.drawImage(img, drawX, drawY, drawW, drawH);
        croppedDataUrl = tileCanvas.toDataURL("image/jpeg", 0.96);
      }

      const { slots } = computeSlotLayout();

      for (const slot of slots) {
        const x = slot.xMm;
        const y = slot.yMm;
        if (croppedDataUrl) {
          doc.addImage(
            croppedDataUrl,
            "JPEG",
            x,
            y,
            photoWidthMm,
            photoHeightMm,
            undefined,
            "FAST"
          );
        } else {
          doc.setFillColor(248, 248, 250);
          doc.rect(x, y, photoWidthMm, photoHeightMm, "F");
        }

        if (guideStyle === "solid") {
          doc.setDrawColor(161, 161, 170);
          doc.setLineWidth(0.2);
          doc.rect(x, y, photoWidthMm, photoHeightMm);
        } else if (guideStyle === "dashed") {
          doc.setDrawColor(113, 113, 122);
          doc.setLineWidth(0.25);
          doc.setLineDashPattern([1.8, 1.8], 0);
          doc.rect(x, y, photoWidthMm, photoHeightMm);
          doc.setLineDashPattern([], 0);
        } else if (guideStyle === "corner") {
          const markLen = 3.5;
          doc.setDrawColor(82, 82, 91);
          doc.setLineWidth(0.25);
          doc.line(x, y + markLen, x, y);
          doc.line(x, y, x + markLen, y);
          doc.line(x + photoWidthMm - markLen, y, x + photoWidthMm, y);
          doc.line(x + photoWidthMm, y, x + photoWidthMm, y + markLen);
          doc.line(x, y + photoHeightMm - markLen, x, y + photoHeightMm);
          doc.line(x, y + photoHeightMm, x + markLen, y + photoHeightMm);
          doc.line(
            x + photoWidthMm - markLen,
            y + photoHeightMm,
            x + photoWidthMm,
            y + photoHeightMm
          );
          doc.line(
            x + photoWidthMm,
            y + photoHeightMm,
            x + photoWidthMm,
            y + photoHeightMm - markLen
          );
        }
      }

      doc.setFontSize(7);
      doc.setTextColor(113, 113, 122);
      const standardLabel =
        photoStandardId === "custom"
          ? `Custom ${photoWidthMm}x${photoHeightMm} mm`
          : `${currentStandard.regionCode} (${photoWidthMm}x${photoHeightMm} mm)`;
      doc.text(
        `Print Sheet Maker · ${currentPaper.name} · ${standardLabel} · ${activePhotoCount} Photos · Print at 100% Scale`,
        paperWidthMm / 2,
        paperHeightMm - 2.2,
        { align: "center" }
      );

      const fileName = `passport-photo-sheet-${photoWidthMm}x${photoHeightMm}mm-${currentPaper.id}-${activePhotoCount}pcs.pdf`;
      doc.save(fileName);
      setStatusMessage(
        `Downloaded ${fileName}. Print at 100% (Actual Size), not Fit to Page.`
      );
    } catch {
      setStatusMessage("Could not generate PDF. Please try JPEG/PNG export.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadRaster = (format: "jpeg" | "png") => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsExporting(true);
    setStatusMessage(null);

    setTimeout(() => {
      const mime = format === "jpeg" ? "image/jpeg" : "image/png";
      const quality = format === "jpeg" ? 0.98 : undefined;
      const dataUrl = canvas.toDataURL(mime, quality);

      const link = document.createElement("a");
      const filename = `passport-photo-sheet-${photoWidthMm}x${photoHeightMm}mm-${currentPaper.id}-${activePhotoCount}pcs.${format === "jpeg" ? "jpg" : "png"}`;
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
      setStatusMessage(`Downloaded 300 DPI ${format.toUpperCase()} sheet.`);
    }, 100);
  };

  const handleExport = () => {
    if (exportFormat === "pdf") {
      void handleDownloadPdf();
    } else {
      handleDownloadRaster(exportFormat);
    }
  };

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setStatusMessage("Please allow popups to open the browser print dialog.");
      return;
    }

    const dataUrl = canvas.toDataURL("image/jpeg", 1.0);
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Passport Photo Sheet - Print Sheet Maker</title>
          <style>
            @page {
              size: ${paperWidthMm}mm ${paperHeightMm}mm;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #fff;
            }
            img {
              width: ${paperWidthMm}mm;
              height: ${paperHeightMm}mm;
              display: block;
            }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" alt="Printable passport photo sheet" onload="window.print();window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCopy = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2400);
      } catch {
        setStatusMessage(
          "Direct clipboard copy is not supported here. Please use Download instead."
        );
      }
    }, "image/png");
  };

  const handleReset = () => {
    setImageSrc(null);
    setPhotoCountOverride(null);
    setStatusMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const copyPresets = [2, 4, 6, 8, maxCapacity].filter(
    (v, i, a) => a.indexOf(v) === i && v <= maxCapacity
  );

  return (
    <div className="rounded-3xl bg-[#f5f5f7] p-3 sm:p-4 lg:p-5 space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        aria-label="Upload passport photo file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* TOP BAR: Compact Flat Borderless Upload Bar */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 transition-colors ${
          isDragging ? "bg-[#eef6e4]" : "bg-white"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              aria-hidden="true"
              className="w-9 h-9 rounded-xl bg-[#eef6e4] text-[#3f6212] flex items-center justify-center shrink-0"
            >
              <Upload className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <p className="text-xs sm:text-sm font-bold tracking-tight text-zinc-950 truncate">
                  {imageSrc
                    ? "Passport Photo Loaded on Sheet"
                    : "Upload Your Passport Photo"}
                </p>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#eef6e4] px-2 py-0.5 text-[10px] font-semibold text-[#365314] shrink-0">
                  <Sparkles aria-hidden="true" className="w-2.5 h-2.5 text-[#3f6212]" />
                  100% Private
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 truncate">
                {imageSrc
                  ? `${photoWidthMm} × ${photoHeightMm} mm · ${activePhotoCount} copies on ${currentPaper.shortName}`
                  : "Drag & drop JPG, PNG, or WebP — live 300 DPI sheet updates instantly."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-[#4d7c0f] hover:bg-[#3f6212] text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Upload aria-hidden="true" className="w-3.5 h-3.5" />
              <span>{imageSrc ? "Change Photo" : "Choose Photo"}</span>
            </button>

            {!imageSrc ? (
              <button
                type="button"
                onClick={handleLoadSample}
                className="min-h-[36px] px-3 py-1.5 rounded-xl bg-[#f5f5f7] hover:bg-[#ebeced] text-zinc-800 font-semibold text-xs inline-flex items-center justify-center transition cursor-pointer"
              >
                Try Sample Photo
              </button>
            ) : (
              <button
                type="button"
                onClick={handleReset}
                aria-label="Clear uploaded photo"
                className="min-h-[36px] px-3 py-1.5 rounded-xl bg-[#f5f5f7] hover:bg-[#ebeced] text-zinc-700 font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw aria-hidden="true" className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MAIN STUDIO WORKSPACE: CONTROLS + LIVE PRINT PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* LEFT COLUMN (CONTROLS & EXPORT) — Single Unified Compact Panel */}
        <div className="order-2 lg:order-1 lg:col-span-7 xl:col-span-6 rounded-2xl bg-white p-3.5 sm:p-4 flex flex-col justify-between gap-3">
          <div className="space-y-3">
            {/* 1. Country / ID Standard Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold tracking-tight text-zinc-950">
                  1. Country &amp; Photo Size
                </p>
                <span className="font-mono text-[11px] font-bold text-[#365314] bg-[#eef6e4] px-2 py-0.5 rounded-full">
                  {photoWidthMm} × {photoHeightMm} mm
                </span>
              </div>

              <div
                role="group"
                aria-label="Passport photo country standard"
                className="grid grid-cols-2 sm:grid-cols-3 gap-1.5"
              >
                {PASSPORT_STANDARDS.map((std) => {
                  const active = photoStandardId === std.id;
                  return (
                    <button
                      key={std.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setPhotoStandardId(std.id)}
                      className={`min-h-[44px] px-2.5 py-2 rounded-xl text-left transition cursor-pointer ${
                        active
                          ? "bg-[#eef6e4] text-zinc-950"
                          : "bg-[#f5f5f7] hover:bg-[#ebeced] text-zinc-800"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] sm:text-xs font-bold text-zinc-950 truncate">
                          <span aria-hidden="true">{std.flag} </span>
                          {std.regionCode}
                        </span>
                        <span
                          className={`font-mono text-[9.5px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                            active
                              ? "bg-white text-[#365314]"
                              : "bg-white text-zinc-700"
                          }`}
                        >
                          {std.widthMm}×{std.heightMm}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-600 block truncate mt-0.5">
                        {std.name}
                      </span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  aria-pressed={photoStandardId === "custom"}
                  onClick={() => setPhotoStandardId("custom")}
                  className={`min-h-[44px] px-2.5 py-2 rounded-xl text-left transition cursor-pointer ${
                    photoStandardId === "custom"
                      ? "bg-[#eef6e4] text-zinc-950"
                      : "bg-[#f5f5f7] hover:bg-[#ebeced] text-zinc-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] sm:text-xs font-bold text-zinc-950 truncate">
                      Custom Size
                    </span>
                    <span className="font-mono text-[9.5px] font-bold text-zinc-700 bg-white px-1.5 py-0.5 rounded-md shrink-0">
                      {safeCustomW}×{safeCustomH}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-600 block truncate mt-0.5">
                    Any width × height (mm)
                  </span>
                </button>
              </div>

              {photoStandardId === "custom" && (
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <label
                    htmlFor="passport-custom-width-mm"
                    className="text-[11px] font-bold text-zinc-700 block"
                  >
                    Width (mm)
                    <input
                      id="passport-custom-width-mm"
                      type="number"
                      min={15}
                      max={120}
                      value={customPhotoWidth}
                      onChange={(e) =>
                        setCustomPhotoWidth(Number(e.target.value))
                      }
                      className="mt-1 w-full bg-[#f5f5f7] rounded-xl px-3 py-1.5 text-xs font-mono text-zinc-950"
                    />
                  </label>
                  <label
                    htmlFor="passport-custom-height-mm"
                    className="text-[11px] font-bold text-zinc-700 block"
                  >
                    Height (mm)
                    <input
                      id="passport-custom-height-mm"
                      type="number"
                      min={15}
                      max={120}
                      value={customPhotoHeight}
                      onChange={(e) =>
                        setCustomPhotoHeight(Number(e.target.value))
                      }
                      className="mt-1 w-full bg-[#f5f5f7] rounded-xl px-3 py-1.5 text-xs font-mono text-zinc-950"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* 2. Paper Format, Copies & Cut Guides */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold tracking-tight text-zinc-950">
                  2. Paper Sheet Size &amp; Layout
                </p>
                <button
                  type="button"
                  aria-label={`Toggle paper orientation (currently ${orientation})`}
                  onClick={() =>
                    setOrientation(
                      orientation === "landscape" ? "portrait" : "landscape"
                    )
                  }
                  className="min-h-[30px] inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f7] px-2.5 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-[#ebeced] cursor-pointer"
                >
                  <RefreshCw aria-hidden="true" className="w-3 h-3 text-[#3f6212]" />
                  <span className="capitalize">{orientation}</span>
                </button>
              </div>

              <div
                role="group"
                aria-label="Paper sheet size"
                className="grid grid-cols-3 sm:grid-cols-5 gap-1.5"
              >
                {PASSPORT_PAPER_SIZES.map((paper) => {
                  const active = paperSizeId === paper.id;
                  return (
                    <button
                      key={paper.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => handlePaperChange(paper.id)}
                      className={`min-h-[42px] px-2 py-1.5 rounded-xl text-left transition cursor-pointer ${
                        active
                          ? "bg-[#eef6e4] text-zinc-950"
                          : "bg-[#f5f5f7] hover:bg-[#ebeced] text-zinc-800"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-[11px] text-zinc-950 truncate">
                          {paper.shortName}
                        </span>
                        {paper.badge && (
                          <span className="hidden xl:inline-block text-[8px] font-bold uppercase px-1 py-0.5 rounded bg-white text-[#365314] shrink-0">
                            {paper.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[9.5px] text-zinc-600 font-mono block truncate mt-0.5">
                        {paper.widthMm}×{paper.heightMm}mm
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-zinc-700">
                      Photos on Sheet
                    </span>
                    <span className="text-[11px] font-mono font-bold text-zinc-950">
                      {activePhotoCount} / {maxCapacity} max
                    </span>
                  </div>
                  <div
                    role="group"
                    aria-label="Number of photos on sheet"
                    className="flex items-center gap-1"
                  >
                    {copyPresets.map((count) => {
                      const isSelected = activePhotoCount === count;
                      return (
                        <button
                          key={count}
                          type="button"
                          aria-pressed={isSelected}
                          aria-label={`${count} photos${count === maxCapacity ? " (maximum)" : ""}`}
                          onClick={() =>
                            setPhotoCountOverride(
                              count === maxCapacity ? null : count
                            )
                          }
                          className={`min-h-[34px] flex-1 py-1.5 px-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                            isSelected
                              ? "bg-zinc-950 text-white"
                              : "bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced]"
                          }`}
                        >
                          {count}
                          {count === maxCapacity ? " max" : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-zinc-700">
                      Cut Guides
                    </span>
                    <button
                      type="button"
                      aria-expanded={showAdvancedSpacing}
                      onClick={() =>
                        setShowAdvancedSpacing(!showAdvancedSpacing)
                      }
                      className="inline-flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-[11px] font-semibold text-[#3f6212] hover:bg-[#f5f5f7] cursor-pointer"
                    >
                      <SlidersHorizontal aria-hidden="true" className="w-3 h-3" />
                      <span>
                        {showAdvancedSpacing
                          ? "Hide Spacing"
                          : `${marginMm}/${gapMm}mm`}
                      </span>
                    </button>
                  </div>

                  <div
                    role="group"
                    aria-label="Cut guide style"
                    className="grid grid-cols-4 gap-1"
                  >
                    {(
                      [
                        { id: "corner", label: "Corner" },
                        { id: "dashed", label: "Dashed" },
                        { id: "solid", label: "Solid" },
                        { id: "none", label: "None" },
                      ] as const
                    ).map((style) => {
                      const isSelected = guideStyle === style.id;
                      return (
                        <button
                          key={style.id}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => setGuideStyle(style.id)}
                          className={`min-h-[34px] py-1.5 px-1 rounded-xl text-[11px] font-semibold transition cursor-pointer ${
                            isSelected
                              ? "bg-[#eef6e4] text-[#365314] font-bold"
                              : "bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced]"
                          }`}
                        >
                          {style.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {showAdvancedSpacing && (
                <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                  <label
                    htmlFor="passport-gap-mm"
                    className="block rounded-xl bg-[#f5f5f7] p-2"
                  >
                    <div className="flex justify-between text-[11px] font-semibold text-zinc-700 mb-1">
                      <span>Gap</span>
                      <span className="font-mono">{gapMm} mm</span>
                    </div>
                    <input
                      id="passport-gap-mm"
                      type="range"
                      aria-label="Gap between photos in millimetres"
                      min={0}
                      max={8}
                      step={0.5}
                      value={gapMm}
                      onChange={(e) => setGapMm(parseFloat(e.target.value))}
                      className="w-full accent-[#4d7c0f] cursor-pointer"
                    />
                  </label>
                  <label
                    htmlFor="passport-margin-mm"
                    className="block rounded-xl bg-[#f5f5f7] p-2"
                  >
                    <div className="flex justify-between text-[11px] font-semibold text-zinc-700 mb-1">
                      <span>Margin</span>
                      <span className="font-mono">{marginMm} mm</span>
                    </div>
                    <input
                      id="passport-margin-mm"
                      type="range"
                      aria-label="Safe outer print margin in millimetres"
                      min={1}
                      max={12}
                      step={0.5}
                      value={marginMm}
                      onChange={(e) => setMarginMm(parseFloat(e.target.value))}
                      className="w-full accent-[#4d7c0f] cursor-pointer"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* 3. Export & Print Controls */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold tracking-tight text-zinc-950">
                3. Download or Print Sheet
              </p>
              <span className="text-[11px] font-mono text-zinc-600">
                300 DPI · 1:1 Scale
              </span>
            </div>

            <div
              role="group"
              aria-label="Export file format"
              className="grid grid-cols-3 gap-1.5"
            >
              {(
                [
                  { id: "pdf", title: "PDF", shortSub: "Home", sub: "Home Print" },
                  { id: "jpeg", title: "JPEG", shortSub: "Kiosk", sub: "Photo Kiosk" },
                  { id: "png", title: "PNG", shortSub: "Lossless", sub: "Lossless" },
                ] as const
              ).map((fmt) => {
                const isSelected = exportFormat === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setExportFormat(fmt.id)}
                    className={`min-h-[34px] px-2.5 py-1.5 rounded-xl flex items-center justify-between gap-1 transition cursor-pointer ${
                      isSelected
                        ? "bg-[#eef6e4] text-zinc-950"
                        : "bg-[#f5f5f7] hover:bg-[#ebeced] text-zinc-800"
                    }`}
                  >
                    <span className="font-bold text-xs text-zinc-950">
                      {fmt.title}
                    </span>
                    <span className="text-[10px] text-zinc-600 truncate">
                      <span className="sm:hidden">{fmt.shortSub}</span>
                      <span className="hidden sm:inline">{fmt.sub}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 min-h-[42px] py-2.5 px-4 rounded-xl bg-[#4d7c0f] hover:bg-[#3f6212] disabled:bg-zinc-200 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Download aria-hidden="true" className="w-4 h-4 shrink-0" />
                <span>
                  {isExporting
                    ? "Generating Sheet..."
                    : `Download ${exportFormat.toUpperCase()} (${activePhotoCount} Photos)`}
                </span>
              </button>

              <div className="grid grid-cols-2 sm:flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="min-h-[38px] sm:min-h-[42px] py-2 px-3 rounded-xl bg-[#f5f5f7] hover:bg-[#ebeced] text-zinc-900 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Printer aria-hidden="true" className="w-3.5 h-3.5 text-[#3f6212]" />
                  <span>Print 1:1</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="min-h-[38px] sm:min-h-[42px] py-2 px-3 rounded-xl bg-[#f5f5f7] hover:bg-[#ebeced] text-zinc-900 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  {copied ? (
                    <>
                      <CheckCheck aria-hidden="true" className="w-3.5 h-3.5 text-[#3f6212]" />
                      <span className="text-[#365314] font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy aria-hidden="true" className="w-3.5 h-3.5 text-zinc-700" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {statusMessage && (
              <div
                role="status"
                aria-live="polite"
                className="rounded-xl bg-[#eef6e4] px-3 py-2 text-xs font-medium text-[#365314]"
              >
                {statusMessage}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE 300 DPI PRINT PREVIEW STAGE — Flat Borderless Surface */}
        <div className="order-1 lg:order-2 lg:col-span-5 xl:col-span-6 rounded-2xl bg-white p-3.5 sm:p-4 flex flex-col justify-between h-full">
          <div className="flex flex-wrap items-center justify-between gap-2 text-zinc-600 text-xs mb-2.5">
            <div className="flex items-center gap-2 font-mono text-[11px] min-w-0">
              <span
                aria-hidden="true"
                className="inline-block w-2 h-2 rounded-full bg-[#4d7c0f] shrink-0"
              />
              <span className="text-zinc-950 font-bold truncate">
                Live Print Preview (300 DPI)
              </span>
              <span aria-hidden="true" className="text-zinc-600 hidden sm:inline">
                ·
              </span>
              <span className="text-zinc-600 hidden sm:inline truncate">
                {currentPaper.shortName}
              </span>
            </div>

            <span className="rounded-full bg-[#eef6e4] px-2.5 py-0.5 text-[11px] font-mono text-[#365314] font-semibold shrink-0">
              {activePhotoCount} × ({photoWidthMm}×{photoHeightMm} mm)
            </span>
          </div>

          <div className="w-full flex-1 flex items-center justify-center p-3 sm:p-5 min-h-[180px] sm:min-h-[300px] lg:min-h-[350px] overflow-hidden bg-[#f5f5f7] rounded-xl">
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={`Live 300 DPI print sheet preview showing ${activePhotoCount} passport photos (${photoWidthMm} by ${photoHeightMm} mm) on ${currentPaper.name}`}
              className="max-w-full max-h-[195px] sm:max-h-[320px] lg:max-h-[380px] xl:max-h-[410px] w-auto h-auto rounded-lg bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-600 mt-2.5">
            <div className="flex items-center gap-1.5">
              <Info aria-hidden="true" className="w-3.5 h-3.5 text-[#3f6212] shrink-0" />
              <span>
                Verify background &amp; head size rules. Print at{" "}
                <strong className="text-zinc-900">100% Actual Size</strong>.
              </span>
            </div>
            <span className="font-mono text-zinc-600">
              {paperWidthMm} × {paperHeightMm} mm
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
