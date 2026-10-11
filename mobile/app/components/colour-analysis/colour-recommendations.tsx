import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useColourRecommendations } from '../../../src/colour-analysis/use-colour-recommendations';
import type { ColourAnalysisResult } from '../../../src/colour-analysis/types';
import { itemDetailHref } from '../../services/catalogue/catalogue-service';
import { useStyleUColors, useThemedStyles } from '../../hooks/use-theme';
import type { StyleUColors } from '../../services/styleu-theme';
import { CatalogueItemCard } from '../catalogue-item-card';

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatPrice(price: number | null) {
  if (price === null) return null;
  return Number.isInteger(price) ? `$${price}` : `$${price.toFixed(2)}`;
}

export function ColourRecommendations({ result }: { result: ColourAnalysisResult }) {
  const colors = useStyleUColors();
  const styles = useThemedStyles(createStyles);
  const recommendations = useColourRecommendations(result);

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Recommended Clothing for You</Text>
      <Text style={styles.intro}>Best matches from your palette and preferences.</Text>

      {recommendations.isLoading ? (
        <View style={styles.stateRow}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.stateText}>Finding your best matches…</Text>
        </View>
      ) : recommendations.error ? (
        <View style={styles.stateCard} accessibilityRole="alert">
          <Ionicons name="cloud-offline-outline" size={24} color={colors.errorRed} />
          <Text style={styles.stateText}>{recommendations.error}</Text>
          <Pressable onPress={recommendations.refetch} accessibilityRole="button">
            <Text style={styles.retry}>Try Again</Text>
          </Pressable>
        </View>
      ) : !recommendations.isSignedIn ? (
        <View style={styles.stateCard}>
          <Ionicons name="person-outline" size={24} color={colors.accent} />
          <Text style={styles.stateText}>Sign in to combine your colour result with your saved onboarding preferences.</Text>
        </View>
      ) : recommendations.reason === 'no-items' ? (
        <View style={styles.stateCard}>
          <Ionicons name="shirt-outline" size={24} color={colors.accent} />
          <Text style={styles.stateText}>There are no catalogue items available to recommend right now.</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
          {recommendations.items.map((recommendation) => (
            <CatalogueItemCard
              key={recommendation.item.id}
              item={recommendation.item}
              action={(
                <View style={styles.matchBadge}>
                  <Text style={styles.matchBadgeText}>{Math.round(recommendation.score * 100)}%</Text>
                </View>
              )}
              details={[
                formatPrice(recommendation.item.price),
                recommendation.matchedColour && recommendation.matchedPaletteColour
                  ? `${titleCase(recommendation.matchedColour)} · ${recommendation.matchedPaletteColour}`
                  : null,
                recommendation.matchedSize
                  ? `Size ${recommendation.matchedSize}`
                  : recommendation.item.sizes.length > 0
                    ? `Sizes: ${recommendation.item.sizes.slice(0, 3).join(', ')}`
                    : null,
              ].filter((detail): detail is string => Boolean(detail))}
              onPress={() => router.push(itemDetailHref(recommendation.item.id))}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const createStyles = (colors: StyleUColors) =>
  StyleSheet.create({
  section: { gap: 10, marginTop: 2 },
  title: { color: colors.text, fontSize: 20, lineHeight: 26, fontWeight: '600' },
  intro: { color: colors.mutedText, fontSize: 13, lineHeight: 18 },
  carousel: { gap: 12, paddingRight: 4, paddingVertical: 2 },
  stateRow: { minHeight: 82, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  stateCard: { minHeight: 100, borderRadius: 18, backgroundColor: colors.surface, padding: 16, alignItems: 'center', justifyContent: 'center', gap: 8 },
  stateText: { flexShrink: 1, color: colors.mutedText, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  retry: { color: colors.errorRed, fontSize: 14, fontWeight: '700' },
  matchBadge: { minWidth: 42, height: 26, borderRadius: 13, backgroundColor: colors.frosted, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  matchBadgeText: { color: colors.text, fontSize: 12, fontWeight: '700' },
});
