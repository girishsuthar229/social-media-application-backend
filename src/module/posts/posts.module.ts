import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreatePost } from './entity/post.entity';
import { JwtModule } from '@nestjs/jwt';
import { Users } from '../users/entity/user.entity';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_FORGOT_PASSWORD_SECRET,
      signOptions: { expiresIn: '2h' },
    }),
    TypeOrmModule.forFeature([CreatePost, Users]),
  ],
  providers: [PostsService],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {}
