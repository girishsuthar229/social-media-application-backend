import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CurrentUser } from 'src/decorators';
import { IResponse, PostsOperation, UserDetails } from 'src/helper';
import { CommentsPostUserListResponseModel } from './interface/comments.interface';
import { ResponseUtil } from 'src/interceptors';
import { CommentsService } from './comments.service';
import { CommentOnPostDto } from './dto/comment-on-post-dto';

@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}
  @Get(':postId/all-users-list')
  async likePostAllUserList(
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<IResponse<CommentsPostUserListResponseModel[]>> {
    const data = await this.commentsService.commentsPostAllUserList(postId);
    return ResponseUtil.success(
      data,
      PostsOperation.COMMENT_ALL_USERS_FETCHED,
      HttpStatus.OK,
    );
  }
  @Post(':postId/user-comment')
  async userCommentPost(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser() user: UserDetails,
    @Body() commentOnPostDto: { comment: string },
  ): Promise<IResponse<null>> {
    const commentPaylodValue: CommentOnPostDto = {
      user_id: user.id,
      comment: commentOnPostDto.comment,
    };
    await this.commentsService.userCommentPost(postId, commentPaylodValue);
    return ResponseUtil.success(
      null,
      PostsOperation.POST_UNLIKED,
      HttpStatus.OK,
    );
  }
}
