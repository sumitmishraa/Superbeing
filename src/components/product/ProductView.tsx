"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { NEED_BY_ID, PRODUCTS, PRODUCT_BY_SLUG, doseCount, type Product } from "@/data/products";
import { useStore, useHydrated, type PackOption } from "@/lib/store";
import { TURN_FRAMES, doseFor, hasDuo, ingredientImage, packAlt, packSrc, turnSrc, type PackView } from "@/lib/media";
import { DoseLabel } from "@/components/DoseLabel";
import { ProductCard } from "@/components/ProductCard";
import { AddToCart, Icon, VegMark, WishlistButton } from "@/components/ui";
import { gsap, useGSAP, reduceMotion } from "@/lib/gsap";

/* ───────── drag-to-turn pack: 36 pre-rendered frames ───────── */
function Turntable({ p }: { p: Product }) {
  const [frame, setFrame] = useState(0);
  const drag = useRef<{ x: number; f: number } | null>(null);
  const intro = useRef<gsap.core.Tween | null>(null);
  const [hint, setHint] = useState(true);

  // Warm the cache, then play one slow turn so people see it moves.
  useEffect(() => {
    for (let i = 0; i < TURN_FRAMES; i++) new window.Image().src = turnSrc(p, i);
    if (reduceMotion()) return;
    const o = { f: 0 };
    intro.current = gsap.to(o, {
      f: TURN_FRAMES,
      duration: 2.6,
      ease: "power2.inOut",
      delay: 1,
      onUpdate: () => setFrame(Math.round(o.f) % TURN_FRAMES),
    });
    return () => {
      intro.current?.kill();
    };
  }, [p]);

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={`Turn the ${p.name} pack`}
      aria-valuemin={0}
      aria-valuemax={TURN_FRAMES - 1}
      aria-valuenow={frame}
      aria-valuetext={`${Math.round((frame / TURN_FRAMES) * 360)} degrees`}
      className="absolute inset-0 cursor-grab touch-pan-y select-none active:cursor-grabbing"
      onPointerDown={(e) => {
        intro.current?.kill();
        drag.current = { x: e.clientX, f: frame };
        e.currentTarget.setPointerCapture(e.pointerId);
        setHint(false);
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        const df = Math.round((e.clientX - drag.current.x) / 9);
        setFrame((((drag.current.f - df) % TURN_FRAMES) + TURN_FRAMES) % TURN_FRAMES);
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      onKeyDown={(e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        intro.current?.kill();
        setHint(false);
        setFrame((f) => (f + (e.key === "ArrowRight" ? 1 : -1) + TURN_FRAMES) % TURN_FRAMES);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={turnSrc(p, frame)} alt={packAlt(p)} draggable={false} data-pack={p.slug} className="absolute inset-0 m-auto h-full w-full object-contain" />
      <span className={`label pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 text-graphite transition-opacity duration-500 ${hint ? "opacity-100" : "opacity-0"}`}>
        Drag to turn
      </span>
    </div>
  );
}

/* ───────── doses as bars: the reference's rating histogram, made honest ───────── */
function toMg(dose: string) {
  const m = dose.replace(/,/g, "").match(/^([\d.]+)\s*(mg|g|mcg|µg)$/i);
  if (!m) return null;
  const v = parseFloat(m[1]);
  const u = m[2].toLowerCase();
  return u === "g" ? v * 1000 : u === "mcg" || u === "µg" ? v / 1000 : v;
}
function DoseBars({ p }: { p: Product }) {
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
            <span data-bar className="absolute inset-y-0 left-0 bg-charcoal" style={{ width: `${Math.max(2, Math.sqrt(r.mg / max) * 100)}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function Accordion({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  const [open, setOpen] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = body.current;
    if (!el) return;
    if (open) gsap.set(el, { display: "block" });
    gsap.to(el, { height: open ? "auto" : 0, duration: reduceMotion() ? 0 : 0.5, ease: "expo.inOut", onComplete: () => void (!open && gsap.set(el, { display: "none" })) });
  }, [open]);
  useEffect(() => {
    if (!id) return;
    const onHash = () => window.location.hash === `#${id}` && setOpen(true);
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [id]);
  return (
    <div id={id} className="border-b border-line">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="label flex w-full items-center justify-between py-3.5 text-left">
        {title}
        <Icon.Chevron className={`size-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div ref={body} className="h-0 overflow-hidden" style={{ display: "none" }} inert={!open}>
        <div className="pb-5">{children}</div>
      </div>
    </div>
  );
}

function NotifyForm({ slug }: { slug: string }) {
  const notify = useStore((s) => s.addNotify);
  const done = useStore((s) => s.notify.includes(slug));
  const hydrated = useHydrated();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  if (hydrated && done) return <p className="bg-off p-4 text-[1rem]">You are on the list. We will email you when it is ready.</p>;
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter an email address like name@example.com.");
        notify(slug);
      }}
    >
      <div className="flex gap-1.5">
        <label className="field flex-1" data-error={!!err}>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErr("");
            }}
            aria-invalid={!!err}
            aria-describedby={err ? "notify-err" : undefined}
          />
        </label>
        <button type="submit" className="btn">
          Notify me
        </button>
      </div>
      {err && (
        <p id="notify-err" className="field-error">
          {err}
        </p>
      )}
    </form>
  );
}

const SPOTS = ["left-[2%] bottom-[6%] w-[26%]", "right-[3%] top-[8%] w-[20%]", "right-[1%] bottom-[12%] w-[22%]", "left-[4%] top-[14%] w-[17%]"];

export function ProductView({ slug }: { slug: string }) {
  const p = PRODUCT_BY_SLUG[slug];
  const need = NEED_BY_ID[p.need];
  const live = p.status === "live";
  const [view, setView] = useState<PackView | "turn">(live ? "turn" : "front");
  const [option, setOption] = useState<PackOption>("standard");
  const [subscribe, setSubscribe] = useState(false);
  const pushRecent = useStore((s) => s.pushRecent);
  const hero = useRef<HTMLDivElement>(null);
  const buy = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(false);
  const [ing, setIng] = useState(0);

  useEffect(() => pushRecent(p.slug), [p.slug, pushRecent]);

  const unit = option === "trial" && p.trialPack ? p.trialPack.price : p.price;
  const price = subscribe ? Math.round(unit * 0.85) : unit;
  const keys = live ? p.keyIngredients.slice(0, 4) : [];
  const same = [...PRODUCTS.filter((x) => x.need === p.need && x.slug !== p.slug), ...PRODUCTS.filter((x) => x.need !== p.need && x.status === "live")].slice(0, 4);

  // Ingredients float in around the pack and drift with the pointer.
  useGSAP(
    () => {
      if (reduceMotion() || !hero.current) return;
      const el = hero.current;
      gsap.from("[data-ing]", { scale: 0.6, autoAlpha: 0, y: 30, duration: 1.2, stagger: 0.1, ease: "expo.out", delay: 0.4 });
      const items = gsap.utils.toArray<HTMLElement>("[data-ing]");
      const qx = items.map((it) => gsap.quickTo(it, "x", { duration: 1.2, ease: "power3.out" }));
      const qy = items.map((it) => gsap.quickTo(it, "y", { duration: 1.2, ease: "power3.out" }));
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        items.forEach((_, i) => {
          qx[i](nx * (14 + i * 9));
          qy[i](ny * (14 + i * 9));
        });
      };
      el.addEventListener("pointermove", move);
      return () => el.removeEventListener("pointermove", move);
    },
    { scope: hero, dependencies: [p.slug] },
  );

  // Phone buy bar appears once the main buy button has scrolled away.
  useEffect(() => {
    if (!buy.current || !live) return;
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(buy.current);
    return () => io.disconnect();
  }, [live]);

  const views: { id: PackView | "turn"; label: string }[] = live
    ? [
        { id: "turn", label: "Turn the pack" },
        { id: "back", label: "Back of pack" },
        ...(hasDuo(p) ? [{ id: "duo" as const, label: p.shape === "carton" ? "Carton and sachet" : "Three sachets" }] : []),
        { id: "macro", label: "Label close-up" },
      ]
    : [];

  return (
    <div className={showBar ? "pb-24 md:pb-0" : ""}>
      <section className="wrap grid gap-8 pt-6 pb-16 md:grid-cols-12 md:gap-6 md:pt-10">
        {/* Picture column (first on phones) */}
        <div className="md:order-2 md:col-span-7">
          {views.length > 1 && (
            <div className="mb-3 flex justify-center gap-2" role="tablist" aria-label="Pack views">
              {views.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  role="tab"
                  aria-selected={view === v.id}
                  aria-label={v.label}
                  onClick={() => setView(v.id)}
                  className={`relative size-14 overflow-hidden transition-opacity md:size-16 ${view === v.id ? "opacity-100" : "opacity-45 hover:opacity-80"}`}
                  style={v.id === "macro" ? { background: need.shade } : undefined}
                >
                  <Image src={packSrc(p, v.id === "turn" ? "front" : v.id)} alt="" fill sizes="64px" className={v.id === "macro" ? "object-cover" : "object-contain"} />
                </button>
              ))}
            </div>
          )}
          <div ref={hero} className="relative aspect-square overflow-hidden md:aspect-[5/5.2]" style={view === "macro" ? { background: need.shade } : undefined}>
            {view === "turn" && live ? (
              <div className="absolute inset-[6%_14%]">
                <Turntable p={p} />
              </div>
            ) : (
              <Image
                key={view}
                src={packSrc(p, view as PackView)}
                alt={packAlt(p, view as PackView)}
                fill
                priority
                sizes="(min-width:768px) 55vw, 100vw"
                data-pack={p.slug}
                className={`${view === "macro" ? "object-cover" : "object-contain p-[8%]"} motion-safe:animate-[fadein_.5s_ease-out]`}
              />
            )}
            {view !== "macro" &&
              keys.map((k, i) => (
                <div key={k} data-ing className={`pointer-events-none absolute aspect-square ${SPOTS[i]}`} aria-hidden>
                  <Image src={ingredientImage(k)} alt="" fill sizes="15vw" className="object-contain" />
                </div>
              ))}
          </div>
        </div>

        {/* Text column */}
        <div className="md:order-1 md:col-span-5 md:pt-6">
          <nav aria-label="Breadcrumb" className="crumbs flex flex-wrap gap-2">
            <Link href="/shop" className="hover:text-charcoal">
              [Shop]
            </Link>
            <Link href={`/shop?need=${p.need}`} className="hover:text-charcoal">
              [{need.name}]
            </Link>
            <span aria-current="page">[{p.code}]</span>
          </nav>
          <h1 className="h-display mt-4" data-split>
            {p.name}
          </h1>
          <p className="mt-2 text-[0.875rem]">{p.format}</p>

          {live && keys.length > 0 && (
            <div className="mt-6">
              <ul className="flex flex-wrap gap-2" aria-label="Key ingredients">
                {keys.map((k, i) => (
                  <li key={k}>
                    <button
                      type="button"
                      onPointerEnter={() => setIng(i)}
                      onFocus={() => setIng(i)}
                      onClick={() => setIng(i)}
                      aria-pressed={ing === i}
                      aria-label={`${k}${doseFor(p, k) ? `, ${doseFor(p, k)} per serve` : ""}`}
                      className={`relative block size-14 bg-off transition-[outline-color] duration-200 outline outline-1 -outline-offset-1 ${ing === i ? "outline-charcoal" : "outline-transparent"}`}
                    >
                      <Image src={ingredientImage(k)} alt="" fill sizes="56px" className="object-contain p-1.5" />
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[0.875rem]" aria-live="polite">
                {keys[ing]}
                {doseFor(p, keys[ing]) ? <span className="tnum text-graphite"> · {doseFor(p, keys[ing])} per serve</span> : null}
              </p>
            </div>
          )}

          {live ? (
            <>
              <ul className="mt-6 space-y-1 text-[0.875rem]">
                {p.claims.map((c) => (
                  <li key={c} className="flex gap-2">
                    <span aria-hidden>•</span>
                    {c}
                  </li>
                ))}
              </ul>
              <p className="mt-5 max-w-[52ch] text-[1rem] leading-snug">{p.tagline}</p>
            </>
          ) : (
            <p className="mt-6 max-w-[52ch] text-[1rem] leading-snug">{p.availabilityNote ?? "This formula is in label review. We will share its full label when it is ready."}</p>
          )}

          {live && (
            <div className="mt-6 border-t border-line">
              <Accordion title="Full label" id="label">
                <DoseLabel product={p} />
              </Accordion>
              <Accordion title="How to take">
                <p className="text-[1rem] leading-snug">{p.howToTake}</p>
                <p className="mt-2 text-[0.875rem] text-graphite">{p.serve}.</p>
              </Accordion>
              <Accordion title="Why it is different">
                <p className="text-[1rem] leading-snug">{p.difference}</p>
              </Accordion>
            </div>
          )}

          <div className="mt-5 space-y-1.5 bg-off p-4 text-[0.875rem] leading-snug" role="note" aria-label="Safety and allergens">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <VegMark diet={p.diet} />
              {p.allergens.length > 0 && <span>Allergens: {p.allergens.join(", ")}</span>}
            </div>
            {p.frontOfPackNote && <p className="font-semibold">{p.frontOfPackNote}.</p>}
            {live && p.safety.map((s) => <p key={s}>{s}</p>)}
            <p className="text-graphite">Food supplement. Not for medicinal use. Do not exceed the stated serve.</p>
          </div>

          {live ? (
            <div ref={buy} className="mt-8 space-y-4">
              {p.trialPack && (
                <div className="flex items-center justify-between">
                  <span className="text-[0.875rem]">Pack</span>
                  <div className="flex gap-1" role="radiogroup" aria-label="Pack size">
                    {(
                      [
                        ["trial", p.trialPack.packCount],
                        ["standard", p.packCount],
                      ] as [PackOption, string][]
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={option === id}
                        onClick={() => setOption(id)}
                        className={`h-9 px-3 text-[0.8125rem] transition-colors ${option === id ? "bg-charcoal text-snow" : "bg-off hover:bg-[#ececec]"}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <label className="check !py-0">
                <input type="checkbox" checked={subscribe} onChange={(e) => setSubscribe(e.target.checked)} />
                Deliver every month, 15% off. Skip or stop from your account.
              </label>
              <div className="flex gap-1.5">
                <WishlistButton slug={p.slug} name={p.name} className="!size-12 shrink-0 bg-off hover:bg-[#ececec]" />
                <AddToCart product={p} option={option} subscribe={subscribe} withPrice={price} className="flex-1" />
              </div>
            </div>
          ) : (
            <div className="mt-8">
              <NotifyForm slug={p.slug} />
            </div>
          )}
        </div>
      </section>

      {live && (
        <section className="wrap grid gap-10 py-16 md:grid-cols-12 md:gap-6 md:py-24" aria-labelledby="label-h">
          <div className="md:col-span-4">
            <div className="flex items-end justify-between gap-4">
              <p id="label-h" className="text-[clamp(3rem,2rem+3vw,4.5rem)] leading-none">
                {doseCount(p)}
              </p>
              <p className="pb-2 text-[0.875rem]">actives, every dose shown</p>
            </div>
            <DoseBars p={p} />
          </div>
          <div className="grid gap-8 sm:grid-cols-2 md:col-span-7 md:col-start-6">
            <div data-rise>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[0.875rem] font-semibold">Who it is for</p>
                <a href="#label" className="link-u text-[0.8125rem]">
                  View full label
                </a>
              </div>
              <p className="mt-3 text-[1rem] leading-snug">{p.forWho}</p>
            </div>
            <div data-rise="0.1">
              <p className="text-[0.875rem] font-semibold">What makes it different</p>
              <p className="mt-3 text-[1rem] leading-snug">{p.difference}</p>
            </div>
          </div>
        </section>
      )}

      <section className="wrap pb-24" aria-labelledby="same-h">
        <h2 id="same-h" className="h-display" data-split>
          Same need
        </h2>
        <ul className="mt-8 grid grid-cols-2 gap-x-1.5 gap-y-8 lg:grid-cols-4" data-stagger>
          {same.map((x) => (
            <li key={x.slug}>
              <ProductCard product={x} />
            </li>
          ))}
        </ul>
      </section>

      {live && (
        <div
          className={`fixed inset-x-0 bottom-0 z-30 flex gap-1.5 bg-snow p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] md:hidden ${
            showBar ? "translate-y-0" : "translate-y-full"
          }`}
          aria-hidden={!showBar}
          inert={!showBar}
        >
          <WishlistButton slug={p.slug} name={p.name} className="!size-12 shrink-0 bg-off" />
          <AddToCart product={p} option={option} subscribe={subscribe} withPrice={price} className="flex-1" />
        </div>
      )}
    </div>
  );
}
