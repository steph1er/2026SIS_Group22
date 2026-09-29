import { normaliseCatalogueItem, requestJson, toArray, WishlistApiError } from '../wishlist/wishlist-service';
import type { CatalogueItem } from '../wishlist/wishlist-types';

/**
 * Client for the backend catalogue endpoints (backend/src/catalogue/catalogue.controller.ts):
 *
 *   GET /catalogue/:id      -> one catalogue_items row with its brand
 *   GET /catalogue/search   -> up to 10 matching rows (404 when nothing matches)
 */

// Where the item detail screen lives. Push this from any screen that shows catalogue items.
export function itemDetailHref(catalogueItemId: string) {
  return { pathname: '/item/[id]', params: { id: catalogueItemId } } as never;
}

export async function fetchCatalogueItem(id: string): Promise<CatalogueItem> {
  const rows = toArray(await requestJson(`catalogue/${encodeURIComponent(id)}`));
  if (rows.length === 0) throw new WishlistApiError('This item is no longer in the catalogue.', 404);
  return normaliseCatalogueItem(rows[0]);
}

// Other items in the same category, excluding the item itself. Nothing similar returns [].
export async function fetchSimilarItems(item: CatalogueItem): Promise<CatalogueItem[]> {
  if (!item.category) return [];

  try {
    const query = new URLSearchParams({ clothingcategory: item.category });
    const rows = toArray(await requestJson(`catalogue/search?${query.toString()}`));
    return rows.map(normaliseCatalogueItem).filter((candidate) => candidate.id && candidate.id !== item.id);
  } catch (error) {
    if (error instanceof WishlistApiError && error.status === 404) return [];
    throw error;
  }
}
