import type { Metadata } from "next";
import { privateMeta } from "@/lib/site";
import { Suspense } from "react";
import { SearchView } from "@/features/search/SearchView";

export const metadata: Metadata = privateMeta("Search", "/search");

export default function SearchPage() {
  return (
    <>
      {/* Results depend on ?q= and render in the browser, so the h1 lives here to be in the server HTML. */}
      <h1 className="sr-only">Search</h1>
      <Suspense fallback={<div className="min-h-[70svh] bg-surface" aria-busy="true" />}>
        <SearchView />
      </Suspense>
    </>
  );
}
