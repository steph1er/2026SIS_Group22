import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { SupabaseAuthGuard } from "../auth/supabase-auth.guard";
import { CatalogueService } from "./catalogue.service";
import type { User } from "@supabase/supabase-js";
import { AuthenticatedUser } from "../auth/authenticated-user.decorator";
import { SearchCatalogueItemDto } from "./dto/search-catalogue-item.dto";

@Controller('catalogue')
@UseGuards(SupabaseAuthGuard)
export class CatalogueController {
    constructor(private catalogueService: CatalogueService) {}

    @Get('reccomendations')
    getCatalogueReccomendations(@AuthenticatedUser() user: User) {
        return this.catalogueService.getCatalogueReccomendations(user.id);
    }

    @Get('search')
    searchCatalogueItems(@Query() query: SearchCatalogueItemDto){
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

        return this.catalogueService.searchCatalogueItems(item_name,
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
    getCatalogueItem(@Param('id') id: string) {
        return this.catalogueService.getCatalogueItem(id);
    }
}