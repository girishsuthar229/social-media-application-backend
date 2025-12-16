import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Raw, Repository } from 'typeorm';
import { Users } from './entity/user.entity';
import { RolesService } from '../roles/roles.service';
import { JwtService } from '@nestjs/jwt';
import {
  ErrorMessages,
  ErrorType,
  getDateAndTime,
  Mailer,
  SystemConfigKeys,
} from 'src/helper';
import { v4 as uuidv4 } from 'uuid';
import {
  AnotherUserDetailResponse,
  DecodedTokenPayload,
  UserListResponseModel,
  UserProfileDetailsModel,
} from './interface/users.interface';
import { UpdatePasswordDto, VerifyTokenDto } from './dto/user-password.dto';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserProfileDto } from './dto/update-user.dto';
import { deleteLocalFile, saveFileLocally } from 'src/helper/file-upload';
import { GetAllUsersDto, SortOrder, UserSortBy } from './dto/get-all-users.dto';
import { SearchResponse } from 'src/helper/interface';
import { FollowingsEnum } from '../follows/entity/follow.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    private readonly rolesService: RolesService,
    private jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<void> {
    const { user_name, email, birth_date, password, role_id } = createUserDto;

    const lowerUsername = user_name.toLowerCase();
    const lowerEmail = email.toLowerCase();

    // Check uniqueness
    const existingUserByEmail = await this.usersRepository.findOne({
      where: { email: lowerEmail },
    });
    if (existingUserByEmail) {
      throw new ConflictException({
        error: ErrorType.EmailMustBeUnique,
        message: ErrorMessages[ErrorType.EmailMustBeUnique],
      });
    }

    const existingUserByUsername = await this.usersRepository.findOne({
      where: { user_name: lowerUsername },
    });
    if (existingUserByUsername) {
      throw new ConflictException({
        error: ErrorType.UserNameMustBeUnique,
        message: ErrorMessages[ErrorType.UserNameMustBeUnique],
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user entity
    const user = this.usersRepository.create({
      user_name: lowerUsername,
      email: lowerEmail,
      password_hash: hashedPassword,
      birth_date: birth_date ? new Date(birth_date) : undefined,
      created_date: getDateAndTime(),
      role_id: role_id ? role_id : 2,
    });

    await this.usersRepository.save(user);
  }

  private async sendVerificationEmail(
    user: Users,
    email: string,
    generatedOTP: string,
    expiresIn: string,
  ) {
    const subject = 'Your Password Reset Verification Code';
    const htmlMessage = `
    <p>Dear ${user.first_name ? user.first_name + ' ' + user.last_name : user?.user_name},</p>
    <p>You have requested to reset your password.<br>Your verification code is: <strong>${generatedOTP}</strong></p>
    <p>This code is valid for <strong>${expiresIn}</strong> only. For security reasons, please do not share this code with anyone.</p>
    <p>Thank you</p>
  `;
    await Mailer.sendMail(email, subject, htmlMessage);
  }

  private async decodeToken(token: string): Promise<string> {
    try {
      const secretKey = process.env.JWT_FORGOT_PASSWORD_SECRET || '';
      const decoded = await this.jwtService.verifyAsync<DecodedTokenPayload>(
        token,
        {
          secret: secretKey,
        },
      );
      return decoded.email;
    } catch (error) {
      const isExpired = error.name === ErrorType.TokenExpiredError; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
      const errorType = isExpired
        ? ErrorType.TokenExpiredError
        : ErrorType.InvalidToken;

      throw new BadRequestException({
        error: errorType,
        message: ErrorMessages[errorType],
      });
    }
  }

  async sendOTP(email: string): Promise<{ token?: string }> {
    const lowerEmail = email.toLowerCase();
    const user = await this.usersRepository.findOne({
      where: {
        email: Raw((alias) => `LOWER(${alias}) = :email`, {
          email: lowerEmail,
        }),
      },
    });

    if (!user) {
      throw new NotFoundException(ErrorMessages[ErrorType.UserNotFound]);
    }

    const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

    const otpTimeout =
      (parseInt(SystemConfigKeys.OTP_EXPIRY_TIME.toString()) || 2) * 60 * 1000;

    await this.sendVerificationEmail(
      user,
      email,
      generatedOTP,
      `${SystemConfigKeys.OTP_EXPIRY_TIME || 2} minutes`,
    );

    const payload = { userId: user.id, email: user.email };
    const token = this.jwtService.sign(payload, {
      expiresIn: `${otpTimeout / 1000}s`,
    });
    user.otp = generatedOTP;
    user.otp_expiration_time = new Date(Date.now() + otpTimeout);
    user.is_forgot_token_used = false;
    user.is_reset_token_used = false;
    user.modified_by = user.email;
    user.password_token = token;
    await this.usersRepository.save(user);

    return { token };
  }

  async passwordTokenValidation(
    passwordTokenValidationDto: VerifyTokenDto,
  ): Promise<{ valid: boolean }> {
    const userNotFoundError = {
      error: ErrorType.UserNotFound,
      message: ErrorMessages[ErrorType.UserNotFound],
    };
    const email = await this.decodeToken(passwordTokenValidationDto.token);

    if (!email) {
      throw new NotFoundException(userNotFoundError);
    }

    const user = await this.usersRepository.findOne({
      where: { email: email },
      select: ['id', 'otp_expiration_time', 'password_token'],
    });
    if (!user) {
      throw new NotFoundException(userNotFoundError);
    }
    if (
      !user.otp_expiration_time ||
      user.password_token != passwordTokenValidationDto.token ||
      user.is_forgot_token_used
    ) {
      throw new UnauthorizedException({
        error: ErrorType.PasswordLinkInvalid,
        message: ErrorMessages[ErrorType.PasswordLinkInvalid],
      });
    }

    // Check if token is expired
    const isExpired = new Date() > user.otp_expiration_time;
    if (isExpired) {
      throw new UnauthorizedException({
        error: ErrorType.PasswordLinkExpired,
        message: ErrorMessages[ErrorType.PasswordLinkExpired],
      });
    }

    return { valid: true };
  }

  async verifyOTP(
    token: string,
    generatedOTP: string,
  ): Promise<{ verified: boolean; token?: string }> {
    const userNotFoundError = {
      error: ErrorType.UserNotFound,
      message: ErrorMessages[ErrorType.UserNotFound],
    };
    const email = await this.decodeToken(token);
    if (!email) {
      throw new NotFoundException(userNotFoundError);
    }
    const user = await this.usersRepository.findOne({
      where: { email: email },
      select: [
        'id',
        'email',
        'otp',
        'otp_expiration_time',
        'is_forgot_token_used',
        'password_token',
        'is_reset_token_used',
        'modified_by',
      ],
    });
    if (!user) {
      throw new NotFoundException(userNotFoundError);
    }

    const currentTime = getDateAndTime();
    if (
      !user.otp_expiration_time ||
      currentTime > user.otp_expiration_time ||
      user.password_token != token ||
      user.is_forgot_token_used
    ) {
      throw new UnauthorizedException({
        error: ErrorType.PasswordLinkExpired,
        message: ErrorMessages[ErrorType.PasswordLinkExpired],
      });
    }

    if (!user.otp) {
      throw new UnauthorizedException({
        error: ErrorType.OTPRequired,
        message: ErrorMessages[ErrorType.OTPRequired],
      });
    }
    if (user.otp !== generatedOTP) {
      throw new UnauthorizedException({
        error: ErrorType.OTPInvalid,
        message: ErrorMessages[ErrorType.OTPInvalid],
      });
    }

    if (user.otp === generatedOTP) {
      const payload = { userId: user.id, email: user.email };
      const jwtServiceSignToken = this.jwtService.sign(payload);
      const pswTimeout =
        (parseInt(SystemConfigKeys.PSW_EXPIRY_TIME.toString()) || 2) *
        60 *
        1000;

      user.otp = null;
      user.otp_expiration_time = null;
      user.is_forgot_token_used = true;
      user.modified_by = user.email;
      user.is_reset_token_used = false;
      user.password_token = jwtServiceSignToken;
      user.password_set_expires_at = new Date(Date.now() + pswTimeout);

      await this.usersRepository.save(user);

      return { verified: true, token: jwtServiceSignToken };
    }

    return { verified: false };
  }

  async setPasswordTokenValidation(
    passwordTokenValidationDto: VerifyTokenDto,
  ): Promise<{ valid: boolean; email?: string; setToken?: string }> {
    const userNotFoundError = {
      error: ErrorType.UserNotFound,
      message: ErrorMessages[ErrorType.UserNotFound],
    };
    const email = await this.decodeToken(passwordTokenValidationDto.token);
    if (!email) {
      throw new NotFoundException(userNotFoundError);
    }

    const user = await this.usersRepository.findOne({
      where: { email: email },
      select: [
        'id',
        'password_token',
        'password_set_expires_at',
        'is_forgot_token_used',
        'is_reset_token_used',
      ],
    });

    if (!user) {
      throw new NotFoundException(userNotFoundError);
    }

    if (
      !user.password_token ||
      !user.password_set_expires_at ||
      !user.is_forgot_token_used
    ) {
      throw new UnauthorizedException({
        error: ErrorType.PasswordLinkInvalid,
        message: ErrorMessages[ErrorType.PasswordLinkInvalid],
      });
    }

    const isExpired = new Date() > user.password_set_expires_at;
    if (isExpired) {
      throw new UnauthorizedException({
        error: ErrorType.PasswordLinkExpired,
        message: ErrorMessages[ErrorType.PasswordLinkExpired],
      });
    }

    if (user.is_reset_token_used) {
      throw new BadRequestException({
        error: ErrorType.PasswordAlreadyChanged,
        message: ErrorMessages[ErrorType.PasswordAlreadyChanged],
      });
    }

    const token = uuidv4();
    const tokenHash = await bcrypt.hash(token, 10);
    user.password_token = tokenHash;
    await this.usersRepository.save(user);

    return { valid: true, email: email, setToken: token };
  }

  async updateUserPassword(
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { email: updatePasswordDto.email },
      select: [
        'id',
        'email',
        'password_hash',
        'password_token',
        'password_set_expires_at',
        'is_forgot_token_used',
        'is_reset_token_used',
      ],
    });

    const userNotFoundError = {
      error: ErrorType.UserNotFound,
      message: ErrorMessages[ErrorType.UserNotFound],
    };

    if (!user) {
      throw new NotFoundException(userNotFoundError);
    }
    const isValid = await bcrypt.compare(
      updatePasswordDto.setToken,
      user.password_token,
    );
    if (!isValid) {
      throw new UnauthorizedException({
        error: ErrorType.PasswordLinkInvalid,
        message: ErrorMessages[ErrorType.PasswordLinkInvalid],
      });
    }
    if (user.is_reset_token_used) {
      throw new BadRequestException({
        error: ErrorType.PasswordAlreadyChanged,
        message: ErrorMessages[ErrorType.PasswordAlreadyChanged],
      });
    }
    if (updatePasswordDto.new_password != updatePasswordDto.confirm_password) {
      throw new BadRequestException({
        error: ErrorType.PasswordMismatch,
        message: ErrorMessages[ErrorType.PasswordMismatch],
      });
    }
    const isNewPasswordMatch = await bcrypt.compare(
      updatePasswordDto.new_password,
      user.password_hash,
    );
    // if entered new match old password
    if (isNewPasswordMatch) {
      throw new BadRequestException({
        error: ErrorType.InvalidNewPassword,
        message: ErrorMessages[ErrorType.InvalidNewPassword],
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(
      updatePasswordDto.new_password,
      salt,
    );
    await this.usersRepository.update(user.id, {
      password_hash: hashedPassword,
      is_forgot_token_used: false,
      is_reset_token_used: true,
      modified_by: user.email,
      modified_date: getDateAndTime(),
    });
  }

  async getUserProfileDetails(id: number): Promise<UserProfileDetailsModel> {
    const user = await this.usersRepository.exists({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException({
        error: ErrorType.UserNotFound,
        message: ErrorMessages[ErrorType.UserNotFound],
      });
    }
    const result = (await this.usersRepository.query(
      'SELECT * FROM sm_nest_schema.get_user_profile_details($1)',
      [id],
    )) as UserProfileDetailsModel[];
    return result[0];
  }

  async getAnotherUserProfile(
    uName: string,
    currentUserId: number,
  ): Promise<AnotherUserDetailResponse> {
    const user = await this.usersRepository.findOne({
      where: { user_name: uName, deleted_date: IsNull() },
      relations: ['followers', 'followings', 'posts'],
    });

    if (!user) {
      throw new NotFoundException({
        error: ErrorType.UserNotFound,
        message: ErrorMessages[ErrorType.UserNotFound],
      });
    }
    const followRelation = user.followings?.find(
      (f) => f.follower_id === currentUserId && f.following_id === user.id,
    );
    const response: AnotherUserDetailResponse = {
      id: user.id,
      user_name: user.user_name,
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      bio: user.bio ?? null,
      photo_url: user.photo_url ?? '',
      is_private: user.is_private,
      follow_status: followRelation?.status || null,
      is_following:
        user.followings?.some(
          (f) => f.follower_id === currentUserId && f.following_id === user.id,
        ) ?? false,
      follower_count: user.followings.filter(
        (f) =>
          f.following_id === user.id && f.status === FollowingsEnum.ACCEPTED,
      ).length,
      following_count: user.followers.filter(
        (f) =>
          f.follower_id === user.id && f.status === FollowingsEnum.ACCEPTED,
      ).length,
      post_count: user.posts.filter((p) => p.user_id === user.id).length,
    };

    return response;
  }

  async updateUserProfileDetails(
    id: number,
    updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<void> {
    const existingUser = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'photo_url'],
    });

    if (!existingUser) {
      throw new NotFoundException({
        error: ErrorType.UserNotFound,
        message: ErrorMessages[ErrorType.UserNotFound],
      });
    }

    let uploadedLogoUrl: string | null = null;
    if (updateUserProfileDto.user_image) {
      uploadedLogoUrl = saveFileLocally(
        updateUserProfileDto.user_image,
        'user-images',
      );

      if (existingUser.photo_url && uploadedLogoUrl) {
        deleteLocalFile(
          existingUser.photo_url,
          existingUser.photo_url.split('/')[0],
        );
      }
    }
    const { user_image, ...restDto } = updateUserProfileDto;

    await this.usersRepository.update(existingUser.id, {
      ...restDto,
      photo_url: uploadedLogoUrl ? uploadedLogoUrl : existingUser?.photo_url,
    });
  }

  async getAllUsers(
    queryDto: GetAllUsersDto,
    currentUserId: number,
  ): Promise<SearchResponse<UserListResponseModel>> {
    const {
      offset,
      limit,
      search,
      sortBy = UserSortBy.CREATED_DATE,
      sortOrder = SortOrder.DESC,
      role_id,
      is_private,
    } = queryDto;

    const queryBuilder = this.usersRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.followers', 'followers')
      .leftJoinAndSelect('u.followings', 'followings')
      .where('u.deleted_date IS NULL');
    // Apply search filter if search term exists
    if (search) {
      const searchParts = search.trim().split(' ');
      let firstNameSearch = searchParts[0];
      let lastNameSearch = searchParts[1] || '';

      queryBuilder.andWhere(
        '(u.user_name ILIKE :search OR ' +
          '(u.first_name ILIKE :firstNameSearch AND u.last_name ILIKE :lastNameSearch) OR ' +
          '(u.first_name ILIKE :lastNameSearch AND u.last_name ILIKE :firstNameSearch))',
        {
          search: `%${search}%`,
          firstNameSearch: `%${firstNameSearch}%`,
          lastNameSearch: `%${lastNameSearch}%`,
        },
      );
    }

    // Apply role filter if role_id is provided
    if (role_id) {
      queryBuilder.andWhere('u.role_id = :role_id', { role_id });
    }

    // Apply privacy filter if is_private is defined
    if (is_private !== undefined) {
      queryBuilder.andWhere('u.is_private = :is_private', { is_private });
    }

    // Dynamically set the sort order
    queryBuilder.addOrderBy(`u.${sortBy}`, sortOrder);

    queryBuilder.take(limit).skip(offset);
    const [users, total] = await queryBuilder.getManyAndCount();

    const rows: UserListResponseModel[] = users.map((user) => {
      const followRelation = user.followings?.find(
        (f) => f.follower_id === currentUserId && f.following_id === user.id,
      );
      return {
        id: user.id,
        user_name: user.user_name,
        first_name: user.first_name ?? '',
        last_name: user.last_name ?? '',
        email: user.email ?? '',
        bio: user.bio ?? null,
        mobile_number: user.mobile_number ?? '',
        photo_url: user.photo_url ?? '',
        birth_date: user.birth_date?.toString() ?? null,
        address: user.address ?? '',
        is_private: user.is_private,
        is_following:
          user.followings?.some(
            (f) =>
              f.follower_id === currentUserId && f.following_id === user.id,
          ) ?? false,
        follow_status: followRelation?.status || null,
        follower_count: user.followings.filter(
          (f) =>
            f.following_id === user.id && f.status === FollowingsEnum.ACCEPTED,
        ).length,
        following_count: user.followers.filter(
          (f) =>
            f.follower_id === user.id && f.status === FollowingsEnum.ACCEPTED,
        ).length,
        role_id: user.role_id,
        created_date: user.created_date.toString(),
        modified_date: user.modified_date?.toString() ?? null,
      };
    });

    return { count: total, rows };
  }
}
