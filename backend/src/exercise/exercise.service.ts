import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateExerciseDto,
  UpdateExerciseDto,
  ExerciseFilterDto,
  GradeExerciseDto,
} from './dto/exercise.dto';
import { PaginatedResultDto } from '../common/dto/pagination.dto';
import { $Enums, ExerciseStatus, SubmissionStatus } from '@prisma/client';

@Injectable()
export class ExerciseService {
  constructor(private prisma: PrismaService) {}

  async create(createExerciseDto: CreateExerciseDto, userId: number) {
    const exercise = await this.prisma.exercise.create({
      data: {
        name: createExerciseDto.name,
        description: createExerciseDto.description,
        subject: createExerciseDto.subject as $Enums.Subject,
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
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },

            email: true,
          },
        },
      },
    });

    return exercise;
  }

  async findAll(filters: ExerciseFilterDto): Promise<PaginatedResultDto> {
    const {
      page = 1,
      limit = 10,
      search,
      subject,
      grade,
      status,
      createdBy,
    } = filters;
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

    if (status) {
      where.status = status;
    }

    if (createdBy) {
      where.createdBy = createdBy;
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
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },

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

  async findOne(id: number, userId?: number) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,

            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
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

  async findOneWithAnswers(id: number, userId: number) {
    // Get user info first
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    // Then get exercise info
    const exercise = await this.prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      throw new NotFoundException('Không tìm thấy bài tập');
    }

    // Check if user can see answers (Teacher or creator)
    const canSeeAnswers =
      user?.role === 'TEACHER' || exercise.createdBy === userId;

    if (!canSeeAnswers) {
      throw new ForbiddenException('Forbidden');
    }

    // Get exercise with all details including answers
    const exerciseWithAnswers = await this.prisma.exercise.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },

            email: true,
          },
        },
        _count: {
          select: {
            exerciseSubmissions: true,
          },
        },
        exerciseSubmissions: {
          include: {
            user: {
              select: {
                id: true,

                email: true,
              },
            },
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
    });

    return exerciseWithAnswers;
  }

  async update(
    id: number,
    updateExerciseDto: UpdateExerciseDto,
    userId: number,
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

  async updateStatus(id: number, status: ExerciseStatus, userId: number) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      throw new NotFoundException('Không tìm thấy bài tập');
    }

    if (exercise.createdBy !== userId) {
      throw new ForbiddenException(
        'Không có quyền thay đổi trạng thái bài tập này',
      );
    }

    return this.prisma.exercise.update({
      where: { id },
      data: {
        status: status,
      },
      include: {
        creator: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },

            email: true,
          },
        },
      },
    });
  }

  async remove(id: number, userId: number) {
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
    userId: number,
    imageLinks: string[],
  ) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundException('Không tìm thấy bài tập');
    }

    // Convert image links array to JSON string for storage
    const imageLinksJson = JSON.stringify(imageLinks);

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
          submissionUrl: imageLinksJson,
          submittedAt: new Date(),
          status: SubmissionStatus.SUBMITTED,
          version: existingSubmission.version + 1,
        },
      });
    }

    // Create new submission
    const submission = await this.prisma.exerciseSubmission.create({
      data: {
        exerciseId,
        userId,
        submissionUrl: imageLinksJson,
        status: SubmissionStatus.SUBMITTED,
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
    userId: number,
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

    if (user?.role !== $Enums.Role.TEACHER && exercise.createdBy !== userId) {
      throw new ForbiddenException('Forbidden');
    }

    const submissions = await this.prisma.exerciseSubmission.findMany({
      where: { exerciseId: id },
      include: {
        user: {
          select: {
            id: true,

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
    submissionId: number,
    gradeExerciseDto: GradeExerciseDto,
    userId: number,
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

    if (
      user?.role !== $Enums.Role.TEACHER ||
      submission.exercise.createdBy !== userId
    ) {
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

  async getMySubmissions(userId: number, query: any) {
    const { page = 1, limit = 10 } = query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [submissions, total] = await Promise.all([
      this.prisma.exerciseSubmission.findMany({
        where: { userId },
        include: {
          exercise: {
            select: {
              id: true,
              name: true,
              subject: true,
              grade: true,
              status: true,
              deadline: true,
              creator: {
                select: {
                  id: true,
                  profile: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: limitNum,
      }),
      this.prisma.exerciseSubmission.count({
        where: { userId },
      }),
    ]);

    return {
      data: submissions,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async getAllSubmissions(userId: number, query: any) {
    const { page = 1, limit = 10 } = query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Get user role to determine what submissions they can see
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== 'TEACHER') {
      throw new ForbiddenException(
        'Chỉ giáo viên mới có thể xem tất cả bài nộp',
      );
    }

    const [submissions, total] = await Promise.all([
      this.prisma.exerciseSubmission.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          exercise: {
            select: {
              id: true,
              name: true,
              subject: true,
              grade: true,
              status: true,
              deadline: true,
              creator: {
                select: {
                  id: true,
                  profile: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: limitNum,
      }),
      this.prisma.exerciseSubmission.count(),
    ]);

    return {
      data: submissions,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async getExerciseMaxScore(exerciseId: number): Promise<number> {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
      select: {
        maxScore: true,
      },
    });
    if (!exercise) {
      throw new NotFoundException('Không tìm thấy bài tập');
    }
    return exercise.maxScore || 10;
  }
  async getMyStats(userId: number) {
    const [submittedCount, averageScore, gradedCount, recentSubmissions] =
      await Promise.all([
        this.prisma.exerciseSubmission.count({
          where: { userId },
        }),
        this.prisma.exerciseSubmission.aggregate({
          where: {
            userId,
            score: { not: null },
          },
          _avg: { score: true },
        }),
        this.prisma.exerciseSubmission.count({
          where: {
            userId,
            status: SubmissionStatus.GRADED,
          },
        }),
        this.prisma.exerciseSubmission.findMany({
          where: { userId },
          include: {
            exercise: {
              select: {
                id: true,

                subject: true,
              },
            },
          },
          orderBy: { submittedAt: 'desc' },
          take: 5,
        }),
      ]);

    return {
      submitted: submittedCount,
      averageScore: Math.round(averageScore._avg.score || 0),
      graded: gradedCount,
      pending: submittedCount - gradedCount,
      recentSubmissions,
    };
  }

  async getSubmissionById(submissionId: number, userId: number) {
    const submission = await this.prisma.exerciseSubmission.findUnique({
      where: { id: submissionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        exercise: {
          select: {
            id: true,
            name: true,
            createdBy: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Không tìm thấy bài nộp');
    }

    // Check permission: student can only see their own submission, teacher can see all
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.role === 'STUDENT' && submission.userId !== userId) {
      throw new ForbiddenException('Không có quyền xem bài nộp này');
    }
    if (user?.role === 'TEACHER' && submission.exercise.createdBy !== userId) {
      throw new ForbiddenException('Không có quyền xem bài nộp này');
    }

    return submission;
  }

  async updateSubmission(
    submissionId: number,
    imageLinks: string[],
    userId: number,
  ) {
    const submission = await this.prisma.exerciseSubmission.findUnique({
      where: { id: submissionId },
      include: { exercise: true },
    });

    if (!submission) {
      throw new NotFoundException('Không tìm thấy bài nộp');
    }

    // Only the student who submitted can update their submission
    if (submission.userId !== userId) {
      throw new ForbiddenException('Không có quyền cập nhật bài nộp này');
    }

    // Check if exercise is still active
    if (submission.exercise.status !== 'ACTIVE') {
      throw new BadRequestException('Bài tập không còn hoạt động');
    }

    // Check deadline
    if (
      submission.exercise.deadline &&
      new Date() > submission.exercise.deadline
    ) {
      throw new BadRequestException('Đã hết hạn nộp bài');
    }

    const imageLinksJson = JSON.stringify(imageLinks);

    return this.prisma.exerciseSubmission.update({
      where: { id: submissionId },
      data: {
        submissionUrl: imageLinksJson,
        submittedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        exercise: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async deleteSubmission(submissionId: number, userId: number) {
    const submission = await this.prisma.exerciseSubmission.findUnique({
      where: { id: submissionId },
      include: { exercise: true },
    });

    if (!submission) {
      throw new NotFoundException('Không tìm thấy bài nộp');
    }

    // Only the student who submitted can delete their submission
    if (submission.userId !== userId) {
      throw new ForbiddenException('Không có quyền xóa bài nộp này');
    }

    // Check if exercise is still active
    if (submission.exercise.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Bài tập không còn hoạt động, không thể xóa bài nộp',
      );
    }

    // Check deadline
    if (
      submission.exercise.deadline &&
      new Date() > submission.exercise.deadline
    ) {
      throw new BadRequestException('Đã hết hạn, không thể xóa bài nộp');
    }

    await this.prisma.exerciseSubmission.delete({
      where: { id: submissionId },
    });

    return { message: 'Xóa bài nộp thành công' };
  }
}
