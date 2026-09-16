import { Controller, Get, UseGuards } from "@nestjs/common";
import { SupabaseAuthGuard } from "../auth/supabase-auth.guard";
import type { User } from "@supabase/supabase-js";
import { AuthenticatedUser } from "../auth/authenticated-user.decorator";
import { WishlistService } from "./wishlist.service";

@Controller('wishlist')
@UseGuards(SupabaseAuthGuard)
export class WishlistController {

    constructor(private wishlistService: WishlistService) {}

    @Get()
    getWishlist(@AuthenticatedUser() user: User) {
        return this.wishlistService.getWishlist(user.id);
    }
}