"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { NEED_BY_ID, PRODUCT_BY_SLUG, doseCount } from "@/data/products";
import { TURN_FRAMES, packAlt, turnSrc } from "@/lib/media";
import { reduceMotion } from "@/lib/gsap";
import { Carousel } from "@/components/ui";

/** "Made for your day": portrait cards whose packs spin on their own while on screen. */

const SLUGS = ["night-recovery-magnesium", "hydra-move", "stresscalm-nutrition", "collagen-glow-matrix", "bloat-gut-reset"];
const FRAME_MS = 90;

/** One card: steps through the 36 turntable frames while it is in view. */
function TurnCard({ slug }: { slug: string }) {
  const p = PRODUCT_BY_SLUG[slug];
  const need = NEED_BY_ID[p.need];
  const [frame, setFrame] = useState(0);
  const card = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!card.current || reduceMotion()) return;
    for (let k = 0; k < TURN_FRAMES; k++) new window.Image().src = turnSrc(p, k);
    let timer = 0;
    const io = new IntersectionObserver(([entry]) => {
      window.clearInterval(timer);
      if (entry.isIntersecting) timer = window.setInterval(() => setFrame((n) => (n + 1) % TURN_FRAMES), FRAME_MS);
    });
    io.observe(card.current);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, [p]);

  return (
    <Link ref={card} href={`/products/${p.slug}`} className="group relative block aspect-[9/14] overflow-hidden rounded-2xl" style={{ background: need.colour }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- frames swap every 90 ms; next/image would re-request each one */}
      <img src={turnSrc(p, frame)} alt={packAlt(p)} className="absolute inset-0 m-auto h-[78%] w-[78%] object-contain" loading="lazy" />
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-5 pt-16 text-snow">
        <span className="block font-display text-[1.25rem] font-semibold">{p.name}</span>
        <span className="text-[0.875rem]">{doseCount(p)} actives, every dose shown</span>
      </span>
    </Link>
  );
}

export function MadeForYourDay() {
  return (
    <section className="wrap pt-16 md:pt-24" aria-labelledby="day-title">
      <h2 id="day-title" className="sec-title" data-rise>
        Made for your day
      </h2>
      <p className="mt-3 text-center text-[0.9375rem] text-graphite italic">Turn any pack around: the full formula is on the back</p>
      <div className="mt-10">
        <Carousel label="Made for your day" perView="basis-[64%] sm:basis-[40%] lg:basis-[23.5%]">
          {SLUGS.map((slug) => (
            <TurnCard key={slug} slug={slug} />
          ))}
        </Carousel>
      </div>
    </section>
  );
}
