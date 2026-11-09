import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCTS, PRODUCT_BY_SLUG } from "@/data/products";
import { ProductView } from "@/components/product/ProductView";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = PRODUCT_BY_SLUG[slug];
  if (!p) return { title: "Not found" };
  return {
    title: p.name,
    description: p.status === "live" ? `${p.tagline} ${p.packCount}. Every active dose printed on the label.` : `${p.name}. Coming soon.`,
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const p = PRODUCT_BY_SLUG[slug];
  if (!p) notFound();
  return <ProductView slug={p.slug} />;
}
