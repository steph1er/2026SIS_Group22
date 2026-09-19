import { requireSupabase } from '../auth/supabase-client';

/** The quiz's answer state, keyed by section id (see onboardingHandler.ts). */
export type OnboardingAnswerMap = Record<string, string[] | string | number | boolean>;

/**
 * A row of public.onboarding.
 *
 * `user_id` is the authenticated user's ID (auth.users.id). It is NOT profiles.id.
 * Column types are assumed: text[] for multi-select answers, text for
 * single-select answers and sizes, numeric/integer for height and prices.
 */
export type OnboardingRow = {
  user_id: string;
  primary_aesthetic: string | null;
  style_keywords: string[];
  colour_preferences: string[];
  fit_preferences: string[];
  fashion_outlook: string[];
  style_no_gos: string[];
  height_cm: number | null;
  prefer_not_say_height: boolean;
  body_type: string | null;
  top_size: string | null;
  bottom_size: string | null;
  dress_size: string | null;
  fabric_sensitivities: string[];
  tops_min_price: number | null;
  tops_max_price: number | null;
  bottoms_min_price: number | null;
  bottoms_max_price: number | null;
  dresses_min_price: number | null;
  dresses_max_price: number | null;
  outerwear_min_price: number | null;
  outerwear_max_price: number | null;
  accessories_min_price: number | null;
  accessories_max_price: number | null;
  updated_at: string;
};

function text(value: OnboardingAnswerMap[string] | undefined): string | null {
  return typeof value === 'string' && value !== '' ? value : null;
}

function list(value: OnboardingAnswerMap[string] | undefined): string[] {
  return Array.isArray(value) ? value : [];
}

// Rounded so the value is valid for both integer and numeric columns.
function whole(value: OnboardingAnswerMap[string] | undefined): number | null {
  return typeof value === 'number' ? Math.round(value) : null;
}

/** Translate the quiz's UI answer state into an onboarding table row for one user. */
export function buildOnboardingRow(userId: string, answers: OnboardingAnswerMap): OnboardingRow {
  const heightSkipped = Boolean(answers['height:skip']);

  // A skipped price range (or one never set) is stored as NULL.
  const price = (category: string, bound: 'min' | 'max') =>
    answers[`price-range:${category}:skip`] ? null : whole(answers[`price-range:${category}:${bound}`]);

  return {
    user_id: userId,

    primary_aesthetic: text(answers['aesthetic']),
    style_keywords: list(answers['style-keywords']),

    colour_preferences: list(answers['colour']),
    fit_preferences: list(answers['fit']),
    fashion_outlook: list(answers['fashion-outlook']),
    style_no_gos: list(answers['style-no-gos']),

    height_cm: heightSkipped ? null : whole(answers['height']),
    prefer_not_say_height: heightSkipped,
    body_type: text(answers['body-type']),
    top_size: text(answers['typical-sizing:tops']),
    bottom_size: text(answers['typical-sizing:bottoms']),
    dress_size: text(answers['typical-sizing:dresses']),
    fabric_sensitivities: list(answers['fabric-sensitivities']),

    tops_min_price: price('tops', 'min'),
    tops_max_price: price('tops', 'max'),
    bottoms_min_price: price('bottoms', 'min'),
    bottoms_max_price: price('bottoms', 'max'),
    dresses_min_price: price('dresses', 'min'),
    dresses_max_price: price('dresses', 'max'),
    outerwear_min_price: price('outerwear', 'min'),
    outerwear_max_price: price('outerwear', 'max'),
    accessories_min_price: price('accessories', 'min'),
    accessories_max_price: price('accessories', 'max'),

    updated_at: new Date().toISOString(),
  };
}

/**
 * Save the answers to public.onboarding. Upserting on the unique user_id keeps
 * a single row per user. RLS requires auth.uid() = user_id, so this only works
 * for the signed-in user's own row.
 */
async function saveOnboardingAnswers(userId: string, answers: OnboardingAnswerMap): Promise<void> {
  const { error } = await requireSupabase()
    .from('onboarding')
    .upsert(buildOnboardingRow(userId, answers), { onConflict: 'user_id' });

  if (error) throw new Error(error.message);
}

/**
 * Mark the profile whose user_id is the given auth.users.id as onboarded.
 * Only a profile that is not yet completed is changed, so an existing
 * onboarding_completed_at is never overwritten (for example on a quiz retake).
 */
async function markOnboardingCompleted(userId: string): Promise<void> {
  const supabase = requireSupabase();

  const { data, error } = await supabase
    .from('profiles')
    .update({ onboarding_completed: true, onboarding_completed_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('onboarding_completed', false)
    .select('id');

  if (error) throw new Error(error.message);
  if (data.length > 0) return;

  // No row changed: either it was already completed (fine) or no profile is visible (not fine).
  const { data: profile, error: readError } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('user_id', userId)
    .maybeSingle();

  if (readError) throw new Error(readError.message);
  if (!profile) throw new Error('Your profile could not be found.');
}

/**
 * Finish onboarding: save the answers first, and only once that succeeds mark
 * the profile completed. If either step fails this throws, so callers must not
 * navigate on failure. Both steps are safe to retry.
 */
export async function completeOnboarding(userId: string, answers: OnboardingAnswerMap): Promise<void> {
  await saveOnboardingAnswers(userId, answers);
  await markOnboardingCompleted(userId);
}
