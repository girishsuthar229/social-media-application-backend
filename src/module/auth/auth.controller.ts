import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/decorators';
import { AccessTypes, IResponse, UsersOperation } from 'src/helper';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ResponseUtil } from 'src/interceptors';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Public(AccessTypes.PUBLIC)
  @Post('login')
  async login(@Req() req): Promise<IResponse<{ accessToken: string }>> {
    const result = await this.authService.login(req.user); // eslint-disable-line @typescript-eslint/no-unsafe-member-access
    return ResponseUtil.success(result, UsersOperation.LOGIN, HttpStatus.OK);
  }
}
