import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { ThemedView } from '../../components/themed-view';
import { ThemedText } from '../../components/themed-text';
import { deleteWardrobeItem, fetchWardrobeItem, updateWardrobeItem } from '../../services/wardrobe/wardrobe-service';
import type { WardrobeItem, WardrobeItemChanges } from '../../services/wardrobe/wardrobe-types';

const ACCENT = '#D98E73';
const TEXT = '#22201F';
const MUTED = '#8A8683';
const DANGER = '#B3412A';
const PLACEHOLDER_IMAGE = 'https://placehold.co/600x800/F2EFEC/ABABAB/png?text=No+image';

function formatPrice(price: number | null) {
  if (price === null) return null;
  return Number.isInteger(price) ? `$${price}` : `$${price.toFixed(2)}`;
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString();
}

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/wardrobe' as never);
}

// The edit form keeps every field as text; lists are comma-separated.
type FormValues = {
  category: string;
  brand: string;
  size: string;
  price: string;
  styles: string;
  colours: string;
  materials: string;
  tags: string;
};

function toFormValues(item: WardrobeItem): FormValues {
  return {
    category: item.category ?? '',
    brand: item.brand ?? '',
    size: item.size ?? '',
    price: item.price === null ? '' : String(item.price),
    styles: item.styles.join(', '),
    colours: item.colours.join(', '),
    materials: item.materials.join(', '),
    tags: item.tags.join(', '),
  };
}

function splitList(value: string) {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/** Check the form against the backend's UpdateWardrobeItemDto, returning the changes or an error message. */
function parseForm(values: FormValues): { changes: WardrobeItemChanges } | { error: string } {
  if (!values.category.trim()) return { error: 'A category is required.' };

  let price: number | null = null;
  if (values.price.trim()) {
    price = Number(values.price.trim().replace(/^\$/, ''));
    if (!Number.isFinite(price) || price < 0) return { error: 'Price must be a number of 0 or more.' };
    if (price >= 100000) return { error: 'Price must be less than $100,000.' };
  }

  return {
    changes: {
      category: values.category,
      brand: values.brand,
      size: values.size,
      price,
      styles: splitList(values.styles),
      colours: splitList(values.colours),
      materials: splitList(values.materials),
      tags: splitList(values.tags),
    },
  };
}

type Loaded = { id: string; data: WardrobeItem | null; error: string | null };

/**
 * One item from the user's wardrobe, opened with router.push(wardrobeItemHref(id)) from My Wardrobe.
 * Shows the item's details and lets the user edit or delete it.
 */
export default function WardrobeItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const [item, setItem] = useState<Loaded | null>(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [form, setForm] = useState<FormValues | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    fetchWardrobeItem(id)
      .then((data) => {
        if (!cancelled) setItem({ id, data, error: null });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : 'Could not load this item.';
        setItem((previous) => (previous?.id === id && previous.data ? previous : { id, data: null, error: message }));
      });

    return () => {
      cancelled = true;
    };
  }, [id, reloadCount]);

  // Leave edit mode when moving to a different item.
  useEffect(() => {
    setForm(null);
    setNotice(null);
  }, [id]);

  // Ignore results that belong to the previous item while the next one loads.
  const current = item?.id === id ? item : null;
  const shown = current?.data ?? null;

  if (!shown) {
    return (
      <ThemedView style={[styles.centered, { paddingTop: insets.top }]}>
        <TouchableOpacity style={[styles.circleButton, styles.floatingBack, { top: insets.top + 8 }]} onPress={goBack} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={22} color={TEXT} />
        </TouchableOpacity>
        {current?.error ? (
          <View style={styles.stateMessage}>
            <Ionicons name="cloud-offline-outline" size={28} color={ACCENT} />
            <ThemedText style={styles.stateTitle}>Couldn't load this item</ThemedText>
            <ThemedText style={styles.stateBody}>{current.error}</ThemedText>
            <TouchableOpacity onPress={() => setReloadCount((count) => count + 1)}>
              <ThemedText style={styles.stateAction}>Try again</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <ActivityIndicator />
        )}
      </ThemedView>
    );
  }

  const isEditing = form !== null;
  const isBusy = isSaving || isDeleting;
  const price = formatPrice(shown.price);
  const title = shown.category ? titleCase(shown.category) : 'Untitled item';
  const addedOn = formatDate(shown.createdAt);
  const editedOn = formatDate(shown.modifiedAt);

  const details: { label: string; values: string[] }[] = [
    { label: 'Size', values: shown.size ? [shown.size.toUpperCase()] : [] },
    { label: 'Colour', values: shown.colours },
    { label: 'Style', values: shown.styles },
    { label: 'Material', values: shown.materials },
    { label: 'Tags', values: shown.tags },
  ].filter((detail) => detail.values.length > 0);

  const save = async () => {
    if (!form) return;
    const parsed = parseForm(form);
    if ('error' in parsed) {
      setNotice(parsed.error);
      return;
    }
    setNotice(null);
    setIsSaving(true);
    try {
      const updated = await updateWardrobeItem(shown.id, parsed.changes);
      setItem({ id: shown.id, data: updated, error: null });
      setForm(null);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not save your changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async () => {
    setConfirmDelete(false);
    setNotice(null);
    setIsDeleting(true);
    try {
      await deleteWardrobeItem(shown.id);
      goBack();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not delete the item.');
      setIsDeleting(false);
    }
  };

  const setField = (field: keyof FormValues) => (value: string) =>
    setForm((previous) => (previous ? { ...previous, [field]: value } : previous));

  return (
    <ThemedView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ paddingBottom: 110 + insets.bottom }} keyboardShouldPersistTaps="handled">
          <View>
            <Image source={{ uri: shown.imageUrl ?? PLACEHOLDER_IMAGE }} style={[styles.hero, { height: screenWidth * 0.95 }]} resizeMode="contain" />
            <View style={[styles.heroButtons, { top: insets.top + 8 }]}>
              <TouchableOpacity style={styles.circleButton} onPress={goBack} accessibilityLabel="Back">
                <Ionicons name="chevron-back" size={22} color={TEXT} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.body}>
            {isEditing ? (
              <>
                <ThemedText style={styles.name}>Edit item</ThemedText>
                <FormField label="Category" required value={form.category} onChangeText={setField('category')} placeholder="e.g. pants" />
                <FormField label="Brand" value={form.brand} onChangeText={setField('brand')} />
                <View style={styles.fieldRow}>
                  <View style={{ flex: 1 }}>
                    <FormField label="Size" value={form.size} onChangeText={setField('size')} placeholder="e.g. M" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <FormField label="Price" value={form.price} onChangeText={setField('price')} placeholder="0.00" keyboardType="decimal-pad" />
                  </View>
                </View>
                <FormField label="Style" hint="Separate with commas" value={form.styles} onChangeText={setField('styles')} placeholder="e.g. casual, exercise" />
                <FormField label="Colour" hint="Separate with commas" value={form.colours} onChangeText={setField('colours')} placeholder="e.g. black, white" />
                <FormField label="Material" hint="Separate with commas" value={form.materials} onChangeText={setField('materials')} placeholder="e.g. cotton" />
                <FormField label="Tags" hint="Separate with commas" value={form.tags} onChangeText={setField('tags')} />
              </>
            ) : (
              <>
                <View style={styles.brandRow}>
                  <ThemedText style={styles.brand} numberOfLines={1}>
                    {shown.brand?.toUpperCase() ?? ''}
                  </ThemedText>
                  {price ? <ThemedText style={styles.price}>{price}</ThemedText> : null}
                </View>

                <ThemedText style={styles.name}>{title}</ThemedText>

                {details.map((detail) => (
                  <View key={detail.label} style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>{detail.label}</ThemedText>
                    <View style={styles.chips}>
                      {detail.values.map((value, index) => (
                        <View key={`${value}-${index}`} style={styles.chip}>
                          <ThemedText style={styles.chipText}>{titleCase(value)}</ThemedText>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}

                {addedOn || editedOn ? (
                  <ThemedText style={styles.meta}>
                    {[addedOn && `Added ${addedOn}`, editedOn && `Edited ${editedOn}`].filter(Boolean).join(' · ')}
                  </ThemedText>
                ) : null}
              </>
            )}

            {notice ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={18} color="#8A2D1B" />
                <ThemedText style={styles.errorBannerText}>{notice}</ThemedText>
                <TouchableOpacity onPress={() => setNotice(null)} accessibilityLabel="Dismiss">
                  <Ionicons name="close" size={18} color="#8A2D1B" />
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </ScrollView>

        <View style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  setForm(null);
                  setNotice(null);
                }}
                disabled={isBusy}
              >
                <ThemedText style={styles.secondaryButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryButton, isBusy && { opacity: 0.6 }]} onPress={() => void save()} disabled={isBusy}>
                {isSaving ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.primaryButtonText}>Save changes</ThemedText>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => setConfirmDelete(true)}
                disabled={isBusy}
                accessibilityLabel={`Delete ${title} from wardrobe`}
              >
                {isDeleting ? <ActivityIndicator color={DANGER} /> : <Ionicons name="trash-outline" size={22} color={DANGER} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, isBusy && { opacity: 0.6 }]}
                onPress={() => {
                  setNotice(null);
                  setForm(toFormValues(shown));
                }}
                disabled={isBusy}
              >
                <Ionicons name="create-outline" size={20} color="#fff" />
                <ThemedText style={styles.primaryButtonText}>Edit item</ThemedText>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>

      <Modal visible={confirmDelete} transparent animationType="fade" onRequestClose={() => setConfirmDelete(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setConfirmDelete(false)}>
          <Pressable style={styles.modalCard}>
            <ThemedText style={styles.modalTitle}>Delete this item?</ThemedText>
            <ThemedText style={styles.modalBody}>It will be removed from your wardrobe. This can't be undone.</ThemedText>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setConfirmDelete(false)}>
                <ThemedText style={styles.secondaryButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryButton, { backgroundColor: DANGER }]} onPress={() => void remove()}>
                <ThemedText style={styles.primaryButtonText}>Delete</ThemedText>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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

function FormField({ label, value, onChangeText, required, hint, placeholder, keyboardType = 'default' }: FormFieldProps) {
  return (
    <View style={styles.field}>
      <ThemedText style={styles.fieldLabel}>
        {label}
        {required ? <ThemedText style={{ color: ACCENT }}> *</ThemedText> : null}
        {hint ? <ThemedText style={styles.fieldHint}>{`  ${hint}`}</ThemedText> : null}
      </ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#B5B1AE"
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  floatingBack: {
    position: 'absolute',
    left: 20,
  },
  hero: {
    width: '100%',
    backgroundColor: '#F2EFEC',
  },
  heroButtons: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 20,
    gap: 12,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  brand: {
    flex: 1,
    fontSize: 14,
    letterSpacing: 0.5,
    color: MUTED,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
  },
  name: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600',
  },
  detailRow: {
    gap: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: MUTED,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#E6E2DE',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#FAF9F7',
  },
  chipText: {
    fontSize: 13,
    color: TEXT,
  },
  meta: {
    fontSize: 12,
    color: MUTED,
    marginTop: 4,
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
    color: MUTED,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ECE8E4',
    borderRadius: 14,
    backgroundColor: '#F6F4F2',
    paddingHorizontal: 14,
    fontSize: 15,
    color: TEXT,
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
    backgroundColor: '#fff',
  },
  primaryButton: {
    flex: 1,
    height: 58,
    borderRadius: 18,
    backgroundColor: ACCENT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    height: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ECE8E4',
    backgroundColor: '#FAF9F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    width: 58,
    height: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F0D5CE',
    backgroundColor: '#FBF0EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FBE3DD',
    borderRadius: 12,
    padding: 12,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#8A2D1B',
  },
  stateMessage: {
    alignItems: 'center',
    gap: 6,
    padding: 24,
  },
  stateTitle: {
    fontWeight: '600',
    fontSize: 15,
  },
  stateBody: {
    fontSize: 13,
    lineHeight: 18,
    color: MUTED,
    textAlign: 'center',
  },
  stateAction: {
    color: ACCENT,
    fontWeight: '600',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
  },
  modalBody: {
    fontSize: 14,
    lineHeight: 20,
    color: MUTED,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});
