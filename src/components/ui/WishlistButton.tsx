"use client";

import { useRef } from "react";
import { useHydrated, useStore } from "@/lib/store";
import { gsap, reduceMotion } from "@/lib/gsap";
import { Icon } from "./icons";

/** Heart toggle that saves a product to the wishlist, with a small pop when tapped. */
export function WishlistButton({ slug, name, className = "" }: { slug: string; name: string; className?: string }) {
  const hydrated = useHydrated();
  const saved = useStore((s) => s.wishlist.includes(slug));
  const toggle = useStore((s) => s.toggleWishlist);
  const heart = useRef<HTMLSpanElement>(null);
  const active = hydrated && saved;

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
