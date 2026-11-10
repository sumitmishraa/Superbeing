"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PRODUCT_BY_SLUG, formatINR, doseCount } from "@/data/products";
import { useStore, useHydrated, type PackOption } from "@/lib/store";
import { SCENES, plinthSrc, packAlt } from "@/lib/media";
import { AddToCart, Icon, QtyStepper, VegMark } from "@/components/ui";
import { gsap, reduceMotion } from "@/lib/gsap";

function useModalAnim(open: boolean) {
  const box = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open || reduceMotion()) return;
    if (scrim.current) gsap.fromTo(scrim.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
    if (box.current) gsap.fromTo(box.current, { autoAlpha: 0, scale: 0.94, y: 20 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.6, ease: "expo.out" });
  }, [open]);
  return { box, scrim };
}

/** "Get 10% off your first order" — shows once, 6 seconds after the first visit. */
export function NewsletterPopup() {
  const hydrated = useHydrated();
  const seen = useStore((s) => s.popupSeen);
  const setSeen = useStore((s) => s.setPopupSeen);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const { box, scrim } = useModalAnim(open);

  useEffect(() => {
    if (!hydrated || seen) return;
    const t = window.setTimeout(() => setOpen(true), 6000);
    return () => window.clearTimeout(t);
  }, [hydrated, seen]);
  const close = () => {
    setOpen(false);
    setSeen();
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="pop-title">
      <div ref={scrim} className="absolute inset-0 bg-charcoal/55" onClick={close} aria-hidden />
      <div ref={box} className="relative grid w-full max-w-[760px] overflow-hidden rounded-2xl bg-snow sm:grid-cols-2">
        <button type="button" onClick={close} className="absolute top-3 right-3 z-10 grid size-9 place-items-center rounded-full bg-snow/90 text-charcoal" aria-label="Close">
          <Icon.Close className="size-5" />
        </button>
        <div className="flex flex-col justify-center p-7 text-center sm:p-9">
          {done ? (
            <div role="status">
              <p id="pop-title" className="h-display">
                Welcome to Superbeing
              </p>
              <p className="mt-3 text-[0.9375rem]">Use this code at checkout for 10% off your first order:</p>
              <p className="mt-4 rounded-full border-2 border-dashed border-accent px-4 py-2 font-display text-[1.375rem] font-semibold tracking-[0.08em] text-accent">FIRSTLABEL</p>
              <button type="button" onClick={close} className="btn mt-6 w-full">
                Start shopping
              </button>
            </div>
          ) : (
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter an email like name@example.com.");
                setDone(true);
                setSeen();
              }}
            >
              <p id="pop-title" className="h-display">
                Get 10% off your first order
              </p>
              <p className="mt-3 text-[0.9375rem]">Be the first to hear about new formulas, label updates and offers.</p>
              <div className="mt-5 grid gap-2 text-left">
                <label className="field">
                  <span>First name</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" />
                </label>
                <label className="field" data-error={!!err}>
                  <span>Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErr("");
                    }}
                    autoComplete="email"
                    aria-invalid={!!err}
                  />
                </label>
                {err && <p className="field-error">{err}</p>}
              </div>
              <button type="submit" className="btn mt-4 w-full">
                I want 10% off
              </button>
              <p className="mt-3 text-[0.75rem] text-graphite">For new customers. Preview store: your email is not sent anywhere.</p>
            </form>
          )}
        </div>
        <div className="relative hidden min-h-[420px] bg-accent sm:block">
          <Image src={SCENES.popup.src} alt={SCENES.popup.alt} fill sizes="380px" className="object-cover" />
        </div>
      </div>
    </div>
  );
}

/** Quick shop: picture, price, pack, quantity and add — without leaving the grid. */
export function QuickShop() {
  const slug = useStore((s) => s.quickShop);
  const setSlug = useStore((s) => s.setQuickShop);
  const p = slug ? PRODUCT_BY_SLUG[slug] : null;
  const [option, setOption] = useState<PackOption>("standard");
  const [qty, setQty] = useState(1);
  const { box, scrim } = useModalAnim(!!p);
  const [lastSlug, setLastSlug] = useState(slug);
  if (slug !== lastSlug) {
    setLastSlug(slug);
    setOption("standard");
    setQty(1);
  }
  if (!p) return null;
  const unit = option === "trial" && p.trialPack ? p.trialPack.price : p.price;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={`Quick shop: ${p.name}`}>
      <div ref={scrim} className="absolute inset-0 bg-charcoal/55" onClick={() => setSlug(null)} aria-hidden />
      <div ref={box} className="relative grid max-h-[90svh] w-full max-w-[880px] overflow-y-auto rounded-2xl bg-snow md:grid-cols-2" data-lenis-prevent>
        <button type="button" onClick={() => setSlug(null)} className="absolute top-3 right-3 z-10 grid size-9 place-items-center rounded-full bg-off text-charcoal" aria-label="Close">
          <Icon.Close className="size-5" />
        </button>
        <div className="relative aspect-square bg-snow">
          <Image src={plinthSrc(p)} alt={packAlt(p)} fill sizes="440px" className="object-cover" data-pack={p.slug} />
        </div>
        <div className="flex flex-col gap-4 p-6 md:p-8">
          <h2 className="h-section text-[1.625rem]">{p.name}</h2>
          <p className="tnum text-[1.25rem] text-charcoal">{formatINR(unit)}</p>
          <p className="text-[0.9375rem]">{p.tagline}</p>
          <p className="flex items-center gap-3 text-[0.875rem]">
            <VegMark diet={p.diet} /> <span>{doseCount(p)} actives, every dose on the label</span>
          </p>
          {p.trialPack && (
            <div>
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
          <div className="mt-auto flex items-center gap-2">
            <QtyStepper value={qty} onChange={setQty} label={p.name} />
            <AddToCart product={p} qty={qty} option={option} className="flex-1" />
          </div>
          <Link href={`/products/${p.slug}`} onClick={() => setSlug(null)} className="link-u text-[0.9375rem]">
            View full details
          </Link>
        </div>
      </div>
    </div>
  );
}
