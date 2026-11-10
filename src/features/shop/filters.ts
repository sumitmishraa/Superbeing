/**
 * Shop filters and sorting. The URL query is the source of truth (?need=, ?format=, ?sort=, ?page=…),
 * so every filtered view can be shared or bookmarked.
 */

import { NEEDS, PRODUCTS, type Line, type PackShape, type Product } from "@/data/products";

export const FORMATS: { id: string; label: string; shapes: PackShape[] }[] = [
  { id: "sachet", label: "Powder sachet", shapes: ["carton"] },
  { id: "stick", label: "Stick sachet", shapes: ["stick"] },
  { id: "melt", label: "Mouth melt", shapes: ["melt"] },
  { id: "tablet", label: "Tablet", shapes: ["bottle"] },
  { id: "softgel", label: "Softgel", shapes: ["tub"] },
];

export const LINES: { id: Line; label: string }[] = [
  { id: "everyone", label: "For everyone" },
  { id: "women", label: "For her" },
  { id: "men", label: "For him" },
];

export const PRICES = [
  { id: "u1000", label: "Under ₹1,000", test: (n: number) => n < 1000 },
  { id: "1000-1500", label: "₹1,000 – ₹1,500", test: (n: number) => n >= 1000 && n <= 1500 },
  { id: "o1500", label: "Over ₹1,500", test: (n: number) => n > 1500 },
];

export const SORTS = [
  { id: "need", label: "By need" },
  { id: "price-asc", label: "Price, low to high" },
  { id: "price-desc", label: "Price, high to low" },
  { id: "name", label: "Name, A to Z" },
];

/** Filters set in the drawer. `need` and `sort` are set outside it, so they are not listed here. */
export const FILTER_KEYS = ["line", "format", "diet", "price", "status"] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];
export type FilterDraft = Partial<Record<FilterKey, string>>;

export const PER_PAGE = 12;

/** Products matching the query, sorted. `get(key)` reads one query value ("" when unset). */
export function filterProducts(get: (key: string) => string): Product[] {
  const need = get("need");
  let list: Product[] = PRODUCTS.filter((p) => {
    if (need && p.need !== need) return false;
    if (get("line") && p.line !== get("line")) return false;
    if (get("format") && !FORMATS.find((x) => x.id === get("format"))?.shapes.includes(p.shape)) return false;
    if (get("diet") === "veg" && p.diet === "non-veg") return false;
    if (get("price") && !PRICES.find((x) => x.id === get("price"))?.test(p.price)) return false;
    if (get("status") && p.status !== get("status")) return false;
    return true;
  });

  const sort = get("sort") || "need";
  if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
  if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "need") {
    // Catalogue need order; within a need, live products before coming-soon.
    const order = NEEDS.map((n) => n.id);
    list = [...list].sort((a, b) => order.indexOf(a.need) - order.indexOf(b.need) || (a.status === b.status ? 0 : a.status === "live" ? -1 : 1));
  }
  return list;
}
