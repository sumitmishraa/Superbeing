import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { Suspense } from "react";
import { ShopView } from "@/features/shop/ShopView";

export const metadata: Metadata = pageMeta({
  title: "Shop all formulas",
  description: "Every Superbeing formula, by need. Filter by need, line, format and diet.",
  path: "/shop",
});

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="wrap min-h-[80svh] py-16" aria-busy="true" />}>
      <ShopView />
    </Suspense>
  );
}
