"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect, useState } from "react";
import { PRODUCT_BY_SLUG, FREE_SHIPPING_AT } from "@/data/products";

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
  clearCart: () => void;
  toggleWishlist: (slug: string) => void;
  moveToCart: (slug: string) => void;
  pushRecent: (slug: string) => void;
  addNotify: (slug: string) => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  signIn: (p: Profile) => void;
  signOut: () => void;
  saveAddress: (a: Address) => void;
  placeOrder: (address: Address, extraDelivery?: number) => Order;
  setPrefs: (p: Partial<StoreState["prefs"]>) => void;
  setCartOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  setMenuOpen: (v: boolean) => void;
  setQuickShop: (slug: string | null) => void;
  setPopupSeen: () => void;
  closeAnnouncement: () => void;
}

const COUPONS: Record<string, number> = { FIRSTLABEL: 0.1 };

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      recent: [],
      notify: [],
      coupon: null,
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
        const option = opts.option ?? "standard";
        const qty = opts.qty ?? 1;
        const cart = [...get().cart];
        const i = cart.findIndex((l) => l.slug === slug && l.option === option);
        if (i >= 0) cart[i] = { ...cart[i], qty: Math.min(9, cart[i].qty + qty) };
        else cart.push({ slug, option, qty, subscribe: opts.subscribe ?? false });
        set({ cart, cartOpen: opts.open ?? true });
      },
      setQty: (slug, option, qty) =>
        set({
          cart: get().cart.map((l) =>
            l.slug === slug && l.option === option ? { ...l, qty: Math.max(1, Math.min(9, qty)) } : l,
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
      clearCart: () => set({ cart: [], coupon: null }),
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
        if (COUPONS[c] === undefined) return false;
        set({ coupon: c });
        return true;
      },
      removeCoupon: () => set({ coupon: null }),
      signIn: (profile) => set({ profile }),
      signOut: () => set({ profile: null }),
      saveAddress: (a) =>
        set({ addresses: [a, ...get().addresses.filter((x) => x.pin !== a.pin || x.line1 !== a.line1)].slice(0, 4) }),
      placeOrder: (address, extraDelivery = 0) => {
        const totals = cartTotals(get().cart, get().coupon);
        const order: Order = {
          id: "SB" + Date.now().toString(36).toUpperCase().slice(-7),
          placedAt: new Date().toISOString(),
          lines: get().cart,
          total: totals.total + extraDelivery,
          address,
        };
        set({ orders: [order, ...get().orders], cart: [], coupon: null });
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

export function linePrice(l: CartLine) {
  const p = PRODUCT_BY_SLUG[l.slug];
  if (!p) return 0;
  const unit = l.option === "trial" && p.trialPack ? p.trialPack.price : p.price;
  const sub = l.subscribe ? Math.round(unit * 0.85) : unit;
  return sub * l.qty;
}

export function cartTotals(cart: CartLine[], coupon: string | null) {
  const subtotal = cart.reduce((n, l) => n + linePrice(l), 0);
  const discount = coupon ? Math.round(subtotal * (COUPONS[coupon] ?? 0)) : 0;
  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount === 0 || afterDiscount >= FREE_SHIPPING_AT ? 0 : 79;
  return { subtotal, discount, shipping, total: afterDiscount + shipping, count: cart.reduce((n, l) => n + l.qty, 0) };
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
