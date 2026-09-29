import { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import CreateOutfitItem from './createOutfitItem';
import CreateOutfitSave from './createOutfitSave';
import { OutfitItem, RecommendedItem, WardrobeItem } from './createOutfitTypes';
import CreateOutfitVisualiserItem from './createOutfitVisualiserItem';

import { saveStyles } from '@/services/create-outfit/create-outfit-save';
import { catalogueStyles } from '../../services/create-outfit/create-outfit-catalogue';
import { itemStyles } from '../../services/create-outfit/create-outfit-item';
import { themeStyles } from '../../services/create-outfit/create-outfit-theme';
import { visualiserStyles } from '../../services/create-outfit/create-outfit-visualiser';
import { StyleUTokens } from '../../services/styleu-theme';

import { BackButton } from '../../components/back-button';

export const styles = {...themeStyles, ...visualiserStyles, ...itemStyles, ...catalogueStyles, ...saveStyles};

export default function CreateOutfits() {

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
  const [itemsCategory, setItemsCategory] = useState('Wardrobe'); // wardrobe or wishlist
  const togglePosition = useSharedValue(1);

  const [outfitItems, setOutfitItems] = useState<OutfitItem[]>([]);
  const hasOutfitItems = outfitItems.length > 0;

  const [selectedCategory, setSelectedCategory] = useState('Tops');
  const [showSave, setShowSave] = useState(false);

  const categories = ['Tops', 'Bottoms', 'Shoes', 'Accessories', 'Other'];
  const placeholderItems: RecommendedItem[] = [
    {
      id: '1',
      name: 'placeholder',
      brand: 'Placeholder Brand',
      price: '$00.00',
      image_url: 'https://placehold.net/7.png',
    },
    {
      id: '2',
      name: 'placeholder',
      brand: 'Placeholder Brand',
      price: '$00.00',
      image_url: 'https://placehold.net/3.png',
    },
    {
      id: '3',
      name: 'placeholder',
      brand: 'Placeholder Brand',
      price: '$00.00',
      image_url: 'https://placehold.net/2.png',
    },
    {
      id: '4',
      name: 'placeholder name',
      brand: 'Placeholder Brand',
      price: '$00.00',
      image_url: 'https://placehold.net/1.png',
    },
  ];

  const handleAddToOutfit = (item: WardrobeItem | RecommendedItem) => {
    setOutfitItems((prev) => [
      ...prev,
      {
        instanceId: `${item.id}-${Date.now()}`, item,
        // stagger so they dont land  on top of each other
        // TODO: set top bottoms etc template?
        x: 20 + (prev.length % 4) * 24,
        y: 20 + (prev.length % 4) * 24,
      },
    ]);
    setSelectedItem(null);
  };

  const handleRemoveFromOutfit = (instanceId: string) => {
    setOutfitItems((prev) => prev.filter((outfitItem) => outfitItem.instanceId !== instanceId));
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

  const handleConfirmSave = (outfitName: string) => {
    // TODO: save outfit
    setShowSave(false);
  };

  const handleAddToWishlist = () => {
    if (!hasOutfitItems) return;
    // TODO: add to wishlist and clear outfit builder
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* header */}
      <View style={styles.headerContainer}>
        <View style={styles.title}>
          <BackButton />
          <Text style={styles.headerText}>
            Outfit Builder
          </Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        {/* outfit */}
        <View style={styles.visualiserContainer}>
          {hasOutfitItems ? (
            outfitItems.map((outfitItem) => (
              <CreateOutfitVisualiserItem
                key={outfitItem.instanceId}
                outfitItem={outfitItem}
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

            {/* TODO: add search bar */}

            {/* recommended items */}
            <View style={styles.suggestedContainer}>
              <Text style={styles.suggestionText}>Items you might like...</Text>
              {/* TODO: pull from db */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.suggestedItemsGrid}>
                  {placeholderItems.map((item) => (
                    <TouchableOpacity key={item.id} style={styles.itemCard} onPress={() => handleItemSelect(item)}>
                      <Image source={{ uri: item.image_url }} style={styles.itemImage}/>
                      <Text style={styles.itemName}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* wishlist or wardrobe toggle */}
            <View style={styles.catalogueToggleContainer}>
              <Animated.View style={[styles.catalogueToggleActive,
                useAnimatedStyle(() => ({
                  transform: [{translateX: togglePosition.value * toggleMove}]
                }))
              ]}/>

              <TouchableOpacity
                onPress={() => {
                  setItemsCategory('Wardrobe');
                  togglePosition.value = withTiming(0);
                }}
                style={styles.catalogueToggleButton}
              >
                <Text>Wardrobe</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setItemsCategory('Wishlist');
                  togglePosition.value = withTiming(1);
                }}
                style={styles.catalogueToggleButton}
              >
                <Text>Wishlist</Text>
              </TouchableOpacity>
            </View>

            {/* suggested for you container */}
            <View style={[styles.suggestedContainer, {backgroundColor: StyleUTokens.colors.backgroundElement}]}>
              <Text style={styles.suggestionText}>Suggested for you</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.suggestedItemsGrid}>
                  {placeholderItems.map((item) => (
                    <TouchableOpacity key={item.id} style={styles.itemCard} onPress={() => handleItemSelect(item)}>
                      <Image source={{ uri: item.image_url }} style={styles.itemImage}/>
                      <Text style={styles.itemName}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* wardrobe */}
            <View style={styles.wardrobeContainer}>
              {/* TODO: link to db */}
              <View style={styles.wardrobeItemsGrid}>
                {placeholderItems.map((item) => (
                    <TouchableOpacity key={item.id} style={[styles.itemCard, { width: 120 }]} onPress={() => handleItemSelect(item)}>
                      <Image source={{ uri: item.image_url }} style={styles.itemImage}/>
                      <Text style={styles.itemName}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
            </View>
          </ScrollView>
        </Animated.View>

        {/* bottom bar */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleAddToWishlist}
            disabled={!hasOutfitItems}
            style={[styles.wishlistButton, !hasOutfitItems && styles.wishlistButtonDisabled]}
          >
            <Text style={styles.buttonText}>Add to Wishlist</Text>
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

    </SafeAreaView>
  )
}