"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { NEED_BY_ID, PRODUCTS, PRODUCT_BY_SLUG } from "@/data/products";
import { ingredientImage, packAlt, packSrc } from "@/lib/media";
import { ProductCard } from "@/components/ProductCard";
import { gsap, useGSAP, reduceMotion } from "@/lib/gsap";

const LIVE = PRODUCTS.filter((p) => p.status === "live");

/* 1 ── New in: a row of pack cutouts, as the reference's "New arrivals" strip */
export function NewIn() {
  const row = useRef<HTMLUListElement>(null);
  useGSAP(
    () => {
      if (reduceMotion()) return;
      gsap.from("li", { yPercent: 40, autoAlpha: 0, duration: 1.1, stagger: 0.05, ease: "expo.out", delay: 0.15 });
    },
    { scope: row },
  );
  return (
    <section className="wrap grid gap-6 pt-10 pb-12 md:grid-cols-12 md:pt-20 md:pb-16" aria-labelledby="new-in">
      <div className="md:col-span-3">
        <h1 className="max-w-[14ch] text-[clamp(2rem,1.4rem+1.4vw,2.75rem)] leading-[1.02] tracking-[-0.02em]">Nutrition for one need</h1>
        <p className="mt-3 max-w-[30ch] text-[1rem] leading-snug">Formulas built for one specific need each, with every dose printed on the pack.</p>
        <Link href="/shop" className="btn mt-5 !min-h-11">
          Shop all
        </Link>
        <p id="new-in" className="label mt-8 text-graphite md:mt-10">
          New in
        </p>
      </div>
      <ul ref={row} className="no-scrollbar -mx-[var(--gutter)] flex items-end gap-1 overflow-x-auto px-[var(--gutter)] pb-2 md:col-span-9 md:mx-0 md:px-0">
        {LIVE.map((p) => (
          <li key={p.slug} className="shrink-0">
            <Link href={`/products/${p.slug}`} className="group relative block h-[clamp(150px,17vw,280px)] px-1.5" aria-label={p.name} title={p.name}>
              <Image
                src={packSrc(p)}
                alt={packAlt(p)}
                width={224}
                height={280}
                priority
                className="h-full w-auto object-contain transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-2 group-focus-visible:-translate-y-2"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* 2 ── Two full-bleed panels: an offer on a macro shot, and a pack on its need colour with the rising plane */
export function Panels() {
  const root = useRef<HTMLElement>(null);
  const offer = PRODUCT_BY_SLUG["night-recovery-magnesium"];
  const hero = PRODUCT_BY_SLUG["collagen-glow-matrix"];
  const hn = NEED_BY_ID[hero.need];
  useGSAP(
    () => {
      if (reduceMotion()) return;
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) =>
        gsap.fromTo(el, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } }),
      );
      gsap.from("[data-plane]", {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        duration: 1.4,
        ease: "expo.inOut",
        scrollTrigger: { trigger: "[data-plane]", start: "top 85%", once: true },
      });
    },
    { scope: root },
  );
  return (
    <section ref={root} className="grid md:grid-cols-2" aria-label="Offers">
      <Link
        href="/shop"
        className="group relative block aspect-[4/5] overflow-hidden md:aspect-auto md:h-[min(86vh,780px)]"
        style={{ background: NEED_BY_ID[offer.need].shade }}
      >
        <div data-parallax className="absolute inset-x-0 -inset-y-[8%]">
          <Image
            src={packSrc(offer, "macro")}
            alt={packAlt(offer, "macro")}
            fill
            sizes="(min-width:768px) 50vw, 100vw"
            className="object-cover transition-transform duration-1000 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]"
          />
        </div>
        <div className="absolute inset-x-0 top-0 flex justify-between gap-6 p-5 text-snow md:p-6">
          <p className="label">Special offer</p>
          <p className="max-w-[30ch] text-right text-[0.875rem] leading-snug">10% off your first order with code FIRSTLABEL. Free delivery over ₹999.</p>
        </div>
      </Link>
      <Link
        href={`/products/${hero.slug}`}
        className="group relative block aspect-[4/5] overflow-hidden md:aspect-auto md:h-[min(86vh,780px)]"
        style={{ background: hn.colour, color: hn.ink }}
      >
        <div data-plane className="absolute inset-0" style={{ background: hn.shade, clipPath: "polygon(0% 100%, 100% 58%, 100% 100%, 0% 100%)" }} aria-hidden />
        <div data-parallax className="absolute inset-x-0 -inset-y-[8%]">
          <Image
            src={packSrc(hero, "duo")}
            alt={packAlt(hero, "duo")}
            fill
            sizes="(min-width:768px) 50vw, 100vw"
            className="object-contain p-[12%] transition-transform duration-1000 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]"
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-5 md:p-6">
          <p className="label">Every dose on the label</p>
          <p className="max-w-[32ch] text-right text-[0.875rem] leading-snug">Turn any pack around: each active and its amount is printed on the back.</p>
        </div>
      </Link>
    </section>
  );
}

/* 3 ── About us */
export function About() {
  const a = PRODUCT_BY_SLUG["bloat-gut-reset"];
  const b = PRODUCT_BY_SLUG["omega-precision"];
  const m = PRODUCT_BY_SLUG["hydra-move"];
  return (
    <section id="about" className="wrap grid gap-10 py-20 md:grid-cols-12 md:gap-6 md:py-28" aria-labelledby="about-h">
      <div className="order-2 md:order-1 md:col-span-4" data-rise>
        <div className="grid max-w-[340px] grid-cols-2 gap-1.5">
          {[a, b].map((p) => (
            <Link key={p.slug} href={`/products/${p.slug}`} className="group relative block aspect-[4/5] bg-off">
              <Image src={packSrc(p)} alt={packAlt(p)} fill sizes="170px" className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.05]" />
            </Link>
          ))}
        </div>
        <p className="mt-5 max-w-[38ch] text-[1rem] leading-snug">
          Fifteen formulas today across gut, sleep, stress, daily foundations, hydration, beauty and strength, with more in label review.
        </p>
        <Link href="/shop" className="link-u mt-4 inline-block text-[1rem]">
          Shop
        </Link>
      </div>
      <div className="order-1 md:order-2 md:col-span-6 md:col-start-7">
        <h2 id="about-h" className="h-display" data-split>
          About us
        </h2>
        <div className="mt-6 max-w-[46ch] space-y-3 text-[1rem] leading-snug" data-rise>
          <p>
            We start from one specific need, not a category. Each formula uses branded ingredients with published research behind them, and every amount is printed on the
            pack. No proprietary blends, no hidden doses.
          </p>
          <p className="text-graphite">Ingredient research is research on the ingredient, not a study of our finished product. We say so plainly.</p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-1.5 md:mt-20" data-stagger>
          <div className="relative aspect-[4/5] overflow-hidden" style={{ background: NEED_BY_ID[m.need].shade }}>
            <Image src={packSrc(m, "macro")} alt={packAlt(m, "macro")} fill sizes="(min-width:768px) 25vw, 50vw" className="object-cover" />
          </div>
          <div className="relative aspect-[4/5] bg-off">
            <Image
              src={ingredientImage("affron Saffron")}
              alt="Saffron crocus, a plate from Köhler's Medizinal-Pflanzen (1890)"
              fill
              sizes="(min-width:768px) 25vw, 50vw"
              className="object-contain p-[10%]"
            />
            <span className="absolute bottom-3 left-3 text-[0.8125rem] text-graphite">Crocus sativus, the source of saffron</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* 6 ── Catalog preview with the full-width bar */
export function CatalogPreview() {
  const pick = [
    "night-recovery-magnesium",
    "hydra-zero",
    "stresscalm-nutrition",
    "daily-fibre-gap",
    "women-monthly-nutrition",
    "brain-age-40-plus",
    "indian-vegetarian-complete",
    "massbuild",
  ]
    .map((s) => PRODUCT_BY_SLUG[s])
    .filter(Boolean);
  return (
    <section className="wrap pt-6 pb-20 md:pb-24" aria-labelledby="catalog-h">
      <h2 id="catalog-h" className="h-display" data-split>
        Catalog
      </h2>
      <ul className="mt-8 grid grid-cols-2 gap-x-1.5 gap-y-8 lg:grid-cols-4" data-stagger>
        {pick.map((p) => (
          <li key={p.slug}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
      <Link href="/shop" className="btn mt-10 w-full">
        View full catalog
      </Link>
    </section>
  );
}
