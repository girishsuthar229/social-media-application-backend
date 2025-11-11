import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from 'src/decorators';

export class LoginUserDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  user_name: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  password: string;
}
