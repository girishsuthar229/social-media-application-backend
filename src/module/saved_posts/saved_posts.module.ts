import { Module } from '@nestjs/common';
import { SavedPostsController } from './saved_posts.controller';
import { SavedPostsService } from './saved_posts.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedPostEntity } from './entity/saved_posts.entity';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_FORGOT_PASSWORD_SECRET,
      signOptions: { expiresIn: '2h' },
    }),
    TypeOrmModule.forFeature([SavedPostEntity]),
  ],
  controllers: [SavedPostsController],
  providers: [SavedPostsService],
  exports: [SavedPostsService],
})
export class SavedPostsModule {}
