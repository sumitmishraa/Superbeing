/**
 * Superbeing Phase-1 catalogue — single source of truth.
 * Source: SUPERBEING_Phase-1_Portfolio_Marketing_Brief_02.11.2026 (SKU Portfolio + Claims & Guardrails).
 *
 * Compliance rules for anyone editing this file:
 * - `claims` are copied verbatim from the "Permitted Claims" column. Marketing copy may only restate them.
 * - Never add "NOT permitted" language, competitor names or GLP-1 drug names anywhere in the site.
 * - `coming-soon` products render name and format only: no claims, no formula, no pack artwork, no add-to-cart.
 * - `hidden` products (GLP Arc™ range: GLP-linked naming is blocked pending regulatory opinion) never render.
 * - Blocked per the Superbeing compliance check: U05, U10, U12, U15, U16–U18, W02, M01, M03.
 * - PRICES ARE PLACEHOLDERS (the brief has none). Hydra pack counts are placeholders too.
 */

export type NeedId =
  | "gut"
  | "sleep"
  | "stress"
  | "foundational"
  | "weight"
  | "hydration"
  | "glp"
  | "beauty"
  | "womens"
  | "overnight"
  | "muscle";

export type Line = "everyone" | "women" | "men";
export type PackShape = "carton" | "stick" | "bottle" | "tub" | "melt";
export type Diet = "veg" | "vegan" | "non-veg";
export type Status = "live" | "coming-soon";

export interface Active {
  name: string;
  dose: string;
}

export interface FormulaGroup {
  group: string;
  items: Active[];
}

export interface Product {
  code: string;
  slug: string;
  name: string;
  line: Line;
  need: NeedId;
  status: Status;
  /** One honest line, restating a permitted claim. Empty for coming-soon. */
  tagline: string;
  /** Who it is for, in plain words. Never disease language. */
  forWho: string;
  claims: string[];
  format: string;
  shape: PackShape;
  serve: string;
  howToTake: string;
  packCount: string;
  days: number;
  price: number;
  diet: Diet;
  allergens: string[];
  /** Mandatory label and safety statements, shown in full on the product page. */
  safety: string[];
  /** Why it is different, from the brief's USP column. */
  difference: string;
  formula: FormulaGroup[];
  /** Branded ingredients worth naming in cards and search. */
  keyIngredients: string[];
  availabilityNote?: string;
  /** Shown on cards and pack fronts where the brief makes it mandatory at every touchpoint. */
  frontOfPackNote?: string;
  /** Not shown anywhere on the site (e.g. naming under regulatory review). */
  hidden?: boolean;
  trialPack?: { packCount: string; price: number };
}

export interface Need {
  id: NeedId;
  name: string;
  short: string;
  colour: string;
  /** Darker partner tone for the pack side face. */
  shade: string;
  /** Text colour that reads on `colour`. */
  ink: string;
  question: string;
}

const ALL_NEEDS: Need[] = [
  { id: "gut", name: "Gut & digestion", short: "Gut", colour: "#A7BC8E", shade: "#869C6C", ink: "#131313", question: "Bloating after meals, or not enough fibre in the day?" },
  { id: "sleep", name: "Sleep & recovery", short: "Sleep", colour: "#8F9CC6", shade: "#7180AE", ink: "#131313", question: "Trouble winding down, or waking up still tired?" },
  { id: "stress", name: "Stress & focus", short: "Stress", colour: "#D9946A", shade: "#BF774D", ink: "#131313", question: "Wired all day, or foggy after forty?" },
  { id: "foundational", name: "Daily foundations", short: "Foundations", colour: "#E2BE57", shade: "#C9A33A", ink: "#131313", question: "A vegetarian plate with gaps you can name?" },
  { id: "weight", name: "Weight management", short: "Weight", colour: "#CDB994", shade: "#B39E77", ink: "#131313", question: "Want to feel fuller at meals?" },
  { id: "hydration", name: "Hydration", short: "Hydration", colour: "#86C3CA", shade: "#62A7B0", ink: "#131313", question: "Indian heat, heavy sweat, or no sugar at all?" },
  { id: "glp", name: "GLP Arc™ system", short: "GLP Arc™", colour: "#9FA8A2", shade: "#838C86", ink: "#131313", question: "Working through a weight programme in three stages?" },
  { id: "beauty", name: "Hair, skin & beauty", short: "Hair & skin", colour: "#E9A9B8", shade: "#D18A9C", ink: "#131313", question: "More hair in the brush, or skin that feels dry?" },
  { id: "womens", name: "Women's health", short: "Women's health", colour: "#B5677F", shade: "#984D64", ink: "#FFFFFF", question: "Iron and nutrition across your monthly cycle?" },
  { id: "overnight", name: "Overnight metabolic", short: "Overnight", colour: "#4E5788", shade: "#3B4370", ink: "#FFFFFF", question: "Late-night cravings and restless sleep?" },
  { id: "muscle", name: "Muscle & strength", short: "Muscle", colour: "#A8603F", shade: "#8B4A2D", ink: "#FFFFFF", question: "Training hard and recovering slowly?" },
];

export const NEED_BY_ID = Object.fromEntries(ALL_NEEDS.map((n) => [n.id, n])) as Record<NeedId, Need>;

/** Needs that have at least one product on the site. */
export const NEEDS = ALL_NEEDS.filter((n) => n.id !== "glp");

const IMMUNO = "If you are immunocompromised, consult your doctor before use (contains live cultures).";
const IRON_BOX =
  "Accidental overdose of iron-containing products is a leading cause of fatal poisoning in children under 6. Keep out of reach of children. Child-resistant closure.";

const ALL_PRODUCTS: Product[] = [
  {
    code: "U01",
    slug: "bloat-gut-reset",
    name: "Bloat + Gut Reset™",
    line: "everyone",
    need: "gut",
    status: "live",
    tagline: "Helps reduce bloating and supports digestive comfort.",
    forWho: "For post-meal bloating, gas and heaviness after big or rich meals, including people who don't get on with high-FODMAP fibres.",
    claims: [
      "Supports gut health",
      "Helps reduce bloating",
      "Supports digestive comfort",
      "Prebiotic fibre — Low FODMAP",
      "Supports beneficial gut bacteria",
    ],
    format: "Powder sachet, stirred into 200ml water, with a mild fizz",
    shape: "carton",
    serve: "One sachet, about 16–18g",
    howToTake: "Once a day after your main meal. Evening works best.",
    packCount: "30 sachets",
    days: 30,
    price: 1499,
    trialPack: { packCount: "15 sachets", price: 799 },
    diet: "veg",
    allergens: ["Guar gum (legume)"],
    safety: ["Enzyme activity units are declared on the label.", "Sodium about 55mg per serve."],
    difference:
      "Ten actives in one evening drink: a Low-FODMAP certified fibre, BioGaia's branded L. reuteri pair and peppermint oil that is released in the gut, not the stomach. Every dose and every enzyme activity unit is on the label.",
    keyIngredients: ["Sunfiber® PHGG", "BioGaia Gastrus®", "Peppermint oil", "Zinc L-Carnosine"],
    formula: [
      { group: "Fibre base", items: [{ name: "Sunfiber® PHGG (Low-FODMAP certified)", dose: "6,000mg" }] },
      { group: "Probiotic", items: [{ name: "BioGaia Gastrus® L. reuteri DSM 17938 + ATCC PTA 6475", dose: "10B CFU" }] },
      {
        group: "Comfort layer",
        items: [
          { name: "Enteric-coated peppermint oil (L-menthol ≥30%)", dose: "360mg" },
          { name: "Ginger (≥5% gingerols)", dose: "500mg" },
          { name: "Fennel (≥2% fenchone)", dose: "300mg" },
        ],
      },
      {
        group: "Lining and colon",
        items: [
          { name: "Zinc L-Carnosine", dose: "75mg" },
          { name: "Microencapsulated sodium butyrate", dose: "300mg" },
        ],
      },
      {
        group: "Digestive enzymes",
        items: [
          { name: "Protease", dose: "50,000 HUT" },
          { name: "Amylase", dose: "10,000 DU" },
          { name: "Lipase", dose: "1,000 FIP" },
          { name: "Lactase", dose: "1,000 ALU" },
          { name: "Cellulase", dose: "600 CU" },
        ],
      },
      {
        group: "Also",
        items: [
          { name: "Sodium bicarbonate", dose: "200mg" },
          { name: "Superbeing Premix SB-01", dose: "50mg" },
        ],
      },
    ],
  },
  {
    code: "U02",
    slug: "daily-fibre-gap",
    name: "Daily Fibre Gap™",
    line: "everyone",
    need: "gut",
    status: "live",
    tagline: "Prebiotic fibre for gut health and bowel regularity.",
    forWho: "For anyone who doesn't eat enough fibre and wants one that dissolves clear, without grit.",
    claims: [
      "Supports microbiome diversity",
      "Prebiotic fibre for gut health",
      "Supports healthy digestion and bowel regularity",
      "Supports visceral fat and metabolic health",
    ],
    format: "Powder sachet, stirred into 200ml water, near-neutral taste",
    shape: "carton",
    serve: "One sachet, about 10–12g",
    howToTake: "Once a day after your main meal. Evening works best.",
    packCount: "30 sachets",
    days: 30,
    price: 1199,
    diet: "veg",
    allergens: ["Guar gum (legume)", "Cranberry"],
    safety: [],
    difference:
      "Two different prebiotic fibres, a Japanese B. breve strain and cranberry and Triphala polyphenols. It clears in under a minute, because a daily habit only works if you keep it.",
    keyIngredients: ["Sunfiber® PHGG", "Morinaga B. breve B-3", "Larch arabinogalactan", "Cranberry PAC"],
    formula: [
      {
        group: "Two-fibre base",
        items: [
          { name: "Sunfiber® PHGG", dose: "5,000mg" },
          { name: "Larch arabinogalactan (≥75%)", dose: "2,000mg" },
        ],
      },
      { group: "Probiotic", items: [{ name: "B. breve B-3 (Morinaga)", dose: "10B CFU" }] },
      {
        group: "Polyphenols",
        items: [
          { name: "Cranberry PAC (A-type)", dose: "36mg" },
          { name: "Triphala (≥40% tannins)", dose: "200mg" },
        ],
      },
      {
        group: "Also",
        items: [
          { name: "Zinc bisglycinate (elemental)", dose: "~10mg" },
          { name: "Superbeing Premix SB-01", dose: "50mg" },
        ],
      },
    ],
  },
  {
    code: "U03",
    slug: "gut-brain-nutrition",
    name: "Gut-Brain Nutrition™",
    line: "everyone",
    need: "gut",
    status: "live",
    tagline: "Supports the gut-brain connection, mood and digestive comfort.",
    forWho: "For people whose stressful days show up in their digestion, and who find it hard to switch off.",
    claims: ["Supports gut-brain connection", "Supports mood and digestive comfort", "Supports healthy stress response"],
    format: "Powder sachet, stirred into water",
    shape: "carton",
    serve: "One sachet",
    howToTake: "Once a day.",
    packCount: "30 sachets",
    days: 30,
    price: 1599,
    diet: "veg",
    allergens: [],
    safety: [
      "Do not combine with prescription sedatives, barbiturates or benzodiazepines.",
      "If you take prescription medicines, consult your doctor before use.",
      IMMUNO,
    ],
    difference:
      "A branded psychobiotic strain, B. longum 1714™, with Suntheanine® and Sensoril® in one sachet. It works on the gut and the stress response together, instead of selling a probiotic or an adaptogen on its own.",
    keyIngredients: ["Suntheanine®", "Sensoril®", "B. longum 1714™", "LactoSpore®"],
    formula: [
      {
        group: "Calm layer",
        items: [
          { name: "Suntheanine® L-Theanine", dose: "200mg" },
          { name: "Sensoril® ashwagandha (≥10% withanolides)", dose: "300mg" },
          { name: "Lemon balm", dose: "150mg" },
          { name: "Passionflower (≥4% vitexin)", dose: "200mg" },
        ],
      },
      {
        group: "Psychobiotic pair",
        items: [
          { name: "LactoSpore® MTCC 5856", dose: "2B CFU" },
          { name: "B. longum 1714™", dose: "1B CFU" },
        ],
      },
      {
        group: "Support",
        items: [
          { name: "Montmorency tart cherry", dose: "400mg" },
          { name: "Magnesium L-threonate", dose: "50mg" },
          { name: "PHGG prebiotic fibre", dose: "2,000mg" },
          { name: "Piperine", dose: "5mg" },
          { name: "Superbeing Premix SB-01", dose: "50mg" },
        ],
      },
    ],
  },
  {
    code: "U04",
    slug: "night-recovery-magnesium",
    name: "Night Recovery Magnesium™",
    line: "everyone",
    need: "sleep",
    status: "live",
    tagline: "Supports sleep quality and overnight muscle recovery.",
    forWho: "For nights when winding down is hard and muscles feel tight, from a magnesium drink that doesn't taste metallic.",
    claims: ["Supports sleep quality", "Provides magnesium for muscle function", "Supports overnight muscle recovery"],
    format: "Powder sachet, stirred into warm water (60–70°C). Cardamom rose.",
    shape: "carton",
    serve: "One sachet, about 8–9g",
    howToTake: "Once a day, before bed.",
    packCount: "30 sachets",
    days: 30,
    price: 1299,
    diet: "veg",
    allergens: [],
    safety: [
      "Do not exceed the recommended serving.",
      "Do not combine with prescription sleep medication without medical advice.",
      IMMUNO,
    ],
    difference:
      "A full 300mg of elemental magnesium from Albion's TRAACS® chelate, in a warm drink with 3g glycine and a psychobiotic pair. A bedtime ritual, not just a mineral tablet.",
    keyIngredients: ["TRAACS® Magnesium Bisglycinate", "Glycine", "Suntheanine®", "Rosell®-52"],
    formula: [
      { group: "Mineral core", items: [{ name: "TRAACS® magnesium bisglycinate (elemental)", dose: "300mg" }] },
      {
        group: "Sleep support",
        items: [
          { name: "Glycine", dose: "3,000mg" },
          { name: "Suntheanine® L-Theanine", dose: "200mg" },
          { name: "Montmorency tart cherry (≥1% anthocyanins)", dose: "400mg" },
          { name: "Vitamin B6 (P-5-P)", dose: "5mg" },
        ],
      },
      {
        group: "Psychobiotic pair",
        items: [
          { name: "Rosell®-52", dose: "3B CFU" },
          { name: "Rosell®-175", dose: "1B CFU" },
        ],
      },
      { group: "Also", items: [{ name: "Superbeing Premix SB-01", dose: "50mg" }] },
    ],
  },
  {
    code: "U05",
    slug: "deep-sleep-mouth-melt",
    name: "Deep Sleep Nutrition™ Mouth Melt",
    line: "everyone",
    need: "sleep",
    status: "coming-soon",
    tagline: "",
    forWho: "A no-water bedtime format, still in development.",
    claims: [],
    format: "Mouth melt sachet, no water needed",
    shape: "melt",
    serve: "One sachet",
    howToTake: "",
    packCount: "30 sachets",
    days: 30,
    price: 1399,
    diet: "veg",
    allergens: [],
    safety: [],
    difference: "",
    keyIngredients: [],
    formula: [],
    availabilityNote: "In development. We'll release it only once the format passes its trials.",
  },
  {
    code: "U06",
    slug: "stresscalm-nutrition",
    name: "StressCalm Nutrition™",
    line: "everyone",
    need: "stress",
    status: "live",
    tagline: "Supports stress resilience and calm, morning and evening.",
    forWho: "For days that start wired and stay that way into the evening.",
    claims: [
      "Supports stress resilience and calm",
      "Contains KSM-66® Ashwagandha for cortisol management",
      "Contains affron® Saffron extract for mood support",
    ],
    format: "Film-coated tablet",
    shape: "bottle",
    serve: "Two tablets a day",
    howToTake: "One tablet at breakfast and one at dinner. The split dose is the point.",
    packCount: "60 tablets",
    days: 30,
    price: 1299,
    diet: "veg",
    allergens: [],
    safety: [
      "Contains saffron extract (affron®). If you take antidepressant medication (SSRI, SNRI or MAOI), consult your doctor before use.",
      "Avoid during pregnancy (contains KSM-66® ashwagandha).",
      IMMUNO,
    ],
    difference:
      "Two well-studied branded extracts, KSM-66® and affron®, with a psychobiotic pair, dosed morning and evening so the whole day is covered.",
    keyIngredients: ["KSM-66® Ashwagandha", "affron® Saffron", "L-Theanine", "Rosell®-52"],
    formula: [
      {
        group: "Adaptogen",
        items: [
          { name: "KSM-66® ashwagandha, morning", dose: "300mg" },
          { name: "KSM-66® ashwagandha, evening", dose: "300mg" },
        ],
      },
      { group: "Mood", items: [{ name: "affron® saffron (≥3.5% lepticrosalides)", dose: "28mg" }] },
      { group: "Calm", items: [{ name: "L-Theanine", dose: "200mg" }] },
      {
        group: "Cofactors",
        items: [
          { name: "Magnesium bisglycinate (elemental)", dose: "~50mg" },
          { name: "Vitamin B5", dose: "5mg" },
          { name: "Vitamin C", dose: "200mg" },
        ],
      },
      {
        group: "Psychobiotic pair",
        items: [
          { name: "Rosell®-52", dose: "3B CFU" },
          { name: "Rosell®-175", dose: "1B CFU" },
        ],
      },
      { group: "Also", items: [{ name: "Superbeing Premix SB-01", dose: "50mg" }] },
    ],
  },
  {
    code: "U07",
    slug: "brain-age-40-plus",
    name: "Brain Age 40+™ Mouth Melt",
    line: "everyone",
    need: "stress",
    status: "live",
    tagline: "Supports memory, focus and cognitive clarity.",
    forWho: "For adults over forty who want support for memory and focus, and would rather not swallow another capsule.",
    claims: [
      "Supports memory, focus and cognitive clarity",
      "Contains Bacognize® Bacopa monnieri (Brahmi) standardised extract",
      "Contains Cognizin® Citicoline",
    ],
    format: "Mouth melt sachet, no water needed",
    shape: "melt",
    serve: "One sachet, about 1.7g of actives",
    howToTake: "Once a day, straight after a meal that contains some fat.",
    packCount: "30 sachets",
    days: 30,
    price: 1799,
    diet: "veg",
    allergens: [],
    safety: ["Take immediately after a fat-containing meal.", IMMUNO],
    difference:
      "Indian-origin Bacognize® with Japanese Cognizin® citicoline, Lion's Mane and vegetarian DHA, in a sachet that melts on the tongue.",
    keyIngredients: ["Bacognize® Bacopa", "Cognizin® Citicoline", "Lion's Mane", "Algal DHA"],
    formula: [
      {
        group: "Cholinergic",
        items: [
          { name: "Cognizin® citicoline", dose: "250mg" },
          { name: "Bacognize® bacopa (≥45% bacosides)", dose: "300mg" },
        ],
      },
      {
        group: "Structural",
        items: [
          { name: "Lion's Mane (≥30% polysaccharides)", dose: "500mg" },
          { name: "Phosphatidylserine", dose: "100mg" },
          { name: "Algal DHA", dose: "200mg" },
        ],
      },
      {
        group: "Cofactors",
        items: [
          { name: "Methylcobalamin (B12)", dose: "500mcg" },
          { name: "Vitamin B6 (P-5-P)", dose: "10mg" },
          { name: "B. longum", dose: "1B CFU" },
          { name: "Superbeing Premix SB-01", dose: "50mg" },
        ],
      },
    ],
  },
  {
    code: "U08",
    slug: "indian-vegetarian-complete",
    name: "Indian Vegetarian Complete™",
    line: "everyone",
    need: "foundational",
    status: "live",
    tagline: "Supports nutritional gaps in Indian vegetarian diets.",
    forWho: "For vegetarians and vegans who want iron, B12, D3, DHA, zinc and folate covered in one tablet that is gentle on the stomach.",
    claims: [
      "Supports nutritional gaps in Indian vegetarian diets",
      "Contains Ferrochel® Iron Bisglycinate for better tolerability",
      "Contains life'sDHA® algal DHA — vegetarian omega-3 from the original source",
    ],
    format: "Film-coated tablet",
    shape: "bottle",
    serve: "One tablet a day",
    howToTake: "Once a day. Keep it two hours apart from chai.",
    packCount: "30 tablets",
    days: 30,
    price: 899,
    diet: "vegan",
    allergens: [],
    safety: [IRON_BOX, "Contains algal-derived DHA (from Schizochytrium sp.).", IMMUNO],
    difference:
      "Built around the gaps in Indian vegetarian diets, with gentle chelated minerals, active B12 and folate, and plant-sourced life'sDHA®. One tablet, fully vegan.",
    keyIngredients: ["Ferrochel® Iron", "life'sDHA®", "Methylcobalamin", "B. longum 1714™"],
    formula: [
      { group: "Iron", items: [{ name: "Ferrochel® iron bisglycinate (elemental)", dose: "18mg" }] },
      { group: "Omega-3", items: [{ name: "life'sDHA® algal DHA", dose: "200mg" }] },
      {
        group: "B-vitamins",
        items: [
          { name: "Methylcobalamin (B12)", dose: "500mcg" },
          { name: "(6S)-5-MTHF folate", dose: "400mcg" },
          { name: "Vitamin B6 (P-5-P)", dose: "5mg" },
        ],
      },
      {
        group: "Minerals and D3",
        items: [
          { name: "Zinc bisglycinate (elemental)", dose: "10mg" },
          { name: "Calcium bisglycinate (elemental)", dose: "200mg" },
          { name: "Vitamin D3", dose: "1,000IU" },
        ],
      },
      {
        group: "Also",
        items: [
          { name: "B. longum 1714™", dose: "5B CFU" },
          { name: "Superbeing Premix SB-01", dose: "50mg" },
        ],
      },
    ],
  },
  {
    code: "U09",
    slug: "omega-precision",
    name: "Omega Precision™",
    line: "everyone",
    need: "foundational",
    status: "live",
    tagline: "Supports cardiovascular and brain health. No fishy repeat.",
    forWho: "For people who want a fish oil they can trust to be fresh, without the burps.",
    claims: [
      "Supports cardiovascular and brain health",
      "Contains MEG-3® IFOS 5-Star Certified Fish Oil",
      "Protected by AstaReal® astaxanthin antioxidant system",
      "No fishy repeat — enteric coated",
    ],
    format: "Enteric-coated softgel",
    shape: "tub",
    serve: "One softgel a day, 1,000mg omega-3",
    howToTake: "Once a day with a meal that contains some fat.",
    packCount: "30 softgels",
    days: 30,
    price: 1499,
    diet: "non-veg",
    allergens: ["Fish (anchovy, sardine, mackerel)"],
    safety: [
      "Contains fish (anchovy, sardine, mackerel). Not suitable for people with fish or shellfish allergy.",
      "Not suitable for vegetarians or vegans.",
      "If you take blood-thinning medication, consult your doctor before use.",
      IMMUNO,
    ],
    difference:
      "1g of EPA and DHA per softgel from MEG-3® in triglyceride form, kept fresh by astaxanthin and tocopherols inside the capsule, with an enteric coat.",
    keyIngredients: ["MEG-3® Fish Oil", "AstaReal® Astaxanthin", "Vitamin D3"],
    frontOfPackNote: "Contains fish. Not suitable for vegetarians or vegans",
    formula: [
      {
        group: "Omega-3 (MEG-3®, triglyceride form)",
        items: [
          { name: "EPA", dose: "600mg" },
          { name: "DHA", dose: "400mg" },
        ],
      },
      {
        group: "Freshness system",
        items: [
          { name: "AstaReal® astaxanthin", dose: "5mg" },
          { name: "Mixed tocopherols", dose: "10mg" },
        ],
      },
      {
        group: "Also",
        items: [
          { name: "Vitamin D3", dose: "500IU" },
          { name: "B. longum 1714™", dose: "5B CFU" },
          { name: "Superbeing Premix SB-01", dose: "50mg" },
        ],
      },
    ],
  },
  {
    code: "U10",
    slug: "healthy-waist-muscle",
    name: "Healthy Waist + Muscle™",
    line: "everyone",
    need: "weight",
    status: "coming-soon",
    tagline: "Supports healthy post-meal glucose and muscle maintenance.",
    forWho: "For people managing their weight who want to look after muscle and post-meal glucose at the same time.",
    claims: ["Supports healthy postprandial glucose", "Supports muscle maintenance during weight management"],
    format: "Powder sachet, stirred into 250ml water",
    shape: "carton",
    serve: "One sachet, about 15g",
    howToTake: "About 15 minutes before a meal.",
    packCount: "30 sachets",
    days: 30,
    price: 2199,
    diet: "veg",
    allergens: ["Pea protein (legume)"],
    safety: [IMMUNO],
    difference:
      "Protein, leucine and HMB for muscle, with Reducose® mulberry for post-meal glucose, in one smooth sachet. Best used with guidance from your doctor or dietitian.",
    keyIngredients: ["myHMB®", "Reducose® Mulberry", "Pea protein", "L-Leucine"],
    availabilityNote: "Coming soon. Full details once the label is final.",
    formula: [
      {
        group: "Muscle",
        items: [
          { name: "Pea protein isolate", dose: "8,000mg" },
          { name: "L-Leucine", dose: "3,000mg" },
          { name: "myHMB® free acid", dose: "1,500mg" },
        ],
      },
      {
        group: "Glucose",
        items: [
          { name: "Reducose® mulberry (≥4% DNJ)", dose: "200mg" },
          { name: "Ceylon cinnamon (≥4% cinnamaldehyde)", dose: "300mg" },
          { name: "Chromium picolinate", dose: "200mcg" },
        ],
      },
      {
        group: "Support",
        items: [
          { name: "Magnesium (elemental)", dose: "~50mg" },
          { name: "LactoSpore®", dose: "2B CFU" },
          { name: "Superbeing Premix SB-01", dose: "50mg" },
        ],
      },
    ],
  },
  {
    code: "U11",
    slug: "satiety-craving-control",
    name: "Satiety + Craving Control™",
    line: "everyone",
    need: "weight",
    status: "live",
    tagline: "Supports satiety as part of a calorie-controlled diet.",
    forWho: "For people who want to feel fuller at meals, as part of a calorie-controlled diet.",
    claims: ["Supports satiety as part of a calorie-controlled diet."],
    format: "Powder sachet, stirred into at least 250ml water",
    shape: "carton",
    serve: "One sachet, about 3.9g of actives",
    howToTake: "30 minutes before a meal, with at least 250ml of water.",
    packCount: "30 sachets",
    days: 30,
    price: 1399,
    diet: "veg",
    allergens: [],
    safety: [
      "Choking hazard. Take with at least 250ml of water. Do not take immediately before bedtime or lying down.",
      "Consult your doctor if you are on antidiabetic medication.",
      IMMUNO,
    ],
    difference:
      "A full 3g of glucomannan with a purity check of at least 75% on every batch. Fullness comes from a fibre gel that forms in water, not from stimulants.",
    keyIngredients: ["Glucomannan", "Svetol®", "Gymnema", "B. breve B-3"],
    formula: [
      {
        group: "Fibre",
        items: [
          { name: "Glucomannan, konjac (≥75%)", dose: "3,000mg" },
          { name: "Fenugreek galactomannan", dose: "500mg" },
        ],
      },
      {
        group: "Botanicals",
        items: [
          { name: "Gymnema (≥75% gymnemic acids)", dose: "150mg" },
          { name: "Svetol® decaf green coffee (≥45% CGA)", dose: "200mg" },
          { name: "Chromium picolinate", dose: "200mcg" },
        ],
      },
      {
        group: "Also",
        items: [
          { name: "B. breve B-3", dose: "10B CFU" },
          { name: "Superbeing Premix SB-01", dose: "50mg" },
        ],
      },
    ],
  },
  {
    code: "U12",
    slug: "hydra-heat",
    name: "Hydra Heat™",
    line: "everyone",
    need: "hydration",
    status: "coming-soon",
    availabilityNote: "Coming soon. Full details once the label is final.",
    tagline: "5 electrolytes, built for Indian heat.",
    forWho: "For long, hot days and the sweat that comes with them, from a mix that isn't oversweet.",
    claims: [
      "5 electrolytes, engineered for enhanced vitamin and active uptake, built for Indian heat.",
      "Himalayan pink salt: culturally trusted sodium source, carries trace natural minerals",
    ],
    format: "Stick sachet, stirred into water",
    shape: "stick",
    serve: "One stick",
    howToTake: "As needed in the heat.",
    packCount: "15 sticks",
    days: 15,
    price: 549,
    diet: "veg",
    allergens: [],
    safety: [],
    difference:
      "Five electrolytes with Sustamine® and a panna-inspired root complex, tuned for Indian heat with low sweetness.",
    keyIngredients: ["Himalayan pink salt", "Sustamine®", "Coconut water"],
    formula: [
      {
        group: "Electrolytes",
        items: [
          { name: "Sodium (Himalayan pink salt)", dose: "800mg" },
          { name: "Potassium", dose: "300mg" },
          { name: "Magnesium", dose: "70mg" },
          { name: "Calcium", dose: "60mg" },
          { name: "Chloride", dose: "1,100–1,300mg" },
          { name: "Citrate", dose: "550mg" },
        ],
      },
      {
        group: "Carrier",
        items: [
          { name: "Dextrose", dose: "4,000mg" },
          { name: "Coconut water powder", dose: "500mg" },
        ],
      },
      {
        group: "Functional",
        items: [
          { name: "Sustamine® L-alanyl-L-glutamine", dose: "1,000mg" },
          { name: "Vitamin C", dose: "100mg" },
          { name: "Zinc", dose: "2mg" },
          { name: "Vitamin B6", dose: "1mg" },
          { name: "Piperine", dose: "5mg" },
        ],
      },
      { group: "Proprietary", items: [{ name: "Panna Root Complex", dose: "Not disclosed" }] },
    ],
  },
  {
    code: "U13",
    slug: "hydra-move",
    name: "Hydra Move™",
    line: "everyone",
    need: "hydration",
    status: "live",
    tagline: "High-sodium hydration for heavy sweat.",
    forWho: "For training, sport and outdoor work, when you sweat hard and mainstream mixes are too light on salt.",
    claims: [
      "High-sodium hydration, engineered for enhanced vitamin and active uptake, for heavy sweat.",
    ],
    format: "Stick sachet, stirred into water",
    shape: "stick",
    serve: "One stick, about 1,168mg sodium",
    howToTake: "Around heavy-sweat activity. Mind the daily stick limit on the pack.",
    packCount: "15 sticks",
    days: 15,
    price: 599,
    diet: "veg",
    allergens: [],
    safety: ["Total sodium about 1,168mg per stick. Do not exceed the daily stick limit on the pack."],
    difference: "The highest-sodium stick in the Hydra range, with taurine, betaine and AstraGin®. For heavy sweat, not casual sipping.",
    keyIngredients: ["AstraGin®", "Taurine", "Betaine"],
    formula: [
      {
        group: "Electrolytes",
        items: [
          { name: "Sodium, total", dose: "~1,168mg" },
          { name: "Potassium", dose: "300mg" },
          { name: "Magnesium", dose: "90mg" },
          { name: "Calcium", dose: "75mg" },
          { name: "Chloride", dose: "1,400–1,600mg" },
          { name: "Citrate", dose: "600mg" },
        ],
      },
      { group: "Carbohydrate", items: [{ name: "Dextrose", dose: "5,000mg" }] },
      {
        group: "Functional",
        items: [
          { name: "Taurine", dose: "750mg" },
          { name: "Betaine anhydrous", dose: "750mg" },
          { name: "AstraGin®", dose: "50mg" },
          { name: "Vitamin B6", dose: "1mg" },
          { name: "Vitamin B12", dose: "1mcg" },
          { name: "Piperine", dose: "5mg" },
        ],
      },
      { group: "Proprietary", items: [{ name: "Endurance Root Blend", dose: "Not disclosed" }] },
    ],
  },
  {
    code: "U14",
    slug: "hydra-zero",
    name: "Hydra Zero™",
    line: "everyone",
    need: "hydration",
    status: "live",
    tagline: "Zero sugar. High sodium. Trace minerals from a marine-mineral complex.",
    forWho: "For electrolytes without sugar or calories, at the desk or on the move.",
    claims: ["Zero sugar. High sodium. Trace minerals from a marine-mineral complex."],
    format: "Stick sachet, stirred into water",
    shape: "stick",
    serve: "One stick, 0g sugar",
    howToTake: "As needed.",
    packCount: "15 sticks",
    days: 15,
    price: 549,
    diet: "veg",
    allergens: [],
    safety: [],
    difference: "The only Hydra stick without dextrose: zero sugar, high sodium and a branded marine trace-mineral complex.",
    keyIngredients: ["Aquamin®", "Himalayan pink salt", "Taurine"],
    formula: [
      {
        group: "Electrolytes",
        items: [
          { name: "Sodium (Himalayan salt)", dose: "1,000mg" },
          { name: "Potassium", dose: "250mg" },
          { name: "Magnesium", dose: "75mg" },
          { name: "Calcium", dose: "60mg" },
          { name: "Chloride", dose: "1,200–1,400mg" },
          { name: "Citrate", dose: "500mg" },
        ],
      },
      {
        group: "Functional",
        items: [
          { name: "Aquamin® trace minerals", dose: "200mg" },
          { name: "Taurine", dose: "400mg" },
          { name: "Vitamin C", dose: "60mg" },
          { name: "Piperine", dose: "5mg" },
          { name: "Sugar", dose: "0g" },
        ],
      },
      { group: "Proprietary", items: [{ name: "Zero Balance Complex", dose: "Not disclosed" }] },
    ],
  },
  {
    code: "U15",
    slug: "hydra-night-out-recovery",
    name: "Hydra Night Out Recovery™",
    line: "everyone",
    need: "hydration",
    status: "coming-soon",
    tagline: "Electrolytes and recovery nutrients for late nights and travel.",
    forWho: "For the morning after a late night, a long day or a long flight.",
    claims: [
      "Electrolytes + recovery nutrients, engineered for enhanced vitamin and active uptake, for late nights and travel.",
    ],
    format: "Stick sachet, stirred into water",
    shape: "stick",
    serve: "One stick",
    howToTake: "After late nights or while travelling.",
    packCount: "15 sticks",
    days: 15,
    price: 549,
    diet: "veg",
    allergens: [],
    safety: [],
    difference: "Electrolytes with glycine, taurine and Zynamite® for late nights and travel, a moment most electrolytes ignore.",
    keyIngredients: ["Zynamite®", "Glycine", "Taurine"],
    availabilityNote: "Coming soon. Full details once the label is final.",
    formula: [
      {
        group: "Electrolytes",
        items: [
          { name: "Sodium", dose: "650mg" },
          { name: "Potassium", dose: "250mg" },
          { name: "Magnesium", dose: "85mg" },
          { name: "Calcium", dose: "50mg" },
          { name: "Chloride", dose: "850–1,000mg" },
          { name: "Citrate", dose: "400mg" },
          { name: "Dextrose", dose: "5,000mg" },
        ],
      },
      {
        group: "Recovery",
        items: [
          { name: "Glycine", dose: "1,500mg" },
          { name: "Taurine", dose: "1,000mg" },
          { name: "L-Theanine", dose: "100mg" },
          { name: "Zynamite® mango leaf extract", dose: "300mg" },
          { name: "Vitamin C", dose: "150mg" },
          { name: "Zinc", dose: "3mg" },
          { name: "Piperine", dose: "5mg" },
        ],
      },
      { group: "Proprietary", items: [{ name: "Restore Root Elixir", dose: "Not disclosed" }] },
    ],
  },
  {
    code: "U16",
    slug: "glp-prime",
    name: "GLP Prime™",
    line: "everyone",
    need: "glp",
    status: "coming-soon",
    hidden: true,
    tagline: "Stage one: before meals, for sugar cravings, fullness and bloating.",
    forWho: "For people managing their weight who want help with sugar cravings, feeling full and bloating.",
    claims: [
      "Gymnema: supports reduced sugar cravings via sweet-taste-receptor blocking",
      "PGX®: supports satiety via mechanical gastric bulk",
      "Dandelion root: supports reduced bloating/water retention",
    ],
    format: "Powder sachet, fully dissolved in water",
    shape: "carton",
    serve: "One sachet, 7–10g",
    howToTake: "Shortly before a meal.",
    packCount: "30-day pack",
    days: 30,
    price: 1899,
    diet: "veg",
    allergens: [],
    safety: ["If you take diuretic medication, consult your doctor before use (contains dandelion root).", "Take before a meal."],
    difference: "Three separate pre-meal levers, each with its own honest claim: Gymnema for sugar cravings, PGX® for fullness and dandelion root for bloating.",
    keyIngredients: ["PGX®", "Gymnema", "Dandelion root", "Green tea EGCG"],
    formula: [
      { group: "Cravings", items: [{ name: "Gymnema (≥25% gymnemic acids)", dose: "400mg" }] },
      { group: "Satiety", items: [{ name: "PGX® viscous fibre", dose: "1,750mg" }] },
      { group: "Bloating", items: [{ name: "Dandelion root", dose: "300mg" }] },
      {
        group: "Support",
        items: [
          { name: "Bitter melon", dose: "150mg" },
          { name: "Green tea (≥45% EGCG)", dose: "300mg" },
          { name: "Chromium", dose: "200mcg" },
          { name: "Piperine", dose: "5mg" },
          { name: "Superbeing Premix SB-01", dose: "50mg" },
        ],
      },
    ],
  },
  {
    code: "U17",
    slug: "sarcoanchor",
    name: "SarcoAnchor™",
    line: "everyone",
    need: "glp",
    status: "coming-soon",
    hidden: true,
    tagline: "Stage two: supports muscle and bone defence during weight loss.",
    forWho: "For people losing weight who want to protect the muscle and bone they have. Expect months, not weeks.",
    claims: [
      "Supports muscle and bone defense during weight loss",
      "Contains myHMB® and Mitopure®",
      "Active-form B12 and B6 for faster, more complete utilisation",
    ],
    format: "Powder sachet, dissolved in water",
    shape: "carton",
    serve: "One sachet, 6–9g",
    howToTake: "With a meal. Give it months, not weeks.",
    packCount: "30-day pack",
    days: 30,
    price: 2299,
    diet: "veg",
    allergens: [],
    safety: ["Results take months, not weeks."],
    difference: "A full 3g myHMB® dose with Mitopure® urolithin A and bone nutrients. One of very few formulas built for muscle and bone during weight loss.",
    keyIngredients: ["myHMB®", "Mitopure®", "Vitamin D3 + K2", "Algal omega-3"],
    formula: [
      {
        group: "Muscle",
        items: [
          { name: "myHMB® calcium HMB", dose: "3,000mg" },
          { name: "Mitopure® urolithin A", dose: "500mg" },
        ],
      },
      {
        group: "Bone",
        items: [
          { name: "Vitamin D3", dose: "2,000IU" },
          { name: "Vitamin K2 (MK-7)", dose: "45mcg" },
          { name: "Magnesium (elemental)", dose: "~40mg" },
          { name: "Zinc (elemental)", dose: "~5mg" },
        ],
      },
      {
        group: "Support",
        items: [
          { name: "Algal omega-3", dose: "1,000mg" },
          { name: "Ginger (≥5% gingerols)", dose: "250mg" },
          { name: "Methylcobalamin (B12)", dose: "1,000mcg" },
          { name: "Vitamin B6 (P-5-P)", dose: "10mg" },
          { name: "Piperine", dose: "5mg" },
          { name: "Superbeing Premix SB-01", dose: "50mg" },
        ],
      },
    ],
  },
  {
    code: "U18",
    slug: "sarcobridge",
    name: "SarcoBridge™",
    line: "everyone",
    need: "glp",
    status: "coming-soon",
    hidden: true,
    tagline: "Stage three: bridge and rebuild after a weight programme ends.",
    forWho: "For the months after a weight-loss programme ends, when appetite returns and muscle needs rebuilding.",
    claims: [
      "Post-discontinuation rebound bridge and rebuild",
      "Contains glucoVantage® and Satiereal®",
      "Rhodiola rosea for fatigue/energy support during the adjustment period",
    ],
    format: "Powder sachet, dissolved in at least 250ml water",
    shape: "carton",
    serve: "One sachet, 6–9g, in two phases",
    howToTake: "30 minutes before meals. Weeks one and two use the lighter fill; from week three, the full fill.",
    packCount: "30-day pack",
    days: 30,
    price: 2499,
    diet: "veg",
    allergens: [],
    safety: [
      "Choking hazard. Take with at least 250ml of water. Do not take immediately before bedtime or lying down.",
      "Follow the titration schedule printed on the pack.",
    ],
    difference: "Built for the after phase most weight products ignore: a gentle fibre start, Satiereal® for appetite and HMB with creatine to keep muscle.",
    keyIngredients: ["glucoVantage®", "Satiereal®", "Creapure®", "Rhodiola"],
    formula: [
      {
        group: "Appetite",
        items: [
          { name: "Satiereal® saffron", dose: "176mg" },
          { name: "Glucomannan (≥75%), weeks 1–2 → from week 3", dose: "1,500 → 3,000mg" },
        ],
      },
      {
        group: "Metabolic",
        items: [
          { name: "glucoVantage® dihydroberberine", dose: "150mg" },
          { name: "Chromium", dose: "200mcg" },
        ],
      },
      {
        group: "Muscle and energy",
        items: [
          { name: "myHMB®", dose: "1,500mg" },
          { name: "Creapure® creatine", dose: "3,000mg" },
          { name: "Rhodiola rosea", dose: "200mg" },
        ],
      },
      {
        group: "Also",
        items: [
          { name: "Vitamin D3", dose: "2,000IU" },
          { name: "Magnesium bisglycinate", dose: "200mg" },
          { name: "Piperine", dose: "5mg" },
          { name: "Superbeing Premix SB-01", dose: "50mg" },
        ],
      },
    ],
  },
  {
    code: "W01",
    slug: "hair-root",
    name: "Hair Root²™",
    line: "women",
    need: "beauty",
    status: "live",
    tagline: "Supports healthy hair growth and helps reduce hair shedding.",
    forWho: "For women noticing more hair in the brush, especially around stressful months or low iron.",
    claims: [
      "Supports healthy hair growth",
      "Helps reduce hair shedding",
      "Contains KSM-66® Ashwagandha for cortisol management",
      "Contains Ferrochel® iron for hair health",
    ],
    format: "Film-coated tablet",
    shape: "bottle",
    serve: "Two tablets a day",
    howToTake: "One at breakfast and one at dinner.",
    packCount: "60 tablets",
    days: 30,
    price: 1399,
    diet: "veg",
    allergens: [],
    safety: [
      "Keep out of reach of children. Accidental iron overdose is dangerous. Child-resistant closure.",
      "Avoid during pregnancy (contains KSM-66® ashwagandha).",
      "Contains copper. If you have haemochromatosis, consult your doctor before use.",
      IMMUNO,
    ],
    difference:
      "Works on two common drivers of shedding, stress and iron, with branded KSM-66® and Ferrochel®, alongside the structural hair nutrients. Not biotin on its own.",
    keyIngredients: ["KSM-66® Ashwagandha", "Ferrochel® Iron", "Biotin", "Pumpkin seed oil"],
    formula: [
      {
        group: "Stress",
        items: [
          { name: "KSM-66® ashwagandha, morning", dose: "300mg" },
          { name: "KSM-66® ashwagandha, evening", dose: "300mg" },
        ],
      },
      { group: "Iron", items: [{ name: "Ferrochel® iron bisglycinate (elemental)", dose: "18mg" }] },
      {
        group: "Hair structure",
        items: [
          { name: "Biotin", dose: "5,000mcg" },
          { name: "Bamboo extract (≥70% silica)", dose: "300mg" },
          { name: "Pumpkin seed oil", dose: "400mg" },
          { name: "Zinc (elemental)", dose: "15mg" },
          { name: "Copper (elemental)", dose: "1.5mg" },
        ],
      },
      {
        group: "Also",
        items: [
          { name: "L. plantarum DR7", dose: "10B CFU" },
          { name: "Superbeing Premix SB-01", dose: "50mg" },
        ],
      },
    ],
  },
  {
    code: "W02",
    slug: "eat-sleep-burn-pm-women",
    name: "Eat Sleep Burn PM – Women",
    line: "women",
    need: "overnight",
    status: "coming-soon",
    tagline: "",
    forWho: "A women's evening drink, still in review.",
    claims: [],
    format: "Powder sachet, stirred into 250ml warm water",
    shape: "carton",
    serve: "One sachet",
    howToTake: "",
    packCount: "30 sachets",
    days: 30,
    price: 1699,
    diet: "veg",
    allergens: ["Milk (casein)", "Guar gum (legume)"],
    safety: [],
    difference: "",
    keyIngredients: [],
    formula: [],
    availabilityNote: "Coming soon. Full details once the label is final.",
  },
  {
    code: "W03",
    slug: "women-monthly-nutrition",
    name: "Women Monthly Nutrition™",
    line: "women",
    need: "womens",
    status: "live",
    tagline: "Supports iron levels and cycle nutrition.",
    forWho: "For women who want iron, magnesium and B6 at doses that mean something, across the whole month.",
    claims: ["Supports iron levels and cycle nutrition."],
    format: "Film-coated tablet",
    shape: "bottle",
    serve: "Two tablets a day",
    howToTake: "Two tablets daily, taken together.",
    packCount: "60 tablets",
    days: 30,
    price: 799,
    diet: "veg",
    allergens: [],
    safety: [IRON_BOX, IMMUNO],
    difference: "Higher iron, magnesium and active B6 in chelated and active forms, with branded Shatavari and a psychobiotic pair. Cycle nutrition, not a generic women's multi.",
    keyIngredients: ["Ferrochel® Iron", "Shatavari SRI-81®", "Cerebiome®", "Vitamin D3 + K2"],
    formula: [
      { group: "Iron", items: [{ name: "Ferrochel® iron bisglycinate (elemental)", dose: "30mg" }] },
      {
        group: "Cycle nutrients",
        items: [
          { name: "Magnesium bisglycinate (elemental)", dose: "200mg" },
          { name: "Vitamin B6 (P-5-P)", dose: "50mg" },
          { name: "(6S)-5-MTHF folate", dose: "400mcg" },
          { name: "Vitamin C", dose: "80mg" },
        ],
      },
      {
        group: "Bone",
        items: [
          { name: "Vitamin D3", dose: "2,000IU" },
          { name: "Vitamin K2 (MK-7)", dose: "45mcg" },
        ],
      },
      { group: "Botanical", items: [{ name: "Shatavari SRI-81®", dose: "300mg" }] },
      {
        group: "Gut",
        items: [
          { name: "Cerebiome® (Rosell®-52 + 175)", dose: "~3B CFU" },
          { name: "L. reuteri", dose: "100M CFU" },
          { name: "Chicory inulin", dose: "250mg" },
          { name: "Superbeing Premix SB-01", dose: "50mg" },
        ],
      },
    ],
  },
  {
    code: "W04",
    slug: "collagen-glow-matrix",
    name: "Collagen Glow Matrix™",
    line: "women",
    need: "beauty",
    status: "live",
    tagline: "Supports skin elasticity and hydration.",
    forWho: "For skin that feels dry, dull or sun-stressed.",
    claims: [
      "Supports skin elasticity and hydration",
      "Contains VERISOL® Bioactive Collagen Peptides",
      "Contains AstaReal® Astaxanthin for skin photoprotection",
    ],
    format: "Powder sachet, stirred into 150ml water",
    shape: "carton",
    serve: "One sachet",
    howToTake: "Once a day.",
    packCount: "30 sachets",
    days: 30,
    price: 1999,
    diet: "non-veg",
    allergens: [],
    safety: [
      "Contains animal-derived ingredients (bovine collagen). Not suitable for vegetarians.",
      "If you have a beef allergy, do not use.",
      IMMUNO,
    ],
    difference: "2.5g of VERISOL® bioactive collagen peptides with AstaReal® astaxanthin and hyaluronic acid, in an opaque sachet that keeps the astaxanthin potent.",
    keyIngredients: ["VERISOL® Collagen", "AstaReal® Astaxanthin", "Hyaluronic acid"],
    frontOfPackNote: "Contains animal-derived ingredients, not suitable for vegetarians",
    formula: [
      { group: "Collagen", items: [{ name: "VERISOL® bioactive collagen peptides", dose: "2,500mg" }] },
      {
        group: "Antioxidants",
        items: [
          { name: "AstaReal® astaxanthin", dose: "6mg" },
          { name: "Lutein", dose: "10mg" },
          { name: "Zeaxanthin", dose: "2mg" },
        ],
      },
      { group: "Hydration", items: [{ name: "Low-MW hyaluronic acid (<50kDa)", dose: "120mg" }] },
      {
        group: "Cofactors",
        items: [
          { name: "Vitamin C", dose: "200mg" },
          { name: "Zinc", dose: "10mg" },
          { name: "Biotin", dose: "2,500mcg" },
          { name: "L. plantarum CECT 9783", dose: "10B CFU" },
          { name: "Superbeing Premix SB-01", dose: "50mg" },
        ],
      },
    ],
  },
  {
    code: "M01",
    slug: "super-men-cleartone",
    name: "Super Men ClearTone™",
    line: "men",
    need: "beauty",
    status: "coming-soon",
    tagline: "",
    forWho: "A men's skin tablet, still in review.",
    claims: [],
    format: "Film-coated tablet in an opaque blister",
    shape: "bottle",
    serve: "Two tablets a day",
    howToTake: "",
    packCount: "60 tablets",
    days: 30,
    price: 1899,
    diet: "veg",
    allergens: [],
    safety: [],
    difference: "",
    keyIngredients: [],
    formula: [],
    availabilityNote: "Coming soon. Full details once the label is final.",
  },
  {
    code: "M02",
    slug: "massbuild",
    name: "MassBuild™",
    line: "men",
    need: "muscle",
    status: "live",
    tagline: "Supports muscle strength and recovery.",
    forWho: "For men training hard who want recovery support from tested, standardised extracts.",
    claims: ["Supports muscle strength and recovery", "Contains KSM-66® and PrimaVie®"],
    format: "Film-coated tablet",
    shape: "bottle",
    serve: "Two tablets a day",
    howToTake: "Two tablets before sleep.",
    packCount: "60 tablets",
    days: 30,
    price: 1499,
    diet: "veg",
    allergens: [],
    safety: [
      "Contains mucuna (natural L-DOPA). Do not use if you take MAOIs, antidepressants, antipsychotics or Parkinson's medication.",
      IMMUNO,
    ],
    difference: "KSM-66® and purified PrimaVie® shilajit with five standardised Ayurvedic botanicals, tested for heavy metals batch by batch. Ayurveda with branded, tested extracts.",
    keyIngredients: ["KSM-66® Ashwagandha", "PrimaVie® Shilajit", "Safed musli", "Boswellia"],
    formula: [
      {
        group: "Branded core",
        items: [
          { name: "KSM-66® ashwagandha", dose: "600mg" },
          { name: "PrimaVie® purified shilajit (≥50% fulvic acid)", dose: "100mg" },
        ],
      },
      {
        group: "Classical botanicals",
        items: [
          { name: "Safed musli", dose: "90mg" },
          { name: "Gokshura", dose: "80mg" },
          { name: "Pippali", dose: "80mg" },
          { name: "Boswellia (≥65% AKBA)", dose: "80mg" },
          { name: "Vidarikanda", dose: "70mg" },
          { name: "Mucuna (≥15% L-DOPA)", dose: "50mg" },
        ],
      },
      {
        group: "Also",
        items: [
          { name: "Magnesium", dose: "44mg" },
          { name: "Zinc", dose: "5mg" },
          { name: "Vitamin D3", dose: "1,000IU" },
          { name: "LactoSpore®", dose: "2B CFU" },
          { name: "Piperine", dose: "5mg" },
          { name: "Superbeing Premix SB-01", dose: "50mg" },
        ],
      },
    ],
  },
  {
    code: "M03",
    slug: "eat-sleep-burn-pm-men",
    name: "Eat Sleep Burn PM – Men",
    line: "men",
    need: "overnight",
    status: "coming-soon",
    tagline: "",
    forWho: "A men's evening drink, still in review.",
    claims: [],
    format: "Powder sachet, stirred into 250ml water",
    shape: "carton",
    serve: "One sachet",
    howToTake: "",
    packCount: "30 sachets",
    days: 30,
    price: 1699,
    diet: "veg",
    allergens: ["Guar gum (legume)"],
    safety: [],
    difference: "",
    keyIngredients: [],
    formula: [],
    availabilityNote: "Coming soon. Full details once the label is final.",
  },
];

/** Everything the site may show. Hidden SKUs are removed here, before any page sees them. */
export const PRODUCTS = ALL_PRODUCTS.filter((p) => !p.hidden);

/** Products that can be bought today (everything visible except coming-soon). */
export const LIVE_PRODUCTS = PRODUCTS.filter((p) => p.status === "live");

export const PRODUCT_BY_SLUG = Object.fromEntries(PRODUCTS.map((p) => [p.slug, p])) as Record<string, Product>;

/** "₹1,499" in Indian digit grouping. */
export function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

/** Number of actives with a disclosed dose (proprietary complexes are not counted). */
export function doseCount(p: Product) {
  return p.formula.reduce((n, g) => n + g.items.filter((i) => i.dose !== "Not disclosed").length, 0);
}

/** Item total from which standard delivery is free (sample policy; see lib/pricing.ts). */
export const FREE_SHIPPING_AT = 999;
