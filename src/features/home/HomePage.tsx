"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { Hero } from "./Hero";
import { IngredientStrip } from "./IngredientStrip";
import { Categories } from "./Categories";
import { MadeForYourDay } from "./MadeForYourDay";
import { NewFeature } from "./NewFeature";
import { Featured } from "./Featured";
import { Pillars } from "./Pillars";
import { LabelBanner } from "./LabelBanner";
import { Counters } from "./Counters";
import { CompareBanner } from "./CompareBanner";
import { Marquee } from "./Marquee";
import { RealDays } from "./RealDays";

/** The home page, top to bottom. Each section lives in its own file in this folder. */
export function HomePage() {
  // Images above load late and shift the page; re-measure scroll-triggered animations once they have.
  useEffect(() => {
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 600);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      <Hero />
      <IngredientStrip />
      <Categories />
      <MadeForYourDay />
      <NewFeature />
      <Featured />
      <Pillars />
      <LabelBanner />
      <Counters />
      <CompareBanner />
      <Marquee />
      <RealDays />
    </>
  );
}
