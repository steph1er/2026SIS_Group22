import { supabase } from '../../../src/auth/supabase-client';
import { requestJson, toArray, WishlistApiError } from '../wishlist/wishlist-service';
import type { WardrobeItem, WardrobeItemChanges } from './wardrobe-types';

/**
 * Client for the backend wardrobe endpoints (backend/src/wardrobe/wardrobe.controller.ts):
 *
 *   GET    /wardrobes              -> all of the user's wardrobe_items rows (404 when empty)
 *   GET    /wardrobes/:id          -> one row, as a one-element array (404 if not the user's)
 *   POST   /wardrobes/update       -> body UpdateWardrobeItemDto, returns the updated row(s)
 *   DELETE /wardrobes/delete/:id   -> removes one row
 *
 * Every call sends the signed-in user's Supabase access token via authenticatedApiRequest.
 */

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
  if (Array.isArray(value)) return value.filter((entry): entry is string => typeof entry === 'string' && entry.trim() !== '');
  const single = asString(value);
  return single ? [single] : [];
}

// The public Supabase Storage bucket that holds uploaded wardrobe photos.
const WARDROBE_BUCKET = 'wardrobe-items';

// image_url holds a storage path for uploaded items (e.g. {userId}/{itemId}.png),
// or a full URL for rows added by hand. getPublicUrl only builds a string, with no request.
function wardrobeImageUrl(value: unknown): string | null {
  const path = asString(value);
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return supabase?.storage.from(WARDROBE_BUCKET).getPublicUrl(path).data.publicUrl ?? null;
}

export function normaliseWardrobeItem(raw: unknown): WardrobeItem {
  const row = (raw && typeof raw === 'object' ? raw : {}) as RawRow;

  return {
    id: asString(row.id) ?? '',
    // Prefer a ready-made URL if the backend ever sends one.
    imageUrl: asString(row.image_display_url) ?? wardrobeImageUrl(row.image_url),
    category: asString(row.clothing_category),
    styles: asStringArray(row.style),
    brand: asString(row.brand),
    size: asString(row.size),
    colours: asStringArray(row.colour),
    materials: asStringArray(row.material),
    tags: asStringArray(row.tags),
    price: asNumber(row.price),
    createdAt: asString(row.created_at),
    modifiedAt: asString(row.modified_at),
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

// Where the wardrobe item screen lives (view, edit and delete one item).
export function wardrobeItemHref(wardrobeItemId: string) {
  return { pathname: '/wardrobe-item/[id]', params: { id: wardrobeItemId } } as never;
}

/** The signed-in user's wardrobe, newest first. An empty wardrobe returns []. */
export async function fetchWardrobe(): Promise<WardrobeItem[]> {
  try {
    const rows = toArray(await requestJson('wardrobes'));
    return rows
      .map(normaliseWardrobeItem)
      .filter((item) => item.id)
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  } catch (error) {
    // The backend answers 404 "No wardrobe items found for current user" when the wardrobe is empty.
    if (error instanceof WishlistApiError && error.status === 404 && /wardrobe/i.test(error.message)) {
      return [];
    }
    throw error;
  }
}

/** One item from the signed-in user's wardrobe. Throws a 404 WishlistApiError if it isn't theirs. */
export async function fetchWardrobeItem(id: string): Promise<WardrobeItem> {
  const rows = toArray(await requestJson(`wardrobes/${encodeURIComponent(id)}`));
  if (rows.length === 0) throw new WishlistApiError('This item is no longer in your wardrobe.', 404);
  return normaliseWardrobeItem(rows[0]);
}

/**
 * Save edits to a wardrobe item and return the updated item.
 *
 * Every field is sent, even empty ones: the backend leaves fields it doesn't receive unchanged,
 * so sending "" / [] / null is what clears a field the user emptied. The image can't be edited.
 */
export async function updateWardrobeItem(id: string, changes: WardrobeItemChanges): Promise<WardrobeItem> {
  const result = await requestJson('wardrobes/update', {
    method: 'POST',
    body: JSON.stringify({
      id,
      clothing_category: changes.category.trim(),
      style: changes.styles,
      brand: changes.brand.trim(),
      size: changes.size.trim(),
      colour: changes.colours,
      material: changes.materials,
      tags: changes.tags,
      modified_at: new Date().toISOString(),
      price: changes.price,
    }),
  });

  const rows = toArray(result);
  if (rows.length === 0) throw new WishlistApiError('The item was not updated.', 500);
  return normaliseWardrobeItem(rows[0]);
}

/** Permanently remove an item from the signed-in user's wardrobe. */
export async function deleteWardrobeItem(id: string): Promise<void> {
  const result = await requestJson(`wardrobes/delete/${encodeURIComponent(id)}`, { method: 'DELETE' });

  // The backend returns Supabase's raw delete response, which carries its own error field.
  const supabaseError = (result as RawRow | null)?.error as RawRow | null | undefined;
  if (supabaseError) {
    throw new WishlistApiError(asString(supabaseError.message) ?? 'Could not delete the item.', 500);
  }
}
