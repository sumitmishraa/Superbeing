"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useStore, useHydrated, cartTotals } from "@/lib/store";
import { Icon, Logo } from "@/components/ui";
import { gsap, ScrollTrigger, reduceMotion } from "@/lib/gsap";

function Count({ n }: { n: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(n);
  useEffect(() => {
    if (prev.current !== n && ref.current && !reduceMotion())
      gsap.fromTo(ref.current, { yPercent: n > prev.current ? 100 : -100 }, { yPercent: 0, duration: 0.5, ease: "expo.out", delay: 0.55 });
    prev.current = n;
  }, [n]);
  return (
    <span className="tnum inline-flex overflow-hidden align-bottom">
      [<span ref={ref} className="inline-block">{n}</span>]
    </span>
  );
}

export function Header() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const cart = useStore((s) => s.cart);
  const wishlist = useStore((s) => s.wishlist);
  const profile = useStore((s) => s.profile);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const setSearchOpen = useStore((s) => s.setSearchOpen);
  const setMenuOpen = useStore((s) => s.setMenuOpen);
  const count = hydrated ? cartTotals(cart, null).count : 0;
  const saved = hydrated ? wishlist.length : 0;
  const bar = useRef<HTMLElement>(null);

  // Hide on scroll down, return on scroll up.
  useEffect(() => {
    if (!bar.current || reduceMotion()) return;
    const el = bar.current;
    const st = ScrollTrigger.create({
      start: 120,
      end: "max",
      onUpdate: (self) => gsap.to(el, { yPercent: self.direction === 1 ? -100 : 0, duration: 0.45, ease: "expo.out", overwrite: true }),
      onLeaveBack: () => gsap.to(el, { yPercent: 0, duration: 0.3, overwrite: true }),
    });
    return () => st.kill();
  }, []);

  const link = (href: string, label: string) => (
    <Link href={href} className="nav-link" aria-current={pathname === href || (href !== "/" && pathname.startsWith(href)) ? "page" : undefined}>
      {label}
    </Link>
  );

  return (
    <header ref={bar} className="sticky top-0 z-40 bg-snow">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-charcoal focus:p-3 focus:text-snow">
        Skip to content
      </a>
      <div className="wrap flex h-[var(--header-h)] items-center justify-between gap-6">
        <Link href="/" aria-label="Superbeing Nutrition, home" className="shrink-0">
          <Logo className="h-9 md:h-11" label="Superbeing Nutrition" />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
          <button type="button" className="nav-link" onClick={() => setSearchOpen(true)} aria-keyshortcuts="Control+K">
            Search
          </button>
          {link("/shop", "Shop")}
          <button type="button" className="nav-link" onClick={() => setMenuOpen(true)} aria-haspopup="dialog">
            Needs
          </button>
          {link("/contact", "Contact")}
          {link(profile ? "/account" : "/login", profile ? "Account" : "Log in")}
          <Link href="/wishlist" className="nav-link" aria-label={`Wishlist, ${saved} saved`}>
            Saved <Count n={saved} />
          </Link>
          <button type="button" className="nav-link font-semibold" onClick={() => setCartOpen(true)} data-cart-target aria-label={`Cart, ${count} items`}>
            Cart <Count n={count} />
          </button>
        </nav>

        <div className="flex items-center gap-1 lg:hidden">
          <button type="button" className="grid size-11 place-items-center" onClick={() => setSearchOpen(true)} aria-label="Search">
            <Icon.Search className="size-[22px]" />
          </button>
          <button type="button" className="px-2 py-3 text-[1rem] font-semibold" onClick={() => setCartOpen(true)} data-cart-target aria-label={`Cart, ${count} items`}>
            Cart <Count n={count} />
          </button>
          <button type="button" className="grid size-11 place-items-center" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-haspopup="dialog">
            <Icon.Menu className="size-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
