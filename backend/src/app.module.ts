import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WardrobeModule } from './wardrobe/wardrobe.module';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { CatalogueModule } from './catalogue/catalogue.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), SupabaseModule, WardrobeModule, WishlistModule, CatalogueModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
