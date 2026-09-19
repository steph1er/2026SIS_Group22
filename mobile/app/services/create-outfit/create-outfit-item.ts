import { StyleSheet } from 'react-native';
import { StyleUTokens } from '../styleu-theme';

const { colors } = StyleUTokens;

export const itemStyles = StyleSheet.create ({
  topContainer: {
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  itemPopUpName: {
    fontSize: 26,
    fontWeight: 600,
    color: colors.text,
  },

  brandName: {
    fontSize: 16,
    color: colors.mutedText,
  },
  
  price: {
    fontSize: 16,
    fontWeight: 700,
  },

  descriptionContainer: {
    paddingVertical: 20,
    gap: 12,
  },

  descriptionSubtitle: {
    color: colors.mutedText,
    fontSize: 16,
  },

  descriptionText: {
    color: colors.text,
    fontSize: 16,
  },

  descriptionCardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },

  descriptionCard: {
    backgroundColor: colors.surface,
    width: '30%',
    padding: 14,
    borderRadius: 12,
  },

  descriptionCardSymbol: {

  },

  descriptionCardText: {
    fontSize: 14,
    color: colors.mutedText,
  },

  descriptionTagsContainer: {
    flexDirection: 'row',
  },

  descriptionTags: {
    backgroundColor: colors.mutedAccent,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  descriptionTagsText: {
    fontSize: 12,
    color: colors.text,
  },
})