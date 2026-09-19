import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useAuth } from '../auth/auth-provider';
import { fetchProfile, type Profile, type ProfileUpdate, updateProfile } from './profile-service';

type ProfileResult = {
  userId: string;
  profile: Profile | null;
  error: string | null;
};

/**
 * The signed-in user's profile, looked up by profiles.user_id = auth user id.
 *
 * Every result remembers which user it was loaded for and is only exposed
 * while that user is still signed in, so switching accounts can never show the
 * previous account's profile, even for a single render.
 */
export function useProfile() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const userId = user?.id ?? null;

  const [result, setResult] = useState<ProfileResult | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  const current = result !== null && result.userId === userId ? result : null;

  // Refetch whenever the screen gains focus, the user changes, or refetch() is called.
  useFocusEffect(
    useCallback(() => {
      if (!userId) return;

      let cancelled = false;

      fetchProfile(userId)
        .then((profile) => {
          if (!cancelled) setResult({ userId, profile, error: null });
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          const message = error instanceof Error ? error.message : 'Unable to load your profile.';
          // Keep any profile already loaded for this same user; never carry over another user's.
          setResult((previous) => ({
            userId,
            profile: previous?.userId === userId ? previous.profile : null,
            error: message,
          }));
        });

      return () => {
        cancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps -- reloadCount only exists to re-run this effect
    }, [userId, reloadCount]),
  );

  const refetch = useCallback(() => setReloadCount((count) => count + 1), []);

  /** Save changes to the signed-in user's own profile row and show the saved values. */
  const update = useCallback(
    async (changes: ProfileUpdate) => {
      if (!userId) throw new Error('You must be signed in to update your profile.');

      const saved = await updateProfile(userId, changes);
      // Ignore the save result if a different account became active while it was in flight.
      setResult((previous) =>
        previous && previous.userId !== userId ? previous : { userId, profile: saved, error: null },
      );
    },
    [userId],
  );

  return {
    user,
    profile: current?.profile ?? null,
    error: current?.error ?? null,
    isLoading: isAuthLoading || (userId !== null && current === null),
    refetch,
    update,
  };
}
