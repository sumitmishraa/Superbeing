"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NEED_BY_ID, PRODUCTS, PRODUCT_BY_SLUG, formatINR, type Product } from "@/data/products";
import { packAlt, packSrc } from "@/lib/media";
import { useHydrated, useStore } from "@/lib/store";
import { Field } from "@/components/commerce/Views";
import { gsap, reduceMotion } from "@/lib/gsap";

/* ───────── log in / create account ───────── */
const PANEL = PRODUCTS.filter((p) => p.status === "live").slice(0, 8);

function CyclingPanel() {
  const [i, setI] = useState(0);
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduceMotion()) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % PANEL.length), 3200);
    return () => window.clearInterval(t);
  }, []);
  useEffect(() => {
    if (!layer.current || reduceMotion() || i === 0) return;
    gsap.fromTo(layer.current, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "expo.inOut" });
    gsap.fromTo(layer.current.querySelector("img"), { scale: 1.15 }, { scale: 1, duration: 1.6, ease: "expo.out" });
  }, [i]);
  const p = PANEL[i];
  const prev = PANEL[(i - 1 + PANEL.length) % PANEL.length];
  return (
    <div className="relative h-full min-h-[420px] overflow-hidden" style={{ background: NEED_BY_ID[prev.need].shade }}>
      <Image src={packSrc(prev, "macro")} alt="" fill sizes="50vw" className="object-cover" />
      <div key={p.slug} ref={layer} className="absolute inset-0 overflow-hidden">
        <Image src={packSrc(p, "macro")} alt={packAlt(p, "macro")} fill sizes="50vw" className="object-cover" priority />
        <p className="label absolute bottom-5 left-5 text-snow">{p.name}</p>
      </div>
    </div>
  );
}

export function LoginView() {
  const signIn = useStore((s) => s.signIn);
  const router = useRouter();
  const sp = useSearchParams();
  const [mode, setMode] = useState<"login" | "create">("login");
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const bind = (k: keyof typeof f) => ({
    id: `lg-${k}`,
    value: f[k],
    "aria-invalid": !!errors[k],
    "aria-describedby": errors[k] ? `lg-${k}-err` : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setF({ ...f, [k]: e.target.value });
      if (errors[k]) setErrors({ ...errors, [k]: "" });
    },
  });

  return (
    <div className="grid min-h-[calc(100svh-var(--header-h))] md:grid-cols-2">
      <div className="wrap flex w-full flex-col justify-center py-12 md:max-w-[640px] md:py-16">
        <div className="flex gap-4" role="tablist" aria-label="Account">
          {(
            [
              ["login", "Log in"],
              ["create", "Create account"],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={mode === id} onClick={() => setMode(id)} className={`chip min-h-11 text-[0.875rem] ${mode === id ? "!text-charcoal" : ""}`}>
              [{label}]
            </button>
          ))}
        </div>
        <h1 className="h-display mt-6">{mode === "login" ? "Log in" : "Create account"}</h1>
        <p className="mt-3 max-w-[44ch] text-[1rem] leading-snug text-graphite">Track orders, manage monthly deliveries and see your formulas as a daily routine.</p>
        <form
          className="mt-8"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            const errs: Record<string, string> = {};
            if (mode === "create" && f.name.trim().length < 2) errs.name = "Enter your name.";
            if (!/^\S+@\S+\.\S+$/.test(f.email)) errs.email = "Enter an email like name@example.com.";
            if (f.password.length < 6) errs.password = "Use at least 6 characters.";
            setErrors(errs);
            const first = Object.keys(errs)[0];
            if (first) return document.getElementById(`lg-${first}`)?.focus();
            const name = f.name.trim() || f.email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
            signIn({ name, email: f.email.trim(), phone: f.phone.trim() });
            router.push(sp.get("next") || "/account");
          }}
        >
          <div className="grid gap-1.5">
            {mode === "create" && (
              <Field id="lg-name" label="Name" error={errors.name}>
                <input {...bind("name")} autoComplete="name" />
              </Field>
            )}
            <Field id="lg-email" label="E-mail" error={errors.email}>
              <input {...bind("email")} type="email" autoComplete="email" />
            </Field>
            {mode === "create" && (
              <Field id="lg-phone" label="Phone (optional)">
                <input {...bind("phone")} type="tel" autoComplete="tel-national" />
              </Field>
            )}
            <Field id="lg-password" label="Password" error={errors.password}>
              <input {...bind("password")} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} />
            </Field>
          </div>
          <button type="submit" className="btn mt-6 w-full">
            Continue
          </button>
          <p className="mt-3 text-[0.8125rem] text-graphite">Preview store: your details stay in this browser and are never sent anywhere.</p>
        </form>
      </div>
      <div className="hidden md:block">
        <CyclingPanel />
      </div>
    </div>
  );
}

/* ───────── account ───────── */
type Tab = "orders" | "routine" | "addresses" | "preferences";
const TABS: { id: Tab; label: string }[] = [
  { id: "orders", label: "Orders" },
  { id: "routine", label: "My routine" },
  { id: "addresses", label: "Addresses" },
  { id: "preferences", label: "Preferences" },
];
const SLOTS = [
  { id: "morning", label: "Morning", test: /breakfast|morning/i },
  { id: "meals", label: "Around meals", test: /meal|chai/i },
  { id: "evening", label: "Evening", test: /dinner|evening|bed|sleep/i },
  { id: "as-needed", label: "As needed", test: /as needed|heat|activity|late nights|travel/i },
] as const;
function slotsFor(p: Product): string[] {
  const s = SLOTS.filter((x) => x.test.test(p.howToTake)).map((x) => x.id);
  return s.length ? s : ["meals"];
}

function Thumb({ p }: { p: Product }) {
  return (
    <span className="relative block h-[84px] w-[68px] shrink-0 bg-off">
      <Image src={packSrc(p)} alt={packAlt(p)} fill sizes="68px" className="object-contain p-1.5" />
    </span>
  );
}

const BIG = "py-0.5 text-[clamp(1.5rem,1.1rem+1.4vw,2.25rem)] leading-[1.1] uppercase transition-colors duration-300";

export function AccountView() {
  const hydrated = useHydrated();
  const router = useRouter();
  const s = useStore();
  const [tab, setTab] = useState<Tab>("orders");
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hydrated && !s.profile) router.replace("/login?next=/account");
  }, [hydrated, s.profile, router]);
  useEffect(() => {
    if (panel.current && !reduceMotion()) gsap.fromTo(panel.current, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out" });
  }, [tab]);

  if (!hydrated || !s.profile) return <div className="wrap min-h-[70svh] py-16" aria-busy="true" />;

  const mine = Array.from(new Set([...s.orders.flatMap((o) => o.lines.map((l) => l.slug)), ...s.cart.map((l) => l.slug), ...s.wishlist]))
    .map((slug) => PRODUCT_BY_SLUG[slug])
    .filter((p): p is Product => !!p && p.status === "live");

  return (
    <div className="wrap grid gap-10 pt-10 pb-24 md:grid-cols-12 md:gap-6 md:pt-16">
      <div className="md:col-span-4">
        <p className="crumbs">[{s.profile.email}]</p>
        <h1 className="h-display mt-3">Hello, {s.profile.name.split(" ")[0]}</h1>
        <ul className="mt-8" role="tablist" aria-label="Account sections" aria-orientation="vertical">
          {TABS.map((t) => (
            <li key={t.id}>
              <button type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`${BIG} ${tab === t.id ? "text-charcoal" : "text-[#b4b4b4] hover:text-charcoal"}`}>
                {t.label}
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => {
                s.signOut();
                router.push("/");
              }}
              className={`${BIG} text-[#b4b4b4] hover:text-charcoal`}
            >
              Log out
            </button>
          </li>
        </ul>
      </div>

      <div ref={panel} className="md:col-span-7 md:col-start-6" role="tabpanel">
        {tab === "orders" &&
          (s.orders.length === 0 ? (
            <div>
              <p className="text-[1.25rem]">No orders yet.</p>
              <Link href="/shop" className="btn mt-6">
                Shop all products
              </Link>
            </div>
          ) : (
            <ul>
              {s.orders.map((o) => (
                <li key={o.id} className="border-b border-line py-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <p className="tnum text-[1.125rem]">{o.id}</p>
                    <p className="text-[0.8125rem] text-graphite">
                      {new Date(o.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} · Confirmed ·{" "}
                      <span className="tnum text-charcoal">{formatINR(o.total)}</span>
                    </p>
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {o.lines.map((l) => {
                      const p = PRODUCT_BY_SLUG[l.slug];
                      return p ? (
                        <li key={l.slug + l.option}>
                          <Link href={`/products/${p.slug}`} aria-label={`${p.name} × ${l.qty}${l.subscribe ? ", monthly" : ""}`}>
                            <Thumb p={p} />
                          </Link>
                        </li>
                      ) : null;
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          ))}

        {tab === "routine" && (
          <>
            <p className="max-w-[56ch] text-[1rem] leading-snug text-graphite">
              Your formulas laid out as a day, from the directions on each pack. Check the safety notes on each product page before combining formulas.
            </p>
            {mine.length === 0 ? (
              <p className="mt-6 bg-off p-5 text-[1rem]">
                Add a product to your cart or wishlist and it will appear here.{" "}
                <Link href="/shop" className="link-u">
                  Shop
                </Link>
              </p>
            ) : (
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {SLOTS.map((slot) => {
                  const items = mine.filter((p) => slotsFor(p).includes(slot.id));
                  return (
                    <div key={slot.id}>
                      <h2 className="label border-b border-charcoal pb-2">{slot.label}</h2>
                      {items.length === 0 ? (
                        <p className="mt-3 text-[0.875rem] text-graphite">Nothing here.</p>
                      ) : (
                        <ul className="mt-3 space-y-3">
                          {items.map((p) => (
                            <li key={p.slug} className="flex gap-3">
                              <Thumb p={p} />
                              <span className="min-w-0">
                                <Link href={`/products/${p.slug}`} className="block text-[1rem] leading-tight hover:underline">
                                  {p.name}
                                </Link>
                                <span className="mt-1 block text-[0.8125rem] leading-snug text-graphite">{p.howToTake}</span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === "addresses" &&
          (s.addresses.length === 0 ? (
            <p className="text-[1.0625rem]">Addresses you use at checkout are saved here.</p>
          ) : (
            <div className="grid gap-1.5 sm:grid-cols-2">
              {s.addresses.map((a, i) => (
                <div key={a.pin + a.line1} className="bg-off p-5 text-[1rem] leading-relaxed">
                  {i === 0 && <p className="label mb-2 text-graphite">Default</p>}
                  <p>{a.name}</p>
                  <p>{a.line1}</p>
                  <p>
                    {a.city}, {a.state} <span className="tnum">{a.pin}</span>
                  </p>
                  <p className="tnum text-graphite">{a.phone}</p>
                </div>
              ))}
            </div>
          ))}

        {tab === "preferences" && (
          <div className="max-w-[640px]">
            {(
              [
                ["veg", "Show vegetarian products first", "Non-vegetarian products stay visible and clearly marked."],
                ["reminders", "Refill reminders", "A note five days before a pack runs out."],
                ["newsletter", "Label notes by email", "New products and label changes, once a month at most."],
              ] as const
            ).map(([k, label, hint]) => (
              <label key={k} className="check items-start border-b border-line !py-4">
                <input type="checkbox" checked={s.prefs[k]} onChange={(e) => s.setPrefs({ [k]: e.target.checked })} className="mt-0.5 shrink-0" />
                <span>
                  <span className="block text-[1rem]">{label}</span>
                  <span className="text-[0.8125rem] text-graphite">{hint}</span>
                </span>
              </label>
            ))}
            <p className="mt-6 text-[0.875rem] text-graphite">
              {s.profile.email}
              {s.profile.phone ? ` · ${s.profile.phone}` : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
