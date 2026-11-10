"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { NEED_BY_ID, PRODUCTS, PRODUCT_BY_SLUG, type Product } from "@/data/products";
import { unitPrice } from "@/lib/pricing";
import { useStore, type PackOption } from "@/lib/store";
import { Carousel, Icon, ProductCard } from "@/components/ui";
import { Gallery } from "./Gallery";
import { BuyBox } from "./BuyBox";
import { Infographic } from "./Infographic";
import { DoseSummary } from "./DoseSummary";
import { StickyBuyBar } from "./StickyBuyBar";

/**
 * The product page, composed from the pieces in this folder. Owns the shared buy state (pack size,
 * monthly delivery) so the main buy box and the sticky bar always add the same thing.
 */

/** Same-need products first, then other live products: eight in all. */
function relatedTo(p: Product) {
  const sameNeed = PRODUCTS.filter((x) => x.need === p.need && x.slug !== p.slug);
  const otherLive = PRODUCTS.filter((x) => x.need !== p.need && x.status === "live");
  return [...sameNeed, ...otherLive].slice(0, 8);
}

function Breadcrumb({ p }: { p: Product }) {
  return (
    <div className="band-grey">
      <nav aria-label="Breadcrumb" className="wrap crumbs flex flex-wrap items-center gap-2 py-4">
        <Link href="/" className="text-charcoal hover:text-accent">
          Home
        </Link>
        <Icon.ChevronRight className="size-3.5" />
        <Link href={`/shop?need=${p.need}`} className="text-charcoal hover:text-accent">
          {NEED_BY_ID[p.need].name}
        </Link>
        <Icon.ChevronRight className="size-3.5" />
        <span aria-current="page">{p.name}</span>
      </nav>
    </div>
  );
}

export function ProductView({ slug }: { slug: string }) {
  const p = PRODUCT_BY_SLUG[slug];
  const live = p.status === "live";
  const [option, setOption] = useState<PackOption>("standard");
  const [subscribe, setSubscribe] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const buy = useRef<HTMLDivElement>(null);
  const pushRecent = useStore((s) => s.pushRecent);
  const price = unitPrice(p, option, subscribe);

  useEffect(() => pushRecent(p.slug), [p.slug, pushRecent]);

  // The sticky buy bar appears once the main buy controls have scrolled up out of view.
  useEffect(() => {
    if (!buy.current || !live) return;
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(buy.current);
    return () => io.disconnect();
  }, [live]);

  return (
    <div className={showBar ? "pb-24 lg:pb-20" : ""}>
      <Breadcrumb p={p} />

      <section className="wrap grid gap-8 pt-8 pb-16 md:grid-cols-12 md:gap-10 md:pt-10">
        <Gallery p={p} />
        <BuyBox p={p} buyRef={buy} option={option} setOption={setOption} subscribe={subscribe} setSubscribe={setSubscribe} price={price} />
      </section>

      {live && <Infographic p={p} />}
      {live && <DoseSummary p={p} />}

      <section className="wrap pb-24" aria-labelledby="same-h">
        <h2 id="same-h" className="sec-title" data-rise>
          You may also like
        </h2>
        <div className="mt-10">
          <Carousel label="You may also like">
            {relatedTo(p).map((x) => (
              <ProductCard key={x.slug} product={x} />
            ))}
          </Carousel>
        </div>
      </section>

      {live && <StickyBuyBar p={p} option={option} subscribe={subscribe} price={price} visible={showBar} />}
    </div>
  );
}
