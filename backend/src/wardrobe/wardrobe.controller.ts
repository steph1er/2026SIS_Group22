import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { WardrobeService } from './wardrobe.service';
import { UpdateWardrobeItemDto } from './dto/update-wardrobe-item.dto';
import { SearchWardrobeItemDto } from './dto/search-wardrobe-item.dto';
import { AuthenticatedUser } from '../auth/authenticated-user.decorator';
import type { User } from '@supabase/supabase-js';

@Controller('wardrobes')
@UseGuards(SupabaseAuthGuard)
export class WardrobeController {

    constructor(private wardrobeService: WardrobeService) {}

    @Get()
    getWardrobe(@AuthenticatedUser() user: User): Promise<any[]> {
        return this.wardrobeService.getWardrobe(user.id);
    }

    // change to post
    @Get('add')
    addItem(): string {
        return this.wardrobeService.addItem();
    }

    @Post('update')
    updateItemDetails(@Body() updateWardrobeItemDto: UpdateWardrobeItemDto, @AuthenticatedUser() user: User) {
        return this.wardrobeService.updateItemDetails(updateWardrobeItemDto, user.id);
    }

    @Get('search')
    searchForItems(@Query() query: SearchWardrobeItemDto, @AuthenticatedUser() user: User) {
        const { clothingcategory,
                style,
                brand,
                size,
                colour,
                material,
                tags,
                price,
            } = query;

        return this.wardrobeService.searchForItems(
            user.id,
            clothingcategory, 
            style,
            brand,
            size,
            colour,
            material,
            tags,
            price
        );
    }

    @Get(':id')
    getWardrobeItem(@Param('id') id: string, @AuthenticatedUser() user: User): Promise<any[]> {
        return this.wardrobeService.getWardrobeItem(id, user.id);
    }

    @Delete('delete/:id')
    deleteItem(@Param('id') id: string, @AuthenticatedUser() user: User) {
        return this.wardrobeService.deleteItem(id, user.id);
    }
}
