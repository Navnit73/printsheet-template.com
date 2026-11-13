"use client";

import React, { useEffect, useState } from "react";
import { Download, ImagePlus, QrCode, Scissors } from "lucide-react";
import type { PageId } from "@/types/spec";
import {
  drawCropMarksPdf,
  fileToDataUrl,
  PAPER_SIZES,
  renderImageToBoxDataUrl,
} from "@/lib/pdf-utils";

type SheetPresetId = "a4-10up" | "letter-10up" | "letter-8up" | "a4-8up";
type CardStyleId = "minimal" | "classic" | "bold-logo" | "blank" | "qr-visiting";

interface SheetPreset {
  id: SheetPresetId;
  label: string;
  paper: "a4" | "letter";
  cols: number;
  rows: number;
  cardW: number;
  cardH: number;
  gapX: number;
  gapY: number;
}

const SHEET_PRESETS: Record<SheetPresetId, SheetPreset> = {
  "a4-10up": {
    id: "a4-10up",
    label: "10 per A4 (90 × 55 mm)",
    paper: "a4",
    cols: 2,
    rows: 5,
    cardW: 90,
    cardH: 55,
    gapX: 6,
    gapY: 2,
  },
  "letter-10up": {
    id: "letter-10up",
    label: "10 per Letter · 8376-style (3.5 × 2 in)",
    paper: "letter",
    cols: 2,
    rows: 5,
    cardW: 88.9,
    cardH: 50.8,
    gapX: 12.7,
    gapY: 0,
  },
  "letter-8up": {
    id: "letter-8up",
    label: "8 per Letter (3.5 × 2 in + gaps)",
    paper: "letter",
    cols: 2,
    rows: 4,
    cardW: 88.9,
    cardH: 50.8,
    gapX: 12,
    gapY: 12,
  },
  "a4-8up": {
    id: "a4-8up",
    label: "8 per A4 (85 × 55 mm)",
    paper: "a4",
    cols: 2,
    rows: 4,
    cardW: 85,
    cardH: 55,
    gapX: 10,
    gapY: 10,
  },
};

function getInitialConfig(pageId: PageId): {
  mode: "design" | "upload";
  sheet: SheetPresetId;
  style: CardStyleId;
} {
  switch (pageId) {
    case "T11":
      return { mode: "upload", sheet: "a4-10up", style: "minimal" };
    case "T12":
      return { mode: "design", sheet: "a4-10up", style: "blank" };
    case "T13":
      return { mode: "design", sheet: "a4-10up", style: "minimal" };
    case "T15":
      return { mode: "design", sheet: "letter-10up", style: "minimal" };
    case "T16":
      return { mode: "design", sheet: "a4-10up", style: "qr-visiting" };
    case "T14":
    default:
      return { mode: "design", sheet: "a4-10up", style: "bold-logo" };
  }
}

export function BusinessCardTool({ pageId }: { pageId: PageId }) {
  const init = getInitialConfig(pageId);
  const [mode, setMode] = useState<"design" | "upload">(init.mode);
  const [sheetId, setSheetId] = useState<SheetPresetId>(init.sheet);
  const [styleId, setStyleId] = useState<CardStyleId>(init.style);

  const [fullName, setFullName] = useState("Alex Morgan");
  const [role, setRole] = useState("Independent Print Designer");
  const [company, setCompany] = useState("Northlight Studio");
  const [phone, setPhone] = useState("+1 (555) 234-8910");
  const [email, setEmail] = useState("alex@northlight.example");
  const [website, setWebsite] = useState("northlight.example");
  const [accentHex, setAccentHex] = useState("#3f6212");
  const [includeBack, setIncludeBack] = useState(false);
  const [backHeadline, setBackHeadline] = useState("Northlight Studio");
  const [backNote, setBackNote] = useState(
    "Brand identity, packaging and print layouts."
  );
  const [includeQr, setIncludeQr] = useState(init.style === "qr-visiting");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [uploadedFront, setUploadedFront] = useState<string | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [showCropMarks, setShowCropMarks] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const sheet = SHEET_PRESETS[sheetId];
  const paper = PAPER_SIZES[sheet.paper];

  useEffect(() => {
    let cancelled = false;
    if (!includeQr) {
      return;
    }
    const target = website.trim()
      ? website.startsWith("http")
        ? website
        : `https://${website}`
      : email;
    import("qrcode")
      .then((QRCode) =>
        QRCode.toDataURL(target || "https://printsheet-template.com", {
          width: 240,
          margin: 1,
          color: { dark: "#09090b", light: "#ffffff" },
        })
      )
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl("");
      });
    return () => {
      cancelled = true;
    };
  }, [includeQr, website, email]);

  async function handleCardUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFront(await fileToDataUrl(file));
    setMode("upload");
    setStatusMsg("Card artwork uploaded.");
    e.target.value = "";
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoDataUrl(await fileToDataUrl(file));
    e.target.value = "";
  }

  function hexToRgb(hex: string): [number, number, number] {
    const clean = hex.replace("#", "");
    const num = parseInt(clean.length === 3 ? clean.replace(/(.)/g, "$1$1") : clean, 16);
    if (Number.isNaN(num)) return [77, 124, 15];
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  async function handleDownloadPdf() {
    setIsExporting(true);
    setStatusMsg(null);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [paper.widthMm, paper.heightMm],
      });

      const totalGridW = sheet.cols * sheet.cardW + (sheet.cols - 1) * sheet.gapX;
      const totalGridH = sheet.rows * sheet.cardH + (sheet.rows - 1) * sheet.gapY;
      const startX = (paper.widthMm - totalGridW) / 2;
      const startY = (paper.heightMm - totalGridH) / 2;

      let preparedUpload: { dataUrl: string; format: "JPEG" | "PNG" } | null = null;
      if (mode === "upload" && uploadedFront) {
        preparedUpload = await renderImageToBoxDataUrl(
          uploadedFront,
          sheet.cardW / sheet.cardH,
          "cover"
        );
      }

      const [ar, ag, ab] = hexToRgb(accentHex);

      const drawCardFront = (x: number, y: number) => {
        if (mode === "upload" && preparedUpload) {
          doc.addImage(
            preparedUpload.dataUrl,
            preparedUpload.format,
            x,
            y,
            sheet.cardW,
            sheet.cardH
          );
          return;
        }

        doc.setFillColor(255, 255, 255);
        doc.rect(x, y, sheet.cardW, sheet.cardH, "F");

        if (styleId === "blank") {
          doc.setDrawColor(212, 212, 216);
          doc.setLineWidth(0.2);
          doc.rect(x, y, sheet.cardW, sheet.cardH);
          return;
        }

        if (styleId === "bold-logo") {
          doc.setFillColor(ar, ag, ab);
          doc.rect(x, y, 4, sheet.cardH, "F");
        } else if (styleId === "minimal" || styleId === "qr-visiting") {
          doc.setFillColor(ar, ag, ab);
          doc.rect(x, y, sheet.cardW, 2.2, "F");
        } else if (styleId === "classic") {
          doc.setDrawColor(ar, ag, ab);
          doc.setLineWidth(0.35);
          doc.rect(x + 3, y + 3, sheet.cardW - 6, sheet.cardH - 6);
        }

        if (logoDataUrl) {
          doc.addImage(logoDataUrl, "PNG", x + sheet.cardW - 19, y + 6, 12, 12);
        }

        const padX = styleId === "bold-logo" ? x + 9 : x + 7;
        const centerMode = styleId === "classic";
        const textX = centerMode ? x + sheet.cardW / 2 : padX;
        const alignOpt = centerMode ? ({ align: "center" } as const) : undefined;

        doc.setTextColor(9, 9, 11);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(fullName || " ", textX, y + 14, alignOpt);

        doc.setTextColor(ar, ag, ab);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(role || " ", textX, y + 19, alignOpt);

        doc.setTextColor(82, 82, 91);
        doc.setFontSize(7.5);
        doc.text(company || " ", textX, y + 24, alignOpt);

        doc.setTextColor(24, 24, 27);
        doc.setFontSize(7.5);
        doc.text(phone || " ", textX, y + 34, alignOpt);
        doc.text(email || " ", textX, y + 38.5, alignOpt);
        doc.text(website || " ", textX, y + 43, alignOpt);

        if (includeQr && qrDataUrl) {
          doc.addImage(
            qrDataUrl,
            "PNG",
            x + sheet.cardW - 21,
            y + sheet.cardH - 21,
            15,
            15
          );
        }
      };

      for (let r = 0; r < sheet.rows; r++) {
        for (let c = 0; c < sheet.cols; c++) {
          const cx = startX + c * (sheet.cardW + sheet.gapX);
          const cy = startY + r * (sheet.cardH + sheet.gapY);
          drawCardFront(cx, cy);
          if (showCropMarks) {
            drawCropMarksPdf(doc, cx, cy, sheet.cardW, sheet.cardH, 2.5, 0.8);
          }
        }
      }

      if (includeBack) {
        doc.addPage([paper.widthMm, paper.heightMm], "portrait");
        for (let r = 0; r < sheet.rows; r++) {
          for (let c = 0; c < sheet.cols; c++) {
            const cx = startX + c * (sheet.cardW + sheet.gapX);
            const cy = startY + r * (sheet.cardH + sheet.gapY);
            doc.setFillColor(24, 24, 27);
            doc.rect(cx, cy, sheet.cardW, sheet.cardH, "F");
            doc.setFillColor(ar, ag, ab);
            doc.rect(cx, cy + sheet.cardH - 2.5, sheet.cardW, 2.5, "F");

            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.text(
              backHeadline || company,
              cx + sheet.cardW / 2,
              cy + sheet.cardH / 2 - 2,
              { align: "center" }
            );
            doc.setTextColor(212, 212, 216);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            doc.text(backNote || website, cx + sheet.cardW / 2, cy + sheet.cardH / 2 + 5, {
              align: "center",
            });

            if (showCropMarks) {
              drawCropMarksPdf(doc, cx, cy, sheet.cardW, sheet.cardH, 2.5, 0.8);
            }
          }
        }
      }

      doc.save(`business-cards-${pageId.toLowerCase()}-${sheet.paper}.pdf`);
      setStatusMsg(
        `Downloaded ${sheet.cols * sheet.rows}-card${
          includeBack ? " (front + back)" : ""
        } print-ready PDF.`
      );
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : "PDF export failed.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="rounded-3xl bg-[#f5f5f7] p-4 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3.5">
        <div
          role="group"
          aria-label="Business card input mode"
          className="flex flex-wrap items-center gap-1.5"
        >
          <button
            type="button"
            aria-pressed={mode === "design"}
            onClick={() => setMode("design")}
            className={`min-h-[36px] rounded-xl px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
              mode === "design"
                ? "bg-[#4d7c0f] text-white"
                : "bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced]"
            }`}
          >
            Edit Card Details
          </button>
          <button
            type="button"
            aria-pressed={mode === "upload"}
            onClick={() => setMode("upload")}
            className={`min-h-[36px] rounded-xl px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
              mode === "upload"
                ? "bg-[#4d7c0f] text-white"
                : "bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced]"
            }`}
          >
            Upload Card Image
          </button>
        </div>
        <div className="text-xs font-mono text-zinc-600">
          {sheet.cols * sheet.rows} cards / sheet · {sheet.cardW} × {sheet.cardH} mm
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-5 rounded-2xl bg-white p-5 space-y-4">
          <div>
            <label
              htmlFor="card-sheet-preset"
              className="block text-xs font-bold tracking-tight text-zinc-950 mb-1.5"
            >
              Sheet Layout Preset
            </label>
            <select
              id="card-sheet-preset"
              value={sheetId}
              onChange={(e) => setSheetId(e.target.value as SheetPresetId)}
              className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2.5 text-xs text-zinc-900"
            >
              {Object.values(SHEET_PRESETS).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {mode === "upload" ? (
            <div className="space-y-3 rounded-2xl bg-[#f5f5f7] p-4">
              <p className="text-xs text-zinc-600 leading-relaxed">
                Upload an exported business card PNG or JPG (for example from Canva, Photoshop, or Illustrator) to tile it across the full print sheet.
              </p>
              <label className="min-h-[36px] inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#4d7c0f] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#3f6212] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#3f6212]">
                <ImagePlus aria-hidden="true" className="h-4 w-4 text-white" />
                <span>Choose Card Image</span>
                <input
                  type="file"
                  aria-label="Choose business card artwork image"
                  accept="image/*"
                  onChange={handleCardUpload}
                  className="sr-only"
                />
              </label>
            </div>
          ) : (
            <>
              <div
                role="group"
                aria-label="Business card visual style"
                className="flex flex-wrap gap-1.5"
              >
                {(
                  [
                    { id: "minimal", label: "Modern Minimal" },
                    { id: "classic", label: "Classic Framed" },
                    { id: "bold-logo", label: "Bold Stripe" },
                    { id: "qr-visiting", label: "QR Visiting" },
                    { id: "blank", label: "Blank Sheet" },
                  ] as const
                ).map((st) => {
                  const active = styleId === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setStyleId(st.id);
                        if (st.id === "qr-visiting") setIncludeQr(true);
                      }}
                      className={`min-h-[32px] rounded-xl px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                        active
                          ? "bg-[#eef6e4] text-[#365314] font-bold"
                          : "bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced]"
                      }`}
                    >
                      {st.label}
                    </button>
                  );
                })}
              </div>

              {styleId !== "blank" && (
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label
                      htmlFor="card-full-name"
                      className="block text-[11px] font-semibold text-zinc-700 mb-1"
                    >
                      Full Name
                    </label>
                    <input
                      id="card-full-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs text-zinc-950"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="card-role"
                      className="block text-[11px] font-semibold text-zinc-700 mb-1"
                    >
                      Job Title / Role
                    </label>
                    <input
                      id="card-role"
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Job Title / Role"
                      className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs text-zinc-950"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="card-company"
                      className="block text-[11px] font-semibold text-zinc-700 mb-1"
                    >
                      Company / Studio
                    </label>
                    <input
                      id="card-company"
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Company / Studio"
                      className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs text-zinc-950"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="card-phone"
                      className="block text-[11px] font-semibold text-zinc-700 mb-1"
                    >
                      Phone
                    </label>
                    <input
                      id="card-phone"
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone"
                      className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs text-zinc-950"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="card-email"
                      className="block text-[11px] font-semibold text-zinc-700 mb-1"
                    >
                      Email
                    </label>
                    <input
                      id="card-email"
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs text-zinc-950"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="card-website"
                      className="block text-[11px] font-semibold text-zinc-700 mb-1"
                    >
                      Website
                    </label>
                    <input
                      id="card-website"
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="Website"
                      className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs text-zinc-950"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <label
                  htmlFor="card-accent-color"
                  className="min-h-[32px] inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700"
                >
                  Accent
                  <input
                    id="card-accent-color"
                    type="color"
                    aria-label="Business card accent color"
                    value={accentHex}
                    onChange={(e) => setAccentHex(e.target.value)}
                    className="h-8 w-10 cursor-pointer rounded-md bg-[#f5f5f7]"
                  />
                </label>

                <label className="min-h-[32px] inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#f5f5f7] px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-[#ebeced] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#3f6212]">
                  <ImagePlus aria-hidden="true" className="h-3.5 w-3.5 text-[#3f6212]" />
                  Logo
                  <input
                    type="file"
                    aria-label="Upload company logo image"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="sr-only"
                  />
                </label>

                <label className="min-h-[32px] inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeQr}
                    onChange={(e) => setIncludeQr(e.target.checked)}
                    className="h-4 w-4 accent-[#4d7c0f]"
                  />
                  <QrCode aria-hidden="true" className="h-3.5 w-3.5 text-zinc-600" />
                  QR Code
                </label>
              </div>
            </>
          )}

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <label className="min-h-[32px] inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showCropMarks}
                onChange={(e) => setShowCropMarks(e.target.checked)}
                className="h-4 w-4 accent-[#4d7c0f]"
              />
              <Scissors aria-hidden="true" className="h-3.5 w-3.5 text-zinc-600" />
              Crop marks
            </label>

            <label className="min-h-[32px] inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeBack}
                onChange={(e) => setIncludeBack(e.target.checked)}
                className="h-4 w-4 accent-[#4d7c0f]"
              />
              Include Back Side (Page 2)
            </label>
          </div>

          {includeBack && (
            <div className="grid grid-cols-1 gap-2 rounded-2xl bg-[#f5f5f7] p-3">
              <div>
                <label
                  htmlFor="card-back-headline"
                  className="block text-[11px] font-semibold text-zinc-700 mb-1"
                >
                  Back Headline
                </label>
                <input
                  id="card-back-headline"
                  type="text"
                  value={backHeadline}
                  onChange={(e) => setBackHeadline(e.target.value)}
                  placeholder="Back Headline"
                  className="w-full rounded-xl bg-white px-3 py-2 text-xs text-zinc-950"
                />
              </div>
              <div>
                <label
                  htmlFor="card-back-note"
                  className="block text-[11px] font-semibold text-zinc-700 mb-1"
                >
                  Back Tagline / Services
                </label>
                <input
                  id="card-back-note"
                  type="text"
                  value={backNote}
                  onChange={(e) => setBackNote(e.target.value)}
                  placeholder="Back Tagline / Services"
                  className="w-full rounded-xl bg-white px-3 py-2 text-xs text-zinc-950"
                />
              </div>
            </div>
          )}

          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#4d7c0f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#3f6212] disabled:bg-zinc-200 disabled:text-zinc-600 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <Download aria-hidden="true" className="h-4 w-4" />
              {isExporting
                ? "Generating Card Sheet PDF..."
                : `Download ${sheet.cols * sheet.rows}-Card PDF`}
            </button>
            {statusMsg && (
              <p
                role="status"
                aria-live="polite"
                className="text-xs text-[#365314] bg-[#eef6e4] rounded-xl px-3 py-2 text-center"
              >
                {statusMsg}
              </p>
            )}
          </div>
        </div>

        {/* Live Card + Sheet Preview — flat borderless surface */}
        <div className="lg:col-span-7 rounded-2xl bg-white p-6 flex flex-col items-center justify-center gap-6">
          {/* Close-up single card preview */}
          <div className="w-full max-w-[340px]">
            <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-600 mb-2 text-center">
              Card Front Preview ({sheet.cardW} × {sheet.cardH} mm)
            </p>
            <div
              role="region"
              aria-label="Single business card front preview"
              className="relative rounded-2xl bg-[#f5f5f7] overflow-hidden p-5 flex flex-col justify-between"
              style={{ aspectRatio: `${sheet.cardW} / ${sheet.cardH}` }}
            >
              {mode === "upload" && uploadedFront ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={uploadedFront}
                  alt="Uploaded card design"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : styleId === "blank" ? (
                <div className="h-full w-full rounded-xl bg-white flex items-center justify-center text-xs text-zinc-600">
                  Blank Printable Card ({sheet.cardW} × {sheet.cardH} mm)
                </div>
              ) : (
                <>
                  {styleId === "bold-logo" && (
                    <div
                      aria-hidden="true"
                      className="absolute inset-y-0 left-0 w-2"
                      style={{ backgroundColor: accentHex }}
                    />
                  )}
                  {(styleId === "minimal" || styleId === "qr-visiting") && (
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 h-1.5"
                      style={{ backgroundColor: accentHex }}
                    />
                  )}

                  <div
                    className={`relative z-10 ${
                      styleId === "classic" ? "text-center pt-1" : "pl-1"
                    }`}
                  >
                    <p className="text-sm font-bold text-zinc-950 leading-tight">
                      {fullName}
                    </p>
                    <p
                      className="text-xs font-medium mt-0.5"
                      style={{ color: accentHex }}
                    >
                      {role}
                    </p>
                    <p className="text-[11px] text-zinc-600 mt-0.5">{company}</p>
                  </div>

                  <div
                    className={`relative z-10 text-[11px] text-zinc-800 space-y-0.5 ${
                      styleId === "classic" ? "text-center pb-1" : "pl-1"
                    }`}
                  >
                    <p>{phone}</p>
                    <p>{email}</p>
                    <p>{website}</p>
                  </div>

                  {logoDataUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoDataUrl}
                      alt="Uploaded company logo"
                      className="absolute top-3 right-3 h-8 w-8 object-contain"
                    />
                  )}
                  {includeQr && qrDataUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrDataUrl}
                      alt="Generated QR Code"
                      className="absolute bottom-3 right-3 h-11 w-11 rounded-md bg-white p-0.5"
                    />
                  )}
                </>
              )}
            </div>
          </div>

          {/* Mini sheet grid indicator */}
          <div className="flex flex-col items-center">
            <p className="text-[11px] font-mono text-zinc-600 mb-2">
              {paper.label} · {sheet.cols} × {sheet.rows} Grid
            </p>
            <div
              aria-hidden="true"
              className="rounded-xl bg-[#f5f5f7] p-2.5 grid gap-1.5"
              style={{
                width: 150,
                aspectRatio: `${paper.widthMm} / ${paper.heightMm}`,
                gridTemplateColumns: `repeat(${sheet.cols}, 1fr)`,
                gridTemplateRows: `repeat(${sheet.rows}, 1fr)`,
              }}
            >
              {Array.from({ length: sheet.cols * sheet.rows }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded bg-white flex items-center justify-center text-[8px] font-mono text-zinc-600"
                >
                  {idx + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
