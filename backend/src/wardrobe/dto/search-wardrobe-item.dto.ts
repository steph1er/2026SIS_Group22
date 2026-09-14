import { Transform, Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class SearchWardrobeItemDto {
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => {
        // check if value is already an array
        if(Array.isArray(value)){
            return value;
        }

        // check if empty
        if(!value) {
            return [];
        }

        // check if only one item in array
        return [value];
    })
    clothingcategory?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => {
        // check if value is already an array
        if(Array.isArray(value)){
            return value;
        }

        // check if empty
        if(!value) {
            return [];
        }

        // check if only one item in array
        return [value];
    })
    style?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => {
        // check if value is already an array
        if(Array.isArray(value)){
            return value;
        }

        // check if empty
        if(!value) {
            return [];
        }

        // check if only one item in array
        return [value];
    })
    brand?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => {
        // check if value is already an array
        if(Array.isArray(value)){
            return value;
        }

        // check if empty
        if(!value) {
            return [];
        }

        // check if only one item in array
        return [value];
    })
    size?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => {
        // check if value is already an array
        if(Array.isArray(value)){
            return value;
        }

        // check if empty
        if(!value) {
            return [];
        }

        // check if only one item in array
        return [value];
    })
    colour?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => {
        // check if value is already an array
        if(Array.isArray(value)){
            return value;
        }

        // check if empty
        if(!value) {
            return [];
        }

        // check if only one item in array
        return [value];
    })
    material?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => {
        // check if value is already an array
        if(Array.isArray(value)){
            return value;
        }

        // check if empty
        if(!value) {
            return [];
        }

        // check if only one item in array
        return [value];
    })
    tags?: string[];

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    price?: number;
}