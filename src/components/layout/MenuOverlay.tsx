"use client";

import Link from "next/link";
import { useState } from "react";
import { NEEDS, PRODUCTS } from "@/data/products";
import { useStore } from "@/lib/store";
import { Logo, PackMarquee } from "@/components/ui";
import { useOverlay } from "./useOverlay";

/** Full-screen menu opened from the header's menu button (phones): needs in large type, page links and a pack strip. */

/** Products per need, coming-soon included. */
const COUNTS = Object.fromEntries(NEEDS.map((n) => [n.id, PRODUCTS.filter((p) => p.need === n.id).length]));

export function MenuOverlay() {
  const open = useStore((s) => s.menuOpen);
  const setOpen = useStore((s) => s.setMenuOpen);
  const profile = useStore((s) => s.profile);
  const [hovered, setHovered] = useState(-1);
  const { panel } = useOverlay<HTMLDivElement>(open, "drop", (el) => el.querySelector<HTMLElement>("[data-close]")?.focus());
  const close = () => setOpen(false);

  const pages = [
    ["/shop", "Shop all"],
    ["/shop?status=coming-soon", "Coming soon"],
    ["/wishlist", "Wishlist"],
    ["/cart", "Cart"],
    [profile ? "/account" : "/login", profile ? "Account" : "Log in"],
    ["/contact", "Contact"],
  ];

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
        <Link href="/" onClick={close} aria-label="Superbeing Nutrition, home">
          <Logo className="h-9 md:h-11" />
        </Link>
        <button type="button" data-close onClick={close} className="btn !min-h-9 !px-3 !text-[0.8125rem]">
          Close
        </button>
      </div>

      <div className="wrap grid w-full flex-1 gap-10 py-8 md:grid-cols-12 md:py-12">
        <nav aria-label="Pages" className="order-2 flex flex-col gap-2 text-[1rem] md:order-1 md:col-span-3">
          {pages.map(([href, label]) => (
            <Link key={href} href={href} onClick={close} className="nav-link self-start" data-overlay-item>
              {label}
            </Link>
          ))}
        </nav>
        {/* Hovering one need greys out the others and shows its product count. */}
        <ul className="order-1 md:order-2 md:col-span-8 md:col-start-5" onPointerLeave={() => setHovered(-1)}>
          {NEEDS.map((n, i) => (
            <li key={n.id} className="overflow-hidden" data-overlay-item>
              <Link
                href={`/shop?need=${n.id}`}
                onClick={close}
                onPointerEnter={() => setHovered(i)}
                onFocus={() => setHovered(i)}
                className={`flex items-start gap-3 py-0.5 text-[clamp(1.75rem,1rem+3vw,3.25rem)] leading-[1.05] uppercase transition-colors duration-300 ${
                  hovered === i || hovered === -1 ? "text-charcoal" : "text-[#b4b4b4]"
                }`}
              >
                {n.name}
                <span className={`mt-[0.5em] text-[0.8125rem] normal-case transition-opacity duration-300 ${hovered === i ? "opacity-100" : "opacity-0"}`}>
                  {COUNTS[n.id]} {COUNTS[n.id] === 1 ? "product" : "products"}
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
