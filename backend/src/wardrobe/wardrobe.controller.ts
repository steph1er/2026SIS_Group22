import { Controller, Get } from '@nestjs/common';
import { WardrobeService } from './wardrobe.service';

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

    // change to post
    @Get('update')
    updateItemDetails(): string {
        return this.wardrobeService.updateItemDetails();
    }

    @Get('search')
    searchForItems(): string {
        return this.wardrobeService.searchForItems();
    }

    // change to delete
    @Get('delete')
    deleteItem(): string {
        return this.wardrobeService.deleteItem();
    }
}