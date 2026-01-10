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

  @Column({ default: false })
  is_edited: boolean;

  @Column({ nullable: true })
  file_url: string;
  @Column({ nullable: true })
  file_type: string; // 'image', 'video', 'document', 'audio'
  @Column({ nullable: true })
  file_name: string;
  @Column({ type: 'bigint', nullable: true })
  file_size: number;


  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;
  @Column({ nullable: true })
  location_name: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'sender_id' })
  sender: Users;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'receiver_id' })
  receiver: Users;
}
