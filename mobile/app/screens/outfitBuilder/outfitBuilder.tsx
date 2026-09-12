import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// import { styles } from '../../services/outfit-builder-theme';
import { RecommendedItem, WardrobeItem } from './outfitBuilderTypes';

export default function CreateOutfits() {

  const [selectedItem, setSelectedItem] = useState<
    WardrobeItem | RecommendedItem | null
    >(null);

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
    <SafeAreaView style={{ flex: 1 }}>
      {/* header */}
      <View>
        <View>
          <Text>
            Outfit Builder
          </Text>
        </View>
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
      <View>
        <TouchableOpacity onPress={handleAddToWishlist}>
          <Text>Add to Wishlist</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSaveOutfit}>
          <Text>Save Outfit</Text>
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