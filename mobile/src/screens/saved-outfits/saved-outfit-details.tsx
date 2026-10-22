import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useStyleUColors, useThemedStyles } from '../../hooks/use-theme';
import { OUTFIT_SEASONS, OUTFIT_STYLES } from '../../services/create-outfit/create-outfit-service';
import { createStyles } from '../../services/saved-outfits/saved-outfit-theme';
import { updateSavedOutfit, type SavedOutfit, type SavedOutfitItem } from '../../services/saved-outfits/saved-outfits-service';

type Props = {
  outfit: SavedOutfit | null;
  visible: boolean;
  onClose: () => void;
  onOpenItem: (item: SavedOutfitItem) => void;
  onSaved: () => void;
};

type DropdownProps = {
  label: string;
  options: string[];
  value: string | null;
  open: boolean;
  onToggle: () => void;
  onSelect: (value: string | null) => void;
};

function DetailDropdown({ label, options, value, open, onToggle, onSelect }: DropdownProps) {
  const styles = useThemedStyles(createStyles);
  const colors = useStyleUColors();

  return (
    <View>
      <TouchableOpacity style={styles.detailsRow} onPress={onToggle}>
        <Text style={styles.detailsLabel}>{label}</Text>
        <View style={styles.dropdownTrigger}>
          <Text style={value ? styles.dropdownTriggerText : styles.dropdownPlaceholderText} numberOfLines={1}>
            {value ?? 'Select'}
          </Text>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.mutedText} />
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
                  onSelect(selected ? null : option);
                  onToggle();
                }}
              >
                <Text style={[styles.dropdownChipText, selected && styles.dropdownChipTextSelected]}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

export default function SavedOutfitDetails({ outfit, visible, onClose, onOpenItem, onSaved }: Props) {
  const styles = useThemedStyles(createStyles);
  const colors = useStyleUColors();

  const [name, setName] = useState(outfit?.name ?? '');
  const [season, setSeason] = useState<string | null>(outfit?.season ?? null);
  const [style, setStyle] = useState<string | null>(outfit?.style ?? null);
  const [occasion, setOccasion] = useState(outfit?.occasion ?? '');
  const [openDropdown, setOpenDropdown] = useState<'season' | 'style' | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const toggleDropdown = (key: 'season' | 'style') => setOpenDropdown((current) => (current === key ? null : key));

  const handleSave = async () => {
    if (!outfit || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updateSavedOutfit(outfit.id, { name, season, style, occasion });
      onSaved();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Could not save your changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) onClose();
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.detailsOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.detailsBackdrop} onPress={handleClose} accessibilityLabel="Close outfit details" />

        <View style={styles.detailsPopup}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.detailsHeader}>Outfit Details</Text>

            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Outfit Name</Text>
              <TextInput
                style={styles.detailsInput}
                placeholder="Enter outfit name"
                placeholderTextColor={colors.placeholder}
                maxLength={60}
                value={name}
                onChangeText={setName}
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

            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Occasion</Text>
              <TextInput
                style={styles.detailsInput}
                placeholder="Enter occasion"
                placeholderTextColor={colors.placeholder}
                maxLength={60}
                value={occasion}
                onChangeText={setOccasion}
              />
            </View>

            {saveError ? <Text style={styles.detailsError}>{saveError}</Text> : null}

            <View style={styles.detailsButtons}>
              <TouchableOpacity
                style={[styles.detailsSaveButton, saving && styles.detailsButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? <ActivityIndicator /> : <Text style={styles.buttonText}>Save Changes</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.detailsCancelButton} onPress={handleClose} disabled={saving}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}