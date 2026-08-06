import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ItemType } from '@prisma/client';

export class CreateLostFoundDto {
  @IsEnum(ItemType)
  type: ItemType;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  contactInfo?: string;
}
