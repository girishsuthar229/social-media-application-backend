import { Transform, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { SafeInt } from 'src/decorators';

export interface IResponse<T> {
  data?: T;
  message?: string;
  statusCode?: number;
  error?: string;
}

export interface SearchResponse<T> {
  count: number;
  rows: T[];
}
export interface UserDetails {
  user_name: string;
  id: number;
  email?: string;
  role_id: number;
}

export class BaseFilterDto {
  @Type(() => Number)
  @SafeInt()
  @IsOptional()
  limit?: number;

  @Type(() => Number)
  @SafeInt()
  @IsOptional()
  offset?: number;
}

export class RouteIdsParamsDto {
  @Transform(({ value }) =>
    value !== null && value !== undefined && value !== ''
      ? Number(value)
      : undefined,
  )
  @SafeInt()
  @IsOptional()
  id: number;

  @Transform(({ value }) =>
    value !== null && value !== undefined && value !== ''
      ? Number(value)
      : undefined,
  )
  @SafeInt()
  @IsOptional()
  value_id: number;

  @Transform(({ value }) =>
    value !== null && value !== undefined && value !== ''
      ? Number(value)
      : undefined,
  )
  @SafeInt()
  @IsOptional()
  product_id: number;

  @Transform(({ value }) =>
    value !== null && value !== undefined && value !== ''
      ? Number(value)
      : undefined,
  )
  @SafeInt()
  @IsOptional()
  location_id: number;
}
