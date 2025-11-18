import { BaseEntity } from 'src/database/entities/base.entity';
import { Users } from 'src/module/users/entity/user.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity({ name: 'follows' })
export class Follows extends BaseEntity {
  @Column()
  follower_id: number;

  @Column()
  following_id: number;

  @ManyToOne(() => Users, (user) => user.following)
  @JoinColumn({ name: 'follower_id' })
  follower: Users;

  @ManyToOne(() => Users, (user) => user.followers)
  @JoinColumn({ name: 'following_id' })
  following: Users;
}
