import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateIeltsTestDto,
  UpdateIeltsTestDto,
  CreateIeltsSectionDto,
  CreateIeltsQuestionDto,
  SubmitIeltsDto,
  IeltsFilterDto,
} from './dto/ielts.dto';

@Injectable()
export class IeltsService {
  constructor(private prisma: PrismaService) {}

  // IELTS Test Management
  async create(createIeltsTestDto: CreateIeltsTestDto, createdBy: number) {
    return this.prisma.ieltsTest.create({
      data: {
        title: createIeltsTestDto.title,
        description: createIeltsTestDto.description ?? '',
        skill: createIeltsTestDto.skill,
        level: createIeltsTestDto.level,
        timeLimit: createIeltsTestDto.timeLimit,
        instructions: createIeltsTestDto.instructions ?? '',
        creator: {
          connect: { id: createdBy },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sections: {
          include: {
            questions: true,
          },
        },
      },
    });
  }

  async findAll(filterDto: IeltsFilterDto) {
    const { page = 1, limit = 10, skill, level, search } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (skill) {
      where.skill = skill;
    }

    if (level) {
      where.level = level;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.ieltsTest.findMany({
        where,
        skip,
        take: limit,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          sections: {
            include: {
              _count: {
                select: {
                  questions: true,
                },
              },
            },
          },
          _count: {
            select: {
              submissions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ieltsTest.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const ieltsTest = await this.prisma.ieltsTest.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sections: {
          include: {
            questions: {
              select: {
                id: true,
                question: true,
                type: true,
                options: true,
                order: true,
                // Don't include correct answers for students
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!ieltsTest) {
      throw new NotFoundException('Không tìm thấy bài test IELTS');
    }

    return ieltsTest;
  }

  async findOneWithAnswers(id: number, userId: number) {
    // Check if user is teacher or creator
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.role !== 'TEACHER') {
      throw new ForbiddenException('Không có quyền xem đáp án');
    }

    const ieltsTest = await this.prisma.ieltsTest.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sections: {
          include: {
            questions: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!ieltsTest) {
      throw new NotFoundException('Không tìm thấy bài test IELTS');
    }

    return ieltsTest;
  }

  async update(
    id: number,
    updateIeltsTestDto: UpdateIeltsTestDto,
    userId: number,
  ) {
    const ieltsTest = await this.prisma.ieltsTest.findUnique({
      where: { id },
    });

    if (!ieltsTest) {
      throw new NotFoundException('Không tìm thấy bài test IELTS');
    }

    if (ieltsTest.createdBy !== userId) {
      throw new ForbiddenException('Không có quyền cập nhật bài test này');
    }

    return this.prisma.ieltsTest.update({
      where: { id },
      data: updateIeltsTestDto,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sections: {
          include: {
            questions: true,
          },
        },
      },
    });
  }

  async remove(id: number, userId: number) {
    const ieltsTest = await this.prisma.ieltsTest.findUnique({
      where: { id },
    });

    if (!ieltsTest) {
      throw new NotFoundException('Không tìm thấy bài test IELTS');
    }

    if (ieltsTest.createdBy !== userId) {
      throw new ForbiddenException('Không có quyền xóa bài test này');
    }

    return this.prisma.ieltsTest.delete({
      where: { id },
    });
  }

  // Section Management
  async createSection(
    testId: number,
    createSectionDto: CreateIeltsSectionDto,
    userId: number,
  ) {
    const ieltsTest = await this.prisma.ieltsTest.findUnique({
      where: { id: testId },
    });

    if (!ieltsTest) {
      throw new NotFoundException('Không tìm thấy bài test IELTS');
    }

    if (ieltsTest.createdBy !== userId) {
      throw new ForbiddenException('Không có quyền thêm phần cho bài test này');
    }

    return this.prisma.ieltsSection.create({
      data: {
        title: createSectionDto.title,
        instructions: createSectionDto.description ?? '',
        timeLimit: 30, // Default 30 minutes per section
        order: createSectionDto.order,
        passageText: createSectionDto.content ?? '',
        audioUrl: createSectionDto.audioUrl ?? '',
        test: {
          connect: { id: testId },
        },
      },
    });
  }

  // Question Management
  async createQuestion(
    sectionId: number,
    createQuestionDto: CreateIeltsQuestionDto,
    userId: number,
  ) {
    const section = await this.prisma.ieltsSection.findUnique({
      where: { id: sectionId },
      include: { test: true },
    });

    if (!section) {
      throw new NotFoundException('Không tìm thấy phần');
    }

    if (section.test.createdBy !== userId) {
      throw new ForbiddenException(
        'Không có quyền thêm câu hỏi cho bài test này',
      );
    }

    return this.prisma.ieltsQuestion.create({
      data: {
        ...createQuestionDto,
        sectionId,
      },
    });
  }

  // Submission
  async submit(testId: number, submitIeltsDto: SubmitIeltsDto, userId: number) {
    const ieltsTest = await this.prisma.ieltsTest.findUnique({
      where: { id: testId },
      include: {
        sections: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!ieltsTest) {
      throw new NotFoundException('Không tìm thấy bài test IELTS');
    }

    // Calculate score based on IELTS 9.0 band system
    let totalQuestions = 0;
    let correctAnswers = 0;

    // Get all questions from all sections
    const allQuestions = ieltsTest.sections.flatMap((s) => s.questions);
    totalQuestions = allQuestions.length;

    // Calculate correct answers
    for (const answer of submitIeltsDto.answers) {
      const question = allQuestions.find((q) => q.id === answer.questionId);
      if (question && question.correctAnswer === answer.answer) {
        correctAnswers++;
      }
    }

    // Calculate percentage and convert to IELTS band score
    const percentage =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const bandScore = this.convertToIeltsBand(percentage);

    // Create submission
    const submission = await this.prisma.ieltsSubmission.create({
      data: {
        testId,
        userId,
        skill: ieltsTest.skill,
        score: bandScore,
        detailedScores: {
          correctAnswers,
          totalQuestions,
          percentage: Math.round(percentage * 100) / 100,
        },
        feedback: this.generateFeedback(bandScore, ieltsTest.skill),
        submittedAt: new Date(),
      },
    });

    // Create answers
    for (const answer of submitIeltsDto.answers) {
      const question = allQuestions.find((q) => q.id === answer.questionId);
      if (question) {
        const isCorrect = question.correctAnswer === answer.answer;

        await this.prisma.ieltsAnswer.create({
          data: {
            submissionId: submission.id,
            questionId: answer.questionId,
            userAnswer: answer.answer,
            isCorrect,
          },
        });
      }
    }

    return this.prisma.ieltsSubmission.findUnique({
      where: { id: submission.id },
      include: {
        test: true,
        answers: {
          include: {
            question: true,
          },
        },
      },
    });
  }

  private convertToIeltsBand(percentage: number): number {
    if (percentage >= 89) return 9.0;
    if (percentage >= 82) return 8.5;
    if (percentage >= 75) return 8.0;
    if (percentage >= 68) return 7.5;
    if (percentage >= 61) return 7.0;
    if (percentage >= 54) return 6.5;
    if (percentage >= 47) return 6.0;
    if (percentage >= 40) return 5.5;
    if (percentage >= 33) return 5.0;
    if (percentage >= 26) return 4.5;
    if (percentage >= 19) return 4.0;
    if (percentage >= 12) return 3.5;
    if (percentage >= 5) return 3.0;
    if (percentage >= 1) return 2.5;
    return 2.0;
  }

  /**
   * Generate feedback based on band score and skill
   */

  private generateFeedback(bandScore: number, skill: string): string {
    const skillName =
      skill === 'READING'
        ? 'Reading'
        : skill === 'LISTENING'
          ? 'Listening'
          : skill === 'WRITING'
            ? 'Writing'
            : 'Speaking';

    if (bandScore >= 8.5) {
      return `Excellent performance in ${skillName}! You demonstrate exceptional command of the English language.`;
    } else if (bandScore >= 7.0) {
      return `Good performance in ${skillName}! You show good operational command with occasional inaccuracies.`;
    } else if (bandScore >= 6.0) {
      return `Competent performance in ${skillName}! You show generally effective command despite some inaccuracies.`;
    } else if (bandScore >= 5.0) {
      return `Modest performance in ${skillName}! You show partial command and are likely to make many mistakes.`;
    } else if (bandScore >= 4.0) {
      return `Limited performance in ${skillName}. Your competence is limited to familiar situations.`;
    } else {
      return `Basic performance in ${skillName}. You need significant improvement to reach functional proficiency.`;
    }
  }

  async getSubmissions(testId: number, userId: number) {
    const ieltsTest = await this.prisma.ieltsTest.findUnique({
      where: { id: testId },
    });

    if (!ieltsTest) {
      throw new NotFoundException('Không tìm thấy bài test IELTS');
    }

    if (ieltsTest.createdBy !== userId) {
      throw new ForbiddenException('Không có quyền xem bài nộp');
    }

    return this.prisma.ieltsSubmission.findMany({
      where: { testId },
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
  }

  async getMySubmissions(userId: number) {
    return this.prisma.ieltsSubmission.findMany({
      where: { userId },
      include: {
        test: true,
      },
      orderBy: { submittedAt: 'desc' },
    });
  }
}
