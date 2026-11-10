import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { NEED_BY_ID, PRODUCTS, doseCount, formatINR } from "@/data/products";
import { plinthSrc, packAlt, priceRange } from "@/lib/media";

export const metadata: Metadata = {
  title: "The Range",
  description: "Every Superbeing formula side by side: format, serve, actives, veg mark and price. Plus answers to common questions.",
};

const LIVE = PRODUCTS.filter((p) => p.status === "live");

const FAQ: { group: string; items: [string, string][] }[] = [
  {
    group: "General",
    items: [
      [
        "What does “every dose on the label” mean?",
        "Each active is listed with its amount per serve, including probiotic counts in CFU and enzyme activity units. The Hydra sticks also contain a named proprietary complex; the label marks it as such, and every other active in them is dosed.",
      ],
      ["Are these medicines?", "No. They are food supplements, not for medicinal use, and not intended to diagnose, treat, cure or prevent any disease."],
      ["Can I take more than one formula?", "Many people combine formulas. Each product page lists what it should not be combined with. If you take prescription medicines, ask your doctor first."],
      ["I am pregnant, nursing or on medication.", "Please consult your doctor before taking any supplement. Several of ours, including everything with KSM-66® ashwagandha, say to avoid them in pregnancy."],
    ],
  },
  {
    group: "Diet & allergens",
    items: [
      ["Are your products vegetarian?", "Most are. Omega Precision™ contains fish and Collagen Glow Matrix™ contains bovine collagen, and both carry the non-vegetarian mark everywhere they appear."],
      ["Where are allergens listed?", "On the back of every pack and in the safety box on each product page, for example guar gum (a legume) in the fibre formulas."],
    ],
  },
  {
    group: "Orders & delivery",
    items: [
      ["How does delivery work?", "Delivery is free on orders of ₹999 or more and ₹79 below that. Express delivery in metro cities is ₹149. You pay by cash or UPI when your order arrives."],
      ["Can I subscribe?", "Yes. Choose monthly delivery on any product page and save 15% on each delivery."],
      ["Can I return an order?", "Unopened packs can be returned within 7 days of delivery. For anything else, write to us and we will sort it out."],
    ],
  },
  {
    group: "Coming soon",
    items: [["What does “Coming soon” mean?", "Several formulas are still in development or regulatory review. We release them only when they are ready. Tap Notify me on the product page and we will tell you."]],
  },
];

const slug = (s: string) => `faq-${s.replace(/\W+/g, "-").toLowerCase()}`;

export default function RangePage() {
  return (
    <>
      <div className="title-band">The Range</div>

      <section id="compare" className="wrap scroll-mt-24 py-14 md:py-20" aria-labelledby="cmp-h">
        <h1 id="cmp-h" className="sec-title">
          Every formula, side by side
        </h1>
        <p className="mx-auto mt-4 max-w-[60ch] text-center text-[0.9375rem]">Format, serve, actives and price for all {LIVE.length} formulas. Every active and its dose is on each product page.</p>
        <div className="mt-10 overflow-x-auto rounded-xl border border-line" data-lenis-prevent-horizontal>
          <table className="w-full min-w-[900px] border-collapse text-left text-[0.9375rem]">
            <caption className="sr-only">Comparison of Superbeing formulas</caption>
            <thead className="bg-off font-display text-[0.9375rem] text-charcoal">
              <tr>
                {["Formula", "Need", "Format", "Serve", "Actives", "Diet", "Price"].map((h, k) => (
                  <th key={h} scope="col" className={`px-4 py-3 font-semibold ${k === 0 ? "sticky left-0 bg-off" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LIVE.map((p) => (
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

      <section id="faq" className="band-grey scroll-mt-24 py-14 md:py-20" aria-labelledby="faq-h">
        <div className="wrap">
          <h2 id="faq-h" className="sec-title">
            FAQs
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-12">
            <nav aria-label="FAQ topics" className="md:col-span-3">
              <ul className="grid gap-2 md:sticky md:top-28">
                {FAQ.map((g) => (
                  <li key={g.group}>
                    <a href={`#${slug(g.group)}`} className="block rounded-lg bg-snow px-4 py-4 text-center text-[0.9375rem] text-charcoal transition-colors hover:bg-accent hover:text-snow">
                      {g.group}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="space-y-10 md:col-span-9">
              {FAQ.map((g) => (
                <div key={g.group} id={slug(g.group)} className="scroll-mt-28">
                  <h3 className="h-section">{g.group}</h3>
                  <div className="mt-3 divide-y divide-line rounded-xl bg-snow">
                    {g.items.map(([q, a]) => (
                      <details key={q} className="group px-5 py-4">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-[1.0625rem] font-medium text-charcoal">
                          {q}
                          <span className="text-[1.5rem] leading-none text-accent transition-transform duration-300 group-open:rotate-45" aria-hidden>
                            +
                          </span>
                        </summary>
                        <p className="mt-2 text-[0.9375rem]">{a}</p>
                      </details>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
