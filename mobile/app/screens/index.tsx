import { Link, Redirect, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../src/auth/auth-provider';
import { getPostAuthRoute, type PostAuthRoute } from '../../src/auth/auth-service';
import { PrimaryButton } from '../components/primary-button';
import { StyleUTokens } from '../services/styleu-theme';

// The outcome of checking one user's onboarding status. `route` is null when the check failed.
type Resolution = { userId: string; route: PostAuthRoute | null };

export default function WelcomeScreen() {
  const { user, isLoading, configurationError } = useAuth();
  const userId = user?.id ?? null;
  const [resolution, setResolution] = useState<Resolution | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Where a restored session belongs: onboarding or home, from profiles.onboarding_completed.
  // Runs only while this screen is focused, because it stays mounted underneath Login and
  // Onboarding. Keyed on the user's id, since the user object changes on every token refresh.
  useFocusEffect(
    useCallback(() => {
      if (!userId) return;

      let cancelled = false;

      void getPostAuthRoute(userId).then((result) => {
        if (!cancelled) setResolution({ userId, route: result.route });
      });

      return () => {
        cancelled = true;
        // Never reuse an answer across a blur, a retry or a different user.
        setResolution(null);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps -- attempt only exists to re-run this effect
    }, [userId, attempt]),
  );

  // Only an answer for the user who is signed in right now counts.
  const current = resolution !== null && resolution.userId === userId ? resolution : null;
  const checkFailed = current !== null && current.route === null;
  const isChecking = isLoading || (user !== null && current === null);

  if (!isLoading && user && current?.route) {
    return <Redirect href={current.route} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Text accessibilityRole="header" style={styles.logo}>
            Style<Text style={styles.logoAccent}>U</Text>
          </Text>
          <Text style={styles.subtitle}>
            Your personal digital wardrobe assistant. Define your style and get customized daily lookups.
          </Text>
        </View>

        <View style={styles.footer}>
          {isChecking ? (
            <Text style={styles.status}>Restoring your session…</Text>
          ) : checkFailed ? (
            <>
              <Text accessibilityRole="alert" style={styles.status}>
                {"We couldn't check your account. Please check your connection and try again."}
              </Text>
              <PrimaryButton label="Try Again" onPress={() => setAttempt((count) => count + 1)} />
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
          {configurationError ? <Text accessibilityRole="alert" style={styles.status}>{configurationError}</Text> : null}
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
