import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/data/products";
import { absUrl } from "@/lib/site";

/** Public pages and every visible product. Coming-soon products are listed at a lower priority. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: absUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absUrl("/shop"), changeFrequency: "weekly", priority: 0.9 },
    { url: absUrl("/the-range"), changeFrequency: "monthly", priority: 0.7 },
    { url: absUrl("/contact"), changeFrequency: "yearly", priority: 0.4 },
  ];
  const products: MetadataRoute.Sitemap = PRODUCTS.map((p) => ({
    url: absUrl(`/products/${p.slug}`),
    changeFrequency: p.status === "live" ? "weekly" : "monthly",
    priority: p.status === "live" ? 0.8 : 0.3,
  }));
  return [...pages, ...products];
}
