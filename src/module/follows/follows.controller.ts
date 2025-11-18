import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { FollowsService } from './follows.service';
import { CurrentUser } from 'src/decorators';
import { IResponse, UserDetails } from 'src/helper';
import { ResponseUtil } from 'src/interceptors';
import { FollowOperation } from 'src/helper/enum';

@Controller('follows')
export class FollowsController {
  constructor(private followsService: FollowsService) {}

  @Get(':userId/follow')
  async followUser(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: UserDetails,
  ): Promise<IResponse<null>> {
    await this.followsService.followUser(userId, user.id);
    return ResponseUtil.success(
      null,
      FollowOperation.USER_FOLLOW,
      HttpStatus.OK,
    );
  }

  @Get(':userId/un-follow')
  async unfollowUser(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: UserDetails,
  ): Promise<IResponse<null>> {
    await this.followsService.unfollowUser(userId, user.id);
    return ResponseUtil.success(
      null,
      FollowOperation.USER_UN_FOLLOW,
      HttpStatus.OK,
    );
  }
}
