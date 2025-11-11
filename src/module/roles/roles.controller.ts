import { Controller, Get, Post, Body, HttpStatus, Param } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Roles } from './entity/role.entity';
import { ResponseUtil } from 'src/interceptors';
import { RolesOperation } from 'src/helper/enum';
import { CurrentUser } from 'src/decorators';
import { IResponse, RouteIdsParamsDto, UserDetails } from 'src/helper';
import { RoleDto } from './dto/role.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly roleService: RolesService) {}

  @Get('/get-all')
  async getAllRoles(): Promise<IResponse<Roles[]>> {
    const roles = await this.roleService.getAllRoles();
    return ResponseUtil.success(roles, RolesOperation.FETCHED, HttpStatus.OK);
  }

  @Get(':id')
  async getRoleById(
    @Param() params: RouteIdsParamsDto,
  ): Promise<IResponse<Roles>> {
    const { id } = params;
    const result = await this.roleService.getRole(id);
    return ResponseUtil.success(result, RolesOperation.FETCHED, HttpStatus.OK);
  }

  @Post()
  async createRole(
    @CurrentUser() user: UserDetails,
    @Body() createRoleDto: RoleDto,
  ): Promise<IResponse<Roles>> {
    const payload = {
      ...createRoleDto,
      created_by: user.email,
    };
    const result = await this.roleService.createRole(payload);
    return ResponseUtil.success(result, RolesOperation.CREATE, HttpStatus.OK);
  }
}
