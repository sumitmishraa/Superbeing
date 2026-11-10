"use client";

import { useEffect, useRef } from "react";
import { formatINR } from "@/data/products";
import { DELIVERY_FEE, OFFER_BY_CODE, type Quote } from "@/lib/pricing";
import { Icon } from "@/components/ui";
import { gsap, reduceMotion } from "@/lib/gsap";

/**
 * "Add ₹210 to unlock free delivery — you'll save ₹79", then a ticked "unlocked" line that
 * pulses once when the threshold is crossed. Shows the next tier only while one is left.
 */
export function TierProgress({ bill, className = "" }: { bill: Quote; className?: string }) {
  const freeDelivery = bill.savings.delivery > 0;
  const next = bill.next;
  const tick = useRef<HTMLSpanElement>(null);
  const wasFree = useRef(freeDelivery);

  useEffect(() => {
    if (freeDelivery && !wasFree.current && tick.current && !reduceMotion()) {
      gsap.fromTo(tick.current, { scale: 0.3 }, { scale: 1, duration: 0.7, ease: "back.out(3)" });
      gsap.fromTo(tick.current, { boxShadow: "0 0 0 0 rgba(19,115,58,.45)" }, { boxShadow: "0 0 0 14px rgba(19,115,58,0)", duration: 0.9, ease: "power2.out" });
    }
    wasFree.current = freeDelivery;
  }, [freeDelivery]);

  if (bill.count === 0) return null;

  const offer = next?.tier.code ? OFFER_BY_CODE[next.tier.code] : null;
  const nextCopy = next
    ? offer
      ? `Add ${formatINR(next.remaining)} to unlock ${next.tier.label.toLowerCase()} with ${offer.code}. You'll save at least ${formatINR(Math.round(next.tier.at * offer.rate))}.`
      : `Add ${formatINR(next.remaining)} to unlock free delivery. You'll save ${formatINR(next.tier.saves ?? DELIVERY_FEE)}.`
    : null;

  return (
    <div className={`space-y-2.5 ${className}`}>
      {freeDelivery && (
        <p className="flex items-center gap-2.5 text-[0.9375rem] text-charcoal">
          <span ref={tick} className="grid size-6 shrink-0 place-items-center rounded-full bg-save text-snow">
            <Icon.Check className="size-4" />
          </span>
          <span>
            Free delivery unlocked. <span className="text-save">You save {formatINR(DELIVERY_FEE)}.</span>
          </span>
        </p>
      )}
      {next && nextCopy && (
        <div>
          <p className="text-[0.9375rem] leading-snug text-charcoal" aria-live="polite">
            {nextCopy}
          </p>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-line"
            role="progressbar"
            aria-label={`Progress to ${next.tier.label.toLowerCase()}`}
            aria-valuemin={0}
            aria-valuemax={next.tier.at}
            aria-valuenow={bill.itemTotal}
          >
            <div
              className="h-full rounded-full bg-save transition-[width] duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
              style={{ width: `${Math.round(next.progress * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
