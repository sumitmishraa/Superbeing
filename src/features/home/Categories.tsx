import Image from "next/image";
import Link from "next/link";
import { LIVE_PRODUCTS, NEED_BY_ID } from "@/data/products";
import { NEED_TILE } from "@/lib/media";

/** "Nutrition built for one specific need": five need tiles with their live-product counts. */

const TILES = (["gut", "sleep", "stress", "hydration", "beauty"] as const).map((id) => ({
  need: NEED_BY_ID[id],
  img: NEED_TILE[id]!,
  count: LIVE_PRODUCTS.filter((p) => p.need === id).length,
}));

export function Categories() {
  return (
    <section className="pt-14 md:pt-20" aria-labelledby="cat-title">
      <h2 id="cat-title" className="sec-title wrap" data-rise>
        Nutrition built for one specific need
      </h2>
      <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-px overflow-x-auto md:grid md:grid-cols-5" data-stagger>
        {TILES.map((t) => (
          <Link key={t.need.id} href={`/shop?need=${t.need.id}`} className="group w-[70vw] shrink-0 snap-start bg-snow md:w-auto">
            <span className="relative block aspect-square overflow-hidden">
              <Image
                src={t.img.src}
                alt={t.img.alt}
                fill
                sizes="(min-width:768px) 20vw, 70vw"
                className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110"
              />
            </span>
            <span className="block px-4 pt-4 pb-6">
              <span className="block font-display text-[1.5rem] leading-[1.05] font-bold text-charcoal uppercase">{t.need.name}</span>
              <span className="mt-3 inline-flex rounded-full bg-accent px-4 py-1 text-[0.875rem] text-snow transition-colors group-hover:bg-accent-hover">
                Shop {t.count} {t.count === 1 ? "formula" : "formulas"}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
