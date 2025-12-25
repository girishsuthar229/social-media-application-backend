import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserMessageListModel } from '../interface/message.interface';
import { NewUserNotification } from 'src/module/users/interface/users.interface';
import * as dotenv from 'dotenv';

dotenv.config();

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('User connected:', client.id);
    const userId = client.handshake.query.userId;
    if (userId) {
      client.join(`user_${userId}`);
      console.log(`User ${userId} joined the room`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log('User disconnected:', client.id);
    const userId = client.handshake.query.userId;
    if (userId) {
      client.leave(`user_${userId}`);
      console.log(`User ${userId} left the room`);
    }
  }

  //Chat message event
  @SubscribeMessage('send_message')
  async handleMessage(newMessage: UserMessageListModel) {
    try {
      this.server
        .to(`user_${newMessage.receiver_id}`)
        .emit('receive_message', newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  async handleMessageSocket(newMessage: UserMessageListModel) {
    try {
      this.server
        .to(`user_${newMessage.receiver_id}`)
        .emit('receive_message', newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
  //New user notification
  async notifyNewUser(user: NewUserNotification) {
    console.log('notifyNewUser before', user);
    try {
      this.server.emit('new_user_created', {
        user,
      });
    } catch (error) {
      console.error('Error new user created:', error);
    }
  }
}
