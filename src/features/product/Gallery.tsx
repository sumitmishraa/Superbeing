"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { NEED_BY_ID, type Product } from "@/data/products";
import { hasDuo, ingredientImage, packAlt, packSrc, plinthSrc, type PackView } from "@/lib/media";
import { gsap, reduceMotion, useGSAP } from "@/lib/gsap";
import { Turntable } from "./Turntable";

/**
 * Product picture column: the main view (plinth shot, 360° turntable, back, duo or label close-up)
 * with thumbnail tabs under it. Key-ingredient pictures float around the pack and drift with the pointer.
 */

type View = PackView | "turn" | "plinth";

/** Where the floating ingredient pictures sit, in key-ingredient order. */
const INGREDIENT_SPOTS = ["left-[2%] bottom-[6%] w-[26%]", "right-[3%] top-[8%] w-[20%]", "right-[1%] bottom-[12%] w-[22%]", "left-[4%] top-[14%] w-[17%]"];

function viewsFor(p: Product): { id: View; label: string }[] {
  if (p.status !== "live") return [];
  return [
    { id: "plinth", label: "Pack" },
    { id: "turn", label: "Turn the pack (360 degrees)" },
    { id: "back", label: "Back of pack" },
    ...(hasDuo(p) ? [{ id: "duo" as const, label: p.shape === "carton" ? "Carton and sachet" : "Three sachets" }] : []),
    { id: "macro", label: "Label close-up" },
  ];
}

export function Gallery({ p }: { p: Product }) {
  const need = NEED_BY_ID[p.need];
  const live = p.status === "live";
  const [view, setView] = useState<View>("plinth");
  const stage = useRef<HTMLDivElement>(null);
  const keys = live ? p.keyIngredients.slice(0, 4) : [];
  const views = viewsFor(p);

  // Ingredients float in around the pack and drift with the pointer.
  useGSAP(
    () => {
      if (reduceMotion() || !stage.current) return;
      const el = stage.current;
      gsap.from("[data-ing]", { scale: 0.6, autoAlpha: 0, y: 30, duration: 1.2, stagger: 0.1, ease: "expo.out", delay: 0.4 });
      const items = gsap.utils.toArray<HTMLElement>("[data-ing]");
      const moveX = items.map((it) => gsap.quickTo(it, "x", { duration: 1.2, ease: "power3.out" }));
      const moveY = items.map((it) => gsap.quickTo(it, "y", { duration: 1.2, ease: "power3.out" }));
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        items.forEach((_, i) => {
          moveX[i](nx * (14 + i * 9));
          moveY[i](ny * (14 + i * 9));
        });
      };
      el.addEventListener("pointermove", onMove);
      return () => el.removeEventListener("pointermove", onMove);
    },
    { scope: stage, dependencies: [p.slug] },
  );

  return (
    <div className="flex flex-col md:col-span-6">
      {views.length > 1 && (
        <div className="order-2 mt-3 flex justify-center gap-2" role="tablist" aria-label="Pack views">
          {views.map((v) => (
            <button
              key={v.id}
              type="button"
              role="tab"
              aria-selected={view === v.id}
              aria-label={v.label}
              onClick={() => setView(v.id)}
              className={`relative size-14 overflow-hidden rounded-md border transition-all md:size-[72px] ${view === v.id ? "border-accent opacity-100" : "border-line opacity-60 hover:opacity-100"}`}
              style={v.id === "macro" ? { background: need.shade } : undefined}
            >
              <Image
                src={v.id === "plinth" ? plinthSrc(p) : packSrc(p, v.id === "turn" ? "front" : v.id)}
                alt=""
                fill
                sizes="72px"
                className={v.id === "macro" || v.id === "plinth" ? "object-cover" : "object-contain"}
              />
            </button>
          ))}
        </div>
      )}
      <div ref={stage} className="relative order-1 aspect-square overflow-hidden rounded-lg bg-snow" style={view === "macro" ? { background: need.shade } : undefined}>
        {view === "plinth" ? (
          <Image key="plinth" src={plinthSrc(p)} alt={packAlt(p)} fill priority sizes="(min-width:768px) 50vw, 100vw" data-pack={p.slug} className="object-cover motion-safe:animate-[fadein_.5s_ease-out]" />
        ) : view === "turn" && live ? (
          <div className="absolute inset-[6%_14%]">
            <Turntable p={p} />
          </div>
        ) : (
          <Image
            key={view}
            src={packSrc(p, view as PackView)}
            alt={packAlt(p, view as PackView)}
            fill
            priority
            sizes="(min-width:768px) 55vw, 100vw"
            data-pack={p.slug}
            className={`${view === "macro" ? "object-cover" : "object-contain p-[8%]"} motion-safe:animate-[fadein_.5s_ease-out]`}
          />
        )}
        {view !== "macro" &&
          view !== "plinth" &&
          keys.map((k, i) => (
            <div key={k} data-ing className={`pointer-events-none absolute aspect-square ${INGREDIENT_SPOTS[i]}`} aria-hidden>
              <Image src={ingredientImage(k)} alt="" fill sizes="15vw" className="object-contain" />
            </div>
          ))}
      </div>
    </div>
  );
}
