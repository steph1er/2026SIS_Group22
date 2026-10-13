import { useMemo, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ThemedView } from '../../components/themed-view';
import { ThemedText } from '../../components/themed-text';
import { CatalogueItemCard } from '../../components/catalogue-item-card';
import { useWardrobe } from '../../hooks/use-wardrobe';
import { useWardrobeRecommendations, type RecommendationSection } from '../../hooks/use-wardrobe-recommendations';
import { useWishlist } from '../../hooks/use-wishlist';
import { wardrobeItemHref } from '../../services/wardrobe/wardrobe-service';
import type { WardrobeItem } from '../../services/wardrobe/wardrobe-types';
import { itemDetailHref } from '../../services/catalogue/catalogue-service';
import type { CatalogueItem } from '../../services/wishlist/wishlist-types';
import { useStyleUColors, useThemedStyles } from '../../hooks/use-theme';
import type { StyleUColors } from '../../services/styleu-theme';

const PLACEHOLDER_IMAGE = 'https://placehold.co/300x360/F2EFEC/ABABAB/png?text=No+image';

/** Image heights that repeat down each column, giving the staggered look used on the wishlist. */
const LEFT_HEIGHTS = [190, 240, 170, 220];
const RIGHT_HEIGHTS = [230, 170, 210, 180];

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function titleFor(item: WardrobeItem) {
  return item.category ? titleCase(item.category) : 'Untitled item';
}

function subtitleFor(item: WardrobeItem) {
  return [item.brand ? titleCase(item.brand) : null, item.size?.toUpperCase()].filter(Boolean).join(' • ');
}

function formatPrice(price: number | null) {
  return price === null ? null : `$${price.toFixed(2)}`;
}

function recommendationSubtitleFor(item: CatalogueItem) {
  return [item.brand, formatPrice(item.price)].filter(Boolean).join(' • ');
}

/**
 * The wardrobe shown under the Wardrobe tab on Saved. `header` is rendered at the top of the
 * scrolling content, so the page title and tab toggle scroll with the items.
 */
export function WardrobeCollection({ header }: { header: ReactNode }) {
  const colors = useStyleUColors();
  const styles = useThemedStyles(createStyles);
  const wardrobe = useWardrobe();
  const recommendations = useWardrobeRecommendations();
  const wishlist = useWishlist();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const item of wardrobe.items) {
      const name = item.category?.trim();
      if (name && !seen.has(name.toLowerCase())) seen.set(name.toLowerCase(), titleCase(name));
    }
    return [...seen.entries()].map(([key, label]) => ({ key, label }));
  }, [wardrobe.items]);

  // Drop a category filter that no longer matches anything (e.g. after deleting its last item).
  const activeCategory = category && categories.some((c) => c.key === category) ? category : null;

  const visibleItems = useMemo(() => {
    const search = query.trim().toLowerCase();
    return wardrobe.items.filter((item) => {
      if (activeCategory && item.category?.trim().toLowerCase() !== activeCategory) return false;
      if (!search) return true;
      return [item.category, item.brand, item.size, ...item.colours, ...item.styles, ...item.materials, ...item.tags]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(search));
    });
  }, [wardrobe.items, query, activeCategory]);

  const leftColumn = visibleItems.filter((_, index) => index % 2 === 0);
  const rightColumn = visibleItems.filter((_, index) => index % 2 === 1);
  const count = wardrobe.items.length;

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {header}

          <View style={styles.searchRow}>
            <View style={[styles.searchBar, { flex: 1 }]}>
              <Ionicons name="search" size={18} color={colors.subtleText} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={`Search my ${count} item${count === 1 ? '' : 's'}...`}
                placeholderTextColor={colors.subtleText}
                style={styles.searchInput}
                returnKeyType="search"
                autoCorrect={false}
              />
              {query ? (
                <TouchableOpacity onPress={() => setQuery('')} accessibilityLabel="Clear search">
                  <Ionicons name="close-circle" size={18} color={colors.subtleText} />
                </TouchableOpacity>
              ) : null}
            </View>
            <TouchableOpacity style={styles.iconCircle} onPress={wardrobe.refresh} accessibilityLabel="Refresh wardrobe">
              <Ionicons name="refresh" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>

          {categories.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {categories.map(({ key, label }) => {
                const selected = key === activeCategory;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => setCategory(selected ? null : key)}
                  >
                    <ThemedText style={[styles.chipText, selected && styles.chipTextSelected]}>
                      {selected ? `Category: ${label}` : label}
                    </ThemedText>
                    {selected ? <Ionicons name="close-circle-outline" size={16} color={colors.text} /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : null}

          {wardrobe.error ? (
            <StateMessage
              icon="cloud-offline-outline"
              title="Couldn't load your wardrobe"
              message={wardrobe.error}
              actionLabel="Try again"
              onAction={wardrobe.refresh}
            />
          ) : wardrobe.isLoading && count === 0 ? (
            <ActivityIndicator style={{ paddingVertical: 40 }} />
          ) : count === 0 ? (
            <StateMessage
              icon="shirt-outline"
              title="Your wardrobe is empty"
              message="Items you upload will show up here."
            />
          ) : visibleItems.length === 0 ? (
            <StateMessage icon="search-outline" title="No matching items" message="Try a different search or filter." />
          ) : (
            <View style={styles.masonry}>
              {[leftColumn, rightColumn].map((column, columnIndex) => (
                <View key={columnIndex} style={styles.column}>
                  {column.map((item, index) => {
                    const heights = columnIndex === 0 ? LEFT_HEIGHTS : RIGHT_HEIGHTS;
                    return (
                      <WardrobeTile
                        key={item.id}
                        item={item}
                        imageHeight={heights[index % heights.length]}
                        onPress={() => router.push(wardrobeItemHref(item.id))}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          )}

          {/* Recommendations from the ML recommender, 5 per category (GET /catalogue/reccomendations?category=...). */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Recommended for you</ThemedText>

            {!recommendations.isLoading && recommendations.sections.every((section) => section.items.length === 0 && !section.error) ? (
              <StateMessage icon="sparkles-outline" title="No recommendations yet" message="Check back soon." />
            ) : (
              recommendations.sections.map((section) => (
                <RecommendationSectionView
                  key={section.key}
                  section={section}
                  isLoading={recommendations.isLoading}
                  isSaved={wishlist.isSaved}
                  isPending={wishlist.isPending}
                  onToggleSaved={(item) => void wishlist.toggle(item)}
                  onPressItem={(item) => router.push(itemDetailHref(item.id))}
                />
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

type RecommendationSectionViewProps = {
  section: RecommendationSection;
  isLoading: boolean;
  isSaved: (itemId: string) => boolean;
  isPending: (itemId: string) => boolean;
  onToggleSaved: (item: CatalogueItem) => void;
  onPressItem: (item: CatalogueItem) => void;
};

function RecommendationSectionView({
  section,
  isLoading,
  isSaved,
  isPending,
  onToggleSaved,
  onPressItem,
}: RecommendationSectionViewProps) {
  const styles = useThemedStyles(createStyles);

  // Nothing to recommend yet for this category and it didn't error - skip it quietly
  // rather than showing an empty section for every category with nothing to offer.
  if (!isLoading && section.items.length === 0 && !section.error) return null;

  return (
    <View style={styles.subsection}>
      <ThemedText style={styles.subsectionTitle}>{section.label}</ThemedText>

      {section.error ? (
        <StateMessage icon="cloud-offline-outline" title="Couldn't load this category" message={section.error} />
      ) : isLoading && section.items.length === 0 ? (
        <ActivityIndicator style={{ paddingVertical: 16 }} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
          {section.items.map((item) => (
            <RecommendationCard
              key={item.id}
              item={item}
              isSaved={isSaved(item.id)}
              isPending={isPending(item.id)}
              onToggleSaved={() => onToggleSaved(item)}
              onPress={() => onPressItem(item)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

type RecommendationCardProps = {
  item: CatalogueItem;
  isSaved: boolean;
  isPending: boolean;
  onToggleSaved: () => void;
  onPress: () => void;
};

function RecommendationCard({ item, isSaved, isPending, onToggleSaved, onPress }: RecommendationCardProps) {
  const colors = useStyleUColors();
  const styles = useThemedStyles(createStyles);

  return (
    <CatalogueItemCard
      item={item}
      details={[recommendationSubtitleFor(item)].filter(Boolean)}
      onPress={onPress}
      nameLines={1}
      action={(
        <TouchableOpacity
          style={styles.heartButton}
          onPress={onToggleSaved}
          disabled={isPending}
          accessibilityLabel={isSaved ? `Remove ${item.name} from wishlist` : `Add ${item.name} to wishlist`}
        >
          {isPending ? (
            <ActivityIndicator size="small" color={colors.accentStrong} />
          ) : (
            <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={18} color={colors.accentStrong} />
          )}
        </TouchableOpacity>
      )}
    />
  );
}

type WardrobeTileProps = {
  item: WardrobeItem;
  imageHeight: number;
  onPress: () => void;
};

function WardrobeTile({ item, imageHeight, onPress }: WardrobeTileProps) {
  const styles = useThemedStyles(createStyles);
  const subtitle = subtitleFor(item);

  return (
    <Pressable onPress={onPress} style={styles.tile}>
      <Image
        source={{ uri: item.imageUrl ?? PLACEHOLDER_IMAGE }}
        style={[styles.tileImage, { height: imageHeight }]}
        resizeMode="contain"
      />
      <ThemedText style={styles.tileName} numberOfLines={2}>
        {titleFor(item)}
      </ThemedText>
      {subtitle ? (
        <ThemedText style={styles.tileSubtitle} numberOfLines={1}>
          {subtitle}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

type StateMessageProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

function StateMessage({ icon, title, message, actionLabel, onAction }: StateMessageProps) {
  const colors = useStyleUColors();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.stateMessage}>
      <Ionicons name={icon} size={28} color={colors.accentStrong} />
      <ThemedText style={styles.stateTitle}>{title}</ThemedText>
      <ThemedText style={styles.stateBody}>{message}</ThemedText>
      {actionLabel && onAction ? (
        <TouchableOpacity onPress={onAction}>
          <ThemedText style={styles.stateAction}>{actionLabel}</ThemedText>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const createStyles = (colors: StyleUColors) =>
  StyleSheet.create({
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 110,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 26,
    paddingHorizontal: 16,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  chips: {
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.card,
  },
  chipSelected: {
    borderColor: colors.accentStrong,
    backgroundColor: colors.accentSoft,
  },
  chipText: {
    fontSize: 13,
    color: colors.subtleText,
  },
  chipTextSelected: {
    color: colors.text,
    fontWeight: '600',
  },
  masonry: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  column: {
    flex: 1,
    gap: 18,
  },
  tile: {
    gap: 4,
  },
  tileImage: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: colors.imageBackdrop,
  },
  tileName: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
  },
  tileSubtitle: {
    fontSize: 13,
    color: colors.subtleText,
  },
  section: {
    gap: 12,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
  },
  subsection: {
    gap: 8,
  },
  subsectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.subtleText,
  },
  carousel: {
    gap: 12,
    paddingRight: 4,
  },
  heartButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  stateMessage: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  stateTitle: {
    fontWeight: '600',
    fontSize: 15,
  },
  stateBody: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.subtleText,
    textAlign: 'center',
  },
  stateAction: {
    color: colors.accentStrong,
    fontWeight: '600',
    marginTop: 4,
  },
});
