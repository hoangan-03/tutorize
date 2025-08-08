import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { IeltsWritingService } from './ielts-writing.service';
import {
  SubmitWritingTestDto,
  WritingTestQueryDto,
  CreateWritingTestDto,
  ManualGradeTestDto,
} from './dto/ielts-writing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('IELTS Writing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ielts-writing')
export class IeltsWritingController {
  constructor(private readonly ieltswritingService: IeltsWritingService) {}

  @Post('tests')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Tạo Writing Task (giáo viên)' })
  @ApiResponse({ status: 201, description: 'Writing Task được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  createWritingTest(
    @Body() dto: CreateWritingTestDto,
    @CurrentUser('sub') userId: number,
  ) {
    console.log('Controller received data:', { dto, userId });
    return this.ieltswritingService.createWritingTest(dto, userId);
  }

  @Get('tests')
  @ApiOperation({
    summary: 'Danh sách Writing Test',
  })
  getTests(@Query() query: WritingTestQueryDto) {
    return this.ieltswritingService.getTests(query);
  }

  @Delete('tests/:id')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Xóa bài test IELTS' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài test' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.ieltswritingService.removeWritingTest(id, user.id);
  }

  @Post('tests/:testId/submit')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Học sinh nộp bài viết' })
  submitTest(
    @Param('testId') testId: number,
    @Body() dto: SubmitWritingTestDto,
    @CurrentUser('sub') userId: number,
  ) {
    return this.ieltswritingService.submitTest(testId, userId, dto);
  }

  @Post('tests/:testId/manual-grade')
  @Roles(Role.TEACHER)
  @ApiOperation({
    summary: 'Giáo viên chấm bài viết đã nộp và trả feedback',
  })
  gradeTest(
    @Param('testId') testId: number,
    @CurrentUser('sub') userId: number,
    @Body() manualGradeDto: ManualGradeTestDto,
  ) {
    return this.ieltswritingService.manualGradeTest(
      testId,
      userId,
      manualGradeDto,
    );
  }
}
