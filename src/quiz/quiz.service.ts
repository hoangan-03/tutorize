import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateQuizDto,
  UpdateQuizDto,
  QuizFilterDto,
  SubmitQuizDto,
  GradeSubmissionDto,
} from './dto/quiz.dto';
import { PaginatedResultDto } from '../common/dto/pagination.dto';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async create(createQuizDto: CreateQuizDto, createdBy: string) {
    const { questions, ...quizData } = createQuizDto;

    const quiz = await this.prisma.quiz.create({
      data: {
        ...quizData,
        createdBy,
        totalQuestions: questions.length,
        questions: {
          create: questions.map((question) => ({
            ...question,
            options: question.options || [],
            correctAnswers: question.correctAnswers || [],
          })),
        },
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return quiz;
  }

  async findAll(filterDto: QuizFilterDto): Promise<PaginatedResultDto> {
    const {
      page = 1,
      limit = 10,
      subject,
      grade,
      status,
      createdBy,
      tags,
      isPublic,
      search,
    } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (subject) {
      where.subject = { contains: subject, mode: 'insensitive' };
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

    if (typeof isPublic === 'boolean') {
      where.isPublic = isPublic;
    }

    if (tags) {
      where.tags = { hasSome: [tags] };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [quizzes, total] = await Promise.all([
      this.prisma.quiz.findMany({
        where,
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
              questions: true,
              submissions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.quiz.count({ where }),
    ]);

    return {
      data: quizzes,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, userId?: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            question: true,
            type: true,
            options: true,
            points: true,
            order: true,
            imageUrl: true,
            audioUrl: true,
            // Don't include correctAnswers for students
            ...(userId && {
              correctAnswers: false,
              explanation: false,
            }),
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        submissions: userId
          ? {
              where: { userId },
              select: {
                id: true,
                score: true,
                submittedAt: true,
                status: true,
              },
            }
          : false,
      },
    });

    if (!quiz) {
      throw new NotFoundException('Không tìm thấy quiz');
    }

    return quiz;
  }

  async findOneWithAnswers(id: number, userId: string) {
    // Get user info first
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    // Then get quiz info
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
    });

    if (!quiz) {
      throw new NotFoundException('Không tìm thấy quiz');
    }

    // Check if user can see answers
    const canSeeAnswers = user?.role === 'ADMIN' || quiz.createdBy === userId;

    // Get quiz with conditional answer visibility
    const quizWithAnswers = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            question: true,
            type: true,
            options: true,
            correctAnswers: canSeeAnswers,
            explanation: canSeeAnswers,
            points: true,
            order: true,
            imageUrl: true,
            audioUrl: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return quizWithAnswers;
  }

  async update(id: number, updateQuizDto: UpdateQuizDto, userId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
    });

    if (!quiz) {
      throw new NotFoundException('Không tìm thấy quiz');
    }

    // Only creator or admin can update
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.role !== 'ADMIN' && quiz.createdBy !== userId) {
      throw new ForbiddenException('Không có quyền cập nhật quiz này');
    }

    const updatedQuiz = await this.prisma.quiz.update({
      where: { id },
      data: updateQuizDto,
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updatedQuiz;
  }

  async remove(id: number, userId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
    });

    if (!quiz) {
      throw new NotFoundException('Không tìm thấy quiz');
    }

    // Only creator or admin can delete
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.role !== 'ADMIN' && quiz.createdBy !== userId) {
      throw new ForbiddenException('Không có quyền xóa quiz này');
    }

    await this.prisma.quiz.delete({
      where: { id },
    });

    return { message: 'Xóa quiz thành công' };
  }

  async submit(id: number, submitQuizDto: SubmitQuizDto, userId: string) {
    const { answers, timeSpent } = submitQuizDto;

    // Check if quiz exists and is active
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: true,
      },
    });

    if (!quiz) {
      throw new NotFoundException('Không tìm thấy quiz');
    }

    if (quiz.status !== 'ACTIVE') {
      throw new BadRequestException('Quiz không còn hoạt động');
    }

    if (new Date() > quiz.deadline) {
      throw new BadRequestException('Quiz đã hết hạn');
    }

    // Check if user already submitted
    const existingSubmission = await this.prisma.quizSubmission.findUnique({
      where: {
        quizId_userId: {
          quizId: id,
          userId,
        },
      },
    });

    if (existingSubmission) {
      throw new BadRequestException('Bạn đã nộp bài quiz này rồi');
    }

    // Calculate score
    let totalScore = 0;
    let totalPoints = 0;

    const answerData = [];

    for (const answer of answers) {
      const question = quiz.questions.find((q) => q.id === answer.questionId);
      if (!question) continue;

      totalPoints += question.points;

      const isCorrect = this.checkAnswer(question, answer.userAnswer);
      const pointsEarned = isCorrect ? question.points : 0;
      totalScore += pointsEarned;

      answerData.push({
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
        isCorrect,
        pointsEarned,
        timeTaken: answer.timeTaken || 0,
      });
    }

    // Create submission
    const submission = await this.prisma.quizSubmission.create({
      data: {
        quizId: id,
        userId,
        score: totalScore,
        totalPoints,
        timeSpent: timeSpent || 0,
        submittedAt: new Date(),
        status: 'SUBMITTED',
        answers: {
          create: answerData,
        },
      },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                question: true,
                correctAnswers: true,
                explanation: true,
                points: true,
              },
            },
          },
        },
      },
    });

    // Update quiz statistics
    await this.updateQuizStats(id);

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

    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
    });

    if (!quiz) {
      throw new NotFoundException('Không tìm thấy quiz');
    }

    if (user?.role !== 'ADMIN' && quiz.createdBy !== userId) {
      throw new ForbiddenException('Không có quyền xem bài nộp');
    }

    const submissions = await this.prisma.quizSubmission.findMany({
      where: { quizId: id },
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
    gradeSubmissionDto: GradeSubmissionDto,
    userId: string,
  ) {
    const { score, feedback } = gradeSubmissionDto;

    const submission = await this.prisma.quizSubmission.findUnique({
      where: { id: submissionId },
      include: {
        quiz: true,
      },
    });

    if (!submission) {
      throw new NotFoundException('Không tìm thấy bài nộp');
    }

    // Only creator or admin can grade
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.role !== 'ADMIN' && submission.quiz.createdBy !== userId) {
      throw new ForbiddenException('Không có quyền chấm điểm');
    }

    const gradedSubmission = await this.prisma.quizSubmission.update({
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

  private checkAnswer(question: any, userAnswer: string): boolean {
    if (!question.correctAnswers || question.correctAnswers.length === 0) {
      return false;
    }

    switch (question.type) {
      case 'MULTIPLE_CHOICE':
      case 'TRUE_FALSE':
        return question.correctAnswers.includes(userAnswer);
      case 'FILL_BLANK':
        return question.correctAnswers.some(
          (correct: string) =>
            correct.toLowerCase().trim() === userAnswer.toLowerCase().trim(),
        );
      case 'ESSAY':
        // Essay questions need manual grading
        return false;
      default:
        return false;
    }
  }

  private async updateQuizStats(quizId: number) {
    const stats = await this.prisma.quizSubmission.aggregate({
      where: { quizId },
      _avg: { score: true },
      _count: { id: true },
    });

    await this.prisma.quiz.update({
      where: { id: quizId },
      data: {
        totalSubmissions: stats._count.id,
        averageScore: stats._avg.score || 0,
      },
    });
  }
}
