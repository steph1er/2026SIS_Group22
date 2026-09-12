// main styles for onboarding

import { StyleSheet } from 'react-native';
import { StyleUTokens } from '../styleu-theme';

const { colors } = StyleUTokens;

export const layoutStyles =  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
 
    progressContainer: {
      paddingHorizontal: 24,
      paddingTop: 8,
    },
 
    progressBackground: {
      height: 4,
      backgroundColor: colors.track,
      borderRadius: 4,
      overflow: 'hidden',
    },
 
    progressFill: {
      height: 4,
      backgroundColor: colors.accent,
      borderRadius: 4,
    },
 
    scrollContent: {
      paddingBottom: 24,
    },
 
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 16,
    },
 
    stepLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
 
    backChevron: {
      paddingRight: 4,
    },
 
    backChevronText: {
      fontSize: 20,
      color: colors.mutedText,
      lineHeight: 20,
    },
 
    stepLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.mutedText,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
 
    percentLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
 
    titleContainer: {
      paddingHorizontal: 24,
      paddingTop: 32,
      paddingBottom: 24,
    },
 
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
 
    title: {
      fontSize: 30,
      fontWeight: '700',
      color: colors.text,
    },
 
    subtitle: {
      fontSize: 15,
      color: colors.mutedText,
      marginTop: 8,
      lineHeight: 22,
    },
 
    content: {
      paddingHorizontal: 24,
    },
 
    section: {
      marginBottom: 32,
    },
 
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
 
    sectionTitle: {
      fontSize: 19,
      fontWeight: '600',
      color: colors.text,
    },
 
    optionalBadge: {
      backgroundColor: colors.badgeBg,
      borderRadius: 20,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
 
    optionalBadgeText: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.badgeText,
      letterSpacing: 0.5,
    },
 
    sectionTitleError: {
      color: colors.errorRed,
    },
 
    errorText: {
      fontSize: 12,
      color: colors.errorRed,
      marginBottom: 8,
    },
 
    sectionSubtitle: {
      fontSize: 14,
      color: colors.mutedText,
      marginBottom: 8,
    },
 
    footer: {
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 16,
      backgroundColor: colors.background,
    },
 
    footerErrorText: {
      fontSize: 13,
      color: colors.errorRed,
      textAlign: 'center',
      marginBottom: 8,
    },
 
    continueButton: {
      backgroundColor: colors.accent,
      paddingVertical: 16,
      borderRadius: 24,
      alignItems: 'center',
    },
 
    continueText: {
      color: colors.buttonText,
      fontSize: 16,
      fontWeight: '700',
    },
 
    skipForNow: {
      color: colors.mutedText,
      fontSize: 14,
      textAlign: 'center',
      marginTop: 8,
    }
  });