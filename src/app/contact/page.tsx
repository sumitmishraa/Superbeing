import type { Metadata } from "next";
import Image from "next/image";
import { ContactForm } from "@/components/commerce/Views";
import { NEED_BY_ID, PRODUCT_BY_SLUG } from "@/data/products";
import { packAlt, packSrc } from "@/lib/media";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about a label, an order or a partnership. Superbeing Nutrition, Nuvexa Biotech, Bengaluru.",
};

const FAQ: { id?: string; q: string; a: string }[] = [
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

export default function ContactPage() {
  const shown = PRODUCT_BY_SLUG["daily-fibre-gap"];
  return (
    <>
      <section className="wrap grid gap-10 pt-10 pb-20 md:grid-cols-12 md:gap-6 md:pt-16" aria-labelledby="contact-title">
        <div className="md:col-span-5">
          <h1 id="contact-title" className="h-display" data-split>
            Contact
          </h1>
          <p className="mt-6 max-w-[38ch] text-[1.0625rem] leading-snug" data-rise>
            About a label, an order, or whether a formula suits you.
          </p>
          <address className="mt-10 text-[1rem] leading-relaxed not-italic" data-rise="0.1">
            <p className="label mb-2 text-graphite">Write or visit</p>
            <p>Superbeing Nutrition</p>
            <p>Nuvexa Biotech Pvt. Ltd.</p>
            <p>Amar Complex, above Bank of Baroda</p>
            <p>Sarjapur Road, Indlabele, Attibele</p>
            <p>
              Bengaluru <span className="tnum">562107</span>, Karnataka
            </p>
            <a href="mailto:ceo@nuvexabio.com" className="link-u mt-3 inline-block">
              ceo@nuvexabio.com
            </a>
          </address>
          <div className="relative mt-10 aspect-[4/3] overflow-hidden" style={{ background: NEED_BY_ID[shown.need].shade }} data-rise="0.15">
            <Image src={packSrc(shown, "macro")} alt={packAlt(shown, "macro")} fill sizes="(min-width:768px) 40vw, 100vw" className="object-cover" />
          </div>
        </div>
        <div className="md:col-span-6 md:col-start-7" data-rise="0.1">
          <h2 className="h-section mb-4">Write to us</h2>
          <ContactForm />
        </div>
      </section>

      <section id="faq" className="bg-off" aria-labelledby="faq-title">
        <div className="wrap grid gap-10 py-20 md:grid-cols-12 md:gap-6 md:py-28">
          <h2 id="faq-title" className="h-display md:col-span-4" data-split>
            Questions
          </h2>
          <dl className="md:col-span-7 md:col-start-6" data-stagger>
            {FAQ.map((f) => (
              <div key={f.q} id={f.id} className="scroll-mt-24 py-4">
                <dt className="text-[1.0625rem] font-medium">{f.q}</dt>
                <dd className="mt-1.5 max-w-[60ch] text-[1rem] leading-snug">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
