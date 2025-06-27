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
  @Roles(Role.ADMIN, Role.TEACHER)
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
    enum: ['DRAFT', 'ACTIVE', 'CLOSED'],
  })
  @ApiQuery({ name: 'createdBy', required: false, type: String })
  @ApiQuery({ name: 'tags', required: false, type: String })
  @ApiQuery({ name: 'isPublic', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(@Query() filterDto: QuizFilterDto) {
    return this.quizService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết quiz' })
  @ApiResponse({ status: 200, description: 'Chi tiết quiz' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy quiz' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: string,
  ) {
    return this.quizService.findOne(id, userId);
  }

  @Get(':id/with-answers')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({
    summary: 'Lấy chi tiết quiz kèm đáp án (Admin/Teacher only)',
  })
  @ApiResponse({ status: 200, description: 'Chi tiết quiz với đáp án' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy quiz' })
  findOneWithAnswers(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: string,
  ) {
    return this.quizService.findOneWithAnswers(id, userId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Cập nhật quiz' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy quiz' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuizDto: UpdateQuizDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.quizService.update(id, updateQuizDto, userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Xóa quiz' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy quiz' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: string,
  ) {
    return this.quizService.remove(id, userId);
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
    @CurrentUser('sub') userId: string,
  ) {
    return this.quizService.submit(id, submitQuizDto, userId);
  }

  @Get(':id/submissions')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Lấy danh sách bài nộp (Admin/Teacher only)' })
  @ApiResponse({ status: 200, description: 'Danh sách bài nộp' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem bài nộp' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy quiz' })
  getSubmissions(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: string,
  ) {
    return this.quizService.getSubmissions(id, userId);
  }

  @Patch('submissions/:submissionId/grade')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Chấm điểm bài nộp (Admin/Teacher only)' })
  @ApiResponse({ status: 200, description: 'Chấm điểm thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền chấm điểm' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài nộp' })
  gradeSubmission(
    @Param('submissionId') submissionId: string,
    @Body() gradeSubmissionDto: GradeSubmissionDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.quizService.gradeSubmission(
      submissionId,
      gradeSubmissionDto,
      userId,
    );
  }
}
