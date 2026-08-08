import { IsString, IsEnum, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';
import { ClubRole, ClubResourceType } from '@prisma/client';

export class CreateClubDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class AddMemberDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsEnum(ClubRole)
  role: ClubRole;
}

export class TransferRoleDto {
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class CreateClubResourceDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  url?: string;

  @IsEnum(ClubResourceType)
  type: ClubResourceType;
}
