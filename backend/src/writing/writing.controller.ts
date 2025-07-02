import {
  Controller,
  Get,
  Post,
  Body,
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
import { WritingService } from './writing.service';
import { SubmitWritingDto, WritingFilterDto } from './dto/writing.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Writing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('writing')
export class WritingController {
  constructor(private readonly writingService: WritingService) {}

  @Post('assess')
  @ApiOperation({ summary: 'Chấm điểm bài viết bằng AI' })
  @ApiResponse({ status: 201, description: 'Chấm điểm thành công' })
  @ApiResponse({ status: 400, description: 'Bài viết không hợp lệ' })
  assess(
    @Body() submitWritingDto: SubmitWritingDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.writingService.assess(submitWritingDto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách bài chấm điểm' })
  @ApiResponse({ status: 200, description: 'Danh sách bài chấm điểm' })
  async findAll(@Query() query: PaginationDto, @CurrentUser() user: any) {
    return this.writingService.findAll(query, user?.id);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Thống kê bài viết' })
  @ApiResponse({ status: 200, description: 'Thống kê bài viết' })
  async getStatistics() {
    return this.writingService.getStatistics();
  }

  @Get('assessments/:id')
  @ApiOperation({ summary: 'Lấy chi tiết bài chấm điểm' })
  @ApiResponse({ status: 200, description: 'Chi tiết bài chấm điểm' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài chấm điểm' })
  findOne(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.writingService.findOne(id, userId);
  }
}
