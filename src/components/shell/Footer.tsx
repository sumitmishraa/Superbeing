"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { NEEDS } from "@/data/products";
import { PLATE_CREDITS } from "@/lib/media";
import { Logo } from "@/components/ui";
import { gsap, reduceMotion } from "@/lib/gsap";

const COLS: [string, [string, string][]][] = [
  [
    "About us",
    [
      ["/#about", "Our approach"],
      ["/contact", "Contact"],
      ["/contact#faq", "Questions"],
    ],
  ],
  ["Shop", NEEDS.slice(0, 6).map((n) => [`/shop?need=${n.id}`, n.short] as [string, string])],
  [
    "For customers",
    [
      ["/contact#delivery", "Delivery"],
      ["/contact#returns", "Returns"],
      ["/account", "My account"],
      ["/wishlist", "Wishlist"],
    ],
  ],
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const mark = useRef<HTMLDivElement>(null);

  // The giant logo rises out of the footer's lower edge as it scrolls into view.
  useEffect(() => {
    if (!mark.current || reduceMotion()) return;
    const tw = gsap.fromTo(
      mark.current,
      { yPercent: 45 },
      { yPercent: 0, ease: "none", scrollTrigger: { trigger: mark.current, start: "top bottom", end: "bottom bottom", scrub: 0.6 } },
    );
    return () => {
      tw.scrollTrigger?.kill();
      tw.kill();
    };
  }, []);

  return (
    <footer className="overflow-hidden bg-off">
      <div className="wrap grid gap-12 pt-14 pb-10 lg:grid-cols-12 md:pt-16">
        <div className="lg:col-span-5">
          <h2 className="text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] leading-[1.05] tracking-[-0.02em]">Get new launches, label updates and offers.</h2>
          {done ? (
            <p className="mt-8 text-[1.0625rem]" role="status">
              Thanks. You are on the list.
            </p>
          ) : (
            <form
              noValidate
              className="mt-8 flex max-w-md"
              onSubmit={(e) => {
                e.preventDefault();
                if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter an email address like name@example.com.");
                setError("");
                setDone(true);
              }}
            >
              <label htmlFor="news-email" className="sr-only">
                Email address
              </label>
              <input
                id="news-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="EMAIL ADDRESS"
                aria-invalid={!!error}
                aria-describedby={error ? "news-error" : undefined}
                className="min-w-0 flex-1 border-b border-charcoal bg-transparent text-[0.875rem] outline-none placeholder:text-charcoal"
              />
              <button type="submit" className="btn">
                Subscribe
              </button>
            </form>
          )}
          {error && (
            <p id="news-error" className="field-error">
              {error}
            </p>
          )}
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-6 lg:col-start-7">
          {COLS.map(([title, links]) => (
            <div key={title}>
              <p className="label">{title}</p>
              <ul className="mt-3 space-y-1.5">
                {links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="text-[1rem] text-graphite transition-colors hover:text-charcoal">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="wrap grid gap-6 pb-6 text-[0.8125rem] text-graphite lg:grid-cols-12">
        <p className="max-w-[68ch] lg:col-span-5">
          Superbeing Nutrition is a brand of Nuvexa Biotech, Bengaluru. Food supplements, not for medicinal use. Ingredient research is research on the ingredient, not on our
          finished products.
        </p>
        <p className="max-w-[68ch] lg:col-span-6 lg:col-start-7">
          Pack pictures are 3D renders of our label designs. Plant drawings:{" "}
          {PLATE_CREDITS.map((c, i) => (
            <span key={c.href}>
              <a href={c.href} className="underline underline-offset-2 hover:text-charcoal" rel="noreferrer" target="_blank">
                {c.label}
              </a>
              {i < PLATE_CREDITS.length - 1 ? "; " : ""}
            </span>
          ))}
          , public domain, via Wikimedia Commons. Prices and offers are samples for this preview.
        </p>
      </div>

      <div className="wrap flex justify-end" aria-hidden>
        <div ref={mark} className="-mb-[6%] w-full max-w-[1100px]">
          <Logo className="w-full text-charcoal" label="" />
        </div>
      </div>
    </footer>
  );
}
