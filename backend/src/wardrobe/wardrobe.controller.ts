import { Controller, Get } from '@nestjs/common';
import { WardrobeService } from './wardrobe.service';

@Controller('wardrobes')
export class WardrobeController {

    constructor(private wardrobeService: WardrobeService) {}

    @Get()
    getWardrobe(): string {
        return this.wardrobeService.getWardrobe();
    }

    @Get('create')
    makeWardrobe(): string {
        return this.wardrobeService.makeWardrobe();
    }

    @Get('add')
    addItem(): string {
        return this.wardrobeService.addItem();
    }

    @Get('update')
    updateItemDetails(): string {
        return this.wardrobeService.updateItemDetails();
    }

    @Get('search')
    searchForItems(): string {
        return this.wardrobeService.searchForItems();
    }

    @Get('delete')
    deleteItem(): string {
        return this.wardrobeService.deleteItem();
    }
}