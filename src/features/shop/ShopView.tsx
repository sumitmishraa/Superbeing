"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { NEED_BY_ID, type NeedId } from "@/data/products";
import { SCENES } from "@/lib/media";
import { Flip, gsap, reduceMotion } from "@/lib/gsap";
import { Icon, ProductCard } from "@/components/ui";
import { FILTER_KEYS, PER_PAGE, SORTS, filterProducts, type FilterDraft } from "./filters";
import { FilterDrawer } from "./FilterDrawer";
import { NeedNav } from "./NeedNav";
import { Pagination } from "./Pagination";

/**
 * /shop: hero, need chips, toolbar (filters, count, sort), the product grid and pagination.
 * Every change rewrites the URL query; the grid re-sorts with a GSAP Flip animation.
 */
export function ShopView() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const grid = useRef<HTMLUListElement>(null);
  const flip = useRef<Flip.FlipState | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState<FilterDraft>({});

  const get = (k: string) => sp.get(k) ?? "";
  const need = get("need") as NeedId | "";
  const sort = get("sort") || "need";
  const list = useMemo(() => filterProducts((k) => sp.get(k) ?? ""), [sp]);
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const page = Math.min(pages, Math.max(1, Number(sp.get("page")) || 1));
  const pageList = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const activeFilters = FILTER_KEYS.filter((k) => get(k)).length;
  const needInfo = need ? NEED_BY_ID[need] : null;
  const title = needInfo ? needInfo.name : get("status") === "coming-soon" ? "Coming soon" : get("line") === "women" ? "For her" : get("line") === "men" ? "For him" : "All products";

  /** Writes a new query, first recording the grid's layout so the change can animate. */
  const replaceQuery = (next: URLSearchParams) => {
    if (grid.current && !reduceMotion()) flip.current = Flip.getState(grid.current.children);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  /** Sets or clears one query value; any change other than the page goes back to page 1. */
  const setParam = (k: string, v: string | null) => {
    const next = new URLSearchParams(sp.toString());
    if (!v) next.delete(k);
    else next.set(k, v);
    if (k !== "page") next.delete("page");
    replaceQuery(next);
  };
  const setSort = (value: string) => setParam("sort", value === "need" ? null : value);

  useLayoutEffect(() => {
    if (!flip.current || !grid.current) return;
    Flip.from(flip.current, {
      duration: 0.7,
      ease: "expo.inOut",
      absolute: true,
      stagger: 0.02,
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.04, ease: "expo.out", delay: 0.2 }),
    });
    flip.current = null;
  }, [list]);

  const openFilters = () => {
    setDraft(Object.fromEntries(FILTER_KEYS.map((k) => [k, sp.get(k) ?? ""])) as FilterDraft);
    setDrawerOpen(true);
  };
  const draftResults = filterProducts((k) => ((FILTER_KEYS as readonly string[]).includes(k) ? draft[k as keyof FilterDraft] || "" : sp.get(k) || "")).length;
  const applyDraft = () => {
    const next = new URLSearchParams(sp.toString());
    for (const k of FILTER_KEYS) {
      if (draft[k]) next.set(k, draft[k]!);
      else next.delete(k);
    }
    replaceQuery(next);
    setDrawerOpen(false);
  };

  return (
    <div className="pb-24">
      <section className="relative overflow-hidden bg-[#f3e6eb]" aria-labelledby="shop-title">
        <div className="relative aspect-[16/9] md:aspect-[24/7]">
          <Image src={SCENES.collection.src} alt={SCENES.collection.alt} fill priority sizes="100vw" className="object-cover object-right" />
        </div>
        <div className="wrap-wide absolute inset-0 flex items-center">
          <div className="max-w-[460px]">
            <h1 id="shop-title" className="font-display text-[clamp(2rem,1.2rem+3vw,3.75rem)] leading-none font-bold uppercase">
              {title}
            </h1>
            <p className="mt-3 text-[1rem] text-charcoal">{needInfo ? needInfo.question : "Every formula is built for one specific need, with every dose printed on the pack."}</p>
          </div>
        </div>
      </section>

      <div className="wrap">
        <NeedNav need={need} onChange={(n) => setParam("need", n)} />

        <h2 className="sec-title">Explore our full range</h2>

        <div className="mt-8 flex items-center justify-between gap-6">
          <button type="button" onClick={openFilters} className="flex min-h-11 items-center gap-2 text-[0.9375rem] text-charcoal" aria-haspopup="dialog">
            <Icon.Filters className="size-5" />
            Filter{activeFilters ? ` (${activeFilters})` : ""}
          </button>
          <p className="tnum hidden text-[0.875rem] sm:block" aria-live="polite">
            {list.length} {list.length === 1 ? "product" : "products"}
          </p>
          <label className="relative flex items-center rounded-full border border-line px-4 py-2 text-[0.875rem] text-charcoal has-[select:focus-visible]:outline-2 has-[select:focus-visible]:outline-offset-3 has-[select:focus-visible]:outline-accent">
            <span className="sr-only">Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="appearance-none bg-transparent pr-6 outline-none">
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <Icon.Chevron className="pointer-events-none absolute right-3 size-3.5" />
          </label>
        </div>

        {list.length === 0 ? (
          <div className="mt-10 rounded-xl bg-off p-8 text-center">
            <p className="text-[1.25rem] text-charcoal">Nothing matches all of those filters.</p>
            <button type="button" onClick={() => replaceQuery(new URLSearchParams(need ? { need } : {}))} className="btn mt-6">
              Clear filters
            </button>
          </div>
        ) : (
          <ul ref={grid} className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4" data-stagger>
            {pageList.map((p, i) => (
              <li key={p.slug} data-flip-id={p.slug}>
                <ProductCard product={p} priority={i < 4} />
              </li>
            ))}
          </ul>
        )}

        <Pagination page={page} pages={pages} onPage={(n) => setParam("page", n === 1 ? null : String(n))} />
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        draft={draft}
        setDraft={setDraft}
        draftResults={draftResults}
        onApply={applyDraft}
        sort={sort}
        onSort={setSort}
      />
    </div>
  );
}
