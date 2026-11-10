import Image from "next/image";
import Link from "next/link";
import { NEED_TILE, SCENES } from "@/lib/media";
import { Icon } from "@/components/ui";

/** "Made for real days": a six-picture grid (where other stores show an Instagram feed), each linking to the shop. */

const PICTURES = [SCENES.heroGut, NEED_TILE.stress!, NEED_TILE.gut!, SCENES.heroHydration, NEED_TILE.beauty!, NEED_TILE.sleep!];

export function RealDays() {
  return (
    <section className="wrap py-16 md:py-20" aria-labelledby="days-title">
      <div className="flex items-center gap-6">
        <span className="h-px flex-1 bg-line" />
        <h2 id="days-title" className="font-display text-[clamp(1.5rem,1.1rem+1.4vw,2.25rem)] font-semibold">
          Made for real days
        </h2>
        <span className="h-px flex-1 bg-line" />
      </div>
      <div className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-6" data-stagger>
        {PICTURES.map((picture, k) => (
          <Link key={k} href="/shop" className="group relative block aspect-square overflow-hidden rounded-md" aria-label="Shop all products">
            <Image src={picture.src} alt={picture.alt} fill sizes="(min-width:768px) 16vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
            <span className="absolute inset-0 grid place-items-center bg-accent/0 text-snow opacity-0 transition-all duration-300 group-hover:bg-accent/45 group-hover:opacity-100">
              <Icon.Bag className="size-7" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
