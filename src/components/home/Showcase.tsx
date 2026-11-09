"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NEED_BY_ID, PRODUCTS, PRODUCT_BY_SLUG, formatINR } from "@/data/products";
import { packAlt, packSrc } from "@/lib/media";
import { Icon } from "@/components/ui";
import { Flip, gsap, useGSAP, reduceMotion } from "@/lib/gsap";

const LIVE = PRODUCTS.filter((p) => p.status === "live");

function Chars({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((w, wi) => (
        <span key={wi} className="inline-block overflow-hidden pr-[0.25em] pb-[0.04em] align-bottom">
          {[...w].map((c, ci) => (
            <span key={ci} className="ch inline-block">
              {c}
            </span>
          ))}
        </span>
      ))}
    </>
  );
}

/* 4 ── Spotlight: macro label on the left, the pack and its name on the right, Prev / Next */
export function Spotlight() {
  const n = LIVE.length;
  const [s, setS] = useState({ i: 0, prev: -1, dir: 1 });
  const root = useRef<HTMLElement>(null);
  const hovering = useRef(false);
  const go = (d: number) => setS(({ i }) => ({ i: (i + d + n) % n, prev: i, dir: d }));
  const p = LIVE[s.i];
  const need = NEED_BY_ID[p.need];

  useGSAP(
    () => {
      if (s.prev < 0 || reduceMotion()) return;
      gsap
        .timeline()
        .fromTo(
          "[data-macro-current]",
          { clipPath: s.dir > 0 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "expo.inOut" },
          0,
        )
        .fromTo("[data-macro-current] img", { scale: 1.18 }, { scale: 1, duration: 1.5, ease: "expo.out" }, 0.1)
        .fromTo("[data-pack-current]", { xPercent: 35 * s.dir, autoAlpha: 0, rotate: 4 * s.dir }, { xPercent: 0, autoAlpha: 1, rotate: 0, duration: 1.1, ease: "expo.out" }, 0.2)
        .fromTo("[data-name] .ch", { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.018, ease: "expo.out" }, 0.3)
        .fromTo("[data-meta]", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.35);
    },
    { scope: root, dependencies: [s.i] },
  );

  // Autoplay while on screen, paused on hover or under reduced motion.
  useEffect(() => {
    if (!root.current || reduceMotion()) return;
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.5 });
    io.observe(root.current);
    const t = window.setInterval(() => {
      if (visible && !hovering.current && document.visibilityState === "visible") setS(({ i }) => ({ i: (i + 1) % n, prev: i, dir: 1 }));
    }, 6000);
    return () => {
      io.disconnect();
      window.clearInterval(t);
    };
  }, [n]);

  const prev = s.prev >= 0 ? LIVE[s.prev] : null;
  return (
    <section
      ref={root}
      className="grid md:grid-cols-2"
      aria-roledescription="carousel"
      aria-label="Product spotlight"
      onPointerEnter={() => (hovering.current = true)}
      onPointerLeave={() => (hovering.current = false)}
    >
      <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:h-[min(86vh,760px)]" style={{ background: need.shade }}>
        {prev && (
          <div key={`p-${prev.slug}`} className="absolute inset-0">
            <Image src={packSrc(prev, "macro")} alt="" fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
          </div>
        )}
        <div key={p.slug} data-macro-current className="absolute inset-0 overflow-hidden">
          <Image src={packSrc(p, "macro")} alt={packAlt(p, "macro")} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
        </div>
      </div>

      <div className="relative flex min-h-[560px] flex-col bg-off p-5 md:h-[min(86vh,760px)] md:p-6">
        <div className="flex items-start justify-between gap-4 text-[0.875rem]">
          <p data-meta key={`m-${p.slug}`}>
            Superbeing
            <br />
            <span className="font-semibold">{need.name}</span>
          </p>
          <p className="flex items-center gap-2">
            <button type="button" onClick={() => go(-1)} className="nav-link" aria-label="Previous product">
              Prev
            </button>
            <span aria-hidden>/</span>
            <button type="button" onClick={() => go(1)} className="nav-link" aria-label="Next product">
              Next
            </button>
          </p>
        </div>
        <div className="relative my-4 flex-1">
          <div key={p.slug} data-pack-current className="absolute inset-[6%_18%]">
            <Image src={packSrc(p)} alt={packAlt(p)} fill sizes="(min-width:768px) 30vw, 70vw" className="object-contain" data-pack={p.slug} />
          </div>
        </div>
        <div className="flex items-end justify-between gap-4">
          <Link href={`/products/${p.slug}`} data-name key={`n-${p.slug}`} className="h-display text-[clamp(1.875rem,0.8rem+2.6vw,3.75rem)]">
            <Chars text={p.name.replace("™", "")} />
          </Link>
          <Link href={`/products/${p.slug}`} className="btn hidden shrink-0 lg:inline-flex">
            Go to product
          </Link>
          <Link href={`/products/${p.slug}`} className="btn !min-h-12 shrink-0 !px-0 lg:hidden" style={{ width: 48 }} aria-label={`Go to ${p.name}`}>
            <Icon.ArrowUpRight className="size-5" />
          </Link>
        </div>
        <p className="sr-only" aria-live="polite">
          {p.name}, {s.i + 1} of {n}
        </p>
      </div>
    </section>
  );
}

/* 5 ── Bestsellers: uneven tiles on a grid; the active one grows onto its need colour */
const BEST = ["bloat-gut-reset", "stresscalm-nutrition", "night-recovery-magnesium", "hydra-move", "collagen-glow-matrix", "omega-precision", "hair-root"]
  .map((s) => PRODUCT_BY_SLUG[s])
  .filter(Boolean);
const RATIO = [0.9, 1.15, 0.72, 1.0, 0.62, 1.08, 0.84]; // height ÷ width for resting tiles

export function Bestsellers() {
  const [active, setActive] = useState(1);
  const root = useRef<HTMLDivElement>(null);
  const flip = useRef<Flip.FlipState | null>(null);

  const activate = (i: number) => {
    const next = (i + BEST.length) % BEST.length;
    if (next === active || !root.current) return;
    if (!reduceMotion()) flip.current = Flip.getState(root.current.querySelectorAll("[data-tile], [data-tile-box], [data-caption]"));
    setActive(next);
  };

  useLayoutEffect(() => {
    if (!flip.current) return;
    Flip.from(flip.current, { duration: 0.85, ease: "expo.inOut", nested: true });
    flip.current = null;
  }, [active]);

  return (
    <section className="wrap py-20 md:py-28" aria-labelledby="best-h">
      <div className="grid gap-6 md:grid-cols-12">
        <h2 id="best-h" className="h-display md:col-span-6" data-split>
          Start here
        </h2>
        <div className="md:col-span-5 md:col-start-7" data-rise>
          <p className="max-w-[48ch] text-[1rem] leading-snug">
            Seven formulas across gut, sleep, stress, hydration, beauty and daily foundations. Each is built for a single need, with every active and its amount printed on the pack.
          </p>
          <Link href="/shop" className="link-u mt-4 inline-block text-[0.875rem]">
            All products
          </Link>
        </div>
      </div>

      <div ref={root} className="no-scrollbar -mx-[var(--gutter)] mt-12 flex items-start gap-1.5 overflow-x-auto px-[var(--gutter)] md:mx-0 md:mt-24 md:overflow-visible md:px-0">
        {BEST.map((p, i) => {
          const on = i === active;
          const need = NEED_BY_ID[p.need];
          return (
            <div
              key={p.slug}
              data-tile
              data-flip-id={`t-${p.slug}`}
              className={`shrink-0 md:min-w-0 md:shrink ${on ? "w-[62vw] md:w-auto md:flex-[2.2_1_0]" : "w-[30vw] md:w-auto md:flex-[1_1_0]"}`}
              onPointerEnter={(e) => e.pointerType === "mouse" && activate(i)}
            >
              <Link
                href={`/products/${p.slug}`}
                onFocus={() => activate(i)}
                data-tile-box
                data-flip-id={`b-${p.slug}`}
                className="relative block overflow-hidden transition-colors duration-700"
                style={{ aspectRatio: on ? "1 / 1.08" : `1 / ${RATIO[i]}`, background: on ? need.colour : "var(--off)" }}
                aria-label={`${p.name}, ${formatINR(p.price)}`}
              >
                <Image
                  src={packSrc(p)}
                  alt={packAlt(p)}
                  fill
                  sizes="(min-width:768px) 28vw, 60vw"
                  className={`object-contain transition-[padding] duration-700 ${on ? "p-[11%]" : "p-[14%]"}`}
                  data-pack={p.slug}
                />
              </Link>
              <div data-caption data-flip-id={`c-${p.slug}`} className={`mt-2 flex items-baseline justify-between gap-3 ${on ? "" : "invisible h-0 overflow-hidden"}`}>
                <span className="text-[1.125rem] leading-tight">{p.name}</span>
                <span className="tnum text-[0.8125rem] text-graphite">{formatINR(p.price)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-10 flex justify-end gap-2 text-[0.875rem]">
        <button type="button" onClick={() => activate(active - 1)} className="nav-link" aria-label="Previous formula">
          Prev
        </button>
        <span aria-hidden>/</span>
        <button type="button" onClick={() => activate(active + 1)} className="nav-link" aria-label="Next formula">
          Next
        </button>
      </p>
    </section>
  );
}
