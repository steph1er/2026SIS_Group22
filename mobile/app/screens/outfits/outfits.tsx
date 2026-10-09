import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { router } from 'expo-router';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';

import { StyleUTokens } from '../../services/styleu-theme';

const ACCENT = '#D98E73';

export default function OutfitsScreen() {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.titleContainer}>
            <ThemedText style={styles.title}>My Outfits</ThemedText>
              <TouchableOpacity onPress={() => router.push('./create-outfit')} style={styles.button}>
                <Text style={styles.buttonText}>Create Outfit</Text>
              </TouchableOpacity>
          </View>

          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="shirt-outline" size={28} color={ACCENT} />
            </View>
            <ThemedText style={styles.emptyTitle}>No outfits yet</ThemedText>
            <ThemedText style={styles.muted}>
              Put together pieces from your wardrobe and wishlist to build your first outfit.
            </ThemedText>
          </View>

          {notice ? <ThemedText style={[styles.muted, styles.notice]}>{notice}</ThemedText> : null}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: StyleUTokens.colors.accent,
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: StyleUTokens.colors.buttonText,
    fontWeight: '600',
    fontSize: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
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
