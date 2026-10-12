import { StyleSheet } from 'react-native';
import type { StyleUColors } from '../../services/styleu-theme';

export const createStyles = (colors: StyleUColors) =>
  StyleSheet.create({
    itemsInOutfitContainer: {
      backgroundColor: colors.mutedBackground,
      borderRadius: 16,
      paddingVertical: 8,
    },
    outfitName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: 500,
      paddingHorizontal: 20,
      paddingVertical: 8,
      flexShrink: 1,
    },
    deleteButton: {
      backgroundColor: colors.badgeBg,
      borderRadius: 11,
      width: 22,
      height: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      alignSelf: 'center',
      maxHeight: '90%',
    },
    deleteButtonText: {
      color: colors.buttonText,
    },
    outfitItemsGrid: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 16,
      paddingBottom:6,
    },
    itemCard: {
      width: 100,
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemImage: {
      paddingTop: 8,
      width: '85%',
      aspectRatio: 1,
      resizeMode: 'cover',
    },
    itemImagePlaceholder: {
      alignItems: 'center',
      justifyContent: 'center'
    },
    itemName: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '600',
      padding: 8,
      minHeight: 43,
      textAlign: 'center',
    },
    button: {
      backgroundColor: colors.accent,
      alignItems: 'center',
      padding: 8,
      borderRadius: 8,
    },
    buttonText: {
      color: colors.buttonText,
      fontWeight: '600',
      fontSize: 16,
    },
    titleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    content: {
      padding: 20,
      gap: 18,
      paddingBottom: 110,
    },
    title: {
      fontSize: 26,
      lineHeight: 32,
      fontWeight: '600',
    },
    emptyState: {
      alignItems: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: '#ECEAE7',
      borderRadius: 18,
      paddingVertical: 36,
      paddingHorizontal: 24,
    },
    emptyIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#FBF0EC',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: '600',
    },
    muted: {
      opacity: 0.6,
      fontSize: 13,
      textAlign: 'center',
    },
    errorContainer: {
      alignItems: 'center',
      gap: 8
    },
    retryText: {
      color: '#D98E73',
      fontSize: 14,
      fontWeight: '600'
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    modalCard: {
      width: '100%',
      maxWidth: 340,
      backgroundColor: colors.background,
      borderRadius: 18,
      padding: 20,
      gap: 12,
    },
    modalTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '600',
    },
    modalMessage: {
      color: colors.mutedText,
      fontSize: 14,
      lineHeight: 20,
    },
    modalError: {
      color: colors.errorRed,
      fontSize: 13,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 4,
    },
    modalButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 8,
    },
    modalCloseButton: {
      backgroundColor: colors.button,
    },
    modalCloseText: {
      color: colors.buttonText,
      fontWeight: '600',
      fontSize: 16,
    },
    modalDeleteButton: {
      backgroundColor: colors.accent,
    },
    modalDeleteText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 16,
    },
    modalButtonDisabled: {
      opacity: 0.6,
    },
    detailsOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    detailsBackdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    detailsPopup: {
      width: '100%',
      maxWidth: 360,
      maxHeight: '85%',
      backgroundColor: colors.background,
      borderRadius: 18,
      padding: 20,
    },
    detailsHeader: {
      color: colors.text,
      fontSize: 22,
      fontWeight: 700,
      paddingBottom: 0,
    },
    detailsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
    },
    detailsLabel: {
      color: colors.mutedText,
      fontSize: 14,
      fontWeight: 300,
    },
    detailsInput: {
      color: colors.text,
      fontSize: 14,
      textAlign: 'right',
      flex: 1,
      marginLeft: 16,
      padding: 0,
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
    detailsSeparator: {
      backgroundColor: colors.border,
      height: 1, width: '100%',
      marginVertical: 10,
    },
    detailsItemsContainer: {
      backgroundColor:
      colors.mutedAccent,
      borderRadius: 16,
      paddingVertical: 8,
    },
    detailsItemsTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: 500,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    detailsError: {
      color: colors.errorRed,
      fontSize: 13,
      paddingTop: 12,
    },
    detailsButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
    },
    detailsSaveButton: {
      flex: 1,
      backgroundColor: colors.accent,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    detailsCancelButton: {
      flex: 1,
      backgroundColor: colors.surface,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    detailsButtonDisabled: {
      opacity: 0.4,
    },
  });