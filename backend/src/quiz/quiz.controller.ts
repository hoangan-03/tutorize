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
import { QuizService } from './quiz.service';
import {
  CreateQuizDto,
  UpdateQuizDto,
  QuizFilterDto,
  SubmitQuizDto,
  GradeSubmissionDto,
  UpdateQuizStatusDto,
} from './dto/quiz.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Quizzes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Tạo quiz mới' })
  @ApiResponse({ status: 201, description: 'Tạo quiz thành công' })
  async create(@Body() createQuizDto: CreateQuizDto, @CurrentUser() user: any) {
    return this.quizService.create(createQuizDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách quiz' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'subject', required: false, type: String })
  @ApiQuery({ name: 'grade', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['DRAFT', 'ACTIVE', 'INACTIVE'],
  })
  @ApiQuery({ name: 'createdBy', required: false, type: String })
  @ApiQuery({ name: 'tags', required: false, type: String })
  @ApiQuery({ name: 'isPublic', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(@Query() filterDto: QuizFilterDto) {
    return this.quizService.findAll(filterDto);
  }

  @Get('teacher-stats')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Thống kê quiz cho giáo viên' })
  @ApiResponse({ status: 200, description: 'Thống kê quiz của giáo viên' })
  getTeacherStats(@CurrentUser('sub') userId: number) {
    return this.quizService.getTeacherStats(userId);
  }

  @Get('student-stats')
  @ApiOperation({ summary: 'Thống kê quiz cho học sinh' })
  @ApiResponse({ status: 200, description: 'Thống kê quiz của học sinh' })
  getStudentStats(@CurrentUser('sub') userId: number) {
    return this.quizService.getStudentQuizStats(userId);
  }

  @Get('my-submission-stats')
  @ApiOperation({ summary: 'Thống kê bài nộp của tôi' })
  @ApiResponse({ status: 200, description: 'Thống kê bài nộp' })
  getMySubmissionStats(@CurrentUser() user: any) {
    return this.quizService.getMyStats(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết quiz' })
  @ApiResponse({ status: 200, description: 'Chi tiết quiz' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy quiz' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: number,
  ) {
    return this.quizService.findOne(id, userId);
  }

  @Get(':id/with-answers')
  @Roles(Role.TEACHER)
  @ApiOperation({
    summary: 'Lấy chi tiết quiz kèm đáp án (Teacher only)',
  })
  @ApiResponse({ status: 200, description: 'Chi tiết quiz với đáp án' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy quiz' })
  findOneWithAnswers(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: number,
  ) {
    return this.quizService.findOneWithAnswers(id, userId);
  }

  @Patch(':id')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Cập nhật quiz' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy quiz' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuizDto: UpdateQuizDto,
    @CurrentUser('sub') userId: number,
  ) {
    return this.quizService.update(id, updateQuizDto, userId);
  }

  @Delete(':id')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Xóa quiz' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy quiz' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: number,
  ) {
    return this.quizService.remove(id, userId);
  }

  @Patch(':id/status')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Cập nhật trạng thái quiz' })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy quiz' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateQuizStatusDto,
    @CurrentUser('sub') userId: number,
  ) {
    return this.quizService.updateStatus(id, updateStatusDto, userId);
  }

  @Post('check-overdue')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Kiểm tra và cập nhật quiz quá hạn' })
  @ApiResponse({ status: 200, description: 'Kiểm tra thành công' })
  checkOverdueQuizzes() {
    return this.quizService.checkAndUpdateOverdueQuizzes();
  }

  @Post(':id/submit')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Nộp bài quiz' })
  @ApiResponse({ status: 201, description: 'Nộp bài thành công' })
  @ApiResponse({
    status: 400,
    description: 'Quiz không còn hoạt động hoặc đã hết hạn',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy quiz' })
  submit(
    @Param('id', ParseIntPipe) id: number,
    @Body() submitQuizDto: SubmitQuizDto,
    @CurrentUser('sub') userId: number,
  ) {
    return this.quizService.submit(id, submitQuizDto, userId);
  }

  @Get(':id/submissions')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Lấy danh sách bài nộp (Teacher only)' })
  @ApiResponse({ status: 200, description: 'Danh sách bài nộp' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy quiz' })
  getSubmissions(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: number,
  ) {
    return this.quizService.getSubmissions(id, userId);
  }

  @Patch('submissions/:submissionId/grade')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Chấm điểm bài nộp (Teacher only)' })
  @ApiResponse({ status: 200, description: 'Chấm điểm thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền chấm điểm' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài nộp' })
  gradeSubmission(
    @Param('submissionId') submissionId: number,
    @Body() gradeSubmissionDto: GradeSubmissionDto,
    @CurrentUser('sub') userId: number,
  ) {
    return this.quizService.gradeSubmission(
      submissionId,
      gradeSubmissionDto,
      userId,
    );
  }

  @Get(':id/submission-history')
  @ApiOperation({ summary: 'Lấy lịch sử nộp bài của user cho quiz này' })
  @ApiResponse({ status: 200, description: 'Lịch sử nộp bài của user' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy quiz' })
  getQuizSubmissionHistory(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.quizService.getQuizSubmissionHistory(id, user.id);
  }

  @Get(':id/detailed-stats')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Thống kê chi tiết quiz (Teacher only)' })
  @ApiResponse({ status: 200, description: 'Thống kê chi tiết quiz' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem thống kê' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy quiz' })
  getQuizDetailedStats(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: number,
  ) {
    return this.quizService.getQuizDetailedStats(id, userId);
  }
}

@ApiTags('Quiz Submissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('quiz-submissions')
export class QuizSubmissionController {
  constructor(private readonly quizService: QuizService) {}

  @Get('my')
  @ApiOperation({ summary: 'Lấy danh sách bài nộp của tôi' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Danh sách bài nộp của user' })
  getMySubmissions(@Query() query: any, @CurrentUser() user: any) {
    return this.quizService.getMySubmissions(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết bài nộp' })
  @ApiResponse({ status: 200, description: 'Chi tiết bài nộp' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài nộp' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem bài nộp' })
  getSubmission(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: number,
  ) {
    return this.quizService.getSubmissionById(id, userId);
  }
}
