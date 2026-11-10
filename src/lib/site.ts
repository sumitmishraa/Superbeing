import type { Metadata } from "next";

/** Public facts about the site, shared by metadata, the sitemap, robots.txt and structured data. */

/** Canonical origin, without a trailing slash. Set NEXT_PUBLIC_SITE_URL when the real domain is live. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://superbeing-nutrition.vercel.app").replace(/\/+$/, "");

export const SITE_NAME = "Superbeing Nutrition";
export const SITE_TAGLINE = "Every dose on the label";
export const SITE_DESCRIPTION =
  "Nutrition built for one specific need at a time, with every active dose printed on the pack. From Nuvexa Biotech, Bengaluru.";

export const COMPANY = {
  legalName: "Nuvexa Biotech Pvt. Ltd.",
  email: "ceo@nuvexabio.com",
  street: "Amar Complex, above Bank of Baroda, Sarjapur Road, Indlabele, Attibele",
  locality: "Bengaluru",
  region: "Karnataka",
  postalCode: "562107",
  country: "IN",
} as const;

/** Absolute URL for a site path such as "/shop". */
export const absUrl = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/**
 * Per-page metadata with a canonical URL. Next replaces (does not merge) openGraph and twitter
 * objects from the layout, so the shared fields are repeated here.
 */
export function pageMeta(opts: { title: string; description: string; path: string; image?: { url: string; alt: string } }): Metadata {
  const { title, description, path, image } = opts;
  // Without an image of its own, a page reuses the default card from app/opengraph-image.tsx.
  const images = [image ?? { url: "/opengraph-image", width: 1200, height: 630, alt: `${SITE_NAME}: ${SITE_TAGLINE}` }];
  const social = `${title} · ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", locale: "en_IN", siteName: SITE_NAME, url: path, title: social, description, images },
    twitter: { card: "summary_large_image", title: social, description, images },
  };
}

/** Metadata for private, per-visitor pages (bag, checkout, account…): not indexed, links still followed. */
export function privateMeta(title: string, path: string): Metadata {
  return { title, alternates: { canonical: path }, robots: { index: false, follow: true } };
}
