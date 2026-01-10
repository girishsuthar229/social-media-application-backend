import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CurrentUser, FileValidation } from 'src/decorators';
import { IResponse, UserDetails } from 'src/helper';
import { SearchResponse } from 'src/helper/interface';
import { FileValidationInterceptor, ResponseUtil } from 'src/interceptors';
import { GetAllMsgUsersDto } from './dto/get-all-msg-user.dto';
import {
  MsgUserListResponseModel,
  UserMessageListModel,
} from './interface/message.interface';
import {
  AudioMimeType,
  DocumnetMimeType,
  MaxFileSize,
  MessageOperation,
  MimeType,
  VideoMimeType,
} from 'src/helper/enum';
import { NewMessageDto } from './dto/new-msg-dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { EditMessageDto } from './dto/edit-and-delete-msg-dto';

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

  @UseInterceptors(FileInterceptor('post_image'), FileValidationInterceptor)
  @FileValidation({
    allowedMimeTypes: [
      MimeType.PNG,
      MimeType.JPG,
      MimeType.JPEG,
      MimeType.SVG,
      VideoMimeType.MP4,
      VideoMimeType.WEBM,
      AudioMimeType.MPEG,
      AudioMimeType.OGG,
      DocumnetMimeType.DOCUMENT,
      DocumnetMimeType.PDF,
      DocumnetMimeType.SPREADSHEET,
    ],
    maxSize: MaxFileSize.MESSAGE_SEND_MAX_FILE_SIZE,
  })
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

  // @Put('/:messageId')
  // async editMessage(
  //   @Param('messageId') messageId: string,
  //   @Body() editMessageDto: EditMessageDto,
  // ): Promise<IResponse<UserMessageListModel>> {
  //   const data = await this.messageService.editMessage(
  //     messageId,
  //     editMessageDto,
  //   );
  //   return ResponseUtil.success(
  //     data,
  //     MessageOperation.MESSAGE_UPDATE,
  //     HttpStatus.OK,
  //   );
  // }

  @Delete('/:messageId')
  async deleteMessage(
    @Param('messageId') messageId: number,
  ): Promise<IResponse<{ message_id: number; deleted: boolean }>> {
    const data = await this.messageService.deleteMessage(messageId);
    return ResponseUtil.success(
      data,
      MessageOperation.MESSAGE_DELETE,
      HttpStatus.OK,
    );
  }
}
