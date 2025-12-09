import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { IResponse, MimeType, PostsOperation, UserDetails } from 'src/helper';
import { CurrentUser } from 'src/decorators';
import { FileValidationInterceptor, ResponseUtil } from 'src/interceptors';
import { CreatePostDto } from './dto/create-post.dto';
import { FileValidation } from 'src/decorators/file-validation.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePost } from './entity/post.entity';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { SearchResponse } from 'src/helper/interface';
import {
  GetAllPostsReponseModel,
  GetPostByIdReponse,
  UserAllPostsResponseModel,
} from './interface/posts.interface';
import { UserAllPostsDto } from './dto/user-all-posts.dto';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @UseInterceptors(FileInterceptor('post_image'), FileValidationInterceptor)
  @FileValidation({
    allowedMimeTypes: [MimeType.PNG, MimeType.JPG, MimeType.JPEG],
  })
  @Post('create')
  async createUser(
    @UploadedFile() post_image: Express.Multer.File,
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() user: UserDetails,
  ): Promise<IResponse<null>> {
    const payload = {
      ...createPostDto,
      post_image,
      created_by: user.email,
    };
    await this.postsService.createPost(user.id, payload);
    return ResponseUtil.success(
      null,
      PostsOperation.POST_CREATED,
      HttpStatus.OK,
    );
  }

  @Post('/get-all-post')
  async getAllPosts(
    @Body() queryDto: QueryPostDto,
    @CurrentUser() user: UserDetails,
  ): Promise<IResponse<SearchResponse<GetAllPostsReponseModel>>> {
    const result = await this.postsService.getAllPosts(queryDto, user.id);
    return ResponseUtil.success(
      result,
      PostsOperation.POSTS_FETCHED,
      HttpStatus.OK,
    );
  }

  @Post('/get-user-wise-all-posts')
  async getUserPosts(
    @Body() queryDto: UserAllPostsDto,
    @CurrentUser() user: UserDetails,
  ): Promise<IResponse<SearchResponse<UserAllPostsResponseModel>>> {
    const result = await this.postsService.getUserPosts(queryDto, user?.id);
    return ResponseUtil.success(
      result,
      PostsOperation.USER_POSTS_FETCHED,
      HttpStatus.OK,
    );
  }

  @Get('/post/:postId')
  async getPostById(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser() user: UserDetails,
  ): Promise<IResponse<GetPostByIdReponse>> {
    const post = await this.postsService.getPostById(user?.id, postId);
    return ResponseUtil.success(
      post,
      PostsOperation.POST_FETCHED,
      HttpStatus.OK,
    );
  }

  @Put('/update/:postId')
  async updatePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() user: UserDetails,
  ): Promise<IResponse<null>> {
    await this.postsService.updatePost(postId, user.id, updatePostDto);
    return ResponseUtil.success(
      null,
      PostsOperation.POST_UPDATED,
      HttpStatus.OK,
    );
  }

  @Delete(':id')
  async deletePost(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserDetails,
  ): Promise<IResponse<null>> {
    await this.postsService.deletePost(id, user.id);
    return ResponseUtil.success(
      null,
      PostsOperation.POST_DELETED,
      HttpStatus.OK,
    );
  }
}
