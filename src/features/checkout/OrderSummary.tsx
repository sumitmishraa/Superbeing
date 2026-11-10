"use client";

import { useState } from "react";
import { formatINR } from "@/data/products";
import type { Quote } from "@/lib/pricing";
import type { CartLine } from "@/lib/store";
import { Icon } from "@/components/ui";
import { AddOnRail } from "@/features/cart/AddOnRail";
import { LineItem } from "@/features/cart/LineItem";
import { OffersSheet } from "@/features/cart/OffersSheet";
import { SavingsBanner } from "@/features/cart/SavingsBanner";
import { TierProgress } from "@/features/cart/TierProgress";

/**
 * Checkout's order column: savings, delivery progress, the lines (folded on phones, always open on
 * desktop), add-ons and offers.
 */
export function OrderSummary({ lines, bill }: { lines: CartLine[]; bill: Quote }) {
  const [open, setOpen] = useState(false);
  return (
    <aside className="min-w-0 space-y-5 lg:col-span-5 lg:col-start-8 lg:row-start-1" aria-label="Your order">
      <SavingsBanner bill={bill} />
      <TierProgress bill={bill} />
      <div className="rounded-xl border border-line">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="co-lines"
          className="flex min-h-14 w-full items-center justify-between gap-3 px-3.5 text-left"
        >
          <span className="text-[0.9375rem] font-medium text-charcoal">
            Your order · <span className="tnum">{bill.count}</span> {bill.count === 1 ? "pack" : "packs"}
          </span>
          <span className="flex items-center gap-2">
            <span className="tnum text-[0.9375rem] text-charcoal">{formatINR(bill.itemTotal)}</span>
            <Icon.Chevron className={`size-4 transition-transform lg:hidden ${open ? "rotate-180" : ""}`} />
          </span>
        </button>
        <ul id="co-lines" className={`border-t border-line px-3.5 ${open ? "block" : "hidden lg:block"}`}>
          {lines.map((l) => (
            <LineItem key={l.slug + l.option} line={l} compact />
          ))}
        </ul>
      </div>
      <AddOnRail lines={lines} title="Add to your order" />
      <OffersSheet bill={bill} />
    </aside>
  );
}
