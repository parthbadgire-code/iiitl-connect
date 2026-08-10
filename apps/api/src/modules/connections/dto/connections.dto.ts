import { IsString, IsArray, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { LookingFor, SwipeAction, Gender } from '@prisma/client';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  @IsOptional()
  year?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsArray()
  @IsString({ each: true })
  interests: string[];

  @IsArray()
  @IsEnum(LookingFor, { each: true })
  lookingFor: LookingFor[];

  @IsArray()
  @IsOptional()
  prompts?: any[];
}

export class SwipeDto {
  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @IsEnum(SwipeAction)
  action: SwipeAction;
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class BlockUserDto {
  @IsString()
  @IsNotEmpty()
  userIdToBlock: string;
}

export class ReportUserDto {
  @IsString()
  @IsNotEmpty()
  userIdToReport: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
