import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { router } from 'expo-router';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';

import { useSavedOutfits } from '../../hooks/use-saved-outfits';
import { StyleUTokens } from '../../services/styleu-theme';

const ACCENT = '#D98E73';
const { colors } = StyleUTokens;

const handleDeleteOutfit = (outfitId: string) => {
  // TODO: implement delete outfit functionality
}

export default function OutfitsScreen() {
  const [notice, setNotice] = useState<string | null>(null);
  const { outfits, isLoading, error, refresh } = useSavedOutfits();

  const showEmptyState = !isLoading && !error && outfits.length === 0;

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

          {isLoading && outfits.length === 0 ? <ActivityIndicator color={ACCENT} /> : null}

          {error ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.muted}>{error}</ThemedText>
              <TouchableOpacity onPress={refresh}>
                <Text style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {showEmptyState ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="shirt-outline" size={28} color={ACCENT} />
              </View>
              <ThemedText style={styles.emptyTitle}>No outfits yet</ThemedText>
              <ThemedText style={styles.muted}>
                Put together pieces from your wardrobe and wishlist to build your first outfit.
              </ThemedText>
            </View>
          ) : null}

          {outfits.map((outfit) => (

            <View key={outfit.id} style={styles.itemsInOutfitContainer}>
              {/* items in outfit */}
              <View style={styles.titleContainer}>
                <Text style={styles.outfitName} numberOfLines={1}>{outfit.name}</Text>
                <TouchableOpacity onPress={() => handleDeleteOutfit(outfit.id)} style={styles.deleteButton}>
                  <Ionicons name="close" size={18} color={colors.buttonText} />
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.outfitItemsGrid}>
                  {outfit.items.map((outfitItem) => (
                    <View key={outfitItem.id} style={styles.itemCard}>
                      {outfitItem.imageUrl ? (
                        <Image source={{ uri: outfitItem.imageUrl }} style={styles.itemImage} />
                      ) : (
                        <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                          <Ionicons name="shirt-outline" size={24} color={ACCENT} />
                        </View>
                      )}
                      <Text style={styles.itemName} numberOfLines={1}>{outfitItem.label}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          ))}

          {notice ? <ThemedText style={[styles.muted, styles.notice]}>{notice}</ThemedText> : null}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  itemsInOutfitContainer: {
    backgroundColor: colors.mutedAccent,
    borderRadius: 16,
    paddingVertical: 8,
  },
  outfitName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 500,
    paddingHorizontal: 20,
    paddingVertical: 8,
    flexShrink: 1,
  },
  deleteButton: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    justifyContent: 'center',
    marginRight: 8,
    paddingHorizontal: 8,
  },
  outfitItemsGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom:6,
  },
  itemCard: {
    width: 100,
    backgroundColor: colors.mutedBackground,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImage: {
    paddingTop: 8,
    width: '85%',
    aspectRatio: 1,
    resizeMode: 'cover',
  },
  itemImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    padding: 8,
    minHeight: 43,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.buttonText,
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
  errorContainer: {
    alignItems: 'center',
    gap: 8
  },
  retryText: {
    color: ACCENT,
    fontSize: 14,
    fontWeight: '600'
  },
});
