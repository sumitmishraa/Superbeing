"use client";

import Image from "next/image";
import { useState } from "react";
import { FREE_SHIPPING_AT, doseCount, formatINR, type Product } from "@/data/products";
import { doseFor, etaLabel, ingredientImage } from "@/lib/media";
import { useHydrated, type PackOption } from "@/lib/store";
import { AddToCart, Icon, PackSizePicker, VegMark, WishlistButton } from "@/components/ui";
import { Accordion } from "./Accordion";
import { DoseLabel } from "./DoseLabel";
import { NotifyForm } from "./NotifyForm";

/**
 * Product text column: name and price, key ingredients, claims, the full label, the safety box,
 * then either the buy controls (live) or the Notify me form (coming soon).
 */

/** Up to four key-ingredient tiles; hovering or tapping one shows its dose per serve. */
function KeyIngredients({ p, keys }: { p: Product; keys: string[] }) {
  const [active, setActive] = useState(0);
  return (
    <div className="mt-6">
      <ul className="flex flex-wrap gap-2" aria-label="Key ingredients">
        {keys.map((k, i) => (
          <li key={k}>
            <button
              type="button"
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              aria-pressed={active === i}
              aria-label={`${k}${doseFor(p, k) ? `, ${doseFor(p, k)} per serve` : ""}`}
              className={`relative block size-14 bg-off transition-[outline-color] duration-200 outline outline-1 -outline-offset-1 ${active === i ? "outline-charcoal" : "outline-transparent"}`}
            >
              <Image src={ingredientImage(k)} alt="" fill sizes="56px" className="object-contain p-1.5" />
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[0.875rem]" aria-live="polite">
        {keys[active]}
        {doseFor(p, keys[active]) ? <span className="tnum text-graphite"> · {doseFor(p, keys[active])} per serve</span> : null}
      </p>
    </div>
  );
}

/** Veg mark, allergens, front-of-pack warning and safety lines. Always shown, live or not. */
function SafetyNote({ p }: { p: Product }) {
  return (
    <div className="mt-5 space-y-1.5 bg-off p-4 text-[0.875rem] leading-snug" role="note" aria-label="Safety and allergens">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <VegMark diet={p.diet} />
        {p.allergens.length > 0 && <span>Allergens: {p.allergens.join(", ")}</span>}
      </div>
      {p.frontOfPackNote && <p className="font-semibold">{p.frontOfPackNote}.</p>}
      {p.status === "live" && p.safety.map((s) => <p key={s}>{s}</p>)}
      <p className="text-graphite">Food supplement. Not for medicinal use. Do not exceed the stated serve.</p>
    </div>
  );
}

type BuyState = {
  option: PackOption;
  setOption: (o: PackOption) => void;
  subscribe: boolean;
  setSubscribe: (v: boolean) => void;
  /** Price of one pack with the chosen option and monthly saving. */
  price: number;
};

/** Delivery estimate, pack size, monthly option, Add to cart and Save to wishlist. */
function BuyControls({ p, option, setOption, subscribe, setSubscribe, price, buyRef }: BuyState & { p: Product; buyRef: React.Ref<HTMLDivElement> }) {
  const hydrated = useHydrated();
  // The date depends on the visitor's clock, so it is only filled in after hydration.
  const eta = hydrated ? etaLabel() : "";
  return (
    <div ref={buyRef} className="mt-6 space-y-4">
      <p className="flex flex-wrap items-center gap-2 text-[0.9375rem] text-charcoal">
        <Icon.Truck className="size-5" /> Get it by <span className="underline">{eta || "in 3 to 5 days"}</span>
        <span className="text-[0.8125rem] text-graphite">(estimate)</span>
      </p>
      <p className="flex items-center gap-2 text-[0.9375rem] text-charcoal">
        <Icon.Check className="size-5 text-veg" /> Cash or UPI on delivery
      </p>
      <PackSizePicker product={p} option={option} onChange={setOption} />
      <label className="check !py-0">
        <input type="checkbox" checked={subscribe} onChange={(e) => setSubscribe(e.target.checked)} />
        Deliver every month, 15% off. Skip or stop from your account.
      </label>
      <div className="flex items-stretch gap-2">
        <div className="flex min-w-[150px] flex-1 flex-col justify-center rounded-xl border border-charcoal px-4 py-3 text-[0.875rem] text-charcoal">
          <span className="flex items-center gap-2 font-semibold">
            <Icon.Truck className="size-4 text-accent" /> Free delivery
          </span>
          <span className="text-graphite">on orders over {formatINR(FREE_SHIPPING_AT)}</span>
        </div>
        <AddToCart product={p} option={option} subscribe={subscribe} withPrice={price} className="!min-h-16 flex-[1.4] !text-[1.0625rem]" />
      </div>
      <div className="flex items-center gap-2">
        <WishlistButton slug={p.slug} name={p.name} className="!size-10 rounded-full border border-line" />
        <span className="text-[0.875rem]">Save to wishlist</span>
      </div>
    </div>
  );
}

/** `buyRef` marks the buy controls so the page can show the sticky bar once they scroll away. */
export function BuyBox({ p, buyRef, ...buy }: BuyState & { p: Product; buyRef: React.Ref<HTMLDivElement> }) {
  const live = p.status === "live";
  const keys = live ? p.keyIngredients.slice(0, 4) : [];

  return (
    <div className="md:col-span-6">
      {live && (
        <p className="flex items-center gap-2 text-[0.875rem] text-accent">
          <Icon.Flask className="size-4" /> {doseCount(p)} actives, every dose on the label
        </p>
      )}
      <h1 className="mt-2 font-display text-[clamp(1.75rem,1.3rem+1.4vw,2.5rem)] leading-tight font-semibold">{p.name}</h1>
      {live && <p className="tnum mt-2 text-[1.5rem] text-charcoal">{formatINR(buy.price)}</p>}
      <p className="mt-2 text-[0.9375rem]">{p.format}</p>

      {live && keys.length > 0 && <KeyIngredients p={p} keys={keys} />}

      {live ? (
        <>
          <ul className="mt-6 space-y-1 text-[0.875rem]">
            {p.claims.map((c) => (
              <li key={c} className="flex gap-2">
                <span aria-hidden>•</span>
                {c}
              </li>
            ))}
          </ul>
          <p className="mt-5 max-w-[52ch] text-[1rem] leading-snug">{p.tagline}</p>
        </>
      ) : (
        <p className="mt-6 max-w-[52ch] text-[1rem] leading-snug">{p.availabilityNote ?? "This formula is in label review. We will share its full label when it is ready."}</p>
      )}

      {live && (
        <div className="mt-6 border-t border-line">
          <Accordion title="Full label" id="label">
            <DoseLabel product={p} />
          </Accordion>
          <Accordion title="How to take">
            <p className="text-[1rem] leading-snug">{p.howToTake}</p>
            <p className="mt-2 text-[0.875rem] text-graphite">{p.serve}.</p>
          </Accordion>
          <Accordion title="Why it is different">
            <p className="text-[1rem] leading-snug">{p.difference}</p>
          </Accordion>
        </div>
      )}

      <SafetyNote p={p} />

      {live ? (
        <BuyControls p={p} buyRef={buyRef} {...buy} />
      ) : (
        <div className="mt-8">
          <NotifyForm slug={p.slug} />
        </div>
      )}
    </div>
  );
}
