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
  bio?: string;

  @IsArray()
  @IsString({ each: true })
  interests: string[];

  @IsEnum(LookingFor)
  lookingFor: LookingFor;
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
