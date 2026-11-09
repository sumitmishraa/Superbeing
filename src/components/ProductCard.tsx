"use client";

import Image from "next/image";
import Link from "next/link";
import { formatINR, type Product } from "@/data/products";
import { packAlt, packSrc } from "@/lib/media";
import { WishlistButton } from "@/components/ui";

/** Catalog tile from the reference: off-white field, heart in the corner, name and price below.
 *  Hovering a live product turns the pack round to its dose panel. */
export function ProductCard({ product: p, priority, tall }: { product: Product; priority?: boolean; tall?: boolean }) {
  const live = p.status === "live";
  const sizes = "(min-width:1280px) 24vw, (min-width:640px) 45vw, 90vw";
  return (
    <article className="group relative">
      <Link href={`/products/${p.slug}`} className="block" aria-label={`${p.name}, ${live ? formatINR(p.price) : "coming soon"}`}>
        <div className={`relative overflow-hidden bg-off ${tall ? "aspect-[3/4]" : "aspect-[4/5]"}`}>
          <Image
            src={packSrc(p)}
            alt={packAlt(p)}
            fill
            priority={priority}
            sizes={sizes}
            data-pack={p.slug}
            className={`object-contain p-[9%] transition-[transform,opacity] duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04] ${
              live ? "group-hover:opacity-0" : ""
            }`}
          />
          {live && (
            <Image
              src={packSrc(p, "back")}
              alt=""
              fill
              sizes={sizes}
              className="scale-[0.96] object-contain p-[9%] opacity-0 transition-[transform,opacity] duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-100 group-hover:opacity-100"
            />
          )}
          {!live && <span className="label absolute bottom-3 left-3 text-graphite">Label in review</span>}
        </div>
        <h3 className="mt-2.5 text-[1.0625rem] leading-tight">{p.name}</h3>
        <p className="tnum mt-0.5 text-[0.9375rem] text-graphite">{live ? formatINR(p.price) : "Coming soon"}</p>
      </Link>
      <WishlistButton slug={p.slug} name={p.name} className="absolute top-1 right-1" />
    </article>
  );
}
