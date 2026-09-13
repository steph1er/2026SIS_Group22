import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  public readonly client: SupabaseClient;

  constructor(private config: ConfigService) {
    const url = this.config.get<string>('SUPABASE_URL');
    const key =
      this.config.get<string>('SUPABASE_SECRET_KEY') ||
      this.config.get<string>('SUPABASE_PUBLISHABLE_KEY');

    if (!url || !key) {
      throw new Error(
        'Supabase is not configured. Set SUPABASE_URL and either SUPABASE_PUBLISHABLE_KEY or SUPABASE_SECRET_KEY.',
      );
    }

    this.client = createClient(url, key);
  }
}
