import { BaseEntity } from 'src/database/entities/base.entity';
import { Comment } from 'src/module/comments/entity/comment.entity';
import { LikeUnlikePost } from 'src/module/likes/entity/like.entity';
import { SavedPostEntity } from 'src/module/saved_posts/entity/saved_posts.entity';
import { Users } from 'src/module/users/entity/user.entity';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity('posts')
export class CreatePost extends BaseEntity {
  @Column('text')
  content: string;

  @Column({ type: 'varchar', nullable: true })
  image_url: string;

  @Column('int', { default: 0 })
  like_count: number;

  @Column('int', { default: 0 })
  share_count: number;

  @Column()
  user_id: number;

  @ManyToOne(() => Users, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @Column({ type: 'timestamp', nullable: true })
  deleted_date: Date;

  @Column('text', { nullable: true })
  self_comment: string;

  @Column('int', { default: 0 })
  comment_count: number;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => LikeUnlikePost, (like) => like.post)
  likes: LikeUnlikePost[];

  @OneToMany(() => SavedPostEntity, (saved_post) => saved_post.post)
  saved_posts: SavedPostEntity[];
}
