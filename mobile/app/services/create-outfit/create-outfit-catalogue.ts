import { StyleSheet } from 'react-native';
import { StyleUTokens } from '../styleu-theme';

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

  suggestedItemsGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom:6,
  },

  itemCard: {
    width: 100,
    backgroundColor: colors.backgroundElement,
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
    paddingBottom: 100,
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