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
        <View style={styles.headerRow}>
          <BackButton fallback="/profile" />
          <Text style={styles.title}>My Colour Analysis</Text>
        </View>
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
            <Text style={styles.stateTitle}>{isSignedIn ? 'Find your best colours' : 'Sign in to save a result'}</Text>
            <Text style={styles.stateText}>Use one clear face photo to get your palette.</Text>
            <View style={styles.fullWidth}>
              <PrimaryButton compact label="Start Colour Analysis" onPress={redo} />
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
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { color: colors.text, fontSize: 26, lineHeight: 32, fontWeight: '600' },
  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 36 },
  stateCard: { minHeight: 260, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  iconCircle: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  stateTitle: { color: colors.text, fontSize: 20, lineHeight: 26, fontWeight: '600', textAlign: 'center' },
  stateText: { color: colors.mutedText, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  errorText: { color: colors.errorRed, fontSize: 13, lineHeight: 18, textAlign: 'center' },
  retryButton: { borderRadius: 22, backgroundColor: colors.accent, paddingHorizontal: 22, paddingVertical: 12 },
  retryLabel: { color: colors.buttonText, fontSize: 15, fontWeight: '600' },
  fullWidth: { alignSelf: 'stretch', marginTop: 8 },
});
