import { MessageStatus } from 'src/helper/enum';
import { Users } from 'src/module/users/entity/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sender_id: number;

  @Column()
  receiver_id: number;

  @Column('text')
  message: string;

  @Column({ default: false })
  is_read: boolean;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.SENT,
  })
  status: MessageStatus;

  @CreateDateColumn({ name: 'created_date' })
  created_date: Date;

  @UpdateDateColumn({ name: 'modified_date' })
  modified_date: Date;

  @DeleteDateColumn({ name: 'deleted_date' })
  deleted_date: Date;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'sender_id' })
  sender: Users;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'receiver_id' })
  receiver: Users;
}
