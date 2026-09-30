import type { OnboardingRow } from '../../../src/onboarding/onboarding-service';
import type { Profile } from '../../../src/profile/profile-service';
import { onboardingSteps } from '../onboarding/onboardingData';

export type StyleQuizStatus = 'completed' | 'not-completed' | 'in-progress' | 'not-started';

export type StyleQuizDetail = { label: string; value: string };

export type StyleQuizSummary = {
  status: StyleQuizStatus;
  title: string;
  message: string;
  /** What tapping the card does. */
  hint: string;
  /** Saved preferences to show. Only filled for a completed quiz that has saved answers. */
  details: StyleQuizDetail[];
};

// Friendly labels for the ids stored in public.onboarding, read from the quiz's own data.
const optionLabels = new Map<string, string>();
for (const step of onboardingSteps) {
  for (const section of step.sections ?? []) {
    for (const option of section.options ?? []) {
      optionLabels.set(`${section.id}:${option.id}`, option.label);
    }
  }
}

// An id the quiz no longer defines still gets a readable name instead of the raw value.
function labelFor(sectionId: string, optionId: string): string {
  return (
    optionLabels.get(`${sectionId}:${optionId}`) ??
    optionId.replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}

function labelsFor(sectionId: string, optionIds: string[] | null | undefined): string {
  return (optionIds ?? []).map((id) => labelFor(sectionId, id)).join(', ');
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * The saved preferences shown on the Profile. Height, price ranges and style no-gos are
 * stored and used elsewhere, but deliberately not shown here. Empty values are left out.
 */
function preferenceDetails(row: OnboardingRow): StyleQuizDetail[] {
  const details: StyleQuizDetail[] = [
    { label: 'Aesthetic', value: row.primary_aesthetic ? labelFor('aesthetic', row.primary_aesthetic) : '' },
    { label: 'Style keywords', value: labelsFor('style-keywords', row.style_keywords) },
    { label: 'Colours', value: labelsFor('colour', row.colour_preferences) },
    { label: 'Fit', value: labelsFor('fit', row.fit_preferences) },
    { label: 'Fashion outlook', value: labelsFor('fashion-outlook', row.fashion_outlook) },
    { label: 'Body type', value: row.body_type ? labelFor('body-type', row.body_type) : '' },
    { label: 'Top size', value: row.top_size ?? '' },
    { label: 'Bottom size', value: row.bottom_size ?? '' },
    { label: 'Dress size', value: row.dress_size ?? '' },
    { label: 'Fabric sensitivities', value: labelsFor('fabric-sensitivities', row.fabric_sensitivities) },
  ];

  return details.filter((detail) => detail.value !== '');
}

/**
 * Describe the user's style quiz for the Profile.
 *
 * `profile.onboarding_completed` is the only thing that decides whether the quiz is finished.
 * The onboarding row can exist while it is not (progress is saved after every screen), and a
 * completed profile can have no row (accounts that were marked completed without taking the quiz).
 */
export function describeStyleQuiz(
  profile: Pick<Profile, 'onboarding_completed' | 'onboarding_completed_at'>,
  row: OnboardingRow | null,
  totalSteps: number = onboardingSteps.length,
): StyleQuizSummary {
  if (profile.onboarding_completed) {
    if (!row) {
      return {
        status: 'not-completed',
        title: 'Style Quiz Not Completed',
        message: 'Take the style quiz to set up your style preferences.',
        hint: 'Tap to take the quiz.',
        details: [],
      };
    }

    const completedAt = formatDate(profile.onboarding_completed_at);
    const vibe = row.primary_aesthetic ? labelFor('aesthetic', row.primary_aesthetic) : null;

    return {
      status: 'completed',
      title: 'Your Style Quiz Results',
      message: [completedAt ? `Completed ${completedAt}` : 'Completed', vibe].filter(Boolean).join(' · '),
      hint: 'Tap to retake the quiz and update your preferences.',
      details: preferenceDetails(row),
    };
  }

  if (row) {
    // Progress only. Partial answers are never presented as results.
    const step = Math.min(Math.max(Math.trunc(row.current_step) || 0, 0), totalSteps - 1) + 1;

    return {
      status: 'in-progress',
      title: 'Style Quiz In Progress',
      message: `Step ${step} of ${totalSteps}`,
      hint: 'Tap to continue where you left off.',
      details: [],
    };
  }

  return {
    status: 'not-started',
    title: 'Style Quiz Not Started',
    message: 'Answer a few questions to personalise your recommendations.',
    hint: 'Tap to start the quiz.',
    details: [],
  };
}
