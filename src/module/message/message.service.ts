import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { Message } from './entity/message.entity';
import { NewMessageDto } from './dto/new-msg-dto';
import { Users } from '../users/entity/user.entity';
import { SearchResponse } from 'src/helper/interface';
import {
  GetAllMsgUsersDto,
  SortOrder,
  UserSortBy,
} from './dto/get-all-msg-user.dto';
import {
  MsgUserListResponseModel,
  UserMessageListModel,
  UserReadMessageModel,
} from './interface/message.interface';
import { ErrorType, MessageStatus } from 'src/helper/enum';
import { ErrorMessages } from 'src/helper';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async userSendMessage(
    newMessageDto: NewMessageDto,
  ): Promise<UserMessageListModel> {
    const newMessage = this.messageRepository.create({
      receiver_id: newMessageDto.receiver_id,
      sender_id: newMessageDto.sender_id,
      message: newMessageDto.message,
    });

    await this.messageRepository.save(newMessage);
    const savedMessage = await this.messageRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.sender', 'sender')
      .leftJoinAndSelect('m.receiver', 'receiver')
      .where('m.id = :id', { id: newMessage.id })
      .getOne();

    const sender = savedMessage?.sender;
    const receiver = savedMessage?.receiver;
    const response: UserMessageListModel = {
      id: savedMessage?.id || 0,
      message: savedMessage?.message || '',
      created_date: savedMessage?.created_date.toString() || '',
      modified_date: savedMessage?.modified_date?.toString() || '',
      status: savedMessage?.status || MessageStatus.SENT,
      is_read: savedMessage?.is_read || false,
      is_edited: savedMessage?.is_edited || false,
      sender: {
        id: sender?.id || 0,
        user_name: sender?.user_name || '',
        first_name: sender?.first_name || null,
        last_name: sender?.last_name || null,
        photo_url: sender?.photo_url || null,
      },
      receiver: {
        id: receiver?.id || 0,
        user_name: receiver?.user_name || '',
        first_name: receiver?.first_name || null,
        last_name: receiver?.last_name || null,
        photo_url: receiver?.photo_url || null,
      },
    };
    return response;
  }

  async userMessageRead(
    readMessage: UserReadMessageModel,
  ): Promise<UserMessageListModel[] | null> {
    const messages = await this.messageRepository.find({
      where: {
        sender_id: readMessage?.selected_user_id,
        receiver_id: readMessage?.current_user_id,
        deleted_date: IsNull(),
        is_read: false,
        status: MessageStatus.SENT || MessageStatus.DELIVERED,
      },
      order: { created_date: 'ASC' },
      relations: ['sender', 'receiver'],
    });

    if (messages.length > 0) {
      messages.forEach((message) => {
        message.is_read = true;
        message.status = MessageStatus.SEEN;
      });
      await this.messageRepository.save(messages);

      const msgResponse: UserMessageListModel[] = messages?.map((message) => {
        const sender = message?.sender;
        const receiver = message?.receiver;
        return {
          id: message?.id || 0,
          message: message?.message || '',
          created_date: message?.created_date.toString() || '',
          modified_date: message?.modified_date?.toString() || '',
          status: MessageStatus.SEEN,
          is_read: true,
          sender: {
            id: sender?.id || 0,
            user_name: sender?.user_name || '',
            first_name: sender?.first_name || null,
            last_name: sender?.last_name || null,
            photo_url: sender?.photo_url || null,
          },
          receiver: {
            id: receiver?.id || 0,
            user_name: receiver?.user_name || '',
            first_name: receiver?.first_name || null,
            last_name: receiver?.last_name || null,
            photo_url: receiver?.photo_url || null,
          },
        };
      });

      return msgResponse || [];
    }
    return null;
  }

  async getChatBetweenUsers(
    user1: number,
    currentUserId: number,
  ): Promise<UserMessageListModel[]> {
    const messages = await this.messageRepository.find({
      where: [
        {
          sender_id: user1,
          receiver_id: currentUserId,
          deleted_date: IsNull(),
        },
        {
          sender_id: currentUserId,
          receiver_id: user1,
          deleted_date: IsNull(),
        },
      ],
      order: { created_date: 'ASC' },
      relations: ['sender', 'receiver'],
    });

    const response: UserMessageListModel[] = messages.map((message) => {
      const sender = message.sender;
      const receiver = message.receiver;
      return {
        id: message.id,
        message: message.message,
        created_date: message.created_date.toString(),
        modified_date: message?.modified_date?.toString() || '',
        status: message?.status,
        is_read: message?.is_read,
        is_edited: message?.is_edited,
        sender: {
          id: sender?.id || 0,
          user_name: sender?.user_name || '',
          first_name: sender?.first_name || null,
          last_name: sender?.last_name || null,
          photo_url: sender?.photo_url || null,
        },
        receiver: {
          id: receiver?.id || 0,
          user_name: receiver?.user_name || '',
          first_name: receiver?.first_name || null,
          last_name: receiver?.last_name || null,
          photo_url: receiver?.photo_url || null,
        },
      };
    });

    return response;
  }

  async getAllMsgUsers(
    queryDto: GetAllMsgUsersDto,
    currentUserId: number,
  ): Promise<SearchResponse<MsgUserListResponseModel>> {
    const {
      offset,
      limit,
      searchName,
      sortBy = UserSortBy.CREATED_DATE,
      sortOrder = SortOrder.DESC,
    } = queryDto;

    const queryBuilder = this.messageRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.sender', 'sender')
      .leftJoinAndSelect('m.receiver', 'receiver')
      .where('m.deleted_date IS NULL')
      .andWhere(
        '(m.sender_id = :currentUserId OR m.receiver_id = :currentUserId)',
        { currentUserId },
      );

    queryBuilder.addOrderBy(`m.${sortBy}`, sortOrder);
    queryBuilder.take(limit).skip(offset);

    const [messages, total] = await queryBuilder.getManyAndCount();

    const usersSet = new Set<number>();
    messages.forEach((message) => {
      usersSet.add(message.sender.id);
      usersSet.add(message.receiver.id);
    });

    if (searchName) {
      const searchParts = searchName.trim().split(' ');
      let firstNameSearch = searchParts[0];
      let lastNameSearch = searchParts[1] || '';

      const usersBuilder = this.usersRepository
        .createQueryBuilder('u')
        .where(
          '(u.user_name ILIKE :searchName OR ' +
            '(u.first_name ILIKE :firstNameSearch AND u.last_name ILIKE :lastNameSearch) OR ' +
            '(u.first_name ILIKE :lastNameSearch AND u.last_name ILIKE :firstNameSearch))',
          {
            searchName: `%${searchName}%`,
            firstNameSearch: `%${firstNameSearch}%`,
            lastNameSearch: `%${lastNameSearch}%`,
          },
        );
      usersBuilder.take(limit).skip(offset);
      const [users, total] = await usersBuilder.getManyAndCount();

      const rows: MsgUserListResponseModel[] = await Promise.all(
        users.map(async (user) => {
          const lastMessage = await this.messageRepository
            .createQueryBuilder('m')
            .where(
              '(m.sender_id = :userId AND m.receiver_id = :currentUserId) OR (m.sender_id = :currentUserId AND m.receiver_id = :userId)',
              {
                userId: user.id,
                currentUserId,
              },
            )
            .orderBy('m.created_date', 'DESC')
            .getOne();

          return {
            id: user.id,
            user_name: user.user_name,
            first_name: user.first_name ?? '',
            last_name: user.last_name ?? '',
            photo_url: user.photo_url ?? '',
            message: {
              id: lastMessage?.id ?? 0,
              sender_id: lastMessage?.sender_id ?? 0,
              receiver_id: lastMessage?.receiver_id ?? 0,
              status: lastMessage?.status ?? '',
              last_message: lastMessage?.message ?? '',
              created_date: lastMessage?.created_date.toString() ?? '',
              modified_date: lastMessage?.modified_date?.toString() ?? '',
              is_read: lastMessage?.is_read,
            },
          };
        }),
      );

      return { count: total, rows };
    }

    if (usersSet.size === 0) {
      return { count: total, rows: [] };
    }

    const users = await this.usersRepository
      .createQueryBuilder('u')
      .where('u.id IN (:...userIds)', { userIds: Array.from(usersSet) })
      .getMany();
    const rows: MsgUserListResponseModel[] = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await this.messageRepository
          .createQueryBuilder('m')
          .where(
            '(m.sender_id = :userId AND m.receiver_id = :currentUserId) OR (m.sender_id = :currentUserId AND m.receiver_id = :userId)',
            {
              userId: user.id,
              currentUserId,
            },
          )
          .orderBy('m.created_date', 'DESC')
          .getOne();

        return {
          id: user.id,
          user_name: user.user_name,
          first_name: user.first_name ?? '',
          last_name: user.last_name ?? '',
          photo_url: user.photo_url ?? '',
          message: {
            id: lastMessage?.id ?? 0,
            sender_id: lastMessage?.sender_id ?? 0,
            receiver_id: lastMessage?.receiver_id ?? 0,
            last_message: lastMessage?.message ?? '',
            created_date: lastMessage?.created_date.toString() ?? '',
            modified_date: lastMessage?.modified_date?.toString() ?? '',
            status: lastMessage?.status ?? '',
            is_read: lastMessage?.is_read,
          },
        };
      }),
    );

    return { count: total, rows };
  }

  async getUnReadMessageUsers(currentUserId: number): Promise<{
    totalUsersCount: number;
    users: { m_sender_id: number; eachUserMsgCount: string }[];
  }> {
    const queryBuilder = this.messageRepository
      .createQueryBuilder('m')
      .where('m.receiver_id = :currentUserId', { currentUserId })
      .andWhere('m.is_read = :isRead', { isRead: false })
      .andWhere('m.status != :status', { status: MessageStatus.SEEN })
      .andWhere('m.deleted_date IS NULL')
      .select('m.sender_id')
      .addSelect('COUNT(m.id)', 'eachUserMsgCount')
      .groupBy('m.sender_id');

    const unreadMessageUsers: {
      m_sender_id: number;
      eachUserMsgCount: string;
    }[] = await queryBuilder.getRawMany();

    return {
      totalUsersCount: unreadMessageUsers.length,
      users: unreadMessageUsers,
    };
  }

  async updateMessage(
    messageId: number,
    currentUserId: number,
    updateMessageDto: NewMessageDto,
  ): Promise<UserMessageListModel> {
    if (Number(updateMessageDto?.sender_id) !== Number(currentUserId)) {
      throw new NotFoundException({
        error: ErrorType.PostNotToBeCreate,
        message: ErrorMessages[ErrorType.PostNotToBeCreate],
      });
    }
    const messageData = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender', 'receiver'],
    });
    if (!messageData) {
      throw new NotFoundException({
        error: ErrorType.MessageNotFound,
        message: ErrorMessages[ErrorType.MessageNotFound],
      });
    }

    if (updateMessageDto?.message !== undefined) {
      messageData.is_edited = true;
      messageData.message = updateMessageDto?.message;
      messageData.modified_date = new Date();
    }
    const updatedMessage = await this.messageRepository.save(messageData);
    const response: UserMessageListModel = {
      id: updatedMessage.id,
      message: updatedMessage.message,
      created_date: updatedMessage.created_date.toString(),
      modified_date: updatedMessage?.modified_date?.toString() || '',
      status: updatedMessage?.status,
      is_read: updatedMessage?.is_read,
      is_edited: updatedMessage?.is_edited,
      sender: {
        id: updatedMessage?.sender?.id || 0,
        user_name: updatedMessage?.sender?.user_name || '',
        first_name: updatedMessage?.sender?.first_name || null,
        last_name: updatedMessage?.sender?.last_name || null,
        photo_url: updatedMessage?.sender?.photo_url || null,
      },
      receiver: {
        id: updatedMessage?.receiver?.id || 0,
        user_name: updatedMessage?.receiver?.user_name || '',
        first_name: updatedMessage?.receiver?.first_name || null,
        last_name: updatedMessage?.receiver?.last_name || null,
        photo_url: updatedMessage?.receiver?.photo_url || null,
      },
    };
    return response;
  }

  async deleteMessage(messageId: number, sendUserId: number): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender', 'receiver'],
    });
    if (message?.sender?.id !== sendUserId) {
      throw new ForbiddenException({
        error: ErrorType.Unauthorized,
        message: ErrorMessages[ErrorType.Unauthorized],
      });
    }
    if (!message) {
      throw new NotFoundException({
        error: ErrorType.MessageNotFound,
        message: ErrorMessages[ErrorType.MessageNotFound],
      });
    }

    message.deleted_date = new Date();
    await this.messageRepository.update(messageId, {
      ...message,
    });
  }
}
