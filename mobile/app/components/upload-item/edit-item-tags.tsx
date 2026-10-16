// Shown after the ML service has analysed the photo.
// Displays the item and the ML's results in editable boxes, so the user can
// fix anything it got wrong, then Confirm saves it to the wardrobe.
// Shown after a photo is uploaded: the backend has already saved the item with the
// ML's guesses. The user checks/fixes the details here, then Save updates the item.
// Styled to match the wardrobe item edit screen (screens/saved/wardrobe-item.tsx).

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { useStyleUColors, useThemedStyles } from '../../hooks/use-theme';
import type { StyleUColors } from '../../services/styleu-theme';
import type { WardrobeItem } from '../../services/wardrobe/wardrobe-types';

// Everything sent back when the user saves (tags in lower case).
export type ConfirmedItem = {
  category: string;
  style: string[];
  colour: string[];
  material: string[];
  tags: string[];
  brand: string;
  size: string;
  price: number | null;
};

type Props = {
  photoUri: string;
  result: WardrobeItem;
  /** Saves the item. Throw an Error to show its message on this screen. */
  onConfirm: (item: ConfirmedItem) => Promise<void>;
  onRetake: () => void;
};

// "Casual, Summer " -> ['casual', 'summer']
function toList(value: string) {
  return value
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export default function ItemTagsForm({ photoUri, result, onConfirm, onRetake }: Props) {
  const colors = useStyleUColors();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  // Guesses from the ML service, which the user can type over.
  const [category, setCategory] = useState(result?.category ?? '');
  const [style, setStyle] = useState((result?.styles ?? []).join(', '));
  const [colour, setColour] = useState((result?.colours ?? []).join(', '));
  // Extra details the ML can't detect; all optional.
  const [material, setMaterial] = useState((result?.materials ?? []).join(', '));
  const [tags, setTags] = useState((result?.tags ?? []).join(', '));
  const [brand, setBrand] = useState(result?.brand ?? '');
  const [size, setSize] = useState(result?.size ?? '');
  const [price, setPrice] = useState(result?.price == null ? '' : String(result.price));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The background-removed image the backend saved, or the original photo if it's missing.
  const imageUri = result?.imageUrl ?? photoUri;

  const confirm = async () => {
    if (!category.trim()) {
      setError('A category is required.');
      return;
    }

    let parsedPrice: number | null = null;
    if (price.trim()) {
      parsedPrice = Number(price.trim().replace(/^\$/, ''));
      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        setError('Price must be a number of 0 or more.');
        return;
      }
      if (parsedPrice >= 100000) {
        setError('Price must be less than $100,000.');
        return;
      }
    }

    setError(null);
    setSaving(true);
    try {
      await onConfirm({
        category: category.trim().toLowerCase(),
        style: toList(style),
        colour: toList(colour),
        material: toList(material),
        tags: toList(tags),
        brand: brand.trim().toLowerCase(),
        size: size.trim().toLowerCase(),
        price: parsedPrice,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the item. Please try again.');
      setSaving(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ paddingBottom: 110 + insets.bottom }} keyboardShouldPersistTaps="handled">
          <View style={{ paddingTop: insets.top + 16 }}>
            <Image source={{ uri: imageUri }} style={[styles.hero, { height: screenWidth * 0.95 }]} resizeMode="contain" />
          </View>

          <View style={styles.body}>
            <ThemedText style={styles.name}>Check your new item</ThemedText>
            <ThemedText style={styles.subtitle}>We analysed your item. Make changes here.</ThemedText>

            <FormField label="Category" required value={category} onChangeText={setCategory} placeholder="e.g. pants" />
            <FormField label="Brand" value={brand} onChangeText={setBrand} />
            <View style={styles.fieldRow}>
              <View style={{ flex: 1 }}>
                <FormField label="Size" value={size} onChangeText={setSize} placeholder="e.g. M" />
              </View>
              <View style={{ flex: 1 }}>
                <FormField label="Price" value={price} onChangeText={setPrice} placeholder="0.00" keyboardType="decimal-pad" />
              </View>
            </View>
            <FormField label="Style" hint="Separate with commas" value={style} onChangeText={setStyle} placeholder="e.g. casual, exercise" />
            <FormField label="Colour" hint="Separate with commas" value={colour} onChangeText={setColour} placeholder="e.g. black, white" />
            <FormField label="Material" hint="Separate with commas" value={material} onChangeText={setMaterial} placeholder="e.g. cotton" />
            <FormField label="Tags" hint="Separate with commas" value={tags} onChangeText={setTags} />

            {error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={18} color={colors.errorText} />
                <ThemedText style={styles.errorBannerText}>{error}</ThemedText>
                <TouchableOpacity onPress={() => setError(null)} accessibilityLabel="Dismiss">
                  <Ionicons name="close" size={18} color={colors.errorText} />
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </ScrollView>

        <View style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity style={styles.secondaryButton} onPress={onRetake} disabled={saving}>
            <ThemedText style={styles.secondaryButtonText}>Retake</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.primaryButton, saving && { opacity: 0.6 }]} onPress={() => void confirm()} disabled={saving}>
            {saving ? <ActivityIndicator color={colors.onAccent} /> : <ThemedText style={styles.primaryButtonText}>Save</ThemedText>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  keyboardType?: 'default' | 'decimal-pad';
};

// Same field as on the wardrobe item edit screen.
function FormField({ label, value, onChangeText, required, hint, placeholder, keyboardType = 'default' }: FormFieldProps) {
  const colors = useStyleUColors();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.field}>
      <ThemedText style={styles.fieldLabel}>
        {label}
        {required ? <ThemedText style={{ color: colors.accentStrong }}> *</ThemedText> : null}
        {hint ? <ThemedText style={styles.fieldHint}>{`  ${hint}`}</ThemedText> : null}
      </ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
        accessibilityLabel={label}
      />
    </View>
  );
}

// Copied from screens/saved/wardrobe-item.tsx so both screens look the same.
const createStyles = (colors: StyleUColors) =>
  StyleSheet.create({
    hero: {
      width: '100%',
      backgroundColor: colors.imageBackdrop,
    },
    body: {
      padding: 20,
      gap: 12,
    },
    name: {
      fontSize: 24,
      lineHeight: 30,
      fontWeight: '600',
    },
    subtitle: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.subtleText,
      marginTop: -4,
    },
    field: {
      gap: 6,
    },
    fieldRow: {
      flexDirection: 'row',
      gap: 12,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '600',
    },
    fieldHint: {
      fontSize: 12,
      fontWeight: '400',
      color: colors.subtleText,
    },
    input: {
      height: 48,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      borderRadius: 14,
      backgroundColor: colors.input,
      paddingHorizontal: 14,
      fontSize: 15,
      color: colors.text,
    },
    actionBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'row',
      gap: 14,
      paddingHorizontal: 20,
      paddingTop: 12,
      backgroundColor: colors.card,
    },
    primaryButton: {
      flex: 1,
      height: 58,
      borderRadius: 18,
      backgroundColor: colors.accentStrong,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    primaryButtonText: {
      color: colors.onAccent,
      fontSize: 16,
      fontWeight: '600',
    },
    secondaryButton: {
      flex: 1,
      height: 58,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.errorSurface,
      borderRadius: 12,
      padding: 12,
    },
    errorBannerText: {
      flex: 1,
      fontSize: 13,
      color: colors.errorText,
    },
  });