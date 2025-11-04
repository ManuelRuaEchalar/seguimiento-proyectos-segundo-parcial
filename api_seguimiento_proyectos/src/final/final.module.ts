import { Module } from '@nestjs/common';
import { FinalController } from './final.controller';
import { FinalService } from './final.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FinalController],
  providers: [FinalService],
})
export class FinalModule {}
