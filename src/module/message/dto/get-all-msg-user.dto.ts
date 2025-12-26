import { IsOptional, IsString, IsEnum } from 'class-validator';
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
}
