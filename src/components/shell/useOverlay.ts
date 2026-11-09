"use client";

import { useEffect, useRef } from "react";
import { gsap, reduceMotion } from "@/lib/gsap";

type Kind = "drop" | "side";

/**
 * Shared open/close choreography for the menu, search and cart overlays.
 * The panel stays mounted (so its exit can play) but is inert and hidden while closed.
 * drop: clip-path reveals the panel from the top edge; side: the panel slides in from the right.
 */
export function useOverlay<T extends HTMLElement>(open: boolean, kind: Kind, onOpened?: (el: T) => void) {
  const panel = useRef<T>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const items = useRef<HTMLElement[]>([]);
  const returnFocus = useRef<HTMLElement | null>(null);
  const opened = useRef(onOpened);
  useEffect(() => {
    opened.current = onOpened;
  });

  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const instant = reduceMotion();
    const stagger = el.querySelectorAll<HTMLElement>("[data-overlay-item]");
    if (open) {
      returnFocus.current = document.activeElement as HTMLElement;
      el.removeAttribute("inert");
      gsap.set(el, { display: "", visibility: "visible" });
      if (scrim.current) gsap.set(scrim.current, { display: "" });
      if (scrim.current) gsap.to(scrim.current, { autoAlpha: 1, duration: instant ? 0 : 0.3 });
      const tl = gsap.timeline();
      if (kind === "drop") tl.fromTo(el, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: instant ? 0 : 0.75, ease: "expo.inOut" });
      else tl.fromTo(el, { xPercent: 100 }, { xPercent: 0, duration: instant ? 0 : 0.6, ease: "expo.out" });
      if (stagger.length && !instant) tl.from(stagger, { yPercent: 60, autoAlpha: 0, duration: 0.7, stagger: 0.045, ease: "expo.out" }, kind === "drop" ? 0.35 : 0.15);
      opened.current?.(el);
      return () => {
        tl.kill();
      };
    }
    if (el.style.visibility !== "visible") {
      el.setAttribute("inert", "");
      gsap.set(el, { visibility: "hidden", display: "none" });
      if (scrim.current) gsap.set(scrim.current, { display: "none" });
      return;
    }
    el.setAttribute("inert", "");
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(el, { visibility: "hidden", display: "none" });
        if (scrim.current) gsap.set(scrim.current, { display: "none" });
      },
    });
    if (scrim.current) tl.to(scrim.current, { autoAlpha: 0, duration: instant ? 0 : 0.25 }, 0);
    if (kind === "drop") tl.to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: instant ? 0 : 0.6, ease: "expo.inOut" }, 0);
    else tl.to(el, { xPercent: 100, duration: instant ? 0 : 0.45, ease: "expo.in" }, 0);
    returnFocus.current?.focus?.();
    return () => {
      tl.kill();
    };
  }, [open, kind]);

  return { panel, scrim, items };
}
