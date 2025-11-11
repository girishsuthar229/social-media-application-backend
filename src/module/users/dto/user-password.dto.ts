import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import { CompareWith, Trim } from 'src/decorators';
import { ErrorMessages, ErrorType } from 'src/helper';
import { RESET_PASSWORD_REGEX } from 'src/helper/constants';

export class SendOtpDto {
  @Trim()
  @IsEmail({}, { message: ErrorMessages[ErrorType.InvalidEmail] })
  @MaxLength(100)
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  email: string;
}

export class VerifyOtpDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  token: string;

  @Trim()
  @Length(6, 6)
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  otp: string;
}

export class VerifyTokenDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  token: string;
}

export class UpdatePasswordDto {
  @Trim()
  @IsEmail({}, { message: ErrorMessages[ErrorType.InvalidEmail] })
  @MaxLength(100)
  @IsString()
  @IsOptional()
  email: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  setToken: string;

  @Trim()
  @Matches(RESET_PASSWORD_REGEX, {
    message: ErrorMessages[ErrorType.InvalidPassword],
  })
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  new_password: string;

  @Trim()
  @CompareWith('new_password', 'match', {
    message: ErrorMessages[ErrorType.PasswordMismatch],
  })
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  confirm_password: string;
}
