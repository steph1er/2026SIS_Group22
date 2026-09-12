
import { StyleSheet } from 'react-native';
import { StyleUTokens } from './styleu-theme';
import { Fonts, Spacing } from './theme';

const { colors } = StyleUTokens;

export const styles =  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
 
    progressContainer: {
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.two,
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
      color: colors.mutedText,
      lineHeight: 20,
    },
 
    stepLabel: {
      fontFamily: Fonts.sans,
      fontSize: 11,
      fontWeight: '600',
      color: colors.mutedText,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
 
    percentLabel: {
      fontFamily: Fonts.sans,
      fontSize: 11,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
 
    skipButton: {
      fontFamily: Fonts.sans,
      fontSize: 15,
      color: colors.mutedText,
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
      color: colors.text,
    },
 
    subtitle: {
      fontFamily: Fonts.sans,
      fontSize: 15,
      color: colors.mutedText,
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
      color: colors.text,
    },
 
    optionalBadge: {
      backgroundColor: colors.badgeBg,
      borderRadius: 20,
      paddingHorizontal: Spacing.two,
      paddingVertical: 3,
    },
 
    optionalBadgeText: {
      fontFamily: Fonts.sans,
      fontSize: 10,
      fontWeight: '600',
      color: colors.badgeText,
      letterSpacing: 0.5,
    },
 
    sectionTitleError: {
      color: colors.errorRed,
    },
 
    errorText: {
      fontFamily: Fonts.sans,
      fontSize: 12,
      color: colors.errorRed,
      marginBottom: Spacing.two,
    },
 
    sectionSubtitle: {
      fontFamily: Fonts.sans,
      fontSize: 14,
      color: colors.mutedText,
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
      borderColor:  colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
 
    selectedOption: {
      backgroundColor: colors.chipSelectedBg,
      borderColor: colors.accent,
    },
 
    optionText: {
      fontFamily: Fonts.sans,
      fontSize: 14,
      fontWeight: '500',
      color: colors.mutedText,
      textAlign: 'center',
    },
 
    selectedOptionText: {
      color: colors.text,
      fontWeight: '700',
    },
 
    optionDescription: {
      fontFamily: Fonts.sans,
      fontSize: 11,
      color: colors.mutedText,
      textAlign: 'center',
      marginTop: Spacing.one,
    },
 
    selectedOptionDescription: {
      color: colors.mutedText,
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
      borderColor: colors.accent,
    },

    colourLabel: {
      fontFamily: Fonts.sans,
      fontSize: 12,
      color: colors.mutedText,
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
      color: colors.errorRed,
    },

    bodyTypeCard: {
      width: '31%',
      minHeight: 92,
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.two,
      borderRadius: Spacing.two,
      backgroundColor: colors.backgroundElement,
      borderWidth: 1,
      borderColor: colors.backgroundElement,
      alignItems: 'flex-start',
    },

    bodyTypeCardSelected: {
      backgroundColor:  colors.chipSelectedBg,
      borderColor: colors.accent,
    },

    bodyTypeIcon: {
      fontSize: 20,
      marginBottom: Spacing.one,
    },

    bodyTypeTitle: {
      fontFamily: Fonts.sans,
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },

    bodyTypeDescription: {
      fontFamily: Fonts.sans,
      fontSize: 11,
      color: colors.mutedText,
    },

        aestheticCard: {
      width: '31%',
      aspectRatio: 0.75,
      borderRadius: Spacing.two,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: 'transparent',
      backgroundColor: colors.backgroundElement,
      position: 'relative',
    },

    aestheticCardSelected: {
      borderColor: colors.accent,
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
      borderColor: colors.mutedText,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.two,
    },

    checkboxChecked: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },

    checkboxMark: {
      color: colors.buttonText,
      fontSize: 13,
      fontWeight: '700',
      lineHeight: 13,
    },

    skipCheckboxLabel: {
      fontFamily: Fonts.sans,
      fontSize: 14,
      color: colors.mutedText,
    },

    sliderDisabled: {
      opacity: 0.4,
    },

    sliderValue: {
      fontFamily: Fonts.sans,
      fontSize: 28,
      fontWeight: '600',
      color: colors.text,
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
      backgroundColor: colors.backgroundElement,
      borderRadius: Spacing.two,
      borderWidth: 1,
      borderColor: colors.backgroundElement,
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.two,
    },
 
    sizeFieldBoxOpen: {
      borderColor: colors.accent,
      backgroundColor: colors.chipSelectedBg,
    },
 
    sizeFieldLabel: {
      fontFamily: Fonts.sans,
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
      fontFamily: Fonts.sans,
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
      marginTop: Spacing.two,
      padding: Spacing.two,
      backgroundColor: colors.backgroundElement,
      borderRadius: Spacing.two,
    },
 
    sizeDropdownLabel: {
      fontFamily: Fonts.sans,
      fontSize: 12,
      fontWeight: '600',
      color: colors.mutedText,
      marginBottom: Spacing.two,
    },
 
    wardrobeContent: {
      paddingHorizontal: Spacing.four,
      gap: Spacing.three,
    },
 
    wardrobeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.backgroundElement,
      borderRadius: Spacing.two,
      padding: Spacing.three,
      minHeight: 80,
    },
 
    wardrobeIconBox: {
      width: 48,
      height: 48,
      borderRadius: Spacing.two,
      backgroundColor: colors.chipSelectedBg,
      justifyContent: 'center',
      alignItems: 'center',
    },

    wardrobeIcon: {
      fontSize: 22,
      color: colors.accent,
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
      color: colors.text,
    },
 
    wardrobeSubtitle: {
      fontFamily: Fonts.sans,
      fontSize: 13,
      color: colors.mutedText,
      marginTop: Spacing.one,
    },
 
    footer: {
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.two,
      paddingBottom: Spacing.three,
      backgroundColor: colors.background,
    },
 
    footerErrorText: {
      fontFamily: Fonts.sans,
      fontSize: 13,
      color: colors.errorRed,
      textAlign: 'center',
      marginBottom: Spacing.two,
    },
 
    continueButton: {
      backgroundColor: colors.accent,
      paddingVertical: Spacing.three,
      borderRadius: 24,
      alignItems: 'center',
    },
 
    continueText: {
      fontFamily: Fonts.sans,
      color: colors.buttonText,
      fontSize: 16,
      fontWeight: '700',
    },
 
    skipForNow: {
      fontFamily: Fonts.sans,
      color: colors.mutedText,
      fontSize: 14,
      textAlign: 'center',
      marginTop: Spacing.two,
    },
 
    placeholderText: {
      fontFamily: Fonts.sans,
      fontSize: 16,
      color: colors.mutedText,
    },
  });