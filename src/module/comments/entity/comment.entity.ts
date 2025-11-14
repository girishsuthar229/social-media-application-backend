import { BaseEntity } from 'src/database/entities/base.entity';
import { CreatePost } from 'src/module/posts/entity/post.entity';
import { Users } from 'src/module/users/entity/user.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('comments')
export class Comment extends BaseEntity {
  @Column('text')
  content: string;

  @Column('int')
  user_id: number;

  @Column('int')
  post_id: number;

  @ManyToOne(() => CreatePost, (post) => post.comments)
  @JoinColumn({ name: 'post_id' })
  post: CreatePost;

  @ManyToOne(() => Users, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @Column({ type: 'timestamp', nullable: true })
  deleted_date: Date;
}
