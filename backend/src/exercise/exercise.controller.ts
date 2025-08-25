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
  Put,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { ExerciseService } from './exercise.service';
import {
  CreateExerciseDto,
  UpdateExerciseDto,
  ExerciseFilterDto,
  GradeExerciseDto,
} from './dto/exercise.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ExerciseStatus, Role } from '@prisma/client';

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
    enum: ['DRAFT', 'ACTIVE', 'CLOSED', 'OVERDUE'],
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
  @ApiResponse({ status: 403, description: 'Forbidden' })
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
    @Body() body: { status: ExerciseStatus },
    @CurrentUser('sub') userId: number,
  ) {
    return this.exerciseService.updateStatus(id, body.status, userId);
  }

  @Post(':id/upload-file')
  @Roles(Role.TEACHER)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload PDF file for exercise' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file format' })
  async uploadFile(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('sub') userId: number,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are allowed');
    }

    return this.exerciseService.uploadFile(id, file, userId);
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
    @Body() body: { imageLinks: string[] },
    @CurrentUser() user: any,
  ) {
    return this.exerciseService.submitExercise(+id, user.id, body.imageLinks);
  }

  @Get(':id/submissions')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Lấy danh sách bài nộp (Teacher only)' })
  @ApiResponse({ status: 200, description: 'Danh sách bài nộp' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
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

  @Get('all')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Lấy tất cả bài nộp (Teacher only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Tất cả bài nộp' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getAllSubmissions(@Query() query: any, @CurrentUser() user: any) {
    return this.exerciseService.getAllSubmissions(user.id, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Thống kê bài nộp của tôi' })
  @ApiResponse({ status: 200, description: 'Thống kê bài nộp' })
  getMyStats(@CurrentUser() user: any) {
    return this.exerciseService.getMyStats(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết bài nộp' })
  @ApiResponse({ status: 200, description: 'Chi tiết bài nộp' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài nộp' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem bài nộp này' })
  getSubmission(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.exerciseService.getSubmissionById(id, user.id);
  }

  @Get(':id/max-score')
  @ApiOperation({ summary: 'Lấy điểm tối đa của bài tập qua id của bài nộp' })
  @ApiResponse({ status: 200, description: 'Điểm tối đa của bài tập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài nộp' })
  getMaxScore(@Param('id', ParseIntPipe) id: number) {
    return this.exerciseService.getExerciseMaxScore(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật bài nộp' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài nộp' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền cập nhật bài nộp này',
  })
  updateSubmission(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { imageLinks: string[] },
    @CurrentUser() user: any,
  ) {
    return this.exerciseService.updateSubmission(id, body.imageLinks, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa bài nộp' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài nộp' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa bài nộp này' })
  deleteSubmission(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.exerciseService.deleteSubmission(id, user.id);
  }
}
