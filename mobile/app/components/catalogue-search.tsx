import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from './themed-text';
import type { CatalogueItem } from '../services/wishlist/wishlist-types';

const ACCENT = '#D98E73';
const TEXT = '#22201F';
const MUTED = '#8A8683';

export type FilterKey = 'price' | 'category' | 'colour' | 'style' | 'size' | 'brand';

/** The chosen option per filter (an option `key`); a missing filter means "any". */
export type CatalogueFilters = Partial<Record<FilterKey, string>>;

type FilterOption = { key: string; label: string };

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'price', label: 'Price' },
  { key: 'category', label: 'Category' },
  { key: 'colour', label: 'Colour' },
  { key: 'style', label: 'Style' },
  { key: 'size', label: 'Size' },
  { key: 'brand', label: 'Brand' },
];

const PRICE_RANGES = [
  { key: 'under-50', label: 'Under $50', min: 0, max: 50 },
  { key: 'under-100', label: 'Under $100', min: 0, max: 100 },
  { key: 'under-200', label: 'Under $200', min: 0, max: 200 },
  { key: '200-plus', label: '$200+', min: 200, max: Infinity },
];

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/** The values an item has for a filter (sizes keep their own casing, e.g. "XS"). */
function valuesFor(item: CatalogueItem, key: Exclude<FilterKey, 'price'>): string[] {
  switch (key) {
    case 'category':
      return item.category ? [item.category] : [];
    case 'colour':
      return item.colours;
    case 'style':
      return item.styles;
    case 'size':
      return item.sizes;
    case 'brand':
      return item.brand ? [item.brand] : [];
  }
}

/** Options for a filter, taken from the items loaded so far (prices use fixed ranges). */
function optionsFor(items: CatalogueItem[], key: FilterKey): FilterOption[] {
  if (key === 'price') return PRICE_RANGES;
  const seen = new Map<string, string>();
  for (const item of items) {
    for (const value of valuesFor(item, key)) {
      const label = value.trim();
      if (label && !seen.has(label.toLowerCase())) {
        seen.set(label.toLowerCase(), key === 'size' || key === 'brand' ? label : titleCase(label));
      }
    }
  }
  return [...seen.entries()]
    .map(([optionKey, label]) => ({ key: optionKey, label }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
}

export function hasActiveSearch(query: string, filters: CatalogueFilters) {
  return query.trim().length > 0 || Object.values(filters).some(Boolean);
}

/** Whether an item matches the search text (name, brand, category, colours, styles, materials) and every filter. */
export function matchesSearch(item: CatalogueItem, query: string, filters: CatalogueFilters) {
  for (const { key } of FILTERS) {
    const chosen = filters[key];
    if (!chosen) continue;
    if (key === 'price') {
      const range = PRICE_RANGES.find((option) => option.key === chosen);
      if (range && (item.price === null || item.price < range.min || item.price >= range.max)) return false;
    } else if (!valuesFor(item, key).some((value) => value.trim().toLowerCase() === chosen)) {
      return false;
    }
  }

  const search = query.trim().toLowerCase();
  if (!search) return true;
  return [item.name, item.brand, item.category, ...item.colours, ...item.styles, ...item.materials]
    .filter(Boolean)
    .some((field) => field!.toLowerCase().includes(search));
}

type CatalogueSearchProps = {
  query: string;
  onQueryChange: (query: string) => void;
  filters: CatalogueFilters;
  onFiltersChange: (filters: CatalogueFilters) => void;
  /** The items being searched; Category, Colour, Style, Size and Brand list the values found in them. */
  items: CatalogueItem[];
  placeholder?: string;
};

/** A search bar with a row of filter chips; each chip opens a sheet listing its options. */
export function CatalogueSearch({
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  items,
  placeholder = 'Search for clothes, styles, colours...',
}: CatalogueSearchProps) {
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);
  const options = useMemo(() => (openFilter ? optionsFor(items, openFilter) : []), [items, openFilter]);

  const setFilter = (key: FilterKey, value: string | null) => {
    const next = { ...filters };
    if (value) next[key] = value;
    else delete next[key];
    onFiltersChange(next);
  };

  const labelFor = (key: FilterKey, value: string) =>
    optionsFor(key === 'price' ? [] : items, key).find((option) => option.key === value)?.label ?? value;

  // Chosen filters first, so they stay in view at the start of the row.
  const chips = [...FILTERS].sort((a, b) => Number(Boolean(filters[b.key])) - Number(Boolean(filters[a.key])));

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={MUTED} />
        <TextInput
          value={query}
          onChangeText={onQueryChange}
          placeholder={placeholder}
          placeholderTextColor={MUTED}
          style={styles.searchInput}
          returnKeyType="search"
          autoCorrect={false}
        />
        {query ? (
          <TouchableOpacity onPress={() => onQueryChange('')} accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={18} color={MUTED} />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        keyboardShouldPersistTaps="handled"
      >
        {chips.map(({ key, label }) => {
          const chosen = filters[key];
          return (
            <TouchableOpacity
              key={key}
              style={[styles.chip, chosen && styles.chipSelected]}
              onPress={() => setOpenFilter(key)}
              accessibilityLabel={chosen ? `${label}: ${labelFor(key, chosen)}. Change filter` : `Filter by ${label}`}
            >
              <ThemedText style={[styles.chipText, chosen && styles.chipTextSelected]}>
                {chosen ? `${label}: ${labelFor(key, chosen)}` : label}
              </ThemedText>
              {chosen ? (
                <TouchableOpacity onPress={() => setFilter(key, null)} hitSlop={8} accessibilityLabel={`Clear ${label} filter`}>
                  <Ionicons name="close-circle-outline" size={18} color={TEXT} />
                </TouchableOpacity>
              ) : (
                <Ionicons name="chevron-down" size={14} color={MUTED} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FilterSheet
        title={FILTERS.find((filter) => filter.key === openFilter)?.label ?? ''}
        visible={openFilter !== null}
        options={options}
        selected={openFilter ? filters[openFilter] ?? null : null}
        onClose={() => setOpenFilter(null)}
        onSelect={(value) => {
          if (openFilter) setFilter(openFilter, value);
          setOpenFilter(null);
        }}
      />
    </View>
  );
}

type FilterSheetProps = {
  title: string;
  visible: boolean;
  options: FilterOption[];
  selected: string | null;
  onClose: () => void;
  onSelect: (value: string | null) => void;
};

function FilterSheet({ title, visible, options, selected, onClose, onSelect }: FilterSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.sheetHeader}>
            <ThemedText style={styles.sheetTitle}>{title}</ThemedText>
            {selected ? (
              <TouchableOpacity onPress={() => onSelect(null)} hitSlop={8}>
                <ThemedText style={styles.sheetClear}>Clear</ThemedText>
              </TouchableOpacity>
            ) : null}
          </View>

          {options.length === 0 ? (
            <ThemedText style={styles.sheetEmpty}>Nothing to filter by yet. Scroll the feed to load more items.</ThemedText>
          ) : (
            <ScrollView style={styles.sheetList}>
              {options.map((option) => {
                const isSelected = option.key === selected;
                return (
                  <TouchableOpacity
                    key={option.key}
                    style={styles.sheetRow}
                    onPress={() => onSelect(isSelected ? null : option.key)}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <ThemedText style={[styles.sheetRowText, isSelected && styles.sheetRowTextSelected]}>
                      {option.label}
                    </ThemedText>
                    {isSelected ? <Ionicons name="checkmark" size={20} color={ACCENT} /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F6F4F2',
    borderWidth: 1,
    borderColor: '#ECE8E4',
    borderRadius: 28,
    paddingHorizontal: 18,
    height: 56,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
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
    backgroundColor: '#FAF9F7',
  },
  chipSelected: {
    borderColor: '#E2B7A9',
    backgroundColor: '#FBEEE9',
  },
  chipText: {
    fontSize: 14,
    color: MUTED,
  },
  chipTextSelected: {
    color: TEXT,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: '70%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 19,
    fontWeight: '600',
  },
  sheetClear: {
    color: ACCENT,
    fontWeight: '600',
  },
  sheetEmpty: {
    fontSize: 14,
    color: MUTED,
    paddingVertical: 16,
  },
  sheetList: {
    flexGrow: 0,
  },
  sheetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1EEEB',
  },
  sheetRowText: {
    fontSize: 16,
    color: TEXT,
  },
  sheetRowTextSelected: {
    fontWeight: '600',
  },
});
