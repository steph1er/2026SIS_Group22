import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { StyleUTokens } from '../services/styleu-theme';
import { useStyleUColors, useThemedStyles } from '../hooks/use-theme';
import type { StyleUColors } from '../services/styleu-theme';

type OnboardingFormFieldProps = TextInputProps & { label: string };

export function OnboardingFormField({ label, keyboardType = 'default', ...props }: OnboardingFormFieldProps) {
  const colors = useStyleUColors();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
        keyboardType={keyboardType}
        placeholderTextColor={colors.placeholder}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

const createStyles = (colors: StyleUColors) =>
  StyleSheet.create({
  field: { gap: 10 },
  label: { color: colors.mutedText, fontSize: 16, fontWeight: '600' },
  input: { backgroundColor: colors.surface, borderRadius: StyleUTokens.radius.field, color: colors.text, fontSize: 17, height: 68, paddingHorizontal: 22 },
});
