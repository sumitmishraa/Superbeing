"use client";

/**
 * Client state in one Zustand store: cart, wishlist, coupon, profile, addresses, orders and which
 * overlay is open. The shopper's data persists to localStorage and is re-validated on every load.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect, useState } from "react";
import { PRODUCT_BY_SLUG } from "@/data/products";
import { MAX, clampInt, cleanText } from "@/lib/validate";
import { OFFERS, quote, type Delivery } from "@/lib/pricing";

export type PackOption = "standard" | "trial";

export interface CartLine {
  slug: string;
  option: PackOption;
  qty: number;
  subscribe: boolean;
}

export interface Address {
  name: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pin: string;
}

export interface Order {
  id: string;
  placedAt: string;
  lines: CartLine[];
  total: number;
  address: Address;
  giftNote?: string;
}

export interface Profile {
  name: string;
  email: string;
  phone: string;
}

interface StoreState {
  cart: CartLine[];
  wishlist: string[];
  recent: string[];
  notify: string[];
  coupon: string | null;
  profile: Profile | null;
  addresses: Address[];
  orders: Order[];
  prefs: { veg: boolean; reminders: boolean; newsletter: boolean };
  cartOpen: boolean;
  searchOpen: boolean;
  menuOpen: boolean;
  quickShop: string | null;
  popupSeen: boolean;
  annClosed: boolean;
  lastRemoved: { line: CartLine; index: number } | null;

  addToCart: (slug: string, opts?: { qty?: number; option?: PackOption; subscribe?: boolean; open?: boolean }) => void;
  setQty: (slug: string, option: PackOption, qty: number) => void;
  removeLine: (slug: string, option: PackOption) => void;
  undoRemove: () => void;
  toggleSubscribe: (slug: string, option: PackOption) => void;
  toggleWishlist: (slug: string) => void;
  moveToCart: (slug: string) => void;
  pushRecent: (slug: string) => void;
  addNotify: (slug: string) => void;
  /** False once the shopper picks or removes a code themselves; until then the best code is applied for them. */
  couponAuto: boolean;
  applyCoupon: (code: string) => boolean;
  autoApplyCoupon: (code: string | null) => void;
  removeCoupon: () => void;
  /** Moves a trial line to the standard pack, merging with a standard line already in the cart. */
  upgradePack: (slug: string) => void;
  signIn: (p: Profile) => void;
  signOut: () => void;
  saveAddress: (a: Address) => void;
  placeOrder: (address: Address, delivery?: Delivery, giftNote?: string) => Order;
  setPrefs: (p: Partial<StoreState["prefs"]>) => void;
  setCartOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  setMenuOpen: (v: boolean) => void;
  setQuickShop: (slug: string | null) => void;
  setPopupSeen: () => void;
  closeAnnouncement: () => void;
}

/** Known codes and their rates; the rules for each live in pricing.ts. */
const COUPONS: Record<string, number> = Object.fromEntries(OFFERS.map((o) => [o.code, o.rate]));

/* ───────── Rehydration guard ─────────
 * Only the fields below come back from storage, each checked against the catalogue and capped.
 * Prices are never stored for the cart: pricing.quote() always reads them from
 * products.ts. Past orders keep the total charged at the time, as a display-only record.
 * This block must stay above useStore: persist hydrates synchronously inside create(), so these
 * helpers have to be initialised before it runs. */

const MAX_LINES = 20;
const MAX_LIST = 50;
const MAX_ORDERS = 50;

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
// Own-property checks, so keys like "__proto__" or "constructor" never count as products.
const isKnownSlug = (v: unknown): v is string => typeof v === "string" && Object.hasOwn(PRODUCT_BY_SLUG, v);
const isLiveSlug = (v: unknown): v is string => isKnownSlug(v) && PRODUCT_BY_SLUG[v].status === "live";

function cleanLine(v: unknown, slugOk: (s: unknown) => s is string): CartLine | null {
  if (!isObj(v) || !slugOk(v.slug)) return null;
  const p = PRODUCT_BY_SLUG[v.slug];
  const option: PackOption = v.option === "trial" && p.trialPack ? "trial" : "standard";
  return { slug: v.slug, option, qty: clampInt(v.qty, 1, 9), subscribe: v.subscribe === true };
}

function cleanLines(v: unknown, slugOk: (s: unknown) => s is string): CartLine[] {
  if (!Array.isArray(v)) return [];
  const out: CartLine[] = [];
  for (const raw of v.slice(0, MAX_LINES)) {
    const l = cleanLine(raw, slugOk);
    if (l && !out.some((o) => o.slug === l.slug && o.option === l.option)) out.push(l);
  }
  return out;
}

function cleanSlugs(v: unknown, slugOk: (s: unknown) => s is string, cap: number): string[] {
  return Array.isArray(v) ? [...new Set(v.filter(slugOk))].slice(0, cap) : [];
}

function cleanAddress(v: unknown): Address | null {
  if (!isObj(v)) return null;
  const a: Address = {
    name: cleanText(v.name, MAX.name),
    phone: cleanText(v.phone, 20),
    line1: cleanText(v.line1, MAX.line),
    city: cleanText(v.city, MAX.city),
    state: cleanText(v.state, MAX.city),
    pin: cleanText(v.pin, 6),
  };
  return a.name && a.line1 ? a : null;
}

function cleanOrder(v: unknown): Order | null {
  if (!isObj(v)) return null;
  const address = cleanAddress(v.address);
  const lines = cleanLines(v.lines, isKnownSlug);
  const placedAt = typeof v.placedAt === "string" && !Number.isNaN(Date.parse(v.placedAt)) ? v.placedAt.slice(0, 40) : null;
  const total = typeof v.total === "number" && Number.isFinite(v.total) && v.total >= 0 ? Math.round(v.total) : null;
  const id = cleanText(v.id, 20);
  if (!address || !lines.length || !placedAt || total === null || !id) return null;
  const giftNote = cleanText(v.giftNote, 200);
  return { id, placedAt, lines, total, address, ...(giftNote ? { giftNote } : {}) };
}

/** Rebuilds the persisted slice of state from whatever was in localStorage, field by field. */
function sanitizePersisted(persisted: unknown, current: StoreState): Partial<StoreState> {
  if (!isObj(persisted)) return {};
  const s = persisted;
  const profile = isObj(s.profile)
    ? { name: cleanText(s.profile.name, MAX.name), email: cleanText(s.profile.email, MAX.email), phone: cleanText(s.profile.phone, 20) }
    : null;
  const prefs = isObj(s.prefs) ? s.prefs : {};
  const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);
  return {
    cart: cleanLines(s.cart, isLiveSlug),
    wishlist: cleanSlugs(s.wishlist, isKnownSlug, MAX_LIST),
    recent: cleanSlugs(s.recent, isKnownSlug, 8),
    notify: cleanSlugs(s.notify, isKnownSlug, MAX_LIST),
    coupon: typeof s.coupon === "string" && Object.hasOwn(COUPONS, s.coupon) ? s.coupon : null,
    profile: profile && profile.name && profile.email ? profile : null,
    addresses: Array.isArray(s.addresses) ? s.addresses.map(cleanAddress).filter((a): a is Address => !!a).slice(0, 4) : [],
    orders: Array.isArray(s.orders) ? s.orders.slice(0, MAX_ORDERS).map(cleanOrder).filter((o): o is Order => !!o) : [],
    prefs: {
      veg: bool(prefs.veg, current.prefs.veg),
      reminders: bool(prefs.reminders, current.prefs.reminders),
      newsletter: bool(prefs.newsletter, current.prefs.newsletter),
    },
    popupSeen: s.popupSeen === true,
  };
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      recent: [],
      notify: [],
      coupon: null,
      couponAuto: true,
      profile: null,
      addresses: [],
      orders: [],
      prefs: { veg: false, reminders: true, newsletter: false },
      cartOpen: false,
      searchOpen: false,
      menuOpen: false,
      quickShop: null,
      popupSeen: false,
      annClosed: false,
      lastRemoved: null,

      addToCart: (slug, opts = {}) => {
        const p = PRODUCT_BY_SLUG[slug];
        if (!p || p.status !== "live") return;
        const option: PackOption = opts.option === "trial" && p.trialPack ? "trial" : "standard";
        const qty = clampInt(opts.qty ?? 1, 1, 9);
        const cart = [...get().cart];
        const i = cart.findIndex((l) => l.slug === slug && l.option === option);
        if (i >= 0) cart[i] = { ...cart[i], qty: Math.min(9, cart[i].qty + qty) };
        else cart.push({ slug, option, qty, subscribe: opts.subscribe ?? false });
        set({ cart, cartOpen: opts.open ?? true });
      },
      setQty: (slug, option, qty) =>
        set({
          cart: get().cart.map((l) =>
            l.slug === slug && l.option === option ? { ...l, qty: clampInt(qty, 1, 9) } : l,
          ),
        }),
      removeLine: (slug, option) => {
        const cart = get().cart;
        const index = cart.findIndex((l) => l.slug === slug && l.option === option);
        if (index < 0) return;
        set({ cart: cart.filter((_, i) => i !== index), lastRemoved: { line: cart[index], index } });
      },
      undoRemove: () => {
        const r = get().lastRemoved;
        if (!r) return;
        const cart = [...get().cart];
        cart.splice(Math.min(r.index, cart.length), 0, r.line);
        set({ cart, lastRemoved: null });
      },
      toggleSubscribe: (slug, option) =>
        set({
          cart: get().cart.map((l) => (l.slug === slug && l.option === option ? { ...l, subscribe: !l.subscribe } : l)),
        }),
      toggleWishlist: (slug) => {
        const w = get().wishlist;
        set({ wishlist: w.includes(slug) ? w.filter((s) => s !== slug) : [slug, ...w] });
      },
      moveToCart: (slug) => {
        get().addToCart(slug, { open: true });
        set({ wishlist: get().wishlist.filter((s) => s !== slug) });
      },
      pushRecent: (slug) => set({ recent: [slug, ...get().recent.filter((s) => s !== slug)].slice(0, 8) }),
      addNotify: (slug) => {
        if (!get().notify.includes(slug)) set({ notify: [...get().notify, slug] });
      },
      applyCoupon: (code) => {
        const c = code.trim().toUpperCase();
        if (!Object.hasOwn(COUPONS, c)) return false;
        set({ coupon: c, couponAuto: false });
        return true;
      },
      autoApplyCoupon: (code) => {
        if (get().couponAuto && (code === null || Object.hasOwn(COUPONS, code))) set({ coupon: code });
      },
      removeCoupon: () => set({ coupon: null, couponAuto: false }),
      upgradePack: (slug) => {
        const cart = get().cart;
        const trial = cart.find((l) => l.slug === slug && l.option === "trial");
        if (!trial) return;
        const standard = cart.find((l) => l.slug === slug && l.option === "standard");
        set({
          cart: standard
            ? cart.filter((l) => l !== trial).map((l) => (l === standard ? { ...l, qty: Math.min(9, l.qty + trial.qty) } : l))
            : cart.map((l) => (l === trial ? { ...l, option: "standard" } : l)),
        });
      },
      signIn: (profile) => set({ profile }),
      signOut: () => set({ profile: null }),
      saveAddress: (a) =>
        set({ addresses: [a, ...get().addresses.filter((x) => x.pin !== a.pin || x.line1 !== a.line1)].slice(0, 4) }),
      placeOrder: (address, delivery = "standard", giftNote) => {
        // The same quote() the bill shows, so the saved total always matches what the shopper saw.
        const bill = quote(get().cart, get().coupon, delivery);
        const note = cleanText(giftNote, 200);
        const order: Order = {
          id: "SB" + Date.now().toString(36).toUpperCase().slice(-7),
          placedAt: new Date().toISOString(),
          lines: get().cart,
          total: bill.total,
          address,
          ...(note ? { giftNote: note } : {}),
        };
        set({ orders: [order, ...get().orders], cart: [], coupon: null, couponAuto: true });
        get().saveAddress(address);
        return order;
      },
      setPrefs: (p) => set({ prefs: { ...get().prefs, ...p } }),
      setCartOpen: (cartOpen) => set({ cartOpen }),
      setSearchOpen: (searchOpen) => set({ searchOpen }),
      setMenuOpen: (menuOpen) => set({ menuOpen }),
      setQuickShop: (quickShop) => set({ quickShop }),
      setPopupSeen: () => set({ popupSeen: true }),
      closeAnnouncement: () => set({ annClosed: true }),
    }),
    {
      name: "superbeing-store",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Older saved shapes are passed through; `merge` below validates every field either way.
      migrate: (persisted) => persisted as StoreState,
      // localStorage can be edited by anyone with the browser open, so nothing read back is trusted.
      merge: (persisted, current) => ({ ...current, ...sanitizePersisted(persisted, current) }),
      partialize: (s) => ({
        cart: s.cart,
        wishlist: s.wishlist,
        recent: s.recent,
        notify: s.notify,
        coupon: s.coupon,
        profile: s.profile,
        addresses: s.addresses,
        orders: s.orders,
        prefs: s.prefs,
        popupSeen: s.popupSeen,
      }),
    },
  ),
);

/** Short form of the bill from pricing.quote(), for callers that only need the headline numbers. */
export function cartTotals(cart: CartLine[], coupon: string | null) {
  const q = quote(cart, coupon);
  return { subtotal: q.itemTotal, discount: q.discount, shipping: q.deliveryFee, total: q.total, count: q.count };
}

/** False until persisted state has loaded, so server HTML and the first client render match. */
export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => {
    const done = () => setH(true);
    if (useStore.persist.hasHydrated()) done();
    return useStore.persist.onFinishHydration(done);
  }, []);
  return h;
}
