"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { NEEDS, PRODUCTS } from "@/data/products";
import { useStore } from "@/lib/store";
import { packSrc, packAlt } from "@/lib/media";
import { Logo } from "@/components/ui";
import { gsap, reduceMotion } from "@/lib/gsap";
import { useOverlay } from "./useOverlay";

const LIVE = PRODUCTS.filter((p) => p.status === "live");

/** Endless strip of packs: the track holds two copies and loops by half its width. */
export function PackMarquee({ height = 120, speed = 45, className = "" }: { height?: number; speed?: number; className?: string }) {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!track.current || reduceMotion()) return;
    const el = track.current;
    const tw = gsap.to(el, { xPercent: -50, duration: speed, ease: "none", repeat: -1 });
    const slow = () => gsap.to(tw, { timeScale: 0.2, duration: 0.6 });
    const fast = () => gsap.to(tw, { timeScale: 1, duration: 0.6 });
    el.addEventListener("pointerenter", slow);
    el.addEventListener("pointerleave", fast);
    return () => {
      tw.kill();
      el.removeEventListener("pointerenter", slow);
      el.removeEventListener("pointerleave", fast);
    };
  }, [speed]);
  return (
    <div className={`overflow-hidden ${className}`}>
      <div ref={track} className="flex w-max items-end">
        {[0, 1].map((copy) =>
          LIVE.map((p) => (
            <Link
              key={`${copy}-${p.slug}`}
              href={`/products/${p.slug}`}
              tabIndex={copy ? -1 : undefined}
              aria-hidden={copy ? true : undefined}
              className="group block shrink-0 px-3"
              style={{ height }}
            >
              <Image
                src={packSrc(p)}
                alt={copy ? "" : packAlt(p)}
                width={Math.round(height * 0.8)}
                height={height}
                className="h-full w-auto object-contain transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-2"
              />
            </Link>
          )),
        )}
      </div>
    </div>
  );
}

export function MenuOverlay() {
  const open = useStore((s) => s.menuOpen);
  const setOpen = useStore((s) => s.setMenuOpen);
  const profile = useStore((s) => s.profile);
  const [active, setActive] = useState(-1);
  const { panel } = useOverlay<HTMLDivElement>(open, "drop", (el) => el.querySelector<HTMLElement>("[data-close]")?.focus());
  const counts = Object.fromEntries(NEEDS.map((n) => [n.id, PRODUCTS.filter((p) => p.need === n.id).length]));

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label="Shop by need"
      style={{ display: "none" }}
      className="invisible fixed inset-0 z-50 flex flex-col overflow-y-auto bg-snow"
      data-lenis-prevent
    >
      <div className="wrap flex h-[var(--header-h)] w-full shrink-0 items-center justify-between">
        <Link href="/" onClick={() => setOpen(false)} aria-label="Superbeing Nutrition, home">
          <Logo className="h-9 md:h-11" />
        </Link>
        <button type="button" data-close onClick={() => setOpen(false)} className="btn !min-h-9 !px-3 !text-[0.8125rem]">
          Close
        </button>
      </div>

      <div className="wrap grid w-full flex-1 gap-10 py-8 md:grid-cols-12 md:py-12">
        <nav aria-label="Pages" className="order-2 flex flex-col gap-2 text-[1rem] md:order-1 md:col-span-3">
          {[
            ["/shop", "Shop all"],
            ["/shop?status=coming-soon", "Coming soon"],
            ["/wishlist", "Wishlist"],
            ["/cart", "Cart"],
            [profile ? "/account" : "/login", profile ? "Account" : "Log in"],
            ["/contact", "Contact"],
          ].map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="nav-link self-start" data-overlay-item>
              {label}
            </Link>
          ))}
        </nav>
        <ul className="order-1 md:order-2 md:col-span-8 md:col-start-5" onPointerLeave={() => setActive(-1)}>
          {NEEDS.map((n, i) => (
            <li key={n.id} className="overflow-hidden" data-overlay-item>
              <Link
                href={`/shop?need=${n.id}`}
                onClick={() => setOpen(false)}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className={`flex items-start gap-3 py-0.5 text-[clamp(1.75rem,1rem+3vw,3.25rem)] leading-[1.05] uppercase transition-colors duration-300 ${
                  active === i || active === -1 ? "text-charcoal" : "text-[#b4b4b4]"
                }`}
              >
                {n.name}
                <span className={`mt-[0.5em] text-[0.8125rem] normal-case transition-opacity duration-300 ${active === i ? "opacity-100" : "opacity-0"}`}>
                  {counts[n.id]} {counts[n.id] === 1 ? "product" : "products"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="w-full shrink-0 pb-6" data-overlay-item>
        {open && <PackMarquee height={128} />}
      </div>
    </div>
  );
}
