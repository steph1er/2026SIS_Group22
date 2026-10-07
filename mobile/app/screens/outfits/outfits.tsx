import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '../../components/themed-view';
import { ThemedText } from '../../components/themed-text';
import { PrimaryButton } from '../../components/primary-button';

const ACCENT = '#D98E73';

/**
 * The Outfits tab: where the user creates outfits. Outfits are not stored by the
 * backend yet, so this shows the empty state and the create button only.
 */
export default function OutfitsScreen() {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText style={styles.title}>My Outfits</ThemedText>

          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="shirt-outline" size={28} color={ACCENT} />
            </View>
            <ThemedText style={styles.emptyTitle}>No outfits yet</ThemedText>
            <ThemedText style={styles.muted}>
              Put together pieces from your wardrobe and wishlist to build your first outfit.
            </ThemedText>
          </View>

          {/* TODO: open the outfit builder once it exists. */}
          <PrimaryButton label="Create Outfit" onPress={() => setNotice("Creating outfits isn't available yet.")} />

          {notice ? <ThemedText style={[styles.muted, styles.notice]}>{notice}</ThemedText> : null}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 18,
    paddingBottom: 110,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#ECEAE7',
    borderRadius: 18,
    paddingVertical: 36,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FBF0EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  muted: {
    opacity: 0.6,
    fontSize: 13,
    textAlign: 'center',
  },
  notice: {
    marginTop: -6,
  },
});
