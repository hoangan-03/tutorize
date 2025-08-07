import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('exerciseId') exerciseId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const cloudinaryUrl = await this.uploadService.uploadToCloudinary(
      file,
      exerciseId ? parseInt(exerciseId) : undefined,
    );

    return {
      success: true,
      cloudinaryUrl,
      driveLink: cloudinaryUrl,
      fileName: file.originalname,
    };
  }

  @Delete('file')
  async deleteFile(@Body('fileUrl') fileUrl: string) {
    if (!fileUrl) {
      throw new BadRequestException('File URL is required');
    }

    const success = await this.uploadService.deleteFile(fileUrl);

    return {
      success,
      message: success ? 'File deleted successfully' : 'Failed to delete file',
    };
  }
}
