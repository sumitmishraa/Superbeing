"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui";
import { SCENES } from "@/lib/media";
import { gsap, reduceMotion, useGSAP } from "@/lib/gsap";

/** Home hero: three slides that crossfade with a slow zoom, autoplay every 6 s (paused under the pointer). */

const SLIDES = [
  {
    img: SCENES.heroGut,
    kicker: "Gut & digestion",
    title: "Every dose on the label",
    sub: "Bloat + Gut Reset: fourteen actives, every one printed on the pack.",
    cta: { label: "Shop now", href: "/products/bloat-gut-reset" },
  },
  {
    img: SCENES.heroHydration,
    kicker: "Hydration",
    title: "Stick it in your bag",
    sub: "Hydra Move and Hydra Zero stick sachets. Every dose on the back.",
    cta: { label: "Shop hydration", href: "/shop?need=hydration" },
  },
  {
    img: SCENES.heroSleep,
    kicker: "First order",
    title: "10% off with FIRSTLABEL",
    sub: "Free delivery on orders over ₹999. Pay by cash or UPI when it arrives.",
    cta: { label: "Shop all", href: "/shop" },
  },
];

const SLIDE_MS = 6000;
const ARROW = "absolute top-1/2 z-20 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-snow/80 text-charcoal hover:text-accent md:grid";

export function Hero() {
  const [current, setCurrent] = useState(0);
  const root = useRef<HTMLElement>(null);
  const paused = useRef(false);
  const goTo = (n: number) => setCurrent((n + SLIDES.length) % SLIDES.length);

  // Each time the slide changes: fade it in, zoom its picture out slowly, rise its text, restart the progress dot.
  useGSAP(
    () => {
      if (reduceMotion()) return;
      const slide = `[data-slide="${current}"]`;
      gsap.fromTo(slide, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, ease: "power2.out" });
      gsap.fromTo(`${slide} img`, { scale: 1.12 }, { scale: 1, duration: 7, ease: "none" });
      gsap.from(`${slide} [data-rise-in]`, { yPercent: 60, autoAlpha: 0, duration: 0.9, stagger: 0.09, ease: "expo.out", delay: 0.25 });
      gsap.fromTo("[data-progress]", { scaleX: 0 }, { scaleX: 1, duration: SLIDE_MS / 1000, ease: "none", transformOrigin: "left center" });
    },
    { scope: root, dependencies: [current] },
  );

  useEffect(() => {
    if (reduceMotion()) return;
    const timer = window.setInterval(() => !paused.current && document.visibilityState === "visible" && setCurrent((n) => (n + 1) % SLIDES.length), SLIDE_MS);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section
      ref={root}
      className="relative h-[min(78svh,640px)] min-h-[440px] overflow-hidden bg-off"
      aria-roledescription="carousel"
      aria-label="Highlights"
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
    >
      {SLIDES.map((s, n) => (
        <div key={n} data-slide={n} className={`absolute inset-0 ${n === current ? "z-10" : "pointer-events-none z-0 opacity-0"}`} aria-hidden={n !== current}>
          <Image src={s.img.src} alt={s.img.alt} fill priority={n === 0} sizes="100vw" className="object-cover object-[70%_50%]" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/75 to-white/30 md:from-white/70 md:via-white/10 md:to-transparent" aria-hidden />
          <div className="wrap-wide relative flex h-full flex-col justify-center">
            <div className="max-w-[560px]">
              <p data-rise-in className="font-display text-[0.9375rem] font-semibold tracking-[0.08em] text-accent uppercase">
                {s.kicker}
              </p>
              {/* Only the first slide's title is the page's h1; the others are styled the same. */}
              {n === 0 ? (
                <h1 data-rise-in className="h-hero mt-3 text-charcoal">
                  {s.title}
                </h1>
              ) : (
                <p data-rise-in className="h-hero mt-3 text-charcoal">
                  {s.title}
                </p>
              )}
              <p data-rise-in className="mt-4 max-w-[40ch] text-[1.0625rem] text-charcoal">
                {s.sub}
              </p>
              <Link data-rise-in href={s.cta.href} className="btn mt-7" tabIndex={n === current ? 0 : -1}>
                {s.cta.label}
              </Link>
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => goTo(current - 1)} className={`${ARROW} left-4`} aria-label="Previous slide">
        <Icon.ChevronLeft className="size-5" />
      </button>
      <button type="button" onClick={() => goTo(current + 1)} className={`${ARROW} right-4`} aria-label="Next slide">
        <Icon.ChevronRight className="size-5" />
      </button>
      <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center gap-2">
        {SLIDES.map((_, n) => (
          <button key={n} type="button" onClick={() => goTo(n)} className="relative h-1.5 w-10 overflow-hidden rounded-full bg-charcoal/20" aria-label={`Slide ${n + 1}`} aria-current={n === current}>
            {n === current && <span data-progress className="absolute inset-0 rounded-full bg-accent" />}
          </button>
        ))}
      </div>
    </section>
  );
}
