"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { POPULAR_SEARCHES, searchProducts } from "@/lib/search";
import { Icon, ProductCard } from "@/components/ui";

/** /search?q=: a large search box, popular searches and the matching products. The page's h1 is in the route. */
export function SearchView() {
  const sp = useSearchParams();
  const router = useRouter();
  const q = sp.get("q") ?? "";
  const [value, setValue] = useState(q);
  const results = useMemo(() => searchProducts(q), [q]);

  return (
    <div className="wrap pt-10 pb-24 md:pt-16">
      <form
        role="search"
        className="border-b border-charcoal"
        onSubmit={(e) => {
          e.preventDefault();
          router.replace(value.trim() ? `/search?q=${encodeURIComponent(value.trim())}` : "/search");
        }}
      >
        <label htmlFor="q" className="sr-only">
          Search products, needs or ingredients
        </label>
        <div className="flex items-end gap-3">
          <input
            id="q"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="SEARCH"
            className="w-full bg-transparent pb-3 text-[clamp(2rem,1rem+4vw,4.5rem)] leading-none uppercase outline-none placeholder:text-[#c4c4c4]"
          />
          <button type="submit" className="grid size-12 shrink-0 place-items-center" aria-label="Search">
            <Icon.Search className="size-7" />
          </button>
        </div>
      </form>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        {POPULAR_SEARCHES.map((s) => (
          <Link key={s} href={`/search?q=${encodeURIComponent(s)}`} onClick={() => setValue(s)} className="nav-link text-[1rem]">
            {s}
          </Link>
        ))}
      </div>
      <p className="mt-10 text-[0.875rem]" aria-live="polite">
        {q ? `${results.length} ${results.length === 1 ? "result" : "results"} for “${q}”` : "Search names, needs and every ingredient on every label."}
      </p>
      {q && results.length === 0 ? (
        <p className="mt-6 max-w-[52ch] text-[1.0625rem]">Nothing matches that yet. Try a need such as sleep, or an ingredient such as ashwagandha.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-x-1.5 gap-y-8 lg:grid-cols-4">
          {results.map((p) => (
            <li key={p.slug}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
