import { requireSupabase } from '../auth/supabase-client';
import type { ColourAnalysisResult, ColourSwatch } from './types';

type ColourAnalysisRow = {
  id: string;
  user_id: string;
  season: string;
  undertone: ColourAnalysisResult['undertone'];
  skin_colour: string;
  confidence: number;
  palette: unknown;
  avoid_colours: unknown;
  characteristics: unknown;
  explanation: string;
  disclaimer: string;
  created_at: string;
  updated_at: string;
};

const SELECT_COLUMNS =
  'id, user_id, season, undertone, skin_colour, confidence, palette, avoid_colours, characteristics, explanation, disclaimer, created_at, updated_at';

function isSwatch(value: unknown): value is ColourSwatch {
  if (!value || typeof value !== 'object') return false;
  const swatch = value as Partial<ColourSwatch>;
  return typeof swatch.name === 'string' && typeof swatch.hex === 'string';
}

function readSwatches(value: unknown, field: string): ColourSwatch[] {
  if (!Array.isArray(value) || !value.every(isSwatch)) {
    throw new Error(`Your saved ${field} data is invalid. Please redo your colour analysis.`);
  }
  return value;
}

function readCharacteristics(value: unknown): ColourAnalysisResult['characteristics'] {
  if (!value || typeof value !== 'object') {
    throw new Error('Your saved colour characteristics are invalid. Please redo your colour analysis.');
  }
  const characteristics = value as Partial<ColourAnalysisResult['characteristics']>;
  if (
    typeof characteristics.depth !== 'string' ||
    typeof characteristics.chroma !== 'string' ||
    typeof characteristics.contrast !== 'string' ||
    typeof characteristics.lightness !== 'number' ||
    typeof characteristics.hue !== 'number' ||
    typeof characteristics.saturation !== 'number' ||
    !characteristics.lab ||
    typeof characteristics.lab.lightness !== 'number' ||
    typeof characteristics.lab.a !== 'number' ||
    typeof characteristics.lab.b !== 'number'
  ) {
    throw new Error('Your saved colour characteristics are incomplete. Please redo your colour analysis.');
  }
  return characteristics as ColourAnalysisResult['characteristics'];
}

function hexToRgb(hex: string): [number, number, number] {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!match) throw new Error('Your saved skin colour is invalid. Please redo your colour analysis.');
  return [Number.parseInt(match[1], 16), Number.parseInt(match[2], 16), Number.parseInt(match[3], 16)];
}

function rowToResult(row: ColourAnalysisRow): ColourAnalysisResult {
  return {
    season: row.season,
    undertone: row.undertone,
    skinColour: { hex: row.skin_colour, rgb: hexToRgb(row.skin_colour) },
    confidence: Number(row.confidence),
    palette: readSwatches(row.palette, 'recommended palette'),
    avoidColours: readSwatches(row.avoid_colours, 'avoid colours'),
    characteristics: readCharacteristics(row.characteristics),
    explanation: row.explanation,
    disclaimer: row.disclaimer,
  };
}

/** Load the one colour analysis belonging to the given auth.users.id. */
export async function getColourAnalysis(userId: string): Promise<ColourAnalysisResult | null> {
  const { data, error } = await requireSupabase()
    .from('colour_analysis')
    .select(SELECT_COLUMNS)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowToResult(data as ColourAnalysisRow) : null;
}

/**
 * Store the exact result displayed by the app. The unique user_id plus upsert means
 * a later analysis replaces the account's previous current result.
 */
export async function saveColourAnalysis(userId: string, result: ColourAnalysisResult): Promise<void> {
  const { error } = await requireSupabase()
    .from('colour_analysis')
    .upsert(
      {
        user_id: userId,
        season: result.season,
        undertone: result.undertone,
        skin_colour: result.skinColour.hex,
        confidence: result.confidence,
        palette: result.palette,
        avoid_colours: result.avoidColours,
        characteristics: result.characteristics,
        explanation: result.explanation,
        disclaimer: result.disclaimer,
      },
      { onConflict: 'user_id' },
    );

  if (error) throw new Error(error.message);
}
