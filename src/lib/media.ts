import type { Product } from "@/data/products";

/** Pack renders made by tools/pack-studio. Coming-soon products only ever get an unbranded pack. */
export type PackView = "front" | "duo" | "back" | "macro";
export const TURN_FRAMES = 36;

const BLANK: Record<Product["shape"], string> = { carton: "carton", stick: "stick", melt: "melt", bottle: "bottle", tub: "bottle" };
const SACHET_SHAPES: Product["shape"][] = ["carton", "stick", "melt"];

export function packSrc(p: Product, view: PackView = "front") {
  if (p.status !== "live") return `/packs/_blank/${BLANK[p.shape]}.webp`;
  if (view === "duo" && !SACHET_SHAPES.includes(p.shape)) view = "front";
  return `/packs/${p.slug}/${view}.webp`;
}
export const hasDuo = (p: Product) => p.status === "live" && SACHET_SHAPES.includes(p.shape);
export const turnSrc = (p: Product, i: number) =>
  `/packs/${p.slug}/turn/${String(((i % TURN_FRAMES) + TURN_FRAMES) % TURN_FRAMES).padStart(2, "0")}.webp`;

export function packKind(p: Product) {
  return p.shape === "bottle" ? "tablet bottle" : p.shape === "tub" ? "softgel jar" : p.shape === "stick" ? "stick sachet" : p.shape === "melt" ? "mouth-melt sachet" : "sachet";
}
export function packAlt(p: Product, view: PackView = "front") {
  if (p.status !== "live") return `${p.name}: pack design in review`;
  const kind = packKind(p);
  if (view === "duo") return p.shape === "carton" ? `${p.name} carton with a single sachet` : `Three ${p.name} ${kind}s`;
  if (view === "back") return `Back of the ${p.name} ${kind}, listing every dose`;
  if (view === "macro") return `Close-up of the ${p.name} label`;
  return `${p.name} ${kind}`;
}

/** Key ingredient → picture. Plants are public-domain botanical plates; the rest are studio renders. */
const INGREDIENT_IMAGE: [RegExp, string][] = [
  [/peppermint/i, "plant-peppermint"],
  [/saffron|affron/i, "plant-saffron"],
  [/theanine/i, "plant-tea"],
  [/svetol/i, "plant-coffee"],
  [/larch/i, "plant-larch"],
  [/betaine/i, "plant-beet"],
  [/boswellia/i, "plant-boswellia"],
  [/cranberry/i, "plant-cranberry"],
  [/shilajit/i, "resin-dark"],
  [/pink salt/i, "salt-pink"],
  [/fish oil|life'sdha|algal dha|pumpkin seed oil|vitamin d3/i, "softgel-amber"],
  [/astaxanthin|astareal/i, "softgel-red"],
  [/iron|ferrochel/i, "powder-rust"],
  [/methylcobalamin/i, "powder-red"],
  [/ashwagandha|ksm-66|sensoril|shatavari|safed musli|gymnema|bacopa|bacognize|astragin|lion's mane/i, "powder-beige"],
  [/glucomannan|phgg|sunfiber/i, "powder-cream"],
  [/b\. |biogaia|lactospore|rosell|cerebiome|b-3|1714/i, "powder-pink"],
];
export function ingredientImage(name: string) {
  const hit = INGREDIENT_IMAGE.find(([re]) => re.test(name));
  return `/ingredients/${hit ? hit[1] : "powder-white"}.webp`;
}

/** The dose printed on the label for a key ingredient, matched by its first distinctive word. */
export function doseFor(p: Product, ingredient: string) {
  const words = ingredient
    .replace(/[®™]/g, "")
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);
  for (const key of words)
    for (const g of p.formula)
      for (const it of g.items)
        if (it.name.toLowerCase().replace(/[®™]/g, "").includes(key) && it.dose !== "Not disclosed") return it.dose;
  return null;
}

/** Public-domain plates used for ingredient pictures (credited in the footer). */
export const PLATE_CREDITS = [
  { label: "Köhler's Medizinal-Pflanzen (1887–1890)", href: "https://commons.wikimedia.org/wiki/Category:K%C3%B6hler%27s_Medizinal-Pflanzen" },
  { label: "Wild Flowers of New York, plate 158-A (1918)", href: "https://commons.wikimedia.org/wiki/File:Vaccinium_macrocarpon_WFNY-158A.jpg" },
];
