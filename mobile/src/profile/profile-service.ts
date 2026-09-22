import { requireSupabase } from '../auth/supabase-client';

/**
 * A row of public.profiles.
 *
 * `id` is the profile row's own UUID. It is NOT the authenticated user's ID.
 * `user_id` references auth.users.id and is the only column used to find a
 * user's profile.
 */
export type Profile = {
  id: string;
  user_id: string;
  display_name: string | null;
  body_type: string | null;
  size: string | null;
  created_at: string | null;
  /** The only authoritative flag for whether onboarding is finished. */
  onboarding_completed: boolean;
  /** NULL for accounts that were backfilled as completed rather than finishing the quiz. */
  onboarding_completed_at: string | null;
};

export type ProfileUpdate = Partial<Pick<Profile, 'display_name' | 'body_type' | 'size'>>;

const PROFILE_COLUMNS =
  'id, user_id, display_name, body_type, size, created_at, onboarding_completed, onboarding_completed_at';

/** Load the profile whose user_id is the given auth.users.id. Returns null when none is visible. */
export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await requireSupabase()
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Profile | null;
}

/**
 * Update the profile whose user_id is the given auth.users.id. Row-level security
 * also restricts this to the signed-in user's own row, so zero matching rows
 * means the profile is missing or not owned by the caller.
 */
export async function updateProfile(userId: string, update: ProfileUpdate): Promise<Profile> {
  const { data, error } = await requireSupabase()
    .from('profiles')
    .update(update)
    .eq('user_id', userId)
    .select(PROFILE_COLUMNS)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Your profile could not be found, so nothing was saved.');
  return data as Profile;
}
