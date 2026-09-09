import { Pressable, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';

import { StyleUTokens } from '../services/styleu-theme';

export function BackButton() {
  const router = useRouter();
  return (
    <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.button} hitSlop={12}>
      <Text style={styles.label}>← Back</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignSelf: 'flex-start', marginBottom: 12 },
  label: { color: StyleUTokens.colors.text, fontSize: 16, fontWeight: '600' },
});