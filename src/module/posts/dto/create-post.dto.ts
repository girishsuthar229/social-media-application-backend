import { IsString, IsNotEmpty, IsOptional, IsInt, Min, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  user_id: number;

  @IsNotEmpty()
  @IsString()
   @MaxLength(5000, { message: 'Content must not exceed 5000 characters' })
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
