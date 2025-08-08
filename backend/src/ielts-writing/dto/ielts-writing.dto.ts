import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { IeltsLevel, IeltsWritingType } from '@prisma/client';

export class CreateWritingTestDto {
  @ApiProperty({ description: 'Tiêu đề' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Đề bài' })
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @ApiProperty({ enum: IeltsWritingType })
  @IsEnum(IeltsWritingType)
  type: IeltsWritingType;

  @ApiPropertyOptional({ description: 'Level', enum: IeltsLevel })
  @IsOptional()
  @IsEnum(IeltsLevel)
  level?: IeltsLevel;
}

export class SubmitWritingTestDto {
  @ApiProperty({ description: 'Nội dung bài viết (HTML/Rich Text)' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class WritingTestQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;
}

export class ManualGradeTestDto {
  @ApiProperty({ description: 'Điểm' })
  @IsNotEmpty()
  score: JSON;
  // base on 4 criteria: task achievement, coherence and cohesion, lexical resource, and grammatical range

  @ApiProperty({ description: 'Feedback' })
  @IsNotEmpty()
  feedback: JSON;
}
