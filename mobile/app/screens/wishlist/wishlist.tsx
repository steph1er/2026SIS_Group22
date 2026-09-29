import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
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
import { useWishlist } from '../../hooks/use-wishlist';
import { fetchWishlistEntry } from '../../services/wishlist/wishlist-service';
import type { CatalogueItem, WishlistEntry } from '../../services/wishlist/wishlist-types';

const ACCENT = '#D98E73';
const TEXT = '#22201F';
const MUTED = '#8A8683';
const PLACEHOLDER_IMAGE = 'https://placehold.co/300x360/F2EFEC/ABABAB/png?text=No+image';

/** Image heights that repeat down each column, giving the staggered look from the design. */
const LEFT_HEIGHTS = [190, 240, 170, 220];
const RIGHT_HEIGHTS = [230, 170, 210, 180];

type SortOrder = 'newest' | 'price-asc' | 'price-desc';

const SORT_LABELS: Record<SortOrder, string> = {
  newest: 'Newest first',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
};

function formatPrice(price: number | null) {
  return price === null ? null : `$${price.toFixed(2)}`;
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function subtitleFor(item: CatalogueItem) {
  return [item.category ? titleCase(item.category) : null, item.brand].filter(Boolean).join(' • ');
}

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/wishlist-saved' as never);
}

export default function WishlistScreen() {
  const wishlist = useWishlist({ includeRecommendations: true });
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<WishlistEntry | null>(null);

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const entry of wishlist.wishlist) {
      const name = entry.item.category?.trim();
      if (name && !seen.has(name.toLowerCase())) seen.set(name.toLowerCase(), titleCase(name));
    }
    return [...seen.entries()].map(([key, label]) => ({ key, label }));
  }, [wishlist.wishlist]);

  // Drop a category filter that no longer matches anything (e.g. after removing its last item).
  const activeCategory = category && categories.some((c) => c.key === category) ? category : null;

  const visibleEntries = useMemo(() => {
    const search = query.trim().toLowerCase();
    const filtered = wishlist.wishlist.filter((entry) => {
      const { item } = entry;
      if (activeCategory && item.category?.trim().toLowerCase() !== activeCategory) return false;
      if (!search) return true;
      return [item.name, item.brand, item.category, ...item.colours, ...item.styles]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(search));
    });
    if (sortOrder === 'newest') return filtered;
    const direction = sortOrder === 'price-asc' ? 1 : -1;
    return [...filtered].sort((a, b) => direction * ((a.item.price ?? Infinity) - (b.item.price ?? Infinity)));
  }, [wishlist.wishlist, query, activeCategory, sortOrder]);

  const leftColumn = visibleEntries.filter((_, index) => index % 2 === 0);
  const rightColumn = visibleEntries.filter((_, index) => index % 2 === 1);
  const count = wishlist.wishlist.length;

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <TouchableOpacity onPress={goBack} style={styles.breadcrumb} hitSlop={8} accessibilityLabel="Back to My Collections">
                <Ionicons name="chevron-back" size={14} color={MUTED} />
                <ThemedText style={styles.breadcrumbText}>My Collections</ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.title}>Wishlist</ThemedText>
            </View>
            <TouchableOpacity
              style={styles.iconCircle}
              onPress={() => setMenuVisible(true)}
              accessibilityLabel="Wishlist options"
            >
              <Ionicons name="ellipsis-vertical" size={18} color={TEXT} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={MUTED} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={`Search my ${count} item${count === 1 ? '' : 's'}...`}
              placeholderTextColor={MUTED}
              style={styles.searchInput}
              returnKeyType="search"
              autoCorrect={false}
            />
            {query ? (
              <TouchableOpacity onPress={() => setQuery('')} accessibilityLabel="Clear search">
                <Ionicons name="close-circle" size={18} color={MUTED} />
              </TouchableOpacity>
            ) : null}
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
                    {selected ? <Ionicons name="close-circle-outline" size={16} color={TEXT} /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : null}

          {wishlist.actionError ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color="#8A2D1B" />
              <ThemedText style={styles.errorBannerText}>{wishlist.actionError}</ThemedText>
              <TouchableOpacity onPress={wishlist.dismissActionError} accessibilityLabel="Dismiss">
                <Ionicons name="close" size={18} color="#8A2D1B" />
              </TouchableOpacity>
            </View>
          ) : null}

          {wishlist.wishlistError ? (
            <StateMessage
              icon="cloud-offline-outline"
              title="Couldn't load your wishlist"
              message={wishlist.wishlistError}
              actionLabel="Try again"
              onAction={wishlist.refresh}
            />
          ) : wishlist.isWishlistLoading && count === 0 ? (
            <ActivityIndicator style={{ paddingVertical: 40 }} />
          ) : count === 0 ? (
            <StateMessage
              icon="heart-outline"
              title="Your wishlist is empty"
              message="Tap the heart on a recommended item below to save it here."
            />
          ) : visibleEntries.length === 0 ? (
            <StateMessage icon="search-outline" title="No matching items" message="Try a different search or filter." />
          ) : (
            <View style={styles.masonry}>
              {[leftColumn, rightColumn].map((column, columnIndex) => (
                <View key={columnIndex} style={styles.column}>
                  {column.map((entry, index) => {
                    const heights = columnIndex === 0 ? LEFT_HEIGHTS : RIGHT_HEIGHTS;
                    return (
                      <WishlistTile
                        key={entry.id}
                        entry={entry}
                        imageHeight={heights[index % heights.length]}
                        isPending={wishlist.isPending(entry.catalogueItemId)}
                        onPress={() => setSelectedEntry(entry)}
                        onRemove={() => void wishlist.remove(entry)}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          )}

          {/* Recommendations from the ML recommender (GET /catalogue/reccomendations). */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText style={styles.sectionTitle}>Recommended for you</ThemedText>
            </View>

            {wishlist.recommendationsError ? (
              <StateMessage
                icon="cloud-offline-outline"
                title="Couldn't load recommendations"
                message={wishlist.recommendationsError}
                actionLabel="Try again"
                onAction={wishlist.refresh}
              />
            ) : wishlist.isRecommendationsLoading && wishlist.recommendations.length === 0 ? (
              <ActivityIndicator style={{ paddingVertical: 24 }} />
            ) : wishlist.recommendations.length === 0 ? (
              <StateMessage icon="sparkles-outline" title="No recommendations yet" message="Check back soon." />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
                {wishlist.recommendations.map((item) => (
                  <RecommendationCard
                    key={item.id}
                    item={item}
                    isSaved={wishlist.isSaved(item.id)}
                    isPending={wishlist.isPending(item.id)}
                    onToggleSaved={() => void wishlist.toggle(item)}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      <OptionsMenu
        visible={menuVisible}
        sortOrder={sortOrder}
        onClose={() => setMenuVisible(false)}
        onRefresh={() => {
          setMenuVisible(false);
          wishlist.refresh();
        }}
        onSort={(order) => {
          setMenuVisible(false);
          setSortOrder(order);
        }}
      />

      <WishlistItemModal
        entry={selectedEntry}
        isPending={selectedEntry ? wishlist.isPending(selectedEntry.catalogueItemId) : false}
        onClose={() => setSelectedEntry(null)}
        onRemove={(entry) => {
          setSelectedEntry(null);
          void wishlist.remove(entry);
        }}
      />
    </ThemedView>
  );
}

type WishlistTileProps = {
  entry: WishlistEntry;
  imageHeight: number;
  isPending: boolean;
  onPress: () => void;
  onRemove: () => void;
};

function WishlistTile({ entry, imageHeight, isPending, onPress, onRemove }: WishlistTileProps) {
  const { item } = entry;
  const subtitle = subtitleFor(item);

  return (
    <Pressable onPress={onPress} style={[styles.tile, isPending && { opacity: 0.5 }]}>
      <View>
        <Image source={{ uri: item.imageUrl ?? PLACEHOLDER_IMAGE }} style={[styles.tileImage, { height: imageHeight }]} />
        <TouchableOpacity
          style={styles.removeCircle}
          onPress={onRemove}
          disabled={isPending}
          hitSlop={6}
          accessibilityLabel={`Remove ${item.name} from wishlist`}
        >
          {isPending ? <ActivityIndicator size="small" color={TEXT} /> : <Ionicons name="close" size={16} color={TEXT} />}
        </TouchableOpacity>
      </View>
      <ThemedText style={styles.tileName} numberOfLines={2}>
        {item.name}
      </ThemedText>
      {subtitle ? (
        <ThemedText style={styles.tileSubtitle} numberOfLines={1}>
          {subtitle}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

type RecommendationCardProps = {
  item: CatalogueItem;
  isSaved: boolean;
  isPending: boolean;
  onToggleSaved: () => void;
};

function RecommendationCard({ item, isSaved, isPending, onToggleSaved }: RecommendationCardProps) {
  const price = formatPrice(item.price);

  return (
    <View style={styles.recCard}>
      <Image source={{ uri: item.imageUrl ?? PLACEHOLDER_IMAGE }} style={styles.recImage} />
      <TouchableOpacity
        style={styles.heartButton}
        onPress={onToggleSaved}
        disabled={isPending}
        accessibilityLabel={isSaved ? `Remove ${item.name} from wishlist` : `Add ${item.name} to wishlist`}
      >
        {isPending ? (
          <ActivityIndicator size="small" color={ACCENT} />
        ) : (
          <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={18} color={ACCENT} />
        )}
      </TouchableOpacity>
      <ThemedText style={styles.tileName} numberOfLines={1}>
        {item.name}
      </ThemedText>
      <ThemedText style={styles.tileSubtitle} numberOfLines={1}>
        {[item.brand, price].filter(Boolean).join(' • ')}
      </ThemedText>
    </View>
  );
}

type OptionsMenuProps = {
  visible: boolean;
  sortOrder: SortOrder;
  onClose: () => void;
  onRefresh: () => void;
  onSort: (order: SortOrder) => void;
};

function OptionsMenu({ visible, sortOrder, onClose, onRefresh, onSort }: OptionsMenuProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.menuOverlay} onPress={onClose}>
        <Pressable style={styles.menu} onPress={(event) => event.stopPropagation()}>
          <TouchableOpacity style={styles.menuRow} onPress={onRefresh}>
            <Ionicons name="refresh" size={18} color={TEXT} />
            <ThemedText style={styles.menuText}>Refresh</ThemedText>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          {(Object.keys(SORT_LABELS) as SortOrder[]).map((order) => (
            <TouchableOpacity key={order} style={styles.menuRow} onPress={() => onSort(order)}>
              <Ionicons name={order === sortOrder ? 'checkmark' : 'swap-vertical'} size={18} color={order === sortOrder ? ACCENT : TEXT} />
              <ThemedText style={styles.menuText}>{SORT_LABELS[order]}</ThemedText>
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

type WishlistItemModalProps = {
  entry: WishlistEntry | null;
  isPending: boolean;
  onClose: () => void;
  onRemove: (entry: WishlistEntry) => void;
};

/** Item details. Shows the cached entry at once, then refreshes it from GET /wishlist/:id. */
function WishlistItemModal({ entry, isPending, onClose, onRemove }: WishlistItemModalProps) {
  const [details, setDetails] = useState<WishlistEntry | null>(null);
  const [error, setError] = useState<{ id: string; message: string } | null>(null);
  const entryId = entry?.id ?? null;

  useEffect(() => {
    if (!entryId) return;
    let cancelled = false;
    fetchWishlistEntry(entryId)
      .then((fresh) => {
        if (!cancelled) setDetails(fresh);
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError({ id: entryId, message: reason instanceof Error ? reason.message : 'Could not refresh details.' });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [entryId]);

  const errorMessage = error && error.id === entryId ? error.message : null;
  const shown = details && details.id === entry?.id ? details : entry;
  if (!shown) return null;

  const { item } = shown;
  const price = formatPrice(item.price);
  const facts: [string, string][] = [
    ['Category', item.category ? titleCase(item.category) : ''],
    ['Colour', item.colours.join(', ')],
    ['Style', item.styles.join(', ')],
    ['Sizes', item.sizes.join(', ')],
    ['Material', item.materials.join(', ')],
    ['Saved', shown.createdAt ? new Date(shown.createdAt).toLocaleDateString() : ''],
  ].filter((fact): fact is [string, string] => fact[1].length > 0);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
          <Image source={{ uri: item.imageUrl ?? PLACEHOLDER_IMAGE }} style={styles.modalImage} />
          <TouchableOpacity style={styles.modalClose} onPress={onClose} accessibilityLabel="Close">
            <Ionicons name="close" size={20} color={TEXT} />
          </TouchableOpacity>

          <View style={styles.modalBody}>
            <ThemedText style={[styles.modalTitle, styles.modalText]}>{item.name}</ThemedText>
            {item.brand || price ? (
              <ThemedText style={[styles.tileSubtitle, styles.modalText]}>
                {[item.brand, price].filter(Boolean).join(' · ')}
              </ThemedText>
            ) : null}

            {facts.map(([label, value]) => (
              <View key={label} style={styles.factRow}>
                <ThemedText style={styles.factLabel}>{label}</ThemedText>
                <ThemedText style={[styles.factValue, styles.modalText]}>{value}</ThemedText>
              </View>
            ))}

            {errorMessage ? <ThemedText style={styles.factLabel}>{errorMessage}</ThemedText> : null}

            <TouchableOpacity
              style={[styles.removeButton, isPending && { opacity: 0.5 }]}
              disabled={isPending}
              onPress={() => onRemove(shown)}
            >
              <Ionicons name="heart-dislike-outline" size={18} color="#fff" />
              <ThemedText style={styles.removeButtonText}>Remove from wishlist</ThemedText>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
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
  return (
    <View style={styles.stateMessage}>
      <Ionicons name={icon} size={28} color={ACCENT} />
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

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
  },
  breadcrumbText: {
    fontSize: 14,
    color: MUTED,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '600',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4F2F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F6F4F2',
    borderWidth: 1,
    borderColor: '#ECE8E4',
    borderRadius: 26,
    paddingHorizontal: 16,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: TEXT,
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
    borderColor: '#E6E2DE',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  chipSelected: {
    borderColor: ACCENT,
    backgroundColor: '#FBEEE9',
  },
  chipText: {
    fontSize: 13,
    color: MUTED,
  },
  chipTextSelected: {
    color: TEXT,
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
    backgroundColor: '#F2EFEC',
  },
  removeCircle: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileName: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
  },
  tileSubtitle: {
    fontSize: 13,
    color: MUTED,
  },
  section: {
    gap: 12,
    marginTop: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
  },
  carousel: {
    gap: 12,
    paddingRight: 4,
  },
  recCard: {
    width: 150,
    gap: 2,
  },
  recImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    backgroundColor: '#F2EFEC',
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
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
    backgroundColor: '#F8F6F4',
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
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'flex-end',
    paddingTop: 110,
    paddingHorizontal: 20,
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 6,
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 15,
    color: TEXT,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#EFEDEB',
    marginVertical: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  modalImage: {
    width: '100%',
    height: 280,
    backgroundColor: '#F2EFEC',
  },
  modalClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: 18,
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  // The modal card is always white, so keep its text dark in dark mode too.
  modalText: {
    color: TEXT,
  },
  factRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  factLabel: {
    fontSize: 13,
    color: MUTED,
  },
  factValue: {
    fontSize: 13,
    flexShrink: 1,
    textAlign: 'right',
  },
  removeButton: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ACCENT,
    borderRadius: 24,
    paddingVertical: 12,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
