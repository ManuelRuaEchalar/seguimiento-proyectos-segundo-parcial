import { Module } from '@nestjs/common';
import { ObservacionController } from './observacion.controller';
import { ObservacionService } from './observacion.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ObservacionController],
  providers: [ObservacionService],
})
export class ObservacionModule {}
