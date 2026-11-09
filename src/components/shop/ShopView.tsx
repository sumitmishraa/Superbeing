"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { NEEDS, NEED_BY_ID, PRODUCTS, type Line, type NeedId, type PackShape, type Product } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
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
    <div className="wrap pt-10 pb-24 md:pt-16">
      <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
        <h1 className="h-display">{title}</h1>
        <p className="tnum pb-1 text-[0.875rem]" aria-live="polite">
          {list.length} {list.length === 1 ? "product" : "products"}
        </p>
        <p className="basis-full pt-3 text-[1rem] leading-snug text-graphite">{n ? n.question : "Every formula is built for one specific need, with every dose printed on the pack."}</p>
      </div>

      <div className="mt-8 flex items-center justify-between gap-6 border-b border-charcoal pb-3">
        <div className="no-scrollbar -mx-[var(--gutter)] flex gap-3 overflow-x-auto px-[var(--gutter)] md:mx-0 md:px-0" role="toolbar" aria-label="Filter by need">
          <button type="button" className="chip" aria-pressed={!need} onClick={() => set("need", null)}>
            [All]
          </button>
          {NEEDS.map((x) => (
            <button key={x.id} type="button" className="chip" aria-pressed={need === x.id} onClick={() => set("need", need === x.id ? null : x.id)}>
              [{x.short}]
            </button>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-5 text-[0.8125rem]">
          <label className="relative hidden items-center gap-1 sm:flex">
            <span className="sr-only">Sort</span>
            <select value={sort} onChange={(e) => set("sort", e.target.value === "need" ? null : e.target.value)} className="appearance-none bg-transparent pr-5 outline-none">
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <Icon.Chevron className="pointer-events-none absolute right-0 size-3.5" />
          </label>
          <button type="button" onClick={openFilters} className="flex min-h-11 items-center gap-1.5" aria-haspopup="dialog">
            <Icon.Filters className="size-5" />
            Filters{active ? ` (${active})` : ""}
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="mt-10 bg-off p-8">
          <p className="text-[1.25rem]">Nothing matches all of those filters.</p>
          <button type="button" onClick={() => replace(new URLSearchParams(need ? { need } : {}))} className="btn mt-6">
            Clear filters
          </button>
        </div>
      ) : (
        <ul ref={grid} className="mt-6 grid grid-cols-2 gap-x-1.5 gap-y-8 lg:grid-cols-4" data-stagger>
          {list.map((p, i) => (
            <li key={p.slug} data-flip-id={p.slug}>
              <ProductCard product={p} priority={i < 4} />
            </li>
          ))}
        </ul>
      )}

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
