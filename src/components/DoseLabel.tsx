import { type Product } from "@/data/products";

/** The back of the pack as a table: every active, every dose, per serve. */
export function DoseLabel({ product: p, className = "" }: { product: Product; className?: string }) {
  const hasProprietary = p.formula.some((g) => g.items.some((i) => i.dose === "Not disclosed"));
  return (
    <div className={className} data-label>
      <p className="text-[0.8125rem] text-graphite">
        Per serve: {p.serve}. {p.packCount}.
      </p>
      <table className="mt-3 w-full border-collapse text-[0.9375rem]">
        <caption className="sr-only">Formula of {p.name}, amount per serve</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Active</th>
            <th scope="col">Per serve</th>
          </tr>
        </thead>
        {p.formula.map((g) => (
          <tbody key={g.group}>
            <tr>
              <th scope="rowgroup" colSpan={2} className="label pt-4 pb-1 text-left font-normal text-graphite">
                {g.group}
              </th>
            </tr>
            {g.items.map((i) => (
              <tr key={i.name} className="border-b border-line">
                <th scope="row" className="py-2 pr-4 text-left font-normal">
                  {i.name}
                </th>
                <td className={`tnum py-2 text-right whitespace-nowrap ${i.dose === "Not disclosed" ? "text-graphite" : ""}`}>
                  {i.dose === "Not disclosed" ? "Proprietary" : i.dose}
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
      <p className="mt-3 text-[0.8125rem] text-graphite">
        {hasProprietary
          ? "One proprietary complex is listed by name. Its dose is not disclosed; every other active is."
          : "Nothing hidden in a blend. Every active is listed with its dose."}
      </p>
    </div>
  );
}
