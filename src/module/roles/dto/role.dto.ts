import {
  IsDefined,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  ValidationArguments,
} from 'class-validator';
import { Trim } from 'src/decorators';
import { ALPHA_NUMERIC_REGEX, ErrorMessages, ErrorType } from 'src/helper';

export class RoleDto {
  @Trim()
  @Length(3, 20)
  @Matches(ALPHA_NUMERIC_REGEX, {
    message: (args: ValidationArguments) =>
      `${args.property}: ${ErrorMessages[ErrorType.AlphaNumericAllowed]}`,
  })
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  name: string;
}
