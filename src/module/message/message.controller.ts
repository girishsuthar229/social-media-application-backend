import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { MessageService } from './message.service';
import { CurrentUser } from 'src/decorators';
import { IResponse, UserDetails } from 'src/helper';
import { SearchResponse } from 'src/helper/interface';
import { ResponseUtil } from 'src/interceptors';
import { GetAllMsgUsersDto } from './dto/get-all-msg-user.dto';
import {
  MsgUserListResponseModel,
  UserMessageListModel,
} from './interface/message.interface';
import { MessageOperation } from 'src/helper/enum';
import { NewMessageDto } from './dto/new-msg-dto';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('/get-user-all-messages/:selectedUserId')
  async getAllMessages(
    @Param('selectedUserId') selectedUserId: string,
    @CurrentUser() user: UserDetails,
  ) {
    const data = await this.messageService.getChatBetweenUsers(
      parseInt(selectedUserId),
      user?.id,
    );
    return ResponseUtil.success(
      data,
      MessageOperation.MESSAGE_FETCHED,
      HttpStatus.OK,
    );
  }

  @Post('/send-message')
  async userSendMessageServices(
    @Body() newMessageDto: NewMessageDto,
  ): Promise<IResponse<UserMessageListModel>> {
    const data = await this.messageService.userSendMessage(newMessageDto);
    return ResponseUtil.success(
      data,
      MessageOperation.MESSAGE_CREATE,
      HttpStatus.OK,
    );
  }

  @Post('/get-all-msg-users')
  async getAllMsgUsers(
    @Body() getAllUserDto: GetAllMsgUsersDto,
    @CurrentUser() user: UserDetails,
  ): Promise<IResponse<SearchResponse<MsgUserListResponseModel>>> {
    const result = await this.messageService.getAllMsgUsers(
      getAllUserDto,
      user.id,
    );
    return ResponseUtil.success(
      result,
      MessageOperation.MESSAGE_FETCHED,
      HttpStatus.OK,
    );
  }

  @Get('/get-unread-users-total-count')
  async getUnReadMessageUsers(@CurrentUser() user: UserDetails) {
    const data = await this.messageService.getUnReadMessageUsers(user?.id);
    return ResponseUtil.success(
      data,
      MessageOperation.UNREAD_MESSAGE_ALL_USERS,
      HttpStatus.OK,
    );
  }
}
