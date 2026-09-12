// styling for question options

import { StyleSheet } from 'react-native';
import { StyleUTokens } from '../styleu-theme';

const { colors } = StyleUTokens;

export const optionStyles = StyleSheet.create({
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  option: {
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor:  colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedOption: {
    backgroundColor: colors.chipSelectedBg,
    borderColor: colors.accent,
  },

  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.mutedText,
    textAlign: 'center',
  },

  selectedOptionText: {
    color: colors.text,
    fontWeight: '700',
  },

  optionDescription: {
    fontSize: 11,
    color: colors.mutedText,
    textAlign: 'center',
    marginTop: 4,
  },

  selectedOptionDescription: {
    color: colors.mutedText,
  },

  colourItem: {
    alignItems: 'center',
    width: 64,
  },

  colourCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  colourCircleSelected: {
    borderColor: colors.accent,
  },

  colourLabel: {
    fontSize: 12,
    color: colors.mutedText,
    textAlign: 'center',
  },

  multiSelectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  removeIcon: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.errorRed,
  },

  bodyTypeCard: {
    width: '31%',
    minHeight: 80,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.backgroundElement,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bodyTypeCardSelected: {
    backgroundColor:  colors.chipSelectedBg,
    borderColor: colors.accent,
  },

  bodyTypeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
    textAlign: 'center',
  },

  bodyTypeDescription: {
    fontSize: 11,
    color: colors.mutedText,
    textAlign: 'center',
  },

  aestheticCard: {
    width: '31%',
    aspectRatio: 0.75,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.backgroundElement,
    position: 'relative',
  },

  aestheticCardSelected: {
    borderColor: colors.accent,
  },

  aestheticImage: {
    width: '100%',
    height: '100%',
  },

  aestheticBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  aestheticBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A1A1A',
  },
});