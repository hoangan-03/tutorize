import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { $Enums } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email người dùng' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({ example: 'Password123!', description: 'Mật khẩu' })
  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @MaxLength(50, { message: 'Mật khẩu không được quá 50 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, {
    message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
  })
  password: string;

  @ApiProperty({ example: 'Nguyễn', description: 'Họ' })
  @IsString()
  @MinLength(1, { message: 'Họ phải có ít nhất 1 ký tự' })
  @MaxLength(50, { message: 'Họ không được quá 50 ký tự' })
  firstName: string;

  @ApiProperty({ example: 'Văn A', description: 'Tên' })
  @IsString()
  @MinLength(1, { message: 'Tên phải có ít nhất 1 ký tự' })
  @MaxLength(50, { message: 'Tên không được quá 50 ký tự' })
  lastName: string;

  @ApiProperty({ enum: $Enums.Role, description: 'Vai trò người dùng' })
  @IsEnum($Enums.Role, { message: 'Vai trò không hợp lệ' })
  role: $Enums.Role;

  @ApiPropertyOptional({
    example: 10,
    description: 'Khối lớp (dành cho học sinh)',
  })
  @IsOptional()
  @IsNumber()
  grade?: number;

  @ApiPropertyOptional({
    example: 'Toán học',
    description: 'Môn học (dành cho giáo viên)',
  })
  @IsOptional()
  @IsString()
  subject?: $Enums.Subject;

  @ApiPropertyOptional({ example: '0123456789', description: 'Số điện thoại' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: '123 Đường ABC, Quận 1, TP.HCM',
    description: 'Địa chỉ',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 'Trường THPT ABC',
    description: 'Trường học',
  })
  @IsOptional()
  @IsString()
  school?: string;

  @ApiPropertyOptional({
    example: '01-01-2000',
    description: 'Ngày sinh (DD-MM-YYYY)',
    pattern: '^\\d{2}-\\d{2}-\\d{4}$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}-\d{2}-\d{4}$/, {
    message: 'Ngày sinh phải có định dạng DD-MM-YYYY',
  })
  @Transform(({ value }) => {
    // If empty string or null, return undefined to skip validation
    if (!value || value.trim() === '') {
      return undefined;
    }
    return value;
  })
  dateOfBirth?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Họ' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({ description: 'Tên' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({ enum: $Enums.Role, description: 'Vai trò người dùng' })
  @IsOptional()
  @IsEnum($Enums.Role)
  role?: $Enums.Role;

  @ApiPropertyOptional({ description: 'Khối lớp' })
  @IsOptional()
  @IsNumber()
  grade?: number;

  @ApiPropertyOptional({ description: 'Môn học' })
  @IsOptional()
  @IsString()
  subject?: $Enums.Subject;

  @ApiPropertyOptional({ description: 'Số điện thoại' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Trường học' })
  @IsOptional()
  @IsString()
  school?: string;

  @ApiPropertyOptional({
    description: 'Ngày sinh (DD-MM-YYYY)',
    pattern: '^\\d{2}-\\d{2}-\\d{4}$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}-\d{2}-\d{4}$/, {
    message: 'Ngày sinh phải có định dạng DD-MM-YYYY',
  })
  @Transform(({ value }) => {
    // If empty string or null, return undefined to skip validation
    if (!value || value.trim() === '') {
      return undefined;
    }
    return value;
  })
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'Trạng thái hoạt động' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Mật khẩu mới' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, {
    message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
  })
  password?: string;
}

export class UserFilterDto extends PaginationDto {
  @ApiPropertyOptional({ enum: $Enums.Role, description: 'Lọc theo vai trò' })
  @IsOptional()
  @IsEnum($Enums.Role)
  role?: $Enums.Role;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái hoạt động' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên hoặc email' })
  @IsOptional()
  @IsString()
  search?: string;
}
