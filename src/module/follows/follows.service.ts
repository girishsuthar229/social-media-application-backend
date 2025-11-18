import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../users/entity/user.entity';
import { Follows } from './entity/follow.entity';
import { IsNull, Repository } from 'typeorm';
import { ErrorMessages, ErrorType } from 'src/helper';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(Follows)
    private readonly followsRepository: Repository<Follows>,
  ) {}

  async followUser(targetUserId: number, currentUserId: number): Promise<void> {
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
      throw new ConflictException({
        error: ErrorType.AlreadyFollowUser,
        message: ErrorMessages[ErrorType.AlreadyFollowUser],
      });
    }

    const follow = this.followsRepository.create({
      follower_id: currentUserId,
      following_id: targetUserId,
    });

    await this.followsRepository.save(follow);
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
}
