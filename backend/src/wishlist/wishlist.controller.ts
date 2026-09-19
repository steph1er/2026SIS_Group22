import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { SupabaseAuthGuard } from "../auth/supabase-auth.guard";
import type { User } from "@supabase/supabase-js";
import { AuthenticatedUser } from "../auth/authenticated-user.decorator";
import { WishlistService } from "./wishlist.service";
import { AddWishlistItemDto } from "./dto/add-wishlist-item.dto";

@Controller('wishlist')
@UseGuards(SupabaseAuthGuard)
export class WishlistController {

    constructor(private wishlistService: WishlistService) {}

    @Get()
    getWishlist(@AuthenticatedUser() user: User) {
        return this.wishlistService.getWishlist(user.id);
    }

    @Post('add')
    addItemToWishlist(@Body() addWishlistItemDto: AddWishlistItemDto, @AuthenticatedUser() user: User) {
        return this.wishlistService.addItem(addWishlistItemDto, user.id);
    }

    @Get(':id')
    getItemFromWishlist(@Param('id') id: string, @AuthenticatedUser() user: User) {
        return this.wishlistService.getWishlistItem(id, user.id);
    }

    @Delete('delete/:id')
    removeItemFromWishlist(@Param('id') id: string, @AuthenticatedUser() user: User) {
        return this.wishlistService.removeItem(id, user.id);
    }
}