"use client";

import type { Product } from "@/data/products";
import type { PackOption } from "@/lib/store";
import { packLabel } from "@/lib/pricing";

/**
 * "Pack: 15 sachets" with trial / standard pills. Renders nothing for products without a trial pack.
 * Used on the product page, the home "New!" block and Quick shop.
 */
export function PackSizePicker({ product: p, option, onChange, className }: { product: Product; option: PackOption; onChange: (o: PackOption) => void; className?: string }) {
  if (!p.trialPack) return null;
  const choices: [PackOption, string][] = [
    ["trial", p.trialPack.packCount],
    ["standard", p.packCount],
  ];
  return (
    <div className={className}>
      <p className="label mb-2">Pack: {packLabel(p, option)}</p>
      <div className="flex gap-2" role="radiogroup" aria-label="Pack size">
        {choices.map(([id, label]) => (
          <button key={id} type="button" role="radio" aria-checked={option === id} onClick={() => onChange(id)} className="pill-option">
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
