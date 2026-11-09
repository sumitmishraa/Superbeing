"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { gsap, ScrollTrigger, SplitText, reduceMotion } from "@/lib/gsap";

/**
 * Smooth scroll (Lenis on GSAP's ticker), page-wide entrances and shortcuts.
 * Entrances are opt-in markers and everything is visible without script:
 *   [data-split]    heading rises line by line from a mask
 *   [data-rise]     block fades up (value = delay in seconds)
 *   [data-stagger]  its children rise in sequence
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const cartOpen = useStore((s) => s.cartOpen);
  const searchOpen = useStore((s) => s.searchOpen);
  const menuOpen = useStore((s) => s.menuOpen);

  useEffect(() => {
    if (reduceMotion() || window.matchMedia("(pointer: coarse)").matches) return;
    const lenis = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 4), wheelMultiplier: 0.95 });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const locked = cartOpen || searchOpen || menuOpen;
    if (locked) lenisRef.current?.stop();
    else lenisRef.current?.start();
    document.documentElement.style.overflow = locked ? "hidden" : "";
  }, [cartOpen, searchOpen, menuOpen]);

  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
    const s = useStore.getState();
    s.setCartOpen(false);
    s.setSearchOpen(false);
    s.setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (reduceMotion()) return;
    const ctx = gsap.context(() => {
      document.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 105,
              duration: 1.05,
              stagger: 0.07,
              ease: "expo.out",
              scrollTrigger: { trigger: el, start: "top 92%", once: true },
            }),
        });
      });
      document.querySelectorAll<HTMLElement>("[data-rise]").forEach((el) => {
        gsap.from(el, {
          autoAlpha: 0,
          y: 28,
          duration: 0.9,
          delay: Number(el.dataset.rise) || 0,
          scrollTrigger: { trigger: el, start: "top 94%", once: true },
        });
      });
      document.querySelectorAll<HTMLElement>("[data-stagger]").forEach((el) => {
        gsap.from(el.children, {
          autoAlpha: 0,
          y: 36,
          duration: 0.9,
          stagger: 0.06,
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        });
      });
    });
    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => {
      window.clearTimeout(refresh);
      ctx.revert();
    };
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        useStore.getState().setSearchOpen(true);
      }
      if (e.key === "Escape") {
        const s = useStore.getState();
        s.setSearchOpen(false);
        s.setCartOpen(false);
        s.setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return <>{children}</>;
}
