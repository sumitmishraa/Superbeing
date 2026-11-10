"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LIVE_PRODUCTS, NEEDS, NEED_BY_ID, PRODUCT_BY_SLUG, formatINR } from "@/data/products";
import { NEED_TILE, packAlt, plinthSrc, priceRange } from "@/lib/media";
import { gsap, reduceMotion } from "@/lib/gsap";
import { Icon } from "@/components/ui";

/** Desktop mega-menus under "Shop" and "The Range": a panel that opens on hover or keyboard focus. */

/** One top-level menu item and its full-width panel. */
function MegaMenu({ label, href, children }: { label: string; href: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number>(0);

  useEffect(() => {
    if (!panel.current) return;
    if (open) {
      gsap.set(panel.current, { display: "block" });
      if (!reduceMotion()) gsap.fromTo(panel.current, { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: "expo.out" });
      else gsap.set(panel.current, { autoAlpha: 1 });
    } else gsap.to(panel.current, { autoAlpha: 0, duration: 0.15, onComplete: () => void gsap.set(panel.current, { display: "none" }) });
  }, [open]);

  return (
    <div
      className="static"
      onPointerEnter={() => {
        window.clearTimeout(closeTimer.current);
        setOpen(true);
      }}
      // A short delay lets the pointer cross the gap between the link and the panel.
      onPointerLeave={() => (closeTimer.current = window.setTimeout(() => setOpen(false), 120))}
      onFocus={() => setOpen(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setOpen(false)}
    >
      <Link href={href} className="nav-link flex items-center gap-1" aria-expanded={open}>
        {label}
        <Icon.Chevron className={`size-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </Link>
      <div ref={panel} className="absolute inset-x-0 top-full hidden border-t border-line bg-snow opacity-0 shadow-[0_18px_40px_-24px_rgba(0,0,0,.25)]">
        <div className="wrap py-8" onClick={() => setOpen(false)}>
          {children}
        </div>
      </div>
    </div>
  );
}

const SHOP_FORMATS = [
  ["sachet", "Powder sachets"],
  ["stick", "Stick sachets"],
  ["melt", "Mouth melts"],
  ["tablet", "Tablets"],
  ["softgel", "Softgels"],
];
const FEATURED = ["bloat-gut-reset", "night-recovery-magnesium"].map((slug) => PRODUCT_BY_SLUG[slug]);
const RANGE_NEEDS = ["gut", "sleep", "stress", "hydration", "beauty"] as const;

/** "Shop": by need, by format, and two featured products. */
export function ShopMenu() {
  return (
    <MegaMenu label="Shop" href="/shop">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-3">
          <p className="label mb-3">Shop by need</p>
          <ul className="grid gap-1.5">
            {NEEDS.map((n) => (
              <li key={n.id}>
                <Link href={`/shop?need=${n.id}`} className="nav-link text-[0.9375rem]">
                  {n.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-3">
          <p className="label mb-3">Shop by format</p>
          <ul className="grid gap-1.5">
            {SHOP_FORMATS.map(([format, label]) => (
              <li key={format}>
                <Link href={`/shop?format=${format}`} className="nav-link text-[0.9375rem]">
                  {label}
                </Link>
              </li>
            ))}
            <li className="mt-3">
              <Link href="/shop" className="link-u text-[0.9375rem]">
                Shop all {LIVE_PRODUCTS.length} products
              </Link>
            </li>
          </ul>
        </div>
        {FEATURED.map((p) => (
          <Link key={p.slug} href={`/products/${p.slug}`} className="group col-span-3">
            <span className="relative block aspect-square overflow-hidden rounded-lg">
              <Image src={plinthSrc(p)} alt={packAlt(p)} fill sizes="300px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </span>
            <span className="mt-3 block text-[0.9375rem] text-charcoal">{p.name}</span>
            <span className="tnum text-[0.875rem]">{priceRange(p, formatINR)}</span>
          </Link>
        ))}
      </div>
    </MegaMenu>
  );
}

/** "The Range": five need tiles plus links to the comparison table and FAQs. */
export function RangeMenu() {
  return (
    <MegaMenu label="The Range" href="/the-range">
      <div className="grid grid-cols-5 gap-5">
        {RANGE_NEEDS.map((id) => {
          const tile = NEED_TILE[id]!;
          return (
            <Link key={id} href={`/shop?need=${id}`} className="group">
              <span className="relative block aspect-[4/3] overflow-hidden rounded-lg">
                <Image src={tile.src} alt={tile.alt} fill sizes="240px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </span>
              <span className="mt-2 block font-display text-[1rem] font-semibold text-charcoal uppercase">{NEED_BY_ID[id].name}</span>
            </Link>
          );
        })}
      </div>
      <div className="mt-6 flex gap-6 text-[0.9375rem]">
        <Link href="/the-range#compare" className="link-u">
          Compare every formula
        </Link>
        <Link href="/the-range#faq" className="link-u">
          FAQs
        </Link>
      </div>
    </MegaMenu>
  );
}
