"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui";
import { gsap, reduceMotion } from "@/lib/gsap";

/**
 * One collapsible row on the product page ("Full label", "How to take"…). With an `id`, it also
 * opens itself when the URL hash points at it (the "View full label" link uses #label).
 */
export function Accordion({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  const [open, setOpen] = useState(false);
  const body = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = body.current;
    if (!el) return;
    if (open) gsap.set(el, { display: "block" });
    gsap.to(el, { height: open ? "auto" : 0, duration: reduceMotion() ? 0 : 0.5, ease: "expo.inOut", onComplete: () => void (!open && gsap.set(el, { display: "none" })) });
  }, [open]);

  useEffect(() => {
    if (!id) return;
    const openOnHash = () => window.location.hash === `#${id}` && setOpen(true);
    openOnHash();
    window.addEventListener("hashchange", openOnHash);
    return () => window.removeEventListener("hashchange", openOnHash);
  }, [id]);

  return (
    <div id={id} className="border-b border-line">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="label flex w-full items-center justify-between py-3.5 text-left">
        {title}
        <Icon.Chevron className={`size-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div ref={body} className="h-0 overflow-hidden" style={{ display: "none" }} inert={!open}>
        <div className="pb-5">{children}</div>
      </div>
    </div>
  );
}
