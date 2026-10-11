import { normaliseWardrobeItem } from '../wardrobe/wardrobe-service';
import { normaliseCatalogueItem, requestJson, toArray, WishlistApiError } from '../wishlist/wishlist-service';

export type SavedOutfitItem = {
  id: string;
  itemId: string;
  label: string;
  imageUrl: string | null;
  source: 'Wardrobe' | 'Catalogue';
};

export type SavedOutfit = {
  id: string;
  name: string;
  style: string | null;
  season: string | null;
  occasion: string | null;
  createdAt: string | null;
  items: SavedOutfitItem[];
};

type RawRow = Record<string, unknown>;

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function asRow(value: unknown): RawRow | null {
  if (Array.isArray(value)) return asRow(value[0]);
  return value && typeof value === 'object' ? (value as RawRow) : null;
}

function normaliseOutfitItem(raw: unknown): SavedOutfitItem | null {
  const row = asRow(raw);
  if (!row) return null;

  const id = asString(row.id) ?? '';
  const itemId = asString(row.wardrobe_items_id) ?? asString(row.catalogue_items_id) ?? '';
  const wardrobeRow = asRow(row.wardrobe_items);
  const catalogueRow = asRow(row.catalogue_items);

  if (wardrobeRow) {
    const item = normaliseWardrobeItem(wardrobeRow);
    return { id, itemId, label: item.category ?? 'Item', imageUrl: item.imageUrl, source: 'Wardrobe' };
  }

  if (catalogueRow) {
    const item = normaliseCatalogueItem(catalogueRow);
    return { id, itemId, label: item.name, imageUrl: item.imageUrl, source: 'Catalogue' };
  }

  return { id, itemId, label: 'Item', imageUrl: null, source: row.wardrobe_items_id ? 'Wardrobe' : 'Catalogue' };
}

function normaliseOutfit(raw: unknown): SavedOutfit | null {
  const row = asRow(raw);
  const id = row ? asString(row.id) : null;
  if (!row || !id) return null;

  return {
    id,
    name: asString(row.name) ?? 'My outfit',
    style: asString(row.style),
    season: asString(row.season),
    occasion: asString(row.occasion),
    createdAt: asString(row.created_at),
    items: toArray(row.outfit_items)
      .map(normaliseOutfitItem)
      .filter((item): item is SavedOutfitItem => item !== null),
  };
}

export async function fetchSavedOutfits(): Promise<SavedOutfit[]> {
  try {
    const rows = toArray(await requestJson('outfits'));
    return rows
      .map(normaliseOutfit)
      .filter((outfit): outfit is SavedOutfit => outfit !== null)
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  } catch (error) {
    if (error instanceof WishlistApiError && error.status === 404 && /outfit/i.test(error.message)) {
      return [];
    }
    throw error;
  }
}

export async function deleteSavedOutfit(outfitId: string): Promise<void> {
  await requestJson(`outfits/${encodeURIComponent(outfitId)}`, { method: 'DELETE' });
}