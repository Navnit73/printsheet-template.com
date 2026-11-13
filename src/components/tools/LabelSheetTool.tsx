"use client";

import React, { useMemo, useState } from "react";
import { Download, ImagePlus, Scissors, Tag } from "lucide-react";
import type { PageId } from "@/types/spec";
import {
  createSamplePhotoDataUrl,
  fileToDataUrl,
  PAPER_SIZES,
  renderImageToBoxDataUrl,
  type PaperSizeId,
} from "@/lib/pdf-utils";

interface GridConfig {
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

function getInitialLabelState(pageId: PageId): GridConfig {
  switch (pageId) {
    case "T18":
      return {
        paper: "a4",
        cols: 3,
        rows: 8,
        labelW: 63.5,
        labelH: 33.9,
        marginTop: 13,
        marginLeft: 7,
        gapX: 2.5,
        gapY: 0,
      };
    case "T19":
      return {
        paper: "a4",
        cols: 3,
        rows: 5,
        labelW: 50,
        labelH: 50,
        marginTop: 15,
        marginLeft: 20,
        gapX: 10,
        gapY: 4,
        round: true,
      };
    case "T20":
      return {
        paper: "a4",
        cols: 2,
        rows: 7,
        labelW: 99.1,
        labelH: 38.1,
        marginTop: 15,
        marginLeft: 4.5,
        gapX: 2.8,
        gapY: 0,
      };
    case "T21":
      return {
        paper: "a4",
        cols: 3,
        rows: 8,
        labelW: 63.5,
        labelH: 33.9,
        marginTop: 13,
        marginLeft: 7,
        gapX: 2.5,
        gapY: 0,
      };
    case "T22":
      return {
        paper: "a4",
        cols: 3,
        rows: 4,
        labelW: 58,
        labelH: 62,
        marginTop: 14,
        marginLeft: 12,
        gapX: 6,
        gapY: 6,
      };
    case "T23":
      return {
        paper: "a4",
        cols: 2,
        rows: 5,
        labelW: 90,
        labelH: 54,
        marginTop: 13,
        marginLeft: 12,
        gapX: 6,
        gapY: 0,
      };
    case "T17":
    default:
      return {
        paper: "a4",
        cols: 2,
        rows: 5,
        labelW: 99,
        labelH: 55,
        marginTop: 11,
        marginLeft: 4.5,
        gapX: 3,
        gapY: 0,
      };
  }
}

async function generateBarcodeDataUrl(
  code: string,
  format: "CODE128" | "EAN13" | "UPC"
): Promise<string | null> {
  const { default: JsBarcode } = await import("jsbarcode");
  try {
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, code.trim() || "123456789012", {
      format,
      width: 2,
      height: 55,
      displayValue: true,
      fontSize: 13,
      margin: 6,
      background: "#ffffff",
      lineColor: "#000000",
    });
    return canvas.toDataURL("image/png");
  } catch {
    try {
      const canvas = document.createElement("canvas");
      JsBarcode(canvas, code.trim() || "SKU-001", {
        format: "CODE128",
        width: 2,
        height: 55,
        displayValue: true,
        fontSize: 13,
        margin: 6,
      });
      return canvas.toDataURL("image/png");
    } catch {
      return null;
    }
  }
}

export function LabelSheetTool({ pageId }: { pageId: PageId }) {
  const init = useMemo(() => getInitialLabelState(pageId), [pageId]);
  const [grid, setGrid] = useState<GridConfig>(init);
  const [labelTitle, setLabelTitle] = useState(
    pageId === "T18" ? "" : pageId === "T19" ? "Handmade Seal" : "Pantry Label"
  );
  const [labelSub, setLabelSub] = useState(
    pageId === "T18" ? "" : "Batch 01 · Fresh"
  );
  const [accentHex, setAccentHex] = useState("#3f6212");
  const [showBorders, setShowBorders] = useState(true);

  // Address bulk list (T20)
  const [addressBulk, setAddressBulk] = useState(
    "Jamie Chen\n42 Oakridge Ave\nPortland, OR 97209\n\nPriya Nair\n18 Harbour St\nSydney NSW 2000\n\nSamira Patel\n74 Maple Road\nToronto ON M5V 2T6"
  );
  const [returnAddress, setReturnAddress] = useState("From: Print Studio, Box 104");

  // Barcode controls (T21)
  const [barcodeFormat, setBarcodeFormat] = useState<"CODE128" | "EAN13" | "UPC">(
    "CODE128"
  );
  const [barcodeItems, setBarcodeItems] = useState(
    "SKU-1042 | Ceramic Mug | $14.00\nSKU-1043 | Linen Tote | $18.00\nSKU-1044 | Soy Candle | $22.00"
  );

  // Name tags (T23)
  const [nameList, setNameList] = useState(
    "Alex Morgan | Keynote Speaker\nJordan Lee | Design Lead\nTaylor Brooks | Workshop Host\nCasey Kim | Product Manager"
  );
  const [eventName, setEventName] = useState("HELLO, MY NAME IS");

  // Stickers (T22 / T19)
  const [stickerImages, setStickerImages] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const paper = PAPER_SIZES[grid.paper];
  const totalSlots = grid.cols * grid.rows;

  const parsedAddresses = useMemo(
    () =>
      addressBulk
        .split(/\n\s*\n/)
        .map((block) => block.trim())
        .filter(Boolean),
    [addressBulk]
  );

  const parsedBarcodes = useMemo(
    () =>
      barcodeItems
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [code = "SKU-001", name = "", price = ""] = line
            .split("|")
            .map((s) => s.trim());
          return { code, name, price };
        }),
    [barcodeItems]
  );

  const parsedNames = useMemo(
    () =>
      nameList
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [person = "", role = ""] = line.split("|").map((s) => s.trim());
          return { person, role };
        }),
    [nameList]
  );

  async function handleUploadStickers(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const loaded: string[] = [];
    for (const f of Array.from(files)) {
      loaded.push(await fileToDataUrl(f));
    }
    setStickerImages((prev) => [...prev, ...loaded]);
    setStatusMsg(`${loaded.length} artwork file(s) added.`);
    e.target.value = "";
  }

  function applyQuickPreset(preset: Partial<GridConfig>) {
    setGrid((prev) => ({ ...prev, ...preset }));
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

      const cleanHex = accentHex.replace("#", "");
      const num = parseInt(cleanHex, 16);
      const ar = Number.isNaN(num) ? 77 : (num >> 16) & 255;
      const ag = Number.isNaN(num) ? 124 : (num >> 8) & 255;
      const ab = Number.isNaN(num) ? 15 : num & 255;

      for (let r = 0; r < grid.rows; r++) {
        for (let c = 0; c < grid.cols; c++) {
          const idx = r * grid.cols + c;
          const x = grid.marginLeft + c * (grid.labelW + grid.gapX);
          const y = grid.marginTop + r * (grid.labelH + grid.gapY);

          if (showBorders) {
            doc.setDrawColor(161, 161, 170);
            doc.setLineWidth(0.25);
            if (grid.round) {
              doc.circle(x + grid.labelW / 2, y + grid.labelH / 2, grid.labelW / 2);
            } else {
              doc.rect(x, y, grid.labelW, grid.labelH);
            }
          }

          if (pageId === "T20") {
            const addr =
              parsedAddresses[idx % Math.max(1, parsedAddresses.length)] ||
              "Recipient Name\nStreet Address\nCity, Postal Code";
            doc.setTextColor(82, 82, 91);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);
            if (returnAddress.trim()) {
              doc.text(returnAddress.trim(), x + 4, y + 6);
            }
            doc.setTextColor(9, 9, 11);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            const lines = addr.split("\n");
            lines.forEach((ln, lIdx) => {
              if (lIdx > 0) doc.setFont("helvetica", "normal");
              doc.text(ln, x + 4, y + 13 + lIdx * 5);
            });
          } else if (pageId === "T21") {
            const item =
              parsedBarcodes[idx % Math.max(1, parsedBarcodes.length)] || {
                code: "SKU-1001",
                name: "Product",
                price: "",
              };
            if (item.name || item.price) {
              doc.setTextColor(9, 9, 11);
              doc.setFont("helvetica", "bold");
              doc.setFontSize(8);
              doc.text(
                [item.name, item.price].filter(Boolean).join(" · "),
                x + grid.labelW / 2,
                y + 6,
                { align: "center" }
              );
            }
            const bcUrl = await generateBarcodeDataUrl(item.code, barcodeFormat);
            if (bcUrl) {
              const bw = Math.max(20, grid.labelW - 8);
              const bh = Math.max(12, grid.labelH - 12);
              doc.addImage(bcUrl, "PNG", x + 4, y + 8.5, bw, bh);
            }
          } else if (pageId === "T23") {
            const person =
              parsedNames[idx % Math.max(1, parsedNames.length)] || {
                person: "Guest Name",
                role: "Attendee",
              };
            doc.setFillColor(ar, ag, ab);
            doc.rect(x, y, grid.labelW, 13, "F");
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.text(eventName || "HELLO, MY NAME IS", x + grid.labelW / 2, y + 8, {
              align: "center",
            });

            doc.setTextColor(9, 9, 11);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.text(person.person, x + grid.labelW / 2, y + 29, {
              align: "center",
            });
            if (person.role) {
              doc.setTextColor(82, 82, 91);
              doc.setFont("helvetica", "normal");
              doc.setFontSize(9.5);
              doc.text(person.role, x + grid.labelW / 2, y + 37, {
                align: "center",
              });
            }
          } else if ((pageId === "T22" || pageId === "T19") && stickerImages.length > 0) {
            const src = stickerImages[idx % stickerImages.length];
            const { dataUrl, format } = await renderImageToBoxDataUrl(
              src,
              grid.labelW / Math.max(1, grid.labelH),
              "contain"
            );
            doc.addImage(
              dataUrl,
              format,
              x + 2,
              y + 2,
              Math.max(5, grid.labelW - 4),
              Math.max(5, grid.labelH - 4)
            );
          } else if (labelTitle.trim() || labelSub.trim()) {
            doc.setTextColor(ar, ag, ab);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(grid.round ? 10 : 12);
            doc.text(labelTitle.trim(), x + grid.labelW / 2, y + grid.labelH / 2 - 1, {
              align: "center",
            });
            if (labelSub.trim()) {
              doc.setTextColor(82, 82, 91);
              doc.setFont("helvetica", "normal");
              doc.setFontSize(8);
              doc.text(labelSub.trim(), x + grid.labelW / 2, y + grid.labelH / 2 + 5, {
                align: "center",
              });
            }
          }
        }
      }

      doc.save(`label-sheet-${pageId.toLowerCase()}-${grid.paper}.pdf`);
      setStatusMsg(`Downloaded ${totalSlots}-label print-ready PDF.`);
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : "Could not export PDF.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="rounded-3xl bg-[#f5f5f7] p-4 sm:p-6 space-y-4">
      {/* Preset bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3.5">
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Quick label grid presets"
        >
          {pageId === "T19" ? (
            <>
              <button
                type="button"
                aria-pressed={grid.cols === 6 && grid.rows === 8 && grid.labelW === 25}
                onClick={() =>
                  applyQuickPreset({
                    cols: 6,
                    rows: 8,
                    labelW: 25,
                    labelH: 25,
                    marginTop: 16,
                    marginLeft: 14,
                    gapX: 6,
                    gapY: 6,
                    round: true,
                  })
                }
                className="rounded-xl bg-[#f5f5f7] px-3.5 py-2 text-xs font-semibold text-zinc-800 hover:bg-[#eef6e4] hover:text-[#365314] transition cursor-pointer"
              >
                25 mm (48-up)
              </button>
              <button
                type="button"
                aria-pressed={grid.cols === 4 && grid.rows === 6 && grid.labelW === 40}
                onClick={() =>
                  applyQuickPreset({
                    cols: 4,
                    rows: 6,
                    labelW: 40,
                    labelH: 40,
                    marginTop: 13,
                    marginLeft: 12,
                    gapX: 8,
                    gapY: 5,
                    round: true,
                  })
                }
                className="rounded-xl bg-[#f5f5f7] px-3.5 py-2 text-xs font-semibold text-zinc-800 hover:bg-[#eef6e4] hover:text-[#365314] transition cursor-pointer"
              >
                40 mm (24-up)
              </button>
              <button
                type="button"
                aria-pressed={grid.cols === 3 && grid.rows === 5 && grid.labelW === 50}
                onClick={() =>
                  applyQuickPreset({
                    cols: 3,
                    rows: 5,
                    labelW: 50,
                    labelH: 50,
                    marginTop: 15,
                    marginLeft: 20,
                    gapX: 10,
                    gapY: 4,
                    round: true,
                  })
                }
                className="rounded-xl bg-[#f5f5f7] px-3.5 py-2 text-xs font-semibold text-zinc-800 hover:bg-[#eef6e4] hover:text-[#365314] transition cursor-pointer"
              >
                50 mm (15-up)
              </button>
              <button
                type="button"
                aria-pressed={grid.cols === 3 && grid.rows === 4 && grid.labelW === 60}
                onClick={() =>
                  applyQuickPreset({
                    cols: 3,
                    rows: 4,
                    labelW: 60,
                    labelH: 60,
                    marginTop: 18,
                    marginLeft: 10,
                    gapX: 5,
                    gapY: 6,
                    round: true,
                  })
                }
                className="rounded-xl bg-[#f5f5f7] px-3.5 py-2 text-xs font-semibold text-zinc-800 hover:bg-[#eef6e4] hover:text-[#365314] transition cursor-pointer"
              >
                60 mm (12-up)
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                aria-pressed={grid.cols === 2 && grid.rows === 5 && grid.labelW === 99}
                onClick={() =>
                  applyQuickPreset({
                    cols: 2,
                    rows: 5,
                    labelW: 99,
                    labelH: 55,
                    marginTop: 11,
                    marginLeft: 4.5,
                    gapX: 3,
                    gapY: 0,
                    round: false,
                  })
                }
                className="rounded-xl bg-[#f5f5f7] px-3.5 py-2 text-xs font-semibold text-zinc-800 hover:bg-[#eef6e4] hover:text-[#365314] transition cursor-pointer"
              >
                2×5 (10-up)
              </button>
              <button
                type="button"
                aria-pressed={grid.cols === 2 && grid.rows === 7 && grid.labelW === 99.1}
                onClick={() =>
                  applyQuickPreset({
                    cols: 2,
                    rows: 7,
                    labelW: 99.1,
                    labelH: 38.1,
                    marginTop: 15,
                    marginLeft: 4.5,
                    gapX: 2.8,
                    gapY: 0,
                    round: false,
                  })
                }
                className="rounded-xl bg-[#f5f5f7] px-3.5 py-2 text-xs font-semibold text-zinc-800 hover:bg-[#eef6e4] hover:text-[#365314] transition cursor-pointer"
              >
                2×7 Address (14-up)
              </button>
              <button
                type="button"
                aria-pressed={grid.cols === 3 && grid.rows === 8 && grid.labelW === 63.5}
                onClick={() =>
                  applyQuickPreset({
                    cols: 3,
                    rows: 8,
                    labelW: 63.5,
                    labelH: 33.9,
                    marginTop: 13,
                    marginLeft: 7,
                    gapX: 2.5,
                    gapY: 0,
                    round: false,
                  })
                }
                className="rounded-xl bg-[#f5f5f7] px-3.5 py-2 text-xs font-semibold text-zinc-800 hover:bg-[#eef6e4] hover:text-[#365314] transition cursor-pointer"
              >
                3×8 (24-up)
              </button>
              <button
                type="button"
                aria-pressed={grid.cols === 2 && grid.rows === 4 && grid.labelW === 99.1}
                onClick={() =>
                  applyQuickPreset({
                    cols: 2,
                    rows: 4,
                    labelW: 99.1,
                    labelH: 67.7,
                    marginTop: 13,
                    marginLeft: 4.5,
                    gapX: 2.8,
                    gapY: 0,
                    round: false,
                  })
                }
                className="rounded-xl bg-[#f5f5f7] px-3.5 py-2 text-xs font-semibold text-zinc-800 hover:bg-[#eef6e4] hover:text-[#365314] transition cursor-pointer"
              >
                2×4 Shipping (8-up)
              </button>
            </>
          )}
        </div>
        <div className="text-xs font-mono text-zinc-600">
          {totalSlots} labels · {grid.labelW} × {grid.labelH} mm
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-5 rounded-2xl bg-white p-5 space-y-4">
          {pageId === "T20" ? (
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="label-return-address"
                  className="block text-xs font-semibold text-zinc-700 mb-1"
                >
                  Return Address (optional)
                </label>
                <input
                  id="label-return-address"
                  type="text"
                  value={returnAddress}
                  onChange={(e) => setReturnAddress(e.target.value)}
                  className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs text-zinc-950"
                />
              </div>
              <div>
                <label
                  htmlFor="label-recipient-addresses"
                  className="block text-xs font-semibold text-zinc-700 mb-1"
                >
                  Recipient Addresses (separate each label with a blank line)
                </label>
                <textarea
                  id="label-recipient-addresses"
                  rows={6}
                  value={addressBulk}
                  onChange={(e) => setAddressBulk(e.target.value)}
                  className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs font-mono text-zinc-950"
                />
              </div>
            </div>
          ) : pageId === "T21" ? (
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="label-barcode-format"
                  className="block text-xs font-semibold text-zinc-700 mb-1"
                >
                  Barcode Format
                </label>
                <select
                  id="label-barcode-format"
                  value={barcodeFormat}
                  onChange={(e) =>
                    setBarcodeFormat(
                      e.target.value as "CODE128" | "EAN13" | "UPC"
                    )
                  }
                  className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs text-zinc-950"
                >
                  <option value="CODE128">Code 128 (Any alphanumeric SKU)</option>
                  <option value="EAN13">EAN-13 (12–13 digits)</option>
                  <option value="UPC">UPC-A (11–12 digits)</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="label-barcode-skus"
                  className="block text-xs font-semibold text-zinc-700 mb-1"
                >
                  SKUs (Code | Product Name | Price — one per line)
                </label>
                <textarea
                  id="label-barcode-skus"
                  rows={5}
                  value={barcodeItems}
                  onChange={(e) => setBarcodeItems(e.target.value)}
                  className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs font-mono text-zinc-950"
                />
              </div>
            </div>
          ) : pageId === "T23" ? (
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="label-header-banner"
                  className="block text-xs font-semibold text-zinc-700 mb-1"
                >
                  Header Banner Text
                </label>
                <input
                  id="label-header-banner"
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs text-zinc-950"
                />
              </div>
              <div>
                <label
                  htmlFor="label-attendee-names"
                  className="block text-xs font-semibold text-zinc-700 mb-1"
                >
                  Attendee Names (Name | Role — one per line)
                </label>
                <textarea
                  id="label-attendee-names"
                  rows={5}
                  value={nameList}
                  onChange={(e) => setNameList(e.target.value)}
                  className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs text-zinc-950"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {(pageId === "T22" || pageId === "T19") && (
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#4d7c0f] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#3f6212]">
                    <ImagePlus className="h-4 w-4 text-white" aria-hidden="true" />
                    <span>Upload Sticker Art</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleUploadStickers}
                      className="sr-only"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setStickerImages([
                        createSamplePhotoDataUrl(0, "Sticker 1"),
                        createSamplePhotoDataUrl(1, "Sticker 2"),
                      ])
                    }
                    className="rounded-xl bg-[#f5f5f7] px-3.5 py-2 text-xs font-semibold text-zinc-800 hover:bg-[#ebeced] cursor-pointer"
                  >
                    Sample Stickers
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label
                    htmlFor="label-title"
                    className="block text-xs font-semibold text-zinc-700 mb-1"
                  >
                    Label Title
                  </label>
                  <input
                    id="label-title"
                    type="text"
                    value={labelTitle}
                    onChange={(e) => setLabelTitle(e.target.value)}
                    placeholder="Leave blank for empty grid"
                    className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs text-zinc-950"
                  />
                </div>
                <div>
                  <label
                    htmlFor="label-subtitle"
                    className="block text-xs font-semibold text-zinc-700 mb-1"
                  >
                    Subtitle / Note
                  </label>
                  <input
                    id="label-subtitle"
                    type="text"
                    value={labelSub}
                    onChange={(e) => setLabelSub(e.target.value)}
                    placeholder="Optional second line"
                    className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-xs text-zinc-950"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Grid fine-tuning */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div>
              <label
                htmlFor="label-grid-cols"
                className="block text-[11px] font-semibold text-zinc-600 mb-1"
              >
                Cols
              </label>
              <input
                id="label-grid-cols"
                type="number"
                min={1}
                max={8}
                value={grid.cols}
                onChange={(e) =>
                  setGrid((g) => ({ ...g, cols: Math.max(1, Number(e.target.value)) }))
                }
                className="w-full rounded-xl bg-[#f5f5f7] px-2.5 py-1.5 text-xs text-zinc-950"
              />
            </div>
            <div>
              <label
                htmlFor="label-grid-rows"
                className="block text-[11px] font-semibold text-zinc-600 mb-1"
              >
                Rows
              </label>
              <input
                id="label-grid-rows"
                type="number"
                min={1}
                max={12}
                value={grid.rows}
                onChange={(e) =>
                  setGrid((g) => ({ ...g, rows: Math.max(1, Number(e.target.value)) }))
                }
                className="w-full rounded-xl bg-[#f5f5f7] px-2.5 py-1.5 text-xs text-zinc-950"
              />
            </div>
            <div>
              <label
                htmlFor="label-grid-paper"
                className="block text-[11px] font-semibold text-zinc-600 mb-1"
              >
                Paper
              </label>
              <select
                id="label-grid-paper"
                value={grid.paper}
                onChange={(e) =>
                  setGrid((g) => ({ ...g, paper: e.target.value as PaperSizeId }))
                }
                className="w-full rounded-xl bg-[#f5f5f7] px-2.5 py-1.5 text-xs text-zinc-950"
              >
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="label-grid-width"
                className="block text-[11px] font-semibold text-zinc-600 mb-1"
              >
                Width (mm)
              </label>
              <input
                id="label-grid-width"
                type="number"
                step={0.5}
                value={grid.labelW}
                onChange={(e) =>
                  setGrid((g) => ({ ...g, labelW: Math.max(10, Number(e.target.value)) }))
                }
                className="w-full rounded-xl bg-[#f5f5f7] px-2.5 py-1.5 text-xs text-zinc-950"
              />
            </div>
            <div>
              <label
                htmlFor="label-grid-height"
                className="block text-[11px] font-semibold text-zinc-600 mb-1"
              >
                Height (mm)
              </label>
              <input
                id="label-grid-height"
                type="number"
                step={0.5}
                value={grid.labelH}
                onChange={(e) =>
                  setGrid((g) => ({ ...g, labelH: Math.max(10, Number(e.target.value)) }))
                }
                className="w-full rounded-xl bg-[#f5f5f7] px-2.5 py-1.5 text-xs text-zinc-950"
              />
            </div>
            <div>
              <label
                htmlFor="label-grid-top"
                className="block text-[11px] font-semibold text-zinc-600 mb-1"
              >
                Top (mm)
              </label>
              <input
                id="label-grid-top"
                type="number"
                step={0.5}
                value={grid.marginTop}
                onChange={(e) =>
                  setGrid((g) => ({ ...g, marginTop: Math.max(0, Number(e.target.value)) }))
                }
                className="w-full rounded-xl bg-[#f5f5f7] px-2.5 py-1.5 text-xs text-zinc-950"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 min-h-[32px] text-xs font-medium text-zinc-700 cursor-pointer">
              Accent
              <input
                type="color"
                value={accentHex}
                onChange={(e) => setAccentHex(e.target.value)}
                className="h-8 w-10 rounded-md bg-[#f5f5f7] cursor-pointer"
              />
            </label>
            <label className="inline-flex items-center gap-1.5 min-h-[32px] py-1 text-xs font-medium text-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showBorders}
                onChange={(e) => setShowBorders(e.target.checked)}
                className="accent-[#4d7c0f] h-4 w-4"
              />
              <Scissors className="h-3.5 w-3.5 text-zinc-600" aria-hidden="true" />
              Print cut outlines
            </label>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#4d7c0f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#3f6212] disabled:bg-zinc-200 disabled:text-zinc-600 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {isExporting
                ? "Generating Label PDF..."
                : `Download ${totalSlots}-Label Sheet PDF`}
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

        {/* Live sheet preview — flat borderless surface */}
        <div className="lg:col-span-7 rounded-2xl bg-white p-6 flex items-center justify-center min-h-[420px]">
          <div
            role="img"
            aria-label={`Label sheet preview showing ${totalSlots} labels (${grid.cols} columns by ${grid.rows} rows) on ${paper.label} paper`}
            className="relative bg-[#f5f5f7] rounded-xl"
            style={{
              aspectRatio: `${paper.widthMm} / ${paper.heightMm}`,
              width: "min(100%, 380px)",
            }}
          >
            {Array.from({ length: totalSlots }).map((_, idx) => {
              const r = Math.floor(idx / grid.cols);
              const c = idx % grid.cols;
              const leftPct =
                ((grid.marginLeft + c * (grid.labelW + grid.gapX)) /
                  paper.widthMm) *
                100;
              const topPct =
                ((grid.marginTop + r * (grid.labelH + grid.gapY)) /
                  paper.heightMm) *
                100;
              const widthPct = (grid.labelW / paper.widthMm) * 100;
              const heightPct = (grid.labelH / paper.heightMm) * 100;

              return (
                <div
                  key={idx}
                  className={`absolute overflow-hidden flex flex-col items-center justify-center p-1 text-center bg-white ${
                    grid.round ? "rounded-full" : "rounded-[3px]"
                  }`}
                  style={{
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    width: `${widthPct}%`,
                    height: `${heightPct}%`,
                  }}
                >
                  {pageId === "T20" ? (
                    <span className="text-[7px] leading-tight text-zinc-800 line-clamp-3">
                      {parsedAddresses[idx % Math.max(1, parsedAddresses.length)] ||
                        "Address"}
                    </span>
                  ) : pageId === "T21" ? (
                    <div className="flex flex-col items-center">
                      <Tag className="h-3 w-3 text-zinc-900" aria-hidden="true" />
                      <span className="text-[6px] font-mono text-zinc-700 truncate max-w-full">
                        {
                          (
                            parsedBarcodes[
                              idx % Math.max(1, parsedBarcodes.length)
                            ] || { code: "SKU" }
                          ).code
                        }
                      </span>
                    </div>
                  ) : pageId === "T23" ? (
                    <div className="w-full h-full flex flex-col justify-between">
                      <div
                        className="text-[5px] font-bold text-white py-0.5 truncate"
                        style={{ backgroundColor: accentHex }}
                      >
                        {eventName}
                      </div>
                      <div className="text-[8px] font-bold text-zinc-950 truncate px-0.5">
                        {
                          (
                            parsedNames[idx % Math.max(1, parsedNames.length)] || {
                              person: "Guest",
                            }
                          ).person
                        }
                      </div>
                    </div>
                  ) : stickerImages.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={stickerImages[idx % stickerImages.length]}
                      alt={`Sticker ${idx + 1}`}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span
                      className="text-[7px] font-semibold truncate max-w-full"
                      style={{ color: accentHex }}
                    >
                      {labelTitle || `#${idx + 1}`}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

