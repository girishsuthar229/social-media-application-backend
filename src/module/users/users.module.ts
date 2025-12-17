import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entity/user.entity';
import { RolesModule } from '../roles/roles.module';
import { PostsModule } from '../posts/posts.module';
import { CreatePost } from '../posts/entity/post.entity';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_FORGOT_PASSWORD_SECRET,
      signOptions: { expiresIn: '2h' },
    }),
    TypeOrmModule.forFeature([Users, CreatePost]),
    RolesModule,
    PostsModule,
    MailerModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
