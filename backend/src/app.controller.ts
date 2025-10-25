import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@ApiTags('Health Check')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service is running',
    schema: {
      example: {
        success: true,
        message: 'Tutor Platform API is running!',
        timestamp: '2024-01-01T00:00:00.000Z',
        version: '1.0.0',
      },
    },
  })
  getHello() {
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Detailed health check' })
  @ApiResponse({
    status: 200,
    description: 'Detailed health information',
  })
  getHealth() {
    return this.appService.getHealth();
  }
}
