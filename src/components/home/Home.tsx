"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { NEEDS, PRODUCTS, PRODUCT_BY_SLUG, NEED_BY_ID, doseCount, formatINR } from "@/data/products";
import { type PackOption, useHydrated } from "@/lib/store";
import { NEED_TILE, SCENES, TURN_FRAMES, etaLabel, turnSrc, packAlt } from "@/lib/media";
import { ProductCard, Carousel } from "@/components/ProductCard";
import { AddToCart, Icon } from "@/components/ui";
import { gsap, ScrollTrigger, reduceMotion, useGSAP } from "@/lib/gsap";

const LIVE = PRODUCTS.filter((p) => p.status === "live");

/* 1 ── Hero carousel: crossfade with a slow zoom, text rises, autoplay with progress dots */
const SLIDES = [
  {
    img: SCENES.heroGut,
    kicker: "Gut & digestion",
    title: "Every dose on the label",
    sub: "Bloat + Gut Reset: fourteen actives, every one printed on the pack.",
    cta: ["Shop now", "/products/bloat-gut-reset"],
  },
  {
    img: SCENES.heroHydration,
    kicker: "Hydration",
    title: "Stick it in your bag",
    sub: "Hydra Move and Hydra Zero stick sachets. Every dose on the back.",
    cta: ["Shop hydration", "/shop?need=hydration"],
  },
  {
    img: SCENES.heroSleep,
    kicker: "First order",
    title: "10% off with FIRSTLABEL",
    sub: "Free delivery on orders over ₹999. Pay by cash or UPI when it arrives.",
    cta: ["Shop all", "/shop"],
  },
];

function Hero() {
  const [i, setI] = useState(0);
  const root = useRef<HTMLElement>(null);
  const paused = useRef(false);
  const go = (n: number) => setI((n + SLIDES.length) % SLIDES.length);

  useGSAP(
    () => {
      if (reduceMotion()) return;
      const slide = `[data-slide="${i}"]`;
      gsap.fromTo(slide, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, ease: "power2.out" });
      gsap.fromTo(`${slide} img`, { scale: 1.12 }, { scale: 1, duration: 7, ease: "none" });
      gsap.from(`${slide} [data-rise-in]`, { yPercent: 60, autoAlpha: 0, duration: 0.9, stagger: 0.09, ease: "expo.out", delay: 0.25 });
      gsap.fromTo("[data-progress]", { scaleX: 0 }, { scaleX: 1, duration: 6, ease: "none", transformOrigin: "left center" });
    },
    { scope: root, dependencies: [i] },
  );
  useEffect(() => {
    if (reduceMotion()) return;
    const t = window.setInterval(() => !paused.current && document.visibilityState === "visible" && setI((n) => (n + 1) % SLIDES.length), 6000);
    return () => window.clearInterval(t);
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
        <div key={n} data-slide={n} className={`absolute inset-0 ${n === i ? "z-10" : "pointer-events-none z-0 opacity-0"}`} aria-hidden={n !== i}>
          <Image src={s.img.src} alt={s.img.alt} fill priority={n === 0} sizes="100vw" className="object-cover object-[70%_50%]" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/40 to-transparent md:from-white/70 md:via-white/10" aria-hidden />
          <div className="wrap-wide relative flex h-full flex-col justify-center">
            <div className="max-w-[560px]">
              <p data-rise-in className="font-display text-[0.9375rem] font-semibold tracking-[0.08em] text-accent uppercase">
                {s.kicker}
              </p>
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
              <Link data-rise-in href={s.cta[1]} className="btn mt-7" tabIndex={n === i ? 0 : -1}>
                {s.cta[0]}
              </Link>
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => go(i - 1)} className="absolute top-1/2 left-4 z-20 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-snow/80 text-charcoal hover:text-accent md:grid" aria-label="Previous slide">
        <Icon.ChevronLeft className="size-5" />
      </button>
      <button type="button" onClick={() => go(i + 1)} className="absolute top-1/2 right-4 z-20 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-snow/80 text-charcoal hover:text-accent md:grid" aria-label="Next slide">
        <Icon.ChevronRight className="size-5" />
      </button>
      <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center gap-2">
        {SLIDES.map((_, n) => (
          <button key={n} type="button" onClick={() => go(n)} className="relative h-1.5 w-10 overflow-hidden rounded-full bg-charcoal/20" aria-label={`Slide ${n + 1}`} aria-current={n === i}>
            {n === i && <span data-progress className="absolute inset-0 rounded-full bg-accent" />}
          </button>
        ))}
      </div>
    </section>
  );
}

/* 2 ── Branded-ingredient marquee (in the reference's press-logo slot) */
const BRANDS = ["KSM-66® Ashwagandha", "Sunfiber® PHGG", "VERISOL® Collagen", "MEG-3® Fish Oil", "affron® Saffron", "Ferrochel® Iron", "AstaReal® Astaxanthin", "TRAACS® Magnesium", "Suntheanine®", "Aquamin®"];
function IngredientStrip() {
  return (
    <section className="border-y border-line bg-snow py-7" aria-label="Branded ingredients in our formulas">
      <p className="mb-4 text-center text-[0.8125rem] tracking-[0.08em] text-graphite uppercase">Branded ingredients you will find on our labels</p>
      <div className="overflow-hidden">
        <div className="flex w-max animate-[marquee_38s_linear_infinite] gap-14 pr-14 hover:[animation-play-state:paused]">
          {[...BRANDS, ...BRANDS].map((b, k) => (
            <span key={k} className="font-display text-[1.5rem] font-semibold whitespace-nowrap text-[#8a8487]" aria-hidden={k >= BRANDS.length}>
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 3+4 ── Big title and five category tiles */
const TILES = (["gut", "sleep", "stress", "hydration", "beauty"] as const).map((id) => ({
  need: NEED_BY_ID[id],
  img: NEED_TILE[id]!,
  count: PRODUCTS.filter((p) => p.need === id && p.status === "live").length,
}));
function Categories() {
  return (
    <section className="pt-14 md:pt-20" aria-labelledby="cat-title">
      <h2 id="cat-title" className="sec-title wrap" data-rise>
        Nutrition built for one specific need
      </h2>
      <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-px overflow-x-auto md:grid md:grid-cols-5" data-stagger>
        {TILES.map((t) => (
          <Link key={t.need.id} href={`/shop?need=${t.need.id}`} className="group w-[70vw] shrink-0 snap-start bg-snow md:w-auto">
            <span className="relative block aspect-square overflow-hidden">
              <Image
                src={t.img.src}
                alt={t.img.alt}
                fill
                sizes="(min-width:768px) 20vw, 70vw"
                className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110"
              />
            </span>
            <span className="block px-4 pt-4 pb-6">
              <span className="block font-display text-[1.5rem] leading-[1.05] font-bold text-charcoal uppercase">{t.need.name}</span>
              <span className="mt-3 inline-flex rounded-full bg-accent px-4 py-1 text-[0.875rem] text-snow transition-colors group-hover:bg-accent-hover">
                Shop {t.count} {t.count === 1 ? "formula" : "formulas"}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* 5 ── "Made for your day": portrait cards that turn each pack (in the reference's video row) */
function TurnCard({ slug }: { slug: string }) {
  const p = PRODUCT_BY_SLUG[slug];
  const need = NEED_BY_ID[p.need];
  const [f, setF] = useState(0);
  const el = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!el.current || reduceMotion()) return;
    for (let k = 0; k < TURN_FRAMES; k++) new window.Image().src = turnSrc(p, k);
    let timer = 0;
    const io = new IntersectionObserver(([e]) => {
      window.clearInterval(timer);
      if (e.isIntersecting) timer = window.setInterval(() => setF((n) => (n + 1) % TURN_FRAMES), 90);
    });
    io.observe(el.current);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, [p]);
  return (
    <Link ref={el} href={`/products/${p.slug}`} className="group relative block aspect-[9/14] overflow-hidden rounded-2xl" style={{ background: need.colour }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={turnSrc(p, f)} alt={packAlt(p)} className="absolute inset-0 m-auto h-[78%] w-[78%] object-contain" loading="lazy" />
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-5 pt-16 text-snow">
        <span className="block font-display text-[1.25rem] font-semibold">{p.name}</span>
        <span className="text-[0.875rem]">{doseCount(p)} actives, every dose shown</span>
      </span>
    </Link>
  );
}
function InYourDay() {
  return (
    <section className="wrap pt-16 md:pt-24" aria-labelledby="day-title">
      <h2 id="day-title" className="sec-title" data-rise>
        Made for your day
      </h2>
      <p className="mt-3 text-center text-[0.9375rem] text-graphite italic">Turn any pack around: the full formula is on the back</p>
      <div className="mt-10">
        <Carousel label="Made for your day" perView="basis-[64%] sm:basis-[40%] lg:basis-[23.5%]">
          {["night-recovery-magnesium", "hydra-move", "stresscalm-nutrition", "collagen-glow-matrix", "bloat-gut-reset"].map((s) => (
            <TurnCard key={s} slug={s} />
          ))}
        </Carousel>
      </div>
    </section>
  );
}

/* 6 ── New! feature block */
function NewFeature() {
  const p = PRODUCT_BY_SLUG["collagen-glow-matrix"];
  const [option, setOption] = useState<PackOption>("standard");
  const hydratedEta = useHydrated();
  const eta = hydratedEta ? etaLabel() : "";
  const unit = option === "trial" && p.trialPack ? p.trialPack.price : p.price;
  return (
    <section className="wrap pt-16 md:pt-24" aria-labelledby="new-title">
      <h2 id="new-title" className="sec-title" data-rise>
        New!
      </h2>
      <div className="mx-auto mt-10 grid max-w-[1100px] items-center gap-8 md:grid-cols-2 md:gap-12">
        <div className="relative aspect-square overflow-hidden rounded-lg" data-rise>
          <Image src={SCENES.feature.src} alt={SCENES.feature.alt} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" data-pack={p.slug} />
        </div>
        <div data-rise="0.1">
          <h3 className="font-display text-[clamp(1.5rem,1.2rem+1vw,2rem)] font-semibold">{p.name}</h3>
          <p className="tnum mt-1 text-[1.25rem] text-charcoal">{formatINR(unit)}</p>
          <p className="mt-4 text-[0.9375rem]">
            <strong className="text-charcoal">Beauty, from the inside:</strong> {p.tagline}
          </p>
          <p className="mt-4 flex flex-wrap items-center gap-2 text-[0.9375rem] text-charcoal">
            <Icon.Truck className="size-5" /> Get it by <span className="underline">{eta || "in 3–5 days"}</span> <span className="text-[0.8125rem] text-graphite">(estimate)</span>
          </p>
          <p className="mt-2 flex items-center gap-2 text-[0.9375rem] text-charcoal">
            <Icon.Check className="size-5 text-veg" /> Cash or UPI on delivery
          </p>
          {p.trialPack && (
            <div className="mt-5">
              <p className="label mb-2">Pack: {option === "trial" ? p.trialPack.packCount : p.packCount}</p>
              <div className="flex gap-2" role="radiogroup" aria-label="Pack size">
                {(
                  [
                    ["trial", p.trialPack.packCount],
                    ["standard", p.packCount],
                  ] as [PackOption, string][]
                ).map(([id, l]) => (
                  <button key={id} type="button" role="radio" aria-checked={option === id} onClick={() => setOption(id)} className="pill-option">
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}
          <AddToCart product={p} option={option} className="mt-6 w-full" />
        </div>
      </div>
    </section>
  );
}

/* 7 ── Featured products */
function Featured() {
  return (
    <section className="wrap pt-16 md:pt-24" aria-labelledby="feat-title">
      <h2 id="feat-title" className="sec-title" data-rise>
        Featured Products
      </h2>
      <div className="mt-10">
        <Carousel label="Featured products">
          {LIVE.slice(0, 10).map((p) => (
            <ProductCard key={p.slug} product={p} featured />
          ))}
        </Carousel>
      </div>
    </section>
  );
}

/* 8 ── Value pillars */
function Pillars() {
  const items = [
    { icon: Icon.Flask, title: "Every dose disclosed", text: "Each active and its amount per serve is printed on the pack. No proprietary blends hiding the numbers." },
    {
      icon: Icon.Leaf,
      title: "Branded ingredients",
      text: "Named, branded ingredients with published research behind them. Research on an ingredient is not a study of our product, and we say so.",
    },
    { icon: Icon.Target, title: "Built for one need", text: "Every formula starts from one specific need, so you take what you came for and nothing you didn't." },
  ];
  return (
    <section className="band-grey mt-16 py-16 md:mt-24" aria-label="Why Superbeing">
      <div className="wrap grid gap-10 md:grid-cols-3" data-stagger>
        {items.map((it) => (
          <div key={it.title} className="text-center">
            <it.icon className="mx-auto size-12 text-accent" />
            <h3 className="mt-4 font-display text-[1.375rem] font-semibold">{it.title}</h3>
            <p className="mx-auto mt-2 max-w-[38ch] text-[0.9375rem]">{it.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* 9 ── Read the label banner (in the reference's factory-tour slot) */
function LabelBanner() {
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

/* 10 ── Count-ups from the catalogue (in the reference's sold/customer counters) */
function Counter({ to, label, icon }: { to: number; label: string; icon: React.ReactNode }) {
  const num = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (!num.current || reduceMotion()) return;
    const o = { v: 0 };
    const tw = gsap.to(o, {
      v: to,
      duration: 1.8,
      ease: "power2.out",
      onUpdate: () => {
        if (num.current) num.current.textContent = String(Math.round(o.v));
      },
      scrollTrigger: { trigger: num.current, start: "top 90%", once: true },
    });
    return () => {
      tw.scrollTrigger?.kill();
      tw.kill();
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
function Counters() {
  const actives = LIVE.reduce((n, p) => n + doseCount(p), 0);
  return (
    <section className="wrap grid grid-cols-1 gap-10 py-16 sm:grid-cols-3 md:py-20" aria-label="The range in numbers">
      <Counter to={LIVE.length} label="Formulas" icon={<Icon.Bag className="size-8" />} />
      <Counter to={actives} label="Actives, every dose shown" icon={<Icon.Flask className="size-8" />} />
      <Counter to={NEEDS.length} label="Needs covered" icon={<Icon.Target className="size-8" />} />
    </section>
  );
}

/* 11 ── Compare banner */
function CompareBanner() {
  return (
    <section className="relative overflow-hidden bg-[#f3e6eb]" aria-labelledby="cmp-title">
      <div className="relative aspect-[4/3] md:aspect-[24/9]">
        <Image src={SCENES.collection.src} alt={SCENES.collection.alt} fill sizes="100vw" className="object-cover object-right" />
      </div>
      <div className="wrap-wide absolute inset-0 flex items-end pb-8 md:items-center md:pb-0">
        <div className="max-w-[480px]" data-rise>
          <h2 id="cmp-title" className="font-display text-[clamp(1.75rem,1.2rem+2vw,3rem)] font-bold !text-accent">
            Designed for one need. Labelled for you.
          </h2>
          <p className="mt-3 text-[0.9375rem] text-charcoal">Form, serve, actives, veg mark and price for every formula, in one table.</p>
          <Link href="/the-range#compare" className="btn mt-6">
            Compare the range
          </Link>
        </div>
      </div>
    </section>
  );
}

/* 12 ── Raspberry marquee */
const STRIP = ["Every dose on the label", "Branded ingredients", "Free delivery over ₹999", "Monthly delivery: save 15%", "Cash or UPI on delivery"];
function Strip() {
  return (
    <div className="overflow-hidden bg-accent py-3 text-snow" aria-hidden>
      <div className="flex w-max animate-[marquee_30s_linear_infinite]">
        {[...STRIP, ...STRIP, ...STRIP, ...STRIP].map((s, k) => (
          <span key={k} className="flex items-center gap-4 px-6 font-display text-[1.125rem] font-medium tracking-[0.04em] whitespace-nowrap uppercase">
            <span className="size-1.5 rounded-full bg-snow" />
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

/* 13 ── Made for real days (in the reference's Instagram slot) */
function RealDays() {
  const imgs = [SCENES.heroGut, NEED_TILE.stress!, NEED_TILE.gut!, SCENES.heroHydration, NEED_TILE.beauty!, NEED_TILE.sleep!];
  return (
    <section className="wrap py-16 md:py-20" aria-labelledby="days-title">
      <div className="flex items-center gap-6">
        <span className="h-px flex-1 bg-line" />
        <h2 id="days-title" className="font-display text-[clamp(1.5rem,1.1rem+1.4vw,2.25rem)] font-semibold">
          Made for real days
        </h2>
        <span className="h-px flex-1 bg-line" />
      </div>
      <div className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-6" data-stagger>
        {imgs.map((im, k) => (
          <Link key={k} href="/shop" className="group relative block aspect-square overflow-hidden rounded-md" aria-label="Shop all products">
            <Image src={im.src} alt={im.alt} fill sizes="(min-width:768px) 16vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
            <span className="absolute inset-0 grid place-items-center bg-accent/0 text-snow opacity-0 transition-all duration-300 group-hover:bg-accent/45 group-hover:opacity-100">
              <Icon.Bag className="size-7" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function HomePage() {
  useEffect(() => {
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 600);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <>
      <Hero />
      <IngredientStrip />
      <Categories />
      <InYourDay />
      <NewFeature />
      <Featured />
      <Pillars />
      <LabelBanner />
      <Counters />
      <CompareBanner />
      <Strip />
      <RealDays />
    </>
  );
}
