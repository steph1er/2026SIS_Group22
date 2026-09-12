import { useState } from 'react';
import { View, StyleSheet, Pressable, Modal } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from './themed-text';

const TABS = [
  { href: './home-dashboard', label: 'Home', icon: 'home' as const },
  { href: './discover-search', label: 'Search', icon: 'search' as const },
] as const;

const RIGHT_TABS = [
  { href: './wishlist-saved', label: 'Saved', icon: 'bookmark' as const },
  { href: './profile', label: 'Profile', icon: 'user' as const },
] as const;

const MENU_OPTIONS = [
  { key: 'upload', label: 'Upload item', icon: 'upload' as const },
  { key: 'create', label: 'Create outfit', icon: 'x-circle' as const },
  { key: 'analysis', label: 'Colour analysis', icon: 'zap' as const },
];

export function BottomNavBar() {
  const pathname = usePathname();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleOptionPress = (key: string) => {
    setMenuVisible(false);
    // TODO: wire these up to your actual actions/navigation
    console.log('Selected:', key);
  };

  return (
    <>
      <View style={styles.container}>
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link key={tab.href} href={tab.href} asChild>
              <Pressable style={styles.tab}>
                <Feather name={tab.icon} size={22} color={isActive ? '#000' : '#999'} />
                <ThemedText style={isActive ? styles.activeLabel : styles.label}>
                  {tab.label}
                </ThemedText>
              </Pressable>
            </Link>
          );
        })}

        <Pressable
          style={styles.centerButton}
          onPress={() => setMenuVisible((prev) => !prev)}
        >
          <Feather name={menuVisible ? 'x' : 'plus'} size={26} color="#000" />
        </Pressable>

        {RIGHT_TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link key={tab.href} href={tab.href} asChild>
              <Pressable style={styles.tab}>
                <Feather name={tab.icon} size={22} color={isActive ? '#000' : '#999'} />
                <ThemedText style={isActive ? styles.activeLabel : styles.label}>
                  {tab.label}
                </ThemedText>
              </Pressable>
            </Link>
          );
        })}
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
                key={option.key}
                style={styles.optionRow}
                onPress={() => handleOptionPress(option.key)}
              >
                <View style={styles.optionIconCircle}>
                  <Feather name={option.icon} size={18} color="#D98E73" />
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  tab: {
    alignItems: 'center',
    gap: 2,
  },
  label: {
    fontSize: 12,
    color: '#999',
  },
  activeLabel: {
    fontSize: 12,
    color: '#000',
    fontWeight: '700',
  },
  centerButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EDBBA3',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  popup: {
    backgroundColor: '#fff',
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
    backgroundColor: '#FBEAE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
});