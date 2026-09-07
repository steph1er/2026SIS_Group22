import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WardrobeModule } from './wardrobe/wardrobe.module';

@Module({
  imports: [WardrobeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
