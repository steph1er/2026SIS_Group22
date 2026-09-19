import { StyleSheet } from 'react-native';
import { StyleUTokens } from '../styleu-theme';

const { colors } = StyleUTokens;

export const themeStyles = StyleSheet.create ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

    overlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end' as const,
  },

  popup: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 36,
    minHeight: 600,
  },

  headerContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    height: '8%',
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

  contentContainer: {
    backgroundColor: colors.backgroundElement,
    flex: 1,
    width: '100%',
    height: '92%',
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
    height: '15%',
    paddingBottom: 24,
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