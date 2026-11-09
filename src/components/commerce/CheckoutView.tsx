"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatINR } from "@/data/products";
import { CartLineRow } from "@/components/shell/CartDrawer";
import { CouponRow, Field, Totals } from "@/components/commerce/Views";
import { cartTotals, useHydrated, useStore } from "@/lib/store";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];
const EXPRESS = 149; // sample fee

type Form = { first: string; last: string; email: string; phone: string; state: string; city: string; line1: string; pin: string };
type Errors = Partial<Record<keyof Form, string>>;

function validate(f: Form): Errors {
  const e: Errors = {};
  if (f.first.trim().length < 1) e.first = "Enter your first name.";
  if (f.last.trim().length < 1) e.last = "Enter your last name.";
  if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter an email like name@example.com.";
  if (!/^[6-9]\d{9}$/.test(f.phone.replace(/\D/g, "").slice(-10))) e.phone = "Enter a 10-digit Indian mobile number.";
  if (!f.state) e.state = "Choose your state.";
  if (f.city.trim().length < 2) e.city = "Enter your city.";
  if (f.line1.trim().length < 6) e.line1 = "Enter your house, street and area.";
  if (!/^[1-9]\d{5}$/.test(f.pin)) e.pin = "Enter a 6-digit PIN code.";
  return e;
}

export function CheckoutView() {
  const hydrated = useHydrated();
  if (!hydrated) return <div className="wrap min-h-[70svh] py-16" aria-busy="true" />;
  return <CheckoutInner />;
}

/** Mounted after saved state has loaded, so the form can start prefilled. */
function CheckoutInner() {
  const router = useRouter();
  const cart = useStore((s) => s.cart);
  const coupon = useStore((s) => s.coupon);
  const placeOrder = useStore((s) => s.placeOrder);
  const [f, setF] = useState<Form>(() => {
    const { profile, addresses } = useStore.getState();
    const saved = addresses[0];
    const [first = "", ...rest] = (saved?.name || profile?.name || "").split(" ");
    return {
      first,
      last: rest.join(" "),
      email: profile?.email || "",
      phone: saved?.phone || profile?.phone || "",
      state: saved?.state || "",
      city: saved?.city || "",
      line1: saved?.line1 || "",
      pin: saved?.pin || "",
    };
  });
  const [delivery, setDelivery] = useState<"standard" | "express">("standard");
  const [errors, setErrors] = useState<Errors>({});
  const [placing, setPlacing] = useState(false);
  const t = cartTotals(cart, coupon);
  const extra = delivery === "express" ? EXPRESS : 0;

  const bind = (k: keyof Form) => ({
    id: `co-${k}`,
    value: f[k],
    "aria-invalid": !!errors[k],
    "aria-describedby": errors[k] ? `co-${k}-err` : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const v = k === "pin" ? e.target.value.replace(/\D/g, "").slice(0, 6) : e.target.value;
      setF({ ...f, [k]: v });
      if (errors[k]) setErrors({ ...errors, [k]: undefined });
    },
  });

  if (cart.length === 0 && !placing) {
    return (
      <div className="wrap min-h-[60svh] pt-16 pb-24">
        <h1 className="h-display">Checkout</h1>
        <p className="mt-6 text-[1.0625rem]">Your cart is empty, so there is nothing to check out yet.</p>
        <Link href="/shop" className="btn mt-8">
          Shop all products
        </Link>
      </div>
    );
  }

  return (
    <div className="wrap grid gap-14 pt-10 pb-24 lg:grid-cols-12 lg:gap-6 lg:pt-16">
      <aside className="order-2 lg:order-1 lg:col-span-5" aria-labelledby="order-h">
        <h2 id="order-h" className="h-display">
          Your order
        </h2>
        <ul className="mt-6">
          {cart.map((l) => (
            <CartLineRow key={l.slug + l.option} line={l} />
          ))}
        </ul>
        <div className="mt-4 space-y-6">
          <CouponRow />
          <Totals extraDelivery={extra} />
        </div>
      </aside>

      <form
        className="order-1 lg:order-2 lg:col-span-6 lg:col-start-7"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const errs = validate(f);
          setErrors(errs);
          const first = Object.keys(errs)[0];
          if (first) return document.getElementById(`co-${first}`)?.focus();
          setPlacing(true);
          const order = placeOrder(
            { name: `${f.first.trim()} ${f.last.trim()}`, phone: f.phone, line1: f.line1.trim(), city: f.city.trim(), state: f.state, pin: f.pin },
            extra,
          );
          router.push(`/checkout/success?order=${order.id}`);
        }}
      >
        <h1 className="h-display" data-split>
          Checkout
        </h1>

        <fieldset className="mt-8">
          <legend className="h-section mb-4">Personal information</legend>
          <div className="grid gap-1.5 sm:grid-cols-2">
            <Field id="co-first" label="First name" error={errors.first}>
              <input {...bind("first")} autoComplete="given-name" />
            </Field>
            <Field id="co-last" label="Last name" error={errors.last}>
              <input {...bind("last")} autoComplete="family-name" />
            </Field>
            <Field id="co-email" label="E-mail" error={errors.email}>
              <input {...bind("email")} type="email" autoComplete="email" />
            </Field>
            <Field id="co-phone" label="Phone" error={errors.phone}>
              <input {...bind("phone")} type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="10-digit mobile" />
            </Field>
          </div>
        </fieldset>

        <fieldset className="mt-10">
          <legend className="h-section mb-4">Delivery address</legend>
          <div className="grid gap-1.5 sm:grid-cols-2">
            <Field id="co-state" label="State" error={errors.state} chevron>
              <select {...bind("state")} autoComplete="address-level1">
                <option value="">Choose</option>
                {STATES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field id="co-city" label="City" error={errors.city}>
              <input {...bind("city")} autoComplete="address-level2" />
            </Field>
            <Field id="co-line1" label="House, street and area" error={errors.line1}>
              <input {...bind("line1")} autoComplete="street-address" />
            </Field>
            <Field id="co-pin" label="PIN code" error={errors.pin}>
              <input {...bind("pin")} inputMode="numeric" autoComplete="postal-code" className="tnum" />
            </Field>
          </div>
        </fieldset>

        <fieldset className="mt-10">
          <legend className="h-section mb-2">Delivery options</legend>
          <label className="radio-row">
            <input type="radio" name="delivery" checked={delivery === "standard"} onChange={() => setDelivery("standard")} />
            <span>
              <span className="block text-[1rem]">Standard delivery</span>
              <span className="block text-[0.8125rem] text-graphite">3–5 business days. Free over ₹999.</span>
            </span>
            <span className="tnum text-[1rem]">{t.shipping ? formatINR(t.shipping) : "Free"}</span>
          </label>
          <label className="radio-row">
            <input type="radio" name="delivery" checked={delivery === "express"} onChange={() => setDelivery("express")} />
            <span>
              <span className="block text-[1rem]">Express delivery</span>
              <span className="block text-[0.8125rem] text-graphite">1–2 business days in metro cities.</span>
            </span>
            <span className="tnum text-[1rem]">+{formatINR(EXPRESS)}</span>
          </label>
        </fieldset>

        <fieldset className="mt-10">
          <legend className="h-section mb-2">Payment</legend>
          <label className="radio-row">
            <input type="radio" name="pay" defaultChecked />
            <span>
              <span className="block text-[1rem]">Cash or UPI on delivery</span>
              <span className="block text-[0.8125rem] text-graphite">Pay the courier when your order arrives.</span>
            </span>
            <span />
          </label>
          {["UPI", "Credit or debit card"].map((m) => (
            <div key={m} className="radio-row cursor-default text-graphite" aria-disabled="true">
              <input type="radio" name="pay" disabled aria-label={`${m}, available at launch`} />
              <span className="text-[1rem]">{m}</span>
              <span className="text-[0.8125rem]">At launch</span>
            </div>
          ))}
          <p className="mt-3 text-[0.8125rem] text-graphite">This is a preview store: online payment is not connected yet, and no payment is taken.</p>
        </fieldset>

        <button type="submit" className="btn mt-10 w-full" disabled={placing}>
          {placing ? "Placing your order…" : `Continue · ${formatINR(t.total + extra)}`}
        </button>
        <p className="mt-3 text-[0.8125rem] text-graphite">Food supplements are not for medicinal use.</p>
      </form>
    </div>
  );
}
