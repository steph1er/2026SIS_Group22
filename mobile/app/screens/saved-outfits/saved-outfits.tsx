import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { router } from 'expo-router';
import { FilterSheet, type FilterOption } from '../../components/catalogue-search';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';

import { useSavedOutfits } from '../../hooks/use-saved-outfits';
import { useStyleUColors, useThemedStyles } from '../../hooks/use-theme';
import { itemDetailHref } from '../../services/catalogue/catalogue-service';
import { OUTFIT_SEASONS, OUTFIT_STYLES } from '../../services/create-outfit/create-outfit-service';
import { createStyles } from '../../services/saved-outfits/saved-outfit-theme';
import { deleteSavedOutfit, filterSavedOutfits, hasActiveFilters, NO_FILTERS, type SavedOutfit, type SavedOutfitFilters, type SavedOutfitItem } from '../../services/saved-outfits/saved-outfits-service';
import { wardrobeItemHref } from '../../services/wardrobe/wardrobe-service';
import SavedOutfitDetails from './saved-outfit-details';

const toOptions = (values: string[]): FilterOption[] => values.map((value) => ({ key: value, label: value }));

const FILTER_CHIPS = [
  { key: 'season', label: 'Season', options: toOptions(OUTFIT_SEASONS) },
  { key: 'style', label: 'Style', options: toOptions(OUTFIT_STYLES) },
] as const;

export default function OutfitsScreen() {
  const styles = useThemedStyles(createStyles);
  const colors = useStyleUColors();

  const { outfits, isLoading, error, refresh } = useSavedOutfits();

  const [outfitToView, setOutfitToView] = useState<SavedOutfit | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [detailsKey, setDetailsKey] = useState(0);

  const viewOutfit = (outfit: SavedOutfit) => {
    setOutfitToView(outfit);
    setDetailsVisible(true);
    setDetailsKey((key) => key + 1);
  };

  const [outfitToDelete, setOutfitToDelete] = useState<SavedOutfit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setOutfitToDelete(null);
    setDeleteError(null);
  };

  const confirmDeleteOutfit = async () => {
    if (!outfitToDelete || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteSavedOutfit(outfitToDelete.id);
      setOutfitToDelete(null);
      refresh();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Could not delete the outfit. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const openItem = (item: SavedOutfitItem) => {
    router.push(item.source === 'Wardrobe' ? wardrobeItemHref(item.itemId) : itemDetailHref(item.itemId));
  };

  const [filters, setFilters] = useState<SavedOutfitFilters>(NO_FILTERS);
  const visibleOutfits = filterSavedOutfits(outfits, filters);
  const [openFilter, setOpenFilter] = useState<'season' | 'style' | null>(null);
  const setFilter = (key: 'season' | 'style', value: string | null) =>
    setFilters((previous) => ({ ...previous, [key]: value }));
  const activeFilter = FILTER_CHIPS.find((chip) => chip.key === openFilter);

  const showEmptyState = !isLoading && !error && outfits.length === 0;
  const showNoMatches = outfits.length > 0 && visibleOutfits.length === 0;

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

          {outfits.length > 0 ? (
            <View style={styles.filterRow}>
              {FILTER_CHIPS.map(({ key, label }) => {
                const chosen = filters[key];
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.filterChip, chosen && styles.filterChipSelected]}
                    onPress={() => setOpenFilter(key)}
                    accessibilityLabel={chosen ? `${label}: ${chosen}. Change filter` : `Filter by ${label}`}
                  >
                    <Text style={[styles.filterChipText, chosen && styles.filterChipTextSelected]}>
                      {chosen ? `${label}: ${chosen}` : label}
                    </Text>
                    {chosen ? (
                      <TouchableOpacity onPress={() => setFilter(key, null)} hitSlop={8} accessibilityLabel={`Clear ${label} filter`}>
                        <Ionicons name="close-circle-outline" size={18} color={colors.text} />
                      </TouchableOpacity>
                    ) : (
                      <Ionicons name="chevron-down" size={14} color={colors.subtleText} />
                    )}
                  </TouchableOpacity>
                );
              })}

              <View style={styles.filterSearch}>
                <Ionicons name="search" size={16} color={colors.subtleText} />
                <TextInput
                  value={filters.occasion}
                  onChangeText={(occasion) => setFilters((previous) => ({ ...previous, occasion }))}
                  placeholder="Occasion"
                  placeholderTextColor={colors.subtleText}
                  style={styles.filterSearchInput}
                  returnKeyType="search"
                  autoCorrect={false}
                />
                {filters.occasion ? (
                  <TouchableOpacity
                    onPress={() => setFilters((previous) => ({ ...previous, occasion: '' }))}
                    hitSlop={8}
                    accessibilityLabel="Clear occasion search"
                  >
                    <Ionicons name="close-circle" size={16} color={colors.subtleText} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          ) : null}

          {isLoading && outfits.length === 0 ? <ActivityIndicator color={'#D98E73'} /> : null}

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
                <Ionicons name="shirt-outline" size={28} color={'#D98E73'} />
              </View>
              <ThemedText style={styles.emptyTitle}>No outfits yet</ThemedText>
              <ThemedText style={styles.muted}>
                Put together pieces from your wardrobe and wishlist to build your first outfit.
              </ThemedText>
            </View>
          ) : null}

          {showNoMatches ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.muted}>No outfits match these filters.</ThemedText>
              {hasActiveFilters(filters) ? (
                <TouchableOpacity onPress={() => setFilters(NO_FILTERS)}>
                  <Text style={styles.clearFiltersText}>Clear filters</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          {visibleOutfits.map((outfit) => (
            <TouchableOpacity
              key={outfit.id}
              style={styles.itemsInOutfitContainer}
              activeOpacity={0.85}
              onPress={() => viewOutfit(outfit)}
              accessibilityLabel={`View details for ${outfit.name}`}
            >
              {/* items in outfit */}
              <View style={styles.titleContainer}>
                <Text style={styles.outfitName} numberOfLines={1}>{outfit.name}</Text>
                <TouchableOpacity
                  onPress={() => setOutfitToDelete(outfit)}
                  style={styles.deleteButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel="Delete outfit"
                >
                  <Ionicons name="close" size={14} style={styles.deleteButtonText} />
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.outfitItemsGrid}>
                  {outfit.items.map((outfitItem) => (
                    <TouchableOpacity
                      key={outfitItem.id}
                      style={styles.itemCard}
                      onPress={() => openItem(outfitItem)}
                      disabled={!outfitItem.itemId}
                    >
                      {outfitItem.imageUrl ? (
                        <Image source={{ uri: outfitItem.imageUrl }} style={styles.itemImage} />
                      ) : (
                        <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                          <Ionicons name="shirt-outline" size={24} color={'#D98E73'} />
                        </View>
                      )}
                      <Text style={styles.itemName} numberOfLines={1}>{outfitItem.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </TouchableOpacity>
          ))}

        </ScrollView>
      </SafeAreaView>

      <FilterSheet
        title={activeFilter?.label ?? ''}
        visible={openFilter !== null}
        options={activeFilter?.options ?? []}
        selected={openFilter ? filters[openFilter] : null}
        onClose={() => setOpenFilter(null)}
        onSelect={(value) => {
          if (openFilter) setFilter(openFilter, value);
          setOpenFilter(null);
        }}
      />

      <SavedOutfitDetails
        outfit={outfitToView}
        visible={detailsVisible}
        onClose={() => setDetailsVisible(false)}
        onSaved={() => {
          setDetailsVisible(false);
          refresh();
        }}
        onOpenItem={(item: SavedOutfitItem) => {
          setDetailsVisible(false);
          openItem(item);
        }}
        key={detailsKey}
      />

      <Modal transparent animationType="fade" visible={outfitToDelete !== null} onRequestClose={closeDeleteModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete outfit?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete this outfit? This action cannot be undone.
            </Text>
            {deleteError ? <Text style={styles.modalError}>{deleteError}</Text> : null}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCloseButton]}
                onPress={closeDeleteModal}
                disabled={isDeleting}
              >
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalDeleteButton, isDeleting && styles.modalButtonDisabled]}
                onPress={confirmDeleteOutfit}
                disabled={isDeleting}
              >
                {isDeleting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.modalDeleteText}>Delete</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}