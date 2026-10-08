import { StyleSheet } from 'react-native';
import { StyleUTokens } from '../../styleu-theme';

const { colors } = StyleUTokens;

export const catalogueStyles = StyleSheet.create ({
  catalogueContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 300,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '92%',
  },

  dragHandle: {
    width: '20%',
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginVertical: 10,
    backgroundColor: colors.placeholder,
  },

  dragHandleHitbox: {
    paddingVertical: 1,
    alignItems: 'center',
  },

  categoryContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
  },

  categoryButton: {
    backgroundColor: colors.button,
    paddingVertical: 8,
    borderRadius: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    alignSelf: 'center',
  },

  categoryButtonText: {
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: '500',
  },

  categorySelected: {
    backgroundColor: colors.text,
  },

  categorySelectedText: {
    color: colors.background,
  },

  catalogueToggleContainer: {
    alignSelf: 'center',
    backgroundColor: colors.mutedAccentContent,
    height: 42,
    borderRadius: 20,
    width: '80%',
    flexDirection: 'row',
    padding: 4,
    alignItems: 'center',
    position: 'relative',
  },

  catalogueToggleActive: {
    position: 'absolute',
    left: 4,
    top: 4,
    bottom: 4,
    width: '50%',
    backgroundColor: colors.background,
    borderRadius: 20,
  },

  catalogueToggleButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },

  suggestedContainer: {
    backgroundColor: colors.mutedAccent,
    width: '90%',
    alignSelf: 'center',
    borderRadius: 16,
    paddingVertical: 8,
  },

  suggestionText: {
    color: colors.mutedText,
    fontSize: 16,
    fontWeight: 500,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },

  emptyText: {
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: 300,
    paddingVertical: 20,
    alignSelf: 'center',
  },

  suggestedItemsGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom:6,
  },

  itemCard: {
    width: 100,
    backgroundColor: colors.mutedBackground,
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

  itemName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    padding: 8,
    minHeight: 43,
    textAlign: 'center',
  },

  scrollContent: {
    paddingBottom: '75%',
    gap: 12,
  },

  wardrobeItemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '90%',
    alignSelf: 'center',
  },

  wardrobeContainer: {
    width: '100%',
  },
})