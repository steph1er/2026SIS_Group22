import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { useStyleUColors, useThemedStyles } from '../hooks/use-theme';
import type { StyleUColors } from '../services/styleu-theme';
import { ThemedText } from './themed-text';

/** Go back a screen, or open `fallback` when there is nothing to go back to (e.g. opened from a link). */
export function goBackOr(fallback: Href) {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}

type BackButtonProps = {
  /** Where to go when there is no previous screen. */
  fallback?: Href;
  /** `back` (chevron) returns from a page you drilled into; `close` (✕) leaves a task such as taking a photo. */
  icon?: 'back' | 'close';
  /** `floating` sits in a white circle so it stays visible over photos. */
  variant?: 'default' | 'floating';
  /** Names the destination next to the chevron, e.g. "My Collections". */
  label?: string;
  /** Replaces the default navigation, e.g. to step back inside a flow or confirm before leaving. */
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** The app's one back/close control. Always placed top-left of the screen it belongs to. */
export function BackButton({ fallback = '/', icon = 'back', variant = 'default', label, onPress, style }: BackButtonProps) {
  const colors = useStyleUColors();
  const styles = useThemedStyles(createStyles);
  const iconName = icon === 'close' ? 'close' : 'chevron-back';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={icon === 'close' ? 'Close' : label ? `Back to ${label}` : 'Back'}
      onPress={onPress ?? (() => goBackOr(fallback))}
      hitSlop={label ? 8 : undefined}
      style={({ pressed }) => [
        label ? styles.labelled : variant === 'floating' ? styles.floating : styles.button,
        pressed && styles.pressed,
        style,
      ]}
    >
      {label ? (
        <>
          <Ionicons name={iconName} size={14} color={colors.subtleText} />
          <ThemedText style={styles.label}>{label}</ThemedText>
        </>
      ) : (
        <Ionicons name={iconName} size={24} color={colors.text} />
      )}
    </Pressable>
  );
}

const createStyles = (colors: StyleUColors) =>
  StyleSheet.create({
    // 44pt square keeps the tap target comfortable; the negative margin lines the icon up with the page edge.
    button: {
      width: 44,
      height: 44,
      marginLeft: -10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    floating: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.12,
      shadowRadius: 3,
      elevation: 2,
    },
    labelled: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    label: {
      fontSize: 14,
      color: colors.subtleText,
    },
    pressed: {
      opacity: 0.6,
    },
  });
