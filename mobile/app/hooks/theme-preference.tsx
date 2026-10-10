import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Appearance, Platform } from 'react-native';

// Installs the persistent localStorage polyfill on iOS and Android.
import '../../src/auth/storage';

export type AppColorScheme = 'light' | 'dark';

const STORAGE_KEY = 'styleu.colorScheme';

function readStoredScheme(): AppColorScheme {
  try {
    return globalThis.localStorage?.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

type ThemePreference = {
  colorScheme: AppColorScheme;
  setColorScheme: (scheme: AppColorScheme) => void;
};

const ThemePreferenceContext = createContext<ThemePreference>({
  colorScheme: 'light',
  setColorScheme: () => {},
});

/**
 * holds the app's light/dark choice from Settings. StyleU is light by default and
 * ignores the phone's system setting, so every screen follows this one value.
 */
export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
  const [colorScheme, setScheme] = useState<AppColorScheme>(readStoredScheme);

  // native controls (switches, keyboards, alerts) follow React Native's Appearance,
  // so keep it in step with the app's choice instead of the system setting.
  useEffect(() => {
    if (Platform.OS !== 'web') Appearance.setColorScheme(colorScheme);
  }, [colorScheme]);

  const setColorScheme = useCallback((scheme: AppColorScheme) => {
    setScheme(scheme);
    try {
      globalThis.localStorage?.setItem(STORAGE_KEY, scheme);
    } catch {
      // not saved; the choice still applies until the app restarts.
    }
  }, []);

  const value = useMemo(() => ({ colorScheme, setColorScheme }), [colorScheme, setColorScheme]);

  return <ThemePreferenceContext.Provider value={value}>{children}</ThemePreferenceContext.Provider>;
}

export function useThemePreference() {
  return useContext(ThemePreferenceContext);
}
