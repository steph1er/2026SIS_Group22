import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { SupabaseService } from '../supabase/supabase.service';
import type { AuthenticatedRequest } from './authenticated-request.interface';

/** Verifies a Supabase access token from the Authorization: Bearer header. */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.readBearerToken(request.headers.authorization);

    const { data, error } = await this.supabaseService.client.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException('The Supabase access token is invalid or expired.');
    }

    request.user = data.user;
    return true;
  }

  private readBearerToken(header: string | undefined): string {
    const match = header?.match(/^Bearer\s+(.+)$/i);

    if (!match?.[1]) {
      throw new UnauthorizedException('A Bearer access token is required.');
    }

    return match[1];
  }
}
