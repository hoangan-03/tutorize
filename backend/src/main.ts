import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN')?.split(',') || [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:4173',
    ],
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Tutor Platform API')
    .setDescription(
      `
# Comprehensive Educational Platform Backend API

## 🔐 Authentication
1. First, login using \`POST /api/v1/auth/login\` to get your access token
2. Copy the \`accessToken\` from the response
3. Click the **Authorize** button above and paste the token (no need to add "Bearer " prefix)
4. Now all authenticated endpoints will automatically use your token!

## 📝 Note
Your authentication will persist in this browser session thanks to Swagger's persistent authorization feature.
    `,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your JWT token (without "Bearer " prefix)',
        in: 'header',
      },
      'bearer', // This is the key that will be used in @ApiBearerAuth()
    )
    .addTag('Authentication', 'Xác thực và phân quyền')
    .addTag('Users', 'Quản lý người dùng')
    .addTag('Quizzes', 'Hệ thống quiz')
    .addTag('Exercises', 'Hệ thống bài tập')
    .addTag('Documents', 'Thư viện tài liệu')
    .addTag('IELTS', 'Trung tâm luyện thi IELTS')
    .addTag('Writing', 'Chấm điểm bài viết AI')
    .addTag('Analytics', 'Thống kê và báo cáo')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      tryItOutEnabled: true,
      filter: true,
      showRequestHeaders: true,
    },
  });

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
