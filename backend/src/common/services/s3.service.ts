import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly s3: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(private configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_S3_REGION');
    this.bucketName =
      this.configService.get<string>('AWS_S3_BUCKET_NAME') ||
      'tutorize-exercises';
    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_S3_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_S3_SECRET_ACCESS_KEY',
        ),
      },
    });
    this.logger.log('S3 Service initialized successfully');
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'exercises',
  ): Promise<{ key: string; url: string }> {
    const ext = file.originalname.split('.').pop();
    const key = `${folder}/${Date.now()}-${uuidv4()}.${ext}`;
    const params = {
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    await this.s3.send(new PutObjectCommand(params));
    const url = this.getPublicUrl(key);
    this.logger.log(`File uploaded successfully: ${key}`);
    return { key, url };
  }

  async deleteFile(key: string): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Key: key,
    };
    await this.s3.send(new DeleteObjectCommand(params));
    this.logger.log(`File deleted successfully: ${key}`);
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    return getSignedUrl(this.s3, command, { expiresIn });
  }

  getPublicUrl(key: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
