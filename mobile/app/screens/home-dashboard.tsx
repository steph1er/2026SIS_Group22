import { ThemedView } from '../components/themed-view';
import { ThemedText } from '../components/themed-text';
import { PrimaryButton } from '../components/primary-button';
import { Link } from 'expo-router';
import { BackButton } from '../components/back-button';
import { OnboardingFormField } from '../components/onboarding-form-field';
import { StyleUTokens } from '../services/styleu-theme';

export default function HomeDashboardScreen() {
  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 24 }}>
      <ThemedText type="title">Good morning</ThemedText>
      <Link href="./screens/discover-search" asChild>
        <PrimaryButton label="Discover" />
      </Link>
      <Link href="./screens/digital-wardrobe" asChild>
        <PrimaryButton label="My Wardrobe" />
      </Link>
      <Link href="./screens/profile" asChild>
        <PrimaryButton label="Profile" />
      </Link>
    </ThemedView>
  );
}