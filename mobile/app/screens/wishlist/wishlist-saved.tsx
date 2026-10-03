import {
  ActivityIndicator,
  Image,
  type ImageSourcePropType,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';

import { ThemedView } from '../../components/themed-view';
import { ThemedText } from '../../components/themed-text';
import { useWishlist } from '../../hooks/use-wishlist';

const ACCENT = '#D98E73';
const PAGE_PADDING = 20;
const GRID_GAP = 14;

// Cover photos for collections that are not backed by the API yet (they keep placeholder counts).
const COVERS = {
  uploads: require('../../../assets/onboarding/minimalist.jpg'),
  wishlist: require('../../../assets/onboarding/bohemian.jpg'),
  outfits: require('../../../assets/onboarding/classy.jpg'),
  casual: require('../../../assets/onboarding/casual.jpg'),
};

type Collection = {
  id: string;
  label: string;
  countLabel: string;
  cover: ImageSourcePropType;
  isLoading?: boolean;
  onPress?: () => void;
};

function pluralise(count: number, word: string) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

export default function WishlistSavedScreen() {
  // Only the wishlist itself is loaded here (for its count and cover); the items are shown on /wishlist.
  const { wishlist, isWishlistLoading, wishlistError, refresh } = useWishlist();

  // Sized in points: percentage widths combined with aspectRatio lay out but never draw on React Native 0.86.
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = (screenWidth - PAGE_PADDING * 2 - GRID_GAP) / 2;
  const cardSize = { width: cardWidth, height: cardWidth / 0.9 };

  const wishlistCover = wishlist.find((entry) => entry.item.imageUrl)?.item.imageUrl;

  const collections: Collection[] = [
    { id: 'uploads', label: 'My Uploads', countLabel: '24 items', cover: COVERS.uploads },
    {
      id: 'wishlist',
      label: 'Wishlist',
      countLabel: wishlistError ? 'Tap to retry' : pluralise(wishlist.length, 'item'),
      cover: wishlistCover ? { uri: wishlistCover } : COVERS.wishlist,
      isLoading: isWishlistLoading && wishlist.length === 0 && !wishlistError,
      onPress: () => router.push('/wishlist' as never),
    },
    { id: 'outfits', label: 'Saved Outfits', countLabel: '8 outfits', cover: COVERS.outfits },
    { id: 'casual', label: 'Casual', countLabel: '16 items', cover: COVERS.casual },
  ];

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>My Collections</ThemedText>

            <Link href="./settings" asChild>
              <TouchableOpacity style={styles.iconCircle} accessibilityLabel="Settings">
                <Ionicons name="settings-outline" size={20} color="#22201F" />
              </TouchableOpacity>
            </Link>
          </View>

          <View style={styles.sectionHeaderRow}>
            <ThemedText style={styles.sectionTitle}>Saved Collections</ThemedText>
            <ThemedText style={styles.accentText}>{collections.length} collections</ThemedText>
          </View>

          <View style={styles.grid}>
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} size={cardSize} />
            ))}
          </View>

          {wishlistError ? (
            <TouchableOpacity style={styles.errorRow} onPress={refresh}>
              <Ionicons name="alert-circle-outline" size={16} color="#8A2D1B" />
              <ThemedText style={styles.errorText} numberOfLines={3}>
                Couldn't load your wishlist: {wishlistError} Tap to retry.
              </ThemedText>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity style={styles.createCard}>
            <View style={styles.createIcon}>
              <Ionicons name="add" size={20} color="#22201F" />
            </View>

            <View style={{ flex: 1 }}>
              <ThemedText style={styles.cardTitle}>+ Create Collection</ThemedText>
              <ThemedText style={styles.muted}>
                Build a new lookbook-style collection and add items and outfits.
              </ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rowCard}>
            <View style={styles.rowCardIcon}>
              <Ionicons name="sparkles-outline" size={20} color={ACCENT} />
            </View>

            <View style={{ flex: 1 }}>
              <ThemedText style={styles.cardTitle}>Outfit Builder Canvas</ThemedText>
              <ThemedText style={styles.muted}>Experiment with visual layouts & styling</ThemedText>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#75726F" />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

type CardSize = { width: number; height: number };

function CollectionCard({ collection, size }: { collection: Collection; size: CardSize }) {
  return (
    <TouchableOpacity
      style={[styles.collectionCard, size]}
      onPress={collection.onPress}
      disabled={!collection.onPress}
      activeOpacity={0.85}
      accessibilityLabel={`${collection.label}, ${collection.countLabel}`}
    >
      <Image source={collection.cover} style={styles.collectionImage} resizeMode="cover" />
      <View style={styles.countBadge}>
        {collection.isLoading ? (
          <ActivityIndicator size="small" color="#22201F" style={{ transform: [{ scale: 0.7 }] }} />
        ) : (
          <ThemedText style={styles.countBadgeText}>{collection.countLabel}</ThemedText>
        )}
      </View>
      <ThemedText style={styles.collectionLabel}>{collection.label}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: PAGE_PADDING,
    gap: 18,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '600',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4F2F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
  },
  accentText: {
    color: ACCENT,
    fontSize: 13,
  },
  muted: {
    opacity: 0.6,
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  collectionCard: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#EFEAE6',
  },
  collectionImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  countBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    minHeight: 22,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 11,
  },
  countBadgeText: {
    color: '#22201F',
    fontSize: 11,
    fontWeight: '600',
  },
  collectionLabel: {
    position: 'absolute',
    left: 12,
    bottom: 10,
    right: 12,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FBE3DD',
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: '#8A2D1B',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  createCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FDF4F1',
    borderWidth: 1,
    borderColor: '#F0CFC3',
    borderRadius: 18,
    padding: 16,
  },
  createIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2B7A9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#ECEAE7',
    borderRadius: 18,
    padding: 16,
  },
  rowCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FBF0EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
