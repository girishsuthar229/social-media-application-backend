import { Module } from '@nestjs/common';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikeUnlikePost } from './entity/like.entity';
import { CreatePost } from '../posts/entity/post.entity';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_FORGOT_PASSWORD_SECRET,
      signOptions: { expiresIn: '2h' },
    }),
    TypeOrmModule.forFeature([LikeUnlikePost, CreatePost]),
  ],
  providers: [LikesService],
  controllers: [LikesController],
  exports: [LikesService],
})
export class LikesModule {}
