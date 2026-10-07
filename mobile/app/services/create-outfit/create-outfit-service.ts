import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { fetchRecommendations, normaliseCatalogueItem, requestJson, toArray } from '../wishlist/wishlist-service';
import type { CatalogueItem } from '../wishlist/wishlist-types';
import type { OutfitSaveDetails, RecommendedItem, WardrobeItem } from './createOutfitTypes';

export type FilterCategory = 'tops' | 'bottoms' | 'outerwear' | 'dresses' | 'shoes' | 'other';
export type BuilderItem = WardrobeItem | RecommendedItem;

export const CATEGORY_MAP: Record<string, FilterCategory> = {
  Tops: 'tops',
  Bottoms: 'bottoms',
  Outerwear: 'outerwear',
  Dresses: 'dresses',
  Shoes: 'shoes',
  Other: 'other',
};

export type BuilderResult = {
  recommendations: BuilderItem[];
  items: BuilderItem[];
};

const catalogueToRecommended = (c: CatalogueItem, source: 'Wishlist' | 'Catalogue'): RecommendedItem => {
  return {
    id: c.id,
    name: c.name,
    brand: c.brand ?? '',
    price: c.price != null ? `$${c.price.toFixed(2)}` : '',
    image_url: c.imageUrl ?? '',
    description: c.description ?? undefined,
    tags: c.styles,
    materials: c.materials.join(', '),
    category: c.category ?? undefined,
    colours: c.colours,
    source,
  };
}

// general catalogue recommendations, to be updated when ml
export async function fetchGeneralRecommendations(): Promise<RecommendedItem[]> {
  const items = await fetchRecommendations({ limit: 10 });
  return items.map((c) => catalogueToRecommended(c, 'Catalogue'));
}

export async function fetchBuilderItems(
  source: 'Wardrobe' | 'Wishlist',
  uiCategory: string,
): Promise<BuilderResult> {
  const category = CATEGORY_MAP[uiCategory] ?? 'tops';
  const path =
    source === 'Wardrobe'
      ? `outfits/builder/wardrobe?filter_category=${category}`
      : `outfits/builder/wishlist?filter_category=${category}`;

  const res = (await requestJson(path)) as { recommendations?: unknown; items?: unknown };
  const convert = (rows: unknown): BuilderItem[] =>
    source === 'Wardrobe'
      ? (toArray(rows) as WardrobeItem[])
      : toArray(rows).map((raw) => catalogueToRecommended(normaliseCatalogueItem(raw), 'Wishlist'));

  return { recommendations: convert(res?.recommendations), items: convert(res?.items) };
}

// WardrobeItem has no name atm`, so fallback to its category
export const getItemLabel = (item: BuilderItem) =>
  'name' in item ? item.name : item.clothing_category;

export type ItemDetails = {
  imageUrl: string;
  name: string;
  brand: string | null;
  price: string | null;
  material: string | null;
  size: string | null;
  description: string | null;
  colour: string | null;
  category: string | null;
  tags: string[];
  source: 'Wardrobe' | 'Wishlist' | 'Catalogue';
};

// tolerate a column being either text[] or plain text
const asText = (value: unknown): string | null => {
  if (Array.isArray(value)) return value.length ? value.join(', ') : null;
  return typeof value === 'string' && value.trim() ? value : null;
};

export function getItemDetails(item: BuilderItem): ItemDetails {
  if (!('name' in item)) {
    const price = item.price != null ? Number(item.price) : NaN;
    return {
      imageUrl: item.image_url,
      name: item.clothing_category,
      brand: item.brand ?? null,
      price: Number.isFinite(price) ? `$${price.toFixed(2)}` : null,
      material: asText(item.material),
      size: asText(item.size),
      description: null,
      colour: asText(item.colour),
      category: item.clothing_category,
      tags: item.tags ?? item.style ?? [],
      source: 'Wardrobe',
    };
  }

  return {
    imageUrl: item.image_url,
    name: item.name,
    brand: item.brand || null,
    price: item.price || null,
    material: asText(item.materials),
    size: null,
    description: item.description ?? null,
    colour: asText(item.colours),
    category: item.category ?? null,
    tags: item.tags ?? [],
    source: item.source ?? 'Catalogue',
  };
}

export const SOURCE_ICONS: Record<ItemDetails['source'], ComponentProps<typeof Ionicons>['name']> = {
  Wardrobe: 'shirt-outline',
  Wishlist: 'heart-outline',
  Catalogue: 'storefront-outline',
};

// options for the save popup dropdowns
export const OUTFIT_STYLES = ['Y2K', 'Classy', 'Casual', 'Streetwear', 'Bohemian', 'Minimalist', 'Preppy', 'Active', 'Vintage'];
export const OUTFIT_SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];

export type SaveOutfitInput = OutfitSaveDetails & { items: BuilderItem[]};

export async function saveOutfit({ name, style, season, occasion, items }: SaveOutfitInput): Promise<void> {
  const unique = [...new Map(items.map((i) => [i.id, i])).values()];

  await requestJson('outfits', {
    method: 'POST',
    body: JSON.stringify({
      name: name.trim() || undefined,
      style,
      season,
      occasion,
      items: unique.map((i) => ('name' in i ? { catalogue_items_id: i.id } : { wardrobe_items_id: i.id })),
    }),
  });
}
