import type { Metadata } from "next";
import { privateMeta } from "@/lib/site";
import { CheckoutView } from "@/features/checkout/CheckoutView";

export const metadata: Metadata = privateMeta("Checkout", "/checkout");

export default function CheckoutPage() {
  return (
    <>
      {/* The form renders only in the browser (it reads the saved cart), so the h1 lives here to be in the server HTML. */}
      <h1 className="sr-only">Checkout</h1>
      <CheckoutView />
    </>
  );
}
