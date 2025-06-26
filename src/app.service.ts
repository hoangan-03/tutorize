import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello() {
    return {
      success: true,
      message: 'Tutor Platform API is running!',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  async getHealth() {
    const dbHealth = await this.prisma.healthCheck();

    return {
      success: true,
      message: 'Health check completed',
      timestamp: new Date().toISOString(),
      services: {
        api: {
          status: 'healthy',
          uptime: process.uptime(),
          memory: process.memoryUsage(),
        },
        database: dbHealth,
      },
    };
  }
}
