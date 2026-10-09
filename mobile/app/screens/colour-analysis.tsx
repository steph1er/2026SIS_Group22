import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ColourAnalysisCamera } from '../components/colour-analysis/colour-analysis-camera';
import { ColourAnalysisResultView } from '../components/colour-analysis/colour-analysis-result';
import { BackButton } from '../components/back-button';
import { PrimaryButton } from '../components/primary-button';
import { StyleUTokens } from '../services/styleu-theme';
import { useAuth } from '../../src/auth/auth-provider';
import { analyseColourPhoto } from '../../src/colour-analysis/colour-analysis-service';
import { saveColourAnalysis } from '../../src/colour-analysis/colour-analysis-storage';
import type { ColourAnalysisPhoto, ColourAnalysisResult } from '../../src/colour-analysis/types';

type Mode = 'intro' | 'camera' | 'preview' | 'result';

export default function ColourAnalysisScreen() {
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
        <View style={styles.headerRow}>
          <BackButton />
          <Text style={styles.title}>Colour Analysis</Text>
        </View>
        {mode === 'intro' ? <Text style={styles.subtitle}>Find the colours that suit you best.</Text> : null}
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
                <View style={styles.faceIcon}><Feather name="user" size={32} color={StyleUTokens.colors.text} /></View>
                <Text style={styles.guideTitle}>Use a clear face photo</Text>
                <View style={styles.tipsRow}>
                  {[
                    ['sun', 'Daylight'],
                    ['smile', 'Face forward'],
                    ['slash', 'No filters'],
                  ].map(([icon, label]) => (
                    <View key={label} style={styles.tipItem}>
                      <Feather name={icon as keyof typeof Feather.glyphMap} size={17} color={StyleUTokens.colors.mutedText} />
                      <Text style={styles.tipLabel}>{label}</Text>
                    </View>
                  ))}
                </View>
              </View>
              {error ? <ErrorMessage message={error} /> : null}
              <PrimaryButton compact label="Take Photo" onPress={() => { setError(null); setMode('camera'); }} />
              <Pressable style={styles.secondaryButton} onPress={chooseFromLibrary}>
                <Feather name="image" size={20} color={StyleUTokens.colors.text} />
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
                <Text style={styles.tipText}>One face · sharp · evenly lit</Text>
              </View>
              <PrimaryButton
                compact
                label={isSaving ? 'Saving Result…' : isAnalysing ? 'Analysing…' : pendingResult ? 'Retry Save' : 'Analyse Colours'}
                onPress={analyse}
                disabled={isAnalysing || isSaving || isAuthLoading}
              />
              {isAnalysing || isSaving ? <View style={styles.loadingCard}>
                <ActivityIndicator color={StyleUTokens.colors.accent} size="small" />
                <View style={styles.loadingCopy}>
                  <Text style={styles.loadingTitle}>{isSaving ? 'Saving your result' : 'Analysing your colours'}</Text>
                  <Text style={styles.loadingText}>{isSaving ? 'Almost done…' : 'Checking face and skin tones…'}</Text>
                </View>
              </View> : null}
              <Pressable style={styles.secondaryButton} onPress={reset} disabled={isAnalysing || isSaving}>
                <Feather name="refresh-cw" size={19} color={StyleUTokens.colors.text} />
                <Text style={styles.secondaryLabel}>Choose Another Photo</Text>
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
  return <View style={styles.errorCard} accessibilityRole="alert">
    <Feather name="alert-circle" size={20} color={StyleUTokens.colors.errorRed} />
    <Text style={styles.errorText}>{message}</Text>
  </View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: StyleUTokens.colors.background },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { color: StyleUTokens.colors.text, fontSize: 26, lineHeight: 32, fontWeight: '600' },
  subtitle: { color: StyleUTokens.colors.mutedText, fontSize: 14, lineHeight: 20, marginTop: 6, marginLeft: 36 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 28 },
  introContent: { gap: 12 },
  guideCard: { backgroundColor: StyleUTokens.colors.surface, borderRadius: 18, padding: 20, alignItems: 'center', marginBottom: 6 },
  faceIcon: { width: 70, height: 70, borderRadius: 35, backgroundColor: StyleUTokens.colors.chipSelectedBg, borderWidth: 1, borderColor: StyleUTokens.colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  guideTitle: { color: StyleUTokens.colors.text, fontSize: 19, lineHeight: 24, fontWeight: '600', marginBottom: 14 },
  tipsRow: { flexDirection: 'row', width: '100%', gap: 8 },
  tipItem: { flex: 1, alignItems: 'center', gap: 5 },
  tipLabel: { color: StyleUTokens.colors.mutedText, fontSize: 12, lineHeight: 16, textAlign: 'center' },
  cameraWrap: { flex: 1, paddingHorizontal: 16, paddingBottom: 14 },
  previewContent: { gap: 12 },
  preview: { width: '100%', aspectRatio: 4 / 5, maxHeight: 470, borderRadius: 18, backgroundColor: StyleUTokens.colors.surface },
  secondaryButton: { minHeight: 52, borderRadius: 24, borderWidth: 1, borderColor: StyleUTokens.colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: '#FFFFFF' },
  secondaryLabel: { color: StyleUTokens.colors.text, fontSize: 15, fontWeight: '600' },
  tipRow: { flexDirection: 'row', gap: 9, alignItems: 'center', backgroundColor: '#FFF8EB', borderRadius: 14, padding: 12 },
  tipText: { flex: 1, color: StyleUTokens.colors.mutedText, fontSize: 13, lineHeight: 18 },
  loadingCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: StyleUTokens.colors.surface, borderRadius: 14, padding: 14 },
  loadingCopy: { flex: 1 },
  loadingTitle: { color: StyleUTokens.colors.text, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  loadingText: { color: StyleUTokens.colors.mutedText, fontSize: 12, lineHeight: 17 },
  errorCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 14, backgroundColor: '#FFF0EF', padding: 12 },
  errorText: { flex: 1, color: StyleUTokens.colors.errorRed, fontSize: 13, lineHeight: 18, fontWeight: '500' },
});
