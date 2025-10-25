import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DocumentService } from './document.service';
import { PrismaService } from '../prisma/prisma.service';
import { $Enums } from '@prisma/client';

describe('DocumentService', () => {
  let service: DocumentService;
  let prisma: PrismaService;

  const mockPrismaService = {
    document: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated document list', async () => {
      const mockDocuments = [
        { id: 1, title: 'Doc 1', uploadedBy: 1 },
        { id: 2, title: 'Doc 2', uploadedBy: 1 },
      ];

      jest
        .spyOn(prisma.document, 'findMany')
        .mockResolvedValue(mockDocuments as any);
      jest.spyOn(prisma.document, 'count').mockResolvedValue(2);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return a document by id', async () => {
      const mockDocument = {
        id: 1,
        title: 'Test Document',
        fileUrl: '/uploads/test.pdf',
        uploadedBy: 1,
      };

      jest
        .spyOn(prisma.document, 'findUnique')
        .mockResolvedValue(mockDocument as any);

      const result = await service.findOne(1, 1);

      expect(result.id).toBe(1);
      expect(result.title).toBe('Test Document');
    });

    it('should throw NotFoundException if document not found', async () => {
      jest.spyOn(prisma.document, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999, 1)).rejects.toThrow(
        'Document not found',
      );
    });

    it('should throw ForbiddenException if user lacks access', async () => {
      const mockDocument = {
        id: 1,
        title: 'Test Document',
        uploadedBy: 1,
      };

      jest
        .spyOn(prisma.document, 'findUnique')
        .mockResolvedValue(mockDocument as any);

      await expect(service.findOne(1, 2)).rejects.toThrow(ForbiddenException);
      await expect(service.findOne(1, 2)).rejects.toThrow(
        'You do not have permission to access this document',
      );
    });
  });

  describe('create', () => {
    it('should create a new document', async () => {
      const createDto = {
        title: 'New Document',
        description: 'Test description',
        type: 'PDF',
        subject: 'MATHEMATICS',
        grade: 10,
      };

      const mockFile = {
        filename: 'test.pdf',
        mimetype: 'application/pdf',
        size: 12345,
      } as Express.Multer.File;

      const mockDocument = { id: 1, title: createDto.title, uploadedBy: 1 };

      jest
        .spyOn(prisma.document, 'create')
        .mockResolvedValue(mockDocument as any);

      const result = await service.create(createDto as any, mockFile, 1);

      expect(result.title).toBe('New Document');
      expect(result.uploadedBy).toBe(1);
      expect(prisma.document.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update document successfully', async () => {
      const mockDocument = { id: 1, title: 'Old Title', uploadedBy: 1 };
      const updatedDocument = { id: 1, title: 'New Title', uploadedBy: 1 };

      jest
        .spyOn(prisma.document, 'findUnique')
        .mockResolvedValue(mockDocument as any);
      jest
        .spyOn(prisma.document, 'update')
        .mockResolvedValue(updatedDocument as any);

      const result = await service.update(1, { title: 'New Title' }, 1);

      expect(result.title).toBe('New Title');
      expect(prisma.document.update).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user lacks permission', async () => {
      const mockDocument = { id: 1, uploadedBy: 1 };
      jest
        .spyOn(prisma.document, 'findUnique')
        .mockResolvedValue(mockDocument as any);

      await expect(service.update(1, {}, 2)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.update(1, {}, 2)).rejects.toThrow(
        'You do not have permission to update this document',
      );
    });
  });

  describe('remove', () => {
    it('should remove document successfully', async () => {
      const mockDocument = {
        id: 1,
        uploadedBy: 1,
        fileUrl: 'test.pdf',
      };

      jest
        .spyOn(prisma.document, 'findUnique')
        .mockResolvedValue(mockDocument as any);
      jest
        .spyOn(prisma.document, 'delete')
        .mockResolvedValue(mockDocument as any);

      await service.remove(1, 1);

      expect(prisma.document.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw ForbiddenException if user lacks permission', async () => {
      const mockDocument = { id: 1, uploadedBy: 1 };
      jest
        .spyOn(prisma.document, 'findUnique')
        .mockResolvedValue(mockDocument as any);

      await expect(service.remove(1, 2)).rejects.toThrow(ForbiddenException);
      await expect(service.remove(1, 2)).rejects.toThrow(
        'You do not have permission to delete this document',
      );
    });
  });
});
