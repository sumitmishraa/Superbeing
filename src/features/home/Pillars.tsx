import { Icon } from "@/components/ui";

/** Three value pillars on a grey band: every dose disclosed, branded ingredients, one need per formula. */

const PILLARS = [
  { icon: Icon.Flask, title: "Every dose disclosed", text: "Each active and its amount per serve is printed on the pack. No proprietary blends hiding the numbers." },
  {
    icon: Icon.Leaf,
    title: "Branded ingredients",
    text: "Named, branded ingredients with published research behind them. Research on an ingredient is not a study of our product, and we say so.",
  },
  { icon: Icon.Target, title: "Built for one need", text: "Every formula starts from one specific need, so you take what you came for and nothing you didn't." },
];

export function Pillars() {
  return (
    <section className="band-grey mt-16 py-16 md:mt-24" aria-label="Why Superbeing">
      <div className="wrap grid gap-10 md:grid-cols-3" data-stagger>
        {PILLARS.map((pillar) => (
          <div key={pillar.title} className="text-center">
            <pillar.icon className="mx-auto size-12 text-accent" />
            <h3 className="mt-4 font-display text-[1.375rem] font-semibold">{pillar.title}</h3>
            <p className="mx-auto mt-2 max-w-[38ch] text-[0.9375rem]">{pillar.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
