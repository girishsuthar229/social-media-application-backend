import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

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

  @IsOptional()
  @IsEnum(['image', 'video', 'audio', 'document'])
  file_type?: string;

  @IsOptional()
  @IsString()
  latitude?: number;

  @IsOptional()
  @IsString()
  longitude?: number;

  @IsOptional()
  @IsString()
  location_name?: string;
}
