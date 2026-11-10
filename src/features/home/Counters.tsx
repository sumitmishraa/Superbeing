"use client";

import { useEffect, useRef } from "react";
import { LIVE_PRODUCTS, NEEDS, doseCount } from "@/data/products";
import { gsap, reduceMotion } from "@/lib/gsap";
import { Icon } from "@/components/ui";

/** The range in numbers, counted from the catalogue: formulas, disclosed actives, needs covered. */

/** One number that counts up from 0 the first time it scrolls into view. The final value is in the HTML. */
function Counter({ to, label, icon }: { to: number; label: string; icon: React.ReactNode }) {
  const num = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (!num.current || reduceMotion()) return;
    const value = { v: 0 };
    const tween = gsap.to(value, {
      v: to,
      duration: 1.8,
      ease: "power2.out",
      onUpdate: () => {
        if (num.current) num.current.textContent = String(Math.round(value.v));
      },
      scrollTrigger: { trigger: num.current, start: "top 90%", once: true },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [to]);

  return (
    <div className="text-center">
      <span className="mx-auto block w-fit text-charcoal">{icon}</span>
      <p ref={num} className="tnum mt-3 font-display text-[2.25rem] font-semibold text-charcoal">
        {to}
      </p>
      <p className="text-[0.875rem] tracking-[0.06em] uppercase">{label}</p>
    </div>
  );
}

export function Counters() {
  const actives = LIVE_PRODUCTS.reduce((n, p) => n + doseCount(p), 0);
  return (
    <section className="wrap grid grid-cols-1 gap-10 py-16 sm:grid-cols-3 md:py-20" aria-label="The range in numbers">
      <Counter to={LIVE_PRODUCTS.length} label="Formulas" icon={<Icon.Bag className="size-8" />} />
      <Counter to={actives} label="Actives, every dose shown" icon={<Icon.Flask className="size-8" />} />
      <Counter to={NEEDS.length} label="Needs covered" icon={<Icon.Target className="size-8" />} />
    </section>
  );
}
