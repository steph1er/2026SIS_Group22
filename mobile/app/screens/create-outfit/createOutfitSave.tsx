import { useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { styles } from './createOutfit';
import { OutfitItem } from './createOutfitTypes';

// WardrobeItem has no `name` field, so fall back to its category for the label
const getItemLabel = (outfitItem: OutfitItem) =>
  'name' in outfitItem.item ? outfitItem.item.name : outfitItem.item.clothing_category;

type Props = {
  onClose: () => void;
  onConfirmSave: (outfitName: string) => void;
  outfitItems: OutfitItem[];
};

export default function CreateOutfitSave({ onClose, onConfirmSave, outfitItems }: Props) {
  const [outfitName, setOutfitName] = useState('');

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
        translateY.value = withSpring(700, {}, (finished) => {
          if (finished) {
            runOnJS(onClose)();
          }
        });
      } else {
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.popup, animatedStyle]}>

        {/* Drag handle */}
        <GestureDetector gesture={panGesture}>
          <View style={styles.dragHandleHitbox}>
            <View style={styles.dragHandle} />
          </View>
        </GestureDetector>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.saveHeader}>
            Outfit Description
          </Text>

          {/* image */}

          <Text style={styles.outfitDetailsTitle}>
            Outfit Details
          </Text>

          <View style={styles.outfitDetailsContainer}>
            <View style={styles.outfitDetailsField}>
                <Text style={styles.outfitDetailsCategory}>
                  Outfit Name
                </Text>
                <TextInput
                  style={styles.outfitDetailsInput}
                  placeholder="Enter outfit name"
                  value={outfitName}
                  onChangeText={setOutfitName}
                />
              </View>

              <View style={styles.outfitDetailsField}>
                <Text style={styles.outfitDetailsCategory}>
                  Style
                </Text>
                {/* dropdown */}
              </View>

              <View style={styles.outfitDetailsField}>
                <Text style={styles.outfitDetailsCategory}>
                  Season
                </Text>
                {/* dropdown */}
              </View>

              <View style={styles.outfitDetailsField}>
                <Text style={styles.outfitDetailsCategory}>
                  Occasion
                </Text>
                {/* dropdown */}
              </View>
            <View style={styles.detailSeparator} />
          </View>

          <View style={styles.itemsInOutfitContainer}>
            {/* items in outfit */}
            <Text style={styles.suggestionText}>Items in Outfit</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.suggestedItemsGrid}>
                {outfitItems.map((outfitItem) => (
                  <View key={outfitItem.instanceId} style={styles.itemCard}>
                    <Image source={{ uri: outfitItem.item.image_url }} style={styles.itemImage} />
                    <Text style={styles.itemName} numberOfLines={1}>
                      {getItemLabel(outfitItem)}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={{ height: 100 }} />

        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, { bottom: 0 }]}
            onPress={() => onConfirmSave(outfitName)}
          >
            <Text style={styles.buttonText}>Confirm Save</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.wishlistButton, { bottom: 0 }]} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

      </Animated.View>
    </View>
  );
}