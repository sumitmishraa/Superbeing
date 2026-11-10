"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";

const ARROW = "absolute top-[38%] hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-snow text-charcoal shadow-sm transition-colors hover:border-accent hover:text-accent disabled:opacity-0 lg:grid";

/**
 * Horizontal carousel: a scroll-snap track that can also be dragged with a mouse, with arrows and
 * page dots on desktop. `perView` is the flex-basis class for each slide.
 */
export function Carousel({ children, label, perView = "basis-[72%] sm:basis-[45%] lg:basis-[23.5%]" }: { children: React.ReactNode[]; label: string; perView?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  // Page count and current page follow the track's scroll position and width.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => {
      setPages(Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth - 0.05)));
      setPage(Math.round(el.scrollLeft / el.clientWidth));
    };
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [children.length]);

  const scrollByPage = (direction: number) => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: Math.max(0, Math.min(el.scrollWidth, el.scrollLeft + direction * el.clientWidth)), behavior: "smooth" });
  };
  /** Restores snapping after a mouse drag turned it off. */
  const releaseSnap = () => {
    if (!track.current) return;
    track.current.style.scrollSnapType = "";
    track.current.style.scrollBehavior = "";
  };

  return (
    <div className="relative" role="region" aria-roledescription="carousel" aria-label={label}>
      <div
        ref={track}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth select-none"
        data-lenis-prevent-horizontal
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || !track.current) return;
          drag.current = { x: e.clientX, left: track.current.scrollLeft, moved: false };
          track.current.style.scrollSnapType = "none";
          track.current.style.scrollBehavior = "auto";
        }}
        onPointerMove={(e) => {
          if (!drag.current || !track.current) return;
          const dx = e.clientX - drag.current.x;
          if (Math.abs(dx) > 4) drag.current.moved = true;
          track.current.scrollLeft = drag.current.left - dx;
        }}
        onPointerUp={() => {
          releaseSnap();
          window.setTimeout(() => (drag.current = null), 0);
        }}
        onPointerLeave={() => {
          releaseSnap();
          drag.current = null;
        }}
        onClickCapture={(e) => {
          // A drag must not also open the card it ended on.
          if (drag.current?.moved) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {children.map((child, i) => (
          <div key={i} className={`shrink-0 snap-start ${perView}`}>
            {child}
          </div>
        ))}
      </div>
      {pages > 1 && (
        <>
          <button type="button" onClick={() => scrollByPage(-1)} className={`${ARROW} -left-3`} disabled={page === 0} aria-label="Previous">
            <Icon.ChevronLeft className="size-5" />
          </button>
          <button type="button" onClick={() => scrollByPage(1)} className={`${ARROW} -right-3`} disabled={page >= pages - 1} aria-label="Next">
            <Icon.ChevronRight className="size-5" />
          </button>
          <div className="mt-6 flex justify-center gap-2" aria-hidden>
            {Array.from({ length: pages }, (_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === page ? "w-6 bg-accent" : "w-1.5 bg-[#cfcacd]"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
