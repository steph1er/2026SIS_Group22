import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '../components/back-button';
import { OnboardingFormField } from '../components/onboarding-form-field';
import { PrimaryButton } from '../components/primary-button';
import { StyleUTokens } from '../services/styleu-theme';

/** UI-only login screen. Forgot password link is visual only — no Supabase wiring yet. */
export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.content}>
        <BackButton />
        <Text accessibilityRole="header" style={styles.title}>Welcome back</Text>

        <View style={styles.form}>
          <OnboardingFormField label="Email Address" placeholder="e.g. amanda@domain.com" keyboardType="email-address" textContentType="emailAddress" />
          <OnboardingFormField label="Password" placeholder="••••••••" />
          <Text style={styles.forgotPassword}>Forgot password?</Text>
        </View>

        <View style={styles.footer}>
          <PrimaryButton label="Log In" />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: StyleUTokens.colors.background, flex: 1 },
  content: { flex: 1, paddingHorizontal: 28, paddingTop: 60, paddingBottom: 28 },
  title: { color: StyleUTokens.colors.text, fontSize: 32, fontWeight: '800', marginBottom: 40 },
  form: { gap: 16 },
  forgotPassword: { color: StyleUTokens.colors.accent, fontSize: 14, textAlign: 'right' },
  footer: { gap: 24, marginTop: 'auto', paddingTop: 60 },
});