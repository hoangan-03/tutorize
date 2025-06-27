import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateDocumentDto,
  UpdateDocumentDto,
  DocumentFilterDto,
} from './dto/document.dto';
import { PaginatedResultDto } from '../common/dto/pagination.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  async create(
    createDocumentDto: CreateDocumentDto,
    file: Express.Multer.File,
    userId: string,
  ) {
    const document = await this.prisma.document.create({
      data: {
        title: createDocumentDto.title,
        description: createDocumentDto.description,
        type: createDocumentDto.type,
        subject: createDocumentDto.subject,
        grade: createDocumentDto.grade,
        fileUrl: file
          ? `/uploads/documents/${file.filename}`
          : createDocumentDto.fileUrl,
        fileSize: file ? file.size : createDocumentDto.fileSize,
        uploadedBy: userId,
        tags: createDocumentDto.tags || [],
        isPublic: createDocumentDto.isPublic || false,
      },
    });

    return document;
  }

  async findAll(filters: DocumentFilterDto, userId?: string) {
    const { page = 1, limit = 10, search, subject, grade } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [{ isPublic: true }, ...(userId ? [{ uploadedBy: userId }] : [])],
    };

    if (search) {
      where.AND = [
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    if (subject) {
      where.subject = subject;
    }

    if (grade) {
      where.grade = grade;
    }

    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { uploadedAt: 'desc' },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      data: documents,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, userId?: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Không tìm thấy tài liệu');
    }

    // Check access permission
    if (!document.isPublic && document.uploadedBy !== userId) {
      throw new ForbiddenException('Không có quyền truy cập tài liệu này');
    }

    // Record access if user is provided
    if (userId) {
      await this.prisma.documentAccess.create({
        data: {
          documentId: id,
          userId,
          action: 'VIEW',
        },
      });

      // Update view count
      await this.prisma.document.update({
        where: { id },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      });
    }

    return document;
  }

  async update(
    id: number,
    updateDocumentDto: UpdateDocumentDto,
    userId: string,
  ) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Không tìm thấy tài liệu');
    }

    if (document.uploadedBy !== userId) {
      throw new ForbiddenException('Không có quyền cập nhật tài liệu này');
    }

    return this.prisma.document.update({
      where: { id },
      data: updateDocumentDto,
    });
  }

  async remove(id: number, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Không tìm thấy tài liệu');
    }

    if (document.uploadedBy !== userId) {
      throw new ForbiddenException('Không có quyền xóa tài liệu này');
    }

    // Delete file from filesystem if it exists
    try {
      const filePath = path.join(process.cwd(), 'uploads', document.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    return this.prisma.document.delete({
      where: { id },
    });
  }

  async download(id: number, userId: string, res: any) {
    const document = await this.findOne(id, userId);

    // Record download access
    await this.prisma.documentAccess.create({
      data: {
        documentId: id,
        userId,
        action: 'DOWNLOAD',
      },
    });

    // Update download count
    await this.prisma.document.update({
      where: { id },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });

    const filePath = path.join(process.cwd(), 'uploads', document.fileUrl);

    return res.download(filePath, document.title);
  }

  async approve(id: number, userId: string) {
    return this.prisma.document.update({
      where: { id },
      data: {
        isApproved: true,
        approvedBy: userId,
        approvedAt: new Date(),
      },
    });
  }

  async getAccessHistory(id: number, query: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [accesses, total] = await Promise.all([
      this.prisma.documentAccess.findMany({
        where: { documentId: id },
        skip,
        take: limit,
        orderBy: { accessedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.documentAccess.count({
        where: { documentId: id },
      }),
    ]);

    return {
      data: accesses,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private getMimeType(documentType: string): string {
    const mimeTypes = {
      PDF: 'application/pdf',
      WORD: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      POWERPOINT:
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      IMAGE: 'image/jpeg',
      VIDEO: 'video/mp4',
      AUDIO: 'audio/mpeg',
      OTHER: 'application/octet-stream',
    };

    return mimeTypes[documentType] || mimeTypes.OTHER;
  }
}
