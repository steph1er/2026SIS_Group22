import { authenticatedApiRequest } from '../../../src/api/authenticated-api-client';
import type { CatalogueItem, WishlistEntry } from './wishlist-types';

/**
 * Client for the backend wishlist endpoints (backend/src/wishlist/wishlist.controller.ts):
 *
 *   GET    /wishlist              -> the user's wishlist rows joined with catalogue_items (404 when empty)
 *   POST   /wishlist/add          -> body { item_id, created_at }            (409 if already added)
 *   DELETE /wishlist/delete/:id   -> removes one wishlist row (id = wishlist.id, not the catalogue id)
 *
 * and GET /catalogue/reccomendations (spelled as in the backend) for the ML recommendations.
 *
 * Every call sends the signed-in user's Supabase access token via authenticatedApiRequest.
 */

// The backend URL the app calls, shown in connection errors to make them easier to fix.
const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim() || null;

// ---------------------------------------------------------------------------
// Normalising raw rows from the backend
// ---------------------------------------------------------------------------

type RawRow = Record<string, unknown>;

function asString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim().length > 0) return value;
  if (typeof value === 'number') return String(value);
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((entry): entry is string => typeof entry === 'string');
  const single = asString(value);
  return single ? [single] : [];
}

function firstOf(row: RawRow, keys: string[]): unknown {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null) return row[key];
  }
  return undefined;
}

// A Supabase join can come back as an object or a one-element array.
function asRow(value: unknown): RawRow | null {
  if (Array.isArray(value)) return asRow(value[0]);
  return value && typeof value === 'object' ? (value as RawRow) : null;
}

// Turn a catalogue_items row into a CatalogueItem, tolerating differences in column names.
export function normaliseCatalogueItem(raw: unknown): CatalogueItem {
  const row = asRow(raw) ?? {};
  const brandRow = asRow(row.brands);
  const images = asStringArray(firstOf(row, ['images', 'image_urls']));

  return {
    id: asString(row.id) ?? '',
    name: asString(firstOf(row, ['item_name', 'name', 'title'])) ?? 'Untitled item',
    brand:
      asString(brandRow ? firstOf(brandRow, ['brand_name', 'name']) : undefined) ??
      asString(firstOf(row, ['brand_name', 'brand'])),
    category: asString(firstOf(row, ['category', 'clothing_category'])),
    price: asNumber(row.price),
    imageUrl: asString(firstOf(row, ['image_url', 'imageURL', 'image', 'photo_url'])) ?? images[0] ?? null,
    colours: asStringArray(firstOf(row, ['colour', 'colours', 'color'])),
    styles: asStringArray(row.style),
    sizes: asStringArray(firstOf(row, ['available_sizes', 'sizes', 'size'])),
    materials: asStringArray(firstOf(row, ['materials', 'material'])),
    description: asString(firstOf(row, ['description', 'item_description'])),
    productUrl: asString(firstOf(row, ['product_url', 'url'])),
  };
}

// Turn a wishlist row (with its joined catalogue_items) into a WishlistEntry.
export function normaliseWishlistEntry(raw: unknown): WishlistEntry {
  const row = asRow(raw) ?? {};
  const item = normaliseCatalogueItem(row.catalogue_items);
  const catalogueItemId = asString(row.catalogue_item_id) ?? item.id;

  return {
    id: asString(row.id) ?? '',
    catalogueItemId,
    createdAt: asString(row.created_at),
    item: { ...item, id: item.id || catalogueItemId },
  };
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

/** An error from the backend, keeping the HTTP status so callers can react to 404/409. */
export class WishlistApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'WishlistApiError';
  }
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: unknown };
    if (Array.isArray(body.message)) return body.message.join(', ');
    if (typeof body.message === 'string') return body.message;
  } catch {
    // Body was not JSON; fall through to a generic message.
  }
  return `Request failed (${response.status}).`;
}

export async function requestJson(path: string, options: RequestInit = {}): Promise<unknown> {
  let response: Response;
  try {
    response = await authenticatedApiRequest(path, options);
  } catch (error) {
    // Network failures and missing configuration both land here.
    const message = error instanceof Error ? error.message : '';
    const isConnectionFailure =
      !message || /network request failed|could not connect|fetch failed|failed to fetch|timed out|offline/i.test(message);
    throw new WishlistApiError(
      isConnectionFailure
        ? `Can't reach the backend at ${apiUrl ?? '(EXPO_PUBLIC_API_URL not set)'}. Make sure it is running (cd backend && npm run start:dev) and that this address is reachable from your phone or simulator.`
        : message,
      0,
    );
  }

  if (!response.ok) {
    let message = await readErrorMessage(response);
    if (message === 'No user found') {
      // The backend looks up profiles.id first. With only the publishable key, row-level security hides it.
      message =
        'The backend could not find your profile. Check backend/.env has SUPABASE_SECRET_KEY set, then restart the backend.';
    }
    throw new WishlistApiError(message, response.status);
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as unknown) : null;
}

export function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : value ? [value] : [];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** The signed-in user's wishlist, newest first. An empty wishlist returns []. */
export async function fetchWishlist(): Promise<WishlistEntry[]> {
  try {
    const rows = toArray(await requestJson('wishlist'));
    return rows
      .map(normaliseWishlistEntry)
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  } catch (error) {
    // The backend answers 404 "No wishlist found for current user" when the list is empty.
    if (error instanceof WishlistApiError && error.status === 404 && /wishlist/i.test(error.message)) {
      return [];
    }
    throw error;
  }
}


// Add a catalogue item to the wishlist. `catalogueItemId` is catalogue_items.id.
export async function addToWishlist(catalogueItemId: string): Promise<void> {
  await requestJson('wishlist/add', {
    method: 'POST',
    body: JSON.stringify({ item_id: catalogueItemId, created_at: new Date().toISOString() }),
  });
}

// Remove an entry from the wishlist. `wishlistId` is wishlist.id (not the catalogue item id).
export async function removeFromWishlist(wishlistId: string): Promise<void> {
  const result = await requestJson(`wishlist/delete/${encodeURIComponent(wishlistId)}`, { method: 'DELETE' });

  // The backend returns Supabase's raw delete response, which carries its own error field.
  const supabaseError = asRow(result)?.error;
  if (supabaseError) {
    const message = asString(asRow(supabaseError)?.message) ?? 'Could not remove the item.';
    throw new WishlistApiError(message, 500);
  }
}

// Items the ML recommender suggests adding to the wishlist. No recommendations (404) returns [].
export async function fetchRecommendations(): Promise<CatalogueItem[]> {
  try {
    const rows = toArray(await requestJson('catalogue/reccomendations'));
    return rows.map(normaliseCatalogueItem).filter((item) => item.id);
  } catch (error) {
    if (error instanceof WishlistApiError && error.status === 404) return [];
    throw error;
  }
}

// A short, user-facing explanation for a failed add.
export function describeAddError(error: unknown): string {
  if (error instanceof WishlistApiError) {
    if (error.status === 409) return 'That item is already on your wishlist.';
    return error.message;
  }
  return error instanceof Error ? error.message : 'Could not add the item.';
}
