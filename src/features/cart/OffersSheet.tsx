"use client";

import { useEffect, useRef, useState } from "react";
import { formatINR } from "@/data/products";
import { OFFERS, OFFER_BY_CODE, offerStatus, type Quote } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { cleanCoupon, MAX } from "@/lib/validate";
import { Icon } from "@/components/ui";
import { gsap, reduceMotion } from "@/lib/gsap";

/**
 * The applied code ("FIRSTLABEL applied · You save ₹150 with this code") with Remove, and a
 * "View all offers" sheet listing every code: applied, ready to apply, or "Add ₹X more to unlock".
 * The best code is applied for the shopper (see useAutoOffer); they can remove it or pick another.
 */
export function OffersSheet({ bill }: { bill: Quote }) {
  const remove = useStore((s) => s.removeCoupon);
  const [open, setOpen] = useState(false);
  const c = bill.coupon;
  return (
    <div className="rounded-xl border border-line">
      <div className="flex min-h-14 items-center gap-3 px-3.5 py-2.5">
        <Icon.Percent className={`size-5 shrink-0 ${c?.valid ? "text-save" : "text-charcoal"}`} />
        <div className="min-w-0 flex-1 text-[0.875rem] leading-snug">
          {c ? (
            <>
              <p className="font-semibold text-charcoal">{c.code} applied</p>
              <p className={c.valid ? "text-save" : "text-graphite"}>
                {c.valid ? `You save ${formatINR(bill.discount)} with this code` : `Add ${formatINR(c.shortBy)} more to use this code`}
              </p>
            </>
          ) : (
            <p className="text-charcoal">Apply a code</p>
          )}
        </div>
        {c && (
          <button type="button" onClick={remove} className="min-h-11 px-1 text-[0.8125rem] underline underline-offset-4">
            Remove
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-11 w-full items-center justify-between border-t border-line px-3.5 text-[0.8125rem] font-medium text-accent"
        aria-haspopup="dialog"
      >
        View all offers <Icon.ChevronRight className="size-4" />
      </button>
      <OffersDialog open={open} onClose={() => setOpen(false)} bill={bill} />
    </div>
  );
}

/** Bottom sheet on phones, centred dialog on larger screens. Native <dialog> gives focus trapping and Esc. */
function OffersDialog({ open, onClose, bill }: { open: boolean; onClose: () => void; bill: Quote }) {
  const ref = useRef<HTMLDialogElement>(null);
  const apply = useStore((s) => s.applyCoupon);
  const firstOrder = useStore((s) => s.orders.length === 0);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      if (!reduceMotion()) gsap.fromTo(d, { yPercent: 12, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.45 });
    } else if (!open && d.open) d.close();
  }, [open]);

  /** Applies a code if this cart and this shopper can use it; otherwise says why not. */
  const tryApply = (raw: string) => {
    const clean = cleanCoupon(raw);
    const offer = clean ? OFFER_BY_CODE[clean] : undefined;
    if (!offer) return setMsg("That code is not valid.");
    const s = offerStatus(offer, bill.itemTotal, firstOrder);
    if (s.state === "first-order-only") return setMsg(`${offer.code} is for a first order only.`);
    if (s.state === "locked") return setMsg(`Add ${formatINR(s.shortBy)} more to use ${offer.code}.`);
    apply(offer.code);
    setMsg("");
    setCode("");
    onClose();
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="fixed inset-x-0 top-auto bottom-0 m-0 max-h-[85svh] w-full max-w-none overflow-y-auto rounded-t-2xl bg-snow p-0 text-body backdrop:bg-charcoal/55 sm:inset-0 sm:m-auto sm:max-w-[480px] sm:rounded-2xl"
      aria-labelledby="offers-h"
      data-lenis-prevent
    >
      <div className="sticky top-0 flex items-center justify-between border-b border-line bg-snow px-5 py-2">
        <h2 id="offers-h" className="h-section">
          Offers
        </h2>
        <button type="button" onClick={onClose} className="grid size-11 place-items-center" aria-label="Close offers">
          <Icon.Close className="size-5" />
        </button>
      </div>
      <div className="space-y-4 px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            tryApply(code);
          }}
        >
          <label className="field min-w-0 flex-1" data-error={!!msg}>
            <span>Have a code?</span>
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setMsg("");
              }}
              maxLength={MAX.coupon}
              autoCapitalize="characters"
              className="uppercase"
              aria-invalid={!!msg}
              aria-describedby={msg ? "offer-msg" : undefined}
            />
          </label>
          <button type="submit" className="btn btn-outline btn-sm !min-h-[54px]">
            Apply
          </button>
        </form>
        {msg && (
          <p id="offer-msg" className="field-error -mt-2" role="alert">
            {msg}
          </p>
        )}

        <ul className="space-y-2.5">
          {OFFERS.map((o) => {
            const s = offerStatus(o, bill.itemTotal, firstOrder);
            const applied = bill.coupon?.code === o.code && bill.coupon.valid;
            return (
              <li key={o.code} className={`rounded-xl border px-4 py-3 ${applied ? "border-save bg-save-soft" : "border-line"}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-[1rem] font-semibold tracking-[0.06em] text-charcoal">{o.code}</p>
                    <p className="text-[0.875rem] leading-snug">{o.title}</p>
                  </div>
                  {applied ? (
                    <span className="flex items-center gap-1 text-[0.8125rem] font-semibold text-save">
                      <Icon.Check className="size-4" /> Applied
                    </span>
                  ) : s.state === "available" ? (
                    <button type="button" onClick={() => tryApply(o.code)} className="btn btn-sm !min-h-11">
                      Apply
                    </button>
                  ) : null}
                </div>
                <p className={`mt-1.5 text-[0.8125rem] ${applied || s.state === "available" ? "text-save" : "text-graphite"}`}>
                  {s.state === "first-order-only"
                    ? "For a first order only."
                    : s.state === "locked"
                      ? `Add ${formatINR(s.shortBy)} more to unlock.`
                      : `Saves ${formatINR(s.saves)} on this order.`}
                </p>
              </li>
            );
          })}
        </ul>
        <p className="text-[0.75rem] text-graphite">One code per order. We apply the one that saves you the most; you can change it here.</p>
      </div>
    </dialog>
  );
}
