/** Numbered page buttons plus "Next". Page 1 is the URL without ?page. */
export function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (page: number) => void }) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pages" className="mt-14 flex items-center justify-center gap-2 border-t border-line pt-8">
      {Array.from({ length: pages }, (_, k) => k + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onPage(n)}
          aria-current={n === page ? "page" : undefined}
          className={`tnum grid size-10 place-items-center rounded-full text-[0.9375rem] ${n === page ? "bg-accent text-snow" : "text-charcoal hover:text-accent"}`}
        >
          {n}
        </button>
      ))}
      {page < pages && (
        <button type="button" onClick={() => onPage(page + 1)} className="ml-2 text-[0.9375rem] text-charcoal hover:text-accent">
          Next
        </button>
      )}
    </nav>
  );
}
