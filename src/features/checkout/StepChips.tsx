import { Icon } from "@/components/ui";

/** 1 Contact · 2 Address · 3 Payment. Each chip jumps to its section and ticks when that section is complete. */

export type Step = { id: string; label: string; done: boolean };

export function StepChips({ steps }: { steps: Step[] }) {
  const current = steps.findIndex((s) => !s.done);
  return (
    <ol className="no-scrollbar flex gap-1.5 overflow-x-auto" aria-label="Checkout steps">
      {steps.map((s, i) => {
        const active = i === current;
        return (
          <li key={s.id} className="shrink-0">
            <a
              href={`#${s.id}`}
              aria-current={active ? "step" : undefined}
              className={`flex min-h-11 items-center gap-2 rounded-full py-1 pr-4 pl-1.5 text-[0.875rem] transition-colors ${
                active ? "bg-accent-soft text-charcoal" : "text-graphite hover:text-charcoal"
              }`}
            >
              <span
                className={`tnum grid size-7 place-items-center rounded-full text-[0.8125rem] font-semibold ${
                  s.done ? "bg-save text-snow" : active ? "bg-accent text-snow" : "bg-off text-charcoal"
                }`}
              >
                {s.done ? <Icon.Check className="size-4" /> : i + 1}
              </span>
              {s.label}
              {s.done && <span className="sr-only">(complete)</span>}
            </a>
          </li>
        );
      })}
    </ol>
  );
}
