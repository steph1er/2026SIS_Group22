import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemedStyles } from '../../hooks/use-theme';
import { getCategoryIcon, getItemDetails, SOURCE_ICONS } from '../../services/create-outfit/create-outfit-service';
import { RecommendedItem, WardrobeItem } from '../../services/create-outfit/create-outfit-types';
import { createStyles } from './create-outfit';

type Props = {
  item: WardrobeItem | RecommendedItem;
  onClose: () => void;
  onAddToOutfit: (item: WardrobeItem | RecommendedItem) => void;
  alreadyAdded: boolean;
};

export default function CreateOutfitItem({ item, onClose, onAddToOutfit, alreadyAdded }: Props) {
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();

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

  const details = getItemDetails(item);
  const subtitle = [
    details.material && `Material: ${details.material}`,
    details.size && `Size: ${details.size}`,
  ].filter(Boolean).join(' | ');
    
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
        <Image source={{ uri: details.imageUrl }} style={styles.itemPopUpImage} />

        <View style={styles.topContainer}>
          <Text style={styles.brandName}>
            {details.brand?.toUpperCase() ?? ''}
          </Text>

          <Text style={styles.price}>
            {details.price ?? ''}
          </Text>
        </View>

        {/* Item name */}
        <Text style={styles.itemPopUpName}>
          {details.name}
        </Text>

        <View style={styles.descriptionContainer}>
          {subtitle ? <Text style={styles.descriptionSubtitle}>{subtitle}</Text> : null}
          {details.description ? <Text style={styles.descriptionText}>{details.description}</Text> : null}
          <View style={styles.descriptionCardContainer}>
            <View style={[styles.descriptionCard, styles.descriptionCardCentered]}>
              <Text style={styles.descriptionCardText}>
                {details.colour ?? 'n/a'}
              </Text>
              <Text style={[styles.descriptionCardText, { marginTop: 10 }]}>Colour</Text>
            </View>

            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionCardSymbol}>
                <MaterialCommunityIcons style={styles.descriptionCardSymbol} name={getCategoryIcon(details.category)} size={20} />
              </Text>
              <Text style={styles.descriptionCardText}>
                {details.category ?? 'Category: n/a'}
              </Text>
            </View>

            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionCardSymbol}>
                <Ionicons style={styles.descriptionCardSymbol} name={SOURCE_ICONS[details.source]} size={20} />
              </Text>
              <Text style={styles.descriptionCardText}>
                {/* wardrobe/wishlist/catalogue */}
                {details.source}
              </Text>
            </View>
          </View>

          <View style={styles.descriptionTagsContainer}>
            {details.tags.map((tag) => (
              <View key={tag} style={styles.descriptionTags}>
                <Text style={styles.descriptionTagsText}>{tag}</Text>
              </View>
            ))}
          </View>

        </View>

        {/* Close */}
        <View style={[styles.buttonContainer, { bottom: -insets.bottom }]}>
          <TouchableOpacity
            style={[styles.saveButton, {bottom: 0}, alreadyAdded && styles.saveButtonDisabled]} 
            onPress={() => onAddToOutfit(item)}
            disabled={alreadyAdded}
          >
            <Text style={styles.buttonText}>{alreadyAdded ? 'Added to Outfit' : 'Add to Outfit'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.wishlistButton, {bottom: 0}]} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>

      </Animated.View>

    </View>
  );
}