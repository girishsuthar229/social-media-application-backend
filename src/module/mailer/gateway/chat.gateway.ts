import {
  WebSocketGateway,
  WebSocketServer,
  // SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  UserMessageListModel,
  UserReadMessageModel,
  UserTypingMessage,
} from 'src/module/message/interface/message.interface';
import { MessageService } from 'src/module/message/message.service';
import { NewUserNotification } from 'src/module/users/interface/users.interface';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  constructor(private readonly messageService: MessageService) {}

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

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() newMessage: UserMessageListModel,
  ) {
    try {
      const senderId = client.handshake.query.userId as string;
      if (senderId !== newMessage.sender.id.toString()) {
        console.error('Sender ID mismatch');
        client.emit('message_error', { error: 'Invalid sender' });
        return;
      }
      // Send to receiver
      this.server
        .to(`user_${newMessage.receiver.id}`)
        .emit('receive_message', newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      client.emit('message_error', { error: 'Failed to send message' });
    }
  }

  // Check and mark messages as read
  @SubscribeMessage('read_message')
  async handleReadMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: UserReadMessageModel,
  ) {
    try {
      const userId = client.handshake.query.userId as string;
      if (userId !== payload.current_user_id.toString()) {
        client.emit('read_message_error', { error: 'Invalid user' });
        return;
      }
      const response = await this.messageService.userMessageRead(payload);
      if (response) {
        this.server
          .to(`user_${payload?.selected_user_id}`)
          .emit('check_read_message', response);
      }
      const data = await this.messageService.getUnReadMessageUsers(
        payload.current_user_id,
      );
      if (data) {
        this.server
          .to(`user_${payload.current_user_id}`)
          .emit('unread_messages_total_users', data);
      }
    } catch (error) {
      console.error('Error handling read message:', error);
      client.emit('read_message_error', {
        error: 'Failed to process read message',
      });
    }
  }

  @SubscribeMessage('typing_indicator')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: UserTypingMessage,
  ) {
    try {
      const userId = client.handshake.query.userId as string;
      this.server.to(`user_${payload.receiver_id}`).emit('user_typing', {
        receiver_id: userId,
        is_typing: payload.is_typing,
        type_user_id: payload?.type_user_id,
        type_user_name: payload?.type_user_name,
      });
    } catch (error) {
      console.error('Error handling typing indicator:', error);
    }
  }

  async notifyNewUser(@MessageBody() user: NewUserNotification) {
    try {
      this.server.emit('new_user_created', user);
    } catch (error) {
      console.error('Error new user created:', error);
    }
  }
}
