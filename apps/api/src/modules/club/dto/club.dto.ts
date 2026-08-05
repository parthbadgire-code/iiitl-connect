import { IsString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ClubRole } from '@prisma/client';

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
