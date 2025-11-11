import { Type } from 'class-transformer';
import { IsOptional, IsEnum, IsDefined, IsNotEmpty } from 'class-validator';
import { BaseFilterDto } from 'src/helper/interface';

export enum PostSortBy {
  CREATED_DATE = 'created_date',
  MODIFIED_DATE = 'modified_date',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}
export class UserAllPostsDto extends BaseFilterDto {
  @Type(() => Number)
  @IsNotEmpty()
  @IsDefined()
  userId: number;

  @IsOptional()
  @IsEnum(PostSortBy)
  sortBy?: PostSortBy = PostSortBy.CREATED_DATE;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
