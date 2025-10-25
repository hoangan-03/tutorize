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
    let dbHealth;
    try {
      // Add timeout to database health check to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Database health check timeout')),
          5000,
        ),
      );

      dbHealth = await Promise.race([
        this.prisma.healthCheck(),
        timeoutPromise,
      ]);
    } catch (error) {
      dbHealth = {
        status: 'unhealthy',
        error:
          error instanceof Error
            ? error.message
            : 'Database health check failed',
        timestamp: new Date().toISOString(),
      };
    }

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
