import { Ionicons } from '@expo/vector-icons';
import { Image, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { styles } from './createOutfit';
import { OutfitItem } from './createOutfitTypes';

type Props = {
  outfitItem: OutfitItem;
  onRemove: (instanceId: string) => void;
};

export default function CreateOutfitVisualiserItem({ outfitItem, onRemove }: Props) {
  const startX = useSharedValue(outfitItem.x);
  const startY = useSharedValue(outfitItem.y);
  const translateX = useSharedValue(outfitItem.x);
  const translateY = useSharedValue(outfitItem.y);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <Animated.View style={[styles.visualiserItem, animatedStyle]}>
      <GestureDetector gesture={panGesture}>
        <Animated.View>
          <Image source={{ uri: outfitItem.item.image_url }} style={styles.visualiserItemImage} />
        </Animated.View>
      </GestureDetector>

      <TouchableOpacity
        style={styles.visualiserDeleteButton}
        onPress={() => onRemove(outfitItem.instanceId)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close" size={14} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );
}