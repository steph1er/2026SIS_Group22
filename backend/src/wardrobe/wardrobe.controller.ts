import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { WardrobeService } from './wardrobe.service';
import { UpdateWardrobeItemDto } from './dto/update-wardrobe-item.dto';

@Controller('wardrobes')
export class WardrobeController {

    constructor(private wardrobeService: WardrobeService) {}

    @Get()
    getWardrobe(): Promise<any[]> {
        return this.wardrobeService.getWardrobe();
    }

    @Get(':id')
    getWardrobeItem(@Param('id') id: string): Promise<any[]> {
        return this.wardrobeService.getWardrobeItem(id);
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
    searchForItems(): string {
        return this.wardrobeService.searchForItems();
    }

    // change to delete
    @Delete('delete/:id')
    deleteItem(@Param('id') id: string) {
        return this.wardrobeService.deleteItem(id);
    }
}