import { BaseEntity } from 'src/database/entities/base.entity';
import { CreatePost } from 'src/module/posts/entity/post.entity';
import { Users } from 'src/module/users/entity/user.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('saved_posts')
export class SavedPostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  user_id: number;

  @Column('int')
  post_id: number;

  @Column({ type: 'timestamp', precision: 3 })
  created_date: Date;

  @Column({ length: 50, nullable: true })
  created_by?: string;

  @ManyToOne(() => CreatePost, (post) => post.id)
  @JoinColumn({ name: 'post_id' })
  post: CreatePost;

  @ManyToOne(() => Users, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: Users;
}
