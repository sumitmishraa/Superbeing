"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/data/products";
import { TURN_FRAMES, packAlt, turnSrc } from "@/lib/media";
import { gsap, reduceMotion } from "@/lib/gsap";

/** Pixels of horizontal drag per frame. */
const PX_PER_FRAME = 9;

/**
 * Drag-to-turn pack built from 36 pre-rendered frames (tools/pack-studio). Plays one slow turn on
 * load so people see it moves; also turns with the arrow keys (it is an ARIA slider).
 */
export function Turntable({ p }: { p: Product }) {
  const [frame, setFrame] = useState(0);
  const [hint, setHint] = useState(true);
  const drag = useRef<{ x: number; f: number } | null>(null);
  const intro = useRef<gsap.core.Tween | null>(null);

  // Warm the cache, then play the intro turn.
  useEffect(() => {
    for (let i = 0; i < TURN_FRAMES; i++) new window.Image().src = turnSrc(p, i);
    if (reduceMotion()) return;
    const turn = { f: 0 };
    intro.current = gsap.to(turn, {
      f: TURN_FRAMES,
      duration: 2.6,
      ease: "power2.inOut",
      delay: 1,
      onUpdate: () => setFrame(Math.round(turn.f) % TURN_FRAMES),
    });
    return () => {
      intro.current?.kill();
    };
  }, [p]);

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={`Turn the ${p.name} pack`}
      aria-valuemin={0}
      aria-valuemax={TURN_FRAMES - 1}
      aria-valuenow={frame}
      aria-valuetext={`${Math.round((frame / TURN_FRAMES) * 360)} degrees`}
      className="absolute inset-0 cursor-grab touch-pan-y select-none active:cursor-grabbing"
      onPointerDown={(e) => {
        intro.current?.kill();
        drag.current = { x: e.clientX, f: frame };
        e.currentTarget.setPointerCapture(e.pointerId);
        setHint(false);
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        const df = Math.round((e.clientX - drag.current.x) / PX_PER_FRAME);
        setFrame((((drag.current.f - df) % TURN_FRAMES) + TURN_FRAMES) % TURN_FRAMES);
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      onKeyDown={(e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        intro.current?.kill();
        setHint(false);
        setFrame((f) => (f + (e.key === "ArrowRight" ? 1 : -1) + TURN_FRAMES) % TURN_FRAMES);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- frames swap on every pointer move; next/image would re-request each one */}
      <img src={turnSrc(p, frame)} alt={packAlt(p)} draggable={false} data-pack={p.slug} className="absolute inset-0 m-auto h-full w-full object-contain" />
      <span className={`label pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 text-graphite transition-opacity duration-500 ${hint ? "opacity-100" : "opacity-0"}`}>
        Drag to turn
      </span>
    </div>
  );
}
