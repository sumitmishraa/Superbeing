"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { NEEDS, NEED_BY_ID, PRODUCTS, type Line, type NeedId, type PackShape, type Product } from "@/data/products";
import Image from "next/image";
import { ProductCard } from "@/components/ProductCard";
import { SCENES } from "@/lib/media";
import { Icon } from "@/components/ui";
import { useOverlay } from "@/components/shell/useOverlay";
import { Flip, gsap, reduceMotion } from "@/lib/gsap";

const FORMATS: { id: string; label: string; shapes: PackShape[] }[] = [
  { id: "sachet", label: "Powder sachet", shapes: ["carton"] },
  { id: "stick", label: "Stick sachet", shapes: ["stick"] },
  { id: "melt", label: "Mouth melt", shapes: ["melt"] },
  { id: "tablet", label: "Tablet", shapes: ["bottle"] },
  { id: "softgel", label: "Softgel", shapes: ["tub"] },
];
const LINES: { id: Line; label: string }[] = [
  { id: "everyone", label: "For everyone" },
  { id: "women", label: "For her" },
  { id: "men", label: "For him" },
];
const PRICES = [
  { id: "u1000", label: "Under ₹1,000", test: (n: number) => n < 1000 },
  { id: "1000-1500", label: "₹1,000 – ₹1,500", test: (n: number) => n >= 1000 && n <= 1500 },
  { id: "o1500", label: "Over ₹1,500", test: (n: number) => n > 1500 },
];
const SORTS = [
  { id: "need", label: "By need" },
  { id: "price-asc", label: "Price, low to high" },
  { id: "price-desc", label: "Price, high to low" },
  { id: "name", label: "Name, A to Z" },
];
const KEYS = ["line", "format", "diet", "price", "status"] as const;
type Key = (typeof KEYS)[number];
type Draft = Partial<Record<Key, string>>;

function filterList(get: (k: string) => string) {
  const need = get("need");
  let r: Product[] = PRODUCTS.filter((p) => {
    if (need && p.need !== need) return false;
    if (get("line") && p.line !== get("line")) return false;
    if (get("format") && !FORMATS.find((x) => x.id === get("format"))?.shapes.includes(p.shape)) return false;
    if (get("diet") === "veg" && p.diet === "non-veg") return false;
    if (get("price") && !PRICES.find((x) => x.id === get("price"))?.test(p.price)) return false;
    if (get("status") && p.status !== get("status")) return false;
    return true;
  });
  const sort = get("sort") || "need";
  if (sort === "price-asc") r = [...r].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") r = [...r].sort((a, b) => b.price - a.price);
  if (sort === "name") r = [...r].sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "need") {
    const order = NEEDS.map((n) => n.id);
    r = [...r].sort((a, b) => order.indexOf(a.need) - order.indexOf(b.need) || (a.status === b.status ? 0 : a.status === "live" ? -1 : 1));
  }
  return r;
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-line py-3">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between py-1 text-[1rem]">
        {title}
        <Icon.Chevron className={`size-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="pt-1 pb-1">{children}</div>}
    </div>
  );
}

function Check({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="check">
      <input type="checkbox" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

export function ShopView() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const grid = useRef<HTMLUListElement>(null);
  const flip = useRef<Flip.FlipState | null>(null);
  const [panel, setPanel] = useState(false);
  const [draft, setDraft] = useState<Draft>({});
  const get = (k: string) => sp.get(k) ?? "";
  const need = get("need") as NeedId | "";
  const sort = get("sort") || "need";
  const list = useMemo(() => filterList((k) => sp.get(k) ?? ""), [sp]);
  const PER = 12;
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const page = Math.min(pages, Math.max(1, Number(sp.get("page")) || 1));
  const pageList = list.slice((page - 1) * PER, page * PER);
  const active = KEYS.filter((k) => get(k)).length;
  const n = need ? NEED_BY_ID[need] : null;
  const title = n ? n.name : get("status") === "coming-soon" ? "Coming soon" : get("line") === "women" ? "For her" : get("line") === "men" ? "For him" : "All products";

  const replace = (next: URLSearchParams) => {
    if (grid.current && !reduceMotion()) flip.current = Flip.getState(grid.current.children);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const set = (k: string, v: string | null) => {
    const next = new URLSearchParams(sp.toString());
    if (!v) next.delete(k);
    else next.set(k, v);
    if (k !== "page") next.delete("page");
    replace(next);
  };

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

  const { panel: drawer, scrim } = useOverlay<HTMLDivElement>(panel, "side", (el) => el.querySelector<HTMLElement>("[data-close]")?.focus());
  const openFilters = () => {
    setDraft(Object.fromEntries(KEYS.map((k) => [k, sp.get(k) ?? ""])) as Draft);
    setPanel(true);
  };
  const toggle = (k: Key, v: string) => setDraft((d) => ({ ...d, [k]: d[k] === v ? "" : v }));
  const draftCount = KEYS.filter((k) => draft[k]).length;
  const draftResults = filterList((k) => ((KEYS as readonly string[]).includes(k) ? draft[k as Key] || "" : sp.get(k) || "")).length;
  const apply = () => {
    const next = new URLSearchParams(sp.toString());
    for (const k of KEYS) {
      if (draft[k]) next.set(k, draft[k]!);
      else next.delete(k);
    }
    replace(next);
    setPanel(false);
  };
  const box = (k: Key, v: string, label: string) => <Check key={`${k}-${v}`} checked={draft[k] === v} onChange={() => toggle(k, v)} label={label} />;

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
            <p className="mt-3 text-[1rem] text-charcoal">{n ? n.question : "Every formula is built for one specific need, with every dose printed on the pack."}</p>
          </div>
        </div>
      </section>

      <div className="wrap">
        <nav aria-label="Shop by need" className="no-scrollbar -mx-[var(--gutter)] flex gap-6 overflow-x-auto px-[var(--gutter)] py-8 md:justify-center">
          <button type="button" onClick={() => set("need", null)} aria-pressed={!need} className="group flex shrink-0 flex-col items-center gap-2">
            <span className={`grid size-16 place-items-center rounded-full border-2 transition-colors ${!need ? "border-accent text-accent" : "border-line text-charcoal group-hover:border-accent"}`}>
              <Icon.Bag className="size-6" />
            </span>
            <span className="text-[0.875rem] text-charcoal">All</span>
          </button>
          {NEEDS.map((x) => (
            <button key={x.id} type="button" onClick={() => set("need", need === x.id ? null : x.id)} aria-pressed={need === x.id} className="group flex shrink-0 flex-col items-center gap-2">
              <span className={`grid size-16 place-items-center rounded-full border-2 transition-colors ${need === x.id ? "border-accent" : "border-transparent group-hover:border-accent"}`} style={{ background: x.colour }}>
                <span className="size-6 rounded-full bg-snow/70" />
              </span>
              <span className={`text-[0.875rem] whitespace-nowrap ${need === x.id ? "text-accent" : "text-charcoal"}`}>{x.short}</span>
            </button>
          ))}
        </nav>

        <h2 className="sec-title">Explore our full range</h2>

        <div className="mt-8 flex items-center justify-between gap-6">
          <button type="button" onClick={openFilters} className="flex min-h-11 items-center gap-2 text-[0.9375rem] text-charcoal" aria-haspopup="dialog">
            <Icon.Filters className="size-5" />
            Filter{active ? ` (${active})` : ""}
          </button>
          <p className="tnum hidden text-[0.875rem] sm:block" aria-live="polite">
            {list.length} {list.length === 1 ? "product" : "products"}
          </p>
          <label className="relative flex items-center rounded-full border border-line px-4 py-2 text-[0.875rem] text-charcoal">
            <span className="sr-only">Sort</span>
            <select value={sort} onChange={(e) => set("sort", e.target.value === "need" ? null : e.target.value)} className="appearance-none bg-transparent pr-6 outline-none">
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
            <button type="button" onClick={() => replace(new URLSearchParams(need ? { need } : {}))} className="btn mt-6">
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

        {pages > 1 && (
          <nav aria-label="Pages" className="mt-14 flex items-center justify-center gap-2 border-t border-line pt-8">
            {Array.from({ length: pages }, (_, k) => k + 1).map((n2) => (
              <button
                key={n2}
                type="button"
                onClick={() => set("page", n2 === 1 ? null : String(n2))}
                aria-current={n2 === page ? "page" : undefined}
                className={`tnum grid size-10 place-items-center rounded-full text-[0.9375rem] ${n2 === page ? "bg-accent text-snow" : "text-charcoal hover:text-accent"}`}
              >
                {n2}
              </button>
            ))}
            {page < pages && (
              <button type="button" onClick={() => set("page", String(page + 1))} className="ml-2 text-[0.9375rem] text-charcoal hover:text-accent">
                Next
              </button>
            )}
          </nav>
        )}
      </div>

      <div ref={scrim} style={{ display: "none" }}
      className="invisible fixed inset-0 z-50 bg-charcoal/40 opacity-0" onClick={() => setPanel(false)} aria-hidden />
      <div
        ref={drawer}
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        style={{ display: "none" }}
      className="invisible fixed inset-y-0 right-0 z-50 flex w-[min(400px,100vw)] flex-col bg-snow"
        data-lenis-prevent
      >
        <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between px-5">
          <p className="h-section">Filters</p>
          <button type="button" data-close onClick={() => setPanel(false)} className="grid size-11 place-items-center" aria-label="Close filters">
            <Icon.Close className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5">
          <Group title="Format">{FORMATS.map((x) => box("format", x.id, x.label))}</Group>
          <Group title="Line">{LINES.map((x) => box("line", x.id, x.label))}</Group>
          <Group title="Price">{PRICES.map((x) => box("price", x.id, x.label))}</Group>
          <Group title="Diet">{box("diet", "veg", "Vegetarian only")}</Group>
          <Group title="Availability">
            {box("status", "live", "Available now")}
            {box("status", "coming-soon", "Coming soon")}
          </Group>
          <label className="mt-4 flex items-center justify-between text-[1rem] sm:hidden">
            Sort
            <select value={sort} onChange={(e) => set("sort", e.target.value === "need" ? null : e.target.value)} className="bg-transparent">
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid shrink-0 gap-2 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <button type="button" onClick={apply} className="btn w-full">
            {draftCount ? `Apply ${draftCount} ${draftCount === 1 ? "filter" : "filters"}` : "Apply"} · {draftResults} {draftResults === 1 ? "product" : "products"}
          </button>
          {draftCount > 0 && (
            <button type="button" onClick={() => setDraft({})} className="min-h-11 text-[0.875rem] underline underline-offset-4">
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
