import { StyleSheet } from 'react-native';
import { StyleUTokens } from '../styleu-theme';

const { colors } = StyleUTokens;

export const visualiserStyles = StyleSheet.create ({
  visualiserContainer : {
    backgroundColor: colors.backgroundElement,
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },

  visualiserEmptyText: {
    color: colors.mutedText,
    fontSize: 24,
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: '30%',
  },

  visualiserItem: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 100,
    height: 100,
  },
  
  visualiserItemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: colors.background,
  },

  visualiserDeleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.errorRed,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
})