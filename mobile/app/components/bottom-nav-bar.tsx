import { View, StyleSheet, Pressable } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { ThemedText } from './themed-text';

const TABS = [
  { href: './home-dashboard', label: 'Home' },
  { href: './discover-search', label: 'Search' },
  { href: './wishlist-saved', label: 'Saved' },
  { href: './profile', label: 'Profile' },
] as const;

export function BottomNavBar() {
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link key={tab.href} href={tab.href} asChild>
            <Pressable style={styles.tab}>
              <ThemedText style={isActive ? styles.activeLabel : styles.label}>
                {tab.label}
              </ThemedText>
            </Pressable>
          </Link>
        ); 
      })}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    marginBottom: 20,     
    backgroundColor: '#fff',       
    borderTopWidth: 1,
    borderTopColor: '#ddd',        
  },
  tab: {
    alignItems: 'center',
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
});