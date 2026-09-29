import { Module } from '@nestjs/common';
import { OutfitsController } from './outfits.controller';
import { OutfitsService } from './outfits.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [OutfitsController],
  providers: [OutfitsService],
})
export class OutfitsModule {}
