import { ScrollView, View, Image, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/themed-view';
import { ThemedText } from '../../components/themed-text';
import { PrimaryButton } from '../../components/primary-button';
import { Link } from 'expo-router';

// Shape of a completed style quiz summary, once onboarding answers are
// persisted to the backend. Swap this stub for the real fetched value
// (e.g. from Supabase) when that's wired up — the card below already
// renders either state.
type QuizResultsSummary = {
  completedAt: string;
  vibe: string;
} | null;

const quizResults: QuizResultsSummary = null;

export default function ProfileScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <ThemedText type="title">My Profile</ThemedText>
            <Link href="./settings" asChild>
              <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="settings-outline" size={22} />
              </TouchableOpacity>
            </Link>
          </View>

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

          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Wardrobe Details
          </ThemedText>

          {/* Links back to the onboarding quiz. Once quiz answers are saved
              to the backend, replace `quizResults` above with the real
              value and this card will switch to showing a summary instead
              of the "not saved yet" prompt — no layout changes needed. */}
          <Link href="../onboarding" asChild>
            <TouchableOpacity style={styles.quizCard}>
              <View style={styles.rowCardIcon}>
                <Ionicons name="clipboard-outline" size={20} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText type="subtitle">
                  {quizResults ? 'Your Style Quiz Results' : 'Style Quiz Not Saved Yet'}
                </ThemedText>
                <ThemedText style={styles.muted}>
                  {quizResults
                    ? `Completed ${quizResults.completedAt} · ${quizResults.vibe}`
                    : "Your onboarding answers aren't linked to your account yet. Tap to retake the quiz and update your preferences."}
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} />
            </TouchableOpacity>
          </Link>

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
              <PrimaryButton label="Redo Digital Scan" />
            </Link>
          </View>

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

        </ScrollView>
      </SafeAreaView>
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
  quizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F7E9E4',
    borderRadius: 16,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
});