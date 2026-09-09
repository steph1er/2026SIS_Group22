import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';

import type { SupabaseService } from '../supabase/supabase.service';
import { SupabaseAuthGuard } from './supabase-auth.guard';

function contextWithAuthorization(authorization?: string) {
  const request = { headers: { authorization } };
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as ExecutionContext;

  return { context, request };
}

describe('SupabaseAuthGuard', () => {
  const getUser = jest.fn();
  const service = { client: { auth: { getUser } } } as unknown as SupabaseService;
  const guard = new SupabaseAuthGuard(service);

  beforeEach(() => getUser.mockReset());

  it('rejects a request without a Bearer token', async () => {
    const { context } = contextWithAuthorization();

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(getUser).not.toHaveBeenCalled();
  });

  it('rejects an invalid Supabase access token', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: new Error('invalid') });
    const { context } = contextWithAuthorization('Bearer invalid-token');

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('adds the verified user to an authenticated request', async () => {
    const user = { id: 'user-123' };
    getUser.mockResolvedValue({ data: { user }, error: null });
    const { context, request } = contextWithAuthorization('Bearer valid-token');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request).toHaveProperty('user', user);
  });
});
