import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { Message } from './entity/message.entity';
import { ChatGateway } from '../mailer/gateway/chat.gateway';
import { Users } from '../users/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Users])],
  controllers: [MessageController],
  providers: [MessageService, ChatGateway],
  exports: [MessageService, ChatGateway],
})
export class MessageModule {}
