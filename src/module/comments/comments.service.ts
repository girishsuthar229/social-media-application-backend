import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePost } from '../posts/entity/post.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entity/comment.entity';
import { CommentsPostUserListResponseModel } from './interface/comments.interface';
import { CommentOnPostDto } from './dto/comment-on-post-dto';
import { ErrorMessages, ErrorType } from 'src/helper';

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
      where: { post_id },
      relations: ['user'],
    });
    const result: CommentsPostUserListResponseModel[] = commentUsers.map(
      (comment) => ({
        id: comment.user.id,
        user_name: comment.user.user_name,
        comment: comment.content,
        first_name: comment.user?.first_name || '',
        last_name: comment.user?.last_name || '',
        photo_url: comment.user?.photo_url || '',
        bio: comment.user?.bio || '',
        is_following: false,
        created_date: comment.created_date.toString(),
        //   is_following: comment.user?.is_following || '',
      }),
    );

    return result;
  }

  async userCommentPost(
    post_id: number,
    commentPaylodValue: CommentOnPostDto,
  ): Promise<void> {
    await this.postsRepository.manager.transaction(async (manager) => {
      const newLike = this.commentsRepository.create({
        user_id: commentPaylodValue.user_id,
        post_id: post_id,
        content: commentPaylodValue.comment,
      });
      await manager.save(newLike);

      const post = await this.getPostById(post_id);
      post.comment_count += 1;
      await this.postsRepository.save(post);
    });
  }
}
