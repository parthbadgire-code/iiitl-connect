import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { PostCategory } from '@prisma/client';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(PostCategory)
  category: PostCategory;
}
