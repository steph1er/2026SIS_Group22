import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { WardrobeService } from './wardrobe.service';
import { UpdateWardrobeItemDto } from './dto/update-wardrobe-item.dto';
import { SearchWardrobeItemDto } from './dto/search-wardrobe-item.dto';
import type { AuthenticatedRequest } from '../auth/authenticated-request.interface';

@Controller('wardrobes')
@UseGuards(SupabaseAuthGuard)
export class WardrobeController {

    constructor(private wardrobeService: WardrobeService) {}

    @Get()
    getWardrobe(@Req() req: AuthenticatedRequest): Promise<any[]> {
        return this.wardrobeService.getWardrobe(req.user.id);
    }

    // change to post
    @Get('add')
    addItem(): string {
        return this.wardrobeService.addItem();
    }

    @Post('update')
    updateItemDetails(@Body() updateWardrobeItemDto: UpdateWardrobeItemDto, @Req() req: AuthenticatedRequest) {
        return this.wardrobeService.updateItemDetails(updateWardrobeItemDto, req.user.id);
    }

    @Get('search')
    searchForItems(@Query() query: SearchWardrobeItemDto, @Req() req: AuthenticatedRequest) {
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
            req.user.id,
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
    getWardrobeItem(@Param('id') id: string, @Req() req: AuthenticatedRequest): Promise<any[]> {
        return this.wardrobeService.getWardrobeItem(id, req.user.id);
    }

    @Delete('delete/:id')
    deleteItem(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        return this.wardrobeService.deleteItem(id, req.user.id);
    }
}
