import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  user_id: number;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  post_image: Express.Multer.File;

  @IsOptional()
  @IsInt()
  @Min(0)
  like_count?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  share_count?: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
