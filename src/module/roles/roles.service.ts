import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Roles } from './entity/role.entity';
import { Users } from '../users/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorType } from 'src/helper/enum';
import { ErrorMessages } from 'src/helper/error-msg';
import { RoleDto } from './dto/role.dto';
import { checkFieldExists } from 'src/helper/check-field-exist';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Roles)
    private roleRepository: Repository<Roles>,
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
  ) {}

  async getAllRoles(): Promise<Roles[]> {
    const roles = await this.roleRepository.find({
      where: {
        is_system_defined: false,
        is_active: true,
      },
    });
    return roles;
  }

  async getRole(roleId: number): Promise<Roles> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });
    if (!role) {
      throw new NotFoundException({
        error: ErrorType.RoleNotExist,
        message: ErrorMessages[ErrorType.RoleNotExist],
      });
    }
    return role;
  }

  async createRole(createRoleDto: RoleDto): Promise<Roles> {
    const existingName = await checkFieldExists(
      this.roleRepository,
      'name',
      createRoleDto.name,
    );

    if (existingName) {
      throw new ConflictException({
        error: ErrorType.RoleNameMustBeUnique,
        message: ErrorMessages[ErrorType.RoleNameMustBeUnique],
      });
    }

    const role = this.roleRepository.create({
      ...createRoleDto,
    });

    return await this.roleRepository.save(role);
  }
}
