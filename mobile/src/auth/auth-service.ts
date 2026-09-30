import type { AuthResponse, AuthTokenResponsePassword, UserAttributes } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { requireSupabase } from './supabase-client';

export type SignUpDetails = {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
};

function getCallbackParameters(url: string) {
  const query = url.includes('?') ? url.split('?')[1]?.split('#')[0] : '';
  const fragment = url.includes('#') ? url.split('#')[1] : '';
  return new URLSearchParams([query, fragment].filter(Boolean).join('&'));
}

/** Complete a Supabase email or OAuth redirect and store the resulting session. */
export async function completeAuthCallback(url: string) {
  const parameters = getCallbackParameters(url);
  const callbackError = parameters.get('error_description');
  const code = parameters.get('code');
  const accessToken = parameters.get('access_token');
  const refreshToken = parameters.get('refresh_token');

  if (callbackError) throw new Error(callbackError);

  if (code) {
    const { error } = await requireSupabase().auth.exchangeCodeForSession(code);
    if (error) throw error;
    return;
  }

  if (accessToken && refreshToken) {
    const { error } = await requireSupabase().auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
    return;
  }

  throw new Error('The authentication link is missing its session details.');
}

/** Open Google authentication and return true when a native session is ready. */
export async function signInWithGoogle(): Promise<boolean> {
  const redirectTo = Linking.createURL('auth/callback');
  const { data, error } = await requireSupabase().auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: Platform.OS !== 'web',
    },
  });

  if (error) throw error;

  // On web, Supabase redirects the current page and the callback route finishes sign-in.
  if (Platform.OS === 'web') return false;
  if (!data.url) throw new Error('Google sign-in did not return an authorization URL.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return false;

  await completeAuthCallback(result.url);
  return true;
}

/** Register a user with email and password. */
export function signUp({ email, password, fullName, phone }: SignUpDetails): Promise<AuthResponse> {
  return requireSupabase().auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        ...(fullName ? { full_name: fullName.trim() } : {}),
        ...(phone ? { phone: phone.trim() } : {}),
      },
    },
  });
}

export function signIn(email: string, password: string): Promise<AuthTokenResponsePassword> {
  return requireSupabase().auth.signInWithPassword({ email: email.trim(), password });
}

export function signOut(scope: 'global' | 'local' | 'others' = 'global') {
  return requireSupabase().auth.signOut({ scope });
}

export function resetPassword(email: string) {
  return requireSupabase().auth.resetPasswordForEmail(email.trim());
}

export function updateUser(attributes: UserAttributes) {
  return requireSupabase().auth.updateUser(attributes);
}

export type PostAuthRoute = '/home-dashboard' | '/onboarding';

/** Either a route to go to, or an error. On an error there is no route, so callers must not navigate. */
export type PostAuthRouteResult =
  | { route: PostAuthRoute; error: null }
  | { route: null; error: Error };

/**
 * Decide where a signed-in user should go, from profiles.onboarding_completed.
 * `userId` is auth.users.id and is matched against profiles.user_id (never profiles.id).
 *
 *   onboarding_completed = false → /onboarding
 *   onboarding_completed = true  → /home-dashboard
 *   no profile row               → /home-dashboard (warned; a profile is never created here)
 *   query failure                → error, no route (onboarding is mandatory for new users,
 *                                  so a failed check must neither skip nor force it)
 *
 * Read-only, and never throws.
 */
export async function getPostAuthRoute(userId: string): Promise<PostAuthRouteResult> {
  try {
    const { data, error } = await requireSupabase()
      .from('profiles')
      .select('onboarding_completed')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw new Error(error.message);

    if (!data) {
      console.warn('No profile row found for the signed-in user; continuing to the home dashboard.');
      return { route: '/home-dashboard', error: null };
    }

    if (data.onboarding_completed === false) return { route: '/onboarding', error: null };
    if (data.onboarding_completed === true) return { route: '/home-dashboard', error: null };

    throw new Error('The onboarding status was not readable.');
  } catch (error) {
    console.error('Unable to check onboarding status:', error);
    return {
      route: null,
      error: error instanceof Error ? error : new Error('Unable to check onboarding status.'),
    };
  }
}
