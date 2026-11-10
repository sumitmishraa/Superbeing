/** Questions answered on /contact. Items with an `id` are link targets (the footer links to #delivery and #returns). */

export const CONTACT_FAQ: { id?: string; q: string; a: string }[] = [
  {
    q: "What does “every dose on the label” mean?",
    a: "Each active is listed with its amount per serve, including probiotic counts in CFU and enzyme activity units. The Hydra sticks also contain a named proprietary complex; the label marks it as such, and every other active in them is dosed.",
  },
  {
    q: "Are your products vegetarian?",
    a: "Most are. Omega Precision™ contains fish and Collagen Glow Matrix™ contains bovine collagen, and both carry the non-vegetarian mark everywhere they appear.",
  },
  {
    q: "Can I take more than one?",
    a: "Many people combine formulas. Each product page lists what it should not be combined with. If you take prescription medicines, ask your doctor first.",
  },
  {
    q: "I am pregnant, nursing or on medication.",
    a: "Please consult your doctor before taking any supplement. Several of ours, including everything with KSM-66® ashwagandha, say to avoid them in pregnancy.",
  },
  { q: "Are these medicines?", a: "No. They are food supplements, not for medicinal use, and not intended to diagnose, treat, cure or prevent any disease." },
  {
    q: "What does “Coming soon” mean?",
    a: "Several formulas are still in development or regulatory review. We will release them only when they are ready. Tap Notify me and we will tell you.",
  },
  {
    id: "delivery",
    q: "How does delivery work?",
    a: "Delivery is free on orders of ₹999 or more, and ₹79 below that. Express delivery in metro cities is ₹149. You pay in cash or by UPI when your order arrives.",
  },
  { q: "Can I subscribe?", a: "Yes. Choose monthly delivery on any product and save 15% on each delivery. Monthly deliveries are listed in your account." },
  { id: "returns", q: "Can I return an order?", a: "Unopened packs can be returned within 7 days of delivery. For anything else, write to us and we will sort it out." },
];
