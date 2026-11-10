"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LIVE_PRODUCTS, NEED_BY_ID } from "@/data/products";
import { packAlt, packSrc } from "@/lib/media";
import { useStore } from "@/lib/store";
import { cleanEmail } from "@/lib/validate";
import { gsap, reduceMotion } from "@/lib/gsap";
import { Field } from "@/components/ui";

/**
 * /login: log in or create an account (preview only: the profile is kept in this browser), then
 * return to ?next= or /account. Desktop shows a panel of label close-ups beside the form.
 */

const PANEL_PRODUCTS = LIVE_PRODUCTS.slice(0, 8);
const PANEL_MS = 3200;

/** Label close-ups that wipe up one after another, every 3.2 s. */
function CyclingPanel() {
  const [i, setI] = useState(0);
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduceMotion()) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % PANEL_PRODUCTS.length), PANEL_MS);
    return () => window.clearInterval(t);
  }, []);
  useEffect(() => {
    if (!layer.current || reduceMotion() || i === 0) return;
    gsap.fromTo(layer.current, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "expo.inOut" });
    gsap.fromTo(layer.current.querySelector("img"), { scale: 1.15 }, { scale: 1, duration: 1.6, ease: "expo.out" });
  }, [i]);

  const p = PANEL_PRODUCTS[i];
  const prev = PANEL_PRODUCTS[(i - 1 + PANEL_PRODUCTS.length) % PANEL_PRODUCTS.length];
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

type Mode = "login" | "create";
type Form = { name: string; email: string; phone: string; password: string };

function validate(f: Form, mode: Mode): Partial<Record<keyof Form, string>> {
  const errors: Partial<Record<keyof Form, string>> = {};
  if (mode === "create" && f.name.trim().length < 2) errors.name = "Enter your name.";
  if (!cleanEmail(f.email)) errors.email = "Enter an email like name@example.com.";
  if (f.password.length < 6) errors.password = "Use at least 6 characters.";
  return errors;
}

/** "asha.rao@example.com" → "Asha Rao", used when no name was given. */
function nameFromEmail(email: string) {
  return email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function LoginView() {
  const signIn = useStore((s) => s.signIn);
  const router = useRouter();
  const sp = useSearchParams();
  const [mode, setMode] = useState<Mode>("login");
  const [f, setF] = useState<Form>({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});

  const bind = (k: keyof Form) => ({
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
            const found = validate(f, mode);
            setErrors(found);
            const first = Object.keys(found)[0];
            if (first) return document.getElementById(`lg-${first}`)?.focus();
            signIn({ name: f.name.trim() || nameFromEmail(f.email), email: f.email.trim(), phone: f.phone.trim() });
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
