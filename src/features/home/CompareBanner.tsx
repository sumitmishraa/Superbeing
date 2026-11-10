import Image from "next/image";
import Link from "next/link";
import { SCENES } from "@/lib/media";

/** Full-width banner over the collection picture, linking to the comparison table on /the-range. */
export function CompareBanner() {
  return (
    <section className="relative overflow-hidden bg-[#f3e6eb]" aria-labelledby="cmp-title">
      <div className="relative aspect-[4/3] md:aspect-[24/9]">
        <Image src={SCENES.collection.src} alt={SCENES.collection.alt} fill sizes="100vw" className="object-cover object-right" />
      </div>
      <div className="wrap-wide absolute inset-0 flex items-end pb-8 md:items-center md:pb-0">
        <div className="max-w-[480px]" data-rise>
          <h2 id="cmp-title" className="font-display text-[clamp(1.75rem,1.2rem+2vw,3rem)] font-bold !text-accent">
            Designed for one need. Labelled for you.
          </h2>
          <p className="mt-3 text-[0.9375rem] text-charcoal">Form, serve, actives, veg mark and price for every formula, in one table.</p>
          <Link href="/the-range#compare" className="btn mt-6">
            Compare the range
          </Link>
        </div>
      </div>
    </section>
  );
}
