import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { OutfitsService } from './outfits.service';
import { CreateOutfitDto } from './dto/create-outfit.dto';
import { UpdateOutfitDto } from './dto/update-outfit.dto';
import { GetOutfitBuilderItemsDto } from './dto/get-outfit-builder-items.dto';
import { AuthenticatedUser } from '../auth/authenticated-user.decorator';
import type { User } from '@supabase/supabase-js';

@Controller('outfits')
@UseGuards(SupabaseAuthGuard)
export class OutfitsController {
  constructor(private outfitsService: OutfitsService) {}

  @Get()
  getOutfits(@AuthenticatedUser() user: User) {
    return this.outfitsService.getOutfits(user.id);
  }

  @Get(':id')
  getOutfit(@Param('id') id: string, @AuthenticatedUser() user: User) {
    return this.outfitsService.getOutfit(id, user.id);
  }

  @Get('builder/wardrobe')
  getWardrobeForBuilder(
    @Query() query: GetOutfitBuilderItemsDto,
    @AuthenticatedUser() user: User,
  ) {
    return this.outfitsService.getWardrobeForBuilder(
      query.filter_category,
      user.id,
    );
  }

  @Get('builder/wishlist')
  getWishlistForBuilder(
    @Query() query: GetOutfitBuilderItemsDto,
    @AuthenticatedUser() user: User,
  ) {
    return this.outfitsService.getWishlistForBuilder(
      query.filter_category,
      user.id,
    );
  }

  @Post()
  createOutfit(
    @Body() createOutfitDto: CreateOutfitDto,
    @AuthenticatedUser() user: User,
  ) {
    return this.outfitsService.createOutfit(createOutfitDto, user.id);
  }

  @Patch(':id')
  updateOutfit(
    @Param('id') id: string,
    @Body() updateOutfitDto: UpdateOutfitDto,
    @AuthenticatedUser() user: User,
  ) {
    return this.outfitsService.updateOutfit(id, updateOutfitDto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteOutfit(@Param('id') id: string, @AuthenticatedUser() user: User) {
    return this.outfitsService.deleteOutfit(id, user.id);
  }
}
