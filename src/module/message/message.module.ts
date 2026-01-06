import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { Message } from './entity/message.entity';
import { Users } from '../users/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Users])],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
