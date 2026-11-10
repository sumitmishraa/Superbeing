/** Grey title band with the page's h1 ("Cart", "Wishlist"), plus an optional centred line under it. */
export function PageTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <>
      <h1 className="title-band">{title}</h1>
      {children && <div className="wrap flex justify-center pt-5">{children}</div>}
    </>
  );
}
