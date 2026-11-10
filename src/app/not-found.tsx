import Link from "next/link";
import { PackMarquee } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="flex min-h-[78svh] flex-col justify-between gap-12 pt-16 pb-10" aria-labelledby="nf-title">
      <div className="wrap">
        <p className="crumbs">[404]</p>
        <h1 id="nf-title" className="h-hero mt-4">
          Not on
          <br />
          the label
        </h1>
        <p className="mt-6 max-w-[40ch] text-[1.0625rem] leading-snug">This page does not exist, or it moved. Every product is still in the shop.</p>
        <div className="mt-8 flex flex-wrap gap-2">
          <Link href="/shop" className="btn">
            Shop all products
          </Link>
          <Link href="/" className="btn btn-off">
            Home
          </Link>
        </div>
      </div>
      <PackMarquee height={150} />
    </section>
  );
}
