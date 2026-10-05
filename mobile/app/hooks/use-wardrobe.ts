import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { useAuth } from '../../src/auth/auth-provider';
import { fetchWardrobe } from '../services/wardrobe/wardrobe-service';
import type { WardrobeItem } from '../services/wardrobe/wardrobe-types';

type WardrobeState = {
  userId: string | null;
  data: WardrobeItem[];
  error: string | null;
  isLoading: boolean;
};

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

/**
 * The signed-in user's wardrobe items. Editing and deleting happen on the wardrobe item screen.
 *
 * Reloads whenever the screen gains focus (so edits made on the item screen show up) or the
 * signed-in user changes, and never shows one account's wardrobe to another.
 */
export function useWardrobe() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const userId = user?.id ?? null;

  const [wardrobe, setWardrobe] = useState<WardrobeState>({ userId: null, data: [], error: null, isLoading: true });
  const [reloadCount, setReloadCount] = useState(0);

  // Lets async callbacks check they still belong to the signed-in user.
  const userIdRef = useRef<string | null>(userId);
  userIdRef.current = userId;

  const loadWardrobe = useCallback(async (forUser: string) => {
    setWardrobe((previous) => ({
      userId: forUser,
      data: previous.userId === forUser ? previous.data : [],
      error: null,
      isLoading: true,
    }));
    try {
      const data = await fetchWardrobe();
      if (userIdRef.current === forUser) setWardrobe({ userId: forUser, data, error: null, isLoading: false });
    } catch (error) {
      if (userIdRef.current !== forUser) return;
      setWardrobe((previous) => ({
        userId: forUser,
        data: previous.userId === forUser ? previous.data : [],
        error: errorMessage(error, 'Unable to load your wardrobe.'),
        isLoading: false,
      }));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (userId) void loadWardrobe(userId);
      // reloadCount only exists to re-run this effect from refresh().
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, reloadCount, loadWardrobe]),
  );

  return {
    items: wardrobe.userId === userId ? wardrobe.data : [],
    // Signed out there is nothing to load, so don't spin forever.
    isLoading: userId
      ? wardrobe.isLoading && (wardrobe.userId === userId || wardrobe.userId === null)
      : isAuthLoading,
    error: wardrobe.userId === userId ? wardrobe.error : null,
    refresh: () => setReloadCount((count) => count + 1),
  };
}
