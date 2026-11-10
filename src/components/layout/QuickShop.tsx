"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PRODUCT_BY_SLUG, formatINR, doseCount } from "@/data/products";
import { packPrice } from "@/lib/pricing";
import { useStore, type PackOption } from "@/lib/store";
import { plinthSrc, packAlt } from "@/lib/media";
import { AddToCart, Icon, PackSizePicker, QtyStepper, VegMark } from "@/components/ui";
import { useModalAnimation } from "./useModalAnimation";

/** Quick shop modal (store.quickShop holds the slug): picture, price, pack, quantity and Add, without leaving the page. */
export function QuickShop() {
  const slug = useStore((s) => s.quickShop);
  const setSlug = useStore((s) => s.setQuickShop);
  const p = slug ? PRODUCT_BY_SLUG[slug] : null;
  const [option, setOption] = useState<PackOption>("standard");
  const [qty, setQty] = useState(1);
  const { box, scrim } = useModalAnimation(!!p);

  // Opening a different product starts again from the standard pack and a quantity of 1.
  const [lastSlug, setLastSlug] = useState(slug);
  if (slug !== lastSlug) {
    setLastSlug(slug);
    setOption("standard");
    setQty(1);
  }

  if (!p) return null;
  const close = () => setSlug(null);

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={`Quick shop: ${p.name}`}>
      <div ref={scrim} className="absolute inset-0 bg-charcoal/55" onClick={close} aria-hidden />
      <div ref={box} className="relative grid max-h-[calc(100svh-2rem)] w-full max-w-[880px] overflow-y-auto rounded-2xl bg-snow md:grid-cols-2" data-lenis-prevent>
        <button type="button" onClick={close} className="absolute top-2 right-2 z-10 grid size-11 place-items-center rounded-full bg-off text-charcoal" aria-label="Close">
          <Icon.Close className="size-5" />
        </button>
        <div className="relative aspect-[4/3] max-h-[34svh] bg-snow md:aspect-square md:max-h-none">
          <Image src={plinthSrc(p)} alt={packAlt(p)} fill sizes="440px" className="object-cover" data-pack={p.slug} />
        </div>
        <div className="flex flex-col gap-3 p-5 md:gap-4 md:p-8">
          <h2 className="h-section text-[1.625rem]">{p.name}</h2>
          <p className="tnum text-[1.25rem] text-charcoal">{formatINR(packPrice(p, option))}</p>
          <p className="text-[0.9375rem]">{p.tagline}</p>
          <p className="flex items-center gap-3 text-[0.875rem]">
            <VegMark diet={p.diet} /> <span>{doseCount(p)} actives, every dose on the label</span>
          </p>
          <PackSizePicker product={p} option={option} onChange={setOption} />
          <div className="mt-auto flex items-center gap-2">
            <QtyStepper value={qty} onChange={setQty} label={p.name} />
            <AddToCart product={p} qty={qty} option={option} className="flex-1" />
          </div>
          <Link href={`/products/${p.slug}`} onClick={close} className="link-u text-[0.9375rem]">
            View full details
          </Link>
        </div>
      </div>
    </div>
  );
}
