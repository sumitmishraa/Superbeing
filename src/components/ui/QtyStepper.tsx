"use client";

import { Icon } from "./icons";

const STEP_BUTTON = "grid w-11 place-items-center rounded-full transition-colors hover:bg-[#ececec] disabled:opacity-35";

/** − n + quantity control, limited to 1–9 (the cart's per-line maximum). */
export function QtyStepper({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="inline-flex h-11 items-stretch rounded-full bg-off" role="group" aria-label={`Quantity for ${label}`}>
      <button type="button" className={STEP_BUTTON} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">
        <Icon.Minus className="size-4" />
      </button>
      <span className="tnum grid min-w-7 place-items-center text-[1rem]" aria-live="polite">
        {value}
      </span>
      <button type="button" className={STEP_BUTTON} onClick={() => onChange(value + 1)} disabled={value >= 9} aria-label="Increase quantity">
        <Icon.Plus className="size-4" />
      </button>
    </div>
  );
}
