"use client";

/**
 * Shared building blocks so every print tool looks and behaves the same:
 * numbered steps, upload drop zone, status messages, print-at-actual-size help,
 * and a mobile action bar that keeps the main button reachable.
 */

import React, { useId, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Info,
  Printer,
  Upload,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Step header                                                         */
/* ------------------------------------------------------------------ */

export function StepHeader({
  step,
  title,
  hint,
  aside,
  id,
}: {
  step: number;
  title: string;
  /** One short plain-language sentence explaining the step. */
  hint?: React.ReactNode;
  /** Optional element on the right (badge, toggle, …). */
  aside?: React.ReactNode;
  id?: string;
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between gap-3">
        <h3
          id={id}
          className="flex items-center gap-2.5 text-sm font-bold tracking-tight text-zinc-950"
        >
          <span
            aria-hidden="true"
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-[11px] font-bold text-white"
          >
            {step}
          </span>
          <span>
            <span className="sr-only">Step {step}: </span>
            {title}
          </span>
        </h3>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>
      {hint && (
        <p className="mt-1.5 pl-[34px] text-xs leading-relaxed text-zinc-600">
          {hint}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Status message                                                      */
/* ------------------------------------------------------------------ */

export type ToolStatusTone = "success" | "error" | "info" | "warning";
export interface ToolStatusValue {
  tone: ToolStatusTone;
  text: React.ReactNode;
}

const STATUS_STYLES: Record<ToolStatusTone, { box: string; icon: React.ReactNode }> = {
  success: {
    box: "bg-[#eef6e4] text-[#365314]",
    icon: <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0 text-[#4d7c0f]" />,
  },
  error: {
    box: "bg-red-50 text-red-800",
    icon: <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0 text-red-600" />,
  },
  warning: {
    box: "bg-amber-50 text-amber-900",
    icon: <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0 text-amber-600" />,
  },
  info: {
    box: "bg-[#f5f5f7] text-zinc-800",
    icon: <Info aria-hidden="true" className="h-4 w-4 shrink-0 text-zinc-500" />,
  },
};

/**
 * Always-mounted live region (so screen readers announce the first message too).
 * Errors use role=alert semantics via aria-live="assertive".
 */
export function ToolStatus({ status }: { status: ToolStatusValue | null }) {
  const tone = status?.tone ?? "info";
  return (
    <div
      role="status"
      aria-live={tone === "error" ? "assertive" : "polite"}
      aria-atomic="true"
    >
      {status && (
        <div
          className={`flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-xs font-medium leading-relaxed ${STATUS_STYLES[tone].box}`}
        >
          {STATUS_STYLES[tone].icon}
          <div className="min-w-0">{status.text}</div>
        </div>
      )}
    </div>
  );
}

/** Small grey helper line, e.g. why a button is disabled. */
export function FieldHint({
  children,
  tone = "muted",
  id,
}: {
  children: React.ReactNode;
  tone?: "muted" | "error" | "warning";
  id?: string;
}) {
  const cls =
    tone === "error"
      ? "text-red-700"
      : tone === "warning"
        ? "text-amber-800"
        : "text-zinc-600";
  return (
    <p id={id} className={`text-xs leading-relaxed ${cls}`}>
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Upload drop zone                                                    */
/* ------------------------------------------------------------------ */

export function UploadDropzone({
  onFiles,
  accept = "image/jpeg,image/png,image/webp",
  multiple = false,
  title,
  hint = "JPG, PNG or WebP · stays on your device",
  buttonLabel = "Choose photo",
  secondaryAction,
  compact = false,
  inputLabel,
}: {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  title: string;
  hint?: React.ReactNode;
  buttonLabel?: string;
  /** e.g. a "Try sample" button */
  secondaryAction?: React.ReactNode;
  /** Single-row layout for when a file is already loaded. */
  compact?: boolean;
  inputLabel?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const hintId = useId();

  const handleFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    onFiles(multiple ? Array.from(list) : [list[0]]);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!dragging) setDragging(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`rounded-2xl border-2 border-dashed transition-colors ${
        dragging
          ? "border-[#4d7c0f] bg-[#eef6e4]"
          : "border-zinc-200 bg-[#fafafa] hover:border-zinc-300"
      } ${compact ? "px-4 py-3" : "px-5 py-6 sm:py-8"}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        aria-label={inputLabel ?? title}
        aria-describedby={hintId}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div
        className={
          compact
            ? "flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            : "flex flex-col items-center text-center gap-3"
        }
      >
        <div className={compact ? "flex items-center gap-3 min-w-0" : "flex flex-col items-center gap-2"}>
          <span
            aria-hidden="true"
            className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-white text-[#3f6212] ${
              compact ? "h-9 w-9" : "h-11 w-11"
            }`}
          >
            <Upload className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-zinc-950">
              {title}
              <span className="hidden sm:inline font-medium text-zinc-500">
                {" "}
                — or drag &amp; drop here
              </span>
            </p>
            <p id={hintId} className="mt-0.5 text-xs text-zinc-600">
              {hint}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="min-h-[42px] inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-zinc-950 hover:bg-amber-600 transition cursor-pointer"
          >
            <Upload aria-hidden="true" className="h-4 w-4" />
            {buttonLabel}
          </button>
          {secondaryAction}
        </div>
      </div>
    </div>
  );
}

/** Standard secondary button style (e.g. "Try sample"). */
export const secondaryButtonClass =
  "min-h-[42px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#f5f5f7] px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-[#ebeced] transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";

/** Standard primary (download) button style. */
export const primaryButtonClass =
  "min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-zinc-950 hover:bg-amber-600 transition cursor-pointer disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500";

/* ------------------------------------------------------------------ */
/* Print-at-actual-size help                                           */
/* ------------------------------------------------------------------ */

export function PrintTipsPanel({
  paperLabel,
  open,
  extraSteps = [],
  cutStep = "Cut along the corner marks with a ruler and craft knife or paper trimmer.",
}: {
  /** e.g. "A4", "4 × 6 in" */
  paperLabel: string;
  /** Open by default (e.g. right after a download). */
  open?: boolean;
  /** Tool-specific extra steps inserted before the cutting step. */
  extraSteps?: React.ReactNode[];
  cutStep?: React.ReactNode;
}) {
  const steps: React.ReactNode[] = [
    <>Open the downloaded file and choose <strong>Print</strong>.</>,
    <>
      Set paper size to <strong>{paperLabel}</strong>.
    </>,
    <>
      Set scale to <strong>100%</strong> / <strong>Actual size</strong> — turn
      off &ldquo;Fit to page&rdquo; or &ldquo;Shrink to fit&rdquo;.
    </>,
    ...extraSteps,
    cutStep,
  ];

  return (
    <details
      // key forces re-mount so `open` re-applies when a download happens
      key={open ? "open" : "closed"}
      open={open}
      className="group rounded-xl bg-[#f5f5f7] px-4 py-3 text-xs text-zinc-700"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-bold text-zinc-950 [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <Printer aria-hidden="true" className="h-4 w-4 text-[#3f6212]" />
          How to print at the exact size
        </span>
        <ChevronDown
          aria-hidden="true"
          className="h-4 w-4 text-zinc-500 transition group-open:rotate-180"
        />
      </summary>
      <ol className="mt-3 space-y-2 pl-1">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-2.5 leading-relaxed">
            <span
              aria-hidden="true"
              className="mt-px inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-zinc-700"
            >
              {i + 1}
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-[11px] text-zinc-600">
        Tip: print one test page on plain paper first and check a size with a
        ruler.
      </p>
    </details>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile sticky action bar                                            */
/* ------------------------------------------------------------------ */

/**
 * On phones the main button sits far below the preview. This bar pins it to the
 * bottom of the screen (hidden on lg+ where the layout is side-by-side).
 * Render it once per tool, after the main layout.
 */
export function MobileActionBar({
  children,
  summary,
}: {
  children: React.ReactNode;
  /** Short text shown left of the button, e.g. "6 photos · A4". */
  summary?: React.ReactNode;
}) {
  return (
    <div className="lg:hidden sticky bottom-0 z-30 -mx-2 sm:-mx-5 mt-2 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur no-print">
      <div className="flex items-center justify-between gap-3">
        {summary && (
          <div className="min-w-0 text-xs font-medium text-zinc-700 truncate">
            {summary}
          </div>
        )}
        <div className="flex shrink-0 items-center gap-2">{children}</div>
      </div>
    </div>
  );
}
