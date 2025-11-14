import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePost } from '../posts/entity/post.entity';
import { IsNull, Repository } from 'typeorm';
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
  async commentsPostAllUserList(
    post_id: number,
  ): Promise<CommentsPostUserListResponseModel[]> {
    const commentUsers = await this.commentsRepository.find({
      where: { post_id, deleted_date: IsNull() },
      relations: ['user'],
    });

    const result: CommentsPostUserListResponseModel[] = commentUsers.map(
      (comment) => ({
        id: comment.id,
        comment: comment.content,
        created_date: comment.created_date.toString(),
        user: {
          id: comment.user.id,
          user_name: comment.user.user_name,
          first_name: comment.user?.first_name || '',
          last_name: comment.user?.last_name || '',
          photo_url: comment.user?.photo_url || '',
          bio: comment.user?.bio || '',
          is_following: false,
          //   is_following: comment.user?.is_following || '',
        },
      }),
    );

    return result;
  }

  async userCommentPost(
    post_id: number,
    commentPaylodValue: CommentOnPostDto,
  ): Promise<CommentsPostUserListResponseModel> {
    const result = await this.postsRepository.manager.transaction(
      async (manager) => {
        const newComment = this.commentsRepository.create({
          user_id: commentPaylodValue.user_id,
          post_id,
          content: commentPaylodValue.comment,
        });

        const savedComment = await manager.save(newComment);

        const post = await this.getPostById(post_id);
        post.comment_count += 1;
        await this.postsRepository.save(post);

        const response: CommentsPostUserListResponseModel = {
          id: savedComment?.id,
          comment: savedComment.content,
          created_date: savedComment.created_date?.toString() ?? '',
          user: {
            id: savedComment?.user.id,
            user_name: savedComment?.user.user_name,
            first_name: savedComment?.user.first_name ?? '',
            last_name: savedComment?.user.last_name ?? '',
            bio: savedComment?.user.bio ?? '',
            photo_url: savedComment?.user.photo_url ?? '',
            is_following: false,
          },
        };
        return response;
      },
    );
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
