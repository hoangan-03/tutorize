import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IeltsLevel } from '@prisma/client';
import {
  CreateWritingTestDto,
  ManualGradeTestDto,
} from './dto/ielts-writing.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class IeltsWritingService {
  constructor(private prisma: PrismaService) {}

  async createWritingTest(dto: CreateWritingTestDto, userId: number) {
    try {
      console.log('Creating test with data:', { dto, userId });

      // Use casting to avoid type issue before Prisma client is regenerated
      const prismaAny = this.prisma as any;
      const result = await prismaAny.ieltsWritingTest.create({
        data: {
          title: dto.title,
          prompt: dto.prompt,
          type: dto.type,
          level: dto.level || IeltsLevel.BEGINNER,
          createdBy: userId,
        },
      });

      console.log('Test created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating writing test:', error);
      throw new BadRequestException(
        `Failed to create writing test: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getTests(query: PaginationDto & { level?: string; type?: string }) {
    const { page = 1, limit = 10, level, type } = query as any;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (level) where.level = level;
    if (type) where.type = type;
    const prismaAny = this.prisma as any;
    const [items, total] = await Promise.all([
      prismaAny.ieltsWritingTest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prismaAny.ieltsWritingTest.count({ where }),
    ]);
    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  }

  async removeWritingTest(id: number, userId: number) {
    const prismaAny = this.prisma as any;
    return prismaAny.ieltsWritingTest.delete({
      where: { id, createdBy: userId },
    });
  }

  async submitTest(testId: number, userId: number, dto: { content: string }) {
    // Upsert to allow edit/resubmit
    const prismaAny = this.prisma as any;
    return prismaAny.ieltsWritingSubmission.upsert({
      where: { testId_userId: { testId: testId, userId } },
      create: { testId: Number(testId), userId, content: dto.content },
      update: { content: dto.content, submittedAt: new Date() },
    });
  }

  async manualGradeTest(
    testId: number,
    userId: number,
    manualGradeDto: ManualGradeTestDto,
  ) {
    const prismaAny = this.prisma as any;
    const submission = await prismaAny.ieltsWritingSubmission.findUnique({
      where: { testId_userId: { testId: testId, userId } },
      include: { test: true },
    });
    if (!submission) throw new NotFoundException('Chưa có bài nộp');

    return prismaAny.ieltsWritingSubmission.update({
      where: { id: submission.id },
      data: {
        aiScore: null,
        aiFeedback: null,
        humanScore: manualGradeDto.score,
        humanFeedback: manualGradeDto.feedback,
        gradedAt: new Date(),
      },
    });
  }
}
