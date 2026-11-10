"use client";

import Link from "next/link";
import { useState } from "react";
import { PLATE_CREDITS } from "@/lib/media";
import { Icon, Logo } from "@/components/ui";

const COLS: [string, [string, string][]][] = [
  [
    "Product",
    [
      ["/shop", "Shop"],
      ["/search", "Search"],
      ["/the-range", "The Range"],
      ["/wishlist", "Wishlist"],
    ],
  ],
  [
    "Learn",
    [
      ["/the-range#faq", "FAQs"],
      ["/the-range#compare", "Compare formulas"],
      ["/contact", "About us"],
    ],
  ],
  [
    "Information",
    [
      ["/contact#delivery", "Delivery"],
      ["/contact#returns", "Returns"],
      ["/account", "Manage my account"],
      ["/contact", "Contact us"],
    ],
  ],
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  return (
    <footer className="band-grey pb-20 lg:pb-0">
      <div className="wrap grid gap-10 pt-16 pb-12 md:grid-cols-12">
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
          {COLS.map(([title, links]) => (
            <div key={title}>
              <p className="font-display text-[1.0625rem] font-semibold text-charcoal">{title}</p>
              <ul className="mt-4 space-y-2.5">
                {links.map(([href, label]) => (
                  <li key={label}>
                    <Link href={href} className="text-[0.9375rem] transition-colors hover:text-accent">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <address className="col-span-2 flex gap-2 text-[0.9375rem] not-italic sm:col-span-3">
            <svg viewBox="0 0 24 24" className="mt-0.5 size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M12 21s-6.5-5.6-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.4-6.5 11-6.5 11Z" />
              <circle cx="12" cy="10" r="2.3" />
            </svg>
            Nuvexa Biotech Pvt. Ltd., Amar Complex, Sarjapur Road, Attibele, Bengaluru 562107
          </address>
        </nav>
        <div className="md:col-span-5">
          <p className="font-display text-[1.0625rem] font-semibold text-charcoal">Newsletter</p>
          <p className="mt-4 text-[0.9375rem]">Subscribe to our newsletter and get 10% off your first purchase.</p>
          {done ? (
            <p className="mt-4 text-[0.9375rem] text-charcoal" role="status">
              Thanks. Your code is FIRSTLABEL.
            </p>
          ) : (
            <form
              noValidate
              className="mt-4 flex rounded-full border border-charcoal bg-snow p-1"
              onSubmit={(e) => {
                e.preventDefault();
                if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter an email like name@example.com.");
                setError("");
                setDone(true);
              }}
            >
              <label htmlFor="news-email" className="sr-only">
                Your email address
              </label>
              <input
                id="news-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                aria-invalid={!!error}
                className="min-w-0 flex-1 bg-transparent px-4 text-[0.9375rem] outline-none placeholder:text-graphite"
              />
              <button type="submit" className="btn btn-dark !min-h-10">
                Subscribe
              </button>
            </form>
          )}
          {error && <p className="field-error">{error}</p>}
          <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-snow px-4 py-2 text-[0.875rem] text-charcoal">
            <Icon.Shield className="size-4 text-accent" /> Cash or UPI on delivery · card payments at launch
          </p>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="wrap flex flex-col gap-3 py-6 text-[0.8125rem] md:flex-row md:items-center md:justify-between">
          <p className="flex items-center gap-3">
            <Logo className="h-5 shrink-0 text-charcoal" label="Superbeing Nutrition" />
            <span>
              © 2026 <span className="text-accent">Superbeing Nutrition</span>, a brand of Nuvexa Biotech. Food supplements, not for medicinal use.
            </span>
          </p>
          <p className="max-w-[60ch] text-graphite">
            Product pictures are 3D renders of our label designs; some lifestyle scenes are AI-generated from those renders. Plant drawings:{" "}
            {PLATE_CREDITS.map((c, i) => (
              <span key={c.href}>
                <a href={c.href} className="underline" target="_blank" rel="noreferrer">
                  {c.label}
                </a>
                {i < PLATE_CREDITS.length - 1 ? "; " : ""}
              </span>
            ))}
            , public domain. Prices and offers are samples.
          </p>
        </div>
      </div>
    </footer>
  );
}
