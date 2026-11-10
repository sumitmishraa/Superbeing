"use client";

import { useRef } from "react";
import type { Product } from "@/data/products";
import { gsap, reduceMotion, useGSAP } from "@/lib/gsap";

/** The six largest doses as bars (a dose histogram where other stores show a rating histogram). */

/** "1,500 mg" / "2 g" / "500 mcg" → milligrams; null for CFU, enzyme units and anything else. */
function toMg(dose: string) {
  const m = dose.replace(/,/g, "").match(/^([\d.]+)\s*(mg|g|mcg|µg)$/i);
  if (!m) return null;
  const value = parseFloat(m[1]);
  const unit = m[2].toLowerCase();
  return unit === "g" ? value * 1000 : unit === "mcg" || unit === "µg" ? value / 1000 : value;
}

export function DoseBars({ p }: { p: Product }) {
  const root = useRef<HTMLUListElement>(null);
  const rows = p.formula
    .flatMap((g) => g.items)
    .map((i) => ({ ...i, mg: toMg(i.dose) }))
    .filter((i): i is typeof i & { mg: number } => i.mg !== null)
    .sort((a, b) => b.mg - a.mg)
    .slice(0, 6);
  const max = Math.max(...rows.map((r) => r.mg), 1);

  useGSAP(
    () => {
      if (reduceMotion()) return;
      gsap.from("[data-bar]", {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1.2,
        stagger: 0.08,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current, start: "top 85%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <ul ref={root} className="mt-6 space-y-2.5" aria-label="Largest doses per serve">
      {rows.map((r) => (
        <li key={r.name} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1">
          <span className="truncate text-[0.875rem]">{r.name}</span>
          <span className="tnum text-[0.875rem]">{r.dose}</span>
          <span className="relative col-span-2 h-[3px] bg-line" aria-hidden>
            {/* Square-root scale so small doses stay visible next to gram-sized ones. */}
            <span data-bar className="absolute inset-y-0 left-0 bg-charcoal" style={{ width: `${Math.max(2, Math.sqrt(r.mg / max) * 100)}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}
