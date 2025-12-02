import { BaseEntity } from 'src/database/entities/base.entity';
import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Roles } from '../../roles/entity/role.entity';
import { Follows } from 'src/module/follows/entity/follow.entity';
import { SavedPostEntity } from 'src/module/saved_posts/entity/saved_posts.entity';
import { CreatePost } from 'src/module/posts/entity/post.entity';

@Entity('users')
export class Users extends BaseEntity {
  @Column({ length: 100, unique: true })
  user_name: string;

  @Column({ length: 100, nullable: true })
  first_name?: string;

  @Column({ length: 100, nullable: true })
  last_name?: string;

  @Column({ length: 100, nullable: true, unique: true })
  email?: string;

  @Column()
  role_id: number;

  @Column({ length: 20, nullable: true })
  mobile_number?: string;

  @Column({ type: 'timestamp', nullable: true })
  birth_date?: Date | null;

  @Column({ length: 60 })
  password_hash: string;

  @Column({ length: 300, nullable: true })
  address?: string;

  @Column({ default: false, nullable: true })
  is_forgot_token_used: boolean;

  @Column({ default: false, nullable: true })
  is_reset_token_used: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  password_token: string | null;

  @Column({ type: 'timestamp', nullable: true })
  password_set_expires_at: Date | null;

  @Column({ type: 'timestamp', precision: 3, nullable: true })
  last_login_at?: Date;

  @ManyToOne(() => Roles, (role) => role.users, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: Roles;

  @Column({ type: 'varchar', length: 6, nullable: true })
  otp: string | null;

  @Column({ type: 'timestamp', precision: 3, nullable: true })
  otp_expiration_time: Date | null;

  @Column({ type: 'varchar', length: 300, nullable: true })
  photo_url: string | null;

  @Column({ type: 'timestamp', precision: 3, nullable: true })
  deleted_date?: Date;

  @Column({ type: 'text', nullable: true })
  bio?: string | null;

  @Column({ type: 'boolean', default: false })
  is_private: boolean;

  @OneToMany(() => Follows, (follow) => follow.follower)
  followers: Follows[];

  @OneToMany(() => Follows, (follow) => follow.following)
  followings: Follows[];

  @OneToMany(() => CreatePost, (post) => post.user)
  posts: CreatePost[];
}
