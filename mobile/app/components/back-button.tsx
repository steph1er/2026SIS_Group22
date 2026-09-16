import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { StyleUTokens } from '../services/styleu-theme';

export function BackButton() {
  const router = useRouter();
  return (
    <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.button} hitSlop={12}>
      <Text style={styles.label}>←</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignSelf: 'center' },
  label: { color: StyleUTokens.colors.text, fontSize: 24, fontWeight: '600' },
});