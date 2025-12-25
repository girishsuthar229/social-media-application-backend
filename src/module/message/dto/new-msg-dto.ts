import { IsString, IsNotEmpty } from 'class-validator';

export class NewMessageDto {
  @IsNotEmpty()
  @IsString()
  sender_id: number;

  @IsNotEmpty()
  @IsString()
  receiver_id: number;

  @IsNotEmpty()
  @IsString()
  message: string;
}
