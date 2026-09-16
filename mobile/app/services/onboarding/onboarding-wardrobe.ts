// styles for final step of onboarding

import { StyleSheet } from 'react-native';
import { StyleUTokens } from '../styleu-theme';

const { colors } = StyleUTokens;

export const wardrobeStyles = StyleSheet.create({
  wardrobeContent: {
    paddingHorizontal: 24,
    gap: 16,
  },

  wardrobeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundElement,
    borderRadius: 8,
    padding: 16,
    minHeight: 80,
  },

  wardrobeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.chipSelectedBg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  wardrobeIcon: {
    fontSize: 22,
    color: colors.accent,
    textAlign: 'center',
  },

  wardrobeTextContainer: {
    flex: 1,
    marginLeft: 8,
  },

  wardrobeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },

  wardrobeSubtitle: {
    fontSize: 13,
    color: colors.mutedText,
    marginTop: 4,
  },
});