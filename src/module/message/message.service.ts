import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
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
} from './interface/message.interface';
import { ChatGateway } from './gateway/chat.gateway';

@Injectable()
export class MessageService {
  constructor(
    private readonly chatGateway: ChatGateway,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async userSendMessage(newMessageDto: NewMessageDto): Promise<void> {
    const newMessage = this.messageRepository.create({
      receiver_id: newMessageDto.receiver_id,
      sender_id: newMessageDto.sender_id,
      message: newMessageDto.message,
    });

    const savedMessage = await this.messageRepository.save(newMessage);
    const response: UserMessageListModel = {
      id: savedMessage.id,
      sender_id: savedMessage.sender_id,
      receiver_id: savedMessage.receiver_id,
      message: savedMessage.message,
      created_at: savedMessage.created_at.toString(),
    };
    //socket
    await this.chatGateway.handleMessage(response);
  }

  async getChatBetweenUsers(
    user1: number,
    user2: number,
  ): Promise<UserMessageListModel[]> {
    const messages = await this.messageRepository.find({
      where: [
        { sender_id: user1, receiver_id: user2, deleted_at: IsNull() },
        { sender_id: user2, receiver_id: user1, deleted_at: IsNull() },
      ],
      order: { created_at: 'ASC' },
    });

    const response: UserMessageListModel[] = messages.map((message) => ({
      id: message.id,
      sender_id: message.sender_id,
      receiver_id: message.receiver_id,
      message: message.message,
      created_at: message.created_at.toString(),
    }));

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
      sortBy = UserSortBy.CREATED_AT,
      sortOrder = SortOrder.DESC,
      is_read,
    } = queryDto;

    const queryBuilder = this.messageRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.sender', 'sender')
      .leftJoinAndSelect('m.receiver', 'receiver')
      .where('m.deleted_at IS NULL')
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
      const rows: MsgUserListResponseModel[] = users.map((user) => {
        return {
          id: user.id,
          user_name: user.user_name,
          first_name: user.first_name ?? '',
          last_name: user.last_name ?? '',
          email: user.email ?? '',
          bio: user.bio ?? null,
          photo_url: user.photo_url ?? '',
          created_date: user.created_date.toString(),
          modified_date: user.modified_date?.toString() ?? null,
        };
      });

      return { count: total, rows };
    }

    // If usersSet has users, return those users from the message set
    if (usersSet.size === 0) {
      return { count: total, rows: [] };
    }

    const users = await this.usersRepository
      .createQueryBuilder('u')
      .where('u.id IN (:...userIds)', { userIds: Array.from(usersSet) })
      .getMany();
    const rows: MsgUserListResponseModel[] = users.map((user) => {
      return {
        id: user.id,
        user_name: user.user_name,
        first_name: user.first_name ?? '',
        last_name: user.last_name ?? '',
        email: user.email ?? '',
        bio: user.bio ?? null,
        photo_url: user.photo_url ?? '',
        created_date: user.created_date.toString(),
        modified_date: user.modified_date?.toString() ?? null,
      };
    });

    return { count: total, rows };
  }
}
