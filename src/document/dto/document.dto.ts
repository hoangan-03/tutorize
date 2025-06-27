import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsUrl,
  IsArray,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { DocumentType } from '@prisma/client';

export class CreateDocumentDto {
  @ApiProperty({ description: 'Tiêu đề tài liệu' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Mô tả tài liệu' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: DocumentType, description: 'Loại tài liệu' })
  @IsEnum(DocumentType)
  type: DocumentType;

  @ApiProperty({ description: 'Môn học' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: 'Khối lớp' })
  @IsNumber()
  @Min(1)
  @Max(12)
  grade: number;

  @ApiPropertyOptional({ description: 'URL file' })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional({ description: 'Kích thước file (bytes)' })
  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @ApiPropertyOptional({ description: 'URL thumbnail' })
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Công khai', default: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class UpdateDocumentDto {
  @ApiPropertyOptional({ description: 'Tiêu đề tài liệu' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({ description: 'Mô tả tài liệu' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: DocumentType, description: 'Loại tài liệu' })
  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

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

  @ApiPropertyOptional({ description: 'URL thumbnail' })
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Công khai' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class DocumentFilterDto extends PaginationDto {
  @ApiPropertyOptional({ enum: DocumentType, description: 'Loại tài liệu' })
  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @ApiPropertyOptional({ description: 'Môn học' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ description: 'Khối lớp' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  grade?: number;

  @ApiPropertyOptional({ description: 'Người upload' })
  @IsOptional()
  @IsString()
  uploadedBy?: string;

  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên hoặc mô tả' })
  @IsOptional()
  @IsString()
  search?: string;
}
