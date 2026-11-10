import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NEED_BY_ID, PRODUCTS, PRODUCT_BY_SLUG } from "@/data/products";
import { ProductView } from "@/features/product/ProductView";
import { JsonLd, breadcrumbLd, productLd } from "@/lib/jsonld";
import { packAlt, plinthSrc } from "@/lib/media";
import { pageMeta } from "@/lib/site";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = PRODUCT_BY_SLUG[slug];
  if (!p) return { title: "Not found", robots: { index: false } };
  return pageMeta({
    title: p.name,
    // Coming-soon products publish name and format only.
    description: p.status === "live" ? `${p.tagline} ${p.packCount}. Every active dose printed on the label.` : `${p.name}. ${p.format}. Coming soon.`,
    path: `/products/${p.slug}`,
    image: { url: plinthSrc(p), alt: packAlt(p) },
  });
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const p = PRODUCT_BY_SLUG[slug];
  if (!p) notFound();
  return (
    <>
      <JsonLd
        data={[
          productLd(p),
          breadcrumbLd([
            ["Home", "/"],
            [NEED_BY_ID[p.need].name, `/shop?need=${p.need}`],
            [p.name, `/products/${p.slug}`],
          ]),
        ]}
      />
      <ProductView slug={p.slug} />
    </>
  );
}
