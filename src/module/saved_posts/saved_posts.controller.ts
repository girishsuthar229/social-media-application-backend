import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { SavedPostsService } from './saved_posts.service';
import { CurrentUser } from 'src/decorators';
import { IResponse, PostsOperation, UserDetails } from 'src/helper';
import { SearchResponse } from 'src/helper/interface';
import { ResponseUtil } from 'src/interceptors';
import { SavedAllPostsResponseModel } from './interface/save_posts.interface';
import { UserAllPostsDto } from '../posts/dto/user-all-posts.dto';

@Controller('saved-posts')
export class SavedPostsController {
  constructor(private savedPostsService: SavedPostsService) {}

  @Get(':postId/save')
  async savePost(
    @Param('postId') postId: number,
    @CurrentUser() currentUser: UserDetails,
  ): Promise<IResponse<null>> {
    await this.savedPostsService.savePost(currentUser.id, postId);
    return ResponseUtil.success(null, PostsOperation.POST_SAVE, HttpStatus.OK);
  }

  @Get(':postId/unsave')
  async unSavePost(
    @Param('postId') postId: number,
    @CurrentUser() currentUser: UserDetails,
  ): Promise<IResponse<null>> {
    await this.savedPostsService.unSavePost(currentUser.id, postId);
    return ResponseUtil.success(
      null,
      PostsOperation.POST_UNSAVE,
      HttpStatus.OK,
    );
  }

  @Post('/get-all-saved-post')
  async getAllSavedPosts(
    @Body() queryDto: UserAllPostsDto,
  ): Promise<IResponse<SearchResponse<SavedAllPostsResponseModel>>> {
    const result = await this.savedPostsService.getAllSavedPosts(queryDto);
    return ResponseUtil.success(
      result,
      PostsOperation.POSTS_FETCHED,
      HttpStatus.OK,
    );
  }
}
