import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Link, router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '../../components/themed-text';
import { useStyleUColors, useThemedStyles } from '../../hooks/use-theme';
import type { StyleUColors } from '../../services/styleu-theme';
import { WardrobeCollection } from './wardrobe';
import { WishlistCollection } from './wishlist';

export type SavedTab = 'wardrobe' | 'wishlist';

const TABS: { key: SavedTab; label: string }[] = [
  { key: 'wardrobe', label: 'Wardrobe' },
  { key: 'wishlist', label: 'Wishlist' },
];

const TOGGLE_PADDING = 4;
const TOGGLE_BORDER = 1;

// Switching tabs swaps the collection below, which rebuilds this header. Remembering the last tab
// lets the new toggle start where the old one was and slide across, instead of jumping.
let lastShownTab: SavedTab | null = null;

/** Link to Saved opened on a given tab, e.g. after leaving a wardrobe item. */
export function savedHref(tab: SavedTab) {
  return `/saved?tab=${tab}` as const;
}

/**
 * My Collections: one page that toggles between the user's wardrobe and wishlist.
 * The open tab lives in the URL (?tab=wishlist), so links and Back return to the same tab.
 */
export default function SavedScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const tab: SavedTab = params.tab === 'wishlist' ? 'wishlist' : 'wardrobe';
  const header = <SavedHeader tab={tab} onChange={(next) => router.setParams({ tab: next })} />;

  return tab === 'wardrobe' ? <WardrobeCollection header={header} /> : <WishlistCollection header={header} />;
}

function SavedHeader({ tab, onChange }: { tab: SavedTab; onChange: (tab: SavedTab) => void }) {
  const colors = useStyleUColors();
  const styles = useThemedStyles(createStyles);
  const tabIndex = TABS.findIndex((t) => t.key === tab);

  const [toggleWidth, setToggleWidth] = useState(0);
  const segmentWidth = toggleWidth > 0 ? (toggleWidth - (TOGGLE_PADDING + TOGGLE_BORDER) * 2) / TABS.length : 0;

  const position = useSharedValue(TABS.findIndex((t) => t.key === (lastShownTab ?? tab)));
  useEffect(() => {
    position.value = withTiming(tabIndex, { duration: 220 });
    lastShownTab = tab;
  }, [position, tab, tabIndex]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value * segmentWidth }],
  }));

  return (
    <View style={styles.headerBlock}>
      <View style={styles.titleRow}>
        <ThemedText type="pageTitle">My Collections</ThemedText>
        <Link href="./settings" asChild>
          <TouchableOpacity style={styles.iconCircle} accessibilityLabel="Settings">
            <Ionicons name="settings-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </Link>
      </View>

      <View
        style={styles.toggle}
        accessibilityRole="tablist"
        onLayout={(event) => setToggleWidth(event.nativeEvent.layout.width)}
      >
        {/* The highlight slides between the two tabs, like the Create Outfit toggle. */}
        <Animated.View
          style={[styles.indicator, { width: segmentWidth, opacity: segmentWidth > 0 ? 1 : 0 }, indicatorStyle]}
        />
        {TABS.map(({ key, label }) => {
          const selected = key === tab;
          return (
            <Pressable
              key={key}
              onPress={() => {
                if (!selected) onChange(key);
              }}
              style={styles.segment}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
            >
              <ThemedText style={[styles.segmentText, selected && styles.segmentTextSelected]}>{label}</ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: StyleUColors) =>
  StyleSheet.create({
    headerBlock: {
      gap: 16,
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.input,
      alignItems: 'center',
      justifyContent: 'center',
    },
    toggle: {
      flexDirection: 'row',
      backgroundColor: colors.input,
      borderWidth: TOGGLE_BORDER,
      borderColor: colors.borderSoft,
      borderRadius: 24,
      padding: TOGGLE_PADDING,
    },
    indicator: {
      position: 'absolute',
      top: TOGGLE_PADDING,
      bottom: TOGGLE_PADDING,
      left: TOGGLE_PADDING,
      borderRadius: 20,
      backgroundColor: colors.card,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 1,
    },
    segment: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
    },
    segmentText: {
      fontSize: 15,
      lineHeight: 20,
      color: colors.subtleText,
      fontWeight: '500',
    },
    segmentTextSelected: {
      color: colors.text,
      fontWeight: '600',
    },
  });
