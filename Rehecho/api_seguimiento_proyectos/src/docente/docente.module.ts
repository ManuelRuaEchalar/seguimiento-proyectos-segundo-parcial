import { Module } from '@nestjs/common';
import { DocenteController } from './docente.controller';
import { DocenteService } from './docente.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DocenteController],
  providers: [DocenteService],
})
export class DocenteModule {}
