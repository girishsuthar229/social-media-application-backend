import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { CurrentUser } from 'src/decorators';
import { IResponse, PostsOperation, UserDetails } from 'src/helper';
import { ResponseUtil } from 'src/interceptors';
import { LikePostUserListResponseModel } from './interface/likes.interface';

@Controller('likes')
export class LikesController {
  constructor(private likesService: LikesService) {}

  @Get(':postId/like')
  async likePost(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser() user: UserDetails,
  ): Promise<IResponse<null>> {
    await this.likesService.likePost(postId, user.id);
    return ResponseUtil.success(null, PostsOperation.POST_LIKED, HttpStatus.OK);
  }

  @Get(':postId/un-like')
  async unlikePost(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser() user: UserDetails,
  ): Promise<IResponse<null>> {
    await this.likesService.unlikePost(postId, user.id);
    return ResponseUtil.success(
      null,
      PostsOperation.POST_UNLIKED,
      HttpStatus.OK,
    );
  }

  @Get(':postId/all-users-list')
  async likePostAllUserList(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser() user: UserDetails,
  ): Promise<IResponse<LikePostUserListResponseModel[]>> {
    const data = await this.likesService.likePostAllUserList(postId, user?.id);
    return ResponseUtil.success(
      data,
      PostsOperation.POST_LIKED_ALL_USERS_FETCHED,
      HttpStatus.OK,
    );
  }
}
