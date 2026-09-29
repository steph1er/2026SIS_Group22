import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateOutfitItemDto } from './create-outfit-item.dto';

export class UpdateOutfitDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  occasion?: string;

  @IsOptional()
  @IsString()
  style?: string;

  @IsOptional()
  @IsString()
  season?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique(
    (item: CreateOutfitItemDto) =>
      item.wardrobe_items_id ?? item.catalogue_items_id,
  )
  @ValidateNested({ each: true })
  @Type(() => CreateOutfitItemDto)
  items: CreateOutfitItemDto[];
}
