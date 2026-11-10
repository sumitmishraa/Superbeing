"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PRODUCT_BY_SLUG, type Product } from "@/data/products";
import { useHydrated, useStore } from "@/lib/store";
import { gsap, reduceMotion } from "@/lib/gsap";
import { AddressesTab, OrdersTab, PreferencesTab, RoutineTab } from "./AccountTabs";

/** /account: greeting, a vertical tab list (orders, routine, addresses, preferences, log out) and the open panel. Sends signed-out visitors to /login. */

type Tab = "orders" | "routine" | "addresses" | "preferences";
const TABS: { id: Tab; label: string }[] = [
  { id: "orders", label: "Orders" },
  { id: "routine", label: "My routine" },
  { id: "addresses", label: "Addresses" },
  { id: "preferences", label: "Preferences" },
];

const TAB_TEXT = "py-0.5 text-[clamp(1.5rem,1.1rem+1.4vw,2.25rem)] leading-[1.1] uppercase transition-colors duration-300";

export function AccountView() {
  const hydrated = useHydrated();
  const router = useRouter();
  const s = useStore();
  const [tab, setTab] = useState<Tab>("orders");
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hydrated && !s.profile) router.replace("/login?next=/account");
  }, [hydrated, s.profile, router]);
  useEffect(() => {
    if (panel.current && !reduceMotion()) gsap.fromTo(panel.current, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out" });
  }, [tab]);

  if (!hydrated || !s.profile) return <div className="wrap min-h-[70svh] py-16" aria-busy="true" />;

  // Every live product the shopper has ordered, has in the cart or has saved, once each.
  const myProducts = Array.from(new Set([...s.orders.flatMap((o) => o.lines.map((l) => l.slug)), ...s.cart.map((l) => l.slug), ...s.wishlist]))
    .map((slug) => PRODUCT_BY_SLUG[slug])
    .filter((p): p is Product => !!p && p.status === "live");

  return (
    <div className="wrap grid gap-10 pt-10 pb-24 md:grid-cols-12 md:gap-6 md:pt-16">
      <div className="md:col-span-4">
        <p className="crumbs">[{s.profile.email}]</p>
        <h1 className="h-display mt-3">Hello, {s.profile.name.split(" ")[0]}</h1>
        <ul className="mt-8" role="tablist" aria-label="Account sections" aria-orientation="vertical">
          {TABS.map((t) => (
            <li key={t.id}>
              <button type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`${TAB_TEXT} ${tab === t.id ? "text-charcoal" : "text-[#b4b4b4] hover:text-charcoal"}`}>
                {t.label}
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => {
                s.signOut();
                router.push("/");
              }}
              className={`${TAB_TEXT} text-[#b4b4b4] hover:text-charcoal`}
            >
              Log out
            </button>
          </li>
        </ul>
      </div>

      <div ref={panel} className="md:col-span-7 md:col-start-6" role="tabpanel">
        {tab === "orders" && <OrdersTab orders={s.orders} />}
        {tab === "routine" && <RoutineTab products={myProducts} />}
        {tab === "addresses" && <AddressesTab addresses={s.addresses} />}
        {tab === "preferences" && <PreferencesTab prefs={s.prefs} setPrefs={s.setPrefs} profile={s.profile} />}
      </div>
    </div>
  );
}
