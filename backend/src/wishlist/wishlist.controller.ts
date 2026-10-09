import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { SupabaseAuthGuard } from "../auth/supabase-auth.guard";
import type { User } from "@supabase/supabase-js";
import { AuthenticatedUser } from "../auth/authenticated-user.decorator";
import { WishlistService } from "./wishlist.service";
import { AddWishlistItemDto } from "./dto/add-wishlist-item.dto";
import { SearchWishlistDto } from "./dto/search-wishlist.dto";

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

    @Get('search')
    searchWishlist(@Query() query: SearchWishlistDto, @AuthenticatedUser() user: User){
        const { item_name,
                clothingcategory,
                style,
                brand,
                size,
                colour,
                material,
                min_price,
                max_price
            } = query;

        return this.wishlistService.searchWishlist(user.id,
                                                    item_name,
                                                    clothingcategory,
                                                    style,
                                                    brand,
                                                    size,
                                                    colour,
                                                    material,
                                                    min_price,
                                                    max_price
        );
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