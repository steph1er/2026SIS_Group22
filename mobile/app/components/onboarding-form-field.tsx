import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { StyleUTokens } from '../services/styleu-theme';

type OnboardingFormFieldProps = TextInputProps & { label: string };

export function OnboardingFormField({ label, keyboardType = 'default', ...props }: OnboardingFormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
        keyboardType={keyboardType}
        placeholderTextColor={StyleUTokens.colors.placeholder}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 10 },
  label: { color: StyleUTokens.colors.mutedText, fontSize: 16, fontWeight: '600' },
  input: { backgroundColor: StyleUTokens.colors.surface, borderRadius: StyleUTokens.radius.field, color: StyleUTokens.colors.text, fontSize: 17, height: 68, paddingHorizontal: 22 },
});
