import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopView } from "@/components/shop/ShopView";

export const metadata: Metadata = {
  title: "Shop all formulas",
  description: "Every Superbeing formula, by need. Filter by need, line, format and diet.",
};

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="wrap min-h-[80svh] py-16" aria-busy="true" />}>
      <ShopView />
    </Suspense>
  );
}
