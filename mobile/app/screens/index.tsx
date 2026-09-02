import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingFormField } from '../components/onboarding-form-field';
import { PrimaryButton } from '../components/primary-button';
import { StyleUTokens } from '../services/styleu-theme';

/** UI-only welcome screen. Auth state and Supabase submission belong in a future onboarding flow. */
export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Text accessibilityRole="header" style={styles.logo}>
              Style<Text style={styles.logoAccent}>U</Text>
            </Text>
            <Text style={styles.subtitle}>Your personal digital wardrobe assistant. Define your style and get customized daily lookups.</Text>
          </View>

          <View style={styles.form}>
            <OnboardingFormField label="Full Name" placeholder="e.g. Amanda Smith" textContentType="name" />
            <OnboardingFormField label="Email Address" placeholder="e.g. amanda@domain.com" keyboardType="email-address" textContentType="emailAddress" />
            <OnboardingFormField label="Phone Number" placeholder="e.g. +61 400 000 000" keyboardType="phone-pad" textContentType="telephoneNumber" />
          </View>

          <View style={styles.footer}>
            <PrimaryButton label="Start Onboarding Quiz" />
            <Text style={styles.terms}>By signing up, you agree to our Terms and Conditions</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { backgroundColor: StyleUTokens.colors.background, flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 82, paddingBottom: 28 },
  hero: { alignItems: 'center', gap: 24 },
  logo: { color: StyleUTokens.colors.text, fontSize: 58, fontWeight: '800', letterSpacing: -1.5 },
  logoAccent: { color: StyleUTokens.colors.accent },
  subtitle: { color: StyleUTokens.colors.mutedText, fontSize: 20, lineHeight: 30, textAlign: 'center' },
  form: { gap: 26, marginTop: 150 },
  footer: { gap: 24, marginTop: 'auto', paddingTop: 80 },
  terms: { color: StyleUTokens.colors.placeholder, fontSize: 14, lineHeight: 20, textAlign: 'center' },
});
