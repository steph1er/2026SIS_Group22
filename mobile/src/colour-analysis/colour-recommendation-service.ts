import { normaliseCatalogueItem } from '../../app/services/wishlist/wishlist-service';
import type { CatalogueItem } from '../../app/services/wishlist/wishlist-types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requireSupabase } from '../auth/supabase-client';
import type { ColourAnalysisResult } from './types';

type OnboardingPreferences = {
  primary_aesthetic: string | null;
  style_keywords: string[];
  fit_preferences: string[];
  fashion_outlook: string[];
  style_no_gos: string[];
  fabric_sensitivities: string[];
  top_size: string | null;
  bottom_size: string | null;
  dress_size: string | null;
  tops_min_price: number | null;
  tops_max_price: number | null;
  bottoms_min_price: number | null;
  bottoms_max_price: number | null;
  dresses_min_price: number | null;
  dresses_max_price: number | null;
  outerwear_min_price: number | null;
  outerwear_max_price: number | null;
  accessories_min_price: number | null;
  accessories_max_price: number | null;
};

export type ColourRecommendation = {
  item: CatalogueItem;
  matchedColour: string | null;
  matchedPaletteColour: string | null;
  matchedSize: string | null;
  score: number;
};

export type ColourRecommendationReason = 'no-items' | null;

export type ColourRecommendationResult = {
  items: ColourRecommendation[];
  reason: ColourRecommendationReason;
};

type Rgb = [number, number, number];
type Lab = [number, number, number];
type SizeCategory = 'top_size' | 'bottom_size' | 'dress_size';
type CatalogueCategory = 'tops' | 'bottoms' | 'dresses' | 'outerwear' | 'accessories';
type ScoreComponent = 'colour' | 'style' | 'size' | 'fit' | 'budget' | 'other';

const SCORE_WEIGHTS: Record<ScoreComponent, number> = {
  colour: 40,
  style: 25,
  size: 15,
  fit: 10,
  budget: 5,
  other: 5,
};

// Representative shades for catalogue colour labels. More specific phrases are checked
// before their component words, so "forest green" does not fall back to generic green.
const NAMED_COLOURS: Record<string, string> = {
  'baby blue': '#89CFF0', 'baby pink': '#F4C2C2', 'bright blue': '#0067D9', 'bright green': '#66B447',
  'bright orange': '#FF6A20', 'bright pink': '#E83E8C', 'bright red': '#E53935', 'bright yellow': '#F5D328',
  'cool grey': '#7D8793', 'cool gray': '#7D8793', 'dark blue': '#17365D', 'dark brown': '#4A2C20',
  'dark green': '#1F5132', 'dark grey': '#41444A', 'dark gray': '#41444A', 'deep navy': '#182E5B',
  'denim blue': '#627D99', 'dusty pink': '#B98491', 'dusty rose': '#B98491', 'electric blue': '#135DD8',
  'forest green': '#2F6045', 'hot pink': '#E42487', 'ice blue': '#BEDAF2', 'icy blue': '#BEDAF2',
  'light blue': '#AFCBE3', 'light green': '#A8D5A2', 'light grey': '#C4C7CB', 'light gray': '#C4C7CB',
  'light pink': '#EFB6C6', 'mint green': '#A8D5C2', 'mustard yellow': '#C7982E', 'olive green': '#6F762E',
  'powder blue': '#AFCBE3', 'royal blue': '#2747C7', 'sage green': '#8FA796', 'sky blue': '#76B6E3',
  'soft pink': '#DFA6B6', 'warm beige': '#D9B382', 'warm brown': '#70402C', 'warm white': '#FFF3D6',
  aubergine: '#57364F', aqua: '#20AFA8', beige: '#D9B382', black: '#111111', blue: '#3569A8',
  burgundy: '#681E39', camel: '#C08A52', charcoal: '#41444A', chocolate: '#6B3E2E', cobalt: '#2056B8',
  coral: '#F07F68', cream: '#F4E6C2', cyan: '#20B8C0', denim: '#627D99', emerald: '#00856D',
  espresso: '#4A2B25', fuchsia: '#C52778', gold: '#D4A72C', golden: '#D4A72C', gray: '#85888C',
  green: '#4F8A55', grey: '#85888C', ivory: '#EFE0BF', khaki: '#9B8F58', lavender: '#B7A6D2',
  lilac: '#C3ACD6', lime: '#A4C639', magenta: '#C52778', maroon: '#681E39', mauve: '#8D6F86',
  mint: '#A8D5C2', moss: '#73794A', mustard: '#C7982E', navy: '#243B63', nude: '#D5B39A',
  oatmeal: '#D8C8A9', olive: '#6F762E', orange: '#E87524', peach: '#F3B093', periwinkle: '#778BCB',
  pine: '#154E45', pink: '#D980A3', plum: '#77506E', purple: '#713E91', red: '#C9363E', rose: '#C95C86',
  ruby: '#A7193F', rust: '#B6532F', sage: '#8FA796', salmon: '#F39B86', silver: '#AEB6C1',
  slate: '#66727D', tan: '#BE9367', taupe: '#9E8978', teal: '#388B8C', terracotta: '#C86B4A',
  turquoise: '#20AFA8', violet: '#7139B6', white: '#F8F7F3', yellow: '#EAC33D',
};

const SIZE_GROUPS = [
  ['3XS', 'XXXS', '4', '22'],
  ['2XS', 'XXS', '6', '24'],
  ['XS', 'EXTRA SMALL', '8', '26', 'XS/S'],
  ['S', 'SMALL', '10', '28', 'XS/S'],
  ['M', 'MEDIUM', '12', '30', 'M/L'],
  ['L', 'LARGE', '14', '32', 'M/L'],
  ['XL', 'EXTRA LARGE', '16', '34'],
  ['2XL', 'XXL', '18', '36'],
  ['3XL', 'XXXL', '20', '38'],
] as const;

const CATEGORY_GROUPS: Record<string, SizeCategory> = {
  top: 'top_size', tops: 'top_size', shirt: 'top_size', shirts: 'top_size', blouse: 'top_size', blouses: 'top_size',
  't-shirt': 'top_size', 't-shirts': 'top_size', tshirt: 'top_size', tshirts: 'top_size', hoodie: 'top_size', hoodies: 'top_size',
  jumper: 'top_size', jumpers: 'top_size', sweater: 'top_size', sweaters: 'top_size', cardigan: 'top_size', cardigans: 'top_size',
  jacket: 'top_size', jackets: 'top_size', coat: 'top_size', coats: 'top_size', blazer: 'top_size', blazers: 'top_size', outerwear: 'top_size',
  bottom: 'bottom_size', bottoms: 'bottom_size', pants: 'bottom_size', trousers: 'bottom_size', jeans: 'bottom_size',
  skirt: 'bottom_size', skirts: 'bottom_size', shorts: 'bottom_size', sweatpants: 'bottom_size', leggings: 'bottom_size',
  dress: 'dress_size', dresses: 'dress_size', jumpsuit: 'dress_size', jumpsuits: 'dress_size',
};

const CATALOGUE_CATEGORY_GROUPS: Record<string, CatalogueCategory> = {
  top: 'tops', tops: 'tops', shirt: 'tops', shirts: 'tops', blouse: 'tops', blouses: 'tops',
  't-shirt': 'tops', 't-shirts': 'tops', tshirt: 'tops', tshirts: 'tops', hoodie: 'tops', hoodies: 'tops',
  jumper: 'tops', jumpers: 'tops', sweater: 'tops', sweaters: 'tops',
  bottom: 'bottoms', bottoms: 'bottoms', pants: 'bottoms', trousers: 'bottoms', jeans: 'bottoms',
  skirt: 'bottoms', skirts: 'bottoms', shorts: 'bottoms', sweatpants: 'bottoms', leggings: 'bottoms',
  dress: 'dresses', dresses: 'dresses', jumpsuit: 'dresses', jumpsuits: 'dresses',
  jacket: 'outerwear', jackets: 'outerwear', coat: 'outerwear', coats: 'outerwear', cardigan: 'outerwear',
  cardigans: 'outerwear', blazer: 'outerwear', blazers: 'outerwear', outerwear: 'outerwear',
  accessory: 'accessories', accessories: 'accessories', hat: 'accessories', hats: 'accessories',
  bag: 'accessories', bags: 'accessories', belt: 'accessories', belts: 'accessories', scarf: 'accessories',
  scarves: 'accessories', jewellery: 'accessories', jewelry: 'accessories', necklace: 'accessories',
  bracelet: 'accessories', earrings: 'accessories', sunglasses: 'accessories', glasses: 'accessories',
};

const PREFERENCE_ALIASES: Record<string, string[]> = {
  classy: ['classic', 'elegant', 'formal', 'sophisticated'],
  active: ['activewear', 'athletic', 'athleisure', 'sport', 'sportswear'],
  bohemian: ['boho'],
  minimalist: ['minimal'],
  corporate: ['business', 'formal', 'office', 'workwear'],
  coquette: ['feminine', 'romantic'],
  vintage: ['retro'],
  artsy: ['artistic', 'eclectic'],
  'old money': ['classic', 'preppy', 'tailored'],
  'avant garde': ['experimental'],
  oversized: ['oversize', 'loose'],
  relaxed: ['loose', 'easy fit'],
  regular: ['standard fit', 'regular fit'],
  slim: ['slim fit', 'fitted'],
  tailored: ['structured', 'tailored fit'],
  trendy: ['on trend', 'fashion forward'],
  timeless: ['classic'],
  experimental: ['avant garde'],
  'animal print': ['leopard', 'zebra', 'snake print'],
  neon: ['fluorescent'],
  'heavy logos': ['logo', 'logomania'],
  'crop tops': ['crop', 'cropped'],
  'low rise': ['low waisted'],
  wool: ['100% wool'],
  'heavy latex': ['latex'],
  'nickel finishes': ['nickel'],
};

const FULL_BUDGET_RANGES: Record<CatalogueCategory, [number, number] | null> = {
  tops: [0, 500],
  bottoms: [0, 500],
  dresses: [0, 1000],
  outerwear: [0, 1000],
  accessories: [0, 500],
};

function normaliseLabel(value: string) {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, ' ');
}

function normaliseSize(value: string) {
  return value.trim().toUpperCase().replace(/^(AU|UK|US)\s*/, '').replace(/\s+/g, ' ');
}

function compatibleSize(preferred: string, available: string[]) {
  const wanted = normaliseSize(preferred);
  const group = SIZE_GROUPS.find((options) => options.includes(wanted as never));
  const accepted = new Set(group ?? [wanted]);

  return available.find((size) => {
    const candidate = normaliseSize(size);
    return candidate === 'ONE SIZE' || accepted.has(candidate as never);
  }) ?? null;
}

function sizeCategory(category: string | null): SizeCategory | null {
  if (!category) return null;
  const label = normaliseLabel(category);
  if (CATEGORY_GROUPS[label]) return CATEGORY_GROUPS[label];
  const singular = label.endsWith('s') ? label.slice(0, -1) : label;
  return CATEGORY_GROUPS[singular] ?? null;
}

function catalogueCategory(category: string | null): CatalogueCategory | null {
  if (!category) return null;
  const label = normaliseLabel(category);
  if (CATALOGUE_CATEGORY_GROUPS[label]) return CATALOGUE_CATEGORY_GROUPS[label];
  const singular = label.endsWith('s') ? label.slice(0, -1) : label;
  return CATALOGUE_CATEGORY_GROUPS[singular] ?? null;
}

function hexToRgb(value: string): Rgb | null {
  const match = value.trim().match(/^#?([0-9a-f]{6})$/i);
  if (!match) return null;
  return [0, 2, 4].map((offset) => Number.parseInt(match[1].slice(offset, offset + 2), 16)) as Rgb;
}

function colourToRgb(value: string): Rgb | null {
  const direct = hexToRgb(value);
  if (direct) return direct;
  const label = normaliseLabel(value);
  const exact = NAMED_COLOURS[label];
  if (exact) return hexToRgb(exact);
  const phrase = Object.keys(NAMED_COLOURS)
    .sort((a, b) => b.length - a.length)
    .find((name) => label.includes(name));
  return phrase ? hexToRgb(NAMED_COLOURS[phrase]) : null;
}

function rgbToLab([red, green, blue]: Rgb): Lab {
  const linear = [red, green, blue].map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const x = (linear[0] * 0.4124 + linear[1] * 0.3576 + linear[2] * 0.1805) / 0.95047;
  const y = linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  const z = (linear[0] * 0.0193 + linear[1] * 0.1192 + linear[2] * 0.9505) / 1.08883;
  const pivot = (value: number) => value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116;
  const [fx, fy, fz] = [pivot(x), pivot(y), pivot(z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function labDistance(first: Lab, second: Lab) {
  return Math.sqrt(first.reduce((sum, value, index) => sum + (value - second[index]) ** 2, 0));
}

function closestColour(item: CatalogueItem, result: ColourAnalysisResult) {
  const palette = result.palette.flatMap((colour) => {
    const rgb = colourToRgb(colour.hex);
    return rgb ? [{ ...colour, lab: rgbToLab(rgb) }] : [];
  });
  let closest: { itemColour: string; paletteColour: string; distance: number } | null = null;

  for (const itemColour of item.colours) {
    const itemRgb = colourToRgb(itemColour);
    if (!itemRgb) continue;
    const itemLab = rgbToLab(itemRgb);
    for (const paletteColour of palette) {
      const sameName = normaliseLabel(itemColour) === normaliseLabel(paletteColour.name);
      const distance = sameName ? 0 : labDistance(itemLab, paletteColour.lab);
      if (!closest || distance < closest.distance) {
        closest = { itemColour, paletteColour: paletteColour.name, distance };
      }
    }
  }
  return closest;
}

function colourScore(distance: number | undefined) {
  if (distance === undefined) return 0;
  // CIE76 distance is converted to a smooth 0..1 compatibility score. Close shades
  // remain strongly ranked while distant colours receive progressively less credit.
  return Math.exp(-((distance / 42) ** 2));
}

function itemSearchValues(item: CatalogueItem) {
  return [item.name, item.description ?? '', ...item.styles].map(normaliseLabel).filter(Boolean);
}

function preferenceTerms(preference: string) {
  const value = normaliseLabel(preference);
  return [value, ...(PREFERENCE_ALIASES[value] ?? [])].map(normaliseLabel);
}

function preferenceMatchScore(item: CatalogueItem, preferences: string[]) {
  if (preferences.length === 0) return null;
  const values = itemSearchValues(item);
  let best = 0;
  for (const preference of preferences) {
    for (const term of preferenceTerms(preference)) {
      if (values.some((value) => value === term)) best = Math.max(best, 1);
      else if (values.some((value) => value.includes(term))) best = Math.max(best, 0.85);
    }
  }
  return best;
}

function containsPreference(values: string[], preferences: string[]) {
  const searchable = values.map(normaliseLabel);
  return preferences.some((preference) =>
    preferenceTerms(preference).some((term) => searchable.some((value) => value === term || value.includes(term))),
  );
}

function sizeScore(item: CatalogueItem, preferences: OnboardingPreferences) {
  const category = sizeCategory(item.category);
  const preferred = category ? preferences[category] : null;
  if (!preferred || item.sizes.length === 0) return null;
  const match = compatibleSize(preferred, item.sizes);
  return { score: match ? 1 : 0, matchedSize: match };
}

function budgetFor(category: CatalogueCategory, preferences: OnboardingPreferences) {
  const prefix = category === 'accessories' ? 'accessories' : category;
  const minimum = preferences[`${prefix}_min_price` as keyof OnboardingPreferences];
  const maximum = preferences[`${prefix}_max_price` as keyof OnboardingPreferences];
  if (typeof minimum !== 'number' || typeof maximum !== 'number') return null;
  const fullRange = FULL_BUDGET_RANGES[category];
  if (fullRange && minimum <= fullRange[0] && maximum >= fullRange[1]) return null;
  return { minimum, maximum };
}

function budgetScore(item: CatalogueItem, preferences: OnboardingPreferences) {
  const category = catalogueCategory(item.category);
  if (!category || item.price === null) return null;
  const budget = budgetFor(category, preferences);
  if (!budget) return null;
  if (item.price >= budget.minimum && item.price <= budget.maximum) return 1;
  const span = Math.max(budget.maximum - budget.minimum, 50);
  const difference = item.price < budget.minimum
    ? budget.minimum - item.price
    : item.price - budget.maximum;
  return Math.max(0, 1 - difference / span);
}

function otherPreferenceScore(item: CatalogueItem, preferences: OnboardingPreferences) {
  const scores: number[] = [];
  const outlook = preferenceMatchScore(item, preferences.fashion_outlook);
  if (outlook !== null) scores.push(outlook);

  if (preferences.style_no_gos.length > 0) {
    scores.push(containsPreference(itemSearchValues(item), preferences.style_no_gos) ? 0 : 1);
  }

  if (preferences.fabric_sensitivities.length > 0 && item.materials.length > 0) {
    scores.push(containsPreference(item.materials, preferences.fabric_sensitivities) ? 0 : 1);
  }

  if (scores.length === 0) return null;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

function weightedScore(components: Partial<Record<ScoreComponent, number>>) {
  const available = Object.entries(components) as [ScoreComponent, number][];
  const totalWeight = available.reduce((sum, [component]) => sum + SCORE_WEIGHTS[component], 0);
  if (totalWeight === 0) return 0;
  return available.reduce(
    (sum, [component, score]) => sum + score * (SCORE_WEIGHTS[component] / totalWeight),
    0,
  );
}

async function getAllCatalogueRows(supabase: SupabaseClient) {
  const pageSize = 500;
  const rows: unknown[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('catalogue_items')
      .select('*, brands (*)')
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`Unable to load clothing recommendations: ${error.message}`);
    rows.push(...(data ?? []));
    if (!data || data.length < pageSize) return rows;
  }
}

/**
 * Read the user's latest supported onboarding preferences and the public catalogue,
 * then rank every item against the exact palette displayed in Colour Analysis. The
 * onboarding colour_preferences column is deliberately not selected or scored.
 */
export async function getColourRecommendations(
  userId: string,
  result: ColourAnalysisResult,
  limit = 12,
): Promise<ColourRecommendationResult> {
  const supabase = requireSupabase();
  const [preferencesResponse, catalogueRows] = await Promise.all([
    supabase
      .from('onboarding')
      .select(`
        primary_aesthetic, style_keywords, fit_preferences, fashion_outlook,
        style_no_gos, fabric_sensitivities, top_size, bottom_size, dress_size,
        tops_min_price, tops_max_price, bottoms_min_price, bottoms_max_price,
        dresses_min_price, dresses_max_price, outerwear_min_price, outerwear_max_price,
        accessories_min_price, accessories_max_price
      `)
      .eq('user_id', userId)
      .maybeSingle(),
    getAllCatalogueRows(supabase),
  ]);

  if (preferencesResponse.error) {
    throw new Error(`Unable to load your onboarding preferences: ${preferencesResponse.error.message}`);
  }

  const preferences = (preferencesResponse.data ?? {
    primary_aesthetic: null,
    style_keywords: [],
    fit_preferences: [],
    fashion_outlook: [],
    style_no_gos: [],
    fabric_sensitivities: [],
    top_size: null,
    bottom_size: null,
    dress_size: null,
    tops_min_price: null,
    tops_max_price: null,
    bottoms_min_price: null,
    bottoms_max_price: null,
    dresses_min_price: null,
    dresses_max_price: null,
    outerwear_min_price: null,
    outerwear_max_price: null,
    accessories_min_price: null,
    accessories_max_price: null,
  }) as OnboardingPreferences;
  const stylePreferences = [preferences.primary_aesthetic, ...preferences.style_keywords]
    .filter((value): value is string => Boolean(value));

  const recommendations = catalogueRows.flatMap((row): ColourRecommendation[] => {
    const item = normaliseCatalogueItem(row);
    if (!item.id) return [];
    const colour = closestColour(item, result);
    const size = sizeScore(item, preferences);
    const components: Partial<Record<ScoreComponent, number>> = {
      colour: colourScore(colour?.distance),
    };
    const style = preferenceMatchScore(item, stylePreferences);
    const fit = preferenceMatchScore(item, preferences.fit_preferences);
    const budget = budgetScore(item, preferences);
    const other = otherPreferenceScore(item, preferences);
    if (style !== null) components.style = style;
    if (size !== null) components.size = size.score;
    if (fit !== null) components.fit = fit;
    if (budget !== null) components.budget = budget;
    if (other !== null) components.other = other;

    return [{
      item,
      matchedColour: colour?.itemColour ?? null,
      matchedPaletteColour: colour?.paletteColour ?? null,
      matchedSize: size?.matchedSize ?? null,
      score: weightedScore(components),
    }];
  });

  recommendations.sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name));
  const items = recommendations.slice(0, limit);
  return { items, reason: items.length ? null : 'no-items' };
}
