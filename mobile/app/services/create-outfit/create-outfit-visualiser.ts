import { StyleSheet } from 'react-native';
import { StyleUTokens } from '../styleu-theme';

const { colors } = StyleUTokens;

export const visualiserStyles = StyleSheet.create ({
  visualiserContainer : {
    backgroundColor: colors.backgroundElement,
    width: '100%',
    height: '40%',
  },
})