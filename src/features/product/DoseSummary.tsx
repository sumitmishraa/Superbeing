import { doseCount, type Product } from "@/data/products";
import { DoseBars } from "./DoseBars";

/** "14 actives, every dose shown" with the largest doses as bars, beside who it is for and what makes it different. */
export function DoseSummary({ p }: { p: Product }) {
  return (
    <section className="wrap grid gap-10 py-16 md:grid-cols-12 md:gap-6 md:py-24" aria-labelledby="label-h">
      <div className="md:col-span-4">
        <div className="flex items-end justify-between gap-4">
          <p id="label-h" className="text-[clamp(3rem,2rem+3vw,4.5rem)] leading-none">
            {doseCount(p)}
          </p>
          <p className="pb-2 text-[0.875rem]">actives, every dose shown</p>
        </div>
        <DoseBars p={p} />
      </div>
      <div className="grid gap-8 sm:grid-cols-2 md:col-span-7 md:col-start-6">
        <div data-rise>
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[0.875rem] font-semibold">Who it is for</p>
            <a href="#label" className="link-u text-[0.8125rem]">
              View full label
            </a>
          </div>
          <p className="mt-3 text-[1rem] leading-snug">{p.forWho}</p>
        </div>
        <div data-rise="0.1">
          <p className="text-[0.875rem] font-semibold">What makes it different</p>
          <p className="mt-3 text-[1rem] leading-snug">{p.difference}</p>
        </div>
      </div>
    </section>
  );
}
