import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePost } from '../posts/entity/post.entity';
import { LikeUnlikePost } from './entity/like.entity';
import { Repository } from 'typeorm';
import { ErrorMessages, ErrorType } from 'src/helper';
import { LikePostUserListResponseModel } from './interface/likes.interface';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(CreatePost)
    private postsRepository: Repository<CreatePost>,
    @InjectRepository(LikeUnlikePost)
    private readonly likesRepository: Repository<LikeUnlikePost>,
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
  async likePost(post_id: number, user_id: number): Promise<void> {
    const existingLike = await this.likesRepository.findOne({
      where: { post_id, user_id },
    });
    if (existingLike) {
      throw new ConflictException({
        error: ErrorType.AlreadyLikedPost,
        message: ErrorMessages[ErrorType.AlreadyLikedPost],
      });
    }

    await this.postsRepository.manager.transaction(async (manager) => {
      const newLike = this.likesRepository.create({
        user_id: user_id,
        post_id: post_id,
      });
      await manager.save(newLike);

      const post = await this.getPostById(post_id);
      post.like_count += 1;
      await this.postsRepository.save(post);
    });
  }

  async unlikePost(post_id: number, user_id: number): Promise<void> {
    const existingLike = await this.likesRepository.findOne({
      where: { post_id, user_id },
    });

    if (!existingLike) {
      throw new ConflictException({
        error: ErrorType.AlreadyUnLikedPost,
        message: ErrorMessages[ErrorType.AlreadyUnLikedPost],
      });
    }

    await this.postsRepository.manager.transaction(async (manager) => {
      await manager.delete(LikeUnlikePost, existingLike.id);

      const post = await this.getPostById(post_id);
      if (post.like_count > 0) {
        post.like_count -= 1;
      }
      await manager.save(post);
    });
  }

  async likePostAllUserList(
    post_id: number,
  ): Promise<LikePostUserListResponseModel[]> {
    const likedUsers = await this.likesRepository.find({
      where: { post_id },
      relations: ['user'],
    });

    const result: LikePostUserListResponseModel[] = likedUsers.map((like) => ({
      id: like.user.id,
      user_name: like.user.user_name,
      first_name: like.user?.first_name || '',
      last_name: like.user?.last_name || '',
      photo_url: like.user?.photo_url || '',
      bio: like.user?.bio || '',
      is_following: false,
      //   is_following: like.user?.is_following || '',
    }));

    return result;
  }
}
