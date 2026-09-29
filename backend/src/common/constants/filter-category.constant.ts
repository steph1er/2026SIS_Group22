export const FILTER_CATEGORIES = [
  'tops',
  'bottoms',
  'outerwear',
  'dresses',
  'shoes',
  'other',
] as const;

export type FilterCategory = (typeof FILTER_CATEGORIES)[number];

//maps every raw category in wardrobe_items.category and catalogue_items.clothing_category to a quick-sort filter category
export const CATEGORY_TO_FILTER_GROUP: Record<string, FilterCategory> = {
  //tops
  top: 'tops',
  tops: 'tops',
  shirt: 'tops',
  shirts: 'tops',
  't-shirt': 'tops',
  't-shirts': 'tops',
  tshirt: 'tops',
  tshirts: 'tops',
  blouse: 'tops',
  hoodie: 'tops',
  hoodies: 'tops',
  jumper: 'tops',
  jumpers: 'tops',
  sweater: 'tops',
  sweaters: 'tops',
  //bottoms
  pants: 'bottoms',
  jeans: 'bottoms',
  skirt: 'bottoms',
  skirts: 'bottoms',
  shorts: 'bottoms',
  sweatpants: 'bottoms',
  leggings: 'bottoms',
  //outerwear
  jacket: 'outerwear',
  jackets: 'outerwear',
  coat: 'outerwear',
  coats: 'outerwear',
  cardigan: 'outerwear',
  blazer: 'outerwear',
  //dresses
  dress: 'dresses',
  dresses: 'dresses',
  //shoes
  shoes: 'shoes',
  sneakers: 'shoes',
  boots: 'shoes',
  sandals: 'shoes',
  heels: 'shoes',
  flats: 'shoes',
  //other
  accessories: 'other',
  accessory: 'other',
  hat: 'other',
  hats: 'other',
  cap: 'other',
  beanie: 'other',
  sunglasses: 'other',
  glasses: 'other',
  belt: 'other',
  belts: 'other',
  bag: 'other',
  bags: 'other',
  jewellery: 'other',
  jewelry: 'other',
  necklace: 'other',
  bracelet: 'other',
  earrings: 'other',
  scarf: 'other',
  scarves: 'other',
};

export function resolveFilterGroup(
  rawCategory: string | null | undefined,
): FilterCategory {
  if (!rawCategory) {
    return 'other';
  }

  const normalised = rawCategory.trim().toLowerCase();
  const group = CATEGORY_TO_FILTER_GROUP[normalised];

  //if raw category hasn't been mapped to a filter category, fallback to 'other' and log warning
  if (!group) {
    console.warn(`Unmapped category: "${rawCategory}" - defaulting to 'other'`);
    return 'other';
  }

  return group;
}
