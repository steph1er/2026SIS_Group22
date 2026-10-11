import { Ionicons } from '@expo/vector-icons';
import { Link, router, usePathname } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useAuth } from '../../src/auth/auth-provider';
import { ThemedText } from './themed-text';
import { useStyleUColors, useThemedStyles } from '../hooks/use-theme';
import type { StyleUColors } from '../services/styleu-theme';

type IconName = keyof typeof Ionicons.glyphMap;
type Tab = { href: string; paths: readonly string[]; label: string; icon: IconName; activeIcon: IconName };

// `paths` are the screens that highlight the tab: its own page plus any screen opened from it.
const TABS: Tab[] = [
  { href: '/home-dashboard', paths: ['/home-dashboard'], label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { href: '/outfits', paths: ['/outfits'], label: 'Outfits', icon: 'shirt-outline', activeIcon: 'shirt' },
];

const RIGHT_TABS: Tab[] = [
  { href: '/saved', paths: ['/saved', '/wishlist', '/wardrobe'], label: 'Saved', icon: 'bookmark-outline', activeIcon: 'bookmark' },
  { href: '/profile', paths: ['/profile', '/settings', '/my-colour-analysis'], label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
];

const MENU_OPTIONS: { href: string; label: string; icon: IconName }[] = [
  { href: './upload-item', label: 'Upload item', icon: 'cloud-upload-outline' },
  { href: './colour-analysis', label: 'Colour analysis', icon: 'color-palette-outline' },
];

function NavTab({ tab, pathname }: { tab: Tab; pathname: string }) {
  const colors = useStyleUColors();
  const styles = useThemedStyles(createStyles);
  const isActive = tab.paths.includes(pathname);
  return (
    <Link href={tab.href as never} asChild>
      <Pressable style={styles.tab} accessibilityRole="tab" accessibilityState={{ selected: isActive }}>
        <Ionicons name={isActive ? tab.activeIcon : tab.icon} size={22} color={isActive ? colors.icon : colors.iconInactive} />
        <ThemedText style={isActive ? styles.activeLabel : styles.label}>{tab.label}</ThemedText>
      </Pressable>
    </Link>
  );
}

export function BottomNavBar() {
  const colors = useStyleUColors();
  const styles = useThemedStyles(createStyles);
  const pathname = usePathname();
  const { user } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleOptionPress = (href: string) => {
    setMenuVisible(false);
        router.push(href as never);
  };

  // Only for signed-in users, so the Welcome, Login and Sign Up screens cannot open
  // Home or Profile. Also hidden during onboarding so a new user cannot skip it, and
  // on item details (catalogue and wardrobe), which have their own action bar.
  if (
    !user ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/item/') ||
    pathname.startsWith('/wardrobe-item/')
  )
    return null;

  return (
    <>
      <View style={styles.container}>
        {TABS.map((tab) => (
          <NavTab key={tab.href} tab={tab} pathname={pathname} />
        ))}

        <View style={styles.tab}>
          <Pressable
            style={styles.centerButton}
            onPress={() => setMenuVisible((prev) => !prev)}
            accessibilityLabel={menuVisible ? 'Close menu' : 'Open menu'}
          >
            <Ionicons name={menuVisible ? 'close' : 'add'} size={28} color={colors.buttonText} />
          </Pressable>
        </View>

        {RIGHT_TABS.map((tab) => (
          <NavTab key={tab.href} tab={tab} pathname={pathname} />
        ))}
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <Pressable style={styles.popup} onPress={(e) => e.stopPropagation()}>
            {MENU_OPTIONS.map((option) => (
              <Pressable
                key={option.href}
                style={styles.optionRow}
                onPress={() => handleOptionPress(option.href)}
              >
                <View style={styles.optionIconCircle}>
                  <Ionicons name={option.icon} size={18} color={colors.accentStrong} />
                </View>
                <ThemedText style={styles.optionLabel}>{option.label}</ThemedText>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const createStyles = (colors: StyleUColors) =>
  StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    marginBottom: 20,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.navBorder,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  label: {
    fontSize: 12,
    color: colors.iconInactive,
  },
  activeLabel: {
    fontSize: 12,
    color: colors.icon,
    fontWeight: '700',
  },
  centerButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.scrim,
    justifyContent: 'flex-end',
  },
  popup: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 110,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  optionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.icon,
  },
});
