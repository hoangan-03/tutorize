import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  IsBoolean,
  IsDateString,
  ValidateNested,
  ArrayMinSize,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubjectGradeFilterDto } from '../../common/dto/pagination.dto';

export enum QuizStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  FILL_BLANK = 'FILL_BLANK',
  ESSAY = 'ESSAY',
}

export class CreateQuestionDto {
  @ApiProperty({ description: 'Nội dung câu hỏi' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ enum: QuestionType, description: 'Loại câu hỏi' })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiPropertyOptional({
    type: [String],
    description: 'Các lựa chọn (cho multiple choice)',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiProperty({ type: [String], description: 'Đáp án đúng' })
  @IsArray()
  @IsString({ each: true })
  correctAnswers: string[];

  @ApiPropertyOptional({ default: 1, description: 'Điểm số' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  points?: number = 1;

  @ApiPropertyOptional({ description: 'Giải thích đáp án' })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiProperty({ description: 'Thứ tự câu hỏi' })
  @IsNumber()
  @Min(1)
  order: number;

  @ApiPropertyOptional({ description: 'URL hình ảnh' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'URL âm thanh' })
  @IsOptional()
  @IsString()
  audioUrl?: string;
}

export class CreateQuizDto {
  @ApiProperty({ description: 'Tiêu đề quiz' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Mô tả quiz' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Môn học' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: 'Khối lớp' })
  @IsNumber()
  @Min(1)
  @Max(12)
  grade: number;

  @ApiProperty({ description: 'Thời gian làm bài (phút)' })
  @IsNumber()
  @Min(1)
  timeLimit: number;

  @ApiProperty({ description: 'Hạn chót nộp bài' })
  @IsDateString()
  deadline: string;

  @ApiPropertyOptional({ enum: QuizStatus, default: QuizStatus.DRAFT })
  @IsOptional()
  @IsEnum(QuizStatus)
  status?: QuizStatus = QuizStatus.DRAFT;

  @ApiPropertyOptional({ default: false, description: 'Quiz công khai' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = false;

  @ApiPropertyOptional({ type: [String], description: 'Tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Hướng dẫn làm bài' })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiProperty({ type: [CreateQuestionDto], description: 'Danh sách câu hỏi' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  @ArrayMinSize(1)
  questions: CreateQuestionDto[];
}

export class UpdateQuizDto {
  @ApiPropertyOptional({ description: 'Tiêu đề quiz' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({ description: 'Mô tả quiz' })
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

  @ApiPropertyOptional({ description: 'Thời gian làm bài (phút)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  timeLimit?: number;

  @ApiPropertyOptional({ description: 'Hạn chót nộp bài' })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional({ enum: QuizStatus })
  @IsOptional()
  @IsEnum(QuizStatus)
  status?: QuizStatus;

  @ApiPropertyOptional({ description: 'Quiz công khai' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ type: [String], description: 'Tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Hướng dẫn làm bài' })
  @IsOptional()
  @IsString()
  instructions?: string;
}

export class QuizAnswerDto {
  @ApiProperty({ description: 'ID câu hỏi' })
  @IsNumber()
  questionId: number;

  @ApiProperty({ description: 'Câu trả lời của học sinh' })
  @IsString()
  userAnswer: string;

  @ApiPropertyOptional({ description: 'Thời gian làm câu hỏi (giây)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  timeTaken?: number = 0;
}

export class SubmitQuizDto {
  @ApiProperty({ type: [QuizAnswerDto], description: 'Danh sách câu trả lời' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerDto)
  answers: QuizAnswerDto[];

  @ApiPropertyOptional({ description: 'Tổng thời gian làm bài (giây)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  timeSpent?: number = 0;
}

export class QuizFilterDto extends SubjectGradeFilterDto {
  @ApiPropertyOptional({ enum: QuizStatus, description: 'Trạng thái quiz' })
  @IsOptional()
  @IsEnum(QuizStatus)
  status?: QuizStatus;

  @ApiPropertyOptional({ description: 'Người tạo' })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiPropertyOptional({ description: 'Tags' })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ description: 'Chỉ lấy quiz công khai' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isPublic?: boolean;
}

export class GradeSubmissionDto {
  @ApiProperty({ description: 'Điểm số' })
  @IsNumber()
  @Min(0)
  score: number;

  @ApiPropertyOptional({ description: 'Phản hồi từ giáo viên' })
  @IsOptional()
  @IsString()
  feedback?: string;
}
