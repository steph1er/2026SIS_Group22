import { ActivityIndicator, ScrollView, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/themed-view';
import { ThemedText } from '../../components/themed-text';
import { PrimaryButton } from '../../components/primary-button';
import { Link } from 'expo-router';
import { useProfile } from '../../../src/profile/use-profile';
import { ProfileHeader } from '../../components/profile-header';
import { describeStyleQuiz } from './style-summary';
import { useSavedColourAnalysis } from '../../../src/colour-analysis/use-saved-colour-analysis';
import { useStyleUColors, useThemedStyles } from '../../hooks/use-theme';
import type { StyleUColors } from '../../services/styleu-theme';

export default function ProfileScreen() {
  const colors = useStyleUColors();
  const styles = useThemedStyles(createStyles);
  // Loads the profile (profiles.user_id) and the onboarding row (onboarding.user_id) for the
  // signed-in user together, and again each time this screen is focused, so a finished retake shows up.
  const { user, profile, onboarding, error, isLoading, refetch } = useProfile({ includeOnboarding: true });
  const {
    result: colourAnalysis,
    error: colourAnalysisError,
    isLoading: isColourAnalysisLoading,
    refetch: refetchColourAnalysis,
  } = useSavedColourAnalysis();

  // Completion comes from profiles.onboarding_completed. The onboarding row alone never decides it.
  const quiz = profile && !error ? describeStyleQuiz(profile, onboarding) : null;

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <ThemedText type="pageTitle">My Profile</ThemedText>
            <Link href="./settings" asChild>
              <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="settings-outline" size={22} color={colors.text} />
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

          <ThemedText type="sectionTitle" style={styles.sectionTitle}>
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
                    <Ionicons name="clipboard-outline" size={20} color={colors.text} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="cardTitle">{quiz.title}</ThemedText>
                    <ThemedText style={styles.muted}>{quiz.message}</ThemedText>
                    <ThemedText style={styles.muted}>{quiz.hint}</ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.text} />
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
              <ThemedText style={styles.analysisLabel}>MY COLOUR ANALYSIS</ThemedText>
              <Ionicons name="color-palette-outline" size={20} color="#A56A45" />
            </View>
            {isColourAnalysisLoading ? (
              <ActivityIndicator style={styles.analysisLoader} />
            ) : colourAnalysisError ? (
              <>
                <ThemedText type="cardTitle">Unable to load your result</ThemedText>
                <ThemedText style={styles.muted}>{colourAnalysisError}</ThemedText>
                <TouchableOpacity style={styles.retryButton} onPress={refetchColourAnalysis}>
                  <ThemedText style={styles.retryLabel}>Try Again</ThemedText>
                </TouchableOpacity>
              </>
            ) : colourAnalysis ? (
              <>
                <ThemedText type="cardTitle">{colourAnalysis.season}</ThemedText>
                <ThemedText style={styles.muted}>{colourAnalysis.undertone} Undertone</ThemedText>
                <Link href={'/my-colour-analysis' as never} asChild>
                  <PrimaryButton label="View Colour Analysis →" />
                </Link>
              </>
            ) : (
              <>
                <ThemedText type="cardTitle">Discover the colours that suit you best</ThemedText>
                <ThemedText style={styles.muted}>
                  Analyse a clear face photo to find your estimated seasonal palette.
                </ThemedText>
                <Link href={'/colour-analysis' as never} asChild>
                  <PrimaryButton label="Start Colour Analysis" />
                </Link>
              </>
            )}
          </View>

          <TouchableOpacity style={styles.rowCard}>
            <View style={styles.rowCardIcon}>
              <Ionicons name="sparkles-outline" size={20} color={colors.text} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="cardTitle">Outfit Builder Canvas</ThemedText>
              <ThemedText style={styles.muted}>
                Experiment with visual layouts & styling
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.detailRow}>
      <ThemedText style={styles.muted}>{label}</ThemedText>
      <ThemedText style={styles.detailValue}>{value}</ThemedText>
    </View>
  );
}

const createStyles = (colors: StyleUColors) =>
  StyleSheet.create({
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
    color: colors.subtleText,
    fontSize: 13,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: colors.subtle,
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
    backgroundColor: colors.card,
  },
  tabText: {
    opacity: 0.6,
  },
  tabTextActive: {
    fontWeight: '600',
  },
  analysisCard: {
    backgroundColor: colors.accentSoft,
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
  analysisLoader: {
    paddingVertical: 24,
  },
  retryButton: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    backgroundColor: colors.accent,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  retryLabel: {
    color: colors.buttonText,
    fontSize: 14,
    fontWeight: '700',
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.subtleStrong,
    borderRadius: 16,
    padding: 16,
  },
  rowCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.subtle,
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
    backgroundColor: colors.accentSoft,
    borderRadius: 16,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
});
