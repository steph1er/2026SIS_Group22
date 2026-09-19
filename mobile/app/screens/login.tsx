import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../src/auth/auth-provider';
import { resetPassword, signIn } from '../../src/auth/auth-service';
import { BackButton } from '../components/back-button';
import { OnboardingFormField } from '../components/onboarding-form-field';
import { PrimaryButton } from '../components/primary-button';
import { StyleUTokens } from '../services/styleu-theme';

export default function LoginScreen() {
  const { configurationError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function handleLogin() {
    if (!email.trim() || !password) {
      setMessage('Please enter your email and password.');
      return;
    }
    setBusy(true);
    setMessage('');

    const { data, error } = await signIn(email, password);

    if (error) {
      setBusy(false);
      setMessage(error.message);
      return;
    }

    if (!data.user) {
      setBusy(false);
      setMessage('No user found. Please check your email and password.');
      return;
    }

    // Temporary routing while backend onboarding status integration is not yet implemented
    setBusy(false);  
    router.replace('./onboarding');
  }

  async function handleResetPassword() {
    if (!email.trim()) {
      setMessage('Enter your email address first.');
      return;
    }
    setBusy(true);
    const { error } = await resetPassword(email);
    setBusy(false);
    setMessage(error ? error.message : 'Password reset email sent.');
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.content}>
        <BackButton />
        <Text accessibilityRole="header" style={styles.title}>Welcome back</Text>

        <View style={styles.form}>
          <OnboardingFormField label="Email Address" placeholder="e.g. amanda@domain.com" keyboardType="email-address" textContentType="emailAddress" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={setEmail} editable={!busy} />
          <OnboardingFormField label="Password" placeholder="••••••••" secureTextEntry autoCapitalize="none" textContentType="password" value={password} onChangeText={setPassword} editable={!busy} />
          <Pressable onPress={handleResetPassword} disabled={busy}>
            <Text style={styles.forgotPassword}>Forgot password?</Text>
          </Pressable>
          {(configurationError || message) ? <Text accessibilityRole="alert" style={styles.status}>{configurationError || message}</Text> : null}
        </View>

        <View style={styles.footer}>
          <PrimaryButton label={busy ? 'Please wait…' : 'Log In'} onPress={handleLogin} disabled={busy || Boolean(configurationError)} />
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
  status: { color: StyleUTokens.colors.text, fontSize: 14, textAlign: 'center' },
  footer: { gap: 24, marginTop: 'auto', paddingTop: 60 },
});
