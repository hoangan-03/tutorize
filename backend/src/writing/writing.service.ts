import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { IeltsLevel } from '@prisma/client';
import {
  SubmitWritingDto,
  WritingAssessmentResultDto,
  CreateWritingAssessmentDto,
  UpdateWritingAssessmentDto,
  CreateWritingTaskDto,
} from './dto/writing.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class WritingService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async assess(submitWritingDto: SubmitWritingDto, userId: number) {
    const { content, type, prompt } = submitWritingDto;

    // Validate content length
    if (content.length < 150) {
      throw new BadRequestException('Bài viết quá ngắn, cần ít nhất 150 từ');
    }

    // Call AI assessment service (mock implementation)
    const assessmentResult = await this.callAIAssessment(content, type, prompt);

    // Save assessment to database
    const writingAssessment = await this.prisma.writingAssessment.create({
      data: {
        title: `${type} Assessment - ${new Date().toLocaleDateString()}`,
        content,
        type,
        prompt: prompt || '',
        userId,
        wordCount: this.countWords(content),
        aiScore: {
          overallScore: assessmentResult.overallScore,
          taskAchievement: assessmentResult.taskAchievement,
          coherenceCohesion: assessmentResult.coherenceCohesion,
          lexicalResource: assessmentResult.lexicalResource,
          grammaticalRange: assessmentResult.grammaticalRange,
        },
        feedback: {
          general: assessmentResult.feedback,
          strengths: assessmentResult.strengths,
          improvements: assessmentResult.improvements,
          suggestions: assessmentResult.suggestions,
        },
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

    return writingAssessment;
  }

  async findAll(query: PaginationDto, userId?: number) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by visibility
    if (userId) {
      where.OR = [...(where.OR || []), { userId }, { isPublic: true }];
    } else {
      where.isPublic = true;
    }

    const [assessments, total] = await Promise.all([
      this.prisma.writingAssessment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,

              email: true,
            },
          },
        },
      }),
      this.prisma.writingAssessment.count({ where }),
    ]);

    return {
      data: assessments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, userId?: number) {
    const assessment = await this.prisma.writingAssessment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,

            email: true,
          },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    // Check access permission
    if (!assessment.isPublic && assessment.userId !== userId) {
      throw new ForbiddenException('Không có quyền truy cập bài viết này');
    }

    return assessment;
  }

  async update(
    id: number,
    updateDto: UpdateWritingAssessmentDto,
    userId: number,
  ) {
    const assessment = await this.prisma.writingAssessment.findUnique({
      where: { id },
    });

    if (!assessment) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    if (assessment.userId !== userId) {
      throw new ForbiddenException('Không có quyền cập nhật bài viết này');
    }

    return this.prisma.writingAssessment.update({
      where: { id },
      data: {
        ...updateDto,
        ...(updateDto.content && {
          wordCount: this.countWords(updateDto.content),
        }),
      },
    });
  }

  async remove(id: number, userId: number) {
    const assessment = await this.prisma.writingAssessment.findUnique({
      where: { id },
    });

    if (!assessment) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    if (assessment.userId !== userId) {
      throw new ForbiddenException('Không có quyền xóa bài viết này');
    }

    return this.prisma.writingAssessment.delete({
      where: { id },
    });
  }

  async getMyAssessments(userId: number, query: PaginationDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [assessments, total] = await Promise.all([
      this.prisma.writingAssessment.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
      }),
      this.prisma.writingAssessment.count({
        where: { userId },
      }),
    ]);

    return {
      data: assessments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStatistics() {
    const [
      totalAssessments,
      publicAssessments,
      averageScore,
      typeDistribution,
      recentAssessments,
    ] = await Promise.all([
      this.prisma.writingAssessment.count(),
      this.prisma.writingAssessment.count({
        where: { isPublic: true },
      }),
      this.prisma.writingAssessment.aggregate({
        _avg: { wordCount: true },
      }),
      this.prisma.writingAssessment.groupBy({
        by: ['type'],
        _count: { id: true },
      }),
      this.prisma.writingAssessment.findMany({
        take: 5,
        orderBy: { submittedAt: 'desc' },
        select: {
          id: true,
          title: true,
          type: true,
          submittedAt: true,
          user: {
            select: {},
          },
        },
      }),
    ]);

    return {
      totalAssessments,
      publicAssessments,
      averageWordCount: Math.round(averageScore._avg.wordCount || 0),
      typeDistribution: typeDistribution.map((item) => ({
        type: item.type,
        count: item._count.id,
      })),
      recentAssessments,
    };
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  async gradeAssessment(id: number, aiScore: any, feedback: any) {
    return this.prisma.writingAssessment.update({
      where: { id },
      data: {
        aiScore,
        feedback,
        gradedAt: new Date(),
      },
    });
  }

  private async callAIAssessment(
    content: string,
    type: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    prompt?: string,
  ): Promise<WritingAssessmentResultDto> {
    // Mock AI assessment - replace with actual AI service call
    const wordCount = content.split(' ').length;
    const complexSentences = content.split('.').length;
    const vocabularyVariety = new Set(content.toLowerCase().split(' ')).size;

    // Simple scoring algorithm (replace with actual AI)
    const taskAchievement = this.calculateTaskScore(content, type, wordCount);
    const coherenceCohesion = this.calculateCoherenceScore(
      content,
      complexSentences,
    );
    const lexicalResource = this.calculateLexicalScore(
      vocabularyVariety,
      wordCount,
    );
    const grammaticalRange = this.calculateGrammarScore(
      content,
      complexSentences,
    );

    const overallScore =
      (taskAchievement +
        coherenceCohesion +
        lexicalResource +
        grammaticalRange) /
      4;

    return {
      overallScore: Math.round(overallScore * 10) / 10,
      taskAchievement: Math.round(taskAchievement * 10) / 10,
      coherenceCohesion: Math.round(coherenceCohesion * 10) / 10,
      lexicalResource: Math.round(lexicalResource * 10) / 10,
      grammaticalRange: Math.round(grammaticalRange * 10) / 10,
      feedback: this.generateFeedback(overallScore),
      strengths: this.identifyStrengths(overallScore),
      improvements: this.identifyImprovements(overallScore),
      suggestions: this.provideSuggestions(type),
    };
  }

  private calculateTaskScore(
    content: string,
    type: string,
    wordCount: number,
  ): number {
    let score = 5.0;

    // Word count criteria
    const minWords = type.includes('TASK1') ? 150 : 250;
    if (wordCount >= minWords) score += 1.0;
    if (wordCount >= minWords * 1.2) score += 0.5;

    // Basic structure check
    if (
      content.includes('introduction') ||
      content.toLowerCase().includes('in conclusion')
    ) {
      score += 0.5;
    }

    return Math.min(score, 9.0);
  }

  private calculateCoherenceScore(
    content: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    complexSentences: number,
  ): number {
    let score = 5.0;

    // Paragraph structure
    const paragraphs = content.split('\n\n').length;
    if (paragraphs >= 3) score += 1.0;

    // Linking words
    const linkingWords = [
      'however',
      'therefore',
      'furthermore',
      'moreover',
      'in addition',
    ];
    const hasLinking = linkingWords.some((word) =>
      content.toLowerCase().includes(word),
    );
    if (hasLinking) score += 1.0;

    return Math.min(score, 9.0);
  }

  private calculateLexicalScore(
    vocabularyVariety: number,
    wordCount: number,
  ): number {
    let score = 5.0;

    const varietyRatio = vocabularyVariety / wordCount;
    if (varietyRatio > 0.6) score += 1.5;
    else if (varietyRatio > 0.5) score += 1.0;

    return Math.min(score, 9.0);
  }

  private calculateGrammarScore(
    content: string,
    complexSentences: number,
  ): number {
    let score = 5.0;

    // Complex sentence structures
    if (complexSentences > 10) score += 1.0;

    // Variety in sentence length
    const sentences = content.split('.');
    const avgLength =
      sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    if (avgLength > 15) score += 0.5;

    return Math.min(score, 9.0);
  }

  private generateFeedback(score: number): string {
    if (score >= 8.0) {
      return 'Excellent writing with clear structure and sophisticated language use.';
    } else if (score >= 7.0) {
      return 'Good writing with mostly effective communication and good vocabulary range.';
    } else if (score >= 6.0) {
      return 'Adequate writing that communicates the main ideas but needs improvement in accuracy.';
    } else {
      return 'Basic writing that needs significant improvement in structure and language use.';
    }
  }

  private identifyStrengths(score: number): string[] {
    const strengths = [];
    if (score >= 7.0) {
      strengths.push('Clear thesis statement', 'Good paragraph structure');
    }
    if (score >= 6.0) {
      strengths.push('Adequate vocabulary use', 'Basic coherence');
    }
    strengths.push('Attempts to address the task');
    return strengths;
  }

  private identifyImprovements(score: number): string[] {
    const improvements = [];
    if (score < 7.0) {
      improvements.push('Grammar accuracy', 'Sentence variety');
    }
    if (score < 6.0) {
      improvements.push('Vocabulary range', 'Coherence and cohesion');
    }
    if (score < 5.0) {
      improvements.push('Task response', 'Basic structure');
    }
    return improvements;
  }

  private provideSuggestions(type: string): string[] {
    const suggestions = [
      'Read more academic texts to improve vocabulary',
      'Practice writing complex sentences',
      'Study grammar rules for accuracy',
    ];

    if (type.includes('TASK1')) {
      suggestions.push('Practice describing data and trends');
    } else {
      suggestions.push('Practice developing arguments with examples');
    }

    return suggestions;
  }

  async create(createDto: CreateWritingAssessmentDto, userId: number) {
    const assessment = await this.prisma.writingAssessment.create({
      data: {
        userId,
        title: createDto.title,
        content: createDto.content,
        type: createDto.type,
        prompt: createDto.prompt,
        wordCount: this.countWords(createDto.content),
        aiScore: createDto.aiScore || {},
        feedback: createDto.feedback || {},
        isPublic: createDto.isPublic || false,
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

    return assessment;
  }

  // =========================
  // Writing Tasks
  // =========================
  async createTask(dto: CreateWritingTaskDto, userId: number) {
    try {
      console.log('Creating task with data:', { dto, userId });

      // Use casting to avoid type issue before Prisma client is regenerated
      const prismaAny = this.prisma as any;
      const result = await prismaAny.writingTask.create({
        data: {
          title: dto.title,
          prompt: dto.prompt,
          type: dto.type,
          level: dto.level || IeltsLevel.BEGINNER,
          createdBy: userId,
        },
      });

      console.log('Task created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating writing task:', error);
      throw new BadRequestException(
        `Failed to create writing task: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getTasks(query: PaginationDto & { level?: string; type?: string }) {
    const { page = 1, limit = 10, level, type } = query as any;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (level) where.level = level;
    if (type) where.type = type;
    const prismaAny = this.prisma as any;
    const [items, total] = await Promise.all([
      prismaAny.writingTask.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prismaAny.writingTask.count({ where }),
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

  async submitTask(taskId: number, userId: number, dto: { content: string }) {
    // Upsert to allow edit/resubmit
    const prismaAny = this.prisma as any;
    return prismaAny.writingSubmission.upsert({
      where: { taskId_userId: { taskId: Number(taskId), userId } },
      create: { taskId: Number(taskId), userId, content: dto.content },
      update: { content: dto.content, submittedAt: new Date() },
    });
  }

  async gradeTask(taskId: number, userId: number) {
    const prismaAny = this.prisma as any;
    const submission = await prismaAny.writingSubmission.findUnique({
      where: { taskId_userId: { taskId: Number(taskId), userId } },
      include: { task: true },
    });
    if (!submission) throw new NotFoundException('Chưa có bài nộp');

    // Call Gemini 2.0 Flash (placeholder - integrate your API key via ConfigService)
    const ai = await this.callAIAssessment(
      submission.content,
      submission.task.type,
      submission.task.prompt,
    );
    return prismaAny.writingSubmission.update({
      where: { id: submission.id },
      data: {
        aiScore: {
          overallScore: ai.overallScore,
          taskAchievement: ai.taskAchievement,
          coherenceCohesion: ai.coherenceCohesion,
          lexicalResource: ai.lexicalResource,
          grammaticalRange: ai.grammaticalRange,
        },
        aiFeedback: {
          general: ai.feedback,
          strengths: ai.strengths,
          improvements: ai.improvements,
          suggestions: ai.suggestions,
        },
        gradedAt: new Date(),
      },
    });
  }
}
