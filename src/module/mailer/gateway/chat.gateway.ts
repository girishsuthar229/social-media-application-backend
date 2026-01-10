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

  // @SubscribeMessage('edit_message')
  // async handleEditMessage(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody()
  //   data: {
  //     message_id: number;
  //     message: string;
  //     receiver_id: number;
  //   },
  // ) {
  //   try {
  //     const senderId = parseInt(client.handshake.query.userId as string, 10);
  //     const message = await this.messageService.getMessageById(data.message_id);
  //     if (!message && message.sender_id !== senderId) {
  //       client.emit('message_error', {
  //         error: 'Message not found or unauthorized',
  //       });
  //       return;
  //     }

  //     // Update locally (service will handle this, but we can emit optimistically)
  //     const updatedMessage: UserMessageListModel = {
  //       id: message.id,
  //       message: data.message,
  //       is_edited: true,
  //       edited_at: new Date().toString(),
  //       created_date: message.created_at.toString(),
  //       modified_date: new Date().toString(),
  //       status: message.status,
  //       is_read: message.is_read,
  //       is_deleted: message.is_deleted,
  //       sender: {
  //         id: message.sender.id,
  //         user_name: message.sender.user_name,
  //         first_name: message.sender.first_name,
  //         last_name: message.sender.last_name,
  //         photo_url: message.sender.photo_url,
  //       },
  //       receiver: {
  //         id: message.receiver.id,
  //         user_name: message.receiver.user_name,
  //         first_name: message.receiver.first_name,
  //         last_name: message.receiver.last_name,
  //         photo_url: message.receiver.photo_url,
  //       },
  //     };

  //     // Emit to receiver
  //     this.server
  //       .to(`user_${data.receiver_id}`)
  //       .emit('message_edited', updatedMessage);

  //     // Also emit back to sender for confirmation
  //     client.emit('message_edited', updatedMessage);

  //     console.log(`Message ${data.message_id} edited by user ${senderId}`);
  //   } catch (error) {
  //     console.error('Error editing message:', error);
  //     client.emit('message_error', { error: 'Failed to edit message' });
  //   }
  // }

  @SubscribeMessage('delete_message')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      message_id: number;
      receiver_id: number;
    },
  ) {
    try {
      const senderId = parseInt(client.handshake.query.userId as string, 10);
      const message = await this.messageService.getMessageById(data.message_id);
      if (message.deleted_at === null) {
        client.emit('message_error', {
          error: 'Message not found or unauthorized',
        });
        return;
      }
      // Emit to receiver
      this.server.to(`user_${data.receiver_id}`).emit('message_deleted', {
        message_id: data.message_id,
        sender_id: senderId,
      });
      // Also emit back to sender for confirmation
      client.emit('message_deleted', {
        message_id: data.message_id,
        sender_id: senderId,
      });

      console.log(`Message ${data.message_id} deleted by user ${senderId}`);
    } catch (error) {
      console.error('Error deleting message:', error);
      client.emit('message_error', { error: 'Failed to delete message' });
    }
  }
}
