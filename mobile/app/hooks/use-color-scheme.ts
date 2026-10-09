import { useThemePreference } from './theme-preference';

/** The app's chosen colour scheme (set in Settings), not the phone's system setting. */
export function useColorScheme() {
  return useThemePreference().colorScheme;
}
