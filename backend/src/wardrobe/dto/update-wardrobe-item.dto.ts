import { IsArray, IsDate, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateWardrobeItemDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
    image_url: string;

    @IsString()
    @IsNotEmpty()
    clothing_category: string;

    @IsString()
    @IsOptional()
    style: string;

    @IsString()
    @IsOptional()
    brand: string;

    @IsString()
    @IsOptional()
    size: string;

    @IsArray()
    @IsOptional()
    colour: string[];

    @IsArray()
    @IsOptional()
    material: string[];

    @IsArray()
    @IsOptional()
    tags: string[];

    @IsDateString()
    @IsNotEmpty()
    modified_at: Date;

    @IsNumber()
    @IsOptional()
    @Min(0)
    price: number;
}