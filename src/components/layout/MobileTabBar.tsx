"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHydrated, useStore, cartTotals } from "@/lib/store";
import { Icon } from "@/components/ui";

/** Phone bottom tab bar (Shop, Gut, Sleep, Cart): 56px tall (h-14) plus the home-indicator inset. Hidden on desktop. */

/** Pages whose own pay bar takes the tab bar's place at the bottom of the screen. */
const PAY_BAR_PAGES = ["/cart", "/checkout"];

const TABS: [href: string, label: string, icon: (className: string) => React.ReactNode][] = [
  ["/shop", "Shop", (c) => <Icon.Bag className={c} />],
  ["/shop?need=gut", "Gut", (c) => <Icon.Leaf className={c} />],
  ["/shop?need=sleep", "Sleep", (c) => <Icon.Target className={c} />],
];

export function MobileTabBar() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const cart = useStore((s) => s.cart);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const count = hydrated ? cartTotals(cart, null).count : 0;

  if (PAY_BAR_PAGES.includes(pathname)) return null;
  return (
    <nav aria-label="Quick links" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-snow pb-[env(safe-area-inset-bottom)] lg:hidden">
      {TABS.map(([href, label, icon]) => (
        <Link key={href} href={href} className="flex h-14 flex-col items-center justify-center gap-0.5 text-[0.75rem] text-charcoal">
          {icon("size-5")}
          {label}
        </Link>
      ))}
      <button type="button" onClick={() => setCartOpen(true)} className="relative flex h-14 flex-col items-center justify-center gap-0.5 text-[0.75rem] text-charcoal" data-cart-target>
        <span className="relative">
          <Icon.Bag className="size-5" />
          <span className="tnum absolute -top-1.5 -right-2 grid size-4 place-items-center rounded-full bg-accent text-[0.625rem] text-snow">{count}</span>
        </span>
        Cart
      </button>
    </nav>
  );
}
