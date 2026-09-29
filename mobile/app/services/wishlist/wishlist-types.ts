/**
 * Shapes used by the Saved / Wishlist screen.
 *
 * The backend (NestJS `wishlist` module) returns rows of `public.wishlist` joined with
 * `catalogue_items`. Those raw rows are normalised into the types below so the UI never
 * depends on exact column names.
 */

// A product from the shop catalogue (a row of public.catalogue_items).
export type CatalogueItem = {
  // catalogue_items.id — this is the value the backend expects as `item_id` when adding.
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  price: number | null;
  imageUrl: string | null;
  colours: string[];
  styles: string[];
  sizes: string[];
  materials: string[];
  description: string | null;
  // catalogue_items.product_url — the shop's page for the item, used when sharing.
  productUrl: string | null;
};

// One entry on the signed-in user's wishlist (a row of public.wishlist).
export type WishlistEntry = {
  // wishlist.id — used for GET /wishlist/:id and DELETE /wishlist/delete/:id.
  id: string;
  // wishlist.catalogue_item_id
  catalogueItemId: string;
  createdAt: string | null;
  item: CatalogueItem;
};
