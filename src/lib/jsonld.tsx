import type { Product } from "@/data/products";
import { plinthSrc } from "@/lib/media";
import { COMPANY, SITE_DESCRIPTION, SITE_NAME, SITE_URL, absUrl } from "@/lib/site";

/**
 * Structured data (schema.org JSON-LD) for search engines. Server-rendered only.
 * Compliance: no ratings, reviews or health claims. Product text comes from products.ts.
 */

type Json = Record<string, unknown>;

/**
 * Renders one JSON-LD block. `<` is escaped as < so that no string in the data can close the
 * <script> tag early; this is the only dangerouslySetInnerHTML in the app.
 */
export function JsonLd({ data }: { data: Json | Json[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

const ORG_ID = `${SITE_URL}/#organization`;

export function organizationLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absUrl("/brand/superbeing-logo.webp"),
    email: COMPANY.email,
    description: SITE_DESCRIPTION,
    parentOrganization: { "@type": "Organization", name: COMPANY.legalName },
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.street,
      addressLocality: COMPANY.locality,
      addressRegion: COMPANY.region,
      postalCode: COMPANY.postalCode,
      addressCountry: COMPANY.country,
    },
  };
}

export function websiteLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "en-IN",
    publisher: { "@id": ORG_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function productLd(p: Product): Json {
  const url = absUrl(`/products/${p.slug}`);
  const live = p.status === "live";
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: p.name,
    sku: p.code,
    url,
    image: [absUrl(plinthSrc(p))],
    // Coming-soon products publish name and format only, never claims.
    description: live ? p.tagline : `${p.name}. ${p.format}. Coming soon.`,
    brand: { "@type": "Brand", name: "Superbeing" },
    manufacturer: { "@id": ORG_ID },
    // Coming-soon pages show no price and cannot be ordered (only "Notify me"), so they carry no
    // Offer: structured data must not state a price the page does not show.
    ...(live && {
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: "INR",
        price: p.price.toFixed(2),
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@id": ORG_ID },
      },
    }),
  };
}

export function breadcrumbLd(trail: [name: string, path: string][]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: absUrl(path) })),
  };
}

export function faqLd(items: [question: string, answer: string][]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
}
