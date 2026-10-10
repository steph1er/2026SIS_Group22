import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { router } from 'expo-router';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';

import { useSavedOutfits } from '../../hooks/use-saved-outfits';
import { styles } from '../../services/saved-outfits/saved-outfit-theme';
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