import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drive_v3, google } from 'googleapis';
import * as stream from 'stream';

@Injectable()
export class UploadService {
  private drive: drive_v3.Drive;
  private readonly logger = new Logger(UploadService.name);

  constructor(private configService: ConfigService) {
    this.initGoogleDriveClient();
  }

  private initGoogleDriveClient() {
    try {
      const keyFile = this.configService.get<string>(
        'GOOGLE_SERVICE_ACCOUNT_PATH',
      );

      if (!keyFile) {
        throw new Error(
          'GOOGLE_SERVICE_ACCOUNT_PATH environment variable is not set',
        );
      }

      const auth = new google.auth.GoogleAuth({
        keyFile,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      });

      this.drive = google.drive({ version: 'v3', auth });
      this.logger.log('Google Drive client initialized successfully');
    } catch (error: any) {
      this.logger.error(
        `Failed to initialize Google Drive client: ${error.message}`,
      );
      throw error;
    }
  }

  async uploadToGoogleDrive(
    file: Express.Multer.File,
    exerciseId?: number,
  ): Promise<string> {
    try {
      const bufferStream = new stream.PassThrough();
      bufferStream.end(file.buffer);

      const fileName = `${Date.now()}-exercise_${exerciseId || 'unknown'}_${file.originalname}`;

      const fileMetadata = {
        name: fileName,
        // Don't specify parents - upload to service account's root drive
      };

      const media = {
        mimeType: file.mimetype,
        body: bufferStream,
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id,webViewLink',
      });

      if (!response.data.id) {
        throw new Error('File upload failed: No file ID returned');
      }

      // Make the file publicly viewable
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      const fileData = await this.drive.files.get({
        fileId: response.data.id,
        fields: 'webContentLink',
      });

      if (!fileData.data.webContentLink) {
        throw new Error('Failed to get file download URL');
      }

      // Clean the URL by removing export parameter
      const cleanUrl = this.cleanGoogleDriveUrl(fileData.data.webContentLink);
      this.logger.log(`File uploaded successfully: ${fileName}`);
      return cleanUrl;
    } catch (error: any) {
      this.logger.error(
        `Failed to upload file to Google Drive: ${error.message}`,
      );
      throw new BadRequestException('Failed to upload file to Google Drive');
    }
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      const fileId = this.extractFileIdFromUrl(fileUrl);

      if (!fileId) {
        this.logger.error(`Failed to extract file ID from URL: ${fileUrl}`);
        return false;
      }

      await this.drive.files.delete({
        fileId,
      });

      this.logger.log(`File deleted successfully: ${fileId}`);
      return true;
    } catch (error: any) {
      this.logger.error(
        `Failed to delete file from Google Drive: ${error.message}`,
      );
      return false;
    }
  }

  private extractFileIdFromUrl(url: string): string | null {
    try {
      const match = url.match(/[-\w]{25,}/);
      return match ? match[0] : null;
    } catch {
      return null;
    }
  }

  private cleanGoogleDriveUrl(url: string): string {
    // Remove the export=download parameter
    return url.replace('&export=download', '');
  }
}
