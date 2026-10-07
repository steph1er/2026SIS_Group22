import { useMemo, useState } from 'react';
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
import { useWardrobe } from '../../hooks/use-wardrobe';
import { wardrobeItemHref } from '../../services/wardrobe/wardrobe-service';
import type { WardrobeItem } from '../../services/wardrobe/wardrobe-types';

const ACCENT = '#D98E73';
const TEXT = '#22201F';
const MUTED = '#8A8683';
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

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/saved' as never);
}

export default function WardrobeScreen() {
  const wardrobe = useWardrobe();
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
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <TouchableOpacity onPress={goBack} style={styles.breadcrumb} hitSlop={8} accessibilityLabel="Back to My Collections">
                <Ionicons name="chevron-back" size={14} color={MUTED} />
                <ThemedText style={styles.breadcrumbText}>My Collections</ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.title}>My Wardrobe</ThemedText>
            </View>
            <TouchableOpacity style={styles.iconCircle} onPress={wardrobe.refresh} accessibilityLabel="Refresh wardrobe">
              <Ionicons name="refresh" size={18} color={TEXT} />
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
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

type WardrobeTileProps = {
  item: WardrobeItem;
  imageHeight: number;
  onPress: () => void;
};

function WardrobeTile({ item, imageHeight, onPress }: WardrobeTileProps) {
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
  tileName: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
  },
  tileSubtitle: {
    fontSize: 13,
    color: MUTED,
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
