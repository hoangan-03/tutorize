import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { WritingType } from '@prisma/client';

export class CreateWritingAssessmentDto {
  @ApiProperty({ description: 'Tiêu đề bài viết' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Nội dung bài viết' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ enum: WritingType, description: 'Loại bài viết' })
  @IsEnum(WritingType)
  type: WritingType;

  @ApiPropertyOptional({ description: 'Đề bài' })
  @IsOptional()
  @IsString()
  prompt?: string;

  @ApiPropertyOptional({ description: 'Điểm AI', type: 'object' })
  @IsOptional()
  @IsObject()
  aiScore?: any;

  @ApiPropertyOptional({ description: 'Phản hồi', type: 'object' })
  @IsOptional()
  @IsObject()
  feedback?: any;

  @ApiPropertyOptional({ description: 'Công khai', default: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class UpdateWritingAssessmentDto {
  @ApiPropertyOptional({ description: 'Tiêu đề bài viết' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({ description: 'Nội dung bài viết' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;

  @ApiPropertyOptional({ enum: WritingType, description: 'Loại bài viết' })
  @IsOptional()
  @IsEnum(WritingType)
  type?: WritingType;

  @ApiPropertyOptional({ description: 'Đề bài' })
  @IsOptional()
  @IsString()
  prompt?: string;

  @ApiPropertyOptional({ description: 'Điểm AI', type: 'object' })
  @IsOptional()
  @IsObject()
  aiScore?: any;

  @ApiPropertyOptional({ description: 'Phản hồi', type: 'object' })
  @IsOptional()
  @IsObject()
  feedback?: any;

  @ApiPropertyOptional({ description: 'Công khai' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class SubmitWritingDto {
  @ApiProperty({ description: 'Nội dung bài viết' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ enum: WritingType, description: 'Loại bài viết' })
  @IsEnum(WritingType)
  type: WritingType;

  @ApiPropertyOptional({ description: 'Đề bài' })
  @IsOptional()
  @IsString()
  prompt?: string;

  @ApiPropertyOptional({ description: 'Thời gian viết (phút)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  timeSpent?: number;
}

export class WritingAssessmentResultDto {
  @ApiProperty({ description: 'Điểm tổng thể' })
  overallScore: number;

  @ApiProperty({ description: 'Điểm Task Achievement/Response' })
  taskAchievement: number;

  @ApiProperty({ description: 'Điểm Coherence & Cohesion' })
  coherenceCohesion: number;

  @ApiProperty({ description: 'Điểm Lexical Resource' })
  lexicalResource: number;

  @ApiProperty({ description: 'Điểm Grammatical Range & Accuracy' })
  grammaticalRange: number;

  @ApiProperty({ description: 'Phản hồi chi tiết' })
  feedback: string;

  @ApiProperty({ description: 'Điểm mạnh' })
  strengths: string[];

  @ApiProperty({ description: 'Điểm cần cải thiện' })
  improvements: string[];

  @ApiProperty({ description: 'Gợi ý học tập' })
  suggestions: string[];
}

export class WritingFilterDto extends PaginationDto {
  @ApiPropertyOptional({ enum: WritingType, description: 'Loại bài viết' })
  @IsOptional()
  @IsEnum(WritingType)
  type?: WritingType;

  @ApiPropertyOptional({ description: 'Điểm tối thiểu' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(9)
  minScore?: number;

  @ApiPropertyOptional({ description: 'Điểm tối đa' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(9)
  maxScore?: number;

  @ApiPropertyOptional({ description: 'Người dùng' })
  @IsOptional()
  @IsString()
  userId?: number;
}
