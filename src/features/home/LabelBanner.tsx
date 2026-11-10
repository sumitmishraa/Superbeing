"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { SCENES } from "@/lib/media";
import { gsap, reduceMotion, useGSAP } from "@/lib/gsap";

/** "Read the label" banner linking to the comparison table; its picture zooms out as it scrolls past. */
export function LabelBanner() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (reduceMotion()) return;
      gsap.fromTo("img", { scale: 1.15 }, { scale: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
    },
    { scope: root },
  );

  return (
    <section className="wrap pt-16 md:pt-24" aria-labelledby="label-title">
      <div ref={root} className="relative overflow-hidden rounded-xl bg-accent-hover">
        <div className="relative aspect-[4/3] md:aspect-[21/9]">
          <Image src={SCENES.labelBanner.src} alt={SCENES.labelBanner.alt} fill sizes="100vw" className="object-cover object-right" />
        </div>
        <div className="absolute inset-0 flex items-end md:items-center">
          <div className="max-w-[520px] p-6 md:p-12">
            <h2 id="label-title" className="font-display text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] font-semibold !text-snow">
              Read the label
            </h2>
            <p className="mt-3 text-[0.9375rem] text-snow">Fifteen formulas, and not one hidden dose. Compare what is in each, how much of it, how to take it and who it is for.</p>
            <Link href="/the-range#compare" className="btn btn-light mt-6">
              See every dose
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
