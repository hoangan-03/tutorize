import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubjectGradeFilterDto } from '../../common/dto/pagination.dto';

export enum ExerciseStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OVERDUE = 'OVERDUE',
}

export class CreateExerciseDto {
  @ApiProperty({ description: 'Tên bài tập' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Mô tả bài tập' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Môn học' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: 'Khối lớp' })
  @IsNumber()
  @Min(1)
  @Max(12)
  grade: number;

  @ApiProperty({ description: 'Hạn chót nộp bài' })
  @IsDateString()
  deadline: string;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ description: 'Nội dung bài tập (text)' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'URL file PDF' })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional({ description: 'Tên file gốc' })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({ description: 'S3 key của file' })
  @IsOptional()
  @IsString()
  fileKey?: string;

  @ApiPropertyOptional({ description: 'Nội dung LaTeX' })
  @IsOptional()
  @IsString()
  latexContent?: string;

  @ApiPropertyOptional({ enum: ExerciseStatus, default: ExerciseStatus.DRAFT })
  @IsOptional()
  @IsEnum(ExerciseStatus)
  status?: ExerciseStatus = ExerciseStatus.DRAFT;
}

export class UpdateExerciseDto {
  @ApiPropertyOptional({ description: 'Tên bài tập' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ description: 'Mô tả bài tập' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Môn học' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ description: 'Khối lớp' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  grade?: number;

  @ApiPropertyOptional({ description: 'Hạn chót nộp bài' })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ description: 'Nội dung bài tập (text)' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'URL file PDF' })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional({ description: 'Tên file gốc' })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({ description: 'S3 key của file' })
  @IsOptional()
  @IsString()
  fileKey?: string;

  @ApiPropertyOptional({ description: 'Nội dung LaTeX' })
  @IsOptional()
  @IsString()
  latexContent?: string;

  @ApiPropertyOptional({ enum: ExerciseStatus })
  @IsOptional()
  @IsEnum(ExerciseStatus)
  status?: ExerciseStatus;
}

export class SubmitExerciseDto {
  @ApiProperty({ description: 'Nội dung bài làm' })
  @IsString()
  @IsNotEmpty()
  submissionUrl: string;
}

export class GradeExerciseDto {
  @ApiProperty({ description: 'Điểm số' })
  @IsNumber()
  @Min(0)
  @Max(10)
  score: number;

  @ApiPropertyOptional({ description: 'Phản hồi từ giáo viên' })
  @IsOptional()
  @IsString()
  feedback?: string;
}

export class ExerciseFilterDto extends SubjectGradeFilterDto {
  @ApiPropertyOptional({
    enum: ExerciseStatus,
    description: 'Trạng thái bài tập',
  })
  @IsOptional()
  @IsEnum(ExerciseStatus)
  status?: ExerciseStatus;

  @ApiPropertyOptional({ description: 'Người tạo' })
  @IsOptional()
  @IsString()
  createdBy?: string;
}
