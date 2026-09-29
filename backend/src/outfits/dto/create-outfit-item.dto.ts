import { IsOptional, IsUUID } from 'class-validator';

export class CreateOutfitItemDto {
  @IsOptional()
  @IsUUID()
  wardrobe_items_id?: string;

  @IsOptional()
  @IsUUID()
  catalogue_items_id?: string;
}
