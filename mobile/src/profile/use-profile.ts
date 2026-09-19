import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useAuth } from '../auth/auth-provider';
import { fetchOnboardingRow, type OnboardingRow } from '../onboarding/onboarding-service';
import { fetchProfile, type Profile, type ProfileUpdate, updateProfile } from './profile-service';

type ProfileResult = {
  userId: string;
  profile: Profile | null;
  onboarding: OnboardingRow | null;
  error: string | null;
};

type UseProfileOptions = {
  /** Also load the user's onboarding row. Off by default, so screens that don't need it don't query it. */
  includeOnboarding?: boolean;
};

/**
 * The signed-in user's profile, looked up by profiles.user_id = auth user id. With
 * `includeOnboarding`, their onboarding row is loaded alongside it (onboarding.user_id =
 * auth user id), so the two always describe the same user at the same moment.
 *
 * Every result remembers which user it was loaded for and is only exposed
 * while that user is still signed in, so switching accounts can never show the
 * previous account's profile, even for a single render.
 *
 * `onboarding` is only the row, or null when the user has none. Whether onboarding is
 * finished comes from `profile.onboarding_completed`, never from the row existing.
 */
export function useProfile({ includeOnboarding = false }: UseProfileOptions = {}) {
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

      const load: Promise<[Profile | null, OnboardingRow | null]> = includeOnboarding
        ? Promise.all([fetchProfile(userId), fetchOnboardingRow(userId)])
        : fetchProfile(userId).then((profile) => [profile, null]);

      load
        .then(([profile, onboarding]) => {
          if (!cancelled) setResult({ userId, profile, onboarding, error: null });
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          const message = error instanceof Error ? error.message : 'Unable to load your profile.';
          setResult((previous) => ({
            userId,
            // Never carry over another user's profile. With onboarding requested, a failed refresh also
            // drops the previous results, so stale quiz details are never shown next to an error.
            profile: !includeOnboarding && previous?.userId === userId ? previous.profile : null,
            onboarding: null,
            error: message,
          }));
        });

      return () => {
        cancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps -- reloadCount only exists to re-run this effect
    }, [userId, includeOnboarding, reloadCount]),
  );

  const refetch = useCallback(() => setReloadCount((count) => count + 1), []);

  /** Save changes to the signed-in user's own profile row and show the saved values. */
  const update = useCallback(
    async (changes: ProfileUpdate) => {
      if (!userId) throw new Error('You must be signed in to update your profile.');

      const saved = await updateProfile(userId, changes);
      // Ignore the save result if a different account became active while it was in flight.
      setResult((previous) =>
        previous && previous.userId !== userId
          ? previous
          : { userId, profile: saved, onboarding: previous?.onboarding ?? null, error: null },
      );
    },
    [userId],
  );

  return {
    user,
    profile: current?.profile ?? null,
    onboarding: current?.onboarding ?? null,
    error: current?.error ?? null,
    isLoading: isAuthLoading || (userId !== null && current === null),
    refetch,
    update,
  };
}
