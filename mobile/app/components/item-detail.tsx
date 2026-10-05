import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { useWishlist } from '../hooks/use-wishlist';
import { fetchCatalogueItem, fetchSimilarItems, itemDetailHref } from '../services/catalogue/catalogue-service';
import type { CatalogueItem } from '../services/wishlist/wishlist-types';

const ACCENT = '#D98E73';
const TEXT = '#22201F';
const MUTED = '#8A8683';
const PLACEHOLDER_IMAGE = 'https://placehold.co/600x800/F2EFEC/ABABAB/png?text=No+image';

function formatPrice(price: number | null) {
  if (price === null) return null;
  return Number.isInteger(price) ? `$${price}` : `$${price.toFixed(2)}`;
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/home-dashboard' as never);
}

type Loaded<T> = { id: string; data: T | null; error: string | null };

/**
 * Details for one catalogue item, opened with router.push(itemDetailHref(catalogueItemId))
 * from any screen (wishlist, recommendations, home dashboard...).
 */
export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const wishlist = useWishlist();

  const [item, setItem] = useState<Loaded<CatalogueItem> | null>(null);
  const [similar, setSimilar] = useState<Loaded<CatalogueItem[]> | null>(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    fetchCatalogueItem(id)
      .then((data) => {
        if (cancelled) return;
        setItem({ id, data, error: null });
        return fetchSimilarItems(data).then((items) => {
          if (!cancelled) setSimilar({ id, data: items, error: null });
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : 'Could not load this item.';
        setItem((previous) => (previous?.id === id && previous.data ? previous : { id, data: null, error: message }));
        setSimilar({ id, data: [], error: message });
      });

    return () => {
      cancelled = true;
    };
  }, [id, reloadCount]);

  // Ignore results that belong to the previous item while the next one loads.
  const current = item?.id === id ? item : null;
  const shown = current?.data ?? null;
  const similarItems = similar?.id === id ? similar.data ?? [] : [];

  if (!shown) {
    return (
      <ThemedView style={[styles.centered, { paddingTop: insets.top }]}>
        <TouchableOpacity style={[styles.circleButton, styles.floatingBack, { top: insets.top + 8 }]} onPress={goBack} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={22} color={TEXT} />
        </TouchableOpacity>
        {current?.error ? (
          <View style={styles.stateMessage}>
            <Ionicons name="cloud-offline-outline" size={28} color={ACCENT} />
            <ThemedText style={styles.stateTitle}>Couldn't load this item</ThemedText>
            <ThemedText style={styles.stateBody}>{current.error}</ThemedText>
            <TouchableOpacity onPress={() => setReloadCount((count) => count + 1)}>
              <ThemedText style={styles.stateAction}>Try again</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <ActivityIndicator />
        )}
      </ThemedView>
    );
  }

  const price = formatPrice(shown.price);
  const isSaved = wishlist.isSaved(shown.id);
  const isPending = wishlist.isPending(shown.id);
  const categoryLabel = shown.category ? titleCase(shown.category) : null;

  // The first chip (the colour) is highlighted, as in the design.
  const chips = [...shown.colours.slice(0, 1), categoryLabel, ...shown.styles.slice(0, 2)]
    .filter((chip): chip is string => Boolean(chip))
    .map(titleCase);

  const share = () => {
    const message = [shown.brand, shown.name, price].filter(Boolean).join(' · ');
    void Share.share(
      shown.productUrl ? { message: `${message}\n${shown.productUrl}`, url: shown.productUrl } : { message },
    );
  };

  // Opens the retailer's product page in the device's default browser.
  const openProductPage = () => {
    if (!shown.productUrl) return;
    Linking.openURL(shown.productUrl).catch(() => setNotice("Couldn't open the product page."));
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 + insets.bottom }}>
        <View>
          <Pressable
            onPress={openProductPage}
            disabled={!shown.productUrl}
            accessibilityRole="link"
            accessibilityLabel={`View ${shown.name} on the retailer's site`}
          >
            <Image source={{ uri: shown.imageUrl ?? PLACEHOLDER_IMAGE }} style={[styles.hero, { height: screenWidth * 0.95 }]} resizeMode="cover" />
          </Pressable>
          <View style={[styles.heroButtons, { top: insets.top + 8 }]}>
            <TouchableOpacity style={styles.circleButton} onPress={goBack} accessibilityLabel="Back">
              <Ionicons name="chevron-back" size={22} color={TEXT} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleButton} onPress={share} accessibilityLabel={`Share ${shown.name}`}>
              <Ionicons name="share-outline" size={20} color={TEXT} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.brandRow}>
            <ThemedText style={styles.brand} numberOfLines={1}>
              {shown.brand?.toUpperCase() ?? ''}
            </ThemedText>
            {price ? <ThemedText style={styles.price}>{price}</ThemedText> : null}
          </View>

          <ThemedText style={styles.name}>{shown.name}</ThemedText>

          {shown.description ? <ThemedText style={styles.description}>{shown.description}</ThemedText> : null}

          {chips.length > 0 ? (
            <View style={styles.chips}>
              {chips.map((chip, index) => (
                <View key={`${chip}-${index}`} style={[styles.chip, index === 0 && styles.chipHighlighted]}>
                  <ThemedText style={[styles.chipText, index === 0 && styles.chipTextHighlighted]}>{chip}</ThemedText>
                </View>
              ))}
            </View>
          ) : null}

          {wishlist.actionError || notice ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color="#8A2D1B" />
              <ThemedText style={styles.errorBannerText}>{wishlist.actionError ?? notice}</ThemedText>
              <TouchableOpacity
                onPress={() => {
                  wishlist.dismissActionError();
                  setNotice(null);
                }}
                accessibilityLabel="Dismiss"
              >
                <Ionicons name="close" size={18} color="#8A2D1B" />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {similarItems.length > 0 ? (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              {categoryLabel ? `Similar ${categoryLabel}` : 'Similar Items'}
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
              {similarItems.map((candidate) => (
                <SimilarItemCard
                  key={candidate.id}
                  item={candidate}
                  onPress={() => router.push(itemDetailHref(candidate.id))}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={() => void wishlist.toggle(shown)}
          disabled={isPending}
          accessibilityLabel={isSaved ? `Remove ${shown.name} from wishlist` : `Add ${shown.name} to wishlist`}
        >
          {isPending ? (
            <ActivityIndicator size="small" color={ACCENT} />
          ) : (
            <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={22} color={isSaved ? ACCENT : TEXT} />
          )}
          <ThemedText style={styles.wishlistButtonText}>{isSaved ? 'Added to Wishlist' : 'Add to Wishlist'}</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

function SimilarItemCard({ item, onPress }: { item: CatalogueItem; onPress: () => void }) {
  const price = formatPrice(item.price);
  return (
    <Pressable style={styles.similarCard} onPress={onPress} accessibilityLabel={item.name}>
      <Image source={{ uri: item.imageUrl ?? PLACEHOLDER_IMAGE }} style={styles.similarImage} />
      <ThemedText style={styles.similarName} numberOfLines={1}>
        {item.name}
      </ThemedText>
      {price ? <ThemedText style={styles.similarPrice}>{price}</ThemedText> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  floatingBack: {
    position: 'absolute',
    left: 20,
  },
  hero: {
    width: '100%',
    backgroundColor: '#F2EFEC',
  },
  heroButtons: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 20,
    gap: 12,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  brand: {
    flex: 1,
    fontSize: 14,
    letterSpacing: 0.5,
    color: MUTED,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
  },
  name: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: MUTED,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#E6E2DE',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#FAF9F7',
  },
  chipHighlighted: {
    borderColor: '#E8C3B5',
    backgroundColor: '#FBEEE9',
  },
  chipText: {
    fontSize: 13,
    color: MUTED,
  },
  chipTextHighlighted: {
    color: TEXT,
    fontWeight: '600',
  },
  section: {
    gap: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    paddingHorizontal: 20,
  },
  carousel: {
    gap: 14,
    paddingHorizontal: 20,
  },
  similarCard: {
    width: 140,
    gap: 2,
  },
  similarImage: {
    width: 140,
    height: 160,
    borderRadius: 14,
    backgroundColor: '#F2EFEC',
  },
  similarName: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
  },
  similarPrice: {
    fontSize: 13,
    color: MUTED,
  },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#fff',
  },
  wishlistButton: {
    flex: 1,
    height: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ECE8E4',
    backgroundColor: '#FAF9F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  wishlistButtonText: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FBE3DD',
    borderRadius: 12,
    padding: 12,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#8A2D1B',
  },
  stateMessage: {
    alignItems: 'center',
    gap: 6,
    padding: 24,
  },
  stateTitle: {
    fontWeight: '600',
    fontSize: 15,
  },
  stateBody: {
    fontSize: 13,
    lineHeight: 18,
    color: MUTED,
    textAlign: 'center',
  },
  stateAction: {
    color: ACCENT,
    fontWeight: '600',
    marginTop: 4,
  },
});
