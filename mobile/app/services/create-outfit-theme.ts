import { StyleSheet } from 'react-native';
import { StyleUTokens } from './styleu-theme';

const { colors } = StyleUTokens;

export const styles = StyleSheet.create ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  headerContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },

  title: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  headerText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },

  assistButton: {
    backgroundColor: colors.accent,
    paddingVertical: 8,
    borderRadius: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    alignSelf: 'center',
    opacity: 0.4,
  },

  assistOff: {
    opacity: 0.2,
  },

  assistText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },

  buttonContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 12,
    paddingTop: 8,
    paddingBottom: 16,
  },

  buttonText: {
    color: colors.buttonText,
    fontSize: 16,
    fontWeight: '700',
  },

  wishlistButton: {
    backgroundColor: colors.surface,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    width: '42%',
    borderWidth: 1,
    borderColor: colors.border,
  },

  wishlistButtonDisabled: {
    opacity: 0.4,
  },

  saveButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    width: '42%',
  },
})