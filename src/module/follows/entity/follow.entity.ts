import { BaseEntity } from 'src/database/entities/base.entity';
import { Users } from 'src/module/users/entity/user.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

export enum FollowingsEnum {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
}

@Entity({ name: 'follows' })
export class Follows extends BaseEntity {
  @Column()
  follower_id: number;

  @Column()
  following_id: number;

  @Column({
    type: 'enum',
    enum: FollowingsEnum,
    default: FollowingsEnum.PENDING,
  })
  status: FollowingsEnum;

  @ManyToOne(() => Users, (user) => user.followers)
  @JoinColumn({ name: 'follower_id' })
  follower: Users;

  @ManyToOne(() => Users, (user) => user.followings)
  @JoinColumn({ name: 'following_id' })
  following: Users;
}
