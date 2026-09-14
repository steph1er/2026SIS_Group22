import { Controller, Get, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { WardrobeService } from './wardrobe.service';

@Controller('wardrobes')
@UseGuards(SupabaseAuthGuard)
export class WardrobeController {

    constructor(private wardrobeService: WardrobeService) {}

    @Get()
    getWardrobe(): string {
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
