import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { router } from 'expo-router';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';

import { useSavedOutfits } from '../../hooks/use-saved-outfits';
import { deleteSavedOutfit, type SavedOutfit } from '../../services/saved-outfits/saved-outfits-service';
import { StyleUTokens } from '../../services/styleu-theme';

const { colors } = StyleUTokens;

export default function OutfitsScreen() {
  const [notice, setNotice] = useState<string | null>(null);
  const { outfits, isLoading, error, refresh } = useSavedOutfits();

  const [outfitToDelete, setOutfitToDelete] = useState<SavedOutfit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setOutfitToDelete(null);
    setDeleteError(null);
  };

  const confirmDeleteOutfit = async () => {
    if (!outfitToDelete || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteSavedOutfit(outfitToDelete.id);
      setOutfitToDelete(null);
      refresh();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Could not delete the outfit. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const showEmptyState = !isLoading && !error && outfits.length === 0;

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.titleContainer}>
            <ThemedText style={styles.title}>My Outfits</ThemedText>
              <TouchableOpacity onPress={() => router.push('./create-outfit')} style={styles.button}>
                <Text style={styles.buttonText}>Create Outfit</Text>
              </TouchableOpacity>
          </View>

          {isLoading && outfits.length === 0 ? <ActivityIndicator color={'#D98E73'} /> : null}

          {error ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.muted}>{error}</ThemedText>
              <TouchableOpacity onPress={refresh}>
                <Text style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {showEmptyState ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="shirt-outline" size={28} color={'#D98E73'} />
              </View>
              <ThemedText style={styles.emptyTitle}>No outfits yet</ThemedText>
              <ThemedText style={styles.muted}>
                Put together pieces from your wardrobe and wishlist to build your first outfit.
              </ThemedText>
            </View>
          ) : null}

          {outfits.map((outfit) => (

            <View key={outfit.id} style={styles.itemsInOutfitContainer}>
              {/* items in outfit */}
              <View style={styles.titleContainer}>
                <Text style={styles.outfitName} numberOfLines={1}>{outfit.name}</Text>
                <TouchableOpacity
                  onPress={() => setOutfitToDelete(outfit)}
                  style={styles.deleteButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel="Delete outfit"
                >
                  <Ionicons name="close" size={14} color={colors.buttonText} />
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.outfitItemsGrid}>
                  {outfit.items.map((outfitItem) => (
                    <View key={outfitItem.id} style={styles.itemCard}>
                      {outfitItem.imageUrl ? (
                        <Image source={{ uri: outfitItem.imageUrl }} style={styles.itemImage} />
                      ) : (
                        <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                          <Ionicons name="shirt-outline" size={24} color={'#D98E73'} />
                        </View>
                      )}
                      <Text style={styles.itemName} numberOfLines={1}>{outfitItem.label}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          ))}

          {notice ? <ThemedText style={[styles.muted, styles.notice]}>{notice}</ThemedText> : null}
        </ScrollView>
      </SafeAreaView>

      <Modal transparent animationType="fade" visible={outfitToDelete !== null} onRequestClose={closeDeleteModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete outfit?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete this outfit? This action cannot be undone.
            </Text>
            {deleteError ? <Text style={styles.modalError}>{deleteError}</Text> : null}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCloseButton]}
                onPress={closeDeleteModal}
                disabled={isDeleting}
              >
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalDeleteButton, isDeleting && styles.modalButtonDisabled]}
                onPress={confirmDeleteOutfit}
                disabled={isDeleting}
              >
                {isDeleting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.modalDeleteText}>Delete</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  itemsInOutfitContainer: {
    backgroundColor: colors.mutedAccent,
    borderRadius: 16,
    paddingVertical: 8,
  },
  outfitName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 500,
    paddingHorizontal: 20,
    paddingVertical: 8,
    flexShrink: 1,
  },
  deleteButton: {
    backgroundColor: colors.accent,
    borderRadius: 11,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    alignSelf: 'center',
  },
  outfitItemsGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom:6,
  },
  itemCard: {
    width: 100,
    backgroundColor: colors.mutedBackground,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImage: {
    paddingTop: 8,
    width: '85%',
    aspectRatio: 1,
    resizeMode: 'cover',
  },
  itemImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    padding: 8,
    minHeight: 43,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.buttonText,
    fontWeight: '600',
    fontSize: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  content: {
    padding: 20,
    gap: 18,
    paddingBottom: 110,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#ECEAE7',
    borderRadius: 18,
    paddingVertical: 36,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FBF0EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  muted: {
    opacity: 0.6,
    fontSize: 13,
    textAlign: 'center',
  },
  notice: {
    marginTop: -6,
  },
  errorContainer: {
    alignItems: 'center',
    gap: 8
  },
  retryText: {
    color: '#D98E73',
    fontSize: 14,
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.background,
    borderRadius: 18,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  modalMessage: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  modalError: {
    color: colors.errorRed,
    fontSize: 13,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  modalButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalCloseButton: {
    backgroundColor: colors.button,
  },
  modalCloseText: {
    color: colors.buttonText,
    fontWeight: '600',
    fontSize: 16,
  },
  modalDeleteButton: {
    backgroundColor: colors.accent,
  },
  modalDeleteText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
});
