"use client";

import { useRef, useState } from "react";
import { formatINR, type Product } from "@/data/products";
import { useStore, useHydrated, type PackOption } from "@/lib/store";
import { gsap, reduceMotion } from "@/lib/gsap";

export function Logo({ className = "", label = "Superbeing Nutrition" }: { className?: string; label?: string }) {
  return <span role="img" aria-label={label} className={`logo-mask ${className}`} />;
}

/* ───────── Icons: thin strokes ───────── */
type IconProps = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
export const Icon = {
  Search: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  ),
  Heart: ({ className, filled }: IconProps & { filled?: boolean }) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...base} fill={filled ? "currentColor" : "none"}>
      <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20Z" />
    </svg>
  ),
  Close: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  ),
  ArrowUpRight: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  ),
  Plus: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Minus: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
      <path d="M5 12h14" />
    </svg>
  ),
  Menu: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
      <path d="M3 8h18M3 13h18M9 18h12" />
    </svg>
  ),
  Chevron: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  Check: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  ),
  Filters: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
      <path d="M3 7h11M18 7h3M3 17h4M11 17h10" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="9" cy="17" r="2" />
    </svg>
  ),
  Percent: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 15 6-6" />
      <circle cx="9.2" cy="9.2" r=".6" fill="currentColor" />
      <circle cx="14.8" cy="14.8" r=".6" fill="currentColor" />
    </svg>
  ),
};

export function VegMark({ diet, className = "", withText = true }: { diet: Product["diet"]; className?: string; withText?: boolean }) {
  const nonVeg = diet === "non-veg";
  const c = nonVeg ? "var(--nonveg)" : "var(--veg)";
  const label = nonVeg ? "Non-vegetarian" : diet === "vegan" ? "Vegetarian (vegan)" : "Vegetarian";
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg viewBox="0 0 16 16" className="size-4 shrink-0" role="img" aria-label={label}>
        <rect x="1" y="1" width="14" height="14" fill="#fff" stroke={c} strokeWidth="1.4" />
        {nonVeg ? <path d="M8 3.6 12.2 11.6H3.8Z" fill={c} /> : <circle cx="8" cy="8" r="3.6" fill={c} />}
      </svg>
      {withText && <span className="text-[0.8125rem]">{nonVeg ? "Non-veg" : diet === "vegan" ? "Vegan" : "Veg"}</span>}
    </span>
  );
}

export function Price({ value, className = "" }: { value: number; className?: string }) {
  return <span className={`tnum ${className}`}>{formatINR(value)}</span>;
}

export function QtyStepper({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="inline-flex h-10 items-stretch bg-off" role="group" aria-label={`Quantity for ${label}`}>
      <button
        type="button"
        className="grid w-10 place-items-center transition-colors hover:bg-[#ececec] disabled:opacity-35"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Decrease quantity"
      >
        <Icon.Minus className="size-4" />
      </button>
      <span className="tnum grid min-w-7 place-items-center text-[1rem]" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="grid w-10 place-items-center transition-colors hover:bg-[#ececec] disabled:opacity-35"
        onClick={() => onChange(value + 1)}
        disabled={value >= 9}
        aria-label="Increase quantity"
      >
        <Icon.Plus className="size-4" />
      </button>
    </div>
  );
}

export function WishlistButton({ slug, name, className = "" }: { slug: string; name: string; className?: string }) {
  const hydrated = useHydrated();
  const on = useStore((s) => s.wishlist.includes(slug));
  const toggle = useStore((s) => s.toggleWishlist);
  const heart = useRef<HTMLSpanElement>(null);
  const active = hydrated && on;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
        if (!reduceMotion() && heart.current) gsap.fromTo(heart.current, { scale: 0.6 }, { scale: 1, duration: 0.5, ease: "back.out(3)" });
      }}
      aria-pressed={active}
      aria-label={active ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
      className={`grid size-11 place-items-center ${className}`}
    >
      <span ref={heart} className="grid place-items-center">
        <Icon.Heart className="size-[22px]" filled={active} />
      </span>
    </button>
  );
}

/** Flies a copy of the visible product picture into the header's Cart [n]. */
function flyToCart(slug: string) {
  if (reduceMotion()) return;
  const src = [...document.querySelectorAll<HTMLImageElement>(`img[data-pack="${slug}"]`)].find((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < innerHeight;
  });
  const target = [...document.querySelectorAll<HTMLElement>("[data-cart-target]")].find((el) => el.getBoundingClientRect().width > 0);
  if (!src || !target) return;
  const a = src.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const clone = src.cloneNode() as HTMLImageElement;
  clone.removeAttribute("data-pack");
  clone.removeAttribute("srcset");
  Object.assign(clone.style, {
    position: "fixed",
    left: `${a.left}px`,
    top: `${a.top}px`,
    width: `${a.width}px`,
    height: `${a.height}px`,
    objectFit: "contain",
    zIndex: "90",
    pointerEvents: "none",
    margin: "0",
  });
  document.body.appendChild(clone);
  const s = Math.min(44 / a.width, 44 / a.height);
  gsap
    .timeline({ onComplete: () => clone.remove() })
    .to(clone, { x: b.left + b.width / 2 - (a.left + a.width / 2), duration: 0.8, ease: "power2.inOut" }, 0)
    .to(clone, { y: b.top + b.height / 2 - (a.top + a.height / 2), duration: 0.8, ease: "power3.in" }, 0)
    .to(clone, { scale: s, duration: 0.8, ease: "power2.in" }, 0)
    .to(clone, { autoAlpha: 0, duration: 0.15 }, 0.72);
}

export function AddToCart({
  product,
  qty = 1,
  option = "standard",
  subscribe = false,
  className = "",
  withPrice,
  compact,
  light,
}: {
  product: Product;
  qty?: number;
  option?: PackOption;
  subscribe?: boolean;
  className?: string;
  withPrice?: number;
  compact?: boolean;
  light?: boolean;
}) {
  const add = useStore((s) => s.addToCart);
  const notify = useStore((s) => s.addNotify);
  const notified = useStore((s) => s.notify.includes(product.slug));
  const hydrated = useHydrated();
  const [added, setAdded] = useState(false);
  const label = useRef<HTMLSpanElement>(null);

  if (product.status !== "live") {
    const done = hydrated && notified;
    return (
      <button
        type="button"
        className={`btn btn-off ${className}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          notify(product.slug);
        }}
        aria-live="polite"
        disabled={done}
      >
        {done ? "We'll let you know" : "Notify me"}
      </button>
    );
  }

  const roll = (from: number) => {
    if (!reduceMotion() && label.current) gsap.fromTo(label.current, { yPercent: from }, { yPercent: 0, duration: 0.45, ease: "expo.out" });
  };
  const text = added ? "Added" : `${compact ? "Add" : "Add to cart"}${withPrice ? ` ${formatINR(withPrice)}` : ""}`;
  return (
    <button
      type="button"
      className={`btn ${light ? "btn-light" : ""} ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        add(product.slug, { qty, option, subscribe, open: false });
        flyToCart(product.slug);
        setAdded(true);
        roll(100);
        window.setTimeout(() => {
          setAdded(false);
          roll(-100);
        }, 1500);
      }}
      aria-label={`Add ${product.name} to cart`}
    >
      <span ref={label} className="inline-block" aria-live="polite">
        {text}
      </span>
    </button>
  );
}
