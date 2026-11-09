"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { PRODUCT_BY_SLUG, formatINR } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { CartLineRow, ShippingMeter, UndoBar } from "@/components/shell/CartDrawer";
import { PackMarquee } from "@/components/shell/MenuOverlay";
import { Icon } from "@/components/ui";
import { POPULAR_SEARCHES, searchProducts } from "@/lib/search";
import { packAlt, packSrc } from "@/lib/media";
import { cartTotals, useHydrated, useStore } from "@/lib/store";

/* ───────── shared bits ───────── */
export function PageTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="wrap flex flex-wrap items-end justify-between gap-4 pt-10 md:pt-16">
      <h1 className="h-display" data-split>
        {title}
      </h1>
      {children}
    </div>
  );
}

/** Filled field with the label inside, as in the reference's checkout. */
export function Field({
  id,
  label,
  error,
  className = "",
  children,
  chevron,
}: {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
  chevron?: boolean;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field" data-error={!!error}>
        <span>{label}</span>
        {children}
        {chevron && <Icon.Chevron className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />}
      </label>
      {error && (
        <p id={`${id}-err`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function CouponRow() {
  const coupon = useStore((s) => s.coupon);
  const apply = useStore((s) => s.applyCoupon);
  const remove = useStore((s) => s.removeCoupon);
  const hydrated = useHydrated();
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  return (
    <div>
      {hydrated && coupon ? (
        <div className="flex min-h-14 items-center gap-3 bg-off px-3">
          <Icon.Percent className="size-5" />
          <span className="flex-1 text-[1rem]">{coupon}</span>
          <button type="button" onClick={remove} className="text-[0.8125rem] underline underline-offset-4">
            Remove
          </button>
          <Icon.Check className="size-5" />
        </div>
      ) : (
        <form
          className="flex min-h-14 items-center gap-3 bg-off px-3"
          onSubmit={(e) => {
            e.preventDefault();
            setMsg(apply(code) ? "" : "That code is not valid. Try FIRSTLABEL.");
          }}
        >
          <Icon.Percent className="size-5 shrink-0" />
          <label htmlFor="coupon" className="sr-only">
            Discount code
          </label>
          <input
            id="coupon"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="DISCOUNT CODE"
            className="min-w-0 flex-1 bg-transparent text-[1rem] uppercase outline-none placeholder:text-graphite"
            aria-invalid={!!msg}
            aria-describedby={msg ? "coupon-msg" : undefined}
          />
          <button type="submit" className="grid size-10 place-items-center" aria-label="Apply code">
            <Icon.Check className="size-5" />
          </button>
        </form>
      )}
      {msg && (
        <p id="coupon-msg" className="field-error">
          {msg}
        </p>
      )}
    </div>
  );
}

export function Totals({ extraDelivery = 0 }: { extraDelivery?: number }) {
  const cart = useStore((s) => s.cart);
  const coupon = useStore((s) => s.coupon);
  const hydrated = useHydrated();
  const t = cartTotals(hydrated ? cart : [], hydrated ? coupon : null);
  const delivery = t.shipping + extraDelivery;
  return (
    <dl className="space-y-2.5 text-[1rem]">
      <div className="flex justify-between">
        <dt>Subtotal</dt>
        <dd className="tnum">{formatINR(t.subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt>GST</dt>
        <dd>Included</dd>
      </div>
      <div className="flex justify-between">
        <dt>Delivery</dt>
        <dd className="tnum">{delivery ? formatINR(delivery) : "Free"}</dd>
      </div>
      {t.discount > 0 && (
        <div className="flex justify-between">
          <dt>Discount</dt>
          <dd className="tnum">−{formatINR(t.discount)}</dd>
        </div>
      )}
      <div className="flex justify-between border-t border-line pt-4 text-[1.375rem]">
        <dt>Total</dt>
        <dd className="tnum">{formatINR(t.total + extraDelivery)}</dd>
      </div>
    </dl>
  );
}

/* ───────── cart ───────── */
export function CartView() {
  const cart = useStore((s) => s.cart);
  const coupon = useStore((s) => s.coupon);
  const hydrated = useHydrated();
  const lines = hydrated ? cart : [];
  const t = cartTotals(lines, coupon);

  return (
    <div className="pb-24">
      <PageTitle title="Cart">
        <p className="tnum pb-1 text-[0.875rem]">
          {t.count} {t.count === 1 ? "item" : "items"}
        </p>
      </PageTitle>
      <div className="wrap mt-8 grid gap-10 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-6">
          {lines.length === 0 ? (
            <div>
              <p className="text-[1.25rem]">{hydrated ? "Your cart is empty." : "Loading your cart…"}</p>
              <UndoBar />
              <Link href="/shop" className="btn mt-6">
                Shop all products
              </Link>
            </div>
          ) : (
            <>
              <UndoBar />
              <ul>
                {lines.map((l) => (
                  <CartLineRow key={l.slug + l.option} line={l} />
                ))}
              </ul>
            </>
          )}
        </div>
        {lines.length > 0 && (
          <div className="lg:col-span-5 lg:col-start-8">
            <div className="space-y-6 lg:sticky lg:top-24">
              <ShippingMeter subtotal={t.subtotal - t.discount} />
              <CouponRow />
              <Totals />
              <Link href="/checkout" className="btn w-full">
                Proceed to checkout
              </Link>
            </div>
          </div>
        )}
      </div>
      {lines.length === 0 && hydrated && (
        <div className="mt-20">
          <p className="wrap label mb-3 text-graphite">New in</p>
          <PackMarquee height={140} />
        </div>
      )}
    </div>
  );
}

/* ───────── wishlist ───────── */
export function WishlistView() {
  const wishlist = useStore((s) => s.wishlist);
  const moveToCart = useStore((s) => s.moveToCart);
  const hydrated = useHydrated();
  const items = (hydrated ? wishlist : []).map((s) => PRODUCT_BY_SLUG[s]).filter(Boolean);
  const live = items.filter((p) => p.status === "live");

  return (
    <div className="pb-24">
      <PageTitle title="Wishlist">
        <p className="tnum pb-1 text-[0.875rem]">{items.length} saved</p>
      </PageTitle>
      <div className="wrap mt-8">
        {items.length === 0 ? (
          <div className="max-w-[48ch]">
            <p className="text-[1.25rem]">{hydrated ? "Nothing saved yet." : "Loading…"}</p>
            <p className="mt-2 text-[1rem] text-graphite">Tap the heart on any product to keep it here while you compare labels.</p>
            <Link href="/shop" className="btn mt-6">
              Shop all products
            </Link>
          </div>
        ) : (
          <>
            {live.length > 0 && (
              <button type="button" onClick={() => live.forEach((p) => moveToCart(p.slug))} className="btn mb-8">
                Move {live.length === 1 ? "it" : `all ${live.length}`} to cart
              </button>
            )}
            <ul className="grid grid-cols-2 gap-x-1.5 gap-y-8 lg:grid-cols-4">
              {items.map((p) => (
                <li key={p.slug}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

/* ───────── search results page ───────── */
export function SearchView() {
  const sp = useSearchParams();
  const router = useRouter();
  const q = sp.get("q") ?? "";
  const [value, setValue] = useState(q);
  const results = useMemo(() => searchProducts(q), [q]);

  return (
    <div className="wrap pt-10 pb-24 md:pt-16">
      <form
        role="search"
        className="border-b border-charcoal"
        onSubmit={(e) => {
          e.preventDefault();
          router.replace(value.trim() ? `/search?q=${encodeURIComponent(value.trim())}` : "/search");
        }}
      >
        <label htmlFor="q" className="sr-only">
          Search products, needs or ingredients
        </label>
        <div className="flex items-end gap-3">
          <input
            id="q"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="SEARCH"
            className="w-full bg-transparent pb-3 text-[clamp(2rem,1rem+4vw,4.5rem)] leading-none uppercase outline-none placeholder:text-[#c4c4c4]"
          />
          <button type="submit" className="grid size-12 shrink-0 place-items-center" aria-label="Search">
            <Icon.Search className="size-7" />
          </button>
        </div>
      </form>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        {POPULAR_SEARCHES.map((s) => (
          <Link key={s} href={`/search?q=${encodeURIComponent(s)}`} onClick={() => setValue(s)} className="nav-link text-[1rem]">
            {s}
          </Link>
        ))}
      </div>
      <p className="mt-10 text-[0.875rem]" aria-live="polite">
        {q ? `${results.length} ${results.length === 1 ? "result" : "results"} for “${q}”` : "Search names, needs and every ingredient on every label."}
      </p>
      {q && results.length === 0 ? (
        <p className="mt-6 max-w-[52ch] text-[1.0625rem]">Nothing matches that yet. Try a need such as sleep, or an ingredient such as ashwagandha.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-x-1.5 gap-y-8 lg:grid-cols-4">
          {results.map((p) => (
            <li key={p.slug}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ───────── order placed ───────── */
export function SuccessView() {
  const sp = useSearchParams();
  const orders = useStore((s) => s.orders);
  const hydrated = useHydrated();
  const order = hydrated ? (orders.find((o) => o.id === sp.get("order")) ?? orders[0]) : undefined;

  return (
    <div className="wrap grid gap-10 pt-10 pb-24 md:grid-cols-12 md:gap-6 md:pt-16">
      <div className="md:col-span-6">
        <h1 className="h-display" data-split>
          Order placed
        </h1>
        <p className="mt-6 max-w-[44ch] text-[1.0625rem] leading-snug">
          {order ? (
            <>
              Thank you, {order.address.name.split(" ")[0]}. Order <span className="tnum">{order.id}</span> for <span className="tnum">{formatINR(order.total)}</span> is
              confirmed. You pay when it arrives. We will send delivery updates to {order.address.phone}.
            </>
          ) : (
            "Thank you. Your order is confirmed."
          )}
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          <Link href="/account" className="btn">
            View your orders
          </Link>
          <Link href="/shop" className="btn btn-off">
            Keep shopping
          </Link>
        </div>
      </div>
      {order && (
        <ul className="md:col-span-5 md:col-start-8">
          {order.lines.map((l) => {
            const p = PRODUCT_BY_SLUG[l.slug];
            if (!p) return null;
            return (
              <li key={l.slug + l.option} className="flex items-center gap-4 py-2">
                <span className="relative block h-[96px] w-[78px] shrink-0 bg-off">
                  <Image src={packSrc(p)} alt={packAlt(p)} fill sizes="78px" className="object-contain p-2" />
                </span>
                <span className="flex-1 text-[1rem]">
                  {p.name}
                  <span className="block text-[0.8125rem] text-graphite">
                    Code {p.code} · Quantity {l.qty}
                    {l.subscribe ? " · Monthly" : ""}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ───────── contact form ───────── */
const TOPICS = ["A question about a label", "An order or delivery", "Monthly deliveries", "Partnerships and clinics", "Something else"];

export function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", topic: TOPICS[0], order: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  if (sent)
    return (
      <div className="bg-off p-6 sm:p-8" role="status">
        <p className="h-section">Thank you, {f.name.split(" ")[0]}.</p>
        <p className="mt-3 max-w-[44ch] text-[1rem] leading-snug">Your note is in. We will reply to {f.email}.</p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setF({ ...f, message: "", order: "" });
          }}
          className="btn mt-6"
        >
          Send another
        </button>
      </div>
    );

  const bind = (k: keyof typeof f) => ({
    id: `c-${k}`,
    value: f[k],
    "aria-invalid": !!errors[k],
    "aria-describedby": errors[k] ? `c-${k}-err` : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setF({ ...f, [k]: e.target.value });
      if (errors[k]) setErrors({ ...errors, [k]: "" });
    },
  });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const errs: Record<string, string> = {};
        if (f.name.trim().length < 2) errs.name = "Enter your name.";
        if (!/^\S+@\S+\.\S+$/.test(f.email)) errs.email = "Enter an email like name@example.com.";
        if (f.message.trim().length < 10) errs.message = "Tell us a little more, at least a sentence.";
        setErrors(errs);
        const first = Object.keys(errs)[0];
        if (first) return document.getElementById(`c-${first}`)?.focus();
        setSent(true);
      }}
    >
      <div className="grid gap-1.5 sm:grid-cols-2">
        <Field id="c-name" label="Name" error={errors.name}>
          <input {...bind("name")} autoComplete="name" />
        </Field>
        <Field id="c-email" label="E-mail" error={errors.email}>
          <input {...bind("email")} type="email" autoComplete="email" />
        </Field>
        <Field id="c-topic" label="Topic" chevron>
          <select {...bind("topic")}>
            {TOPICS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field id="c-order" label="Order number (optional)">
          <input {...bind("order")} className="tnum uppercase" />
        </Field>
        <Field id="c-message" label="Message" error={errors.message} className="sm:col-span-2">
          <textarea {...bind("message")} rows={5} className="resize-y" />
        </Field>
      </div>
      <button type="submit" className="btn mt-6 w-full">
        Send
      </button>
    </form>
  );
}
