/** Fuzzy product search (Fuse.js) over names, needs, ingredients and descriptions. Used by the search overlay and /search. */

import Fuse from "fuse.js";
import { NEED_BY_ID, PRODUCTS, type Product } from "@/data/products";

type Doc = { p: Product; name: string; need: string; ingredients: string; forWho: string; format: string };

const docs: Doc[] = PRODUCTS.map((p) => ({
  p,
  name: p.name,
  need: NEED_BY_ID[p.need].name,
  // Coming-soon formulas are findable by name and need only: nothing about what they contain or do.
  ingredients: p.status === "live" ? [...p.keyIngredients, ...p.formula.flatMap((g) => g.items.map((i) => i.name))].join(" · ") : "",
  forWho: p.status === "live" ? p.forWho + " " + p.tagline : "",
  format: p.format,
}));

const fuse = new Fuse(docs, {
  keys: [
    { name: "name", weight: 3 },
    { name: "need", weight: 2 },
    { name: "ingredients", weight: 1.5 },
    { name: "forWho", weight: 1 },
    { name: "format", weight: 0.5 },
  ],
  threshold: 0.36,
  ignoreLocation: true,
  minMatchCharLength: 2,
});

export function searchProducts(q: string, limit = 25): Product[] {
  const query = q.trim();
  if (!query) return [];
  return fuse.search(query, { limit }).map((r) => r.item.p);
}

export const POPULAR_SEARCHES = ["Bloating", "Magnesium", "Ashwagandha", "Iron", "Collagen", "Electrolytes", "Omega-3", "Sleep"];
