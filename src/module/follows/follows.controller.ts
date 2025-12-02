import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { FollowsService } from './follows.service';
import { CurrentUser } from 'src/decorators';
import { IResponse, UserDetails } from 'src/helper';
import { ResponseUtil } from 'src/interceptors';
import { FollowOperation } from 'src/helper/enum';
import { FollowAllUserDto } from './dto/follow-all-user.dto';
import {
  FollowUnFollowResponseModel,
  FollowUserListResponseModel,
  PendingFollowUsers,
} from './interface/follow.interface';
import { SearchResponse } from 'src/helper/interface';
import { FollowingsEnum } from './entity/follow.entity';

@Controller('follows')
export class FollowsController {
  constructor(private followsService: FollowsService) {}

  @Get(':userId/follow')
  async followUser(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: UserDetails,
  ): Promise<IResponse<FollowUnFollowResponseModel>> {
    const result = await this.followsService.followUser(userId, user.id);
    let message =
      result.follow_status === FollowingsEnum.PENDING
        ? FollowOperation.USER_FOLLOW_REQUEST_SENT
        : FollowOperation.USER_FOLLOW;
    return ResponseUtil.success(result, message, HttpStatus.OK);
  }

  @Post(':userId/follow-requests')
  async getFollowRequests(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() followAllUserDto: FollowAllUserDto,
    @CurrentUser() currentUser: UserDetails,
  ): Promise<IResponse<SearchResponse<PendingFollowUsers>>> {
    const result = await this.followsService.getPendingFollowRequests(
      userId,
      followAllUserDto,
      currentUser?.id,
    );
    return ResponseUtil.success(
      result,
      FollowOperation.FOLLOWERS_FETCHED,
      HttpStatus.OK,
    );
  }

  @Get(':userId/request/:requestId/accept')
  async acceptFollow(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('requestId', ParseIntPipe) requestId: number,
  ): Promise<IResponse<null>> {
    await this.followsService.acceptFollowRequest(userId, requestId);
    return ResponseUtil.success(
      null,
      FollowOperation.FOLLOW_REQUEST_ACCEPTED,
      HttpStatus.OK,
    );
  }

  @Get(':userId/request/:requestId/cancel')
  async canceltFollow(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('requestId', ParseIntPipe) requestId: number,
  ): Promise<IResponse<null>> {
    await this.followsService.cancelFollowRequest(userId, requestId);
    return ResponseUtil.success(
      null,
      FollowOperation.FOLLOW_REQUEST_CANCELED,
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

  @Post(':userId/followers')
  async getFollowers(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() followAllUserDto: FollowAllUserDto,
    @CurrentUser() currentUser: UserDetails,
  ): Promise<IResponse<SearchResponse<FollowUserListResponseModel>>> {
    const followers = await this.followsService.getFollowersList(
      userId,
      followAllUserDto,
      currentUser?.id,
    );
    return ResponseUtil.success(
      followers,
      FollowOperation.FOLLOWERS_FETCHED,
      HttpStatus.OK,
    );
  }

  @Post(':userId/followings')
  async getFollowings(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() followAllUserDto: FollowAllUserDto,
    @CurrentUser() currentUser: UserDetails,
  ): Promise<IResponse<SearchResponse<FollowUserListResponseModel>>> {
    const followings = await this.followsService.getFollowingList(
      userId,
      followAllUserDto,
      currentUser?.id,
    );
    return ResponseUtil.success(
      followings,
      FollowOperation.FOLLOWING_FETCHED,
      HttpStatus.OK,
    );
  }
}
