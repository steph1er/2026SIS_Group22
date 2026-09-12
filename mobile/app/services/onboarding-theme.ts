
import { StyleSheet } from 'react-native';
import { useAccentColors, useTheme } from '../hooks/use-theme';
import { Fonts, Spacing } from './theme';

export const createStyles = (
  theme: ReturnType<typeof useTheme>,
  accentColors: ReturnType<typeof useAccentColors>
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
 
    progressContainer: {
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.two,
    },
 
    progressBackground: {
      height: 4,
      backgroundColor: accentColors.track,
      borderRadius: 4,
      overflow: 'hidden',
    },
 
    progressFill: {
      height: 4,
      backgroundColor: accentColors.primary,
      borderRadius: 4,
    },
 
    scrollContent: {
      paddingBottom: Spacing.four,
    },
 
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.three,
    },
 
    stepLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
 
    backChevron: {
      paddingRight: Spacing.one,
    },
 
    backChevronText: {
      fontSize: 20,
      color: theme.textSecondary,
      lineHeight: 20,
    },
 
    stepLabel: {
      fontFamily: Fonts.sans,
      fontSize: 11,
      fontWeight: '600',
      color: theme.textSecondary,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
 
    percentLabel: {
      fontFamily: Fonts.sans,
      fontSize: 11,
      fontWeight: '700',
      color: theme.text,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
 
    skipButton: {
      fontFamily: Fonts.sans,
      fontSize: 15,
      color: theme.textSecondary,
    },
 
    titleContainer: {
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.five,
      paddingBottom: Spacing.four,
    },
 
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
 
    title: {
      fontFamily: Fonts.sans,
      fontSize: 30,
      fontWeight: '700',
      color: theme.text,
    },
 
    subtitle: {
      fontFamily: Fonts.sans,
      fontSize: 15,
      color: theme.textSecondary,
      marginTop: Spacing.two,
      lineHeight: 22,
    },
 
    content: {
      paddingHorizontal: Spacing.four,
    },
 
    section: {
      marginBottom: Spacing.five,
    },
 
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.one,
    },
 
    sectionTitle: {
      fontFamily: Fonts.sans,
      fontSize: 19,
      fontWeight: '600',
      color: theme.text,
    },
 
    optionalBadge: {
      backgroundColor: accentColors.badgeBg,
      borderRadius: 20,
      paddingHorizontal: Spacing.two,
      paddingVertical: 3,
    },
 
    optionalBadgeText: {
      fontFamily: Fonts.sans,
      fontSize: 10,
      fontWeight: '600',
      color: accentColors.badgeText,
      letterSpacing: 0.5,
    },
 
    sectionTitleError: {
      color: accentColors.errorRed,
    },
 
    errorText: {
      fontFamily: Fonts.sans,
      fontSize: 12,
      color: accentColors.errorRed,
      marginBottom: Spacing.two,
    },
 
    sectionSubtitle: {
      fontFamily: Fonts.sans,
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: Spacing.two,
    },
 
    optionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.two,
    },
 
    option: {
      minHeight: 40,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
      borderRadius: 24,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor:  accentColors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
 
    selectedOption: {
      backgroundColor: accentColors.chipSelectedBg,
      borderColor: accentColors.primary,
    },
 
    optionText: {
      fontFamily: Fonts.sans,
      fontSize: 14,
      fontWeight: '500',
      color: theme.textSecondary,
      textAlign: 'center',
    },
 
    selectedOptionText: {
      color: theme.text,
      fontWeight: '700',
    },
 
    optionDescription: {
      fontFamily: Fonts.sans,
      fontSize: 11,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: Spacing.one,
    },
 
    selectedOptionDescription: {
      color: theme.textSecondary,
    },
 
    colourItem: {
      alignItems: 'center',
      width: 64,
    },

    colourCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginBottom: Spacing.one,
      borderWidth: 2,
      borderColor: 'transparent',
    },

    colourCircleSelected: {
      borderColor: accentColors.primary,
    },

    colourLabel: {
      fontFamily: Fonts.sans,
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: 'center',
    },

    noGoOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    noGoRemove: {
      fontSize: 12,
      fontWeight: '700',
      color: accentColors.errorRed,
    },

        bodyTypeCard: {
      width: '31%',
      minHeight: 92,
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.two,
      borderRadius: Spacing.two,
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: theme.backgroundElement,
      alignItems: 'flex-start',
    },

    bodyTypeCardSelected: {
      backgroundColor:  accentColors.chipSelectedBg,
      borderColor: accentColors.primary,
    },

    bodyTypeIcon: {
      fontSize: 20,
      marginBottom: Spacing.one,
    },

    bodyTypeTitle: {
      fontFamily: Fonts.sans,
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 2,
    },

    bodyTypeDescription: {
      fontFamily: Fonts.sans,
      fontSize: 11,
      color: theme.textSecondary,
    },

        aestheticCard: {
      width: '31%',
      aspectRatio: 0.75,
      borderRadius: Spacing.two,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: 'transparent',
      backgroundColor: theme.backgroundElement,
      position: 'relative',
    },

    aestheticCardSelected: {
      borderColor: accentColors.primary,
    },

    aestheticImage: {
      width: '100%',
      height: '100%',
    },

    aestheticBadge: {
      position: 'absolute',
      top: Spacing.one,
      left: Spacing.one,
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      paddingHorizontal: Spacing.two,
      paddingVertical: 3,
    },

    aestheticBadgeText: {
      fontFamily: Fonts.sans,
      fontSize: 11,
      fontWeight: '700',
      color: '#1A1A1A',
    },

    sliderContainer: {
      marginTop: Spacing.one,
    },

    skipCheckboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.two,
    },

    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 5,
      borderWidth: 1.5,
      borderColor: theme.textSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.two,
    },

    checkboxChecked: {
      backgroundColor: accentColors.primary,
      borderColor: accentColors.primary,
    },

    checkboxMark: {
      color: accentColors.buttonText,
      fontSize: 13,
      fontWeight: '700',
      lineHeight: 13,
    },

    skipCheckboxLabel: {
      fontFamily: Fonts.sans,
      fontSize: 14,
      color: theme.textSecondary,
    },

    sliderDisabled: {
      opacity: 0.4,
    },

    sliderValue: {
      fontFamily: Fonts.sans,
      fontSize: 28,
      fontWeight: '600',
      color: theme.text,
      marginBottom: Spacing.one,
    },
 
    slider: {
      width: '100%',
      height: 40,
    },
 
    sizeFieldRow: {
      flexDirection: 'row',
      gap: Spacing.two,
    },
 
    sizeFieldBox: {
      flex: 1,
      backgroundColor: theme.backgroundElement,
      borderRadius: Spacing.two,
      borderWidth: 1,
      borderColor: theme.backgroundElement,
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.two,
    },
 
    sizeFieldBoxOpen: {
      borderColor: accentColors.primary,
      backgroundColor: accentColors.chipSelectedBg,
    },
 
    sizeFieldLabel: {
      fontFamily: Fonts.sans,
      fontSize: 11,
      color: theme.textSecondary,
      marginBottom: 2,
    },
 
    sizeFieldValueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
 
    sizeFieldValue: {
      fontFamily: Fonts.sans,
      fontSize: 15,
      fontWeight: '600',
      color: theme.text,
    },
 
    sizeFieldChevron: {
      fontSize: 14,
      color: theme.textSecondary,
    },
 
    sizeFieldChevronOpen: {
      color: accentColors.primary,
    },
 
    sizeDropdownPanel: {
      marginTop: Spacing.two,
      padding: Spacing.two,
      backgroundColor: theme.backgroundElement,
      borderRadius: Spacing.two,
    },
 
    sizeDropdownLabel: {
      fontFamily: Fonts.sans,
      fontSize: 12,
      fontWeight: '600',
      color: theme.textSecondary,
      marginBottom: Spacing.two,
    },
 
    wardrobeContent: {
      paddingHorizontal: Spacing.four,
      gap: Spacing.three,
    },
 
    wardrobeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.backgroundElement,
      borderRadius: Spacing.two,
      padding: Spacing.three,
      minHeight: 80,
    },
 
    wardrobeIconBox: {
      width: 48,
      height: 48,
      borderRadius: Spacing.two,
      backgroundColor: accentColors.chipSelectedBg,
      justifyContent: 'center',
      alignItems: 'center',
    },

    wardrobeIcon: {
      fontSize: 22,
      color: accentColors.primary,
      textAlign: 'center',
    },
 
    wardrobeTextContainer: {
      flex: 1,
      marginLeft: Spacing.two,
    },
 
    wardrobeTitle: {
      fontFamily: Fonts.sans,
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
 
    wardrobeSubtitle: {
      fontFamily: Fonts.sans,
      fontSize: 13,
      color: theme.textSecondary,
      marginTop: Spacing.one,
    },
 
    footer: {
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.two,
      paddingBottom: Spacing.three,
      backgroundColor: theme.background,
    },
 
    footerErrorText: {
      fontFamily: Fonts.sans,
      fontSize: 13,
      color: accentColors.errorRed,
      textAlign: 'center',
      marginBottom: Spacing.two,
    },
 
    continueButton: {
      backgroundColor: accentColors.primary,
      paddingVertical: Spacing.three,
      borderRadius: 24,
      alignItems: 'center',
    },
 
    continueText: {
      fontFamily: Fonts.sans,
      color: accentColors.buttonText,
      fontSize: 16,
      fontWeight: '700',
    },
 
    skipForNow: {
      fontFamily: Fonts.sans,
      color: theme.textSecondary,
      fontSize: 14,
      textAlign: 'center',
      marginTop: Spacing.two,
    },
 
    placeholderText: {
      fontFamily: Fonts.sans,
      fontSize: 16,
      color: theme.textSecondary,
    },
  });