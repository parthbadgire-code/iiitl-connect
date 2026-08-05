import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ResourceType } from '@prisma/client';

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  courseCode: string;

  @IsEnum(ResourceType)
  @IsNotEmpty()
  type: ResourceType;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
