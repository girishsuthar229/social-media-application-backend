import { IsNotEmpty, IsString } from 'class-validator';

export class EditMessageDto {
  @IsNotEmpty()
  @IsString()
  message: string;
}

export class DeleteMessageDto {
  @IsNotEmpty()
  @IsString()
  message_id: number;
}
