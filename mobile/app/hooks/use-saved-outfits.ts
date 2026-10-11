import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { useAuth } from '../../src/auth/auth-provider';
import { fetchSavedOutfits, type SavedOutfit } from '../services/saved-outfits/saved-outfits-service';

type SavedOutfitsState = {
  userId: string | null;
  data: SavedOutfit[];
  error: string | null;
  isLoading: boolean;
};

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useSavedOutfits() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const userId = user?.id ?? null;

  const [state, setState] = useState<SavedOutfitsState>({ userId: null, data: [], error: null, isLoading: true });
  const [reloadCount, setReloadCount] = useState(0);

  const userIdRef = useRef<string | null>(userId);
  userIdRef.current = userId;

  const loadOutfits = useCallback(async (forUser: string) => {
    setState((previous) => ({
      userId: forUser,
      data: previous.userId === forUser ? previous.data : [],
      error: null,
      isLoading: true,
    }));
    try {
      const data = await fetchSavedOutfits();
      if (userIdRef.current === forUser) setState({ userId: forUser, data, error: null, isLoading: false });
    } catch (error) {
      if (userIdRef.current !== forUser) return;
      setState((previous) => ({
        userId: forUser,
        data: previous.userId === forUser ? previous.data : [],
        error: errorMessage(error, 'Unable to load your outfits.'),
        isLoading: false,
      }));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (userId) void loadOutfits(userId);
    }, [userId, reloadCount, loadOutfits]),
  );

  return {
    outfits: state.userId === userId ? state.data : [],
    isLoading: userId
      ? state.isLoading && (state.userId === userId || state.userId === null)
      : isAuthLoading,
    error: state.userId === userId ? state.error : null,
    refresh: () => setReloadCount((count) => count + 1),
  };
}