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

  // image

  // TODO: fix popup scroll after image feature added

  itemsInOutfitContainer: {
    backgroundColor: colors.mutedAccent,
    width: '100%',
    alignSelf: 'center',
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
    paddingVertical: 8,
  },

  outfitDetailsCategory: {
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: 300,
  },

  outfitDetailsInput: {
    color: colors.text,
    fontSize: 14,
  },

  detailSeparator: {
    color: colors.placeholder,
    height: 3,
    width: '100%',
    alignSelf: 'center',
    marginVertical: 10,
  },
})