"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  Download,
  Eye,
  HelpCircle,
  Info,
  Lightbulb,
  Loader2,
  Maximize2,
  Printer,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/layout/BrandLogo";

export interface ToolStepDef {
  id: string;
  number: number;
  /** Short label shown in the left step rail & mobile tabs (e.g. "Photo", "Size"). */
  label: string;
  /** Full step title shown at the top of the controls sidebar. */
  title: string;
  /** One short plain-language sentence explaining what to do in this step. */
  hint?: React.ReactNode;
  /** Optional short badge shown next to the step title (e.g. "35×45 mm"). */
  badge?: React.ReactNode;
  /** Controls rendered for this step. */
  content: React.ReactNode;
}

export interface ToolHowToGuide {
  title: string;
  subtitle: string;
  steps: Array<{
    stepNumber: number;
    title: string;
    description: string;
  }>;
  printChecklist: string[];
  tips: string[];
}

export interface FullPageToolShellProps {
  open: boolean;
  onClose: () => void;
  toolTitle: string;
  toolSummary?: string;
  steps: ToolStepDef[];
  activeStep: number;
  onStepChange: (index: number) => void;
  /** Live preview node (kept mounted across mobile tab switches so canvas refs stay valid). */
  preview: React.ReactNode;
  /** Optional controls above the preview canvas (e.g. Zoom button, Front/Back toggle). */
  previewToolbar?: React.ReactNode;
  /** Optional caption/hints below the preview sheet. */
  previewFooter?: React.ReactNode;
  /** Optional center header widget (e.g. tool switcher on Homepage, Design/Upload toggle on cards). */
  headerCenter?: React.ReactNode;
  /** Primary Download action visible in the top header & mobile bar from any step. */
  primaryAction: {
    label: string;
    mobileLabel?: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    describedBy?: string;
  };
  /** Optional Advanced Editor button (only for tools that have an advanced canvas editor). */
  advancedAction?: {
    label: string;
    onClick: () => void;
    title?: string;
  };
  howTo: ToolHowToGuide;
  /** Short text shown on the left of the mobile sticky bottom bar. */
  mobileSummary?: React.ReactNode;
  /** Optional alert/status strip displayed in the preview area. */
  canvasNotice?: React.ReactNode;
  /** Temporarily suppress Escape closing the studio (e.g. when a native <dialog> is open). */
  disableEscapeClose?: boolean;
}

export function FullPageToolShell(props: FullPageToolShellProps) {
  if (!props.open || typeof document === "undefined") return null;
  return <FullPageToolPortal {...props} />;
}

function FullPageToolPortal({
  open,
  onClose,
  toolTitle,
  toolSummary,
  steps,
  activeStep,
  onStepChange,
  preview,
  previewToolbar,
  previewFooter,
  headerCenter,
  primaryAction,
  advancedAction,
  howTo,
  mobileSummary,
  canvasNotice,
  disableEscapeClose = false,
}: FullPageToolShellProps) {
  const [howToOpen, setHowToOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"controls" | "preview">("controls");

  // Lock background scroll while the full-page studio is open
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Close How-To drawer first on Escape; only close studio if no inner dialog/modal is active
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (disableEscapeClose) return;
      // Don't hijack Escape if a higher-z modal/dialog is open (e.g. Zoom dialog, Advanced Editor, Paywall)
      const openDialog = document.querySelector("dialog[open]");
      if (openDialog) return;
      const higherPortal = document.querySelector(
        '[data-studio-overlay="true"], [data-paywall-overlay="true"]'
      );
      if (higherPortal) return;

      if (howToOpen) {
        setHowToOpen(false);
        return;
      }
      onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, howToOpen, onClose, disableEscapeClose]);

  const safeIdx = Math.min(Math.max(0, activeStep), Math.max(0, steps.length - 1));
  const currentStep = steps[safeIdx];
  const isFirst = safeIdx === 0;
  const isLast = safeIdx === steps.length - 1;
  const nextStep = !isLast ? steps[safeIdx + 1] : null;
  const prevStep = !isFirst ? steps[safeIdx - 1] : null;

  const howToBody = (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4d7c0f]">
          Step-by-step guide
        </p>
        <h3 className="mt-1 text-base font-extrabold tracking-tight text-zinc-950">
          {howTo.title}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-zinc-600">
          {howTo.subtitle}
        </p>
      </div>

      <ol className="space-y-2.5">
        {howTo.steps.map((s) => {
          const matchingIdx = steps.findIndex((st) => st.number === s.stepNumber);
          const isCurrent = matchingIdx === safeIdx;
          return (
            <li
              key={s.stepNumber}
              className={`rounded-2xl p-3.5 transition ${
                isCurrent
                  ? "bg-[#eef6e4] ring-1 ring-[#4d7c0f]/35"
                  : "bg-[#f5f5f7]"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span
                  aria-hidden="true"
                  className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    isCurrent
                      ? "bg-[#4d7c0f] text-white"
                      : "bg-white text-zinc-800"
                  }`}
                >
                  {s.stepNumber}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-zinc-950">{s.title}</p>
                    {matchingIdx >= 0 && !isCurrent && (
                      <button
                        type="button"
                        onClick={() => {
                          onStepChange(matchingIdx);
                          setMobileView("controls");
                          if (typeof window !== "undefined" && window.innerWidth < 1024) {
                            setHowToOpen(false);
                          }
                        }}
                        className="shrink-0 text-[11px] font-bold text-[#3f6212] hover:underline cursor-pointer"
                      >
                        Go →
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                    {s.description}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="rounded-2xl bg-[#eef6e4] p-3.5 space-y-2">
        <p className="flex items-center gap-1.5 text-xs font-bold text-[#365314]">
          <Printer aria-hidden="true" className="h-3.5 w-3.5 text-[#4d7c0f]" />
          Print at 100% Actual Size
        </p>
        <ul className="space-y-1.5 text-xs text-zinc-700">
          {howTo.printChecklist.map((item, i) => (
            <li key={i} className="flex items-start gap-2 leading-relaxed">
              <CheckCircle2
                aria-hidden="true"
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4d7c0f]"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {howTo.tips.length > 0 && (
        <div className="rounded-2xl bg-[#f5f5f7] p-3.5 space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-bold text-zinc-950">
            <Lightbulb aria-hidden="true" className="h-3.5 w-3.5 text-amber-600" />
            Helpful tips
          </p>
          <ul className="space-y-1.5 text-xs text-zinc-600">
            {howTo.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 leading-relaxed">
                <Info
                  aria-hidden="true"
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-500"
                />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#f5f5f7] text-zinc-950"
      role="dialog"
      aria-modal="true"
      aria-label={`${toolTitle} — Full-page Studio`}
    >
      {/* ==================== TOP STUDIO HEADER ==================== */}
      <header className="shrink-0 border-b border-zinc-200 bg-white px-3 py-2 sm:px-4">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: Back to page + Brand + Tool Title */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-xl bg-[#f5f5f7] px-2.5 sm:px-3 text-xs font-bold text-zinc-900 hover:bg-[#ebeced] transition cursor-pointer"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4 text-[#4d7c0f]" />
              <span className="hidden sm:inline">Back to page</span>
              <span className="sm:hidden">Back</span>
            </button>

            <div className="hidden sm:block h-5 w-px bg-zinc-200 shrink-0" />

            <div className="flex min-w-0 items-center gap-2">
              <BrandMark className="hidden sm:block h-7 w-7 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-xs sm:text-sm font-extrabold tracking-tight text-zinc-950">
                    {toolTitle}
                  </h2>
                  {toolSummary && (
                    <span className="hidden xl:inline-flex items-center rounded-full bg-[#eef6e4] px-2.5 py-0.5 text-[11px] font-semibold text-[#365314] whitespace-nowrap">
                      {toolSummary}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Center slot (optional: e.g. mode toggle or tool switcher) */}
          {headerCenter && (
            <div className="hidden md:flex items-center justify-center shrink-0">
              {headerCenter}
            </div>
          )}

          {/* Right: How to use, Optional Advanced Editor, Primary Download, Close */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              aria-expanded={howToOpen}
              onClick={() => setHowToOpen((v) => !v)}
              className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-xl px-2.5 sm:px-3 text-xs font-bold transition cursor-pointer ${
                howToOpen
                  ? "bg-[#4d7c0f] text-white"
                  : "bg-[#f5f5f7] text-zinc-800 hover:bg-[#ebeced]"
              }`}
            >
              <HelpCircle aria-hidden="true" className="h-4 w-4" />
              <span className="hidden sm:inline">How to use</span>
            </button>

            {advancedAction && (
              <button
                type="button"
                title={advancedAction.title ?? "Open drag-and-drop Advanced Layer Editor"}
                onClick={advancedAction.onClick}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-[#eef6e4] px-2.5 sm:px-3 text-xs font-bold text-[#365314] ring-1 ring-[#4d7c0f]/30 hover:bg-[#e2efd3] transition cursor-pointer"
              >
                <Maximize2 aria-hidden="true" className="h-3.5 w-3.5 text-[#4d7c0f]" />
                <span className="hidden md:inline">{advancedAction.label}</span>
                <span className="md:hidden">Advanced</span>
              </button>
            )}

            <button
              type="button"
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled || primaryAction.loading}
              aria-describedby={primaryAction.describedBy}
              className="hidden sm:inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 text-xs font-bold text-zinc-950 hover:bg-amber-600 transition cursor-pointer disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
            >
              {primaryAction.loading ? (
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
              ) : (
                <Download aria-hidden="true" className="h-4 w-4" />
              )}
              <span>{primaryAction.label}</span>
            </button>

            <button
              type="button"
              title="Exit studio"
              aria-label="Close studio"
              onClick={onClose}
              className="hidden sm:grid h-9 w-9 place-items-center rounded-xl bg-[#f5f5f7] text-zinc-600 hover:bg-[#ebeced] hover:text-zinc-950 transition cursor-pointer"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Optional header center strip on small screens */}
        {headerCenter && (
          <div className="mt-2 flex md:hidden items-center justify-center border-t border-zinc-100 pt-2">
            {headerCenter}
          </div>
        )}
      </header>

      {/* ==================== MOBILE STEP & VIEW BAR (< lg) ==================== */}
      <div className="lg:hidden shrink-0 border-b border-zinc-200 bg-white px-3 py-2 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div
            role="tablist"
            aria-label="Tool steps"
            className="flex flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {steps.map((st, idx) => {
              const active = idx === safeIdx && mobileView === "controls";
              return (
                <button
                  key={st.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    onStepChange(idx);
                    setMobileView("controls");
                  }}
                  className={`shrink-0 inline-flex min-h-[34px] items-center gap-1.5 rounded-xl px-2.5 text-xs font-bold transition cursor-pointer ${
                    active
                      ? "bg-[#4d7c0f] text-white"
                      : "bg-[#f5f5f7] text-zinc-700 hover:bg-[#ebeced]"
                  }`}
                >
                  <span
                    className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                      active ? "bg-white text-[#365314]" : "bg-white text-zinc-800"
                    }`}
                  >
                    {st.number}
                  </span>
                  <span>{st.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() =>
              setMobileView((v) => (v === "preview" ? "controls" : "preview"))
            }
            className={`shrink-0 inline-flex min-h-[34px] items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition cursor-pointer ${
              mobileView === "preview"
                ? "bg-zinc-950 text-white"
                : "bg-[#eef6e4] text-[#365314]"
            }`}
          >
            {mobileView === "preview" ? (
              <>
                <SlidersHorizontal aria-hidden="true" className="h-3.5 w-3.5" />
                <span>Edit</span>
              </>
            ) : (
              <>
                <Eye aria-hidden="true" className="h-3.5 w-3.5" />
                <span>Preview</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ==================== MAIN STUDIO WORKSPACE ==================== */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* 1. LEFT STEP RAIL (Desktop lg+) */}
        <nav
          aria-label="Tool workflow steps"
          className="hidden lg:flex w-[86px] shrink-0 flex-col justify-between border-r border-zinc-200 bg-white px-2 py-3"
        >
          <div className="space-y-1.5">
            {steps.map((st, idx) => {
              const active = idx === safeIdx;
              const visited = idx < safeIdx;
              return (
                <button
                  key={st.id}
                  type="button"
                  aria-current={active ? "step" : undefined}
                  onClick={() => onStepChange(idx)}
                  className={`flex w-full flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-2.5 text-center transition cursor-pointer ${
                    active
                      ? "bg-[#eef6e4] text-[#365314] ring-1 ring-[#4d7c0f]/35"
                      : "text-zinc-600 hover:bg-[#f5f5f7] hover:text-zinc-950"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold transition ${
                      active
                        ? "bg-[#4d7c0f] text-white"
                        : visited
                          ? "bg-[#eef6e4] text-[#365314]"
                          : "bg-[#f5f5f7] text-zinc-700"
                    }`}
                  >
                    {visited ? <Check className="h-3.5 w-3.5 stroke-[2.5]" /> : st.number}
                  </span>
                  <span className="text-[11px] font-bold leading-tight">
                    {st.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-1.5 border-t border-zinc-100 pt-3">
            <button
              type="button"
              onClick={() => setHowToOpen((v) => !v)}
              className={`flex w-full flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-2.5 text-center transition cursor-pointer ${
                howToOpen
                  ? "bg-[#eef6e4] text-[#365314]"
                  : "text-zinc-600 hover:bg-[#f5f5f7] hover:text-zinc-950"
              }`}
            >
              <HelpCircle aria-hidden="true" className="h-4 w-4 text-[#4d7c0f]" />
              <span className="text-[10px] font-bold leading-tight">How to use</span>
            </button>

            {advancedAction && (
              <button
                type="button"
                onClick={advancedAction.onClick}
                className="flex w-full flex-col items-center justify-center gap-1 rounded-2xl bg-[#f7fbf1] px-1.5 py-2.5 text-center text-[#365314] hover:bg-[#eef6e4] transition cursor-pointer"
              >
                <Sparkles aria-hidden="true" className="h-4 w-4 text-[#4d7c0f]" />
                <span className="text-[10px] font-bold leading-tight">Advanced</span>
              </button>
            )}
          </div>
        </nav>

        {/* 2. ACTIVE STEP SIDEBAR CONTROLS */}
        <aside
          aria-label={`Step ${currentStep.number}: ${currentStep.title}`}
          className={`min-h-0 flex-col border-r border-zinc-200 bg-white lg:flex lg:w-[380px] xl:w-[420px] shrink-0 ${
            mobileView === "controls" ? "flex w-full" : "hidden"
          }`}
        >
          {/* Step header */}
          <div className="shrink-0 border-b border-zinc-100 px-4 py-3.5 sm:px-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  aria-hidden="true"
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-[11px] font-bold text-white"
                >
                  {currentStep.number}
                </span>
                <h3 className="truncate text-sm font-extrabold tracking-tight text-zinc-950">
                  {currentStep.title}
                </h3>
              </div>
              {currentStep.badge && (
                <div className="shrink-0">{currentStep.badge}</div>
              )}
            </div>
            {currentStep.hint && (
              <p className="mt-1.5 pl-[34px] text-xs leading-relaxed text-zinc-600">
                {currentStep.hint}
              </p>
            )}
          </div>

          {/* Scrollable step controls */}
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5 space-y-5">
            {currentStep.content}
          </div>

          {/* Clean Previous / Next step bar */}
          <div className="shrink-0 border-t border-[#ebeced] bg-[#fafafa] px-4 py-3 sm:px-5 flex items-center justify-between gap-2">
            {prevStep ? (
              <button
                type="button"
                onClick={() => onStepChange(safeIdx - 1)}
                className="inline-flex min-h-[38px] items-center gap-1 rounded-xl bg-white px-3 text-xs font-bold text-zinc-700 ring-1 ring-zinc-200 hover:bg-[#f5f5f7] transition cursor-pointer"
              >
                <ChevronLeft aria-hidden="true" className="h-4 w-4" />
                <span>{prevStep.label}</span>
              </button>
            ) : (
              <span className="text-[11px] font-semibold text-zinc-500">
                Step {currentStep.number} of {steps.length}
              </span>
            )}

            {nextStep ? (
              <button
                type="button"
                onClick={() => onStepChange(safeIdx + 1)}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-[#4d7c0f] px-4 text-xs font-bold text-white hover:bg-[#3f6212] transition cursor-pointer"
              >
                <span>Next: {nextStep.label}</span>
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onStepChange(0)}
                className="inline-flex min-h-[38px] items-center gap-1 rounded-xl bg-white px-3 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200 hover:bg-[#f5f5f7] transition cursor-pointer"
              >
                Back to Step 1
              </button>
            )}
          </div>
        </aside>

        {/* 3. CENTER LIVE SHEET PREVIEW CANVAS (never unmounted so canvas refs work) */}
        <main
          aria-label="Live sheet preview"
          className={`min-w-0 min-h-0 flex-1 flex-col overflow-hidden bg-[#f5f5f7] lg:flex ${
            mobileView === "preview" ? "flex w-full" : "hidden"
          }`}
        >
          {/* Preview top bar */}
          <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200/80 bg-white/85 px-4 py-2 backdrop-blur-xs">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-zinc-950">Live Sheet Preview</span>
              {toolSummary && (
                <span className="text-zinc-600 hidden sm:inline">· {toolSummary}</span>
              )}
            </div>
            {previewToolbar && (
              <div className="flex flex-wrap items-center gap-2">
                {previewToolbar}
              </div>
            )}
          </div>

          {canvasNotice && (
            <div className="shrink-0 px-4 pt-3">{canvasNotice}</div>
          )}

          {/* Centered cutting mat canvas */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center gap-4">
            <div className="my-auto w-full max-w-2xl flex flex-col items-center justify-center gap-3">
              {preview}
              {previewFooter && (
                <div className="w-full max-w-xl text-center">{previewFooter}</div>
              )}
            </div>
          </div>
        </main>

        {/* 4. RIGHT "HOW TO USE" SIDEBAR (Desktop lg+) */}
        {howToOpen && (
          <aside
            aria-label="How to use this tool"
            className="hidden lg:flex min-h-0 w-[310px] xl:w-[330px] shrink-0 flex-col border-l border-zinc-200 bg-white"
          >
            <div className="shrink-0 flex items-center justify-between gap-2 border-b border-zinc-100 px-4 py-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-zinc-950">
                <HelpCircle aria-hidden="true" className="h-4 w-4 text-[#4d7c0f]" />
                How to use
              </span>
              <button
                type="button"
                aria-label="Close how to use guide"
                onClick={() => setHowToOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-lg bg-[#f5f5f7] text-zinc-600 hover:bg-[#ebeced] hover:text-zinc-950 cursor-pointer"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{howToBody}</div>
          </aside>
        )}

        {/* Mobile/Tablet How-To Sheet Drawer */}
        {howToOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30 flex items-end sm:items-center justify-center bg-zinc-950/50 backdrop-blur-xs p-0 sm:p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setHowToOpen(false);
            }}
          >
            <div className="w-full sm:max-w-md max-h-[85vh] flex flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl">
              <div className="shrink-0 flex items-center justify-between gap-2 border-b border-zinc-100 px-5 py-3.5">
                <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-zinc-950">
                  <HelpCircle aria-hidden="true" className="h-4 w-4 text-[#4d7c0f]" />
                  How to use
                </span>
                <button
                  type="button"
                  aria-label="Close how to use guide"
                  onClick={() => setHowToOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-xl bg-[#f5f5f7] text-zinc-600 hover:bg-[#ebeced] cursor-pointer"
                >
                  <X aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">{howToBody}</div>
            </div>
          </div>
        )}
      </div>

      {/* ==================== MOBILE STICKY ACTION BAR (< sm) ==================== */}
      <div className="sm:hidden shrink-0 border-t border-zinc-200 bg-white px-3 py-2.5 flex items-center justify-between gap-2.5">
        <div className="min-w-0 text-xs font-medium text-zinc-700 truncate">
          {mobileSummary || toolSummary || toolTitle}
        </div>
        <button
          type="button"
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled || primaryAction.loading}
          aria-describedby={primaryAction.describedBy}
          className="shrink-0 min-h-[42px] inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 text-xs font-bold text-zinc-950 hover:bg-amber-600 transition cursor-pointer disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
        >
          {primaryAction.loading ? (
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <Download aria-hidden="true" className="h-4 w-4" />
          )}
          <span>{primaryAction.mobileLabel || primaryAction.label}</span>
        </button>
      </div>
    </div>,
    document.body
  );
}
