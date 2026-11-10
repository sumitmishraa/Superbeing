import { Icon } from "@/components/ui";

const ITEMS = [
  { icon: Icon.Truck, text: "Cash or UPI on delivery" },
  { icon: Icon.Shield, text: "7-day returns on unopened packs" },
  { icon: Icon.Flask, text: "Every dose on the label" },
];

/** Three plain promises under the bill. */
export function TrustRow({ className = "" }: { className?: string }) {
  return (
    <ul className={`grid grid-cols-3 gap-2 text-center text-[0.75rem] leading-tight text-charcoal ${className}`}>
      {ITEMS.map(({ icon: I, text }) => (
        <li key={text} className="flex flex-col items-center gap-1.5 rounded-lg bg-off px-2 py-3">
          <I className="size-5 text-accent" />
          {text}
        </li>
      ))}
    </ul>
  );
}
