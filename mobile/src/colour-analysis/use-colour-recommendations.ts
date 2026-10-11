import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { useAuth } from '../auth/auth-provider';
import {
  getColourRecommendations,
  type ColourRecommendationReason,
  type ColourRecommendation,
} from './colour-recommendation-service';
import type { ColourAnalysisResult } from './types';

type LoadState = {
  key: string;
  items: ColourRecommendation[];
  reason: ColourRecommendationReason;
  error: string | null;
};

export function useColourRecommendations(result: ColourAnalysisResult) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const userId = user?.id ?? null;
  const paletteKey = useMemo(
    () => result.palette.map((colour) => `${colour.name}:${colour.hex}`).join('|'),
    [result.palette],
  );
  const requestKey = userId ? `${userId}:${paletteKey}` : 'guest';
  const [loadState, setLoadState] = useState<LoadState | null>(null);
  const [reloadCount, setReloadCount] = useState(0);
  const current = loadState?.key === requestKey ? loadState : null;

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      let cancelled = false;
      setLoadState(null);
      getColourRecommendations(userId, result)
        .then(({ items, reason }) => {
          if (!cancelled) setLoadState({ key: requestKey, items, reason, error: null });
        })
        .catch((error: unknown) => {
          if (!cancelled) {
            setLoadState({
              key: requestKey,
              items: [],
              reason: null,
              error: error instanceof Error ? error.message : 'Unable to load clothing recommendations.',
            });
          }
        });
      return () => { cancelled = true; };
      // reloadCount intentionally triggers another database read.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, requestKey, result, reloadCount]),
  );

  return {
    items: current?.items ?? [],
    reason: userId ? current?.reason ?? null : null,
    error: current?.error ?? null,
    isLoading: isAuthLoading || (Boolean(userId) && current === null),
    isSignedIn: Boolean(userId),
    refetch: useCallback(() => setReloadCount((count) => count + 1), []),
  };
}
