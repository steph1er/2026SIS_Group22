import { ThemedView } from '../components/themed-view';
import { ThemedText } from '../components/themed-text';
import { PrimaryButton } from '../components/primary-button';
import { BottomNavBar } from '../components/bottom-nav-bar';
import { Link } from 'expo-router';

export default function ProfileScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 24 }}>
        <ThemedText type="title">My Profile</ThemedText>
        <ThemedText>Amanda Smith</ThemedText>

          <PrimaryButton label="AI Colour Analysis" />
          <PrimaryButton label="My Wardrobe" />
      </ThemedView>
      <BottomNavBar />
    </ThemedView>
  );
}
