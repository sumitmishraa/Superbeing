import type { Metadata } from "next";
import { Suspense } from "react";
import { SuccessView } from "@/components/commerce/Views";

export const metadata: Metadata = { title: "Order placed" };

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[80svh] bg-accent" aria-busy="true" />}>
      <SuccessView />
    </Suspense>
  );
}
