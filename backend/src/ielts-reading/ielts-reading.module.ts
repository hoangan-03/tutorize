import { Module } from '@nestjs/common';
import { IeltsReadingController } from './ielts-reading.controller';
import { IeltsReadingService } from './ielts-reading.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IeltsReadingController],
  providers: [IeltsReadingService],
  exports: [IeltsReadingService],
})
export class IeltsReadingModule {}
