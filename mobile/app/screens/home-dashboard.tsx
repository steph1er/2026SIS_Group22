import { ThemedView } from '../components/themed-view';
import { ThemedText } from '../components/themed-text';
import { PrimaryButton } from '../components/primary-button';
import { Link } from 'expo-router';
import { BottomNavBar } from '../components/bottom-nav-bar';

export default function HomeDashboardScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedView
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 16,
          padding: 24,
        }}
      >
        <ThemedText type="title">Good morning</ThemedText>

        <Link href="./discover-search" asChild>
          <PrimaryButton label="Discover" />
        </Link>

        <Link href="./profile" asChild>
          <PrimaryButton label="Profile" />
        </Link>
      </ThemedView>

      <BottomNavBar />
    </ThemedView>
  );
}