import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { SupabaseAuthGuard } from "../auth/supabase-auth.guard";
import { CatalogueService } from "./catalogue.service";
import type { User } from "@supabase/supabase-js";
import { AuthenticatedUser } from "../auth/authenticated-user.decorator";

@Controller('catalogue')
@UseGuards(SupabaseAuthGuard)
export class CatalogueController {
    constructor(private catalogueService: CatalogueService) {}

    @Get('reccomendations')
    getCatalogueReccomendations(@AuthenticatedUser() user: User) {
        return this.catalogueService.getCatalogueReccomendations(user.id);
    }

    // get top 10 (check with group) items matching search criteria

    @Get(':id')
    getCatalogueItem(@Param('id') id: string) {
        return this.catalogueService.getCatalogueItem(id);
    }
}