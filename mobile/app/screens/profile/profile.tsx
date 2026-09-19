import { ActivityIndicator, ScrollView, View, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/themed-view';
import { ThemedText } from '../../components/themed-text';
import { PrimaryButton } from '../../components/primary-button';
import { Link } from 'expo-router';
import { useProfile } from '../../../src/profile/use-profile';
import { ProfileHeader } from '../../components/profile-header';
import { describeStyleQuiz } from './style-summary';

export default function ProfileScreen() {
  // Loads the profile (profiles.user_id) and the onboarding row (onboarding.user_id) for the
  // signed-in user together, and again each time this screen is focused, so a finished retake shows up.
  const { user, profile, onboarding, error, isLoading, refetch } = useProfile({ includeOnboarding: true });

  // Completion comes from profiles.onboarding_completed. The onboarding row alone never decides it.
  const quiz = profile && !error ? describeStyleQuiz(profile, onboarding) : null;

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

          <ProfileHeader
            email={user?.email}
            profile={profile}
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
          />

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

          {/* The card opens the existing onboarding quiz: it retakes a finished quiz, resumes one in
              progress, or starts one. Nothing is shown until the user's real status has loaded, and a
              failed load shows the error (with retry) in the header instead of any quiz results. */}
          {quiz ? (
            <>
              <Link href="../onboarding" asChild>
                <TouchableOpacity style={styles.quizCard}>
                  <View style={styles.rowCardIcon}>
                    <Ionicons name="clipboard-outline" size={20} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="subtitle">{quiz.title}</ThemedText>
                    <ThemedText style={styles.muted}>{quiz.message}</ThemedText>
                    <ThemedText style={styles.muted}>{quiz.hint}</ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} />
                </TouchableOpacity>
              </Link>

              {quiz.details.length > 0 && (
                <View>
                  {quiz.details.map((detail) => (
                    <DetailRow key={detail.label} label={detail.label} value={detail.value} />
                  ))}
                </View>
              )}
            </>
          ) : isLoading ? (
            <ActivityIndicator />
          ) : (
            <ThemedText style={styles.muted}>Your style quiz details couldn&apos;t be loaded.</ThemedText>
          )}

          <View style={styles.analysisCard}>
            <View style={styles.analysisHeaderRow}>
              <ThemedText style={styles.analysisLabel}>AI COLOUR ANALYSIS</ThemedText>
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
      <ThemedText style={styles.detailValue}>{value}</ThemedText>
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
  detailValue: {
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
});