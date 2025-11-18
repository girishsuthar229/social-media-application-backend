// src/users/dto/create-user.dto.ts

import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsDefined,
  Validate,
  IsOptional,
} from 'class-validator';
import {
  IsDateNotInFuture,
  IsToDateMustBeFiveYearsOld,
  Trim,
} from 'src/decorators';
import { ErrorMessages, ErrorType } from 'src/helper';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  user_name: string;

  @Trim()
  @IsEmail({}, { message: ErrorMessages[ErrorType.InvalidEmail] })
  @MaxLength(100)
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  email: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  password: string;

  @Type(() => Number)
  @IsOptional()
  role_id?: number;

  @Trim()
  @Validate(IsDateNotInFuture, {
    message: ErrorMessages[ErrorType.DateCannotBeInFuture],
  })
  @Validate(IsToDateMustBeFiveYearsOld, {
    message: ErrorMessages[ErrorType.ToDateMustBeFiveYearsOld],
  })
  birth_date?: string;
}
