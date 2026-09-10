import { ThemedView } from '../components/themed-view';
import { ThemedText } from '../components/themed-text';
import { PrimaryButton } from '../components/primary-button';
import { BottomNavBar } from '../components/bottom-nav-bar';
import { Link } from 'expo-router'; 

export default function WishlistSavedScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 24 }}>
        <ThemedText type="title">Autumn Favourites</ThemedText>
        <ThemedText>Saved Outfits (8) · Wishlist (16)</ThemedText>

          <PrimaryButton label="View Item" />
      </ThemedView>
      <BottomNavBar />
    </ThemedView>
  );
} 