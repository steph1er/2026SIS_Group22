import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../primary-button';
import type { ColourAnalysisResult, ColourSwatch } from '../../../src/colour-analysis/types';
import { useThemedStyles } from '../../hooks/use-theme';
import type { StyleUColors } from '../../services/styleu-theme';
import { ColourRecommendations } from './colour-recommendations';

type Props = {
  result: ColourAnalysisResult;
  onStartAgain: () => void;
  actionLabel?: string;
};

function Swatches({ colours }: { colours: ColourSwatch[] }) {
  const styles = useThemedStyles(createStyles);
  return <View style={styles.swatchGrid}>{colours.map((colour) => (
    <View key={`${colour.name}-${colour.hex}`} style={styles.swatchItem}>
      <View style={[styles.swatch, { backgroundColor: colour.hex }]} />
      <Text style={styles.swatchName}>{colour.name}</Text>
    </View>
  ))}</View>;
}

export function ColourAnalysisResultView({
  result,
  onStartAgain,
  actionLabel = 'Try Another Photo',
}: Props) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>YOUR COLOUR SEASON</Text>
        <Text style={styles.season}>{result.season}</Text>
        <View style={styles.confidencePill}>
          <Text style={styles.estimate}>{Math.round(result.confidence * 100)}% confidence · Estimate</Text>
        </View>
        <View style={styles.characteristicsRow}>
          {[
            ['Undertone', result.undertone],
            ['Depth', result.characteristics.depth],
            ['Chroma', result.characteristics.chroma],
          ].map(([label, value], index) => (
            <View key={label} style={styles.characteristicGroup}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <View style={styles.characteristic}>
                <Text style={styles.characteristicLabel}>{label}</Text>
                <Text style={styles.characteristicValue}>{value}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      <Text style={styles.sectionTitle}>Best Colours</Text>
      <Swatches colours={result.palette} />
      <Text style={styles.secondarySectionTitle}>Colours to Avoid</Text>
      <Swatches colours={result.avoidColours} />
      <View style={styles.suggestionCard}>
        <Text style={styles.suggestionTitle}>Styling Suggestions</Text>
        <Text style={styles.suggestionText}>{result.explanation}</Text>
      </View>
      <ColourRecommendations result={result} />
      <Text style={styles.disclaimer}>Photo-based styling estimate, not a scientific assessment.</Text>
      <PrimaryButton compact label={actionLabel} onPress={onStartAgain} />
    </View>
  );
}

const createStyles = (colors: StyleUColors) =>
  StyleSheet.create({
  container: { gap: 18, paddingBottom: 28 },
  heroCard: { backgroundColor: colors.accentSoft, borderRadius: 18, padding: 20, alignItems: 'center' },
  eyebrow: { color: colors.mutedText, fontSize: 11, fontWeight: '600', letterSpacing: 0.7 },
  season: { color: colors.text, fontSize: 30, lineHeight: 36, fontWeight: '600', marginTop: 3, textAlign: 'center' },
  confidencePill: { backgroundColor: 'rgba(255,255,255,0.72)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8 },
  estimate: { color: colors.mutedText, fontSize: 11, lineHeight: 15, textAlign: 'center' },
  characteristicsRow: { flexDirection: 'row', width: '100%', marginTop: 18, alignItems: 'center' },
  characteristicGroup: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  characteristic: { flex: 1, alignItems: 'center' },
  characteristicLabel: { color: colors.mutedText, fontSize: 11, fontWeight: '500' },
  characteristicValue: { color: colors.text, fontSize: 14, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  divider: { width: 1, height: 34, backgroundColor: colors.border },
  sectionTitle: { color: colors.text, fontSize: 20, lineHeight: 26, fontWeight: '600' },
  secondarySectionTitle: { color: colors.text, fontSize: 19, lineHeight: 25, fontWeight: '600', marginTop: 2 },
  swatchGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5, rowGap: 14 },
  swatchItem: { width: '25%', alignItems: 'center', paddingHorizontal: 5 },
  swatch: { width: 60, height: 60, borderRadius: 30, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(0,0,0,0.14)' },
  swatchName: { color: colors.mutedText, fontSize: 11, lineHeight: 15, textAlign: 'center', marginTop: 5 },
  suggestionCard: { backgroundColor: colors.surface, borderRadius: 18, padding: 16, marginTop: 2 },
  suggestionTitle: { color: colors.text, fontSize: 16, lineHeight: 22, fontWeight: '600', marginBottom: 5 },
  suggestionText: { color: colors.mutedText, fontSize: 14, lineHeight: 20 },
  disclaimer: { color: colors.mutedText, fontSize: 11, lineHeight: 16, textAlign: 'center' },
});
