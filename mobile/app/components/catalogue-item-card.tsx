import type { ReactNode } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import type { CatalogueItem } from '../services/wishlist/wishlist-types';
import { StyleUTokens } from '../services/styleu-theme';
import { ThemedText } from './themed-text';

const PLACEHOLDER_IMAGE = 'https://placehold.co/300x360/F2EFEC/ABABAB/png?text=No+image';

type Props = {
  item: CatalogueItem;
  details: string[];
  onPress: () => void;
  action?: ReactNode;
  nameLines?: number;
};

/** Shared compact catalogue card used by horizontal recommendation carousels. */
export function CatalogueItemCard({ item, details, onPress, action, nameLines = 2 }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress} accessibilityRole="button" accessibilityLabel={`View ${item.name}`}>
      <Image source={{ uri: item.imageUrl ?? PLACEHOLDER_IMAGE }} style={styles.image} resizeMode="cover" />
      {action ? <View style={styles.action}>{action}</View> : null}
      <ThemedText style={styles.name} numberOfLines={nameLines}>{item.name}</ThemedText>
      {details.map((detail, index) => (
        <ThemedText key={`${detail}-${index}`} style={styles.detail} numberOfLines={1}>{detail}</ThemedText>
      ))}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: 150, gap: 2 },
  image: { width: '100%', height: 180, borderRadius: 16, backgroundColor: '#F2EFEC' },
  action: { position: 'absolute', top: 8, right: 8 },
  name: { color: StyleUTokens.colors.text, fontSize: 15, lineHeight: 20, fontWeight: '600', marginTop: 4 },
  detail: { color: StyleUTokens.colors.mutedText, fontSize: 13, lineHeight: 18 },
});
