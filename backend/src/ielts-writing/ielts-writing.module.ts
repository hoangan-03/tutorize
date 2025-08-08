import { Module } from '@nestjs/common';
import { IeltsWritingService } from './ielts-writing.service';
import { IeltsWritingController } from './ielts-writing.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IeltsWritingController],
  providers: [IeltsWritingService],
  exports: [IeltsWritingService],
})
export class IeltsWritingModule {}
