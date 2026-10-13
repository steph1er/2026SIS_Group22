import { Ionicons } from '@expo/vector-icons';
import { useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStyleUColors, useThemedStyles } from '../hooks/use-theme';
import {
  FILTER_LABELS,
  isMultiSelect,
  type FilterKey,
  type FilterOption,
  type SearchFilters,
} from '../services/search/search-query';
import type { StyleUColors } from '../services/styleu-theme';
import { ThemedText } from './themed-text';

type ItemSearchProps = {
  query: string;
  onQueryChange: (query: string) => void;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  /** The filters to offer, in chip order, with the options each one lists. */
  options: Partial<Record<FilterKey, FilterOption[]>>;
  placeholder?: string;
  /** Smaller search bar, matching the Saved tabs. */
  compact?: boolean;
  /** Shown beside the search bar, e.g. an options button. */
  accessory?: ReactNode;
};

/**
 * A search bar with a row of filter chips; each chip opens a sheet listing its options.
 * Colour, style, brand, material and tags allow several choices; the others allow one.
 */
export function ItemSearch({
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  options,
  placeholder = 'Search for clothes, styles, colours...',
  compact = false,
  accessory,
}: ItemSearchProps) {
  const colors = useStyleUColors();
  const styles = useThemedStyles(createStyles);
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);

  const setFilter = (key: FilterKey, values: string[]) => {
    const next = { ...filters };
    if (values.length > 0) next[key] = values;
    else delete next[key];
    onFiltersChange(next);
  };

  const labelFor = (key: FilterKey, value: string) =>
    options[key]?.find((option) => option.value === value)?.label ?? value;

  const summaryFor = (key: FilterKey, values: string[]) =>
    values.length > 1 ? `${labelFor(key, values[0])} +${values.length - 1}` : labelFor(key, values[0]);

  // Chosen filters first, so they stay in view at the start of the row.
  const keys = Object.keys(options) as FilterKey[];
  const chips = [...keys].sort((a, b) => Number(Boolean(filters[b]?.length)) - Number(Boolean(filters[a]?.length)));

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={[styles.searchBar, compact && styles.searchBarCompact]}>
          <Ionicons name="search" size={compact ? 18 : 20} color={colors.subtleText} />
          <TextInput
            value={query}
            onChangeText={onQueryChange}
            placeholder={placeholder}
            placeholderTextColor={colors.subtleText}
            style={[styles.searchInput, compact && styles.searchInputCompact]}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query ? (
            <TouchableOpacity onPress={() => onQueryChange('')} accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={18} color={colors.subtleText} />
            </TouchableOpacity>
          ) : null}
        </View>
        {accessory}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        keyboardShouldPersistTaps="handled"
      >
        {chips.map((key) => {
          const label = FILTER_LABELS[key];
          const chosen = filters[key] ?? [];
          const isChosen = chosen.length > 0;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.chip, isChosen && styles.chipSelected]}
              onPress={() => setOpenFilter(key)}
              accessibilityLabel={
                isChosen ? `${label}: ${chosen.map((value) => labelFor(key, value)).join(', ')}. Change filter` : `Filter by ${label}`
              }
            >
              <ThemedText style={[styles.chipText, compact && styles.chipTextCompact, isChosen && styles.chipTextSelected]}>
                {isChosen ? `${label}: ${summaryFor(key, chosen)}` : label}
              </ThemedText>
              {isChosen ? (
                <TouchableOpacity onPress={() => setFilter(key, [])} hitSlop={8} accessibilityLabel={`Clear ${label} filter`}>
                  <Ionicons name="close-circle-outline" size={18} color={colors.text} />
                </TouchableOpacity>
              ) : (
                <Ionicons name="chevron-down" size={14} color={colors.subtleText} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FilterSheet
        title={openFilter ? FILTER_LABELS[openFilter] : ''}
        visible={openFilter !== null}
        multiSelect={openFilter ? isMultiSelect(openFilter) : false}
        options={openFilter ? options[openFilter] ?? [] : []}
        selected={openFilter ? filters[openFilter] ?? [] : []}
        onClose={() => setOpenFilter(null)}
        onChange={(values) => {
          if (!openFilter) return;
          setFilter(openFilter, values);
          // A single choice is final; multi-select stays open until Done.
          if (!isMultiSelect(openFilter)) setOpenFilter(null);
        }}
      />
    </View>
  );
}

type FilterSheetProps = {
  title: string;
  visible: boolean;
  multiSelect: boolean;
  options: FilterOption[];
  selected: string[];
  onClose: () => void;
  onChange: (values: string[]) => void;
};

export function FilterSheet({ title, visible, multiSelect, options, selected, onClose, onChange }: FilterSheetProps) {
  const colors = useStyleUColors();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();

  const toggle = (value: string) => {
    const isSelected = selected.includes(value);
    if (multiSelect) onChange(isSelected ? selected.filter((chosen) => chosen !== value) : [...selected, value]);
    else onChange(isSelected ? [] : [value]);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.sheetHeader}>
            <View>
              <ThemedText style={styles.sheetTitle}>{title}</ThemedText>
              {multiSelect ? <ThemedText style={styles.sheetHint}>Choose as many as you like</ThemedText> : null}
            </View>
            <View style={styles.sheetActions}>
              {selected.length > 0 ? (
                <TouchableOpacity onPress={() => onChange([])} hitSlop={8}>
                  <ThemedText style={styles.sheetAction}>Clear</ThemedText>
                </TouchableOpacity>
              ) : null}
              {multiSelect ? (
                <TouchableOpacity onPress={onClose} hitSlop={8}>
                  <ThemedText style={[styles.sheetAction, styles.sheetDone]}>Done</ThemedText>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {options.length === 0 ? (
            <ThemedText style={styles.sheetEmpty}>Nothing to filter by yet.</ThemedText>
          ) : (
            <ScrollView style={styles.sheetList}>
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.sheetRow}
                    onPress={() => toggle(option.value)}
                    accessibilityRole={multiSelect ? 'checkbox' : 'radio'}
                    accessibilityState={multiSelect ? { checked: isSelected } : { selected: isSelected }}
                  >
                    <ThemedText style={[styles.sheetRowText, isSelected && styles.sheetRowTextSelected]}>
                      {option.label}
                    </ThemedText>
                    {multiSelect ? (
                      <Ionicons
                        name={isSelected ? 'checkbox' : 'square-outline'}
                        size={22}
                        color={isSelected ? colors.accentStrong : colors.subtleText}
                      />
                    ) : isSelected ? (
                      <Ionicons name="checkmark" size={20} color={colors.accentStrong} />
                    ) : null}
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

const createStyles = (colors: StyleUColors) =>
  StyleSheet.create({
  container: {
    gap: 14,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 28,
    paddingHorizontal: 18,
    height: 56,
  },
  searchBarCompact: {
    borderRadius: 26,
    paddingHorizontal: 16,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  searchInputCompact: {
    fontSize: 15,
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
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  chipText: {
    fontSize: 14,
    color: colors.subtleText,
  },
  chipTextCompact: {
    fontSize: 13,
  },
  chipTextSelected: {
    color: colors.text,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
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
  sheetHint: {
    fontSize: 13,
    color: colors.subtleText,
    marginTop: 2,
  },
  sheetActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  sheetAction: {
    color: colors.accentStrong,
    fontWeight: '600',
  },
  sheetDone: {
    color: colors.text,
  },
  sheetEmpty: {
    fontSize: 14,
    color: colors.subtleText,
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
    borderBottomColor: colors.surface,
  },
  sheetRowText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '400',
  },
  sheetRowTextSelected: {
    fontWeight: '500',
  },
});
