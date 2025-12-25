import {
  IsOptional,
  IsInt,
  IsString,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { BaseFilterDto } from 'src/helper/interface';

export enum UserSortBy {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetAllMsgUsersDto extends BaseFilterDto {
  @IsOptional()
  @IsString()
  searchName?: string;

  @IsOptional()
  @IsEnum(UserSortBy)
  sortBy?: UserSortBy = UserSortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  is_read?: boolean;
}
