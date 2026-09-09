import { Pressable, StyleSheet, Text } from 'react-native';
import type { GestureResponderEvent } from 'react-native';

import { StyleUTokens } from '../services/styleu-theme';

type PrimaryButtonProps = {
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
};

export function PrimaryButton({ label, onPress }: PrimaryButtonProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', backgroundColor: StyleUTokens.colors.accent, borderRadius: StyleUTokens.radius.button, height: 72, justifyContent: 'center' },
  label: { color: StyleUTokens.colors.text, fontSize: 20, fontWeight: '700' },
  pressed: { opacity: 0.84 },
});