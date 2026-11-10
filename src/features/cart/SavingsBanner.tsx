import { formatINR } from "@/data/products";
import type { Quote } from "@/lib/pricing";

/** Green "You're saving ₹X" banner, itemised so every rupee in it can be traced to the bill. */
export function SavingsBanner({ bill, className = "" }: { bill: Quote; className?: string }) {
  const { savings, coupon } = bill;
  if (savings.total <= 0) return null;
  const parts = [
    savings.delivery > 0 && `${formatINR(savings.delivery)} free delivery`,
    savings.coupon > 0 && coupon && `${formatINR(savings.coupon)} with ${coupon.code}`,
    savings.monthly > 0 && `${formatINR(savings.monthly)} monthly delivery`,
  ].filter(Boolean);
  return (
    <div className={`rounded-xl bg-save-soft px-4 py-3 ${className}`} role="status">
      <p className="font-display text-[1.0625rem] font-semibold tracking-[0.02em] text-save uppercase">
        You&rsquo;re saving <span className="tnum">{formatINR(savings.total)}</span> on this order
      </p>
      <p className="mt-0.5 text-[0.8125rem] leading-snug text-charcoal">
        That&rsquo;s <span className="tnum">{formatINR(savings.total)}</span> kept for your next refill.{" "}
        <span className="text-graphite">{parts.join(" · ")}</span>
      </p>
    </div>
  );
}
