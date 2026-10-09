import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '../auth/auth-provider';
import {
  fetchOnboardingState,
  type OnboardingLayout,
  type OnboardingProgress,
  resolveOnboardingProgress,
} from './onboarding-service';

type LoadResult = {
  userId: string;
  progress: OnboardingProgress | null;
  error: string | null;
};

/**
 * Load where the signed-in user's onboarding should start: restored answers and screen for an
 * unfinished user, or a blank quiz. While loading, and after a failure, `progress` is null, so
 * callers never start a blank quiz that a later save could use to overwrite saved answers.
 *
 * The result is tagged with the user it was loaded for, so another account never sees it.
 */
export function useOnboardingProgress(layout: OnboardingLayout) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [result, setResult] = useState<LoadResult | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    fetchOnboardingState(userId)
      .then((state) => {
        if (!cancelled) {
          setResult({ userId, progress: resolveOnboardingProgress(state, layout), error: null });
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error('Unable to load onboarding progress:', error);
        setResult({
          userId,
          progress: null,
          error: error instanceof Error ? error.message : 'Unable to load your onboarding progress.',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [userId, layout, attempt]);

  const retry = useCallback(() => {
    setResult(null);
    setAttempt((count) => count + 1);
  }, []);

  const current = result !== null && result.userId === userId ? result : null;

  return {
    progress: current?.progress ?? null,
    error: current?.error ?? null,
    isLoading: current === null,
    retry,
  };
}
