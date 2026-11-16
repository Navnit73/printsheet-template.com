"use client";

import { useState } from "react";

/**
 * Number input that lets people type freely (clear the field, type "45")
 * and only clamps on blur / Enter. Fixes "clear → 0 → 040" and "snaps to min
 * while typing" bugs from binding <input type=number> straight to state.
 *
 * Usage: const w = useNumberField(width, setWidth, { min: 10, max: 120 });
 *        <input type="number" {...w.inputProps} />  {w.error && <p>{w.error}</p>}
 */
export function useNumberField(
  value: number,
  onCommit: (v: number) => void,
  opts: { min: number; max: number; step?: number; unit?: string }
) {
  // Draft text only exists while the field is focused; otherwise we always
  // show the committed value, so preset changes / resets stay in sync.
  const [draft, setDraft] = useState<string | null>(null);
  const focused = draft !== null;
  const text = draft ?? String(value);

  const parsed = text.trim() === "" ? NaN : Number(text);
  const unit = opts.unit ? ` ${opts.unit}` : "";
  const error = Number.isNaN(parsed)
    ? `Enter a number from ${opts.min} to ${opts.max}${unit}`
    : parsed < opts.min || parsed > opts.max
      ? `Use ${opts.min}–${opts.max}${unit}`
      : null;

  const commit = () => {
    const n = Number.isNaN(parsed) ? value : Math.min(opts.max, Math.max(opts.min, parsed));
    const rounded = opts.step ? Math.round(n / opts.step) * opts.step : n;
    onCommit(rounded);
  };

  return {
    error: focused ? error : null,
    inputProps: {
      value: text,
      min: opts.min,
      max: opts.max,
      step: opts.step,
      inputMode: "decimal" as const,
      "aria-invalid": focused && error ? true : undefined,
      onFocus: () => setDraft(String(value)),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setDraft(e.target.value);
        const n = Number(e.target.value);
        // Live-update the preview while typing valid in-range values.
        if (e.target.value.trim() !== "" && !Number.isNaN(n) && n >= opts.min && n <= opts.max) onCommit(n);
      },
      onBlur: () => {
        commit();
        setDraft(null);
      },
      onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      },
    },
  };
}
