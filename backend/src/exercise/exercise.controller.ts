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
import { ExerciseService } from './exercise.service';
import {
  CreateExerciseDto,
  UpdateExerciseDto,
  ExerciseFilterDto,
  SubmitExerciseDto,
  GradeExerciseDto,
} from './dto/exercise.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Exercises')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('exercises')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Post()
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Tạo bài tập mới' })
  @ApiResponse({ status: 201, description: 'Tạo bài tập thành công' })
  async create(
    @Body() createExerciseDto: CreateExerciseDto,
    @CurrentUser() user: any,
  ) {
    return this.exerciseService.create(createExerciseDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách bài tập' })
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
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(@Query() filterDto: ExerciseFilterDto) {
    return this.exerciseService.findAll(filterDto);
  }

  @Patch('submissions/:submissionId/grade')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Chấm điểm bài nộp (Teacher only)' })
  @ApiResponse({ status: 200, description: 'Chấm điểm thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền chấm điểm' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài nộp' })
  gradeSubmission(
    @Param('submissionId') submissionId: number,
    @Body() gradeExerciseDto: GradeExerciseDto,
    @CurrentUser('sub') userId: number,
  ) {
    return this.exerciseService.gradeSubmission(
      submissionId,
      gradeExerciseDto,
      userId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết bài tập' })
  @ApiResponse({ status: 200, description: 'Chi tiết bài tập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài tập' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: number,
  ) {
    return this.exerciseService.findOne(id, userId);
  }

  @Get(':id/with-answers')
  @Roles(Role.TEACHER)
  @ApiOperation({
    summary: 'Lấy chi tiết bài tập kèm đáp án (Teacher only)',
  })
  @ApiResponse({ status: 200, description: 'Chi tiết bài tập với đáp án' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài tập' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem đáp án' })
  findOneWithAnswers(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: number,
  ) {
    return this.exerciseService.findOneWithAnswers(id, userId);
  }

  @Patch(':id')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Cập nhật bài tập' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài tập' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExerciseDto: UpdateExerciseDto,
    @CurrentUser('sub') userId: number,
  ) {
    return this.exerciseService.update(id, updateExerciseDto, userId);
  }

  @Patch(':id/status')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Thay đổi trạng thái bài tập (đóng/mở)' })
  @ApiResponse({ status: 200, description: 'Thay đổi trạng thái thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài tập' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền thay đổi trạng thái',
  })
  toggleStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: 'ACTIVE' | 'CLOSED' },
    @CurrentUser('sub') userId: number,
  ) {
    return this.exerciseService.updateStatus(id, body.status, userId);
  }

  @Delete(':id')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Xóa bài tập' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài tập' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: number,
  ) {
    return this.exerciseService.remove(id, userId);
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Nộp bài tập' })
  @ApiResponse({ status: 201, description: 'Nộp bài thành công' })
  @ApiResponse({
    status: 400,
    description: 'Bài tập không còn hoạt động hoặc đã hết hạn',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài tập' })
  async submitExercise(
    @Param('id', ParseIntPipe) id: number,
    @Body() submitExerciseDto: SubmitExerciseDto,
    @CurrentUser() user: any,
  ) {
    return this.exerciseService.submitExercise(+id, user.id, submitExerciseDto);
  }

  @Get(':id/submissions')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Lấy danh sách bài nộp (Teacher only)' })
  @ApiResponse({ status: 200, description: 'Danh sách bài nộp' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem bài nộp' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài tập' })
  getSubmissions(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: number,
  ) {
    return this.exerciseService.getSubmissions(id, userId);
  }
}

@ApiTags('Exercise Submissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('exercise-submissions')
export class ExerciseSubmissionController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Get('my')
  @ApiOperation({ summary: 'Lấy danh sách bài nộp của tôi' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Danh sách bài nộp của user' })
  getMySubmissions(@Query() query: any, @CurrentUser() user: any) {
    return this.exerciseService.getMySubmissions(user.id, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Thống kê bài nộp của tôi' })
  @ApiResponse({ status: 200, description: 'Thống kê bài nộp' })
  getMyStats(@CurrentUser() user: any) {
    return this.exerciseService.getMyStats(user.id);
  }
}
