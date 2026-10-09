import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useThemedStyles } from '../hooks/use-theme';
import type { StyleUColors } from '../services/styleu-theme';


export function BackButton() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  return (
    <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.button} hitSlop={12}>
      <Text style={styles.label}>←</Text>
    </Pressable>
  );
}

const createStyles = (colors: StyleUColors) =>
  StyleSheet.create({
  button: { alignSelf: 'center' },
  label: { color: colors.text, fontSize: 24, fontWeight: '600' },
});