import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../primary-button';
import { StyleUTokens } from '../../services/styleu-theme';
import type { ColourAnalysisResult, ColourSwatch } from '../../../src/colour-analysis/types';
import { ColourRecommendations } from './colour-recommendations';

type Props = {
  result: ColourAnalysisResult;
  onStartAgain: () => void;
  actionLabel?: string;
};

function Swatches({ colours }: { colours: ColourSwatch[] }) {
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
  actionLabel = 'Analyse Another Photo',
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>YOUR COLOUR SEASON</Text>
        <Text style={styles.season}>{result.season}</Text>
        <Text style={styles.estimate}>{Math.round(result.confidence * 100)}% image confidence · estimated recommendation</Text>
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
      <Text style={styles.sectionIntro}>Use these shades near your face for the most harmonious effect.</Text>
      <Swatches colours={result.palette} />
      <Text style={styles.sectionTitle}>Colours to Avoid</Text>
      <Text style={styles.sectionIntro}>These shades may be harder to wear close to your face.</Text>
      <Swatches colours={result.avoidColours} />
      <View style={styles.suggestionCard}>
        <Text style={styles.suggestionTitle}>Styling Suggestions</Text>
        <Text style={styles.suggestionText}>{result.explanation}</Text>
      </View>
      <ColourRecommendations result={result} />
      <Text style={styles.disclaimer}>{result.disclaimer}</Text>
      <PrimaryButton label={actionLabel} onPress={onStartAgain} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14, paddingBottom: 28 },
  heroCard: { backgroundColor: '#FBF0EC', borderRadius: 24, padding: 22, alignItems: 'center', marginBottom: 8 },
  eyebrow: { color: StyleUTokens.colors.mutedText, fontSize: 12, fontWeight: '800', letterSpacing: 1.1 },
  season: { color: StyleUTokens.colors.text, fontSize: 34, lineHeight: 42, fontWeight: '700', marginTop: 4, textAlign: 'center' },
  estimate: { color: StyleUTokens.colors.mutedText, fontSize: 12, marginTop: 3, textAlign: 'center' },
  characteristicsRow: { flexDirection: 'row', width: '100%', marginTop: 22, alignItems: 'center' },
  characteristicGroup: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  characteristic: { flex: 1, alignItems: 'center' },
  characteristicLabel: { color: StyleUTokens.colors.mutedText, fontSize: 11, fontWeight: '600' },
  characteristicValue: { color: StyleUTokens.colors.text, fontSize: 14, fontWeight: '700', marginTop: 3, textAlign: 'center' },
  divider: { width: 1, height: 34, backgroundColor: StyleUTokens.colors.border },
  sectionTitle: { color: StyleUTokens.colors.text, fontSize: 22, fontWeight: '700', marginTop: 8 },
  sectionIntro: { color: StyleUTokens.colors.mutedText, fontSize: 14, lineHeight: 20, marginTop: -8 },
  swatchGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5, rowGap: 14 },
  swatchItem: { width: '25%', alignItems: 'center', paddingHorizontal: 5 },
  swatch: { width: 58, height: 58, borderRadius: 29, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(0,0,0,0.16)' },
  swatchName: { color: StyleUTokens.colors.text, fontSize: 11, lineHeight: 15, textAlign: 'center', marginTop: 6 },
  suggestionCard: { backgroundColor: StyleUTokens.colors.surface, borderRadius: 20, padding: 18, marginTop: 8 },
  suggestionTitle: { color: StyleUTokens.colors.text, fontSize: 17, fontWeight: '700', marginBottom: 7 },
  suggestionText: { color: StyleUTokens.colors.mutedText, fontSize: 14, lineHeight: 21 },
  disclaimer: { color: StyleUTokens.colors.mutedText, fontSize: 12, lineHeight: 18, textAlign: 'center', marginBottom: 4 },
});
