import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { styles } from './createOutfit';

type Props = {
  onClose: () => void;
  onConfirmSave: (outfitName: string) => void;
};

export default function CreateOutfitSave({ onClose, onConfirmSave }: Props) {
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

        <Text style={styles.saveHeader}>
          Outfit Description
        </Text>

        {/* image */}
        <View style={styles.outfitContainer}>
          {/* temp */}
        </View>

        <Text style={styles.outfitDetailsTitle}>
          Outfit Details
        </Text>

        {/* iterate through each category? */}
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

        {/* items in outfit */}

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