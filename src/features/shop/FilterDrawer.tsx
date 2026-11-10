"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { useOverlay } from "@/components/layout/useOverlay";
import { FORMATS, FILTER_KEYS, LINES, PRICES, SORTS, type FilterDraft, type FilterKey } from "./filters";

/**
 * Side drawer of filter checkboxes. Choices are a draft until Apply, and the Apply button shows how
 * many products the draft would leave.
 */

/** Collapsible group of checkboxes, open by default. */
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-line py-3">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between py-1 text-[1rem]">
        {title}
        <Icon.Chevron className={`size-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="pt-1 pb-1">{children}</div>}
    </div>
  );
}

function Check({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="check">
      <input type="checkbox" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

type FilterDrawerProps = {
  open: boolean;
  onClose: () => void;
  draft: FilterDraft;
  setDraft: React.Dispatch<React.SetStateAction<FilterDraft>>;
  /** Number of products the draft would show. */
  draftResults: number;
  onApply: () => void;
  sort: string;
  onSort: (sort: string) => void;
};

export function FilterDrawer({ open, onClose, draft, setDraft, draftResults, onApply, sort, onSort }: FilterDrawerProps) {
  const { panel, scrim } = useOverlay<HTMLDivElement>(open, "side", (el) => el.querySelector<HTMLElement>("[data-close]")?.focus());
  const draftCount = FILTER_KEYS.filter((k) => draft[k]).length;
  // Each group allows one value: ticking the ticked box clears it, ticking another replaces it.
  const toggle = (k: FilterKey, v: string) => setDraft((d) => ({ ...d, [k]: d[k] === v ? "" : v }));
  const box = (k: FilterKey, v: string, label: string) => <Check key={`${k}-${v}`} checked={draft[k] === v} onChange={() => toggle(k, v)} label={label} />;

  return (
    <>
      <div ref={scrim} style={{ display: "none" }} className="invisible fixed inset-0 z-50 bg-charcoal/40 opacity-0" onClick={onClose} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        style={{ display: "none" }}
        className="invisible fixed inset-y-0 right-0 z-50 flex w-[min(400px,100vw)] flex-col bg-snow"
        data-lenis-prevent
      >
        <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between px-5">
          <p className="h-section">Filters</p>
          <button type="button" data-close onClick={onClose} className="grid size-11 place-items-center" aria-label="Close filters">
            <Icon.Close className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5">
          <Group title="Format">{FORMATS.map((x) => box("format", x.id, x.label))}</Group>
          <Group title="Line">{LINES.map((x) => box("line", x.id, x.label))}</Group>
          <Group title="Price">{PRICES.map((x) => box("price", x.id, x.label))}</Group>
          <Group title="Diet">{box("diet", "veg", "Vegetarian only")}</Group>
          <Group title="Availability">
            {box("status", "live", "Available now")}
            {box("status", "coming-soon", "Coming soon")}
          </Group>
          {/* On phones the toolbar's sort menu is out of reach, so it is repeated here. */}
          <label className="mt-4 flex items-center justify-between text-[1rem] sm:hidden">
            Sort
            <select value={sort} onChange={(e) => onSort(e.target.value)} className="bg-transparent">
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid shrink-0 gap-2 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <button type="button" onClick={onApply} className="btn w-full">
            {draftCount ? `Apply ${draftCount} ${draftCount === 1 ? "filter" : "filters"}` : "Apply"} · {draftResults} {draftResults === 1 ? "product" : "products"}
          </button>
          {draftCount > 0 && (
            <button type="button" onClick={() => setDraft({})} className="min-h-11 text-[0.875rem] underline underline-offset-4">
              Clear all
            </button>
          )}
        </div>
      </div>
    </>
  );
}
