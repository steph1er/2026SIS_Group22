import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, Max, Min } from "class-validator";
import { FILTER_CATEGORIES } from "../../common/constants/filter-category.constant";
import type { FilterCategory } from "../../common/constants/filter-category.constant";

export class GetRecomendationsDto {
    // number of items to return (one page of the feed, or the "5 per category" count for a wardrobe/wishlist tab)
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number;

    // number of items to skip, for loading the next page
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    offset?: number;

    // restrict recommendations to one canonical filter group (tops/bottoms/outerwear/...),
    // for when a wardrobe/wishlist tab asks for recommendations matching its own category
    @IsOptional()
    @IsIn(FILTER_CATEGORIES)
    category?: FilterCategory;
}
