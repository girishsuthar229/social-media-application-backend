import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  AccessTypes,
  getDateAndTime,
  IResponse,
  MimeType,
  UserDetails,
  UsersOperation,
} from 'src/helper';
import { CurrentUser, FileValidation, Public } from 'src/decorators';
import { FileValidationInterceptor, ResponseUtil } from 'src/interceptors';
import {
  UpdatePasswordDto,
  SendOtpDto,
  VerifyTokenDto,
  VerifyOtpDto,
} from './dto/user-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import {
  UserListResponseModel,
  UserProfileDetailsModel,
} from './interface/users.interface';
import { UpdateUserProfileDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetAllUsersDto } from './dto/get-all-users.dto';
import { SearchResponse } from 'src/helper/interface';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Public(AccessTypes.PUBLIC)
  @Post('create')
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<IResponse<null>> {
    await this.usersService.createUser(createUserDto);
    return ResponseUtil.success(
      null,
      UsersOperation.USER_CREATED,
      HttpStatus.OK,
    );
  }

  @Public(AccessTypes.PUBLIC)
  @Post('forgot-password/send-otp')
  async sendOTP(
    @Body() sendOtpDto: SendOtpDto,
  ): Promise<IResponse<{ token?: string }>> {
    const result = await this.usersService.sendOTP(sendOtpDto.email);
    return ResponseUtil.success(
      result || null,
      UsersOperation.OTP_SENT,
      HttpStatus.OK,
    );
  }

  @Public(AccessTypes.PUBLIC)
  @Post('forgot-password-otp/token-validate')
  async forgetPasswordTokenValidation(
    @Body() forgotPswTknValidationDto: VerifyTokenDto,
  ): Promise<IResponse<{ valid: boolean }>> {
    const result = await this.usersService.passwordTokenValidation(
      forgotPswTknValidationDto,
    );
    return ResponseUtil.success(result, undefined, HttpStatus.OK);
  }

  @Public(AccessTypes.PUBLIC)
  @Post('forgot-password/verify-otp')
  async verifyOTP(
    @Body() verifyOtpDto: VerifyOtpDto,
  ): Promise<IResponse<{ verified: boolean; token?: string }>> {
    const result = await this.usersService.verifyOTP(
      verifyOtpDto.token,
      verifyOtpDto.otp,
    );
    return ResponseUtil.success(result, undefined, HttpStatus.OK);
  }

  @Public(AccessTypes.PUBLIC)
  @Post('set-password/token-validate')
  async setPasswordTokenValidation(
    @Body() setPswTknValidationDto: VerifyTokenDto,
  ): Promise<IResponse<{ valid: boolean }>> {
    const result = await this.usersService.setPasswordTokenValidation(
      setPswTknValidationDto,
    );
    return ResponseUtil.success(result, undefined, HttpStatus.OK);
  }

  @Public(AccessTypes.PUBLIC)
  @Post('set-password/update-password')
  async UpdateUserPassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<IResponse<null>> {
    await this.usersService.updateUserPassword(updatePasswordDto);
    return ResponseUtil.success(
      null,
      UsersOperation.RESET_PASSWORD,
      HttpStatus.OK,
    );
  }

  @Get('/detail')
  async getUserProfileDetails(
    @CurrentUser() user: UserDetails,
  ): Promise<IResponse<UserProfileDetailsModel>> {
    const userDetail = await this.usersService.getUserProfileDetails(user.id);
    return ResponseUtil.success(
      userDetail,
      UsersOperation.FETCHED,
      HttpStatus.OK,
    );
  }

  @UseInterceptors(FileInterceptor('user_image'), FileValidationInterceptor)
  @FileValidation({
    allowedMimeTypes: [MimeType.PNG, MimeType.JPG, MimeType.JPEG],
    isOptional: true,
    isRemovable: true,
  })
  @Put('/update-profile')
  async updateUserProfileDetails(
    @Body() updateUserProfileDto: UpdateUserProfileDto,
    @UploadedFile() user_image: Express.Multer.File,
    @CurrentUser() user: UserDetails,
  ): Promise<IResponse<null>> {
    const payload = {
      ...updateUserProfileDto,
      user_image,
      modified_by: user.email,
      modified_date: getDateAndTime(),
    };

    await this.usersService.updateUserProfileDetails(user.id, payload);
    return ResponseUtil.success(null, UsersOperation.UPDATE, HttpStatus.OK);
  }

  @Post('/get-all-users')
  async getAllUsers(
    @Body() getAllUserDto: GetAllUsersDto,
    @CurrentUser() user: UserDetails,
  ): Promise<IResponse<SearchResponse<UserListResponseModel>>> {
    const result = await this.usersService.getAllUsers(getAllUserDto);
    return ResponseUtil.success(result, UsersOperation.FETCHED, HttpStatus.OK);
  }

  // @Get(':id')
  // async getUserById(
  //   @Param('id', ParseIntPipe) id: number,
  //   @CurrentUser() user: UserDetails,
  // ): Promise<IResponse<UserResponseDto>> {
  //   const foundUser = await this.usersService.getUserById(id);
  //   return ResponseUtil.success(
  //     foundUser,
  //     UsersOperation.USER_FETCHED,
  //     HttpStatus.OK,
  //   );
  // }
  // @Get('search/:query')
  // async searchUsers(
  //   @Param('query') query: string,
  //   @Query() queryDto: QueryUserDto,
  //   @CurrentUser() user: UserDetails,
  // ): Promise<IResponse<UsersListResponseDto>> {
  //   const result = await this.usersService.searchUsers(query, queryDto);
  //   return ResponseUtil.success(
  //     result,
  //     UsersOperation.USERS_SEARCHED,
  //     HttpStatus.OK,
  //   );
  // }

  // /**
  //  * Get suggested users (for follow recommendations)
  //  */
  // @Get('suggestions/for-you')
  // async getSuggestedUsers(
  //   @Query('limit', ParseIntPipe) limit: number = 10,
  //   @CurrentUser() user: UserDetails,
  // ): Promise<IResponse<UserResponseDto[]>> {
  //   const users = await this.usersService.getSuggestedUsers(user.id, limit);
  //   return ResponseUtil.success(
  //     users,
  //     UsersOperation.SUGGESTED_USERS_FETCHED,
  //     HttpStatus.OK,
  //   );
  // }

  // /**
  //  * Get user's followers
  //  */
  // @Get(':id/followers')
  // async getUserFollowers(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Query() queryDto: QueryUserDto,
  //   @CurrentUser() user: UserDetails,
  // ): Promise<IResponse<UsersListResponseDto>> {
  //   const result = await this.usersService.getUserFollowers(id, queryDto);
  //   return ResponseUtil.success(
  //     result,
  //     UsersOperation.FOLLOWERS_FETCHED,
  //     HttpStatus.OK,
  //   );
  // }

  // /**
  //  * Get user's following
  //  */
  // @Get(':id/following')
  // async getUserFollowing(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Query() queryDto: QueryUserDto,
  //   @CurrentUser() user: UserDetails,
  // ): Promise<IResponse<UsersListResponseDto>> {
  //   const result = await this.usersService.getUserFollowing(id, queryDto);
  //   return ResponseUtil.success(
  //     result,
  //     UsersOperation.FOLLOWING_FETCHED,
  //     HttpStatus.OK,
  //   );
  // }
}
