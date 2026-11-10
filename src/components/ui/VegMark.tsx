import type { Product } from "@/data/products";

/** FSSAI-style veg (green dot) or non-veg (brown triangle) mark, with an optional short label. */
export function VegMark({ diet, className = "", withText = true }: { diet: Product["diet"]; className?: string; withText?: boolean }) {
  const nonVeg = diet === "non-veg";
  const colour = nonVeg ? "var(--nonveg)" : "var(--veg)";
  const label = nonVeg ? "Non-vegetarian" : diet === "vegan" ? "Vegetarian (vegan)" : "Vegetarian";
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg viewBox="0 0 16 16" className="size-4 shrink-0" role="img" aria-label={label}>
        <rect x="1" y="1" width="14" height="14" fill="#fff" stroke={colour} strokeWidth="1.4" />
        {nonVeg ? <path d="M8 3.6 12.2 11.6H3.8Z" fill={colour} /> : <circle cx="8" cy="8" r="3.6" fill={colour} />}
      </svg>
      {withText && <span className="text-[0.8125rem]">{nonVeg ? "Non-veg" : diet === "vegan" ? "Vegan" : "Veg"}</span>}
    </span>
  );
}
