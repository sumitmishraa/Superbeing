/** Scrolling strip of the branded ingredients used across the range (where other stores put press logos). */

const BRANDS = [
  "KSM-66® Ashwagandha",
  "Sunfiber® PHGG",
  "VERISOL® Collagen",
  "MEG-3® Fish Oil",
  "affron® Saffron",
  "Ferrochel® Iron",
  "AstaReal® Astaxanthin",
  "TRAACS® Magnesium",
  "Suntheanine®",
  "Aquamin®",
];

export function IngredientStrip() {
  return (
    <section className="border-y border-line bg-snow py-7" aria-label="Branded ingredients in our formulas">
      <p className="mb-4 text-center text-[0.8125rem] tracking-[0.08em] text-graphite uppercase">Branded ingredients you will find on our labels</p>
      <div className="overflow-hidden">
        <div className="flex w-max animate-[marquee_38s_linear_infinite] gap-14 pr-14 hover:[animation-play-state:paused]">
          {/* Two copies so the CSS loop is seamless; the second is hidden from screen readers. */}
          {[...BRANDS, ...BRANDS].map((brand, k) => (
            <span key={k} className="font-display text-[1.5rem] font-semibold whitespace-nowrap text-[#8a8487]" aria-hidden={k >= BRANDS.length}>
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
