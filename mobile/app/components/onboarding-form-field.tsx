import { StyleSheet, Text, TextInput, View } from 'react-native';

import { StyleUTokens } from '../services/styleu-theme';

type OnboardingFormFieldProps = {
  label: string;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  textContentType?: 'name' | 'emailAddress' | 'telephoneNumber';
};

/** Presentational field that can later be controlled by a form/auth layer. */
export function OnboardingFormField({ label, placeholder, keyboardType = 'default', textContentType }: OnboardingFormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={StyleUTokens.colors.placeholder}
        style={styles.input}
        textContentType={textContentType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 10 },
  label: { color: StyleUTokens.colors.mutedText, fontSize: 16, fontWeight: '600' },
  input: { backgroundColor: StyleUTokens.colors.surface, borderRadius: StyleUTokens.radius.field, color: StyleUTokens.colors.text, fontSize: 17, height: 68, paddingHorizontal: 22 },
});
