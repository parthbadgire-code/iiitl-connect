import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt } from 'class-validator';
import { ResourceType, ExamType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  courseCode: string;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  semester: number;

  @IsEnum(ResourceType)
  @IsNotEmpty()
  type: ResourceType;

  @IsEnum(ExamType)
  @IsOptional()
  examType?: ExamType;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  year?: number;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

