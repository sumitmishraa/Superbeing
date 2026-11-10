/** Raspberry band of store promises scrolling sideways. Decorative: the same facts appear elsewhere as text. */

const PROMISES = ["Every dose on the label", "Branded ingredients", "Free delivery over ₹999", "Monthly delivery: save 15%", "Cash or UPI on delivery"];

export function Marquee() {
  return (
    <div className="overflow-hidden bg-accent py-3 text-snow" aria-hidden>
      <div className="flex w-max animate-[marquee_30s_linear_infinite]">
        {[...PROMISES, ...PROMISES, ...PROMISES, ...PROMISES].map((text, k) => (
          <span key={k} className="flex items-center gap-4 px-6 font-display text-[1.125rem] font-medium tracking-[0.04em] whitespace-nowrap uppercase">
            <span className="size-1.5 rounded-full bg-snow" />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
