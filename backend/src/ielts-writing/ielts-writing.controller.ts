import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IeltsWritingService } from './ielts-writing.service';
import {
  CreateIeltsWritingTestDto,
  UpdateIeltsWritingTestDto,
  SubmitIeltsWritingTestDto,
  ManualGradeIeltsWritingTestDto,
  IeltsWritingTestQueryDto,
} from './dto/ielts-writing.dto';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('IELTS Writing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ielts-writing')
export class IeltsWritingController {
  constructor(private readonly ieltsWritingService: IeltsWritingService) {}

  @Get('my-submissions')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Lấy danh sách nộp bài test IELTS của người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách nộp bài test thành công',
  })
  async getUserSubmissions(@CurrentUser('id') userId: number) {
    return await this.ieltsWritingService.getMySubmissions(userId);
  }

  @Get('/my-submission/:submissionId')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Lấy thông tin nộp bài test IELTS của người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin nộp bài test thành công',
  })
  async getMySubmission(
    @CurrentUser('id') userId: number,
    @Param('submissionId', ParseIntPipe) submissionId: number,
  ) {
    return await this.ieltsWritingService.getMySubmission(userId, submissionId);
  }

  @Post('')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Tạo bài test IELTS mới' })
  @ApiResponse({ status: 201, description: 'Tạo bài test thành công' })
  async createTest(
    @CurrentUser('id') userId: number,
    @Body() createDto: CreateIeltsWritingTestDto,
  ) {
    return await this.ieltsWritingService.createTest(userId, createDto);
  }

  @Get('')
  @ApiOperation({ summary: 'Lấy danh sách bài test IELTS' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách bài test thành công',
  })
  async getTests(@Query() query: IeltsWritingTestQueryDto) {
    return await this.ieltsWritingService.getTests(query);
  }

  @Get('/:testId')
  @ApiOperation({ summary: 'Lấy thông tin bài test IELTS' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin bài test thành công',
  })
  async getTestById(@Param('testId', ParseIntPipe) testId: number) {
    return await this.ieltsWritingService.getTestById(testId);
  }

  @Put('/:testId')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Cập nhật bài test IELTS' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật bài test thành công',
  })
  async updateTest(
    @Param('testId', ParseIntPipe) testId: number,
    @CurrentUser('id') userId: number,
    @Body() updateDto: UpdateIeltsWritingTestDto,
  ) {
    return await this.ieltsWritingService.updateTest(testId, userId, updateDto);
  }

  @Delete('/:testId')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Xóa bài test IELTS' })
  @ApiResponse({
    status: 200,
    description: 'Xóa bài test thành công',
  })
  async deleteTest(
    @Param('testId', ParseIntPipe) testId: number,
    @CurrentUser('id') userId: number,
  ) {
    return await this.ieltsWritingService.deleteTest(testId, userId);
  }

  @Post('/:testId/submit')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Nộp bài test IELTS' })
  @ApiResponse({
    status: 200,
    description: 'Nộp bài test thành công',
  })
  async submitTest(
    @Param('testId', ParseIntPipe) testId: number,
    @CurrentUser('id') userId: number,
    @Body() submitDto: SubmitIeltsWritingTestDto,
  ) {
    return await this.ieltsWritingService.submitTest(testId, userId, submitDto);
  }

  @Post('/:testId/manual-grade')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Chấm điểm bài test IELTS' })
  @ApiResponse({
    status: 200,
    description: 'Chấm điểm bài test thành công',
  })
  async manualGradeTest(
    @Param('testId', ParseIntPipe) testId: number,
    @CurrentUser('id') userId: number,
    @Body() gradeDto: ManualGradeIeltsWritingTestDto,
  ) {
    return await this.ieltsWritingService.manualGradeTest(
      testId,
      userId,
      gradeDto,
    );
  }

  @Get('/:testId/submissions')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Lấy danh sách nộp bài test IELTS' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách nộp bài test thành công',
  })
  async getTestSubmissions(@Param('testId', ParseIntPipe) testId: number) {
    return await this.ieltsWritingService.getTestSubmissions(testId);
  }

  @Get('/:testId/submission/:submissionId')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Lấy thông tin nộp bài test IELTS' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin nộp bài test thành công',
  })
  async getTestSubmission(
    @Param('testId', ParseIntPipe) testId: number,
    @Param('submissionId', ParseIntPipe) submissionId: number,
  ) {
    return await this.ieltsWritingService.getTestSubmission(
      testId,
      submissionId,
    );
  }
}
