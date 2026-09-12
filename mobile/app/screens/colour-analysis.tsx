import { CameraView } from 'expo-camera'; 

import { ThemedView } from '../components/themed-view';
import { ThemedText } from '../components/themed-text';
import { PrimaryButton } from '../components/primary-button';
import { BottomNavBar } from '../components/bottom-nav-bar';
import { Link } from 'expo-router';

export default function ColourAnalysisScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 24 }}>
        <ThemedText type="title">Colour Analysis</ThemedText>
        <ThemedText>Search for clothes, styles, colors...</ThemedText>

          <PrimaryButton label="View Item" />
      </ThemedView>
      <BottomNavBar />
    </ThemedView>
  );
}