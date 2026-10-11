import { StyleSheet } from 'react-native';
import type { StyleUColors } from '../../styleu-theme';

export const createItemStyles = (colors: StyleUColors) =>
  StyleSheet.create({
  topContainer: {
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  itemPopUpImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    borderRadius: 16,
    backgroundColor: colors.mutedBackground,
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
    color: colors.text,
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

  descriptionCardCentered: {
    justifyContent: 'center',
  },

  descriptionCardSymbol: {
    color: colors.mutedText,
    marginBottom: 8,
  },

  descriptionCardText: {
    fontSize: 14,
    color: colors.mutedText,
  },

  descriptionTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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