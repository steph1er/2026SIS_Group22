import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import { ThemedView } from '../components/themed-view';
import { ThemedText } from '../components/themed-text';
import { type CatalogueFilters, CatalogueSearch, hasActiveSearch, matchesSearch } from '../components/catalogue-search';
import { useAuth } from '../../src/auth/auth-provider';
import { useProfile } from '../../src/profile/use-profile';
import { useWishlist } from '../hooks/use-wishlist';
import { itemDetailHref } from '../services/catalogue/catalogue-service';
import { fetchRecommendations } from '../services/wishlist/wishlist-service';
import type { CatalogueItem } from '../services/wishlist/wishlist-types';

const ACCENT = '#D98E73';
const TEXT = '#22201F';
const MUTED = '#8A8683';
const PLACEHOLDER_IMAGE = 'https://placehold.co/300x360/F2EFEC/ABABAB/png?text=No+image';

/** Image heights that repeat down each column, giving the staggered look from the design. */
const LEFT_HEIGHTS = [230, 270, 210, 250];
const RIGHT_HEIGHTS = [265, 205, 245, 225];

const PAGE_SIZE = 20;
/** Start loading the next page when the bottom of the feed is this close (in points). */
const LOAD_MORE_THRESHOLD = 800;

function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 18) return 'Good afternoon,';
  return 'Good evening,';
}

function formatPrice(price: number | null) {
  if (price === null) return null;
  return Number.isInteger(price) ? `$${price}` : `$${price.toFixed(2)}`;
}

type Feed = { userId: string; items: CatalogueItem[]; error: string | null; hasMore: boolean };

type PlacedItem = { item: CatalogueItem; imageHeight: number };

/**
 * Split the feed into two columns, always adding to the shorter one so a long feed stays balanced.
 * Card heights are estimated: image, plus name (one or two lines) and the brand/price row.
 */
function toColumns(items: CatalogueItem[]): [PlacedItem[], PlacedItem[]] {
  const columns: [PlacedItem[], PlacedItem[]] = [[], []];
  const totals = [0, 0];
  for (const item of items) {
    const column = totals[0] <= totals[1] ? 0 : 1;
    const heights = column === 0 ? LEFT_HEIGHTS : RIGHT_HEIGHTS;
    const imageHeight = heights[columns[column].length % heights.length];
    columns[column].push({ item, imageHeight });
    totals[column] += imageHeight + (item.name.length > 22 ? 90 : 68);
  }
  return columns;
}

/** Append a page, skipping anything already in the feed (offsets shift when items are saved meanwhile). */
function appendUnique(items: CatalogueItem[], page: CatalogueItem[]) {
  const seen = new Set(items.map((item) => item.id));
  return [...items, ...page.filter((item) => !seen.has(item.id))];
}

export default function HomeDashboardScreen() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const { profile } = useProfile();
  // Reloads on focus, so an item saved from its detail page disappears from the feed on return.
  const wishlist = useWishlist();

  const [feed, setFeed] = useState<Feed | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<CatalogueFilters>({});
  const isLoadingMoreRef = useRef(false);

  const loadFeed = useCallback(async (forUser: string) => {
    try {
      const items = await fetchRecommendations({ limit: PAGE_SIZE });
      setFeed({ userId: forUser, items, error: null, hasMore: items.length === PAGE_SIZE });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load your feed.';
      // Keep what was already shown if a refresh fails.
      setFeed((previous) => ({
        userId: forUser,
        items: previous?.userId === forUser ? previous.items : [],
        error: message,
        hasMore: previous?.userId === forUser ? previous.hasMore : false,
      }));
    }
  }, []);

  const loadMore = async () => {
    if (!userId || !feed || feed.userId !== userId || !feed.hasMore || isLoadingMoreRef.current) return;
    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    try {
      const page = await fetchRecommendations({ limit: PAGE_SIZE, offset: feed.items.length });
      setFeed((previous) =>
        previous && previous.userId === userId
          ? { ...previous, items: appendUnique(previous.items, page), error: null, hasMore: page.length === PAGE_SIZE }
          : previous,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load more items.';
      setFeed((previous) => (previous && previous.userId === userId ? { ...previous, error: message } : previous));
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  };

  const onScroll = ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - LOAD_MORE_THRESHOLD) {
      void loadMore();
    }
  };

  useEffect(() => {
    if (userId) void loadFeed(userId);
  }, [userId, loadFeed]);

  // If the first load failed (e.g. the backend was restarting), try again when the user comes back to Home.
  const failedWithNothingShown = Boolean(feed?.userId === userId && feed?.error && feed.items.length === 0);
  useFocusEffect(
    useCallback(() => {
      if (userId && failedWithNothingShown) void loadFeed(userId);
    }, [userId, failedWithNothingShown, loadFeed]),
  );

  const refresh = async () => {
    if (!userId) return;
    setIsRefreshing(true);
    await loadFeed(userId);
    setIsRefreshing(false);
  };

  // Never show one account's feed to another.
  const current = feed?.userId === userId ? feed : null;
  const items = (current?.items ?? []).filter((item) => !wishlist.isSaved(item.id));
  const name = profile?.display_name?.trim() || null;

  // Search and filters only cover the items loaded so far; the top-up below keeps loading pages
  // while too few of them match.
  const isSearching = hasActiveSearch(query, filters);
  const visibleItems = isSearching ? items.filter((item) => matchesSearch(item, query, filters)) : items;

  // A feed too short to scroll never triggers onScroll, so top it up directly.
  const hasMore = current?.hasMore ?? false;
  const hasLoadError = Boolean(current?.error);
  useEffect(() => {
    if (hasMore && !hasLoadError && visibleItems.length < 6) void loadMore();
    // loadMore reads the latest feed each render; re-run only when the visible count changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, hasLoadError, visibleItems.length, items.length]);
  const columns = toColumns(visibleItems);

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.content}
          onScroll={onScroll}
          scrollEventThrottle={200}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} />}
        >
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.greeting}>{greeting()}</ThemedText>
              <ThemedText style={styles.name} numberOfLines={1}>
                {name ?? 'Welcome back'}
              </ThemedText>
            </View>
            <TouchableOpacity
              style={styles.avatar}
              onPress={() => router.push('/profile' as never)}
              accessibilityLabel="Open your profile"
            >
              {name ? (
                <ThemedText style={styles.avatarInitial}>{name[0].toUpperCase()}</ThemedText>
              ) : (
                <Ionicons name="person-outline" size={22} color={TEXT} />
              )}
            </TouchableOpacity>
          </View>

          <CatalogueSearch
            query={query}
            onQueryChange={setQuery}
            filters={filters}
            onFiltersChange={setFilters}
            items={items}
          />

          <ThemedText style={styles.sectionTitle}>Personalised Feed</ThemedText>

          {current?.error && items.length === 0 ? (
            <StateMessage
              icon="cloud-offline-outline"
              title="Couldn't load your feed"
              message={current.error}
              actionLabel="Try again"
              onAction={() => void refresh()}
            />
          ) : !current ? (
            <ActivityIndicator style={{ paddingVertical: 40 }} />
          ) : items.length === 0 && !current.hasMore ? (
            <StateMessage
              icon="sparkles-outline"
              title="No new recommendations"
              message="You've saved everything we have for you. Pull down to check again soon."
            />
          ) : isSearching && visibleItems.length === 0 ? (
            current.hasMore && !current.error ? (
              <ActivityIndicator style={{ paddingVertical: 40 }} />
            ) : (
              <StateMessage
                icon="search-outline"
                title="No matching items"
                message="Try a different search or filter."
                actionLabel="Clear search"
                onAction={() => {
                  setQuery('');
                  setFilters({});
                }}
              />
            )
          ) : (
            <View style={styles.masonry}>
              {columns.map((column, columnIndex) => (
                <View key={columnIndex} style={styles.column}>
                  {column.map(({ item, imageHeight }) => (
                    <FeedCard
                      key={item.id}
                      item={item}
                      imageHeight={imageHeight}
                      onPress={() => router.push(itemDetailHref(item.id))}
                    />
                  ))}
                </View>
              ))}
            </View>
          )}

          {isLoadingMore ? <ActivityIndicator style={{ paddingVertical: 16 }} /> : null}
          {current?.error && items.length > 0 ? (
            <TouchableOpacity onPress={() => void loadMore()} style={styles.footer}>
              <ThemedText style={styles.stateAction}>Couldn't load more. Tap to retry.</ThemedText>
            </TouchableOpacity>
          ) : null}
          {current && !current.hasMore && visibleItems.length > 0 ? (
            <ThemedText style={[styles.stateBody, styles.footer]}>You're all caught up</ThemedText>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

type FeedCardProps = {
  item: CatalogueItem;
  imageHeight: number;
  onPress: () => void;
};

function FeedCard({ item, imageHeight, onPress }: FeedCardProps) {
  const price = formatPrice(item.price);

  return (
    <Pressable style={styles.card} onPress={onPress} accessibilityLabel={item.name}>
      <Image source={{ uri: item.imageUrl ?? PLACEHOLDER_IMAGE }} style={[styles.cardImage, { height: imageHeight }]} />
      <ThemedText style={styles.cardName} numberOfLines={2}>
        {item.name}
      </ThemedText>
      <View style={styles.cardMetaRow}>
        <ThemedText style={styles.cardBrand} numberOfLines={1}>
          {item.brand ?? ''}
        </ThemedText>
        {price ? <ThemedText style={styles.cardPrice}>{price}</ThemedText> : null}
      </View>
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
    gap: 18,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  greeting: {
    fontSize: 16,
    color: MUTED,
  },
  name: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '600',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#E8C3B5',
    backgroundColor: '#FBEEE9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '600',
    color: TEXT,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '500',
  },
  masonry: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  column: {
    flex: 1,
    gap: 20,
  },
  card: {
    gap: 2,
  },
  cardImage: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: '#F2EFEC',
  },
  cardName: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
  },
  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  cardBrand: {
    flex: 1,
    fontSize: 13,
    color: MUTED,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    alignSelf: 'center',
    paddingVertical: 12,
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
});
