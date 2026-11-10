"use client";

import Image from "next/image";
import Link from "next/link";
import { PRODUCT_BY_SLUG, formatINR } from "@/data/products";
import { lineListPrice, linePrice, monthlySaving, packDays, packLabel, perDayLabel, perServe, upgradeOffer } from "@/lib/pricing";
import { plinthSrc, packAlt } from "@/lib/media";
import { useStore, type CartLine } from "@/lib/store";
import { Icon, QtyStepper } from "@/components/ui";

/** "Make it a 30-day supply: +₹700, save ₹99 · ₹50/day" with a one-tap Upgrade. Hidden when there is no real saving. */
function UpgradeNudge({ line }: { line: CartLine }) {
  const upgrade = useStore((s) => s.upgradePack);
  const offer = upgradeOffer(line);
  if (!offer) return null;
  return (
    <div className="mt-3 flex items-center gap-3 rounded-lg bg-accent-soft px-3 py-2">
      <p className="min-w-0 flex-1 text-[0.8125rem] leading-snug text-charcoal">
        <span className="font-semibold">Make it a {offer.days}-day supply:</span>{" "}
        <span className="tnum">
          +{formatINR(offer.extraCost)}, save {formatINR(offer.savings)} · {perDayLabel(offer.perServeAfter)}
        </span>
        <span className="block text-graphite">
          Now {perDayLabel(offer.perServeNow)} with the smaller pack.
        </span>
      </p>
      <button type="button" onClick={() => upgrade(line.slug)} className="btn btn-sm !min-h-11 shrink-0">
        Upgrade
      </button>
    </div>
  );
}

/** Opt-in monthly delivery for one line. Never pre-ticked: it reflects only what the shopper chose. */
function MonthlyToggle({ line }: { line: CartLine }) {
  const toggle = useStore((s) => s.toggleSubscribe);
  const p = PRODUCT_BY_SLUG[line.slug];
  return (
    <label className="check mt-2 !items-start !text-[0.8125rem] leading-snug">
      <input type="checkbox" className="mt-0.5" checked={line.subscribe} onChange={() => toggle(line.slug, line.option)} aria-label={`Deliver ${p?.name} monthly`} />
      <span>
        Deliver monthly · <span className="tnum text-save">save {formatINR(monthlySaving(line))} every month</span> · skip or stop anytime
      </span>
    </label>
  );
}

/** One cart line: plinth thumbnail, name, pack and cost per day, quantity, remove, then the upgrade and monthly options. */
export function LineItem({ line, compact = false }: { line: CartLine; compact?: boolean }) {
  const p = PRODUCT_BY_SLUG[line.slug];
  const setQty = useStore((s) => s.setQty);
  const remove = useStore((s) => s.removeLine);
  if (!p) return null;
  const price = linePrice(line);
  const list = lineListPrice(line);
  return (
    <li className="border-b border-line py-4 last:border-b-0">
      <div className="grid grid-cols-[auto_1fr] gap-3.5">
        <Link href={`/products/${p.slug}`} className={`relative block overflow-hidden rounded-lg bg-off ${compact ? "size-[72px]" : "size-[88px]"}`}>
          <Image src={plinthSrc(p)} alt={packAlt(p)} fill sizes="88px" className="object-cover" />
        </Link>
        <div className="flex min-w-0 flex-col">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/products/${p.slug}`} className="pt-0.5 text-[0.9375rem] leading-tight font-medium text-charcoal hover:underline">
              {p.name}
            </Link>
            <button
              type="button"
              onClick={() => remove(line.slug, line.option)}
              className="-mt-2.5 -mr-2.5 grid size-11 shrink-0 place-items-center text-graphite hover:text-charcoal"
              aria-label={`Remove ${p.name}`}
            >
              <Icon.Close className="size-4" />
            </button>
          </div>
          <p className="tnum text-[0.8125rem] text-graphite">
            {packLabel(p, line.option)} · {packDays(p, line.option)} days · {perDayLabel(perServe(p, line.option, line.subscribe))}
          </p>
          <div className="mt-auto flex items-end justify-between gap-3 pt-2">
            <QtyStepper value={line.qty} onChange={(n) => setQty(line.slug, line.option, n)} label={p.name} />
            <span className="tnum text-right leading-tight">
              {list > price && (
                <s className="block text-[0.8125rem] text-graphite" aria-label={`Shelf price ${formatINR(list)}`}>
                  {formatINR(list)}
                </s>
              )}
              <span className="text-[1.0625rem] text-charcoal">{formatINR(price)}</span>
            </span>
          </div>
        </div>
      </div>
      <UpgradeNudge line={line} />
      <MonthlyToggle line={line} />
    </li>
  );
}
