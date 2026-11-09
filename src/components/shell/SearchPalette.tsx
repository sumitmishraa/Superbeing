"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatINR } from "@/data/products";
import { useStore } from "@/lib/store";
import { searchProducts, POPULAR_SEARCHES } from "@/lib/search";
import { packSrc, packAlt } from "@/lib/media";
import { Logo } from "@/components/ui";
import { useOverlay } from "./useOverlay";
import { PackMarquee } from "./MenuOverlay";

export function SearchPalette() {
  const open = useStore((s) => s.searchOpen);
  const setOpen = useStore((s) => s.setSearchOpen);
  const router = useRouter();
  const [q, setQ] = useState("");
  const { panel } = useOverlay<HTMLDivElement>(open, "drop", (el) => window.setTimeout(() => el.querySelector<HTMLInputElement>("input")?.focus(), 60));
  const results = q.trim() ? searchProducts(q, 8) : [];
  const close = () => setOpen(false);

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      style={{ display: "none" }}
      className="invisible fixed inset-0 z-50 flex flex-col overflow-y-auto bg-snow"
      data-lenis-prevent
    >
      <div className="wrap flex h-[var(--header-h)] w-full shrink-0 items-center justify-between">
        <Link href="/" onClick={close} aria-label="Superbeing Nutrition, home">
          <Logo className="h-9 md:h-11" />
        </Link>
        <button type="button" onClick={close} className="btn !min-h-9 !px-3 !text-[0.8125rem]">
          Close
        </button>
      </div>

      <div className="wrap w-full flex-1 pt-8 md:pt-14">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            if (!q.trim()) return;
            close();
            router.push(`/search?q=${encodeURIComponent(q.trim())}`);
          }}
          className="border-b border-charcoal"
          data-overlay-item
        >
          <label htmlFor="site-search" className="sr-only">
            Search products, ingredients or needs
          </label>
          <input
            id="site-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="SEARCH"
            autoComplete="off"
            className="w-full bg-transparent pb-3 text-[clamp(2rem,1rem+4vw,4.5rem)] leading-none uppercase outline-none placeholder:text-[#c4c4c4]"
          />
        </form>

        {!q.trim() ? (
          <div className="mt-8" data-overlay-item>
            <p className="label text-graphite">Popular</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              {POPULAR_SEARCHES.map((s) => (
                <button key={s} type="button" onClick={() => setQ(s)} className="nav-link text-[1.0625rem]">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8" aria-live="polite">
            <p className="label text-graphite">
              {results.length} {results.length === 1 ? "result" : "results"}
            </p>
            {results.length === 0 ? (
              <p className="mt-4 text-[1.0625rem]">Nothing matches “{q}”. Try an ingredient, such as magnesium or collagen.</p>
            ) : (
              <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
                {results.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/products/${p.slug}`} onClick={close} className="group block">
                      <div className="relative aspect-[4/5] bg-off">
                        <Image
                          src={packSrc(p)}
                          alt={packAlt(p)}
                          fill
                          sizes="(min-width:1024px) 12vw, 45vw"
                          className="object-contain p-3 transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      </div>
                      <p className="mt-2 text-[1rem] leading-tight">{p.name}</p>
                      <p className="tnum text-[0.8125rem] text-graphite">{p.status === "live" ? formatINR(p.price) : "Coming soon"}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="w-full shrink-0 pt-10 pb-6" data-overlay-item>
        <p className="wrap label mb-3 text-graphite">New in</p>
        {open && <PackMarquee height={112} speed={55} />}
      </div>
    </div>
  );
}
