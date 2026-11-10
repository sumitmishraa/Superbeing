"use client";

import { useEffect, useMemo } from "react";
import { bestOffer, quote, type Delivery } from "@/lib/pricing";
import { useHydrated, useStore } from "@/lib/store";

/** The cart and its bill, empty until saved state has loaded so server and client HTML match. */
export function useBill(delivery: Delivery = "standard") {
  const hydrated = useHydrated();
  const cart = useStore((s) => s.cart);
  const coupon = useStore((s) => s.coupon);
  const lines = useMemo(() => (hydrated ? cart : []), [hydrated, cart]);
  const bill = useMemo(() => quote(lines, hydrated ? coupon : null, delivery), [lines, hydrated, coupon, delivery]);
  return { hydrated, lines, bill };
}

/**
 * Keeps the code that saves the most applied, until the shopper picks or removes one
 * themselves (store.couponAuto). Call once per cart surface.
 */
export function useAutoOffer() {
  const hydrated = useHydrated();
  const cart = useStore((s) => s.cart);
  const coupon = useStore((s) => s.coupon);
  const auto = useStore((s) => s.couponAuto);
  const firstOrder = useStore((s) => s.orders.length === 0);
  const autoApply = useStore((s) => s.autoApplyCoupon);
  useEffect(() => {
    if (!hydrated || !auto) return;
    const best = bestOffer(cart, firstOrder)?.code ?? null;
    if (best !== coupon) autoApply(best);
  }, [hydrated, auto, cart, coupon, firstOrder, autoApply]);
}
