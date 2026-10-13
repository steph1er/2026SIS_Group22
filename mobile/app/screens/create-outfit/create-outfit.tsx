import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';

import { addOutfitToWishlist, fetchBuilderItems, fetchGeneralRecommendations, getItemLabel, matchesUiCategory, saveOutfit, type BuilderItem } from '../../services/create-outfit/create-outfit-service';

import { OutfitItem, OutfitSaveDetails, RecommendedItem, WardrobeItem } from '../../services/create-outfit/create-outfit-types';
import CreateOutfitItem from './create-outfit-item';
import CreateOutfitSave from './create-outfit-save';
import CreateOutfitVisualiserItem from './create-outfit-visualiser';

import { createSaveStyles } from '@/services/create-outfit/style/create-outfit-save';
import { createCatalogueStyles } from '../../services/create-outfit/style/create-outfit-catalogue';
import { createItemStyles } from '../../services/create-outfit/style/create-outfit-item';
import { createThemeStyles } from '../../services/create-outfit/style/create-outfit-theme';
import { createVisualiserStyles } from '../../services/create-outfit/style/create-outfit-visualiser';

import { BackButton, goBackOr } from '../../components/back-button';
import { useStyleUColors, useThemedStyles } from '../../hooks/use-theme';
import { createStyles as createSavedOutfitStyles } from '../../services/saved-outfits/saved-outfit-theme';
import type { StyleUColors } from '../../services/styleu-theme';

export const createStyles = (colors: StyleUColors) => ({
  ...createThemeStyles(colors),
  ...createVisualiserStyles(colors),
  ...createItemStyles(colors),
  ...createCatalogueStyles(colors),
  ...createSaveStyles(colors),
});

export default function CreateOutfits() {
  const styles = useThemedStyles(createStyles);
  // the discard modal reuses the saved-outfits delete modal styles (modalOverlay, modalCard, ...)
  const modalStyles = useThemedStyles(createSavedOutfitStyles);
  const colors = useStyleUColors();
  const insets = useSafeAreaInsets();

  const { height: screenHeight, width: screenWidth } = useWindowDimensions();

  const toggleWidth = screenWidth * 0.8;
  const toggleMove = (toggleWidth - 8) / 2;

  const SNAP_DOWN = screenHeight * 0.4;
  const SNAP_UP = -screenHeight * 0.33;
  const DRAG_THRESHOLD = screenHeight * 0.18;

  const startY = useSharedValue(0);
  const translateY = useSharedValue(0);
  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateY.value = startY.value + event.translationY;
    })
    .onEnd(() => {
      if (translateY.value > DRAG_THRESHOLD) {
        translateY.value = withSpring(SNAP_DOWN);
      } else if (translateY.value < -DRAG_THRESHOLD) {
        translateY.value = withSpring(SNAP_UP);
      } else {
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  const [selectedItem, setSelectedItem] = useState<WardrobeItem | RecommendedItem | null>(null);
  const [itemsCategory, setItemsCategory] = useState<'Wardrobe' | 'Wishlist'>('Wardrobe'); // wardrobe or wishlist
  const togglePosition = useSharedValue(0);
  const toggleActiveStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: togglePosition.value * toggleMove }],
  }));
  const topZ = useSharedValue(0); // highest zIndex given to a visualiser item, so a touched item can go on top

  const [outfitItems, setOutfitItems] = useState<OutfitItem[]>([]);
  const hasOutfitItems = outfitItems.length > 0;

  // Leaving drops the outfit in progress, so check first once something has been added.
  const handleClose = () => {
    if (!hasOutfitItems) {
      goBackOr('/outfits');
      return;
    }
    setShowDiscard(true);
  };

  const handleConfirmDiscard = () => {
    setShowDiscard(false);
    goBackOr('/outfits');
  };

  const [selectedCategory, setSelectedCategory] = useState('Tops');
  const [showSave, setShowSave] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [reloadCount, setReloadCount] = useState(0); // bump to refetch wardrobe/wishlist items

  const categories = ['Tops', 'Bottoms', 'Outerwear', 'Dresses', 'Shoes', 'Other'];

  // general recommendations: load once
  const [generalRecs, setGeneralRecs] = useState<RecommendedItem[]>([]);
  const [generalLoading, setGeneralLoading] = useState(true);
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    fetchGeneralRecommendations()
      .then(setGeneralRecs)
      .catch((e) => setGeneralError(e.message ?? 'Could not load recommendations.'))
      .finally(() => setGeneralLoading(false));
  }, []);

  // wardrobe/wishlist items: reload on toggle or category change
  const builderKey = `${itemsCategory}:${selectedCategory}:${reloadCount}`;
  const [builder, setBuilder] = useState<{
    key: string;
    suggested: BuilderItem[];
    items: BuilderItem[];
    error: string | null;
  } | null>(null);

  const loading = builder?.key !== builderKey;
  const loadError = builder?.key === builderKey ? builder.error : null;
  const suggested = builder?.suggested ?? [];
  const gridItems = builder?.items ?? [];

  useEffect(() => {
    let cancelled = false;

    fetchBuilderItems(itemsCategory, selectedCategory)
      .then(({ recommendations, items }) => {
        if (!cancelled) setBuilder({ key: builderKey, suggested: recommendations, items, error: null });
      })
      .catch((e) => {
        if (!cancelled) setBuilder({ key: builderKey, suggested: [], items: [], error: e.message ?? 'Could not load items.' });
      });

    return () => { cancelled = true; };
  }, [itemsCategory, selectedCategory, reloadCount, builderKey]);

  // don't repeat anything already shown in "Suggested for you" or the grid
  const shownIds = new Set([...suggested, ...gridItems].map((i) => i.id));
  const youMightLike = generalRecs.filter((i) => !shownIds.has(i.id) && matchesUiCategory(i, selectedCategory));

  const renderCard = (item: BuilderItem, width?: number) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.itemCard, width ? { width } : null]}
      onPress={() => handleItemSelect(item)}
    >
      <Image source={{ uri: item.image_url }} style={styles.itemImage} />
      <Text style={styles.itemName} numberOfLines={2}>{getItemLabel(item)}</Text>
    </TouchableOpacity>
  );

  const handleAddToOutfit = (item: WardrobeItem | RecommendedItem) => {
    setOutfitItems((prev) => [
      ...prev,
      {
        instanceId: `${item.id}-${Date.now()}`, item,
        // stagger so they dont land  on top of each other
        x: 20 + (prev.length % 4) * 24,
        y: 20 + (prev.length % 4) * 24,
      },
    ]);
    setSelectedItem(null);
  };

  const handleRemoveFromOutfit = (instanceId: string) => {
    setOutfitItems((prev) => prev.filter((outfitItem) => outfitItem.instanceId !== instanceId));
  };

  // saves a picture of the visualiser to the phone's photos, without the delete/resize badges
  const visualiserRef = useRef<View>(null);
  const [hideControls, setHideControls] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);

  const handleDownloadVisualiser = async () => {
    if (!hasOutfitItems || downloading) return;
    setDownloading(true);
    try {
      const permission = await MediaLibrary.requestPermissionsAsync(true, ['photo']);
      if (!permission.granted) {
        setNotice({ title: 'Permission needed', message: 'Allow access to your photos in settings to save your outfit.' });
        return;
      }

      setHideControls(true);
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

      const uri = await captureRef(visualiserRef, { format: 'png', quality: 1, result: 'tmpfile' });
      await MediaLibrary.Asset.create(uri);
      setNotice({ title: 'Saved', message: 'Your outfit image was saved to your photos.' });
    } catch (e) {
      console.warn('Could not save outfit image', e);
      setNotice({ title: 'Could not save', message: 'Something went wrong saving the image. Please try again.' });
    } finally {
      setHideControls(false);
      setDownloading(false);
    }
  };

  const handleSelectItemsCategory = (category: 'Wardrobe' | 'Wishlist') => {
    setItemsCategory(category);
    togglePosition.value = withTiming(category === 'Wardrobe' ? 0 : 1);
  };

  const handleClearVisualiser = () => {
    setOutfitItems([]);
  };

  const handleItemSelect = (item: WardrobeItem | RecommendedItem) => {
    setSelectedItem(item);
  };

  const handleCloseItemDetails = () => {
    setSelectedItem(null);
  };

  const handleSaveOutfit = () => {
    if (!hasOutfitItems) return;
    setShowSave(true);
  };

  const handleCloseSave = () => {
    setShowSave(false);
  };

  const handleConfirmSave = async (details: OutfitSaveDetails) => {
    await saveOutfit({ ...details, items: outfitItems.map((o) => o.item) });
    setShowSave(false);
    setOutfitItems([]);
  };

  const handleAddToWishlist = async () => {
    if (!hasOutfitItems || addingToWishlist) return;
    setAddingToWishlist(true);
    try {
      await addOutfitToWishlist(outfitItems.map((o) => o.item));
      setOutfitItems([]);
      setReloadCount((n) => n + 1); // refresh the Wishlist tab
    } catch (e) {
      console.warn('Could not add outfit to wishlist', e); // outfit stays so they can retry
    } finally {
      setAddingToWishlist(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* header */}
      <View style={styles.headerContainer}>
        <View style={styles.title}>
          <BackButton icon="close" onPress={handleClose} />
          <Text style={styles.headerText}>
            Outfit Builder
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleDownloadVisualiser}
            disabled={!hasOutfitItems || downloading}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Save outfit image to photos"
            style={[styles.headerClearButton, (!hasOutfitItems || downloading) && styles.headerClearButtonDisabled]}
          >
            {downloading ? <ActivityIndicator /> : <Ionicons name="download-outline" size={22} color={colors.accent} />}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClearVisualiser}
            disabled={!hasOutfitItems}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear outfit"
            style={[styles.headerClearButton, !hasOutfitItems && styles.headerClearButtonDisabled]}
          >
            <Text style={styles.headerClearText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contentContainer}>
        {/* outfit */}
        <View ref={visualiserRef} collapsable={false} style={styles.visualiserContainer}>
          {hasOutfitItems ? (
            outfitItems.map((outfitItem) => (
              <CreateOutfitVisualiserItem
                key={outfitItem.instanceId}
                outfitItem={outfitItem}
                topZ={topZ}
                hideControls={hideControls}
                onRemove={handleRemoveFromOutfit}
              />
            ))
          ) : ( <Text style={styles.visualiserEmptyText}>Add items to build your outfit</Text> )}
        </View>

        <Animated.View style={[styles.catalogueContainer, animatedStyle]}>

          <GestureDetector gesture={panGesture}>
            <View style={styles.dragHandleHitbox}>
              <View style={styles.dragHandle} />
            </View>
          </GestureDetector>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* category tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setSelectedCategory(category)}
                    style={[styles.categoryButton, selectedCategory === category && styles.categorySelected]}
                  >
                    <Text style={[styles.categoryButtonText, selectedCategory === category && styles.categorySelectedText]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* recommended items */}
            <View style={styles.suggestedContainer}>
              <Text style={styles.suggestionText}>Items you might like...</Text>

              {generalLoading ? (
                <ActivityIndicator style={{ paddingVertical: 24 }} />
              ) : generalError ? (
                <Text style={styles.suggestionText}>{generalError}</Text>
              ) : youMightLike.length === 0 ? (
                <Text style={styles.emptyText}>No recommendations yet.</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.suggestedItemsGrid}>{youMightLike.map((i) => renderCard(i))}</View>
                </ScrollView>
              )}
            </View>

            {/* wishlist or wardrobe toggle */}
            <View style={styles.catalogueToggleContainer}>
              <Animated.View style={[styles.catalogueToggleActive, toggleActiveStyle]}/>

              <TouchableOpacity
                onPress={() => handleSelectItemsCategory('Wardrobe')}
                style={styles.catalogueToggleButton}
              >
                <Text style={[styles.catalogueToggleText, itemsCategory === 'Wardrobe' && styles.catalogueToggleTextActive]}>
                  Wardrobe
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleSelectItemsCategory('Wishlist')}
                style={styles.catalogueToggleButton}
              >
                <Text style={[styles.catalogueToggleText, itemsCategory === 'Wishlist' && styles.catalogueToggleTextActive]}>
                  Wishlist
                </Text>
              </TouchableOpacity>
            </View>

            {/* suggested for you container */}
            <View style={[styles.suggestedContainer, {backgroundColor: colors.backgroundElement}]}>
              <Text style={styles.suggestionText}>Suggested for you</Text>
              {loading ? (
                <ActivityIndicator style={{ paddingVertical: 24 }} />
              ) : loadError ? (
                <Text style={styles.suggestionText}>{loadError}</Text>
              ) : suggested.length === 0 ? (
                <Text style={styles.emptyText}>
                  No {selectedCategory.toLowerCase()} in your {itemsCategory.toLowerCase()} yet.
                </Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.suggestedItemsGrid}>{suggested.map((i) => renderCard(i))}</View>
                </ScrollView>
              )}
            </View>

            {/* wardrobe / wishlist grid */}
            <View style={styles.wardrobeContainer}>
              {!loading && !loadError && gridItems.length > 0 && (
                <View style={styles.wardrobeItemsGrid}>{gridItems.map((i) => renderCard(i, 120))}</View>
              )}
            </View>
          </ScrollView>
        </Animated.View>

        {/* bottom bar */}
        <View style={[styles.buttonContainer, { bottom: -insets.bottom }]}>
          <TouchableOpacity
            onPress={handleAddToWishlist}
            disabled={!hasOutfitItems || addingToWishlist}
            style={[styles.wishlistButton, (!hasOutfitItems || addingToWishlist) && styles.wishlistButtonDisabled]}
          >
            {addingToWishlist ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.secondaryButtonText}>Add to Wishlist</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSaveOutfit}
            disabled={!hasOutfitItems}
            style={[styles.saveButton, !hasOutfitItems && styles.saveButtonDisabled]}
          >
            <Text style={styles.buttonText}>Save Outfit</Text>
          </TouchableOpacity>
        </View>

        {/* item details */}
        {selectedItem && (
          <CreateOutfitItem
            item={selectedItem}
            onClose={handleCloseItemDetails}
            onAddToOutfit={handleAddToOutfit}
            alreadyAdded={outfitItems.some((outfitItem) => outfitItem.item.id === selectedItem.id)}
          />
        )}

        {showSave && (
          <CreateOutfitSave
            onClose={handleCloseSave}
            onConfirmSave={handleConfirmSave}
            outfitItems={outfitItems}
          />
        )}
      </View>

      <Modal transparent animationType="fade" visible={showDiscard} onRequestClose={() => setShowDiscard(false)}>
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalCard}>
            <Text style={modalStyles.modalTitle}>Discard this outfit?</Text>
            <Text style={modalStyles.modalMessage}>
              The items you added won&apos;t be saved.
            </Text>

            <View style={modalStyles.modalButtons}>
              <TouchableOpacity
                style={[modalStyles.modalButton, modalStyles.modalCloseButton]}
                onPress={() => setShowDiscard(false)}
              >
                <Text style={modalStyles.modalCloseText}>Keep editing</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.modalButton, modalStyles.modalDeleteButton]}
                onPress={handleConfirmDiscard}
              >
                <Text style={modalStyles.modalDeleteText}>Discard</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent animationType="fade" visible={notice !== null} onRequestClose={() => setNotice(null)}>
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalCard}>
            <Text style={modalStyles.modalTitle}>{notice?.title}</Text>
            <Text style={modalStyles.modalMessage}>{notice?.message}</Text>
            <View style={modalStyles.modalButtons}>
              <TouchableOpacity
                style={[modalStyles.modalButton, modalStyles.modalCloseButton]}
                onPress={() => setNotice(null)}
              >
                <Text style={modalStyles.modalCloseText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}