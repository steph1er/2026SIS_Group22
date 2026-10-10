import { Redirect } from 'expo-router';

// The wardrobe now lives under the Wardrobe tab on Saved; keep old links working.
export default function WardrobeRedirect() {
  return <Redirect href="/saved?tab=wardrobe" />;
}
