import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ColourAnalysisCamera } from '../components/colour-analysis/colour-analysis-camera';
import { ColourAnalysisResultView } from '../components/colour-analysis/colour-analysis-result';
import { BackButton } from '../components/back-button';
import { PrimaryButton } from '../components/primary-button';
import { useAuth } from '../../src/auth/auth-provider';
import { analyseColourPhoto } from '../../src/colour-analysis/colour-analysis-service';
import { saveColourAnalysis } from '../../src/colour-analysis/colour-analysis-storage';
import type { ColourAnalysisPhoto, ColourAnalysisResult } from '../../src/colour-analysis/types';
import { useStyleUColors, useThemedStyles } from '../hooks/use-theme';
import type { StyleUColors } from '../services/styleu-theme';

type Mode = 'intro' | 'camera' | 'preview' | 'result';

export default function ColourAnalysisScreen() {
  const colors = useStyleUColors();
  const styles = useThemedStyles(createStyles);
  const { user, isLoading: isAuthLoading } = useAuth();
  const [mode, setMode] = useState<Mode>('intro');
  const [photo, setPhoto] = useState<ColourAnalysisPhoto | null>(null);
  const [result, setResult] = useState<ColourAnalysisResult | null>(null);
  const [pendingResult, setPendingResult] = useState<ColourAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectPhoto = (selected: ColourAnalysisPhoto) => {
    setPhoto(selected);
    setResult(null);
    setPendingResult(null);
    setError(null);
    setMode('preview');
  };

  const chooseFromLibrary = async () => {
    setError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Photo library access is needed to choose a face photo. You can enable it in device settings.');
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [4, 5], quality: 0.9,
    });
    if (!pickerResult.canceled) selectPhoto(pickerResult.assets[0]);
  };

  const analyse = async () => {
    if (!photo || isAnalysing || isSaving || isAuthLoading) return;
    setIsAnalysing(true);
    setError(null);
    try {
      // Keep a successful ML result if saving fails, so Retry Save never reruns or
      // generates a different analysis for the same photo.
      const analysis = pendingResult ?? await analyseColourPhoto(photo);
      setPendingResult(analysis);
      setIsAnalysing(false);

      if (user) {
        setIsSaving(true);
        await saveColourAnalysis(user.id, analysis);
      }

      setResult(analysis);
      setPendingResult(null);
      setMode('result');
    } catch (analysisError) {
      const fallback = pendingResult
        ? 'Your analysis is ready, but it could not be saved. Please retry.'
        : 'Colour analysis failed. Please try another photo.';
      setError(analysisError instanceof Error ? analysisError.message : fallback);
    } finally {
      setIsAnalysing(false);
      setIsSaving(false);
    }
  };

  const reset = () => {
    setPhoto(null); setResult(null); setPendingResult(null); setError(null); setMode('intro');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <BackButton icon="close" fallback="/profile" style={styles.close} />
        <Text style={styles.title}>Colour Analysis</Text>
        <Text style={styles.subtitle}>Take or upload a clear photo of your face in natural lighting to discover the colours that suit you best.</Text>
      </View>
      {mode === 'camera' ? (
        <View style={styles.cameraWrap}>
          <ColourAnalysisCamera onCancel={() => setMode('intro')} onPhoto={selectPhoto} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {mode === 'intro' ? (
            <View style={styles.introContent}>
              <View style={styles.guideCard}>
                <View style={styles.faceIcon}><Feather name="user" size={46} color={colors.text} /></View>
                <Text style={styles.guideTitle}>For the best result</Text>
                <Text style={styles.guideText}>Use soft natural daylight, face the camera directly and keep your face free from heavy makeup or coloured light.</Text>
              </View>
              {error ? <ErrorMessage message={error} /> : null}
              <PrimaryButton label="Take Photo" onPress={() => { setError(null); setMode('camera'); }} />
              <Pressable style={styles.secondaryButton} onPress={chooseFromLibrary}>
                <Feather name="image" size={20} color={colors.text} />
                <Text style={styles.secondaryLabel}>Choose from Library</Text>
              </Pressable>
            </View>
          ) : null}
          {mode === 'preview' && photo ? (
            <View style={styles.previewContent}>
              <Image source={{ uri: photo.uri }} style={styles.preview} resizeMode="cover" />
              {error ? <ErrorMessage message={error} /> : null}
              <View style={styles.tipRow}>
                <Feather name="sun" size={18} color="#A56A45" />
                <Text style={styles.tipText}>Check that your face is sharp, evenly lit and the only face in the photo.</Text>
              </View>
              <PrimaryButton
                label={isSaving ? 'Saving Result…' : isAnalysing ? 'Analysing…' : pendingResult ? 'Retry Save' : 'Analyse Colours'}
                onPress={analyse}
                disabled={isAnalysing || isSaving || isAuthLoading}
              />
              {isAnalysing || isSaving ? <View style={styles.loadingRow}>
                <ActivityIndicator color={colors.accent} />
                <Text style={styles.loadingText}>
                  {isSaving ? 'Saving this result to your account…' : 'Detecting facial landmarks and sampling skin tones…'}
                </Text>
              </View> : null}
              <Pressable style={styles.secondaryButton} onPress={reset} disabled={isAnalysing || isSaving}>
                <Feather name="refresh-cw" size={19} color={colors.text} />
                <Text style={styles.secondaryLabel}>Retake / Choose Another</Text>
              </Pressable>
            </View>
          ) : null}
          {mode === 'result' && result ? <ColourAnalysisResultView result={result} onStartAgain={reset} /> : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function ErrorMessage({ message }: { message: string }) {
  const colors = useStyleUColors();
  const styles = useThemedStyles(createStyles);
  return <View style={styles.errorCard} accessibilityRole="alert">
    <Feather name="alert-circle" size={20} color={colors.errorRed} />
    <Text style={styles.errorText}>{message}</Text>
  </View>;
}

const createStyles = (colors: StyleUColors) =>
  StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  // Wider page margins than the ✕, so the title and text sit inset from it rather than right under it.
  header: { paddingHorizontal: 28, paddingTop: 8, paddingBottom: 12 },
  close: { marginLeft: -22 },
  // Same page title size as Saved and Profile.
  title: { color: colors.text, fontSize: 26, lineHeight: 32, fontWeight: '600', marginTop: 12 },
  subtitle: { color: colors.mutedText, fontSize: 15, lineHeight: 22, marginTop: 8 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 28, paddingTop: 8, paddingBottom: 28 },
  introContent: { gap: 14 },
  guideCard: { backgroundColor: colors.surface, borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 8 },
  faceIcon: { width: 92, height: 112, borderRadius: 46, borderWidth: 2, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  guideTitle: { color: colors.text, fontSize: 19, fontWeight: '700', marginBottom: 8 },
  guideText: { color: colors.mutedText, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  cameraWrap: { flex: 1, paddingHorizontal: 16, paddingBottom: 14 },
  previewContent: { gap: 14 },
  preview: { width: '100%', aspectRatio: 4 / 5, maxHeight: 470, borderRadius: 24, backgroundColor: colors.surface },
  secondaryButton: { minHeight: 58, borderRadius: 20, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: colors.card },
  secondaryLabel: { color: colors.text, fontSize: 16, fontWeight: '700' },
  tipRow: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, padding: 14 },
  tipText: { flex: 1, color: colors.mutedText, fontSize: 13, lineHeight: 19 },
  loadingRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  loadingText: { flexShrink: 1, color: colors.mutedText, fontSize: 13, lineHeight: 18 },
  errorCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 16, backgroundColor: colors.errorSurface, padding: 14 },
  errorText: { flex: 1, color: colors.errorRed, fontSize: 14, lineHeight: 20, fontWeight: '600' },
});
