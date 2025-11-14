import { BaseEntity } from 'src/database/entities/base.entity';
import { CreatePost } from 'src/module/posts/entity/post.entity';
import { Users } from 'src/module/users/entity/user.entity';
import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';

@Entity('likes')
export class LikeUnlikePost extends BaseEntity {
  @Column('int')
  user_id: number;

  @Column('int')
  post_id: number;

  @ManyToOne(() => Users, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @ManyToOne(() => CreatePost, (post) => post.likes)
  @JoinColumn({ name: 'post_id' })
  post: CreatePost;
}
