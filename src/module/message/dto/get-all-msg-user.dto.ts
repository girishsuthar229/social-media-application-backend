import { IsOptional, IsString, IsEnum } from 'class-validator';
import { BaseFilterDto } from 'src/helper/interface';

export enum UserSortBy {
  CREATED_DATE = 'created_date',
  MODIFIED_DATE = 'modified_date',
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
  sortBy?: UserSortBy = UserSortBy.CREATED_DATE;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
