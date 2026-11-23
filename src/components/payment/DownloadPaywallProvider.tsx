"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  Check,
  CheckCircle2,
  Clock,
  Download,
  Globe,
  Lock,
  ShieldCheck,
  X,
} from "lucide-react";
import { PaymentButton } from "@/components/payment/PaymentButton";
import {
  DEFAULT_PRICING,
  PASS_STORAGE_KEY,
  detectCountryPricingAsync,
  detectPricingFromBrowser,
  readPaidPass,
  savePaidPass,
} from "@/lib/payment";
import type { PaidPass, PaymentState, RegionPricing } from "@/types/payment";

export interface DownloadGateRequest {
  /** Short title of what the user is downloading, e.g. "Business Card Sheet PDF". */
  itemTitle: string;
  /** Optional subtitle/specs, e.g. "10 cards · A4 · 90 × 55 mm". */
  itemSummary?: string;
  /** Callback executed immediately if already unlocked, or right after PayPal capture. */
  onApproved: () => void | Promise<void>;
}

interface DownloadGateContextValue {
  /** Gate any download/export action behind the 24-hour Pay-to-Download pass. */
  requirePayment: (request: DownloadGateRequest) => void;
  /** Whether the user currently holds a valid 24-hour pass. */
  isUnlocked: boolean;
  /** Active 24-hour pass details, if unlocked. */
  paidPass: PaidPass | null;
  /** Auto-detected regional pricing (US $3.99, UK £2.99, EU €2.99, Default $3.99). */
  pricing: RegionPricing;
}

const DownloadGateContext = createContext<DownloadGateContextValue | null>(null);

export function useDownloadGate(): DownloadGateContextValue {
  const ctx = useContext(DownloadGateContext);
  if (!ctx) {
    return {
      requirePayment: (req) => {
        void Promise.resolve(req.onApproved());
      },
      isUnlocked: false,
      paidPass: null,
      pricing: DEFAULT_PRICING,
    };
  }
  return ctx;
}

export function DownloadPassBadge({ className = "" }: { className?: string }) {
  const { paidPass } = useDownloadGate();
  if (!paidPass) return null;

  const until = new Date(paidPass.expiresAt).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#c7e0a8] bg-[#eef6e4] px-3 py-2 text-xs text-[#365314] ${className}`}
    >
      <span className="inline-flex items-center gap-1.5 font-bold">
        <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[#4d7c0f]" />
        24h Download Pass active
      </span>
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#3f6212]">
        <Clock aria-hidden="true" className="h-3 w-3 shrink-0" />
        Free re-downloads until {until}
      </span>
    </div>
  );
}

const BENEFITS = [
  "Instant 300 DPI print-ready PDF, PNG, JPEG & SVG — no watermarks",
  "24-hour all-access pass — edit & re-download across every tool for free",
  "Download begins automatically the moment checkout completes",
  "Pay securely with Debit/Credit Card or PayPal (no account needed)",
];

export function DownloadPaywallProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [paidPass, setPaidPass] = useState<PaidPass | null>(null);
  const [pricing, setPricing] = useState<RegionPricing>(DEFAULT_PRICING);
  const [pricingReady, setPricingReady] = useState(false);
  const [pending, setPending] = useState<DownloadGateRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate existing 24-hour pass and resolve regional country pricing after mount.
  useEffect(() => {
    let active = true;
    const hydrateTimer = window.setTimeout(() => {
      if (!active) return;
      const existing = readPaidPass();
      if (existing) setPaidPass(existing);
      setPricing(detectPricingFromBrowser());
    }, 0);

    void detectCountryPricingAsync().then((resolved) => {
      if (!active) return;
      setPricing(resolved);
      setPricingReady(true);
    });

    const onStorage = (e: StorageEvent) => {
      if (e.key === PASS_STORAGE_KEY || e.key === null) {
        setPaidPass(readPaidPass());
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      active = false;
      window.clearTimeout(hydrateTimer);
      window.removeEventListener("storage", onStorage);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  // Close popup on Escape key and lock background scroll while open.
  useEffect(() => {
    if (!pending) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isProcessing) {
        setPending(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [pending, isProcessing]);

  // Automatically clear the 24-hour pass from state when it expires.
  useEffect(() => {
    if (!paidPass) return;
    const msLeft = Math.max(0, paidPass.expiresAt - Date.now());
    const timer = window.setTimeout(() => {
      setPaidPass(readPaidPass());
    }, msLeft + 250);
    return () => window.clearTimeout(timer);
  }, [paidPass]);

  function requirePayment(request: DownloadGateRequest) {
    const livePass = readPaidPass();
    if (livePass) {
      if (!paidPass || paidPass.orderID !== livePass.orderID) {
        setPaidPass(livePass);
      }
      void Promise.resolve(request.onApproved());
      return;
    }

    if (paidPass) {
      setPaidPass(null);
    }
    setPending(request);
  }

  function handlePaymentSuccess(payment: PaymentState) {
    const pass = savePaidPass(payment, pricing);
    setPaidPass(pass);

    const action = pending?.onApproved;
    const title = pending?.itemTitle;
    setPending(null);
    setIsProcessing(false);

    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    setSuccessToast(
      title
        ? `Unlocked! Downloading ${title}… (24h pass active)`
        : "Payment confirmed! Starting your download… (24h pass active)"
    );
    successTimerRef.current = setTimeout(() => setSuccessToast(null), 6500);

    if (action) {
      // Trigger the original download right away now that the pass is saved.
      window.setTimeout(() => {
        void Promise.resolve(action());
      }, 60);
    }
  }

  const isUnlocked = Boolean(paidPass);

  const contextValue: DownloadGateContextValue = {
    requirePayment,
    isUnlocked,
    paidPass,
    pricing,
  };

  return (
    <DownloadGateContext.Provider value={contextValue}>
      {children}

      {/* Global confirmation toast after modal closes & download triggers */}
      {successToast &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed bottom-4 right-4 z-[100] max-w-sm">
            <div
              role="status"
              className="flex items-center gap-2.5 rounded-2xl border border-[#c7e0a8] bg-[#eef6e4] px-4 py-3 text-xs font-semibold text-[#365314] shadow-xl"
            >
              <CheckCircle2
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-[#4d7c0f]"
              />
              <span>{successToast}</span>
            </div>
          </div>,
          document.body
        )}

      {/* Pay-to-Download Modal Popup (z-[80]: floats cleanly over pages AND z-[70] editor export modals) */}
      {pending &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-zinc-950/65 p-3 sm:p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="paywall-modal-title"
            onClick={(e) => {
              if (e.target === e.currentTarget && !isProcessing) {
                setPending(null);
              }
            }}
          >
            <div className="flex max-h-[94vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-zinc-200">
              {/* Top header */}
              <div className="flex items-start justify-between gap-3 border-b border-[#dbe9c6] bg-[#f7fbf1] px-5 py-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#4d7c0f] text-white shadow-xs">
                    <Download aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <div>
                    <h2
                      id="paywall-modal-title"
                      className="text-base font-bold tracking-tight text-zinc-950"
                    >
                      Download your print-ready file
                    </h2>
                    <p className="mt-0.5 text-xs text-zinc-600">
                      One-time 24-hour pass · unlock all tools &amp; re-downloads
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close payment popup"
                  disabled={isProcessing}
                  onClick={() => setPending(null)}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50 hover:text-zinc-950 disabled:opacity-40 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="overflow-y-auto px-5 py-4 space-y-4">
                {/* Price + detected region */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-zinc-950">
                      {pricing.priceLabel}
                    </span>
                    <span className="text-xs font-medium text-zinc-500">
                      one-time · no subscription
                    </span>
                  </div>
                  <span
                    className="inline-flex items-center gap-1 rounded-full bg-[#f5f5f7] px-2.5 py-1 text-[11px] font-semibold text-zinc-700 ring-1 ring-zinc-200/80"
                    title="Currency detected automatically for your region"
                  >
                    <Globe aria-hidden="true" className="h-3 w-3 text-[#4d7c0f]" />
                    {pricing.region === "INTL"
                      ? pricing.currency
                      : `${pricing.region} · ${pricing.currency}`}
                  </span>
                </div>

                {/* Queued file summary */}
                <div className="rounded-2xl border border-zinc-200/90 bg-[#f5f5f7] px-3.5 py-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                    Ready to download
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-zinc-950">
                    {pending.itemTitle}
                  </p>
                  {pending.itemSummary && (
                    <p className="mt-0.5 text-xs text-zinc-600">
                      {pending.itemSummary}
                    </p>
                  )}
                </div>

                {/* Benefits checklist (modeled on deedpool.uk) */}
                <ul className="space-y-1.5 text-xs text-zinc-800">
                  {BENEFITS.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2">
                      <Check
                        aria-hidden="true"
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4d7c0f] stroke-[3]"
                      />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                {/* 100% Satisfaction & Refund Guarantee (modeled on deedpool.uk) */}
                <div
                  className="flex items-start gap-3 rounded-2xl border border-[#4d7c0f]/35 bg-[#eef6e4] p-3"
                  role="note"
                >
                  <ShieldCheck
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 shrink-0 text-[#3f6212]"
                  />
                  <div className="text-xs leading-relaxed text-zinc-900">
                    <strong className="block text-[13px] font-bold text-[#365314]">
                      100% Satisfaction &amp; Refund Guarantee
                    </strong>
                    If your file has any layout issue or doesn&apos;t print as
                    previewed, we&apos;ll fix it or refund you in full.
                  </div>
                </div>

                {/* PayPal Checkout */}
                <div className="pt-0.5">
                  {pricingReady ? (
                    <PaymentButton
                      amount={pricing.amount}
                      currency={pricing.currency}
                      description={`Print Sheet Maker — ${pending.itemTitle} (24h Pass)`}
                      onSuccess={handlePaymentSuccess}
                      onProcessingChange={setIsProcessing}
                    />
                  ) : (
                    <div className="space-y-2 py-2" aria-live="polite">
                      <div className="h-11 w-full animate-pulse rounded-xl bg-zinc-100" />
                      <div className="h-11 w-full animate-pulse rounded-xl bg-zinc-100" />
                      <p className="text-center text-[11px] text-zinc-500">
                        Preparing checkout 
                      </p>
                    </div>
                  )}
                </div>

                {/* Security & policy details */}
                <div className="space-y-2 border-t border-zinc-100 pt-3">
                  <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-zinc-500">
                    <Lock aria-hidden="true" className="h-3 w-3 text-[#4d7c0f]" />
                    Encrypted PayPal checkout · Your designs stay private on your device
                  </p>

                  <details className="rounded-xl bg-[#fafafa] px-3 py-2 text-xs text-zinc-600">
                    <summary className="cursor-pointer font-semibold text-[#365314]">
                      24-hour pass &amp; refund policy details
                    </summary>
                    <p className="mt-2 leading-relaxed">
                      Your one-time payment unlocks unlimited downloads across
                      Business Cards, Labels &amp; Stickers, Passport Photos,
                      Photo Sheets, Posters, and Jar &amp; Bottle Labels in this
                      browser for 24 hours so you can adjust layouts and
                      re-download freely. Keep your PayPal order reference in
                      case you ever need a fix or refund under our 100%
                      satisfaction guarantee.
                    </p>
                  </details>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </DownloadGateContext.Provider>
  );
}
