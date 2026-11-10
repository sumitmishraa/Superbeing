import { RANGE_FAQ } from "./faq";

/** FAQ section: topic links on the left, each group's questions as native <details> on the right. */

/** "Diet & allergens" -> "faq-diet-allergens", the anchor for each group. */
const anchorFor = (group: string) => `faq-${group.replace(/\W+/g, "-").toLowerCase()}`;

export function RangeFaq() {
  return (
    <section id="faq" className="band-grey scroll-mt-24 py-14 md:py-20" aria-labelledby="faq-h">
      <div className="wrap">
        <h2 id="faq-h" className="sec-title">
          FAQs
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-12">
          <nav aria-label="FAQ topics" className="md:col-span-3">
            <ul className="grid gap-2 md:sticky md:top-28">
              {RANGE_FAQ.map((g) => (
                <li key={g.group}>
                  <a href={`#${anchorFor(g.group)}`} className="block rounded-lg bg-snow px-4 py-4 text-center text-[0.9375rem] text-charcoal transition-colors hover:bg-accent hover:text-snow">
                    {g.group}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-10 md:col-span-9">
            {RANGE_FAQ.map((g) => (
              <div key={g.group} id={anchorFor(g.group)} className="scroll-mt-28">
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
  );
}
