import { IsString, IsOptional, IsEnum, IsInt } from 'class-validator';
import { ResourceType } from '@prisma/client';

export class UpdateResourceDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  courseCode?: string;

  @IsInt()
  @IsOptional()
  semester?: number;

  @IsEnum(ResourceType)
  @IsOptional()
  type?: ResourceType;

  @IsString()
  @IsOptional()
  examType?: string;

  @IsInt()
  @IsOptional()
  year?: number;

  @IsString()
  @IsOptional()
  description?: string;
}
