import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsUrl, IsDateString, IsNumber } from 'class-validator';
import { QuestionDifficulty, ReviewStatus } from '@prisma/client';

export class CreateOffCampusDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() company: string;
  @IsString() @IsNotEmpty() role: string;
  @IsUrl() @IsNotEmpty() link: string;
  @IsDateString() @IsOptional() deadline?: string;
}

export class CreateOAQuestionDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() companyId: string;
  @IsEnum(QuestionDifficulty) @IsNotEmpty() difficulty: QuestionDifficulty;
  @IsArray() @IsOptional() topics?: string[];
  @IsString() @IsNotEmpty() description: string;
  @IsUrl() @IsOptional() link?: string;
}

export class CreateResumeRequestDto {
  @IsString() @IsNotEmpty() resumeUrl: string;
}

export class UpdateResumeRequestDto {
  @IsEnum(ReviewStatus) @IsOptional() status?: ReviewStatus;
  @IsString() @IsOptional() feedback?: string;
  @IsNumber() @IsOptional() rating?: number;
}

export class CreateInterviewExperienceDto {
  @IsString() @IsNotEmpty() companyId: string;
  @IsString() @IsNotEmpty() role: string;
  @IsNumber() @IsNotEmpty() year: number;
  @IsNumber() @IsNotEmpty() difficultyRating: number;
  @IsArray() @IsOptional() oaQuestions?: string[];
  @IsNumber() @IsOptional() interviewRounds?: number;
  @IsString() @IsNotEmpty() content: string;
  @IsString() @IsOptional() anonymousIdentityId?: string;
}
