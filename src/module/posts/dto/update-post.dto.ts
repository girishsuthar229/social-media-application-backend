import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePostDto {
  @IsNotEmpty()
  user_id: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(5000, { message: 'Content must not exceed 5000 characters' })
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Comment must not exceed 2000 characters' })
  comment?: string;
}
