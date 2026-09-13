import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { WardrobeService } from './wardrobe.service';
import { UpdateWardrobeItemDto } from './dto/update-wardrobe-item.dto';
import { SearchWardrobeItemDto } from './dto/search-wardrobe-item.dto';

@Controller('wardrobes')
export class WardrobeController {

    constructor(private wardrobeService: WardrobeService) {}

    @Get()
    getWardrobe(): Promise<any[]> {
        return this.wardrobeService.getWardrobe();
    }

    // change to post
    @Get('add')
    addItem(): string {
        return this.wardrobeService.addItem();
    }

    @Post('update')
    updateItemDetails(@Body() updateWardrobeItemDto: UpdateWardrobeItemDto) {
        return this.wardrobeService.updateItemDetails(updateWardrobeItemDto);
    }

    @Get('search')
    searchForItems(@Query() query: SearchWardrobeItemDto) {
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
    getWardrobeItem(@Param('id') id: string): Promise<any[]> {
        return this.wardrobeService.getWardrobeItem(id);
    }

    @Delete('delete/:id')
    deleteItem(@Param('id') id: string) {
        return this.wardrobeService.deleteItem(id);
    }
}