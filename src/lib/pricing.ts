/**
 * Every rupee the shopper sees in the cart, drawer and checkout comes from here.
 *
 * Pure functions only (no React, no store), so the bill on screen and the total saved with an
 * order are always the same number. Prices are read from the catalogue each time; nothing
 * here invents a "was" price. A saving is only shown when it is a real difference between two
 * prices we actually charge.
 *
 * SAMPLE POLICY (confirm before launch): ₹79 delivery, free from ₹999; ₹149 express;
 * 15% off monthly delivery; FIRSTLABEL 10% off a first order; ROUTINE5 5% off from ₹1,999.
 * Thresholds are measured on the item total after monthly savings and before any code, so
 * applying a code can never make a delivery fee appear.
 */

import { PRODUCTS, PRODUCT_BY_SLUG, FREE_SHIPPING_AT, type NeedId, type Product } from "@/data/products";
import type { CartLine, PackOption } from "@/lib/store";

export const DELIVERY_FEE = 79;
export const EXPRESS_FEE = 149;
export const MONTHLY_OFF = 0.15;

export type Delivery = "standard" | "express";

/* ───────── Single products ───────── */

/** Leading whole number in a pack label: "15 sachets" → 15. */
function countIn(label: string): number | null {
  const n = parseInt(label, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Shelf price of one pack, before any monthly saving. */
export function packPrice(p: Product, option: PackOption): number {
  return option === "trial" && p.trialPack ? p.trialPack.price : p.price;
}

/** Pack label for an option, e.g. "15 sachets". */
export function packLabel(p: Product, option: PackOption): string {
  return option === "trial" && p.trialPack ? p.trialPack.packCount : p.packCount;
}

/** Days one pack lasts. The trial pack is scaled from its count against the standard pack. */
export function packDays(p: Product, option: PackOption): number {
  if (option !== "trial" || !p.trialPack) return p.days;
  const trial = countIn(p.trialPack.packCount);
  const standard = countIn(p.packCount);
  return trial && standard ? Math.round((p.days * trial) / standard) : p.days;
}

/** Price of one pack once the monthly saving (if chosen) is taken off. */
export function unitPrice(p: Product, option: PackOption, monthly: boolean): number {
  const list = packPrice(p, option);
  return monthly ? Math.round(list * (1 - MONTHLY_OFF)) : list;
}

/** Rupees per day of use for one pack (unrounded; round only for display). */
export function perServe(p: Product, option: PackOption, monthly = false): number {
  return unitPrice(p, option, monthly) / packDays(p, option);
}

/** "₹50/day" style label. */
export function perDayLabel(rupees: number): string {
  return `₹${Math.round(rupees).toLocaleString("en-IN")}/day`;
}

/* ───────── Cart lines ───────── */

/** What a line costs now, after any monthly saving. */
export function linePrice(l: CartLine): number {
  const p = PRODUCT_BY_SLUG[l.slug];
  return p ? unitPrice(p, l.option, l.subscribe) * l.qty : 0;
}

/** What the same line would cost at shelf price. */
export function lineListPrice(l: CartLine): number {
  const p = PRODUCT_BY_SLUG[l.slug];
  return p ? packPrice(p, l.option) * l.qty : 0;
}

/** Rupees a line would save each month on monthly delivery (shown on the monthly toggle). */
export function monthlySaving(l: CartLine): number {
  const p = PRODUCT_BY_SLUG[l.slug];
  return p ? (packPrice(p, l.option) - unitPrice(p, l.option, true)) * l.qty : 0;
}

export interface UpgradeOffer {
  /** Extra rupees to pay for the bigger pack. */
  extraCost: number;
  /** What the bigger pack saves against buying the same days in trial packs. */
  savings: number;
  days: number;
  perServeNow: number;
  perServeAfter: number;
}

/**
 * When a trial line could move to the standard pack, what it costs and what it saves.
 * Savings compare like for like: the standard pack against enough trial packs to last as long
 * (for 15 vs 30 sachets, two trial packs). Returns null unless that saving is real and positive.
 */
export function upgradeOffer(l: CartLine): UpgradeOffer | null {
  const p = PRODUCT_BY_SLUG[l.slug];
  if (!p || l.option !== "trial" || !p.trialPack) return null;
  const trialUnit = unitPrice(p, "trial", l.subscribe);
  const standardUnit = unitPrice(p, "standard", l.subscribe);
  const packsPerStandard = packDays(p, "standard") / packDays(p, "trial");
  const savings = Math.round((packsPerStandard * trialUnit - standardUnit) * l.qty);
  if (savings <= 0) return null;
  return {
    extraCost: (standardUnit - trialUnit) * l.qty,
    savings,
    days: packDays(p, "standard"),
    perServeNow: perServe(p, "trial", l.subscribe),
    perServeAfter: perServe(p, "standard", l.subscribe),
  };
}

/* ───────── Codes and tiers ───────── */

export interface Offer {
  code: string;
  title: string;
  rate: number;
  /** Item total needed before the code applies. */
  minItemTotal: number;
  firstOrderOnly: boolean;
}

/** SAMPLE codes. Codes do not combine: one per order. */
export const OFFERS: Offer[] = [
  { code: "FIRSTLABEL", title: "10% off your first order", rate: 0.1, minItemTotal: 0, firstOrderOnly: true },
  { code: "ROUTINE5", title: "5% off orders of ₹1,999 or more", rate: 0.05, minItemTotal: 1999, firstOrderOnly: false },
];
export const OFFER_BY_CODE: Record<string, Offer> = Object.fromEntries(OFFERS.map((o) => [o.code, o]));

export interface Tier {
  at: number;
  label: string;
  /** Fixed rupees the tier saves (free delivery). */
  saves?: number;
  /** Code the tier unlocks. */
  code?: string;
}

/** SAMPLE tiers shown on the progress bar. */
export const TIERS: Tier[] = [
  { at: FREE_SHIPPING_AT, label: "Free delivery", saves: DELIVERY_FEE },
  { at: 1999, label: "Extra 5% off", code: "ROUTINE5" },
];

export type OfferState = "available" | "locked" | "first-order-only";

/** Whether a code can be used now, and how far off it is when not. */
export function offerStatus(o: Offer, itemTotal: number, firstOrder: boolean): { state: OfferState; shortBy: number; saves: number } {
  const shortBy = Math.max(0, o.minItemTotal - itemTotal);
  const saves = Math.round(Math.max(itemTotal, o.minItemTotal) * o.rate);
  if (o.firstOrderOnly && !firstOrder) return { state: "first-order-only", shortBy, saves };
  return { state: shortBy > 0 ? "locked" : "available", shortBy, saves };
}

/** The code that saves the most on this cart right now, or null. Applied for the shopper, who can remove it. */
export function bestOffer(cart: CartLine[], firstOrder: boolean): Offer | null {
  const total = itemTotalOf(cart);
  if (total === 0) return null;
  let best: Offer | null = null;
  for (const o of OFFERS) {
    if (offerStatus(o, total, firstOrder).state !== "available") continue;
    if (!best || o.rate > best.rate) best = o;
  }
  return best;
}

/**
 * The next tier still to reach, with how much more it needs. Code tiers that would save less
 * than the code already applied are skipped, because codes do not combine.
 */
export function nextTier(itemTotal: number, appliedRate = 0): { tier: Tier; remaining: number; progress: number } | null {
  const tier = TIERS.find((t) => {
    if (itemTotal >= t.at) return false;
    const offer = t.code ? OFFER_BY_CODE[t.code] : null;
    return !offer || offer.rate > appliedRate;
  });
  if (!tier) return null;
  return { tier, remaining: tier.at - itemTotal, progress: Math.min(1, itemTotal / tier.at) };
}

/* ───────── The bill ───────── */

function itemTotalOf(cart: CartLine[]): number {
  return cart.reduce((n, l) => n + linePrice(l), 0);
}

export interface Savings {
  monthly: number;
  coupon: number;
  delivery: number;
  total: number;
}

/** Every saving on the order, each one a real difference in what is charged. */
export function savingsBreakdown(cart: CartLine[], coupon: string | null): Savings {
  const listTotal = cart.reduce((n, l) => n + lineListPrice(l), 0);
  const itemTotal = itemTotalOf(cart);
  const monthly = listTotal - itemTotal;
  const offer = coupon ? OFFER_BY_CODE[coupon] : undefined;
  const couponOff = offer && itemTotal >= offer.minItemTotal ? Math.round(itemTotal * offer.rate) : 0;
  const delivery = itemTotal >= FREE_SHIPPING_AT ? DELIVERY_FEE : 0;
  return { monthly, coupon: couponOff, delivery, total: monthly + couponOff + delivery };
}

export interface Quote {
  count: number;
  /** Shelf price of everything in the cart. */
  listTotal: number;
  /** After monthly savings, before any code. Tiers and code minimums use this. */
  itemTotal: number;
  /** The code the shopper has, and whether this cart meets its minimum. */
  coupon: { code: string; title: string; valid: boolean; shortBy: number } | null;
  discount: number;
  /** Standard delivery fee charged (0 when free). */
  deliveryFee: number;
  expressFee: number;
  total: number;
  savings: Savings;
  next: ReturnType<typeof nextTier>;
}

/** The full bill used by every surface and by placeOrder. */
export function quote(cart: CartLine[], coupon: string | null, delivery: Delivery = "standard"): Quote {
  const savings = savingsBreakdown(cart, coupon);
  const listTotal = cart.reduce((n, l) => n + lineListPrice(l), 0);
  const itemTotal = listTotal - savings.monthly;
  const offer = coupon ? OFFER_BY_CODE[coupon] : undefined;
  const empty = itemTotal === 0;
  const deliveryFee = empty || savings.delivery > 0 ? 0 : DELIVERY_FEE;
  const expressFee = !empty && delivery === "express" ? EXPRESS_FEE : 0;
  return {
    count: cart.reduce((n, l) => n + l.qty, 0),
    listTotal,
    itemTotal,
    coupon: offer
      ? { code: offer.code, title: offer.title, valid: savings.coupon > 0, shortBy: Math.max(0, offer.minItemTotal - itemTotal) }
      : null,
    discount: savings.coupon,
    deliveryFee,
    expressFee,
    total: itemTotal - savings.coupon + deliveryFee + expressFee,
    savings,
    next: empty ? null : nextTier(itemTotal, savings.coupon > 0 && offer ? offer.rate : 0),
  };
}

/* ───────── Add-ons ───────── */

/** Needs that sit naturally next to each other in a daily routine (first is the closest). */
const ROUTINE_AFFINITY: Partial<Record<NeedId, NeedId[]>> = {
  gut: ["foundational", "stress"],
  sleep: ["stress", "foundational"],
  stress: ["sleep", "foundational"],
  foundational: ["gut", "beauty"],
  beauty: ["foundational", "hydration"],
  hydration: ["muscle", "weight"],
  muscle: ["hydration", "foundational"],
  weight: ["gut", "hydration"],
  womens: ["foundational", "beauty"],
};

export interface AddOn {
  product: Product;
  perDay: number;
}

/**
 * Up to `n` live products not already in the cart, ranked by how close their need sits to the
 * needs in the cart, then by lowest cost per day. Suggestions only: nothing is ever added for the shopper.
 */
export function routineAddOns(cart: CartLine[], n = 3): AddOn[] {
  const inCart = new Set(cart.map((l) => l.slug));
  const score = new Map<NeedId, number>();
  for (const l of cart) {
    const need = PRODUCT_BY_SLUG[l.slug]?.need;
    if (!need) continue;
    (ROUTINE_AFFINITY[need] ?? []).forEach((related, rank) => score.set(related, (score.get(related) ?? 0) + (2 - rank)));
  }
  return PRODUCTS.filter((p) => p.status === "live" && !inCart.has(p.slug))
    .map((product) => ({ product, perDay: perServe(product, "standard"), score: score.get(product.need) ?? 0 }))
    .sort((a, b) => b.score - a.score || a.perDay - b.perDay)
    .slice(0, n)
    .map(({ product, perDay }) => ({ product, perDay }));
}
