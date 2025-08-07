import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as stream from 'stream';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private configService: ConfigService) {
    this.initCloudinary();
  }

  private initCloudinary() {
    try {
      const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
      const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
      const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

      if (!cloudName || !apiKey || !apiSecret) {
        throw new Error(
          'Cloudinary configuration is incomplete. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET',
        );
      }

      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });

      this.logger.log('Cloudinary initialized successfully');
    } catch (error: any) {
      this.logger.error(`Failed to initialize Cloudinary: ${error.message}`);
      throw error;
    }
  }

  async uploadToCloudinary(
    file: Express.Multer.File,
    exerciseId?: number,
  ): Promise<string> {
    try {
      const fileName = `exercise_${exerciseId || 'unknown'}_${Date.now()}_${file.originalname}`;

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: fileName,
            resource_type: 'auto', // Auto-detect file type
            folder: 'tutorize/uploads', // Organize files in folders
          },
          (error, result) => {
            if (error) {
              this.logger.error(
                `Failed to upload file to Cloudinary: ${error.message}`,
              );
              reject(
                new BadRequestException('Failed to upload file to Cloudinary'),
              );
            } else if (result) {
              this.logger.log(`File uploaded successfully: ${fileName}`);
              resolve(result.secure_url);
            } else {
              reject(
                new BadRequestException('Upload failed: No result returned'),
              );
            }
          },
        );

        // Create a readable stream from the buffer
        const bufferStream = new stream.PassThrough();
        bufferStream.end(file.buffer);
        bufferStream.pipe(uploadStream);
      });
    } catch (error: any) {
      this.logger.error(
        `Failed to upload file to Cloudinary: ${error.message}`,
      );
      throw new BadRequestException('Failed to upload file to Cloudinary');
    }
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      const publicId = this.extractPublicIdFromUrl(fileUrl);

      if (!publicId) {
        this.logger.error(`Failed to extract public ID from URL: ${fileUrl}`);
        return false;
      }

      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === 'ok') {
        this.logger.log(`File deleted successfully: ${publicId}`);
        return true;
      } else {
        this.logger.error(`Failed to delete file: ${result.result}`);
        return false;
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to delete file from Cloudinary: ${error.message}`,
      );
      return false;
    }
  }

  private extractPublicIdFromUrl(url: string): string | null {
    try {
      // Extract public_id from Cloudinary URL
      // Example: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.jpg
      const match = url.match(/\/v\d+\/(.+)\./);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }
}
