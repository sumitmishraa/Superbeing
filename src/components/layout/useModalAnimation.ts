"use client";

import { useEffect, useRef } from "react";
import { gsap, reduceMotion } from "@/lib/gsap";

/** Entrance for the centred modals (Quick shop, newsletter): the scrim fades in, the box scales up. Attach the refs. */
export function useModalAnimation(open: boolean) {
  const box = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open || reduceMotion()) return;
    if (scrim.current) gsap.fromTo(scrim.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
    if (box.current) gsap.fromTo(box.current, { autoAlpha: 0, scale: 0.94, y: 20 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.6, ease: "expo.out" });
  }, [open]);
  return { box, scrim };
}
