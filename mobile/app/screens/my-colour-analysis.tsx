import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSavedColourAnalysis } from '../../src/colour-analysis/use-saved-colour-analysis';
import { BackButton } from '../components/back-button';
import { ColourAnalysisResultView } from '../components/colour-analysis/colour-analysis-result';
import { PrimaryButton } from '../components/primary-button';
import { useStyleUColors, useThemedStyles } from '../hooks/use-theme';
import type { StyleUColors } from '../services/styleu-theme';

export default function MyColourAnalysisScreen() {
  const colors = useStyleUColors();
  const styles = useThemedStyles(createStyles);
  const { result, error, isLoading, isSignedIn, refetch } = useSavedColourAnalysis();
  const redo = () => router.push('/colour-analysis' as never);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>My Colour Analysis</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={colors.accent} size="large" />
            <Text style={styles.stateText}>Loading your colour analysis…</Text>
          </View>
        ) : error ? (
          <View style={styles.stateCard}>
            <Feather name="alert-circle" size={34} color={colors.errorRed} />
            <Text style={styles.stateTitle}>Unable to load your result</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={refetch}>
              <Text style={styles.retryLabel}>Try Again</Text>
            </Pressable>
          </View>
        ) : result ? (
          <ColourAnalysisResultView result={result} onStartAgain={redo} actionLabel="Redo Colour Analysis" />
        ) : (
          <View style={styles.stateCard}>
            <View style={styles.iconCircle}>
              <Feather name="droplet" size={34} color={colors.text} />
            </View>
            <Text style={styles.stateTitle}>{isSignedIn ? 'Discover your best colours' : 'Sign in to save your result'}</Text>
            <Text style={styles.stateText}>
              Take a clear face photo to receive an estimated seasonal palette and styling suggestions.
            </Text>
            <View style={styles.fullWidth}>
              <PrimaryButton label="Start Colour Analysis" onPress={redo} />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: StyleUColors) =>
  StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 10 },
  title: { color: colors.text, fontSize: 32, lineHeight: 39, fontWeight: '700' },
  content: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 36 },
  stateCard: { minHeight: 320, borderRadius: 24, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', padding: 26, gap: 14 },
  iconCircle: { width: 82, height: 82, borderRadius: 41, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  stateTitle: { color: colors.text, fontSize: 22, fontWeight: '700', textAlign: 'center' },
  stateText: { color: colors.mutedText, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  errorText: { color: colors.errorRed, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  retryButton: { borderRadius: 18, backgroundColor: colors.accent, paddingHorizontal: 24, paddingVertical: 13 },
  retryLabel: { color: colors.buttonText, fontSize: 15, fontWeight: '700' },
  fullWidth: { alignSelf: 'stretch', marginTop: 8 },
});
