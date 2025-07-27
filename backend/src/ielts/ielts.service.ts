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
  UpdateIeltsSectionDto,
  UpdateIeltsQuestionDto,
} from './dto/ielts.dto';
import { IeltsSkill, Role } from '@prisma/client';

@Injectable()
export class IeltsService {
  constructor(private prisma: PrismaService) {}

  // IELTS Test Management
  async create(createIeltsTestDto: CreateIeltsTestDto, createdBy: number) {
    const { sections, ...testData } = createIeltsTestDto;

    const sectionsCreateData = sections?.map((section) => {
      const { questions, ...sectionData } = section;
      return {
        ...sectionData,
        questions: questions ? { create: questions } : undefined,
      };
    });

    return this.prisma.ieltsTest.create({
      data: {
        ...testData,
        description: testData.description ?? '',
        instructions: testData.instructions ?? '',
        creator: {
          connect: { id: createdBy },
        },
        sections: sectionsCreateData
          ? {
              create: sectionsCreateData as any, // Type assertion to bypass type error
            }
          : undefined,
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
    const { page = 1, limit = 10, skill, level, search, createdBy } = filterDto;
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

    if (createdBy) {
      where.createdBy = createdBy;
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
                subQuestions: true,
                options: true,
                order: true,
                points: true,
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
      throw new NotFoundException('IELTS test not found');
    }

    return ieltsTest;
  }

  async findOneWithAnswers(id: number, userId: number) {
    // Check if user is teacher or creator
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.role !== Role.TEACHER) {
      throw new ForbiddenException('Forbidden');
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
      throw new NotFoundException('IELTS test not found');
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
      throw new NotFoundException('IELTS test not found');
    }

    if (ieltsTest.createdBy !== userId) {
      throw new ForbiddenException('Forbidden');
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
      throw new NotFoundException('IELTS test not found');
    }

    if (ieltsTest.createdBy !== userId) {
      throw new ForbiddenException('Forbidden');
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
      throw new NotFoundException('IELTS test not found');
    }

    if (ieltsTest.createdBy !== userId) {
      throw new ForbiddenException('Forbidden');
    }

    return this.prisma.ieltsSection.create({
      data: {
        title: createSectionDto.title,
        instructions: createSectionDto.instructions ?? '',
        passageText: createSectionDto.passageText ?? '',
        timeLimit: createSectionDto.timeLimit ?? 30,
        order: createSectionDto.order,
        audioUrl: createSectionDto.audioUrl ?? '',
        imageUrl: createSectionDto.imageUrl ?? '',
        test: {
          connect: { id: testId },
        },
      },
    });
  }

  async updateSection(
    sectionId: number,
    updateSectionDto: UpdateIeltsSectionDto,
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
      throw new ForbiddenException('Forbidden');
    }

    return this.prisma.ieltsSection.update({
      where: { id: sectionId },
      data: {
        title: updateSectionDto.title,
        instructions: updateSectionDto.instructions,
        passageText: updateSectionDto.passageText,
        timeLimit: updateSectionDto.timeLimit,
        order: updateSectionDto.order,
        audioUrl: updateSectionDto.audioUrl,
        imageUrl: updateSectionDto.imageUrl,
      },
    });
  }

  async removeSection(sectionId: number, userId: number) {
    const section = await this.prisma.ieltsSection.findUnique({
      where: { id: sectionId },
      include: { test: true },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    if (section.test.createdBy !== userId) {
      throw new ForbiddenException('Forbidden');
    }

    return this.prisma.ieltsSection.delete({
      where: { id: sectionId },
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
      throw new NotFoundException('Section not found');
    }

    if (section.test.createdBy !== userId) {
      throw new ForbiddenException('Forbidden');
    }

    return this.prisma.ieltsQuestion.create({
      data: {
        ...createQuestionDto,
        sectionId,
      },
    });
  }

  async updateQuestion(
    questionId: number,
    updateQuestionDto: UpdateIeltsQuestionDto,
    userId: number,
  ) {
    const question = await this.prisma.ieltsQuestion.findUnique({
      where: { id: questionId },
      include: { section: { include: { test: true } } },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (question.section.test.createdBy !== userId) {
      throw new ForbiddenException('Forbidden');
    }

    return this.prisma.ieltsQuestion.update({
      where: { id: questionId },
      data: updateQuestionDto,
    });
  }

  async removeQuestion(questionId: number, userId: number) {
    const question = await this.prisma.ieltsQuestion.findUnique({
      where: { id: questionId },
      include: { section: { include: { test: true } } },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (question.section.test.createdBy !== userId) {
      throw new ForbiddenException('Forbidden');
    }

    return this.prisma.ieltsQuestion.delete({
      where: { id: questionId },
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
      throw new NotFoundException('IELTS test not found');
    }

    let totalQuestions = 0;
    let correctAnswersCount = 0;

    const allQuestions = ieltsTest.sections.flatMap((s) => s.questions);

    totalQuestions = allQuestions.reduce((total, question) => {
      if (question.subQuestions && question.subQuestions.length > 0) {
        return total + question.subQuestions.length;
      }
      return total + 1;
    }, 0);

    const isCorrect = (
      userAnswer: string,
      correctAnswers: string[],
    ): boolean => {
      if (!correctAnswers || correctAnswers.length === 0) {
        return userAnswer === '';
      }
      if (correctAnswers.length === 1) {
        return userAnswer.trim() === correctAnswers[0].trim();
      }
      const userAnswersSet = new Set(
        userAnswer.split(',').map((s) => s.trim()),
      );
      const correctAnswersSet = new Set(correctAnswers.map((s) => s.trim()));
      if (userAnswersSet.size !== correctAnswersSet.size) {
        return false;
      }
      for (const ans of userAnswersSet) {
        if (!correctAnswersSet.has(ans)) {
          return false;
        }
      }
      return true;
    };

    for (const answer of submitIeltsDto.answers) {
      const question = allQuestions.find((q) => q.id === answer.questionId);
      if (question) {
        if (question.subQuestions && question.subQuestions.length > 0) {
          let userAnswers: string[] = [];

          try {
            const parsedAnswer = JSON.parse(answer.answer);
            if (typeof parsedAnswer === 'object' && parsedAnswer !== null) {
              userAnswers = Object.keys(parsedAnswer)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map((key) => (parsedAnswer[key] || '').toString().trim());
            } else {
              userAnswers = answer.answer.split(',').map((s) => s.trim());
            }
          } catch {
            userAnswers = answer.answer.split(',').map((s) => s.trim());
          }

          const correctAnswers = question.correctAnswers || [];

          for (let i = 0; i < question.subQuestions.length; i++) {
            const userSubAnswer = userAnswers[i] || '';
            const correctSubAnswer = correctAnswers[i] || '';

            if (
              userSubAnswer.toLowerCase() === correctSubAnswer.toLowerCase()
            ) {
              correctAnswersCount++;
            }
          }
        } else {
          if (isCorrect(answer.answer, question.correctAnswers)) {
            correctAnswersCount++;
          }
        }
      }
    }

    const percentage =
      totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;
    const bandScore = this.convertToIeltsBand(percentage);

    const submission = await this.prisma.ieltsSubmission.create({
      data: {
        testId,
        userId,
        skill: ieltsTest.skill,
        score: bandScore,
        detailedScores: {
          correctAnswers: correctAnswersCount,
          totalQuestions,
          percentage: Math.round(percentage * 100) / 100,
        },
        feedback: this.generateFeedback(bandScore, ieltsTest.skill),
        submittedAt: new Date(),
      },
    });

    for (const answer of submitIeltsDto.answers) {
      const question = allQuestions.find((q) => q.id === answer.questionId);
      if (question) {
        let isAnswerCorrect = false;

        if (question.subQuestions && question.subQuestions.length > 0) {
          let userAnswers: string[] = [];

          try {
            const parsedAnswer = JSON.parse(answer.answer);
            if (typeof parsedAnswer === 'object' && parsedAnswer !== null) {
              userAnswers = Object.keys(parsedAnswer)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map((key) => (parsedAnswer[key] || '').toString().trim());
            } else {
              userAnswers = answer.answer.split(',').map((s) => s.trim());
            }
          } catch {
            userAnswers = answer.answer.split(',').map((s) => s.trim());
          }

          const correctAnswers = question.correctAnswers || [];

          let correctSubAnswers = 0;
          for (let i = 0; i < question.subQuestions.length; i++) {
            const userSubAnswer = userAnswers[i] || '';
            const correctSubAnswer = correctAnswers[i] || '';

            if (
              userSubAnswer.toLowerCase() === correctSubAnswer.toLowerCase()
            ) {
              correctSubAnswers++;
            }
          }

          isAnswerCorrect = correctSubAnswers === question.subQuestions.length;
        } else {
          isAnswerCorrect = isCorrect(answer.answer, question.correctAnswers);
        }

        await this.prisma.ieltsAnswer.create({
          data: {
            submissionId: submission.id,
            questionId: answer.questionId,
            userAnswer: answer.answer,
            isCorrect: isAnswerCorrect,
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

  private generateFeedback(bandScore: number, skill: IeltsSkill): string {
    const skillName =
      skill === IeltsSkill.READING
        ? 'Reading'
        : skill === IeltsSkill.LISTENING
          ? 'Listening'
          : skill === IeltsSkill.WRITING
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
      throw new NotFoundException('IELTS test not found');
    }

    if (ieltsTest.createdBy !== userId) {
      throw new ForbiddenException('Forbidden');
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
        test: {
          select: {
            id: true,
            title: true,
            skill: true,
            level: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async getSubmissionDetails(submissionId: number, userId: number) {
    const submission = await this.prisma.ieltsSubmission.findUnique({
      where: { id: submissionId },
      include: {
        user: {
          select: { id: true, name: true, role: true },
        },
        test: {
          include: {
            creator: {
              select: { id: true },
            },
            sections: {
              orderBy: { order: 'asc' },
              include: {
                questions: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const isOwner = submission.userId === userId;
    const isCreator = submission.test.createdBy === userId;

    if (!isOwner && !(isCreator && currentUser?.role === Role.TEACHER)) {
      throw new ForbiddenException('Forbidden');
    }

    const testWithUserAnswers = {
      ...submission,
      test: {
        ...submission.test,
        sections: submission.test.sections.map((section) => ({
          ...section,
          questions: section.questions.map((question) => {
            const userAnswer = submission.answers.find(
              (ans) => ans.questionId === question.id,
            );
            return {
              ...question,
              userAnswer: userAnswer?.userAnswer,
              isCorrect: userAnswer?.isCorrect,
            };
          }),
        })),
      },
    };

    // Clean up redundant data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (testWithUserAnswers as any).answers;

    return testWithUserAnswers;
  }
}
