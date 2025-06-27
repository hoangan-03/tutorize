import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { DocumentService } from './document.service';
import {
  CreateDocumentDto,
  UpdateDocumentDto,
  DocumentFilterDto,
} from './dto/document.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Upload tài liệu mới' })
  @ApiResponse({ status: 201, description: 'Upload tài liệu thành công' })
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createDocumentDto: CreateDocumentDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    return this.documentService.create(createDocumentDto, file, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tài liệu' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['PDF', 'WORD', 'POWERPOINT', 'IMAGE', 'VIDEO', 'AUDIO', 'OTHER'],
  })
  @ApiQuery({ name: 'subject', required: false, type: String })
  @ApiQuery({ name: 'grade', required: false, type: Number })
  @ApiQuery({ name: 'uploadedBy', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(@Query() filterDto: DocumentFilterDto) {
    return this.documentService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết tài liệu' })
  @ApiResponse({ status: 200, description: 'Chi tiết tài liệu' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tài liệu' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: string,
  ) {
    return this.documentService.findOne(id, userId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Cập nhật tài liệu' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tài liệu' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.documentService.update(id, updateDocumentDto, userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Xóa tài liệu' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tài liệu' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: string,
  ) {
    return this.documentService.remove(id, userId);
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tải xuống tài liệu' })
  @ApiResponse({ status: 200, description: 'Tải xuống thành công' })
  async download(
    @Param('id', ParseIntPipe) id: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    return this.documentService.download(+id, user.id, res);
  }

  @Get(':id/access-history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Lịch sử truy cập tài liệu (Admin/Teacher only)' })
  @ApiResponse({ status: 200, description: 'Lịch sử truy cập' })
  async getAccessHistory(
    @Param('id', ParseIntPipe) id: string,
    @Query() query: PaginationDto,
  ) {
    return this.documentService.getAccessHistory(+id, query);
  }

  @Post(':id/approve')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Phê duyệt tài liệu' })
  @ApiResponse({ status: 200, description: 'Phê duyệt thành công' })
  async approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.documentService.approve(+id, user.id);
  }
}
