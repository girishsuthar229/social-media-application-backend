import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/decorators';
import { AccessTypes, ErrorMessages, ErrorType } from 'src/helper';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const accessType = this.reflector.getAllAndOverride<AccessTypes>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (accessType === AccessTypes.PUBLIC) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw new UnauthorizedException(ErrorMessages[ErrorType.InvalidToken]);
    }
    return user; // eslint-disable-line @typescript-eslint/no-unsafe-return
  }
}
