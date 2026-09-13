import type { User } from '@supabase/supabase-js';
import type { Request } from 'express';

/** An HTTP request after SupabaseAuthGuard has verified its access token. */
export interface AuthenticatedRequest extends Request {
  user: User;
}
