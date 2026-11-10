"use client";

import Image from "next/image";
import Link from "next/link";
import { formatINR, type Product } from "@/data/products";
import { packAlt, plinthSrc, priceRange } from "@/lib/media";
import { useStore } from "@/lib/store";
import { Icon } from "./icons";
import { WishlistButton } from "./WishlistButton";

const CARD_IMAGE_SIZES = "(min-width:1280px) 24vw, (min-width:640px) 45vw, 90vw";
const ROUND_ACTION = "grid size-9 place-items-center rounded-full bg-snow text-charcoal shadow-sm hover:text-accent";

/**
 * Product tile: plinth shot that turns to the back of the pack on hover, wishlist / quick view /
 * add icons, brand line, name and price range. `featured` adds a Quick shop (or Read more) button.
 */
export function ProductCard({ product: p, priority, featured }: { product: Product; priority?: boolean; featured?: boolean }) {
  const live = p.status === "live";
  const openQuickShop = useStore((s) => s.setQuickShop);
  const add = useStore((s) => s.addToCart);

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative overflow-hidden rounded-lg bg-snow">
        <Link href={`/products/${p.slug}`} className="relative block aspect-square" aria-label={`${p.name}, ${live ? priceRange(p, formatINR) : "coming soon"}`}>
          <Image
            src={plinthSrc(p)}
            alt={packAlt(p)}
            fill
            priority={priority}
            sizes={CARD_IMAGE_SIZES}
            data-pack={p.slug}
            className={`object-cover transition-[transform,opacity] duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04] ${live ? "group-hover:opacity-0" : ""}`}
          />
          {live && (
            <Image
              src={plinthSrc(p, true)}
              alt=""
              fill
              sizes={CARD_IMAGE_SIZES}
              className="scale-[1.04] object-cover opacity-0 transition-[transform,opacity] duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-100 group-hover:opacity-100"
            />
          )}
        </Link>
        {!live && <span className="absolute top-3 left-3 rounded-full bg-[#7a7678] px-3 py-1 text-[0.75rem] text-snow">Coming soon</span>}
        <div className="absolute top-3 right-3 flex flex-col gap-2 transition-[transform,opacity] duration-300 lg:translate-x-3 lg:opacity-0 lg:group-focus-within:translate-x-0 lg:group-focus-within:opacity-100 lg:group-hover:translate-x-0 lg:group-hover:opacity-100">
          <WishlistButton slug={p.slug} name={p.name} className="!size-9 rounded-full bg-snow text-charcoal shadow-sm hover:text-accent" />
          {live && (
            <>
              <button type="button" onClick={() => openQuickShop(p.slug)} className={ROUND_ACTION} aria-label={`Quick view ${p.name}`}>
                <Icon.Eye className="size-[18px]" />
              </button>
              <button type="button" onClick={() => add(p.slug, { option: "standard", open: true })} className={ROUND_ACTION} aria-label={`Add ${p.name} to cart`}>
                <Icon.Bag className="size-[18px]" />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col pt-3">
        <p className="text-[0.8125rem] text-graphite">Superbeing</p>
        <h3 className="mt-0.5 text-[0.9375rem] leading-snug font-medium text-charcoal">
          <Link href={`/products/${p.slug}`} className="hover:text-accent">
            {p.name}
          </Link>
        </h3>
        <p className="tnum mt-1 text-[0.875rem] text-body">{live ? priceRange(p, formatINR) : "Coming soon"}</p>
        {featured && (
          <div className="mt-3">
            {live ? (
              <button type="button" onClick={() => openQuickShop(p.slug)} className="btn btn-sm">
                Quick shop
              </button>
            ) : (
              <Link href={`/products/${p.slug}`} className="btn btn-sm btn-outline">
                Read more
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
