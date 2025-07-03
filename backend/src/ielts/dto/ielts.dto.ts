import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { IeltsSkill, IeltsLevel, IeltsQuestionType } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateIeltsTestDto {
  @ApiProperty({ description: 'Tên bài test IELTS' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Mô tả bài test' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: IeltsSkill, description: 'Kỹ năng IELTS' })
  @IsEnum(IeltsSkill)
  skill: IeltsSkill;

  @ApiProperty({ enum: IeltsLevel, description: 'Cấp độ IELTS' })
  @IsEnum(IeltsLevel)
  level: IeltsLevel;

  @ApiProperty({ description: 'Thời gian làm bài (phút)' })
  @IsNumber()
  @Min(1)
  @Max(300)
  timeLimit: number;

  @ApiPropertyOptional({ description: 'Hướng dẫn làm bài' })
  @IsOptional()
  @IsString()
  instructions?: string;
}

export class UpdateIeltsTestDto {
  @ApiPropertyOptional({ description: 'Tên bài test IELTS' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Mô tả bài test' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: IeltsSkill, description: 'Kỹ năng IELTS' })
  @IsOptional()
  @IsEnum(IeltsSkill)
  skill?: IeltsSkill;

  @ApiPropertyOptional({ enum: IeltsLevel, description: 'Cấp độ IELTS' })
  @IsOptional()
  @IsEnum(IeltsLevel)
  level?: IeltsLevel;

  @ApiPropertyOptional({ description: 'Thời gian làm bài (phút)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(300)
  timeLimit?: number;

  @ApiPropertyOptional({ description: 'Hướng dẫn làm bài' })
  @IsOptional()
  @IsString()
  instructions?: string;
}

export class CreateIeltsSectionDto {
  @ApiProperty({ description: 'Tên phần' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Mô tả phần' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Thứ tự phần' })
  @IsNumber()
  @Min(1)
  order: number;

  @ApiPropertyOptional({ description: 'Nội dung phần (đọc hiểu, nghe)' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'URL audio (cho Listening)' })
  @IsOptional()
  @IsString()
  audioUrl?: string;
}

export class CreateIeltsQuestionDto {
  @ApiProperty({ description: 'Câu hỏi' })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty({ enum: IeltsQuestionType, description: 'Loại câu hỏi' })
  @IsEnum(IeltsQuestionType)
  type: IeltsQuestionType;

  @ApiPropertyOptional({
    description: 'Các lựa chọn (cho multiple choice)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiPropertyOptional({
    description: 'Đáp án đúng',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  correctAnswers?: string[];

  @ApiProperty({ description: 'Điểm số' })
  @IsNumber()
  @Min(0)
  points: number;

  @ApiProperty({ description: 'Thứ tự câu hỏi' })
  @IsNumber()
  @Min(1)
  order: number;

  @ApiPropertyOptional({ description: 'Giải thích đáp án' })
  @IsOptional()
  @IsString()
  explanation?: string;
}

export class SubmitIeltsDto {
  @ApiProperty({
    description: 'Danh sách câu trả lời',
    type: [Object],
  })
  @IsArray()
  answers: {
    questionId: number;
    answer: string;
  }[];
}

export class IeltsFilterDto extends PaginationDto {
  @ApiPropertyOptional({ enum: IeltsSkill, description: 'Lọc theo kỹ năng' })
  @IsOptional()
  @IsEnum(IeltsSkill)
  skill?: IeltsSkill;

  @ApiPropertyOptional({ enum: IeltsLevel, description: 'Lọc theo cấp độ' })
  @IsOptional()
  @IsEnum(IeltsLevel)
  level?: IeltsLevel;

  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên' })
  @IsOptional()
  @IsString()
  search?: string;
}
