import { requireSupabase } from '../auth/supabase-client';

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

/** Calls a protected NestJS endpoint with the current Supabase access token. */
export async function authenticatedApiRequest(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  if (!apiUrl) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured.');
  }

  const { data, error } = await requireSupabase().auth.getSession();

  if (error || !data.session?.access_token) {
    throw new Error('The user must be signed in before calling the API.');
  }

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${data.session.access_token}`);

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(`${apiUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`, {
    ...options,
    headers,
  });
}
