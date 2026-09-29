import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class GetReccomendationsDto {
    // number of items to return (one page of the feed)
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

    // any string; requests with the same seed get the same mixed order, so pages line up
    @IsOptional()
    @IsString()
    @MaxLength(64)
    seed?: string;
}
