import { StyleSheet } from 'react-native';
import { StyleUTokens } from '../styleu-theme';

const { colors } = StyleUTokens;

export const themeStyles = StyleSheet.create ({
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
  },

  assistOff: {
    backgroundColor: colors.mutedAccent,
  },

  assistText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },

  assistTextOff: {
    color: colors.mutedText,
  },

  contentContainer: {
    backgroundColor: colors.backgroundElement,
    flex: 1,
    width: '100%',
  },

  buttonContainer: {
    backgroundColor: colors.background,
    position: 'absolute',
    bottom: -34, // TODO: make it relevant to bottom inset
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 16,
    paddingBottom: 54,
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
    alignSelf: 'center',
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
    alignSelf: 'center',
    width: '42%',
  },
})