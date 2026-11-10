import { useId } from "react";
import { FREE_SHIPPING_AT, formatINR } from "@/data/products";
import { DELIVERY_FEE, type Quote } from "@/lib/pricing";

/** One bill row. Savings render green with a minus sign. */
function Row({ label, value, save, children }: { label: React.ReactNode; value?: number; save?: boolean; children?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt>{label}</dt>
      <dd className={`tnum text-right ${save ? "text-save" : "text-charcoal"}`}>{children ?? (save ? `−${formatINR(value ?? 0)}` : formatINR(value ?? 0))}</dd>
    </div>
  );
}

/** Item total, every saving, delivery (FREE with the ₹79 struck through, or the fee), GST and To pay. */
export function BillDetails({ bill, className = "" }: { bill: Quote; className?: string }) {
  const { savings } = bill;
  const headingId = useId();
  return (
    <section className={className} aria-labelledby={headingId}>
      <h2 id={headingId} className="label mb-3">
        Bill details
      </h2>
      <dl className="space-y-2 text-[0.9375rem]">
        <Row label={`Item total (${bill.count} ${bill.count === 1 ? "pack" : "packs"})`} value={bill.listTotal} />
        {savings.monthly > 0 && <Row label="Monthly delivery saving" value={savings.monthly} save />}
        {bill.discount > 0 && bill.coupon && <Row label={`Code ${bill.coupon.code}`} value={bill.discount} save />}
        <Row label="Delivery">
          {bill.deliveryFee === 0 ? (
            <>
              <s className="mr-1.5 text-graphite">{formatINR(DELIVERY_FEE)}</s>
              <span className="font-semibold text-save">FREE</span>
            </>
          ) : (
            <>
              {formatINR(bill.deliveryFee)}
              <span className="block text-[0.75rem] text-graphite">Free from {formatINR(FREE_SHIPPING_AT)}</span>
            </>
          )}
        </Row>
        {bill.expressFee > 0 && <Row label="Express delivery" value={bill.expressFee} />}
        <Row label="GST">
          <span className="text-graphite">Included</span>
        </Row>
        <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3 text-[1.25rem] font-semibold text-charcoal">
          <dt>To pay</dt>
          <dd className="tnum">{formatINR(bill.total)}</dd>
        </div>
      </dl>
    </section>
  );
}
