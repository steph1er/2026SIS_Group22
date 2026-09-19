import { Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { styles } from './createOutfit';
import { RecommendedItem, WardrobeItem } from './createOutfitTypes';

// TODO: default to no selected item when reopening createOutfit

type Props = {
  item: WardrobeItem | RecommendedItem;
  onClose: () => void;
};

const handleAddToOutfit = () => {
  // TODO: add to outfit
};

export default function CreateOutfitItem({ item, onClose }: Props) {
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

        {/* Item image */}
        <View>
          {/* Image goes here */}
        </View>

        <View style={styles.topContainer}>
          <Text style={styles.brandName}>
            {/* make it all caps */}
            BRAND
          </Text>

          <Text style={styles.price}>
            $00.00
          </Text>
        </View>

        {/* Item name */}
        <Text style={styles.itemPopUpName}>
          Item Name
        </Text>

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionSubtitle}>
            {/* material and size */}
            Material: Something | Size: L
          </Text>
          <Text style={styles.descriptionText}>
            {/* item description */}
            placeholder random words blahd qoidiohoc doiahdh djiajd ak jaqwpojdi
          </Text>
          <View style={styles.descriptionCardContainer}>
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionCardSymbol}>
                {/* symbol */}
              </Text>
              <Text style={styles.descriptionCardText}>
                {/* desc card */}
                Colour
              </Text>
            </View>

            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionCardSymbol}>
                {/* symbol */}
              </Text>
              <Text style={styles.descriptionCardText}>
                {/* desc card */}
                Category
              </Text>
            </View>

            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionCardSymbol}>
                {/* symbol */}
              </Text>
              <Text style={styles.descriptionCardText}>
                {/* desc card */}
                Season?
              </Text>
            </View>
          </View>

          <View style={styles.descriptionTagsContainer}>
            <View style={styles.descriptionTags}>
              <Text style={styles.descriptionTagsText}>
                {/* tag */}
                example
              </Text>
            </View>
          </View>

        </View>

        {/* Close */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.saveButton, {bottom: 0}]} onPress={onClose}>
            <Text style={styles.buttonText} onPress={handleAddToOutfit}>Add to Outfit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.wishlistButton, {bottom: 0}]} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>

      </Animated.View>

    </View>
  );
}