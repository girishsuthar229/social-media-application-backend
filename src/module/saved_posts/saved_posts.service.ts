import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorMessages, ErrorType } from 'src/helper';
import { SavedAllPostsResponseModel } from './interface/save_posts.interface';
import { SearchResponse } from 'src/helper/interface';
import { UserAllPostsDto } from '../posts/dto/user-all-posts.dto';
import { PostSortBy } from '../posts/dto/query-post.dto';
import { SortOrder } from '../users/dto/get-all-users.dto';
import { SavedPostEntity } from './entity/saved_posts.entity';
import { FollowingsEnum } from '../follows/entity/follow.entity';

@Injectable()
export class SavedPostsService {
  constructor(
    @InjectRepository(SavedPostEntity)
    private readonly savedPostRepository: Repository<SavedPostEntity>,
  ) {}

  async savePost(userId: number, postId: number): Promise<void> {
    const existingSave = await this.savedPostRepository.findOne({
      where: { user: { id: userId }, post: { id: postId } },
    });
    if (existingSave) {
      throw new ConflictException({
        error: ErrorType.AlreadySavedPost,
        message: ErrorMessages[ErrorType.AlreadySavedPost],
      });
    }

    const savedPost = this.savedPostRepository.create({
      user: { id: userId },
      post: { id: postId },
    });
    await this.savedPostRepository.save(savedPost);
  }

  async unSavePost(userId: number, postId: number): Promise<void> {
    const existingSave = await this.savedPostRepository.findOne({
      where: { user: { id: userId }, post: { id: postId } },
    });
    if (!existingSave) {
      throw new ConflictException({
        error: ErrorType.AlreadyUnSavedPost,
        message: ErrorMessages[ErrorType.AlreadyUnSavedPost],
      });
    }
    await this.savedPostRepository.manager.transaction(async (manager) => {
      await manager.delete(SavedPostEntity, existingSave.id);
    });
  }

  async getAllSavedPosts(
    alluserPostDto: UserAllPostsDto,
  ): Promise<SearchResponse<SavedAllPostsResponseModel>> {
    const {
      offset,
      limit,
      userId,
      sortBy = PostSortBy.CREATED_DATE,
      sortOrder = SortOrder.DESC,
    } = alluserPostDto;

    const queryBuilder = this.savedPostRepository
      .createQueryBuilder('sp')
      .leftJoinAndSelect('sp.post', 'post')
      .leftJoinAndSelect('post.user', 'postOwner')
      .leftJoinAndSelect('postOwner.followers', 'followers')
      .where('post.deleted_date IS NULL AND sp.user_id = :userId', { userId })
      .andWhere(
        `(postOwner.is_private = false OR postOwner.id = :userId
              OR EXISTS (
                SELECT 1 FROM follows f
                WHERE f.follower_id = :userId AND f.following_id = postOwner.id  AND f.status = :acceptedStatus
              )
            )`,
        {
          userId,
          acceptedStatus: FollowingsEnum.ACCEPTED,
        },
      );

    queryBuilder.addOrderBy(`sp.${sortBy}`, sortOrder);
    queryBuilder.take(limit).skip(offset);
    const [savedPosts, total] = await queryBuilder.getManyAndCount();

    const response: SavedAllPostsResponseModel[] = savedPosts.map((spost) => {
      return {
        id: spost.id,
        post_id: spost?.post.id,
        image_url: spost?.post.image_url,
        like_count: spost?.post.like_count,
        share_count: spost?.post.share_count,
        comment_count: spost?.post.comment_count,
        self_comment: spost?.post.self_comment || '',
        is_following:
          spost?.post?.user.followers?.some(
            (f) =>
              f.follower_id === alluserPostDto.userId &&
              f.following_id === spost?.post?.user.id,
          ) ?? false,
      };
    });

    return { count: total, rows: response };
  }
}
