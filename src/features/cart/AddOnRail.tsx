"use client";

import Image from "next/image";
import Link from "next/link";
import { useId } from "react";
import { NEED_BY_ID, formatINR } from "@/data/products";
import { perDayLabel, routineAddOns } from "@/lib/pricing";
import { plinthSrc, packAlt } from "@/lib/media";
import { useStore, type CartLine } from "@/lib/store";
import { Icon } from "@/components/ui";

/**
 * "Pairs with your routine": up to three live products that sit next to what is in the cart,
 * each with its cost per day and a one-tap Add. Suggestions only; nothing is added unless tapped.
 */
export function AddOnRail({ lines, title = "Pairs with your routine", className = "" }: { lines: CartLine[]; title?: string; className?: string }) {
  const add = useStore((s) => s.addToCart);
  const headingId = useId();
  const items = routineAddOns(lines, 3);
  if (lines.length === 0 || items.length === 0) return null;
  return (
    <section className={className} aria-labelledby={headingId}>
      <h2 id={headingId} className="label">
        {title}
      </h2>
      <p className="mt-0.5 text-[0.8125rem] text-graphite">Optional. Nothing is added unless you tap Add.</p>
      <ul className="no-scrollbar mt-3 flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-1" data-lenis-prevent>
        {items.map(({ product: p, perDay }) => (
          <li key={p.slug} className="w-[148px] shrink-0 snap-start overflow-hidden rounded-xl border border-line bg-snow">
            <Link href={`/products/${p.slug}`} className="relative block aspect-square bg-off">
              <Image src={plinthSrc(p)} alt={packAlt(p)} fill sizes="148px" className="object-cover" />
            </Link>
            <div className="p-2.5">
              <p className="text-[0.6875rem] tracking-[0.04em] text-graphite uppercase">{NEED_BY_ID[p.need].short}</p>
              <p className="line-clamp-2 min-h-[2.5em] text-[0.8125rem] leading-tight font-medium text-charcoal">{p.name}</p>
              <p className="tnum mt-1 text-[0.8125rem] text-save">{perDayLabel(perDay)}</p>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span className="tnum text-[0.875rem] text-charcoal">{formatINR(p.price)}</span>
                <button
                  type="button"
                  onClick={() => add(p.slug, { open: false })}
                  className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 font-display text-[0.8125rem] font-semibold tracking-[0.03em] text-accent uppercase shadow-[inset_0_0_0_1.5px_var(--accent)] transition-colors hover:bg-accent hover:text-snow"
                  aria-label={`Add ${p.name}, ${formatINR(p.price)}, to cart`}
                >
                  <Icon.Plus className="size-3.5" /> Add
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
