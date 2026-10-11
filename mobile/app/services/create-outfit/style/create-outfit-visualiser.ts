import { StyleSheet } from 'react-native';
import type { StyleUColors } from '../../styleu-theme';

export const createVisualiserStyles = (colors: StyleUColors) =>
  StyleSheet.create({
    visualiserContainer : {
      backgroundColor: colors.backgroundElement,
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
    },

    visualiserEmptyText: {
      color: colors.mutedText,
      fontSize: 20,
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
  
    visualiserItemBody: {
      flex: 1,
    },

    visualiserItemImage: {
      width: '100%',
      height: '100%',
      borderRadius: 12,
      backgroundColor: colors.background,
    },

    visualiserResizeHandle: {
      position: 'absolute',
      bottom: -8,
      right: -8,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
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