import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { OUTFIT_SEASONS, OUTFIT_STYLES } from '../../services/create-outfit/create-outfit-service';
import { OutfitItem, OutfitSaveDetails } from '../../services/create-outfit/createOutfitTypes';
import { StyleUTokens } from '../../services/styleu-theme';
import { styles } from './createOutfit';

const getItemLabel = (outfitItem: OutfitItem) =>
  'name' in outfitItem.item ? outfitItem.item.name : outfitItem.item.clothing_category;

type Props = {
  onClose: () => void;
  onConfirmSave: (details: OutfitSaveDetails) => Promise<void>;
  outfitItems: OutfitItem[];
};

type DropdownProps = {
  label: string;
  options: string[];
  value?: string;
  open: boolean;
  onToggle: () => void;
  onSelect: (value: string | undefined) => void;
};

function DetailDropdown({ label, options, value, open, onToggle, onSelect }: DropdownProps) {
  return (
    <View>
      <TouchableOpacity style={styles.outfitDetailsField} onPress={onToggle}>
        <Text style={styles.outfitDetailsCategory}>{label}</Text>
        <View style={styles.dropdownTrigger}>
          <Text style={value ? styles.dropdownTriggerText : styles.dropdownPlaceholderText} numberOfLines={1}>
            {value ?? 'Select'}
          </Text>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={StyleUTokens.colors.mutedText}/>
        </View>
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdownOptions}>
          {options.map((option) => {
            const selected = option === value;
            return (
              <TouchableOpacity
                key={option}
                style={[styles.dropdownChip, selected && styles.dropdownChipSelected]}
                onPress={() => {
                  onSelect(selected ? undefined : option);
                  onToggle();
                }}
              >
                <Text style={[styles.dropdownChipText, selected && styles.dropdownChipTextSelected]}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

export default function CreateOutfitSave({ onClose, onConfirmSave, outfitItems }: Props) {
  const [outfitName, setOutfitName] = useState('');
  const [style, setStyle] = useState<string | undefined>();
  const [season, setSeason] = useState<string | undefined>();
  const [occasion, setOccasion] = useState<string | undefined>();
  const [openDropdown, setOpenDropdown] = useState<'style' | 'season' | 'occasion' | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const toggleDropdown = (key: 'style' | 'season' | 'occasion') =>
    setOpenDropdown((current) => (current === key ? null : key));

  const handleConfirm = async () => {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    
    try {
      await onConfirmSave({ name: outfitName, style, season, occasion });
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Could not save outfit. Please try again.');
      setSaving(false);
    }
  };

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
              placeholderTextColor={StyleUTokens.colors.placeholder}
              maxLength={60}
              value={outfitName}
              onChangeText={setOutfitName}
            />
          </View>

          <DetailDropdown
            label="Season"
            options={OUTFIT_SEASONS}
            value={season}
            open={openDropdown === 'season'}
            onToggle={() => toggleDropdown('season')}
            onSelect={setSeason}
          />

          <DetailDropdown
            label="Style"
            options={OUTFIT_STYLES}
            value={style}
            open={openDropdown === 'style'}
            onToggle={() => toggleDropdown('style')}
            onSelect={setStyle}
          />

          <View style={styles.outfitDetailsField}>
            <Text style={styles.outfitDetailsCategory}>
              Occasion
            </Text>
            <TextInput
              style={styles.outfitDetailsInput}
              placeholder="Enter occasion"
              placeholderTextColor={StyleUTokens.colors.placeholder}
              maxLength={60}
              value={occasion}
              onChangeText={setOccasion}
            />
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

        {saveError && <Text style={styles.saveError}>{saveError}</Text>}
        
        <View style={{ height: 100 }} />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, { bottom: 0 }, saving && styles.saveButtonDisabled]}
            onPress={handleConfirm}
            disabled={saving}
          >
            {saving ? <ActivityIndicator /> : <Text style={styles.buttonText}>Confirm Save</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={[styles.wishlistButton, { bottom: 0 }]} onPress={onClose} disabled={saving}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

      </Animated.View>
    </View>
  );
}