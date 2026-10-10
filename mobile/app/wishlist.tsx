import { Redirect } from 'expo-router';

// The wishlist now lives under the Wishlist tab on Saved; keep old links working.
export default function WishlistRedirect() {
  return <Redirect href="/saved?tab=wishlist" />;
}
