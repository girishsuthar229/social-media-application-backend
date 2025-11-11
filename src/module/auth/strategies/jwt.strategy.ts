import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Repository } from 'typeorm';
import { ErrorMessages, ErrorType, UserDetails } from 'src/helper';
import { InjectRepository } from '@nestjs/typeorm';
import { AccessTokenPayload } from '../interfaces/auth-user.interface';
import { Users } from 'src/module/users/entity/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: AccessTokenPayload): Promise<UserDetails> {
    const result = await this.usersRepository.findOne({
      where: { id: payload.sub },
      relations: ['role'],
    });
    if (!result) {
      throw new UnauthorizedException(ErrorMessages[ErrorType.UserNotFound]);
    }
    return {
      id: result.id,
      user_name: result.user_name,
      email: result.email,
      role_id: result.role_id,
    };
  }
}
