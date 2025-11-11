import { getDateAndTime } from 'src/helper';
import {
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', precision: 3 })
  created_date: Date;

  @Column({ length: 50, nullable: true })
  created_by?: string;

  @Column({ type: 'timestamp', precision: 3, nullable: true })
  modified_date?: Date;

  @Column({ length: 50, nullable: true })
  modified_by?: string;

  @BeforeInsert()
  public beforeInsert() {
    this.created_date = getDateAndTime();
  }

  @BeforeUpdate()
  public BeforeUpdate() {
    this.modified_date = getDateAndTime();
  }
}
