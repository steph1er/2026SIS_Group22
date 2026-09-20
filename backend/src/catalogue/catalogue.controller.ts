import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { SupabaseAuthGuard } from "../auth/supabase-auth.guard";
import { CatalogueService } from "./catalogue.service";

@Controller('catalogue')
@UseGuards(SupabaseAuthGuard)
export class CatalogueController {
    constructor(private catalogueService: CatalogueService) {}

    // get reccomended items for user

    // get top 10 (check with group) items matching search criteria

    @Get(':id')
    getCatalogueItem(@Param('id') id: string) {
        return this.catalogueService.getCatalogueItem(id);
    }
}