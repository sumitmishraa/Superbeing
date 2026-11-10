"use client";

import { useRef, useState } from "react";
import { formatINR, type Product } from "@/data/products";
import { useHydrated, useStore, type PackOption } from "@/lib/store";
import { gsap, reduceMotion } from "@/lib/gsap";

/** Flies a copy of the visible product picture (img[data-pack]) into the header's cart button. */
function flyToCart(slug: string) {
  if (reduceMotion()) return;
  const source = [...document.querySelectorAll<HTMLImageElement>(`img[data-pack="${slug}"]`)].find((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < innerHeight;
  });
  const target = [...document.querySelectorAll<HTMLElement>("[data-cart-target]")].find((el) => el.getBoundingClientRect().width > 0);
  if (!source || !target) return;

  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const clone = source.cloneNode() as HTMLImageElement;
  clone.removeAttribute("data-pack");
  clone.removeAttribute("srcset");
  Object.assign(clone.style, {
    position: "fixed",
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    objectFit: "contain",
    zIndex: "90",
    pointerEvents: "none",
    margin: "0",
  });
  document.body.appendChild(clone);

  const scale = Math.min(44 / from.width, 44 / from.height);
  gsap
    .timeline({ onComplete: () => clone.remove() })
    .to(clone, { x: to.left + to.width / 2 - (from.left + from.width / 2), duration: 0.8, ease: "power2.inOut" }, 0)
    .to(clone, { y: to.top + to.height / 2 - (from.top + from.height / 2), duration: 0.8, ease: "power3.in" }, 0)
    .to(clone, { scale, duration: 0.8, ease: "power2.in" }, 0)
    .to(clone, { autoAlpha: 0, duration: 0.15 }, 0.72);
}

/** "Notify me" for coming-soon products: records in the store that the shopper wants to hear. */
function NotifyButton({ product, className }: { product: Product; className: string }) {
  const notify = useStore((s) => s.addNotify);
  const notified = useStore((s) => s.notify.includes(product.slug));
  const hydrated = useHydrated();
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

type AddToCartProps = {
  product: Product;
  qty?: number;
  option?: PackOption;
  subscribe?: boolean;
  className?: string;
  /** Shows this price on the button: "Add to cart ₹1,499". */
  withPrice?: number;
  /** Shorter label: "Add". */
  compact?: boolean;
  /** White button for dark backgrounds. */
  light?: boolean;
};

/**
 * Adds a live product to the cart without opening the drawer: the pack flies to the cart icon and
 * the label rolls to "Added" for 1.5 s. Coming-soon products get a Notify me button instead.
 */
export function AddToCart({ product, qty = 1, option = "standard", subscribe = false, className = "", withPrice, compact, light }: AddToCartProps) {
  const add = useStore((s) => s.addToCart);
  const [added, setAdded] = useState(false);
  const label = useRef<HTMLSpanElement>(null);

  if (product.status !== "live") return <NotifyButton product={product} className={className} />;

  const roll = (fromPercent: number) => {
    if (!reduceMotion() && label.current) gsap.fromTo(label.current, { yPercent: fromPercent }, { yPercent: 0, duration: 0.45, ease: "expo.out" });
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
