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
import { QuestionType, QuizStatus, Subject } from '@prisma/client';

export class CreateQuestionDto {
  @ApiProperty({ description: 'Nội dung câu hỏi', example: 'Câu hỏi mẫu' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    enum: QuestionType,
    description: 'Loại câu hỏi',
    example: QuestionType.MULTIPLE_CHOICE,
  })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiPropertyOptional({
    type: [String],
    description: 'Các lựa chọn (cho multiple choice)',
    example: ['A', 'B', 'C', 'D'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiProperty({ description: 'Đáp án đúng', example: 'A' })
  @IsString()
  correctAnswer: string;

  @ApiPropertyOptional({ default: 1, description: 'Điểm số', example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  points?: number = 1;

  @ApiPropertyOptional({
    description: 'Giải thích đáp án',
    example: 'Giải thích cho đáp án A',
  })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiProperty({ description: 'Thứ tự câu hỏi', example: 1 })
  @IsNumber()
  @Min(1)
  order: number;

  @ApiPropertyOptional({ description: 'URL âm thanh' })
  @IsOptional()
  @IsString()
  audioUrl?: string;
}

export class CreateQuizDto {
  @ApiProperty({ description: 'Tiêu đề quiz', example: 'Quiz Toán 1' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Mô tả quiz',
    example: 'Quiz về các phép toán cơ bản',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Môn học', enum: Subject })
  @IsString()
  @IsNotEmpty()
  subject: Subject;

  @ApiProperty({ description: 'Khối lớp', example: 8 })
  @IsNumber()
  @Min(1)
  @Max(12)
  grade: number;

  @ApiProperty({ description: 'Thời gian làm bài (phút)', example: 30 })
  @IsNumber()
  @Min(1)
  timeLimit: number;

  @ApiProperty({
    description: 'Hạn chót nộp bài',
    example: '2023-12-31T23:59:59.999Z',
  })
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

  @ApiPropertyOptional({ default: 1, description: 'Số lần làm bài tối đa' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxAttempts?: number = 1;

  @ApiPropertyOptional({
    default: false,
    description: 'Cho phép xem lại bài làm',
  })
  @IsOptional()
  @IsBoolean()
  isAllowedReviewed?: boolean = false;

  @ApiPropertyOptional({
    default: false,
    description: 'Cho phép xem đáp án sau khi nộp',
  })
  @IsOptional()
  @IsBoolean()
  isAllowedViewAnswerAfterSubmit?: boolean = false;

  @ApiPropertyOptional({
    default: true,
    description: 'Hiển thị kết quả ngay sau khi nộp',
  })
  @IsOptional()
  @IsBoolean()
  showResultsImmediately?: boolean = true;

  @ApiPropertyOptional({
    default: false,
    description: 'Xáo trộn thứ tự câu hỏi',
  })
  @IsOptional()
  @IsBoolean()
  shuffleQuestions?: boolean = false;

  @ApiPropertyOptional({
    default: false,
    description: 'Xáo trộn thứ tự đáp án',
  })
  @IsOptional()
  @IsBoolean()
  shuffleAnswers?: boolean = false;

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
  subject?: Subject;

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

  @ApiPropertyOptional({ description: 'Số lần làm bài tối đa' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxAttempts?: number;

  @ApiPropertyOptional({ description: 'Cho phép xem lại bài làm' })
  @IsOptional()
  @IsBoolean()
  isAllowedReviewed?: boolean;

  @ApiPropertyOptional({ description: 'Cho phép xem đáp án sau khi nộp' })
  @IsOptional()
  @IsBoolean()
  isAllowedViewAnswerAfterSubmit?: boolean;

  @ApiPropertyOptional({ description: 'Hiển thị kết quả ngay sau khi nộp' })
  @IsOptional()
  @IsBoolean()
  showResultsImmediately?: boolean;

  @ApiPropertyOptional({ description: 'Xáo trộn thứ tự câu hỏi' })
  @IsOptional()
  @IsBoolean()
  shuffleQuestions?: boolean;

  @ApiPropertyOptional({ description: 'Xáo trộn thứ tự đáp án' })
  @IsOptional()
  @IsBoolean()
  shuffleAnswers?: boolean;

  @ApiPropertyOptional({
    type: [CreateQuestionDto],
    description: 'Danh sách câu hỏi',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions?: CreateQuestionDto[];
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
  @IsNumber()
  createdBy?: number;

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

export class UpdateQuizStatusDto {
  @ApiProperty({ enum: QuizStatus, description: 'Trạng thái mới của quiz' })
  @IsEnum(QuizStatus)
  status: QuizStatus;
}
