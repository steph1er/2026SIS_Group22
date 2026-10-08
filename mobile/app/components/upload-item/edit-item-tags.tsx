// recieves the json data from the upload-item.tsx and displays the tags in a list that can be edited by the user. 
// the new tags are then sent to the backend for storage in the database. 

// Shown after the ML service has analysed the photo.
// Displays the photo and the ML's results in editable boxes, so the user can
// fix anything it got wrong before the item is saved.

import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
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

import type { AnalyseItemResult } from '../../services/upload-item/analyse-item-service.js';

// The ML result after the user has checked it (tags in lower case).
export type ConfirmedItem = {
  category: string;
  style: string;
  colour: string;
  embedding: number[];
};

type Props = {
  photoUri: string;
  result: AnalyseItemResult;
  onConfirm: (item: ConfirmedItem) => void;
  onRetake: () => void;
};

export default function ItemTagsForm({ photoUri, result, onConfirm, onRetake }: Props) {
  // Start the boxes with the ML's guesses; the user can type over them.
  const [category, setCategory] = useState(result.category);
  const [style, setStyle] = useState(result.style);
  const [colour, setColour] = useState(result.colour);

  const allFilled = category.trim() !== '' && style.trim() !== '' && colour.trim() !== '';

  const confirm = () =>
    onConfirm({
      // The team stores tags in lower case.
      category: category.trim().toLowerCase(),
      style: style.trim().toLowerCase(),
      colour: colour.trim().toLowerCase(),
      embedding: result.embedding,
    });

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Check the details</Text>
          <Text style={styles.subtitle}>We guessed these from your photo. Fix anything that looks wrong.</Text>

          <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="contain" />

          <TagField
            label="Category"
            value={category}
            onChangeText={setCategory}
            confidence={result.category_confidence}
          />
          <TagField label="Style" value={style} onChangeText={setStyle} confidence={result.style_confidence} />
          <TagField label="Colour" value={colour} onChangeText={setColour} />

          <Pressable
            style={[styles.primaryButton, !allFilled && styles.buttonDisabled]}
            onPress={confirm}
            disabled={!allFilled}
          >
            <Text style={styles.primaryButtonText}>Confirm</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={onRetake}>
            <Text style={styles.secondaryButtonText}>Retake photo</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function TagField({
  label,
  value,
  onChangeText,
  confidence,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  confidence?: number; // 0-1 from the ML service
}) {
  // Below 50% the ML wasn't sure, so point the user at this field.
  const unsure = confidence !== undefined && confidence < 0.5;

  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
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
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: '#FAF6F2',
  },
  content: {
    padding: 20,
    gap: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4A3A30',
  },
  subtitle: {
    fontSize: 14,
    color: '#7A6A60',
  },
  photo: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    backgroundColor: '#EFEAE5',
  },
  field: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B5E3C',
  },
  confidence: {
    fontSize: 12,
    color: '#7A6A60',
  },
  confidenceUnsure: {
    color: '#B3261E',
  },
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
  primaryButton: {
    backgroundColor: '#D98E73',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#8B5E3C',
    fontSize: 15,
    fontWeight: '600',
  },
});