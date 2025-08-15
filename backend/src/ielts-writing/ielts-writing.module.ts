import { Module } from '@nestjs/common';
import { IeltsWritingController } from './ielts-writing.controller';
import { IeltsWritingService } from './ielts-writing.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IeltsWritingController],
  providers: [IeltsWritingService],
  exports: [IeltsWritingService],
})
export class IeltsWritingModule {}
