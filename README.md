# Superbeing Nutrition storefront

A frontend-only store for Superbeing Nutrition, laid out on the Ronas IT "perf." luxury ecommerce concept (Behance 253824053) and recoloured for Superbeing. Built with Next.js 16, Tailwind 4, GSAP (ScrollTrigger, Flip, SplitText) and Lenis. There is no backend: the cart, wishlist, account, orders and notify-me requests are saved in the visitor's browser (localStorage).

## Run it

```bash
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start   # production build
```

## Where things live

| What | Where |
| --- | --- |
| The catalogue (every product, claim, dose, safety line, price, need colour) | `src/data/products.ts` |
| Pack pictures and ingredient pictures, by product | `src/lib/media.ts` |
| Design tokens (four neutrals, Switzer type, buttons, fields) | `src/app/globals.css` |
| Motion setup (GSAP plugins, page entrances, Lenis) | `src/lib/gsap.ts`, `src/components/shell/Providers.tsx` |
| Header, needs menu, search, cart drawer, footer | `src/components/shell/` |
| Home sections | `src/components/home/HomeSections.tsx`, `Showcase.tsx` |
| Product page (turntable, dose bars, full label) | `src/components/product/ProductView.tsx` |
| Cart, checkout, login, account, wishlist, search | `src/components/commerce/` |
| Cart, wishlist and account state | `src/lib/store.ts` |

## Pack renders

Every pack picture is a 3D render made from the catalogue, not a photo. `tools/pack-studio/` builds each pack in three.js (pillow sachet and carton for powders, stick sachets, mouth-melt sachets, tablet bottles, the softgel jar). It prints the label from `products.ts`: the logo, the need colour, the rising band, the name, the active count and the full dose table on the back. Headless Chrome then renders it to `public/packs/<slug>/`:

- `front.webp`, `back.webp`, `duo.webp` (carton and sachet, or three sticks), `macro.webp` (label close-up)
- `turn/00–35.webp` (the drag-to-turn sequence on the product page)
- `_blank/` holds unbranded packs for products in label review

Re-render after changing a label, colour or formula:

```bash
node tools/pack-studio/render.mjs                         # every live product (about 15 minutes)
node tools/pack-studio/render.mjs --only hydra-move       # one product
node tools/pack-studio/render.mjs --only materials        # powder, softgel, tablet, salt and resin renders
```

Ingredient pictures in `public/ingredients/` are either those studio renders or public-domain botanical plates: Köhler's Medizinal-Pflanzen (1887–1890) and Wild Flowers of New York (1918), via Wikimedia Commons. Their sources are in `tools/pack-studio/plate-credits.json` and credited in the footer. The font is Switzer from Fontshare (free licence), kept in `src/fonts/`.

## Compliance rules built into the code

- Product copy comes only from the permitted claims in the Phase-1 brief, word for word.
- Products marked `coming-soon` show name and format only: no claims, no formula, an unbranded pack, and Notify me instead of Add to cart.
- Products marked `hidden` (the GLP Arc™ range, because GLP-linked naming is blocked) never appear anywhere.
- Safety statements, allergens and the veg or non-veg mark are always visible on the product page.
- There are no reviews or ratings, because the brand may not publish invented ones. The reference's rating histogram is a dose histogram instead.

## Must be done before launch

- **Prices are placeholders.** The brief has none. Edit `price` in `products.ts`.
- **Hydra pack counts** ("15 sticks") are placeholders. Confirm them with the brand team.
- **Payments.** Checkout takes pay-on-delivery orders only. UPI and card are shown as "At launch". Connect a payment gateway.
- **The affron® interaction warning** (StressCalm) uses interim wording and needs counsel's approved text.
- **The "Not an ORS" Hydra label** is left off because it conflicts with FSSAI's ban on "ORS".
- **Policies** are sample content: ₹999 free delivery, ₹79 below that, ₹149 express, 15% off monthly delivery, 7-day returns on unopened packs, and the FIRSTLABEL coupon.
- **Login is a preview.** Details stay in the browser. Connect real authentication.
- **The notify-me, contact and newsletter forms** send nothing. Wire them to email or a CRM.
- **Real photography** can replace the renders file by file in `public/packs/` (same names).
