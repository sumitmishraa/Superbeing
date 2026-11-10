"use client";

import Image from "next/image";
import { formatINR, type Product } from "@/data/products";
import { plinthSrc } from "@/lib/media";
import type { PackOption } from "@/lib/store";
import { AddToCart } from "@/components/ui";

/**
 * Bar pinned to the bottom of the screen (above the phone tab bar) once the main buy button has
 * scrolled away. Slides out of view and becomes inert while hidden.
 */
export function StickyBuyBar({ p, option, subscribe, price, visible }: { p: Product; option: PackOption; subscribe: boolean; price: number; visible: boolean }) {
  return (
    <div
      className={`fixed inset-x-0 bottom-[calc(3.5rem+1px+env(safe-area-inset-bottom))] z-30 border-t border-line bg-snow shadow-[0_-10px_30px_-20px_rgba(0,0,0,.3)] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] lg:bottom-0 ${
        visible ? "translate-y-0" : "translate-y-[calc(100%+60px)]"
      }`}
      aria-hidden={!visible}
      inert={!visible}
    >
      <div className="wrap flex items-center gap-4 py-3">
        <span className="relative hidden size-12 shrink-0 overflow-hidden rounded-md sm:block">
          <Image src={plinthSrc(p)} alt="" fill sizes="48px" className="object-cover" />
        </span>
        <span className="hidden min-w-0 flex-1 md:block">
          <span className="block truncate text-[0.9375rem] font-medium text-charcoal">{p.name}</span>
          <span className="tnum text-[0.875rem]">{formatINR(price)}</span>
        </span>
        <AddToCart product={p} option={option} subscribe={subscribe} withPrice={price} className="flex-1 md:max-w-[280px] md:flex-none" />
      </div>
    </div>
  );
}
