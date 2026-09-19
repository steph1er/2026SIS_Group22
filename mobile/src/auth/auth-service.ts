import type { AuthResponse, AuthTokenResponsePassword, UserAttributes } from '@supabase/supabase-js';

import { requireSupabase } from './supabase-client';

export type SignUpDetails = {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
};

/** Register a user. Supabase may return no session until email confirmation is complete. */
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

export function signOut() {
  return requireSupabase().auth.signOut();
}

export function resetPassword(email: string) {
  return requireSupabase().auth.resetPasswordForEmail(email.trim());
}

export function updateUser(attributes: UserAttributes) {
  return requireSupabase().auth.updateUser(attributes);
}

// determines where an authenticated user should be sent
// users who have not completed onboarding should be sent to the onboarding quiz
// users who have completed onboarding go to the home dashboard

export async function getPostAuthRoute(userId: string) { 
  const { data, error } = await requireSupabase() 
  .from('profiles') 
  .select('onboarding_completed') 
  .eq('id', userId) .maybeSingle(); 
  
  if (error) { 
    return { route: null, error, }; 
  } 
  
  return { route: data?.onboarding_completed === true ? '/home' : '/onboarding', error: null, }; 
}
