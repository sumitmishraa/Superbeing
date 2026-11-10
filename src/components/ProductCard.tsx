"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatINR, type Product } from "@/data/products";
import { packAlt, plinthSrc, priceRange } from "@/lib/media";
import { useStore } from "@/lib/store";
import { Icon, WishlistButton } from "@/components/ui";

/** Card after the reference: plinth shot that turns to the back on hover, action icons, brand line, name, price range. */
export function ProductCard({ product: p, priority, featured }: { product: Product; priority?: boolean; featured?: boolean }) {
  const live = p.status === "live";
  const quick = useStore((s) => s.setQuickShop);
  const add = useStore((s) => s.addToCart);
  const sizes = "(min-width:1280px) 24vw, (min-width:640px) 45vw, 90vw";
  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative overflow-hidden rounded-lg bg-snow">
        <Link href={`/products/${p.slug}`} className="relative block aspect-square" aria-label={`${p.name}, ${live ? priceRange(p, formatINR) : "coming soon"}`}>
          <Image
            src={plinthSrc(p)}
            alt={packAlt(p)}
            fill
            priority={priority}
            sizes={sizes}
            data-pack={p.slug}
            className={`object-cover transition-[transform,opacity] duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04] ${live ? "group-hover:opacity-0" : ""}`}
          />
          {live && (
            <Image
              src={plinthSrc(p, true)}
              alt=""
              fill
              sizes={sizes}
              className="scale-[1.04] object-cover opacity-0 transition-[transform,opacity] duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-100 group-hover:opacity-100"
            />
          )}
        </Link>
        {!live && <span className="absolute top-3 left-3 rounded-full bg-[#7a7678] px-3 py-1 text-[0.75rem] text-snow">Coming soon</span>}
        <div className="absolute top-3 right-3 flex flex-col gap-2 transition-[transform,opacity] duration-300 lg:translate-x-3 lg:opacity-0 lg:group-focus-within:translate-x-0 lg:group-focus-within:opacity-100 lg:group-hover:translate-x-0 lg:group-hover:opacity-100">
          <WishlistButton slug={p.slug} name={p.name} className="!size-9 rounded-full bg-snow text-charcoal shadow-sm hover:text-accent" />
          {live && (
            <>
              <button type="button" onClick={() => quick(p.slug)} className="grid size-9 place-items-center rounded-full bg-snow text-charcoal shadow-sm hover:text-accent" aria-label={`Quick view ${p.name}`}>
                <Icon.Eye className="size-[18px]" />
              </button>
              <button
                type="button"
                onClick={() => add(p.slug, { option: "standard", open: true })}
                className="grid size-9 place-items-center rounded-full bg-snow text-charcoal shadow-sm hover:text-accent"
                aria-label={`Add ${p.name} to cart`}
              >
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
              <button type="button" onClick={() => quick(p.slug)} className="btn btn-sm">
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

/** Horizontal carousel: scroll-snap track with mouse drag, arrows and page dots. */
export function Carousel({ children, label, perView = "basis-[72%] sm:basis-[45%] lg:basis-[23.5%]" }: { children: React.ReactNode[]; label: string; perView?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => {
      setPages(Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth - 0.05)));
      setPage(Math.round(el.scrollLeft / el.clientWidth));
    };
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [children.length]);

  const go = (d: number) => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: Math.max(0, Math.min(el.scrollWidth, el.scrollLeft + d * el.clientWidth)), behavior: "smooth" });
  };
  const release = () => {
    if (!track.current) return;
    track.current.style.scrollSnapType = "";
    track.current.style.scrollBehavior = "";
  };

  return (
    <div className="relative" role="region" aria-roledescription="carousel" aria-label={label}>
      <div
        ref={track}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth select-none"
        data-lenis-prevent-horizontal
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || !track.current) return;
          drag.current = { x: e.clientX, left: track.current.scrollLeft, moved: false };
          track.current.style.scrollSnapType = "none";
          track.current.style.scrollBehavior = "auto";
        }}
        onPointerMove={(e) => {
          if (!drag.current || !track.current) return;
          const dx = e.clientX - drag.current.x;
          if (Math.abs(dx) > 4) drag.current.moved = true;
          track.current.scrollLeft = drag.current.left - dx;
        }}
        onPointerUp={() => {
          release();
          window.setTimeout(() => (drag.current = null), 0);
        }}
        onPointerLeave={() => {
          release();
          drag.current = null;
        }}
        onClickCapture={(e) => {
          if (drag.current?.moved) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {children.map((c, i) => (
          <div key={i} className={`shrink-0 snap-start ${perView}`}>
            {c}
          </div>
        ))}
      </div>
      {pages > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute top-[38%] -left-3 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-snow text-charcoal shadow-sm transition-colors hover:border-accent hover:text-accent disabled:opacity-0 lg:grid"
            disabled={page === 0}
            aria-label="Previous"
          >
            <Icon.ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute top-[38%] -right-3 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-snow text-charcoal shadow-sm transition-colors hover:border-accent hover:text-accent disabled:opacity-0 lg:grid"
            disabled={page >= pages - 1}
            aria-label="Next"
          >
            <Icon.ChevronRight className="size-5" />
          </button>
          <div className="mt-6 flex justify-center gap-2" aria-hidden>
            {Array.from({ length: pages }, (_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === page ? "w-6 bg-accent" : "w-1.5 bg-[#cfcacd]"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
