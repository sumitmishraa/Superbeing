"use client";

import Link from "next/link";
import { Icon, PackMarquee, PageTitle } from "@/components/ui";
import { AddOnRail } from "./AddOnRail";
import { BillDetails } from "./BillDetails";
import { LineItem } from "./LineItem";
import { OffersSheet } from "./OffersSheet";
import { SavingsBanner } from "./SavingsBanner";
import { StickyPayBar } from "./StickyPayBar";
import { TierProgress } from "./TierProgress";
import { TrustRow } from "./TrustRow";
import { UndoBar } from "./UndoBar";
import { useBill } from "./useBill";

/**
 * /cart: savings, delivery progress, lines with upgrade and monthly options and routine add-ons on
 * the left; offers, bill and checkout on the right (a pinned pay bar on phones).
 */

function EmptyCart({ hydrated }: { hydrated: boolean }) {
  return (
    <div className="wrap mt-8 py-10 text-center">
      <Icon.Bag className="mx-auto size-16 text-graphite" />
      <p className="mt-4 font-display text-[1.75rem] font-semibold text-charcoal uppercase">{hydrated ? "Your cart is empty." : "Loading your cart…"}</p>
      <p className="mt-2 text-[0.9375rem]">Add a formula from the shop to get started.</p>
      <div className="mx-auto mt-4 max-w-sm">
        <UndoBar />
      </div>
      <Link href="/shop" className="btn mt-6">
        Return to shop
      </Link>
      {hydrated && (
        <div className="mt-20 text-left">
          <p className="label mb-3 text-graphite">New in</p>
          <PackMarquee height={140} />
        </div>
      )}
    </div>
  );
}

export function CartView() {
  const { hydrated, lines, bill } = useBill();

  return (
    <div className="pb-16">
      <PageTitle title="Cart">
        <p className="tnum pb-1 text-[0.875rem]">
          {bill.count} {bill.count === 1 ? "item" : "items"}
        </p>
      </PageTitle>
      {lines.length === 0 ? (
        <EmptyCart hydrated={hydrated} />
      ) : (
        <div className="wrap mt-6 grid gap-8 lg:mt-10 lg:grid-cols-12 lg:gap-6">
          <div className="min-w-0 space-y-5 lg:col-span-7">
            <SavingsBanner bill={bill} />
            <TierProgress bill={bill} />
            <UndoBar />
            <ul>
              {lines.map((l) => (
                <LineItem key={l.slug + l.option} line={l} />
              ))}
            </ul>
            <AddOnRail lines={lines} />
          </div>
          <div className="min-w-0 lg:col-span-4 lg:col-start-9">
            <div className="space-y-6 lg:sticky lg:top-24">
              <OffersSheet bill={bill} />
              <BillDetails bill={bill} />
              <Link href="/checkout" className="btn hidden w-full lg:flex">
                Proceed to checkout
              </Link>
              <TrustRow />
            </div>
          </div>
          <StickyPayBar total={bill.total} saved={bill.savings.total} mobileOnly>
            <Link href="/checkout" className="btn shrink-0">
              Checkout
            </Link>
          </StickyPayBar>
        </div>
      )}
    </div>
  );
}
