"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import type { PaymentState, PricingCurrency } from "@/types/payment";

// Use live Client ID from environment variables, or fallback to "test" for sandbox.
const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test";

// Shown while the PayPal SDK is loading or if it fails (e.g. blocked script or invalid client ID).
function ScriptStatusNotice() {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();

  if (isRejected) {
    return (
      <p className="rounded-xl border border-red-300 bg-red-50 p-3 text-xs font-semibold text-red-800">
        Payment is temporarily unavailable. Please disable script blockers for PayPal, refresh the page, or try again shortly.
      </p>
    );
  }

  if (isPending) {
    return (
      <div className="space-y-2 py-1" aria-live="polite">
        <div className="h-11 w-full animate-pulse rounded-xl bg-zinc-100" />
        <div className="h-11 w-full animate-pulse rounded-xl bg-zinc-100" />
        <p className="text-center text-[11px] text-zinc-500">Loading secure checkout…</p>
      </div>
    );
  }

  return null;
}

export interface PaymentButtonProps {
  /** Price in minor units (cents / pence), e.g. 399 for $3.99 or 299 for £2.99. */
  amount: number;
  currency?: PricingCurrency;
  description?: string;
  disabled?: boolean;
  onSuccess?: (payment: PaymentState) => void;
  onProcessingChange?: (processing: boolean) => void;
}

export function PaymentButton({
  amount,
  currency = "USD",
  description = "Print Sheet Maker — 24-hour Download Pass",
  disabled = false,
  onSuccess,
  onProcessingChange,
}: PaymentButtonProps) {
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expectedValue = (amount / 100).toFixed(2);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    // Clear the previous timer so it can't hide a newer toast early.
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  };

  return (
    <div className="relative w-full">
      {/* Inline / floating payment status toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-[100] max-w-sm">
          <div
            role="status"
            className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs font-semibold shadow-lg ${
              toast.type === "success"
                ? "border-[#c7e0a8] bg-[#eef6e4] text-[#365314]"
                : toast.type === "error"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-blue-200 bg-blue-50 text-blue-900"
            }`}
          >
            {toast.type === "success" && (
              <svg
                className="h-4 w-4 shrink-0 text-[#4d7c0f]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {toast.type === "error" && (
              <svg
                className="h-4 w-4 shrink-0 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            {toast.type === "info" && (
              <svg
                className="h-4 w-4 shrink-0 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {clientId === "test" && (
        <p className="mb-2.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-950 leading-snug break-words">
          Sandbox test mode (no real charge). Set{" "}
          <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-[10px]">
            NEXT_PUBLIC_PAYPAL_CLIENT_ID
          </code>{" "}
          for live checkout.
        </p>
      )}

      <div className="w-full">
        <PayPalScriptProvider
          key={currency}
          options={{
            clientId,
            currency,
            intent: "capture",
          }}
        >
          <ScriptStatusNotice />
          <PayPalButtons
            style={{ layout: "vertical", shape: "rect", color: "blue" }}
            disabled={disabled}
            forceReRender={[amount, currency, disabled]}
            onClick={(_data, actions) => {
              // The disabled prop only greys the button out; block the click as well.
              return disabled ? actions.reject() : actions.resolve();
            }}
            createOrder={(_data, actions) => {
              return actions.order.create({
                intent: "CAPTURE",
                purchase_units: [
                  {
                    amount: {
                      currency_code: currency,
                      value: expectedValue,
                    },
                    description,
                  },
                ],
                application_context: {
                  shipping_preference: "NO_SHIPPING",
                },
              });
            }}
            onApprove={async (data, actions) => {
              if (!actions.order) return;
              onProcessingChange?.(true);
              showToast("Processing payment…", "info");

              let details;
              try {
                details = await actions.order.capture();
              } catch (err) {
                onProcessingChange?.(false);
                // PayPal recommends restarting checkout when the card or funding source is declined,
                // so the buyer can pick another way to pay.
                if (String(err).includes("INSTRUMENT_DECLINED")) {
                  showToast(
                    "Your payment method was declined. Please try another card or account.",
                    "error"
                  );
                  return actions.restart();
                }
                console.error("PayPal capture error:", err);
                showToast(
                  "Payment could not be completed. You have not been charged.",
                  "error"
                );
                return;
              }

              const capture =
                details?.purchase_units?.[0]?.payments?.captures?.[0];
              const orderOk =
                details?.status === "COMPLETED" ||
                details?.status === "APPROVED";
              const captureOk =
                !capture?.status ||
                capture.status === "COMPLETED" ||
                capture.status === "PENDING";
              const amountOk =
                !capture?.amount?.value ||
                (Number(capture.amount.value) === Number(expectedValue) &&
                  (!capture.amount.currency_code ||
                    capture.amount.currency_code === currency));

              if (!orderOk || !captureOk || !amountOk) {
                onProcessingChange?.(false);
                console.error(
                  "PayPal capture not accepted:",
                  details?.status,
                  capture?.status,
                  capture?.amount
                );
                showToast(
                  "Payment was not completed. Please contact support if you were charged.",
                  "error"
                );
                return;
              }

              const payerName = details.payer?.name?.given_name
                ? `${details.payer.name.given_name} ${details.payer.name.surname || ""}`.trim()
                : "";

              const paymentState: PaymentState = {
                orderID: details.id || data.orderID,
                payerID: details.payer?.payer_id || "",
                name: payerName,
                email: details.payer?.email_address || "",
              };

              onProcessingChange?.(false);
              showToast("Payment successful! Starting your download…", "success");
              onSuccess?.(paymentState);
            }}
            onError={(err) => {
              onProcessingChange?.(false);
              console.error("PayPal Error:", err);
              showToast("Payment failed or was cancelled.", "error");
            }}
            onCancel={() => {
              onProcessingChange?.(false);
              showToast("Payment was cancelled.", "info");
            }}
          />
        </PayPalScriptProvider>
      </div>
    </div>
  );
}
