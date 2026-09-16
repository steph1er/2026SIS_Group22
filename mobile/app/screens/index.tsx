import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../src/auth/auth-provider';
import { signOut } from '../../src/auth/auth-service';
import { PrimaryButton } from '../components/primary-button';
import { StyleUTokens } from '../services/styleu-theme';

export default function WelcomeScreen() {
  const { user, isLoading, configurationError } = useAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSignOut() {
    setBusy(true);
    setMessage('');
    const { error } = await signOut();
    if (error) setMessage(error.message);
    setBusy(false);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.content}>


        {/* FOR VISUAL TESTING */}
        <Link href="/create-outfit" asChild>
            <PrimaryButton label="Create Outfits UI Test" />
          </Link>


        <View style={styles.hero}>
          <Text accessibilityRole="header" style={styles.logo}>
            Style<Text style={styles.logoAccent}>U</Text>
          </Text>
          <Text style={styles.subtitle}>
            Your personal digital wardrobe assistant. Define your style and get customized daily lookups.
          </Text>
        </View>

        <View style={styles.footer}>
          {isLoading ? (
            <Text style={styles.status}>Restoring your session…</Text>
          ) : user ? (
            <>
              <Text style={styles.status}>Signed in as {user.email}</Text>
              <PrimaryButton label={busy ? 'Signing out…' : 'Sign Out'} onPress={handleSignOut} disabled={busy} />
            </>
          ) : (
            <>
              <Link href="/sign-up" asChild>
                <PrimaryButton label="Sign Up" disabled={Boolean(configurationError)} />
              </Link>
              <Link href="/login" asChild>
                <PrimaryButton label="Log In" disabled={Boolean(configurationError)} />
              </Link>
              <Text style={styles.terms}>By signing up, you agree to our Terms and Conditions</Text>
            </>
          )}
          {(configurationError || message) ? <Text accessibilityRole="alert" style={styles.status}>{configurationError || message}</Text> : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: StyleUTokens.colors.background, flex: 1 },
  content: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 28, paddingTop: 82, paddingBottom: 28 },
  hero: { alignItems: 'center', gap: 24 },
  logo: { color: StyleUTokens.colors.text, fontSize: 58, fontWeight: '800', letterSpacing: -1.5 },
  logoAccent: { color: StyleUTokens.colors.accent },
  subtitle: { color: StyleUTokens.colors.mutedText, fontSize: 20, lineHeight: 30, textAlign: 'center' },
  footer: { gap: 16 },
  status: { color: StyleUTokens.colors.text, fontSize: 14, textAlign: 'center' },
  terms: { color: StyleUTokens.colors.placeholder, fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 8 },
});
