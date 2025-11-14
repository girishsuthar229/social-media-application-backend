import { IsString, IsNotEmpty } from 'class-validator';

export class CommentOnPostDto {
  @IsNotEmpty()
  @IsString()
  user_id: number;

  @IsNotEmpty()
  @IsString()
  comment: string;
}
