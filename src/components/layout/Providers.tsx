"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { gsap, ScrollTrigger, SplitText, reduceMotion } from "@/lib/gsap";

/**
 * Page-wide behaviour around every route: smooth scroll (Lenis on GSAP's ticker), scroll lock while
 * an overlay is open, reset on navigation, scroll entrances and keyboard shortcuts.
 * Entrances are opt-in markers, and everything is visible without script:
 *   [data-split]    heading rises line by line from a mask
 *   [data-rise]     block fades up (value = delay in seconds)
 *   [data-stagger]  its children rise in sequence
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenis = useSmoothScroll();
  useScrollLockWhileOverlayOpen(lenis);
  useResetOnNavigate(lenis, pathname);
  useScrollEntrances(pathname);
  useKeyboardShortcuts();
  return <>{children}</>;
}

/** Lenis smooth scrolling for mouse and trackpad. Touch devices and reduced motion keep native scrolling. */
function useSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
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
  return lenisRef;
}

/** Stops the page scrolling behind the cart, search, menu or Quick shop. */
function useScrollLockWhileOverlayOpen(lenis: React.RefObject<Lenis | null>) {
  const cartOpen = useStore((s) => s.cartOpen);
  const searchOpen = useStore((s) => s.searchOpen);
  const menuOpen = useStore((s) => s.menuOpen);
  const quickShop = useStore((s) => s.quickShop);
  useEffect(() => {
    const locked = cartOpen || searchOpen || menuOpen || !!quickShop;
    if (locked) lenis.current?.stop();
    else lenis.current?.start();
    document.documentElement.style.overflow = locked ? "hidden" : "";
  }, [lenis, cartOpen, searchOpen, menuOpen, quickShop]);
}

/** On every route change: jump to the top and close any open overlay. */
function useResetOnNavigate(lenis: React.RefObject<Lenis | null>, pathname: string) {
  useEffect(() => {
    lenis.current?.scrollTo(0, { immediate: true });
    closeAllOverlays();
  }, [lenis, pathname]);
}

/** Runs the [data-split], [data-rise] and [data-stagger] entrances for the current page. */
function useScrollEntrances(pathname: string) {
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
}

/** Ctrl/Cmd+K or "/" (outside a text field) opens search; Escape closes every overlay. */
function useKeyboardShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        useStore.getState().setSearchOpen(true);
      }
      if (e.key === "Escape") closeAllOverlays();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

function closeAllOverlays() {
  const s = useStore.getState();
  s.setCartOpen(false);
  s.setSearchOpen(false);
  s.setMenuOpen(false);
  s.setQuickShop(null);
}
