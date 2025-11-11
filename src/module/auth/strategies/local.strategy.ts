import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ErrorMessages, ErrorType } from 'src/helper';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LoginUserDto } from '../dto/login-user.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'user_name' });
  }

  async validate(user_name: string, password: string): Promise<any> {
    const loginUserDto = plainToInstance(LoginUserDto, { user_name, password });
    const errors = await validate(loginUserDto);
    if (errors.length > 0) {
      const firstError = errors[0];
      const constraints = firstError.constraints;
      const message = constraints
        ? Object.values(constraints)[0]
        : ErrorMessages[ErrorType.InvalidCredentials];

      throw new UnauthorizedException(message);
    }

    const user = await this.authService.validateUser(loginUserDto);
    if (!user) {
      throw new UnauthorizedException(
        ErrorMessages[ErrorType.InvalidCredentials],
      );
    }
    return user;
  }
}
