import { Module } from '@nestjs/common';
import { IeltsController } from './ielts.controller';
import { IeltsService } from './ielts.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IeltsController],
  providers: [IeltsService],
  exports: [IeltsService],
})
export class IeltsModule {}
