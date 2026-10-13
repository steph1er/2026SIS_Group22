// Shown after the ML service has analysed the photo.
// Displays the item and the ML's results in editable boxes, so the user can
// fix anything it got wrong, then Confirm saves it to the wardrobe.

import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AnalyseItemResult } from '../../../src/upload-item/analyse-item-service';

// Everything sent to the backend when the user confirms (tags in lower case).
export type ConfirmedItem = {
  category: string;
  style: string[];
  colour: string[];
  material: string[];
  tags: string[];
  brand: string;
  size: string;
  price: number | null;
  embedding: number[];
  imagePngBase64: string;
};

type Props = {
  photoUri: string;
  result: AnalyseItemResult;
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
  // Tags from the ML service, which the user can type over.
  const [category, setCategory] = useState(result.category);
  const [style, setStyle] = useState(result.style);
  const [colour, setColour] = useState(result.colour);
  // Extra details the ML can't detect; all optional.
  const [material, setMaterial] = useState('');
  const [tags, setTags] = useState('');
  const [brand, setBrand] = useState('');
  const [size, setSize] = useState('');
  const [price, setPrice] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allFilled = category.trim() !== '' && style.trim() !== '' && colour.trim() !== '';

  // Show the background-removed image from the ML service, or the original photo if it's missing.
  const imageUri = result.image_png_base64 ? `data:image/png;base64,${result.image_png_base64}` : photoUri;

  const confirm = async () => {
    let parsedPrice: number | null = null;
    if (price.trim()) {
      parsedPrice = Number(price.trim().replace(/^\$/, ''));
      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        setError('Price must be a number of 0 or more.');
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
        embedding: result.embedding,
        imagePngBase64: result.image_png_base64,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the item. Please try again.');
      setSaving(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Check the details</Text>
          <Text style={styles.subtitle}>We guessed these from your photo. Fix anything that looks wrong.</Text>

          <Image source={{ uri: imageUri }} style={styles.photo} resizeMode="contain" />

          <Text style={styles.section}>Detected from your photo</Text>
          <TagField
            label="Category"
            value={category}
            onChangeText={setCategory}
            confidence={result.category_confidence}
          />
          <TagField
            label="Style"
            hint="separate with commas"
            value={style}
            onChangeText={setStyle}
            confidence={result.style_confidence}
          />
          <TagField label="Colour" hint="separate with commas" value={colour} onChangeText={setColour} />

          <Text style={styles.section}>More details (optional)</Text>
          <TagField label="Material" hint="e.g. cotton, denim" value={material} onChangeText={setMaterial} />
          <TagField label="Tags" hint="e.g. summer, work" value={tags} onChangeText={setTags} />
          <TagField label="Brand" value={brand} onChangeText={setBrand} />
          <View style={styles.row}>
            <View style={styles.flex}>
              <TagField label="Size" value={size} onChangeText={setSize} />
            </View>
            <View style={styles.flex}>
              <TagField label="Price" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
            </View>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={16} color="#B3261E" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            style={[styles.primaryButton, (!allFilled || saving) && styles.buttonDisabled]}
            onPress={() => void confirm()}
            disabled={!allFilled || saving}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Confirm</Text>}
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={onRetake} disabled={saving}>
            <Text style={styles.secondaryButtonText}>Retake photo</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function TagField({
  label,
  hint,
  value,
  onChangeText,
  confidence,
  keyboardType = 'default',
}: {
  label: string;
  hint?: string;
  value: string;
  onChangeText: (value: string) => void;
  confidence?: number; // 0-1 from the ML service
  keyboardType?: 'default' | 'decimal-pad';
}) {
  // Below 50% the ML wasn't sure, so point the user at this field.
  const unsure = confidence !== undefined && confidence < 0.5;

  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {label}
          {hint ? <Text style={styles.hint}>{`  ${hint}`}</Text> : null}
        </Text>
        {confidence !== undefined ? (
          <Text style={[styles.confidence, unsure && styles.confidenceUnsure]}>
            {unsure ? <Feather name="alert-circle" size={12} /> : null} {Math.round(confidence * 100)}% sure
          </Text>
        ) : null}
      </View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#FAF6F2' },
  content: { padding: 20, gap: 14 },
  title: { fontSize: 22, fontWeight: '800', color: '#4A3A30' },
  subtitle: { fontSize: 14, color: '#7A6A60' },
  section: { fontSize: 15, fontWeight: '800', color: '#4A3A30', marginTop: 6 },
  photo: { width: '100%', height: 280, borderRadius: 16, backgroundColor: '#EFEAE5' },
  row: { flexDirection: 'row', gap: 12 },
  field: { gap: 6 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 13, fontWeight: '700', color: '#8B5E3C' },
  hint: { fontSize: 12, fontWeight: '400', color: '#7A6A60' },
  confidence: { fontSize: 12, color: '#7A6A60' },
  confidenceUnsure: { color: '#B3261E' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6DDD5',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#4A3A30',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FBE3DD',
    borderRadius: 12,
    padding: 12,
  },
  errorText: { flex: 1, fontSize: 13, lineHeight: 18, color: '#8A2D1B' },
  primaryButton: {
    backgroundColor: '#D98E73',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonDisabled: { opacity: 0.5 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryButton: { paddingVertical: 12, alignItems: 'center' },
  secondaryButtonText: { color: '#8B5E3C', fontSize: 15, fontWeight: '600' },
});