// import { ThemedView } from '../components/themed-view';
// import { ThemedText } from '../components/themed-text';
// import { PrimaryButton } from '../components/primary-button';
// import { BottomNavBar } from '../components/bottom-nav-bar';
// import { Link } from 'expo-router';

// export default function ProfileScreen() {
//   return (
//     <ThemedView style={{ flex: 1 }}>
//       <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 24 }}>
//         <ThemedText type="title">My Profile</ThemedText>
//         <ThemedText>Amanda Smith</ThemedText>

//           <PrimaryButton label="AI Colour Analysis" />
//           <PrimaryButton label="My Wardrobe" />
//       </ThemedView>
//       <BottomNavBar />
//     </ThemedView>
//   );
// } 


import { ScrollView, View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../components/themed-view';
import { ThemedText } from '../../components/themed-text';
import { PrimaryButton } from '../../components/primary-button';
import { BottomNavBar } from '../../components/bottom-nav-bar';
import { Link } from 'expo-router';

export default function ProfileScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title">My Profile</ThemedText>
          <Link href="./settings" asChild>
            <TouchableOpacity>
              <Ionicons name="settings-outline" size={22} />
            </TouchableOpacity>
          </Link>
        </View>

        {/* User row */}
        <View style={styles.userRow}>
          <Image
            source={{ uri: 'https://placehold.co/56x56' }}
            style={styles.avatar}
          />
          <View>
            <ThemedText type="subtitle">Amanda Smith</ThemedText>
            <ThemedText style={styles.muted}>@amanda_designs</ThemedText>
          </View>
        </View>

        {/* Tab switcher */}
        <View style={styles.tabSwitcher}>
          <View style={[styles.tab, styles.tabActive]}>
            <ThemedText style={styles.tabTextActive}>My Preferences</ThemedText>
          </View>
          <Link href="./wishlist-saved" asChild>
            <TouchableOpacity style={styles.tab}>
              <ThemedText style={styles.tabText}>Saved</ThemedText>
            </TouchableOpacity>
          </Link>
        </View>

        {/* AI Colour Analysis card */}
        <View style={styles.analysisCard}>
          <View style={styles.analysisHeaderRow}>
            <ThemedText style={styles.analysisLabel}>AI COLOUR ANALYSIS</ThemedText>
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>Soft Autumn</ThemedText>
            </View>
          </View>
          <ThemedText type="subtitle">Your Personal Season Guide</ThemedText>
          <ThemedText style={styles.muted}>
            Get outfit curations that match your natural undertones. Review or
            redo your analysis anytime.
          </ThemedText>
          <Link href="./colour-analysis" asChild>
            <PrimaryButton label="Redo Digital Scan"/>
          </Link>
        </View>

        {/* Outfit Builder Canvas row */}
        <TouchableOpacity style={styles.rowCard}>
          <View style={styles.rowCardIcon}>
            <Ionicons name="sparkles-outline" size={20} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText type="subtitle">Outfit Builder Canvas</ThemedText>
            <ThemedText style={styles.muted}>
              Experiment with visual layouts & styling
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={20} />
        </TouchableOpacity>

        {/* Wardrobe details */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Wardrobe Details
        </ThemedText>
        <DetailRow label="Preferred Vibe" value="Minimalist, Casual" />
        <DetailRow label="Sizing" value="Medium / Size 10" />
        <DetailRow label="Jewelry Preference" value="Gold Finish" />
      </ScrollView>
      <BottomNavBar />
    </ThemedView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <ThemedText style={styles.muted}>{label}</ThemedText>
      <ThemedText>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  muted: {
    opacity: 0.6,
    fontSize: 13,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 24,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#fff',
  },
  tabText: {
    opacity: 0.6,
  },
  tabTextActive: {
    fontWeight: '600',
  },
  analysisCard: {
    backgroundColor: '#F7E9E4',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  analysisHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analysisLabel: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
  },
  badge: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: 16,
    padding: 16,
  },
  rowCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
});