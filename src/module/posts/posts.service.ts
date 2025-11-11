import {
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
  UserAllPostsResponseModel,
} from './interface/posts.interface';
import { UserAllPostsDto } from './dto/user-all-posts.dto';
import { ErrorMessages } from 'src/helper';
import { Users } from '../users/entity/user.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(CreatePost)
    private postsRepository: Repository<CreatePost>,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    // @InjectRepository(FollowEntity)
    // private followersRepository: Repository<FollowEntity>,
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
      comment: comment || '',
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
      .leftJoinAndSelect('p.user', 'user')
      .leftJoinAndSelect('p.comments', 'comment')
      .leftJoinAndSelect('p.likes', 'like')
      .where('p.deleted_date IS NULL');

    queryBuilder.addOrderBy(`p.${sortBy}`, sortOrder);
    queryBuilder.take(limit).skip(offset);
    const [posts, total] = await queryBuilder.getManyAndCount();
    const response: GetAllPostsReponseModel[] = posts.map((post) => {
      const isLiked =
        post.likes?.some((like) => like.user_id === currentUserId) ?? false;
      return {
        post_id: post?.id,
        content: post?.content,
        image_url: post?.image_url,
        like_count: post?.like_count,
        share_count: post?.share_count,
        comment_count: post?.comment_count,
        self_comment: post?.comment || '',
        comments: post?.comments.slice(0, 2).map((comment) => ({
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
        is_liked: isLiked,
      };
    });

    return { count: total, rows: response };
  }

  async getUserPosts(
    loggedUserId: number,
    alluserPostDto: UserAllPostsDto,
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
    // Check if the user's account is private
    const postsUser = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'is_private'],
    });
    if (!postsUser) {
      throw new NotFoundException(userNotFoundError);
    }

    // const isFollowing = await this.followersRepository.exists({
    //   where: {
    //     followerId: loggedUserId,
    //     followedId: user_id,
    //   },
    // });
    // if (postsUser.is_private && !isFollowing && loggedUserId !== user_id) {
    //   return { count: 0, rows: [] };
    // }

    const queryBuilder = this.postsRepository
      .createQueryBuilder('p')
      .where('p.deleted_date IS NULL AND p.user_id = :userId', { userId });
    queryBuilder.addOrderBy(`p.${sortBy}`, sortOrder);
    queryBuilder.take(limit).skip(offset);
    const [posts, total] = await queryBuilder.getManyAndCount();
    const response: UserAllPostsResponseModel[] = posts.map((post) => ({
      post_id: post?.id,
      image_url: post?.image_url,
      like_count: post?.like_count,
      share_count: post?.share_count,
      comment_count: post?.comment_count,
      self_comment: post?.comment || '',
      is_following: true,
      // is_following: isFollowing || false,
    }));

    // Check if logged user is requesting their own posts
    if (loggedUserId === userId || !postsUser.is_private) {
      return { count: total, rows: response };
    }

    return { count: 0, rows: [] };
  }

  async getPostById(id: number): Promise<CreatePost> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async updatePost(
    id: number,
    user_id: number,
    updatePostDto: UpdatePostDto,
  ): Promise<CreatePost> {
    const post = await this.getPostById(id);

    if (post.user.id !== user_id) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    const { content, comment, post_image, remove_image } = updatePostDto;

    if (content !== undefined) {
      post.content = content;
    }
    if (comment !== undefined) {
      post.comment = comment;
    }

    // Handle image update
    if (remove_image && post.image_url) {
      // Delete old image
      deleteLocalFile(
        post.image_url,
        `${UploadFolders.POST_IMAGES}/${user_id}`,
      );
      post.image_url = '';
    }

    if (post_image) {
      // Delete old image if exists
      if (post.image_url) {
        deleteLocalFile(
          post.image_url,
          `${UploadFolders.POST_IMAGES}/${user_id}`,
        );
      }

      // Upload new image
      const uploadedPostImageUrl = saveFileLocally(
        post_image,
        `${UploadFolders.POST_IMAGES}/${user_id}`,
      );
      post.image_url = uploadedPostImageUrl;
    }

    return this.postsRepository.save(post);
  }

  async deletePost(id: number, user_id: number): Promise<void> {
    const post = await this.getPostById(id);

    // Check if user owns the post
    if (post.user.id !== user_id) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    post.deleted_date = new Date();
    await this.postsRepository.save(post);
  }

  async sharePost(id: number): Promise<CreatePost> {
    const post = await this.getPostById(id);

    post.share_count += 1;
    return this.postsRepository.save(post);
  }
}
