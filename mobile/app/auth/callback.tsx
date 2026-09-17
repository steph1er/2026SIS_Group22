import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { completeAuthCallback } from '../../src/auth/auth-service';
import { StyleUTokens } from '../services/styleu-theme';

export default function AuthCallbackScreen() {
  const url = Linking.useLinkingURL();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!url) return;

    async function completeConfirmation() {
      await completeAuthCallback(url!);
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
