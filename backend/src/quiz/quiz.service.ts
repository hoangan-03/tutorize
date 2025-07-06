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
  UpdateQuizStatusDto,
} from './dto/quiz.dto';
import { PaginatedResultDto } from '../common/dto/pagination.dto';
import { Role } from '@prisma/client';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async create(createQuizDto: CreateQuizDto, createdBy: number) {
    const { questions, ...quizData } = createQuizDto;
    const quiz = await this.prisma.quiz.create({
      data: {
        ...quizData,
        createdBy: createdBy,
        totalQuestions: questions.length,
        questions: {
          create: questions.map((question) => {
            // For multiple choice questions, convert correctAnswer to index if it's a text option
            let processedCorrectAnswer = question.correctAnswer;

            if (
              question.type === 'MULTIPLE_CHOICE' &&
              question.options &&
              question.options.length > 0
            ) {
              // If correctAnswer is a text that matches one of the options, convert to index
              const optionIndex = question.options.findIndex(
                (option) => option === question.correctAnswer,
              );
              if (optionIndex !== -1) {
                processedCorrectAnswer = optionIndex.toString();
              }
            }

            return {
              ...question,
              options: question.options || [],
              correctAnswer: processedCorrectAnswer
                ? processedCorrectAnswer.toString()
                : '',
            };
          }),
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

    // Auto check and update overdue quizzes
    await this.checkAndUpdateOverdueQuizzes();

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
          questions: true,
          submissions: true,
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

  async findOne(id: number, userId?: number) {
    // Auto check and update overdue quizzes
    await this.checkAndUpdateOverdueQuizzes();

    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
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

    // Hide correct answers for students
    if (userId && quiz.questions) {
      const questionsWithoutAnswers = quiz.questions.map((question) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { correctAnswer, explanation, ...questionWithoutAnswers } =
          question;
        return questionWithoutAnswers;
      });
      return {
        ...quiz,
        questions: questionsWithoutAnswers,
      };
    }

    return quiz;
  }

  async findOneWithAnswers(id: number, userId: number) {
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
    const canSeeAnswers =
      user?.role === Role.TEACHER || quiz.createdBy === userId;

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
            correctAnswer: canSeeAnswers,
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

  async update(id: number, updateQuizDto: UpdateQuizDto, userId: number) {
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

    if (user?.role !== 'TEACHER' && quiz.createdBy !== userId) {
      throw new ForbiddenException('Không có quyền cập nhật quiz này');
    }

    const { questions, ...quizData } = updateQuizDto;

    // Prepare update data
    const updateData: any = {
      ...quizData,
    };

    // Only handle questions if they are explicitly provided and different from current
    if (questions !== undefined) {
      // Get current questions to compare
      const currentQuestions = await this.prisma.question.findMany({
        where: { quizId: id },
        orderBy: { order: 'asc' },
      });

      // Check if questions have actually changed
      const questionsChanged =
        questions.length !== currentQuestions.length ||
        questions.some((newQ, index) => {
          const currentQ = currentQuestions[index];
          if (!currentQ) return true;

          return (
            newQ.question !== currentQ.question ||
            newQ.type !== currentQ.type ||
            newQ.correctAnswer !== currentQ.correctAnswer ||
            newQ.points !== currentQ.points ||
            JSON.stringify(newQ.options) !== JSON.stringify(currentQ.options)
          );
        });

      if (questionsChanged) {
        // Delete existing questions
        await this.prisma.question.deleteMany({
          where: { quizId: id },
        });

        // Create new questions
        updateData.questions = {
          create: questions.map((question) => {
            // For multiple choice questions, convert correctAnswer to index if it's a text option
            let processedCorrectAnswer = question.correctAnswer;

            if (
              question.type === 'MULTIPLE_CHOICE' &&
              question.options &&
              question.options.length > 0
            ) {
              // If correctAnswer is a text that matches one of the options, convert to index
              const optionIndex = question.options.findIndex(
                (option) => option === question.correctAnswer,
              );
              if (optionIndex !== -1) {
                processedCorrectAnswer = optionIndex.toString();
              }
            }

            return {
              ...question,
              options: question.options || [],
              correctAnswer: processedCorrectAnswer
                ? processedCorrectAnswer.toString()
                : '',
            };
          }),
        };

        updateData.totalQuestions = questions.length;
      }
    }

    await this.prisma.quiz.update({
      where: { id },
      data: updateData,
    });

    // Auto check and update overdue status after updating quiz
    await this.checkAndUpdateOverdueQuizzes();

    // Get the latest quiz data after potential status update
    const finalQuiz = await this.prisma.quiz.findUnique({
      where: { id },
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

    return finalQuiz;
  }

  async remove(id: number, userId: number) {
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

    if (user?.role !== 'TEACHER' && quiz.createdBy !== userId) {
      throw new ForbiddenException('Không có quyền xóa quiz này');
    }

    await this.prisma.quiz.delete({
      where: { id },
    });

    return { message: 'Xóa quiz thành công' };
  }

  async updateStatus(
    id: number,
    updateStatusDto: UpdateQuizStatusDto,
    userId: number,
  ) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
    });

    if (!quiz) {
      throw new NotFoundException('Không tìm thấy quiz');
    }

    // Only creator or admin can update status
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.role !== 'TEACHER' && quiz.createdBy !== userId) {
      throw new ForbiddenException(
        'Không có quyền cập nhật trạng thái quiz này',
      );
    }

    // Check if quiz is overdue and trying to change status
    if (
      (quiz.status as string) === 'OVERDUE' &&
      (updateStatusDto.status as string) !== 'OVERDUE'
    ) {
      // Check if deadline has been updated to a future date
      const now = new Date();
      const deadline = new Date(quiz.deadline);

      if (deadline <= now) {
        throw new BadRequestException(
          'Không thể thay đổi trạng thái quiz đã quá hạn. Vui lòng cập nhật deadline trước.',
        );
      }
    }

    const updatedQuiz = await this.prisma.quiz.update({
      where: { id },
      data: {
        status: updateStatusDto.status,
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

    return updatedQuiz;
  }

  async checkAndUpdateOverdueQuizzes() {
    const now = new Date();

    // Find all active quizzes that have passed their deadline
    const overdueQuizzes = await this.prisma.quiz.findMany({
      where: {
        status: 'ACTIVE',
        deadline: {
          lt: now,
        },
      },
    });

    // Update status to OVERDUE for all overdue quizzes
    if (overdueQuizzes.length > 0) {
      await this.prisma.quiz.updateMany({
        where: {
          id: {
            in: overdueQuizzes.map((q) => q.id),
          },
        },
        data: {
          status: 'OVERDUE' as any,
        },
      });
    }

    // Find all overdue quizzes that now have future deadlines
    const reactivatedQuizzes = await this.prisma.quiz.findMany({
      where: {
        status: 'OVERDUE',
        deadline: {
          gt: now,
        },
      },
    });

    // Update status back to ACTIVE for quizzes with future deadlines
    if (reactivatedQuizzes.length > 0) {
      await this.prisma.quiz.updateMany({
        where: {
          id: {
            in: reactivatedQuizzes.map((q) => q.id),
          },
        },
        data: {
          status: 'ACTIVE' as any,
        },
      });
    }

    return {
      updatedCount: overdueQuizzes.length + reactivatedQuizzes.length,
    };
  }

  async submit(id: number, submitQuizDto: SubmitQuizDto, userId: number) {
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

    // Check user's previous attempts
    const userSubmissions = await this.prisma.quizSubmission.findMany({
      where: {
        quizId: id,
        userId,
      },
      orderBy: { attemptNumber: 'desc' },
    });

    const attemptCount = userSubmissions.length;

    // Check if user has exceeded max attempts
    if (quiz.maxAttempts > 0 && attemptCount >= quiz.maxAttempts) {
      throw new BadRequestException(
        `Bạn đã hết lượt làm bài. Số lần làm bài tối đa là ${quiz.maxAttempts}.`,
      );
    }

    const nextAttemptNumber = attemptCount + 1;

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
        attemptNumber: nextAttemptNumber,
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
                correctAnswer: true,
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
    userId: number,
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

    if (user?.role !== 'TEACHER' && quiz.createdBy !== userId) {
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
    submissionId: number,
    gradeSubmissionDto: GradeSubmissionDto,
    userId: number,
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

    if (user?.role !== 'TEACHER' && submission.quiz.createdBy !== userId) {
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
    if (!question.correctAnswer || question.correctAnswer.length === 0) {
      return false;
    }

    switch (question.type) {
      case 'MULTIPLE_CHOICE':
      case 'TRUE_FALSE':
        // For multiple choice, correctAnswer stores the index of correct option
        // Convert both to string for comparison to handle type mismatches
        const correctAnswerStr = question.correctAnswer.toString();
        const userAnswerStr = userAnswer.toString();
        return correctAnswerStr === userAnswerStr;
      case 'FILL_BLANK':
        // For fill in the blank, do case-insensitive comparison
        return (
          question.correctAnswer.toLowerCase().trim() ===
          userAnswer.toLowerCase().trim()
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

  async getMySubmissions(userId: number, query: any) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [submissions, total] = await Promise.all([
      this.prisma.quizSubmission.findMany({
        where: { userId },
        include: {
          quiz: {
            select: {
              id: true,
              title: true,
              subject: true,
              grade: true,
              status: true,
              deadline: true,
              creator: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.quizSubmission.count({
        where: { userId },
      }),
    ]);

    return {
      data: submissions,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getQuizSubmissionHistory(quizId: number, userId: number) {
    const submissions = await this.prisma.quizSubmission.findMany({
      where: {
        quizId,
        userId,
      },
      orderBy: { submittedAt: 'asc' }, // Changed to ascending order (oldest first)
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                question: true,
                correctAnswer: true,
                points: true,
              },
            },
          },
        },
      },
    });

    console.log('Submissions found:', submissions.length);
    console.log(
      'Submissions data:',
      submissions.map((s) => ({
        id: s.id,
        score: s.score,
        totalPoints: s.totalPoints,
        calculatedScore: (s.score / s.totalPoints) * 10,
      })),
    );

    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
    });

    const maxAttempts = quiz.maxAttempts || 1;
    const currentAttempt = Math.max(0, maxAttempts - submissions.length);

    // Calculate maximum score achieved (scaled to 10)
    const maxScore =
      submissions.length > 0
        ? Math.max(
            ...submissions.map(
              (s) => ((s.score || 0) / (s.totalPoints || 1)) * 10,
            ),
          )
        : 0;

    console.log('Calculated maxScore:', maxScore);

    return {
      quiz,
      submissions,
      canRetake: currentAttempt > 0,
      remainingAttempts: currentAttempt,
      currentAttempt,
      maxScore,
    };
  }

  async getMyStats(userId: number) {
    const [completedCount, submissions, totalTimeSpent, recentSubmissions] =
      await Promise.all([
        this.prisma.quizSubmission.count({
          where: { userId },
        }),
        this.prisma.quizSubmission.findMany({
          where: { userId },
          select: {
            score: true,
            totalPoints: true,
          },
        }),
        this.prisma.quizSubmission.aggregate({
          where: { userId },
          _sum: { timeSpent: true },
        }),
        this.prisma.quizSubmission.findMany({
          where: { userId },
          include: {
            quiz: {
              select: {
                id: true,
                title: true,
                subject: true,
              },
            },
          },
          orderBy: { submittedAt: 'desc' },
          take: 5,
        }),
      ]);

    // Calculate average score scaled to 10
    const averageScore =
      completedCount > 0
        ? Math.round(
            submissions.reduce(
              (sum, sub) =>
                sum + ((sub.score || 0) / (sub.totalPoints || 1)) * 10,
              0,
            ) / completedCount,
          )
        : 0;

    // Calculate excellent count (score >= 9 on scale of 10)
    const excellentCount = submissions.filter(
      (sub) => ((sub.score || 0) / (sub.totalPoints || 1)) * 10 >= 9,
    ).length;

    return {
      completed: completedCount,
      averageScore,
      excellent: excellentCount,
      averageTime: Math.round(
        (totalTimeSpent._sum.timeSpent || 0) / Math.max(completedCount, 1),
      ),
      recentSubmissions,
    };
  }

  async getTeacherStats(userId: number) {
    const [totalQuizzes, activeQuizzes, overdueQuizzes, totalSubmissions] =
      await Promise.all([
        this.prisma.quiz.count({
          where: { createdBy: userId },
        }),
        this.prisma.quiz.count({
          where: { createdBy: userId, status: 'ACTIVE' },
        }),
        this.prisma.quiz.count({
          where: { createdBy: userId, status: 'OVERDUE' },
        }),
        this.prisma.quizSubmission.count({
          where: {
            quiz: {
              createdBy: userId,
            },
          },
        }),
      ]);

    return {
      totalQuizzes,
      activeQuizzes,
      overdueQuizzes,
      totalSubmissions,
    };
  }

  async getStudentQuizStats(userId: number) {
    // Get all quizzes (visible to student)
    const totalQuizzes = await this.prisma.quiz.count({
      where: {
        OR: [
          { status: 'ACTIVE' },
          { status: 'OVERDUE' },
          { status: 'INACTIVE' },
        ],
      },
    });

    // Get overdue quizzes
    const overdueQuizzes = await this.prisma.quiz.count({
      where: { status: 'OVERDUE' },
    });

    // Get user's submissions
    const submissions = await this.prisma.quizSubmission.findMany({
      where: { userId },
      include: {
        quiz: true,
      },
    });

    // Group submissions by quiz to get unique completed quizzes
    const submissionsByQuiz = submissions.reduce(
      (acc, submission) => {
        if (!acc[submission.quizId]) {
          acc[submission.quizId] = [];
        }
        acc[submission.quizId].push(submission);
        return acc;
      },
      {} as Record<number, any[]>,
    );

    const completedQuizzes = Object.keys(submissionsByQuiz).length;

    // Calculate average score based on highest score per quiz
    let totalMaxScore = 0;
    let perfectCount = 0;

    Object.values(submissionsByQuiz).forEach((quizSubmissions: any[]) => {
      // Get the highest score for this quiz
      const maxScore = Math.max(
        ...quizSubmissions.map(
          (s) => ((s.score || 0) / (s.totalPoints || 1)) * 10,
        ),
      );
      totalMaxScore += maxScore;

      // Check if first attempt was perfect (10/10)
      const firstAttempt = quizSubmissions.sort(
        (a, b) =>
          new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
      )[0];
      if (
        firstAttempt &&
        ((firstAttempt.score || 0) / (firstAttempt.totalPoints || 1)) * 10 ===
          10
      ) {
        perfectCount++;
      }
    });

    const averageScore =
      completedQuizzes > 0 ? totalMaxScore / completedQuizzes : 0;

    return {
      totalQuizzes,
      completedQuizzes,
      overdueQuizzes,
      averageScore: Math.round(averageScore),
      perfectCount,
    };
  }

  async getQuizDetailedStats(quizId: number, userId: number) {
    // Check if user owns this quiz
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz || quiz.createdBy !== userId) {
      throw new ForbiddenException('Không có quyền xem thống kê quiz này');
    }

    // Get submissions for this quiz
    const submissions = await this.prisma.quizSubmission.findMany({
      where: { quizId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    // Calculate statistics
    const totalSubmissions = submissions.length;
    const totalStudents = new Set(submissions.map((s) => s.userId)).size;

    const averageScore =
      totalSubmissions > 0
        ? submissions.reduce(
            (sum, s) => sum + ((s.score || 0) / (s.totalPoints || 1)) * 10,
            0,
          ) / totalSubmissions
        : 0;

    const averageTime =
      totalSubmissions > 0
        ? submissions.reduce((sum, s) => sum + (s.timeSpent || 0), 0) /
          totalSubmissions
        : 0;

    const passRate =
      totalSubmissions > 0
        ? (submissions.filter(
            (s) => ((s.score || 0) / (s.totalPoints || 1)) * 10 >= 5,
          ).length /
            totalSubmissions) *
          100
        : 0;

    // Grade distribution
    const gradeDistribution = {
      excellent: submissions.filter(
        (s) => ((s.score || 0) / (s.totalPoints || 1)) * 10 >= 9,
      ).length,
      good: submissions.filter((s) => {
        const score = ((s.score || 0) / (s.totalPoints || 1)) * 10;
        return score >= 7 && score < 9;
      }).length,
      average: submissions.filter((s) => {
        const score = ((s.score || 0) / (s.totalPoints || 1)) * 10;
        return score >= 5 && score < 7;
      }).length,
      poor: submissions.filter(
        (s) => ((s.score || 0) / (s.totalPoints || 1)) * 10 < 5,
      ).length,
    };

    // Question analysis
    const questions = await this.prisma.question.findMany({
      where: { quizId },
      orderBy: { order: 'asc' },
    });

    const questionAnalysis = questions.map((question) => {
      const questionAnswers = submissions.flatMap((s) =>
        s.answers.filter((a) => a.questionId === question.id),
      );

      const correctAnswers = questionAnswers.filter((a) => a.isCorrect).length;
      const accuracy =
        questionAnswers.length > 0
          ? (correctAnswers / questionAnswers.length) * 100
          : 0;

      return {
        id: question.id,
        question: question.question,
        type: question.type,
        points: question.points,
        totalAnswers: questionAnswers.length,
        correctAnswers,
        accuracy: Math.round(accuracy),
      };
    });

    return {
      quiz,
      totalSubmissions,
      totalStudents,
      averageScore: Math.round(averageScore * 10) / 10,
      averageTime: Math.round(averageTime),
      passRate: Math.round(passRate),
      gradeDistribution,
      questionAnalysis,
      submissions: submissions.map((s) => ({
        id: s.id,
        user: s.user,
        score:
          Math.round(((s.score || 0) / (s.totalPoints || 1)) * 10 * 10) / 10,
        timeSpent: s.timeSpent,
        submittedAt: s.submittedAt,
        status: s.status,
      })),
    };
  }
}
