import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
} from 'class-validator';
import { IeltsLevel, IeltsWritingType } from '@prisma/client';

export class CreateIeltsWritingTestDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  prompt: string;

  @IsEnum(IeltsWritingType)
  type: IeltsWritingType;

  @IsOptional()
  @IsEnum(IeltsLevel)
  level?: IeltsLevel;
}

export class UpdateIeltsWritingTestDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsEnum(IeltsWritingType)
  type?: IeltsWritingType;

  @IsOptional()
  @IsEnum(IeltsLevel)
  level?: IeltsLevel;
}

export class SubmitIeltsWritingTestDto {
  @IsNotEmpty()
  @IsString()
  content: string;
}

export class ManualGradeIeltsWritingTestDto {
  @IsObject()
  score: Record<string, number>;

  @IsObject()
  feedback: Record<string, string>;
}

export class IeltsWritingTestQueryDto {
  @IsOptional()
  @IsEnum(IeltsLevel)
  level?: IeltsLevel;

  @IsOptional()
  @IsEnum(IeltsWritingType)
  type?: IeltsWritingType;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
