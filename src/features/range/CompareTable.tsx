import Image from "next/image";
import Link from "next/link";
import { LIVE_PRODUCTS, NEED_BY_ID, doseCount, formatINR } from "@/data/products";
import { packAlt, plinthSrc, priceRange } from "@/lib/media";

/** Every live formula side by side: need, format, serve, active count, diet and price. Holds the page's h1. */

const COLUMNS = ["Formula", "Need", "Format", "Serve", "Actives", "Diet", "Price"];

export function CompareTable() {
  return (
    <section id="compare" className="wrap scroll-mt-24 py-14 md:py-20" aria-labelledby="cmp-h">
      <h1 id="cmp-h" className="sec-title">
        Every formula, side by side
      </h1>
      <p className="mx-auto mt-4 max-w-[60ch] text-center text-[0.9375rem]">Format, serve, actives and price for all {LIVE_PRODUCTS.length} formulas. Every active and its dose is on each product page.</p>
      <div className="mt-10 overflow-x-auto rounded-xl border border-line" data-lenis-prevent-horizontal>
        <table className="w-full min-w-[900px] border-collapse text-left text-[0.9375rem]">
          <caption className="sr-only">Comparison of Superbeing formulas</caption>
          <thead className="bg-off font-display text-[0.9375rem] text-charcoal">
            <tr>
              {COLUMNS.map((h, k) => (
                <th key={h} scope="col" className={`px-4 py-3 font-semibold ${k === 0 ? "sticky left-0 bg-off" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LIVE_PRODUCTS.map((p) => (
              <tr key={p.slug} className="border-t border-line align-top">
                <th scope="row" className="sticky left-0 bg-snow px-4 py-3 font-medium text-charcoal">
                  <Link href={`/products/${p.slug}`} className="flex items-center gap-3 hover:text-accent">
                    <span className="relative block size-12 shrink-0 overflow-hidden rounded-md">
                      <Image src={plinthSrc(p)} alt={packAlt(p)} fill sizes="48px" className="object-cover" />
                    </span>
                    {p.name}
                  </Link>
                </th>
                <td className="px-4 py-3">{NEED_BY_ID[p.need].name}</td>
                <td className="px-4 py-3">{p.format}</td>
                <td className="px-4 py-3">{p.serve}</td>
                <td className="tnum px-4 py-3 text-accent">{doseCount(p)}</td>
                <td className="px-4 py-3">{p.diet === "non-veg" ? "Non-veg" : p.diet === "vegan" ? "Vegan" : "Veg"}</td>
                <td className="tnum px-4 py-3 whitespace-nowrap">{priceRange(p, formatINR)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
