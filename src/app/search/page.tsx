import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchView } from "@/components/commerce/Views";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-[70svh] bg-surface" aria-busy="true" />}>
      <SearchView />
    </Suspense>
  );
}
