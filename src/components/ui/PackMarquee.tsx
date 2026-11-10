"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { LIVE_PRODUCTS } from "@/data/products";
import { packAlt, packSrc } from "@/lib/media";
import { gsap, reduceMotion } from "@/lib/gsap";

/**
 * Endless strip of live packs, each linking to its product. The track holds two copies and loops
 * by half its width; it slows down under the pointer. Used in the menu, search, empty cart and 404.
 */
export function PackMarquee({ height = 120, speed = 45, className = "" }: { height?: number; speed?: number; className?: string }) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!track.current || reduceMotion()) return;
    const el = track.current;
    const loop = gsap.to(el, { xPercent: -50, duration: speed, ease: "none", repeat: -1 });
    const slow = () => gsap.to(loop, { timeScale: 0.2, duration: 0.6 });
    const fast = () => gsap.to(loop, { timeScale: 1, duration: 0.6 });
    el.addEventListener("pointerenter", slow);
    el.addEventListener("pointerleave", fast);
    return () => {
      loop.kill();
      el.removeEventListener("pointerenter", slow);
      el.removeEventListener("pointerleave", fast);
    };
  }, [speed]);

  return (
    <div className={`overflow-hidden ${className}`}>
      <div ref={track} className="flex w-max items-end">
        {[0, 1].map((copy) =>
          LIVE_PRODUCTS.map((p) => (
            <Link
              key={`${copy}-${p.slug}`}
              href={`/products/${p.slug}`}
              // The second copy only exists for the loop: hide it from keyboards and screen readers.
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
