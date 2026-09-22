// styles for user input

import { StyleSheet } from 'react-native';
import { StyleUTokens } from '../styleu-theme';

const { colors } = StyleUTokens;

export const inputStyles = StyleSheet.create({
  sliderContainer: {
    marginTop: 4,
  },

  skipCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  checkbox: {
    width: 15,
    height: 15,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.mutedText,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },

  checkboxMark: {
    color: colors.buttonText,
    fontSize: 8,
    fontWeight: '700',
    lineHeight: 8,
  },

  skipCheckboxLabel: {
    fontSize: 14,
    color: colors.mutedText,
  },

  sliderDisabled: {
    opacity: 0.4,
  },

  sliderValue: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },

  slider: {
    width: '100%',
    height: 40,
  },

  sizeFieldRow: {
    flexDirection: 'row',
    gap: 8,
  },

  sizeFieldBox: {
    flex: 1,
    backgroundColor: colors.backgroundElement,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },

  sizeFieldBoxOpen: {
    borderColor: colors.accent,
    backgroundColor: colors.chipSelectedBg,
  },

  sizeFieldLabel: {
    fontSize: 11,
    color: colors.mutedText,
    marginBottom: 2,
  },

  sizeFieldValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sizeFieldValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },

  sizeFieldChevron: {
    fontSize: 14,
    color: colors.mutedText,
  },

  sizeFieldChevronOpen: {
    color: colors.accent,
  },

  sizeDropdownPanel: {
    marginTop: 8,
    padding: 8,
    backgroundColor: colors.backgroundElement,
    borderRadius: 8,
  },

  sizeDropdownLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.mutedText,
    marginBottom: 8,
  },

  priceFieldsList: {
    gap: 12,
  },

  priceCategoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 10,
    marginTop: 6
  },

  priceCategoryAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  priceCategoryActionText: {
    fontSize: 13,
    color: colors.mutedText,
  },

  priceCard: {
    padding: 12,
    paddingTop: 16,
    backgroundColor: colors.backgroundElement,
    borderRadius: 8,
  },

  priceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  priceCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },

  priceValue: {
    position: 'absolute',
    top: 10,
    width: 40,
    fontSize: 12,
    fontWeight: '600',
    color: colors.mutedText,
    textAlign: 'right',
  },

  priceCardSkipRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  priceSliderContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  }
});