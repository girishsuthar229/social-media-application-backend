import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Roles } from './entity/role.entity';
import { Users } from '../users/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Roles, Users])],
  providers: [RolesService],
  controllers: [RolesController],
  exports: [RolesService],
})
export class RolesModule {}
