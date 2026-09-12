import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Link } from 'expo-router';
import { BackButton } from '../components/back-button';
import { OnboardingFormField } from '../components/onboarding-form-field';
import { PrimaryButton } from '../components/primary-button';
import { StyleUTokens } from '../services/styleu-theme';

/** UI-only sign-up screen. Google sign-in and TFA toggle are visual only — no Supabase wiring yet. */
export default function SignUpScreen() {
  const [tfaEnabled, setTfaEnabled] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <BackButton />
          <Text accessibilityRole="header" style={styles.title}>Create your account</Text>

          <Pressable style={styles.googleButton} onPress={() => {}}>
            <Text style={styles.googleButtonLabel}>Continue with Google</Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or sign up with email</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.form}>
            <OnboardingFormField label="Full Name" placeholder="e.g. Amanda Smith" textContentType="name" />
            <OnboardingFormField label="Email Address" placeholder="e.g. amanda@domain.com" keyboardType="email-address" textContentType="emailAddress" />
            <OnboardingFormField label="Phone Number" placeholder="e.g. +61 400 000 000" keyboardType="phone-pad" textContentType="telephoneNumber" />
            <OnboardingFormField label="Password" placeholder="••••••••" />
          </View>

          <View style={styles.tfaRow}>
            <View style={styles.tfaTextGroup}>
              <Text style={styles.tfaLabel}>Enable Two-Factor Authentication</Text>
              <Text style={styles.tfaSubtext}>Add an extra layer of security to your account</Text>
            </View>
            <Switch value={tfaEnabled} onValueChange={setTfaEnabled} />
          </View>

          <View style={styles.footer}>
            <Link href="/onboarding" asChild>
              <PrimaryButton label="Start Onboarding Quiz" />
            </Link>
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
  content: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 60, paddingBottom: 28 },
  title: { color: StyleUTokens.colors.text, fontSize: 32, fontWeight: '800', marginBottom: 32 },
  googleButton: {
    borderWidth: 1,
    borderColor: StyleUTokens.colors.placeholder,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  googleButtonLabel: { color: StyleUTokens.colors.text, fontSize: 16, fontWeight: '600' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 24 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: StyleUTokens.colors.placeholder },
  dividerText: { color: StyleUTokens.colors.placeholder, fontSize: 13 },
  form: { gap: 26 },
  tfaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 32,
  },
  tfaTextGroup: { flex: 1, gap: 4 },
  tfaLabel: { color: StyleUTokens.colors.text, fontSize: 16, fontWeight: '600' },
  tfaSubtext: { color: StyleUTokens.colors.mutedText, fontSize: 13, lineHeight: 18 },
  footer: { gap: 24, marginTop: 'auto', paddingTop: 60 },
  terms: { color: StyleUTokens.colors.placeholder, fontSize: 14, lineHeight: 20, textAlign: 'center' },
});