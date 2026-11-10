import { LIVE_PRODUCTS } from "@/data/products";
import { Carousel, ProductCard } from "@/components/ui";

/** "Featured Products": the first ten live products in a carousel, each with Quick shop. */
export function Featured() {
  return (
    <section className="wrap pt-16 md:pt-24" aria-labelledby="feat-title">
      <h2 id="feat-title" className="sec-title" data-rise>
        Featured Products
      </h2>
      <div className="mt-10">
        <Carousel label="Featured products">
          {LIVE_PRODUCTS.slice(0, 10).map((p) => (
            <ProductCard key={p.slug} product={p} featured />
          ))}
        </Carousel>
      </div>
    </section>
  );
}
