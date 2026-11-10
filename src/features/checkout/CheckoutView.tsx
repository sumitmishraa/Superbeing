"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Delivery } from "@/lib/pricing";
import { useHydrated, useStore } from "@/lib/store";
import { MAX, cleanIndianMobile, cleanName, cleanPin, cleanText } from "@/lib/validate";
import { BillDetails } from "@/features/cart/BillDetails";
import { StickyPayBar } from "@/features/cart/StickyPayBar";
import { TrustRow } from "@/features/cart/TrustRow";
import { useBill } from "@/features/cart/useBill";
import { ADDRESS_FIELDS, CONTACT_FIELDS, placeForPin, validateCheckout, type CheckoutErrors, type CheckoutForm } from "./address";
import { AddressFields, ContactFields, DeliverySpeed, GiftNote, PaymentOptions, type Bind } from "./CheckoutFields";
import { OrderSummary } from "./OrderSummary";
import { StepChips, type Step } from "./StepChips";

/**
 * /checkout: contact, address, delivery speed and payment on the left; the order and bill on the
 * right; a pinned pay bar. The page's h1 is rendered by the route, so the big "Checkout" here is presentational.
 */
export function CheckoutView() {
  const hydrated = useHydrated();
  if (!hydrated) return <div className="wrap min-h-[70svh] py-16" aria-busy="true" />;
  return <Checkout />;
}

/** Starts the form from the saved address and profile, so returning shoppers see it filled in. */
function initialForm(): CheckoutForm {
  const { profile, addresses } = useStore.getState();
  const saved = addresses[0];
  const [first = "", ...rest] = (saved?.name || profile?.name || "").split(" ");
  return {
    first,
    last: rest.join(" "),
    email: profile?.email || "",
    phone: saved?.phone || profile?.phone || "",
    pin: saved?.pin || "",
    state: saved?.state || "",
    city: saved?.city || "",
    line1: saved?.line1 || "",
  };
}

/** Mounted only after saved state has loaded, so the form can start prefilled. */
function Checkout() {
  const router = useRouter();
  const placeOrder = useStore((s) => s.placeOrder);
  const [delivery, setDelivery] = useState<Delivery>("standard");
  const { lines, bill } = useBill(delivery);
  const [f, setF] = useState<CheckoutForm>(initialForm);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [pinFilled, setPinFilled] = useState(false);
  const [gift, setGift] = useState(false);
  const [giftNote, setGiftNote] = useState("");
  const [placing, setPlacing] = useState(false);

  // Validated on every render to tick the step chips; errors only show after a submit.
  const problems = validateCheckout(f);
  const contactDone = CONTACT_FIELDS.every((k) => !problems[k]);
  const addressDone = ADDRESS_FIELDS.every((k) => !problems[k]);
  const steps: Step[] = [
    { id: "co-contact", label: "Contact", done: contactDone },
    { id: "co-address", label: "Address", done: addressDone },
    { id: "co-payment", label: "Payment", done: contactDone && addressDone },
  ];

  /** Updates one field; a PIN also fills state and city, but only where they are still empty. */
  const update = (k: keyof CheckoutForm, value: string) => {
    const next = { ...f, [k]: value };
    if (k === "pin") {
      const place = placeForPin(value);
      const fillState = !f.state && place.state;
      const fillCity = !f.city && place.city;
      if (fillState) next.state = place.state!;
      if (fillCity) next.city = place.city!;
      if (fillState || fillCity) setPinFilled(true);
    }
    setF(next);
    if (errors[k]) setErrors({ ...errors, [k]: undefined });
  };

  const bind: Bind = (k) => ({
    id: `co-${k}`,
    value: f[k],
    "aria-invalid": !!errors[k],
    "aria-describedby": errors[k] ? `co-${k}-err` : undefined,
    // PIN keeps digits only, at most six.
    onChange: (e) => update(k, k === "pin" ? e.target.value.replace(/\D/g, "").slice(0, 6) : e.target.value),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(problems);
    const first = Object.keys(problems)[0];
    if (first) return document.getElementById(`co-${first}`)?.focus();
    setPlacing(true);
    const order = placeOrder(
      {
        name: `${cleanName(f.first)} ${cleanName(f.last)}`,
        phone: cleanIndianMobile(f.phone)!,
        line1: cleanText(f.line1, MAX.line),
        city: cleanText(f.city, MAX.city),
        state: f.state,
        pin: cleanPin(f.pin)!,
      },
      delivery,
      gift ? giftNote : undefined,
    );
    router.push(`/checkout/success?order=${order.id}`);
  };

  if (lines.length === 0 && !placing) {
    return (
      <div className="wrap min-h-[60svh] pt-16 pb-24">
        <p className="h-display" aria-hidden="true">
          Checkout
        </p>
        <p className="mt-6 text-[1.0625rem]">Your cart is empty, so there is nothing to check out yet.</p>
        <Link href="/shop" className="btn mt-8">
          Shop all products
        </Link>
      </div>
    );
  }

  const cta = placing ? "Placing your order…" : !contactDone ? "Add contact details" : !addressDone ? "Add address to proceed" : "Place order";

  return (
    <div className="wrap pt-6 pb-10 lg:pt-12">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <p className="h-display" data-split aria-hidden="true">
          Checkout
        </p>
        <StepChips steps={steps} />
      </div>

      <div className="mt-6 grid gap-8 lg:mt-10 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-6 lg:gap-y-8">
        {/* Order, savings and add-ons: first on phones, right column on desktop. */}
        <OrderSummary lines={lines} bill={bill} />

        <form id="checkout-form" className="min-w-0 lg:col-span-6 lg:col-start-1 lg:row-span-2 lg:row-start-1" noValidate onSubmit={submit}>
          <ContactFields bind={bind} errors={errors} />
          <AddressFields bind={bind} errors={errors} pinFilled={pinFilled} hasCity={!!f.city} />
          <DeliverySpeed delivery={delivery} onChange={setDelivery} bill={bill} />
          <PaymentOptions />
          <GiftNote gift={gift} setGift={setGift} note={giftNote} setNote={setGiftNote} />
          <p className="mt-6 text-[0.8125rem] text-graphite">Food supplements are not for medicinal use.</p>
        </form>

        {/* The bill sits after the form on phones, under the order on desktop. */}
        <div className="min-w-0 space-y-5 self-start lg:col-span-5 lg:col-start-8 lg:row-start-2">
          <BillDetails bill={bill} />
          <TrustRow />
        </div>
      </div>

      <StickyPayBar total={bill.total} saved={bill.savings.total}>
        <button type="submit" form="checkout-form" className="btn shrink-0 !px-5" disabled={placing}>
          {cta}
        </button>
      </StickyPayBar>
    </div>
  );
}
