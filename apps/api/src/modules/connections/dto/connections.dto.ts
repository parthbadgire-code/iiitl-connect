import { IsString, IsArray, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { LookingFor, SwipeAction } from '@prisma/client';

export class CreateProfileDto {
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
