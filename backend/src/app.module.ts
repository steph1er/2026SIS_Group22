import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WardrobeModule } from './wardrobe/wardrobe.module';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), SupabaseModule, WardrobeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
