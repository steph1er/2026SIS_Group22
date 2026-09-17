import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { requireSupabase } from '../../src/auth/supabase-client';
import { StyleUTokens } from '../services/styleu-theme';

function getCallbackParameters(url: string) {
  const query = url.includes('?') ? url.split('?')[1]?.split('#')[0] : '';
  const fragment = url.includes('#') ? url.split('#')[1] : '';
  return new URLSearchParams([query, fragment].filter(Boolean).join('&'));
}

export default function AuthCallbackScreen() {
  const url = Linking.useLinkingURL();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!url) return;

    async function completeConfirmation() {
      const parameters = getCallbackParameters(url!);
      const callbackError = parameters.get('error_description');
      const code = parameters.get('code');
      const accessToken = parameters.get('access_token');
      const refreshToken = parameters.get('refresh_token');

      if (callbackError) throw new Error(callbackError);

      if (code) {
        const { error } = await requireSupabase().auth.exchangeCodeForSession(code);
        if (error) throw error;
      } else if (accessToken && refreshToken) {
        const { error } = await requireSupabase().auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) throw error;
      } else {
        throw new Error('The confirmation link is missing its authentication details.');
      }

      router.replace('/');
    }

    void completeConfirmation().catch((error: unknown) => {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to confirm your email.');
    });
  }, [url]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {errorMessage ? (
          <>
            <Text accessibilityRole="header" style={styles.title}>Confirmation failed</Text>
            <Text accessibilityRole="alert" style={styles.message}>{errorMessage}</Text>
          </>
        ) : (
          <>
            <ActivityIndicator color={StyleUTokens.colors.accent} size="large" />
            <Text accessibilityRole="header" style={styles.title}>Confirming your email…</Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: StyleUTokens.colors.background, flex: 1 },
  content: { alignItems: 'center', flex: 1, gap: 20, justifyContent: 'center', paddingHorizontal: 28 },
  title: { color: StyleUTokens.colors.text, fontSize: 26, fontWeight: '700', textAlign: 'center' },
  message: { color: StyleUTokens.colors.mutedText, fontSize: 16, lineHeight: 24, textAlign: 'center' },
});
