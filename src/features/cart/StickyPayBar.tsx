"use client";

import { useEffect, useRef } from "react";
import { formatINR } from "@/data/products";

/** "To pay ₹X" over "You save ₹Y", used in the pay bar and the cart drawer's footer. */
export function PaySummary({ total, saved }: { total: number; saved: number }) {
  return (
    <p className="min-w-0 flex-1 leading-tight">
      <span className="tnum block text-[1.125rem] font-semibold text-charcoal">To pay {formatINR(total)}</span>
      {saved > 0 && <span className="tnum block text-[0.8125rem] text-save">You save {formatINR(saved)}</span>}
    </p>
  );
}

/**
 * Fixed bottom bar: "To pay ₹X · You save ₹Y" and the page's main button.
 * Publishes its height as --bottom-bar so the footer is never hidden, pads for the home
 * indicator, and rides above the on-screen keyboard using visualViewport.
 */
export function StickyPayBar({
  total,
  saved,
  mobileOnly = false,
  children,
}: {
  total: number;
  saved: number;
  mobileOnly?: boolean;
  children: React.ReactNode;
}) {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const root = document.documentElement.style;
    const ro = new ResizeObserver(() => root.setProperty("--bottom-bar", `${el.offsetHeight}px`));
    ro.observe(el);

    const vv = window.visualViewport;
    const lift = () => {
      if (!vv) return;
      const keyboard = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      el.style.transform = keyboard > 0 ? `translateY(-${keyboard}px)` : "";
    };
    vv?.addEventListener("resize", lift);
    vv?.addEventListener("scroll", lift);
    return () => {
      ro.disconnect();
      vv?.removeEventListener("resize", lift);
      vv?.removeEventListener("scroll", lift);
      root.removeProperty("--bottom-bar");
    };
  }, []);

  return (
    <div
      ref={bar}
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-snow pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_-20px_rgba(0,0,0,.3)] ${mobileOnly ? "lg:hidden" : ""}`}
    >
      <div className="wrap flex items-center gap-4 py-2.5">
        <PaySummary total={total} saved={saved} />
        {children}
      </div>
    </div>
  );
}
