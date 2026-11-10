"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStore, useHydrated, cartTotals } from "@/lib/store";
import { gsap, ScrollTrigger, reduceMotion } from "@/lib/gsap";
import { Icon, Logo } from "@/components/ui";
import { AnnouncementBar } from "./AnnouncementBar";
import { RangeMenu, ShopMenu } from "./MegaMenu";

/**
 * Sticky site header: announcement bar, logo, main navigation with mega-menus (desktop), menu
 * button (phones), and search, account, wishlist and cart buttons. Shrinks after 80px of scroll.
 */

/** Cart count badge; pops when the number changes. */
function CartCount({ n }: { n: number }) {
  const badge = useRef<HTMLSpanElement>(null);
  const previous = useRef(n);
  useEffect(() => {
    if (previous.current !== n && badge.current && !reduceMotion())
      gsap.fromTo(badge.current, { scale: 1.6 }, { scale: 1, duration: 0.6, ease: "back.out(3)", delay: 0.5 });
    previous.current = n;
  }, [n]);
  return (
    <span ref={badge} className="tnum absolute -top-1 -right-1 grid size-[18px] place-items-center rounded-full bg-accent text-[0.6875rem] font-semibold text-snow">
      {n}
    </span>
  );
}

export function Header() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const cart = useStore((s) => s.cart);
  const profile = useStore((s) => s.profile);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const setSearchOpen = useStore((s) => s.setSearchOpen);
  const setMenuOpen = useStore((s) => s.setMenuOpen);
  const count = hydrated ? cartTotals(cart, null).count : 0;
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const st = ScrollTrigger.create({ start: 80, end: "max", onToggle: (self) => setCompact(self.isActive) });
    return () => st.kill();
  }, []);

  return (
    <>
      <AnnouncementBar />
      <header className={`sticky top-0 z-40 bg-snow transition-shadow duration-300 ${compact ? "shadow-[0_6px_24px_-12px_rgba(0,0,0,.18)]" : ""}`}>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-snow">
          Skip to content
        </a>
        <div className={`wrap-wide relative grid grid-cols-[1fr_auto_1fr] items-center transition-[height] duration-300 ${compact ? "h-[64px]" : "h-[var(--header-h)]"}`}>
          <div className="flex items-center gap-2">
            <button type="button" className="icon-btn -ml-2 lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-haspopup="dialog">
              <Icon.Menu className="size-6" />
            </button>
            <Link href="/" aria-label="Superbeing Nutrition, home" className="hidden lg:block">
              <Logo className="h-8 text-charcoal" />
            </Link>
          </div>

          <nav aria-label="Main" className="hidden items-center gap-9 lg:flex">
            <Link href="/" className="nav-link" aria-current={pathname === "/" ? "page" : undefined}>
              Home
            </Link>
            <ShopMenu />
            <RangeMenu />
            <Link href="/contact" className="nav-link" aria-current={pathname === "/contact" ? "page" : undefined}>
              Contact
            </Link>
          </nav>

          <Link href="/" aria-label="Superbeing Nutrition, home" className="justify-self-center lg:hidden">
            <Logo className="h-7 text-charcoal" />
          </Link>

          <div className="flex items-center justify-end gap-0.5">
            <button type="button" className="icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search" aria-keyshortcuts="Control+K">
              <Icon.Search className="size-[22px]" />
            </button>
            <Link href={profile ? "/account" : "/login"} className="icon-btn hidden sm:inline-grid" aria-label={profile ? "Your account" : "Log in"}>
              <Icon.User className="size-[22px]" />
            </Link>
            <Link href="/wishlist" className="icon-btn hidden sm:inline-grid" aria-label="Wishlist">
              <Icon.Heart className="size-[22px]" />
            </Link>
            <button type="button" className="icon-btn relative" onClick={() => setCartOpen(true)} data-cart-target aria-label={`Cart, ${count} items`}>
              <Icon.Bag className="size-[22px]" />
              <CartCount n={count} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
