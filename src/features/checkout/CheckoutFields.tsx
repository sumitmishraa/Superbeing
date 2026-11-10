"use client";

import { formatINR } from "@/data/products";
import { EXPRESS_FEE, type Delivery, type Quote } from "@/lib/pricing";
import { MAX } from "@/lib/validate";
import { Field } from "@/components/ui";
import { STATES, type CheckoutErrors, type CheckoutForm } from "./address";

/** The checkout form's fieldsets: contact, address, delivery speed, payment and gift note. */

/** Props that wire one input to the checkout form state (see `bind` in CheckoutView). */
type BoundField = {
  id: string;
  value: string;
  "aria-invalid": boolean;
  "aria-describedby": string | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
};
export type Bind = (k: keyof CheckoutForm) => BoundField;

export function ContactFields({ bind, errors }: { bind: Bind; errors: CheckoutErrors }) {
  return (
    <fieldset id="co-contact" className="scroll-mt-28">
      <legend className="h-section mb-4">1 · Contact</legend>
      <div className="grid gap-1.5 sm:grid-cols-2">
        <Field id="co-first" label="First name" error={errors.first}>
          <input {...bind("first")} autoComplete="given-name" maxLength={MAX.name} />
        </Field>
        <Field id="co-last" label="Last name" error={errors.last}>
          <input {...bind("last")} autoComplete="family-name" maxLength={MAX.name} />
        </Field>
        <Field id="co-phone" label="Mobile" error={errors.phone}>
          <input {...bind("phone")} type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="10-digit mobile" maxLength={16} />
        </Field>
        <Field id="co-email" label="E-mail" error={errors.email}>
          <input {...bind("email")} type="email" autoComplete="email" maxLength={MAX.email} />
        </Field>
      </div>
    </fieldset>
  );
}

/** `pinFilled` shows a note that state and city came from the PIN. */
export function AddressFields({ bind, errors, pinFilled, hasCity }: { bind: Bind; errors: CheckoutErrors; pinFilled: boolean; hasCity: boolean }) {
  return (
    <fieldset id="co-address" className="mt-10 scroll-mt-28">
      <legend className="h-section mb-4">2 · Delivery address</legend>
      <div className="grid gap-1.5 sm:grid-cols-2">
        <Field id="co-pin" label="PIN code" error={errors.pin}>
          <input {...bind("pin")} inputMode="numeric" autoComplete="postal-code" className="tnum" />
        </Field>
        <Field id="co-state" label="State" error={errors.state} chevron>
          <select {...bind("state")} autoComplete="address-level1">
            <option value="">Choose</option>
            {STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field id="co-city" label="City" error={errors.city}>
          <input {...bind("city")} autoComplete="address-level2" maxLength={MAX.city} />
        </Field>
        <Field id="co-line1" label="House, street and area" error={errors.line1}>
          <input {...bind("line1")} autoComplete="street-address" maxLength={MAX.line} />
        </Field>
      </div>
      {pinFilled && (
        <p className="mt-2 text-[0.8125rem] text-graphite" role="status">
          We filled in your state{hasCity ? " and city" : ""} from the PIN. Please check them.
        </p>
      )}
    </fieldset>
  );
}

export function DeliverySpeed({ delivery, onChange, bill }: { delivery: Delivery; onChange: (d: Delivery) => void; bill: Quote }) {
  return (
    <fieldset className="mt-10">
      <legend className="h-section mb-2">Delivery speed</legend>
      <label className="radio-row">
        <input type="radio" name="delivery" checked={delivery === "standard"} onChange={() => onChange("standard")} />
        <span>
          <span className="block text-[1rem]">Standard delivery</span>
          <span className="block text-[0.8125rem] text-graphite">3–5 business days. Free from ₹999.</span>
        </span>
        <span className={`tnum text-[1rem] ${bill.deliveryFee === 0 ? "font-semibold text-save" : ""}`}>{bill.deliveryFee ? formatINR(bill.deliveryFee) : "FREE"}</span>
      </label>
      <label className="radio-row">
        <input type="radio" name="delivery" checked={delivery === "express"} onChange={() => onChange("express")} />
        <span>
          <span className="block text-[1rem]">Express delivery</span>
          <span className="block text-[0.8125rem] text-graphite">1–2 business days in metro cities.</span>
        </span>
        <span className="tnum text-[1rem]">+{formatINR(EXPRESS_FEE)}</span>
      </label>
    </fieldset>
  );
}

/** Pay on delivery only; online methods are listed as coming at launch. */
export function PaymentOptions() {
  return (
    <fieldset id="co-payment" className="mt-10 scroll-mt-28">
      <legend className="h-section mb-2">3 · Payment</legend>
      <label className="radio-row">
        <input type="radio" name="pay" defaultChecked />
        <span>
          <span className="block text-[1rem]">Cash or UPI on delivery</span>
          <span className="block text-[0.8125rem] text-graphite">Pay the courier when your order arrives.</span>
        </span>
        <span />
      </label>
      {["UPI now", "Credit or debit card"].map((method) => (
        <div key={method} className="radio-row cursor-default text-graphite" aria-disabled="true">
          <input type="radio" name="pay" disabled aria-label={`${method}, available at launch`} />
          <span className="text-[1rem]">{method}</span>
          <span className="text-[0.8125rem]">At launch</span>
        </div>
      ))}
      <p className="mt-3 text-[0.8125rem] text-graphite">This is a preview store: online payment is not connected yet, and no payment is taken.</p>
    </fieldset>
  );
}

export function GiftNote({ gift, setGift, note, setNote }: { gift: boolean; setGift: (v: boolean) => void; note: string; setNote: (v: string) => void }) {
  return (
    <fieldset className="mt-8">
      <legend className="sr-only">Extras</legend>
      <label className="check min-h-11">
        <input type="checkbox" checked={gift} onChange={(e) => setGift(e.target.checked)} aria-controls="co-gift" />
        This is a gift — add a note
      </label>
      {gift && (
        <Field id="co-gift" label="Gift note (printed on the packing slip)" className="mt-2">
          <textarea id="co-gift" value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={200} className="resize-y" />
        </Field>
      )}
    </fieldset>
  );
}
