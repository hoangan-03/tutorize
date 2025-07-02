import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UserFilterDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Tạo người dùng mới (Admin only)' })
  @ApiResponse({ status: 201, description: 'Tạo người dùng thành công' })
  @ApiResponse({ status: 409, description: 'Email đã được sử dụng' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Lấy danh sách người dùng' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: ['ADMIN', 'TEACHER', 'STUDENT'],
  })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(@Query() filterDto: UserFilterDto) {
    return this.userService.findAll(filterDto);
  }

  @Get('stats')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Thống kê người dùng (Admin only)' })
  @ApiResponse({ status: 200, description: 'Thống kê người dùng' })
  getStats() {
    return this.userService.getStats();
  }

  @Get(':id')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Lấy thông tin chi tiết người dùng' })
  @ApiResponse({ status: 200, description: 'Thông tin người dùng' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser('sub') currentUserId: string,
  ) {
    return this.userService.update(id, updateUserDto, currentUserId);
  }

  @Patch(':id/toggle-activation')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Bật/tắt tài khoản người dùng (Admin only)' })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  toggleActivation(@Param('id') id: string) {
    return this.userService.toggleActivation(id);
  }
}
