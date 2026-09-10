import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

import { PrimaryButton } from '../components/primary-button';
import { StyleUTokens } from '../services/styleu-theme';

/** UI-only welcome screen. Routes to sign-up/login. Auth state and Supabase submission belong in a future onboarding flow. */
export default function WelcomeScreen() {
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
          <Link href="./sign-up" asChild>
            <PrimaryButton label="Sign Up" />
          </Link>
          <Link href="./login" asChild>
            <PrimaryButton label="Log In" />
          </Link>
          <Text style={styles.terms}>By signing up, you agree to our Terms and Conditions</Text>
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
  terms: { color: StyleUTokens.colors.placeholder, fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 8 },
}); 