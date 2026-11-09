"use client";

import Image from "next/image";
import Link from "next/link";
import { FREE_SHIPPING_AT, PRODUCT_BY_SLUG, formatINR } from "@/data/products";
import { useStore, useHydrated, cartTotals, linePrice, type CartLine } from "@/lib/store";
import { packSrc, packAlt } from "@/lib/media";
import { Icon, QtyStepper } from "@/components/ui";
import { useOverlay } from "./useOverlay";

export function ShippingMeter({ subtotal }: { subtotal: number }) {
  const left = Math.max(0, FREE_SHIPPING_AT - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_AT) * 100);
  return (
    <div>
      <p className="text-[0.875rem]">{left === 0 ? "Free delivery on this order." : `${formatINR(left)} more for free delivery.`}</p>
      <div className="mt-2 h-[2px] bg-line" aria-hidden>
        <div className="h-full bg-charcoal transition-[width] duration-700 ease-[cubic-bezier(.22,1,.36,1)]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** The reference's item row: picture tile, name with remove, code and quantity, price. */
export function CartLineRow({ line, size = "md" }: { line: CartLine; size?: "sm" | "md" }) {
  const p = PRODUCT_BY_SLUG[line.slug];
  const setQty = useStore((s) => s.setQty);
  const remove = useStore((s) => s.removeLine);
  if (!p) return null;
  const pack = line.option === "trial" && p.trialPack ? p.trialPack.packCount : p.packCount;
  return (
    <li className="grid grid-cols-[auto_1fr] gap-4 py-3">
      <Link href={`/products/${p.slug}`} className={`relative block bg-off ${size === "sm" ? "h-[120px] w-[96px]" : "h-[140px] w-[112px]"}`}>
        <Image src={packSrc(p)} alt={packAlt(p)} fill sizes="112px" className="object-contain p-2" />
      </Link>
      <div className="flex min-w-0 flex-col">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/products/${p.slug}`} className="text-[1.0625rem] leading-tight hover:underline">
            {p.name}
          </Link>
          <button type="button" onClick={() => remove(line.slug, line.option)} className="-mt-2 -mr-2 grid size-9 shrink-0 place-items-center" aria-label={`Remove ${p.name}`}>
            <Icon.Close className="size-4" />
          </button>
        </div>
        <p className="mt-auto text-[0.8125rem] text-graphite">
          Code {p.code} · {pack}
          {line.subscribe ? " · Monthly, 15% off" : ""}
        </p>
        <div className="mt-2 flex items-end justify-between gap-3">
          <QtyStepper value={line.qty} onChange={(n) => setQty(line.slug, line.option, n)} label={p.name} />
          <span className="tnum text-[1.125rem]">{formatINR(linePrice(line))}</span>
        </div>
      </div>
    </li>
  );
}

export function UndoBar() {
  const last = useStore((s) => s.lastRemoved);
  const undo = useStore((s) => s.undoRemove);
  if (!last) return null;
  const p = PRODUCT_BY_SLUG[last.line.slug];
  return (
    <div className="flex items-center justify-between gap-3 bg-off px-3 py-2 text-[0.875rem]" role="status">
      <span>{p?.name} removed.</span>
      <button type="button" onClick={undo} className="link-u">
        Undo
      </button>
    </div>
  );
}

export function CartDrawer() {
  const open = useStore((s) => s.cartOpen);
  const setOpen = useStore((s) => s.setCartOpen);
  const cart = useStore((s) => s.cart);
  const coupon = useStore((s) => s.coupon);
  const hydrated = useHydrated();
  const lines = hydrated ? cart : [];
  const t = cartTotals(lines, coupon);
  const { panel, scrim } = useOverlay<HTMLDivElement>(open, "side", (el) => el.querySelector<HTMLElement>("[data-close]")?.focus());

  return (
    <>
      <div ref={scrim} style={{ display: "none" }}
      className="invisible fixed inset-0 z-50 bg-charcoal/40 opacity-0" onClick={() => setOpen(false)} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
        style={{ display: "none" }}
      className="invisible fixed inset-y-0 right-0 z-50 flex w-[min(480px,100vw)] flex-col bg-snow"
        data-lenis-prevent
      >
        <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between px-5">
          <p className="h-section uppercase">
            Cart <span className="tnum">[{t.count}]</span>
          </p>
          <button type="button" data-close onClick={() => setOpen(false)} className="grid size-11 place-items-center" aria-label="Close cart">
            <Icon.Close className="size-6" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col justify-between px-5 pb-6">
            <div>
              <p className="mt-4 text-[1.0625rem]">Your cart is empty.</p>
              <UndoBar />
            </div>
            <Link href="/shop" onClick={() => setOpen(false)} className="btn w-full">
              Shop all products
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5">
              <UndoBar />
              <ul>
                {lines.map((l) => (
                  <CartLineRow key={`${l.slug}-${l.option}`} line={l} size="sm" />
                ))}
              </ul>
            </div>
            <div className="shrink-0 space-y-3 px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <ShippingMeter subtotal={t.subtotal - t.discount} />
              <dl className="space-y-1 text-[1rem]">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="tnum">{formatINR(t.subtotal)}</dd>
                </div>
                {t.discount > 0 && (
                  <div className="flex justify-between">
                    <dt>Discount</dt>
                    <dd className="tnum">−{formatINR(t.discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt>Delivery</dt>
                  <dd className="tnum">{t.shipping ? formatINR(t.shipping) : "Free"}</dd>
                </div>
                <div className="flex justify-between pt-2 text-[1.25rem]">
                  <dt>Total</dt>
                  <dd className="tnum">{formatINR(t.total)}</dd>
                </div>
              </dl>
              <Link href="/checkout" onClick={() => setOpen(false)} className="btn w-full">
                Proceed to checkout
              </Link>
              <Link href="/cart" onClick={() => setOpen(false)} className="block text-center text-[0.875rem] underline underline-offset-4">
                View cart
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
