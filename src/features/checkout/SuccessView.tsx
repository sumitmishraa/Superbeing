"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PRODUCT_BY_SLUG, formatINR } from "@/data/products";
import { packAlt, packSrc } from "@/lib/media";
import { useHydrated, useStore } from "@/lib/store";

/** /checkout/success?order=: thanks, order number, total and the packs ordered (read from saved orders). */
export function SuccessView() {
  const sp = useSearchParams();
  const orders = useStore((s) => s.orders);
  const hydrated = useHydrated();
  const order = hydrated ? (orders.find((o) => o.id === sp.get("order")) ?? orders[0]) : undefined;

  return (
    <div className="wrap grid gap-10 pt-10 pb-24 md:grid-cols-12 md:gap-6 md:pt-16">
      <div className="md:col-span-6">
        <h1 className="h-display" data-split>
          Order placed
        </h1>
        <p className="mt-6 max-w-[44ch] text-[1.0625rem] leading-snug">
          {order ? (
            <>
              Thank you, {order.address.name.split(" ")[0]}. Order <span className="tnum">{order.id}</span> for <span className="tnum">{formatINR(order.total)}</span> is
              confirmed. You pay when it arrives. We will send delivery updates to {order.address.phone}.
            </>
          ) : (
            "Thank you. Your order is confirmed."
          )}
        </p>
        {order?.giftNote && (
          <p className="mt-4 max-w-[44ch] rounded-lg bg-off px-4 py-3 text-[0.9375rem]">
            <span className="label block">Gift note</span>
            {order.giftNote}
          </p>
        )}
        <div className="mt-8 flex flex-wrap gap-2">
          <Link href="/account" className="btn">
            View your orders
          </Link>
          <Link href="/shop" className="btn btn-off">
            Keep shopping
          </Link>
        </div>
      </div>
      {order && (
        <ul className="md:col-span-5 md:col-start-8">
          {order.lines.map((l) => {
            const p = PRODUCT_BY_SLUG[l.slug];
            if (!p) return null;
            return (
              <li key={l.slug + l.option} className="flex items-center gap-4 py-2">
                <span className="relative block h-[96px] w-[78px] shrink-0 bg-off">
                  <Image src={packSrc(p)} alt={packAlt(p)} fill sizes="78px" className="object-contain p-2" />
                </span>
                <span className="flex-1 text-[1rem]">
                  {p.name}
                  <span className="block text-[0.8125rem] text-graphite">
                    Code {p.code} · Quantity {l.qty}
                    {l.subscribe ? " · Monthly" : ""}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
