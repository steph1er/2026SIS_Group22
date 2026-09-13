import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../src/auth/auth-provider';
import { signIn, signUp, signOut } from '../../src/auth/auth-service';

import { OnboardingFormField } from '../components/onboarding-form-field';
import { PrimaryButton } from '../components/primary-button';
import { StyleUTokens } from '../services/styleu-theme';

/** Email/password authentication using the shared Supabase session. */
export default function WelcomeScreen() {
  const { user, isLoading, configurationError } = useAuth();
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function submit() {
    if (busy) return;
    setMessage('');
    if (!email.trim() || !password) {
      setMessage('Please enter your email and password.');
      return;
    }
    setBusy(true);
    try {
      const { data, error } = mode === 'signup'
        ? await signUp({ email, password, fullName, phone })
        : await signIn(email, password);
      if (error) throw error;
      setPassword('');
      if (!data.session) {
        setMessage('Check your email to confirm your account, then log in.');
        setMode('login');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign in. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    setBusy(true);
    setMessage('');
    try {
      const { error } = await signOut();
      if (error) throw error;
      setPassword('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign out. Please try again.');
    } finally {
      setBusy(false);
    }
  }

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

          {isLoading ? <Text style={styles.status}>Restoring your session…</Text> : user ? (
            <View style={styles.form}>
              <Text accessibilityRole="header" style={styles.subtitle}>You’re signed in</Text>
              <Text style={styles.terms}>{user.email}</Text>
              <PrimaryButton label={busy ? 'Signing out…' : 'Sign out'} onPress={handleSignOut} disabled={busy} />
            </View>
          ) : (
            <>
              <View style={styles.form}>
                {mode === 'signup' && <OnboardingFormField label="Full Name" placeholder="e.g. Amanda Smith" textContentType="name" value={fullName} onChangeText={setFullName} editable={!busy} />}
                <OnboardingFormField label="Email Address" placeholder="e.g. amanda@domain.com" keyboardType="email-address" textContentType="emailAddress" autoCorrect={false} value={email} onChangeText={setEmail} editable={!busy} />
                {mode === 'signup' && <OnboardingFormField label="Phone Number (optional)" placeholder="e.g. +61 400 000 000" keyboardType="phone-pad" textContentType="telephoneNumber" value={phone} onChangeText={setPhone} editable={!busy} />}
                <OnboardingFormField label="Password" placeholder="Enter your password" secureTextEntry autoCapitalize="none" autoCorrect={false} textContentType={mode === 'signup' ? 'newPassword' : 'password'} value={password} onChangeText={setPassword} editable={!busy} />
              </View>
              <View style={styles.footer}>
                <PrimaryButton label={busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Log in'} onPress={submit} disabled={busy || Boolean(configurationError)} />
                <PrimaryButton label={mode === 'signup' ? 'Already have an account? Log in' : 'Create a new account'} disabled={busy} onPress={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setMessage(''); setPassword(''); }} />
                {mode === 'signup' && <Text style={styles.terms}>By signing up, you agree to our Terms and Conditions</Text>}
              </View>
            </>
          )}
          {(configurationError || message) ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.status}>{configurationError || message}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  status: { marginTop: 24, color: StyleUTokens.colors.text, textAlign: 'center' },
  flex: { flex: 1 },
  safeArea: { backgroundColor: StyleUTokens.colors.background, flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 82, paddingBottom: 28 },
  hero: { alignItems: 'center', gap: 24 },
  logo: { color: StyleUTokens.colors.text, fontSize: 58, fontWeight: '800', letterSpacing: -1.5 },
  logoAccent: { color: StyleUTokens.colors.accent },
  subtitle: { color: StyleUTokens.colors.mutedText, fontSize: 20, lineHeight: 30, textAlign: 'center' },
  form: { gap: 26, marginTop: 48 },
  footer: { gap: 24, marginTop: 'auto', paddingTop: 32 },
  terms: { color: StyleUTokens.colors.placeholder, fontSize: 14, lineHeight: 20, textAlign: 'center' },
});
