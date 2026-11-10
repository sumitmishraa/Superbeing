import { NEEDS, type NeedId } from "@/data/products";
import { Icon } from "@/components/ui";

/** Row of round need chips ("All", "Gut", "Sleep"…). Tapping the active chip clears it. */
export function NeedNav({ need, onChange }: { need: NeedId | ""; onChange: (need: NeedId | null) => void }) {
  return (
    <nav aria-label="Shop by need" className="no-scrollbar -mx-[var(--gutter)] flex gap-6 overflow-x-auto px-[var(--gutter)] py-8 md:justify-center">
      <button type="button" onClick={() => onChange(null)} aria-pressed={!need} className="group flex shrink-0 flex-col items-center gap-2">
        <span className={`grid size-16 place-items-center rounded-full border-2 transition-colors ${!need ? "border-accent text-accent" : "border-line text-charcoal group-hover:border-accent"}`}>
          <Icon.Bag className="size-6" />
        </span>
        <span className="text-[0.875rem] text-charcoal">All</span>
      </button>
      {NEEDS.map((x) => (
        <button key={x.id} type="button" onClick={() => onChange(need === x.id ? null : x.id)} aria-pressed={need === x.id} className="group flex shrink-0 flex-col items-center gap-2">
          <span
            className={`grid size-16 place-items-center rounded-full border-2 transition-colors ${need === x.id ? "border-accent" : "border-transparent group-hover:border-accent"}`}
            style={{ background: x.colour }}
          >
            <span className="size-6 rounded-full bg-snow/70" />
          </span>
          <span className={`text-[0.875rem] whitespace-nowrap ${need === x.id ? "text-accent" : "text-charcoal"}`}>{x.short}</span>
        </button>
      ))}
    </nav>
  );
}
