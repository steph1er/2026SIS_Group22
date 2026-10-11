import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider } from '../src/auth/auth-provider';
import { BottomNavBar } from './components/bottom-nav-bar';
import { ThemePreferenceProvider } from './hooks/theme-preference';
import { useColorScheme } from './hooks/use-color-scheme';
import { useStyleUColors } from './hooks/use-theme';
import './global.css';

export default function RootLayout() {
  return (
    <ThemePreferenceProvider>
      <ThemedRoot />
    </ThemePreferenceProvider>
  );
}

function ThemedRoot() {
  const pathname = usePathname();
  const hideBottomNav = pathname.startsWith('/create-outfit');
  const colorScheme = useColorScheme();
  const colors = useStyleUColors();

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <AuthProvider>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'none',
              contentStyle: { backgroundColor: colors.background },
            }}
          />
          {!hideBottomNav && <BottomNavBar />}
        </View>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
