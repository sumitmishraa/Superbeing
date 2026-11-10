import Image from "next/image";
import { NEED_BY_ID, PRODUCT_BY_SLUG } from "@/data/products";
import { packAlt, packSrc } from "@/lib/media";
import { ContactForm } from "./ContactForm";
import { CONTACT_FAQ } from "./faq";

/** /contact: address and email, the contact form, and common questions. Server-rendered except the form. */
export function ContactPage() {
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
            {CONTACT_FAQ.map((f) => (
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
