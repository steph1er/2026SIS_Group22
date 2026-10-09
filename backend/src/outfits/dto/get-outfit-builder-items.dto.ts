import { Transform } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';
import {
  FILTER_CATEGORIES,
  type FilterCategory,
} from '../../common/constants/filter-category.constant';

export class GetOutfitBuilderItemsDto {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  @IsIn(FILTER_CATEGORIES)
  filter_category?: FilterCategory;
}
