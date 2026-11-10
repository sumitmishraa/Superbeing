"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useHydrated, useStore } from "@/lib/store";
import { SCENES } from "@/lib/media";
import { MAX, cleanEmail, cleanName } from "@/lib/validate";
import { Icon } from "@/components/ui";
import { useModalAnimation } from "./useModalAnimation";

/** "Get 10% off your first order": opens once, 6 seconds into the first visit, and reveals the FIRSTLABEL code. */

const DELAY_MS = 6000;

export function NewsletterPopup() {
  const hydrated = useHydrated();
  const seen = useStore((s) => s.popupSeen);
  const setSeen = useStore((s) => s.setPopupSeen);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const { box, scrim } = useModalAnimation(open);

  useEffect(() => {
    if (!hydrated || seen) return;
    const t = window.setTimeout(() => setOpen(true), DELAY_MS);
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
      <div ref={box} className="relative grid max-h-[calc(100svh-2rem)] w-full max-w-[760px] overflow-y-auto rounded-2xl bg-snow sm:grid-cols-2" data-lenis-prevent>
        <button type="button" onClick={close} className="absolute top-2 right-2 z-10 grid size-11 place-items-center rounded-full bg-snow/90 text-charcoal" aria-label="Close">
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
                if (name.trim() && !cleanName(name)) return setError("Use letters only for your first name.");
                if (!cleanEmail(email)) return setError("Enter an email like name@example.com.");
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
                  <input
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError("");
                    }}
                    autoComplete="given-name"
                    maxLength={MAX.name}
                  />
                </label>
                <label className="field" data-error={!!error}>
                  <span>Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    autoComplete="email"
                    maxLength={MAX.email}
                    aria-invalid={!!error}
                    aria-describedby={error ? "pop-email-error" : undefined}
                  />
                </label>
                {error && (
                  <p id="pop-email-error" className="field-error" role="alert">
                    {error}
                  </p>
                )}
              </div>
              <button type="submit" className="btn mt-4 w-full">
                I want 10% off
              </button>
              <p className="mt-3 text-[0.75rem] text-graphite">For new customers. Preview store: your email is not sent anywhere.</p>
            </form>
          )}
        </div>
        <div className="relative hidden min-h-[min(420px,calc(100svh-2rem))] bg-accent sm:block">
          <Image src={SCENES.popup.src} alt={SCENES.popup.alt} fill sizes="380px" className="object-cover" />
        </div>
      </div>
    </div>
  );
}
