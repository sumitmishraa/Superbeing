"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NEEDS, PRODUCTS, PRODUCT_BY_SLUG, formatINR } from "@/data/products";
import { useStore, useHydrated, cartTotals } from "@/lib/store";
import { NEED_TILE, plinthSrc, packAlt, priceRange } from "@/lib/media";
import { Icon, Logo } from "@/components/ui";
import { gsap, ScrollTrigger, reduceMotion } from "@/lib/gsap";

const MESSAGES = [
  { text: "Free delivery on orders over ₹999", href: "/shop" },
  { text: "Monthly delivery: save 15% on every pack", href: "/shop" },
  { text: "Every active, every dose, printed on the pack", href: "/the-range" },
];

/** Rotating announcement bar, closeable for the session. */
function Announcement() {
  const closed = useStore((s) => s.annClosed);
  const close = useStore((s) => s.closeAnnouncement);
  const [i, setI] = useState(0);
  const line = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (closed) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % MESSAGES.length), 4200);
    return () => window.clearInterval(t);
  }, [closed]);
  useEffect(() => {
    if (line.current && !reduceMotion()) gsap.fromTo(line.current, { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: "expo.out" });
  }, [i]);
  if (closed) return null;
  const m = MESSAGES[i];
  return (
    <div className="relative bg-accent text-snow">
      <div className="wrap-wide flex h-10 items-center justify-center overflow-hidden">
        <Link ref={line} key={i} href={m.href} className="font-display text-[0.9375rem] font-medium tracking-[0.02em] hover:underline">
          {m.text} →
        </Link>
      </div>
      <button type="button" onClick={close} className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1 text-[0.8125rem]" aria-label="Close announcement">
        <Icon.Close className="size-4" />
        <span className="hidden sm:inline">close</span>
      </button>
    </div>
  );
}

function Count({ n }: { n: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(n);
  useEffect(() => {
    if (prev.current !== n && ref.current && !reduceMotion())
      gsap.fromTo(ref.current, { scale: 1.6 }, { scale: 1, duration: 0.6, ease: "back.out(3)", delay: 0.5 });
    prev.current = n;
  }, [n]);
  return (
    <span ref={ref} className="tnum absolute -top-1 -right-1 grid size-[18px] place-items-center rounded-full bg-accent text-[0.6875rem] font-semibold text-snow">
      {n}
    </span>
  );
}

const FEATURED = ["bloat-gut-reset", "night-recovery-magnesium"].map((s) => PRODUCT_BY_SLUG[s]);

/** Mega-menu panel under a top-level item; opens on hover or focus. */
function Mega({ label, href, children }: { label: string; href: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const timer = useRef<number>(0);
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
        window.clearTimeout(timer.current);
        setOpen(true);
      }}
      onPointerLeave={() => (timer.current = window.setTimeout(() => setOpen(false), 120))}
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

export function Header() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const cart = useStore((s) => s.cart);
  const profile = useStore((s) => s.profile);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const setSearchOpen = useStore((s) => s.setSearchOpen);
  const setMenuOpen = useStore((s) => s.setMenuOpen);
  const count = hydrated ? cartTotals(cart, null).count : 0;
  const bar = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const st = ScrollTrigger.create({ start: 80, end: "max", onToggle: (self) => setCompact(self.isActive) });
    return () => st.kill();
  }, []);

  const live = PRODUCTS.filter((p) => p.status === "live");
  return (
    <>
      <Announcement />
      <header ref={bar} className={`sticky top-0 z-40 bg-snow transition-shadow duration-300 ${compact ? "shadow-[0_6px_24px_-12px_rgba(0,0,0,.18)]" : ""}`}>
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
            <Mega label="Shop" href="/shop">
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
                    {[
                      ["sachet", "Powder sachets"],
                      ["stick", "Stick sachets"],
                      ["melt", "Mouth melts"],
                      ["tablet", "Tablets"],
                      ["softgel", "Softgels"],
                    ].map(([f, l]) => (
                      <li key={f}>
                        <Link href={`/shop?format=${f}`} className="nav-link text-[0.9375rem]">
                          {l}
                        </Link>
                      </li>
                    ))}
                    <li className="mt-3">
                      <Link href="/shop" className="link-u text-[0.9375rem]">
                        Shop all {live.length} products
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
            </Mega>
            <Mega label="The Range" href="/the-range">
              <div className="grid grid-cols-5 gap-5">
                {(["gut", "sleep", "stress", "hydration", "beauty"] as const).map((id) => {
                  const n = NEEDS.find((x) => x.id === id)!;
                  const t = NEED_TILE[id]!;
                  return (
                    <Link key={id} href={`/shop?need=${id}`} className="group">
                      <span className="relative block aspect-[4/3] overflow-hidden rounded-lg">
                        <Image src={t.src} alt={t.alt} fill sizes="240px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      </span>
                      <span className="mt-2 block font-display text-[1rem] font-semibold text-charcoal uppercase">{n.name}</span>
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
            </Mega>
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
              <Count n={count} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

/** Phone bottom tab bar, as in the reference. */
export function MobileTabBar() {
  const hydrated = useHydrated();
  const cart = useStore((s) => s.cart);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const count = hydrated ? cartTotals(cart, null).count : 0;
  const tabs: [string, string, (c: string) => React.ReactNode][] = [
    ["/shop", "Shop", (c) => <Icon.Bag className={c} />],
    ["/shop?need=gut", "Gut", (c) => <Icon.Leaf className={c} />],
    ["/shop?need=sleep", "Sleep", (c) => <Icon.Target className={c} />],
  ];
  return (
    <nav aria-label="Quick links" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-snow pb-[env(safe-area-inset-bottom)] lg:hidden">
      {tabs.map(([href, label, icon]) => (
        <Link key={href} href={href} className="flex flex-col items-center gap-0.5 py-2 text-[0.75rem] text-charcoal">
          {icon("size-5")}
          {label}
        </Link>
      ))}
      <button type="button" onClick={() => setCartOpen(true)} className="relative flex flex-col items-center gap-0.5 py-2 text-[0.75rem] text-charcoal" data-cart-target>
        <span className="relative">
          <Icon.Bag className="size-5" />
          <span className="tnum absolute -top-1.5 -right-2 grid size-4 place-items-center rounded-full bg-accent text-[0.625rem] text-snow">{count}</span>
        </span>
        Cart
      </button>
    </nav>
  );
}
