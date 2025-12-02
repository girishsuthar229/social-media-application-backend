import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../users/entity/user.entity';
import { FollowingsEnum, Follows } from './entity/follow.entity';
import { IsNull, Repository } from 'typeorm';
import { ErrorMessages, ErrorType } from 'src/helper';
import {
  FollowUnFollowResponseModel,
  FollowUserListResponseModel,
  PendingFollowUsers,
} from './interface/follow.interface';
import {
  FollowAllUserDto,
  PostSortBy,
  SortOrder,
} from './dto/follow-all-user.dto';
import { SearchResponse } from 'src/helper/interface';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(Follows)
    private readonly followsRepository: Repository<Follows>,
  ) {}

  async followUser(
    targetUserId: number,
    currentUserId: number,
  ): Promise<FollowUnFollowResponseModel> {
    if (targetUserId === currentUserId) {
      throw new ForbiddenException({
        error: ErrorType.FollowNotAuthorized,
        message: ErrorMessages[ErrorType.FollowNotAuthorized],
      });
    }

    const targetUser = await this.usersRepository.findOne({
      where: { id: targetUserId, deleted_date: IsNull() },
    });

    if (!targetUser) {
      throw new NotFoundException({
        error: ErrorType.UserNotFound,
        message: ErrorMessages[ErrorType.UserNotFound],
      });
    }

    const existingFollow = await this.followsRepository.findOne({
      where: {
        follower_id: currentUserId,
        following_id: targetUserId,
      },
    });

    if (existingFollow) {
      if (existingFollow.status === FollowingsEnum.PENDING) {
        throw new ConflictException({
          error: ErrorType.AlreadyFollowRequest,
          message: ErrorMessages[ErrorType.AlreadyFollowRequest],
        });
      }
      if (existingFollow.status === FollowingsEnum.ACCEPTED) {
        throw new ConflictException({
          error: ErrorType.AlreadyFollowUser,
          message: ErrorMessages[ErrorType.AlreadyFollowUser],
        });
      }
    }

    let followStatus = targetUser.is_private
      ? FollowingsEnum.PENDING
      : FollowingsEnum.ACCEPTED;
    const follow = this.followsRepository.create({
      follower_id: currentUserId,
      following_id: targetUserId,
      status: followStatus,
    });
    await this.followsRepository.save(follow);

    return {
      id: targetUser.id,
      user_name: targetUser.user_name,
      is_following: true,
      follow_status: followStatus,
    };
  }

  async getPendingFollowRequests(
    userId: number,
    followAllUserDto: FollowAllUserDto,
    currentUserId: number,
  ): Promise<SearchResponse<PendingFollowUsers>> {
    const {
      offset,
      limit,
      sortBy = 'created_date',
      sortOrder = 'DESC',
    } = followAllUserDto;

    if (userId !== currentUserId) {
      throw new ForbiddenException({
        error: ErrorType.FollowRequestNotAllow,
        message: ErrorMessages[ErrorType.FollowRequestNotAllow],
      });
    }

    const queryBuilder = await this.followsRepository
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.follower', 'followUser')
      .leftJoinAndSelect('followUser.followings', 'followings')
      .where('f.following_id = :userId', { userId });

    queryBuilder.addOrderBy(`f.${sortBy}`, sortOrder);
    queryBuilder.take(limit).skip(offset);
    const [followUsers, total] = await queryBuilder.getManyAndCount();

    // Prepare the response data
    const result = followUsers.map((follow) => {
      const followUser = follow.follower;
      const followRelation = followUser.followings?.find(
        (f) => f.follower_id === userId && f.following_id === followUser.id,
      );
      return {
        id: follow.id,
        created_date: follow?.created_date?.toString(),
        follow_me_status: follow?.status || null,
        user: {
          user_id: followUser?.id,
          user_name: followUser?.user_name,
          first_name: followUser?.first_name,
          last_name: followUser?.last_name,
          photo_url: followUser?.photo_url,
          bio: followUser?.bio,
          is_following:
            followUser?.followings?.some(
              (f) =>
                f.follower_id === userId && f.following_id === followUser.id,
            ) ?? false,
          follow_status: followRelation?.status || null,
        },
      };
    });

    return { count: total, rows: result };
  }

  async acceptFollowRequest(userId: number, requestId: number): Promise<void> {
    const followRequest = await this.followsRepository.findOne({
      where: { id: requestId, status: FollowingsEnum.PENDING },
    });

    if (!followRequest) {
      throw new NotFoundException({
        error: ErrorType.FollowRequestNotFound,
        message: ErrorMessages[ErrorType.FollowRequestNotFound],
      });
    }
    if (followRequest.following_id !== userId) {
      throw new ConflictException({
        error: ErrorType.FollowRequestNotAllow,
        message: ErrorMessages[ErrorType.FollowRequestNotAllow],
      });
    }

    followRequest.status = FollowingsEnum.ACCEPTED;
    await this.followsRepository.save(followRequest);
  }

  async cancelFollowRequest(userId: number, requestId: number): Promise<void> {
    const followRequest = await this.followsRepository.findOne({
      where: { id: requestId, status: FollowingsEnum.PENDING },
    });

    if (!followRequest) {
      throw new NotFoundException({
        error: ErrorType.FollowRequestNotFound,
        message: ErrorMessages[ErrorType.FollowRequestNotFound],
      });
    }

    if (followRequest.following_id !== userId) {
      throw new ForbiddenException({
        error: ErrorType.FollowRequestNotAllow,
        message: ErrorMessages[ErrorType.FollowRequestNotAllow],
      });
    }
    await this.followsRepository.remove(followRequest);
  }

  async unfollowUser(
    targetUserId: number,
    currentUserId: number,
  ): Promise<void> {
    if (targetUserId === currentUserId) {
      throw new ForbiddenException({
        error: ErrorType.FollowNotAuthorized,
        message: ErrorMessages[ErrorType.FollowNotAuthorized],
      });
    }

    const follow = await this.followsRepository.findOne({
      where: {
        follower_id: currentUserId,
        following_id: targetUserId,
      },
    });

    if (!follow) {
      throw new ConflictException({
        error: ErrorType.AlreadyUnFollowUser,
        message: ErrorMessages[ErrorType.AlreadyUnFollowUser],
      });
    }

    await this.followsRepository.remove(follow);
  }

  async getFollowersList(
    userId: number,
    followAllUserDto: FollowAllUserDto,
    currentUserId: number,
  ): Promise<SearchResponse<FollowUserListResponseModel>> {
    const {
      offset,
      limit,
      sortBy = PostSortBy.CREATED_DATE,
      sortOrder = SortOrder.DESC,
    } = followAllUserDto;

    const queryBuilder = await this.followsRepository
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.follower', 'followUser')
      .leftJoinAndSelect('followUser.followings', 'followings')
      .where('f.following_id = :userId', { userId })
      .andWhere('f.status = :status', { status: FollowingsEnum.ACCEPTED });

    queryBuilder.addOrderBy(`f.${sortBy}`, sortOrder);
    queryBuilder.take(limit).skip(offset);

    const [followUsers, total] = await queryBuilder.getManyAndCount();
    const result: FollowUserListResponseModel[] = followUsers.map((follow) => {
      const followerUser = follow.follower;
      const followRelation = followerUser.followings?.find(
        (f) =>
          f.follower_id === currentUserId && f.following_id === followerUser.id,
      );
      return {
        id: followerUser?.id,
        user_name: followerUser?.user_name,
        first_name: followerUser?.first_name || '',
        last_name: followerUser?.last_name || '',
        photo_url: followerUser?.photo_url || '',
        bio: followerUser?.bio || '',
        is_following:
          followerUser?.followings?.some(
            (f) =>
              f.follower_id === currentUserId &&
              f.following_id === followerUser.id,
          ) ?? false,
        follow_status: followRelation?.status || null,
      };
    });

    return { count: total, rows: result };
  }

  async getFollowingList(
    userId: number,
    followAllUserDto: FollowAllUserDto,
    currentUserId: number,
  ): Promise<SearchResponse<FollowUserListResponseModel>> {
    const {
      offset,
      limit,
      sortBy = PostSortBy.CREATED_DATE,
      sortOrder = SortOrder.DESC,
    } = followAllUserDto;
    const queryBuilder = this.followsRepository
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.following', 'followingUser')
      .leftJoinAndSelect('followingUser.followings', 'followings')
      .where('f.follower_id = :userId', { userId })
      .andWhere('f.status = :status', { status: FollowingsEnum.ACCEPTED });

    queryBuilder.addOrderBy(`f.${sortBy}`, sortOrder);
    queryBuilder.take(limit).skip(offset);
    const [followingsUsers, total] = await queryBuilder.getManyAndCount();
    const result: FollowUserListResponseModel[] = followingsUsers.map(
      (fUser) => {
        const following = fUser.following;
        const followRelation = following.followings?.find(
          (f) =>
            f.follower_id === currentUserId && f.following_id === following.id,
        );
        return {
          id: following?.id,
          user_name: following?.user_name,
          first_name: following?.first_name || '',
          last_name: following?.last_name || '',
          photo_url: following?.photo_url || '',
          bio: following?.bio || '',
          is_following:
            following?.followings?.some(
              (f) =>
                f.follower_id === currentUserId &&
                f.following_id === following.id,
            ) ?? false,
          follow_status: followRelation?.status || null,
        };
      },
    );

    return { count: total, rows: result };
  }
}
