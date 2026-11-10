"use client";

import Image from "next/image";
import Link from "next/link";
import { PRODUCT_BY_SLUG, formatINR, type Product } from "@/data/products";
import { packAlt, packSrc } from "@/lib/media";
import type { Address, Order, useStore } from "@/lib/store";

/** The four panels of the account page: orders, routine, addresses and preferences. */

function PackThumb({ p }: { p: Product }) {
  return (
    <span className="relative block h-[84px] w-[68px] shrink-0 bg-off">
      <Image src={packSrc(p)} alt={packAlt(p)} fill sizes="68px" className="object-contain p-1.5" />
    </span>
  );
}

export function OrdersTab({ orders }: { orders: Order[] }) {
  if (orders.length === 0)
    return (
      <div>
        <p className="text-[1.25rem]">No orders yet.</p>
        <Link href="/shop" className="btn mt-6">
          Shop all products
        </Link>
      </div>
    );
  return (
    <ul>
      {orders.map((o) => (
        <li key={o.id} className="border-b border-line py-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="tnum text-[1.125rem]">{o.id}</p>
            <p className="text-[0.8125rem] text-graphite">
              {new Date(o.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} · Confirmed ·{" "}
              <span className="tnum text-charcoal">{formatINR(o.total)}</span>
            </p>
          </div>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {o.lines.map((l) => {
              const p = PRODUCT_BY_SLUG[l.slug];
              return p ? (
                <li key={l.slug + l.option}>
                  <Link href={`/products/${p.slug}`} aria-label={`${p.name} × ${l.qty}${l.subscribe ? ", monthly" : ""}`}>
                    <PackThumb p={p} />
                  </Link>
                </li>
              ) : null;
            })}
          </ul>
        </li>
      ))}
    </ul>
  );
}

/** Times of day, matched against each product's "how to take" text. */
const SLOTS = [
  { id: "morning", label: "Morning", test: /breakfast|morning/i },
  { id: "meals", label: "Around meals", test: /meal|chai/i },
  { id: "evening", label: "Evening", test: /dinner|evening|bed|sleep/i },
  { id: "as-needed", label: "As needed", test: /as needed|heat|activity|late nights|travel/i },
] as const;

/** Slots a product belongs in; "Around meals" when its directions name no time. */
function slotsFor(p: Product): string[] {
  const matched = SLOTS.filter((slot) => slot.test.test(p.howToTake)).map((slot) => slot.id);
  return matched.length ? matched : ["meals"];
}

/** The shopper's products (ordered, in the cart or saved) laid out as a day, from each pack's directions. */
export function RoutineTab({ products }: { products: Product[] }) {
  return (
    <>
      <p className="max-w-[56ch] text-[1rem] leading-snug text-graphite">
        Your formulas laid out as a day, from the directions on each pack. Check the safety notes on each product page before combining formulas.
      </p>
      {products.length === 0 ? (
        <p className="mt-6 bg-off p-5 text-[1rem]">
          Add a product to your cart or wishlist and it will appear here.{" "}
          <Link href="/shop" className="link-u">
            Shop
          </Link>
        </p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {SLOTS.map((slot) => {
            const items = products.filter((p) => slotsFor(p).includes(slot.id));
            return (
              <div key={slot.id}>
                <h2 className="label border-b border-charcoal pb-2">{slot.label}</h2>
                {items.length === 0 ? (
                  <p className="mt-3 text-[0.875rem] text-graphite">Nothing here.</p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {items.map((p) => (
                      <li key={p.slug} className="flex gap-3">
                        <PackThumb p={p} />
                        <span className="min-w-0">
                          <Link href={`/products/${p.slug}`} className="block text-[1rem] leading-tight hover:underline">
                            {p.name}
                          </Link>
                          <span className="mt-1 block text-[0.8125rem] leading-snug text-graphite">{p.howToTake}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export function AddressesTab({ addresses }: { addresses: Address[] }) {
  if (addresses.length === 0) return <p className="text-[1.0625rem]">Addresses you use at checkout are saved here.</p>;
  return (
    <div className="grid gap-1.5 sm:grid-cols-2">
      {addresses.map((a, i) => (
        <div key={a.pin + a.line1} className="bg-off p-5 text-[1rem] leading-relaxed">
          {i === 0 && <p className="label mb-2 text-graphite">Default</p>}
          <p>{a.name}</p>
          <p>{a.line1}</p>
          <p>
            {a.city}, {a.state} <span className="tnum">{a.pin}</span>
          </p>
          <p className="tnum text-graphite">{a.phone}</p>
        </div>
      ))}
    </div>
  );
}

type StoreState = ReturnType<typeof useStore.getState>;

const PREFERENCES = [
  ["veg", "Show vegetarian products first", "Non-vegetarian products stay visible and clearly marked."],
  ["reminders", "Refill reminders", "A note five days before a pack runs out."],
  ["newsletter", "Label notes by email", "New products and label changes, once a month at most."],
] as const;

export function PreferencesTab({ prefs, setPrefs, profile }: { prefs: StoreState["prefs"]; setPrefs: StoreState["setPrefs"]; profile: NonNullable<StoreState["profile"]> }) {
  return (
    <div className="max-w-[640px]">
      {PREFERENCES.map(([key, label, hint]) => (
        <label key={key} className="check items-start border-b border-line !py-4">
          <input type="checkbox" checked={prefs[key]} onChange={(e) => setPrefs({ [key]: e.target.checked })} className="mt-0.5 shrink-0" />
          <span>
            <span className="block text-[1rem]">{label}</span>
            <span className="text-[0.8125rem] text-graphite">{hint}</span>
          </span>
        </label>
      ))}
      <p className="mt-6 text-[0.875rem] text-graphite">
        {profile.email}
        {profile.phone ? ` · ${profile.phone}` : ""}
      </p>
    </div>
  );
}
