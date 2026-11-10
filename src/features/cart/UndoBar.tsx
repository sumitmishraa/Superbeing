"use client";

import { PRODUCT_BY_SLUG } from "@/data/products";
import { useStore } from "@/lib/store";

/** "Bloat + Gut Reset removed. Undo" after a line is taken out of the cart. */
export function UndoBar() {
  const last = useStore((s) => s.lastRemoved);
  const undo = useStore((s) => s.undoRemove);
  if (!last) return null;
  const p = PRODUCT_BY_SLUG[last.line.slug];
  return (
    <div className="flex min-h-11 items-center justify-between gap-3 rounded-lg bg-off px-3 text-[0.875rem]" role="status">
      <span>{p?.name} removed.</span>
      <button type="button" onClick={undo} className="link-u min-h-11 px-1">
        Undo
      </button>
    </div>
  );
}
