import { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import CreateOutfitItem from './createOutfitItem';
// import CreateOutfitSave from './createOutfitSave';
import { RecommendedItem, WardrobeItem } from './createOutfitTypes';

import { router } from 'expo-router';
import { catalogueStyles } from '../../services/create-outfit/create-outfit-catalogue';
import { itemStyles } from '../../services/create-outfit/create-outfit-item';
import { themeStyles } from '../../services/create-outfit/create-outfit-theme';
import { visualiserStyles } from '../../services/create-outfit/create-outfit-visualiser';

import { BackButton } from '../../components/back-button';

export const styles = {...themeStyles, ...visualiserStyles, ...itemStyles, ...catalogueStyles};

export default function CreateOutfits() {

  const startY = useSharedValue(0);
  const translateY = useSharedValue(0);
  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      const newY = startY.value + event.translationY;

      translateY.value = Math.max(0, newY);
    })
    .onEnd(() => {
      if (translateY.value > 150) {
        translateY.value = withSpring(370);
      // } else if (translateY.value < -150){
      //   translateY.value = withSpring(0);
      } else {
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  const [selectedItem, setSelectedItem] = useState<WardrobeItem | RecommendedItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Tops');

  // TEMP FOR TESTING
  const categories = ['Tops', 'Pants','Shorts', 'Skirts', 'Dresses', 'Outerwear', 'Shoes', 'Accessories'];
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

  const handleBack = () => {
    router.replace('./home-dashboard')
  }

  const handleItemSelect = (item: WardrobeItem | RecommendedItem) => {
    setSelectedItem(item);
    // TODO: handle open item details
  };

  const handleCloseItemDetails = () => {
    // TODO: handle close item details
    setSelectedItem(null);
  };

  const handleAddItemToOutfit = (itemId: string) => {
    // TODO: handle add item to outfit
  };

  // send item array and guard not null
  const handleSaveOutfit = () => {

  };

  const handleCloseSave = () => {

  };

  const handleAddToWishlist = () => {
    // TODO: add to wishlist
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
          {/* TO DO: show outfit  */}
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
                {/* TODO: pull categories from database*/}
              </View>
            </ScrollView>

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
          <TouchableOpacity onPress={handleAddToWishlist} style={styles.wishlistButton}>
            <Text style={styles.buttonText}>Add to Wishlist</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSaveOutfit} style={styles.saveButton}>
            <Text style={styles.buttonText}>Save Outfit</Text>
          </TouchableOpacity>
        </View>

        {/* item details */}
        {selectedItem && (
          <CreateOutfitItem
            item={selectedItem}
            onClose={handleCloseItemDetails}
          />
        )}

        {/* this is breaking it... */}
        {/* {save && (
          <CreateOutfitSave
            onClose={handleCloseSave}
          />
        )} */}
      </View>

    </SafeAreaView>
  )
}