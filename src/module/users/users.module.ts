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
import { MessageModule } from '../message/message.module';
import { ChatGateway } from '../mailer/gateway/chat.gateway';

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
    MessageModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, ChatGateway],
  exports: [UsersService, ChatGateway],
})
export class UsersModule {}
