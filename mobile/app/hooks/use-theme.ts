import { useMemo } from 'react';

import { StyleUPalettes, type StyleUColors } from '../services/styleu-theme';
import { AccentColors, Colors } from '../services/theme';
import { useColorScheme } from './use-color-scheme';

export function useTheme() {
  return Colors[useColorScheme()];
}

export function useAccentColors() {
  return AccentColors[useColorScheme()];
}

/** StyleU colour tokens for the current light/dark choice. */
export function useStyleUColors(): StyleUColors {
  return StyleUPalettes[useColorScheme()];
}

/** Builds a screen's stylesheet from the current colours, rebuilding only when the theme changes. */
export function useThemedStyles<T>(createStyles: (colors: StyleUColors) => T): T {
  const colors = useStyleUColors();
  return useMemo(() => createStyles(colors), [createStyles, colors]);
}
