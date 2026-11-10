import Image from "next/image";
import { NEED_BY_ID, type Product } from "@/data/products";
import { doseFor, hasDuo, ingredientImage, packAlt, packSrc } from "@/lib/media";
import { Icon } from "@/components/ui";

/**
 * Long-form panel in the product's need colour: name and pack, "What is it?", "Why you'll love it"
 * (the first four claims), key ingredients with their doses, and every claim as a pill. Live products only.
 */

const CLAIM_ICONS = [Icon.Leaf, Icon.Flask, Icon.Target, Icon.Shield];

export function Infographic({ p }: { p: Product }) {
  const need = NEED_BY_ID[p.need];
  const plainName = p.name.replace("™", "");
  const keys = p.keyIngredients.slice(0, 4);
  const showDuo = hasDuo(p);

  return (
    <section className="wrap" aria-labelledby="info-h">
      <div className="overflow-hidden rounded-2xl" style={{ background: need.colour, color: need.ink }}>
        <div className="grid items-center gap-6 p-6 md:grid-cols-2 md:p-12">
          <div>
            <p className="font-display text-[0.9375rem] tracking-[0.12em] uppercase opacity-80">Superbeing · {need.name}</p>
            <h2 id="info-h" className="mt-2 font-display text-[clamp(2rem,1.2rem+3vw,3.75rem)] leading-none font-bold uppercase" style={{ color: need.ink }}>
              {plainName}
            </h2>
            <p className="mt-3 text-[1rem] opacity-90">{p.format}</p>
            <p className="mt-6 max-w-[48ch] text-[1.0625rem] font-medium">{p.tagline}</p>
          </div>
          <div className="relative aspect-[4/3]">
            <Image src={showDuo ? packSrc(p, "duo") : packSrc(p)} alt={packAlt(p, showDuo ? "duo" : "front")} fill sizes="(min-width:768px) 45vw, 90vw" className="object-contain" />
          </div>
        </div>

        <div className="grid gap-8 bg-snow/90 p-6 text-charcoal md:grid-cols-2 md:p-12">
          <div>
            <h3 className="font-display text-[1.5rem] font-semibold">What is {plainName}?</h3>
            <p className="mt-3 text-[0.9375rem]">{p.forWho}</p>
            <p className="mt-3 text-[0.9375rem]">{p.difference}</p>
          </div>
          <div>
            <h3 className="font-display text-[1.5rem] font-semibold">Why you&apos;ll love it</h3>
            <ul className="mt-4 grid grid-cols-2 gap-4" data-stagger>
              {p.claims.slice(0, 4).map((claim, k) => {
                const ClaimIcon = CLAIM_ICONS[k % 4];
                return (
                  <li key={claim} className="flex flex-col items-center gap-2 text-center text-[0.875rem]">
                    <span className="grid size-14 place-items-center rounded-full border-2 border-accent text-accent">
                      <ClaimIcon className="size-7" />
                    </span>
                    {claim}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="bg-snow p-6 text-charcoal md:p-12">
          <h3 className="text-center font-display text-[1.5rem] font-semibold">Key ingredients, with their doses</h3>
          <ul className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4" data-stagger>
            {keys.map((k) => (
              <li key={k} className="text-center">
                <span className="relative mx-auto block size-28 overflow-hidden rounded-full" style={{ background: need.colour }}>
                  <Image src={ingredientImage(k)} alt="" fill sizes="112px" className="object-contain p-3" />
                </span>
                <p className="mt-3 text-[0.9375rem] font-medium">{k}</p>
                <p className="tnum text-[0.875rem] text-accent">{doseFor(p, k) ?? "See label"} per serve</p>
              </li>
            ))}
          </ul>
          <h3 className="mt-14 text-center font-display text-[1.5rem] font-semibold">Why {plainName}?</h3>
          <ul className="mx-auto mt-6 grid max-w-[640px] gap-3" data-stagger>
            {p.claims.map((claim) => (
              <li key={claim} className="rounded-full border-2 border-accent px-6 py-3 text-center text-[0.9375rem] font-medium">
                {claim}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
