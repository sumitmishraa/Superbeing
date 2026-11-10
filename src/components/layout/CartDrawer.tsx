"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/ui";
import { AddOnRail } from "@/features/cart/AddOnRail";
import { BillDetails } from "@/features/cart/BillDetails";
import { LineItem } from "@/features/cart/LineItem";
import { SavingsBanner } from "@/features/cart/SavingsBanner";
import { PaySummary } from "@/features/cart/StickyPayBar";
import { TierProgress } from "@/features/cart/TierProgress";
import { UndoBar } from "@/features/cart/UndoBar";
import { useAutoOffer, useBill } from "@/features/cart/useBill";
import { useOverlay } from "./useOverlay";

/**
 * Side cart: savings, delivery progress, lines with upgrade and monthly options, routine
 * add-ons and the bill, with "To pay" and checkout pinned to the bottom.
 * Mounted on every page, so it also keeps the best code applied (useAutoOffer).
 */
export function CartDrawer() {
  const open = useStore((s) => s.cartOpen);
  const setOpen = useStore((s) => s.setCartOpen);
  const { lines, bill } = useBill();
  useAutoOffer();
  const { panel, scrim } = useOverlay<HTMLDivElement>(open, "side", (el) => el.querySelector<HTMLElement>("[data-close]")?.focus());

  return (
    <>
      <div ref={scrim} style={{ display: "none" }} className="invisible fixed inset-0 z-50 bg-charcoal/40 opacity-0" onClick={() => setOpen(false)} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
        style={{ display: "none" }}
        className="invisible fixed inset-y-0 right-0 z-50 flex w-[min(480px,100vw)] flex-col bg-snow"
        data-lenis-prevent
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
          <p className="h-section uppercase">
            Cart <span className="tnum">[{bill.count}]</span>
          </p>
          <button type="button" data-close onClick={() => setOpen(false)} className="grid size-11 place-items-center" aria-label="Close cart">
            <Icon.Close className="size-6" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col justify-between px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="space-y-3">
              <p className="mt-4 text-[1.0625rem]">Your cart is empty.</p>
              <UndoBar />
            </div>
            <Link href="/shop" onClick={() => setOpen(false)} className="btn w-full">
              Shop all products
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-4">
              <SavingsBanner bill={bill} />
              <TierProgress bill={bill} />
              <UndoBar />
              <ul>
                {lines.map((l) => (
                  <LineItem key={`${l.slug}-${l.option}`} line={l} compact />
                ))}
              </ul>
              <AddOnRail lines={lines} />
              <BillDetails bill={bill} />
            </div>
            <div className="shrink-0 border-t border-line px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_-20px_rgba(0,0,0,.3)]">
              <div className="flex items-center gap-4">
                <PaySummary total={bill.total} saved={bill.savings.total} />
                <Link href="/checkout" onClick={() => setOpen(false)} className="btn">
                  Checkout
                </Link>
              </div>
              <Link href="/cart" onClick={() => setOpen(false)} className="mt-1 flex min-h-11 items-center justify-center text-[0.875rem] underline underline-offset-4">
                View full cart
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
