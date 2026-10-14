/**
 * Shapes used by the My Wardrobe screens.
 *
 * The backend (NestJS `wardrobe` module) returns raw rows of `public.wardrobe_items`.
 * They are normalised into the types below so the UI never depends on exact column names.
 */

// One item in the signed-in user's wardrobe (a row of public.wardrobe_items).
export type WardrobeItem = {
  // wardrobe_items.id — used for GET /wardrobes/:id, POST /wardrobes/update and DELETE /wardrobes/delete/:id.
  id: string;
  // A URL the app can display, built from wardrobe_items.image_url (a storage path or a full URL).
  imageUrl: string | null;
  category: string | null;
  styles: string[];
  brand: string | null;
  size: string | null;
  colours: string[];
  materials: string[];
  tags: string[];
  price: number | null;
  createdAt: string | null;
  modifiedAt: string | null;
};

// The editable fields of a wardrobe item, as entered on the edit form. The image is set on upload only.
export type WardrobeItemChanges = {
  category: string;
  styles: string[];
  brand: string;
  size: string;
  colours: string[];
  materials: string[];
  tags: string[];
  price: number | null;
};
