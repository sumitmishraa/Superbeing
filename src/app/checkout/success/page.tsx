import type { Metadata } from "next";
import { privateMeta } from "@/lib/site";
import { Suspense } from "react";
import { SuccessView } from "@/features/checkout/SuccessView";

export const metadata: Metadata = privateMeta("Order placed", "/checkout/success");

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[80svh] bg-accent" aria-busy="true" />}>
      <SuccessView />
    </Suspense>
  );
}
