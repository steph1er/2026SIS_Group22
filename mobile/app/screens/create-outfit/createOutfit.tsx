import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RecommendedItem, WardrobeItem } from './createOutfitTypes';

import { router } from 'expo-router';
import { styles } from '../../services/create-outfit-theme';

import { BackButton } from '../../components/back-button';

export default function CreateOutfits() {

  const [selectedItem, setSelectedItem] = useState<
    WardrobeItem | RecommendedItem | null
    >(null);

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

  const handleSaveOutfit = () => {
    // TODO: save outfit
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

        <TouchableOpacity style={styles.assistButton}>
          <Text style={styles.assistText}>AI Assist ON</Text>
          {/* TODO: switch text on/off */}
        </TouchableOpacity>
      </View>

      {/* outfit */}
      <View>
        {/* TO DO: show outfit  */}
      </View>

      {/* category tabs */}
      <View>
        {/* TO DO: show category tabs */}
      </View>

      {/* recommended items */}
      <View>
        {/* TO DO: show recommended items */}
      </View>

      {/* wardrobe */}
      <ScrollView>
        <View>
          {/* TO DO: show wardrobe items */}
        </View>
      </ScrollView>

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
        <View>
          {/* add animation */}
          {/* drag handle */}
          {/* item image + details */}

          <TouchableOpacity onPress={() => handleAddItemToOutfit(selectedItem.id)}>
            <Text>Add to Outfit</Text>
          </TouchableOpacity>
        </View>
      )}

    </SafeAreaView>
  )
}