import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePost } from '../posts/entity/post.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entity/comment.entity';
import { CommentsPostUserListResponseModel } from './interface/comments.interface';
import { CommentOnPostDto } from './dto/comment-on-post-dto';
import { ErrorMessages, ErrorType } from 'src/helper';
import { Users } from '../users/entity/user.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CreatePost)
    private postsRepository: Repository<CreatePost>,
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async getPostById(id: number): Promise<CreatePost> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException({
        error: ErrorType.PostNotFound,
        message: ErrorMessages[ErrorType.PostNotFound],
      });
    }

    return post;
  }
  async getUserById(id: number): Promise<Users> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException({
        error: ErrorType.UserNotFound,
        message: ErrorMessages[ErrorType.UserNotFound],
      });
    }

    return user;
  }

  async commentsPostAllUserList(
    post_id: number,
    currentUserId: number,
  ): Promise<CommentsPostUserListResponseModel[]> {
    const queryBuilder = this.commentsRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.user', 'user')
      .leftJoinAndSelect('user.followings', 'followings')
      .where('c.deleted_date IS NULL AND c.post_id = :post_id', { post_id })
      .andWhere('user.deleted_date IS NULL');

    const [commentUsers] = await queryBuilder.getManyAndCount();
    console.log('commentUsers post_id', post_id);
    console.log('commentUsers currentUserId', currentUserId);
    console.log('commentUsers', commentUsers);
    const result: CommentsPostUserListResponseModel[] = commentUsers.map(
      (comment) => {
        const commentUser = comment.user;
        const followRelation = commentUser.followings?.find(
          (f) =>
            f.follower_id === currentUserId &&
            f.following_id === commentUser.id,
        );
        return {
          id: comment.id,
          comment: comment.content,
          created_date: comment.created_date.toString(),
          user: {
            id: commentUser.id,
            user_name: commentUser.user_name,
            first_name: commentUser?.first_name || '',
            last_name: commentUser?.last_name || '',
            photo_url: commentUser?.photo_url || '',
            bio: commentUser?.bio || '',
            is_following:
              commentUser?.followings?.some(
                (f) =>
                  f.follower_id === currentUserId &&
                  f.following_id === commentUser.id,
              ) ?? false,
            follow_status: followRelation?.status || null,
          },
        };
      },
    );

    return result;
  }

  async userCommentPost(
    post_id: number,
    commentPaylodValue: CommentOnPostDto,
  ): Promise<CommentsPostUserListResponseModel> {
    const result = await this.postsRepository.manager.transaction(async () => {
      const newComment = this.commentsRepository.create({
        user_id: commentPaylodValue.user_id,
        post_id,
        content: commentPaylodValue.comment,
      });

      const savedComment = await this.commentsRepository.save(newComment);

      const post = await this.getPostById(post_id);
      post.comment_count += 1;
      await this.postsRepository.save(post);

      const user = await this.getUserById(commentPaylodValue.user_id);
      const response: CommentsPostUserListResponseModel = {
        id: savedComment?.id,
        comment: savedComment.content,
        created_date: savedComment.created_date?.toString() ?? '',
        user: {
          id: user.id,
          user_name: user.user_name,
          first_name: user.first_name ?? '',
          last_name: user.last_name ?? '',
          bio: user.bio ?? '',
          photo_url: user.photo_url ?? '',
          is_following: false,
          follow_status: null,
        },
      };
      return response;
    });
    return result;
  }

  async deletePostComment(comment_id: number, user_id: number): Promise<void> {
    const comment = await this.commentsRepository.findOne({
      where: { id: comment_id },
      relations: ['user', 'post', 'post.user'],
    });
    if (!comment) {
      throw new NotFoundException({
        error: ErrorType.CommentNotFound,
        message: ErrorMessages[ErrorType.CommentNotFound],
      });
    }

    const post = await this.postsRepository.findOne({
      where: { id: comment.post_id },
      relations: ['user'],
    });
    if (!post) {
      throw new NotFoundException({
        error: ErrorType.PostNotFound,
        message: ErrorMessages[ErrorType.PostNotFound],
      });
    }

    const isCommentOwner = comment.user_id === user_id;
    const isPostOwner = post.user.id === user_id;
    if (!isCommentOwner && !isPostOwner) {
      throw new ForbiddenException({
        error: ErrorType.CommentNotAuthorized,
        message: ErrorMessages[ErrorType.CommentNotAuthorized],
      });
    }

    await this.commentsRepository.manager.transaction(async (manager) => {
      comment.deleted_date = new Date();
      await manager.save(Comment, comment);

      if (post.comment_count > 0) {
        post.comment_count -= 1;
        await manager.save(CreatePost, post);
      }
    });
  }
}
