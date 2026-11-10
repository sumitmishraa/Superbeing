"use client";

import Image from "next/image";
import { useState } from "react";
import { PRODUCT_BY_SLUG, formatINR } from "@/data/products";
import { packPrice } from "@/lib/pricing";
import { useHydrated, type PackOption } from "@/lib/store";
import { SCENES, etaLabel } from "@/lib/media";
import { AddToCart, Icon, PackSizePicker } from "@/components/ui";

/** "New!": one featured product (Collagen Glow Matrix) with its pack choice and Add to cart. */
export function NewFeature() {
  const p = PRODUCT_BY_SLUG["collagen-glow-matrix"];
  const [option, setOption] = useState<PackOption>("standard");
  const hydrated = useHydrated();
  // The date depends on the visitor's clock, so it is only filled in after hydration.
  const eta = hydrated ? etaLabel() : "";

  return (
    <section className="wrap pt-16 md:pt-24" aria-labelledby="new-title">
      <h2 id="new-title" className="sec-title" data-rise>
        New!
      </h2>
      <div className="mx-auto mt-10 grid max-w-[1100px] items-center gap-8 md:grid-cols-2 md:gap-12">
        <div className="relative aspect-square overflow-hidden rounded-lg" data-rise>
          <Image src={SCENES.feature.src} alt={SCENES.feature.alt} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" data-pack={p.slug} />
        </div>
        <div data-rise="0.1">
          <h3 className="font-display text-[clamp(1.5rem,1.2rem+1vw,2rem)] font-semibold">{p.name}</h3>
          <p className="tnum mt-1 text-[1.25rem] text-charcoal">{formatINR(packPrice(p, option))}</p>
          <p className="mt-4 text-[0.9375rem]">
            <strong className="text-charcoal">Beauty, from the inside:</strong> {p.tagline}
          </p>
          <p className="mt-4 flex flex-wrap items-center gap-2 text-[0.9375rem] text-charcoal">
            <Icon.Truck className="size-5" /> Get it by <span className="underline">{eta || "in 3–5 days"}</span> <span className="text-[0.8125rem] text-graphite">(estimate)</span>
          </p>
          <p className="mt-2 flex items-center gap-2 text-[0.9375rem] text-charcoal">
            <Icon.Check className="size-5 text-veg" /> Cash or UPI on delivery
          </p>
          <PackSizePicker product={p} option={option} onChange={setOption} className="mt-5" />
          <AddToCart product={p} option={option} className="mt-6 w-full" />
        </div>
      </div>
    </section>
  );
}
