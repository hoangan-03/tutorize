import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateIeltsWritingTestDto,
  UpdateIeltsWritingTestDto,
  SubmitIeltsWritingTestDto,
  ManualGradeIeltsWritingTestDto,
  IeltsWritingTestQueryDto,
} from './dto/ielts-writing.dto';

@Injectable()
export class IeltsWritingService {
  constructor(private prisma: PrismaService) {}

  // Create IELTS Writing Test
  async createTest(userId: number, createDto: CreateIeltsWritingTestDto) {
    try {
      const test = await this.prisma.ieltsWritingTest.create({
        data: {
          title: createDto.title,
          prompt: createDto.prompt,
          type: createDto.type,
          level: createDto.level || 'INTERMEDIATE',
          createdBy: userId,
          isActive: true,
        },
        include: {
          creator: {
            select: {
              id: true,
              profile: {
                select: {
                  firstName: true,
                },
              },
            },
          },
        },
      });

      return test;
    } catch (error) {
      console.error('Error creating IELTS Writing test:', error);
      throw error;
    }
  }

  // Get all IELTS Writing Tests with pagination
  async getTests(queryDto: IeltsWritingTestQueryDto) {
    const { page = 1, limit = 20, level, type } = queryDto;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(level && { level }),
      ...(type && { type }),
    };

    const [tests, total] = await Promise.all([
      this.prisma.ieltsWritingTest.findMany({
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
      }),
      this.prisma.ieltsWritingTest.count({ where }),
    ]);

    return {
      data: tests,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get single IELTS Writing Test by ID
  async getTestById(testId: number) {
    const test = await this.prisma.ieltsWritingTest.findUnique({
      where: { id: testId, isActive: true },
      include: {
        creator: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
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
    });

    if (!test) {
      throw new NotFoundException('IELTS Writing test not found');
    }

    return test;
  }

  // Update IELTS Writing Test
  async updateTest(
    testId: number,
    userId: number,
    updateDto: UpdateIeltsWritingTestDto,
  ) {
    // Check if test exists and user owns it
    const existingTest = await this.prisma.ieltsWritingTest.findFirst({
      where: {
        id: testId,
        createdBy: userId,
        isActive: true,
      },
    });

    if (!existingTest) {
      throw new NotFoundException(
        'IELTS Writing test not found or access denied',
      );
    }

    return await this.prisma.ieltsWritingTest.update({
      where: { id: testId },
      data: updateDto,
      include: {
        creator: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
              },
            },
          },
        },
      },
    });
  }

  // Delete IELTS Writing Test
  async deleteTest(testId: number, userId: number) {
    // Check if test exists and user owns it
    const existingTest = await this.prisma.ieltsWritingTest.findFirst({
      where: {
        id: testId,
        createdBy: userId,
        isActive: true,
      },
    });

    if (!existingTest) {
      throw new NotFoundException(
        'IELTS Writing test not found or access denied',
      );
    }

    return await this.prisma.ieltsWritingTest.update({
      where: { id: testId },
      data: { isActive: false },
    });
  }

  async submitTest(
    testId: number,
    userId: number,
    submitDto: SubmitIeltsWritingTestDto,
  ) {
    const test = await this.getTestById(testId);

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    // Upsert submission (create or update existing)
    const submission = await this.prisma.ieltsWritingSubmission.upsert({
      where: {
        testId_userId: {
          testId,
          userId,
        },
      },
      update: {
        content: submitDto.content,
        submittedAt: new Date(),
        // Reset scores when resubmitting
        aiScore: null,
        humanScore: null,
        aiFeedback: null,
        gradedAt: null,
      },
      create: {
        testId,
        userId,
        content: submitDto.content,
        submittedAt: new Date(),
      },
      include: {
        test: {
          select: {
            id: true,
            title: true,
            type: true,
            level: true,
          },
        },
        user: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
              },
            },
          },
        },
      },
    });

    return submission;
  }

  async manualGradeTest(
    testId: number,
    userId: number,
    gradeDto: ManualGradeIeltsWritingTestDto,
  ) {
    // Find submission
    const submission = await this.prisma.ieltsWritingSubmission.findFirst({
      where: { testId, userId },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    return await this.prisma.ieltsWritingSubmission.update({
      where: { id: submission.id },
      data: {
        humanScore: gradeDto.score,
        humanFeedback: gradeDto.feedback,
        gradedAt: new Date(),
      },
      include: {
        test: {
          select: {
            id: true,
            title: true,
            type: true,
            level: true,
          },
        },
        user: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
              },
            },
          },
        },
      },
    });
  }

  // for teachers
  async getTestSubmissions(testId: number) {
    const submissions = await this.prisma.ieltsWritingSubmission.findMany({
      where: { testId },
      include: {
        test: {
          select: {
            id: true,
            title: true,
            type: true,
            level: true,
          },
        },
        user: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
              },
            },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return submissions;
  }

  async getTestSubmission(testId: number, submissionId: number) {
    const submission = await this.prisma.ieltsWritingSubmission.findUnique({
      where: { id: submissionId, testId: testId },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    return submission;
  }

  async getMySubmissions(userId: number) {
    const submissions = await this.prisma.ieltsWritingSubmission.findMany({
      where: { userId },
      include: {
        test: {
          select: {
            id: true,
            title: true,
            type: true,
            level: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return submissions;
  }

  async getMySubmission(userId: number, submissionId: number) {
    const submission = await this.prisma.ieltsWritingSubmission.findUnique({
      where: { id: submissionId, userId },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    return submission;
  }
}
