"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { gsap, reduceMotion } from "@/lib/gsap";
import { Icon } from "@/components/ui";

/** Raspberry bar above the header, rotating three messages every 4.2 s. Closed for the rest of the visit once dismissed. */

const MESSAGES = [
  { text: "Free delivery on orders over ₹999", href: "/shop" },
  { text: "Monthly delivery: save 15% on every pack", href: "/shop" },
  { text: "Every active, every dose, printed on the pack", href: "/the-range" },
];

export function AnnouncementBar() {
  const closed = useStore((s) => s.annClosed);
  const close = useStore((s) => s.closeAnnouncement);
  const [i, setI] = useState(0);
  const line = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (closed) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % MESSAGES.length), 4200);
    return () => window.clearInterval(t);
  }, [closed]);
  useEffect(() => {
    if (line.current && !reduceMotion()) gsap.fromTo(line.current, { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: "expo.out" });
  }, [i]);

  if (closed) return null;
  const message = MESSAGES[i];
  return (
    <div className="relative bg-accent text-snow">
      <div className="wrap-wide flex h-10 items-center justify-center overflow-hidden">
        <Link ref={line} key={i} href={message.href} className="font-display text-[0.9375rem] font-medium tracking-[0.02em] hover:underline">
          {message.text} →
        </Link>
      </div>
      <button type="button" onClick={close} className="absolute top-1/2 right-1 flex min-h-10 min-w-11 -translate-y-1/2 items-center justify-center gap-1 text-[0.8125rem]" aria-label="Close announcement">
        <Icon.Close className="size-4" />
        <span className="hidden sm:inline">close</span>
      </button>
    </div>
  );
}
