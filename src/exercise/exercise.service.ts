import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateExerciseDto,
  UpdateExerciseDto,
  ExerciseFilterDto,
  SubmitExerciseDto,
  GradeExerciseDto,
} from './dto/exercise.dto';
import { PaginatedResultDto } from '../common/dto/pagination.dto';

@Injectable()
export class ExerciseService {
  constructor(private prisma: PrismaService) {}

  async create(createExerciseDto: CreateExerciseDto, userId: string) {
    const exercise = await this.prisma.exercise.create({
      data: {
        name: createExerciseDto.name,
        description: createExerciseDto.description,
        subject: createExerciseDto.subject,
        grade: createExerciseDto.grade,
        deadline: new Date(createExerciseDto.deadline),
        note: createExerciseDto.note,
        content: createExerciseDto.content,
        latexContent: createExerciseDto.latexContent,
        status: 'DRAFT',
        createdBy: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return exercise;
  }

  async findAll(filters: ExerciseFilterDto): Promise<PaginatedResultDto> {
    const { page = 1, limit = 10, search, subject, grade } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (subject) {
      where.subject = subject;
    }

    if (grade) {
      where.grade = grade;
    }

    const [exercises, total] = await Promise.all([
      this.prisma.exercise.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              exerciseSubmissions: true,
            },
          },
        },
      }),
      this.prisma.exercise.count({ where }),
    ]);

    return {
      data: exercises,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, userId?: string) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            exerciseSubmissions: true,
          },
        },
        ...(userId && {
          exerciseSubmissions: {
            where: { userId },
            select: {
              id: true,
              submittedAt: true,
              status: true,
              score: true,
            },
          },
        }),
      },
    });

    if (!exercise) {
      throw new NotFoundException('Không tìm thấy bài tập');
    }

    return exercise;
  }

  async update(
    id: number,
    updateExerciseDto: UpdateExerciseDto,
    userId: string,
  ) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      throw new NotFoundException('Không tìm thấy bài tập');
    }

    if (exercise.createdBy !== userId) {
      throw new ForbiddenException('Không có quyền cập nhật bài tập này');
    }

    const updateData: any = { ...updateExerciseDto };
    if (updateExerciseDto.deadline) {
      updateData.deadline = new Date(updateExerciseDto.deadline);
    }

    return this.prisma.exercise.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number, userId: string) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      throw new NotFoundException('Không tìm thấy bài tập');
    }

    if (exercise.createdBy !== userId) {
      throw new ForbiddenException('Không có quyền xóa bài tập này');
    }

    return this.prisma.exercise.delete({
      where: { id },
    });
  }

  async submitExercise(
    exerciseId: number,
    userId: string,
    submitDto: SubmitExerciseDto,
  ) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundException('Không tìm thấy bài tập');
    }

    // Check if already submitted
    const existingSubmission = await this.prisma.exerciseSubmission.findFirst({
      where: {
        exerciseId,
        userId,
      },
    });

    if (existingSubmission) {
      // Update existing submission
      return this.prisma.exerciseSubmission.update({
        where: { id: existingSubmission.id },
        data: {
          content: submitDto.content,
          submittedAt: new Date(),
          status: 'SUBMITTED',
          version: existingSubmission.version + 1,
        },
      });
    }

    // Create new submission
    const submission = await this.prisma.exerciseSubmission.create({
      data: {
        exerciseId,
        userId,
        content: submitDto.content,
        status: 'SUBMITTED',
      },
    });

    // Update exercise submission count
    await this.prisma.exercise.update({
      where: { id: exerciseId },
      data: {
        submissions: {
          increment: 1,
        },
      },
    });

    return submission;
  }

  async getSubmissions(
    id: number,
    userId: string,
  ): Promise<PaginatedResultDto> {
    // Only creator or admin can view all submissions
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const exercise = await this.prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      throw new NotFoundException('Không tìm thấy bài tập');
    }

    if (user?.role !== 'ADMIN' && exercise.createdBy !== userId) {
      throw new ForbiddenException('Không có quyền xem bài nộp');
    }

    const submissions = await this.prisma.exerciseSubmission.findMany({
      where: { exerciseId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return {
      data: submissions,
      meta: {
        page: 1,
        limit: submissions.length,
        total: submissions.length,
        totalPages: 1,
      },
    };
  }

  async gradeSubmission(
    submissionId: string,
    gradeExerciseDto: GradeExerciseDto,
    userId: string,
  ) {
    const { score, feedback } = gradeExerciseDto;

    const submission = await this.prisma.exerciseSubmission.findUnique({
      where: { id: submissionId },
      include: {
        exercise: true,
      },
    });

    if (!submission) {
      throw new NotFoundException('Không tìm thấy bài nộp');
    }

    // Only creator or admin can grade
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.role !== 'ADMIN' && submission.exercise.createdBy !== userId) {
      throw new ForbiddenException('Không có quyền chấm điểm');
    }

    const gradedSubmission = await this.prisma.exerciseSubmission.update({
      where: { id: submissionId },
      data: {
        score,
        feedback,
        gradedAt: new Date(),
        status: 'GRADED',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return gradedSubmission;
  }

  private async updateExerciseStats(exerciseId: number) {
    const submissionCount = await this.prisma.exerciseSubmission.count({
      where: { exerciseId },
    });

    await this.prisma.exercise.update({
      where: { id: exerciseId },
      data: {
        submissions: submissionCount,
      },
    });
  }
}
