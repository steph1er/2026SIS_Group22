import { ScrollView, View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../components/themed-view';
import { ThemedText } from '../../components/themed-text';
import { BottomNavBar } from '../../components/bottom-nav-bar';
import { Link } from 'expo-router';

type Collection = {
  id: string;
  label: string;
  countLabel: string;
  imageUri: string;
};

const COLLECTIONS: Collection[] = [
  { id: 'uploads', label: 'My Uploads', countLabel: '24 items', imageUri: 'https://placehold.co/300x220' },
  { id: 'wishlist', label: 'Wishlist', countLabel: '12 items', imageUri: 'https://placehold.co/300x220' },
  { id: 'outfits', label: 'Saved Outfits', countLabel: '8 outfits', imageUri: 'https://placehold.co/300x220' },
  { id: 'casual', label: 'Casual', countLabel: '16 items', imageUri: 'https://placehold.co/300x220' },
];

export default function WishlistSavedScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <ThemedText type="title">My Profile</ThemedText>

            <Link href="./settings" asChild>
              <TouchableOpacity>
                <Ionicons name="settings-outline" size={22} />
              </TouchableOpacity>
            </Link>
          </View>

          <View style={styles.userRow}>
            <Image
              source={{ uri: 'https://placehold.co/56x56' }}
              style={styles.avatar}
            />

            <View>
              <ThemedText type="subtitle">Amanda Smith</ThemedText>
              <ThemedText style={styles.muted}>
                @amanda_designs
              </ThemedText>
            </View>
          </View>

          <View style={styles.tabSwitcher}>
            <Link href="./profile" asChild>
              <TouchableOpacity style={styles.tab}>
                <ThemedText style={styles.tabText}>
                  My Preferences
                </ThemedText>
              </TouchableOpacity>
            </Link>

            <View style={[styles.tab, styles.tabActive]}>
              <ThemedText style={styles.tabTextActive}>
                Saved
              </ThemedText>
            </View>
          </View>

          <View style={styles.sectionHeaderRow}>
            <ThemedText type="subtitle">
              Saved Collections
            </ThemedText>

            <ThemedText style={styles.muted}>
              {COLLECTIONS.length} collections
            </ThemedText>
          </View>

          <View style={styles.grid}>
            {COLLECTIONS.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.createCard}>
            <View style={styles.createIcon}>
              <Ionicons name="add" size={20} />
            </View>

            <View style={{ flex: 1 }}>
              <ThemedText type="subtitle">
                + Create Collection
              </ThemedText>

              <ThemedText style={styles.muted}>
                Build a new lookbook-style collection and add items
                and outfits.
              </ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rowCard}>
            <View style={styles.rowCardIcon}>
              <Ionicons name="sparkles-outline" size={20} />
            </View>

            <View style={{ flex: 1 }}>
              <ThemedText type="subtitle">
                Outfit Builder Canvas
              </ThemedText>

              <ThemedText style={styles.muted}>
                Experiment with visual layouts & styling
              </ThemedText>
            </View>

            <Ionicons name="chevron-forward" size={20} />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <BottomNavBar />
    </ThemedView>
  );
}

function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <TouchableOpacity style={styles.collectionCard}>
      <Image source={{ uri: collection.imageUri }} style={styles.collectionImage} />
      <View style={styles.countBadge}>
        <ThemedText style={styles.countBadgeText}>{collection.countLabel}</ThemedText>
      </View>
      <View style={styles.collectionLabelRow}>
        <ThemedText style={styles.collectionLabel}>{collection.label}</ThemedText>
        <Ionicons name="ellipsis-horizontal" size={16} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  muted: {
    opacity: 0.6,
    fontSize: 13,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 24,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#fff',
  },
  tabText: {
    opacity: 0.6,
  },
  tabTextActive: {
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  collectionCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  collectionImage: {
    width: '100%',
    height: 110,
  },
  countBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  countBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  collectionLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  collectionLabel: {
    fontWeight: '600',
    fontSize: 13,
  },
  createCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F7E9E4',
    borderRadius: 16,
    padding: 16,
  },
  createIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: 16,
    padding: 16,
  },
  rowCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});