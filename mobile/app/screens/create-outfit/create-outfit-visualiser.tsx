import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';

import { useStyleUColors, useThemedStyles } from '../../hooks/use-theme';
import { OutfitItem } from '../../services/create-outfit/create-outfit-types';
import { createStyles } from './create-outfit';

// starting size matches width/height of `visualiserItem` in the stylesheet
const DEFAULT_SIZE = 100;
const MIN_SIZE = 60;
const MAX_SIZE = 300;

type Props = {
  outfitItem: OutfitItem;
  onRemove: (instanceId: string) => void;
  /** Highest zIndex handed out so far; shared by every item so touching one can put it on top of the rest. */
  topZ: SharedValue<number>;
  hideControls?: boolean,
};

export default function CreateOutfitVisualiserItem({ outfitItem, onRemove, topZ, hideControls }: Props) {
  const styles = useThemedStyles(createStyles);
  const colors = useStyleUColors();
  const startX = useSharedValue(outfitItem.x);
  const startY = useSharedValue(outfitItem.y);
  const translateX = useSharedValue(outfitItem.x);
  const translateY = useSharedValue(outfitItem.y);
  const size = useSharedValue(DEFAULT_SIZE);
  const startSize = useSharedValue(DEFAULT_SIZE);
  const zIndex = useSharedValue(0);

  // a newly added item lands on top
  useEffect(() => {
    topZ.set(topZ.get() + 1);
    zIndex.set(topZ.get());
  }, [topZ, zIndex]);

  const bringToFront = () => {
    'worklet';
    topZ.set(topZ.get() + 1);
    zIndex.set(topZ.get());
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      bringToFront();
    })
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;
    });

    // drag the bottom-right handle to resize (square, so the average of both axes), keeping the top-left corner fixed
  const resizeGesture = Gesture.Pan()
    .hitSlop(8)
    .onBegin(() => {
      bringToFront();
    })
    .onStart(() => {
      startSize.value = size.value;
    })
    .onUpdate((event) => {
      const next = startSize.value + (event.translationX + event.translationY) / 2;
      size.value = Math.min(MAX_SIZE, Math.max(MIN_SIZE, next));
    });

  const animatedStyle = useAnimatedStyle(() => ({
    width: size.value,
    height: size.value,
    zIndex: zIndex.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <Animated.View style={[styles.visualiserItem, animatedStyle]}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={styles.visualiserItemBody}>
          <Image source={{ uri: outfitItem.item.image_url }} style={styles.visualiserItemImage} />
        </Animated.View>
      </GestureDetector>

      {!hideControls && (
        <>
          <TouchableOpacity
            style={styles.visualiserDeleteButton}
            onPress={() => onRemove(outfitItem.instanceId)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={14} color={colors.onAccent} />
          </TouchableOpacity>

          <GestureDetector gesture={resizeGesture}>
            <Animated.View style={styles.visualiserResizeHandle}>
              <MaterialCommunityIcons name="arrow-top-left-bottom-right" size={14} color={colors.onAccent} />
            </Animated.View>
          </GestureDetector>
        </>
      )}
    </Animated.View>
  );
}