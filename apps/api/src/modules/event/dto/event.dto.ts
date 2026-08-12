import { IsString, IsBoolean, IsNotEmpty, IsDateString, IsOptional, IsArray, ArrayMinSize } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  venue: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  externalLink?: string;

  @IsBoolean()
  @IsOptional()
  isRSVPRequired?: boolean;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  clubIds: string[];
}

export class UploadPhotoDto {
  @IsString()
  @IsNotEmpty()
  url: string;
}
