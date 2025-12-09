import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { CreatePost } from './entity/post.entity';
import { deleteLocalFile, saveFileLocally } from 'src/helper/file-upload';
import { ErrorType, UploadFolders } from 'src/helper/enum';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostSortBy, QueryPostDto, SortOrder } from './dto/query-post.dto';
import { SearchResponse } from 'src/helper/interface';
import {
  GetAllPostsReponseModel,
  GetPostByIdReponse,
  UserAllPostsResponseModel,
} from './interface/posts.interface';
import { UserAllPostsDto } from './dto/user-all-posts.dto';
import { ErrorMessages } from 'src/helper';
import { Users } from '../users/entity/user.entity';
import { FollowingsEnum } from '../follows/entity/follow.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(CreatePost)
    private postsRepository: Repository<CreatePost>,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}

  async createPost(
    userId: number,
    createPostDto: CreatePostDto,
  ): Promise<CreatePost> {
    const { content, like_count, share_count, comment, user_id } =
      createPostDto;

    if (Number(userId) !== Number(user_id)) {
      throw new NotFoundException({
        error: ErrorType.PostNotToBeCreate,
        message: ErrorMessages[ErrorType.PostNotToBeCreate],
      });
    }
    let uploadedPostImageUrl: string | null = null;
    if (createPostDto.post_image) {
      uploadedPostImageUrl = saveFileLocally(
        createPostDto.post_image,
        `${UploadFolders.POST_IMAGES}/${user_id}`,
      );
    }
    const newPost = this.postsRepository.create({
      content: content,
      ...(uploadedPostImageUrl && {
        image_url: uploadedPostImageUrl,
      }),
      like_count: like_count || 0,
      share_count: share_count || 0,
      user: { id: userId },
      self_comment: comment || '',
    });

    return this.postsRepository.save(newPost);
  }
  async getAllPosts(
    queryDto: QueryPostDto,
    currentUserId: number,
  ): Promise<SearchResponse<GetAllPostsReponseModel>> {
    const {
      offset,
      limit,
      sortBy = PostSortBy.CREATED_DATE,
      sortOrder = SortOrder.DESC,
    } = queryDto;
    const queryBuilder = this.postsRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'postUser')
      .leftJoinAndSelect('p.comments', 'comment')
      .leftJoinAndSelect('comment.user', 'commentUser')
      .leftJoinAndSelect('p.likes', 'like')
      .leftJoinAndSelect('p.saved_posts', 'saved_post')
      .leftJoinAndSelect('postUser.followers', 'followUser')
      .where('p.deleted_date IS NULL')
      .andWhere(
        `(postUser.is_private = false OR postUser.id = :currentUserId 
        OR EXISTS (
          SELECT 1 FROM follows f
          WHERE f.follower_id = :currentUserId AND f.following_id = p.user_id  AND f.status = :acceptedStatus
        )
      )`,
        {
          currentUserId,
          acceptedStatus: FollowingsEnum.ACCEPTED,
        },
      );

    queryBuilder.addOrderBy(`p.${sortBy}`, sortOrder);
    queryBuilder.take(limit).skip(offset);
    const [userPosts, total] = await queryBuilder.getManyAndCount();
    const response: GetAllPostsReponseModel[] = userPosts.map((post) => {
      return {
        post_id: post?.id,
        content: post?.content,
        image_url: post?.image_url,
        like_count: post?.like_count,
        share_count: post?.share_count,
        comment_count: post?.comment_count,
        self_comment: post?.self_comment || '',
        comments: post?.comments?.slice(0, 2).map((comment) => ({
          id: comment?.id,
          content: comment?.content,
          user_id: comment?.user.id,
          user_name: comment?.user.user_name,
          created_date: comment?.created_date?.toString() ?? null,
        })),
        user: {
          id: post?.user?.id,
          user_name: post?.user?.user_name,
          profile_pic_url: post?.user?.photo_url || '',
        },
        created_date: post?.created_date?.toString() ?? null,
        modified_date: post?.modified_date?.toString() ?? null,
        is_liked:
          post.likes?.some((like) => like.user_id === currentUserId) ?? false,
        is_saved:
          post.saved_posts?.some((spost) => spost.user_id === currentUserId) ??
          false,
      };
    });

    return { count: total, rows: response };
  }

  async getUserPosts(
    alluserPostDto: UserAllPostsDto,
    currentUserId: number,
  ): Promise<SearchResponse<UserAllPostsResponseModel>> {
    const {
      offset,
      limit,
      userId,
      sortBy = PostSortBy.CREATED_DATE,
      sortOrder = SortOrder.DESC,
    } = alluserPostDto;

    const userNotFoundError = {
      error: ErrorType.UserNotFound,
      message: ErrorMessages[ErrorType.UserNotFound],
    };
    const postsUser = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'is_private'],
      relations: ['followings'],
    });
    if (!postsUser) {
      throw new NotFoundException(userNotFoundError);
    }

    if (Number(postsUser?.id) !== currentUserId && postsUser.is_private) {
      const is_following =
        postsUser.followings?.some(
          (f) =>
            f.follower_id === currentUserId &&
            f.following_id === postsUser.id &&
            f.status == FollowingsEnum.ACCEPTED,
        ) ?? false;
      if (!is_following) {
        throw new ConflictException({
          error: ErrorType.UserAcountPrivate,
          message: ErrorMessages[ErrorType.UserAcountPrivate],
        });
      }
    }
    const queryBuilder = this.postsRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'user')
      .leftJoinAndSelect('user.followers', 'followers')
      .leftJoinAndSelect('p.comments', 'comment')
      .leftJoinAndSelect('comment.user', 'commentUser')
      .leftJoinAndSelect('p.likes', 'like')
      .leftJoinAndSelect('p.saved_posts', 'saved_post')
      .where('p.deleted_date IS NULL AND p.user_id = :userId', { userId })
      .andWhere(
        `(
        user.is_private = false
        OR user.id = :userId
        OR followers.follower_id = :userId
      )`,
        { userId },
      );

    queryBuilder.addOrderBy(`p.${sortBy}`, sortOrder);
    queryBuilder.take(limit).skip(offset);
    const [posts, total] = await queryBuilder.getManyAndCount();
    const response: UserAllPostsResponseModel[] = posts.map((post) => ({
      post_id: post?.id,
      content: post?.content,
      image_url: post?.image_url,
      like_count: post?.like_count,
      share_count: post?.share_count,
      comment_count: post?.comment_count,
      self_comment: post?.self_comment || '',
      comments: post?.comments?.slice(0, 2).map((comment) => ({
        id: comment?.id,
        content: comment?.content,
        user_id: comment?.user.id,
        user_name: comment?.user.user_name,
        created_date: comment?.created_date?.toString() ?? null,
      })),
      user: {
        id: post?.user?.id,
        user_name: post?.user?.user_name,
        profile_pic_url: post?.user?.photo_url || '',
      },
      created_date: post?.created_date?.toString() ?? null,
      modified_date: post?.modified_date?.toString() ?? null,
      is_liked:
        post.likes?.some((like) => like.user_id === currentUserId) ?? false,
      is_saved:
        post.saved_posts?.some((spost) => spost.user_id === currentUserId) ??
        false,
    }));

    return { count: total, rows: response };
  }

  async getPostById(
    currentUserId: number,
    postId: number,
  ): Promise<GetPostByIdReponse> {
    const post = await this.postsRepository.findOne({
      where: { id: postId },
      relations: ['user', 'likes', 'saved_posts'],
    });

    if (!post) {
      throw new NotFoundException({
        error: ErrorType.PostNotFound,
        message: ErrorMessages[ErrorType.PostNotFound],
      });
    }
    const response: GetPostByIdReponse = {
      id: post?.id,
      content: post?.content,
      image_url: post?.image_url,
      like_count: post?.like_count,
      share_count: post?.share_count,
      comment_count: post?.comment_count,
      self_comment: post?.self_comment || '',
      user: {
        id: post?.user?.id,
        user_name: post?.user?.user_name,
        profile_pic_url: post?.user?.photo_url || '',
      },
      created_date: post?.created_date?.toString() ?? null,
      modified_date: post?.modified_date?.toString() ?? null,
      is_liked:
        post.likes?.some((like) => like.user_id === currentUserId) ?? false,
      is_saved:
        post.saved_posts?.some((spost) => spost.user_id === currentUserId) ??
        false,
    };

    return response;
  }

  async updatePost(
    postId: number,
    currentUserId: number,
    updatePostDto: UpdatePostDto,
  ): Promise<void> {
    if (Number(updatePostDto?.user_id) !== Number(currentUserId)) {
      throw new NotFoundException({
        error: ErrorType.PostNotToBeCreate,
        message: ErrorMessages[ErrorType.PostNotToBeCreate],
      });
    }
    const post = await this.postsRepository.findOne({
      where: { id: postId },
      relations: ['user'],
    });
    if (!post) {
      throw new NotFoundException({
        error: ErrorType.PostNotFound,
        message: ErrorMessages[ErrorType.PostNotFound],
      });
    }

    const { content, comment } = updatePostDto;

    if (content !== undefined) {
      post.content = content;
    }
    if (comment !== undefined) {
      post.self_comment = comment;
    }

    await this.postsRepository.save(post);
  }

  async deletePost(id: number, user_id: number): Promise<void> {
    const post = await this.postsRepository.findOne({
      where: { id: id },
      relations: ['user'],
    });
    if (!post) {
      throw new NotFoundException({
        error: ErrorType.PostNotFound,
        message: ErrorMessages[ErrorType.PostNotFound],
      });
    }
    if (post?.user_id !== user_id) {
      throw new ForbiddenException({
        error: ErrorType.PostNotAuthorized,
        message: ErrorMessages[ErrorType.PostNotAuthorized],
      });
    }

    post.deleted_date = new Date();
    await this.postsRepository.save(post);
  }
}
