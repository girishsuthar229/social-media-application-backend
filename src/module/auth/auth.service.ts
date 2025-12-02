import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../users/entity/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedUser } from './interfaces/auth-user.interface';
import { getDateAndTime, SystemConfigKeys } from 'src/helper';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    private jwtService: JwtService,
  ) {}

  async login(
    user: AuthenticatedUser,
  ): Promise<{ accessToken: string; tokenExpiresIn: number }> {
    await this.usersRepository.update(user.id, {
      last_login_at: getDateAndTime(),
    });
    const payload = {
      sub: user.id,
      user_name: user.user_name,
      email: user.email,
      role: user.role.name,
    };
    const expiresIn =
      (parseInt(SystemConfigKeys.AUTO_LOGOUT_SESSION_TIME.toString()) || 10) *
      60;

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: expiresIn ? expiresIn : undefined,
    });

    return {
      accessToken: token,
      tokenExpiresIn: expiresIn,
    };
  }

  async validateUser(
    loginUserDto: LoginUserDto,
  ): Promise<AuthenticatedUser | null> {
    const { user_name, password } = loginUserDto;
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.role', 'role')
      .select([
        'user.id',
        'user.user_name',
        'user.password_hash',
        'role.id',
        'role.name',
      ])
      .where('LOWER(user.user_name) = LOWER(:user_name)', { user_name })
      .getOne();
    if (!user) return null;

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) return null;

    const { password_hash, ...rest } = user; // eslint-disable-line @typescript-eslint/no-unused-vars
    return rest as AuthenticatedUser;
  }
}
