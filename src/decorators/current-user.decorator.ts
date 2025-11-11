import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDetails } from 'src/helper';

export const CurrentUser = createParamDecorator(
  (data: keyof any, ctx: ExecutionContext) => {
    const { user } = ctx.switchToHttp().getRequest(); // eslint-disable-line  @typescript-eslint/no-unsafe-assignment
    return user as UserDetails;
  }
);
