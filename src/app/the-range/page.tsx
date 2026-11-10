import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { JsonLd, faqLd } from "@/lib/jsonld";
import { CompareTable } from "@/features/range/CompareTable";
import { RangeFaq } from "@/features/range/RangeFaq";
import { RANGE_FAQ } from "@/features/range/faq";

export const metadata: Metadata = pageMeta({
  title: "The Range",
  description: "Every Superbeing formula side by side: format, serve, actives, veg mark and price. Plus answers to common questions.",
  path: "/the-range",
});

export default function RangePage() {
  return (
    <>
      <JsonLd data={faqLd(RANGE_FAQ.flatMap((g) => g.items))} />
      <div className="title-band">The Range</div>
      <CompareTable />
      <RangeFaq />
    </>
  );
}
