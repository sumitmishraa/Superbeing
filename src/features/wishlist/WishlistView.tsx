"use client";

import Link from "next/link";
import { PRODUCT_BY_SLUG } from "@/data/products";
import { useHydrated, useStore } from "@/lib/store";
import { PageTitle, ProductCard } from "@/components/ui";

/** /wishlist: saved products as cards, with one button to move every live one into the cart. */
export function WishlistView() {
  const wishlist = useStore((s) => s.wishlist);
  const moveToCart = useStore((s) => s.moveToCart);
  const hydrated = useHydrated();
  const items = (hydrated ? wishlist : []).map((slug) => PRODUCT_BY_SLUG[slug]).filter(Boolean);
  const live = items.filter((p) => p.status === "live");

  return (
    <div className="pb-24">
      <PageTitle title="Wishlist">
        <p className="tnum pb-1 text-[0.875rem]">{items.length} saved</p>
      </PageTitle>
      <div className="wrap mt-8">
        {items.length === 0 ? (
          <div className="max-w-[48ch]">
            <p className="text-[1.25rem]">{hydrated ? "Nothing saved yet." : "Loading…"}</p>
            <p className="mt-2 text-[1rem] text-graphite">Tap the heart on any product to keep it here while you compare labels.</p>
            <Link href="/shop" className="btn mt-6">
              Shop all products
            </Link>
          </div>
        ) : (
          <>
            {live.length > 0 && (
              <button type="button" onClick={() => live.forEach((p) => moveToCart(p.slug))} className="btn mb-8">
                Move {live.length === 1 ? "it" : `all ${live.length}`} to cart
              </button>
            )}
            <ul className="grid grid-cols-2 gap-x-1.5 gap-y-8 lg:grid-cols-4">
              {items.map((p) => (
                <li key={p.slug}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
