import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useAuth } from '../auth/auth-provider';
import { getColourAnalysis } from './colour-analysis-storage';
import type { ColourAnalysisResult } from './types';

type LoadState = {
  userId: string;
  result: ColourAnalysisResult | null;
  error: string | null;
};

/** Account-scoped saved analysis that refreshes whenever its screen regains focus. */
export function useSavedColourAnalysis() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const userId = user?.id ?? null;
  const [loadState, setLoadState] = useState<LoadState | null>(null);
  const [reloadCount, setReloadCount] = useState(0);
  const current = loadState?.userId === userId ? loadState : null;

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      let cancelled = false;

      getColourAnalysis(userId)
        .then((result) => {
          if (!cancelled) setLoadState({ userId, result, error: null });
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          setLoadState({
            userId,
            result: null,
            error: error instanceof Error ? error.message : 'Unable to load your colour analysis.',
          });
        });

      return () => {
        cancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps -- reloadCount explicitly requests a reload
    }, [userId, reloadCount]),
  );

  return {
    result: current?.result ?? null,
    error: current?.error ?? null,
    isLoading: isAuthLoading || (userId !== null && current === null),
    isSignedIn: Boolean(userId),
    refetch: useCallback(() => setReloadCount((count) => count + 1), []),
  };
}
