import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreateListingDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}

export class UpdateListingStatusDto {
  @IsString()
  status: 'AVAILABLE' | 'SOLD';
}
