import { StyleSheet } from 'react-native';
import { StyleUTokens } from '../../styleu-theme';

const { colors } = StyleUTokens;

export const saveStyles = StyleSheet.create ({
  saveHeader: {
    fontSize: 26,
    fontWeight: 700,
    paddingVertical: 14,
    color: colors.text,
  },

  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '60%',
  },

  dropdownTriggerText: {
    color: colors.text,
    fontSize: 14,
  },

  dropdownPlaceholderText: {
    color: colors.placeholder,
    fontSize: 14,
  },
 
  dropdownOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 8,
  },

  dropdownChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },

  dropdownChipSelected: {
    backgroundColor: colors.chipSelectedBg,
    borderColor: colors.accent,
  },

  dropdownChipText: {
    color: colors.mutedText,
    fontSize: 13,
  },

  dropdownChipTextSelected: {
    color: colors.text,
  },

  saveError: {
    color: colors.errorRed,
    fontSize: 13,
    paddingVertical: 8,
  },

  itemsInOutfitContainer: {
    backgroundColor: colors.mutedAccent,
    borderRadius: 16,
    paddingVertical: 8,
  },

  outfitDetailsTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 500,
  },

  outfitDetailsContainer: {
    flexDirection: 'column',
    paddingVertical: 8,
  },

  outfitDetailsField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },

  outfitDetailsCategory: {
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: 300,
  },

  outfitDetailsInput: {
    color: colors.text,
    fontSize: 14,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
    padding: 0,
  },

  detailSeparator: {
    backgroundColor: colors.border,
    height: 1,
    width: '100%',
    alignSelf: 'center',
    marginVertical: 10,
  },
})