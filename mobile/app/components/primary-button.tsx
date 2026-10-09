import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { StyleUTokens } from '../services/styleu-theme';

type PrimaryButtonProps = Pick<PressableProps, 'onPress' | 'disabled'> & {
  label: string;
  compact?: boolean;
};

export function PrimaryButton({ label, onPress, disabled, compact = false }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, compact && styles.compactButton, (pressed || disabled) && styles.pressed]}>
      <Text style={[styles.label, compact && styles.compactLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', backgroundColor: StyleUTokens.colors.accent, borderRadius: StyleUTokens.radius.button, height: 72, justifyContent: 'center' },
  label: { color: StyleUTokens.colors.text, fontSize: 20, fontWeight: '700' },
  compactButton: { height: 52, borderRadius: 24 },
  compactLabel: { fontSize: 16 },
  pressed: { opacity: 0.84 },
});
