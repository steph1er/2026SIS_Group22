import { requireSupabase } from '../auth/supabase-client';

/** The quiz's answer state, keyed by section id (see onboardingHandler.ts). */
export type OnboardingAnswerMap = Record<string, string[] | string | number | boolean>;

/**
 * Index of the last onboarding screen. Screens are numbered from 0, and this matches
 * the database CHECK on public.onboarding.current_step (0 to 4).
 */
export const LAST_ONBOARDING_STEP = 4;

/** A row of public.onboarding. `user_id` is auth.users.id. It is NOT profiles.id. */
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
  /** Furthest screen reached (0 to 4). Only meaningful while onboarding is not completed. */
  current_step: number;
  updated_at: string;
};

/** What the quiz layout needs to tell the restore logic (kept out of here so this file does not import app code). */
export type OnboardingLayout = {
  /** Index of the price-range screen. A NULL price only means "skipped" once this screen has been passed. */
  priceStepIndex: number;
  priceFields: { id: string; min: number; max: number }[];
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

/** Keep a step inside 0..LAST_ONBOARDING_STEP, the range the database accepts. */
export function clampOnboardingStep(step: number): number {
  if (!Number.isFinite(step)) return 0;
  return Math.min(Math.max(Math.trunc(step), 0), LAST_ONBOARDING_STEP);
}

/** Translate the quiz's UI answer state into an onboarding table row for one user. */
export function buildOnboardingRow(
  userId: string,
  answers: OnboardingAnswerMap,
  currentStep: number,
): OnboardingRow {
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

    current_step: clampOnboardingStep(currentStep),
    updated_at: new Date().toISOString(),
  };
}

/**
 * The inverse of buildOnboardingRow: rebuild the quiz's answer state from a saved row.
 *
 * Empty values are left out so the quiz treats them as unanswered. A NULL price is
 * ambiguous (unanswered or skipped), so it only becomes "skipped" once the saved
 * current_step shows the price screen has already been passed.
 */
export function answersFromRow(row: OnboardingRow, layout: OnboardingLayout): OnboardingAnswerMap {
  const answers: OnboardingAnswerMap = {};

  const putText = (key: string, value: string | null | undefined) => {
    if (value) answers[key] = value;
  };
  const putList = (key: string, value: string[] | null | undefined) => {
    if (value && value.length > 0) answers[key] = [...value];
  };

  putText('aesthetic', row.primary_aesthetic);
  putList('style-keywords', row.style_keywords);

  putList('colour', row.colour_preferences);
  putList('fit', row.fit_preferences);
  putList('fashion-outlook', row.fashion_outlook);
  putList('style-no-gos', row.style_no_gos);

  if (row.prefer_not_say_height) {
    answers['height:skip'] = true;
  } else if (row.height_cm !== null && row.height_cm !== undefined) {
    answers['height'] = Number(row.height_cm);
  }
  putText('body-type', row.body_type);
  putText('typical-sizing:tops', row.top_size);
  putText('typical-sizing:bottoms', row.bottom_size);
  putText('typical-sizing:dresses', row.dress_size);
  putList('fabric-sensitivities', row.fabric_sensitivities);

  const columns = row as unknown as Record<string, unknown>;
  const pricesPassed = row.current_step > layout.priceStepIndex;

  for (const field of layout.priceFields) {
    const min = columns[`${field.id}_min_price`];
    const max = columns[`${field.id}_max_price`];

    if (min !== null && min !== undefined && max !== null && max !== undefined) {
      answers[`price-range:${field.id}:min`] = Number(min);
      answers[`price-range:${field.id}:max`] = Number(max);
    } else if (pricesPassed) {
      answers[`price-range:${field.id}:skip`] = true;
    }
  }

  // "Any price" is not stored. It is what the quiz shows when every category is at its full range.
  const isAnyPrice =
    layout.priceFields.length > 0 &&
    layout.priceFields.every(
      (field) =>
        answers[`price-range:${field.id}:min`] === field.min && answers[`price-range:${field.id}:max`] === field.max,
    );
  if (isAnyPrice) answers['price-range:anyPrice'] = true;

  return answers;
}

/**
 * Load the onboarding row whose user_id is the given auth.users.id. Returns null when the
 * user has none. A row can exist while onboarding is incomplete, so its existence does NOT
 * mean onboarding is finished: only profiles.onboarding_completed says that.
 */
export async function fetchOnboardingRow(userId: string): Promise<OnboardingRow | null> {
  const { data, error } = await requireSupabase()
    .from('onboarding')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as OnboardingRow | null) ?? null;
}

/** What a user's onboarding looks like right now, for both the profile and the answers table. */
export type OnboardingState = {
  /** profiles.onboarding_completed, the only authoritative completion flag. */
  isCompleted: boolean;
  /** The user's onboarding row, if any. Its existence does NOT mean onboarding is complete. */
  row: OnboardingRow | null;
};

/**
 * Load the signed-in user's onboarding state. `userId` is auth.users.id and is matched
 * against profiles.user_id and onboarding.user_id (never profiles.id). Throws on any
 * failure or unreadable completion flag, so callers never start a blank quiz by mistake.
 */
export async function fetchOnboardingState(userId: string): Promise<OnboardingState> {
  const [profile, row] = await Promise.all([
    requireSupabase().from('profiles').select('onboarding_completed').eq('user_id', userId).maybeSingle(),
    fetchOnboardingRow(userId),
  ]);

  if (profile.error) throw new Error(profile.error.message);
  if (!profile.data) throw new Error('Your profile could not be found.');
  if (typeof profile.data.onboarding_completed !== 'boolean') {
    throw new Error('Your onboarding status could not be read.');
  }

  return { isCompleted: profile.data.onboarding_completed, row };
}

/** Where the quiz should start and whether it should save as the user goes. */
export type OnboardingProgress = {
  initialAnswers: OnboardingAnswerMap;
  initialStep: number;
  /** Save after each screen. False for a completed user's retake, which saves only at Finish. */
  persistProgress: boolean;
};

/**
 * Decide the quiz's starting point.
 *
 * - Incomplete user with a saved row: restore the answers and resume at current_step.
 * - Incomplete user with no row: blank, from screen 1, saving as they go.
 * - Completed user (retake): blank, from screen 1, and no intermediate saving, so a
 *   half-finished retake can never overwrite the answers they already completed.
 */
export function resolveOnboardingProgress(state: OnboardingState, layout: OnboardingLayout): OnboardingProgress {
  if (state.isCompleted) return { initialAnswers: {}, initialStep: 0, persistProgress: false };
  if (!state.row) return { initialAnswers: {}, initialStep: 0, persistProgress: true };

  return {
    initialAnswers: answersFromRow(state.row, layout),
    initialStep: clampOnboardingStep(state.row.current_step),
    persistProgress: true,
  };
}

/**
 * Save the answers and progress to public.onboarding. Upserting on the unique user_id
 * keeps a single row per user. RLS requires auth.uid() = user_id, so this only works
 * for the signed-in user's own row. This never touches profiles.onboarding_completed.
 */
export async function saveOnboardingProgress(
  userId: string,
  answers: OnboardingAnswerMap,
  currentStep: number,
): Promise<void> {
  const { error } = await requireSupabase()
    .from('onboarding')
    .upsert(buildOnboardingRow(userId, answers, currentStep), { onConflict: 'user_id' });

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
 * Finish onboarding: save the answers (with the latest progress) first, and only once
 * that succeeds mark the profile completed. If either step fails this throws, so callers
 * must not navigate on failure. If only the second step fails, the saved progress means
 * the user can resume from the furthest screen. Both steps are safe to retry.
 */
export async function completeOnboarding(
  userId: string,
  answers: OnboardingAnswerMap,
  currentStep: number,
): Promise<void> {
  await saveOnboardingProgress(userId, answers, currentStep);
  await markOnboardingCompleted(userId);
}
