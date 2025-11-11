import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/database/entities/base.entity';
import { Users } from '../../users/entity/user.entity';

@Entity('roles')
export class Roles extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_system_defined: boolean;

  @OneToMany(() => Users, (user) => user.role)
  users: Users[];
}
