// src/users/dto/update-user.dto.ts
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsDefined,
  Validate,
  MinLength,
} from 'class-validator';
import {
  IsDateNotInFuture,
  IsToDateMustBeFiveYearsOld,
  Trim,
} from 'src/decorators';
import { ErrorMessages, ErrorType } from 'src/helper';

export class UpdateUserProfileDto {
  @IsNotEmpty()
  @IsString()
  @Trim()
  id: number;

  @IsNotEmpty()
  @IsString()
  @Trim()
  user_name: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(50)
  first_name?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(50)
  last_name?: string;

  @IsOptional()
  @Trim()
  @IsEmail({}, { message: ErrorMessages[ErrorType.InvalidEmail] })
  @MaxLength(100)
  @IsString()
  @IsDefined()
  email: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  mobile_number?: string;

  @IsOptional()
  user_image?: Express.Multer.File;

  @Trim()
  @IsOptional()
  @Validate(IsDateNotInFuture, {
    message: ErrorMessages[ErrorType.DateCannotBeInFuture],
  })
  @Validate(IsToDateMustBeFiveYearsOld, {
    message: ErrorMessages[ErrorType.ToDateMustBeFiveYearsOld],
  })
  birth_date?: string;

  @Trim()
  @IsOptional()
  @MaxLength(300)
  @MinLength(3)
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  is_private?: boolean;
}
