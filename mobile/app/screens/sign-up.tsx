import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { signUp } from '../../src/auth/auth-service';
import { useAuth } from '../../src/auth/auth-provider';
import { BackButton } from '../components/back-button';
import { OnboardingFormField } from '../components/onboarding-form-field';
import { PrimaryButton } from '../components/primary-button';
import { StyleUTokens } from '../services/styleu-theme';

export default function SignUpScreen() {
  const { configurationError } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSignUp() {
    if (!email.trim() || !password) {
      setMessage('Please enter your email and password.');
      return;
    }
    setBusy(true);
    setMessage('');
    const { data, error } = await signUp({ email, password, fullName, phone });
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    if (!data.session) {
      setMessage('Check your email to confirm your account, then log in.');
      return;
    }
    router.replace('/');
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <BackButton />
          <Text accessibilityRole="header" style={styles.title}>Create your account</Text>

          <Pressable style={[styles.googleButton, styles.disabled]} disabled>
            <Text style={styles.googleButtonLabel}>Continue with Google (coming soon)</Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or sign up with email</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.form}>
            <OnboardingFormField label="Full Name" placeholder="e.g. Amanda Smith" textContentType="name" value={fullName} onChangeText={setFullName} editable={!busy} />
            <OnboardingFormField label="Email Address" placeholder="e.g. amanda@domain.com" keyboardType="email-address" textContentType="emailAddress" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={setEmail} editable={!busy} />
            <OnboardingFormField label="Phone Number" placeholder="e.g. +61 400 000 000" keyboardType="phone-pad" textContentType="telephoneNumber" value={phone} onChangeText={setPhone} editable={!busy} />
            <OnboardingFormField label="Password" placeholder="••••••••" secureTextEntry autoCapitalize="none" textContentType="newPassword" value={password} onChangeText={setPassword} editable={!busy} />
          </View>

          <View style={styles.tfaRow}>
            <View style={styles.tfaTextGroup}>
              <Text style={styles.tfaLabel}>Enable Two-Factor Authentication</Text>
              <Text style={styles.tfaSubtext}>Coming soon</Text>
            </View>
            <Switch value={false} disabled />
          </View>

          <View style={styles.footer}>
            <PrimaryButton label={busy ? 'Creating account…' : 'Start Onboarding Quiz'} onPress={handleSignUp} disabled={busy || Boolean(configurationError)} />
            {(configurationError || message) ? <Text accessibilityRole="alert" style={styles.status}>{configurationError || message}</Text> : null}
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
  disabled: { opacity: 0.5 },
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
  status: { color: StyleUTokens.colors.text, fontSize: 14, textAlign: 'center' },
});
