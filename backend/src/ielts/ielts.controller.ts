import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { IeltsService } from './ielts.service';
import {
  CreateIeltsTestDto,
  UpdateIeltsTestDto,
  CreateIeltsSectionDto,
  CreateIeltsQuestionDto,
  SubmitIeltsDto,
  IeltsFilterDto,
  UpdateIeltsSectionDto,
  UpdateIeltsQuestionDto,
} from './dto/ielts.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('IELTS')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ielts')
export class IeltsController {
  constructor(private readonly ieltsService: IeltsService) {}

  @Post('tests')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Tạo bài test IELTS mới' })
  @ApiResponse({ status: 201, description: 'Tạo bài test thành công' })
  async create(
    @Body() createIeltsTestDto: CreateIeltsTestDto,
    @CurrentUser() user: any,
  ) {
    return this.ieltsService.create(createIeltsTestDto, user.id);
  }

  @Get('tests')
  @ApiOperation({ summary: 'Lấy danh sách bài test IELTS' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'skill',
    required: false,
    enum: ['READING', 'WRITING', 'LISTENING', 'SPEAKING'],
  })
  @ApiQuery({
    name: 'level',
    required: false,
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(@Query() filterDto: IeltsFilterDto) {
    return this.ieltsService.findAll(filterDto);
  }

  @Get('tests/:id')
  @ApiOperation({ summary: 'Lấy chi tiết bài test IELTS' })
  @ApiResponse({ status: 200, description: 'Chi tiết bài test' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài test' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ieltsService.findOne(id);
  }

  @Get('tests/:id/with-answers')
  @Roles(Role.TEACHER)
  @ApiOperation({
    summary: 'Lấy chi tiết bài test IELTS kèm đáp án (Teacher only)',
  })
  @ApiResponse({ status: 200, description: 'Chi tiết bài test với đáp án' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài test' })
  findOneWithAnswers(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.ieltsService.findOneWithAnswers(id, user.id);
  }

  @Patch('tests/:id')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Cập nhật bài test IELTS' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài test' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateIeltsTestDto: UpdateIeltsTestDto,
    @CurrentUser() user: any,
  ) {
    return this.ieltsService.update(id, updateIeltsTestDto, user.id);
  }

  @Delete('tests/:id')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Xóa bài test IELTS' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài test' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.ieltsService.remove(id, user.id);
  }

  @Post('tests/:id/sections')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Thêm phần mới vào bài test IELTS' })
  @ApiResponse({ status: 201, description: 'Thêm phần thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài test' })
  @ApiResponse({ status: 403, description: 'Không có quyền thêm phần' })
  createSection(
    @Param('id', ParseIntPipe) testId: number,
    @Body() createSectionDto: CreateIeltsSectionDto,
    @CurrentUser() user: any,
  ) {
    return this.ieltsService.createSection(testId, createSectionDto, user.id);
  }

  @Patch('sections/:id')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Cập nhật một phần' })
  @ApiResponse({ status: 200, description: 'Cập nhật phần thành công' })
  updateSection(
    @Param('id', ParseIntPipe) sectionId: number,
    @Body() updateSectionDto: UpdateIeltsSectionDto,
    @CurrentUser() user: any,
  ) {
    return this.ieltsService.updateSection(
      sectionId,
      updateSectionDto,
      user.id,
    );
  }

  @Delete('sections/:id')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Xóa một phần' })
  @ApiResponse({ status: 200, description: 'Xóa phần thành công' })
  removeSection(
    @Param('id', ParseIntPipe) sectionId: number,
    @CurrentUser() user: any,
  ) {
    return this.ieltsService.removeSection(sectionId, user.id);
  }

  @Post('sections/:id/questions')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Thêm câu hỏi mới vào phần' })
  @ApiResponse({ status: 201, description: 'Thêm câu hỏi thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy phần' })
  @ApiResponse({ status: 403, description: 'Không có quyền thêm câu hỏi' })
  createQuestion(
    @Param('id', ParseIntPipe) sectionId: number,
    @Body() createQuestionDto: CreateIeltsQuestionDto,
    @CurrentUser() user: any,
  ) {
    return this.ieltsService.createQuestion(
      sectionId,
      createQuestionDto,
      user.id,
    );
  }

  @Patch('questions/:id')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Cập nhật một câu hỏi' })
  @ApiResponse({ status: 200, description: 'Cập nhật câu hỏi thành công' })
  updateQuestion(
    @Param('id', ParseIntPipe) questionId: number,
    @Body() updateQuestionDto: UpdateIeltsQuestionDto,
    @CurrentUser() user: any,
  ) {
    return this.ieltsService.updateQuestion(
      questionId,
      updateQuestionDto,
      user.id,
    );
  }

  @Delete('questions/:id')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Xóa một câu hỏi' })
  @ApiResponse({ status: 200, description: 'Xóa câu hỏi thành công' })
  removeQuestion(
    @Param('id', ParseIntPipe) questionId: number,
    @CurrentUser() user: any,
  ) {
    return this.ieltsService.removeQuestion(questionId, user.id);
  }

  @Post('tests/:id/submit')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Nộp bài test IELTS' })
  @ApiResponse({ status: 201, description: 'Nộp bài thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài test' })
  submit(
    @Param('id', ParseIntPipe) id: number,
    @Body() submitIeltsDto: SubmitIeltsDto,
    @CurrentUser() user: any,
  ) {
    return this.ieltsService.submit(id, submitIeltsDto, user.id);
  }

  @Get('tests/:id/submissions')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Lấy danh sách bài nộp (Teacher only)' })
  @ApiResponse({ status: 200, description: 'Danh sách bài nộp' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài test' })
  getSubmissions(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.ieltsService.getSubmissions(id, user.id);
  }

  @Get('my-submissions')
  @ApiOperation({ summary: 'Lấy danh sách bài nộp của tôi' })
  @ApiResponse({ status: 200, description: 'Danh sách bài nộp của tôi' })
  getMySubmissions(@CurrentUser() user: any) {
    return this.ieltsService.getMySubmissions(user.id);
  }

  @Get('submissions')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Lấy tất cả bài nộp IELTS (Teacher only)' })
  @ApiResponse({ status: 200, description: 'Danh sách tất cả bài nộp' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getAllSubmissions(@CurrentUser() user: any) {
    return this.ieltsService.getAllSubmissions(user.id);
  }

  @Get('submissions/:submissionId/details')
  @ApiOperation({ summary: 'Lấy chi tiết kết quả bài nộp IELTS' })
  @ApiResponse({ status: 200, description: 'Chi tiết kết quả' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài nộp' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  getSubmissionDetails(
    @Param('submissionId', ParseIntPipe) submissionId: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.ieltsService.getSubmissionDetails(submissionId, userId);
  }
}
